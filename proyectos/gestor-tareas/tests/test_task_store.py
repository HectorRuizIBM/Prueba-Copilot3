import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from task_store import Task, TaskNotFoundError, TaskStore, ValidationError


class TaskStoreTests(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temp_directory.name) / "nested" / "tasks.sqlite3"
        self.store = TaskStore(self.database_path)
        self.store.initialize()

    def tearDown(self):
        self.temp_directory.cleanup()

    def test_create_get_update_delete_and_persist_after_reconnect(self):
        created = self.store.create_task("  Preparar entrega  ", None)
        self.assertIsInstance(created, Task)
        self.assertEqual(created.title, "Preparar entrega")
        self.assertEqual(created.description, "")
        self.assertEqual(created.status, "pending")
        self.assertEqual(created.created_at, created.updated_at)

        reconnected = TaskStore(self.database_path)
        reconnected.initialize()
        self.assertEqual(reconnected.get_task(created.id), created)

        updated = reconnected.update_task(
            created.id, "Entregar", "Versión final", "in_progress"
        )
        self.assertEqual(updated.id, created.id)
        self.assertEqual(updated.title, "Entregar")
        self.assertEqual(updated.description, "Versión final")
        self.assertEqual(updated.status, "in_progress")
        self.assertEqual(updated.created_at, created.created_at)
        self.assertGreater(
            datetime.fromisoformat(updated.updated_at),
            datetime.fromisoformat(created.updated_at),
        )
        self.assertEqual(self.store.get_task(created.id), updated)

        reconnected.delete_task(created.id)
        self.assertEqual(reconnected.list_tasks(), [])
        with self.assertRaises(TaskNotFoundError):
            reconnected.get_task(created.id)

    def test_filter_and_order_by_updated_at_then_id_descending(self):
        first = self.store.create_task("Primera")
        second = self.store.create_task("Segunda", status="completed")
        third = self.store.create_task("Tercera")
        self.store.update_task(first.id, first.title, "", "pending")

        tasks = self.store.list_tasks()
        self.assertEqual([task.id for task in tasks], [first.id, third.id, second.id])
        self.assertEqual(
            [task.id for task in self.store.list_tasks("pending")],
            [first.id, third.id],
        )
        self.assertEqual(
            [task.id for task in self.store.list_tasks("completed")], [second.id]
        )

    def test_timestamps_are_iso_8601_utc(self):
        task = self.store.create_task("Fecha")
        for value in (task.created_at, task.updated_at):
            parsed = datetime.fromisoformat(value)
            self.assertIsNotNone(parsed.tzinfo)
            self.assertEqual(parsed.utcoffset(), timezone.utc.utcoffset(parsed))

    def test_invalid_create_and_filter_inputs(self):
        invalid_tasks = [
            ("", "", "pending"),
            ("   ", "", "pending"),
            ("x" * 201, "", "pending"),
            (None, "", "pending"),
            ("Título", "x" * 2001, "pending"),
            ("Título", 5, "pending"),
            ("Título", "", "Pending"),
            ("Título", "", "unknown"),
            ("Título", "", None),
        ]
        for title, description, status in invalid_tasks:
            with self.subTest(title=repr(title), status=repr(status)):
                with self.assertRaises(ValidationError):
                    self.store.create_task(title, description, status)
        with self.assertRaises(ValidationError):
            self.store.list_tasks("invalid")
        self.assertEqual(self.store.list_tasks(), [])

    def test_invalid_ids_and_missing_records(self):
        for invalid_id in (0, -1, True, 1.2, "1", None):
            with self.subTest(task_id=repr(invalid_id)):
                with self.assertRaises(ValidationError):
                    self.store.get_task(invalid_id)
                with self.assertRaises(ValidationError):
                    self.store.delete_task(invalid_id)

        with self.assertRaises(TaskNotFoundError):
            self.store.get_task(999)
        with self.assertRaises(TaskNotFoundError):
            self.store.update_task(999, "Válida", "", "pending")
        with self.assertRaises(TaskNotFoundError):
            self.store.delete_task(999)

    def test_invalid_updates_leave_updated_at_unchanged(self):
        task = self.store.create_task("Sin cambios")
        invalid_updates = [
            ("", "", "pending"),
            ("x" * 201, "", "pending"),
            ("Válida", "x" * 2001, "pending"),
            ("Válida", "", "invalid"),
        ]
        for title, description, status in invalid_updates:
            with self.subTest(title=repr(title), status=repr(status)):
                with self.assertRaises(ValidationError):
                    self.store.update_task(task.id, title, description, status)
                self.assertEqual(self.store.get_task(task.id), task)

    def test_database_failure_rolls_back_update(self):
        task = self.store.create_task("Antes")
        import sqlite3

        connection = sqlite3.connect(self.database_path)
        try:
            with connection:
                connection.execute(
                    """
                    CREATE TRIGGER reject_task_update
                    BEFORE UPDATE ON tasks
                    BEGIN
                        SELECT RAISE(ABORT, 'forced test failure');
                    END
                    """
                )
        finally:
            connection.close()

        with self.assertRaises(sqlite3.IntegrityError):
            self.store.update_task(task.id, "Después", "", "completed")
        self.assertEqual(self.store.get_task(task.id), task)


if __name__ == "__main__":
    unittest.main()

"""SQLite persistence and validation for the local task manager."""

from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
import sqlite3


VALID_STATUSES = frozenset({"pending", "in_progress", "completed"})
_SCHEMA_VERSION = 1


class ValidationError(ValueError):
    """Raised when a task field or identifier is invalid."""


class TaskNotFoundError(LookupError):
    """Raised when a task identifier does not exist."""


@dataclass
class Task:
    id: int
    title: str
    description: str
    status: str
    created_at: str
    updated_at: str


class TaskStore:
    """Persist tasks in a SQLite database at ``database_path``."""

    def __init__(self, database_path):
        self._database_path = os.fspath(database_path)

    @contextmanager
    def _connection(self, write=False):
        connection = sqlite3.connect(self._database_path, timeout=5)
        connection.row_factory = sqlite3.Row
        try:
            if write:
                connection.execute("BEGIN IMMEDIATE")
            yield connection
            if write:
                connection.commit()
        except Exception:
            if write:
                connection.rollback()
            raise
        finally:
            connection.close()

    def initialize(self):
        """Create the database directory and schema if they do not exist."""
        if self._database_path != ":memory:" and not self._database_path.startswith(
            "file:"
        ):
            Path(self._database_path).parent.mkdir(parents=True, exist_ok=True)

        with self._connection(write=True) as connection:
            version = connection.execute("PRAGMA user_version").fetchone()[0]
            if version > _SCHEMA_VERSION:
                raise RuntimeError(
                    "La base de datos usa una versión de esquema más reciente."
                )

            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT CHECK (id > 0),
                    title TEXT NOT NULL
                        CHECK (length(title) BETWEEN 1 AND 200)
                        CHECK (title = trim(title)),
                    description TEXT NOT NULL
                        CHECK (length(description) <= 2000),
                    status TEXT NOT NULL
                        CHECK (status IN ('pending', 'in_progress', 'completed')),
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            if version < _SCHEMA_VERSION:
                connection.execute("PRAGMA user_version = 1")

    @staticmethod
    def _validate_title(title):
        if not isinstance(title, str):
            raise ValidationError("El título debe ser texto.")
        title = title.strip()
        if not title:
            raise ValidationError("El título no puede estar vacío.")
        if len(title) > 200:
            raise ValidationError("El título no puede superar 200 caracteres.")
        return title

    @staticmethod
    def _validate_description(description):
        if description is None:
            return ""
        if not isinstance(description, str):
            raise ValidationError("La descripción debe ser texto o None.")
        if len(description) > 2000:
            raise ValidationError("La descripción no puede superar 2000 caracteres.")
        return description

    @staticmethod
    def _validate_status(status):
        if not isinstance(status, str) or status not in VALID_STATUSES:
            raise ValidationError("El estado no es válido.")
        return status

    @staticmethod
    def _validate_task_id(task_id):
        if type(task_id) is not int or task_id <= 0:
            raise ValidationError("El ID debe ser un entero positivo.")
        return task_id

    @staticmethod
    def _now():
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _task_from_row(row):
        return Task(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            status=row["status"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def create_task(self, title, description="", status="pending"):
        title = self._validate_title(title)
        description = self._validate_description(description)
        status = self._validate_status(status)
        created_at = self._now()

        with self._connection(write=True) as connection:
            cursor = connection.execute(
                """
                INSERT INTO tasks
                    (title, description, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (title, description, status, created_at, created_at),
            )
            row = connection.execute(
                "SELECT * FROM tasks WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
            return self._task_from_row(row)

    def list_tasks(self, status=None):
        if status is not None:
            status = self._validate_status(status)
        with self._connection() as connection:
            if status is None:
                rows = connection.execute(
                    "SELECT * FROM tasks ORDER BY updated_at DESC, id DESC"
                ).fetchall()
            else:
                rows = connection.execute(
                    """
                    SELECT * FROM tasks
                    WHERE status = ?
                    ORDER BY updated_at DESC, id DESC
                    """,
                    (status,),
                ).fetchall()
            return [self._task_from_row(row) for row in rows]

    def get_task(self, task_id):
        task_id = self._validate_task_id(task_id)
        with self._connection() as connection:
            row = connection.execute(
                "SELECT * FROM tasks WHERE id = ?", (task_id,)
            ).fetchone()
        if row is None:
            raise TaskNotFoundError("No existe una tarea con ese ID.")
        return self._task_from_row(row)

    def update_task(self, task_id, title, description, status):
        task_id = self._validate_task_id(task_id)
        title = self._validate_title(title)
        description = self._validate_description(description)
        status = self._validate_status(status)

        with self._connection(write=True) as connection:
            row = connection.execute(
                "SELECT created_at, updated_at FROM tasks WHERE id = ?",
                (task_id,),
            ).fetchone()
            if row is None:
                raise TaskNotFoundError("No existe una tarea con ese ID.")

            updated_at = self._now()
            previous_updated_at = datetime.fromisoformat(row["updated_at"])
            candidate = datetime.fromisoformat(updated_at)
            if candidate <= previous_updated_at:
                updated_at = (previous_updated_at + timedelta(microseconds=1)).isoformat()

            connection.execute(
                """
                UPDATE tasks
                SET title = ?, description = ?, status = ?, updated_at = ?
                WHERE id = ?
                """,
                (title, description, status, updated_at, task_id),
            )
            updated_row = connection.execute(
                "SELECT * FROM tasks WHERE id = ?", (task_id,)
            ).fetchone()
            return self._task_from_row(updated_row)

    def delete_task(self, task_id):
        task_id = self._validate_task_id(task_id)
        with self._connection(write=True) as connection:
            cursor = connection.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            if cursor.rowcount == 0:
                raise TaskNotFoundError("No existe una tarea con ese ID.")

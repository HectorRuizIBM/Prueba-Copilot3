import os
from pathlib import Path
import tempfile
import unittest

from streamlit.config import set_option
from streamlit.testing.v1 import AppTest

from task_store import TaskStore


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_PATH = PROJECT_ROOT / "app.py"


class TaskManagerAppTests(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temp_directory.name) / "tasks.sqlite3"
        self.previous_database_path = os.environ.get("TASKS_DB_PATH")
        os.environ["TASKS_DB_PATH"] = str(self.database_path)
        set_option("server.address", "127.0.0.1")

    def tearDown(self):
        if self.previous_database_path is None:
            os.environ.pop("TASKS_DB_PATH", None)
        else:
            os.environ["TASKS_DB_PATH"] = self.previous_database_path
        self.temp_directory.cleanup()

    def run_app(self):
        app = AppTest.from_file(str(APP_PATH), default_timeout=10).run()
        self.assertEqual(app.exception, [])
        return app

    @staticmethod
    def click_button(app, label):
        matches = [button for button in app.button if button.label == label]
        if len(matches) != 1:
            raise AssertionError(
                f"Se esperaba un botón {label!r}; encontrados: {len(matches)}"
            )
        matches[0].click()
        app.run()

    def test_empty_state_and_create_title_validation(self):
        app = self.run_app()
        self.assertTrue(
            any("Todavía no hay tareas" in item.value for item in app.info)
        )
        self.assertEqual(app.metric[0].value, "0")

        self.click_button(app, "Crear tarea")
        self.assertTrue(
            any("Escribe un título" in item.value for item in app.error)
        )
        self.assertEqual(TaskStore(self.database_path).list_tasks(), [])

        app.text_input[0].set_value("  Preparar entrega  ")
        app.text_area[0].set_value("Descripción de prueba")
        self.click_button(app, "Crear tarea")

        tasks = TaskStore(self.database_path).list_tasks()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0].title, "Preparar entrega")
        self.assertEqual(tasks[0].description, "Descripción de prueba")
        self.assertTrue(
            any("se creó correctamente" in item.value for item in app.success)
        )

    def test_filter_edit_delete_and_temporary_database_reconnection(self):
        app = self.run_app()
        app.text_input[0].set_value("Revisar informe")
        self.click_button(app, "Crear tarea")
        task = TaskStore(self.database_path).list_tasks()[0]

        app.selectbox[0].set_value("completed")
        app.run()
        self.assertTrue(
            any("No hay tareas con este estado" in item.value for item in app.info)
        )
        app.selectbox[0].set_value("pending")
        app.run()
        self.assertTrue(any(item.value == task.title for item in app.text))

        app.text_input(key=f"edit_title_{task.id}").set_value("  ")
        self.click_button(app, "Guardar cambios")
        self.assertTrue(
            any("El título no puede estar vacío" in item.value for item in app.error)
        )
        self.assertEqual(TaskStore(self.database_path).get_task(task.id).title, task.title)

        app.text_input(key=f"edit_title_{task.id}").set_value("Informe revisado")
        app.text_area(key=f"edit_description_{task.id}").set_value("Actualizada")
        app.selectbox(key=f"edit_status_{task.id}").set_value("completed")
        self.click_button(app, "Guardar cambios")

        reconnected_task = TaskStore(self.database_path).get_task(task.id)
        self.assertEqual(reconnected_task.title, "Informe revisado")
        self.assertEqual(reconnected_task.description, "Actualizada")
        self.assertEqual(reconnected_task.status, "completed")

        app.selectbox[0].set_value("all")
        app.run()
        self.click_button(app, "Eliminar tarea")
        self.assertTrue(
            any("Confirma el borrado" in item.value for item in app.warning)
        )
        app.checkbox(key=f"confirm_delete_{task.id}").set_value(True)
        app.run()
        self.click_button(app, "Eliminar tarea")

        self.assertEqual(TaskStore(self.database_path).list_tasks(), [])
        self.assertTrue(
            any("Todavía no hay tareas" in item.value for item in app.info)
        )


if __name__ == "__main__":
    unittest.main()

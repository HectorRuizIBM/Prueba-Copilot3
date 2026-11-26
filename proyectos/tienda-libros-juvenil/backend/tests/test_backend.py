"""Pruebas aisladas de SQLite y del contrato HTTP."""

import os
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import create_app
from app.models import BookInput
from app.repository import BookNotFoundError, BookRepository


def sample_book(**overrides: object) -> dict[str, object]:
    book: dict[str, object] = {
        "title": "La órbita secreta",
        "author": "Iria Sol",
        "genre": "Aventura",
        "recommended_age_min": 12,
        "recommended_age_max": 16,
        "description": "Un mensaje aparece en una estación abandonada.",
        "cover_color": "#123ABC",
    }
    book.update(overrides)
    return book


class RepositoryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp.name) / "isolated.sqlite3"
        self.repository = BookRepository(self.db_path)
        self.repository.initialize()

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_seed_only_for_empty_database_and_repeatable_initialization(self) -> None:
        self.assertEqual(len(self.repository.list_books()), 3)
        self.repository.initialize()
        self.assertEqual(len(self.repository.list_books()), 3)
        self.repository.create_book(sample_book(title="Registro persistente"))
        self.repository.initialize()
        titles = [book.title for book in self.repository.list_books()]
        self.assertIn("Registro persistente", titles)
        self.assertEqual(len(titles), 4)

    def test_create_read_update_delete_and_reconnect_persistence(self) -> None:
        created = self.repository.create_book(sample_book())
        self.assertEqual(self.repository.get_book(created.id), created)

        updated = self.repository.update_book(
            created.id, sample_book(title="Título cambiado", genre="Misterio")
        )
        self.assertEqual(updated.title, "Título cambiado")
        self.assertEqual(updated.genre, "Misterio")

        reconnected = BookRepository(self.db_path)
        self.assertEqual(reconnected.get_book(created.id), updated)
        self.assertTrue(reconnected.delete_book(created.id))
        self.assertIsNone(self.repository.get_book(created.id))
        self.assertFalse(self.repository.delete_book(created.id))

    def test_filtering_search_genre_age_and_combination(self) -> None:
        self.repository.create_book(sample_book())
        self.repository.create_book(
            sample_book(
                title="Crónicas del faro",
                author="Mara Luz",
                genre="Misterio",
                recommended_age_min=15,
                recommended_age_max=18,
            )
        )
        self.assertEqual(
            [b.title for b in self.repository.list_books(q="IRIA")],
            ["La órbita secreta"],
        )
        self.assertEqual(
            [
                b.title
                for b in self.repository.list_books(
                    q="órbita", genre="Aventura", age=12
                )
            ],
            ["La órbita secreta"],
        )
        self.assertEqual(
            self.repository.list_books(genre="aventura"),
            [],
            "El género es una comparación exacta y sensible a mayúsculas.",
        )
        self.assertEqual(
            self.repository.list_books(q="%", genre="Aventura"),
            [],
            "Los comodines de LIKE introducidos por el usuario se escapan.",
        )
        self.assertTrue(
            all(
                book.recommended_age_min <= 15 <= book.recommended_age_max
                for book in self.repository.list_books(age=15)
            )
        )

    def test_validation_missing_record_and_transaction_rollback(self) -> None:
        with self.assertRaises(ValidationError):
            BookInput.model_validate(sample_book(recommended_age_min=19))
        with self.assertRaises(ValidationError):
            BookInput.model_validate(sample_book(cover_color="red"))
        with self.assertRaises(BookNotFoundError):
            self.repository.update_book(99999, sample_book())

        before = len(self.repository.list_books())
        connection = sqlite3.connect(self.db_path)
        try:
            connection.execute(
                """
                CREATE TRIGGER reject_test_insert BEFORE INSERT ON books
                WHEN NEW.title = 'Provocar rollback'
                BEGIN SELECT RAISE(ABORT, 'test rollback'); END
                """
            )
            connection.commit()
        finally:
            connection.close()
        with self.assertRaises(sqlite3.IntegrityError):
            self.repository.create_book(sample_book(title="Provocar rollback"))
        self.assertEqual(len(self.repository.list_books()), before)


class ApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        app = create_app(Path(self.temp.name) / "api.sqlite3")
        self.client_context = TestClient(app)
        self.client = self.client_context.__enter__()

    def tearDown(self) -> None:
        self.client_context.__exit__(None, None, None)
        self.temp.cleanup()

    def test_list_detail_and_filters(self) -> None:
        response = self.client.get("/api/books")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        self.assertEqual(len(response.json()), 3)
        self.assertEqual(
            set(response.json()[0]),
            {
                "id",
                "title",
                "author",
                "genre",
                "recommended_age_min",
                "recommended_age_max",
                "description",
                "cover_color",
            },
        )
        detail = self.client.get(f"/api/books/{response.json()[0]['id']}")
        self.assertEqual(detail.status_code, 200)
        self.assertIsInstance(detail.json(), dict)
        self.assertEqual(detail.json()["id"], response.json()[0]["id"])
        self.assertEqual(
            self.client.get("/api/books?q=brújula").json()[0]["title"],
            "La brújula de papel",
        )
        self.assertEqual(
            self.client.get("/api/books?genre=Misterio&age=12").json()[0]["genre"],
            "Misterio",
        )
        self.assertEqual(self.client.get("/api/books?genre=misterio").json(), [])

    def test_invalid_queries_and_missing_detail_return_controlled_errors(self) -> None:
        for invalid_age in ("0", "-2", "abc", "12.5"):
            with self.subTest(age=invalid_age):
                self.assertEqual(
                    self.client.get(f"/api/books?age={invalid_age}").status_code,
                    422,
                )
        self.assertEqual(self.client.get("/api/books?age=121").json(), [])
        self.assertEqual(
            self.client.get("/api/books?age=999999999999999999999999999").json(),
            [],
        )
        self.assertEqual(
            self.client.get("/api/books?q=" + "x" * 101).status_code, 422
        )
        self.assertEqual(self.client.get("/api/books/999999").status_code, 404)
        self.assertEqual(self.client.get("/api/books/0").status_code, 422)

    def test_database_path_environment_override(self) -> None:
        configured = Path(self.temp.name) / "from-env.sqlite3"
        with patch.dict(os.environ, {"BOOKS_DB_PATH": str(configured)}):
            app = create_app()
        with TestClient(app) as client:
            self.assertEqual(client.get("/api/books").status_code, 200)
        self.assertTrue(configured.is_file())


if __name__ == "__main__":
    unittest.main()

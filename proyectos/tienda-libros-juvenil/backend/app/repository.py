"""Persistencia SQLite del catálogo."""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from app.models import BookInput, BookRead

SCHEMA_VERSION = 1

# Obras, autores y descripciones ficticios, escritos para esta demostración.
DEMO_BOOKS = (
    BookInput(
        title="La brújula de papel",
        author="Vera Niebla",
        genre="Aventura",
        recommended_age_min=12,
        recommended_age_max=16,
        description="Una cartógrafa novata descubre que su mapa cambia cada vez que toma una decisión.",
        cover_color="#E77B55",
    ),
    BookInput(
        title="Frecuencia de estrellas",
        author="Leo Marín",
        genre="Ciencia ficción",
        recommended_age_min=13,
        recommended_age_max=18,
        description="Dos amigos captan una señal imposible y siguen su rastro desde una radio escolar.",
        cover_color="#6656A6",
    ),
    BookInput(
        title="El club del último recreo",
        author="Nora Salvat",
        genre="Misterio",
        recommended_age_min=11,
        recommended_age_max=15,
        description="Un grupo de estudiantes resuelve pequeños enigmas que nadie más parece notar.",
        cover_color="#3A9C88",
    ),
)


class BookNotFoundError(LookupError):
    """El identificador solicitado no existe."""


class BookRepository:
    """Acceso al catálogo; cada operación usa conexión y transacción propias."""

    def __init__(self, path: str | Path):
        self.path = Path(path).expanduser().resolve()

    @contextmanager
    def _transaction(self, *, write: bool = False) -> Iterator[sqlite3.Connection]:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(
            self.path,
            timeout=5.0,
            isolation_level=None,
        )
        connection.row_factory = sqlite3.Row
        try:
            connection.execute("PRAGMA foreign_keys = ON")
            connection.execute("PRAGMA busy_timeout = 5000")
            connection.execute("BEGIN IMMEDIATE" if write else "BEGIN")
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def initialize(self) -> None:
        """Crea el esquema idempotentemente y siembra solo una tabla vacía."""
        with self._transaction(write=True) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version INTEGER PRIMARY KEY,
                    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            applied = {
                row["version"]
                for row in connection.execute(
                    "SELECT version FROM schema_migrations"
                )
            }
            if SCHEMA_VERSION not in applied:
                connection.execute(
                    """
                    CREATE TABLE IF NOT EXISTS books (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 200),
                        author TEXT NOT NULL CHECK(length(trim(author)) BETWEEN 1 AND 160),
                        genre TEXT NOT NULL CHECK(length(trim(genre)) BETWEEN 1 AND 80),
                        recommended_age_min INTEGER NOT NULL
                            CHECK(recommended_age_min BETWEEN 1 AND 120),
                        recommended_age_max INTEGER NOT NULL
                            CHECK(recommended_age_max BETWEEN recommended_age_min AND 120),
                        description TEXT NOT NULL
                            CHECK(length(trim(description)) BETWEEN 1 AND 2000),
                        cover_color TEXT NOT NULL
                            CHECK(cover_color GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]')
                    )
                    """
                )
                connection.execute(
                    "INSERT INTO schema_migrations(version) VALUES (?)",
                    (SCHEMA_VERSION,),
                )

            count = connection.execute("SELECT COUNT(*) FROM books").fetchone()[0]
            if count == 0:
                connection.executemany(
                    """
                    INSERT INTO books (
                        title, author, genre, recommended_age_min,
                        recommended_age_max, description, cover_color
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    [self._values(book) for book in DEMO_BOOKS],
                )

    @staticmethod
    def _values(book: BookInput) -> tuple[object, ...]:
        return (
            book.title,
            book.author,
            book.genre,
            book.recommended_age_min,
            book.recommended_age_max,
            book.description,
            book.cover_color,
        )

    @staticmethod
    def _read(row: sqlite3.Row) -> BookRead:
        return BookRead.model_validate(dict(row))

    def list_books(
        self,
        *,
        q: str | None = None,
        genre: str | None = None,
        age: int | None = None,
    ) -> list[BookRead]:
        # SQLite INTEGER usa int64; edades positivas mayores que eso son válidas,
        # pero no pueden coincidir con ninguna edad recomendada almacenada.
        if age is not None and age > 9_223_372_036_854_775_807:
            return []
        clauses: list[str] = []
        parameters: list[object] = []
        if q:
            escaped = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            clauses.append(
                "(title LIKE ? ESCAPE '\\' COLLATE NOCASE "
                "OR author LIKE ? ESCAPE '\\' COLLATE NOCASE)"
            )
            parameters.extend((f"%{escaped}%", f"%{escaped}%"))
        if genre is not None:
            clauses.append("genre = ?")
            parameters.append(genre)
        if age is not None:
            clauses.append("recommended_age_min <= ? AND recommended_age_max >= ?")
            parameters.extend((age, age))
        where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
        with self._transaction() as connection:
            rows = connection.execute(
                "SELECT id, title, author, genre, recommended_age_min, "
                "recommended_age_max, description, cover_color FROM books"
                + where
                + " ORDER BY id",
                parameters,
            ).fetchall()
        return [self._read(row) for row in rows]

    def get_book(self, book_id: int) -> BookRead | None:
        with self._transaction() as connection:
            row = connection.execute(
                "SELECT id, title, author, genre, recommended_age_min, "
                "recommended_age_max, description, cover_color FROM books WHERE id = ?",
                (book_id,),
            ).fetchone()
        return self._read(row) if row is not None else None

    def create_book(self, data: BookInput | dict[str, object]) -> BookRead:
        book = data if isinstance(data, BookInput) else BookInput.model_validate(data)
        with self._transaction(write=True) as connection:
            cursor = connection.execute(
                """
                INSERT INTO books (
                    title, author, genre, recommended_age_min,
                    recommended_age_max, description, cover_color
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                self._values(book),
            )
            row = connection.execute(
                "SELECT id, title, author, genre, recommended_age_min, "
                "recommended_age_max, description, cover_color FROM books WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()
        return self._read(row)

    def update_book(
        self, book_id: int, data: BookInput | dict[str, object]
    ) -> BookRead:
        book = data if isinstance(data, BookInput) else BookInput.model_validate(data)
        with self._transaction(write=True) as connection:
            cursor = connection.execute(
                """
                UPDATE books SET title = ?, author = ?, genre = ?,
                    recommended_age_min = ?, recommended_age_max = ?,
                    description = ?, cover_color = ? WHERE id = ?
                """,
                (*self._values(book), book_id),
            )
            if cursor.rowcount == 0:
                raise BookNotFoundError(book_id)
            row = connection.execute(
                "SELECT id, title, author, genre, recommended_age_min, "
                "recommended_age_max, description, cover_color FROM books WHERE id = ?",
                (book_id,),
            ).fetchone()
        return self._read(row)

    def delete_book(self, book_id: int) -> bool:
        with self._transaction(write=True) as connection:
            cursor = connection.execute("DELETE FROM books WHERE id = ?", (book_id,))
        return cursor.rowcount > 0

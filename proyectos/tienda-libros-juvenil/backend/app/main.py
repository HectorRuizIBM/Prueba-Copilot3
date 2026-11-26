"""API local de lectura del catálogo juvenil."""

from contextlib import asynccontextmanager
import os
from pathlib import Path
import sqlite3
from typing import Annotated

from fastapi import FastAPI, HTTPException, Path as PathParameter, Query, Request
from fastapi.responses import JSONResponse

from app.models import BookRead
from app.repository import BookRepository

DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "data" / "books.sqlite3"


def create_app(db_path: str | Path | None = None) -> FastAPI:
    """Construye la aplicación; db_path permite aislar pruebas."""
    configured_path = db_path or os.environ.get("BOOKS_DB_PATH") or DEFAULT_DB_PATH
    repository = BookRepository(configured_path)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        repository.initialize()
        yield

    app = FastAPI(
        title="Tienda juvenil de libros",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.state.book_repository = repository

    @app.exception_handler(sqlite3.Error)
    async def sqlite_error_handler(_: Request, exc: sqlite3.Error) -> JSONResponse:
        # Mensaje estable, sin revelar rutas ni detalles internos de SQLite.
        return JSONResponse(
            status_code=503,
            content={"detail": "La persistencia del catálogo no está disponible."},
        )

    @app.get("/api/books", response_model=list[BookRead])
    def list_books(
        q: Annotated[str | None, Query(max_length=100)] = None,
        genre: Annotated[str | None, Query(max_length=80)] = None,
        age: Annotated[int | None, Query(gt=0)] = None,
    ) -> list[BookRead]:
        return repository.list_books(q=q, genre=genre, age=age)

    @app.get("/api/books/{book_id}", response_model=BookRead)
    def get_book(book_id: Annotated[int, PathParameter(gt=0)]) -> BookRead:
        book = repository.get_book(book_id)
        if book is None:
            raise HTTPException(status_code=404, detail="Libro no encontrado.")
        return book

    return app


app = create_app()

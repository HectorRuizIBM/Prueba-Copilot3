"""Esquemas de entrada y salida del catálogo."""

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class BookInput(BaseModel):
    """Campos editables de un libro, validados también para operaciones internas."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=160)
    genre: str = Field(min_length=1, max_length=80)
    recommended_age_min: int = Field(ge=1, le=120)
    recommended_age_max: int = Field(ge=1, le=120)
    description: str = Field(min_length=1, max_length=2000)
    cover_color: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$")

    @field_validator("title", "author", "genre", "description")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        if not value:
            raise ValueError("El texto no puede estar vacío.")
        return value

    @model_validator(mode="after")
    def age_range_is_valid(self) -> "BookInput":
        if self.recommended_age_min > self.recommended_age_max:
            raise ValueError("La edad mínima no puede superar la máxima.")
        return self


class BookRead(BookInput):
    """Representación pública del libro."""

    id: int = Field(ge=1)

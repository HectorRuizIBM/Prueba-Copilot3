import { useEffect, useMemo, useRef, useState } from "react";

type Book = {
  id: number | string;
  title: string;
  author: string;
  genre: string;
  recommended_age_min: number;
  recommended_age_max: number;
  description: string;
  cover_color: string;
};

type ListState =
  | { status: "loading" }
  | { status: "success"; books: Book[] }
  | { status: "error"; message: string };

type DetailState =
  | { status: "loading" }
  | { status: "success"; book: Book }
  | { status: "error"; message: string };

function isBook(value: unknown): value is Book {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    ((typeof record.id === "string" && record.id.length > 0) || Number.isInteger(record.id)) &&
    typeof record.title === "string" &&
    typeof record.author === "string" &&
    typeof record.genre === "string" &&
    Number.isInteger(record.recommended_age_min) &&
    Number.isInteger(record.recommended_age_max) &&
    typeof record.description === "string" &&
    typeof record.cover_color === "string"
  );
}

async function readBookList(
  query: string,
  genre: string,
  age: string,
  signal: AbortSignal,
): Promise<Book[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (genre) params.set("genre", genre);
  if (age) params.set("age", age);
  const queryString = params.toString();
  const path = queryString ? `/api/books?${queryString}` : "/api/books";
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error(`No se pudo cargar el catálogo (${response.status}).`);

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isBook)) {
    throw new Error("La respuesta del catálogo no tiene el formato esperado.");
  }
  return payload;
}

function coverTone(id: number | string) {
  const hash = String(id).split("").reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0);
  return hash % 5;
}

async function readBook(id: number | string, signal: AbortSignal): Promise<Book> {
  const response = await fetch(`/api/books/${encodeURIComponent(String(id))}`, { signal });
  if (!response.ok) {
    if (response.status === 404) throw new Error("No encontramos esa ficha. Puede que ya no esté disponible.");
    throw new Error(`No se pudo cargar la ficha (${response.status}).`);
  }

  const payload: unknown = await response.json();
  if (!isBook(payload)) throw new Error("La ficha recibida no tiene el formato esperado.");
  return payload;
}

function describeError(message: string) {
  return (
    <>
      <p className="state-title">No se pudo cargar el catálogo.</p>
      <p className="state-copy">{message} Comprueba que el servicio esté disponible e inténtalo de nuevo.</p>
    </>
  );
}

function BookDialog({
  bookId,
  onClose,
}: {
  bookId: number | string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [detailState, setDetailState] = useState<DetailState>({ status: "loading" });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setDetailState({ status: "loading" });
    readBook(bookId, controller.signal)
      .then((book) => setDetailState({ status: "success", book }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Ha ocurrido un error inesperado.";
        setDetailState({ status: "error", message });
      });
    return () => controller.abort();
  }, [bookId, retry]);

  return (
    <dialog
      className="book-dialog"
      ref={dialogRef}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="dialog-top">
        <p className="eyebrow">Una historia para descubrir</p>
        <button className="icon-button" type="button" onClick={onClose} ref={closeRef} aria-label="Cerrar ficha">
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {detailState.status === "loading" && (
        <div className="dialog-state" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <p id="dialog-title" className="state-title">Cargando ficha…</p>
        </div>
      )}

      {detailState.status === "error" && (
        <div className="dialog-state" role="alert">
          <span className="state-symbol" aria-hidden="true">!</span>
          <h2 id="dialog-title" className="state-title">No se pudo abrir la ficha</h2>
          <p className="state-copy">{detailState.message}</p>
          <button className="button button-dark" type="button" onClick={() => setRetry((value) => value + 1)}>
            Volver a intentarlo
          </button>
        </div>
      )}

      {detailState.status === "success" && (
        <article className="detail-content">
          <div className={`detail-cover cover-tone-${coverTone(detailState.book.id)}`} aria-hidden="true">
            <span className="cover-kicker">{detailState.book.genre}</span>
            <span className="cover-title">{detailState.book.title}</span>
            <span className="cover-author">{detailState.book.author}</span>
            <span className="cover-orbit" />
          </div>
          <div className="detail-copy">
            <p className="eyebrow">Ficha del libro</p>
            <h2 id="dialog-title">{detailState.book.title}</h2>
            <p className="detail-author">Por {detailState.book.author}</p>
            <div className="book-tags">
              <span className="tag">{detailState.book.genre}</span>
              <span className="tag">Desde {detailState.book.recommended_age_min} años</span>
            </div>
            <p className="detail-description">{detailState.book.description}</p>
            <p className="age-note">
              Edad recomendada: {detailState.book.recommended_age_min}–{detailState.book.recommended_age_max} años
            </p>
          </div>
        </article>
      )}
    </dialog>
  );
}

function App() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [listState, setListState] = useState<ListState>({ status: "loading" });
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | string | null>(null);
  const [retry, setRetry] = useState(0);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const ageIsValid =
    ageInput.trim() === "" ||
    (Number.isInteger(Number(ageInput)) && Number(ageInput) > 0);
  const age = ageInput.trim() === "" ? "" : ageIsValid ? String(Number(ageInput)) : null;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (age === null) return;
    const controller = new AbortController();
    setListState({ status: "loading" });
    readBookList(debouncedQuery, genre, age, controller.signal)
      .then((books) => {
        setListState({ status: "success", books });
        setGenres((current) => [...new Set([...current, ...books.map((book) => book.genre)])].sort((a, b) => a.localeCompare(b, "es")));
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Ha ocurrido un error inesperado.";
        setListState({ status: "error", message });
      });
    return () => controller.abort();
  }, [debouncedQuery, genre, age, retry]);

  useEffect(() => {
    if (selectedBookId === null) openerRef.current?.focus();
  }, [selectedBookId]);

  const resultCount = useMemo(() => {
    if (listState.status !== "success") return "";
    return `${listState.books.length} ${listState.books.length === 1 ? "historia" : "historias"}`;
  }, [listState]);

  function resetFilters() {
    setQuery("");
    setGenre("");
    setAgeInput("");
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#catalogo" aria-label="Entre Líneas, catálogo">
          <span className="brand-mark" aria-hidden="true">e.</span>
          <span>entre líneas</span>
        </a>
        <a className="header-note" href="#catalogo">
          Tu próxima lectura <span aria-hidden="true">↘</span>
        </a>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Un catálogo para mentes inquietas</p>
            <h1 id="hero-title">Hay historias que <em>te encuentran.</em></h1>
            <p className="hero-intro">
              Explora mundos nuevos, sigue tu curiosidad y encuentra ese libro que no vas a querer soltar.
            </p>
            <a className="button button-dark hero-button" href="#catalogo">
              Explorar historias <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sun" />
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-book">
              <span className="art-book-small">UNA IDEA</span>
              <span>TODO<br />EMPIEZA<br />EN UNA<br /><i>PÁGINA.</i></span>
              <span className="art-book-line" />
            </div>
            <span className="art-star star-one">✳</span>
            <span className="art-star star-two">✳</span>
            <span className="art-caption">abre. imagina. sigue.</span>
          </div>
          <div className="hero-footnote"><span>01</span> Lecturas para mirar más lejos</div>
        </section>

        <section className="catalog-section" id="catalogo" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Tu siguiente capítulo empieza aquí</p>
              <h2 id="catalog-title">Encuentra tu historia</h2>
            </div>
            <p className="catalog-note">Historias originales de demostración.<br />Sin portadas ni imágenes externas.</p>
          </div>

          <form
            className="filter-panel"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              setDebouncedQuery(query.trim());
            }}
          >
            <div className="search-field">
              <label htmlFor="book-search">Busca por título o autor</label>
              <div className="input-wrap">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input
                  id="book-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="¿Qué te apetece leer?"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="select-field">
              <label htmlFor="genre-filter">Género</label>
              <select id="genre-filter" value={genre} onChange={(event) => setGenre(event.target.value)}>
                <option value="">Todos los géneros</option>
                {genres.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="select-field age-field">
              <label htmlFor="age-filter">Edad recomendada</label>
              <input
                id="age-filter"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={ageInput}
                onChange={(event) => setAgeInput(event.target.value)}
                placeholder="Cualquier edad"
                aria-invalid={!ageIsValid}
                aria-describedby={!ageIsValid ? "age-error" : undefined}
              />
            </div>
            <button className="filter-submit" type="submit" aria-label="Aplicar búsqueda y filtros">
              <span aria-hidden="true">↗</span>
            </button>
            {!ageIsValid && (
              <p className="field-error" id="age-error" role="alert">
                Escribe una edad entera mayor que cero.
              </p>
            )}
          </form>

          <div className="results-bar">
            <p className="result-count" aria-live="polite">
              {listState.status === "success" ? resultCount : "Catálogo"}
            </p>
            {(query || genre || ageInput) && (
              <button className="clear-filters" type="button" onClick={resetFilters}>
                Limpiar filtros <span aria-hidden="true">×</span>
              </button>
            )}
          </div>

          {listState.status === "loading" && (
            <div className="loading-grid" role="status" aria-live="polite" aria-label="Cargando libros">
              {[0, 1, 2, 3].map((item) => (
                <div className="skeleton-card" key={item}>
                  <div className="skeleton-cover" />
                  <div className="skeleton-line skeleton-line-short" />
                  <div className="skeleton-line" />
                </div>
              ))}
              <span className="sr-only">Cargando historias…</span>
            </div>
          )}

          {listState.status === "error" && (
            <div className="state-panel error-panel" role="alert">
              <span className="state-symbol" aria-hidden="true">!</span>
              <div>{describeError(listState.message)}</div>
              <button className="button button-dark" type="button" onClick={() => setRetry((value) => value + 1)}>
                Reintentar
              </button>
            </div>
          )}

          {listState.status === "success" && listState.books.length === 0 && (
            <div className="state-panel empty-panel">
              <span className="empty-spark" aria-hidden="true">✳</span>
              <p className="state-title">Todavía no aparece esa historia.</p>
              <p className="state-copy">Prueba con otras palabras o quita algún filtro para ampliar la búsqueda.</p>
              <button className="button button-outline" type="button" onClick={resetFilters}>Ver todo el catálogo</button>
            </div>
          )}

          {listState.status === "success" && listState.books.length > 0 && (
            <div className="book-grid">
              {listState.books.map((book, index) => (
                <article className="book-card" key={book.id}>
                  <button
                    className="book-open"
                    type="button"
                    onClick={(event) => {
                      openerRef.current = event.currentTarget;
                      setSelectedBookId(book.id);
                    }}
                    aria-label={`Ver ficha de ${book.title}, de ${book.author}`}
                  >
                    <span className={`book-cover cover-tone-${index % 5}`} aria-hidden="true">
                      <span className="cover-topline">{book.genre}</span>
                      <span className="cover-title">{book.title}</span>
                      <span className="cover-author">{book.author}</span>
                      <span className="cover-orbit" />
                      <span className="cover-index">{String(index + 1).padStart(2, "0")}</span>
                    </span>
                    <span className="book-info">
                      <span className="book-meta">{book.genre} <span aria-hidden="true">·</span> {book.recommended_age_min}–{book.recommended_age_max} años</span>
                      <span className="book-title">{book.title}</span>
                      <span className="book-author">por {book.author}</span>
                      <span className="book-link">Descubrir el libro <span aria-hidden="true">↗</span></span>
                    </span>
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#catalogo">
          <span className="brand-mark" aria-hidden="true">e.</span>
          <span>entre líneas</span>
        </a>
        <p>Un buen libro siempre abre otra puerta.</p>
        <span className="footer-small">Catálogo de demostración</span>
      </footer>

      {selectedBookId !== null && (
        <BookDialog bookId={selectedBookId} onClose={() => setSelectedBookId(null)} />
      )}
    </div>
  );
}

export default App;

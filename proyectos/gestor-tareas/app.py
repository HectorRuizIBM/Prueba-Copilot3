"""Interfaz local de Streamlit para el gestor de tareas."""

import os
from pathlib import Path


STATUS_LABELS = {
    "pending": "Pendiente",
    "in_progress": "En curso",
    "completed": "Completada",
}

FILTER_LABELS = {
    "all": "Todos los estados",
    "pending": "Pendiente",
    "in_progress": "En curso",
    "completed": "Completada",
}


def main():
    import sqlite3

    import streamlit as st
    from streamlit.errors import StreamlitAPIException

    st.set_page_config(page_title="Gestor de tareas", page_icon="✓", layout="wide")

    # Fallar de forma cerrada si el servidor no está vinculado a loopback.
    # La dirección debe establecerse al arrancar Streamlit, no desde la interfaz.
    try:
        bind_address = st.get_option("server.address")
    except StreamlitAPIException as exc:
        st.error("No se pudo leer la dirección de escucha de Streamlit.")
        st.text(f"Detalle: {exc}")
        st.info("Comprueba la configuración de Streamlit y vuelve a iniciar en 127.0.0.1.")
        st.stop()
    if bind_address not in {"127.0.0.1", "localhost", "::1"}:
        st.error(
            "La aplicación solo puede ejecutarse en este equipo. "
            "Iníciala con `streamlit run app.py --server.address=127.0.0.1`."
        )
        st.text(f"Dirección configurada: {bind_address!r}")
        st.stop()

    try:
        from task_store import (
            TaskNotFoundError,
            TaskStore,
            ValidationError,
        )
    except ModuleNotFoundError as exc:
        if exc.name == "task_store":
            st.error(
                "El backend todavía no está disponible. "
                "Se necesita `task_store.py` junto a `app.py`."
            )
        else:
            st.error(
                f"No se pudo cargar el módulo `{exc.name}` requerido por el backend. "
                "Comprueba que el backend y sus dependencias estén disponibles."
            )
        st.stop()

    database_override = os.environ.get("TASKS_DB_PATH")
    if database_override is None:
        database_path = Path(__file__).parent / "data" / "tasks.sqlite3"
    elif not database_override.strip():
        st.error("TASKS_DB_PATH está definida, pero no contiene una ruta válida.")
        st.info("Asigna a TASKS_DB_PATH una ruta SQLite válida o elimina la variable.")
        st.stop()
    else:
        database_path = Path(database_override)

    st.title("Gestor de tareas")
    st.caption("Organiza el trabajo de forma sencilla. Los datos se guardan en este equipo.")

    try:
        database_path.parent.mkdir(parents=True, exist_ok=True)
        store = TaskStore(database_path)
        store.initialize()
    except (OSError, sqlite3.Error) as exc:
        st.error("No se pudo preparar el almacenamiento local de tareas.")
        st.text(f"Detalle: {exc}")
        st.info("Comprueba los permisos de la carpeta `data` y vuelve a cargar.")
        return

    flash_message = st.session_state.pop("flash_message", None)
    if flash_message:
        st.success(flash_message)

    st.subheader("Nueva tarea")
    with st.form("create_task_form", clear_on_submit=True):
        title = st.text_input("Título", max_chars=200)
        description = st.text_area("Descripción (opcional)", max_chars=2000)
        create_submitted = st.form_submit_button("Crear tarea", type="primary")

    if create_submitted:
        if not title.strip():
            st.error("Escribe un título para crear la tarea.")
        else:
            try:
                store.create_task(title.strip(), description.strip(), "pending")
                st.session_state["flash_message"] = "La tarea se creó correctamente."
                st.rerun()
            except ValidationError as exc:
                st.error("No se pudo crear la tarea: revisa el título y la descripción.")
                st.text(f"Detalle: {exc}")
            except (OSError, sqlite3.Error) as exc:
                st.error("No se pudo guardar la tarea.")
                st.text(f"Detalle: {exc}")
                st.info("Comprueba el almacenamiento local y vuelve a intentarlo.")

    st.subheader("Tareas")
    selected_status = st.selectbox(
        "Filtrar por estado",
        options=list(FILTER_LABELS),
        format_func=lambda value: FILTER_LABELS[value],
    )

    try:
        with st.spinner("Cargando tareas…"):
            all_tasks = store.list_tasks()
            visible_tasks = (
                all_tasks
                if selected_status == "all"
                else store.list_tasks(status=selected_status)
            )
    except (OSError, sqlite3.Error) as exc:
        st.error("No se pudieron cargar las tareas.")
        st.text(f"Detalle: {exc}")
        st.info("Comprueba el almacenamiento local y vuelve a cargar la página.")
        return

    counts = {
        status: sum(1 for task in all_tasks if task.status == status)
        for status in STATUS_LABELS
    }
    metric_columns = st.columns(4)
    metric_columns[0].metric("Total", len(all_tasks))
    metric_columns[1].metric("Pendientes", counts["pending"])
    metric_columns[2].metric("En curso", counts["in_progress"])
    metric_columns[3].metric("Completadas", counts["completed"])

    if not visible_tasks:
        if all_tasks:
            st.info("No hay tareas con este estado. Prueba otro filtro.")
        else:
            st.info("Todavía no hay tareas. Crea una tarea con el formulario de arriba.")
        return

    for task in visible_tasks:
        status_label = STATUS_LABELS.get(task.status, "Estado desconocido")
        with st.container(border=True):
            st.text(task.title)
            st.caption(f"Estado: {status_label}")
            if task.description:
                st.text(task.description)
            st.caption(f"Creada: {task.created_at} · Actualizada: {task.updated_at}")

            with st.expander("Editar tarea"):
                with st.form(f"edit_task_{task.id}"):
                    edited_title = st.text_input(
                        "Título",
                        value=task.title,
                        max_chars=200,
                        key=f"edit_title_{task.id}",
                    )
                    edited_description = st.text_area(
                        "Descripción (opcional)",
                        value=task.description,
                        max_chars=2000,
                        key=f"edit_description_{task.id}",
                    )
                    current_status = (
                        task.status if task.status in STATUS_LABELS else "pending"
                    )
                    edited_status = st.selectbox(
                        "Estado",
                        options=list(STATUS_LABELS),
                        index=list(STATUS_LABELS).index(current_status),
                        format_func=lambda value: STATUS_LABELS[value],
                        key=f"edit_status_{task.id}",
                    )
                    edit_submitted = st.form_submit_button("Guardar cambios")

                if edit_submitted:
                    if not edited_title.strip():
                        st.error("El título no puede estar vacío.")
                    else:
                        try:
                            store.update_task(
                                task.id,
                                edited_title.strip(),
                                edited_description.strip(),
                                edited_status,
                            )
                            st.session_state["flash_message"] = (
                                "Los cambios se guardaron correctamente."
                            )
                            st.rerun()
                        except ValidationError as exc:
                            st.error(
                                "No se pudieron guardar los cambios: revisa los campos."
                            )
                            st.text(f"Detalle: {exc}")
                        except TaskNotFoundError:
                            st.error("La tarea ya no existe. Recarga la lista.")
                        except (OSError, sqlite3.Error) as exc:
                            st.error("No se pudieron guardar los cambios.")
                            st.text(f"Detalle: {exc}")
                            st.info("Comprueba el almacenamiento local y vuelve a intentarlo.")

            with st.expander("Eliminar tarea"):
                with st.form(f"delete_task_{task.id}"):
                    confirmed = st.checkbox(
                        "Confirmo el borrado definitivo de esta tarea",
                        key=f"confirm_delete_{task.id}",
                    )
                    delete_submitted = st.form_submit_button("Eliminar tarea")

                if delete_submitted:
                    if not confirmed:
                        st.warning("Confirma el borrado antes de continuar.")
                    else:
                        try:
                            store.delete_task(task.id)
                            st.session_state["flash_message"] = (
                                "La tarea se eliminó correctamente."
                            )
                            st.rerun()
                        except TaskNotFoundError:
                            st.error("La tarea ya no existe. Recarga la lista.")
                        except (OSError, sqlite3.Error) as exc:
                            st.error("No se pudo eliminar la tarea.")
                            st.text(f"Detalle: {exc}")
                            st.info("Comprueba el almacenamiento local y vuelve a intentarlo.")


if __name__ == "__main__":
    main()

/**
 * admin.js - Mini CRUD de noticias
 * Crear y eliminar publicaciones. El navegador no puede escribir en un
 * archivo JSON, así que los cambios se guardan en localStorage y tienen
 * prioridad sobre data/noticias.json (ver obtenerNoticias en app.js).
 */
"use strict";

iniciarPagina("");

const form = document.getElementById("form-noticia");
const tabla = document.getElementById("tabla-noticias");
const total = document.getElementById("total");
const aviso = document.getElementById("mensaje-admin");
const selectCategoria = document.getElementById("categoria");

let noticias = [];

// Llenamos el <select> con las categorías definidas en app.js
selectCategoria.innerHTML =
  `<option value="">Selecciona…</option>` +
  CATEGORIAS.map((c) => `<option value="${c}">${c}</option>`).join("");

function mostrarAviso(texto) {
  aviso.textContent = `✓ ${texto}`;
  aviso.hidden = false;
}

/** READ: dibuja la tabla con todas las noticias. */
function dibujarTabla() {
  total.textContent = noticias.length;
  tabla.innerHTML = noticias.length
    ? noticias.map((n) => `
        <tr>
          <td>${escapar(n.titulo)}</td>
          <td>${escapar(n.categoria)}</td>
          <td>${escapar(n.fecha)}</td>
          <td><button type="button" class="btn btn-peligro btn-pequeno" data-eliminar="${n.id}" aria-label="Eliminar «${escapar(n.titulo)}»">Eliminar</button></td>
        </tr>`).join("")
    : `<tr><td colspan="4">No hay noticias publicadas.</td></tr>`;
}

/** Validación del formulario. Devuelve true si todo está correcto. */
function validar() {
  const reglas = {
    titulo:    (v) => (v.trim().length < 5 ? "El título debe tener al menos 5 caracteres." : ""),
    categoria: (v) => (v ? "" : "Selecciona una categoría."),
    resumen:   (v) => (v.trim().length < 10 ? "El resumen debe tener al menos 10 caracteres." : ""),
    contenido: (v) => (v.trim().length < 30 ? "El contenido debe tener al menos 30 caracteres." : ""),
  };
  let valido = true;
  for (const [campo, regla] of Object.entries(reglas)) {
    const error = regla(form.elements[campo].value);
    document.getElementById(`error-${campo}`).textContent = error;
    form.elements[campo].closest(".campo").classList.toggle("campo--error", Boolean(error));
    if (error) valido = false;
  }
  return valido;
}

/** CREATE: agrega la noticia nueva al inicio de la lista. */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  aviso.hidden = true;
  if (!validar()) return;

  const nuevoId = noticias.length ? Math.max(...noticias.map((n) => n.id)) + 1 : 1;
  const nueva = {
    id: nuevoId,
    titulo: form.titulo.value.trim(),
    categoria: form.categoria.value,
    destacada: false,
    fecha: new Date().toISOString().slice(0, 10),
    autor: form.autor.value.trim() || "Redacción NovaNews",
    resumen: form.resumen.value.trim(),
    // Cada bloque separado por una línea en blanco se convierte en un párrafo.
    contenido: form.contenido.value.trim().split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
  };

  noticias = [nueva, ...noticias];
  guardarNoticias(noticias);
  form.reset();
  dibujarTabla();
  mostrarAviso("Noticia publicada. Ya aparece en el listado.");
});

/** DELETE: elimina una noticia (y la saca de favoritos si estaba). */
tabla.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-eliminar]");
  if (!boton) return;

  const id = Number(boton.dataset.eliminar);
  const noticia = noticias.find((n) => n.id === id);
  if (!confirm(`¿Eliminar «${noticia.titulo}»? Esta acción no se puede deshacer.`)) return;

  noticias = noticias.filter((n) => n.id !== id);
  guardarNoticias(noticias);
  if (esFavorito(id)) alternarFavorito(id);
  dibujarTabla();
  mostrarAviso("Noticia eliminada.");
});

document.getElementById("btn-restablecer").addEventListener("click", async () => {
  if (!confirm("¿Restablecer las noticias originales? Se perderán los cambios.")) return;
  restablecerNoticias();
  noticias = await obtenerNoticias();
  dibujarTabla();
  mostrarAviso("Datos originales restablecidos.");
});

(async function iniciar() {
  noticias = await obtenerNoticias();
  dibujarTabla();
})();

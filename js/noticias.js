/**
 * noticias.js - Listado de noticias
 * Funciones: filtro por categoría, búsqueda por texto y paginación.
 */
"use strict";

iniciarPagina("noticias");

const POR_PAGINA = 6;

// Estado de la vista: todo cambio pasa por aquí y luego se vuelve a dibujar.
const estado = { noticias: [], categoria: "Todas", texto: "", pagina: 1 };

const el = {
  filtros: document.getElementById("filtros"),
  buscador: document.getElementById("buscador"),
  listado: document.getElementById("listado"),
  paginacion: document.getElementById("paginacion"),
  contador: document.getElementById("contador"),
};

/** Dibuja los botones de categoría (Todas + las 4 categorías). */
function dibujarFiltros() {
  const opciones = ["Todas", ...CATEGORIAS];
  el.filtros.innerHTML = opciones.map((c) => {
    const clase = c === "Todas" ? "todas" : slug(c);
    const activo = c === estado.categoria;
    return `<button type="button" class="filtro filtro--${clase}" data-cat="${c}" aria-pressed="${activo}">${c}</button>`;
  }).join("");
}

/** Aplica filtro + búsqueda y devuelve las noticias que coinciden. */
function filtrarNoticias() {
  const texto = estado.texto.trim().toLowerCase();
  return estado.noticias.filter((n) => {
    const coincideCat = estado.categoria === "Todas" || n.categoria === estado.categoria;
    const coincideTexto = !texto ||
      n.titulo.toLowerCase().includes(texto) ||
      n.resumen.toLowerCase().includes(texto);
    return coincideCat && coincideTexto;
  });
}

function dibujarPaginacion(totalPaginas) {
  if (totalPaginas <= 1) { el.paginacion.innerHTML = ""; return; }

  let html = `<button type="button" data-pag="${estado.pagina - 1}" aria-label="Página anterior" ${estado.pagina === 1 ? "disabled" : ""}>&lt;</button>`;
  for (let i = 1; i <= totalPaginas; i++) {
    const actual = i === estado.pagina ? ' aria-current="page"' : "";
    html += `<button type="button" data-pag="${i}"${actual}>${i}</button>`;
  }
  html += `<button type="button" data-pag="${estado.pagina + 1}" aria-label="Página siguiente" ${estado.pagina === totalPaginas ? "disabled" : ""}>&gt;</button>`;
  el.paginacion.innerHTML = html;
}

function dibujar() {
  const resultado = filtrarNoticias();
  const totalPaginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));
  if (estado.pagina > totalPaginas) estado.pagina = totalPaginas;

  const inicio = (estado.pagina - 1) * POR_PAGINA;
  const pagina = resultado.slice(inicio, inicio + POR_PAGINA);

  el.contador.textContent = `${resultado.length} ${resultado.length === 1 ? "noticia encontrada" : "noticias encontradas"}`;

  el.listado.innerHTML = pagina.length
    ? pagina.map((n) => crearTarjeta(n)).join("")
    : `<div class="estado-vacio" style="grid-column:1/-1"><strong>No encontramos noticias.</strong>Prueba con otra categoría o con otras palabras.</div>`;

  dibujarFiltros();
  dibujarPaginacion(totalPaginas);
}

// --- Eventos (delegación: un solo listener por contenedor) ---
el.filtros.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-cat]");
  if (!boton) return;
  estado.categoria = boton.dataset.cat;
  estado.pagina = 1;
  dibujar();
});

el.buscador.addEventListener("input", () => {
  estado.texto = el.buscador.value;
  estado.pagina = 1;
  dibujar();
});

el.paginacion.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-pag]");
  if (!boton || boton.disabled) return;
  estado.pagina = Number(boton.dataset.pag);
  dibujar();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// --- Arranque ---
(async function iniciar() {
  estado.noticias = await obtenerNoticias();

  // El icono de lupa del menú enlaza con ?buscar=1: enfocamos el campo.
  if (new URLSearchParams(location.search).has("buscar")) el.buscador.focus();

  dibujar();
})();

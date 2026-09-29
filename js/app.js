/**
 * app.js
 * Lógica compartida por todas las páginas de NovaNews:
 *  - Acceso a los datos (JSON local + localStorage)
 *  - Gestión de favoritos
 *  - Renderizado del encabezado, el pie de página y las tarjetas
 *
 * Se carga en todas las páginas ANTES del script propio de cada vista.
 */
"use strict";

/* =========================================================
   1. CONSTANTES
   ========================================================= */
const CLAVE_NOTICIAS = "novanews_noticias";   // noticias creadas/eliminadas desde el admin
const CLAVE_FAVORITOS = "novanews_favoritos"; // [{ id, guardadaEl }]
const CLAVE_MENSAJES = "novanews_mensajes";   // mensajes enviados desde contacto

const CATEGORIAS = ["Educación", "Tecnología", "Turismo", "Comercial"];

/** Menú principal: cinco secciones definidas en la Entrega 1. */
const MENU = [
  { id: "inicio",    texto: "Inicio",    href: "index.html" },
  { id: "noticias",  texto: "Noticias",  href: "noticias.html" },
  { id: "favoritos", texto: "Favoritos", href: "favoritos.html" },
  { id: "nosotros",  texto: "Nosotros",  href: "nosotros.html" },
  { id: "contacto",  texto: "Contacto",  href: "contacto.html" },
];

/* =========================================================
   2. UTILIDADES
   ========================================================= */

/**
 * Escapa caracteres especiales de HTML.
 * Evita que texto escrito por el usuario (por ejemplo desde el admin)
 * se interprete como código al insertarlo con innerHTML.
 */
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto ?? "");
  return div.innerHTML;
}

/** Convierte "Educación" en "educacion" (para clases CSS y nombres de imagen). */
function slug(categoria) {
  return categoria
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Formatea "2026-09-12" como "12 de septiembre de 2026". */
function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/** Lee y parsea JSON de localStorage sin romper la página si está dañado. */
function leerLocal(clave, porDefecto) {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : porDefecto;
  } catch (error) {
    console.warn(`No se pudo leer "${clave}" de localStorage`, error);
    return porDefecto;
  }
}

function escribirLocal(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.warn(`No se pudo guardar "${clave}" en localStorage`, error);
  }
}

/* =========================================================
   3. NOTICIAS (fuente de datos)
   ========================================================= */

/**
 * Devuelve la lista de noticias. Orden de prioridad:
 *  1. Lo que el admin haya guardado en localStorage (crear / eliminar).
 *  2. data/noticias.json (fuente de datos original).
 *  3. window.NOTICIAS_RESPALDO (js/data.js), por si fetch falla con file://.
 */
async function obtenerNoticias() {
  const guardadas = leerLocal(CLAVE_NOTICIAS, null);
  if (Array.isArray(guardadas)) return guardadas;

  // Con file:// el navegador bloquea fetch(): vamos directo al respaldo.
  if (location.protocol === "file:") return window.NOTICIAS_RESPALDO || [];

  try {
    const respuesta = await fetch("data/noticias.json");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return await respuesta.json();
  } catch (error) {
    console.info("Usando datos de respaldo (js/data.js):", error.message);
    return window.NOTICIAS_RESPALDO || [];
  }
}

function guardarNoticias(lista) {
  escribirLocal(CLAVE_NOTICIAS, lista);
}

/** Restaura las noticias originales del JSON. */
function restablecerNoticias() {
  localStorage.removeItem(CLAVE_NOTICIAS);
}

/* =========================================================
   4. FAVORITOS (localStorage)
   ========================================================= */

function obtenerFavoritos() {
  return leerLocal(CLAVE_FAVORITOS, []);
}

function esFavorito(id) {
  return obtenerFavoritos().some((f) => f.id === id);
}

/** Agrega o quita una noticia de favoritos. Devuelve true si quedó guardada. */
function alternarFavorito(id) {
  let favoritos = obtenerFavoritos();
  const yaEsta = favoritos.some((f) => f.id === id);

  if (yaEsta) {
    favoritos = favoritos.filter((f) => f.id !== id);
  } else {
    favoritos.push({ id, guardadaEl: new Date().toISOString().slice(0, 10) });
  }
  escribirLocal(CLAVE_FAVORITOS, favoritos);
  return !yaEsta;
}

/* =========================================================
   5. COMPONENTES DE INTERFAZ
   ========================================================= */

/** Dibuja el encabezado. `paginaActiva` es el id del ítem del menú a resaltar. */
function renderizarHeader(paginaActiva) {
  const items = MENU.map((m) => {
    const actual = m.id === paginaActiva ? ' aria-current="page"' : "";
    return `<li><a href="${m.href}"${actual}>${m.texto}</a></li>`;
  }).join("");

  const header = document.getElementById("header");
  header.className = "header";
  header.innerHTML = `
    <div class="contenedor header__interno">
      <a class="logo" href="index.html" aria-label="NovaNews, ir al inicio">Nova<span>News</span></a>
      <button class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú">&#9776;</button>
      <nav aria-label="Principal">
        <ul class="menu" id="menu">
          ${items}
          <li>
            <a class="menu__buscar" href="noticias.html?buscar=1" aria-label="Buscar noticias">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="10" cy="10" r="6"/><path d="M15 15l6 6"/>
              </svg>
            </a>
          </li>
        </ul>
      </nav>
    </div>`;

  // Menú hamburguesa en pantallas pequeñas
  const boton = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", String(abierto));
  });
}

/** Dibuja el pie de página. */
function renderizarFooter() {
  const footer = document.getElementById("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="contenedor">
      <div class="footer__grid">
        <div>
          <h3>NovaNews</h3>
          <p>Portal informativo con noticias educativas, tecnológicas, turísticas y comerciales.</p>
        </div>
        <div>
          <h3>Explorar</h3>
          <ul>
            <li><a href="index.html">Inicio</a></li>
            <li><a href="noticias.html">Noticias</a></li>
            <li><a href="favoritos.html">Favoritos</a></li>
          </ul>
        </div>
        <div>
          <h3>Institucional</h3>
          <ul>
            <li><a href="nosotros.html">Nosotros</a></li>
            <li><a href="contacto.html">Contacto</a></li>
            <li><a href="admin.html">Administrar noticias</a></li>
          </ul>
        </div>
        <div>
          <h3>Síguenos</h3>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">X</a></li>
          </ul>
        </div>
      </div>
      <p class="footer__copy">© 2026 NovaNews. Todos los derechos reservados.</p>
    </div>`;
}

/**
 * Devuelve el HTML de una tarjeta de noticia.
 * @param {object}  noticia
 * @param {object}  opciones  { conQuitar: boolean } muestra la "x" de favoritos.
 */
function crearTarjeta(noticia, opciones = {}) {
  const cat = slug(noticia.categoria);
  const favorito = obtenerFavoritos().find((f) => f.id === noticia.id);

  const meta = opciones.conQuitar && favorito
    ? `<p class="tarjeta__meta">Guardada el ${formatearFecha(favorito.guardadaEl)}</p>`
    : "";

  const botonQuitar = opciones.conQuitar
    ? `<button class="tarjeta__quitar" data-quitar="${noticia.id}" aria-label="Quitar «${escapar(noticia.titulo)}» de favoritos">×</button>`
    : "";

  return `
    <article class="tarjeta">
      ${botonQuitar}
      <div class="tarjeta__imagen">
        <img src="img/${cat}.svg" alt="" loading="lazy">
        <span class="etiqueta etiqueta--${cat}">${escapar(noticia.categoria)}</span>
      </div>
      <div class="tarjeta__cuerpo">
        <h3 class="tarjeta__titulo">${escapar(noticia.titulo)}</h3>
        ${meta}
        <p class="tarjeta__texto">${escapar(noticia.resumen)}</p>
        <div class="tarjeta__pie">
          <a class="btn btn-primario btn-pequeno" href="detalle.html?id=${noticia.id}">Ver más</a>
        </div>
      </div>
    </article>`;
}

/* =========================================================
   6. ARRANQUE COMÚN
   ========================================================= */

/** Cada página llama a esta función con el id de su ítem de menú. */
function iniciarPagina(paginaActiva) {
  renderizarHeader(paginaActiva);
  renderizarFooter();
}

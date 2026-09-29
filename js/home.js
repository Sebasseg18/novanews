/**
 * home.js - Página de inicio
 * Muestra las noticias marcadas como "destacada" en data/noticias.json.
 */
"use strict";

iniciarPagina("inicio");

(async function cargarDestacadas() {
  const contenedor = document.getElementById("destacadas");
  const noticias = await obtenerNoticias();

  // Solo las destacadas; si no hay ninguna, mostramos las 3 más recientes.
  let destacadas = noticias.filter((n) => n.destacada).slice(0, 3);
  if (destacadas.length === 0) destacadas = noticias.slice(0, 3);

  contenedor.innerHTML = destacadas.length
    ? destacadas.map((n) => crearTarjeta(n)).join("")
    : `<div class="estado-vacio"><strong>Aún no hay noticias.</strong>Publica la primera desde la sección de administración.</div>`;
})();

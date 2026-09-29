/**
 * detalle.js - Vista de una noticia (detalle.html?id=N)
 */
"use strict";

iniciarPagina("noticias");

(async function iniciar() {
  const contenedor = document.getElementById("detalle");
  const id = Number(new URLSearchParams(location.search).get("id"));
  const noticias = await obtenerNoticias();
  const noticia = noticias.find((n) => n.id === id);

  // Si el id no existe (o fue eliminado) avisamos y damos salida.
  if (!noticia) {
    document.title = "Noticia no encontrada | NovaNews";
    contenedor.innerHTML = `
      <div class="estado-vacio" style="margin-top:2rem">
        <strong>No encontramos esta noticia.</strong>
        Puede que haya sido eliminada. <a href="noticias.html">Volver al listado</a>.
      </div>`;
    return;
  }

  document.title = `${noticia.titulo} | NovaNews`;
  const cat = slug(noticia.categoria);
  const parrafos = noticia.contenido.map((p) => `<p>${escapar(p)}</p>`).join("");

  // Relacionadas: misma categoría primero, luego cualquier otra (máximo 2).
  const relacionadas = [
    ...noticias.filter((n) => n.id !== id && n.categoria === noticia.categoria),
    ...noticias.filter((n) => n.id !== id && n.categoria !== noticia.categoria),
  ].slice(0, 2);

  contenedor.innerHTML = `
    <nav class="migas" aria-label="Migas de pan">
      <a href="index.html">Inicio</a> / <a href="noticias.html">Noticias</a> / ${escapar(noticia.titulo)}
    </nav>

    <article class="detalle">
      <div class="detalle__imagen">
        <img src="img/${cat}.svg" alt="">
        <span class="etiqueta etiqueta--${cat}">${escapar(noticia.categoria)}</span>
      </div>
      <h1>${escapar(noticia.titulo)}</h1>
      <p class="detalle__meta">Publicado el ${formatearFecha(noticia.fecha)} · Por ${escapar(noticia.autor)}</p>
      <div class="detalle__texto">${parrafos}</div>

      <div class="detalle__acciones">
        <button type="button" class="btn btn-primario" id="btn-favorito"></button>
        <a class="btn btn-secundario" href="contacto.html">Contactar</a>
      </div>
    </article>

    <section aria-labelledby="titulo-relacionadas">
      <h2 class="seccion__titulo" id="titulo-relacionadas">Noticias relacionadas</h2>
      <div class="grid-noticias" style="margin-top:1rem">
        ${relacionadas.map((n) => crearTarjeta(n)).join("")}
      </div>
    </section>`;

  // Botón de favoritos: cambia el texto según el estado guardado.
  const boton = document.getElementById("btn-favorito");
  const actualizarBoton = () => {
    const guardada = esFavorito(id);
    boton.textContent = guardada ? "♥ Quitar de favoritos" : "♥ Agregar a favoritos";
    boton.setAttribute("aria-pressed", String(guardada));
  };
  actualizarBoton();
  boton.addEventListener("click", () => {
    alternarFavorito(id);
    actualizarBoton();
  });
})();

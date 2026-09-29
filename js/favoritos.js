/**
 * favoritos.js - Noticias guardadas en localStorage
 */
"use strict";

iniciarPagina("favoritos");

const lista = document.getElementById("lista-favoritos");

async function dibujar() {
  const noticias = await obtenerNoticias();
  const ids = obtenerFavoritos().map((f) => f.id);
  // Ignoramos favoritos cuyas noticias ya no existen (por ejemplo, eliminadas en el admin).
  const guardadas = noticias.filter((n) => ids.includes(n.id));

  lista.innerHTML = guardadas.length
    ? guardadas.map((n) => crearTarjeta(n, { conQuitar: true })).join("")
    : `<div class="estado-vacio" style="grid-column:1/-1">
         <strong>Aún no tienes noticias favoritas.</strong>
         Explora el <a href="noticias.html">catálogo</a> y guarda las que te interesen.
       </div>`;
}

// Delegación de eventos: un clic en la "x" quita la noticia de la lista.
lista.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-quitar]");
  if (!boton) return;
  alternarFavorito(Number(boton.dataset.quitar));
  dibujar();
});

dibujar();

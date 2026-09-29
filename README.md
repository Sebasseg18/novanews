# NovaNews – Entrega Previa 2

Primera versión del aplicativo web de noticias (HTML, CSS y JavaScript puro).

## Cómo ejecutarlo
- Abre `index.html` con doble clic (funciona sin servidor), **o**
- Con servidor local: `python3 -m http.server 8000` y entra a http://localhost:8000

## Estructura
```
novanews/
├── index.html · noticias.html · detalle.html
├── favoritos.html · nosotros.html · contacto.html · admin.html
├── css/styles.css
├── js/  app.js (compartido) + un archivo por página + data.js (respaldo)
├── data/noticias.json
├── docs/mockups/  (mockups originales en SVG de la Entrega 1)
└── img/
```

## Funcionalidades
- Menú de 5 secciones, header fijo y footer en todas las vistas
- Listado con tarjetas, filtro por categoría, buscador y paginación
- Detalle de noticia con breadcrumb, relacionadas y botón de favoritos
- Favoritos con `localStorage` y estado vacío
- Contacto con validaciones y mensaje de confirmación
- Mini CRUD (crear y eliminar noticias) en `admin.html`

/**
 * contacto.js - Formulario con validaciones
 * Reglas: nombre (mín. 3), correo con formato válido, mensaje (mín. 10)
 * y aceptación de la política de datos. El asunto es opcional.
 */
"use strict";

iniciarPagina("contacto");

const form = document.getElementById("form-contacto");
const confirmacion = document.getElementById("confirmacion");

// Expresión regular sencilla para validar formato de correo.
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Cada regla devuelve un texto de error, o "" si el valor es válido. */
const reglas = {
  nombre: (v) => (v.trim().length < 3 ? "Escribe tu nombre (mín. 3 letras)." : ""),
  correo: (v) => {
    if (!v.trim()) return "Este campo es obligatorio.";
    return REGEX_CORREO.test(v.trim()) ? "" : "Escribe un correo válido.";
  },
  mensaje: (v) => (v.trim().length < 10 ? "El mensaje debe tener al menos 10 caracteres." : ""),
  politica: (_v, campo) => (campo.checked ? "" : "Debes aceptar la política de tratamiento de datos."),
};

/** Valida un campo y muestra/limpia su mensaje de error. Devuelve true si es válido. */
function validarCampo(nombre) {
  const campo = form.elements[nombre];
  const contenedor = campo.closest(".campo");
  const spanError = document.getElementById(`error-${nombre}`);
  const error = reglas[nombre](campo.value, campo);

  spanError.textContent = error;
  contenedor.classList.toggle("campo--error", Boolean(error));
  contenedor.classList.toggle("campo--valido", !error);
  campo.setAttribute("aria-invalid", String(Boolean(error)));
  return !error;
}

// Validación en vivo: al salir de un campo, y al escribir si ya tenía error.
Object.keys(reglas).forEach((nombre) => {
  const campo = form.elements[nombre];
  campo.addEventListener("blur", () => validarCampo(nombre));
  campo.addEventListener("input", () => {
    if (campo.closest(".campo").classList.contains("campo--error")) validarCampo(nombre);
  });
  if (campo.type === "checkbox") campo.addEventListener("change", () => validarCampo(nombre));
});

form.addEventListener("submit", (e) => {
  e.preventDefault(); // no recargamos la página
  confirmacion.hidden = true;

  // Validamos TODOS los campos (sin cortar en el primer error) para mostrar todos los mensajes.
  const resultados = Object.keys(reglas).map(validarCampo);
  if (resultados.includes(false)) {
    const primerError = form.querySelector(".campo--error input, .campo--error textarea");
    if (primerError) primerError.focus();
    return;
  }

  // Guardamos el mensaje localmente (no hay backend en esta versión).
  const mensajes = leerLocal(CLAVE_MENSAJES, []);
  mensajes.push({
    nombre: form.nombre.value.trim(),
    correo: form.correo.value.trim(),
    asunto: form.asunto.value.trim(),
    mensaje: form.mensaje.value.trim(),
    fecha: new Date().toISOString(),
  });
  escribirLocal(CLAVE_MENSAJES, mensajes);

  form.reset();
  form.querySelectorAll(".campo--valido").forEach((c) => c.classList.remove("campo--valido"));
  confirmacion.hidden = false;
  confirmacion.scrollIntoView({ behavior: "smooth", block: "center" });
});

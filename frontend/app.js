const API = "http://127.0.0.1:8000/membresias";

const contenedor = document.getElementById("contenedor");
const contador = document.getElementById("contador");
const tituloVista = document.getElementById("tituloVista");
const buscador = document.getElementById("buscador");
const modal = document.getElementById("modal");
const menu = document.getElementById("menu");

let socios = [];
let filtro = "todos";
let busqueda = "";

const titulos = {
  todos: "Todos los socios",
  activas: "Membresías activas",
  vencidas: "Membresías vencidas",
};

const moneda = (n) => "$" + Number(n).toLocaleString("es-CO");

const escapar = (t) =>
  String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));


async function cargar() {
  try {
    const res = await fetch(API);
    socios = await res.json();
    render();
  } catch (e) {
    contenedor.innerHTML = `<div class="vacio"><i class="fa-solid fa-triangle-exclamation"></i>
      <p>No se pudo conectar con la API. Verifica que uvicorn esté corriendo.</p></div>`;
  }
}

function actualizarStats() {
  const activas = socios.filter((s) => s.activa);
  const ingresos = activas.reduce((t, s) => t + Number(s.valor_mensual), 0);
  contador.textContent = `${socios.length} socios`;
  document.getElementById("statTotal").textContent = socios.length;
  document.getElementById("statActivas").textContent = activas.length;
  document.getElementById("statVencidas").textContent = socios.length - activas.length;
  document.getElementById("statIngresos").textContent = moneda(ingresos);
}

function render() {
  actualizarStats();
  tituloVista.textContent = titulos[filtro];

  let lista = socios;
  if (filtro === "activas") lista = lista.filter((s) => s.activa);
  if (filtro === "vencidas") lista = lista.filter((s) => !s.activa);
  if (busqueda) lista = lista.filter((s) => s.cliente.toLowerCase().includes(busqueda));

  if (lista.length === 0) {
    contenedor.innerHTML = `<div class="vacio"><i class="fa-solid fa-dumbbell"></i>
      <p>No hay socios para mostrar. Usa "Afiliar socio" para registrar el primero.</p></div>`;
    return;
  }

  contenedor.innerHTML = lista
    .map((s) => {
      const claseEstado = s.activa ? "activa" : "vencida";
      const clasePlan = s.plan.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return `
      <article class="card">
        <div class="card-top">
          <div class="avatar">${escapar(s.cliente.charAt(0).toUpperCase())}</div>
          <div>
            <h3>${escapar(s.cliente)}</h3>
            <small>Socio de Iron Fitness</small>
          </div>
        </div>
        <div class="card-body">
          <div class="fila">
            <span class="plan ${clasePlan}">Plan ${escapar(s.plan)}</span>
            <span class="etiqueta ${claseEstado}">${s.activa ? "Activa" : "Vencida"}</span>
          </div>
          <div class="precio">${moneda(s.valor_mensual)} <small>/ mes</small></div>
        </div>
        <div class="acciones">
          <button class="btn ${s.activa ? "naranja" : "verde"}" onclick="cambiarEstado('${s._id}', ${!s.activa})">
            <i class="fa-solid fa-rotate"></i> ${s.activa ? "Vencer" : "Activar"}
          </button>
          <button class="btn rojo" onclick="eliminar('${s._id}')">
            <i class="fa-solid fa-trash"></i> Eliminar
          </button>
        </div>
      </article>`;
    })
    .join("");
}


document.getElementById("formSocio").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevo = {
    cliente: document.getElementById("cliente").value.trim(),
    plan: document.getElementById("plan").value,
    valor_mensual: parseFloat(document.getElementById("valor").value),
    activa: true,
  };
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevo),
  });
  e.target.reset();
  cerrarModal();
  cargar();
});


async function cambiarEstado(id, estado) {
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activa: estado }),
  });
  cargar();
}


async function eliminar(id) {
  if (!confirm("¿Eliminar este socio?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  cargar();
}


document.querySelectorAll("[data-filtro]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    filtro = a.dataset.filtro;
    document.querySelectorAll(".menu [data-filtro]").forEach((x) => x.classList.remove("activo"));
    document.querySelector(`.menu [data-filtro="${filtro}"]`).classList.add("activo");
    menu.classList.remove("abierto");
    render();
  });
});


buscador.addEventListener("input", () => {
  busqueda = buscador.value.trim().toLowerCase();
  render();
});


function abrirModal() {
  modal.classList.add("abierto");
  menu.classList.remove("abierto");
  document.getElementById("cliente").focus();
}
function cerrarModal() {
  modal.classList.remove("abierto");
}
document.getElementById("btnAfiliar").addEventListener("click", (e) => {
  e.preventDefault();
  abrirModal();
});
document.getElementById("cerrarModal").addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => { if (e.target === modal) cerrarModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarModal(); });


document.getElementById("burger").addEventListener("click", () => menu.classList.toggle("abierto"));

cargar();
let data = [];
let bd = false;
let presupuestoInicial = 0;
let restante = 0;
let id = null;

function iniciarApp() {
  // Load from localStorage
  const savedData = localStorage.getItem("budgetData");
  if (savedData) {
    const parsed = JSON.parse(savedData);
    data = parsed.data || [];
    presupuestoInicial = parsed.presupuestoInicial || 0;
    restante = parsed.restante || 0;
    if (presupuestoInicial > 0) {
      document.getElementById("presupuesto").value =
        presupuestoInicial.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        });
      document.getElementById("restante").value = restante.toLocaleString(
        "es-AR",
        {
          style: "currency",
          currency: "ARS",
        }
      );
      actualizarRestante();
      pintar();
    }
  }

  if (presupuestoInicial === 0) {
    Swal.fire({
      title: "Ingrese el presupuesto inicial",
      input: "number",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      preConfirm: (monto) => {
        presupuestoInicial = parseFloat(monto);
        document.getElementById("presupuesto").value =
          presupuestoInicial.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
          });
        document.getElementById("restante").value =
          presupuestoInicial.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
          });
        actualizarRestante();
        saveToLocalStorage();
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  }
}

function registrar() {
  let categoria = document.getElementById("categoria1").value;
  if (categoria === "Otros") {
    categoria =
      document.getElementById("otra-categoria").value.trim() || "Otros";
  }

  if (bd === true) {
    data[id].gasto = document.getElementById("gasto1").value;
    data[id].cantidad = parseFloat(document.getElementById("cantidad1").value);
    data[id].categoria = categoria;
    data[id].fecha = document.getElementById("fecha1").value;
    bd = false;
  } else {
    let datos = {
      gasto: document.getElementById("gasto1").value,
      cantidad: parseFloat(document.getElementById("cantidad1").value),
      categoria: categoria,
      fecha: document.getElementById("fecha1").value,
    };

    if (datos.cantidad > restante) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "El gasto excede el restante disponible!",
      });
      return;
    }

    data.push(datos);
    pintar();
  }

  actualizarRestante();
  limpiar();
  saveToLocalStorage();
}

function validar() {
  if (document.getElementById("gasto1").value == "") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Parece que el campo nombre del producto no está completo!",
    });
  } else if (document.getElementById("cantidad1").value == "") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Parece que el campo cantidad no está completo!",
    });
  } else if (
    document.getElementById("categoria1").value === "Otros" &&
    document.getElementById("otra-categoria").value.trim() === ""
  ) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Especifica la otra categoría!",
    });
  } else {
    registrar();
  }
}

function pintar() {
  document.getElementById("body").textContent = "";

  data.forEach((e, i) => {
    let tr = document.createElement("tr");

    let td = document.createElement("td");
    td.textContent = e.gasto;
    tr.appendChild(td);

    td = document.createElement("td");
    td.textContent = e.categoria;
    tr.appendChild(td);

    td = document.createElement("td");
    td.textContent = e.fecha;
    tr.appendChild(td);

    td = document.createElement("td");
    let button = document.createElement("button");
    button.textContent = e.cantidad.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
    button.classList.add("valor-articulo-button");
    button.disabled = true;
    td.appendChild(button);
    tr.appendChild(td);

    td = document.createElement("td");

    let editar = document.createElement("button");
    editar.textContent = "📝";
    editar.classList.add("btn-editar");
    editar.addEventListener("click", () => {
      id = i;
      document.getElementById("gasto1").value = e.gasto;
      document.getElementById("cantidad1").value = e.cantidad;
      document.getElementById("categoria1").value = e.categoria;
      document.getElementById("fecha1").value = e.fecha;
      bd = true;

      // Handle custom category
      const predefined = [
        "Alimentación",
        "Transporte",
        "Entretenimiento",
        "Salud",
        "Otros",
      ];
      if (!predefined.includes(e.categoria)) {
        document.getElementById("categoria1").value = "Otros";
        document.getElementById("otra-categoria").value = e.categoria;
        document.getElementById("otra-categoria-container").style.display =
          "block";
      } else {
        document.getElementById("otra-categoria-container").style.display =
          "none";
        document.getElementById("otra-categoria").value = "";
      }
    });
    td.appendChild(editar);

    let eliminar = document.createElement("button");
    eliminar.textContent = "❌";
    eliminar.classList.add("btn-eliminar");
    eliminar.addEventListener("click", () => {
      data.splice(i, 1);
      pintar();
      actualizarRestante();
      saveToLocalStorage();
    });
    td.appendChild(eliminar);

    let agregar = document.createElement("button");
    agregar.textContent = "➕";
    agregar.classList.add("btn-agregar");
    agregar.addEventListener("click", () => {
      Swal.fire({
        title: "Agregar cantidad adicional",
        input: "number",
        inputAttributes: {
          autocapitalize: "off",
        },
        showCancelButton: true,
        confirmButtonText: "Agregar",
        cancelButtonText: "Cancelar",
        preConfirm: (monto) => {
          if (monto && parseFloat(monto) > 0) {
            data[i].cantidad += parseFloat(monto);
            pintar();
            actualizarRestante();
            saveToLocalStorage();
          } else {
            Swal.fire("Error", "Ingresa una cantidad válida", "error");
          }
        },
      });
    });
    td.appendChild(agregar);

    tr.appendChild(td);
    document.getElementById("body").appendChild(tr);
  });
}

function actualizarRestante() {
  let totalGastos = data.reduce((total, item) => total + item.cantidad, 0);
  restante = presupuestoInicial - totalGastos;
  document.getElementById("restante").value = restante.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

  let porcentajeRestante = (restante / presupuestoInicial) * 100;
  let restanteField = document.getElementById("restante");

  if (porcentajeRestante <= 20) {
    restanteField.style.backgroundColor = "red";
  } else if (porcentajeRestante <= 50) {
    restanteField.style.backgroundColor = "orange";
  } else if (porcentajeRestante <= 70) {
    restanteField.style.backgroundColor = "yellow";
  } else {
    restanteField.style.backgroundColor = "rgb(181, 240, 220)";
  }

  // Update progress bar
  let porcentajeUsado =
    ((presupuestoInicial - restante) / presupuestoInicial) * 100;
  document.getElementById("progress-fill").style.width = porcentajeUsado + "%";
  document.getElementById("progress-text").textContent =
    porcentajeUsado.toFixed(1) + "% usado";
}

function limpiar() {
  document.getElementById("gasto1").value = "";
  document.getElementById("cantidad1").value = "";
  document.getElementById("categoria1").value = "Alimentación";
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("fecha1").value = today;
  document.getElementById("otra-categoria").value = "";
  document.getElementById("otra-categoria-container").style.display = "none";
}

function eliminarOperacion() {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esto eliminará todas las operaciones y reiniciará la página a cero.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      data = [];
      presupuestoInicial = 0;
      restante = 0;
      document.getElementById("presupuesto").value = "";
      document.getElementById("restante").value = "";
      document.getElementById("progress-fill").style.width = "0%";
      document.getElementById("progress-text").textContent = "0% usado";
      localStorage.removeItem("budgetData");
      pintar();
      Swal.fire(
        "Eliminado",
        "Todas las operaciones han sido eliminadas.",
        "success"
      ).then(() => {
        iniciarApp();
      });
    }
  });
}

function saveToLocalStorage() {
  const dataToSave = {
    data: data,
    presupuestoInicial: presupuestoInicial,
    restante: restante,
  };
  localStorage.setItem("budgetData", JSON.stringify(dataToSave));
}

document.addEventListener("DOMContentLoaded", (event) => {
  iniciarApp();
  // Set default date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("fecha1").value = today;

  // Event listener for category select
  document.getElementById("categoria1").addEventListener("change", function () {
    const container = document.getElementById("otra-categoria-container");
    if (this.value === "Otros") {
      container.style.display = "block";
    } else {
      container.style.display = "none";
      document.getElementById("otra-categoria").value = "";
    }
  });
});

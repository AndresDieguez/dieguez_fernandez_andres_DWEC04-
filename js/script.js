import '../controllers/indexcontroller.js';

// Obtener el formulario y la posición de desplazamiento para que el menu de busqueda flote se quede fijo
const formularioBusqueda = document.getElementById("formularioBusqueda");
const formularioPosicion = formularioBusqueda.offsetTop;

// Función que verifica el desplazamiento para el menu de busqueda
function controlarFijo() {
    if (window.pageYOffset > formularioPosicion) {
        // Añade la clase 'fixed' cuando el formulario llega a la parte superior
        formularioBusqueda.classList.add("fixed"); 
    } else {
        // Elimina la clase 'fixed' cuando el formulario ya no está en la parte superior
        formularioBusqueda.classList.remove("fixed"); 
    }
}


// Detectar el desplazamiento en la página para el menu de busqueda fijo
window.addEventListener("scroll", controlarFijo);

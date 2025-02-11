// Importamos la clase CardAPI
import CardAPI from '../models/CardAPI.js';

// Instanciamos la clase
const cardAPI = new CardAPI();

let currentPage = 1;
let currentQuery = "";
let titSet = document.getElementById('tituloSet')
document.getElementById("pagination").style.visibility = 'hidden';

// Obtén los parámetros 'set' y 'lang' de la URL si están presentes
const urlParams = new URLSearchParams(window.location.search);
let setQuery = urlParams.get('set');
let langQuery = urlParams.get('lang');
let searchQuery = urlParams.get('q');  

// Obtener el formulario y la posición de desplazamiento
const formularioBusqueda = document.getElementById("formularioBusqueda");
const formularioPosicion = formularioBusqueda.offsetTop;

// Función que verifica el desplazamiento para el menu de busqueda
function controlarFijo() {
    if (window.pageYOffset > formularioPosicion) {
        formularioBusqueda.classList.add("fixed"); // Añade la clase 'fixed' cuando el formulario llega a la parte superior
    } else {
        formularioBusqueda.classList.remove("fixed"); // Elimina la clase 'fixed' cuando el formulario ya no está en la parte superior
    }
}

// Si 'set' está presente en la URL, actualiza la consulta y muestra el nombre del set completo
if (setQuery) {
    currentQuery = `set:${setQuery}`;
    document.getElementById("pagination").style.visibility = 'visible';
    // Si 'lang' está presente, lo agregamos a la consulta
    if (langQuery) {
        currentQuery += `+lang:${langQuery}+order:color`;
        document.getElementById("order-select").value = 'color';
    }

    // Buscar el nombre completo del set con el  método de la clase CardApi
    (async function mostrarNombreSet() {
        try {
            const setData = await cardAPI.fetchSetByName(setQuery)
            //console.log('setQuery: ',setQuery);
            //console.log('setData',setData);
            if (setData && setData.name) {
                // Mostrar el nombre del set en el h2 con id 'tituloSet'
                titSet.innerHTML = `Set completo de ${setData.name}`;
            }
        } catch (error) {
            console.error("Error al obtener el nombre del set:", error);
            titSet.innerHTML = "Set completo";
        }
    })();

    fetchCards(currentQuery, currentPage);  // Realiza la búsqueda del set al cargar la página
} else if (searchQuery) {  // Si la URL contiene 'q', realizar la búsqueda con el query
    currentQuery = searchQuery;
    fetchCards(currentQuery, currentPage);
    document.getElementById("pagination").style.visibility = 'visible';
} else {
    // Si no hay set en la URL, inicializa currentQuery vacío para búsquedas generales
    currentQuery = "";
    // Limpia el contenido del h2 'tituloSet' si no hay búsqueda de set
    titSet.innerHTML = "";
}

// Función para obtener la lista de sets y poblar el select
// usamos el metodo de la clase que busca todos los sets
async function fetchSets() {
    try {
        //https://api.scryfall.com/sets"
        const setsCartas = await cardAPI.fetchCardsSet()
        const select = document.getElementById("set-select");
        const selectLang = document.getElementById("language-select");
        setsCartas.data.forEach(set => {
            // todo lo de art series no se juega, de momento no quiero que aparezca en el selector
            if (!set.name.includes('Art Series')) { 
            const option = document.createElement("option");
            option.value = set.code;
            option.textContent = set.name;
            select.appendChild(option);
            }           
        });

        // Si 'set' o el idioma ya está en la URL, seleccionamos el set correspondiente en su select
        if (setQuery) {
            select.value = setQuery;
        }
        if (langQuery) {
            selectLang.value = langQuery;
        }
    } catch (error) {
        console.error("Error al obtener los sets:", error);
    }
}

// Función para obtener las cartas buscadas usamos el metodo correspondiente de la clase CardApi
async function fetchCards(query, page = 1) {
    const cardsContainer = document.getElementById("cards-container");
    
    // Solo mostrar el mensaje de carga en la primera página
    if (page === 1) {
        cardsContainer.innerHTML = "<p id='loading-message'>Cargando cartas...</p>";
    }

    try {
        const cartasBuscadas = await cardAPI.searchCards(query,page);
        console.log('datos de la consulta clase: ',cartasBuscadas);
        console.log('cartas encontradas', cartasBuscadas.total_cards);
        // Eliminar el mensaje de carga si está presente
        const loadingMessage = document.getElementById("loading-message");

        if (loadingMessage) loadingMessage.remove();

        cartasBuscadas.data.forEach(card => {
            const col = document.createElement("div");
            col.classList.add("col-sm-6", "col-md-4", "col-lg-3", "mtg-card");

            let imageSrc = card.image_uris ? card.image_uris.normal : "../imagenes/sinimagen.jpg";

            if (card.layout === "transform" || card.layout === "modal_dfc" || card.layout === "art_series" || card.layout =="double_faced_token") {
                imageSrc = card.card_faces[0].image_uris?.normal;

                col.innerHTML = `
                <div class="card-container">
                    <div class="card" style="min-height: 400px;">
                        <div class="front">
                            <a href="../interfaces/card.html?id=${card.id}&lang=${langQuery}" class="card-link">
                                <img src="${imageSrc}" alt="${card.name}" class="card-img-top">
                            </a>
                        </div>
                        <div class="back">
                            <a href="../interfaces/card.html?id=${card.id}&lang=${langQuery}" class="card-link">
                                <img src="${card.card_faces[1].image_uris?.normal || '../imagenes/sinimagen.jpg'}" class="card-img-top">
                            </a>
                        </div>
                        <div class="flip-icon"><img src="../imagenes/wing.png" alt="Voltear carta"></div>
                    </div>
                </div>`;

                const flipIcon = col.querySelector('.flip-icon');
                const cardElement = col.querySelector('.card');

                flipIcon.addEventListener('click', function () {
                    cardElement.classList.toggle('flipped');
                });
            } else {
                col.innerHTML = `
                <div class="card shadow-sm">
                    <a href="../interfaces/card.html?id=${card.id}&lang=${langQuery}" class="card-link">
                        <img src="${imageSrc}" alt="${card.name}" class="card-img-top">
                    </a>
                </div>`;
            }

            cardsContainer.appendChild(col);
        });

        document.getElementById("pagination").style.display = cartasBuscadas.has_more ? "block" : "none";
    } catch (error) {
        console.error("Error al obtener las cartas:", error);
        cardsContainer.innerHTML = "<h2 class='text-center'>Rayos!!! No hay resultados, prueba otra cosa</h2>";
        cardsContainer.innerHTML += '<img style="max-width:50%; margin:15px auto;" src="imagenes/lo-siento.jpg" alt="cartas no disponibles">';
        document.getElementById("pagination").style.visibility = 'hidden';
    }
}
// funcion para cargar las estadisticas tras el formulario
async function cargarEstadisticas() {
    try {
        const cardNames = await cardAPI.fetchCardNames()
        count(cardNames.total_values, 'total-cards');

        const setsData = await cardAPI.fetchCardsSet()
        count(setsData.data.length, 'total-sets');

        const latestSetElement = document.getElementById('latest-set');
        if (latestSetElement) {
            latestSetElement.textContent = setsData.data[0].name;
        }
    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
    }
}
// funciona para animar el conteo
function count(numero, selector) {
    let counter = { value: 0 };
    let element = document.getElementById(selector);
    
    if (!element) return; // Evita errores si el elemento no existe

    gsap.to(counter, {
        duration: 3,
        value: numero,
        onUpdate: function () {
            let number = Math.ceil(counter.value);
            element.textContent = number;
        },
        ease: "circ.out"
    });
}

// Función para obtener las cartas aleatorias usando la clase CardAPI
async function obtenerCartasAleatorias() {
    const container = document.getElementById("random-cards-container");

    // Limpiar el contenedor antes de agregar nuevas cartas
    container.innerHTML = "";

    try {
        // Crear un array de promesas para obtener 6 cartas aleatorias en paralelo
        const promises = Array.from({ length: 6 }, () => cardAPI.fetchRandomCard());
        const cards = await Promise.all(promises);

        // Procesar y mostrar las cartas obtenidas
        cards.forEach(function (card, index) {
            container.innerHTML += `
                <div class="card-mano-${index} card-mano">
                    <a href="../interfaces/card.html?id=${card.id}" class="card-link">
                        <img src="${card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '../imagenes/sinimagen.jpg'}" class="card-img-top" alt="${card.name}">
                    </a>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error al obtener cartas aleatorias:", error);
        container.innerHTML = '<p>Error al cargar las cartas. Por favor, intente nuevamente más tarde.</p>'; // Mensaje de error para el usuario
    }
}


// formulario de búsqueda
document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const searchInput = document.getElementById("search-input").value.trim();
    const setValue = document.getElementById("set-select").value;
    const formatValue = document.getElementById("format-select").value;
    const orderValue = document.getElementById("order-select").value;
    const directionValue = document.getElementById("direction-select").value;
    const languageValue = document.getElementById("language-select").value;
    document.getElementById("pagination").style.visibility = 'visible';

    let query = "";

    if (searchInput) query = encodeURIComponent(searchInput);
    if (setValue) query += `+set:${encodeURIComponent(setValue)}`;
    if (formatValue) query += `+f%3A${encodeURIComponent(formatValue)}`;
    if (orderValue) query += `+order:${encodeURIComponent(orderValue)}`;
    if (directionValue) query += `+direction:${encodeURIComponent(directionValue)}`;
    if (languageValue && languageValue !== 'es') query += `+lang%3A${encodeURIComponent(languageValue)}`;
    else if (languageValue === 'es') query += `+lang%3Aes`;

    if (!query) {
        query = "";
    }
    console.log('busqueda realizada: ',query);
    document.getElementById("cards-container").innerHTML = "";
    document.getElementById("pagination").style.display = "block";

    currentQuery = query;
    currentPage = 1;
    fetchCards(currentQuery, currentPage);

    titSet.innerHTML = "";
});

// Detectar el desplazamiento en la página para el menu de busqueda fijo
window.addEventListener("scroll", controlarFijo);

// cargamos estadisticas
document.addEventListener("DOMContentLoaded", cargarEstadisticas);

// Ejecutar la función de obeter cartas aleatorias cuando la página se cargue 
// y cuando el usuario vuelva con "Atrás"
if (!setQuery){
    document.addEventListener("DOMContentLoaded", obtenerCartasAleatorias);
    window.addEventListener("pageshow", obtenerCartasAleatorias);
}
// Cargar más cartas al hacer clic
document.getElementById("load-more").addEventListener("click", function () {
    currentPage++;
    fetchCards(currentQuery, currentPage);
});

// Llamar a la función para cargar los sets al inicio
document.addEventListener("DOMContentLoaded", fetchSets);

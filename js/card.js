// Importamos la clase CardAPI
import CardAPI from '../models/CardAPI.js';

// Instanciamos la clase
const cardAPI = new CardAPI();

// Obtener el ID de la carta desde la URL
const urlParams = new URLSearchParams(window.location.search);
const cardId = urlParams.get('id');

async function cargarDetalleCarta() {
  if (!cardId) {
      console.error('No se proporcionó un ID de carta en la URL.');
      document.getElementById('card-details').innerHTML = '<p class="text-danger">Error: No se encontró un ID de carta válido.</p>';
      return;
  }

  try {
      // Esperamos a que se obtengan los datos de la API, 
      // obtenemos todos los detalles que necesitamos de la carta instanciando la clase con new CardAPI() 
      // la guardamos en const carta.
      // https://api.scryfall.com/cards/${id}
      const carta = await cardAPI.fetchCardDetails(cardId);      
      renderCardDetails(carta); // Renderizamos los detalles de la carta
  } catch (error) {
      console.error('Error al cargar los detalles de la carta:', error);
      document.getElementById('card-details').innerHTML = '<p class="text-danger">Error al cargar los datos de la carta.</p>';
  }
}

// Función para renderizar los detalles de la carta, cambiado el texto de coste por iconos
// cojemos el precio del json en idioma ingles pues solo viene ahí
// cambiamos la fecha a formato español
// añadimos la funcionalidad de voltear la carta si contiene dos caras
// generamos los enlaces de interés
// llamamos a la funcion que crea la grafica
function renderCardDetails(carta) {
  const cardDetails = document.getElementById('card-details');
  if (!cardDetails) {
    console.error('No se encontró el contenedor "card-details" en el DOM.');
    return;
  }
  console.log("Datos de la carta:", carta);
   // cambiamos la fecha a formato española
  let fecha = new Date(carta.released_at);
  let fechaEspañola = fecha.toLocaleDateString("es-ES");

  let cardText = `
    <h2>${carta.printed_name || carta.name}</h2>
    <p><strong>Artista:</strong> ${carta.artist || 'Desconocido'}</p>
    <p><strong>Tipo:</strong> ${carta.printed_type_line || carta.type_line || 'No especificado'}</p>
    <p><strong>Coste:</strong> ${convertManaToIcons(carta.mana_cost)}</p>
    <p><strong>Texto de la carta:</strong> ${carta.printed_text || carta.oracle_text || 'No disponible'}</p>
    <p><strong>Rareza:</strong> ${carta.rarity || 'No especificado'}</p>
    <p><strong>Set: </strong><a href="../index.html?set=${carta.set}&lang=${carta.lang}" class="set-link">${carta.set_name || 'No especificado'}</a> (Sigue el enlace para ver el set completo)</p>
    <p><strong>Fecha de lanzamiento:</strong> ${fechaEspañola || 'No disponible'}</p>
    <p><strong>Precio aproximado:</strong> <span id="card-price">Cargando...</span></p>
    <p id="cardmarket-link"></p>
  `;

  if (carta.legalities) {
    cardText += `<h3 class="mb-3 mt-3">Legal en los siguientes formatos:</h3>`;
  }

  for (let formato in carta.legalities) {
    if (carta.legalities[formato] != `not_legal`) {
      cardText += `<span class="formato-legal">${formato}</span> `;
    }
  }

  let cardHTML = '';

  if (carta.card_faces) {
    const frontImage = carta.card_faces[0].image_uris?.normal || '../imagenes/sinimagen.jpg';
    const backImage = carta.card_faces[1]?.image_uris?.normal || '../imagenes/sinimagen.jpg';

    cardHTML = `
      <div class="col-12 col-md-6 col-lg-4 card-container">
        <div class="card-flip" id="flip-card">
          <div class="card-front">
            <img src="${frontImage}" alt="${carta.name}" class="card-img-top">
          </div>
          <div class="card-back">
            <img src="${backImage}" alt="Reverso de la carta" class="card-img-top">
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-8 card-details">
        ${cardText}
        <div class="flip-icon">
          <img src="../imagenes/wing.png" alt="Voltear carta"> <span>Voltear carta</span>
        </div>
      </div>
    `;
  } else {
    const imageUrl = carta.image_uris?.normal || '../imagenes/sinimagen.jpg';

    cardHTML = `
      <div class="col-12 col-md-6 col-lg-4 card-container">
        <div class="card shadow-sm">
          <img src="${imageUrl}" alt="${carta.name}" class="card-img-top">
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-8 card-details">
        ${cardText}
      </div>
    `;
  }

  cardDetails.innerHTML = cardHTML;

  // Funcionalidad para voltear la carta si es transformable
  if (carta.layout === "transform" && carta.card_faces) {
    const flipCard = document.getElementById('flip-card');
    const flipIcon = document.querySelector('.flip-icon');

    if (flipCard && flipIcon) {
      flipIcon.addEventListener('click', () => flipCard.classList.toggle('flipped'));
    }
  }

  // Comprobamos si existen los Enlaces de interés y los insertamos
  if (carta.related_uris) {
    let enlaces = '<h3>Enlaces de interés:</h3><ul>';
  
    if (carta.related_uris.gatherer) {
      enlaces += `<li><strong>Detalles en Gatherer (base de datos oficial):</strong> <a href="${carta.related_uris.gatherer}" target="_blank">Ver en Gatherer</a></li>`;
    }
  
    if (carta.related_uris.tcgplayer_infinite_articles) {
      enlaces += `<li><strong>Artículos en TCGPlayer:</strong> <a href="${carta.related_uris.tcgplayer_infinite_articles}" target="_blank">Leer artículos en TCGPlayer</a></li>`;
    }
  
    if (carta.related_uris.tcgplayer_infinite_decks) {
      enlaces += `<li><strong>Mazos en TCGPlayer que contienen esta carta:</strong> <a href="${carta.related_uris.tcgplayer_infinite_decks}" target="_blank">Ver mazos en TCGPlayer</a></li>`;
    }
  
    if (carta.related_uris.edhrec) {
      enlaces += `<li><strong>Estrategias y combos en EDHREC:</strong> <a href="${carta.related_uris.edhrec}" target="_blank">Explorar en EDHREC</a></li>`;
    }
  
    enlaces += '</ul>';
    document.getElementById('enlaces-interes').innerHTML = enlaces;
  }
  // Obtener el precio en el idiom inglés pues solo viene en ese idioma y no en resto
  buscarPrecioIngles(carta.set, carta.name);

}

function convertManaToIcons(manaCost) {
  // Si no se especifica coste de maná, devolvemos un mensaje
  if (!manaCost) return "No especificado";

  return manaCost.replace(/\{([^}]+)\}/g, (match, symbol) => {
    // Sanitizamos el símbolo eliminando la barra (si existe) y convertimos a mayúsculas
    const sanitizedSymbol = symbol.replace('/', '').toUpperCase();

    // Generamos la URL de la imagen para el símbolo de maná
    const imgUrl = `https://svgs.scryfall.io/card-symbols/${sanitizedSymbol}.svg`;

    // Devolvemos la etiqueta de imagen
    return `<img src="${imgUrl}" alt="${symbol}" title="${symbol}" class="mana-icon">`;
  });
}

// Función para obtener el precio de la carta en inglés pues en otros idiomas no vienen los precios
async function buscarPrecioIngles(set, name) {

  try {

    const cartaEnIngles = await cardAPI.fetchPriceInEnglish(set, name);
    console.log("Datos en inglés de la carta:", cartaEnIngles);

    const priceElement = document.getElementById('card-price');
    const cardmarketElement = document.getElementById('cardmarket-link');

    if (cartaEnIngles.prices?.eur) {
      priceElement.textContent = `${cartaEnIngles.prices.eur} €`;
    } else {
      priceElement.textContent = 'No disponible';
    }

    if (cartaEnIngles.purchase_uris?.cardmarket) {
      cardmarketElement.innerHTML = `
        <a href="${cartaEnIngles.purchase_uris.cardmarket}" target="_blank" class="btn btn-primary mt-2">
          Cómprala en Cardmarket
        </a>
      `;
    }

    // Llamada a la función de generar gráfica
    generateCardChart(cartaEnIngles);
    // añadimos el boton de otra busqueda
    document.getElementById('otra-busqueda').innerHTML= '<a href="../index.html" class="btn btn-primary">Hacer otra búsqueda</a>'
  } catch (error) {
    console.error('Error al obtener el precio en inglés:', error);
    document.getElementById('card-price').textContent = 'No disponible';
  }
}

// Función para generar la gráfica con chart.js
function generateCardChart(carta) {
  const ctx = document.getElementById('cardChart').getContext('2d');
  console.log('Precios de la carta:', carta.prices);
  let tix = document.getElementById('tix');
  let tixHTML = '*TIX es una <strong>moneda virtual</strong> utilizada en plataformas de intercambio de cartas como Magic: The Gathering.';
  tixHTML += '<br>Se utiliza en el mercado de <strong>Magic Online</strong> y tiene un valor variable, similar a otras monedas virtuales, pero su valor es específico dentro de la economía del juego.';
  tixHTML += '<br>No tiene un valor fijo en el mundo real y se utiliza para comprar cartas dentro del ecosistema de Magic Online';
  tix.innerHTML = tixHTML;

  const chartData = {
    labels: ['USD', 'EUR', 'TIX'], // Precios en USD, EUR y TIX
    datasets: [{
      label: 'Precios de la carta',
      data: [
        carta.prices?.usd || 0,
        carta.prices?.eur || 0,
        carta.prices?.tix || 0
      ], // Precios de la carta
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(75, 192, 192, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false // Esto oculta la leyenda y su cuadro de color
      }
    }
  };

  new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: chartOptions
  });
}

// Llamamos a la función asíncrona
document.addEventListener("DOMContentLoaded", cargarDetalleCarta);


// Importamos la clase CardAPI y la clase Card
import CardAPI from '../models/CardAPI.js';
import Card from '../models/Card.js';

// Instanciamos la clase CardApi
const cardAPI = new CardAPI();

// Obtener el ID de la carta desde la URL
const urlParams = new URLSearchParams(window.location.search);
const cardId = urlParams.get('id');

async function cargarDetalleCarta() {
  if (!cardId) {
      console.error('no se proporcionó un ID de carta en la URL.');
      document.getElementById('card-details').innerHTML = '<p class="text-danger">Error: No se encontró un ID de carta válido.</p>';
      return;
  }

  try {
      // Esperamos a que se obtengan los datos de la API, llamamos al metodo fetchCardDetails(cardId) con parametro id de la carta
      // guardamos los datos de json obtenido en la varible data que vamos a pasar como parametro para crear un objeto Card
      // llamamos al Método estático fromAPI(data) que crea una instancia de Card desde los datos (data) de la API

      const data = await cardAPI.fetchCardDetails(cardId);  // https://api.scryfall.com/cards/${id}
      const carta = Card.fromAPI(data);  

      renderCardDetails(carta,data); // Renderizamos los detalles de la carta

  } catch (error) {
      console.error('Error al cargar los detalles de la carta:', error);
      document.getElementById('card-details').innerHTML = '<p class="text-danger">Error al cargar los datos de la carta.</p>';
  }
}

// Función para renderizar los detalles de la carta, cambiado el texto del coste por iconos
// cojemos el precio del json en idioma ingles pues solo viene ahí
// cambiamos la fecha a formato español
// mostramos los formatos en los que es legal la carta
// añadimos la funcionalidad de voltear la carta si contiene dos caras
// generamos los enlaces de interés
// llamamos a la funcion que crea la grafica
function renderCardDetails(carta,data) {
  console.log("Datos de la carta:", data);
  const cardDetails = document.getElementById('card-details');
  
  // mostramos los detalles principales de la carta
  let cardText = carta.toHTML();

  // mostramos si la carta no se juega o los formatos en los que es legal la carta
  if (carta.legalities && carta.layout != "token" && carta.layout != "art_series" && carta.layout != "emblem" && carta.layout != "emblem") {
    cardText += `<h3 class="mb-3 mt-3">Legal en los siguientes formatos:</h3>`;
  } else {
    cardText += `<h3 class="mb-3 mt-3">Esta carta No se juega</h3>`;
  }

  for (let formato in carta.legalities) {
    if (carta.legalities[formato] != `not_legal`) {
      cardText += `<span class="formato-legal">${formato}</span> `;
    }
  }

 // añadimos funcionalidades e imagenes, voltear cartas, precios, enlaces y grafica
  let cardHTML = '';

  if (data.card_faces) {
    const frontImage = data.card_faces[0].image_uris?.normal || '../imagenes/sinimagen.jpg';
    const backImage = data.card_faces[1]?.image_uris?.normal || '../imagenes/sinimagen.jpg';

    cardHTML = `
      <div class="col-12 col-md-6 col-lg-4 card-container">
        <div class="card-flip" id="flip-card">
          <div class="card-front">
            <img src="${frontImage}" alt="${data.name}" class="card-img-top img-fluid">
          </div>
          <div class="card-back">
            <img src="${backImage}" alt="Reverso de la carta" class="card-img-top img-fluid">
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-8 card-details">      
        ${cardText}
        <div class="flip-icon-detalle">
          <img src="../imagenes/wing.png" alt="Voltear carta"> <span>Voltear carta</span>
        </div> 
      </div>
    `;
  } else {
    const imageUrl = data.image_uris?.normal || '../imagenes/sinimagen.jpg';

    cardHTML = `
      <div class="col-12 col-md-6 col-lg-4 card-container">
        <div class="card shadow-sm">
          <img src="${imageUrl}" alt="${data.name}" class="card-img-top">
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-8 card-details">
        ${cardText}
      </div>
    `;
  }

  cardDetails.innerHTML = cardHTML;

  // Funcionalidad para voltear la carta si es transformable
  if (data.card_faces) {
    const flipCard = document.getElementById('flip-card');
    const flipIcon = document.querySelector('.flip-icon-detalle');

    if (flipCard && flipIcon) {
      flipIcon.addEventListener('click', () => flipCard.classList.toggle('flipped'));
    }
  }

  // Obtener el precio en el idiom inglés pues solo viene en ese idioma y no en resto
  if(data.layout != "art_series"){
    buscarPrecioIngles(data.set, data.name);
  } else {
    document.getElementById('card-price').textContent ='No hay datos del precio'
  }

  // Comprobamos si existen los Enlaces de interés y los insertamos
  if (data.related_uris) {
    let enlaces = '<h3>Enlaces de interés:</h3><ul>';
  
    if (data.related_uris.gatherer) {
      enlaces += `<li><strong>Detalles en Gatherer (base de datos oficial):</strong> <a href="${data.related_uris.gatherer}" target="_blank">Ver en Gatherer</a></li>`;
    }
  
    if (data.related_uris.tcgplayer_infinite_articles) {
      enlaces += `<li><strong>Artículos en TCGPlayer:</strong> <a href="${data.related_uris.tcgplayer_infinite_articles}" target="_blank">Leer artículos en TCGPlayer</a></li>`;
    }
  
    if (data.related_uris.tcgplayer_infinite_decks) {
      enlaces += `<li><strong>Mazos en TCGPlayer que contienen esta carta:</strong> <a href="${data.related_uris.tcgplayer_infinite_decks}" target="_blank">Ver mazos en TCGPlayer</a></li>`;
    }
  
    if (data.related_uris.edhrec) {
      enlaces += `<li><strong>Estrategias y combos en EDHREC:</strong> <a href="${data.related_uris.edhrec}" target="_blank">Explorar en EDHREC</a></li>`;
    }
  
    enlaces += '</ul>';
    document.getElementById('enlaces-interes').innerHTML = enlaces;
  }

}

// Función para obtener precios de la carta en inglés pues en otros idiomas no vienen los precios
// y el enlace al mercado Cardmarket
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
    console.error('Error no se ha podido obtener el precio', error);
    document.getElementById('card-price').textContent = 'No disponible';
  }
}

// Función para generar la gráfica con chart.js
function generateCardChart(carta) {
  const ctx = document.getElementById('cardChart').getContext('2d');
  console.log('Precios de la carta:', carta.prices);

  document.getElementById('titulo-grafica').textContent = 'Precio de la Carta en Diferentes Monedas-Mercados'
  let tix = document.getElementById('tix');
  let tixHTML = '*TIX es una <strong>moneda virtual</strong> utilizada en plataformas de intercambio de cartas como Magic: The Gathering.';
  tixHTML += '<br>Se utiliza en el mercado de <strong>Magic Online</strong> y tiene un valor variable, similar a otras monedas virtuales, pero su valor es específico dentro de la economía del juego.';
  tixHTML += '<br>No tiene un valor fijo en el mundo real y se utiliza para comprar cartas dentro del ecosistema de Magic Online';
  tix.innerHTML = tixHTML;

  // Inicializamos etiquetas y datos con USD, EUR y TIX
  const labels = ['USD', 'USD Foil', 'EUR', 'EUR Foil', 'TIX'];
  const data = [
    carta.prices?.usd || 0,
    carta.prices?.usd_foil ? parseFloat(carta.prices.usd_foil) : null, // Solo si existe
    carta.prices?.eur || 0,
    carta.prices?.eur_foil ? parseFloat(carta.prices.eur_foil) : null, // Solo si existe
    carta.prices?.tix || 0
  ];

  // Filtramos los valores nulos para evitar problemas en la gráfica
  const filteredLabels = [];
  const filteredData = [];
  const backgroundColors = [];
  const borderColors = [];

  const colors = [
    { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },  // USD
    { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' },  // USD Foil
    { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },  // EUR
    { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },  // EUR Foil
    { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' }  // TIX
  ];

  // Filtramos los datos para que solo se agreguen los valores existentes
  data.forEach((value, index) => {
    if (value !== null) {
      filteredLabels.push(labels[index]);
      filteredData.push(value);
      backgroundColors.push(colors[index].bg);
      borderColors.push(colors[index].border);
    }
  });

  const chartData = {
    labels: filteredLabels,
    datasets: [{
      label: 'Precios de la carta',
      data: filteredData,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
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
        display: false // Oculta la leyenda y su cuadro de color
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


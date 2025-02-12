// Función para renderizar los detalles de la carta, cambiado el texto del coste por iconos
// mostramos los formatos en los que es legal la carta
// añadimos la funcionalidad de voltear la carta si contiene dos caras
// añadimos la funcionalidad de enlaces de interes para la carta mostrada
export function renderCardDetails(carta, data) {
    console.log("Datos de la carta:", data);
    const cardDetails = document.getElementById("card-details");

    // mostramos los detalles principales de la carta
    let cardText = carta.toHTML();

    // mostramos si la carta no se juega o los formatos en los que es legal la carta
    if (carta.legalities && carta.layout != "token" && carta.layout != "art_series" && carta.layout != "emblem") {
        cardText += `<h3 id ="textos-legal" class="mb-3 mt-3">Legal en los siguientes formatos:</h3>`;
    } else {
        cardText += `<h3 class="mb-3 mt-3">Esta carta, es de arte o se trata de un Token/Emblema</h3>`;
    }

    let esIlegalEnTodos = true;
    for (let formato in carta.legalities) {
        if (carta.legalities[formato] != `not_legal`) {
            cardText += `<span class="formato-legal">${formato}</span> `; 
            esIlegalEnTodos = false;          
        }
    }
    if (esIlegalEnTodos) {
      cardText += `<span class="formato-ilegal">Esta carta no se juega o NO se considera como LEGAL en ningún formato</span>`;
    }
    // añadimos funcionalidades, voltear cartas e imagenes, precios, enlaces y grafica
    let cardHTML = "";

    if (data.card_faces) {
        const frontImage =
            data.card_faces[0].image_uris?.normal || "../imagenes/sinimagen.jpg";
        const backImage =
            data.card_faces[1]?.image_uris?.normal || "../imagenes/sinimagen.jpg";

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
        const imageUrl = data.image_uris?.normal || "../imagenes/sinimagen.jpg";

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
    
    // Funcionalidad para voltear la carta si tiene varias caras
    if (data.card_faces) {
        const flipCard = document.getElementById("flip-card");
        const flipIcon = document.querySelector(".flip-icon-detalle");

        if (flipCard && flipIcon) {
            flipIcon.addEventListener("click", () =>
                flipCard.classList.toggle("flipped")
            );
        }
    }

    // Comprobamos si existen Enlaces de interés a la carta que estamos viendo y los insertamos
    if (data.related_uris) {
        let enlaces = "<h3>Enlaces de interés:</h3><ul>";

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

        enlaces += "</ul>";
        document.getElementById("enlaces-interes").innerHTML = enlaces;
    }
}

// Función para obtener precios de la carta en inglés (en otros idiomas no vienen los precios)
// y el enlace al mercado Cardmarket para la compra de la carta que estamos visualizando
export async function buscarPrecioIngles(cartaEnIngles) {

    try {
  
      //const cartaEnIngles = await cardAPI.fetchPriceInEnglish(set, name);
      console.log("Datos en inglés de la carta:", cartaEnIngles);
  
      const priceElement = document.getElementById('card-price');
      const cardmarketElement = document.getElementById('cardmarket-link');
      let existePrecio = true;
      if (cartaEnIngles.prices?.eur) {
        priceElement.textContent = `${cartaEnIngles.prices.eur} €`;
      } else if (cartaEnIngles.prices?.eur_foil) {
        priceElement.textContent = `${cartaEnIngles.prices.eur_foil} €`; 
      } else if (cartaEnIngles.prices?.usd_foil) {
        priceElement.textContent = `${cartaEnIngles.prices.usd_foil} €`;
      } else {
        priceElement.textContent = 'No disponemos de precios para esta carta, puedes mirar en Cardmarket';
        existePrecio = false;
      }
  
      if (cartaEnIngles.purchase_uris?.cardmarket) {
        cardmarketElement.innerHTML = `
          <a href="${cartaEnIngles.purchase_uris.cardmarket}" target="_blank" class="btn btn-primary mt-2">
            Cómprala en Cardmarket
          </a>
        `;
      }
  
      // Llamada a la función de pintar gráfica
      if (existePrecio){
        generateCardChart(cartaEnIngles);
      } else {
        document.getElementById('cardChart').style.display = 'none';
      }
      
      // añadimos el boton de otra busqueda
      document.getElementById('otra-busqueda').innerHTML= '<a href="../index.html" class="btn btn-primary">Hacer otra búsqueda</a>'
    } catch (error) {
      console.error('Error no se ha podido obtener el precio', error);
      document.getElementById('card-price').textContent = 'No disponemos de precios para esta carta, puedes mirar en Cardmarket';
    }
  }

// Función para pintar la gráfica con chart.js
function generateCardChart(carta) {
    const ctx = document.getElementById('cardChart').getContext('2d');
    //console.log('Precios de la carta:', carta.prices);
  
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
          display: false // Oculta la leyenda, no hace falta...
        }
      }
    };
  
    new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    });
  }
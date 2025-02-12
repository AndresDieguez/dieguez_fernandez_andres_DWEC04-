import CardAPI from '../models/CardAPI.js';
import Card from '../models/Card.js';
import { renderCardDetails, buscarPrecioIngles, generateCardChart} from '../views/CardView.js';

const cardAPI = new CardAPI();
const urlParams = new URLSearchParams(window.location.search);
const cardId = urlParams.get('id');

async function cargarDetalleCarta() {
    if (!cardId) {
        console.error('No se proporcionó un ID de carta en la URL.');
        renderCardDetails.mostrarError('No se encontró un ID de carta válido.'); // Asegurándote de que mostrarError es parte de CardView
        return;
    }

    try {
        const data = await cardAPI.fetchCardDetails(cardId);
        const carta = Card.fromAPI(data);
        renderCardDetails(carta, data); 
        if (carta.layout != "art_series") {
            const cartaEnIngles = await cardAPI.fetchPriceInEnglish(carta.set, carta.name);
            buscarPrecioIngles(cartaEnIngles);
        } else {
            document.getElementById("card-price").textContent = "No disponemos de precios para esta carta, puedes mirar en Cardmarket";
        }
    } catch (error) {
        console.error('Error al cargar los detalles de la carta:', error);
        renderCardDetails.mostrarError('Error al cargar los datos de la carta.');
    }

    // Obtener el precio en el idiom inglés pues solo viene en ese idioma y no en resto
    
}

document.addEventListener('DOMContentLoaded', cargarDetalleCarta);


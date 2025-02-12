class CardAPI {
  
    constructor(baseURL = 'https://api.scryfall.com/') {
        this.baseURL = baseURL; 
    }
    
    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`);
            if (!response.ok) throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Error en la solicitud a ${endpoint}:`, error);
            return { status: "error", message: error.message, details: error.stack };
        }
    }
    // método para obtener detalles de una carta pediante su id
    async fetchCardDetails(id) {
        return this.fetchData(`cards/${id}`);
    }
    // método para obtener ciertos detalles en ingles como el precio no disponible en otros idiomas
    async fetchPriceInEnglish(set, name) {
        return this.fetchData(`cards/named?set=${encodeURIComponent(set)}&exact=${encodeURIComponent(name)}&lang=en`);
    }
    // método para detalles del set
    async fetchCardsSet() {
        return this.fetchData('sets');
    }
    // método para catalogo de cartas
    async fetchCardNames() {
        return this.fetchData('catalog/card-names');
    }
    // método para detalles del set y nombre
    async fetchSetByName(setQuery) {
        return this.fetchData(`sets/${encodeURIComponent(setQuery)}`);
    }
    // método para buscar cartas
    async searchCards(query, page = 1) {
        return this.fetchData(`cards/search?q=${query}&page=${page}`);
    }

    // método para Obtener una carta aleatoria
    async fetchRandomCard() {
        return this.fetchData('cards/random');
    }
    
}

export default CardAPI;


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

    async fetchCardDetails(id) {
        return this.fetchData(`cards/${id}`);
    }

    async fetchPriceInEnglish(set, name) {
        return this.fetchData(`cards/named?set=${encodeURIComponent(set)}&exact=${encodeURIComponent(name)}&lang=en`);
    }

    async fetchCardsSet() {
        return this.fetchData('sets');
    }

    async fetchCardNames() {
        return this.fetchData('catalog/card-names');
    }

    async fetchSetByName(setQuery) {
        return this.fetchData(`sets/${encodeURIComponent(setQuery)}`);
    }

    async searchCards(query, page = 1) {
        return this.fetchData(`cards/search?q=${query}&page=${page}`);
    }

    // Obtener una carta aleatoria
    async fetchRandomCard() {
        return this.fetchData('cards/random');
    }
    
}

export default CardAPI;


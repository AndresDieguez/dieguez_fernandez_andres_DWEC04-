class CardAPI {
    static baseURL = 'https://api.scryfall.com/';

    async fetchData(endpoint) {
        const url = `${CardAPI.baseURL}${endpoint}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Error en la solicitud a ${url}:`, error);
            return { status: "error", message: error.message };
        }
    }

    async fetchCardDetails(id) {
        return this.fetchData(`cards/${id}`);
    }

    async fetchPriceInEnglish(set, name) {
        return this.fetchData(`cards/named?set=${set}&exact=${encodeURIComponent(name)}&lang=en`);
    }

    async fetchCardsSet() {
        return this.fetchData('sets/');
    }

    async fetchCardNames() {
        return this.fetchData('catalog/card-names/');
    }

    async buscarNombreSet(setQuery) {
        return this.fetchData(`sets/${setQuery}`);
    }

    async buscarCartas(query, page = 1) {
        return this.fetchData(`cards/search?q=${query}&page=${page}`);
    }

    // Obtener una carta aleatoria
    async cartasRamdon() {
        return this.fetchData('cards/random');
    }
    
}

export default CardAPI;
// Método para buscar un set por su identificador


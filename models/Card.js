class Card {
    constructor(name, artist, type, manaCost, text, rarity, set, setName, lang, legalities, layout, releaseDate) {
        this.name = name;
        this.artist = artist;
        this.type = type;
        this.manaCost = manaCost;
        this.text = text;
        this.rarity = rarity;
        this.set = set;
        this.setName = setName;
        this.lang = lang;
        this.legalities = legalities;
        this.layout = layout;
        this.releaseDate = new Date(releaseDate).toLocaleDateString("es-ES"); // Formato español
    }

    // Método estático para crear una instancia de Card desde los datos de la API
    // data es el json de la api
    static fromAPI(data) {
        return new Card(
            data.printed_name || data.name,
            data.artist || "Desconocido",
            data.printed_type_line || data.type_line || "No especificado",
            data.mana_cost || "No especificado",
            data.printed_text || data.oracle_text || "No disponible",
            data.rarity || "No especificado",
            data.set,
            data.set_name || "No especificado",
            data.lang || "No especificado",
            data.legalities || "No disponible",
            data.layout || "No disponible",
            data.released_at || "No disponible"
            
        );
    }

    // Método para convertir el coste de maná en iconos
    convertManaToIcons() {
        // Si no se especifica coste de maná, devolvemos un mensaje
        if (!this.manaCost) return "Sin coste de mana (tierras) o No especificado";
        return this.manaCost.replace(/\{([^}]+)\}/g, (match, symbol) => {
            // Sanitizamos el símbolo eliminando la barra (si existe) y convertimos a mayúsculas
            const sanitizedSymbol = symbol.replace("/", "").toUpperCase();
            // Generamos la URL de la imagen para el símbolo de maná
            const imgUrl = `https://svgs.scryfall.io/card-symbols/${sanitizedSymbol}.svg`;
            // Devolvemos la etiqueta de imagen
            return `<img src="${imgUrl}" alt="${symbol}" title="${symbol}" class="mana-icon">`;
        });
    }

    // Método para generar HTML con los datos de la carta
    toHTML() {
        return `
            <h2>${this.name}</h2>
            <p><strong>Artista:</strong> ${this.artist}</p>
            <p><strong>Tipo:</strong> ${this.type}</p>
            <p><strong>Coste:</strong> ${this.convertManaToIcons()}</p>
            <p><strong>Texto de la carta:</strong> ${this.text}</p>
            <p><strong>Rareza:</strong> ${this.rarity}</p>
            <p><strong>Set: </strong><a href="../index.html?set=${this.set}&lang=${this.lang}" class="set-link">${this.setName || 'No especificado'}</a> 
                (Sigue el enlace para ver el set completo)
            </p>
            <p><strong>Fecha de lanzamiento:</strong> ${this.releaseDate}</p>
            <p><strong>Precio aproximado:</strong> <span id="card-price">Cargando...</span></p>
            <p id="cardmarket-link"></p>
        `;
    }
}

export default Card;

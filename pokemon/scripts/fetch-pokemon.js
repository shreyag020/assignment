'use strict'

// Save todos to localStorage
const savePokemons = (pokemons) => {
    localStorage.setItem('pokemons', JSON.stringify(pokemons))
}

// Fetch existing todos from localStorage
const getSavedPokemons = () => {
    const pokemonsJSON = localStorage.getItem('pokemons');
    try {
        return pokemonsJSON ? JSON.parse(pokemonsJSON) : []
    } catch (e) {
        return []
    }
}

//API call to fetch all pokemon types
var getPokemonTypes = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://pokeapi.co/api/v2/type/");
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
});

// Render pokemon types in dropdown
var createSelectOptions = function () {
    getPokemonTypes
        .then(function (fulfilled) {
            var types = fulfilled.results;
            const typeDD = document.querySelector('#search-type');
            for (var i = 0; i <= types.length - 1; i++) {
                var option = document.createElement('option');
                option.value = types[i].name;
                option.innerHTML = types[i].name.toUpperCase();
                typeDD.appendChild(option);
            }
        })
        .catch(function (error) {
            console.log(error.message);
        });
};

createSelectOptions();

//API call to fetch all pokemon
var getPokemonList = fetch("https://pokeapi.co/api/v2/pokemon/?limit=100").then(res => res.json());

//API call to fetch all pokemon details
var getPokemonListDetails = getPokemonList.then(list => {
    return Promise.all(list.results.map(pokemon => {
        return fetch(pokemon.url).then(res => res.json());
    }));
});

getPokemonListDetails.then(function (fulfilled) {
    fulfilled = fulfilled.map(function (object) {
        object.types = object.types.map((type) => type.type)
        return { name: object.name, sprites: object.sprites, types: object.types };
    });

    //save pokemons to local storage
    savePokemons(fulfilled);

    //Display pokemon with name and type
    dispayPokemon(fulfilled);

}).catch(function (error) {
    console.log(error.message);
});

function dispayPokemon(pokemons) {
    const cardsel = document.querySelector('#cards');
    pokemons.forEach(function (pokemon) {
        //article
        var article = document.createElement('article');
        //image
        var img = document.createElement("IMG");
        img.setAttribute("src", pokemon.sprites.front_default);
        img.setAttribute("alt", "pokemon");
        article.appendChild(img);
        //main div
        var mainDiv = document.createElement('div');
        article.appendChild(mainDiv);
        //heading
        const h4 = document.createElement('h4');
        h4.textContent = pokemon.name.toUpperCase();
        article.classList.add('card');
        cardsel.appendChild(article);
        mainDiv.appendChild(h4);
        //type div
        var typediv = document.createElement('div');
        mainDiv.appendChild(typediv);
        typediv.classList.add('type-div');
        //span
        pokemon.types.forEach(function (type) {
            var span = document.createElement('span');
            typediv.appendChild(span);
            span.classList.add('type-icon');
            span.textContent = type.name;
        });

    });
}

const filters = {
    searchText: '',
    selectedText: ''
}

document.querySelector('#search-name').addEventListener('input', (e) => {
    filters.searchText = e.target.value;
    let savedPokemons = getSavedPokemons()
    renderFilteredPokemonInput(savedPokemons);
});

document.querySelector('#search-type').addEventListener('change', (e) => {
    filters.selectedText = e.target.value;
    let savedPokemons = getSavedPokemons()
    renderFilteredPokemonSelect(savedPokemons);
});


// Render application todos based on filters
const renderFilteredPokemonSelect = (pokemons) => {
    console.log(filters);
    const cardSection = document.querySelector('#cards')
    if (filters.selectedText !== "") {
        const selectedPokemons = pokemons.filter((poke) => {
            const selectTextMatch = poke.types.some((type) => {
                return type.name === filters.selectedText.toLowerCase();
            });
            return selectTextMatch;
        });
        cardSection.innerHTML = '';
        dispayPokemon(selectedPokemons);
    }
    else {
        cardSection.innerHTML = '';
        dispayPokemon(pokemons);
    }
}

const renderFilteredPokemonInput = (pokemons) => {
    const cardSection = document.querySelector('#cards')
    if (filters.searchText) {
        const searchPokemons = pokemons.filter((poke) => {
            const searchTextMatch = poke.name.toLowerCase().includes(filters.searchText.toLowerCase());
            return searchTextMatch;
        });
        if (searchPokemons.length > 0) {
            cardSection.innerHTML = '';
            dispayPokemon(searchPokemons);
        } else {
            cardSection.innerHTML = '';
            const messageEl = document.createElement('p')
            messageEl.classList.add('empty-message')
            messageEl.textContent = 'No pokemons to show'
            cardSection.appendChild(messageEl)
        }
    }
    else {
        cardSection.innerHTML = '';
        dispayPokemon(pokemons);
    }
}



const PAGE_SIZE = 10
const MAX_PAGES = 5
let currentPage = 1;
let pokemons = []
const MAX_PAGES_TO_DISPLAY = 5;

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

  // Calculate startPage and endPage
  let startPage = Math.max(currentPage - Math.floor(MAX_PAGES_TO_DISPLAY / 2), 1);
  let endPage = Math.min(startPage + MAX_PAGES_TO_DISPLAY - 1, numPages);

  // Adjust startPage if we're at the end of the page list
  if (endPage - startPage + 1 < MAX_PAGES_TO_DISPLAY && startPage > 1) {
    startPage = endPage - MAX_PAGES_TO_DISPLAY + 1;
  }

  // "Previous" button
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1" value="${currentPage - 1}">Previous</button>
    `);
  }

  // Page number buttons
  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons ${i === currentPage ? 'active' : ''}" value="${i}">${i}</button>
    `);
  }

  // "Next" button
  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1" value="${currentPage + 1}">Next</button>
    `);
  }
};


const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  // Get the selected types from the UI
  const selectedTypes = $('input[type=checkbox]:checked').map(function() {
    return this.name;
  }).get();

  // Filter pokemons based on selected types
  let filteredPokemons = [];
  for (let pokemon of pokemons) {
    const res = await axios.get(pokemon.url);
    const types = res.data.types.map((type) => type.type.name);
    
    // Create a new array that contains only the types that also exist in selectedTypes
    const matchingTypes = types.filter(type => selectedTypes.includes(type));

    // If there are any selected types and the Pokemon has all of the selected types, add it to filteredPokemons
    if (selectedTypes.length === 0 || matchingTypes.length === selectedTypes.length) {
      filteredPokemons.push(pokemon);
    }
  }

  // Then paginate as before
  selected_pokemons = filteredPokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  
  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}>
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
    $('#total-pokemon').text(filteredPokemons.length);
    $('#displayed-pokemon').text(selected_pokemons.length);
  })
}

const fetchTypes = async () => {
  const res = await axios.get('https://pokeapi.co/api/v2/type');
  return res.data.results;
};


const setup = async () => {
  // test out poke api using axios here

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)

  const types = await fetchTypes();
  types.forEach(type => {
    $('#types').append(`
      <span class="checkbox-inline">
        <input type="checkbox" id="${type.name}" name="${type.name}">
        <label for="${type.name}">${type.name}</label>
      </span>
    `);
  });

   // add event listener to checkbox changes
   $('body').on('change', "input[type=checkbox]", function (e) {
    paginate(currentPage, PAGE_SIZE, pokemons);
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  });

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })
  
  // add event listener to pagination buttons
  $('body').on('click', ".page", function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  });
}

$(document).ready(setup)
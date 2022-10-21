"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $episodesList = $("#episodes-list");
const $episodesTitle = $("#episodes-title");
const $searchForm = $("#search-form");
const $episodeListBack = $("#episodes-list-back");


// http://api.tvmaze.com/search/shows?q=friends
// http://api.tvmaze.com/shows/431/episodes //431 = friends Id
// http://api.tvmaze.com/shows/431/images // 431 = friends Id
 
const apiURL = 'http://api.tvmaze.com/';

 
/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const shows = await axios.get(`${apiURL}search/shows?q=${searchTerm}`)
  return shows.data
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let item of shows) {
    let image;
    if (!item.show.image) {
      image = "tvMissing.png"
    } else {
      image = item.show.image.original;
    }
    const $show = $(
        `<div data-show-id="${item.show.id}" data-show-name="${item.show.name}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${image}"
              alt="${item.show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${item.show.name}</h5>
             <div><small>${item.show.summary}</small></div>
             <button class="btn btn-info Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows); 
  getEpisodesBtnTags();
  $showsList.show();
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

function getEpisodesBtnTags() {
  $(".Show-getEpisodes").on("click", async function(evt) {
    evt.preventDefault();
    const {showId, showName} = evt.target.parentNode.parentNode.parentNode.dataset;
    const episodes = await getEpisodesOfShow(showId);
    populateEpisodes(episodes, showName);
  })
}


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) { 
  const episodes = await axios.get(`${apiURL}shows/${id}/episodes`);
  return episodes.data
}

/** Write a clear docstring for this function... */

// Populates the Episode List
function populateEpisodes(episodes, name) { 
  $episodesList.empty();
  $episodesTitle.text(`${name}`)

  for (let episode of episodes) {
    let image;
    ( !episode.image ) ? image = "" :  image = `<img class="mr-3 episode-image" src=${episode.image.original}>`;
    const { name, season, number, airdate, summary } = episode;
    const $episode = $(
      `<li class="episode"> 
          ${image}
          <div class="episode-info"> 
            <h5> ${name} | Season ${season} Episode ${number} | ${airdate} </h5>
            <div>${!summary ? "" : summary}</div>
          </div>
      </li>`
    )
    $episodesList.append($episode);
  }
  $episodesArea.show();
  $showsList.hide();
}

// Go Back Button on Episodes Page
$episodeListBack.on("click", function() {
  $episodesArea.hide();
  $showsList.show();
})

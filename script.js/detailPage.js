// Add this to your existing JavaScript file
document.addEventListener("DOMContentLoaded", function () {
  // Get movie ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("id");

  if (movieId) {
    loadMovieDetails(movieId);
  } else {
    // If no ID, show demo data or redirect
    console.log("No movie ID provided");
  }

  // Handle search in header
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const query = this.value.trim();
        if (query) {
          window.location.href = `search-results.html?query=${encodeURIComponent(
            query
          )}`;
        }
      }
    });
  }

  // Load similar movies
  loadSimilarMovies();
});

async function loadMovieDetails(movieId) {
  const API_KEY = "45f67256";
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieId}&plot=full`
    );
    const movie = await response.json();

    if (movie.Response === "True") {
      updateMovieDetails(movie);
    }
  } catch (error) {
    console.error("Error loading movie details:", error);
  }
}

function updateMovieDetails(movie) {
  document.title = `${movie.Title} - Movie Details`;

  // Update movie info
  document.querySelector(".part1 h2").textContent = movie.Title;
  document.querySelector(
    ".part1 span:nth-child(2)"
  ).textContent = `${movie.Year} • ${movie.Rated} • ${movie.Runtime}`;

  document.querySelector(
    ".rank"
  ).innerHTML = `⭐ ${movie.imdbRating}/10 <span style="color: #999; font-size: 16px;">(IMDb Rating)</span>`;

  // Update plot
  document.querySelector(".plot-section p").textContent = movie.Plot;

  // Update other details
  const detailsGrid = document.querySelector(".details-grid");
  detailsGrid.innerHTML = `
        <div class="detail-item">
            <h4>Director</h4>
            <p>${movie.Director}</p>
        </div>
        <div class="detail-item">
            <h4>Writers</h4>
            <p>${movie.Writer}</p>
        </div>
        <div class="detail-item">
            <h4>Stars</h4>
            <p>${movie.Actors}</p>
        </div>
        <div class="detail-item">
            <h4>Genre</h4>
            <p>${movie.Genre}</p>
        </div>
        <div class="detail-item">
            <h4>Language</h4>
            <p>${movie.Language}</p>
        </div>
        <div class="detail-item">
            <h4>Country</h4>
            <p>${movie.Country}</p>
        </div>
    `;

  // Update poster
  if (movie.Poster && movie.Poster !== "N/A") {
    document.querySelector(".movie-poster img").src = movie.Poster;
  }
}

async function loadSimilarMovies() {
  // This is a placeholder - you might want to search for similar movies
  // based on genre or other criteria
  const API_KEY = "45f67256";
  const query = "sci-fi"; // Example: search by genre

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&type=movie&page=1`
    );
    const data = await response.json();

    if (data.Response === "True") {
      displaySimilarMovies(data.Search.slice(0, 4));
    }
  } catch (error) {
    console.error("Error loading similar movies:", error);
  }
}

function displaySimilarMovies(movies) {
  const grid = document.querySelector(".movies-grid");
  if (!grid) return;

  grid.innerHTML = "";

  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.innerHTML = `
            <img src="${
              movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"
            }" alt="${movie.Title}">
            <div class="movie-card-info">
                <h4>${movie.Title}</h4>
                <p>${movie.Year}</p>
            </div>
        `;

    movieCard.addEventListener("click", () => {
      window.location.href = `movie-details.html?id=${movie.imdbID}`;
    });

    grid.appendChild(movieCard);
  });
}

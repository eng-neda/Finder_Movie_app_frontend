document.addEventListener("DOMContentLoaded", async () => {
  // -------------------- MENU --------------------
  const dropBtns = document.querySelectorAll(".drop-btn");
  const submenus = document.querySelectorAll(".hamburger2");

  dropBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const submenu = this.nextElementSibling;
      submenu.classList.toggle("active");
    });
  });

  document.addEventListener("click", (e) => {
    submenus.forEach((submenu) => {
      if (
        !submenu.contains(e.target) &&
        ![...dropBtns].some((btn) => btn.contains(e.target))
      ) {
        submenu.classList.remove("active");
      }
    });
  });

  // -------------------- SEARCH SUGGESTIONS --------------------

  const SEARCH_API = "https://api.themoviedb.org/3/search/movie";
  const IMAGE_BASE_URL1 = "https://image.tmdb.org/t/p/w92";

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();

    if (query.length < 2) {
      suggestionsBox.style.display = "none";
      suggestionsBox.innerHTML = "";
      return;
    }

    try {
      const res = await fetch(
        `${SEARCH_API}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      suggestionsBox.innerHTML = "";
      suggestionsBox.style.display = "block";

      for (const movie of data.results.slice(0, 6)) {
        const detailRes = await fetch(
          `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`
        );
        const details = await detailRes.json();
        const genres = details.genres
          ? details.genres
              .map((g) => g.name)
              .slice(0, 2)
              .join(", ")
          : "Unknown";

        const item = document.createElement("div");
        item.className = "suggest-item";

        item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${
            movie.poster_path
              ? `${IMAGE_BASE_URL1}${movie.poster_path}`
              : "picture/hero.jpg"
          }" alt="${
          movie.title
        }" style="width: 50px; height: 75px; object-fit: cover; border-radius: 5px;">
          <div>
            <strong>${movie.title}</strong>
            <p style="font-size: 12px; margin: 2px 0; color: #ccc;">${genres}</p>
          </div>
        </div>
      `;

        item.addEventListener("click", () => {
          window.location.href = `search.html?query=${encodeURIComponent(
            movie.title
          )}`;
        });

        suggestionsBox.appendChild(item);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  });

  document.addEventListener("click", (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
      suggestionsBox.style.display = "none";
    }
  });

  // -------------------- API --------------------
  const API_KEY = "101b33b46964ec28c577f761f37619fb";
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("id");

  if (!movieId) {
    document.body.innerHTML = "<h1>Movie not found</h1>";
    return;
  }

  try {
    const movieRes = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
    );
    const movie = await movieRes.json();
    //avamel film
    const creditsRes = await fetch(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
    );
    const credits = await creditsRes.json();

    const crew = credits.crew || [];

    const director = crew.find((c) => c.job === "Director");
    const writers = crew.filter(
      (c) => c.job === "Screenplay" || c.job === "Writer"
    );
    const stars = credits.cast ? credits.cast.slice(0, 5) : [];

    const posterEl = document.getElementById("movie-poster");
    if (posterEl) {
      posterEl.src = movie.poster_path
        ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
        : "default-poster.jpg";
    }

    const titleEl = document.getElementById("movie-title");
    if (titleEl) titleEl.textContent = movie.title || "N/A";

    const yearEl = document.getElementById("movie-year");
    if (yearEl) {
      yearEl.textContent = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "N/A";
    }

    const runTimeEl = document.getElementById("movie-runTime");
    if (runTimeEl) {
      if (movie.runtime) {
        const hours = Math.floor(movie.runtime / 60);
        const minutes = movie.runtime % 60;
        runTimeEl.textContent = `${hours}h - ${minutes}m`;
      } else {
        runTimeEl.textContent = "N/A";
      }
    }

    const ratingEl = document.getElementById("movie-rating");
    if (ratingEl)
      ratingEl.textContent = movie.vote_average
        ? movie.vote_average.toFixed(1)
        : "N/A";

    const genreEl = document.getElementById("movie-genre");
    if (genreEl)
      genreEl.textContent = movie.genres
        ? movie.genres.map((g) => g.name).join(", ")
        : "N/A";

    const plotEl = document.getElementById("movie-plot");
    if (plotEl) plotEl.textContent = movie.overview || "No overview available";

    const directorEl = document.getElementById("movie-director");
    if (directorEl) directorEl.textContent = director ? director.name : "N/A";

    const writersEl = document.getElementById("movie-writers");
    if (writersEl)
      writersEl.textContent =
        writers.length > 0 ? writers.map((w) => w.name).join(", ") : "N/A";
    const starsEl = document.getElementById("movie-stars");
    if (starsEl)
      starsEl.textContent =
        stars.length > 0 ? stars.map((s) => s.name).join(", ") : "N/A";

    //3 IMAGES OF CART MOVIE
    const imagesRes = await fetch(
      `${BASE_URL}/movie/${movieId}/images?api_key=${API_KEY}`
    );
    const imagesData = await imagesRes.json();
    const images = imagesData.backdrops ? imagesData.backdrops.slice(0, 3) : [];

    const imagesContainer = document.getElementById("movie-images");
    if (imagesContainer) {
      imagesContainer.innerHTML = ""; // پاک کردن تصاویر قبلی

      images.forEach((img) => {
        const imgDiv = document.createElement("div");
        imgDiv.className = "movie-image";

        imgDiv.innerHTML = `
      <img src="${
        img.file_path
          ? `${IMAGE_BASE_URL}/w500${img.file_path}`
          : "picture/1.jpg"
      }" alt="${movie.title}">
    `;

        imagesContainer.appendChild(imgDiv);
      });
    }

    //CAST
    const castContainer = document.getElementById("movie-cast");
    if (castContainer) {
      castContainer.innerHTML = "";
      const mainCast = credits.cast ? credits.cast.slice(0, 6) : [];
      mainCast.forEach((person) => {
        const actorDiv = document.createElement("div");
        actorDiv.className = "cast-member";
        actorDiv.innerHTML = `
          <img src="${
            person.profile_path
              ? `${IMAGE_BASE_URL}/w200${person.profile_path}`
              : "default-actor.jpg"
          }" alt="${person.name}">
          <h4>${person.name}</h4>
          <p>${person.character || "Unknown"}</p>
        `;
        castContainer.appendChild(actorDiv);
      });
    }
  } catch (error) {
    console.error("Error loading movie details:", error);
    document.body.innerHTML = "<h1>Error loading movie details</h1>";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // -------------------- MENU --------------------
  const dropBtns = document.querySelectorAll(".drop-btn");
  const submenus = document.querySelectorAll(".hamburger2");

  dropBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const submenu = btn.nextElementSibling;
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

  // -------------------- API --------------------
  const API_KEY = "101b33b46964ec28c577f761f37619fb";
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

  // TMDB genre IDs
  const genreMap = {
    action: 28,
    adventure: 12,
    animation: 16,
    comedy: 35,
    crime: 80,
    drama: 18,
    fantasy: 14,
    horror: 27,
    "sci-fi": 878,
  };

  const genreListItems = document.querySelectorAll(".genre-list li");
  const moviesContainer = document.getElementById("movies-container");

  // ---------------------------------------------------
  // تابع اصلی لود فیلم‌ها با ژانر
  // ---------------------------------------------------
  async function loadMoviesByGenre(genreKey) {
    const genreId = genreMap[genreKey];
    if (!genreId) return;

    moviesContainer.innerHTML = "<p style='color:white'>Loading...</p>";

    try {
      const res = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
      );
      const data = await res.json();
      const movies = data.results || [];

      if (movies.length === 0) {
        moviesContainer.innerHTML =
          "<p style='color:white'>No movies found.</p>";
        return;
      }

      moviesContainer.innerHTML = "";

      for (const movie of movies) {
        const detailRes = await fetch(
          `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=credits`
        );
        const movieDetail = await detailRes.json();

        const director =
          movieDetail.credits?.crew?.find((c) => c.job === "Director")?.name ||
          "N/A";

        const stars =
          movieDetail.credits?.cast
            ?.slice(0, 5)
            .map((s) => s.name)
            .join(", ") || "N/A";

        const genres =
          movieDetail.genres?.map((g) => g.name).join(", ") || "N/A";

        const runtime = movieDetail.runtime
          ? `${Math.floor(movieDetail.runtime / 60)}h ${
              movieDetail.runtime % 60
            }m`
          : "N/A";

        const year = movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : "N/A";

        const rating = movie.vote_average
          ? movie.vote_average.toFixed(1)
          : "N/A";

        const movieCard = document.createElement("div");
        movieCard.className = "movie-card";

        movieCard.innerHTML = `
          <img src="${
            movie.poster_path
              ? `${IMAGE_BASE_URL}/w200${movie.poster_path}`
              : "picture/1.jpg"
          }" alt="${movie.title}">

          <div class="movie-info">
            
            <div class="title-rank">
              <h3>${movie.title}</h3>
              <span class="rating">⭐ ${rating}</span>
            </div>

            <div class="movie-meta">
              <span class="year">${year}</span>
              <span class="runtime"> - ${runtime}</span>
            </div>

            <p class="genre"><strong></strong> ${genres}</p>
            <p><strong></strong> ${
              movieDetail.overview || "No plot available"
            }</p>

            <p><strong>Director:</strong> ${director}</p>
            <p><strong>Stars:</strong> ${stars}</p>
            <p><strong>Votes:</strong> ${movie.vote_count || "N/A"}</p>
          </div>
        `;

        movieCard.addEventListener("click", () => {
          window.location.href = `detailPage.html?id=${movie.id}`;
        });

        moviesContainer.appendChild(movieCard);
      }
    } catch (err) {
      console.error("Error loading movies:", err);
      moviesContainer.innerHTML =
        "<p style='color:red'>Error loading movies.</p>";
    }
  }

  // ---------------------------------------------------
  // ۱) کلیک روی لیست سمت چپ genre-list
  // ---------------------------------------------------
  genreListItems.forEach((li) => {
    li.addEventListener("click", () => {
      const g = li.dataset.genre;
      loadMoviesByGenre(g);
    });
  });

  // ---------------------------------------------------
  // ۲) گرفتن ژانر از URL (برای منوی کشویی)
  // ---------------------------------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const urlGenre = urlParams.get("genre");

  if (urlGenre && genreMap[urlGenre]) {
    loadMoviesByGenre(urlGenre);
  }

  // -------------------- SEARCH SUGGESTIONS --------------------

  const SEARCH_API = "https://api.themoviedb.org/3/search/movie";
  const IMAGE_BASE_URL1 = "https://image.tmdb.org/t/p/w92";

  // وقتی تایپ میکند → پیشنهاد بده
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

      // فقط 6 پیشنهاد
      for (const movie of data.results.slice(0, 6)) {
        // گرفتن جزئیات فیلم برای ژانر
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

        // ساختار HTML پیشنهاد
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

        // کلیک روی پیشنهاد → صفحه search.html
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

  // مخفی کردن پیشنهاد‌ها وقتی کاربر بیرون کلیک کند
  document.addEventListener("click", (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
      suggestionsBox.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
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

  // -------------------- API --------------------
  const API_KEY = "101b33b46964ec28c577f761f37619fb";
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

  // DOM elements
  const movieContainer = document.querySelector(".movie-items");
  const pageNumbers = document.getElementById("pageNumbers");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const loadingOverlay = document.getElementById("loadingOverlay");

  const searchInput = document.getElementById("searchInput");
  const suggestionsBox = document.getElementById("suggestionsBox");

  // نمایش نام جستجو
  const searchTitle = document.createElement("div");
  searchTitle.classList.add("title");
  searchTitle.innerHTML = `<h2>Results For: <span id="searchTerm"></span></h2>`;
  document.querySelector(".container").prepend(searchTitle);
  const searchTermEl = document.getElementById("searchTerm");

  // گرفتن query از URL
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query") || "";
  if (query && searchTermEl) searchTermEl.textContent = query;

  let currentPage = 1;
  let totalPages = 1;

  // -------------------- FETCH MOVIES --------------------
  async function fetchMovies(searchQuery, page) {
    if (!searchQuery) return;
    loadingOverlay.style.display = "flex";

    try {
      const res = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}&page=${page}`
      );
      const data = await res.json();
      const movies = data.results || [];
      totalPages = Math.min(500, data.total_pages);

      if (movies.length === 0) {
        movieContainer.innerHTML =
          "<h2 style='color: white; text-align: center; margin: 50px;'>No results found!</h2>";
        pageNumbers.innerHTML = "";
        return;
      }

      renderMovies(movies);
      renderPagination();
    } catch (err) {
      console.error(err);
      movieContainer.innerHTML =
        "<h2 style='color: red; text-align: center; margin: 50px;'>Error loading data</h2>";
    } finally {
      loadingOverlay.style.display = "none";
    }
  }

  // -------------------- RENDER MOVIES --------------------
  async function renderMovies(movies) {
    movieContainer.innerHTML = "";

    for (const movie of movies) {
      const res = await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`
      );
      const details = await res.json();

      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";
      const genre = details.genres
        ? details.genres
            .map((g) => g.name)
            .slice(0, 2)
            .join(", ")
        : "Unknown";

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="photo">
          <img src="${
            movie.poster_path
              ? `${IMAGE_BASE_URL}/w300${movie.poster_path}`
              : "picture/hero.jpg"
          }" alt="${movie.title}" />
        </div>
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <p>${genre}</p>
          <div class="rank">
            <span>⭐ ${rating}</span>
            <button class="view-btn" onclick="viewDetails(${
              movie.id
            })">View Info</button>
          </div>
        </div>
      `;
      movieContainer.appendChild(li);
    }
  }

  // -------------------- PAGINATION --------------------
  function renderPagination() {
    pageNumbers.innerHTML = "";
    const max = totalPages;
    const current = currentPage;

    function addPage(num) {
      const btn = document.createElement("button");
      btn.textContent = num;
      btn.classList.add("page-btn");
      if (num === current) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentPage = num;
        fetchMovies(query, currentPage);
      });
      pageNumbers.appendChild(btn);
    }

    function addEllipsis() {
      const dot = document.createElement("span");
      dot.className = "ellipsis";
      dot.textContent = "...";
      pageNumbers.appendChild(dot);
    }

    if (max <= 10) {
      for (let i = 1; i <= max; i++) addPage(i);
    } else {
      addPage(1);
      if (current > 4) addEllipsis();
      const start = Math.max(2, current - 2);
      const end = Math.min(max - 1, current + 2);
      for (let i = start; i <= end; i++) addPage(i);
      if (current < max - 3) addEllipsis();
      addPage(max);
    }

    prevBtn.disabled = current === 1;
    nextBtn.disabled = current === max;
  }

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchMovies(query, currentPage);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchMovies(query, currentPage);
    }
  });

  // -------------------- VIEW DETAILS --------------------
  window.viewDetails = (id) => {
    window.location.href = `detailPage.html?id=${id}`;
  };

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

  if (query) {
    fetchMovies(query, currentPage);
  }
});

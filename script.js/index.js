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

  const searchInput = document.querySelector(".search-box input");
  const movieContainer = document.querySelector(".container");
  const pageNumbers = document.getElementById("pageNumbers");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const loadingOverlay = document.getElementById("loadingOverlay");

  let currentPage = 1;
  let currentSearch = "avengers";
  let totalPages = 1;

  // -------------------- search-suggestions --------------------
  const suggestionsBox = document.getElementById("suggestionsBox");
  const SEARCH_API = "https://api.themoviedb.org/3/search/movie";
  const IMAGE_BASE_URL1 = "https://image.tmdb.org/t/p/w92";

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();

    if (query.length < 1) {
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
    if (!searchInput.contains(e.target)) {
      suggestionsBox.style.display = "none";
    }
  });
  // -------------------- Slider --------------------
  async function loadSliderMovies() {
    try {
      const res = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`
      );
      const data = await res.json();

      if (!data.results) return;

      const movies = data.results.slice(0, 3);

      for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];

        const img = document.getElementById(`slide-img-${i + 1}`);
        const titleEl = document.getElementById(`title-${i + 1}`);
        const plotEl = document.getElementById(`plot-${i + 1}`);
        const genreEl = document.getElementById(`genre-${i + 1}`);
        const releasedEl = document.getElementById(`released-${i + 1}`);

        if (img) {
          img.src = movie.backdrop_path
            ? `${IMAGE_BASE_URL}/w1280${movie.backdrop_path}`
            : "picture/hero.jpg";
        }

        if (titleEl) titleEl.textContent = movie.title;

        const detailsRes = await fetch(
          `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`
        );
        const details = await detailsRes.json();

        if (plotEl)
          plotEl.textContent = details.overview || "No overview available";

        if (genreEl) {
          const genres = details.genres
            ? details.genres.map((g) => g.name).join(", ")
            : "";
          genreEl.innerHTML = genres
            ? genres
                .split(",")
                .map(
                  (g) =>
                    `<span><a href="genre.html?genre=${g
                      .trim()
                      .toLowerCase()}">${g.trim()}</a></span>`
                )
                .join("")
            : "<span>No genre</span>";
        }

        if (releasedEl) {
          releasedEl.textContent = details.release_date
            ? new Date(details.release_date).getFullYear()
            : "Coming soon";
        }
      }

      startSlider();
    } catch (err) {
      console.error("Slider Error:", err);
    }
  }

  // -------------------- Fetch-Movies--------------------
  async function fetchMovies(search, page) {
    loadingOverlay.style.display = "flex";

    try {
      let url;

      if (search.trim() === "") {
        url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;
      } else {
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          search
        )}&page=${page}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        movieContainer.innerHTML =
          "<h2 style='color: white; text-align: center; margin: 50px;'>No results found!</h2>";
        return;
      }

      totalPages = Math.min(500, data.total_pages);

      renderMovies(data.results.slice(0, 20));
      renderPagination();
    } catch (err) {
      movieContainer.innerHTML =
        "<h2 style='color: white; text-align: center; margin: 50px;'>Error loading data</h2>";
      console.error(err);
    } finally {
      loadingOverlay.style.display = "none";
    }
  }
  // -------------------- Display-Movies--------------------
  async function renderMovies(movies) {
    let limit = 20;

    if (window.innerWidth <= 480) {
      limit = 3;
    } else if (window.innerWidth <= 768) {
      limit = 8;
    } else if (window.innerWidth <= 1024) {
      limit = 12;
    }

    movies = movies.slice(0, limit);

    movieContainer.innerHTML = "";

    const ul = document.createElement("ul");
    ul.classList.add("movie-items");

    for (const movie of movies) {
      const detailsRes = await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`
      );
      const details = await detailsRes.json();

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

      ul.appendChild(li);
    }

    movieContainer.appendChild(ul);
  }

  // -------------------- PAGINATION--------------------
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
        fetchMovies(currentSearch, currentPage);
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
      fetchMovies(currentSearch, currentPage);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchMovies(currentSearch, currentPage);
    }
  });
  // -------------------- Search--------------------
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      currentSearch = searchInput.value.trim();
      currentPage = 1;
      fetchMovies(currentSearch, currentPage);
    }
  });

  // -------------------- Go to detailPage--------------------
  window.viewDetails = (id) => {
    window.location.href = `detailPage.html?id=${id}`;
  };

  // -------------------- Start Slider--------------------
  function startSlider() {
    const slides = document.querySelectorAll(".slide");
    let current = 0;
    if (slides.length === 0) return;

    slides[0].classList.add("active");

    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 4000);
  }

  loadSliderMovies();
  fetchMovies(currentSearch, currentPage);
});

// genre.js - صفحه ژانر
document.addEventListener("DOMContentLoaded", function () {
  // مدیریت منوی ژانر
  const dropBtns = document.querySelectorAll(".drop-btn");
  const submenus = document.querySelectorAll(".hamburger2");

  dropBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const submenu = this.nextElementSibling;
      submenu.classList.toggle("active");
    });
  });

  document.addEventListener("click", function (e) {
    submenus.forEach((submenu) => {
      if (
        !submenu.contains(e.target) &&
        ![...dropBtns].some((btn) => btn.contains(e.target))
      ) {
        submenu.classList.remove("active");
      }
    });
  });

  // دریافت ژانر از URL
  const urlParams = new URLSearchParams(window.location.search);
  const genre = urlParams.get("genre") || "action";

  // به‌روزرسانی عنوان
  document.getElementById("genre-title").textContent = `${
    genre.charAt(0).toUpperCase() + genre.slice(1)
  } Movies`;

  // لود فیلم‌های ژانر
  loadGenreMovies(genre);
});

const API_KEY = "45f67256";

async function loadGenreMovies(genre, page = 1) {
  const container = document.getElementById("movies-container");
  const pagination = document.getElementById("pagination");

  // نمایش لودینگ
  container.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading ${genre} movies...</p>
    </div>
  `;

  try {
    // جستجوی فیلم‌های این ژانر
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${genre}&type=movie&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "False") {
      container.innerHTML = `
        <div class="error-state">
          <p>No ${genre} movies found.</p>
        </div>
      `;
      return;
    }

    // نمایش فیلم‌ها
    renderMovies(data.Search, container);

    // ایجاد صفحه‌بندی
    renderPagination(data.totalResults, page, genre);
  } catch (error) {
    console.error("Error loading genre movies:", error);
    container.innerHTML = `
      <div class="error-state">
        <p>Failed to load movies. Please try again.</p>
      </div>
    `;
  }
}

function renderMovies(movies, container) {
  container.innerHTML = "";

  const ul = document.createElement("ul");
  ul.classList.add("movie-items");

  movies.forEach((movie) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="photo">
        <img src="${
          movie.Poster !== "N/A" ? movie.Poster : "picture/hero.jpg"
        }" 
             alt="${movie.Title}">
      </div>
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
        <div class="rank">
          <span>⭐</span>
          <button class="view-btn" onclick="viewMovie('${
            movie.imdbID
          }')">View Info</button>
        </div>
      </div>
    `;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function renderPagination(totalResults, currentPage, genre) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  const totalPages = Math.ceil(totalResults / 10);

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let html = `
    <button id="prevBtn" ${
      currentPage === 1 ? "disabled" : ""
    }>Previous</button>
    <div id="pageNumbers"></div>
    <button id="nextBtn" ${
      currentPage === totalPages ? "disabled" : ""
    }>Next</button>
  `;

  pagination.innerHTML = html;

  // اضافه کردن شماره صفحات
  const pageNumbers = document.getElementById("pageNumbers");
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "page-btn";
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      loadGenreMovies(genre, i);
      window.scrollTo(0, 0);
    });

    pageNumbers.appendChild(btn);
  }

  // مدیریت دکمه‌های قبلی/بعدی
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      loadGenreMovies(genre, currentPage - 1);
      window.scrollTo(0, 0);
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentPage < totalPages) {
      loadGenreMovies(genre, currentPage + 1);
      window.scrollTo(0, 0);
    }
  });
}

function viewMovie(movieId) {
  window.location.href = `detailPage.html?id=${movieId}`;
}

// مدیریت جستجو
const searchInput = document.querySelector(".search-box input");
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `searchResults.html?query=${encodeURIComponent(
          query
        )}`;
      }
    }
  });
}

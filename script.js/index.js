document.addEventListener("DOMContentLoaded", function () {
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
});
///////////////////////////////////////////////////////////////////////////////
// movie---list
const API_KEY = "45f67256";
const searchInput = document.querySelector(".search-box input");
const movieContainer = document.querySelector(".container");
const pageNumbers = document.getElementById("pageNumbers");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// مقدار دهی اولیه
let currentPage = 1;
let currentSearch = "dune";
let totalPages = 1;

// -------------------------
// درخواست API برای سرچ
// -------------------------
async function fetchMovies(search, page) {
  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.style.display = "flex"; // نمایش لودینگ

  try {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${search}&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "False") {
      movieContainer.innerHTML = `<h2>No results found!</h2>`;
      return;
    }

    totalPages = Math.ceil(data.totalResults / 20);
    renderMovies(data.Search);
    renderPagination();
  } catch (err) {
    movieContainer.innerHTML = "<h2>Error loading data</h2>";
    console.error(err); // برای اشکال‌زدایی
  } finally {
    loadingOverlay.style.display = "none"; // مخفی کردن لودینگ حتی اگر خطا رخ دهد
  }
}

// -------------------------
// نمایش فیلم‌ها
// -------------------------
async function renderMovies(movies) {
  movieContainer.innerHTML = "";

  const ul = document.createElement("ul");
  ul.classList.add("movie-items");

  for (const movie of movies) {
    // گرفتن جزئیات کامل فیلم
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`;
    const res = await fetch(url);
    const details = await res.json();

    const rating = details.imdbRating !== "N/A" ? details.imdbRating : "—";
    const genre = details.Genre !== "N/A" ? details.Genre : "Unknown";

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="photo">
        <img src="${
          movie.Poster !== "N/A" ? movie.Poster : "picture/hero.jpg"
        }" />
      </div>
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <p>${genre}</p>
        <div class="rank">
          <span>⭐ ${rating}</span>
          <button class="view-btn" onclick="viewDetails('${
            movie.imdbID
          }')">View Info</button>
        </div>
      </div>
    `;

    ul.appendChild(li);
  }

  movieContainer.appendChild(ul);
}

function renderPagination() {
  pageNumbers.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("page-btn");

    if (i === currentPage) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      currentPage = i;
      fetchMovies(currentSearch, currentPage);
    });

    pageNumbers.appendChild(btn);
  }

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// -------------------------
// دکمه‌های قبلی / بعدی
// -------------------------
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

// -------------------------
// هندل سرچ هنگام Enter
// -------------------------
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    if (currentSearch.length > 0) {
      fetchMovies(currentSearch, currentPage);
    }
  }
});

// -------------------------
// رفتن به صفحه جزئیات
// -------------------------
function viewDetails(id) {
  window.location.href = `detailPage.html?id=${id}`;
}

// -------------------------
// اجرای اولیه
// -------------------------
fetchMovies(currentSearch, currentPage);

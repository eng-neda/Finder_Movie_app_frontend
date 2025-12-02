// detailPage.js - صفحه جزئیات فیلم

// -------------------------
// مدیریت منوی ژانر (مشابه index.js)
// -------------------------
document.addEventListener("DOMContentLoaded", function () {
  // مدیریت منوی کشویی
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

  // -------------------------
  // دریافت ID فیلم از URL
  // -------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("id");

  if (movieId) {
    // لود اطلاعات فیلم
    loadMovieDetails(movieId);
    // لود تصاویر اضافی
    loadAdditionalImages(movieId);
    // لود فیلم‌های مشابه
    loadSimilarMovies(movieId);
  } else {
    showError("Movie ID not found in URL");
  }

  // -------------------------
  // مدیریت جستجو (مشابه index.js)
  // -------------------------
  const searchInput = document.querySelector(".search-box input");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query.length > 0) {
          window.location.href = `index.html?search=${encodeURIComponent(
            query
          )}`;
        }
      }
    });
  }
});

// -------------------------
// ثابت‌ها
// -------------------------
const API_KEY = "45f67256";

// -------------------------
// لود جزئیات فیلم
// -------------------------
async function loadMovieDetails(movieId) {
  const titleElement = document.querySelector(".part1 h2");
  const metaElement = document.querySelector(".part1 span");
  const ratingElement = document.querySelector(".rank");
  const posterElement = document.querySelector(".movie-poster img");
  const detailsGrid = document.querySelector(".details-grid");

  // نمایش حالت لودینگ
  if (titleElement) titleElement.textContent = "Loading...";
  if (ratingElement) ratingElement.innerHTML = "⭐ Loading...";

  try {
    // درخواست جزئیات کامل فیلم
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieId}&plot=full`;
    const response = await fetch(url);
    const movie = await response.json();

    if (movie.Response === "False") {
      throw new Error(movie.Error);
    }

    // نمایش اطلاعات فیلم
    displayMovieDetails(movie);
  } catch (error) {
    console.error("Error loading movie details:", error);
    showError("Failed to load movie details. Please try again.");
  }
}

// -------------------------
// نمایش جزئیات فیلم
// -------------------------
function displayMovieDetails(movie) {
  // 1. اطلاعات اصلی
  const titleElement = document.querySelector(".part1 h2");
  const metaElement = document.querySelector(".part1 span");
  const ratingElement = document.querySelector(".rank");
  const posterElement = document.querySelector(".movie-poster img");

  if (titleElement) titleElement.textContent = movie.Title;
  if (metaElement)
    metaElement.textContent = `${movie.Year} • ${movie.Rated} • ${movie.Runtime} • ${movie.Genre}`;
  if (ratingElement)
    ratingElement.innerHTML = `⭐ ${movie.imdbRating}/10 <span style="color: #999; font-size: 16px">(${movie.imdbVotes} votes)</span>`;
  if (posterElement)
    posterElement.src =
      movie.Poster !== "N/A" ? movie.Poster : "picture/hero.jpg";

  // 2. جزئیات در گرید
  const detailsGrid = document.querySelector(".details-grid");
  if (detailsGrid) {
    detailsGrid.innerHTML = `
      <div class="detail-item">
        <h4>Director</h4>
        <p>${movie.Director}</p>
      </div>
      <div class="detail-item">
        <h4>Writer</h4>
        <p>${movie.Writer}</p>
      </div>
      <div class="detail-item">
        <h4>Actors</h4>
        <p>${movie.Actors}</p>
      </div>
      <div class="detail-item">
        <h4>Plot</h4>
        <p>${movie.Plot}</p>
      </div>
      <div class="detail-item">
        <h4>Language</h4>
        <p>${movie.Language}</p>
      </div>
      <div class="detail-item">
        <h4>Country</h4>
        <p>${movie.Country}</p>
      </div>
      <div class="detail-item">
        <h4>Awards</h4>
        <p>${movie.Awards}</p>
      </div>
      <div class="detail-item">
        <h4>Box Office</h4>
        <p>${movie.BoxOffice || "N/A"}</p>
      </div>
    `;
  }

  // 3. به‌روزرسانی عنوان صفحه
  document.title = `${movie.Title} (${movie.Year}) - Movie Finder`;
}

// -------------------------
// لود تصاویر اضافی
// -------------------------
async function loadAdditionalImages(movieId) {
  const imageContainer = document.querySelector(".image-container");
  if (!imageContainer) return;

  try {
    // درخواست اطلاعات بیشتر (برای سری‌ها یا فصل‌ها)
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieId}`;
    const response = await fetch(url);
    const movie = await response.json();

    // استفاده از تصاویر محلی اگر API تصاویر اضافی ندارد
    const images = ["picture/1.jpg", "picture/wolf.jpg", "picture/3.jpg"];

    imageContainer.innerHTML = images
      .map(
        (img) => `
      <img src="${img}" alt="${movie.Title}" onerror="this.style.display='none'">
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading additional images:", error);
  }
}

// -------------------------
// لود فیلم‌های مشابه
// -------------------------
async function loadSimilarMovies(movieId) {
  try {
    // ابتدا اطلاعات فیلم را بگیریم تا ژانر را بدست آوریم
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieId}`;
    const response = await fetch(url);
    const movie = await response.json();

    if (movie.Response === "False" || !movie.Genre) return;

    // جستجوی فیلم‌های مشابه بر اساس ژانر
    const firstGenre = movie.Genre.split(",")[0].trim();
    const searchUrl = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(
      firstGenre
    )}&type=movie&page=1`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.Response === "True" && searchData.Search) {
      // حذف فیلم جاری از لیست
      const similarMovies = searchData.Search.filter(
        (m) => m.imdbID !== movieId
      ).slice(0, 4);

      // نمایش در بخش بازیگران یا ایجاد بخش جدید
      displaySimilarMovies(similarMovies);
    }
  } catch (error) {
    console.error("Error loading similar movies:", error);
  }
}

// -------------------------
// نمایش فیلم‌های مشابه
// -------------------------
function displaySimilarMovies(movies) {
  const castSection = document.querySelector(".cast-section");
  if (!castSection) return;

  // ایجاد HTML برای فیلم‌های مشابه
  const similarMoviesHTML = movies
    .map(
      (movie) => `
    <div class="cast-member" onclick="viewMovie('${
      movie.imdbID
    }')" style="cursor: pointer;">
      <img src="${
        movie.Poster !== "N/A" ? movie.Poster : "picture/hero.jpg"
      }" alt="${movie.Title}">
      <h4>${movie.Title}</h4>
      <p>${movie.Year} • ${movie.Type}</p>
    </div>
  `
    )
    .join("");

  // اگر بخش بازیگران وجود دارد، فیلم‌های مشابه را بعد از آن اضافه کنیم
  const similarSection = document.createElement("div");
  similarSection.className = "similar-section";
  similarSection.innerHTML = `
    <h3>Similar Movies</h3>
    <div class="cast-grid">
      ${similarMoviesHTML}
    </div>
  `;

  castSection.parentNode.insertBefore(similarSection, castSection.nextSibling);
}

// -------------------------
// نمایش خطا
// -------------------------
function showError(message) {
  const container = document.querySelector(".container");
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 50px; color: #ff6b6b;">
      <h2>Error</h2>
      <p>${message}</p>
      <a href="index.html" style="color: #f5c518; text-decoration: none;">← Back to Home</a>
    </div>
  `;
}
function displayCast(movie) {
  const castSection = document.querySelector(".cast-section");
  if (!castSection) return;

  // بازیگران را جدا می‌کنیم
  const actors = movie.Actors
    ? movie.Actors.split(",").map((a) => a.trim())
    : [];

  // ساخت HTML برای هر بازیگر
  const castHTML = actors
    .map(
      (actor) => `
    <div class="cast-member">
      <img src="picture/hero.jpg" alt="${actor}" />
      <h4>${actor}</h4>
    </div>
  `
    )
    .join("");

  castSection.innerHTML = `
    <h3>Cast</h3>
    <div class="cast-grid">
      ${castHTML}
    </div>
  `;
}

// -------------------------
// تابع کمکی برای رفتن به صفحه جزئیات
// -------------------------
function viewMovie(movieId) {
  window.location.href = `detailPage.html?id=${movieId}`;
}

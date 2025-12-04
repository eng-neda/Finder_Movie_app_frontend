document.addEventListener("DOMContentLoaded", async () => {
  // -------------------------
  // تنظیم منوها
  // -------------------------
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

  // -------------------------
  // API
  // -------------------------
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
    // دریافت جزئیات فیلم
    const movieRes = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
    );
    const movie = await movieRes.json();

    // دریافت بازیگران و عوامل
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

    // پر کردن اطلاعات
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

    //دریافت سه تصویر
    // دریافت تصاویر فیلم
    const imagesRes = await fetch(
      `${BASE_URL}/movie/${movieId}/images?api_key=${API_KEY}`
    );
    const imagesData = await imagesRes.json();

    // اینجا کد شما برای اضافه کردن سه تصویر
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

    // نمایش بازیگران
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

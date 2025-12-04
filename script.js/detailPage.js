document.addEventListener("DOMContentLoaded", async () => {
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
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
    );
    const movie = await movieRes.json();

    // دریافت بازیگران و عوامل
    const creditsRes = await fetch(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`
    );
    const credits = await creditsRes.json();

    const crew = credits.crew || [];

    const director = crew.find((c) => c.job === "Director");
    const writers = crew.filter(
      (c) => c.job === "Screenplay" || c.job === "Writer"
    );

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
    if (yearEl)
      yearEl.textContent = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "N/A";

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

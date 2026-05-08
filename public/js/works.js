document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("catalog-grid");

  // Audio state — starts muted, can be toggled by user
  let audioEnabled = false;

  // Helper: fade a media element's volume in or out over a duration
  function fadeMediaVolume(media, targetVolume, duration = 200, { resetOnPause = true } = {}) {
    if (media._fadeInterval) clearInterval(media._fadeInterval);

    const startVolume = media.volume;
    const startTime = performance.now();

    media._fadeInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      media.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress >= 1) {
        clearInterval(media._fadeInterval);
        media._fadeInterval = null;
        if (targetVolume === 0) {
          media.pause();
          if (resetOnPause) media.currentTime = 0;
        }
      }
    }, 16);
  }

  const response = await fetch('/works/works.json?v=' + Math.floor(Date.now() / 86400000));
  const allWorks = await response.json();

  // Create the unmute toggle button
  const audioToggle = document.createElement("button");
  audioToggle.id = "audio-toggle";
  audioToggle.className = "audio-toggle muted";
  audioToggle.setAttribute("aria-label", "Unmute previews");
  audioToggle.innerHTML = `<i class="fas fa-volume-mute"></i><span class="audio-toggle-label">Click to unmute</span>`;
  document.body.appendChild(audioToggle);

  function updateToggleUI() {
    if (audioEnabled) {
      audioToggle.classList.remove("muted");
      audioToggle.classList.add("unmuted");
      audioToggle.setAttribute("aria-label", "Mute previews");
      audioToggle.innerHTML = `<i class="fas fa-volume-up"></i><span class="audio-toggle-label">Sound on</span>`;
    } else {
      audioToggle.classList.remove("unmuted");
      audioToggle.classList.add("muted");
      audioToggle.setAttribute("aria-label", "Unmute previews");
      audioToggle.innerHTML = `<i class="fas fa-volume-mute"></i><span class="audio-toggle-label">Click to unmute</span>`;
    }
    // Apply state to all currently rendered videos
    document.querySelectorAll(".tile-video").forEach((v) => {
      v.muted = !audioEnabled;
    });
  }

  // Toggle button: explicit user gesture, so we can unmute reliably
  audioToggle.addEventListener("click", (e) => {
    e.stopPropagation(); // don't double-fire with the document listener
    audioEnabled = !audioEnabled;
    updateToggleUI();
  });

  // Click anywhere on the page = unlock audio (one-time)
  document.addEventListener("click", () => {
    if (!audioEnabled) {
      audioEnabled = true;
      updateToggleUI();
    }
  }, { once: true });

  function renderWorks(worksToRender) {
    worksToRender.sort((a, b) => {
      const hasMediaA = a.media_preview ? 1 : 0;
      const hasMediaB = b.media_preview ? 1 : 0;
      return hasMediaB - hasMediaA;
    });

    grid.innerHTML = "";
    worksToRender.forEach((work) => {
      const item = document.createElement("div");
      item.className = "catalog-item";

      const VIDEO_VERSION = "v2"; // bump this whenever you replace previews

      const media = `
        <div class="video-wrapper">
          <img class="tile-poster" src="../images/${work.slug}_preview.jpg?${VIDEO_VERSION}" alt="${work.title}">
          <video class="tile-video" muted loop preload="none" src="../videos/${work.slug}_preview.mp4?${VIDEO_VERSION}"></video>
        </div>
      `;

      item.innerHTML = `
      <a class="catalog-item" href="${work.link}">
          <div class="tile-arrow">↗</div>
          ${media}
          <div class="work-title-block">
              <span class="work-title">${work.title}</span>
              <span class="work-subtitle">${work.subtitle}</span>
              <span class="work-year">${work.year}</span>
          </div>
      </a>
      `;
      grid.appendChild(item);
    });

    document.querySelectorAll(".tile-video").forEach((video) => {
      // Apply current audio state on render
      video.muted = !audioEnabled;
      video.volume = 0; // start silent so fade-in is noticeable

      video.addEventListener("mouseenter", () => {
        video.muted = !audioEnabled;
        video.volume = 0; // reset before fade-in
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If unmuted play was blocked, fall back to muted
            video.muted = true;
            video.play();
          });
        }
        // Fade in over 250ms
        fadeMediaVolume(video, 1.0, 250);
      });

      video.addEventListener("mouseleave", () => {
        // Fade out over 200ms (pauses + resets video when fade completes)
        fadeMediaVolume(video, 0, 200);
      });
    });
  }

  function applyFilters() {
    const title = document.getElementById("filter-title").value.toLowerCase();
    const type = document.getElementById("filter-type").value.toLowerCase();
    const diff = document.getElementById("filter-difficulty").value.toLowerCase();
    const instr = document.getElementById("filter-instrument").value.toLowerCase();

    const filtered = allWorks.filter((work) => {
      const matchesTitle = !title || work.title.toLowerCase().includes(title);
      const matchesType =
        !type || work.type?.toLowerCase() === type || work.tags?.includes(type);
      const matchesDiff = !diff || work.difficulty?.toLowerCase().includes(diff);
      const matchesInstr =
        !instr || work.instrument_filters?.some((i) => i.toLowerCase().includes(instr));
      return matchesTitle && matchesType && matchesDiff && matchesInstr;
    });

    renderWorks(filtered);
  }

  document.getElementById("filter-title").addEventListener("input", applyFilters);
  document.getElementById("filter-type").addEventListener("change", applyFilters);
  document.getElementById("filter-difficulty").addEventListener("change", applyFilters);
  document.getElementById("filter-instrument").addEventListener("input", applyFilters);

  renderWorks(allWorks);
});
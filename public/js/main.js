document.addEventListener("DOMContentLoaded", function () {
  //
  // === AUDIO STATE & UNMUTE TOGGLE ===
  //
  const ASSET_VERSION = "v2"; // bump this whenever you replace preview/hero/audio files

  let audioEnabled = false;
  let toggleMode = "hero"; // "hero" = big CTA in hero, "persistent" = small bottom-right

  const heroAudio = new Audio(`/audio/hero_loop.mp3?${ASSET_VERSION}`);
  heroAudio.loop = true;
  heroAudio.volume = 0.7;
  heroAudio.preload = "auto";

  // Create the toggle button — starts in hero mode
  const audioToggle = document.createElement("button");
  audioToggle.id = "audio-toggle";
  audioToggle.className = "audio-toggle hero-mode muted";
  audioToggle.setAttribute("aria-label", "Enable sound");
  audioToggle.innerHTML = `<i class="fas fa-volume-mute"></i><span class="audio-toggle-label">Click to enable sound</span>`;

  // Insert into hero content (below the text), not body
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    heroContent.appendChild(audioToggle);
  } else {
    document.body.appendChild(audioToggle);
  }

  function setToggleMode(mode) {
    if (toggleMode === mode) return;
    toggleMode = mode;

    if (mode === "persistent") {
      // Move to body if not already there, switch to fixed bottom-right styling
      if (audioToggle.parentElement !== document.body) {
        document.body.appendChild(audioToggle);
      }
      audioToggle.classList.remove("hero-mode");
      audioToggle.classList.add("persistent-mode");
    } else {
      if (heroContent && audioToggle.parentElement !== heroContent) {
        heroContent.appendChild(audioToggle);
      }
      audioToggle.classList.remove("persistent-mode");
      audioToggle.classList.add("hero-mode");
    }
  }

  function updateToggleUI() {
    if (audioEnabled) {
      audioToggle.classList.remove("muted");
      audioToggle.classList.add("unmuted");
      audioToggle.setAttribute("aria-label", "Mute sound");
      const label = toggleMode === "persistent" ? "Sound on" : "Sound on — click to mute";
      audioToggle.innerHTML = `<i class="fas fa-volume-up"></i><span class="audio-toggle-label">${label}</span>`;
    } else {
      audioToggle.classList.remove("unmuted");
      audioToggle.classList.add("muted");
      audioToggle.setAttribute("aria-label", "Enable sound");
      const label = toggleMode === "persistent" ? "Click to unmute" : "Click to enable sound";
      audioToggle.innerHTML = `<i class="fas fa-volume-mute"></i><span class="audio-toggle-label">${label}</span>`;
    }
    document.querySelectorAll(".tile-video").forEach((v) => {
      v.muted = !audioEnabled;
    });
    if (audioEnabled) {
      heroAudio.play().catch((err) => console.warn("Hero audio playback failed", err));
    } else {
      heroAudio.pause();
    }
  }

  audioToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    audioEnabled = !audioEnabled;
    // First activation also promotes to persistent mode
    if (audioEnabled && toggleMode === "hero") {
      setToggleMode("persistent");
    }
    updateToggleUI();
  });

  // Click anywhere on the page = unlock audio (one-time)
  document.addEventListener(
    "click",
    () => {
      if (!audioEnabled) {
        audioEnabled = true;
        setToggleMode("persistent");
        updateToggleUI();
      }
    },
    { once: true }
  );

  // Promote to persistent mode when user scrolls past the hero,
  // even if they haven't activated audio yet — so the button follows them
  const heroSection = document.querySelector(".hero");

  function isHeroMostlyVisible() {
    if (!heroSection) return false;
    const rect = heroSection.getBoundingClientRect();
    const visibleHeight = Math.max(
      0,
      Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
    );
    return visibleHeight / rect.height >= 0.5;
  }

  if (heroSection && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      () => {
        const mostlyVisible = isHeroMostlyVisible();
        if (!mostlyVisible) {
          if (audioEnabled) heroAudio.pause();
          if (toggleMode === "hero") {
            setToggleMode("persistent");
            updateToggleUI();
          }
        } else {
          if (audioEnabled) {
            heroAudio.play().catch(() => {});
          }
          if (toggleMode === "persistent" && !audioEnabled) {
            setToggleMode("hero");
            updateToggleUI();
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    heroObserver.observe(heroSection);
  }

  //
  // === HERO VIDEO REEL ===
  //
  const videoPaths = Array.from({ length: 14 }, (_, i) => `/videos/hero${i + 1}.mp4?${ASSET_VERSION}`);

  const heroVideo = document.getElementById("hero-video");
  const nextVideo = document.getElementById("next-video");

  let currentIndex = 0;
  let isHeroActive = true;

  // Hero videos stay muted — audio comes from the separate hero_loop.mp3
  heroVideo.muted = true;
  nextVideo.muted = true;

  // Start the first video
  heroVideo.src = videoPaths[currentIndex];
  heroVideo.classList.add("active");
  heroVideo.play();

  // Preload the second video
  let nextIndex = (currentIndex + 1) % videoPaths.length;
  nextVideo.src = videoPaths[nextIndex];
  nextVideo.load();

  function swapVideos() {
    const activeVideo = isHeroActive ? heroVideo : nextVideo;
    const inactiveVideo = isHeroActive ? nextVideo : heroVideo;

    currentIndex = (currentIndex + 1) % videoPaths.length;
    const preloadIndex = (currentIndex + 1) % videoPaths.length;

    inactiveVideo.src = videoPaths[currentIndex];
    inactiveVideo.currentTime = 0;
    inactiveVideo.load();

    inactiveVideo.onplaying = () => {
      requestAnimationFrame(() => {
        inactiveVideo.classList.add("active");
        requestAnimationFrame(() => {
          activeVideo.classList.remove("active");
        });

        const preloadTarget = isHeroActive ? heroVideo : nextVideo;
        setTimeout(() => {
          preloadTarget.src = videoPaths[preloadIndex];
          preloadTarget.load();
        }, 300);

        isHeroActive = !isHeroActive;
        inactiveVideo.onplaying = null;
      });
    };

    inactiveVideo.oncanplay = () => {
      inactiveVideo.play().catch((err) => {
        console.warn("Video playback failed", err);
      });
      inactiveVideo.oncanplay = null;
    };
  }

  heroVideo.addEventListener("ended", swapVideos);
  nextVideo.addEventListener("ended", swapVideos);

  //
  // === FEATURED WORKS TILES ===
  //
  // Helper: fade a video's volume in or out over a duration
  function fadeVideoVolume(video, targetVolume, duration = 100) {
    // Cancel any in-progress fade on this video
    if (video._fadeInterval) clearInterval(video._fadeInterval);

    const startVolume = video.volume;
    const startTime = performance.now();

    video._fadeInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      video.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress >= 1) {
        clearInterval(video._fadeInterval);
        video._fadeInterval = null;
        // If we faded to 0, pause the video after the fade completes
        if (targetVolume === 0) {
          video.pause();
          video.currentTime = 0;
        }
      }
    }, 16); // ~60fps
  }

  document.querySelectorAll(".work-tile").forEach((tile) => {
    const video = tile.querySelector(".tile-video");
    const poster = tile.querySelector(".tile-poster");
    if (!video) return;
  
    video.muted = !audioEnabled;
    video.volume = 0; // start silent so fade-in is noticeable
  
    tile.addEventListener("mouseenter", () => {
      if (audioEnabled) heroAudio.pause();
  
      video.muted = !audioEnabled;
      video.volume = 0; // reset before fade-in
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.play();
        });
      }
      if (poster) poster.style.opacity = "0";
  
      // Fade in over 250ms
      fadeVideoVolume(video, 1.0, 250);
    });
  
    tile.addEventListener("mouseleave", () => {
      if (poster) poster.style.opacity = "1";
  
      // Fade out over 200ms (pauses video when fade completes)
      fadeVideoVolume(video, 0, 200);
  
      if (audioEnabled && isHeroMostlyVisible()) {
        heroAudio.play().catch(() => {});
      }
    });
  });

  //
  // === SIDEBAR OVERLAY ===
  //
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) {
    overlay.addEventListener("click", () => {
      const sidebar = document.getElementById("sidebar");
      const hamburger = document.getElementById("hamburger");
      if (sidebar) sidebar.classList.remove("active");
      if (hamburger) hamburger.classList.remove("active");
    });
  }
});
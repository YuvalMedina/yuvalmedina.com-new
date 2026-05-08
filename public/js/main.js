document.addEventListener("DOMContentLoaded", function () {
  //
  // === AUDIO STATE & UNMUTE TOGGLE ===
  //
  const ASSET_VERSION = "v2"; // bump this whenever you replace preview/hero/audio files

  let audioEnabled = false;
  let toggleMode = "hero"; // "hero" = big CTA in hero, "persistent" = small bottom-right

  // Pool of hero audio previews — add/remove files as you like.
  // Filenames are relative to /audio/. Order doesn't matter; they get shuffled.
  const heroAudioFiles = [
    "hero_loop_1.mp3",
    "hero_loop_2.mp3",
    "hero_loop_3.mp3",
    "hero_loop_4.mp3",
    "hero_loop_5.mp3",
  ];

  // Fisher-Yates shuffle, with a guard against the first track of a new
  // shuffle being the same as the last track of the previous one.
  function shuffleAudioQueue(files, lastPlayed) {
    const arr = files.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.length > 1 && arr[0] === lastPlayed) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    return arr;
  }

  const heroAudio = new Audio();
  heroAudio.loop = false; // we loop the playlist, not individual tracks
  heroAudio.volume = 0.7;
  heroAudio.preload = "auto";

  let heroAudioQueue = shuffleAudioQueue(heroAudioFiles, null);
  let heroAudioCurrent = null;

  function loadNextHeroTrack({ autoplay }) {
    if (heroAudioQueue.length === 0) {
      heroAudioQueue = shuffleAudioQueue(heroAudioFiles, heroAudioCurrent);
    }
    heroAudioCurrent = heroAudioQueue.shift();
    heroAudio.src = `/audio/${heroAudioCurrent}?${ASSET_VERSION}`;
    if (autoplay) {
      heroAudio.play().catch((err) => console.warn("Hero audio playback failed", err));
    }
  }

  // Advance to the next track when the current one finishes
  heroAudio.addEventListener("ended", () => {
    loadNextHeroTrack({ autoplay: true });
  });

  // Prime the first track (loaded but not playing — autoplay rules require a gesture)
  loadNextHeroTrack({ autoplay: false });

  const HERO_AUDIO_TARGET_VOLUME = 0.7;
  const HERO_FADE_IN_MS = 600;
  const HERO_FADE_OUT_MS = 400;

  // Helper: fade a media's volume in or out over a duration
  function fadeMediaVolume(media, targetVolume, duration = 100, { resetOnPause = true } = {}) {
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

  function playHeroAudio() {
    if (heroAudio._fadeInterval) clearInterval(heroAudio._fadeInterval);
    if (heroAudio.paused) {
      heroAudio.volume = 0;
      heroAudio.play().catch((err) => console.warn("Hero audio playback failed", err));
    }
    fadeMediaVolume(heroAudio, HERO_AUDIO_TARGET_VOLUME, HERO_FADE_IN_MS, { resetOnPause: false });
  }

  function pauseHeroAudio() {
    fadeMediaVolume(heroAudio, 0, HERO_FADE_OUT_MS, { resetOnPause: false });
  }

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
      playHeroAudio();
    } else {
      pauseHeroAudio();
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
          if (audioEnabled) pauseHeroAudio();
          if (toggleMode === "hero") {
            setToggleMode("persistent");
            updateToggleUI();
          }
        } else {
          if (audioEnabled) {
            playHeroAudio();
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

  document.querySelectorAll(".work-tile").forEach((tile) => {
    const video = tile.querySelector(".tile-video");
    const poster = tile.querySelector(".tile-poster");
    if (!video) return;
  
    video.muted = !audioEnabled;
    video.volume = 0; // start silent so fade-in is noticeable
  
    tile.addEventListener("mouseenter", () => {
      if (audioEnabled) pauseHeroAudio();
  
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
      fadeMediaVolume(video, 1.0, 250);
    });
  
    tile.addEventListener("mouseleave", () => {
      if (poster) poster.style.opacity = "1";
  
      // Fade out over 200ms (pauses video when fade completes)
      fadeMediaVolume(video, 0, 200);
  
      if (audioEnabled && isHeroMostlyVisible()) {
        playHeroAudio();
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
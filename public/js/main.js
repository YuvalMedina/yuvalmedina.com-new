document.addEventListener("DOMContentLoaded", function () {
    //
    // === HERO VIDEO REEL ===
    //
    const videoPaths = Array.from({ length: 14 }, (_, i) => `/videos/hero${i + 1}.mp4`);

    const heroVideo = document.getElementById("hero-video");
    const nextVideo = document.getElementById("next-video");

    let currentIndex = 0;
    let isHeroActive = true;

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
      
        // Prepare next video invisibly
        inactiveVideo.src = videoPaths[currentIndex];
        inactiveVideo.currentTime = 0;
        inactiveVideo.load();
      
        // Wait for it to start playing (not just "canplay")
        inactiveVideo.onplaying = () => {
          requestAnimationFrame(() => {
            inactiveVideo.classList.add("active");
      
            // Hide current video AFTER new one is truly playing
            requestAnimationFrame(() => {
              activeVideo.classList.remove("active");
            });
      
            // Preload the next-next video after visual transition
            const preloadTarget = isHeroActive ? heroVideo : nextVideo;
            setTimeout(() => {
              preloadTarget.src = videoPaths[preloadIndex];
              preloadTarget.load();
            }, 300); // buffer delay to avoid showing wrong frame
      
            isHeroActive = !isHeroActive;
            inactiveVideo.onplaying = null;
          });
        };
      
        // Start playing as soon as it can
        inactiveVideo.oncanplay = () => {
          inactiveVideo.play().catch(err => {
            console.warn("Video playback failed", err);
          });
          inactiveVideo.oncanplay = null;
        };
    }      

    // Only run swap after video finishes
    heroVideo.addEventListener("ended", swapVideos);
    nextVideo.addEventListener("ended", swapVideos);
  });
  
  document.querySelectorAll('.work-tile').forEach(tile => {
    const video = tile.querySelector('.tile-video');
    tile.addEventListener('mouseenter', () => video.play());
    tile.addEventListener('mouseleave', () => video.pause());
  });

const overlay = document.getElementById("sidebar-overlay");

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  hamburger.classList.remove("active");
});

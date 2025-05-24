document.addEventListener("DOMContentLoaded", function () {
    //
    // === HERO VIDEO REEL ===
    //
    const videoPaths = Array.from({ length: 27 }, (_, i) => `/videos/hero${i + 1}.mp4`);

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
    
    //
    // === MEDIA PREVIEW CAROUSEL ===
    //
    const mediaData = [
      {
        type: "youtube",
        name: "Yuval Medina - \"Focusing on Other Things\"",
        id: "T-qgC0ttAUY",
        link: "https://www.youtube.com/watch?v=T-qgC0ttAUY"
      },
      {
        type: "youtube",
        name: "\"No one, voices, answers\" (NOVA) by Yuval Medina",
        id: "tEO_5tmE-vk",
        link: "https://www.youtube.com/watch?v=tEO_5tmE-vk"
      },
      {
        type: "youtube",
        name: "Incredible Orca Hunt - Original Soundtrack by Yuval Medina",
        id: "zrVjaif8qos",
        link: "https://www.youtube.com/watch?v=zrVjaif8qos"
      },
      {
        type: "youtube",
        name: "Yuval Medina - \"Elegie for that which, in good time, is behind us\"",
        id: "Ba3b0dP7ne4",
        link: "https://www.youtube.com/watch?v=Ba3b0dP7ne4"
      },
      {
        type: "spotify",
        name: "Yuval Medina - \"In Tempo\"",
        embed: "https://open.spotify.com/embed/track/2OmAbaAOthbnZisPKkyiEO",
        link: "https://open.spotify.com/track/2OmAbaAOthbnZisPKkyiEO"
      },
      {
        type: "spotify",
        name: "Yuval Medina - \"Cave\"",
        embed: "https://open.spotify.com/embed/track/3BtpoiI0comDUlQKeZ8T5H",
        link: "https://open.spotify.com/track/3BtpoiI0comDUlQKeZ8T5H"
      }
      // Add more items here
    ];
  
    const container = document.getElementById("media-container");
    let currentMediaIndex = 0;
  
    function renderMedia(index) {
        const media = mediaData[index];
        let previewHTML = '';
        let titleHTML = '';
      
        if (media.type === "youtube") {
            previewHTML = `
                <div class="preview-thumbnail media-clickable" style="background-image: url('/images/${media.id}.jpg');">
                    <div class="youtube-overlay">
                    <a href="https://www.youtube.com/@yuvalcomposer" target="_blank" rel="noopener noreferrer">
                        <img class="youtube-profile" src="/images/youtube_profile.jpg" alt="Yuval Medina">
                    </a>
                    <div class="youtube-title">${media.name}</div>
                    </div>
                    <div class="play-button">▶</div>
                </div>
            `;
        } else if (media.type === "spotify") {
          previewHTML = `
            <div class="spotify-wrapper media-clickable">
              <iframe src="${media.embed}" allowfullscreen loading="lazy"></iframe>
            </div>
          `;
        }
      
        container.innerHTML = `
          <div class="media-body">
            ${previewHTML}
            ${titleHTML}
          </div>
        `;
      
        const clickable = container.querySelector('.media-clickable');
        if (clickable) {
            clickable.onclick = (e) => {
              // Don't trigger if user clicked a link inside the overlay
              if (e.target.closest('a')) return;
              window.open(media.link, '_blank');
            };
        }          
    }               
  
    document.getElementById("prev-btn").onclick = () => {
      currentMediaIndex = (currentMediaIndex - 1 + mediaData.length) % mediaData.length;
      renderMedia(currentMediaIndex);
    };
  
    document.getElementById("next-btn").onclick = () => {
      currentMediaIndex = (currentMediaIndex + 1) % mediaData.length;
      renderMedia(currentMediaIndex);
    };
  
    renderMedia(currentMediaIndex);
  });
  
  document.querySelectorAll('.tile-video').forEach(video => {
    video.addEventListener('mouseenter', () => video.play());
    video.addEventListener('mouseleave', () => video.pause());
  });

const overlay = document.getElementById("sidebar-overlay");

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  hamburger.classList.remove("active");
});

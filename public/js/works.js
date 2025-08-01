document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("catalog-grid");
  
    const response = await fetch("/works/works.json");
    const allWorks = await response.json();
  
    function renderWorks(worksToRender) {
      // Sort works so that ones with media_preview appear first
      worksToRender.sort((a, b) => {
        const hasMediaA = a.media_preview ? 1 : 0;
        const hasMediaB = b.media_preview ? 1 : 0;
        return hasMediaB - hasMediaA; // descending: true comes before false
      });

      grid.innerHTML = "";
      worksToRender.forEach((work) => {
        const item = document.createElement("div");
        item.className = "catalog-item";
  
        const media = `
          <div class="video-wrapper">
            <img class="tile-poster" src="../images/${work.slug}_preview.jpg" alt="${work.title}">
            <video class="tile-video" muted loop preload="none" src="../videos/${work.slug}_preview.mp4"></video>
          </div>
        `;
  
        item.innerHTML = `
        <a class="catalog-item" href="${work.link}".split('/').pop()>
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
        video.addEventListener("mouseenter", () => video.play());
        video.addEventListener("mouseleave", () => video.pause());
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
  
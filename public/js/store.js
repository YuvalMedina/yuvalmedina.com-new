document.addEventListener("DOMContentLoaded", async () => {
  const modal = document.getElementById("store-modal");
  const modalContent = document.getElementById("modal-content");
  const closeModal = document.querySelector(".modal-close");
  const grid = document.getElementById("store-grid");

  // Close modal functionality
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    setTimeout(() => {
      modalContent.innerHTML = "";
    }, 300);
  });

  const backdrop = document.querySelector(".modal-backdrop");

  backdrop.addEventListener("click", () => {
    modal.classList.add("hidden");
    setTimeout(() => {
      modalContent.innerHTML = "";
    }, 300);
  });

  // Load JSON data
  const response = await fetch("/works/works.json");

  // Clear loader
  grid.innerHTML = "";

  // Render grid items
  function renderWorks(worksToRender) {
    grid.innerHTML = "";
  
    worksToRender.forEach((work, index) => {
      if (!work.electronic_work) {
        const item = document.createElement("div");
        item.className = "store-item";
        item.innerHTML = `
          <div class="store-thumbnail" style="background-image: url('${work.image}')"></div>
          <div class="store-title">${work.title}</div>
        `;
        item.addEventListener("click", () => openModal(work));
        grid.appendChild(item);
      }
    });
  }

  // Render modal popup content
  function openModal(work) {
    let mediaHTML = "";
    if (work.media_preview) {
      if (work.media_preview.type === "youtube") {
        mediaHTML = `
          <div class="media-preview">
            <iframe src="https://www.youtube.com/embed/${work.media_preview.id}" 
                    frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
          </div>`;
      } else if (work.media_preview.type === "spotify") {
        mediaHTML = `
          <div class="media-preview">
            ${work.media_preview.embed}
          </div>`;
      } else if (work.media_preview.type === "soundcloud") {
        mediaHTML = `
          <div class="media-preview">
            <iframe width="100%" height="166" scrolling="no" frameborder="no"
              allow="autoplay" src="${work.media_preview.embed}">
            </iframe>
          </div>`;
      }
    }
    modalContent.innerHTML = `
      <a href="${work.link}"><h2>${work.title}</h2></a>
      ${mediaHTML}
      <div class="score-preview">
        <img src="${work.image}" alt="Score preview for ${work.title}" />
      </div>
      <p><strong>Instrumentation:</strong> ${work.instrumentation}</p>
      <p><strong>Difficulty:</strong> ${work.difficulty}</p>
      <p><strong>Duration:</strong> ${work.duration}</p>
      <p><strong>Year:</strong> ${work.year}</p>
      <p><strong>Pages:</strong></p>
      <ul>
        ${Object.entries(work.pages).map(([part, count]) =>
          `<li>${part.replace(/_/g, ' ')}: ${count}</li>`).join("")}
      </ul>
      <p><strong>Parts Included:</strong> ${work.parts_included}</p>
      <div class="paypal-button" id="paypal-container-${work.paypal_button_id}"></div>
    `;
    modal.classList.remove("hidden");
    paypal.HostedButtons({
      hostedButtonId: work.paypal_button_id,
    }).render("#paypal-container-".concat(work.paypal_button_id))
  }

  function applyFilters() {
    const typeFilter = document.getElementById("filter-type").value.toLowerCase();
    const difficultyFilter = document.getElementById("filter-difficulty").value.toLowerCase();
    const instrumentFilter = document.getElementById("filter-instrument").value.toLowerCase();
    const titleFilter = document.getElementById("filter-title").value.toLowerCase();
  
    const filtered = allWorks.filter((work) => {
      const matchesType =
        !typeFilter ||
        work.type?.toLowerCase() === typeFilter || 
        (work.tags || []).some(tag => tag.toLowerCase() === typeFilter);
      const matchesDifficulty = !difficultyFilter || work.difficulty?.toLowerCase().includes(difficultyFilter);
      const matchesInstrument =
        !instrumentFilter ||
        (work.instrument_filters || []).some((instr) => instr.toLowerCase().includes(instrumentFilter));
      const matchesTitle = !titleFilter || work.title?.toLowerCase().includes(titleFilter);
  
      return matchesType && matchesDifficulty && matchesInstrument && matchesTitle;
    });
  
    grid.classList.remove("visible");
    void grid.offsetWidth; // force reflow
    grid.classList.add("visible");
    renderWorks(filtered);
  }
  
  document.getElementById("filter-type").addEventListener("change", applyFilters);
  document.getElementById("filter-difficulty").addEventListener("change", applyFilters);
  document.getElementById("filter-instrument").addEventListener("input", applyFilters);
  document.getElementById("filter-title").addEventListener("input", applyFilters);

  const allWorks = await response.json();
  renderWorks(allWorks);
  const urlParams = new URLSearchParams(window.location.search);
  const workSlug = urlParams.get("w");

  if (workSlug) {
    const workToOpen = allWorks.find(work => work.slug === workSlug);
    if (workToOpen) {
      openModal(workToOpen);
    }
  }
  grid.classList.add("visible");
});

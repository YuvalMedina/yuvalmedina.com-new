document.addEventListener("DOMContentLoaded", async () => {
    const slug = window.location.pathname.split("/").pop().replaceAll("-", "_");
  
    try {
      const response = await fetch("/works/works.json");
      const works = await response.json();
      const work = works.find(w => w.slug === slug);
  
      if (!work) return;

      document.getElementsByTagName('title')[0].textContent = `\"${work.title}\" - by Yuval Medina`;
  
      document.getElementById("work-title").textContent = work.title;
      document.getElementById("work-subtitle").textContent = work.subtitle || "";
      if (work.description) document.getElementById("work-description").innerHTML = work.description;
      document.getElementById("work-instrumentation").textContent = work.instrumentation;
      document.getElementById("work-duration").textContent = work.duration;
      document.getElementById("work-difficulty").textContent = work.difficulty;
      document.getElementById("work-year").textContent = work.year;
      document.getElementById("work-parts-included").textContent = work.parts_included;
  
      // Pages list
      const pagesList = document.getElementById("pages-list");
      for (const [part, pages] of Object.entries(work.pages)) {
        const li = document.createElement("li");
        li.textContent = `${part.replace(/_/g, " ")}: ${pages}`;
        pagesList.appendChild(li);
      }
  
      // Media preview
      const mediaContainer = document.getElementById("media-preview");
      if (work.media_preview) {
        let embed = "";
        if (work.media_preview.type === "youtube") {
          console.log(work.media_preview.id);
          embed = `<iframe src="https://www.youtube.com/embed/${work.media_preview.id}" frameborder="0" allowfullscreen></iframe>`;
        } else if (work.media_preview.type === "spotify") {
          embed = work.media_preview.embed;
        } else if (work.media_preview.type === "soundcloud") {
          embed = `<iframe src="${work.media_preview.embed}" frameborder="no" scrolling="no"></iframe>`;
        }
        mediaContainer.innerHTML = embed;
      } else {
        mediaContainer.style.display = "none";
      }
  
      // Purchase link to open modal via store
      document.querySelector("#purchase-link a").href = `/store/index.html?w=${slug}`;
    } catch (err) {
      console.error("Failed to load work info", err);
    }
  });
  
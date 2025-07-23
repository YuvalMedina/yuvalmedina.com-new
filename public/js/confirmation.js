document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("w");
    const pageTitle = document.getElementsByTagName("title")[0];
    const titleEl = document.getElementById("work-title");
    const mediaEl = document.getElementById("work-media");
    const catalogLink = document.getElementById("catalog-link");
  
    if (!slug) {
      window.location.href = "/store/index.html";
      return;
    }
  
    try {
      const res = await fetch("/works/works.json");
      const works = await res.json();
      const normalizedSlug = slug.toLowerCase().replaceAll("-", "_");
      const work = works.find(w => w.slug.toLowerCase() === normalizedSlug);
  
      if (!work) {
        titleEl.textContent = `Work not found: ${slug}`;
        return;
      }
  
      pageTitle.textContent = `Purchase confirmation – \"${work.title}\" by Yuval Medina`;
      titleEl.textContent = work.title;
      catalogLink.href = `/works/${slug.replaceAll("_", "-")}`;
  
      if (work.media_preview) {
        let mediaHTML = "";
        if (work.media_preview.type === "youtube") {
          mediaHTML = `<iframe src="https://www.youtube.com/embed/${work.media_preview.id}" frameborder="0" allowfullscreen></iframe>`;
        } else if (work.media_preview.type === "spotify") {
          mediaHTML = `<iframe src="${work.media_preview.embed}" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
        } else if (work.media_preview.type === "soundcloud") {
          mediaHTML = `<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="${work.media_preview.embed}"></iframe>`;
        }
        mediaEl.innerHTML = mediaHTML;
      }
  
    } catch (err) {
      titleEl.textContent = "Error loading work information.";
      console.error(err);
    }
});
  
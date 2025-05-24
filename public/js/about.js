document.addEventListener("DOMContentLoaded", () => {
  const bioSection = document.querySelector(".bio-section");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bioSection.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });
  observer.observe(bioSection);
});
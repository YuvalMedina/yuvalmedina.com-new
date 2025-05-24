document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById("hamburger");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById('sidebar-overlay');

    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      hamburger.classList.toggle("active");
      overlay.classList.toggle("active");
    
      const allLinks = sidebar.querySelectorAll("li");
      allLinks.forEach((li, index) => {
        li.classList.remove("slide-in"); // reset animation
        void li.offsetWidth; // 💡 force reflow so re-adding the class restarts animation
        setTimeout(() => {
          li.classList.add("slide-in");
        }, index * 100);
      });
    });
});

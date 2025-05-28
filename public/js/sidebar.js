document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById("hamburger");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const backdrop = document.getElementById("sidebar-backdrop");

    function openSidebar() {
        sidebar.classList.add("active");
        hamburger.classList.add("active");
        overlay.classList.add("active");
        backdrop.classList.add("active");

        const allLinks = sidebar.querySelectorAll("li");
        allLinks.forEach((li, index) => {
            li.classList.remove("slide-in");
            void li.offsetWidth;
            setTimeout(() => {
                li.classList.add("slide-in");
            }, index * 100);
        });
    }

    function closeSidebar() {
        sidebar.classList.remove("active");
        hamburger.classList.remove("active");
        overlay.classList.remove("active");
        backdrop.classList.remove("active");
    }

    hamburger.addEventListener("click", () => {
        if (sidebar.classList.contains("active")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    backdrop.addEventListener("click", closeSidebar);
});

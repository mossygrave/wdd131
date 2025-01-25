// JavaScript to toggle navigation menu
document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector("header button");
    const navMenu = document.querySelector("header nav ul");

    menuButton.addEventListener("click", () => {
        navMenu.classList.toggle("show");
    });
});

const hamburger = document.querySelector(".header__hamburger");
const navbar = document.querySelector(".header__navbar");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navbar.classList.toggle("active");
});

document.querySelectorAll(".header__navbar a").forEach((n) =>
  n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navbar.classList.remove("active");
  })
);

const themeToggle = document.getElementById("theme-toggle");

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark" || (!savedTheme && prefersDark.matches)) {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.checked = true;
}

themeToggle.addEventListener("change", function () {
  if (this.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }
});

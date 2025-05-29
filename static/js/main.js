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

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeToggle) {
    themeToggle.checked = theme === "dark";
  }
}

const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
let initialTheme = "light";

if (savedTheme) {
  initialTheme = savedTheme;
} else if (prefersDark) {
  initialTheme = "dark";
}

setTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener("change", function () {
    setTheme(this.checked ? "dark" : "light");
  });
}

gsap.from(".header,.hero__text", {
  duration: 1,
  ease: "circ.out",
  y: -250,
});

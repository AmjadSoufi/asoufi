const projectData = {
  "make-it-happen": {
    title: "Make It Happen",
    category: "To-Do App",
    image: "./static/images/make-it-happen.png",
    description:
      "A comprehensive university project focused on creating a practical and user-friendly to-do list application for daily task management. This application emphasizes clean design, intuitive user experience, and efficient task organization to help users stay productive and organized.",
    technologies: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "Local Storage",
      "Responsive Design",
    ],
    features: [
      "Add, edit, and delete tasks efficiently",
      "Mark tasks as complete or incomplete",
      "Categorize tasks by priority levels",
      "Local storage for data persistence",
      "Responsive design for all devices",
      "Clean and intuitive user interface",
      "Task filtering and sorting options",
    ],
    githubLink: "https://github.com/pgmgent-pgm-3/make-it-happen-AmjadSoufi",
  },
  "best-of-2024": {
    title: "Best of 2024",
    category: "Showcase",
    image: "./static/images/best-of-2024.png",
    description:
      "An engaging university project that showcases the best entertainment content of 2024, including movies, albums, series, games, and music. This project demonstrates advanced web development skills while creating an immersive showcase experience for users to explore top-rated content.",
    technologies: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "API Integration",
      "Grid Layout",
      "Animations",
    ],
    features: [
      "Interactive showcase of 2024's best content",
      "Dynamic content filtering by category",
      "Responsive grid layout design",
      "Smooth animations and transitions",
      "Search functionality across all categories",
      "Detailed information cards for each item",
      "Modern and visually appealing interface",
    ],
    githubLink: "https://github.com/pgm-2425-atwork-1/project-2-AmjadSoufi",
  },
  "memory-game": {
    title: "Memory Game",
    category: "Game",
    image: "./static/images/Memory-game.png",
    description:
      "An educational university project designed specifically for new students interested in programming. This interactive memory game serves as both entertainment and a learning tool, introducing programming languages, explaining how programming works, and providing a comprehensive tutorial for students to create their own version of the game.",
    technologies: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "Game Logic",
      "Educational Content",
      "Tutorial System",
    ],
    features: [
      "Interactive memory card matching game",
      "Progressive difficulty levels",
      "Score tracking and timer functionality",
      "Educational programming tutorials",
      "Step-by-step game creation guide",
      "Code examples and explanations",
      "Beginner-friendly programming concepts",
      "Responsive game interface",
    ],
    githubLink:
      "https://github.com/pgmgent-atwork2/project-1-workshop-start-to-code-amjad-serdar",
  },
};

function openModal(projectId) {
  const modal = document.getElementById("projectModal");
  const project = projectData[projectId];

  if (!project) return;

  const modalImage = document.getElementById("modalImage");
  const modalCategory = document.getElementById("modalCategory");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalGithubLink = document.getElementById("modalGithubLink");

  if (modalImage) {
    modalImage.src = project.image;
    modalImage.alt = `Screenshot of ${project.title} project`;
  }

  if (modalCategory) modalCategory.textContent = project.category;
  if (modalTitle) modalTitle.textContent = project.title;
  if (modalDescription) modalDescription.textContent = project.description;

  const techContainer = document.getElementById("modalTechnologies");
  if (techContainer) {
    techContainer.innerHTML = `
      <h4>Technologies Used:</h4>
      <div class="modal__tech-list">
        ${project.technologies
          .map((tech) => `<span class="modal__tech-item">${tech}</span>`)
          .join("")}
      </div>
    `;
  }

  const featuresContainer = document.getElementById("modalFeatures");
  if (featuresContainer) {
    featuresContainer.innerHTML = `
      <h4>Key Features:</h4>
      <ul>
        ${project.features.map((feature) => `<li>${feature}</li>`).join("")}
      </ul>
    `;
  }

  if (modalGithubLink) {
    modalGithubLink.href = project.githubLink;
  }

  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);

  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("projectModal");

  modal.classList.remove("active");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);

  document.body.style.overflow = "auto";
}

document.addEventListener("DOMContentLoaded", function () {
  const projectItems = document.querySelectorAll(".projects__item");

  projectItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      if (event.target.classList.contains("projects__item-link")) {
        return;
      }

      const projectId = this.getAttribute("data-project");
      if (projectId) {
        openModal(projectId);
      }
    });
  });

  const buttons = document.querySelectorAll(".projects__item-link");
  buttons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const projectId =
        this.closest(".projects__item").getAttribute("data-project");
      if (projectId) {
        openModal(projectId);
      }
    });
  });

  const modal = document.getElementById("projectModal");
  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  const closeButton = document.querySelector(".close");
  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

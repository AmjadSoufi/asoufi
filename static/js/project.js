let projectData = {};

async function fetchProjectData() {
  try {
    const response = await fetch("./static/data/projectData.json");
    if (!response.ok) throw new Error("Failed to load project data");
    projectData = await response.json();
  } catch (error) {
    console.error("Error loading project data:", error);
  }
}

// Fetch project data before DOMContentLoaded logic
fetchProjectData().then(() => {
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
});

function openModal(projectId) {
  const modal = document.getElementById("projectModal");
  const project = projectData[projectId];

  if (!project) return;

  const modalImage = document.getElementById("modalImage");
  const modalCategory = document.getElementById("modalCategory");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalGithubLink = document.getElementById("modalGithubLink");
  const modalLiveDemoLink = document.getElementById("modalLiveDemoLink");

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
  if (modalLiveDemoLink) {
    if (project.liveDemo) {
      modalLiveDemoLink.href = project.liveDemo;
      modalLiveDemoLink.style.display = "inline-block";
    } else {
      modalLiveDemoLink.href = "";
      modalLiveDemoLink.style.display = "none";
    }
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

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initHeader();
  initAnimations();
  initMobileMenu();
});

// Custom Cursor - Optimized with requestAnimationFrame
function initCursor() {
  const cursorDot = document.querySelector('[data-cursor-dot]');
  const cursorOutline = document.querySelector('[data-cursor-outline]');

  if (!cursorDot || !cursorOutline) return;

  // Hide default cursor
  document.body.style.cursor = 'none';

  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update dot immediately for responsiveness
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Smooth follow for outline using rAF loop
  const animateOutline = () => {
    // Linear interpolation for smooth movement
    outlineX += (mouseX - outlineX) * 0.15; // increased speed slightly
    outlineY += (mouseY - outlineY) * 0.15;

    cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
    
    requestAnimationFrame(animateOutline);
  };
  requestAnimationFrame(animateOutline);

  // Hover effects
  const interactiveElements = document.querySelectorAll('a, button, .project-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOutline.classList.add('hovered');
      // Use class for styles instead of inline for better performance
      cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%) scale(1.5)`;
      cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    el.addEventListener('mouseleave', () => {
      cursorOutline.classList.remove('hovered');
      cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%) scale(1)`;
      cursorOutline.style.backgroundColor = 'transparent';
    });
  });
}

// Header Scroll Effect - Throttled
function initHeader() {
  const header = document.querySelector('.header');
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Active Link Highlighting logic moved here
    updateActiveLinks();
    
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
}

function updateActiveLinks() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.header__link');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    // const sectionHeight = section.clientHeight; // Unused
    if (window.scrollY >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });
}

// GSAP Animations
function initAnimations() {
  // Hero Animations
  const heroElements = document.querySelectorAll('.fade-in-up');
  heroElements.forEach(el => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 90%", // Trigger earlier
        toggleActions: "play none none reverse"
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    });
  });

  // Skills Stagger
  gsap.set(".skill-card", { y: 30, opacity: 0 });
  
  gsap.to(".skill-card", {
    scrollTrigger: {
      trigger: ".skills__grid",
      start: "top 85%"
    },
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out"
  });
}

// Mobile Menu
function initMobileMenu() {
  const hamburger = document.querySelector('.header__hamburger');
  
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      
      let overlay = document.querySelector('.mobile-nav');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('mobile-nav');
        overlay.innerHTML = `
          <nav class="mobile-nav__menu">
            <a href="#home" class="mobile-nav__link">Home</a>
            <a href="#about" class="mobile-nav__link">About</a>
            <a href="#skills" class="mobile-nav__link">Skills</a>
            <a href="#projects" class="mobile-nav__link">Work</a>
            <a href="#contact" class="mobile-nav__link">Contact</a>
          </nav>
        `;
        document.body.appendChild(overlay);
        
        const links = overlay.querySelectorAll('.mobile-nav__link');
        links.forEach(link => {
          link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            overlay.classList.remove('active');
          });
        });
      }
      
      overlay.classList.toggle('active');
    });
  }
}

// Modal Logic
window.openModal = function(projectId) {
  const modal = document.getElementById('projectModal');
  const projectData = getProjectData(projectId);
  
  if (projectData) {
    document.getElementById('modalImage').src = projectData.image;
    document.getElementById('modalCategory').textContent = projectData.category;
    document.getElementById('modalTitle').textContent = projectData.title;
    document.getElementById('modalDescription').textContent = projectData.description;
    
    const techContainer = document.getElementById('modalTechnologies');
    techContainer.innerHTML = projectData.technologies.map(tech => 
      `<span class="project-card__tags span" style="margin-right:0.5rem; background:var(--surface-hover); padding:0.25rem 0.75rem; border-radius:20px; font-size:0.8rem;">${tech}</span>`
    ).join('');
    
    const featuresContainer = document.getElementById('modalFeatures');
    featuresContainer.innerHTML = `<ul>${projectData.features.map(f => `<li>• ${f}</li>`).join('')}</ul>`;
    
    document.getElementById('modalGithubLink').href = projectData.github;
    document.getElementById('modalLiveDemoLink').href = projectData.live;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = function() {
  const modal = document.getElementById('projectModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
};

// Project Data
function getProjectData(id) {
  const projects = {
    'kanban-project': {
      title: 'Kanban Project Management',
      category: 'Web Application',
      image: './static/images/Kanban.png',
      description: 'A comprehensive project management tool inspired by Trello. Users can create boards, lists, and cards to organize tasks efficiently.',
      technologies: ['React', 'Strapi', 'Sass', 'DnD Kit'],
      features: ['Drag and drop tasks', 'User authentication', 'Real-time updates', 'Dark mode'],
      github: 'https://github.com/AmjadSoufi/kanban-project',
      live: '#'
    },
    'make-it-happen': {
      title: 'Make It Happen',
      category: 'Productivity',
      image: './static/images/make-it-happen.png',
      description: 'A minimalist to-do list application designed to help users focus on their daily tasks.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      features: ['Local storage save', 'Task categorization', 'Progress tracking'],
      github: 'https://github.com/AmjadSoufi/make-it-happen',
      live: '#'
    },
    'best-of-2024': {
      title: 'Best of 2024',
      category: 'Showcase',
      image: './static/images/best-of-2024.png',
      description: 'A curated collection of the best entertainment media released in 2024.',
      technologies: ['HTML', 'CSS', 'Responsive Design'],
      features: ['Grid layout', 'Media embedding', 'Smooth transitions'],
      github: 'https://github.com/AmjadSoufi/best-of-2024',
      live: '#'
    },
    'memory-game': {
      title: 'Memory Game',
      category: 'Game',
      image: './static/images/Memory-game.png',
      description: 'An interactive memory card game to test cognitive skills.',
      technologies: ['JavaScript', 'DOM Manipulation'],
      features: ['Timer', 'Score tracking', 'Difficulty levels'],
      github: 'https://github.com/AmjadSoufi/memory-game',
      live: '#'
    },
    'kpog': {
      title: 'KPOG',
      category: 'Web Platform',
      image: './static/images/Kpog.png',
      description: 'A scalable web platform built for a university project.',
      technologies: ['Modern Web Tech', 'Scalable Architecture'],
      features: ['Responsive design', 'User-friendly interface'],
      github: 'https://github.com/AmjadSoufi/kpog',
      live: '#'
    }
  };
  return projects[id];
}

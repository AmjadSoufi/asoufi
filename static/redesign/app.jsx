// Root app for the Amjad Soufi portfolio redesign.
// The single visual variant is "editorial"; its tokens live in the stylesheet
// (data-variant="editorial" is pinned in index.html).

import { safeStorage, scrollToId, ScrollProgress, Marquee } from "./utils.jsx";
import { Intro } from "./intro.jsx";
import { NavBar, Hero } from "./nav-hero.jsx";
import { About, Skills, Experience } from "./about-skills.jsx";
import { Work, ProjectModal, Contact, Footer } from "./work-contact.jsx";
import { PORTFOLIO } from "./data.js";

function App() {
  const [theme, setTheme] = React.useState(() => safeStorage.get("theme", "dark"));

  const [active, setActive] = React.useState("intro");
  const [openId, setOpenId] = React.useState(null);
  const [introReplay, setIntroReplay] = React.useState(0);
  const [, setIntroOver] = React.useState(false);

  const data = PORTFOLIO;

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // --bg is theme-dependent now, so read the resolved token instead of a
    // hardcoded color.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
      if (bg) meta.setAttribute("content", bg);
    }
  }, [theme]);

  const toggleTheme = (e) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const btn = e?.currentTarget;

    if (!document.startViewTransition || !btn) {
      setTheme(nextTheme);
      safeStorage.set("theme", nextTheme);
      return;
    }

    const rect = btn.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width / 2);
    const cy = Math.round(rect.top + rect.height / 2);
    const maxR = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    );

    document.documentElement.style.setProperty("--ripple-x", cx + "px");
    document.documentElement.style.setProperty("--ripple-y", cy + "px");
    document.documentElement.style.setProperty("--ripple-r", maxR + "px");

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
      safeStorage.set("theme", nextTheme);
    });
    transition.ready.catch(() => {});
  };

  React.useEffect(() => {
    const ids = ["intro", "about", "skills", "work", "contact"];
    const opts = { rootMargin: "-40% 0px -55% 0px", threshold: 0 };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { setActive(e.target.id); break; }
      }
    }, opts);
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const jump = (id) => scrollToId(id, 72);
  const open = (id, trigger) => {
    // Safari does not focus buttons on mouse click; remember the real opener.
    trigger?.focus({ preventScroll: true });
    setOpenId(id);
  };
  const close = React.useCallback(() => setOpenId(null), []);

  const project = data.projects.find((p) => p.id === openId);

  const marqueeItems = [
    { label: "React" },
    { label: "TypeScript" },
    { label: "Node.js" },
    { label: "Available for hire" },
    { label: "Strapi" },
    { label: "Sass" },
    { label: "Based in Bruges" },
    { label: "Open to remote" },
  ];

  return (
    <div className="app" data-screen-label="Portfolio">
      <Intro
        key={introReplay}
        forcePlay={introReplay > 0}
        onDone={() => setIntroOver(true)}
      />
      <ScrollProgress />
      <NavBar
        active={active}
        onJump={jump}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <Hero data={data} onJump={jump} onOpenProject={open} />

      <main>
        <div className="container">
          <About data={data} />
          <Skills data={data} />
        </div>

        <Marquee items={marqueeItems} />

        <div className="container">
          <Experience data={data} />
          <Work data={data} onOpenProject={open} />
          <Contact data={data} />
        </div>
      </main>

      <Footer theme={theme} onJump={jump} />

      <ProjectModal project={project} onClose={close} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

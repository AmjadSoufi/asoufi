// Root app for the Amjad Soufi portfolio redesign.
// Locked to the "editorial" variant for production; the tweaks-panel dev UI is
// intentionally not shipped here.

function App() {
  const VARIANT_KEY = "editorial";
  const variant = window.VARIANTS[VARIANT_KEY];

  const [active, setActive] = React.useState("intro");
  const [openId, setOpenId] = React.useState(null);
  const [introReplay, setIntroReplay] = React.useState(0);
  const [, setIntroOver] = React.useState(false);

  const data = window.PORTFOLIO;

  React.useEffect(() => {
    document.documentElement.setAttribute("data-variant", VARIANT_KEY);
    document.documentElement.style.setProperty("--accent", variant.accent);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", variant.bg);
  }, [variant.accent, variant.bg]);

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
  const open = (id) => setOpenId(id);
  const close = () => setOpenId(null);

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
        variant={variant}
        forcePlay={introReplay > 0}
        onDone={() => setIntroOver(true)}
      />
      <ScrollProgress />
      <NavBar variant={variant} active={active} onJump={jump} />

      <Hero variant={variant} data={data} onJump={jump} onOpenProject={open} />

      <main>
        <div className="container">
          <About variant={variant} data={data} />
          <Skills variant={variant} data={data} />
        </div>

        <Marquee items={marqueeItems} variant={variant} />

        <div className="container">
          <Experience variant={variant} data={data} />
          <Work variant={variant} data={data} onOpenProject={open} />
          <Contact variant={variant} data={data} onJump={jump} />
        </div>
      </main>

      <Footer variant={variant} onJump={jump} />

      <ProjectModal variant={variant} project={project} onClose={close} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

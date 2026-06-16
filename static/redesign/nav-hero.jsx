// Navigation bar + hero section for the portfolio prototype.

function NavBar({ variant, active, onJump, theme, onToggleTheme }) {
  const items = [
    { id: "intro",   label: "Intro" },
    { id: "about",   label: "About" },
    { id: "skills",  label: "Skills" },
    { id: "work",    label: "Work" },
    { id: "contact", label: "Contact" },
  ];
  const isBrut = variant.grid === "swiss";
  const logoSrc = isBrut || theme === "light" ? "static/images/logo-as-dark.png" : "static/images/logo-as-white.png";

  // Mobile drawer: open state + scroll lock + close on Esc.
  const [menuOpen, setMenuOpen] = React.useState(false);
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
  const jumpAndClose = (id) => { setMenuOpen(false); onJump(id); };

  return (
    <React.Fragment>
      <header className="nav" style={{
        borderBottom: isBrut ? `2px solid ${variant.ink}` : `1px solid ${variant.line}`,
        background: variant.bg + "cc",
      }}>
        <div className="nav-inner">
          <button className="nav-mark" onClick={() => onJump("intro")} aria-label="Amjad Soufi — back to top">
            <img className="mark-logo" src={logoSrc} alt="" aria-hidden="true" />
            <span className="mark-dot" aria-hidden="true" />
            <span className="mark-name" aria-hidden="true">Amjad Soufi</span>
          </button>

          <nav className="nav-links">
            {items.map((it, i) => (
              <button
                key={it.id}
                className={"nav-link" + (active === it.id ? " is-active" : "")}
                onClick={() => onJump(it.id)}
              >
                <span className="nav-num">0{i + 1}</span>
                <span className="nav-lbl">{it.label}</span>
              </button>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              className="theme-toggle-btn"
              onClick={(e) => onToggleTheme(e)}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            <button className="nav-cta" onClick={() => onJump("contact")}>
              <span className="dot-pulse" />
              {variant.grid === "swiss" ? "Available →" : "Available"}
            </button>

            {/* Mobile-only hamburger. CSS hides this above 720px and hides the
                pill rail below 720px, so the two never show at once. */}
            <button
              className={"nav-hamburger" + (menuOpen ? " is-open" : "")}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/*
        Mobile drawer — rendered OUTSIDE the <header> so it isn't trapped
        inside the nav's stacking context (which combines a translucent
        background + backdrop-filter on iOS, making child fixed elements
        render see-through). As a sibling in the root stacking context the
        drawer paints opaquely on top of everything.
      */}
      <div
        id="mobile-nav"
        className={"nav-drawer" + (menuOpen ? " is-open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!menuOpen}
      >
        <ul className="nav-drawer-list">
          {items.map((it, i) => (
            <li key={it.id}>
              <button
                className={"nav-drawer-link" + (active === it.id ? " is-active" : "")}
                onClick={() => jumpAndClose(it.id)}
              >
                <span className="nav-drawer-num">0{i + 1}</span>
                <span className="nav-drawer-lbl">{it.label}</span>
                <span className="nav-drawer-arrow" aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="nav-drawer-foot">
          <span className="dot-pulse" aria-hidden="true" />
          <span>Available for new roles</span>
        </div>
      </div>
    </React.Fragment>
  );
}

function Hero({ variant, data, onJump, onOpenProject }) {
  const [clock, setClock] = React.useState(() => new Date());
  React.useEffect(() => {
    const i = setInterval(() => setClock(new Date()), 1000 * 30);
    return () => clearInterval(i);
  }, []);
  const time = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const isTerm = variant.grid === "ledger";
  const isBrut = variant.grid === "swiss";
  const isEd   = variant.grid === "magazine";

  return (
    <section id="intro" className="hero">
      <div className="hero-meta">
        <Reveal delay={0}>
          <div className="meta-row">
            <span className="meta-k">Portfolio</span>
            <span className="meta-v">v 2026.05</span>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="meta-row">
            <span className="meta-k">{data.location}</span>
            <span className="meta-v"><span className="dot-pulse" /> {time} CET</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="meta-row">
            <span className="meta-k">Status</span>
            <span className="meta-v">{data.status}</span>
          </div>
        </Reveal>
      </div>

      <div className="hero-body">
        <Reveal delay={120} y={24}>
          <p className="eyebrow">
            <span className="eyebrow-line" />
            {isTerm ? "$ whoami" : "Currently"}
          </p>
        </Reveal>

        <Reveal delay={200} y={28}>
          <h1 className="hero-title">
            {isEd && (
              <ClipReveal stagger={110} delay={50}>
                <span>Full-stack</span>
                <span><em>developer</em></span>
                <span>building careful</span>
                <span>web products.</span>
              </ClipReveal>
            )}
            {isTerm && (
              <ClipReveal stagger={100} delay={50}>
                <span>building.web(</span>
                <span>&nbsp;&nbsp;careful,</span>
                <span>&nbsp;&nbsp;<em>considered</em>,</span>
                <span>&nbsp;&nbsp;fast</span>
                <span>);<span className="caret" /></span>
              </ClipReveal>
            )}
            {isBrut && (
              <ClipReveal stagger={120} delay={50}>
                <span>Full</span>
                <span>Stack <em>Developer</em></span>
                <span>Index ’24 ↗</span>
              </ClipReveal>
            )}
          </h1>
        </Reveal>

        <Reveal delay={320}>
          <p className="hero-sub">{data.intro}</p>
        </Reveal>

        <Reveal delay={420}>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => onJump("work")}>
              <span>Selected work</span>
              <span className="btn-arrow">↓</span>
            </button>
            <button className="btn btn-ghost" onClick={() => onJump("contact")}>
              <span>Get in touch</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </Reveal>

        <Reveal delay={520}>
          <div className="hero-socials">
            {data.social.map((s) => (
              <a key={s.label} className="soc" href={s.href} target="_blank" rel="noreferrer">
                <span className="soc-k">{s.label}</span>
                <span className="soc-v">{s.handle}</span>
                <span className="soc-arrow">↗</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={500} className="hero-side">
        <div className="side-card">
          <div className="card-head">
            <span>{isTerm ? "// now-playing" : "Now"}</span>
            <span className="dot-pulse" />
          </div>
          <ul className="card-list">
            <li><span>Interning</span><b>BBANG — Milan</b></li>
            <li><span>Shipping</span><b>231InCloud</b></li>
            <li><span>Studying</span><b>Full-stack Web</b></li>
          </ul>
          <button className="card-foot" onClick={() => onOpenProject("kanban")}>
            Latest case study →
          </button>
        </div>
      </Reveal>

      <div className="hero-scroll">
        <span className="scroll-bar" />
        <span>{isTerm ? "scroll ↓" : "Scroll"}</span>
      </div>
    </section>
  );
}

Object.assign(window, { NavBar, Hero });

// Navigation bar + hero section for the portfolio prototype.

function NavBar({ variant, active, onJump }) {
  const items = [
    { id: "intro",   label: "Intro" },
    { id: "about",   label: "About" },
    { id: "skills",  label: "Skills" },
    { id: "work",    label: "Work" },
    { id: "contact", label: "Contact" },
  ];
  const isBrut = variant.grid === "swiss";
  const logoSrc = isBrut ? "static/images/logo-as-dark.png" : "static/images/logo-as-white.png";
  return (
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

        <button className="nav-cta" onClick={() => onJump("contact")}>
          <span className="dot-pulse" />
          {variant.grid === "swiss" ? "Available →" : "Available"}
        </button>
      </div>
    </header>
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
            <li><span>Studying</span><b>Full-stack Web</b></li>
            <li><span>Reading</span><b>Designing Data-Intensive Apps</b></li>
            <li><span>Shipping</span><b>Kanban v2</b></li>
            <li><span>Listening</span><b>Bonobo — Fragments</b></li>
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

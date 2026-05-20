// Work section (filterable project grid) + project detail modal + contact + footer.

function ProjectThumb({ project }) {
  const tiltRef = useTilt(6);
  return (
    <div ref={tiltRef} className="proj-thumb" style={{ "--hue": project.accent }}>
      <div className="thumb-grid" />
      {project.image && (
        <img
          className="thumb-image"
          src={project.image}
          alt={project.title}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="thumb-label">
        <span>{project.kind.toUpperCase()}</span>
        <span>{project.year}</span>
      </div>
      {!project.image && (
        <div className="thumb-mark">{project.title.split(" ").map(w => w[0]).join("").slice(0,3)}</div>
      )}
      <div className="thumb-overlay">
        <span className="thumb-cta">Open case →</span>
      </div>
    </div>
  );
}

// Normalize tech names so "CSS3" / "CSS", "React 19" / "React", etc. collapse
// into one filter chip. The displayed label is the normalized form.
function normalizeTech(s) {
  if (!s) return s;
  const t = String(s).trim();
  const map = {
    "CSS3": "CSS",
    "HTML5": "HTML",
    "JS": "JavaScript",
    "React 19": "React",
    "Strapi 5": "Strapi",
    "Craft CMS 5": "Craft CMS",
    "TanStack Router": "TanStack",
    "TanStack Query": "TanStack",
  };
  return map[t] || t;
}

// Filter groups — only the techs people actually browse by show up as chips.
// The niche stuff (Knex, Objection, bcrypt, JWT, DDEV, MySQL, etc.) stays
// inside each project's detail modal instead of clogging the chip bar.
const FILTER_GROUPS = [
  { label: "Frontend", techs: ["React", "Vite", "TanStack"] },
  { label: "Backend",  techs: ["Node.js", "Express", "Strapi", "Craft CMS", "PHP"] },
  { label: "Data",     techs: ["PostgreSQL", "SQLite"] },
  { label: "Language", techs: ["JavaScript", "TypeScript", "Twig"] },
];

function Work({ variant, data, onOpenProject }) {
  const isTerm = variant.grid === "ledger";

  // Pre-compute the normalized tech list per project once.
  const projTechs = React.useMemo(
    () => data.projects.map((p) => (p.stack || []).map(normalizeTech)),
    [data.projects]
  );

  // Only keep groups+techs that at least one project actually uses, so the
  // filter bar stays honest if the underlying data changes.
  const groups = React.useMemo(() => {
    const used = new Set(projTechs.flat());
    return FILTER_GROUPS
      .map((g) => ({ ...g, techs: g.techs.filter((t) => used.has(t)) }))
      .filter((g) => g.techs.length > 0);
  }, [projTechs]);

  const [filter, setFilter] = React.useState("All");
  const [hover, setHover] = React.useState(null);

  const shown = data.projects.filter((_, i) => {
    if (filter === "All") return true;
    return projTechs[i].includes(filter);
  });

  return (
    <section id="work" className="sec sec-work">
      <SectionHead num={isTerm ? "// 05" : "05"} title={isTerm ? "work/" : "Selected work"} count={`${shown.length} / ${data.projects.length}`} />

      <Reveal className="filter-bar filter-bar--grouped">
        <button
          className={"chip chip-all" + (filter === "All" ? " is-on" : "")}
          onClick={() => setFilter("All")}
        >
          All
          {filter === "All" && <span className="chip-x" aria-hidden>×</span>}
        </button>

        {groups.map((g) => (
          <div key={g.label} className="filter-group">
            <span className="filter-group-label">{g.label}</span>
            <div className="filter-group-chips">
              {g.techs.map((t) => (
                <button
                  key={t}
                  className={"chip" + (filter === t ? " is-on" : "")}
                  onClick={() => setFilter(t)}
                >
                  {t}
                  {filter === t && <span className="chip-x" aria-hidden>×</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Reveal>

      <div className="work-grid" data-hover={hover ? "on" : "off"}>
        {shown.map((p, i) => (
          <Reveal
            key={p.id}
            delay={i * 60}
            className="proj"
            data-dim={hover && hover !== p.id ? "1" : "0"}
          >
            <button
              className="proj-btn"
              onClick={() => onOpenProject(p.id)}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(p.id)}
              onBlur={() => setHover(null)}
            >
              <ProjectThumb project={p} />

              <div className="proj-meta">
                <div className="proj-head">
                  <h3 className="proj-title">
                    <span className="proj-idx">{String(i + 1).padStart(2, "0")}</span>
                    <span>{p.title}</span>
                  </h3>
                  <span className="proj-year">{p.year}</span>
                </div>
                <p className="proj-blurb">{p.blurb}</p>
                <ul className="proj-tags">
                  {p.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProjectModal({ variant, project, onClose }) {
  const ref = React.useRef(null);
  const prevActiveRef = React.useRef(null);

  React.useEffect(() => {
    if (!project) return;
    prevActiveRef.current = document.activeElement;
    // Focus the dialog so screen readers announce it and Tab traps inside it.
    if (ref.current) ref.current.focus();

    const getFocusable = () =>
      ref.current
        ? ref.current.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        : [];

    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const f = getFocusable();
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (prevActiveRef.current && typeof prevActiveRef.current.focus === "function") {
        prevActiveRef.current.focus();
      }
    };
  }, [project, onClose]);

  if (!project) return null;
  const isTerm = variant.grid === "ledger";

  return (
    <div className="modal-veil" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        style={{ "--hue": project.accent }}
      >
        <header className="modal-head">
          <div className="modal-head-l">
            <span className="modal-tag">{project.kind} · {project.year}</span>
            <h3 id="modal-title" className="modal-title">{project.title}</h3>
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Close">
            <span>Close</span>
            <span className="kbd">esc</span>
          </button>
        </header>

        <div className="modal-hero">
          <div className="thumb-grid" />
          {project.image ? (
            <img
              className="modal-hero-image"
              src={project.image}
              alt={project.title}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="modal-mark">{project.title}</div>
          )}
        </div>

        <div className="modal-body">
          <div className="modal-col modal-col-main">
            <h4 className="m-h">Overview</h4>
            <p className="prose">{project.blurb}</p>
            <p className="prose">
              {isTerm
                ? "// notes: focused on developer ergonomics, keyboard-first flows, and a build pipeline that stays under 200ms cold."
                : "The brief was simple and the surface was constrained — which is the fun part. I focused on the smallest possible product that still felt complete: clear hierarchy, opinionated defaults, and one or two moments of personality."}
            </p>
            <h4 className="m-h">My role</h4>
            <p className="prose">{project.role}</p>
          </div>

          <div className="modal-col modal-col-side">
            <ul className="kv-list">
              <li><span>Year</span><b>{project.year}</b></li>
              <li><span>Kind</span><b>{project.kind}</b></li>
              <li><span>Role</span><b>{project.role}</b></li>
            </ul>
            <h4 className="m-h">Stack</h4>
            <ul className="stack-list">
              {project.stack.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <div className="modal-links">
              {project.links.map((l) => (
                <a key={l.label} className="btn btn-ghost btn-sm" href={l.href}>
                  <span>{l.label}</span><span className="btn-arrow">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Contact({ variant, data, onJump }) {
  const isTerm = variant.grid === "ledger";
  const [copied, setCopied] = React.useState(false);
  const email = "amjad.soufi@student.arteveldehs.be";
  const copy = () => {
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section id="contact" className="sec sec-contact">
      <SectionHead num={isTerm ? "// 06" : "06"} title={isTerm ? "contact.sh" : "Contact"} />

      <div className="contact-grid">
        <Reveal className="contact-pitch">
          <p className="contact-lead">
            {isTerm
              ? "$ echo \"looking for a first full-time role\""
              : "I’m looking for a first full-time role —"}
          </p>
          <h3 className="contact-title">
            {isTerm ? "Let’s build something." : "Tell me what you’re working on."}
          </h3>
          <p className="prose">
            Junior front-end or full-stack, ideally with a small, opinionated team that ships often. Open to internships and freelance, too.
          </p>
        </Reveal>

        <Reveal delay={120} className="contact-actions">
          <div className="email-card">
            <span className="email-label">Email</span>
            <button className="email-val" onClick={copy} title="Click to copy">
              {email}
              <span className={"email-state" + (copied ? " is-on" : "")}>{copied ? "copied ✓" : "copy"}</span>
            </button>
          </div>
          <a className="btn btn-primary btn-lg" href={`mailto:${email}`}>
            <span>Say hello</span><span className="btn-arrow">↗</span>
          </a>
          <div className="socials-grid">
            {data.social.filter(s => s.label !== "Email").map((s) => (
              <a key={s.label} className="soc soc-lg" href={s.href} target="_blank" rel="noreferrer">
                <span className="soc-k">{s.label}</span>
                <span className="soc-v">{s.handle}</span>
                <span className="soc-arrow">↗</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer({ variant, onJump }) {
  const isBrut = variant.grid === "swiss";
  const logoSrc = isBrut ? "static/images/logo-as-dark.png" : "static/images/logo-as-white.png";
  return (
    <footer className="foot">
      <div className="foot-l">
        <img className="foot-logo" src={logoSrc} alt="AS" />
        <span className="foot-name">Amjad Soufi · Portfolio ’24</span>
      </div>
      <button className="foot-top" onClick={() => onJump("intro")}>
        Back to top <span>↑</span>
      </button>
      <div className="foot-r">
        <span>© 2026</span>
        <span>Built with care, not frameworks-for-the-sake-of-it.</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Work, ProjectModal, Contact, Footer, ProjectThumb });

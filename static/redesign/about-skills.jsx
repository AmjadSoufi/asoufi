// About + Skills + Experience sections.

function SectionHead({ num, title, count, smTitle, smHead }) {
  const [ref, seen] = useInView(0.2);
  return (
    <header ref={ref} className={"sec-head" + (smHead ? " sec-head-sm" : "") + (seen ? " is-in" : "")}>
      <span className="sec-num">{num}</span>
      <h2 className={"sec-title" + (smTitle ? " sec-title-sm" : "")}>{title}</h2>
      <span className="sec-rule" />
      {count != null && <span className="sec-count">{count}</span>}
    </header>
  );
}

function About({ variant, data }) {
  const isTerm = variant.grid === "ledger";
  return (
    <section id="about" className="sec sec-about">
      <SectionHead num={isTerm ? "// 02" : "02"} title={isTerm ? "about.md" : "About"} />

      <div className="about-grid">
        <Reveal delay={100} className="about-portrait">
          <div className="portrait">
            <img
              className="portrait-img"
              src="static/images/portrait.jpg"
              alt="Amjad Soufi"
              loading="lazy"
              decoding="async"
            />
            <div className="portrait-tag">
              <span>AS</span>
              <span>’24</span>
            </div>
          </div>
          <ul className="bio-stats">
            <li>
              <b><CountUp to={3} />+</b>
              <span>years coding</span>
            </li>
            <li>
              <b><CountUp to={12} pad={2} /></b>
              <span>projects shipped</span>
            </li>
            <li>
              <b>BE</b>
              <span>based in Bruges</span>
            </li>
          </ul>
        </Reveal>

        <div className="about-text">
          {data.about.map((p, i) => (
            <Reveal key={i} delay={120 + i * 100}>
              <p className="prose">{p}</p>
            </Reveal>
          ))}

          <Reveal delay={400}>
            <ul className="kv-list">
              <li><span>Name</span><b>Amjad Soufi</b></li>
              <li><span>Based</span><b>Bruges, Belgium · CET</b></li>
              <li><span>Roles</span><b>Junior · Full-stack · Frontend</b></li>
              <li><span>Languages</span><b>English · Dutch · Arabic</b></li>
              <li><span>Education</span><b>Arteveldehogeschool</b></li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SkillRow({ skill, idx }) {
  const [ref, seen] = useInView(0.3);
  return (
    <li ref={ref} className={"skill-row" + (seen ? " is-in" : "")}>
      <span className="skill-idx">{String(idx + 1).padStart(2, "0")}</span>
      <span className="skill-name">{skill.name}</span>
      <span className="skill-years">{skill.years}y</span>
      <span className="skill-bar">
        <span className="skill-fill" style={{ "--w": `${Math.round(skill.level * 100)}%` }} />
      </span>
      <span className="skill-pct">
        {seen ? <CountUp to={Math.round(skill.level * 100)} duration={1100} /> : 0}
      </span>
    </li>
  );
}

function Skills({ variant, data }) {
  const isTerm = variant.grid === "ledger";
  const groups = React.useMemo(() => {
    const by = {};
    data.skills.forEach((s) => { (by[s.tag] ||= []).push(s); });
    return Object.entries(by);
  }, [data.skills]);

  return (
    <section id="skills" className="sec sec-skills">
      <SectionHead num={isTerm ? "// 03" : "03"} title={isTerm ? "skills/" : "Skills"} />

      <div className="skills-wrap">
        {groups.map(([tag, items], gi) => (
          <Reveal key={tag} delay={gi * 80} className="skills-group">
            <div className="grp-head">
              <span className="grp-tag">{tag}</span>
              <span className="grp-count">{items.length} {items.length === 1 ? "item" : "items"}</span>
            </div>
            <ul className="skill-list">
              {items.map((s, i) => (
                <SkillRow key={s.name} skill={s} idx={i} />
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Experience({ variant, data }) {
  const isTerm = variant.grid === "ledger";
  return (
    <section className="sec sec-exp">
      <SectionHead num={isTerm ? "// 04" : "04"} title={isTerm ? "timeline.log" : "Timeline"} smTitle smHead />

      <ul className="exp-list">
        {data.experience.map((e, i) => (
          <Reveal as="li" key={i} delay={i * 100} className="exp-row">
            <span className="exp-when">{e.when}</span>
            <span className="exp-what">{e.what}</span>
            <span className="exp-where">{e.where}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

Object.assign(window, { About, Skills, Experience, SectionHead });

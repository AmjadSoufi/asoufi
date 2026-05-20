// Shared utilities for the portfolio prototype.

// IntersectionObserver-based reveal-on-scroll.
function useReveal(threshold = 0.15) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { setShown(true); io.disconnect(); break; }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold, shown]);
  return [ref, shown];
}

function Reveal({ delay = 0, y = 14, as: Tag = "div", className, style, children, ...rest }) {
  const [ref, shown] = useReveal();
  const s = {
    transform: shown ? "translate3d(0,0,0)" : `translate3d(0, ${y}px, 0)`,
    opacity: shown ? 1 : 0,
    transition: `transform 900ms cubic-bezier(.2,.7,.1,1) ${delay}ms, opacity 700ms ease ${delay}ms`,
    willChange: "transform, opacity",
    ...style,
  };
  return <Tag ref={ref} className={className} style={s} {...rest}>{children}</Tag>;
}

// Clip-path "curtain" reveal — each child line slides up from below its mask.
function ClipReveal({ delay = 0, children, className, style, stagger = 90 }) {
  const [ref, shown] = useReveal(0.1);
  const arr = React.Children.toArray(children);
  return (
    <span ref={ref} className={"clip-rev " + (className || "")} style={style}>
      {arr.map((child, i) => (
        <span key={i} className="clip-rev-line">
          <span
            className="clip-rev-inner"
            style={{
              transform: shown ? "translate3d(0, 0%, 0)" : "translate3d(0, 110%, 0)",
              transition: `transform 950ms cubic-bezier(.2,.78,.12,1) ${delay + i * stagger}ms`,
            }}
          >
            {child}
          </span>
        </span>
      ))}
    </span>
  );
}

// Count up a number when the element scrolls into view.
function useCountUp(to, { duration = 1100, decimals = 0 } = {}) {
  const ref = React.useRef(null);
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!ref.current) return;
    let raf, started = false, start = 0;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      // ease-out cubic
      const e = 1 - Math.pow(1 - p, 3);
      setVal(to * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting && !started) {
          started = true;
          raf = requestAnimationFrame(tick);
          io.disconnect();
          break;
        }
      }
    }, { threshold: 0.2 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  const fixed = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
  return [ref, fixed];
}

function CountUp({ to, suffix = "", prefix = "", pad = 0, duration = 1100, className }) {
  const [ref, v] = useCountUp(to, { duration });
  const str = pad ? String(v).padStart(pad, "0") : v;
  return <span ref={ref} className={className}>{prefix}{str}{suffix}</span>;
}

// Trigger a CSS animation class only after the element enters the viewport.
function useInView(threshold = 0.2) {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { setSeen(true); io.disconnect(); break; }
        }
      },
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold, seen]);
  return [ref, seen];
}

// Page-level scroll progress (0..1).
function useScrollProgress() {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
        setP(Math.min(1, Math.max(0, window.scrollY / max)));
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return p;
}

// Mouse-tilt helper for project thumbnails.
function useTilt(strength = 8) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = 0, ty = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tx = -y * strength;
      ty = x * strength;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const apply = () => {
      raf = 0;
      el.style.setProperty("--rx", tx.toFixed(2) + "deg");
      el.style.setProperty("--ry", ty.toFixed(2) + "deg");
    };
    const onLeave = () => {
      tx = 0; ty = 0;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);
  return ref;
}

// Smooth-scroll to an anchor id, accounting for sticky nav.
function scrollToId(id, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

// Convert hex to rgba string with alpha.
function withAlpha(hex, a) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return hex;
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Top-of-page scroll progress bar.
function ScrollProgress() {
  const p = useScrollProgress();
  return (
    <div className="scroll-progress" aria-hidden>
      <span className="scroll-progress-fill" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

// Infinite horizontal marquee of items.
function Marquee({ items, speed = 60, variant }) {
  const dur = `${items.length * speed / 6}s`;
  const repeated = [...items, ...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track" style={{ animationDuration: dur }}>
        {repeated.map((it, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-glyph">{it.glyph || "/"}</span>
            <span>{it.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  useReveal, Reveal, ClipReveal,
  useCountUp, CountUp,
  useInView, useScrollProgress, useTilt,
  scrollToId, withAlpha,
  ScrollProgress, Marquee,
});

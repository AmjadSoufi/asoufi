// Shared utilities for the portfolio prototype.

// True if perf-detect.js flagged this device as low-end. Reveals + CountUps
// short-circuit to their final state so we don't burn CPU on animations.
const __PERF_LITE = typeof document !== "undefined" &&
  document.documentElement.getAttribute("data-perf") === "lite";

// localStorage that can never throw. Storage is absent in some sandboxes and
// throws SecurityError when blocked (Safari private mode, storage-denied
// iframes) or QuotaExceededError when full — an unguarded read inside a
// useState initializer would take the whole app down.
const safeStorage = {
  get(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {}
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {}
  },
};

// Reference-counted scroll lock. Several overlays can require the lock at the
// same time (intro, mobile drawer, project modal); scrolling is restored only
// when the LAST holder releases it, so one component's cleanup can never
// unlock the page out from under another.
let scrollLocks = 0;
let bodyStyleBeforeScrollLock = null;
let scrollPositionBeforeLock = { x: 0, y: 0 };

function lockScroll() {
  if (scrollLocks === 0) {
    const body = document.body;
    bodyStyleBeforeScrollLock = body.getAttribute("style");
    scrollPositionBeforeLock = { x: window.scrollX, y: window.scrollY };
    // overflow:hidden alone does not stop touch scrolling in iOS Safari.
    // Pin the body at its current viewport position until every overlay closes.
    body.style.position = "fixed";
    body.style.top = `-${scrollPositionBeforeLock.y}px`;
    body.style.left = `-${scrollPositionBeforeLock.x}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
  }
  scrollLocks += 1;
}

function unlockScroll() {
  if (scrollLocks === 0) return; // never let a release unbalance the count
  scrollLocks -= 1;
  if (scrollLocks === 0) {
    const body = document.body;
    if (bodyStyleBeforeScrollLock === null) body.removeAttribute("style");
    else body.setAttribute("style", bodyStyleBeforeScrollLock);
    window.scrollTo(scrollPositionBeforeLock.x, scrollPositionBeforeLock.y);
    bodyStyleBeforeScrollLock = null;
    scrollPositionBeforeLock = { x: 0, y: 0 };
  }
}

// Keep Tab within a dialog, including when the container itself has focus.
function trapTabKey(event, dialog, additionalFocusable = []) {
  if (event.key !== "Tab" || !dialog) return;
  const focusable = [...dialog.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ), ...additionalFocusable].filter((el) =>
    el && el.tabIndex >= 0 && el.getClientRects().length > 0
  );
  event.preventDefault();
  if (!focusable.length) {
    dialog.focus();
    return;
  }
  // Handle every Tab explicitly: Safari's system keyboard settings can skip
  // buttons in the native tab order even though they accept programmatic focus.
  const index = focusable.indexOf(document.activeElement);
  const next = index === -1
    ? (event.shiftKey ? focusable.length - 1 : 0)
    : (index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
  focusable[next].focus();
}

// IntersectionObserver-based reveal-on-scroll.
function useReveal(threshold = 0.15) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(__PERF_LITE);
  React.useEffect(() => {
    if (__PERF_LITE) return;
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
    // Promote only while the element is still waiting to reveal. Once the
    // transition starts the browser composites transform/opacity itself, so
    // leaving this on permanently would pin a layer per revealed element.
    willChange: shown ? undefined : "transform, opacity",
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

// Count up a number when the element scrolls into view. In lite mode we
// just render the final value so the rAF tick + observer never fire.
function useCountUp(to, { duration = 1100, decimals = 0 } = {}) {
  const ref = React.useRef(null);
  const [val, setVal] = React.useState(__PERF_LITE ? to : 0);
  React.useEffect(() => {
    if (__PERF_LITE) return;
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

// Mouse-tilt helper for project thumbnails. No-op in lite mode so weak
// GPUs aren't doing a rAF per pointer move on every card hover.
function useTilt(strength = 8) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.documentElement.getAttribute("data-perf") === "lite") return;
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
function Marquee({ items, speed = 60 }) {
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

export {
  useReveal, Reveal, ClipReveal,
  useCountUp, CountUp,
  useInView, useScrollProgress, useTilt,
  scrollToId, withAlpha, safeStorage, lockScroll, unlockScroll, trapTabKey,
  ScrollProgress, Marquee,
};

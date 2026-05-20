// Custom cursor — ported from the main branch.
// Two-layer cursor: a small dot that tracks 1:1, and a larger outline ring
// that eases toward the pointer with a 0.15 LERP. The outline grows + tints
// when hovering anything interactive.

(function initCustomCursor() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Skip on:
  //   - coarse pointers (touch — no cursor to track)
  //   - reduced-motion preference (constant easing animation is motion)
  //   - keyboard-only navigators (we surface a system cursor again the first
  //     time Tab is pressed; see keydownOnce below)
  const mqlCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)");
  const mqlReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if ((mqlCoarse && mqlCoarse.matches) || (mqlReduce && mqlReduce.matches)) return;

  const start = () => {
    if (document.querySelector("[data-cursor-dot]")) return;

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("data-cursor-dot", "");
    dot.setAttribute("aria-hidden", "true");
    const outline = document.createElement("div");
    outline.className = "cursor-outline";
    outline.setAttribute("data-cursor-outline", "");
    outline.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
    document.body.appendChild(outline);
    document.body.style.cursor = "none";

    let mx = -100, my = -100;
    let ox = -100, oy = -100;
    let scale = 1;
    let raf = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const tick = () => {
      ox += (mx - ox) * 0.15;
      oy += (my - oy) * 0.15;
      outline.style.transform = `translate(${ox}px, ${oy}px) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Hover state on interactive elements. Delegated via mouseover/mouseout on
    // <body> so we don't have to wire individual listeners (and so we never
    // leak listeners when React unmounts nodes).
    const HOVER_SELECTOR = "a, button, .proj-btn, .chip, .nav-link, .soc, .card-foot, .btn, .email-val";
    document.body.addEventListener("mouseover", (e) => {
      if (e.target.closest && e.target.closest(HOVER_SELECTOR)) {
        scale = 1.5;
        outline.classList.add("is-hover");
      }
    });
    document.body.addEventListener("mouseout", (e) => {
      if (e.target.closest && e.target.closest(HOVER_SELECTOR)) {
        scale = 1;
        outline.classList.remove("is-hover");
      }
    });

    // Hide while mouse is outside the window.
    document.addEventListener("mouseleave", () => {
      dot.style.opacity = "0";
      outline.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      dot.style.opacity = "1";
      outline.style.opacity = "1";
    });

    // Restore the system cursor for keyboard users — accessibility win:
    // pressing Tab signals keyboard navigation, so we tear ourselves down so
    // focus rings and the native cursor are visible.
    const onFirstTab = (e) => {
      if (e.key !== "Tab") return;
      window.removeEventListener("keydown", onFirstTab);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      dot.remove();
      outline.remove();
      document.body.style.cursor = "";
    };
    window.addEventListener("keydown", onFirstTab);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

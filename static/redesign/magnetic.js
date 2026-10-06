// Magnetic button effect — buttons gently pull toward the cursor
// when the pointer enters their activation zone.
(function initMagneticButtons() {
  if (!window.matchMedia) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (document.documentElement.getAttribute("data-perf") === "lite") return;

  var RADIUS = 90;   // px — distance at which the pull activates
  var PULL   = 0.42; // fraction of offset to apply to the button
  var INNER  = 0.28; // extra parallax on the button's inner content

  // The .btn set changes as the app renders (hero CTA, modal links, …), so the
  // nodes are cached and refreshed only when the DOM changes — not on every
  // pointer event.
  var buttons = [];
  var raf = 0;
  var mx = 0, my = 0;

  function collect() {
    buttons = Array.prototype.slice.call(document.querySelectorAll(".btn"));
  }

  function pull(btn, dx, dy, dist) {
    // Strength ramps from 0 (at edge) to PULL (at center)
    var t  = 1 - dist / RADIUS;
    var tx = dx * t * PULL;
    var ty = dy * t * PULL;

    btn.style.transition = "background .2s, color .2s, border-color .2s";
    btn.style.transform  = "translate(" + tx + "px," + ty + "px)";

    // Subtle inner-content parallax (text drifts slightly more)
    var inner = btn.querySelector(".btn-arrow") || btn.querySelector("span");
    if (inner) {
      inner.style.transition = "none";
      inner.style.transform  = "translate(" + (tx * INNER) + "px," + (ty * INNER) + "px)";
    }
  }

  function release(btn) {
    var spring = "transform .55s cubic-bezier(.2,.7,.1,1)";
    btn.style.transition = spring + ", background .2s, color .2s, border-color .2s";
    btn.style.transform  = "";

    var inner = btn.querySelector(".btn-arrow") || btn.querySelector("span");
    if (inner) {
      inner.style.transition = spring;
      inner.style.transform  = "";
    }
  }

  // One pass per animation frame, using the latest pointer position, instead of
  // a full layout read for every mousemove event.
  function apply() {
    raf = 0;
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var r   = btn.getBoundingClientRect();
      var dx  = mx - (r.left + r.width  / 2);
      var dy  = my - (r.top  + r.height / 2);
      var dist = Math.hypot(dx, dy);

      if (dist < RADIUS) pull(btn, dx, dy, dist);
      else release(btn);
    }
  }

  function onMove(e) {
    mx = e.clientX;
    my = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(apply);
  }

  function onLeave() {
    for (var i = 0; i < buttons.length; i++) release(buttons[i]);
  }

  function setup() {
    collect();
    // React mounts/unmounts buttons (modal, drawer); keep the cache in sync.
    // childList only — this script writes style attributes, so observing
    // attributes would feed back into itself.
    if (window.MutationObserver) {
      new MutationObserver(collect).observe(document.body, { childList: true, subtree: true });
    }
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();

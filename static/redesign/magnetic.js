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

  function onMove(e) {
    var mx = e.clientX;
    var my = e.clientY;

    document.querySelectorAll(".btn").forEach(function (btn) {
      var r  = btn.getBoundingClientRect();
      var cx = r.left + r.width  / 2;
      var cy = r.top  + r.height / 2;
      var dx = mx - cx;
      var dy = my - cy;
      var dist = Math.hypot(dx, dy);

      if (dist < RADIUS) {
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
      } else {
        release(btn);
      }
    });
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

  function onLeave() {
    document.querySelectorAll(".btn").forEach(release);
  }

  function setup() {
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();

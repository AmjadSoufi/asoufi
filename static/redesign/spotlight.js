// Cursor spotlight — soft radial glow that follows the pointer in dark mode.
(function () {
  if (!window.matchMedia) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  var root = document.documentElement;
  var raf  = 0;
  var ox   = -9999, oy = -9999; // start offscreen so glow is hidden until mouse enters

  root.style.setProperty("--cx", ox + "px");
  root.style.setProperty("--cy", oy + "px");

  function onMove(e) {
    ox = e.clientX;
    oy = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      root.style.setProperty("--cx", ox + "px");
      root.style.setProperty("--cy", oy + "px");
    });
  }

  function onLeave() {
    root.style.setProperty("--cx", "-9999px");
    root.style.setProperty("--cy", "-9999px");
  }

  function setup() {
    var div = document.createElement("div");
    div.className = "cursor-spotlight";
    document.body.appendChild(div);
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();

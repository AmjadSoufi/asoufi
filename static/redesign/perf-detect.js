// Detect low-end devices and flip the page into "lite" mode.
// Sets <html data-perf="lite"> as early as possible so CSS rules + later
// JS (cursor, tilt, intro) can opt out of expensive effects.
//
// Heuristics (any one trips lite mode):
//   - prefers-reduced-motion       → user has explicitly asked for less motion
//   - hardwareConcurrency <= 4     → 2 cores on a Celeron, 4 on older laptops
//   - deviceMemory <= 4 (GB)       → ≤4 GB RAM
//   - connection.saveData          → data-saver mode on
//   - connection.effectiveType 2g/slow-2g → slow network on laptop tether
//
// Lite mode is sticky — once it's on for a session we remember it in
// sessionStorage so navigations within the site stay smooth.
(function () {
  try {
    var html = document.documentElement;
    if (sessionStorage.getItem("perf.lite") === "1") {
      html.setAttribute("data-perf", "lite");
      return;
    }
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cores  = navigator.hardwareConcurrency || 8;
    var mem    = navigator.deviceMemory || 8;
    var conn   = navigator.connection || {};
    var slow   = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || "");
    var lite   = reduce || cores <= 4 || mem <= 4 || slow;
    if (lite) {
      html.setAttribute("data-perf", "lite");
      try { sessionStorage.setItem("perf.lite", "1"); } catch (e) {}
    }
  } catch (e) { /* never break the page over perf detection */ }
})();

// Detect low-end devices and flip the page into "lite" mode.
// Sets <html data-perf="lite"> as early as possible so CSS rules + later
// JS (cursor, tilt, reveals) can opt out of expensive effects.
//
// Heuristics (any one trips lite mode):
//   - prefers-reduced-motion       → user has explicitly asked for less motion
//   - hardwareConcurrency <= 4     → 2 cores on a Celeron, 4 on older laptops
//                                     NOTE: iOS Safari caps this at 2 for privacy,
//                                     so iPhones always enter lite mode. That's fine
//                                     for cursor/tilt (touch devices can't use them)
//                                     but the marquee is explicitly excluded from
//                                     lite-mode suppression in CSS because it is
//                                     GPU-cheap — only prefers-reduced-motion stops it.
//   - deviceMemory <= 4 (GB)       → ≤4 GB RAM
//   - connection.saveData          → data-saver mode on
//   - connection.effectiveType 2g/slow-2g → slow network on laptop tether
//
// Lite mode is sticky for the session via sessionStorage so subsequent
// navigations stay smooth.
(function () {
  try {
    var html = document.documentElement;
    if (sessionStorage.getItem("perf.lite") === "1") {
      html.setAttribute("data-perf", "lite");
      return;
    }
    var mql    = window.matchMedia;
    var reduce = mql && mql("(prefers-reduced-motion: reduce)").matches;
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

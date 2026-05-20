// Detect low-end devices and flip the page into "lite" mode.
// Sets <html data-perf="lite"> as early as possible so CSS rules + later
// JS (cursor, tilt, reveals) can opt out of expensive effects.
//
// Heuristics (any one trips lite mode):
//   - prefers-reduced-motion       → user has explicitly asked for less motion
//   - hardwareConcurrency <= 4     → 2 cores on a Celeron, 4 on older laptops
//                                     (also iOS Safari clamps to 2 for privacy,
//                                     so this trips on iPhones too — which is
//                                     fine: they lose the cursor/marquee/tilt
//                                     they couldn't use anyway, and the intro
//                                     is gated separately, not on this flag).
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

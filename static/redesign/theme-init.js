// Apply the persisted theme to <html> before the stylesheet is evaluated, so
// light-mode visitors never see a flash of the dark palette on first paint.
// Synchronous on purpose (same as perf-detect.js) and CSP-clean: external
// file, covered by script-src 'self'.
//
// This runs before the bundle, so it cannot use the bundle's safeStorage
// helper — the try/catch below is deliberate and must stay.
(function () {
  try {
    var theme = localStorage.getItem("theme");
    // An absent attribute means "default theme" (:root tokens), which is dark.
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (e) { /* storage unavailable — fall back to the default theme */ }
})();

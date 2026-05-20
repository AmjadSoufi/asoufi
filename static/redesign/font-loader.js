// Async-load Google Fonts without blocking render.
// The <link> ships as media="print" (so the browser doesn't render-block on
// it); once it has finished loading, swap it back to media="all" so the
// fonts apply. Lives in its own file so the page can stay CSP-tight
// (script-src 'self' only — no inline handlers).
(function () {
  var links = document.querySelectorAll('link[data-async-font]');
  links.forEach(function (l) {
    var promote = function () { l.media = 'all'; };
    if (l.sheet) { promote(); return; }
    l.addEventListener('load', promote, { once: true });
  });
})();

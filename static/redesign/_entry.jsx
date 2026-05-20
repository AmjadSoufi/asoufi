// Build entry: pulls every redesign file in the correct order. Each file
// publishes its exports onto `window`, so subsequent files can reference
// them by name (matches how the unbundled <script> tags used to work).
// React and ReactDOM stay external — they're loaded as globals from the
// CDN <script> tags in index.html.
import "./data.js";
import "./variants.js";
import "./utils.jsx";
import "./intro.jsx";
import "./nav-hero.jsx";
import "./about-skills.jsx";
import "./work-contact.jsx";
import "./app.jsx";

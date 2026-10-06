// Build entry: esbuild follows the app's ES-module import graph from here.
// React and ReactDOM stay external — they're loaded as globals from the CDN
// <script> tags in index.html.
import "./app.jsx";

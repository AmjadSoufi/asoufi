# Amjad Soufi – Portfolio

A modern, responsive portfolio website showcasing selected university and personal projects by Amjad Soufi.

## Overview

- Highlights web apps, productivity tools, and educational projects
- Each project includes a summary, tech stack, and links to code/live demo

## Deployment

Production is served by GitHub Pages at **https://asoufi.com** (see `CNAME`).

- **Build:** `npm run build` compiles the site into `static/redesign/dist/app.bundle.js` and `static/css/redesign.min.css`.
- **Deploy:** `.github/workflows/deploy.yml` runs on every push to `main`. It installs dependencies, rebuilds the bundle from source, and publishes the repository root to GitHub Pages. A manual run is available from the Actions tab.
- **No stale bundles:** because the workflow rebuilds from source before publishing, the deployed JS/CSS always matches the pushed source. It also fails the run if the committed build output is out of date — run `npm run build` and commit the result when that happens.

> **One-time setup:** set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Until that is switched, the deploy step has no Pages site to publish to.


## Development and checks

- `npm run dev` serves the built site locally; run `npm run build` after source changes or use `npm run build:watch`.
- `npx playwright install` installs the browsers needed for testing.
- `npm test` rebuilds the site before testing Chromium, Firefox, and WebKit. Uncaught browser errors fail tests.
- Deployment requires passing browser tests and committed build output matching source.



**Author:** Amjad Soufi  
[GitHub](https://github.com/AmjadSoufi) · [Email](mailto:amjadsoufi5588@gmail.com)

MIT License

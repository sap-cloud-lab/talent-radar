# Talent Radar

A dependency-free AU/NZ SAP and ERP opportunity dashboard built around the selected light regional-explorer design.

## Open the site

Open `index.html`, then choose **Open Talent Radar**. For direct access, open `dashboard.html#overview`.

## Product views

- **Home** — a job-free regional map with dynamic Permanent, Contract, On-site, Hybrid and Remote counts; every count drills into the matching Feed
- **Feed** — 40 verified public listings in date sequence with internal job-detail pages, an **Apply with AI** entry point, and filters for permanent, contract, temporary, work arrangement, SAP module and non-SAP views
- **SAP Market** — merged module and workstream overview with live demand ranking, workstream distribution, a module × workstream matrix, market signals, filters and one-click Feed drill-downs
- **Watchlist** — locally saved opportunities
- **Settings** — source verification status and local-data controls

## Important behaviour

- Remote-only roles are highlighted in green and have a one-click **Remote AU/NZ** filter.
- Every record is labelled **Remote**, **Hybrid**, **On-site**, **FIFO / site-based**, or **Not stated**.
- Non-SAP records are classified as **All other jobs**.
- Job descriptions and application preparation stay inside Talent Radar; the source site opens only for MFA, CAPTCHA or final submission.
- Watchlist choices use browser local storage and are not synced externally.

## Install on a phone

- **iPhone / iPad:** open the published site in Safari, use **Share**, then choose **Add to Home Screen**.
- **Android:** open the site in Chrome, open the browser menu, then choose **Install app** or **Add to Home screen**.
- The PWA launches in a standalone mobile shell with a compact top bar, persistent bottom navigation and a map-first Home screen that updates without scrolling.
- The current **Apply with AI** sheet previews the supervised workflow without redirecting away from Talent Radar. Automated form completion requires the secure profile vault and application-agent backend planned for the next build.

## Data boundary

The displayed roles come from verified public job boards, specialist recruiters and direct employer career sites. Each included application page was checked on 24 July 2026. Email alerts, recruiter messages, historical inbox records, expired pages and closed listings are excluded.

The static prototype does not scrape job boards or run a scheduler. Availability can change after the verification date, so users should confirm the linked source before applying.

## Project map

- `index.html` — landing page
- `dashboard.html` — shared application shell
- `styles/dashboard.css` — active dashboard design system and responsive layout
- `scripts/dashboard.js` — routes, filters, watchlist and interactions
- `scripts/live-jobs.js` — verified public listings and direct application URLs
- `scripts/data.js` — validated product data and SAP taxonomy
- `scripts/pwa.js` — install support and iOS installation guidance
- `manifest.webmanifest` and `service-worker.js` — installable PWA metadata and offline shell
- `DESIGN_SPEC.md` — active visual and interaction specification

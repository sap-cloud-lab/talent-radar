# Talent Radar

A dependency-free AU/NZ SAP and ERP opportunity dashboard built around the selected light regional-explorer design.

## Open the site

Open `index.html`, then choose **Open Talent Radar**. For direct access, open `dashboard.html#overview`.

## Product views

- **Home** — regional opportunity map, snapshot totals and market spotlights
- **Feed** — 13 verified public listings in date sequence with search, source, workstream, SAP sub-module and work-arrangement filters
- **SAP modules** — the 26-tag SAP taxonomy with matching live-role counts
- **Workstreams** — Technical, Functional, Leadership, and Other / unclassified drill-downs
- **Watchlist** — locally saved opportunities
- **Settings** — source verification status and local-data controls

## Important behaviour

- Remote-only roles are highlighted in green and have a one-click **Remote AU/NZ** filter.
- Every record is labelled **Remote**, **Hybrid**, **On-site**, **FIFO / site-based**, or **Not stated**.
- Non-SAP records are classified as **All other jobs**.
- Every SEEK and LinkedIn action opens the exact public listing that was checked.
- Watchlist choices use browser local storage and are not synced externally.

## Data boundary

The displayed roles are public SEEK and LinkedIn Jobs listings whose Apply or Quick Apply control was checked on 24 July 2026. Email alerts, recruiter messages, historical inbox records and closed listings are excluded.

The static prototype does not scrape job boards or run a scheduler. Availability can change after the verification date, so users should confirm the linked source before applying.

## Project map

- `index.html` — landing page
- `dashboard.html` — shared application shell
- `styles/dashboard.css` — active dashboard design system and responsive layout
- `scripts/dashboard.js` — routes, filters, watchlist and interactions
- `scripts/live-jobs.js` — verified public listings and direct application URLs
- `scripts/data.js` — validated product data and SAP taxonomy
- `DESIGN_SPEC.md` — active visual and interaction specification

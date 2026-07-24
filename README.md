# Talent Radar

A dependency-free AU/NZ SAP and ERP opportunity dashboard built around the selected light regional-explorer design.

## Open the site

Open `index.html`, then choose **Open Talent Radar**. For direct access, open `dashboard.html#overview`.

## Product views

- **Home** — regional opportunity map, snapshot totals, market spotlights, and permanent/contract drill-downs
- **Feed** — 40 verified public listings in date sequence with search, source, workstream, SAP sub-module, employment-type and work-arrangement filters
- **SAP modules** — market-intelligence view with live demand ranking, 14-day momentum, location and work-mode mixes, advertised rate evidence, the complete 26-tag taxonomy, and one-click feed drill-downs
- **Workstreams** — Technical, Functional, Leadership, and Other / unclassified drill-downs
- **Watchlist** — locally saved opportunities
- **Settings** — source verification status and local-data controls

## Important behaviour

- Remote-only roles are highlighted in green and have a one-click **Remote AU/NZ** filter.
- Every record is labelled **Remote**, **Hybrid**, **On-site**, **FIFO / site-based**, or **Not stated**.
- Non-SAP records are classified as **All other jobs**.
- Every application action opens the exact public listing that was checked.
- Watchlist choices use browser local storage and are not synced externally.

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
- `DESIGN_SPEC.md` — active visual and interaction specification

# Talent Radar

A dependency-free AU/NZ SAP and ERP opportunity dashboard built around the selected light regional-explorer design.

## Open the site

Open `index.html`, then choose **Open Talent Radar**. For direct access, open `dashboard.html#overview`.

## Product views

- **Home** — regional opportunity map, snapshot totals and market spotlights
- **Feed** — all 17 records in date sequence with search, source, workstream, SAP sub-module and work-arrangement filters
- **SAP modules** — the 26-tag SAP taxonomy with matching archive counts
- **Workstreams** — Technical, Functional, Leadership, and Other / unclassified drill-downs
- **Watchlist** — locally saved opportunities
- **Settings** — source provenance, archive status and local-data controls

## Important behaviour

- Remote-only roles are highlighted in green and have a one-click **Remote AU/NZ** filter.
- Every record is labelled **Remote**, **Hybrid**, **On-site**, **FIFO / site-based**, or **Not stated**.
- Non-SAP records are classified as **All other jobs**.
- SEEK and LinkedIn actions are clearly labelled search links. Direct listing URLs were not included in the supplied archive, so the site does not fabricate them.
- Watchlist choices use browser local storage and are not synced externally.

## Data boundary

The supplied records are a historical May 2026 inbox snapshot. Inbox confirmation proves that an alert or recruiter message was received; it does not prove that a vacancy is currently live.

The prototype does not scrape job boards, contact an inbox, run a scheduler, or deliver external alerts.

## Project map

- `index.html` — landing page
- `dashboard.html` — shared application shell
- `styles/dashboard.css` — active dashboard design system and responsive layout
- `scripts/dashboard.js` — routes, filters, watchlist and interactions
- `scripts/data.js` — supplied historical opportunity records and SAP taxonomy
- `DESIGN_SPEC.md` — active visual and interaction specification

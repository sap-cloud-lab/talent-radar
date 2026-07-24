# Talent Radar — Active Design Specification

## Design language

- One consistent light shell across every route; no dark-blue page treatment
- Cool-white canvas, true-white surfaces, navy text, soft mineral-blue navigation
- Green reserved for remote opportunities, amber for archive/provenance notes, coral for the strongest Sydney signal
- Thin borders, restrained shadows, rounded cards and outline icons
- Spacious desktop composition with a 268px sidebar; drawer navigation below 760px

## Navigation

1. Home
2. Feed
3. SAP modules
4. Workstreams
5. Watchlist
6. Settings

`SAP modules` replaces the ambiguous `Modules` label.

## Home

- Heading: `Regional opportunity view`
- May 2026 snapshot label
- Region tabs: All regions, Sydney, Melbourne, Remote
- AU/NZ map with Perth, Adelaide, Melbourne, Canberra, Sydney, Brisbane and New Zealand markers
- Map markers drill directly into the Feed with the selected regional scope applied
- Market spotlight accordion
- 17 opportunity records, 3 hot market signals and 26 SAP taxonomy tags
- Direct drill-down to the Feed

## Feed

- All records displayed in newest-source-record order
- Search by role, company, location, module or skill
- Category controls: All opportunities, SAP jobs, All other jobs
- SAP sub-module, workstream and source filters
- Work-arrangement controls: Remote, Hybrid, On-site, FIFO and Not stated
- Remote-only records use a green leading rail and pale-green card treatment
- Every card includes provenance, absolute record date, location, tags, work arrangement and watchlist control
- SEEK / LinkedIn actions open a relevant search because direct archive listing URLs were not supplied

## Supporting views

- **SAP modules:** functional, technical and leadership taxonomies with archive counts
- **Workstreams:** broad capability drill-down into the same Feed
- **Watchlist:** saved job records only
- **Settings:** source status, snapshot details and local watchlist controls

## Data language

- Always show `Historical archive` and `current availability is unverified`
- Never present May 2026 records as live July 2026 vacancies
- Use `Not stated` when a source did not specify a work arrangement
- Use `All other jobs` for non-SAP opportunities
- Never invent a direct listing URL

## Responsive behaviour

- At 1250px, the home footer becomes two rows.
- At 1000px, the map and market spotlight stack.
- At 760px, the sidebar becomes a drawer, job actions stack under job details, and filter controls become a single-column mobile flow.
- No horizontal page overflow at 320px.

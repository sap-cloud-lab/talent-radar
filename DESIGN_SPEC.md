# Talent Radar — Active Design Specification

## Design language

- One consistent light shell across every route; no dark-blue page treatment
- Cool-white canvas, true-white surfaces, navy text, soft mineral-blue navigation
- Green reserved for remote opportunities, amber for verification notes, coral for the strongest Sydney signal
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
- 24 July 2026 verification label
- Region tabs: All regions, Sydney, Melbourne, Remote
- AU/NZ map with Perth, Adelaide, Melbourne, Canberra, Sydney, Brisbane and New Zealand markers
- Map markers drill directly into the Feed with the selected regional scope applied
- Market spotlight accordion
- 40 verified opportunities, 3 hot market signals and 26 SAP taxonomy tags
- Permanent and contract cards at the bottom drill into the Feed with the employment type selected
- Direct drill-down to the Feed

## Feed

- All roles displayed in newest-public-listing order
- Search by role, company, location, module or skill
- Category controls: All opportunities, SAP jobs, All other jobs
- SAP sub-module, workstream and source filters
- Employment-type filter for explicitly advertised permanent and contract roles
- Work-arrangement controls: Remote, Hybrid, On-site, FIFO and Not stated
- Remote-only records use a green leading rail and pale-green card treatment
- Every card includes verification date, posting age, location, tags, work arrangement and watchlist control
- Application actions open the exact verified public listing

## SAP module intelligence

- Rank active SAP modules by verified live-role count
- Show current momentum using listings first seen during the last 14 days
- Identify the three hottest modules from live count and recent activity
- Show leading locations and work-arrangement counts for every active module
- Show numeric hourly or daily rates exactly as advertised; never blend incompatible rate types
- Every module row and highlight drills into the Feed with that module selected
- Retain the full 26-tag taxonomy beneath the live intelligence view

## Supporting views

- **Workstreams:** broad capability drill-down into the same Feed
- **Watchlist:** saved job records only
- **Settings:** source status, verification details and local watchlist controls

## Data language

- Show `Apply link verified` and the exact date the public application page was checked
- Exclude email alerts, recruiter messages, historical inbox records and closed listings
- Use `Not stated` when a source did not specify a work arrangement
- Use `All other jobs` for non-SAP opportunities
- Link only to the exact public listing URL

## Responsive behaviour

- At 1250px, the home footer becomes two rows.
- At 1000px, the map and market spotlight stack.
- At 760px, the sidebar becomes a drawer, job actions stack under job details, and filter controls become a single-column mobile flow.
- No horizontal page overflow at 320px.

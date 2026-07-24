# Talent Radar — Active Design Specification

## Design language

- One consistent light shell across every route; no dark-blue page treatment
- Cool-white canvas, true-white surfaces, navy text, soft mineral-blue navigation
- Green reserved for remote opportunities, amber for verification notes, coral for the strongest Sydney signal
- Thin borders, restrained shadows, rounded cards and outline icons
- Spacious desktop composition with a 268px sidebar, reduced to a 96px icon rail on the Feed; drawer navigation below 760px

## Navigation

1. Home
2. Feed
3. SAP Market
4. Watchlist
5. Settings

`SAP Market` merges the former SAP Modules and Workstreams pages.

## Home

- Heading: `Regional opportunity view`
- 24 July 2026 verification label
- Region dropdown: All regions, Sydney, Melbourne, Adelaide, Canberra, Brisbane, Perth, New Zealand and Australia-wide
- Map controls for Permanent and for On-site, Hybrid and Remote work arrangements
- Opportunity total and every regional marker count update immediately from the selected filters
- Selecting a region visually isolates its marker while retaining the full AU/NZ map for context
- AU/NZ map with Perth, Adelaide, Melbourne, Canberra, Sydney, Brisbane, remote Australia and New Zealand markers
- Map markers drill directly into the Feed with the selected regional scope applied
- Market spotlight accordion
- 40 verified opportunities, 3 hot market signals and 26 SAP taxonomy tags
- Permanent and contract cards at the bottom drill into the Feed with the employment type selected
- Direct drill-down to the Feed

## Feed

- All roles displayed in newest-public-listing order
- Search by role, company, location, module or skill
- Dedicated left filter panel with counts and clear selected states
- Employment controls: Permanent, Contract and Temporary
- Work-arrangement controls: On-site, Hybrid and Remote
- Opportunity controls: All opportunities, SAP opportunities and Non-SAP opportunities
- One-click filtering for every SAP module represented in the verified feed
- Region and source remain in the compact search toolbar
- Remote-only records use a green leading rail and pale-green card treatment
- Every card includes verification date, posting age, location, tags, work arrangement and watchlist control
- Application actions open the exact verified public listing

## SAP Market

- Full-width overview combining SAP module demand and workstream distribution
- Region, employment and work-arrangement filters update all market components
- Four summary metrics: opportunities, active modules, hybrid roles and contract roles
- Ranked module table with relative-demand bars
- Workstream mix for Functional, Technical, Leadership and Other roles
- Full module × workstream matrix covering every module with active demand
- Bottom market-signal strip for hot modules, recently added roles, remote demand and top locations
- Module rows, workstream rows, matrix cells and signal rows drill into the Feed with matching filters applied

## Supporting views

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

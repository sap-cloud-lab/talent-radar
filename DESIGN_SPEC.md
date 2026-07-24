# Talent Radar — Active Design Specification

## Design language

- One consistent light shell across every route; no dark-blue page treatment
- Cool-white canvas, true-white surfaces, navy text, soft mineral-blue navigation
- Green reserved for remote opportunities, amber for verification notes, coral for the strongest Sydney signal
- Thin borders, restrained shadows, rounded cards and outline icons
- Spacious desktop composition with a 268px sidebar, reduced to a 96px icon rail on the Feed
- Below 760px, use an app-like top bar and persistent five-item bottom navigation

## Navigation

1. Home
2. Feed
3. SAP Market
4. Watchlist
5. Settings

`SAP Market` merges the former SAP Modules and Workstreams pages.

## Home

- Heading: `Opportunity map`
- 24 July 2026 verification label
- Region dropdown: All regions, Sydney, Melbourne, Adelaide, Canberra, Brisbane, Perth, New Zealand and Australia-wide
- Map controls for Permanent and Contract employment, and for On-site, Hybrid and Remote work arrangements
- Opportunity total and every regional marker count update immediately from the selected filters
- City markers count only roles that explicitly name that city; Australia-wide remote roles appear only under `Remote AU`
- Selecting a region visually isolates its marker while retaining the full AU/NZ map for context
- AU/NZ map with Perth, Adelaide, Melbourne, Canberra, Sydney, Brisbane, remote Australia and New Zealand markers
- The headline total and every map marker drill directly into the Feed with the current region, employment and work-arrangement filters preserved
- Do not show featured, highlighted or detailed job cards on Home

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
- `View full job details` opens an internal Talent Radar page with the structured description, role focus, highlighted skills, source verification and application options
- `Apply with AI` opens the supervised application sheet and remains inside Talent Radar
- The external source opens only when MFA, CAPTCHA or final submission requires a user handoff

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
- Retain only the exact public listing URL for the supervised application handoff

## Mobile PWA

- Installable through Safari **Add to Home Screen** and Android Chrome **Install app**
- Standalone app display with Talent Radar icon, portrait orientation and cached application shell
- Persistent Home, Feed, SAP, Saved and Profile navigation
- Home is a fixed, map-first viewport: compact controls, result count and the full AU/NZ map remain visible together without scrolling or rubber-band overscroll
- The mobile map keeps both coastlines inside the viewport and uses a compact editorial composition that brings New Zealand closer to Australia without changing either silhouette
- Filter changes update the count and map in place; Permanent, Contract, On-site, Hybrid and Remote controls use the compact mobile treatment
- The compact `Apply with AI` shortcut below the map carries the current Home filters into the opportunity Feed
- Home contains no individual job promotion
- Feed results appear before the detailed filter panel on mobile
- Job actions stack under the role summary and `Apply with AI` opens as a bottom sheet
- No horizontal page overflow at 320px

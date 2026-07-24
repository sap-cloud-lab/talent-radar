# Talent Radar

A dependency-free AU/NZ SAP and ERP opportunity dashboard built around the selected light regional-explorer design.

## Open the site

Open `index.html`, then choose **Open Talent Radar**. For direct access, open `dashboard.html#overview`.

## Product views

- **Home** — a job-free regional map with dynamic Permanent, Contract, On-site, Hybrid and Remote counts; every count drills into the matching Feed
- **Feed** — verified public listings in date sequence with internal job-detail pages, an **Apply with AI** entry point, and filters for permanent, contract, temporary, work arrangement, SAP module and non-SAP views
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

## Recruiter-post discovery

Talent Radar can discover recruiter-authored SAP vacancy posts that do not always appear in a normal job-board search. A scheduled GitHub Actions workflow:

1. searches fresh public recruiter posts and company updates across Australia and New Zealand;
2. finds and checks the matching public job page or explicit recruiter-post application route;
3. rejects old, closed, unclear, duplicated and non-AU/NZ records;
4. publishes only structured, non-verbatim job details into the existing Feed.

Private LinkedIn messages, inbox records and email alerts are never used. The OpenAI API key stays in GitHub Actions and is never sent to the browser.

### One-time setup

1. Create an OpenAI API key.
2. In the GitHub repository, open **Settings → Secrets and variables → Actions**.
3. Add a repository secret named `OPENAI_API_KEY`.
4. Open **Actions → Discover recruiter SAP opportunities → Run workflow**.

The workflow then runs automatically every 12 hours. Its model defaults to `gpt-5.6-terra`; an optional repository variable named `OPENAI_DISCOVERY_MODEL` can override it.

## Data boundary

The displayed roles come from verified public job boards, public recruiter-authored vacancy posts, specialist recruiters and direct employer career sites. Email alerts, private recruiter messages, historical inbox records, expired pages and closed listings are excluded.

## Project map

- `index.html` — landing page
- `dashboard.html` — shared application shell
- `.github/workflows/discover-recruiter-posts.yml` — scheduled discovery and publishing
- `config/recruiter-sources.json` — recruiter organisations and people to monitor
- `data/recruiter-post-jobs.json` — generated audit-friendly opportunity snapshot
- `styles/dashboard.css` — active dashboard design system and responsive layout
- `scripts/dashboard.js` — routes, filters, watchlist and interactions
- `scripts/live-jobs.js` — verified public listings and direct application URLs
- `scripts/recruiter-post-jobs.js` — generated browser-safe recruiter-post opportunities
- `scripts/discover-recruiter-posts.mjs` — public-web discovery, validation and deduplication
- `scripts/data.js` — validated product data and SAP taxonomy
- `scripts/pwa.js` — install support and iOS installation guidance
- `manifest.webmanifest` and `service-worker.js` — installable PWA metadata and offline shell
- `DESIGN_SPEC.md` — active visual and interaction specification

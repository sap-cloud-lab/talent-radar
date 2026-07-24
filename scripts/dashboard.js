(function initialiseTalentRadarDashboard() {
  "use strict";

  const data = window.TalentRadarData;
  const ui = window.TalentRadar;
  const main = document.querySelector("#main-content");
  const watchCount = document.querySelector("#watchlist-count");
  const mobileMenu = document.querySelector("#mobile-menu");
  const scrim = document.querySelector("#sidebar-scrim");
  const STORAGE_KEY = "talent-radar-watchlist-v2";

  if (!data || !ui || !main) {
    throw new Error("Talent Radar could not initialise because its data or shared helpers are missing.");
  }

  const routes = new Set([
    "overview",
    "opportunities",
    "sap-landscape",
    "workstreams",
    "watchlist",
    "settings"
  ]);

  const routeAliases = {
    home: "overview",
    feed: "opportunities",
    modules: "sap-landscape",
    pipeline: "workstreams",
    alerts: "watchlist",
    sources: "settings"
  };

  const state = {
    route: "overview",
    region: "all",
    spotlight: "sydney",
    watchlist: readWatchlist(),
    feed: {
      q: "",
      category: "all",
      region: "all",
      module: "all",
      group: "all",
      workMode: "all",
      source: "all"
    }
  };

  const spotlights = [
    {
      id: "sydney",
      label: "Sydney",
      short: "SAP Enterprise Architect",
      detail: "SAP Enterprise Architect — S/4HANA, Signavio & LeanIX",
      rate: "$1,300–1,600/day",
      copy: "A high-rate leadership signal from the May 2026 inbox snapshot.",
      icon: "user",
      tone: "coral",
      marker: { x: 496, y: 310, labelX: 510, labelY: 292, width: 76 }
    },
    {
      id: "melbourne",
      label: "Melbourne",
      short: "Senior SAP S/4HANA Consultants",
      detail: "Multiple Senior SAP S/4HANA Consultants",
      rate: "Multiple openings",
      copy: "A multi-role S/4HANA signal in Melbourne; individual sub-modules were not stated.",
      icon: "user",
      tone: "orange",
      marker: { x: 430, y: 358, labelX: 318, labelY: 340, width: 102 }
    },
    {
      id: "remote",
      label: "Remote AU/NZ",
      short: "SAP ABAP Developer",
      detail: "SAP ABAP Developer — Public Cloud & BTP",
      rate: "Remote AU/NZ",
      copy: "The only source record explicitly marked remote, covering Australia and New Zealand.",
      icon: "globe",
      tone: "teal",
      marker: { x: 737, y: 366, labelX: 608, labelY: 348, width: 123 }
    }
  ];

  const mapRegions = [
    {
      id: "perth",
      region: "perth",
      label: "Perth",
      tone: "blue",
      marker: { x: 123, y: 287, labelX: 42, labelY: 269, width: 72, lineX: 114 }
    },
    {
      id: "adelaide",
      region: "adelaide",
      label: "Adelaide",
      tone: "blue",
      marker: { x: 363, y: 323, labelX: 255, labelY: 305, width: 99, lineX: 354 }
    },
    {
      id: "melbourne",
      region: "melbourne",
      label: "Melbourne",
      tone: "orange",
      marker: { x: 430, y: 358, labelX: 326, labelY: 371, width: 112, lineX: 438 }
    },
    {
      id: "canberra",
      region: "canberra",
      label: "Canberra",
      tone: "blue",
      marker: { x: 474, y: 327, labelX: 487, labelY: 332, width: 106, lineX: 487 }
    },
    {
      id: "sydney",
      region: "sydney",
      label: "Sydney",
      tone: "coral",
      marker: { x: 496, y: 310, labelX: 510, labelY: 284, width: 88, lineX: 510 }
    },
    {
      id: "brisbane",
      region: "brisbane",
      label: "Brisbane",
      tone: "blue",
      marker: { x: 516, y: 234, labelX: 529, labelY: 216, width: 99, lineX: 529 }
    },
    {
      id: "remote",
      region: "new-zealand",
      label: "New Zealand",
      tone: "teal",
      marker: { x: 737, y: 366, labelX: 600, labelY: 348, width: 128, lineX: 728 }
    }
  ];

  const feedRegions = [
    ["all", "All regions"],
    ["sydney", "Sydney"],
    ["melbourne", "Melbourne"],
    ["adelaide", "Adelaide"],
    ["canberra", "Canberra"],
    ["brisbane", "Brisbane"],
    ["perth", "Perth"],
    ["new-zealand", "New Zealand"],
    ["australia-wide", "Australia-wide"]
  ];

  const workModeLabels = {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
    fifo: "FIFO / site-based",
    "not-stated": "Not stated"
  };

  function regionMatchesJob(job, region) {
    if (region === "all") return true;

    const location = (job.location || "").trim().toLowerCase();
    const australiaWide = /^(all )?australia$/.test(location);
    const regionalRemote =
      normaliseWorkMode(job.workMode) === "remote" &&
      (job.region === "AU/NZ" || location.includes("au/nz"));

    if (region === "australia-wide") return australiaWide || regionalRemote;
    if (region === "new-zealand") {
      return (
        job.region === "NZ" ||
        /\b(new zealand|auckland|wellington|christchurch)\b/.test(location) ||
        regionalRemote
      );
    }

    const cityPatterns = {
      sydney: /\b(sydney|blacktown)\b/,
      melbourne: /\b(melbourne|clayton)\b/,
      adelaide: /\badelaide\b/,
      canberra: /\b(canberra|act)\b/,
      brisbane: /\bbrisbane\b/,
      perth: /\bperth\b/
    };
    const pattern = cityPatterns[region];
    return Boolean(pattern && (pattern.test(location) || australiaWide || regionalRemote));
  }

  function readWatchlist() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }

  function saveWatchlist() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.watchlist]));
    updateWatchCount();
  }

  function updateWatchCount() {
    const count = state.watchlist.size;
    watchCount.textContent = String(count);
    watchCount.dataset.count = String(count);
  }

  function normaliseRoute(hash) {
    const raw = (hash || "").replace(/^#/, "").split("?")[0] || "overview";
    const route = routeAliases[raw] || raw;
    return routes.has(route) ? route : "overview";
  }

  function icon(name, className) {
    return ui.icon(name, className);
  }

  function esc(value) {
    return ui.escapeHtml(value == null ? "" : value);
  }

  function snapshot() {
    return `<span class="snapshot">${icon("calendar")}<span>May 2026 snapshot</span></span>`;
  }

  function archiveNote() {
    return `
      <div class="archive-note">
        ${icon("info")}
        <span><strong>Historical archive:</strong> inbox records are confirmed, but current availability is unverified.</span>
      </div>`;
  }

  function pageHeader({ eyebrow, title, subtitle, note = false }) {
    return `
      <header class="page-header">
        <div>
          ${eyebrow ? `<p class="page-eyebrow">${esc(eyebrow)}</p>` : ""}
          <h1 class="page-title">${esc(title)}</h1>
          <p class="page-subtitle">${esc(subtitle)}</p>
          ${note ? `<div style="margin-top:16px">${archiveNote()}</div>` : ""}
        </div>
        ${snapshot()}
      </header>`;
  }

  function render() {
    state.route = normaliseRoute(window.location.hash);
    document.querySelectorAll("[data-route-link]").forEach((link) => {
      const active = link.dataset.routeLink === state.route;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const renderers = {
      overview: renderHome,
      opportunities: renderFeed,
      "sap-landscape": renderModules,
      workstreams: renderWorkstreams,
      watchlist: renderWatchlist,
      settings: renderSettings
    };

    main.innerHTML = renderers[state.route]();
    main.focus({ preventScroll: true });
    updateWatchCount();
    closeNavigation();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function renderHome() {
    const selected = spotlights.find((item) => item.id === state.spotlight) || spotlights[0];
    return `
      <section class="page home-page" data-page="overview">
        ${pageHeader({
          title: "Regional opportunity view",
          subtitle: "A high-level view of SAP talent opportunities across Australia and New Zealand."
        })}

        <div class="region-tabs" role="tablist" aria-label="Regional opportunity view">
          ${[
            ["all", "All regions"],
            ["sydney", "Sydney"],
            ["melbourne", "Melbourne"],
            ["remote", "Remote"]
          ]
            .map(
              ([id, label]) => `
                <button class="region-tab ${state.region === id ? "active" : ""}" type="button"
                  role="tab" aria-selected="${state.region === id}" data-region="${id}">${label}</button>`
            )
            .join("")}
        </div>

        <div class="explorer-grid">
          <div class="map-panel">
            <div class="opportunity-count"><strong>${data.jobs.length}</strong><span>opportunities</span></div>
            <div class="map-glow" aria-hidden="true"></div>
            ${renderMap(selected.id)}
          </div>

          <aside class="spotlight-panel" aria-label="Market spotlight">
            <h2 class="section-label">Market spotlight</h2>
            <p class="section-kicker">Select a region to explore the strongest signals.</p>
            <div class="spotlight-list">
              ${spotlights.map((item) => renderSpotlight(item, selected.id)).join("")}
            </div>
          </aside>
        </div>

        <footer class="home-footer">
          <div class="metric-mini">
            <span class="signal-icon">${icon("pulse")}</span>
            <div><strong>3</strong><span>Hot market signals</span><small>Key role demand across regions</small></div>
          </div>
          <div class="metric-mini">
            <span class="signal-icon">${icon("tag")}</span>
            <div><strong>${data.meta.sapTaxonomyTagCount}</strong><span>SAP tags</span><small>Skills and technologies</small></div>
          </div>
          <div class="category-chips" aria-label="Coverage categories">
            <button class="category-chip technical" type="button" data-group-filter="Technical">${icon("cube")}Technical</button>
            <button class="category-chip functional" type="button" data-group-filter="Functional">${icon("settings")}Functional</button>
            <button class="category-chip leadership" type="button" data-group-filter="Leadership">${icon("user")}Leadership</button>
          </div>
          <a class="text-link home-feed-link" href="#opportunities">View opportunity feed ${icon("arrow-right")}</a>
        </footer>
      </section>`;
  }

  function renderMap(selectedId) {
    // Coastline paths are projected from Natural Earth 1:50m country geometry
    // published through Geoscience Australia's Natural_Earth_Countries service.
    const markers = mapRegions
      .map((item) => {
        const { x, y, labelX, labelY, width, lineX } = item.marker;
        const count = data.jobs.filter(
          (job) => job.stream === "SAP" && regionMatchesJob(job, item.region)
        ).length;
        const color =
          item.tone === "coral"
            ? "#ef5e55"
            : item.tone === "orange"
              ? "#f2a11a"
              : item.tone === "teal"
                ? "#39967c"
                : "#2874ad";
        return `
          <g class="map-marker ${selectedId === item.id ? "active" : ""}" role="button" tabindex="0"
            aria-label="Open ${esc(item.label)} in the feed, ${count} SAP archive ${count === 1 ? "record" : "records"}"
            data-map-region="${item.region}">
            <line x1="${x}" y1="${y}" x2="${lineX}" y2="${labelY + 14}"></line>
            <circle cx="${x}" cy="${y}" r="8" fill="${color}"></circle>
            <g class="map-marker-label">
              <rect x="${labelX}" y="${labelY}" width="${width}" height="28" rx="8"></rect>
              <text x="${labelX + 10}" y="${labelY + 19}">${esc(item.label)} · ${count}</text>
            </g>
          </g>`;
      })
      .join("");

    return `
      <svg class="region-map ${state.region === "all" ? "" : "dim"}" viewBox="0 0 850 520" role="img"
        aria-label="Map of Australia and New Zealand with SAP opportunity markers in Perth, Adelaide, Melbourne, Canberra, Sydney, Brisbane, and New Zealand">
        <defs>
          <linearGradient id="map-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#d9ebfa"></stop>
            <stop offset="1" stop-color="#bdd9f1"></stop>
          </linearGradient>
        </defs>
        <circle class="map-ring" cx="430" cy="273" r="238"></circle>
        <circle class="map-ring" cx="430" cy="273" r="190"></circle>
        <circle class="map-ring" cx="430" cy="273" r="142"></circle>
        <path class="map-land map-australia" data-map-country="Australia" d="M431.0,393.4L427.4,398.3L429.7,403.7L433.1,408.2L435.5,413.9L436.0,419.4L439.8,423.5L445.5,426.2L451.2,426.0L454.5,421.5L459.0,418.5L462.4,413.2L464.5,407.6L465.3,401.6L465.4,395.4L458.3,394.1L452.8,395.9L447.2,397.7L439.3,396.3L434.3,393.9ZM352.3,332.9L342.2,333.0L347.6,336.5L353.1,334.8ZM278.5,40.5L282.1,47.1L286.6,43.0L281.6,39.7ZM411.3,47.5L407.9,41.2L404.7,34.5L400.3,39.3L398.3,46.8L395.6,52.2L398.0,57.6L395.1,63.1L393.3,69.6L394.2,76.1L394.7,82.2L393.1,91.3L392.6,96.8L390.6,103.8L387.4,110.3L383.1,115.5L377.1,115.8L371.8,112.6L368.3,108.2L363.2,105.3L357.3,103.4L353.4,98.8L347.8,95.8L342.7,93.5L338.2,89.9L333.7,85.9L329.4,82.3L332.7,75.4L335.3,69.7L334.7,63.7L340.3,62.7L345.4,52.2L341.1,47.5L338.2,53.2L333.2,50.7L327.2,50.7L322.0,47.8L315.8,47.3L309.4,45.8L304.0,41.4L296.7,38.7L291.2,39.3L298.2,41.9L299.9,47.5L295.1,50.7L287.2,51.3L281.2,52.4L276.8,55.9L273.5,60.7L271.3,66.0L269.0,71.1L265.4,76.7L269.4,81.5L263.9,82.9L257.6,81.4L252.7,84.5L249.7,77.8L245.9,73.1L240.3,69.3L235.7,73.9L230.3,71.7L229.9,77.9L223.8,78.7L223.2,84.2L217.4,85.9L213.2,89.9L213.9,95.7L216.6,100.5L210.5,100.0L204.8,98.2L204.4,104.0L206.8,109.4L204.0,114.3L200.8,108.4L197.7,101.2L193.7,106.4L189.1,111.8L189.9,119.6L187.5,124.7L183.5,129.8L180.4,135.8L175.6,140.0L168.4,142.9L161.9,144.5L153.1,147.1L147.2,148.5L141.8,151.7L136.0,151.7L130.4,152.6L124.1,156.4L119.7,160.3L115.1,163.6L109.2,167.3L106.1,173.1L104.4,166.9L100.7,172.0L100.4,177.8L100.4,183.4L98.1,188.8L96.7,195.0L98.3,200.3L100.7,206.0L105.1,214.2L104.7,220.1L99.6,217.1L98.0,211.5L98.5,217.2L100.5,222.8L96.8,218.4L99.8,226.2L103.2,232.2L104.3,239.7L108.5,246.5L111.9,253.7L112.8,260.7L113.4,266.6L115.3,273.7L118.2,279.6L121.2,286.7L121.1,292.8L120.5,300.0L118.9,306.4L113.4,306.2L113.1,312.6L119.4,317.1L123.9,321.5L129.5,323.9L136.1,324.4L141.7,324.9L150.6,320.8L156.6,317.5L162.4,313.2L168.5,311.2L174.9,310.5L181.1,309.9L186.9,310.3L195.6,310.7L201.9,310.9L207.2,307.2L209.9,301.6L216.6,298.6L222.0,295.4L228.8,291.6L238.0,291.7L243.7,291.2L251.6,288.8L260.9,284.4L267.4,283.5L273.4,282.9L280.3,283.2L286.7,282.6L295.4,288.1L301.1,287.5L306.0,290.2L312.0,291.2L316.8,294.6L317.5,302.0L322.6,303.9L325.3,309.3L328.2,314.3L329.2,320.6L334.6,323.5L336.7,317.1L340.0,312.4L345.3,309.0L349.7,305.2L353.2,299.7L355.7,305.5L352.9,310.3L350.9,316.5L350.1,323.0L344.8,326.9L350.9,325.6L355.2,320.7L357.0,315.0L361.2,319.9L360.8,327.9L365.8,330.4L372.1,336.1L376.2,343.9L375.0,349.7L380.0,355.7L384.3,360.3L390.5,362.1L396.0,363.3L402.5,364.5L407.7,367.0L413.0,369.1L421.1,365.5L427.0,362.5L432.6,364.6L437.9,367.9L442.8,370.4L450.2,368.0L455.9,362.6L461.0,359.2L472.3,357.5L477.9,357.3L482.7,354.3L483.0,346.1L484.4,340.5L485.5,334.0L489.4,326.6L492.1,321.0L493.6,315.6L497.0,311.1L498.9,304.8L502.6,298.8L507.2,295.3L510.5,288.5L514.6,281.2L515.6,274.9L517.1,266.0L518.8,258.0L521.5,250.3L521.2,242.9L519.2,237.2L516.4,230.3L516.0,219.6L515.0,213.8L512.9,207.3L509.4,201.6L505.2,197.9L501.3,192.5L495.6,189.4L491.7,182.1L491.5,174.9L485.9,172.5L480.3,173.3L477.7,165.2L475.8,159.6L471.9,154.1L471.0,148.4L466.2,145.1L460.7,141.5L456.7,137.0L449.9,134.8L445.2,131.7L443.5,126.1L441.9,119.7L441.7,112.6L440.2,107.0L435.8,102.4L435.4,96.7L433.4,89.7L433.6,83.3L426.9,77.9L421.1,76.7L416.2,71.6L415.6,65.3L414.3,58.3L412.1,52.8Z"></path>
        <path class="map-land map-new-zealand" data-map-country="New Zealand" d="M675.2,466.3L671.4,464.4L671.0,468.2L668.7,471.1L672.7,470.2L676.3,468.8ZM727.8,399.4L727.0,395.4L724.1,393.3L720.9,391.5L717.5,395.4L716.1,401.3L713.2,404.6L709.9,407.7L708.6,411.6L705.7,416.4L702.7,419.1L698.9,420.8L696.0,423.2L693.1,425.5L689.7,427.5L686.1,429.3L682.2,431.9L678.5,432.4L675.8,434.7L672.2,438.0L669.2,440.9L665.2,443.6L664.5,447.2L660.8,448.9L663.2,452.5L658.0,453.7L660.3,456.6L664.2,459.0L668.3,457.9L672.0,460.4L675.7,460.3L678.6,463.1L682.6,462.9L687.9,463.4L691.5,462.6L696.8,457.9L699.3,455.3L703.1,454.5L703.5,450.2L704.8,446.6L705.4,442.9L707.7,439.3L708.7,435.6L712.4,433.4L715.8,431.8L719.1,430.4L723.9,429.8L727.6,430.1L724.5,427.5L723.3,423.8L727.3,420.7L730.2,418.1L732.3,414.2L735.4,411.3L737.6,408.0L740.1,404.9L737.9,401.7L741.0,398.3L738.0,396.1L735.0,399.3L736.6,395.8L732.5,397.2L729.0,399.4ZM729.4,323.2L727.1,319.8L723.5,317.5L726.9,321.6L728.6,325.5L729.9,329.3L733.2,327.8L736.6,338.1L740.1,338.9L741.9,342.1L741.8,346.6L745.4,347.3L744.3,351.3L746.1,356.2L746.0,360.3L744.0,365.1L743.5,369.4L740.4,371.7L735.5,373.7L736.4,378.1L740.9,379.7L744.4,382.2L747.8,383.4L749.9,386.4L749.8,390.1L747.9,394.2L744.4,398.6L748.3,400.7L751.0,403.3L755.0,400.9L758.1,398.6L760.9,394.5L763.3,390.8L765.6,387.5L768.5,382.9L768.5,379.3L769.2,375.2L773.2,373.0L777.2,373.3L779.2,368.7L782.3,366.6L783.1,362.4L784.2,358.3L782.3,354.8L778.5,355.4L774.8,358.8L770.6,359.8L766.4,358.7L761.4,356.2L758.2,353.2L757.0,347.5L753.3,343.0L753.5,348.6L748.2,346.9L744.7,345.5L745.1,341.9L743.5,337.0L741.3,333.6L742.1,329.4L738.7,327.6L736.3,324.7L731.6,323.4Z"></path>
        ${markers}
      </svg>`;
  }

  function renderSpotlight(item, selectedId) {
    const active = item.id === selectedId;
    return `
      <article class="spotlight-item ${active ? "active" : ""}">
        <button class="spotlight-trigger" type="button" aria-expanded="${active}" data-spotlight="${item.id}">
          <span class="spotlight-icon tone-${item.tone}">${icon(item.icon)}</span>
          <span><strong>${esc(item.label)}</strong><small>${esc(item.short)}</small></span>
          ${icon("chevron-down")}
        </button>
        <div class="spotlight-detail">
          <h3>${esc(item.detail)}</h3>
          <span class="rate-chip">${esc(item.rate)}</span>
          <p>${esc(item.copy)}</p>
        </div>
      </article>`;
  }

  function renderFeed() {
    const modules = [...new Set(data.jobs.filter((job) => job.stream === "SAP").map((job) => job.module))].sort();
    const sources = [...new Set(data.jobs.map((job) => job.source))].sort();
    return `
      <section class="page" data-page="opportunities">
        ${pageHeader({
          eyebrow: "Opportunity feed",
          title: "Every opportunity, in sequence",
          subtitle: "Filter the archive by SAP sub-module, work arrangement, source, or non-SAP opportunities.",
          note: true
        })}

        <div class="feed-controls" aria-label="Opportunity filters">
          <div class="feed-control-top">
            <label class="search-field">
              <span class="sr-only">Search opportunities</span>
              ${icon("search")}
              <input id="feed-search" type="search" value="${esc(state.feed.q)}"
                placeholder="Search roles, companies, skills or locations…" autocomplete="off" />
            </label>
            <button class="remote-shortcut ${state.feed.workMode === "remote" ? "active" : ""}" type="button" data-remote-only>
              ${icon("globe")}Remote AU/NZ
            </button>
          </div>

          <div class="feed-filter-row">
            <div class="segment-control" aria-label="Opportunity category">
              ${[
                ["all", "All opportunities"],
                ["sap", "SAP jobs"],
                ["other", "All other jobs"]
              ]
                .map(
                  ([value, label]) => `
                    <button class="segment-button ${state.feed.category === value ? "active" : ""}"
                      type="button" data-feed-category="${value}">${label}</button>`
                )
                .join("")}
            </div>
            <select class="filter-select" aria-label="Region" data-feed-select="region">
              ${feedRegions
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${state.feed.region === value ? "selected" : ""}>${label}</option>`
                )
                .join("")}
            </select>
            <select class="filter-select" aria-label="SAP sub-module" data-feed-select="module">
              <option value="all">All SAP sub-modules</option>
              ${modules
                .map(
                  (module) =>
                    `<option value="${esc(module)}" ${state.feed.module === module ? "selected" : ""}>${esc(module)}</option>`
                )
                .join("")}
            </select>
            <select class="filter-select" aria-label="Workstream" data-feed-select="group">
              <option value="all">All workstreams</option>
              ${["Technical", "Functional", "Leadership", "Other"]
                .map(
                  (group) =>
                    `<option value="${group}" ${state.feed.group === group ? "selected" : ""}>${group === "Other" ? "Other & unclassified" : group}</option>`
                )
                .join("")}
            </select>
            <select class="filter-select" aria-label="Source" data-feed-select="source">
              <option value="all">All sources</option>
              ${sources
                .map(
                  (source) =>
                    `<option value="${esc(source)}" ${state.feed.source === source ? "selected" : ""}>${esc(source)}</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="workmode-chips" aria-label="Work arrangement">
            ${[
              ["all", "All arrangements"],
              ["remote", "Remote"],
              ["hybrid", "Hybrid"],
              ["onsite", "On-site"],
              ["fifo", "FIFO"],
              ["not-stated", "Not stated"]
            ]
              .map(
                ([value, label]) => `
                  <button class="workmode-chip ${state.feed.workMode === value ? "active" : ""}"
                    type="button" data-feed-mode="${value}">${label}</button>`
              )
              .join("")}
          </div>
        </div>

        <div id="feed-results">${renderFeedResults()}</div>
      </section>`;
  }

  function filteredJobs() {
    const query = state.feed.q.trim().toLowerCase();
    return data.jobs
      .map((job, originalIndex) => ({ job, originalIndex }))
      .sort((a, b) => b.job.firstSeen.localeCompare(a.job.firstSeen) || a.originalIndex - b.originalIndex)
      .map(({ job }) => job)
      .filter((job) => {
        if (state.feed.category === "sap" && job.stream !== "SAP") return false;
        if (state.feed.category === "other" && job.stream === "SAP") return false;
        if (!regionMatchesJob(job, state.feed.region)) return false;
        if (state.feed.module !== "all" && job.module !== state.feed.module) return false;
        if (
          state.feed.group !== "all" &&
          !(
            (state.feed.group === "Other" &&
              (job.stream !== "SAP" || !["Technical", "Functional", "Leadership"].includes(job.group))) ||
            job.group === state.feed.group
          )
        )
          return false;
        if (state.feed.source !== "all" && job.source !== state.feed.source) return false;
        if (state.feed.workMode !== "all" && normaliseWorkMode(job.workMode) !== state.feed.workMode) return false;
        if (!query) return true;
        const haystack = [
          job.title,
          job.company,
          job.location,
          job.module,
          job.group,
          job.source,
          job.summary,
          ...(job.skills || [])
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
  }

  function renderFeedResults() {
    const jobs = filteredJobs();
    const selectedRegion = feedRegions.find(([value]) => value === state.feed.region);
    const regionScope =
      state.feed.region === "all"
        ? ""
        : state.feed.region === "new-zealand"
          ? " · New Zealand and remote AU/NZ records"
          : state.feed.region === "australia-wide"
            ? " · Australia-wide and remote AU/NZ records"
            : ` · ${selectedRegion ? selectedRegion[1] : "Selected region"}, Australia-wide and remote AU/NZ records`;
    return `
      <div class="feed-summary">
        <div><strong>${jobs.length} ${jobs.length === 1 ? "opportunity" : "opportunities"}</strong>
          <span>${regionScope} · newest source record first</span></div>
        <button class="clear-filters" type="button" data-clear-filters>Clear filters</button>
      </div>
      ${
        jobs.length
          ? `<div class="job-list">${jobs.map((job, index) => renderJobCard(job, index + 1)).join("")}</div>`
          : renderEmptyState("search", "No opportunities match", "Try clearing a filter or using a broader search.")
      }`;
  }

  function renderJobCard(job, index) {
    const mode = normaliseWorkMode(job.workMode);
    const saved = state.watchlist.has(job.id);
    const source = sourceLink(job);
    const modeIcon = mode === "remote" ? "globe" : mode === "hybrid" ? "home" : mode === "fifo" ? "location" : "briefcase";
    const displayDate = formatRecordDate(job.firstSeen);
    return `
      <article class="job-card ${mode === "remote" ? "remote" : ""}" data-job-id="${esc(job.id)}">
        <div>
          <div class="job-meta-row">
            <span class="job-index">Record ${String(index).padStart(2, "0")}</span>
            <span class="badge ${mode}">${icon(modeIcon)}${esc(workModeLabels[mode])}</span>
            <span class="badge archive">${icon("clock")}Availability unverified</span>
            ${job.stream === "Other" ? `<span class="badge onsite">All other jobs</span>` : ""}
          </div>
          <h2>${esc(job.title)}</h2>
          <p class="job-company">${esc(job.company)}</p>
          <div class="job-facts">
            <span class="job-fact">${icon("location")}${esc(job.location)}</span>
            <span class="job-fact">${icon("calendar")}${esc(displayDate)}</span>
            <span class="job-fact">${icon("inbox")}${esc(job.source)}</span>
          </div>
          <p class="job-summary">${esc(job.summary)}</p>
          <div class="job-tags">
            <span class="job-tag ${job.stream === "Other" ? "other" : ""}">${esc(job.module)}</span>
            ${(job.skills || []).slice(0, 4).map((skill) => `<span class="job-tag">${esc(skill)}</span>`).join("")}
          </div>
        </div>
        <div class="job-actions">
          ${job.rate ? `<span class="job-rate">${esc(job.rate)}</span>` : ""}
          <a class="primary-action" href="${esc(source.href)}" target="_blank" rel="noopener noreferrer">
            ${esc(source.label)} ${icon("external")}
          </a>
          <button class="secondary-action ${saved ? "saved" : ""}" type="button" data-watch-job="${esc(job.id)}">
            ${icon("bookmark")}${saved ? "Saved to watchlist" : "Save to watchlist"}
          </button>
          <p class="source-caveat">Direct listing URL was not included in the archive.</p>
        </div>
      </article>`;
  }

  function normaliseWorkMode(value) {
    const mode = String(value || "").toLowerCase();
    if (mode.includes("remote")) return "remote";
    if (mode.includes("hybrid")) return "hybrid";
    if (mode.includes("fifo")) return "fifo";
    if (mode.includes("on-site") || mode.includes("onsite") || mode.includes("office")) return "onsite";
    return "not-stated";
  }

  function sourceLink(job) {
    const keywords = encodeURIComponent(job.title.replace(/\(saved-search.*?\)/gi, "").trim());
    const location = encodeURIComponent(job.location || "Australia");
    if (job.source.toLowerCase().includes("linkedin")) {
      return {
        label: "Search LinkedIn",
        href: `https://www.linkedin.com/jobs/search/?keywords=${keywords}&location=${location}`
      };
    }
    return {
      label: "Search on SEEK",
      href: `https://www.seek.com.au/jobs?keywords=${keywords}`
    };
  }

  function formatRecordDate(value) {
    if (!/^\d{4}-\d{2}$/.test(value || "")) return "Date not stated";
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-AU", { month: "short", year: "numeric" }).format(
      new Date(Date.UTC(year, month - 1, 1))
    );
  }

  function renderModules() {
    const actualModules = new Map();
    data.jobs
      .filter((job) => job.stream === "SAP")
      .forEach((job) => actualModules.set(job.module, (actualModules.get(job.module) || 0) + 1));
    const classifiedCount = data.jobs.filter((job) => job.stream === "SAP" && job.module !== "Unclassified SAP").length;
    const unclassifiedCount = actualModules.get("Unclassified SAP") || 0;
    const otherCount = data.jobs.filter((job) => job.stream !== "SAP").length;

    return `
      <section class="page" data-page="sap-landscape">
        ${pageHeader({
          eyebrow: "SAP modules",
          title: "Browse by SAP sub-module",
          subtitle: "The module library explains what “SAP modules” means and opens the feed with the right filter.",
          note: true
        })}

        <div class="summary-strip">
          <div class="summary-card"><strong>${data.meta.sapTaxonomyTagCount}</strong><span>SAP taxonomy tags</span></div>
          <div class="summary-card"><strong>${classifiedCount}</strong><span>Classified SAP archive records</span></div>
          <div class="summary-card"><strong>${unclassifiedCount}</strong><span>SAP records needing module detail</span></div>
        </div>

        <div class="module-groups">
          ${data.sapGroups.map((group) => renderModuleGroup(group, actualModules)).join("")}
        </div>

        <div class="other-jobs-card">
          <div>
            <h2>All other jobs</h2>
            <p>${otherCount} non-SAP ERP opportunity in the current archive, kept separate from SAP module filters.</p>
          </div>
          <button class="text-link" type="button" data-category-filter="other">View all other jobs ${icon("arrow-right")}</button>
        </div>
      </section>`;
  }

  function renderModuleGroup(group, actualModules) {
    const count = data.jobs.filter((job) => job.stream === "SAP" && job.group === group.name).length;
    const iconName = group.name === "Technical" ? "cube" : group.name === "Functional" ? "settings" : "user";
    return `
      <article class="module-group">
        <div class="module-group-header">
          <span class="stream-icon ${group.id}">${icon(iconName)}</span>
          <div><h2>${esc(group.name)}</h2><span>${count} matching archive ${count === 1 ? "record" : "records"}</span></div>
        </div>
        <div class="module-list">
          ${group.modules
            .map((module) => {
              const moduleCount = actualModules.get(module) || 0;
              return `
                <button class="module-button ${moduleCount ? "has-roles" : ""}" type="button" data-module-filter="${esc(module)}">
                  ${esc(module)}${moduleCount ? `<span class="module-count">${moduleCount}</span>` : ""}
                </button>`;
            })
            .join("")}
        </div>
      </article>`;
  }

  function renderWorkstreams() {
    const definitions = [
      {
        id: "Technical",
        title: "Technical",
        icon: "cube",
        copy: "Engineering, platform, integration and SAP operations roles.",
        modules: ["ABAP/OO-ABAP", "BTP", "Fiori/UI5", "Basis", "Security"]
      },
      {
        id: "Functional",
        title: "Functional",
        icon: "settings",
        copy: "Business-process roles spanning finance, logistics, people and supply chain.",
        modules: ["FI/CO", "MM", "SD", "HCM/SuccessFactors", "Ariba"]
      },
      {
        id: "Leadership",
        title: "Leadership",
        icon: "user",
        copy: "Architecture, programme leadership and transformation delivery.",
        modules: ["Enterprise Architect", "Solution Architect", "Program Manager", "Delivery Lead"]
      },
      {
        id: "Other",
        title: "Other & unclassified",
        icon: "briefcase",
        copy: "Non-SAP ERP opportunities and SAP records whose sub-module was not supplied.",
        modules: ["Unclassified SAP", "Other ERP", "General PM/BA", "Data / Cloud"]
      }
    ];

    return `
      <section class="page" data-page="workstreams">
        ${pageHeader({
          eyebrow: "Workstreams",
          title: "Opportunities by capability",
          subtitle: "A broader way to explore the market when a specific SAP sub-module is too narrow.",
          note: true
        })}
        <div class="workstream-grid">
          ${definitions
            .map((stream) => {
              const count = jobsForGroup(stream.id).length;
              return `
                <article class="workstream-card">
                  <div class="workstream-card-header">
                    <span class="stream-icon ${stream.id.toLowerCase()}">${icon(stream.icon)}</span>
                    <div><h2>${esc(stream.title)}</h2><span>Capability workstream</span></div>
                    <span class="stream-count">${count}</span>
                  </div>
                  <p>${esc(stream.copy)}</p>
                  <div class="workstream-modules">${stream.modules.map((module) => `<span>${esc(module)}</span>`).join("")}</div>
                  <button class="text-link" type="button" data-group-filter="${esc(stream.id)}">View matching opportunities ${icon("arrow-right")}</button>
                </article>`;
            })
            .join("")}
        </div>
      </section>`;
  }

  function jobsForGroup(group) {
    if (group === "Other") {
      return data.jobs.filter(
        (job) => job.stream !== "SAP" || !["Technical", "Functional", "Leadership"].includes(job.group)
      );
    }
    return data.jobs.filter((job) => job.group === group);
  }

  function renderWatchlist() {
    const savedJobs = data.jobs
      .filter((job) => state.watchlist.has(job.id))
      .sort((a, b) => b.firstSeen.localeCompare(a.firstSeen));
    return `
      <section class="page" data-page="watchlist">
        ${pageHeader({
          eyebrow: "Watchlist",
          title: "Saved opportunities",
          subtitle: "Keep the archive records you want to revisit in one focused list.",
          note: true
        })}
        ${
          savedJobs.length
            ? `<div class="feed-summary"><div><strong>${savedJobs.length} saved ${savedJobs.length === 1 ? "opportunity" : "opportunities"}</strong></div>
                <a class="text-link" href="#opportunities">Browse full feed ${icon("arrow-right")}</a></div>
              <div class="job-list">${savedJobs.map((job, index) => renderJobCard(job, index + 1)).join("")}</div>`
            : renderEmptyState(
                "bookmark",
                "Your watchlist is empty",
                "Save any opportunity from the feed and it will appear here."
              )
        }
      </section>`;
  }

  function renderEmptyState(iconName, title, copy) {
    return `
      <div class="empty-state">
        <div>
          <span class="empty-icon">${icon(iconName)}</span>
          <h2>${esc(title)}</h2>
          <p>${esc(copy)}</p>
          <a class="primary-action" href="#opportunities">Browse opportunity feed ${icon("arrow-right")}</a>
        </div>
      </div>`;
  }

  function renderSettings() {
    const sourceRows = data.sources.filter((source) => ["seek", "linkedin", "adzuna"].includes(source.id));
    return `
      <section class="page" data-page="settings">
        ${pageHeader({
          eyebrow: "Settings",
          title: "Data and preferences",
          subtitle: "Understand where the archive came from and manage data stored in this browser."
        })}
        <div class="settings-grid">
          <article class="settings-card">
            <h2>Source connections</h2>
            <p>No live scraper or recurring importer is represented. The current dashboard uses supplied inbox records.</p>
            ${sourceRows
              .map(
                (source) => `
                  <div class="source-row">
                    <div><strong>${esc(source.name)}</strong><span>${esc(source.ingestionMethod)}</span></div>
                    <span class="status-pill">${source.id === "adzuna" ? "Not connected" : "Historical only"}</span>
                  </div>`
              )
              .join("")}
          </article>

          <article class="settings-card">
            <h2>Local preferences</h2>
            <p>Watchlist choices stay on this device and are not synced externally.</p>
            <div class="setting-list">
              <div class="setting-line"><span>Snapshot</span><strong>May 2026</strong></div>
              <div class="setting-line"><span>Coverage</span><strong>Australia & New Zealand</strong></div>
              <div class="setting-line"><span>Archive records</span><strong>${data.jobs.length}</strong></div>
              <div class="setting-line"><span>Saved roles</span><strong>${state.watchlist.size}</strong></div>
            </div>
            <button class="danger-button" type="button" data-clear-watchlist>Clear watchlist</button>
          </article>
        </div>
      </section>`;
  }

  function setFeedRoute(partial) {
    state.feed = { ...state.feed, ...partial };
    if (state.route === "opportunities") render();
    else window.location.hash = "opportunities";
  }

  function selectGroup(group) {
    if (group === "Other") {
      setFeedRoute({ category: "all", region: "all", module: "all", group: "Other", workMode: "all", q: "" });
      return;
    }
    setFeedRoute({ q: "", category: "sap", region: "all", module: "all", group, workMode: "all", source: "all" });
  }

  function toggleWatchlist(id) {
    const job = data.jobs.find((item) => item.id === id);
    if (!job) return;
    const isRemoving = state.watchlist.has(id);
    if (isRemoving) state.watchlist.delete(id);
    else state.watchlist.add(id);
    saveWatchlist();
    ui.showToast({
      title: isRemoving ? "Removed from watchlist" : "Saved to watchlist",
      message: job.title,
      tone: isRemoving ? "warning" : "success"
    });
    render();
  }

  function clearFilters() {
    state.feed = { q: "", category: "all", region: "all", module: "all", group: "all", workMode: "all", source: "all" };
    render();
  }

  function closeNavigation() {
    document.body.classList.remove("nav-open");
    mobileMenu.setAttribute("aria-expanded", "false");
  }

  document.body.addEventListener("click", (event) => {
    const region = event.target.closest("[data-region]");
    if (region) {
      state.region = region.dataset.region;
      state.spotlight = state.region === "all" ? "sydney" : state.region;
      render();
      return;
    }

    const mapRegion = event.target.closest("[data-map-region]");
    if (mapRegion) {
      setFeedRoute({
        q: "",
        category: "sap",
        region: mapRegion.dataset.mapRegion,
        module: "all",
        group: "all",
        workMode: "all",
        source: "all"
      });
      return;
    }

    const spotlight = event.target.closest("[data-spotlight]");
    if (spotlight) {
      state.spotlight = spotlight.dataset.spotlight;
      state.region = state.spotlight;
      render();
      return;
    }

    const category = event.target.closest("[data-feed-category]");
    if (category) {
      setFeedRoute({
        category: category.dataset.feedCategory,
        module: category.dataset.feedCategory === "other" ? "all" : state.feed.module,
        group: "all"
      });
      return;
    }

    const mode = event.target.closest("[data-feed-mode]");
    if (mode) {
      setFeedRoute({ workMode: mode.dataset.feedMode });
      return;
    }

    if (event.target.closest("[data-remote-only]")) {
      setFeedRoute({ category: "all", region: "all", module: "all", group: "all", workMode: "remote" });
      return;
    }

    const watch = event.target.closest("[data-watch-job]");
    if (watch) {
      toggleWatchlist(watch.dataset.watchJob);
      return;
    }

    const moduleFilter = event.target.closest("[data-module-filter]");
    if (moduleFilter) {
      setFeedRoute({ q: "", category: "sap", region: "all", module: moduleFilter.dataset.moduleFilter, group: "all", workMode: "all", source: "all" });
      return;
    }

    const categoryFilter = event.target.closest("[data-category-filter]");
    if (categoryFilter) {
      setFeedRoute({ q: "", category: categoryFilter.dataset.categoryFilter, region: "all", module: "all", group: "all", workMode: "all", source: "all" });
      return;
    }

    const groupFilter = event.target.closest("[data-group-filter]");
    if (groupFilter) {
      selectGroup(groupFilter.dataset.groupFilter);
      return;
    }

    if (event.target.closest("[data-clear-filters]")) {
      clearFilters();
      return;
    }

    if (event.target.closest("[data-clear-watchlist]")) {
      state.watchlist.clear();
      saveWatchlist();
      ui.showToast({ title: "Watchlist cleared", message: "All locally saved opportunities were removed.", tone: "warning" });
      render();
    }
  });

  document.body.addEventListener("change", (event) => {
    const select = event.target.closest("[data-feed-select]");
    if (!select) return;
    const key = select.dataset.feedSelect;
    const partial = { [key]: select.value };
    if (key === "module" && select.value !== "all") {
      partial.category = "sap";
      partial.group = "all";
    }
    if (key === "group" && select.value !== "all") {
      partial.category = select.value === "Other" ? "all" : "sap";
      partial.module = "all";
    }
    setFeedRoute(partial);
  });

  document.body.addEventListener("input", (event) => {
    if (event.target.id !== "feed-search") return;
    state.feed.q = event.target.value;
    const results = document.querySelector("#feed-results");
    if (results) results.innerHTML = renderFeedResults();
  });

  document.body.addEventListener("keydown", (event) => {
    const marker = event.target.closest("[data-map-region]");
    if (marker && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setFeedRoute({
        q: "",
        category: "sap",
        region: marker.dataset.mapRegion,
        module: "all",
        group: "all",
        workMode: "all",
        source: "all"
      });
    }
  });

  mobileMenu.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    mobileMenu.setAttribute("aria-expanded", String(open));
  });
  scrim.addEventListener("click", closeNavigation);
  window.addEventListener("hashchange", render);

  document.querySelectorAll("[data-icon]").forEach((slot) => {
    slot.innerHTML = icon(slot.dataset.icon);
  });

  if (!window.location.hash) {
    window.history.replaceState(null, "", "#overview");
  }
  updateWatchCount();
  render();
})();

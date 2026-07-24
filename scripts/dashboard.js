(function initialiseTalentRadarDashboard() {
  "use strict";

  const data = window.TalentRadarData;
  const ui = window.TalentRadar;
  const main = document.querySelector("#main-content");
  const watchCount = document.querySelector("#watchlist-count");
  const mobileMenu = document.querySelector("#mobile-menu");
  const scrim = document.querySelector("#sidebar-scrim");
  const aiApplyDialog = document.querySelector("#ai-apply-dialog");
  const aiApplyJob = document.querySelector("#ai-apply-job");
  const aiApplyAction = document.querySelector("#ai-apply-action");
  const aiApplyReadiness = document.querySelector("#ai-apply-readiness");
  const STORAGE_KEY = "talent-radar-watchlist-v2";

  if (!data || !ui || !main) {
    throw new Error("Talent Radar could not initialise because its data or shared helpers are missing.");
  }

  const routes = new Set([
    "overview",
    "opportunities",
    "job-detail",
    "sap-landscape",
    "workstreams",
    "watchlist",
    "settings"
  ]);

  const routeAliases = {
    home: "overview",
    feed: "opportunities",
    modules: "sap-landscape",
    pipeline: "sap-landscape",
    workstreams: "sap-landscape",
    alerts: "watchlist",
    sources: "settings"
  };

  const state = {
    route: "overview",
    region: "all",
    homeEmployment: "all",
    homeWorkMode: "all",
    market: {
      region: "all",
      employment: "all",
      workMode: "all"
    },
    spotlight: "sydney",
    watchlist: readWatchlist(),
    feed: {
      q: "",
      category: "all",
      region: "all",
      module: "all",
      group: "all",
      workMode: "all",
      source: "all",
      employment: "all"
    },
    jobId: ""
  };

  const spotlights = [
    {
      id: "sydney",
      label: "Sydney",
      short: "SAP Ariba Consultant",
      detail: "SAP Ariba Consultant at IBM",
      rate: "Hybrid · Full time",
      copy: "Current sourcing and procurement opportunity spanning Sydney and Melbourne.",
      icon: "user",
      tone: "coral",
      marker: { x: 496, y: 310, labelX: 510, labelY: 292, width: 76 }
    },
    {
      id: "melbourne",
      label: "Melbourne",
      short: "SAP Solution Architect",
      detail: "SAP Solution Architect at EY",
      rate: "Hybrid · Full time",
      copy: "Current S/4HANA transformation leadership role across Melbourne, Sydney and Canberra.",
      icon: "user",
      tone: "orange",
      marker: { x: 430, y: 358, labelX: 318, labelY: 340, width: 102 }
    },
    {
      id: "remote",
      label: "Remote Australia",
      short: "SAP FICO Consultant",
      detail: "SAP FICO Consultant at COSOL",
      rate: "Fully remote",
      copy: "Verified remote contract available anywhere in Australia.",
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
    },
    {
      id: "remote-au",
      region: "australia-wide",
      label: "Remote AU",
      tone: "teal",
      marker: { x: 310, y: 242, labelX: 190, labelY: 218, width: 108, lineX: 298 }
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
    const australiaRemote =
      normaliseWorkMode(job.workMode) === "remote" &&
      (job.region === "AU" || location.includes("australia"));

    if (region === "australia-wide") return australiaWide || australiaRemote;
    if (region === "new-zealand") {
      return (
        job.region === "NZ" ||
        /\b(new zealand|auckland|wellington|christchurch)\b/.test(location)
      );
    }

    const cityPatterns = {
      sydney: /\b(sydney|blacktown)\b/,
      melbourne: /\b(melbourne|clayton|moorabbin)\b/,
      adelaide: /\badelaide\b/,
      canberra: /\b(canberra|act)\b/,
      brisbane: /\bbrisbane\b/,
      perth: /\b(perth|western australia|wa)\b/
    };
    const pattern = cityPatterns[region];
    return Boolean(pattern && pattern.test(location));
  }

  function mapRegionMatchesJob(job, region) {
    if (region === "all") return true;

    const location = (job.location || "").trim().toLowerCase();
    if (region === "australia-wide") {
      return (
        /^(all )?australia$/.test(location) ||
        (normaliseWorkMode(job.workMode) === "remote" &&
          (job.region === "AU" || location.includes("australia")))
      );
    }
    if (region === "new-zealand") {
      return (
        job.region === "NZ" ||
        /\b(new zealand|auckland|wellington|christchurch)\b/.test(location)
      );
    }

    const cityPatterns = {
      sydney: /\b(sydney|blacktown)\b/,
      melbourne: /\b(melbourne|clayton|moorabbin)\b/,
      adelaide: /\badelaide\b/,
      canberra: /\b(canberra|act)\b/,
      brisbane: /\bbrisbane\b/,
      perth: /\b(perth|western australia|wa)\b/
    };
    return Boolean(cityPatterns[region]?.test(location));
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
    if (raw.startsWith("job/")) return "job-detail";
    const route = routeAliases[raw] || raw;
    return routes.has(route) ? route : "overview";
  }

  function jobIdFromHash(hash) {
    const raw = (hash || "").replace(/^#/, "").split("?")[0];
    if (!raw.startsWith("job/")) return "";
    try {
      return decodeURIComponent(raw.slice(4));
    } catch {
      return raw.slice(4);
    }
  }

  function icon(name, className) {
    return ui.icon(name, className);
  }

  function esc(value) {
    return ui.escapeHtml(value == null ? "" : value);
  }

  function snapshot() {
    return `<span class="snapshot">${icon("calendar")}<span>Checked 24 Jul 2026</span></span>`;
  }

  function archiveNote() {
    return `
      <div class="archive-note">
        ${icon("shield")}
        <span><strong>Application checked:</strong> every role links to a public listing that showed Apply on 24 Jul 2026.</span>
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
    state.jobId = state.route === "job-detail" ? jobIdFromHash(window.location.hash) : "";
    document.documentElement.classList.toggle("home-route", state.route === "overview");
    document.body.classList.toggle("home-route", state.route === "overview");
    document.body.classList.toggle(
      "feed-route",
      state.route === "opportunities" || state.route === "job-detail"
    );
    const navigationRoute = state.route === "job-detail" ? "opportunities" : state.route;
    document.querySelectorAll("[data-route-link]").forEach((link) => {
      const active = link.dataset.routeLink === navigationRoute;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const renderers = {
      overview: renderHome,
      opportunities: renderFeed,
      "job-detail": renderJobDetail,
      "sap-landscape": renderModules,
      workstreams: renderModules,
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
    const mapJobs = data.jobs
      .filter((job) => job.stream === "SAP" && job.applyStatus === "open" && job.sourceUrl)
      .filter(
        (job) =>
          state.homeEmployment === "all" || employmentTypeForJob(job) === state.homeEmployment
      )
      .filter(
        (job) => state.homeWorkMode === "all" || normaliseWorkMode(job.workMode) === state.homeWorkMode
      );
    const visibleMapJobs = mapJobs.filter((job) => regionMatchesJob(job, state.region));
    const regionOptions = feedRegions;
    const activeRegionLabel = regionOptions.find(([value]) => value === state.region)?.[1] || "All regions";
    const activeScope = [
      activeRegionLabel,
      state.homeEmployment === "permanent"
        ? "Permanent"
        : state.homeEmployment === "contract"
          ? "Contract"
          : "",
      state.homeWorkMode === "onsite"
        ? "On-site"
        : state.homeWorkMode === "hybrid"
          ? "Hybrid"
          : state.homeWorkMode === "remote"
            ? "Remote"
            : ""
    ].filter(Boolean);
    return `
      <section class="page home-page" data-page="overview">
        ${pageHeader({
          title: "Opportunity map",
          subtitle: "Explore verified SAP opportunities across Australia and New Zealand."
        })}

        <div class="map-filter-bar" aria-label="Map filters">
          <label class="map-region-select">
            <span>Region</span>
            <select data-home-region aria-label="Region">
              ${regionOptions
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${state.region === value ? "selected" : ""}>${label}</option>`
                )
                .join("")}
            </select>
          </label>

          <div class="map-filter-group" aria-label="Employment type">
            <span>Employment</span>
            <div>
              ${[
                ["all", "All roles"],
                ["permanent", "Permanent"],
                ["contract", "Contract"]
              ]
                .map(
                  ([value, label]) => `
                    <button class="${state.homeEmployment === value ? "active" : ""}" type="button"
                      aria-pressed="${state.homeEmployment === value}" data-home-employment="${value}">${label}</button>`
                )
                .join("")}
            </div>
          </div>

          <div class="map-filter-group work-mode" aria-label="Work arrangement">
            <span>Work arrangement</span>
            <div>
              ${[
                ["all", "All"],
                ["onsite", "On-site"],
                ["hybrid", "Hybrid"],
                ["remote", "Remote"]
              ]
                .map(
                  ([value, label]) => `
                    <button class="${state.homeWorkMode === value ? "active" : ""}" type="button"
                      aria-pressed="${state.homeWorkMode === value}" data-home-mode="${value}">${label}</button>`
                )
                .join("")}
            </div>
          </div>

          <button class="map-filter-reset" type="button" data-clear-map-filters>Reset</button>
        </div>

        <div class="explorer-grid">
          <div class="map-panel">
            <button class="opportunity-count" type="button" data-home-total
              aria-label="Open ${visibleMapJobs.length} filtered opportunities in the feed">
              <div><strong>${visibleMapJobs.length}</strong><span>${visibleMapJobs.length === 1 ? "opportunity" : "opportunities"}</span></div>
              <small>${esc(activeScope.join(" · "))}</small>
            </button>
            <div class="map-glow" aria-hidden="true"></div>
            ${renderMap(mapJobs)}
            <button class="home-map-action" type="button" data-home-ai-feed
              aria-label="Open the filtered opportunity feed to apply with AI">
              ${icon("radar")}<span>Apply with AI</span>${icon("arrow-right")}
            </button>
          </div>
        </div>
      </section>`;
  }

  function renderMap(mapJobs) {
    // Coastline paths are projected from Natural Earth 1:50m country geometry
    // published through Geoscience Australia's Natural_Earth_Countries service.
    const markers = mapRegions
      .map((item) => {
        const { x, y, labelX, labelY, width, lineX } = item.marker;
        const count = mapJobs.filter((job) => regionMatchesJob(job, item.region)).length;
        const isSelected = state.region === item.region;
        const isMuted = state.region !== "all" && !isSelected;
        const color =
          item.tone === "coral"
            ? "#ef5e55"
            : item.tone === "orange"
              ? "#f2a11a"
              : item.tone === "teal"
                ? "#39967c"
                : "#2874ad";
        return `
          <g class="map-marker ${isSelected ? "active" : ""} ${isMuted ? "muted" : ""}" role="button" tabindex="0"
            aria-label="Open ${esc(item.label)} in the feed, ${count} verified SAP ${count === 1 ? "role" : "roles"}"
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
    const mobilePositions = {
      perth: [7, 55],
      adelaide: [27, 60],
      melbourne: [36, 74],
      canberra: [53, 65],
      sydney: [58, 54],
      brisbane: [60, 39],
      "new-zealand": [69, 77],
      "australia-wide": [17, 43]
    };
    const mobileMarkers = mapRegions
      .map((item) => {
        const count = mapJobs.filter((job) => regionMatchesJob(job, item.region)).length;
        const isSelected = state.region === item.region;
        const isMuted = state.region !== "all" && !isSelected;
        const [left, top] = mobilePositions[item.region];
        return `
          <button class="mobile-map-marker ${item.tone} ${isSelected ? "active" : ""} ${isMuted ? "muted" : ""}"
            type="button" style="left:${left}%;top:${top}%"
            aria-label="Open ${esc(item.label)} in the feed, ${count} verified SAP ${count === 1 ? "role" : "roles"}"
            data-map-region="${item.region}">
            <span aria-hidden="true"></span>${esc(item.label)} <strong>${count}</strong>
          </button>`;
      })
      .join("");

    return `
      <svg class="region-map ${state.region === "all" ? "" : "region-selected"}" viewBox="0 0 850 520" role="img"
        aria-label="Map of Australia and New Zealand with SAP opportunity markers in Perth, Adelaide, Melbourne, Canberra, Sydney, Brisbane, remote Australia, and New Zealand">
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
      </svg>
      <div class="mobile-map-labels" aria-label="Mobile map regions">${mobileMarkers}</div>`;
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

  function renderFeedLegacy() {
    const modules = [...new Set(data.jobs.filter((job) => job.stream === "SAP").map((job) => job.module))].sort();
    const sources = [...new Set(data.jobs.map((job) => job.source))].sort();
    return `
      <section class="page" data-page="opportunities">
        ${pageHeader({
          eyebrow: "Opportunity feed",
          title: "Every opportunity, in sequence",
          subtitle: "Current public listings, ordered newest first. Filter by SAP sub-module, work arrangement, region or source.",
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
            <select class="filter-select" aria-label="Employment type" data-feed-select="employment">
              ${[
                ["all", "All employment types"],
                ["permanent", "Permanent"],
                ["contract", "Contract"]
              ]
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${state.feed.employment === value ? "selected" : ""}>${label}</option>`
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

  function renderFeed() {
    const openJobs = data.jobs.filter((job) => job.applyStatus === "open" && job.sourceUrl);
    const modules = [...new Set(openJobs.filter((job) => job.stream === "SAP").map((job) => job.module))].sort();
    const sources = [...new Set(openJobs.map((job) => job.source))].sort();
    const countBy = (predicate) => openJobs.filter(predicate).length;
    const railButton = ({ value, label, count, iconName, active, attribute }) => `
      <button class="filter-rail-option ${active ? "active" : ""}" type="button" ${attribute}="${esc(value)}"
        aria-pressed="${active}">
        <span class="filter-rail-option-icon">${icon(iconName)}</span>
        <span>${esc(label)}</span>
        <strong>${count}</strong>
      </button>`;
    const employmentOptions = [
      ["all", "All employment", openJobs.length, "briefcase"],
      ["permanent", "Permanent", countBy((job) => employmentTypeForJob(job) === "permanent"), "briefcase"],
      ["contract", "Contract", countBy((job) => employmentTypeForJob(job) === "contract"), "clock"],
      ["temporary", "Temporary", countBy((job) => employmentTypeForJob(job) === "temporary"), "calendar"]
    ];
    const workModeOptions = [
      ["all", "All work modes", openJobs.length, "briefcase"],
      ["onsite", "On-site", countBy((job) => normaliseWorkMode(job.workMode) === "onsite"), "location"],
      ["hybrid", "Hybrid", countBy((job) => normaliseWorkMode(job.workMode) === "hybrid"), "home"],
      ["remote", "Remote", countBy((job) => normaliseWorkMode(job.workMode) === "remote"), "globe"]
    ];
    const categoryOptions = [
      ["all", "All opportunities", openJobs.length, "pulse"],
      ["sap", "SAP opportunities", countBy((job) => job.stream === "SAP"), "database"],
      ["other", "Non-SAP opportunities", countBy((job) => job.stream !== "SAP"), "briefcase"]
    ];

    return `
      <section class="page feed-page" data-page="opportunities">
        ${pageHeader({
          eyebrow: "Opportunity feed",
          title: "Every opportunity, in sequence",
          subtitle: "Current public listings, ordered newest first. Use the filter panel to narrow the market.",
          note: true
        })}

        <div class="feed-toolbar" aria-label="Search and location filters">
          <div class="feed-control-top">
            <label class="search-field">
              <span class="sr-only">Search opportunities</span>
              ${icon("search")}
              <input id="feed-search" type="search" value="${esc(state.feed.q)}"
                placeholder="Search roles, companies, skills or locations..." autocomplete="off" />
            </label>
            <select class="filter-select" aria-label="Region" data-feed-select="region">
              ${feedRegions
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${state.feed.region === value ? "selected" : ""}>${label}</option>`
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
            <button class="clear-filters toolbar-clear" type="button" data-clear-filters>Clear all</button>
          </div>
        </div>

        <div class="feed-layout">
          <aside class="feed-filter-panel" aria-label="Opportunity filters">
            <div class="filter-panel-heading">
              <div>${icon("filter")}<h2>Filter opportunities</h2></div>
              <button type="button" data-clear-filters>Reset</button>
            </div>

            <section class="filter-rail-group" aria-labelledby="employment-filter-title">
              <h3 id="employment-filter-title">Employment type</h3>
              <div class="filter-rail-options">
                ${employmentOptions
                  .map(([value, label, count, iconName]) =>
                    railButton({
                      value,
                      label,
                      count,
                      iconName,
                      active: state.feed.employment === value,
                      attribute: "data-feed-employment"
                    })
                  )
                  .join("")}
              </div>
            </section>

            <section class="filter-rail-group" aria-labelledby="workmode-filter-title">
              <h3 id="workmode-filter-title">Work arrangement</h3>
              <div class="filter-rail-options">
                ${workModeOptions
                  .map(([value, label, count, iconName]) =>
                    railButton({
                      value,
                      label,
                      count,
                      iconName,
                      active: state.feed.workMode === value,
                      attribute: "data-feed-mode"
                    })
                  )
                  .join("")}
              </div>
            </section>

            <section class="filter-rail-group" aria-labelledby="category-filter-title">
              <h3 id="category-filter-title">Opportunity type</h3>
              <div class="filter-rail-options">
                ${categoryOptions
                  .map(([value, label, count, iconName]) =>
                    railButton({
                      value,
                      label,
                      count,
                      iconName,
                      active: state.feed.category === value && state.feed.module === "all",
                      attribute: "data-feed-category"
                    })
                  )
                  .join("")}
              </div>
            </section>

            <section class="filter-rail-group module-filter-group" aria-labelledby="module-filter-title">
              <h3 id="module-filter-title">SAP modules</h3>
              <div class="filter-rail-options">
                ${railButton({
                  value: "all",
                  label: "All SAP modules",
                  count: countBy((job) => job.stream === "SAP"),
                  iconName: "database",
                  active: state.feed.category === "sap" && state.feed.module === "all",
                  attribute: "data-feed-module"
                })}
                ${modules
                  .map((module) =>
                    railButton({
                      value: module,
                      label: module,
                      count: countBy((job) => job.stream === "SAP" && job.module === module),
                      iconName: "tag",
                      active: state.feed.category === "sap" && state.feed.module === module,
                      attribute: "data-feed-module"
                    })
                  )
                  .join("")}
              </div>
            </section>
          </aside>

          <div class="feed-results-column">
            <div id="feed-results">${renderFeedResults()}</div>
          </div>
        </div>
      </section>`;
  }

  function filteredJobs() {
    const query = state.feed.q.trim().toLowerCase();
    return data.jobs
      .filter((job) => job.applyStatus === "open" && job.sourceUrl)
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
        if (state.feed.employment !== "all" && employmentTypeForJob(job) !== state.feed.employment) return false;
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
          ? " · New Zealand roles"
          : state.feed.region === "australia-wide"
            ? " · Australia-wide roles"
            : ` · ${selectedRegion ? selectedRegion[1] : "Selected region"} roles`;
    const employmentScope =
      state.feed.employment === "permanent"
        ? " · Permanent roles"
        : state.feed.employment === "contract"
          ? " · Contract roles"
          : state.feed.employment === "temporary"
            ? " · Temporary roles"
            : "";
    const moduleScope = state.feed.module === "all" ? "" : ` · ${state.feed.module}`;
    const groupScope =
      state.feed.group === "all"
        ? ""
        : ` · ${state.feed.group === "Other" ? "Other & unclassified" : state.feed.group} workstream`;
    return `
      <div class="feed-summary">
        <div><strong>${jobs.length} ${jobs.length === 1 ? "opportunity" : "opportunities"}</strong>
          <span>${regionScope}${employmentScope}${moduleScope}${groupScope} · newest public listing first</span></div>
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
    const employment = employmentTypeForJob(job);
    const saved = state.watchlist.has(job.id);
    const modeIcon = mode === "remote" ? "globe" : mode === "hybrid" ? "home" : mode === "fifo" ? "location" : "briefcase";
    const displayDate = formatRecordDate(job.firstSeen);
    return `
      <article class="job-card ${mode === "remote" ? "remote" : ""}" data-job-id="${esc(job.id)}">
        <div>
          <div class="job-meta-row">
            <span class="job-index">Opportunity ${String(index).padStart(2, "0")}</span>
            <span class="badge ${mode}">${icon(modeIcon)}${esc(workModeLabels[mode])}</span>
            ${
              employment !== "not-stated"
                ? `<span class="badge employment ${employment}">${esc(
                    employment === "permanent" ? "Permanent" : employment === "contract" ? "Contract" : "Temporary"
                  )}</span>`
                : ""
            }
            <span class="badge archive">${icon("shield")}Apply link verified</span>
            ${job.stream === "Other" ? `<span class="badge onsite">All other jobs</span>` : ""}
          </div>
          <h2>${esc(job.title)}</h2>
          <p class="job-company">${esc(job.company)}</p>
          <div class="job-facts">
            <span class="job-fact">${icon("location")}${esc(job.location)}</span>
            <span class="job-fact">${icon("calendar")}${esc(job.postedLabel || displayDate)}</span>
            <span class="job-fact">${icon("external")}${esc(job.source)}</span>
          </div>
          <p class="job-summary">${esc(job.summary)}</p>
          <a class="secondary-action job-details-link" href="#job/${encodeURIComponent(job.id)}">
            View full job details ${icon("chevron-right")}
          </a>
        </div>
        <div class="job-actions">
          ${job.rate ? `<span class="job-rate">${esc(job.rate)}</span>` : ""}
          <button class="primary-action ai-apply-button" type="button" data-ai-apply="${esc(job.id)}">
            ${icon("radar")}Apply with AI
          </button>
          <button class="secondary-action ${saved ? "saved" : ""}" type="button" data-watch-job="${esc(job.id)}">
            ${icon("bookmark")}${saved ? "Saved to watchlist" : "Save to watchlist"}
          </button>
          <p class="source-caveat">${esc(job.source)} application page checked ${esc(
            formatRecordDate(job.verifiedAt)
          )}. The source opens only for MFA, CAPTCHA or final submission.</p>
        </div>
      </article>`;
  }

  function jobDetailFocus(job) {
    const skills = (job.skills || []).filter(Boolean);
    const skillText = skills.length ? skills.join(", ") : job.module;
    const employment = employmentTypeForJob(job);
    const mode = normaliseWorkMode(job.workMode);
    const roleSetting = [
      mode === "not-stated" ? "" : workModeLabels[mode],
      employment === "not-stated" ? "role" : `${employment} role`
    ]
      .filter(Boolean)
      .join(" ");
    const groupCopy = {
      Functional: `Translate business requirements into practical ${job.module} process and configuration outcomes.`,
      Technical: `Design, build, test and support the technical solution across ${skillText}.`,
      Leadership: `Lead delivery decisions, stakeholders and execution across the advertised ${job.module} scope.`,
      Other: `Coordinate the advertised work across business and delivery teams.`
    };
    return [
      job.summary,
      job.priorityReason,
      groupCopy[job.group] || groupCopy.Other,
      `${roleSetting} based in ${job.location}.`
    ].filter((item, index, values) => item && values.indexOf(item) === index);
  }

  function renderJobDetail() {
    const job = data.jobs.find((item) => item.id === state.jobId);
    if (!job) {
      return `
        <section class="page job-detail-page" data-page="job-detail">
          <a class="job-detail-back" href="#opportunities">${icon("arrow-right")}Back to opportunity feed</a>
          ${renderEmptyState("search", "Opportunity not found", "This listing is no longer available in the current Talent Radar snapshot.")}
        </section>`;
    }

    const mode = normaliseWorkMode(job.workMode);
    const employment = employmentTypeForJob(job);
    const saved = state.watchlist.has(job.id);
    const displayDate = formatRecordDate(job.firstSeen);
    const modeIcon = mode === "remote" ? "globe" : mode === "hybrid" ? "home" : mode === "fifo" ? "location" : "briefcase";
    const focus = jobDetailFocus(job);
    const skills = [job.module, ...(job.skills || [])].filter(
      (item, index, values) => item && values.indexOf(item) === index
    );

    return `
      <section class="page job-detail-page" data-page="job-detail">
        <a class="job-detail-back" href="#opportunities">${icon("arrow-right")}Back to opportunity feed</a>

        <div class="job-detail-layout">
          <article class="job-detail-main">
            <header class="job-detail-hero">
              <div class="job-meta-row">
                <span class="badge ${mode}">${icon(modeIcon)}${esc(workModeLabels[mode])}</span>
                ${
                  employment !== "not-stated"
                    ? `<span class="badge employment ${employment}">${esc(
                        employment === "permanent" ? "Permanent" : employment === "contract" ? "Contract" : "Temporary"
                      )}</span>`
                    : ""
                }
                <span class="badge archive">${icon("shield")}Application verified</span>
              </div>
              <h1>${esc(job.title)}</h1>
              <p class="job-detail-company">${esc(job.company)}</p>
              <div class="job-detail-facts">
                <span>${icon("location")}<strong>Location</strong>${esc(job.location)}</span>
                <span>${icon("calendar")}<strong>Listed</strong>${esc(job.postedLabel || displayDate)}</span>
                <span>${icon("database")}<strong>Source</strong>${esc(job.source)}</span>
                ${
                  job.rate
                    ? `<span>${icon("tag")}<strong>Rate</strong>${esc(job.rate)}</span>`
                    : ""
                }
              </div>
            </header>

            <section class="job-description-section">
              <h2>Job description</h2>
              <p class="job-description-lead">${esc(job.summary)}</p>
              <p>${esc(job.priorityReason || "This role is included because its public application page was active when Talent Radar checked it.")}</p>
            </section>

            <section class="job-description-section">
              <h2>What you will work on</h2>
              <ul class="job-detail-list">
                ${focus.map((item) => `<li>${icon("check-circle")}<span>${esc(item)}</span></li>`).join("")}
              </ul>
            </section>

            <section class="job-description-section">
              <h2>Skills highlighted in the listing</h2>
              <div class="job-detail-skills">
                ${skills.map((skill) => `<span>${esc(skill)}</span>`).join("")}
              </div>
              <p class="job-detail-note">Talent Radar presents a structured, non-verbatim brief from the current public listing so you can assess the opportunity without leaving the app.</p>
            </section>

            <section class="job-description-section source-verification">
              <div>${icon("shield")}</div>
              <div>
                <h2>Source and application verification</h2>
                <p><strong>${esc(job.source)}</strong> showed an active application path when checked on ${esc(
                  formatRecordDate(job.verifiedAt)
                )}.</p>
                <p>The external source remains in the background. Talent Radar only opens it when MFA, CAPTCHA or final submission requires your involvement.</p>
              </div>
            </section>
          </article>

          <aside class="job-detail-actions" aria-label="Application options">
            <p class="job-detail-actions-label">Application options</p>
            <h2>Interested in this role?</h2>
            <p>Review the internal brief, then let Talent Radar prepare the application using Mahendra's profile.</p>
            <button class="primary-action ai-apply-button" type="button" data-ai-apply="${esc(job.id)}">
              ${icon("radar")}Apply with AI
            </button>
            <button class="secondary-action ${saved ? "saved" : ""}" type="button" data-watch-job="${esc(job.id)}">
              ${icon("bookmark")}${saved ? "Saved to watchlist" : "Save to watchlist"}
            </button>
            <dl class="job-detail-status">
              <div><dt>Vacancy</dt><dd>Open when checked</dd></div>
              <div><dt>Apply link</dt><dd>Verified</dd></div>
              <div><dt>External handoff</dt><dd>Only when required</dd></div>
            </dl>
          </aside>
        </div>
      </section>`;
  }

  function normaliseWorkMode(value) {
    const mode = String(value || "").toLowerCase();
    if (mode.includes("remote")) return "remote";
    if (mode.includes("hybrid")) return "hybrid";
    if (mode.includes("fifo")) return "fifo";
    if (mode.includes("on-site") || mode.includes("onsite") || mode.includes("office")) return "onsite";
    return "not-stated";
  }

  function employmentTypeForJob(job) {
    const description = `${job.engagement || ""} ${job.type || ""}`.toLowerCase();
    if (/\b(temporary|fixed[\s-]?term)\b/.test(description)) return "temporary";
    if (/\b(contract|day rate|hourly)\b/.test(description)) return "contract";
    if (/\b(permanent|regular full time)\b/.test(description)) return "permanent";
    return "not-stated";
  }

  function openAiApplication(jobId) {
    const job = data.jobs.find((item) => item.id === jobId);
    if (!job || !aiApplyDialog || !aiApplyJob || !aiApplyAction || !aiApplyReadiness) return;
    const employment = employmentTypeForJob(job);
    aiApplyDialog.dataset.jobId = job.id;
    aiApplyJob.innerHTML = `
      <span class="ai-profile-chip">${icon("user")}Apply as Mahendra</span>
      <h3>${esc(job.title)}</h3>
      <p>${esc(job.company)} · ${esc(job.location)}</p>
      <div>
        <span>${esc(workModeLabels[normaliseWorkMode(job.workMode)])}</span>
        ${
          employment === "not-stated"
            ? ""
            : `<span>${esc(employment === "permanent" ? "Permanent" : employment === "contract" ? "Contract" : "Temporary")}</span>`
        }
      </div>`;
    aiApplyAction.disabled = false;
    aiApplyAction.innerHTML = `${icon("radar")}Prepare application in Talent Radar`;
    aiApplyReadiness.innerHTML = `
      <strong>Talent Radar stays in control.</strong>
      The source website will open only if MFA, CAPTCHA or final submission needs you.`;
    if (typeof aiApplyDialog.showModal === "function") aiApplyDialog.showModal();
    else aiApplyDialog.setAttribute("open", "");
  }

  function formatRecordDate(value) {
    if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(value || "")) return "Date not stated";
    const parts = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-AU", {
      day: parts[2] ? "numeric" : undefined,
      month: "short",
      year: "numeric"
    }).format(new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] || 1)));
  }

  function moduleLocationSummary(jobs, limit = 3) {
    const locations = feedRegions
      .filter(([id]) => !["all", "australia-wide"].includes(id))
      .map(([id, label]) => ({
        label,
        count: jobs.filter((job) => regionMatchesJob(job, id)).length
      }))
      .filter((item) => item.count)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    if (!locations.length) return "Regional AU/NZ";
    return locations
      .slice(0, limit)
      .map((item) => `${item.label} ${item.count}`)
      .join(" · ");
  }

  function moduleWorkModeSummary(jobs) {
    const counts = new Map();
    jobs.forEach((job) => {
      const mode = normaliseWorkMode(job.workMode);
      counts.set(mode, (counts.get(mode) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mode, count]) => `${workModeLabels[mode]} ${count}`)
      .join(" · ");
  }

  function numericRateSignals(jobs) {
    return [
      ...new Set(
        jobs
          .map((job) => job.rate)
          .filter((rate) => rate && /\d/.test(rate) && !/flexible|competitive/i.test(rate))
      )
    ];
  }

  function moduleRateSummary(jobs) {
    const rates = numericRateSignals(jobs);
    if (!rates.length) return "Not advertised";
    if (rates.length === 1) return rates[0];
    return `${rates.length} disclosed · ${rates.slice(0, 2).join(" · ")}`;
  }

  function moduleIntelligence(sourceJobs = data.jobs) {
    const recentCutoff = "2026-07-10";
    const grouped = new Map();

    sourceJobs
      .filter((job) => job.stream === "SAP")
      .forEach((job) => {
        if (!grouped.has(job.module)) grouped.set(job.module, []);
        grouped.get(job.module).push(job);
      });

    return [...grouped.entries()]
      .map(([module, jobs]) => {
        const recentCount = jobs.filter((job) => (job.firstSeen || "") >= recentCutoff).length;
        const trend =
          recentCount >= 3
            ? { label: "Hot now", tone: "hot" }
            : recentCount >= 1
              ? { label: "New activity", tone: "new" }
              : { label: "Steady", tone: "steady" };
        return {
          module,
          jobs,
          count: jobs.length,
          recentCount,
          trend,
          score: recentCount * 3 + jobs.length,
          group: jobs[0]?.group || "Other",
          locations: moduleLocationSummary(jobs),
          workModes: moduleWorkModeSummary(jobs),
          rates: moduleRateSummary(jobs)
        };
      })
      .sort((a, b) => b.count - a.count || b.recentCount - a.recentCount || a.module.localeCompare(b.module));
  }

  function renderModules() {
    const baseJobs = data.jobs.filter(
      (job) => job.stream === "SAP" && job.applyStatus === "open" && job.sourceUrl
    );
    const marketJobs = baseJobs.filter((job) => {
      if (!regionMatchesJob(job, state.market.region)) return false;
      if (
        state.market.employment !== "all" &&
        employmentTypeForJob(job) !== state.market.employment
      )
        return false;
      if (
        state.market.workMode !== "all" &&
        normaliseWorkMode(job.workMode) !== state.market.workMode
      )
        return false;
      return true;
    });
    const intelligence = moduleIntelligence(marketJobs);
    const maxModuleCount = Math.max(...intelligence.map((item) => item.count), 1);
    const workstreams = [
      { id: "Functional", label: "Functional", tone: "functional" },
      { id: "Technical", label: "Technical", tone: "technical" },
      { id: "Leadership", label: "Leadership", tone: "leadership" },
      { id: "Other", label: "Other", tone: "other" }
    ].map((stream) => ({
      ...stream,
      count: marketJobs.filter((job) =>
        stream.id === "Other"
          ? !["Functional", "Technical", "Leadership"].includes(job.group)
          : job.group === stream.id
      ).length
    }));
    const hybridCount = marketJobs.filter(
      (job) => normaliseWorkMode(job.workMode) === "hybrid"
    ).length;
    const contractCount = marketJobs.filter(
      (job) => employmentTypeForJob(job) === "contract"
    ).length;
    const hottest = [...intelligence]
      .sort((a, b) => b.score - a.score || b.count - a.count)
      .slice(0, 3);
    const recentlyAdded = [...marketJobs]
      .sort((a, b) => (b.firstSeen || "").localeCompare(a.firstSeen || ""))
      .slice(0, 3);
    const remoteIntelligence = moduleIntelligence(
      marketJobs.filter((job) => normaliseWorkMode(job.workMode) === "remote")
    ).slice(0, 3);
    const topLocations = feedRegions
      .filter(([id]) => id !== "all")
      .map(([id, label]) => ({
        id,
        label,
        count: marketJobs.filter((job) => mapRegionMatchesJob(job, id)).length
      }))
      .filter((item) => item.count)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 3);
    const workstreamTotal = Math.max(
      workstreams.reduce((sum, stream) => sum + stream.count, 0),
      1
    );

    return `
      <section class="page sap-market-page" data-page="sap-landscape">
        ${pageHeader({
          title: "SAP Market overview",
          subtitle: "High-level view of verified SAP opportunities across modules and workstreams."
        })}

        <div class="sap-market-toolbar" aria-label="SAP market filters">
          <label>
            <span>Region</span>
            <select data-market-select="region" aria-label="Market region">
              ${feedRegions
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${state.market.region === value ? "selected" : ""}>${label}</option>`
                )
                .join("")}
            </select>
          </label>
          <label>
            <span>Employment</span>
            <select data-market-select="employment" aria-label="Market employment">
              ${[
                ["all", "All employment types"],
                ["permanent", "Permanent"],
                ["contract", "Contract"],
                ["temporary", "Temporary"]
              ]
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${state.market.employment === value ? "selected" : ""}>${label}</option>`
                )
                .join("")}
            </select>
          </label>
          <label>
            <span>Work arrangement</span>
            <select data-market-select="workMode" aria-label="Market work arrangement">
              ${[
                ["all", "All work arrangements"],
                ["onsite", "On-site"],
                ["hybrid", "Hybrid"],
                ["remote", "Remote"]
              ]
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${state.market.workMode === value ? "selected" : ""}>${label}</option>`
                )
                .join("")}
            </select>
          </label>
          <button type="button" data-clear-market-filters>${icon("refresh")}Clear</button>
        </div>

        <div class="sap-market-metrics" aria-label="Market summary">
          ${[
            ["briefcase", marketJobs.length, "opportunities", "Across active modules", "blue"],
            ["database", intelligence.length, "active modules", "With verified demand", "teal"],
            ["user", hybridCount, "hybrid roles", "Across opportunities", "orange"],
            ["calendar", contractCount, "contract roles", "Across opportunities", "purple"]
          ]
            .map(
              ([iconName, value, label, copy, tone]) => `
                <article class="sap-market-metric tone-${tone}">
                  <span>${icon(iconName)}</span>
                  <div><strong>${value}</strong><b>${label}</b><small>${copy}</small></div>
                </article>`
            )
            .join("")}
        </div>

        <div class="sap-market-primary">
          <section class="sap-market-panel module-ranking-panel" aria-labelledby="market-module-title">
            <div class="sap-market-panel-heading">
              <div><h2 id="market-module-title">Opportunities by SAP module</h2><p>Ranked by current verified demand.</p></div>
              <span>${intelligence.length} active</span>
            </div>
            ${
              intelligence.length
                ? `<div class="sap-module-table" role="table" aria-label="Opportunities by SAP module">
                    <div class="sap-module-table-head" role="row">
                      <span>#</span><span>Module</span><span>Opportunities</span><span>Relative demand</span><span></span>
                    </div>
                    ${intelligence
                      .slice(0, 7)
                      .map(
                        (item, index) => `
                          <button class="sap-module-table-row" type="button" role="row"
                            data-module-filter="${esc(item.module)}" aria-label="View ${esc(item.module)} opportunities">
                            <span>${index + 1}</span>
                            <strong>${esc(item.module)}</strong>
                            <b>${item.count}</b>
                            <i><em style="width:${Math.max(8, Math.round((item.count / maxModuleCount) * 100))}%"></em></i>
                            ${icon("chevron-right")}
                          </button>`
                      )
                      .join("")}
                  </div>`
                : `<div class="sap-market-empty">No SAP modules match these filters.</div>`
            }
            <button class="sap-market-panel-link" type="button" data-clear-market-filters>View all modules ${icon("arrow-right")}</button>
          </section>

          <section class="sap-market-panel workstream-mix-panel" aria-labelledby="workstream-mix-title">
            <div class="sap-market-panel-heading">
              <div><h2 id="workstream-mix-title">Workstream mix</h2><p>How current opportunities are distributed.</p></div>
            </div>
            <div class="workstream-stack" aria-label="Workstream distribution">
              ${workstreams
                .filter((stream) => stream.count)
                .map(
                  (stream) =>
                    `<span class="${stream.tone}" style="width:${(stream.count / workstreamTotal) * 100}%"
                      title="${esc(stream.label)}: ${stream.count}"></span>`
                )
                .join("")}
            </div>
            <div class="workstream-mix-list">
              ${workstreams
                .map(
                  (stream) => `
                    <button type="button" data-group-filter="${stream.id}">
                      <i class="${stream.tone}"></i>
                      <span>${stream.label}</span>
                      <strong>${stream.count}</strong>
                      <small>${Math.round((stream.count / workstreamTotal) * 100)}%</small>
                      ${icon("chevron-right")}
                    </button>`
                )
                .join("")}
            </div>
            <button class="sap-market-panel-link" type="button" data-market-all-workstreams>
              View all workstreams ${icon("arrow-right")}
            </button>
          </section>
        </div>

        <section class="sap-market-panel matrix-panel" aria-labelledby="market-matrix-title">
          <div class="sap-market-panel-heading">
            <div><h2 id="market-matrix-title">Module × workstream opportunity matrix</h2><p>Select any value to open the matching opportunities.</p></div>
          </div>
          ${
            intelligence.length
              ? `<div class="sap-matrix-wrap">
                  <table class="sap-market-matrix">
                    <thead><tr><th>Module</th>${workstreams.map((stream) => `<th>${stream.label}</th>`).join("")}<th>Total</th></tr></thead>
                    <tbody>
                      ${intelligence
                        .map(
                          (item) => `
                            <tr>
                              <th><button type="button" data-module-filter="${esc(item.module)}">${esc(item.module)}</button></th>
                              ${workstreams
                                .map((stream) => {
                                  const count = item.jobs.filter((job) =>
                                    stream.id === "Other"
                                      ? !["Functional", "Technical", "Leadership"].includes(job.group)
                                      : job.group === stream.id
                                  ).length;
                                  return `<td>${
                                    count
                                      ? `<button type="button" data-market-cell data-market-cell-module="${esc(item.module)}"
                                          data-market-cell-group="${stream.id}">${count}</button>`
                                      : "<span>—</span>"
                                  }</td>`;
                                })
                                .join("")}
                              <td><button type="button" data-module-filter="${esc(item.module)}">${item.count}</button></td>
                            </tr>`
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>`
              : `<div class="sap-market-empty">No module and workstream combinations match these filters.</div>`
          }
        </section>

        <section class="sap-market-signals" aria-label="Market signals">
          <article>
            <div class="signal-heading"><span>${icon("pulse")}</span><h2>Hot modules</h2></div>
            ${hottest.length ? hottest.map((item, index) => `<button type="button" data-module-filter="${esc(item.module)}"><b>${index + 1}</b><span>${esc(item.module)}</span><small>${item.count} live</small>${icon("chevron-right")}</button>`).join("") : "<p>No matching activity.</p>"}
          </article>
          <article>
            <div class="signal-heading"><span>${icon("plus")}</span><h2>Recently added</h2></div>
            ${recentlyAdded.length ? recentlyAdded.map((job) => `<button type="button" data-module-filter="${esc(job.module)}"><span>${esc(job.module)}</span><small>${esc(job.title)}</small>${icon("chevron-right")}</button>`).join("") : "<p>No matching additions.</p>"}
          </article>
          <article>
            <div class="signal-heading"><span>${icon("globe")}</span><h2>Remote demand</h2></div>
            ${remoteIntelligence.length ? remoteIntelligence.map((item, index) => `<button type="button" data-module-filter="${esc(item.module)}"><b>${index + 1}</b><span>${esc(item.module)}</span><small>${item.count} remote</small>${icon("chevron-right")}</button>`).join("") : "<p>No remote roles match.</p>"}
          </article>
          <article>
            <div class="signal-heading"><span>${icon("location")}</span><h2>Top locations</h2></div>
            ${topLocations.length ? topLocations.map((item, index) => `<button type="button" data-market-region-filter="${item.id}"><b>${index + 1}</b><span>${esc(item.label)}</span><small>${item.count}</small>${icon("chevron-right")}</button>`).join("") : "<p>No location signals.</p>"}
          </article>
        </section>
      </section>`;
  }

  function renderModulesLegacy() {
    const intelligence = moduleIntelligence();
    const actualModules = new Map(intelligence.map((item) => [item.module, item.count]));
    const sapJobs = data.jobs.filter((job) => job.stream === "SAP");
    const recentSapJobs = sapJobs.filter((job) => (job.firstSeen || "") >= "2026-07-10").length;
    const rateDisclosureCount = sapJobs.filter((job) => numericRateSignals([job]).length).length;
    const hottest = [...intelligence]
      .sort((a, b) => b.score - a.score || b.recentCount - a.recentCount || b.count - a.count)
      .slice(0, 3);
    const rateExamples = sapJobs
      .filter((job) => numericRateSignals([job]).length)
      .sort((a, b) => (b.firstSeen || "").localeCompare(a.firstSeen || ""))
      .slice(0, 4);
    const otherCount = data.jobs.filter((job) => job.stream !== "SAP").length;
    const maxModuleCount = Math.max(...intelligence.map((item) => item.count), 1);

    return `
      <section class="page" data-page="sap-landscape">
        ${pageHeader({
          eyebrow: "SAP modules",
          title: "SAP module market intelligence",
          subtitle: "Compare live demand, recent momentum, locations, work arrangements and advertised rate evidence—then drill directly into the matching feed.",
          note: true
        })}

        <div class="summary-strip module-summary-strip">
          <div class="summary-card"><strong>${sapJobs.length}</strong><span>Live SAP opportunities</span></div>
          <div class="summary-card"><strong>${intelligence.length}</strong><span>Modules with active demand</span></div>
          <div class="summary-card"><strong>${recentSapJobs}</strong><span>Listings seen since 10 Jul</span></div>
          <div class="summary-card"><strong>${rateDisclosureCount}</strong><span>Roles with numeric rate evidence</span></div>
        </div>

        <div class="module-intelligence-layout">
          <section class="market-panel demand-panel" aria-labelledby="module-demand-title">
            <div class="market-panel-heading">
              <div>
                <p class="panel-kicker">Live demand ranking</p>
                <h2 id="module-demand-title">Opportunities by module</h2>
                <p>Ranked by current verified listings. Momentum is based on listings seen in the last 14 days.</p>
              </div>
              <span class="market-panel-total">${intelligence.length} active modules</span>
            </div>

            <div class="module-demand-list">
              ${intelligence
                .map(
                  (item, index) => `
                    <button class="module-demand-row" type="button" data-module-filter="${esc(item.module)}"
                      aria-label="Open ${esc(item.module)} opportunities in the feed">
                      <div class="module-demand-main">
                        <span class="module-rank">${String(index + 1).padStart(2, "0")}</span>
                        <div>
                          <strong>${esc(item.module)}</strong>
                          <span>${esc(item.group)} workstream</span>
                        </div>
                      </div>
                      <div class="module-demand-volume">
                        <strong>${item.count}</strong>
                        <span>${item.count === 1 ? "role" : "roles"}</span>
                        <i style="--demand-width:${Math.max(10, Math.round((item.count / maxModuleCount) * 100))}%"></i>
                      </div>
                      <span class="momentum-pill ${item.trend.tone}">
                        ${icon("pulse")}${esc(item.trend.label)}
                        <small>${item.recentCount} recent</small>
                      </span>
                      <span class="module-row-arrow">${icon("arrow-right")}</span>
                      <div class="module-demand-facts">
                        <span><small>Leading locations</small>${icon("location")}${esc(item.locations)}</span>
                        <span><small>Work arrangement</small>${icon("briefcase")}${esc(item.workModes)}</span>
                        <span><small>Advertised rate evidence</small>${icon("tag")}${esc(item.rates)}</span>
                      </div>
                    </button>`
                )
                .join("")}
            </div>
          </section>

          <aside class="module-market-sidebar" aria-label="Module market highlights">
            <section class="market-panel hot-modules-panel">
              <div class="market-panel-heading compact">
                <div>
                  <p class="panel-kicker">Strongest momentum</p>
                  <h2>Hot modules now</h2>
                </div>
              </div>
              <div class="hot-module-list">
                ${hottest
                  .map(
                    (item, index) => `
                      <button type="button" data-module-filter="${esc(item.module)}">
                        <span class="hot-rank">${index + 1}</span>
                        <span><strong>${esc(item.module)}</strong><small>${item.recentCount} recent · ${item.count} live</small></span>
                        ${icon("chevron-right")}
                      </button>`
                  )
                  .join("")}
              </div>
            </section>

            <section class="market-panel rate-panel">
              <div class="market-panel-heading compact">
                <div>
                  <p class="panel-kicker">Observed—not estimated</p>
                  <h2>Advertised rate signals</h2>
                </div>
              </div>
              ${
                rateExamples.length
                  ? `<div class="rate-signal-list">
                      ${rateExamples
                        .map(
                          (job) => `
                            <button type="button" data-module-filter="${esc(job.module)}">
                              <span><strong>${esc(job.module)}</strong><small>${esc(job.title)}</small></span>
                              <b>${esc(job.rate)}</b>
                            </button>`
                        )
                        .join("")}
                    </div>`
                  : `<p class="market-empty-copy">No numeric rates are disclosed in this snapshot.</p>`
              }
              <p class="method-note">${icon("info")}Hourly and daily figures are shown exactly as advertised and are not blended into a false average.</p>
            </section>

            <section class="market-panel methodology-panel">
              <span class="methodology-icon">${icon("calendar")}</span>
              <div>
                <h2>Snapshot methodology</h2>
                <p>“Hot” means at least three listings were first seen since 10 July. This is current-market momentum, not a long-term historical trend.</p>
              </div>
            </section>
          </aside>
        </div>

        <div class="taxonomy-heading">
          <div>
            <p class="panel-kicker">Complete classification</p>
            <h2>Browse the ${data.meta.sapTaxonomyTagCount}-module taxonomy</h2>
          </div>
          <p>Modules without a count have no verified opportunities in this snapshot.</p>
        </div>
        <div class="module-groups">
          ${data.sapGroups.map((group) => renderModuleGroup(group, actualModules)).join("")}
        </div>

        <div class="other-jobs-card">
          <div>
            <h2>All other jobs</h2>
            <p>${otherCount} non-SAP opportunity in the current verified feed, kept separate from SAP module filters.</p>
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
          <div><h2>${esc(group.name)}</h2><span>${count} matching live ${count === 1 ? "role" : "roles"}</span></div>
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
          subtitle: "Keep the current opportunities you want to revisit in one focused list.",
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
    const sourceRows = data.sources;
    return `
      <section class="page" data-page="settings">
        ${pageHeader({
          eyebrow: "Settings",
          title: "Data and preferences",
          subtitle: "See how current listings were checked and manage data stored in this browser."
        })}
        <div class="settings-grid">
          <article class="settings-card">
            <h2>Source connections</h2>
            <p>Only direct public job listings are included. Email alerts, recruiter InMail and historical inbox records are excluded.</p>
            ${sourceRows
              .map(
                (source) => `
                  <div class="source-row">
                    <div><strong>${esc(source.name)}</strong><span>${esc(source.ingestionMethod)}</span></div>
                    <span class="status-pill">Verified 24 Jul</span>
                  </div>`
              )
              .join("")}
          </article>

          <article class="settings-card">
            <h2>Local preferences</h2>
            <p>Watchlist choices stay on this device and are not synced externally.</p>
            <div class="setting-list">
              <div class="setting-line"><span>Last checked</span><strong>24 Jul 2026</strong></div>
              <div class="setting-line"><span>Coverage</span><strong>Australia & New Zealand</strong></div>
              <div class="setting-line"><span>Open listings</span><strong>${data.jobs.length}</strong></div>
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
      setFeedRoute({ category: "all", region: "all", module: "all", group: "Other", workMode: "all", employment: "all", q: "" });
      return;
    }
    setFeedRoute({ q: "", category: "sap", region: "all", module: "all", group, workMode: "all", source: "all", employment: "all" });
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
    state.feed = { q: "", category: "all", region: "all", module: "all", group: "all", workMode: "all", source: "all", employment: "all" };
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

    const homeEmployment = event.target.closest("[data-home-employment]");
    if (homeEmployment) {
      state.homeEmployment = homeEmployment.dataset.homeEmployment;
      render();
      return;
    }

    const homeMode = event.target.closest("[data-home-mode]");
    if (homeMode) {
      state.homeWorkMode = homeMode.dataset.homeMode;
      render();
      return;
    }

    if (event.target.closest("[data-clear-map-filters]")) {
      state.region = "all";
      state.homeEmployment = "all";
      state.homeWorkMode = "all";
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
        workMode: state.homeWorkMode,
        source: "all",
        employment: state.homeEmployment
      });
      return;
    }

    if (event.target.closest("[data-home-total], [data-home-ai-feed]")) {
      setFeedRoute({
        q: "",
        category: "sap",
        region: state.region,
        module: "all",
        group: "all",
        workMode: state.homeWorkMode,
        source: "all",
        employment: state.homeEmployment
      });
      return;
    }

    const spotlight = event.target.closest("[data-spotlight]");
    if (spotlight) {
      state.spotlight = spotlight.dataset.spotlight;
      render();
      return;
    }

    const category = event.target.closest("[data-feed-category]");
    if (category) {
      setFeedRoute({
        category: category.dataset.feedCategory,
        module: "all",
        group: "all"
      });
      return;
    }

    const feedEmployment = event.target.closest("[data-feed-employment]");
    if (feedEmployment) {
      setFeedRoute({ employment: feedEmployment.dataset.feedEmployment });
      return;
    }

    const feedModule = event.target.closest("[data-feed-module]");
    if (feedModule) {
      setFeedRoute({
        category: "sap",
        module: feedModule.dataset.feedModule,
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

    const employmentFilter = event.target.closest("[data-employment-filter]");
    if (employmentFilter) {
      setFeedRoute({
        q: "",
        category: "all",
        region: "all",
        module: "all",
        group: "all",
        workMode: "all",
        source: "all",
        employment: employmentFilter.dataset.employmentFilter
      });
      return;
    }

    const watch = event.target.closest("[data-watch-job]");
    if (watch) {
      toggleWatchlist(watch.dataset.watchJob);
      return;
    }

    if (event.target.closest("[data-ai-prepare]")) {
      const job = data.jobs.find((item) => item.id === aiApplyDialog?.dataset.jobId);
      if (!job || !aiApplyAction || !aiApplyReadiness) return;
      aiApplyAction.disabled = true;
      aiApplyAction.innerHTML = `${icon("check-circle")}Application preparation ready`;
      aiApplyReadiness.innerHTML = `
        <strong>Application plan prepared inside Talent Radar.</strong>
        No external website was opened. Connect the secure profile vault and application agent to complete résumé tailoring, cover-letter generation and submission.`;
      ui.showToast({
        title: "Application kept inside Talent Radar",
        message: `${job.title} is ready for the supervised AI workflow.`,
        tone: "success"
      });
      return;
    }

    const aiApply = event.target.closest("[data-ai-apply]");
    if (aiApply) {
      openAiApplication(aiApply.dataset.aiApply);
      return;
    }

    const marketCell = event.target.closest("[data-market-cell]");
    if (marketCell) {
      setFeedRoute({
        q: "",
        category: "sap",
        region: state.market.region,
        module: marketCell.dataset.marketCellModule,
        group: marketCell.dataset.marketCellGroup,
        workMode: state.market.workMode,
        source: "all",
        employment: state.market.employment
      });
      return;
    }

    const marketRegion = event.target.closest("[data-market-region-filter]");
    if (marketRegion) {
      state.market.region = marketRegion.dataset.marketRegionFilter;
      render();
      return;
    }

    if (event.target.closest("[data-market-all-workstreams]")) {
      setFeedRoute({
        q: "",
        category: "sap",
        region: state.market.region,
        module: "all",
        group: "all",
        workMode: state.market.workMode,
        source: "all",
        employment: state.market.employment
      });
      return;
    }

    if (event.target.closest("[data-clear-market-filters]")) {
      state.market = { region: "all", employment: "all", workMode: "all" };
      render();
      return;
    }

    const moduleFilter = event.target.closest("[data-module-filter]");
    if (moduleFilter) {
      const fromMarket = Boolean(moduleFilter.closest(".sap-market-page"));
      setFeedRoute({
        q: "",
        category: "sap",
        region: fromMarket ? state.market.region : "all",
        module: moduleFilter.dataset.moduleFilter,
        group: "all",
        workMode: fromMarket ? state.market.workMode : "all",
        source: "all",
        employment: fromMarket ? state.market.employment : "all"
      });
      return;
    }

    const categoryFilter = event.target.closest("[data-category-filter]");
    if (categoryFilter) {
      setFeedRoute({ q: "", category: categoryFilter.dataset.categoryFilter, region: "all", module: "all", group: "all", workMode: "all", source: "all", employment: "all" });
      return;
    }

    const groupFilter = event.target.closest("[data-group-filter]");
    if (groupFilter) {
      if (groupFilter.closest(".sap-market-page")) {
        setFeedRoute({
          q: "",
          category: "sap",
          region: state.market.region,
          module: "all",
          group: groupFilter.dataset.groupFilter,
          workMode: state.market.workMode,
          source: "all",
          employment: state.market.employment
        });
        return;
      }
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
    const homeRegion = event.target.closest("[data-home-region]");
    if (homeRegion) {
      state.region = homeRegion.value;
      if (["sydney", "melbourne"].includes(state.region)) state.spotlight = state.region;
      render();
      return;
    }

    const select = event.target.closest("[data-feed-select]");
    const marketSelect = event.target.closest("[data-market-select]");
    if (marketSelect) {
      state.market[marketSelect.dataset.marketSelect] = marketSelect.value;
      render();
      return;
    }

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
        workMode: state.homeWorkMode,
        source: "all",
        employment: state.homeEmployment
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

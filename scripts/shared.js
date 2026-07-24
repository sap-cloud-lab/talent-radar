(function initialiseTalentRadarShared() {
  const svgSprite = `
    <svg class="sr-only" aria-hidden="true" focusable="false" width="0" height="0">
      <symbol id="i-radar" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="4.5"></circle>
        <path d="M12 12 18.4 5.6M12 3V1.5M21 12h1.5"></path><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"></circle>
      </symbol>
      <symbol id="i-home" viewBox="0 0 24 24">
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"></path>
      </symbol>
      <symbol id="i-briefcase" viewBox="0 0 24 24">
        <rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"></path>
      </symbol>
      <symbol id="i-pipeline" viewBox="0 0 24 24">
        <circle cx="6" cy="5" r="2"></circle><circle cx="18" cy="19" r="2"></circle><circle cx="6" cy="19" r="2"></circle>
        <path d="M6 7v10M8 5h4a4 4 0 0 1 4 4v8M8 19h8"></path>
      </symbol>
      <symbol id="i-cube" viewBox="0 0 24 24">
        <path d="m12 2 9 5-9 5-9-5 9-5Z"></path><path d="m3 7 9 5 9-5M12 12v10M3 7v10l9 5 9-5V7"></path>
      </symbol>
      <symbol id="i-database" viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="8.5" ry="3"></ellipse><path d="M3.5 5v6c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3V5M3.5 11v6c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3v-6"></path>
      </symbol>
      <symbol id="i-bell" viewBox="0 0 24 24">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM9.5 21h5"></path>
      </symbol>
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>
      </symbol>
      <symbol id="i-inbox" viewBox="0 0 24 24">
        <path d="M4 4h16v16H4z"></path><path d="m4 13 4-4h8l4 4M4 13h5l1.5 2h3L15 13h5"></path>
      </symbol>
      <symbol id="i-bookmark" viewBox="0 0 24 24">
        <path d="M6 3h12v18l-6-4-6 4V3Z"></path>
      </symbol>
      <symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></symbol>
      <symbol id="i-chevron-right" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"></path></symbol>
      <symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6"></path></symbol>
      <symbol id="i-arrow-up-right" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"></path></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"></path></symbol>
      <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"></path></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></symbol>
      <symbol id="i-location" viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></symbol>
      <symbol id="i-check-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m8 12 2.5 2.5L16.5 8"></path></symbol>
      <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M20 6v5h-5M4 18v-5h5"></path><path d="M18.5 9A7.5 7.5 0 0 0 5.7 6.3L4 8m16 8-1.7 1.7A7.5 7.5 0 0 1 5.5 15"></path></symbol>
      <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"></path></symbol>
      <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"></path></symbol>
      <symbol id="i-more" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"></circle><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"></circle><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"></circle></symbol>
      <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v6M12 7.5h.01"></path></symbol>
      <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></symbol>
      <symbol id="i-tag" viewBox="0 0 24 24"><path d="M20 13 13 20 4 11V4h7l9 9Z"></path><circle cx="8.5" cy="8.5" r="1.25"></circle></symbol>
      <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"></path></symbol>
      <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 20 6v6c0 5-3.3 8-8 9-4.7-1-8-4-8-9V6l8-3Z"></path><path d="m9 12 2 2 4-4"></path></symbol>
      <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="4"></circle><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"></circle></symbol>
      <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></symbol>
      <symbol id="i-settings" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06-2.78 2.78-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1.1 1.65V21h-3.8v-.08A1.8 1.8 0 0 0 9 19.4a1.8 1.8 0 0 0-1.98.36l-.06.06-2.78-2.78.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.1H3v-3.8h.08A1.8 1.8 0 0 0 4.6 9a1.8 1.8 0 0 0-.36-1.98l-.06-.06 2.78-2.78.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1.1-1.65V3h3.8v.08A1.8 1.8 0 0 0 15 4.6a1.8 1.8 0 0 0 1.98-.36l.06-.06 2.78 2.78-.06.06A1.8 1.8 0 0 0 19.4 9a1.8 1.8 0 0 0 1.65 1.1H21v3.8h-.08A1.8 1.8 0 0 0 19.4 15Z"></path>
      </symbol>
      <symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"></path></symbol>
      <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18"></path></symbol>
      <symbol id="i-external" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9"></path><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"></path></symbol>
      <symbol id="i-pulse" viewBox="0 0 24 24"><path d="M3 12h4l2-5 4 10 2-5h6"></path></symbol>
      <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"></path></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></symbol>
    </svg>`;

  document.body.insertAdjacentHTML("afterbegin", svgSprite);

  function icon(name, className = "icon") {
    return `<svg class="${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  }

  function showToast({ title, message, tone = "success", duration = 4200 }) {
    let region = document.querySelector(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "false");
      document.body.append(region);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    const toneIcon = tone === "warning" ? "info" : "check-circle";
    toast.innerHTML = `
      <span class="status status-${tone}">${icon(toneIcon)}</span>
      <div>
        <p class="toast-title">${escapeHtml(title)}</p>
        <p class="toast-copy">${escapeHtml(message)}</p>
      </div>
      <button class="toast-close" type="button" aria-label="Dismiss notification">${icon("x")}</button>`;

    const close = () => toast.remove();
    toast.querySelector(".toast-close").addEventListener("click", close);
    region.append(toast);
    window.setTimeout(close, duration);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.TalentRadar = Object.freeze({
    icon,
    showToast,
    escapeHtml
  });
})();

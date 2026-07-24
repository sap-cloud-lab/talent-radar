(function initialiseTalentRadarPwa() {
  "use strict";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.warn("Talent Radar could not register its offline service worker.", error);
      });
    });
  }

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  if (isIos && !isStandalone && !sessionStorage.getItem("talent-radar-ios-install-hint")) {
    window.addEventListener("load", () => {
      window.setTimeout(() => {
        if (window.TalentRadar) {
          window.TalentRadar.showToast({
            title: "Install Talent Radar",
            message: "In Safari, tap Share and then Add to Home Screen.",
            duration: 7000
          });
        }
        sessionStorage.setItem("talent-radar-ios-install-hint", "shown");
      }, 900);
    });
  }
})();

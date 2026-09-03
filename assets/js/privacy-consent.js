(() => {
  "use strict";

  const STORAGE_KEY = "site-optional-services-consent";
  const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
  const privacySignal = () =>
    LOCAL_HOSTS.has(window.location.hostname) ||
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1" ||
    navigator.globalPrivacyControl === true;

  function readConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      // A denied default remains safe when storage is unavailable.
    }
  }

  function loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    document.head.appendChild(script);
  }

  function enableAnalytics() {
    const config = document.getElementById("privacy-config");
    const gaId = config?.dataset.googleAnalyticsId;
    if (!gaId || window.gtag) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args) => window.dataLayer.push(args);
    window.trackEvent = (name, params) => window.gtag("event", name, params);
    window.trackThemeChange = (theme) => window.trackEvent("theme_toggle", { theme_selected: theme });
    window.trackNavigationClick = (text, url) => window.trackEvent("navigation_click", { link_text: text, link_url: url });
    window.trackSocialClick = (platform) => window.trackEvent("social_click", { platform });
    window.gtag("js", new Date());
    window.gtag("config", gaId, { anonymize_ip: true });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`);
  }

  function enableOptionalServices() {
    enableAnalytics();
    const counterSrc = document.getElementById("privacy-config")?.dataset.visitorCounterSrc;
    if (counterSrc) loadScript(counterSrc);
  }

  function initialize() {
    const banner = document.getElementById("privacy-consent");
    const allow = document.getElementById("privacy-allow");
    const decline = document.getElementById("privacy-decline");
    const signalActive = privacySignal();
    const consent = readConsent();

    window.sitePrivacy = { isOptionalServiceAllowed: () => !signalActive && readConsent() === "granted" };

    if (!signalActive && consent === "granted") enableOptionalServices();
    if (banner && !consent && !signalActive) banner.hidden = false;
    if (banner && signalActive) banner.hidden = true;

    allow?.addEventListener("click", () => {
      saveConsent("granted");
      banner.hidden = true;
      enableOptionalServices();
    });
    decline?.addEventListener("click", () => {
      saveConsent("denied");
      banner.hidden = true;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();

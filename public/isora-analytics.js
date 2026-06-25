(function () {
  var localEventsKey = "isora:analytics-local-events";
  var consentStorageKey = "isora:cookie-consent-v1";
  var path = window.location.pathname || "/";

  if (!path.startsWith("/blog/") || path === "/blog/") return;
  if (window.__isoraBlogArticleTracked) return;

  function hasAnalyticsConsent() {
    if (window.IsoraCookieConsent) {
      return window.IsoraCookieConsent.hasConsent("analytics");
    }

    try {
      var consent = JSON.parse(window.localStorage.getItem(consentStorageKey) || "null");
      return Boolean(consent && consent.categories && consent.categories.analytics);
    } catch {
      return false;
    }
  }

  function normalizePath(value) {
    return value.endsWith("/") ? value : value + "/";
  }

  function storeLocalEvent(event) {
    try {
      var current = JSON.parse(window.localStorage.getItem(localEventsKey) || "[]");
      var events = Array.isArray(current) ? current : [];
      events.push(event);
      window.localStorage.setItem(localEventsKey, JSON.stringify(events.slice(-500)));
    } catch {
      // Local analytics are a best-effort fallback only.
    }
  }

  function sendEvent(event) {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      storeLocalEvent(event);
      return;
    }

    window
      .fetch("/api/analytics", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ events: [event] }),
        keepalive: true,
      })
      .then(function (response) {
        if (!response.ok) storeLocalEvent(event);
      })
      .catch(function () {
        storeLocalEvent(event);
      });
  }

  function trackArticleView() {
    if (window.__isoraBlogArticleTracked || !hasAnalyticsConsent()) return;

    window.__isoraBlogArticleTracked = true;
    sendEvent({
      type: "page_view",
      pageType: "article",
      path: normalizePath(path),
      title: document.title.replace(/\s+-\s+isora\s*$/i, "").trim(),
      at: new Date().toISOString(),
    });
  }

  trackArticleView();
  window.addEventListener("isora:cookie-consent", trackArticleView);
})();

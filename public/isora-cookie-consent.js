(function () {
  if (window.__isoraCookieConsentLoaded) return;

  window.__isoraCookieConsentLoaded = true;

  var storageKey = "isora:cookie-consent-v1";
  var defaultCategories = {
    necessary: true,
    analytics: false,
  };
  var currentConsent = readConsent();

  function readConsent() {
    try {
      var rawConsent = window.localStorage.getItem(storageKey);
      return rawConsent ? JSON.parse(rawConsent) : null;
    } catch {
      return null;
    }
  }

  function consentCategories(consent) {
    var savedCategories = consent && consent.categories ? consent.categories : {};

    return {
      necessary: true,
      analytics: Boolean(savedCategories.analytics),
    };
  }

  function consentStatus(categories) {
    if (categories.analytics) return "accepted";
    return currentConsent ? "rejected" : "pending";
  }

  function activateDeferredScripts(categories) {
    document.querySelectorAll('script[type="text/plain"][data-isora-cookie-category]').forEach(function (script) {
      var category = script.dataset.isoraCookieCategory;

      if (!categories[category] || script.dataset.isoraCookieLoaded === "true") return;

      var executableScript = document.createElement("script");

      Array.from(script.attributes).forEach(function (attribute) {
        if (attribute.name === "type" || attribute.name.indexOf("data-isora-cookie") === 0) return;
        executableScript.setAttribute(attribute.name, attribute.value);
      });

      executableScript.type = script.dataset.isoraCookieType || "text/javascript";
      executableScript.text = script.textContent;
      script.dataset.isoraCookieLoaded = "true";
      script.replaceWith(executableScript);
    });
  }

  function exposeConsent(consent) {
    var categories = consentCategories(consent);
    var status = consentStatus(categories);

    document.documentElement.dataset.cookieConsent = status;
    activateDeferredScripts(categories);
    window.dispatchEvent(
      new CustomEvent("isora:cookie-consent", {
        detail: {
          status: status,
          categories: categories,
        },
      }),
    );
  }

  function saveConsent(categories) {
    currentConsent = {
      version: 1,
      savedAt: new Date().toISOString(),
      categories: Object.assign({}, defaultCategories, {
        analytics: Boolean(categories.analytics),
        necessary: true,
      }),
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(currentConsent));
    } catch {
      // Le choix reste applique a la page courante si le stockage est bloque.
    }

    exposeConsent(currentConsent);
    closeBanner();
  }

  function ensureStyles() {
    if (document.getElementById("isora-cookie-consent-style")) return;

    var style = document.createElement("style");
    style.id = "isora-cookie-consent-style";
    style.textContent = `
      .isora-cookie-consent,
      .isora-cookie-consent * {
        box-sizing: border-box;
      }

      .isora-cookie-consent[hidden],
      .isora-cookie-consent__preferences[hidden] {
        display: none !important;
      }

      .isora-cookie-consent {
        position: fixed;
        inset: auto auto 16px 16px;
        z-index: 9999;
        width: min(440px, calc(100vw - 32px));
        color: #171717;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .isora-cookie-consent__panel {
        width: 100%;
        border: 1px solid rgba(23, 23, 23, 0.16);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.97);
        box-shadow: 0 24px 80px rgba(23, 23, 23, 0.18);
        backdrop-filter: blur(18px);
      }

      .isora-cookie-consent__bar {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
        padding: 14px;
      }

      .isora-cookie-consent__title {
        margin: 0;
        color: #171717;
        font-size: 0.86rem;
        font-weight: 850;
        line-height: 1.25;
      }

      .isora-cookie-consent__text {
        margin: 4px 0 0;
        color: #525252;
        font-size: 0.78rem;
        font-weight: 650;
        line-height: 1.45;
      }

      .isora-cookie-consent__actions {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .isora-cookie-consent__button {
        min-height: 40px;
        border: 1px solid #1d4ed8;
        border-radius: 6px;
        padding: 0 10px;
        background: #ffffff;
        color: #1d4ed8;
        cursor: pointer;
        font: inherit;
        font-size: 0.78rem;
        font-weight: 850;
        line-height: 1.15;
        transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
      }

      .isora-cookie-consent__button:hover {
        transform: translateY(-1px);
        background: #eff6ff;
      }

      .isora-cookie-consent__button--primary {
        background: #1d4ed8;
        color: #ffffff;
      }

      .isora-cookie-consent__button--primary:hover {
        background: #1e40af;
        border-color: #1e40af;
        color: #ffffff;
      }

      .isora-cookie-consent__preferences {
        border-top: 1px solid rgba(23, 23, 23, 0.12);
        padding: 0 14px 14px;
      }

      .isora-cookie-consent__preferences .isora-cookie-consent__actions {
        grid-template-columns: 1fr;
      }

      .isora-cookie-consent__choices {
        display: grid;
        gap: 8px;
        margin: 0 0 12px;
      }

      .isora-cookie-consent__choice {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        border: 1px solid rgba(23, 23, 23, 0.12);
        border-radius: 6px;
        padding: 10px 12px;
        background: #fafafa;
      }

      .isora-cookie-consent__choice strong {
        display: block;
        color: #171717;
        font-size: 0.78rem;
        line-height: 1.3;
      }

      .isora-cookie-consent__choice span span {
        display: block;
        margin-top: 2px;
        color: #525252;
        font-size: 0.72rem;
        font-weight: 650;
        line-height: 1.35;
      }

      .isora-cookie-consent__choice input {
        flex: 0 0 auto;
        width: 20px;
        height: 20px;
        accent-color: #1d4ed8;
      }

      @media (max-width: 720px) {
        .isora-cookie-consent {
          inset: auto 8px 8px;
          width: auto;
        }

        .isora-cookie-consent__actions {
          grid-template-columns: 1fr;
        }

        .isora-cookie-consent__button {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureBanner() {
    var existingBanner = document.querySelector("[data-isora-cookie-consent]");
    if (existingBanner) return existingBanner;

    var banner = document.createElement("div");
    banner.className = "isora-cookie-consent";
    banner.dataset.isoraCookieConsent = "true";
    banner.hidden = true;
    banner.innerHTML = `
      <section class="isora-cookie-consent__panel" aria-labelledby="isora-cookie-consent-title">
        <div class="isora-cookie-consent__bar">
          <div>
            <p class="isora-cookie-consent__title" id="isora-cookie-consent-title">Cookies et traceurs sur <em>isora</em></p>
            <p class="isora-cookie-consent__text">
              Les traceurs strictement nécessaires restent actifs. La mesure d'audience interne reste désactivée tant que vous ne l'acceptez pas.
            </p>
          </div>

          <div class="isora-cookie-consent__actions">
            <button class="isora-cookie-consent__button isora-cookie-consent__button--primary" type="button" data-isora-cookie-action="reject">Refuser</button>
            <button class="isora-cookie-consent__button" type="button" data-isora-cookie-action="customize" aria-expanded="false">Personnaliser</button>
            <button class="isora-cookie-consent__button isora-cookie-consent__button--primary" type="button" data-isora-cookie-action="accept">Accepter</button>
          </div>
        </div>

        <div class="isora-cookie-consent__preferences" data-isora-cookie-preferences hidden>
          <div class="isora-cookie-consent__choices">
            <label class="isora-cookie-consent__choice">
              <span>
                <strong>Nécessaires</strong>
                <span>Indispensables au fonctionnement, à la sécurité et à la mémorisation de votre choix.</span>
              </span>
              <input type="checkbox" checked disabled>
            </label>

            <label class="isora-cookie-consent__choice">
              <span>
                <strong>Mesure d'audience</strong>
                <span>Aide à compter les pages consultées et les recherches utiles dans <em>isora</em>, sans publicité.</span>
              </span>
              <input type="checkbox" data-isora-cookie-category="analytics">
            </label>
          </div>

          <div class="isora-cookie-consent__actions">
            <button class="isora-cookie-consent__button isora-cookie-consent__button--primary" type="button" data-isora-cookie-action="save">Enregistrer mes choix</button>
          </div>
        </div>
      </section>
    `;

    banner.addEventListener("click", function (event) {
      var actionElement = event.target && typeof event.target.closest === "function"
        ? event.target.closest("[data-isora-cookie-action]")
        : null;
      if (!actionElement) return;

      var action = actionElement.dataset.isoraCookieAction;

      if (action === "accept") {
        saveConsent({ analytics: true });
        return;
      }

      if (action === "reject") {
        saveConsent({ analytics: false });
        return;
      }

      if (action === "customize") {
        togglePreferences(banner);
        return;
      }

      if (action === "save") {
        var selectedCategories = {};

        banner.querySelectorAll("[data-isora-cookie-category]").forEach(function (input) {
          selectedCategories[input.dataset.isoraCookieCategory] = input.checked;
        });

        saveConsent(selectedCategories);
      }
    });

    document.body.appendChild(banner);
    return banner;
  }

  function syncBannerInputs(banner) {
    var categories = consentCategories(currentConsent);

    banner.querySelectorAll("[data-isora-cookie-category]").forEach(function (input) {
      input.checked = Boolean(categories[input.dataset.isoraCookieCategory]);
    });
  }

  function togglePreferences(banner) {
    var preferences = banner.querySelector("[data-isora-cookie-preferences]");
    var customizeButton = banner.querySelector('[data-isora-cookie-action="customize"]');
    var willOpen = preferences.hidden;

    preferences.hidden = !willOpen;
    customizeButton.setAttribute("aria-expanded", willOpen ? "true" : "false");

    if (willOpen) {
      var firstInput = preferences.querySelector("[data-isora-cookie-category]");
      if (firstInput) firstInput.focus();
    }
  }

  function openBanner() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", openBanner, { once: true });
      return;
    }

    ensureStyles();
    var banner = ensureBanner();
    var preferences = banner.querySelector("[data-isora-cookie-preferences]");
    var customizeButton = banner.querySelector('[data-isora-cookie-action="customize"]');

    syncBannerInputs(banner);
    preferences.hidden = true;
    customizeButton.setAttribute("aria-expanded", "false");
    banner.hidden = false;
  }

  function closeBanner() {
    var banner = document.querySelector("[data-isora-cookie-consent]");
    if (banner) banner.hidden = true;
  }

  window.IsoraCookieConsent = {
    getConsent: function () {
      return consentCategories(currentConsent || readConsent());
    },
    hasConsent: function (category) {
      return Boolean(consentCategories(currentConsent || readConsent())[category]);
    },
    openPreferences: openBanner,
    reset: function () {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage failures.
      }

      currentConsent = null;
      exposeConsent(currentConsent);
      openBanner();
    },
  };

  window.addEventListener("isora:open-cookie-preferences", openBanner);

  if (currentConsent) {
    exposeConsent(currentConsent);
    return;
  }

  document.documentElement.dataset.cookieConsent = "pending";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", openBanner, { once: true });
  } else {
    openBanner();
  }
})();

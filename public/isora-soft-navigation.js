(function () {
  if (window.__isoraSoftNavigationLoaded) return;

  window.__isoraSoftNavigationLoaded = true;

  var pageCache = new Map();
  var scrollPositions = new Map();
  var parser = new DOMParser();
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var navigating = false;
  var allowedPathPattern = /^\/(?:blog|fiches|lexique)(?:\/|$)/;
  var assetPathPattern = /\.(?:css|js|json|xml|txt|pdf|png|jpe?g|webp|gif|svg|ico|webmanifest|rss)$/i;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  function ensureRuntimeStyle() {
    if (document.getElementById("isora-soft-navigation-style")) return;

    var style = document.createElement("style");
    style.id = "isora-soft-navigation-style";
    style.textContent = `
      @media (prefers-reduced-motion: no-preference) {
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation-duration: 170ms;
          animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
        }
      }

      html[data-isora-navigating="true"] {
        cursor: progress;
      }
    `;
    document.head.appendChild(style);
  }

  function normalizedDocumentUrl(url) {
    var copy = new URL(url.href);
    copy.hash = "";
    return copy.href;
  }

  function shouldHandleUrl(url) {
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === "/") return false;
    if (url.search) return false;
    if (!allowedPathPattern.test(url.pathname)) return false;
    if (assetPathPattern.test(url.pathname)) return false;
    return true;
  }

  function getAnchor(event) {
    if (event.defaultPrevented) return null;
    if (event.button !== undefined && event.button !== 0) return null;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
    if (!event.target || typeof event.target.closest !== "function") return null;

    var anchor = event.target.closest("a[href]");
    if (!anchor) return null;
    if (anchor.target && anchor.target !== "_self") return null;
    if (anchor.hasAttribute("download")) return null;
    if (anchor.getAttribute("rel") === "external") return null;

    return anchor;
  }

  function isSameDocumentHash(url) {
    return (
      normalizedDocumentUrl(url) === normalizedDocumentUrl(new URL(window.location.href)) &&
      url.hash &&
      url.hash !== window.location.hash
    );
  }

  function trimCache() {
    while (pageCache.size > 16) {
      pageCache.delete(pageCache.keys().next().value);
    }
  }

  function fetchPage(url) {
    var key = normalizedDocumentUrl(url);

    if (pageCache.has(key)) return pageCache.get(key);

    var request = window
      .fetch(key, {
        credentials: "same-origin",
        headers: {
          "X-Isora-Navigation": "soft",
        },
      })
      .then(function (response) {
        var contentType = response.headers.get("content-type") || "";

        if (!response.ok || !contentType.includes("text/html")) {
          throw new Error("Navigation non HTML");
        }

        return response.text();
      })
      .then(function (html) {
        var nextDocument = parser.parseFromString(html, "text/html");

        if (!nextDocument.querySelector("main") || !nextDocument.querySelector(".hero")) {
          throw new Error("Document sans gabarit isora");
        }

        return nextDocument;
      })
      .catch(function (error) {
        pageCache.delete(key);
        throw error;
      });

    pageCache.set(key, request);
    trimCache();

    return request;
  }

  function prefetch(anchor) {
    try {
      var url = new URL(anchor.href, window.location.href);

      if (!shouldHandleUrl(url) || normalizedDocumentUrl(url) === normalizedDocumentUrl(new URL(window.location.href))) {
        return;
      }

      fetchPage(url).catch(function () {
        // La navigation normale reste disponible si le préchargement échoue.
      });
    } catch {
      // Ignore invalid href values.
    }
  }

  function replaceHead(nextDocument) {
    var nextHead = document.importNode(nextDocument.head, true);

    document.documentElement.lang = nextDocument.documentElement.lang || document.documentElement.lang;
    document.head.replaceChildren.apply(document.head, Array.from(nextHead.childNodes));
    ensureRuntimeStyle();
  }

  function isStaticHeader(element) {
    return element && element.nodeType === Node.ELEMENT_NODE && element.classList.contains("topbar");
  }

  function replaceBody(nextDocument) {
    var nextBody = document.importNode(nextDocument.body, true);
    var currentHeader = isStaticHeader(document.body.firstElementChild) ? document.body.firstElementChild : null;
    var nextHeader = isStaticHeader(nextBody.firstElementChild) ? nextBody.firstElementChild : null;

    if (currentHeader && nextHeader) {
      Array.from(document.body.childNodes).forEach(function (node) {
        if (node !== currentHeader) node.remove();
      });

      Array.from(nextBody.childNodes).forEach(function (node) {
        if (node === nextHeader) return;
        document.body.appendChild(node);
      });
    } else {
      document.body.replaceWith(nextBody);
    }

    document.body.dataset.isoraSoftNavigated = "true";
    return Array.from(document.body.querySelectorAll("script")).filter(shouldRunScript);
  }

  function shouldRunScript(script) {
    var type = (script.getAttribute("type") || "").trim().toLowerCase();

    if (type && !["text/javascript", "application/javascript", "application/ecmascript", "text/ecmascript", "module"].includes(type)) {
      return false;
    }

    if (script.src && /\/isora-soft-navigation\.js(?:\?|$)/.test(new URL(script.src, window.location.href).pathname)) {
      return false;
    }

    return true;
  }

  function runScript(script) {
    var executable = document.createElement("script");

    Array.from(script.attributes).forEach(function (attribute) {
      executable.setAttribute(attribute.name, attribute.value);
    });

    if (script.src) {
      executable.async = false;
    } else {
      executable.text = script.textContent;
    }

    script.replaceWith(executable);
  }

  function runScripts(scripts) {
    scripts.forEach(runScript);
  }

  function saveScrollPosition() {
    scrollPositions.set(window.location.href, {
      x: window.scrollX,
      y: window.scrollY,
    });
  }

  function getHashTarget(hash) {
    if (!hash) return null;

    var id = decodeURIComponent(hash.slice(1));
    if (!id) return null;

    if (document.getElementById(id)) return document.getElementById(id);
    if (!window.CSS || !window.CSS.escape) return null;

    return document.querySelector('[name="' + window.CSS.escape(id) + '"]');
  }

  function focusPage(target) {
    var focusTarget = target || document.querySelector("h1") || document.querySelector("main");
    if (!focusTarget || typeof focusTarget.focus !== "function") return;

    if (!focusTarget.hasAttribute("tabindex")) {
      focusTarget.setAttribute("tabindex", "-1");
      focusTarget.addEventListener(
        "blur",
        function () {
          focusTarget.removeAttribute("tabindex");
        },
        { once: true },
      );
    }

    focusTarget.focus({ preventScroll: true });
  }

  function restoreScroll(url, isHistoryNavigation) {
    window.requestAnimationFrame(function () {
      var target = getHashTarget(url.hash);

      if (target) {
        target.scrollIntoView({ block: "start" });
        focusPage(target);
        return;
      }

      if (isHistoryNavigation && scrollPositions.has(url.href)) {
        var position = scrollPositions.get(url.href);
        window.scrollTo(position.x, position.y);
      } else {
        window.scrollTo(0, 0);
      }

      focusPage();
    });
  }

  function dispatchNavigationEvent(url) {
    window.__isoraSoftNavigationCount = (window.__isoraSoftNavigationCount || 0) + 1;
    window.__isoraSoftNavigationLastUrl = url.href;
    window.dispatchEvent(
      new CustomEvent("isora:soft-navigation", {
        detail: {
          url: url.href,
          path: url.pathname,
        },
      }),
    );
  }

  async function navigate(url, options) {
    if (navigating) return;

    navigating = true;
    document.documentElement.dataset.isoraNavigating = "true";
    saveScrollPosition();

    try {
      var nextDocument = await fetchPage(url);
      var scriptsToRun = [];
      var swap = function () {
        if (options.history === "push") {
          window.history.pushState({ isoraSoftNavigation: true }, "", url.href);
        }

        replaceHead(nextDocument);
        scriptsToRun = replaceBody(nextDocument);
        ensureRuntimeStyle();
      };

      if (document.startViewTransition && !reducedMotion.matches) {
        var transition = document.startViewTransition(swap);
        if (transition.updateCallbackDone) {
          await transition.updateCallbackDone.catch(function () {});
        }
        runScripts(scriptsToRun);
        dispatchNavigationEvent(url);
        restoreScroll(url, options.history === "pop");
        transition.finished.catch(function () {});
      } else {
        swap();
        runScripts(scriptsToRun);
        dispatchNavigationEvent(url);
        restoreScroll(url, options.history === "pop");
      }
    } catch {
      window.location.href = url.href;
    } finally {
      delete document.documentElement.dataset.isoraNavigating;
      navigating = false;
    }
  }

  document.addEventListener(
    "click",
    function (event) {
      var anchor = getAnchor(event);
      if (!anchor) return;

      var url = new URL(anchor.href, window.location.href);
      if (!shouldHandleUrl(url) || isSameDocumentHash(url)) return;
      if (normalizedDocumentUrl(url) === normalizedDocumentUrl(new URL(window.location.href)) && !url.hash) return;

      event.preventDefault();
      navigate(url, { history: "push" });
    },
    true,
  );

  document.addEventListener(
    "pointerover",
    function (event) {
      var anchor = getAnchor(event);
      if (anchor) prefetch(anchor);
    },
    true,
  );

  document.addEventListener(
    "focusin",
    function (event) {
      var anchor = event.target && typeof event.target.closest === "function" ? event.target.closest("a[href]") : null;
      if (anchor) prefetch(anchor);
    },
    true,
  );

  document.addEventListener(
    "touchstart",
    function (event) {
      var anchor = event.target && typeof event.target.closest === "function" ? event.target.closest("a[href]") : null;
      if (anchor) prefetch(anchor);
    },
    { capture: true, passive: true },
  );

  window.addEventListener("popstate", function () {
    var url = new URL(window.location.href);
    if (!shouldHandleUrl(url)) {
      window.location.reload();
      return;
    }

    navigate(url, { history: "pop" });
  });

  ensureRuntimeStyle();
})();

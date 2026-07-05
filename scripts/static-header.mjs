export function renderStaticHeaderCss() {
  return [
    ".wrap { width: min(100% - 48px, 1200px); margin: 0 auto; }",
    '.topbar { border-bottom: 1px solid #d8d8d0; background: #fff; font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; line-height: 1.5; }',
    ".topbar-inner { min-height: 106px; display: flex; align-items: stretch; justify-content: space-between; gap: 24px; }",
    ".brand { margin-left: -16px; padding: 0 16px; display: inline-flex; align-items: center; gap: 14px; color: #171717; text-decoration: none; font-weight: 400; }",
    ".brand:hover, .brand:focus-visible { background: #f6f6f6; }",
    ".brand:focus-visible { outline: 2px solid #1455a3; outline-offset: -2px; }",
    ".brand img { width: 106px; height: auto; display: block; }",
    ".brand span { max-width: 25rem; color: #3f3f3f; font-size: 0.96rem; font-weight: 700; line-height: 1.35; }",
    ".nav { margin-left: auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 4px; align-self: center; font-weight: 400; }",
    ".nav a { min-height: 32px; display: inline-flex; align-items: center; gap: 8px; padding: 0 8px; color: #000091; text-decoration: none; font-weight: 800; line-height: 1.5; }",
    ".nav a:hover { background: #f6f6f6; }",
    ".nav a:active { background: #ededed; }",
    ".nav a:focus-visible { outline: 2px solid #1455a3; outline-offset: 2px; }",
    ".nav svg { width: 18px; height: 18px; flex: 0 0 auto; }",
    "@media (max-width: 760px) {",
    "  .wrap { width: min(100% - 24px, 1200px); }",
    "  .topbar-inner { min-height: 0; align-items: stretch; flex-direction: column; gap: 8px; padding: 8px 0; }",
    "  .brand { margin: 0 -8px; padding: 12px 8px; align-items: flex-start; flex-direction: column; gap: 8px; }",
    "  .nav { margin-left: 0; align-self: stretch; justify-content: flex-end; }",
    "}",
  ].join("\n");
}

export function renderBrandLink() {
  return `<a class="brand" href="/" aria-label="Accueil isora - Le référentiel des asymétries de sexe">
            <img src="/isora.svg" alt="isora" />
            <span>Le référentiel des asymétries de sexe</span>
          </a>`;
}

export function renderTopNav() {
  return `<nav class="nav" aria-label="Navigation">
          <a href="/lexique/">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13.17 2a2 2 0 0 1 1.42.59l6.7 6.7a2.4 2.4 0 0 1 0 3.42l-4.58 4.58a2.4 2.4 0 0 1-3.42 0l-6.7-6.7A2 2 0 0 1 6 9.17V3a1 1 0 0 1 1-1z" />
              <path d="M2 7v6.17a2 2 0 0 0 .59 1.42l6.7 6.7a2.4 2.4 0 0 0 3.19.19" />
              <circle cx="10.5" cy="6.5" r=".5" fill="currentColor" />
            </svg>
            Lexique
          </a>
          <a href="/blog/">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 9H8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
            Articles
          </a>
        </nav>`;
}

export function renderStaticHeader() {
  return `<header class="topbar">
      <div class="wrap topbar-inner">
        ${renderBrandLink()}
        ${renderTopNav()}
      </div>
    </header>`;
}

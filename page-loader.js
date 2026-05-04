(function () {
  const root = document.documentElement;
  root.classList.add('page-booting');

  const STYLE_ID = 'rv-page-loader-style';
  const OVERLAY_ID = 'rvPageLoader';
  const LABEL_MAP = {
    'Roadvault Explorer.html': 'Loading product explorer',
    'Funding Brief.html': 'Loading funding brief',
    'Roadmap.html': 'Loading roadmap simulation',
    'Deck.html': 'Loading investor deck',
    'Founder List.html': 'Loading founder list',
  };

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html.page-booting,
      html.page-booting body {
        overflow: hidden !important;
      }
      .rv-page-loader {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(circle at 50% 40%, rgba(157,255,60,0.08), transparent 28%),
          linear-gradient(180deg, rgba(10,11,10,0.98), rgba(10,11,10,1));
        opacity: 1;
        transition: opacity 0.45s ease;
        pointer-events: auto;
      }
      .rv-page-loader.is-leaving {
        opacity: 0;
      }
      .rv-page-loader__grain {
        position: absolute;
        inset: 0;
        background-image:
          radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
          radial-gradient(rgba(255,255,255,0.01) 1px, transparent 1px);
        background-size: 3px 3px, 7px 7px;
        background-position: 0 0, 1px 2px;
        mix-blend-mode: overlay;
        opacity: 0.55;
        pointer-events: none;
      }
      .rv-page-loader__frame {
        position: absolute;
        inset: 18px;
        border: 1px solid rgba(232,233,228,0.12);
        pointer-events: none;
      }
      .rv-page-loader__frame::before,
      .rv-page-loader__frame::after {
        content: "";
        position: absolute;
        width: 18px;
        height: 18px;
        border: 1px solid #9dff3c;
      }
      .rv-page-loader__frame::before {
        top: -1px;
        left: -1px;
        border-right: 0;
        border-bottom: 0;
      }
      .rv-page-loader__frame::after {
        right: -1px;
        bottom: -1px;
        border-left: 0;
        border-top: 0;
      }
      .rv-page-loader__stack {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        text-align: center;
        color: #e8e9e4;
        font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
      }
      .rv-page-loader__mark {
        width: 58px;
        height: 58px;
        border: 1px solid #9dff3c;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        color: #9dff3c;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.05em;
        box-shadow: 0 0 18px rgba(157,255,60,0.18);
      }
      .rv-page-loader__mark::before {
        content: "";
        position: absolute;
        inset: 5px;
        border: 1px solid rgba(157,255,60,0.4);
      }
      .rv-page-loader__mark::after {
        content: "";
        position: absolute;
        inset: -1px;
        border: 1px solid #9dff3c;
        border-color: #9dff3c transparent transparent transparent;
        animation: rv-page-loader-spin 1.2s linear infinite;
      }
      .rv-page-loader__label {
        font-size: 10px;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: #8b8d86;
      }
      .rv-page-loader__pulse {
        width: 160px;
        height: 1px;
        background: rgba(232,233,228,0.12);
        overflow: hidden;
        position: relative;
      }
      .rv-page-loader__pulse::before {
        content: "";
        position: absolute;
        left: -35%;
        top: 0;
        width: 35%;
        height: 100%;
        background: #9dff3c;
        box-shadow: 0 0 12px rgba(157,255,60,0.55);
        animation: rv-page-loader-scan 1.35s cubic-bezier(.4,0,.2,1) infinite;
      }
      @keyframes rv-page-loader-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes rv-page-loader-scan {
        0% { left: -35%; }
        100% { left: 100%; }
      }
      @media (prefers-reduced-motion: reduce) {
        .rv-page-loader,
        .rv-page-loader__mark::after,
        .rv-page-loader__pulse::before {
          transition: none;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getLabel() {
    const file = window.location.pathname.split('/').pop() || '';
    return LABEL_MAP[file] || 'Loading dossier';
  }

  function mountOverlay() {
    if (document.getElementById(OVERLAY_ID)) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'rv-page-loader';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="rv-page-loader__grain"></div>
      <div class="rv-page-loader__frame"></div>
      <div class="rv-page-loader__stack">
        <div class="rv-page-loader__mark">R</div>
        <div class="rv-page-loader__label">${getLabel()}</div>
        <div class="rv-page-loader__pulse"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dwell = reduceMotion ? 220 : 900;
    const fade = reduceMotion ? 60 : 420;

    window.setTimeout(() => {
      overlay.classList.add('is-leaving');
      root.classList.remove('page-booting');
      window.setTimeout(() => {
        overlay.remove();
      }, fade);
    }, dwell);
  }

  injectStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountOverlay, { once: true });
  } else {
    mountOverlay();
  }
})();

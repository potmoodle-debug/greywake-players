(() => {
  const ACTIVE = ['marek', 'velmira', 'odie'];
  let liveData = window.GREYWAKE_LIVE_POSSIBILITIES || { updates: {}, cardOverrides: {} };
  let loadPromise = null;

  function characterKey() {
    const body = String(document.body.dataset.character || '').toLowerCase();
    if (ACTIVE.includes(body)) return body;
    const player = String(window.GreywakePlayer?.character || '').toLowerCase();
    return ACTIVE.includes(player) ? player : null;
  }

  function ensureStyles() {
    if (document.getElementById('currentPossibilityUpdateStyles')) return;
    const style = document.createElement('style');
    style.id = 'currentPossibilityUpdateStyles';
    style.textContent = `
      .thread-card[data-latest-enabled="true"]{cursor:pointer}
      .thread-card[data-latest-enabled="true"]:focus-visible{outline:2px solid #c9b06b;outline-offset:4px}
      .thread-latest-toggle{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:1rem;padding-top:.85rem;border-top:1px solid rgba(231,214,165,.22);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#d7c58e}
      .thread-latest-toggle b{font-size:1rem;line-height:1;transition:transform .16s ease}
      .thread-card.latest-open .thread-latest-toggle b{transform:rotate(90deg)}
      .thread-latest{margin-top:.8rem;padding:.9rem 1rem;border:1px solid rgba(213,190,119,.28);background:rgba(14,15,12,.78);box-shadow:inset 3px 0 0 rgba(213,190,119,.58)}
      .thread-latest[hidden]{display:none}
      .thread-latest span{display:block;margin-bottom:.4rem;font-size:.68rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#d7c58e}
      .thread-latest p{margin:0;line-height:1.55;color:#f0ead9}
    `;
    document.head.appendChild(style);
  }

  function loadLiveData() {
    if (loadPromise) return loadPromise;
    loadPromise = new Promise(resolve => {
      const previous = document.getElementById('greywakeLivePossibilityData');
      previous?.remove();
      const script = document.createElement('script');
      script.id = 'greywakeLivePossibilityData';
      script.src = `current-possibility-live-data.js?live=${Date.now()}`;
      script.async = true;
      script.onload = () => {
        liveData = window.GREYWAKE_LIVE_POSSIBILITIES || liveData;
        resolve(liveData);
      };
      script.onerror = () => resolve(liveData);
      document.head.appendChild(script);
    }).finally(() => {
      loadPromise = null;
    });
    return loadPromise;
  }

  function applyCardOverride(card, key) {
    const override = liveData.cardOverrides?.[card.dataset.thread]?.[key];
    if (!override) return;
    const status = card.querySelector('.thread-status');
    const direction = card.querySelector('.thread-direction');
    const summary = card.querySelector('.thread-summary');
    const known = card.querySelector('.thread-known');
    const imageNote = card.querySelector('.thread-image-note');
    if (status && override.status) status.textContent = override.status;
    if (direction && override.direction) direction.textContent = override.direction;
    if (summary && override.summary) summary.textContent = override.summary;
    if (known && override.known) known.textContent = override.known;
    if (imageNote && override.imageNote) imageNote.textContent = override.imageNote;
    if (override.next) card.dataset.nextStep = override.next;
  }

  function enhanceCard(card, key) {
    const id = card.dataset.thread;
    applyCardOverride(card, key);
    const update = liveData.updates?.[id]?.[key];
    if (!update) return;

    const existing = card.querySelector('.thread-latest');
    if (existing && card.dataset.latestEnhanced === key) {
      const p = existing.querySelector('p');
      if (p) p.textContent = update;
      return;
    }

    card.dataset.latestEnhanced = key;
    card.dataset.latestEnabled = 'true';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');

    const content = card.querySelector('.thread-card-content') || card;
    const toggle = document.createElement('div');
    toggle.className = 'thread-latest-toggle';
    toggle.innerHTML = `<span>Open latest for ${key}</span><b aria-hidden="true">›</b>`;

    const latest = document.createElement('div');
    latest.className = 'thread-latest';
    latest.hidden = true;
    latest.innerHTML = `<span>LATEST FOR ${key.toUpperCase()}</span><p></p>`;
    latest.querySelector('p').textContent = update;
    content.append(toggle, latest);

    const setOpen = open => {
      card.classList.toggle('latest-open', open);
      latest.hidden = !open;
      card.setAttribute('aria-expanded', String(open));
      toggle.querySelector('span').textContent = `${open ? 'Close' : 'Open'} latest for ${key}`;
    };

    card.addEventListener('click', event => {
      if (event?.target?.closest('button,a,input,select,textarea,[role="button"]') && event.target.closest('[role="button"]') !== card) return;
      setOpen(latest.hidden);
    });

    card.addEventListener('keydown', event => {
      if ((event.key !== 'Enter' && event.key !== ' ') || event.target !== card) return;
      event.preventDefault();
      setOpen(latest.hidden);
    });
  }

  function enhanceNow() {
    ensureStyles();
    const key = characterKey();
    if (!key) return;
    document.querySelectorAll('#currentThreadsGrid .thread-card').forEach(card => enhanceCard(card, key));
  }

  async function refresh() {
    await loadLiveData();
    enhanceNow();
  }

  let timer = null;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(refresh, 40);
  };

  function watchGrid() {
    const grid = document.getElementById('currentThreadsGrid');
    if (!grid || grid.dataset.liveKnowledgeObserver === 'true') return;
    grid.dataset.liveKnowledgeObserver = 'true';
    new MutationObserver(schedule).observe(grid, { childList: true, subtree: true });
  }

  window.GreywakePossibilityUpdates = { refresh };
  window.addEventListener('greywake:player-ready', () => { watchGrid(); schedule(); });
  window.addEventListener('greywake:portal-live-mounted', event => {
    if (event.detail?.kind === 'threads') { watchGrid(); schedule(); }
  });
  window.addEventListener('greywake:engagement-changed', schedule);
  window.addEventListener('focus', schedule);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) schedule();
  });
  document.addEventListener('DOMContentLoaded', () => { watchGrid(); schedule(); });
  setTimeout(() => { watchGrid(); refresh(); }, 220);
})();

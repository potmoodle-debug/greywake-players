(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;

  let activeFilter = null;
  let scheduled = false;

  const FILTERS = {
    'QUESTION': 'question',
    'PLAYER INTEREST': 'interest',
    'PURSUING': 'pursuing',
    'PLAY AT TABLE': 'table',
    'RESOLVED': 'resolved'
  };

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function ensureStyles() {
    if (document.getElementById('gm-engagement-filter-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-engagement-filter-styles';
    style.textContent = `
      .interest-legend.gm-filter-legend{align-items:center}
      .interest-legend .gm-engagement-filter{appearance:none;background:transparent;border:1px solid #3e3a2c;padding:9px 16px;color:#817a67;font:800 9px/1 inherit;letter-spacing:.11em;text-transform:uppercase;cursor:pointer;min-height:42px}
      .interest-legend .gm-engagement-filter:hover{border-color:#786d49;color:#d7c79b;background:#171611}
      .interest-legend .gm-engagement-filter[aria-pressed="true"]{border-color:#a08c55;color:#ead9a5;background:#282316;box-shadow:inset 0 -2px 0 #b39a5b}
      .gm-filter-summary{display:block;width:100%;margin:1px 0 5px;color:#6f6958;font-size:9px;letter-spacing:.05em}
      .gm-filter-empty{margin:18px 0;padding:16px;border:1px dashed #474230;color:#938b76;background:#161611;font-size:12px}
    `;
    document.head.appendChild(style);
  }

  function cardMatches(card, filter) {
    if (!filter) return true;
    const kind = (card.dataset.entryKind || '').toLowerCase();
    const status = (card.querySelector('.interest-status')?.textContent || '').toUpperCase();
    const threadState = (card.querySelector('.interest-waiting-pill')?.textContent || '').toUpperCase();
    const resolved = card.classList.contains('interest-thread-resolved') || status.includes('RESOLVED');
    if (filter === 'question') return !resolved && kind === 'question';
    if (filter === 'interest') return !resolved && kind === 'interest' && !status.includes('PURSUING');
    if (filter === 'pursuing') return !resolved && status.includes('PURSUING');
    if (filter === 'table') return !resolved && threadState.includes('PLAY AT TABLE');
    if (filter === 'resolved') return resolved;
    return true;
  }

  function applyFilter() {
    if (!isFullGM()) return;
    const legend = host.querySelector('.interest-legend.gm-filter-legend');
    if (!legend) return;
    legend.querySelectorAll('.gm-engagement-filter').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
    let shown = 0;
    host.querySelectorAll('.gm-interest-thread').forEach(card => {
      const match = cardMatches(card, activeFilter);
      card.hidden = !match;
      if (match) shown += 1;
    });
    host.querySelectorAll('.resolved-goals').forEach(details => {
      if (activeFilter === 'resolved') {
        details.hidden = !details.querySelector('.gm-interest-thread:not([hidden])');
        if (!details.hidden) details.open = true;
      } else details.hidden = Boolean(activeFilter);
    });
    host.querySelectorAll('.gm-goal-group').forEach(group => {
      group.hidden = activeFilter ? !group.querySelector('.gm-interest-thread:not([hidden])') : false;
    });
    let empty = host.querySelector('.gm-filter-empty');
    if (activeFilter && shown === 0) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'gm-filter-empty';
        legend.insertAdjacentElement('afterend', empty);
      }
      empty.textContent = 'No player threads currently match this filter.';
    } else empty?.remove();
    const summary = legend.querySelector('.gm-filter-summary');
    if (summary) summary.textContent = activeFilter ? `${shown} matching thread${shown === 1 ? '' : 's'}.` : 'Filter the GM inbox by type or state.';
  }

  function enhanceLegend() {
    if (!isFullGM()) return;
    const legend = host.querySelector('.interest-legend');
    if (!legend || legend.classList.contains('gm-filter-legend')) {
      if (legend) applyFilter();
      return;
    }
    const labels = [...legend.querySelectorAll(':scope > span')];
    if (!labels.some(span => FILTERS[span.textContent.trim().toUpperCase()])) return;
    ensureStyles();
    legend.classList.add('gm-filter-legend');
    labels.forEach(span => {
      const label = span.textContent.trim().toUpperCase();
      const filter = FILTERS[label];
      if (!filter) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gm-engagement-filter';
      button.dataset.filter = filter;
      button.setAttribute('aria-pressed', 'false');
      button.textContent = label;
      span.replaceWith(button);
    });
    const summary = document.createElement('span');
    summary.className = 'gm-filter-summary';
    summary.textContent = 'Filter the GM inbox by type or state.';
    legend.appendChild(summary);
    applyFilter();
  }

  host.addEventListener('click', event => {
    if (!isFullGM()) return;
    const button = event.target.closest('.gm-engagement-filter');
    if (!button || !host.contains(button)) return;
    const next = button.dataset.filter;
    activeFilter = activeFilter === next ? null : next;
    applyFilter();
  });

  function scheduleEnhance() {
    if (!isFullGM() || scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhanceLegend();
    });
  }

  function ensureMindDashboardScript() {
    if (!isFullGM() || document.querySelector('script[data-gm-mind-dashboard]')) return;
    const script = document.createElement('script');
    script.src = 'gm-mind-dashboard.js?v=mind2';
    script.defer = true;
    script.dataset.gmMindDashboard = 'true';
    document.head.appendChild(script);
  }

  function ensureDevelopmentWorkspaceAssets() {
    if (!isFullGM()) return;
    if (!document.querySelector('link[data-gm-development-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'gm-development.css?v=dev3';
      link.dataset.gmDevelopmentCss = 'true';
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-gm-development]')) {
      const script = document.createElement('script');
      script.src = 'gm-development.js?v=dev3';
      script.defer = true;
      script.dataset.gmDevelopment = 'true';
      document.head.appendChild(script);
    }
    if (!document.querySelector('script[data-gm-development-sync]')) {
      const sync = document.createElement('script');
      sync.src = 'gm-development-sync.js?v=dev3';
      sync.defer = true;
      sync.dataset.gmDevelopmentSync = 'true';
      document.head.appendChild(sync);
    }
  }

  const observer = new MutationObserver(() => {
    if (isFullGM()) scheduleEnhance();
  });
  observer.observe(host, { childList: true, subtree: true });

  function refresh() {
    if (!isFullGM()) return;
    ensureMindDashboardScript();
    ensureDevelopmentWorkspaceAssets();
    scheduleEnhance();
  }

  window.addEventListener('greywake:player-ready', refresh);
  window.addEventListener('greywake:engagement-changed', refresh);
  document.addEventListener('DOMContentLoaded', refresh);
  refresh();
})();
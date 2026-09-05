(() => {
  let repairToken = 0;

  function isPreview() {
    return document.body.dataset.gmPreview === 'true' && document.body.dataset.role === 'player';
  }

  function ensureDirectPreviewRenderer() {
    if (!isPreview()) return;
    if (document.querySelector('script[data-gm-preview-mind-direct]')) return;
    const script = document.createElement('script');
    script.src = 'gm-preview-mind-direct.js?v=preview3';
    script.defer = true;
    script.dataset.gmPreviewMindDirect = 'true';
    document.head.appendChild(script);
  }

  function needsGoalRepair() {
    const host = document.getElementById('playerGoals');
    if (!host) return false;
    if (host.querySelector('.gm-goal-group,.gm-interest-thread')) return true;
    return !host.querySelector('.interest-thread,.goals-empty,.goal-form,.player-mind-view,.gm-preview-direct');
  }

  function repairPreview() {
    if (!isPreview() || !window.GreywakePlayer) return;
    ensureDirectPreviewRenderer();
    const token = ++repairToken;
    const delays = [0, 120, 350, 800, 1500];
    delays.forEach(delay => setTimeout(() => {
      if (token !== repairToken || !isPreview() || !window.GreywakePlayer) return;
      ensureDirectPreviewRenderer();
      window.GreywakePlayerPortal?.render?.();
      if (needsGoalRepair()) {
        window.dispatchEvent(new CustomEvent('greywake:engagement-changed'));
      }
      window.GreywakePlayerMindView?.render?.();
      window.GreywakeCardPriorities?.refresh?.();
    }, delay));
  }

  window.addEventListener('greywake:player-ready', () => {
    if (isPreview()) setTimeout(repairPreview, 0);
  });
  window.addEventListener('hashchange', () => {
    if ((location.hash || '') === '#/mind' && isPreview()) setTimeout(repairPreview, 0);
  });
  window.addEventListener('greywake:portal-live-mounted', event => {
    if (event.detail?.kind === 'goals' && isPreview()) setTimeout(repairPreview, 0);
  });
  document.addEventListener('DOMContentLoaded', () => setTimeout(repairPreview, 250));
  setTimeout(() => {
    if (isPreview()) repairPreview();
  }, 600);
})();
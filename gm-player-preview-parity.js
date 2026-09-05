(() => {
  let repairToken = 0;

  function isPreview() {
    return document.body.dataset.gmPreview === 'true' && document.body.dataset.role === 'player';
  }

  function needsGoalRepair() {
    const host = document.getElementById('playerGoals');
    if (!host) return false;
    if (host.querySelector('.gm-goal-group,.gm-interest-thread')) return true;
    return !host.querySelector('.interest-thread,.goals-empty,.goal-form,.player-mind-view');
  }

  function repairPreview() {
    if (!isPreview() || !window.GreywakePlayer) return;
    const token = ++repairToken;
    const delays = [0, 120, 350, 800, 1500];
    delays.forEach((delay, index) => setTimeout(() => {
      if (token !== repairToken || !isPreview() || !window.GreywakePlayer) return;
      window.GreywakePlayerPortal?.render?.();
      if (needsGoalRepair()) {
        window.dispatchEvent(new CustomEvent('greywake:player-ready', { detail: window.GreywakePlayer }));
      }
      window.GreywakePlayerMindView?.render?.();
      if (index === delays.length - 1) window.dispatchEvent(new CustomEvent('greywake:engagement-changed'));
    }, delay));
  }

  window.addEventListener('greywake:player-ready', event => {
    if (event.detail && isPreview()) setTimeout(repairPreview, 0);
  });
  window.addEventListener('hashchange', () => {
    if ((location.hash || '') === '#/mind') setTimeout(repairPreview, 0);
  });
  window.addEventListener('greywake:portal-live-mounted', event => {
    if (event.detail?.kind === 'goals') setTimeout(repairPreview, 0);
  });
  document.addEventListener('DOMContentLoaded', () => setTimeout(repairPreview, 250));
})();

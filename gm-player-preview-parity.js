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
    delays.forEach(delay => setTimeout(() => {
      if (token !== repairToken || !isPreview() || !window.GreywakePlayer) return;
      window.GreywakePlayerPortal?.render?.();
      if (needsGoalRepair()) {
        // player-goals.js listens to engagement-changed and renders from window.GreywakePlayer.
        // Do not fire player-ready here: this script also listens to player-ready and the
        // previous implementation could continuously restart its own repair cycle.
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
})();

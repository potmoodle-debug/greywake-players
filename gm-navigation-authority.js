(() => {
  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function route() {
    return location.hash || '#/';
  }

  function navigate(hash) {
    if (!isFullGM()) return;
    if (location.hash === hash) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      return;
    }
    location.hash = hash;
  }

  function setSelected(node, selected) {
    if (!node) return;
    node.classList.toggle('active', selected);
    if (selected) node.setAttribute('aria-current', 'page');
    else node.removeAttribute('aria-current');
  }

  function syncActiveState() {
    if (!isFullGM()) return;
    const h = route();

    setSelected(document.getElementById('homeBtn'), h === '#/' || h === '');
    setSelected(document.getElementById('characterSheetBtn'), h === '#/character');
    setSelected(document.getElementById('myGreywakeBtn'), h === '#/gm-players');
    setSelected(document.getElementById('greywakeBtn'), h === '#/gm-greywake' || h === '#/brain' || h.startsWith('#/record/'));
    setSelected(document.getElementById('campaignBtn'), h === '#/gm-campaign');

    const cockpit = document.getElementById('gmCockpitShortcut');
    const minds = document.getElementById('gmMindShortcut');
    setSelected(cockpit, h === '#/gm-cockpit');
    setSelected(minds, h === '#/gm-players');
  }

  function targetRoute(target) {
    if (target.closest('#gmCockpitShortcut')) return '#/gm-cockpit';
    if (target.closest('#gmMindShortcut')) return '#/gm-players';
    if (target.closest('#homeBtn')) return '#/';
    if (target.closest('#myGreywakeBtn')) return '#/gm-players';
    if (target.closest('#greywakeBtn')) return '#/gm-greywake';
    if (target.closest('#campaignBtn')) return '#/gm-campaign';
    return '';
  }

  document.addEventListener('click', event => {
    if (!isFullGM()) return;
    const hash = targetRoute(event.target);
    if (!hash) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate(hash);
  }, true);

  document.addEventListener('keydown', event => {
    if (!isFullGM() || !['Enter', ' '].includes(event.key)) return;
    const hash = targetRoute(event.target);
    if (!hash) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate(hash);
  }, true);

  const observer = new MutationObserver(() => {
    if (isFullGM()) requestAnimationFrame(syncActiveState);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('hashchange', () => setTimeout(syncActiveState, 0));
  window.addEventListener('greywake:player-ready', () => setTimeout(syncActiveState, 0));
  document.addEventListener('DOMContentLoaded', () => setTimeout(syncActiveState, 0));
  setTimeout(syncActiveState, 0);
  setTimeout(syncActiveState, 200);
})();
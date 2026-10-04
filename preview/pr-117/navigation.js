/* One route lifecycle for the archive, player portal, character and GM pages. */
(() => {
  const renderers = new Map();
  let queued = false;
  let previous = location.hash || '#/';
  function render() {
    queued = false;
    const route = location.hash || '#/';
    if (route !== previous) {
      if (route === '#/character') {
        history.replaceState({...history.state, greywakeReturn: previous}, '', route);
      }
      previous = route;
    }
    for (const renderer of renderers.values()) renderer();
    document.querySelector('.sidebar')?.classList.remove('open');
    document.getElementById('menuBtn')?.setAttribute('aria-expanded', 'false');
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  }
  function navigate(route, {replace = false} = {}) {
    if (typeof route !== 'string' || !route.startsWith('#/')) return;
    if (route !== (location.hash || '#/')) {
      const state = {greywakeReturn: location.hash || '#/'};
      history[replace ? 'replaceState' : 'pushState'](state, '', route);
    }
    schedule();
  }
  window.GreywakeNavigation = {
    register(name, renderer) { renderers.set(name, renderer); schedule(); },
    navigate, render: schedule,
    returnRoute() { const route = history.state?.greywakeReturn; return route && route !== '#/character' ? route : '#/'; }
  };
  window.addEventListener('hashchange', schedule);
  window.addEventListener('popstate', schedule);
  window.addEventListener('greywake:player-ready', schedule);
})();

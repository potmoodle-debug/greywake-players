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
    closeSidebar();
  }
  // The route lifecycle and every drawer control use one state transition.
  function setSidebarOpen(open, {restoreFocus = false, focusClose = false} = {}) {
    const sidebar = document.getElementById('sidebar');
    const menu = document.getElementById('menuBtn');
    const close = document.getElementById('sidebarClose');
    if (!sidebar || !menu) return;
    const wasOpen = sidebar.classList.contains('open');
    const next = Boolean(open);
    sidebar.classList.toggle('open', next);
    document.body.classList.toggle('nav-open', next);
    document.body.classList.toggle('sidebar-modal-open', next);
    menu.setAttribute('aria-expanded', String(next));
    menu.setAttribute('aria-label', next ? 'Close navigation' : 'Open navigation');
    if (next && focusClose) close?.focus();
    if (!next && wasOpen && restoreFocus) menu.focus();
  }
  function closeSidebar() { setSidebarOpen(false); }
  function bindSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menu = document.getElementById('menuBtn');
    if (!sidebar || !menu) return;
    menu.addEventListener('click', () => {
      const open = !sidebar.classList.contains('open');
      setSidebarOpen(open, {focusClose: open, restoreFocus: !open});
    });
    document.getElementById('sidebarClose')?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      setSidebarOpen(false, {restoreFocus: true});
    });
    document.getElementById('navBackdrop')?.addEventListener('click', () => setSidebarOpen(false, {restoreFocus: true}));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && sidebar.classList.contains('open')) {
        event.preventDefault();
        setSidebarOpen(false, {restoreFocus: true});
      }
    });
    // Clear drawer state when switching to a persistent desktop sidebar.
    window.addEventListener('resize', () => {
      if (sidebar.classList.contains('open') && getComputedStyle(menu).display === 'none') closeSidebar();
    });
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
    navigate, render: schedule, closeSidebar,
    returnRoute() { const route = history.state?.greywakeReturn; return route && route !== '#/character' ? route : '#/'; }
  };
  bindSidebar();
  window.addEventListener('hashchange', schedule);
  window.addEventListener('popstate', schedule);
  window.addEventListener('greywake:player-ready', schedule);
})();

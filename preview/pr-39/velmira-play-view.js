(() => {
  const CHARACTER = 'velmira';
  const LABELS = { play: 'Play', magic: 'Magic', gear: 'Gear', reference: 'Reference' };

  function normalise(value) { return String(value || '').trim().toLowerCase(); }
  function activeCharacter() { return normalise(document.body.dataset.character || window.GreywakePlayer?.character); }
  function sheetRoot() { return document.querySelector('#characterSheet .character-sheet-shell'); }
  function section() { return document.getElementById('characterSheet'); }

  function classifyGroup(group) {
    const heading = normalise(group.querySelector('.sheet-group-head h3')?.textContent);
    if (heading.includes('trait') || heading.includes('experience')) return 'play';
    if (heading.includes('domain') || heading.includes('feature')) return 'magic';
    if (heading.includes('weapon') || heading.includes('armor') || heading.includes('inventory') || heading.includes('equipment')) return 'gear';
    return 'reference';
  }

  function selectTab(root, key, focus = false) {
    const nav = root?.querySelector('.velmira-play-tabs');
    if (!nav || !LABELS[key]) return;
    nav.querySelectorAll('[role="tab"]').forEach(button => {
      const selected = button.dataset.tab === key;
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    root.querySelectorAll('.velmira-play-panel').forEach(panel => {
      panel.hidden = panel.dataset.panel !== key;
    });
    try { sessionStorage.setItem('greywake-velmira-tab', key); } catch (_) {}
  }

  function makeTabs(root, groups) {
    root.classList.add('velmira-play-view');
    root.dataset.velmiraTabs = 'ready';
    const body = root.querySelector('.character-sheet-body');
    if (!body) return;

    const intro = document.createElement('div');
    intro.className = 'velmira-play-intro';
    intro.innerHTML = `<div><span class="velmira-play-kicker">VELMIRA · DURING PLAY</span><strong>Tap what you need.</strong></div><p>Checks and Experiences in Play. Spells and features in Magic. Weapons and armor in Gear.</p>`;

    const nav = document.createElement('div');
    nav.className = 'velmira-play-tabs';
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Velmira character sheet sections');

    const panels = {};
    Object.entries(LABELS).forEach(([key, label], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'velmira-play-tab';
      button.id = `velmira-tab-${key}`;
      button.dataset.tab = key;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `velmira-panel-${key}`);
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.tabIndex = index === 0 ? 0 : -1;
      button.textContent = label;
      nav.appendChild(button);

      const panel = document.createElement('section');
      panel.className = 'velmira-play-panel';
      panel.id = `velmira-panel-${key}`;
      panel.dataset.panel = key;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
      panel.hidden = index !== 0;
      panels[key] = panel;
    });

    groups.forEach(group => panels[classifyGroup(group)].appendChild(group));
    if (!panels.reference.children.length) {
      panels.reference.innerHTML = '<div class="velmira-reference-note"><strong>Character reference</strong><p>Background and campaign information remains on Velmira’s player page.</p></div>';
    }
    body.replaceChildren(intro, nav, ...Object.values(panels));

    nav.addEventListener('click', event => {
      const button = event.target.closest('[data-tab]');
      if (button) selectTab(root, button.dataset.tab);
    });
    nav.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      const buttons = [...nav.querySelectorAll('[role="tab"]')];
      const current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      let next = current;
      if (event.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
      if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      selectTab(root, buttons[next].dataset.tab, true);
    });

    let saved = 'play';
    try { saved = sessionStorage.getItem('greywake-velmira-tab') || 'play'; } catch (_) {}
    selectTab(root, LABELS[saved] ? saved : 'play');
  }

  function closePlay() {
    document.body.classList.remove('velmira-play-open');
    document.documentElement.classList.remove('velmira-play-open');
    const btn = document.getElementById('velmiraPlayBtn');
    btn?.setAttribute('aria-expanded', 'false');
    btn?.focus({ preventScroll: true });
  }

  function openPlay() {
    if (activeCharacter() !== CHARACTER) return;
    enhance();
    const target = section();
    if (!target) return;
    document.body.classList.add('velmira-play-open');
    document.documentElement.classList.add('velmira-play-open');
    const btn = document.getElementById('velmiraPlayBtn');
    btn?.setAttribute('aria-expanded', 'true');
    const root = sheetRoot();
    selectTab(root, 'play');
    target.scrollTop = 0;
    requestAnimationFrame(() => root?.querySelector('.velmira-play-tab[aria-selected="true"]')?.focus({ preventScroll: true }));
  }

  function ensureCloseButton() {
    const target = section();
    if (!target || target.querySelector('.velmira-play-close')) return;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'velmira-play-close';
    close.setAttribute('aria-label', 'Close Velmira Play');
    close.textContent = '× Close';
    close.addEventListener('click', closePlay);
    target.prepend(close);
  }

  function ensurePlayButton() {
    if (activeCharacter() !== CHARACTER) {
      document.getElementById('velmiraPlayBtn')?.remove();
      closePlay();
      return;
    }
    const topbar = document.querySelector('.topbar');
    if (!topbar || document.getElementById('velmiraPlayBtn')) return;
    const button = document.createElement('button');
    button.id = 'velmiraPlayBtn';
    button.type = 'button';
    button.className = 'brain-cta velmira-play-launch';
    button.textContent = 'Velmira Play';
    button.setAttribute('aria-controls', 'characterSheet');
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', openPlay);
    const character = document.getElementById('characterSheetBtn');
    topbar.insertBefore(button, character || document.getElementById('brainBtn') || null);
  }

  function closeSidebar() {
    if (activeCharacter() !== CHARACTER) return;
    const sidebar = document.getElementById('sidebar');
    const menu = document.getElementById('menuBtn');
    sidebar?.classList.remove('open');
    document.body.classList.add('velmira-sidebar-collapsed');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.focus({ preventScroll: true });
  }

  function openSidebar() {
    if (activeCharacter() !== CHARACTER) return;
    document.body.classList.remove('velmira-sidebar-collapsed');
    const menu = document.getElementById('menuBtn');
    menu?.setAttribute('aria-expanded', 'true');
  }

  function ensureSidebarControls() {
    const close = document.getElementById('sidebarClose');
    const menu = document.getElementById('menuBtn');
    const backdrop = document.getElementById('navBackdrop');

    if (close && close.dataset.velmiraCollapse !== 'ready') {
      close.dataset.velmiraCollapse = 'ready';
      close.title = 'Collapse navigation';
      close.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        closeSidebar();
      });
    }

    if (menu && menu.dataset.velmiraCollapse !== 'ready') {
      menu.dataset.velmiraCollapse = 'ready';
      menu.addEventListener('click', openSidebar);
    }

    if (backdrop && backdrop.dataset.velmiraCollapse !== 'ready') {
      backdrop.dataset.velmiraCollapse = 'ready';
      backdrop.addEventListener('click', closeSidebar);
    }
  }

  function enhance() {
    if (activeCharacter() !== CHARACTER) return;
    ensureSidebarControls();
    const root = sheetRoot();
    if (!root) return;
    if (root.dataset.velmiraTabs !== 'ready') {
      const body = root.querySelector('.character-sheet-body');
      if (!body) return;
      const groups = [...body.querySelectorAll(':scope > .sheet-group')];
      if (!groups.length) return;
      makeTabs(root, groups);
    }
    ensureCloseButton();
    ensurePlayButton();
  }

  function schedule() {
    requestAnimationFrame(() => {
      ensureSidebarControls();
      ensurePlayButton();
      enhance();
      setTimeout(enhance, 120);
      setTimeout(enhance, 450);
    });
  }

  window.addEventListener('greywake:player-ready', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('velmira-play-open')) closePlay();
  });

  const observer = new MutationObserver(() => {
    ensureSidebarControls();
    ensurePlayButton();
    if (activeCharacter() === CHARACTER) enhance();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
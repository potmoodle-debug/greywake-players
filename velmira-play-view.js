(() => {
  const CHARACTER = 'velmira';
  const LABELS = {
    play: 'Play',
    magic: 'Magic',
    gear: 'Gear',
    reference: 'Reference'
  };

  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  function activeCharacter() {
    return normalise(document.body.dataset.character || window.GreywakePlayer?.character);
  }

  function sheetRoot() {
    return document.querySelector('#characterSheet .character-sheet-shell');
  }

  function classifyGroup(group) {
    const heading = normalise(group.querySelector('.sheet-group-head h3')?.textContent);
    if (heading.includes('trait') || heading.includes('experience')) return 'play';
    if (heading.includes('domain') || heading.includes('feature')) return 'magic';
    if (heading.includes('weapon') || heading.includes('armor') || heading.includes('inventory') || heading.includes('equipment')) return 'gear';
    return 'reference';
  }

  function makeTabs(root, groups) {
    root.classList.add('velmira-play-view');
    root.dataset.velmiraTabs = 'ready';

    const body = root.querySelector('.character-sheet-body');
    if (!body) return;

    const intro = document.createElement('div');
    intro.className = 'velmira-play-intro';
    intro.innerHTML = `
      <div>
        <span class="velmira-play-kicker">VELMIRA · DURING PLAY</span>
        <strong>Tap what you need. No long scroll.</strong>
      </div>
      <p>Play keeps checks and Experiences together. Magic holds spells and features. Gear holds weapons, armor and inventory.</p>`;

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

    const reference = panels.reference;
    if (!reference.children.length) {
      reference.innerHTML = '<div class="velmira-reference-note"><strong>Character reference</strong><p>Background and campaign-facing information remains available elsewhere on Velmira’s player page. This tab is reserved for extra sheet reference as it is added.</p></div>';
    }

    body.replaceChildren(intro, nav, ...Object.values(panels));

    function selectTab(key, focus = false) {
      nav.querySelectorAll('[role="tab"]').forEach(button => {
        const selected = button.dataset.tab === key;
        button.setAttribute('aria-selected', selected ? 'true' : 'false');
        button.tabIndex = selected ? 0 : -1;
        if (selected && focus) button.focus({ preventScroll: true });
      });
      Object.values(panels).forEach(panel => {
        panel.hidden = panel.dataset.panel !== key;
      });
      try { sessionStorage.setItem('greywake-velmira-tab', key); } catch (_) {}
    }

    nav.addEventListener('click', event => {
      const button = event.target.closest('[data-tab]');
      if (button) selectTab(button.dataset.tab);
    });

    nav.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const buttons = [...nav.querySelectorAll('[role="tab"]')];
      const current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      let next = current;
      if (event.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
      if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      selectTab(buttons[next].dataset.tab, true);
    });

    let saved = 'play';
    try { saved = sessionStorage.getItem('greywake-velmira-tab') || 'play'; } catch (_) {}
    if (LABELS[saved]) selectTab(saved);
  }

  function enhance() {
    if (activeCharacter() !== CHARACTER) return;
    const root = sheetRoot();
    if (!root || root.dataset.velmiraTabs === 'ready') return;
    const body = root.querySelector('.character-sheet-body');
    if (!body) return;
    const groups = [...body.querySelectorAll(':scope > .sheet-group')];
    if (!groups.length) return;
    makeTabs(root, groups);
  }

  function schedule() {
    requestAnimationFrame(() => {
      enhance();
      setTimeout(enhance, 120);
      setTimeout(enhance, 450);
    });
  }

  window.addEventListener('greywake:player-ready', schedule);
  document.addEventListener('DOMContentLoaded', schedule);

  const observer = new MutationObserver(() => {
    if (activeCharacter() === CHARACTER) enhance();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
(() => {
  const HUMANOID_ACTIONS = {
    attacks: ['Shortstaff', 'Round Shield'],
    abilities: ['Nature’s Tongue', 'Wall Walk', 'Wildtouch', 'Regeneration', 'Clarity of Nature', 'Evolution', 'Beastform']
  };

  let observedBeastform = null;
  let beastformObserver = null;
  let selectedAction = null;

  function isMarek() {
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase() === 'marek';
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function sheetCard(title) {
    return [...document.querySelectorAll('#characterSheet .sheet-card')].find(card => card.querySelector('h4')?.textContent.trim() === title) || null;
  }

  function sheetAction(title, type) {
    const card = sheetCard(title);
    if (!card) return null;
    const group = card.closest('.sheet-group');
    return {
      id: `sheet-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title,
      type,
      meta: card.querySelector('.sheet-value')?.textContent.trim() || '',
      body: card.querySelector('.sheet-card-body p')?.textContent.trim() || '',
      sourceTitle: title,
      sourceGroup: group?.querySelector('.sheet-group-head h3')?.textContent.trim() || ''
    };
  }

  function readCombatItem(label) {
    return [...document.querySelectorAll('#beastformControl .beastform-combat-line > div')].find(item => item.querySelector('span')?.textContent.trim().toUpperCase() === label.toUpperCase()) || null;
  }

  function beastformActions() {
    const active = document.querySelector('#beastformControl .beastform-active-panel');
    if (!active) return null;

    const name = active.querySelector('.beastform-active-head strong')?.textContent.trim() || 'Beastform';
    const attack = readCombatItem('BEAST ATTACK');
    const trait = readCombatItem('ATTACK TRAIT');
    const attackMeta = [
      trait?.querySelector('b')?.textContent.trim(),
      attack?.querySelector('small')?.textContent.trim(),
      attack?.querySelector('b')?.textContent.trim()
    ].filter(Boolean).join(' · ');

    const attacks = [{
      id: 'beastform-attack',
      title: `${name} Attack`,
      type: 'attack',
      meta: attackMeta,
      body: `Use the active Beastform attack statistics shown here instead of Marek’s normal weapons while transformed.`
    }];

    const abilities = [...active.querySelectorAll('.beastform-features > div')].map((item, index) => ({
      id: `beastform-feature-${index}`,
      title: item.querySelector('b')?.textContent.trim() || 'Beastform feature',
      type: 'ability',
      meta: `${name} · Beastform`,
      body: item.querySelector('span')?.textContent.trim() || ''
    }));

    const advantages = [...active.querySelectorAll('.beastform-advantages b')].map(node => node.textContent.trim()).filter(Boolean);
    return { name, attacks, abilities, advantages };
  }

  function humanoidActions() {
    return {
      name: 'Marek',
      attacks: HUMANOID_ACTIONS.attacks.map(title => sheetAction(title, 'attack')).filter(Boolean),
      abilities: HUMANOID_ACTIONS.abilities.map(title => sheetAction(title, 'ability')).filter(Boolean),
      advantages: []
    };
  }

  function currentActions() {
    return beastformActions() || humanoidActions();
  }

  function ensurePanel() {
    if (!isMarek()) return null;
    const identity = document.querySelector('#characterSheet .character-sheet-identity');
    if (!identity) return null;
    let root = document.getElementById('activeActionsPanel');
    if (!root) {
      root = document.createElement('section');
      root.id = 'activeActionsPanel';
      root.className = 'active-actions-panel';
      root.setAttribute('aria-label', 'Active attacks and abilities');
      const beast = document.getElementById('beastformControl');
      const board = identity.querySelector('.pro-resource-board');
      if (beast) beast.insertAdjacentElement('afterend', root);
      else if (board) board.insertAdjacentElement('beforebegin', root);
      else identity.appendChild(root);
    }
    return root;
  }

  function actionButton(action) {
    const icon = action.type === 'attack' ? '⚔' : '✦';
    const label = action.type === 'attack' ? 'ACTIVE ATTACK' : 'ACTIVE ABILITY';
    return `<button type="button" class="active-action-card active-action-${action.type} ${selectedAction === action.id ? 'selected' : ''}" data-active-action="${esc(action.id)}">
      <span class="active-action-icon" aria-hidden="true">${icon}</span>
      <span class="active-action-copy"><small>${label}</small><strong>${esc(action.title)}</strong><em>${esc(action.meta)}</em></span>
      <span class="active-action-arrow" aria-hidden="true">›</span>
    </button>`;
  }

  function findAction(id, data) {
    return [...data.attacks, ...data.abilities].find(action => action.id === id) || null;
  }

  function detailMarkup(action) {
    if (!action) return '';
    const sourceButton = action.sourceTitle ? `<button type="button" class="active-action-source" data-open-source="${esc(action.id)}">Open full card</button>` : '';
    const beastformButton = action.title === 'Beastform' ? `<button type="button" class="active-action-source" data-open-beastform>Choose Beastform</button>` : '';
    return `<div class="active-action-detail">
      <div class="active-action-detail-mark" aria-hidden="true">${action.type === 'attack' ? '⚔' : '✦'}</div>
      <div class="active-action-detail-copy">
        <small>${action.type === 'attack' ? 'ATTACK' : 'ABILITY'} · AVAILABLE NOW</small>
        <h3>${esc(action.title)}</h3>
        ${action.meta ? `<p class="active-action-detail-meta">${esc(action.meta)}</p>` : ''}
        <p>${esc(action.body || 'No additional rules text is recorded on the current sheet.')}</p>
      </div>
      <div class="active-action-detail-tools">${sourceButton}${beastformButton}<button type="button" class="active-action-detail-close">Close</button></div>
    </div>`;
  }

  function render() {
    const root = ensurePanel();
    if (!root) return;
    const data = currentActions();
    if (selectedAction && !findAction(selectedAction, data)) selectedAction = null;
    const selected = findAction(selectedAction, data);

    root.innerHTML = `<div class="active-actions-head">
      <div><span>READY REFERENCE</span><strong>Active Actions</strong><small>${beastformActions() ? `${esc(data.name)} form · only currently usable actions are shown` : 'Marek · attacks and abilities available in humanoid form'}</small></div>
      <b>${data.attacks.length + data.abilities.length}</b>
    </div>
    <div class="active-actions-zone">
      <div class="active-actions-column active-actions-attacks"><div class="active-actions-label"><span>ATTACKS</span><small>Use now</small></div>${data.attacks.map(actionButton).join('')}</div>
      <div class="active-actions-column active-actions-abilities"><div class="active-actions-label"><span>ABILITIES</span><small>Use now</small></div>${data.abilities.map(actionButton).join('')}</div>
    </div>
    ${data.advantages.length ? `<div class="active-actions-advantages"><span>BEASTFORM ADVANTAGE</span>${data.advantages.map(a => `<b>${esc(a)}</b>`).join('')}</div>` : ''}
    ${detailMarkup(selected)}`;

    root.querySelectorAll('[data-active-action]').forEach(button => {
      button.addEventListener('click', () => {
        selectedAction = selectedAction === button.dataset.activeAction ? null : button.dataset.activeAction;
        render();
      });
    });

    root.querySelector('.active-action-detail-close')?.addEventListener('click', () => {
      selectedAction = null;
      render();
    });

    root.querySelector('[data-open-beastform]')?.addEventListener('click', () => {
      document.getElementById('chooseBeastform')?.click();
      document.getElementById('changeBeastform')?.click();
    });

    root.querySelectorAll('[data-open-source]').forEach(button => {
      button.addEventListener('click', () => {
        const action = findAction(button.dataset.openSource, data);
        if (!action?.sourceTitle) return;
        const tabName = action.sourceGroup === 'Weapons, armor & inventory' ? 'gear' : 'abilities';
        document.querySelector(`[data-sheet-tab="${tabName}"]`)?.click();
        setTimeout(() => {
          const card = sheetCard(action.sourceTitle);
          if (card) {
            card.open = true;
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 80);
      });
    });
  }

  function observeBeastform() {
    const beast = document.getElementById('beastformControl');
    if (!beast || beast === observedBeastform) return;
    beastformObserver?.disconnect();
    observedBeastform = beast;
    beastformObserver = new MutationObserver(() => {
      selectedAction = null;
      render();
    });
    beastformObserver.observe(beast, { childList: true, subtree: true, characterData: true });
  }

  function init() {
    if (!isMarek()) return;
    if (!document.querySelector('#characterSheet .character-sheet-shell')) return;
    ensurePanel();
    observeBeastform();
    render();
  }

  let timer;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(init, 140); };
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:sheet-enhanced', schedule);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
})();

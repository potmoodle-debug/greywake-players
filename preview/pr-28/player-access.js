(() => {
  const STORAGE_KEY = 'greywake-player-view-v1';
  const USERS = {
    martin: { label: 'Martin', character: 'Marek', code: 'MAREK', role: 'player' },
    carla: { label: 'Carla', character: 'Velmira', code: 'VELMIRA', role: 'player' },
    ritchie: { label: 'Ritchie', character: 'Odie', code: 'ODIE', role: 'player' },
    gm: { label: 'GM', character: 'GM', code: 'GREYWAKE', role: 'gm' }
  };

  let gmPreviewKey = null;

  function current() {
    const key = localStorage.getItem(STORAGE_KEY);
    return key && USERS[key] ? { key, ...USERS[key] } : null;
  }

  function setCurrent(key) {
    if (!USERS[key]) return;
    localStorage.setItem(STORAGE_KEY, key);
    gmPreviewKey = null;
    applyView({ key, ...USERS[key] });
  }

  function clearCurrent() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function ownerIsGM() {
    return localStorage.getItem(STORAGE_KEY) === 'gm';
  }

  function returnToGM() {
    if (!ownerIsGM()) return;
    gmPreviewKey = null;
    applyView({ key: 'gm', ...USERS.gm });
  }

  function renderIdentity(user) {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    let wrap = document.getElementById('playerIdentity');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'playerIdentity';
      wrap.className = 'player-identity';
      topbar.insertBefore(wrap, document.getElementById('brainBtn'));
    }

    const previewing = ownerIsGM() && gmPreviewKey;
    if (previewing) {
      wrap.innerHTML = `<span>GM preview</span><strong>${user.character}</strong><button type="button" id="switchPlayer">Full GM</button>`;
      document.getElementById('switchPlayer').addEventListener('click', returnToGM);
    } else if (ownerIsGM()) {
      wrap.innerHTML = `<span>GM</span><strong>Full view</strong><button type="button" id="switchPlayer">Switch</button>`;
      document.getElementById('switchPlayer').addEventListener('click', clearCurrent);
    } else {
      wrap.innerHTML = `<span>${user.label}</span><strong>${user.character}</strong><button type="button" id="switchPlayer">Switch</button>`;
      document.getElementById('switchPlayer').addEventListener('click', clearCurrent);
    }
  }

  function renderGMPreviewBar() {
    let bar = document.getElementById('gmPreviewBar');
    if (!ownerIsGM()) {
      if (bar) bar.remove();
      return;
    }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'gmPreviewBar';
      bar.className = 'gm-preview-bar';
      document.body.appendChild(bar);
    }

    const active = gmPreviewKey || 'gm';
    bar.innerHTML = `
      <span class="gm-preview-label">Preview as</span>
      <button data-preview="martin" class="${active === 'martin' ? 'active' : ''}">Marek</button>
      <button data-preview="carla" class="${active === 'carla' ? 'active' : ''}">Velmira</button>
      <button data-preview="ritchie" class="${active === 'ritchie' ? 'active' : ''}">Odie</button>
      <button data-preview="gm" class="${active === 'gm' ? 'active' : ''}">Full GM</button>`;

    bar.querySelectorAll('[data-preview]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preview;
        gmPreviewKey = key === 'gm' ? null : key;
        applyView({ key, ...USERS[key] });
      });
    });
  }

  function applyView(user) {
    const effectiveUser = user;
    const isPreview = ownerIsGM() && gmPreviewKey;

    document.body.dataset.player = effectiveUser.key;
    document.body.dataset.character = effectiveUser.character.toLowerCase();
    document.body.dataset.role = effectiveUser.role;
    document.body.dataset.gmPreview = isPreview ? 'true' : 'false';

    const safeMark = document.querySelector('.safe-mark');
    if (safeMark) safeMark.textContent = isPreview
      ? `GM preview · ${effectiveUser.character}`
      : effectiveUser.role === 'gm'
        ? 'GM view · all campaign layers'
        : `${effectiveUser.character} · personal archive`;

    const sidebarFoot = document.querySelector('.sidebar-foot');
    if (sidebarFoot) sidebarFoot.textContent = isPreview
      ? `Exact player-facing preview for ${effectiveUser.character}. GM-only and other-character material is hidden.`
      : effectiveUser.role === 'gm'
        ? 'GM view can include shared, personal and GM-only material.'
        : `Shared party knowledge plus material intended for ${effectiveUser.character}.`;

    renderIdentity(effectiveUser);
    renderGMPreviewBar();

    const oldPanel = document.getElementById('personalWelcome');
    if (oldPanel) oldPanel.remove();
    const heroCopy = document.querySelector('.hero-copy');
    if (heroCopy) {
      const panel = document.createElement('div');
      panel.id = 'personalWelcome';
      panel.className = 'personal-welcome';
      panel.innerHTML = isPreview
        ? `<div class="eyebrow">GM PREVIEW</div><strong>You are seeing ${effectiveUser.character}’s site.</strong><p>This hides information that ${effectiveUser.character} should not see. Use the preview bar to move between player perspectives.</p>`
        : effectiveUser.role === 'gm'
          ? `<div class="eyebrow">GM VIEW</div><strong>All player perspectives available.</strong><p>Use the preview bar to see the site exactly as Marek, Velmira or Odie sees it.</p>`
          : `<div class="eyebrow">YOUR GREYWAKE</div><strong>Welcome back, ${effectiveUser.character}.</strong><p>This view can contain details known to ${effectiveUser.character} that are not shown to the rest of the party.</p>`;
      heroCopy.appendChild(panel);
    }

    document.querySelectorAll('[data-visible-to]').forEach(el => {
      const allowed = el.dataset.visibleTo.split(',').map(v => v.trim().toLowerCase());
      const show = effectiveUser.role === 'gm' || allowed.includes('party') || allowed.includes(effectiveUser.key) || allowed.includes(effectiveUser.character.toLowerCase());
      el.classList.toggle('access-hidden', !show);
    });

    window.GreywakePlayer = effectiveUser;
    window.dispatchEvent(new CustomEvent('greywake:player-ready', { detail: effectiveUser }));
  }

  function showGate() {
    const shell = document.querySelector('.shell');
    shell?.setAttribute('inert', '');
    shell?.setAttribute('aria-hidden', 'true');
    const gate = document.createElement('div');
    gate.className = 'player-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'playerGateTitle');
    gate.setAttribute('aria-describedby', 'playerGateDescription');
    gate.innerHTML = `
      <div class="player-gate-card">
        <div class="tower-mark gate-tower"></div>
        <div class="eyebrow">GREYWAKE PLAYER ARCHIVE</div>
        <h1 id="playerGateTitle">Who is entering?</h1>
        <p id="playerGateDescription">Choose your name, then enter your character name as the access code.</p>
        <div class="player-choice-grid">
          <button type="button" data-user="martin"><strong>Martin</strong><span>Marek</span></button>
          <button type="button" data-user="carla"><strong>Carla</strong><span>Velmira</span></button>
          <button type="button" data-user="ritchie"><strong>Ritchie</strong><span>Odie</span></button>
          <button type="button" data-user="gm"><strong>GM</strong><span>Campaign view</span></button>
        </div>
        <form id="playerCodeForm" class="player-code-form hidden">
          <div id="chosenPlayer" class="chosen-player"></div>
          <label for="playerCode">Access code</label>
          <input id="playerCode" autocomplete="off" autocapitalize="characters" spellcheck="false" required>
          <button type="submit">Enter Greywake</button>
          <div id="codeError" class="code-error" aria-live="polite"></div>
        </form>
      </div>`;
    document.body.appendChild(gate);

    let selected = null;
    gate.querySelectorAll('[data-user]').forEach(btn => {
      btn.addEventListener('click', () => {
        selected = btn.dataset.user;
        gate.querySelectorAll('[data-user]').forEach(b => b.classList.toggle('selected', b === btn));
        const form = document.getElementById('playerCodeForm');
        form.classList.remove('hidden');
        document.getElementById('chosenPlayer').textContent = USERS[selected].label + ' · ' + USERS[selected].character;
        const input = document.getElementById('playerCode');
        input.value = '';
        input.focus();
        document.getElementById('codeError').textContent = '';
      });
    });

    document.getElementById('playerCodeForm').addEventListener('submit', event => {
      event.preventDefault();
      if (!selected) return;
      const input = document.getElementById('playerCode');
      const typed = input.value.trim().toUpperCase();
      if (typed === USERS[selected].code) {
        shell?.removeAttribute('inert');
        shell?.removeAttribute('aria-hidden');
        gate.remove();
        setCurrent(selected);
      } else {
        document.getElementById('codeError').textContent = 'That code does not match this player.';
        input.select();
      }
    });

    gate.querySelector('[data-user]')?.focus();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const user = current();
    if (user) applyView(user);
    else showGate();
  });
})();

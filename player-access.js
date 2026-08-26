(() => {
  const STORAGE_KEY = 'greywake-player-view-v1';
  const USERS = {
    martin: { label: 'Martin', character: 'Marek', code: 'MAREK', role: 'player' },
    carla: { label: 'Carla', character: 'Velmira', code: 'VELMIRA', role: 'player' },
    ritchie: { label: 'Ritchie', character: 'Odie', code: 'ODIE', role: 'player' },
    gm: { label: 'GM', character: 'GM', code: 'GREYWAKE', role: 'gm' }
  };

  function current() {
    const key = localStorage.getItem(STORAGE_KEY);
    return key && USERS[key] ? { key, ...USERS[key] } : null;
  }

  function setCurrent(key) {
    if (!USERS[key]) return;
    localStorage.setItem(STORAGE_KEY, key);
    applyView({ key, ...USERS[key] });
  }

  function clearCurrent() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function applyView(user) {
    document.body.dataset.player = user.key;
    document.body.dataset.character = user.character.toLowerCase();
    document.body.dataset.role = user.role;

    const safeMark = document.querySelector('.safe-mark');
    if (safeMark) safeMark.textContent = user.role === 'gm' ? 'GM view · all campaign layers' : `${user.character} · personal archive`;

    const sidebarFoot = document.querySelector('.sidebar-foot');
    if (sidebarFoot) sidebarFoot.textContent = user.role === 'gm'
      ? 'GM view can include shared, personal and GM-only material.'
      : `Shared party knowledge plus material intended for ${user.character}.`;

    const topbar = document.querySelector('.topbar');
    if (topbar && !document.getElementById('playerIdentity')) {
      const wrap = document.createElement('div');
      wrap.id = 'playerIdentity';
      wrap.className = 'player-identity';
      wrap.innerHTML = `<span>${user.label}</span><strong>${user.character}</strong><button type="button" id="switchPlayer">Switch</button>`;
      topbar.insertBefore(wrap, document.getElementById('brainBtn'));
      document.getElementById('switchPlayer').addEventListener('click', clearCurrent);
    }

    const heroCopy = document.querySelector('.hero-copy');
    if (heroCopy && !document.getElementById('personalWelcome')) {
      const panel = document.createElement('div');
      panel.id = 'personalWelcome';
      panel.className = 'personal-welcome';
      panel.innerHTML = user.role === 'gm'
        ? `<div class="eyebrow">GM VIEW</div><strong>All player perspectives available.</strong><p>Use the player switcher to preview what each person will see.</p>`
        : `<div class="eyebrow">YOUR GREYWAKE</div><strong>Welcome back, ${user.character}.</strong><p>This view can contain details known to ${user.character} that are not shown to the rest of the party.</p>`;
      heroCopy.appendChild(panel);
    }

    document.querySelectorAll('[data-visible-to]').forEach(el => {
      const allowed = el.dataset.visibleTo.split(',').map(v => v.trim().toLowerCase());
      const show = user.role === 'gm' || allowed.includes('party') || allowed.includes(user.key) || allowed.includes(user.character.toLowerCase());
      el.classList.toggle('access-hidden', !show);
    });

    window.GreywakePlayer = user;
    window.dispatchEvent(new CustomEvent('greywake:player-ready', { detail: user }));
  }

  function showGate() {
    const gate = document.createElement('div');
    gate.className = 'player-gate';
    gate.innerHTML = `
      <div class="player-gate-card">
        <div class="tower-mark gate-tower"></div>
        <div class="eyebrow">GREYWAKE PLAYER ARCHIVE</div>
        <h1>Who is entering?</h1>
        <p>Choose your name, then enter your character name as the access code.</p>
        <div class="player-choice-grid">
          <button data-user="martin"><strong>Martin</strong><span>Marek</span></button>
          <button data-user="carla"><strong>Carla</strong><span>Velmira</span></button>
          <button data-user="ritchie"><strong>Ritchie</strong><span>Odie</span></button>
          <button data-user="gm"><strong>GM</strong><span>Campaign view</span></button>
        </div>
        <form id="playerCodeForm" class="player-code-form hidden">
          <div id="chosenPlayer" class="chosen-player"></div>
          <label>Access code<input id="playerCode" autocomplete="off" spellcheck="false" required></label>
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
        gate.remove();
        setCurrent(selected);
      } else {
        document.getElementById('codeError').textContent = 'That code does not match this player.';
        input.select();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const user = current();
    if (user) applyView(user);
    else showGate();
  });
})();

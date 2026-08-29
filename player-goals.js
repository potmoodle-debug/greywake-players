(() => {
  const STORAGE_PREFIX = 'greywake-player-goals-v1:';
  const MAX_GOALS = 5;
  const MAX_LENGTH = 140;

  function keyFor(user) {
    return STORAGE_PREFIX + (user?.character || 'unknown').toLowerCase();
  }

  function load(user) {
    try {
      const parsed = JSON.parse(localStorage.getItem(keyFor(user)) || '[]');
      return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string').slice(0, MAX_GOALS) : [];
    } catch (_) {
      return [];
    }
  }

  function save(user, goals) {
    localStorage.setItem(keyFor(user), JSON.stringify(goals.slice(0, MAX_GOALS)));
  }

  function esc(text) {
    return text.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function render(user) {
    const host = document.getElementById('playerGoals');
    if (!host) return;

    if (user.role === 'gm') {
      host.innerHTML = `
        <div class="section-head player-goals-head">
          <div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>What the players want to do</h2></div>
          <p>Player goals are stored in each player’s browser in this first version, so the GM view cannot read them yet. Ask players to mention anything they add until shared sync is enabled.</p>
        </div>
        <div class="goals-empty gm-goals-note"><strong>Prep rule:</strong> player-stated goals outrank GM-generated possibilities.</div>`;
      return;
    }

    let goals = load(user);

    const draw = () => {
      const list = goals.length
        ? `<div class="goal-list">${goals.map((goal, i) => `<article class="goal-card"><div><span>I'D LIKE TO…</span><p>${esc(goal)}</p></div><button type="button" data-remove-goal="${i}" aria-label="Remove goal">×</button></article>`).join('')}</div>`
        : `<div class="goals-empty">Nothing added yet. You do not need to pick from the possibilities below — you can write your own direction here.</div>`;

      host.innerHTML = `
        <div class="section-head player-goals-head">
          <div><div class="eyebrow">YOUR DIRECTION</div><h2>What do you want to do?</h2></div>
          <p>This is not a promise or a quest choice. It tells the GM what currently interests ${esc(user.character)} so preparation can follow player intent.</p>
        </div>
        ${list}
        <form id="goalForm" class="goal-form">
          <label for="goalInput">Add an interest, question or goal</label>
          <div class="goal-input-row"><input id="goalInput" maxlength="${MAX_LENGTH}" placeholder="e.g. Find out why the animals have stopped using the western route"><button type="submit" ${goals.length >= MAX_GOALS ? 'disabled' : ''}>Add</button></div>
          <div class="goal-hint">${goals.length}/${MAX_GOALS} saved on this device · keep it short and change it whenever your interests change</div>
        </form>`;

      host.querySelectorAll('[data-remove-goal]').forEach(btn => {
        btn.addEventListener('click', () => {
          goals.splice(Number(btn.dataset.removeGoal), 1);
          save(user, goals);
          draw();
        });
      });

      const form = document.getElementById('goalForm');
      form?.addEventListener('submit', event => {
        event.preventDefault();
        if (goals.length >= MAX_GOALS) return;
        const input = document.getElementById('goalInput');
        const value = input.value.trim().replace(/\s+/g, ' ');
        if (value.length < 3) return;
        goals.push(value.slice(0, MAX_LENGTH));
        save(user, goals);
        draw();
      });
    };

    draw();
  }

  window.addEventListener('greywake:player-ready', event => render(event.detail));
  document.addEventListener('DOMContentLoaded', () => {
    if (window.GreywakePlayer) render(window.GreywakePlayer);
  });
})();
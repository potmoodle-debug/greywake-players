(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const LOCAL_PREFIX = 'greywake-player-goals-v1:';
  const MAX_GOALS = 5;
  const MAX_LENGTH = 240;
  const CHARACTER_NAMES = { marek: 'Marek', velmira: 'Velmira', odie: 'Odie' };

  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function characterKey(user) {
    const fromBody = (document.body.dataset.character || '').toLowerCase();
    if (CHARACTER_NAMES[fromBody]) return fromBody;
    const fromUser = (user?.character || '').toLowerCase();
    return CHARACTER_NAMES[fromUser] ? fromUser : null;
  }

  function isFullGM(user) {
    return user?.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function identityFor(user) {
    if (isFullGM(user)) return { character: 'gm', code: 'GREYWAKE' };
    const key = characterKey(user);
    return { character: key, code: String(user?.code || CHARACTER_NAMES[key] || '').toUpperCase() };
  }

  async function request(user, method = 'GET', body = null) {
    const identity = identityFor(user);
    if (!identity.character || !identity.code) throw new Error('Greywake player identity is unavailable.');
    const response = await fetch(API_URL, {
      method,
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json',
        'x-greywake-character': identity.character,
        'x-greywake-code': identity.code
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Greywake could not save that goal.');
    return data;
  }

  function loadOldLocalGoals(user) {
    const key = characterKey(user);
    if (!key) return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(LOCAL_PREFIX + key) || '[]');
      return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string').map(x => x.trim()).filter(Boolean) : [];
    } catch (_) {
      return [];
    }
  }

  async function migrateOldLocalGoals(user, serverGoals) {
    if (isFullGM(user) || document.body.dataset.gmPreview === 'true') return serverGoals;
    const key = characterKey(user);
    const oldGoals = loadOldLocalGoals(user);
    if (!key || !oldGoals.length) return serverGoals;

    const existing = new Set(serverGoals.map(g => g.goal_text.toLowerCase()));
    let current = [...serverGoals];
    for (const oldGoal of oldGoals) {
      if (current.filter(g => ['open','pursuing'].includes(g.status)).length >= MAX_GOALS) break;
      if (existing.has(oldGoal.toLowerCase())) continue;
      try {
        const result = await request(user, 'POST', { goal: oldGoal.slice(0, MAX_LENGTH) });
        if (result.goal) {
          current.unshift(result.goal);
          existing.add(oldGoal.toLowerCase());
        }
      } catch (_) {
        break;
      }
    }
    localStorage.removeItem(LOCAL_PREFIX + key);
    return current;
  }

  function statusLabel(status) {
    return ({ open: 'PLAYER INTEREST', pursuing: 'PURSUING', dormant: 'DORMANT', done: 'RESOLVED' })[status] || String(status || '').toUpperCase();
  }

  function playerGoalCard(goal, resolved = false) {
    return `<article class="goal-card${resolved ? ' goal-card-resolved' : ''}" data-goal-id="${goal.id}">
      <div>
        <span>${statusLabel(goal.status)}</span>
        <p>${esc(goal.goal_text)}</p>
      </div>
      ${resolved
        ? `<button type="button" class="goal-reopen" data-reopen-goal="${goal.id}" aria-label="Reopen goal">Reopen</button>`
        : `<button type="button" data-remove-goal="${goal.id}" aria-label="Remove goal">×</button>`}
    </article>`;
  }

  function gmGoalCard(goal) {
    const actions = goal.status === 'done'
      ? `<button type="button" data-goal-status="open" data-goal-id="${goal.id}">Reopen</button>`
      : `${goal.status !== 'open' ? `<button type="button" data-goal-status="open" data-goal-id="${goal.id}">Mark Player Interest</button>` : ''}
         ${goal.status !== 'pursuing' ? `<button type="button" data-goal-status="pursuing" data-goal-id="${goal.id}">Mark Pursuing</button>` : ''}
         ${goal.status !== 'dormant' ? `<button type="button" data-goal-status="dormant" data-goal-id="${goal.id}">Mark Dormant</button>` : ''}
         <button type="button" data-goal-status="done" data-goal-id="${goal.id}">Mark Resolved</button>`;

    return `<article class="goal-card gm-goal-card${goal.status === 'done' ? ' goal-card-resolved' : ''}" data-goal-id="${goal.id}">
      <div>
        <span>${esc(CHARACTER_NAMES[goal.character_slug] || goal.character_slug)} · ${statusLabel(goal.status)}</span>
        <p>${esc(goal.goal_text)}</p>
        <div class="gm-goal-actions">${actions}</div>
      </div>
    </article>`;
  }

  function activeGoals(goals) { return goals.filter(g => g.status !== 'done'); }
  function resolvedGoals(goals) { return goals.filter(g => g.status === 'done'); }

  async function render(user) {
    const host = document.getElementById('playerGoals');
    if (!host) return;

    host.innerHTML = `<div class="section-head player-goals-head"><div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>Loading player goals…</h2></div><p>Checking the shared Greywake campaign record.</p></div>`;

    try {
      const result = await request(user, 'GET');
      let goals = Array.isArray(result.goals) ? result.goals : [];
      goals = await migrateOldLocalGoals(user, goals);

      if (isFullGM(user)) {
        const grouped = ['marek','velmira','odie'].map(key => {
          const characterGoals = goals.filter(g => g.character_slug === key);
          const current = activeGoals(characterGoals);
          const resolved = resolvedGoals(characterGoals);
          const currentCards = current.length
            ? `<div class="goal-list">${current.map(gmGoalCard).join('')}</div>`
            : `<div class="goals-empty">${CHARACTER_NAMES[key]} has no current goals or questions.</div>`;
          const resolvedCards = resolved.length
            ? `<details class="resolved-goals"><summary>Resolved / answered (${resolved.length})</summary><div class="goal-list">${resolved.map(gmGoalCard).join('')}</div></details>`
            : '';
          return `<section class="gm-goal-group"><div class="eyebrow">${CHARACTER_NAMES[key].toUpperCase()}</div><h3>${CHARACTER_NAMES[key]}'s stated interests</h3>${currentCards}${resolvedCards}</section>`;
        }).join('');

        host.innerHTML = `
          <div class="section-head player-goals-head">
            <div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>What the players want to do</h2></div>
            <p>The label on each card is its current state. The buttons below it change that state. Resolved items stay in the record.</p>
          </div>
          ${grouped}`;

        host.querySelectorAll('[data-goal-status]').forEach(btn => {
          btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
              await request(user, 'PATCH', { id: Number(btn.dataset.goalId), status: btn.dataset.goalStatus });
              await render(user);
            } catch (error) {
              btn.disabled = false;
              alert(error.message);
            }
          });
        });
        return;
      }

      const key = characterKey(user);
      goals = goals.filter(g => g.character_slug === key);
      const current = activeGoals(goals);
      const resolved = resolvedGoals(goals);
      const isPreview = document.body.dataset.gmPreview === 'true';
      const list = current.length
        ? `<div class="goal-list">${current.map(g => playerGoalCard(g, false)).join('')}</div>`
        : `<div class="goals-empty">Nothing current yet. You do not need to pick from the possibilities below — you can write your own direction here.</div>`;
      const resolvedSection = resolved.length
        ? `<details class="resolved-goals"><summary>Resolved / answered (${resolved.length})</summary><div class="goal-list">${resolved.map(g => playerGoalCard(g, true)).join('')}</div></details>`
        : '';

      host.innerHTML = `
        <div class="section-head player-goals-head">
          <div><div class="eyebrow">YOUR DIRECTION</div><h2>What do you want to do?</h2></div>
          <p>${isPreview ? `GM preview of ${esc(user.character)}'s centrally saved interests.` : `This tells the GM what currently interests ${esc(user.character)} so preparation can follow player intent.`}</p>
        </div>
        ${list}
        ${resolvedSection}
        ${isPreview ? `<div class="goal-hint">GM preview · changes should normally be made from the player's own view</div>` : `
        <form id="goalForm" class="goal-form">
          <label for="goalInput">Add an interest, question or goal</label>
          <div class="goal-input-row"><input id="goalInput" maxlength="${MAX_LENGTH}" placeholder="e.g. Find out why the animals have stopped using the western route"><button type="submit" ${current.filter(g => ['open','pursuing'].includes(g.status)).length >= MAX_GOALS ? 'disabled' : ''}>Add</button></div>
          <div class="goal-hint">${current.filter(g => ['open','pursuing'].includes(g.status)).length}/${MAX_GOALS} active · saved to the shared Greywake campaign record for the GM to see</div>
        </form>`}`;

      if (!isPreview) {
        host.querySelectorAll('[data-remove-goal]').forEach(btn => {
          btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
              await request(user, 'DELETE', { id: Number(btn.dataset.removeGoal) });
              await render(user);
            } catch (error) {
              btn.disabled = false;
              alert(error.message);
            }
          });
        });

        host.querySelectorAll('[data-reopen-goal]').forEach(btn => {
          btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
              await request(user, 'PATCH', { id: Number(btn.dataset.reopenGoal), status: 'open' });
              await render(user);
            } catch (error) {
              btn.disabled = false;
              alert(error.message);
            }
          });
        });

        const form = document.getElementById('goalForm');
        form?.addEventListener('submit', async event => {
          event.preventDefault();
          const input = document.getElementById('goalInput');
          const submit = form.querySelector('button[type="submit"]');
          const value = input.value.trim().replace(/\s+/g, ' ');
          if (value.length < 3) return;
          submit.disabled = true;
          try {
            await request(user, 'POST', { goal: value.slice(0, MAX_LENGTH) });
            await render(user);
          } catch (error) {
            submit.disabled = false;
            alert(error.message);
          }
        });
      }
    } catch (error) {
      host.innerHTML = `
        <div class="section-head player-goals-head"><div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>Player goals unavailable</h2></div></div>
        <div class="goals-empty"><strong>Nothing has been lost.</strong> ${esc(error.message)} Refresh the page to try again.</div>`;
    }
  }

  window.addEventListener('greywake:player-ready', event => render(event.detail));
  document.addEventListener('DOMContentLoaded', () => {
    if (window.GreywakePlayer) render(window.GreywakePlayer);
  });
})();
(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const LOCAL_PREFIX = 'greywake-player-goals-v1:';
  const MAX_GOALS = 5;
  const MAX_LENGTH = 240;
  const MAX_REPLY_LENGTH = 1200;
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
    if (!response.ok) throw new Error(data.error || 'Greywake could not save that change.');
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

  function threadStateLabel(state) {
    return ({
      waiting_player: 'WAITING ON PLAYER',
      waiting_gm: 'WAITING ON GM',
      play_at_table: 'PLAY AT TABLE',
      resolved: 'RESOLVED'
    })[state] || 'WAITING ON GM';
  }

  function messageLabel(message, playerName) {
    if (message.author_role === 'player') return `${playerName.toUpperCase()} · REPLY`;
    if (message.message_kind === 'lead') return 'GM · NEW LEAD';
    if (message.message_kind === 'table') return 'GM · PLAY AT TABLE';
    return 'GM · REPLY';
  }

  function threadMessages(goal, allMessages) {
    return allMessages.filter(message => Number(message.goal_id) === Number(goal.id));
  }

  function conversationMarkup(goal, messages, playerName) {
    const replies = threadMessages(goal, messages).map(message => `
      <div class="interest-message ${message.author_role === 'gm' ? 'interest-message-gm' : 'interest-message-player'} ${message.message_kind === 'lead' ? 'interest-message-lead' : ''} ${message.message_kind === 'table' ? 'interest-message-table' : ''}">
        <span>${esc(messageLabel(message, playerName))}</span>
        <p>${esc(message.message_text)}</p>
      </div>`).join('');

    return `<div class="interest-conversation">
      <div class="interest-message interest-message-player interest-message-opening">
        <span>${esc(playerName.toUpperCase())} · PLAYER INTEREST</span>
        <p>${esc(goal.goal_text)}</p>
      </div>
      ${replies}
    </div>`;
  }

  function waitingBanner(goal) {
    const state = goal.thread_state || (goal.status === 'done' ? 'resolved' : 'waiting_gm');
    const copy = {
      waiting_player: 'The GM has replied. The next move is yours whenever you want to answer.',
      waiting_gm: 'Your latest message is with the GM. You can add another thought if you need to.',
      play_at_table: 'This thread has reached a point that should be played during a game session. It will be picked up at the table.',
      resolved: 'This interest is closed for now. It remains in your record and can be reopened.'
    }[state] || '';
    return `<div class="interest-waiting interest-waiting-${esc(state)}"><strong>${esc(threadStateLabel(state))}</strong><span>${esc(copy)}</span></div>`;
  }

  function playerThreadCard(goal, messages, user, resolved = false, isPreview = false) {
    const playerName = CHARACTER_NAMES[goal.character_slug] || user.character || goal.character_slug;
    const canReply = !resolved && goal.thread_state !== 'play_at_table' && !isPreview;
    return `<article class="interest-thread${resolved ? ' interest-thread-resolved' : ''}" data-goal-id="${goal.id}">
      <div class="interest-thread-head">
        <div><span class="interest-status">${esc(statusLabel(goal.status))}</span><h3>${esc(goal.goal_text)}</h3></div>
        <span class="interest-waiting-pill">${esc(threadStateLabel(goal.thread_state))}</span>
      </div>
      ${conversationMarkup(goal, messages, playerName)}
      ${waitingBanner(goal)}
      ${canReply ? `<form class="interest-reply-form" data-player-reply="${goal.id}">
        <label for="playerReply-${goal.id}">Reply to this interest</label>
        <textarea id="playerReply-${goal.id}" maxlength="${MAX_REPLY_LENGTH}" rows="3" placeholder="What does ${esc(playerName)} ask, think, investigate or want to do next?"></textarea>
        <div class="interest-reply-actions"><button type="submit">Send reply</button><span>The GM will see this between games.</span></div>
      </form>` : ''}
      ${resolved && !isPreview ? `<button type="button" class="interest-reopen" data-reopen-goal="${goal.id}">Reopen this interest</button>` : ''}
      ${!resolved && !isPreview ? `<button type="button" class="interest-close-player" data-close-player-goal="${goal.id}">Close this interest</button>` : ''}
    </article>`;
  }

  function gmStatusActions(goal) {
    if (goal.status === 'done') return `<button type="button" data-goal-status="open" data-goal-id="${goal.id}">Reopen</button>`;
    return `${goal.status !== 'open' ? `<button type="button" data-goal-status="open" data-goal-id="${goal.id}">Player Interest</button>` : ''}
      ${goal.status !== 'pursuing' ? `<button type="button" data-goal-status="pursuing" data-goal-id="${goal.id}">Pursuing</button>` : ''}
      ${goal.status !== 'dormant' ? `<button type="button" data-goal-status="dormant" data-goal-id="${goal.id}">Dormant</button>` : ''}`;
  }

  function gmThreadCard(goal, messages) {
    const playerName = CHARACTER_NAMES[goal.character_slug] || goal.character_slug;
    const resolved = goal.status === 'done';
    return `<article class="interest-thread gm-interest-thread${resolved ? ' interest-thread-resolved' : ''}" data-goal-id="${goal.id}">
      <div class="interest-thread-head">
        <div><span class="interest-status">${esc(playerName.toUpperCase())} · ${esc(statusLabel(goal.status))}</span><h3>${esc(goal.goal_text)}</h3></div>
        <span class="interest-waiting-pill">${esc(threadStateLabel(goal.thread_state))}</span>
      </div>
      ${conversationMarkup(goal, messages, playerName)}
      ${waitingBanner(goal)}
      ${!resolved ? `<form class="gm-interest-reply" data-gm-reply="${goal.id}">
        <label for="gmReply-${goal.id}">Reply to ${esc(playerName)}</label>
        <textarea id="gmReply-${goal.id}" maxlength="${MAX_REPLY_LENGTH}" rows="3" placeholder="Reply, give a lead, or leave this blank and send it to the table."></textarea>
        <div class="gm-thread-actions">
          <button type="button" data-send-kind="reply">Reply</button>
          <button type="button" data-send-kind="lead">Give Lead</button>
          <button type="button" data-send-kind="table">Play at Table</button>
          <button type="button" class="gm-thread-close" data-close-thread="${goal.id}">Close Thread</button>
        </div>
      </form>` : ''}
      <div class="gm-interest-state"><span>Interest state</span><div class="gm-goal-actions">${gmStatusActions(goal)}</div></div>
    </article>`;
  }

  function activeGoals(goals) { return goals.filter(g => g.status !== 'done'); }
  function resolvedGoals(goals) { return goals.filter(g => g.status === 'done'); }

  function attachStatusActions(host, user) {
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
  }

  function attachGMReplyActions(host, user) {
    host.querySelectorAll('[data-gm-reply]').forEach(form => {
      const goalId = Number(form.dataset.gmReply);
      const textarea = form.querySelector('textarea');
      form.querySelectorAll('[data-send-kind]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const kind = btn.dataset.sendKind;
          let message = textarea.value.trim().replace(/\s+/g, ' ');
          if (kind === 'table' && !message) {
            message = 'This has reached a point that should be played at the table. We will pick it up during a game session.';
          }
          if (!message) {
            textarea.focus();
            return;
          }
          form.querySelectorAll('button').forEach(button => { button.disabled = true; });
          try {
            await request(user, 'POST', { goal_id: goalId, message: message.slice(0, MAX_REPLY_LENGTH), kind });
            await render(user);
          } catch (error) {
            form.querySelectorAll('button').forEach(button => { button.disabled = false; });
            alert(error.message);
          }
        });
      });
    });

    host.querySelectorAll('[data-close-thread]').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await request(user, 'PATCH', { id: Number(btn.dataset.closeThread), status: 'done' });
          await render(user);
        } catch (error) {
          btn.disabled = false;
          alert(error.message);
        }
      });
    });
  }

  function attachPlayerActions(host, user) {
    host.querySelectorAll('[data-player-reply]').forEach(form => {
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const textarea = form.querySelector('textarea');
        const submit = form.querySelector('button[type="submit"]');
        const message = textarea.value.trim().replace(/\s+/g, ' ');
        if (!message) return;
        submit.disabled = true;
        try {
          await request(user, 'POST', { goal_id: Number(form.dataset.playerReply), message: message.slice(0, MAX_REPLY_LENGTH), kind: 'reply' });
          await render(user);
        } catch (error) {
          submit.disabled = false;
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

    host.querySelectorAll('[data-close-player-goal]').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await request(user, 'PATCH', { id: Number(btn.dataset.closePlayerGoal), status: 'done' });
          await render(user);
        } catch (error) {
          btn.disabled = false;
          alert(error.message);
        }
      });
    });
  }

  async function render(user) {
    const host = document.getElementById('playerGoals');
    if (!host) return;

    host.innerHTML = `<div class="section-head player-goals-head"><div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>Loading player interests…</h2></div><p>Checking the shared Greywake campaign record.</p></div>`;

    try {
      const result = await request(user, 'GET');
      let goals = Array.isArray(result.goals) ? result.goals : [];
      const messages = Array.isArray(result.messages) ? result.messages : [];
      goals = await migrateOldLocalGoals(user, goals);

      if (isFullGM(user)) {
        const grouped = ['marek','velmira','odie'].map(key => {
          const characterGoals = goals.filter(g => g.character_slug === key);
          const current = activeGoals(characterGoals);
          const resolved = resolvedGoals(characterGoals);
          const currentCards = current.length
            ? `<div class="interest-thread-list">${current.map(goal => gmThreadCard(goal, messages)).join('')}</div>`
            : `<div class="goals-empty">${CHARACTER_NAMES[key]} has no current interests or questions.</div>`;
          const resolvedCards = resolved.length
            ? `<details class="resolved-goals"><summary>Resolved / closed (${resolved.length})</summary><div class="interest-thread-list">${resolved.map(goal => gmThreadCard(goal, messages)).join('')}</div></details>`
            : '';
          return `<section class="gm-goal-group"><div class="eyebrow">${CHARACTER_NAMES[key].toUpperCase()}</div><h3>${CHARACTER_NAMES[key]}'s player interests</h3>${currentCards}${resolvedCards}</section>`;
        }).join('');

        host.innerHTML = `
          <div class="section-head player-goals-head">
            <div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>Player Interest conversations</h2></div>
            <p>Reply between games, give a lead, or send a consequential moment to the table. Pursuing and Dormant remain separate from the conversation state.</p>
          </div>
          <div class="interest-legend"><span>WAITING ON GM</span><span>WAITING ON PLAYER</span><span>PLAY AT TABLE</span><span>RESOLVED</span></div>
          ${grouped}`;

        attachStatusActions(host, user);
        attachGMReplyActions(host, user);
        return;
      }

      const key = characterKey(user);
      goals = goals.filter(g => g.character_slug === key);
      const current = activeGoals(goals);
      const resolved = resolvedGoals(goals);
      const isPreview = document.body.dataset.gmPreview === 'true';
      const list = current.length
        ? `<div class="interest-thread-list">${current.map(goal => playerThreadCard(goal, messages, user, false, isPreview)).join('')}</div>`
        : `<div class="goals-empty">Nothing current yet. You do not need to pick from the possibilities below — you can write your own direction here.</div>`;
      const resolvedSection = resolved.length
        ? `<details class="resolved-goals"><summary>Resolved / closed (${resolved.length})</summary><div class="interest-thread-list">${resolved.map(goal => playerThreadCard(goal, messages, user, true, isPreview)).join('')}</div></details>`
        : '';

      host.innerHTML = `
        <div class="section-head player-goals-head">
          <div><div class="eyebrow">YOUR DIRECTION</div><h2>Player Interests</h2></div>
          <p>${isPreview ? `GM preview of ${esc(user.character)}'s centrally saved interests.` : `Use these threads between games. If a moment needs danger, uncertainty or an important scene, the GM can mark it Play at Table instead.`}</p>
        </div>
        ${list}
        ${resolvedSection}
        ${isPreview ? `<div class="goal-hint">GM preview · replies are disabled in preview mode</div>` : `
        <form id="goalForm" class="goal-form">
          <label for="goalInput">Start a new interest, question or goal</label>
          <div class="goal-input-row"><input id="goalInput" maxlength="${MAX_LENGTH}" placeholder="e.g. I heard about a flickerfly. I'd love to study one!"><button type="submit" ${current.filter(g => ['open','pursuing'].includes(g.status)).length >= MAX_GOALS ? 'disabled' : ''}>Add</button></div>
          <div class="goal-hint">${current.filter(g => ['open','pursuing'].includes(g.status)).length}/${MAX_GOALS} active · your GM can reply here between games</div>
        </form>`}`;

      if (!isPreview) {
        attachPlayerActions(host, user);
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
        <div class="section-head player-goals-head"><div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>Player Interests unavailable</h2></div></div>
        <div class="goals-empty"><strong>Nothing has been lost.</strong> ${esc(error.message)} Refresh the page to try again.</div>`;
    }
  }

  window.addEventListener('greywake:player-ready', event => render(event.detail));
  document.addEventListener('DOMContentLoaded', () => {
    if (window.GreywakePlayer) render(window.GreywakePlayer);
  });
})();
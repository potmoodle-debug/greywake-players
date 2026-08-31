(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const LOCAL_PREFIX = 'greywake-player-goals-v1:';
  const MAX_INTERESTS = 3;
  const MAX_LENGTH = 240;
  const MAX_REPLY_LENGTH = 1200;
  const CHARACTER_NAMES = { marek: 'Marek', velmira: 'Velmira', odie: 'Odie' };

  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[ch]));
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
        apikey: API_KEY,
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

  function isQuestion(goal) {
    return goal?.entry_kind === 'question';
  }

  function activeInterestCount(goals) {
    return goals.filter(g => !isQuestion(g) && ['open', 'pursuing'].includes(g.status)).length;
  }

  async function migrateOldLocalGoals(user, serverGoals) {
    if (isFullGM(user) || document.body.dataset.gmPreview === 'true') return serverGoals;
    const key = characterKey(user);
    const oldGoals = loadOldLocalGoals(user);
    if (!key || !oldGoals.length) return serverGoals;

    const existing = new Set(serverGoals.map(g => g.goal_text.toLowerCase()));
    let current = [...serverGoals];
    for (const oldGoal of oldGoals) {
      if (activeInterestCount(current) >= MAX_INTERESTS) break;
      if (existing.has(oldGoal.toLowerCase())) continue;
      try {
        const result = await request(user, 'POST', { goal: oldGoal.slice(0, MAX_LENGTH), entry_kind: 'interest' });
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

  function statusLabel(goal) {
    if (goal.status === 'done') return 'RESOLVED';
    if (goal.status === 'pursuing') return 'PURSUING';
    if (goal.status === 'dormant') return 'DORMANT';
    return isQuestion(goal) ? 'QUESTION' : 'PLAYER INTEREST';
  }

  function threadStateLabel(state) {
    return ({ waiting_player: 'WAITING ON PLAYER', waiting_gm: 'WAITING ON GM', play_at_table: 'PLAY AT TABLE', resolved: 'RESOLVED' })[state] || 'WAITING ON GM';
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

  function sourceMarkup(goal) {
    if (!goal.source_title) return '';
    const route = String(goal.source_route || '');
    const source = route.startsWith('#/record/')
      ? `<button type="button" class="interest-source-link" data-engagement-route="${esc(route)}">${esc(goal.source_title)}</button>`
      : `<strong>${esc(goal.source_title)}</strong>`;
    return `<div class="interest-source"><span>${isQuestion(goal) ? 'Asked from' : 'Connected to'}</span>${source}</div>`;
  }

  function conversationMarkup(goal, messages, playerName) {
    const replies = threadMessages(goal, messages).map(message => `
      <div class="interest-message ${message.author_role === 'gm' ? 'interest-message-gm' : 'interest-message-player'} ${message.message_kind === 'lead' ? 'interest-message-lead' : ''} ${message.message_kind === 'table' ? 'interest-message-table' : ''}">
        <span>${esc(messageLabel(message, playerName))}</span><p>${esc(message.message_text)}</p>
      </div>`).join('');
    return `<div class="interest-conversation"><div class="interest-message interest-message-player interest-message-opening"><span>${esc(playerName.toUpperCase())} · ${isQuestion(goal) ? 'QUESTION' : 'PLAYER INTEREST'}</span><p>${esc(goal.goal_text)}</p></div>${replies}</div>`;
  }

  function waitingBanner(goal) {
    const state = goal.thread_state || (goal.status === 'done' ? 'resolved' : 'waiting_gm');
    const copy = {
      waiting_player: 'The GM has replied. The next move is yours whenever you want to answer.',
      waiting_gm: 'Your latest message is with the GM. You can add another thought if you need to.',
      play_at_table: 'This has reached a point that should be played during a game session. It will be picked up at the table.',
      resolved: 'This thread is closed for now. It remains in your record and can be reopened.'
    }[state] || '';
    return `<div class="interest-waiting interest-waiting-${esc(state)}"><strong>${esc(threadStateLabel(state))}</strong><span>${esc(copy)}</span></div>`;
  }

  function promotionMarkup(goal, isPreview) {
    if (isPreview || goal.status === 'done' || goal.status === 'pursuing') return '';
    if (isQuestion(goal)) return `<div class="engagement-promote"><span>Does this matter beyond the question?</span><div><button type="button" data-promote-interest="${goal.id}">Mark as interest</button><button type="button" data-promote-pursuing="${goal.id}">Pursue this</button></div></div>`;
    if (goal.status === 'open' || goal.status === 'dormant') return `<div class="engagement-promote"><span>Ready to act on it?</span><div><button type="button" data-promote-pursuing="${goal.id}">Pursue this</button></div></div>`;
    return '';
  }

  function playerThreadCard(goal, messages, user, resolved = false, isPreview = false) {
    const playerName = CHARACTER_NAMES[goal.character_slug] || user.character || goal.character_slug;
    const canReply = !resolved && goal.thread_state !== 'play_at_table' && !isPreview;
    const noun = isQuestion(goal) ? 'question' : 'interest';
    return `<article class="interest-thread${resolved ? ' interest-thread-resolved' : ''}" data-goal-id="${goal.id}" data-entry-kind="${isQuestion(goal) ? 'question' : 'interest'}">
      <div class="interest-thread-head"><div><span class="interest-status">${esc(statusLabel(goal))}</span><h3>${esc(goal.goal_text)}</h3></div><span class="interest-waiting-pill">${esc(threadStateLabel(goal.thread_state))}</span></div>
      ${sourceMarkup(goal)}${conversationMarkup(goal, messages, playerName)}${waitingBanner(goal)}${promotionMarkup(goal, isPreview)}
      ${canReply ? `<form class="interest-reply-form" data-player-reply="${goal.id}"><label for="playerReply-${goal.id}">Reply to this ${noun}</label><textarea id="playerReply-${goal.id}" maxlength="${MAX_REPLY_LENGTH}" rows="3" placeholder="What does ${esc(playerName)} ask, think, investigate or want to do next?"></textarea><div class="interest-reply-actions"><button type="submit">Send reply</button><span>The GM will see this between games.</span></div></form>` : ''}
      ${resolved && !isPreview ? `<button type="button" class="interest-reopen" data-reopen-goal="${goal.id}">Reopen this ${noun}</button>` : ''}
      ${!resolved && !isPreview ? `<button type="button" class="interest-close-player" data-close-player-goal="${goal.id}">Close this ${noun}</button>` : ''}
    </article>`;
  }

  function gmStatusActions(goal) {
    if (goal.status === 'done') return `<button type="button" data-goal-status="open" data-goal-id="${goal.id}">Reopen</button>`;
    return `${isQuestion(goal) ? `<button type="button" data-goal-kind="interest" data-goal-id="${goal.id}">Mark Interest</button>` : ''}${goal.status !== 'open' ? `<button type="button" data-goal-status="open" data-goal-id="${goal.id}">${isQuestion(goal) ? 'Open Question' : 'Player Interest'}</button>` : ''}${goal.status !== 'pursuing' ? `<button type="button" data-goal-status="pursuing" data-goal-id="${goal.id}">Pursuing</button>` : ''}${goal.status !== 'dormant' ? `<button type="button" data-goal-status="dormant" data-goal-id="${goal.id}">Dormant</button>` : ''}`;
  }

  function gmThreadCard(goal, messages) {
    const playerName = CHARACTER_NAMES[goal.character_slug] || goal.character_slug;
    const resolved = goal.status === 'done';
    return `<article class="interest-thread gm-interest-thread${resolved ? ' interest-thread-resolved' : ''}" data-goal-id="${goal.id}" data-entry-kind="${isQuestion(goal) ? 'question' : 'interest'}">
      <div class="interest-thread-head"><div><span class="interest-status">${esc(playerName.toUpperCase())} · ${esc(statusLabel(goal))}</span><h3>${esc(goal.goal_text)}</h3></div><span class="interest-waiting-pill">${esc(threadStateLabel(goal.thread_state))}</span></div>
      ${sourceMarkup(goal)}${conversationMarkup(goal, messages, playerName)}${waitingBanner(goal)}
      ${!resolved ? `<form class="gm-interest-reply" data-gm-reply="${goal.id}"><label for="gmReply-${goal.id}">Reply to ${esc(playerName)}</label><textarea id="gmReply-${goal.id}" maxlength="${MAX_REPLY_LENGTH}" rows="3" placeholder="Reply, give a lead, or leave this blank and send it to the table."></textarea><div class="gm-thread-actions"><button type="button" data-send-kind="reply">Reply</button><button type="button" data-send-kind="lead">Give Lead</button><button type="button" data-send-kind="table">Play at Table</button><button type="button" class="gm-thread-close" data-close-thread="${goal.id}">Close Thread</button></div></form>` : ''}
      <div class="gm-interest-state"><span>Thread state</span><div class="gm-goal-actions">${gmStatusActions(goal)}</div></div>
    </article>`;
  }

  const activeGoals = goals => goals.filter(g => g.status !== 'done');
  const resolvedGoals = goals => goals.filter(g => g.status === 'done');

  function attachSourceActions(host) {
    host.querySelectorAll('[data-engagement-route]').forEach(btn => btn.addEventListener('click', () => { location.hash = btn.dataset.engagementRoute; }));
  }

  function attachStatusActions(host, user) {
    host.querySelectorAll('[data-goal-status]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await request(user, 'PATCH', { id: Number(btn.dataset.goalId), status: btn.dataset.goalStatus }); await render(user); }
      catch (error) { btn.disabled = false; alert(error.message); }
    }));
    host.querySelectorAll('[data-goal-kind]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await request(user, 'PATCH', { id: Number(btn.dataset.goalId), entry_kind: btn.dataset.goalKind }); await render(user); }
      catch (error) { btn.disabled = false; alert(error.message); }
    }));
  }

  function attachGMReplyActions(host, user) {
    host.querySelectorAll('[data-gm-reply]').forEach(form => {
      const goalId = Number(form.dataset.gmReply), textarea = form.querySelector('textarea');
      form.querySelectorAll('[data-send-kind]').forEach(btn => btn.addEventListener('click', async () => {
        const kind = btn.dataset.sendKind;
        let message = textarea.value.trim().replace(/\s+/g, ' ');
        if (kind === 'table' && !message) message = 'This has reached a point that should be played at the table. We will pick it up during a game session.';
        if (!message) { textarea.focus(); return; }
        form.querySelectorAll('button').forEach(button => { button.disabled = true; });
        try { await request(user, 'POST', { goal_id: goalId, message: message.slice(0, MAX_REPLY_LENGTH), kind }); await render(user); }
        catch (error) { form.querySelectorAll('button').forEach(button => { button.disabled = false; }); alert(error.message); }
      }));
    });
    host.querySelectorAll('[data-close-thread]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await request(user, 'PATCH', { id: Number(btn.dataset.closeThread), status: 'done' }); await render(user); }
      catch (error) { btn.disabled = false; alert(error.message); }
    }));
  }

  function attachPlayerActions(host, user) {
    host.querySelectorAll('[data-player-reply]').forEach(form => form.addEventListener('submit', async event => {
      event.preventDefault();
      const textarea = form.querySelector('textarea'), submit = form.querySelector('button[type="submit"]'), message = textarea.value.trim().replace(/\s+/g, ' ');
      if (!message) return;
      submit.disabled = true;
      try { await request(user, 'POST', { goal_id: Number(form.dataset.playerReply), message: message.slice(0, MAX_REPLY_LENGTH), kind: 'reply' }); await render(user); }
      catch (error) { submit.disabled = false; alert(error.message); }
    }));
    host.querySelectorAll('[data-promote-interest]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await request(user, 'PATCH', { id: Number(btn.dataset.promoteInterest), entry_kind: 'interest', status: 'open' }); await render(user); }
      catch (error) { btn.disabled = false; alert(error.message); }
    }));
    host.querySelectorAll('[data-promote-pursuing]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await request(user, 'PATCH', { id: Number(btn.dataset.promotePursuing), entry_kind: 'interest', status: 'pursuing' }); await render(user); }
      catch (error) { btn.disabled = false; alert(error.message); }
    }));
    host.querySelectorAll('[data-reopen-goal]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await request(user, 'PATCH', { id: Number(btn.dataset.reopenGoal), status: 'open' }); await render(user); }
      catch (error) { btn.disabled = false; alert(error.message); }
    }));
    host.querySelectorAll('[data-close-player-goal]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await request(user, 'PATCH', { id: Number(btn.dataset.closePlayerGoal), status: 'done' }); await render(user); }
      catch (error) { btn.disabled = false; alert(error.message); }
    }));
  }

  function splitCounts(goals) {
    const active = activeGoals(goals);
    return { questions: active.filter(isQuestion).length, interests: active.filter(g => !isQuestion(g) && g.status !== 'pursuing').length, pursuing: active.filter(g => g.status === 'pursuing').length };
  }

  async function render(user) {
    const host = document.getElementById('playerGoals');
    if (!host) return;
    host.innerHTML = `<div class="section-head player-goals-head"><div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>Loading questions & interests…</h2></div><p>Checking the shared Greywake campaign record.</p></div>`;
    try {
      const result = await request(user, 'GET');
      let goals = Array.isArray(result.goals) ? result.goals : [];
      const messages = Array.isArray(result.messages) ? result.messages : [];
      goals = await migrateOldLocalGoals(user, goals);

      if (isFullGM(user)) {
        const grouped = ['marek','velmira','odie'].map(key => {
          const characterGoals = goals.filter(g => g.character_slug === key), current = activeGoals(characterGoals), resolved = resolvedGoals(characterGoals), counts = splitCounts(characterGoals);
          const currentCards = current.length ? `<div class="interest-thread-list">${current.map(goal => gmThreadCard(goal, messages)).join('')}</div>` : `<div class="goals-empty">${CHARACTER_NAMES[key]} has no current interests or questions.</div>`;
          const resolvedCards = resolved.length ? `<details class="resolved-goals"><summary>Resolved / closed (${resolved.length})</summary><div class="interest-thread-list">${resolved.map(goal => gmThreadCard(goal, messages)).join('')}</div></details>` : '';
          return `<section class="gm-goal-group"><div class="eyebrow">${CHARACTER_NAMES[key].toUpperCase()}</div><h3>${CHARACTER_NAMES[key]}'s questions & interests</h3><div class="engagement-counts"><span>? ${counts.questions} questions</span><span>★ ${counts.interests} interests</span><span>→ ${counts.pursuing} pursuing</span></div>${currentCards}${resolvedCards}</section>`;
        }).join('');
        host.innerHTML = `<div class="section-head player-goals-head"><div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>Player Questions & Interests</h2></div><p>Questions capture curiosity without turning it into a quest. Reply between games, give a lead, or send a consequential moment to the table. Players can promote a question into an interest or pursuit.</p></div><div class="interest-legend"><span>QUESTION</span><span>PLAYER INTEREST</span><span>PURSUING</span><span>PLAY AT TABLE</span><span>RESOLVED</span></div>${grouped}`;
        attachSourceActions(host); attachStatusActions(host, user); attachGMReplyActions(host, user); return;
      }

      const key = characterKey(user);
      goals = goals.filter(g => g.character_slug === key);
      const current = activeGoals(goals), resolved = resolvedGoals(goals), counts = splitCounts(goals), isPreview = document.body.dataset.gmPreview === 'true';
      const list = current.length ? `<div class="interest-thread-list">${current.map(goal => playerThreadCard(goal, messages, user, false, isPreview)).join('')}</div>` : `<div class="goals-empty">Nothing current yet. Questions you ask from cards and records will appear here automatically, without becoming a quest unless you choose to pursue them.</div>`;
      const resolvedSection = resolved.length ? `<details class="resolved-goals"><summary>Resolved / closed (${resolved.length})</summary><div class="interest-thread-list">${resolved.map(goal => playerThreadCard(goal, messages, user, true, isPreview)).join('')}</div></details>` : '';
      host.innerHTML = `<div class="section-head player-goals-head"><div><div class="eyebrow">YOUR DIRECTION</div><h2>Questions & Interests</h2></div><p>${isPreview ? `GM preview of ${esc(user.character)}'s centrally saved questions and interests.` : `Ask directly from things you are reading. A question stays a question until you decide it matters enough to become one of the three things currently on your mind.`}</p></div><div class="engagement-counts"><span>? ${counts.questions} questions</span><span>★ ${counts.interests} interests</span><span>→ ${counts.pursuing} pursuing</span></div>${list}${resolvedSection}${isPreview ? `<div class="goal-hint">GM preview · replies and changes are disabled in preview mode</div>` : `<form id="goalForm" class="goal-form"><label for="goalInput">Start a new interest or direction</label><div class="goal-input-row"><input id="goalInput" maxlength="${MAX_LENGTH}" placeholder="e.g. I'd love to study a flickerfly."><button type="submit" ${activeInterestCount(current) >= MAX_INTERESTS ? 'disabled' : ''}>Add interest</button></div><div class="goal-hint">${activeInterestCount(current)}/${MAX_INTERESTS} things on your mind · questions do not use a slot</div></form>`}`;
      attachSourceActions(host);
      if (!isPreview) {
        attachPlayerActions(host, user);
        document.getElementById('goalForm')?.addEventListener('submit', async event => {
          event.preventDefault(); const form = event.currentTarget, input = document.getElementById('goalInput'), submit = form.querySelector('button[type="submit"]'), value = input.value.trim().replace(/\s+/g, ' ');
          if (value.length < 3) return; submit.disabled = true;
          try { await request(user, 'POST', { goal: value.slice(0, MAX_LENGTH), entry_kind: 'interest' }); await render(user); }
          catch (error) { submit.disabled = false; alert(error.message); }
        });
      }
    } catch (error) {
      host.innerHTML = `<div class="section-head player-goals-head"><div><div class="eyebrow">PLAYER-DIRECTED PREP</div><h2>Questions & Interests unavailable</h2></div></div><div class="goals-empty"><strong>Nothing has been lost.</strong> ${esc(error.message)} Refresh the page to try again.</div>`;
    }
  }

  window.addEventListener('greywake:player-ready', event => render(event.detail));
  window.addEventListener('greywake:engagement-changed', () => { if (window.GreywakePlayer) render(window.GreywakePlayer); });
  document.addEventListener('DOMContentLoaded', () => { if (window.GreywakePlayer) render(window.GreywakePlayer); });
})();
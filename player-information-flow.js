(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;

  let scheduled = false;
  let observer = null;

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function isPlayerSurface() {
    return !isFullGM();
  }

  function text(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  // The conversation renderer owns message labels. Never infer behaviour from
  // text that another view may change; use the underlying thread state.
  function questionState(card) {
    return card.dataset.threadState || '';
  }

  function activeMindCount() {
    return [...host.querySelectorAll('.interest-thread:not(.interest-thread-resolved)')].filter(card => {
      const kind = (card.dataset.entryKind || '').toLowerCase();
      const status = (card.querySelector('.interest-status')?.textContent || '').toUpperCase();
      return kind === 'interest' && !status.includes('DORMANT') && !status.includes('RESOLVED');
    }).length;
  }

  function ensurePlayerRule() {
    const head = host.querySelector('.player-goals-head');
    if (!head) return;
    const paragraph = head.querySelector('p');
    if (paragraph && document.body.dataset.gmPreview !== 'true') {
      text(paragraph, 'Questions do not use interest or pursuit slots. Keep any number of interests and one active pursuit. A question only becomes a priority if you choose.');
    }

    let rule = host.querySelector('.question-flow-rule');
    if (!rule) {
      rule = document.createElement('div');
      rule.className = 'question-flow-rule';
      rule.innerHTML = '<strong>QUESTIONS DO NOT USE SLOTS</strong><span>Ask, follow up, and close them when answered. You can keep any number of interests and one active pursuit.</span>';
      const counts = host.querySelector('.engagement-counts');
      (counts || head).insertAdjacentElement('afterend', rule);
    }
  }

  function makeFlowGroup(title, subtitle, cards, emptyCopy) {
    const section = document.createElement('section');
    section.className = 'player-flow-group';
    section.innerHTML = `<div class="player-flow-group-head"><div><span>${title.toUpperCase()}</span><h3>${title}</h3></div><p>${subtitle}</p></div>`;
    const list = document.createElement('div');
    list.className = 'player-flow-group-list';
    if (cards.length) cards.forEach(card => list.appendChild(card));
    else list.innerHTML = `<div class="player-flow-empty">${emptyCopy}</div>`;
    section.appendChild(list);
    return section;
  }

  function groupCurrentThreads() {
    const list = host.querySelector(':scope > .interest-thread-list');
    if (!list || list.dataset.flowGrouped === 'true') return;
    const cards = [...list.children].filter(node => node.classList?.contains('interest-thread'));
    if (!cards.length) return;

    const questions = cards.filter(card => (card.dataset.entryKind || '').toLowerCase() === 'question');
    const interests = cards.filter(card => (card.dataset.entryKind || '').toLowerCase() === 'interest');

    list.dataset.flowGrouped = 'true';
    list.classList.add('player-flow-groups');
    list.replaceChildren(
      makeFlowGroup(
        'Questions',
        `${questions.length} open · these do not use priority slots`,
        questions,
        'No open questions. Ask from any Greywake card or use Ask question below.'
      ),
      makeFlowGroup(
        'On My Mind conversations',
        `${interests.length} interest${interests.length===1?'':'s'} · one active pursuit`,
        interests,
        'No current interests.'
      )
    );
  }

  function enhanceQuestionCard(card) {
    const state = questionState(card);
    const promote = card.querySelector('.engagement-promote');
    if (promote) {
      // Keep the original promotion rule, but do not read the presentation label.
      promote.hidden = state !== 'waiting_player';
      if (!promote.hidden) {
        text(promote.querySelector(':scope > span'), 'Does this matter beyond the question?');
        text(promote.querySelector('[data-promote-interest]'), 'Put on my mind');
        text(promote.querySelector('[data-promote-pursuing]'), 'Pursue this');
      }
    }
    text(card.querySelector('[data-close-player-goal]'), 'Answered / close question');
    // Reply label, waiting banner and send button belong to player-goals-system-filter.
  }

  function enhancePlayer() {
    if (!isPlayerSurface()) return;
    ensurePlayerRule();
    groupCurrentThreads();
    host.querySelectorAll('.interest-thread[data-entry-kind="question"]:not(.interest-thread-resolved)').forEach(enhanceQuestionCard);

    const hint = host.querySelector('.goal-hint');
    if (hint && document.body.dataset.gmPreview !== 'true') {
      text(hint, `${activeMindCount()} current interests · one active pursuit · questions are separate`);
    }
  }

  function enhanceGMCard(card) {
    const isQuestion = (card.dataset.entryKind || '').toLowerCase() === 'question';
    const form = card.querySelector('.gm-interest-reply');
    if (!form) return;

    const lead = form.querySelector('[data-send-kind="lead"]');
    const table = form.querySelector('[data-send-kind="table"]');
    text(lead, 'Give lead');
    text(table, isQuestion ? 'Discover in play' : 'Play at table');

    if (isQuestion) {
      let note = card.querySelector('.gm-question-flow-note');
      if (!note) {
        note = document.createElement('div');
        note.className = 'gm-question-flow-note';
        note.innerHTML = '<strong>If this needs prep:</strong> leave the player question open and use GM Handoff as Proposed. Proposed/Approved/Active/Resolved are private GM states; the player never sees them.';
        form.insertAdjacentElement('beforebegin', note);
      }
    }
  }

  function ensureStyles() {
    if (document.getElementById('player-information-flow-styles')) return;
    const style = document.createElement('style');
    style.id = 'player-information-flow-styles';
    style.textContent = `
      .question-flow-rule{display:flex;gap:10px;align-items:flex-start;margin:10px 0 16px;padding:10px 12px;border-left:2px solid #9c8750;background:#171711;color:#9f9782;font-size:10px;line-height:1.45}
      .question-flow-rule strong{flex:0 0 auto;color:#dac98f;font-size:8px;letter-spacing:.12em}
      .player-flow-groups{display:grid!important;gap:18px!important}
      .player-flow-group{border-top:1px solid #353328;padding-top:14px}
      .player-flow-group-head{display:flex;justify-content:space-between;gap:18px;align-items:end;margin-bottom:10px}
      .player-flow-group-head span{display:block;color:#a48e55;font-size:8px;font-weight:800;letter-spacing:.13em}
      .player-flow-group-head h3{margin:3px 0 0;color:#e7dcc0;font:20px/1.1 Georgia,serif}
      .player-flow-group-head p{max-width:360px;margin:0;color:#817a68;font-size:9px;line-height:1.4;text-align:right}
      .player-flow-group-list{display:grid;gap:12px}
      .player-flow-empty{padding:12px;border:1px dashed #3e3b30;background:#14140f;color:#77715f;font-size:10px;line-height:1.45}
      .gm-question-flow-note{margin:10px 0;padding:9px 11px;border-left:2px solid #6f6544;background:#15150f;color:#8f8875;font-size:10px;line-height:1.45}
      .gm-question-flow-note strong{color:#c9b77f}
      .engagement-promote[hidden]{display:none!important}
      @media(max-width:620px){.question-flow-rule{display:block}.question-flow-rule strong{display:block;margin-bottom:5px}.player-flow-group-head{display:block}.player-flow-group-head p{margin-top:5px;text-align:left}}
    `;
    document.head.appendChild(style);
  }

  function enhance() {
    observer?.disconnect();
    try {
      ensureStyles();
      if (isFullGM()) {
        host.querySelectorAll('.gm-interest-thread').forEach(enhanceGMCard);
      } else {
        enhancePlayer();
      }
    } finally {
      observe();
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhance();
    });
  }

  function observe() {
    if (!observer) observer = new MutationObserver(schedule);
    observer.observe(host, { childList: true, subtree: true });
  }

  observe();
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();

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

  function questionState(card) {
    return (card.querySelector('.interest-waiting-pill')?.textContent || '').trim().toUpperCase();
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
      text(paragraph, 'You can keep multiple questions open. Questions do not use your three On My Mind slots. A question only becomes a priority if you choose to make it one.');
    }

    let rule = host.querySelector('.question-flow-rule');
    if (!rule) {
      rule = document.createElement('div');
      rule.className = 'question-flow-rule';
      rule.innerHTML = '<strong>QUESTIONS DO NOT USE SLOTS</strong><span>Ask, follow up, and close them when answered. Only things you deliberately put On My Mind use one of your three slots.</span>';
      const counts = host.querySelector('.engagement-counts');
      (counts || head).insertAdjacentElement('afterend', rule);
    }
  }

  function enhanceQuestionCard(card) {
    const state = questionState(card);
    const promote = card.querySelector('.engagement-promote');
    if (promote) {
      const canPromote = state.includes('WAITING ON PLAYER');
      promote.hidden = !canPromote;
      if (canPromote) {
        text(promote.querySelector(':scope > span'), 'Does this now matter enough to become one of your three priorities?');
        const interest = promote.querySelector('[data-promote-interest]');
        const pursuing = promote.querySelector('[data-promote-pursuing]');
        text(interest, 'Put on my mind');
        text(pursuing, 'Pursue this');
        const full = activeMindCount() >= 3;
        if (interest) {
          interest.disabled = full;
          interest.title = full ? 'All three On My Mind slots are occupied. Make one dormant or close it first.' : '';
        }
        if (pursuing) {
          pursuing.disabled = full;
          pursuing.title = full ? 'All three On My Mind slots are occupied. Make one dormant or close it first.' : '';
        }
      }
    }

    const waiting = card.querySelector('.interest-waiting span');
    if (waiting) {
      if (state.includes('WAITING ON PLAYER')) {
        text(waiting, 'The GM has replied. Ask a follow-up, close the question if that answers it, or make it one of your three priorities if you want to act on it.');
      } else if (state.includes('WAITING ON GM')) {
        text(waiting, 'Your question is with the GM. You can ask other questions while this one is waiting.');
      } else if (state.includes('PLAY AT TABLE')) {
        text(waiting, 'The answer would reveal something better discovered in play. This question will be picked up during a game session.');
      }
    }

    const close = card.querySelector('[data-close-player-goal]');
    if (close) text(close, 'Answered / close question');

    const replyLabel = card.querySelector('.interest-reply-form label');
    if (replyLabel) text(replyLabel, 'Ask a follow-up');
  }

  function enhancePlayer() {
    if (!isPlayerSurface()) return;
    ensurePlayerRule();
    host.querySelectorAll('.interest-thread[data-entry-kind="question"]:not(.interest-thread-resolved)').forEach(enhanceQuestionCard);

    const hint = host.querySelector('.goal-hint');
    if (hint && document.body.dataset.gmPreview !== 'true') {
      text(hint, `${Math.min(activeMindCount(), 3)}/3 On My Mind slots used · questions do not use these slots`);
    }
  }

  function enhanceGMCard(card) {
    const isQuestion = (card.dataset.entryKind || '').toLowerCase() === 'question';
    const form = card.querySelector('.gm-interest-reply');
    if (!form) return;

    const reply = form.querySelector('[data-send-kind="reply"]');
    const lead = form.querySelector('[data-send-kind="lead"]');
    const table = form.querySelector('[data-send-kind="table"]');
    text(reply, isQuestion ? 'Answer now' : 'Reply');
    text(lead, 'Give lead');
    text(table, isQuestion ? 'Discover in play' : 'Play at table');

    if (isQuestion) {
      const label = form.querySelector('label');
      if (label) text(label, 'Respond to this question');
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
      .gm-question-flow-note{margin:10px 0;padding:9px 11px;border-left:2px solid #6f6544;background:#15150f;color:#8f8875;font-size:10px;line-height:1.45}
      .gm-question-flow-note strong{color:#c9b77f}
      .engagement-promote[hidden]{display:none!important}
      @media(max-width:620px){.question-flow-rule{display:block}.question-flow-rule strong{display:block;margin-bottom:5px}}
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

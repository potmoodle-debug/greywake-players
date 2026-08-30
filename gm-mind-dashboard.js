(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;
  let scheduled = false;

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function ensureStyles() {
    if (document.getElementById('gm-mind-dashboard-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-mind-dashboard-styles';
    style.textContent = `
      .gm-mind-dashboard{margin:0 0 30px;padding:22px 0;background:transparent}
      .gm-mind-dashboard-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:18px}
      .gm-mind-dashboard-head h2{margin:4px 0 0;font:30px/1.1 Georgia,serif;color:#eadfbd}
      .gm-mind-dashboard-head p{max-width:600px;margin:0;color:#9b927a;font-size:12px;line-height:1.5}
      .gm-mind-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .gm-mind-player{position:relative;min-height:360px;display:flex;flex-direction:column;justify-content:flex-end;isolation:isolate;border:1px solid #3a3b2e;background:#171811;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,.2);transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}
      .gm-mind-player:before{content:"";position:absolute;inset:0;z-index:-3;background:radial-gradient(circle at 72% 20%,#4a4028,#171811 58%)}
      .gm-mind-player:after{content:"";position:absolute;inset:0;z-index:-2;background:linear-gradient(180deg,rgba(8,9,6,.05) 4%,rgba(8,9,6,.25) 36%,rgba(8,9,6,.9) 72%,rgba(8,9,6,.99) 100%)}
      .gm-mind-player:hover{border-color:#9c8a55;transform:translateY(-4px);box-shadow:0 24px 60px rgba(0,0,0,.34)}
      .gm-mind-player-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:22px 22px 0}
      .gm-mind-player-head strong{font:clamp(24px,2.3vw,32px)/1.08 Georgia,serif;color:#f0e7ce;text-shadow:0 2px 14px rgba(0,0,0,.75)}
      .gm-mind-count{color:#e2c878;font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,.9)}
      .gm-mind-list{display:grid;gap:8px;padding:16px 22px 22px}
      .gm-mind-item{display:block;width:100%;text-align:left;border:1px solid rgba(113,102,69,.52);background:rgba(20,20,15,.72);backdrop-filter:blur(7px);color:#ded6c2;padding:11px 12px;cursor:pointer;font:12px/1.45 inherit;transition:border-color .2s ease,background .2s ease,transform .2s ease}
      .gm-mind-item:hover{border-color:#8a7a49;background:rgba(31,29,21,.88);transform:translateX(2px)}
      .gm-mind-item small{display:block;margin-bottom:4px;color:#c4ad6e;font-size:8px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}
      .gm-mind-empty{margin:0 22px 22px;padding:12px;border:1px solid rgba(113,102,69,.36);background:rgba(20,20,15,.62);color:#8f8875;font-size:11px;line-height:1.5}
      .gm-mind-open-inbox{margin-top:14px;border:0;background:none;color:#bbaa78;padding:0;text-decoration:underline;cursor:pointer;font-size:10px}
      #gmMindShortcut{border:1px solid #61583b;background:#211e14;color:#dfcd94;padding:8px 10px;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}

      .gw-action-feedback{position:fixed;right:20px;bottom:20px;z-index:9999;width:min(360px,calc(100vw - 40px));padding:14px 15px 13px;border:1px solid #8a7a49;background:rgba(20,20,15,.97);box-shadow:0 20px 55px rgba(0,0,0,.45);color:#e9dfc5;opacity:0;transform:translateY(10px);pointer-events:none;transition:opacity .2s ease,transform .2s ease}
      .gw-action-feedback.show{opacity:1;transform:translateY(0)}
      .gw-action-feedback strong{display:block;margin-bottom:3px;color:#e2c878;font:18px/1.2 Georgia,serif}
      .gw-action-feedback span{display:block;color:#bcb29b;font-size:11px;line-height:1.5}
      .gw-action-confirmed{position:relative!important;overflow:hidden}
      .gw-action-confirmed:after{content:"✓  DONE";position:absolute;right:8px;top:8px;z-index:5;padding:4px 7px;border:1px solid rgba(226,200,120,.7);background:rgba(19,19,14,.92);color:#e2c878;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;animation:gwConfirmIn .28s ease both}
      .gw-action-pulse{animation:gwPulse .45s ease}
      @keyframes gwConfirmIn{from{opacity:0;transform:translateY(-5px) scale(.95)}to{opacity:1;transform:none}}
      @keyframes gwPulse{0%{box-shadow:0 0 0 rgba(226,200,120,0)}50%{box-shadow:0 0 0 3px rgba(226,200,120,.32)}100%{box-shadow:0 0 0 rgba(226,200,120,0)}}
      @media(prefers-reduced-motion:reduce){.gw-action-feedback,.gm-mind-player,.gm-mind-item{transition:none}.gw-action-confirmed:after,.gw-action-pulse{animation:none}}
      @media(max-width:1120px){.gm-mind-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.gm-mind-grid{grid-template-columns:1fr}.gm-mind-dashboard-head{display:block}.gm-mind-dashboard-head p{margin-top:8px}.gm-mind-player{min-height:330px}.gw-action-feedback{right:12px;bottom:12px;width:calc(100vw - 24px)}}
    `;
    document.head.appendChild(style);
  }

  function ensureFeedback() {
    let box = document.getElementById('gwActionFeedback');
    if (box) return box;
    box = document.createElement('div');
    box.id = 'gwActionFeedback';
    box.className = 'gw-action-feedback';
    box.setAttribute('role','status');
    box.setAttribute('aria-live','polite');
    document.body.appendChild(box);
    return box;
  }

  function describeAction(button) {
    const label = (button.textContent || '').trim().replace(/\s+/g,' ');
    const lower = label.toLowerCase();
    if (lower.includes('pursu')) return ['Marked as pursuing','This now shows as something you actively want to follow up.'];
    if (lower.includes('dormant')) return ['Set to dormant','It stays recorded, but it is no longer one of your active priorities.'];
    if (lower.includes('done') || lower.includes('resolve')) return ['Marked done','This is now treated as resolved rather than an active thread.'];
    if (lower.includes('vote')) return ['Vote recorded','Your choice has been counted and the option now reflects your vote.'];
    if (lower.includes('interest')) return ['Interest added','This has been added to what is currently on your mind.'];
    if (lower.includes('question') || lower.includes('ask')) return ['Question sent','Your question is now in the GM inbox for a reply or an in-session answer.'];
    if (lower.includes('save') || lower.includes('submit') || lower.includes('send')) return ['Saved','Your change has been recorded.'];
    return ['Action recorded','The page has updated to show your choice.'];
  }

  function flashAction(button) {
    ensureStyles();
    const feedback = ensureFeedback();
    const [title, detail] = describeAction(button);
    feedback.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
    feedback.classList.remove('show');
    void feedback.offsetWidth;
    feedback.classList.add('show');
    clearTimeout(feedback._hideTimer);
    feedback._hideTimer = setTimeout(() => feedback.classList.remove('show'), 2600);

    const visualTarget = button.closest('.thread-card,.gm-interest-thread,.interest-thread,.proposal-card,.vote-card,.card,article') || button;
    visualTarget.classList.remove('gw-action-confirmed','gw-action-pulse');
    void visualTarget.offsetWidth;
    visualTarget.classList.add('gw-action-confirmed','gw-action-pulse');
    clearTimeout(visualTarget._confirmTimer);
    visualTarget._confirmTimer = setTimeout(() => visualTarget.classList.remove('gw-action-confirmed'), 2400);
  }

  function bindActionFeedback() {
    document.querySelectorAll('button').forEach(button => {
      if (button.dataset.gwFeedbackBound === 'true') return;
      const text = (button.textContent || '').toLowerCase();
      const looksLikePlayerAction = /pursu|dormant|done|resolve|vote|interest|question|ask|save|submit|send/.test(text);
      if (!looksLikePlayerAction) return;
      button.dataset.gwFeedbackBound = 'true';
      button.addEventListener('click', () => {
        setTimeout(() => flashAction(button), 80);
      });
    });
  }

  function activeMindCards(group) {
    return [...group.querySelectorAll('.gm-interest-thread:not(.interest-thread-resolved)')].filter(card => {
      const kind = (card.dataset.entryKind || '').toLowerCase();
      const status = (card.querySelector('.interest-status')?.textContent || '').toUpperCase();
      return kind === 'interest' && !status.includes('DORMANT') && !status.includes('RESOLVED');
    });
  }

  function playerName(group) {
    return group.querySelector(':scope > .eyebrow')?.textContent?.trim() || 'PLAYER';
  }

  function enhance() {
    document.getElementById('gmMindShortcut')?.remove();
    host.querySelector('.gm-mind-dashboard')?.remove();
    ensureStyles();
    bindActionFeedback();
    if (!isFullGM()) return;
    const groups = [...host.querySelectorAll('.gm-goal-group')];
    if (!groups.length) return;

    const dashboard = document.createElement('section');
    dashboard.className = 'gm-mind-dashboard';
    dashboard.id = 'gmMindDashboard';
    const cards = groups.map(group => {
      const name = playerName(group);
      const minds = activeMindCards(group);
      const items = minds.length ? minds.slice(0,5).map(card => {
        const text = card.querySelector('.interest-thread-head h3')?.textContent?.trim() || 'Current interest';
        const status = (card.querySelector('.interest-status')?.textContent || '').replace(/^.*?·\s*/, '').trim();
        const id = card.dataset.goalId || '';
        return `<button type="button" class="gm-mind-item" data-mind-goal="${id}"><small>${status || 'ON THEIR MIND'}</small>${text}</button>`;
      }).join('') : `<div class="gm-mind-empty">Nothing currently occupying an active slot.</div>`;
      return `<article class="gm-mind-player"><div class="gm-mind-player-head"><strong>${name[0] + name.slice(1).toLowerCase()}</strong><span class="gm-mind-count">${Math.min(minds.length,5)}/5 ON THEIR MIND</span></div><div class="gm-mind-list">${items}</div></article>`;
    }).join('');
    dashboard.innerHTML = `<div class="gm-mind-dashboard-head"><div><div class="eyebrow">PLAYER PRIORITY SIGNALS</div><h2>What's on their minds</h2></div><p>These are the active interests occupying each player's five slots — the clearest signal of what is currently important to them. Questions are kept in the inbox below and do not use these slots.</p></div><div class="gm-mind-grid">${cards}</div><button type="button" class="gm-mind-open-inbox">Open full questions & interests inbox ↓</button>`;
    host.prepend(dashboard);

    dashboard.querySelectorAll('[data-mind-goal]').forEach(button => button.addEventListener('click', () => {
      const target = host.querySelector(`.gm-interest-thread[data-goal-id="${button.dataset.mindGoal}"]`);
      target?.scrollIntoView({behavior:'smooth',block:'center'});
    }));
    dashboard.querySelector('.gm-mind-open-inbox')?.addEventListener('click', () => {
      host.querySelector('.gm-goal-group')?.scrollIntoView({behavior:'smooth',block:'start'});
    });

    const topbar = document.querySelector('.topbar');
    const brainBtn = document.getElementById('brainBtn');
    if (topbar && brainBtn) {
      const shortcut = document.createElement('button');
      shortcut.id = 'gmMindShortcut';
      shortcut.type = 'button';
      shortcut.textContent = 'On their minds';
      shortcut.addEventListener('click', () => dashboard.scrollIntoView({behavior:'smooth',block:'start'}));
      topbar.insertBefore(shortcut, brainBtn);
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  }

  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
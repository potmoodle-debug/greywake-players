(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;

  let scheduled = false;
  let observer = null;

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
      .gm-mind-player{position:relative;min-height:360px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid #3a3b2e;background:#171811;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,.2)}
      .gm-mind-player:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 72% 20%,#4a4028,#171811 58%);z-index:0}
      .gm-mind-player:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,9,6,.05),rgba(8,9,6,.25) 36%,rgba(8,9,6,.98) 100%);z-index:1}
      .gm-mind-player>*{position:relative;z-index:2}
      .gm-mind-player-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:22px 22px 0}
      .gm-mind-player-head strong{font:28px/1.08 Georgia,serif;color:#f0e7ce}
      .gm-mind-count{color:#e2c878;font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
      .gm-mind-list{display:grid;gap:8px;padding:16px 22px 22px}
      .gm-mind-item{display:block;width:100%;text-align:left;border:1px solid rgba(113,102,69,.52);background:rgba(20,20,15,.76);color:#ded6c2;padding:11px 12px;cursor:pointer;font:12px/1.45 inherit}
      .gm-mind-item small{display:block;margin-bottom:4px;color:#c4ad6e;font-size:8px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}
      .gm-mind-empty{margin:0 22px 22px;padding:12px;border:1px solid rgba(113,102,69,.36);background:rgba(20,20,15,.62);color:#8f8875;font-size:11px;line-height:1.5}
      .gm-mind-open-inbox{margin-top:14px;border:0;background:none;color:#bbaa78;padding:0;text-decoration:underline;cursor:pointer;font-size:10px}
      #gmMindShortcut{border:1px solid #61583b;background:#211e14;color:#dfcd94;padding:8px 10px;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
      @media(max-width:1120px){.gm-mind-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.gm-mind-grid{grid-template-columns:1fr}.gm-mind-dashboard-head{display:block}.gm-mind-dashboard-head p{margin-top:8px}}
    `;
    document.head.appendChild(style);
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

  function cleanup() {
    host.querySelector('.gm-mind-dashboard')?.remove();
    document.getElementById('gmMindShortcut')?.remove();
  }

  function enhance() {
    if (!isFullGM()) {
      cleanup();
      return;
    }

    observer?.disconnect();
    try {
      cleanup();
      ensureStyles();
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
        }).join('') : '<div class="gm-mind-empty">Nothing currently occupying an active slot.</div>';
        return `<article class="gm-mind-player"><div class="gm-mind-player-head"><strong>${name[0] + name.slice(1).toLowerCase()}</strong><span class="gm-mind-count">${Math.min(minds.length,5)}/5 ON THEIR MIND</span></div><div class="gm-mind-list">${items}</div></article>`;
      }).join('');

      dashboard.innerHTML = `<div class="gm-mind-dashboard-head"><div><div class="eyebrow">PLAYER PRIORITY SIGNALS</div><h2>What's on their minds</h2></div><p>The active interests occupying each player's five slots.</p></div><div class="gm-mind-grid">${cards}</div><button type="button" class="gm-mind-open-inbox">Open full questions & interests inbox ↓</button>`;
      host.prepend(dashboard);

      dashboard.querySelectorAll('[data-mind-goal]').forEach(button => button.addEventListener('click', () => {
        host.querySelector(`.gm-interest-thread[data-goal-id="${button.dataset.mindGoal}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});
      }));
      dashboard.querySelector('.gm-mind-open-inbox')?.addEventListener('click', () => host.querySelector('.gm-goal-group')?.scrollIntoView({behavior:'smooth',block:'start'}));

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
    } finally {
      if (isFullGM()) observer?.observe(host, {childList:true, subtree:true});
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

  observer = new MutationObserver(() => {
    if (isFullGM()) schedule();
  });

  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
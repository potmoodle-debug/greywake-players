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
      .gm-mind-dashboard{margin:0 0 30px;padding:22px;border:1px solid #62593b;background:#181711}
      .gm-mind-dashboard-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:16px}
      .gm-mind-dashboard-head h2{margin:4px 0 0;font:30px/1.1 Georgia,serif;color:#eadfbd}
      .gm-mind-dashboard-head p{max-width:600px;margin:0;color:#9b927a;font-size:12px;line-height:1.5}
      .gm-mind-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .gm-mind-player{border:1px solid #403b2c;background:#12120e;padding:15px;min-width:0}
      .gm-mind-player-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}
      .gm-mind-player-head strong{font:21px Georgia,serif;color:#ded3b2}
      .gm-mind-count{border:1px solid #4c4633;padding:5px 8px;color:#b8aa80;font-size:9px;font-weight:800;letter-spacing:.09em}
      .gm-mind-list{display:grid;gap:7px}
      .gm-mind-item{display:block;width:100%;text-align:left;border:1px solid #353126;background:#191812;color:#d6cdb4;padding:10px 11px;cursor:pointer;font:12px/1.4 inherit}
      .gm-mind-item:hover{border-color:#766b47;background:#211f16}
      .gm-mind-item small{display:block;margin-bottom:3px;color:#8e8469;font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
      .gm-mind-empty{color:#716b59;font-size:11px;padding:9px 0}
      .gm-mind-open-inbox{margin-top:13px;border:0;background:none;color:#bbaa78;padding:0;text-decoration:underline;cursor:pointer;font-size:10px}
      #gmMindShortcut{border:1px solid #61583b;background:#211e14;color:#dfcd94;padding:8px 10px;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
      @media(max-width:900px){.gm-mind-grid{grid-template-columns:1fr}.gm-mind-dashboard-head{display:block}.gm-mind-dashboard-head p{margin-top:8px}}
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

  function enhance() {
    document.getElementById('gmMindShortcut')?.remove();
    host.querySelector('.gm-mind-dashboard')?.remove();
    if (!isFullGM()) return;
    const groups = [...host.querySelectorAll('.gm-goal-group')];
    if (!groups.length) return;
    ensureStyles();

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
      return `<article class="gm-mind-player"><div class="gm-mind-player-head"><strong>${name[0] + name.slice(1).toLowerCase()}</strong><span class="gm-mind-count">${Math.min(minds.length,5)}/5</span></div><div class="gm-mind-list">${items}</div></article>`;
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

  new MutationObserver(schedule).observe(host,{childList:true,subtree:true});
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;
  let scheduled = false;

  const PLAYER_ART = {
    MAREK: 'assets/canon/sessions/session-01.webp',
    VELMIRA: 'assets/canon/characters/velmira-poster.webp',
    ODIE: 'assets/canon/characters/odie-poster.webp'
  };

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function ensureStyles() {
    if (document.getElementById('gm-mind-dashboard-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-mind-dashboard-styles';
    style.textContent = `
      .gm-mind-dashboard{margin:0 0 34px;padding:0;background:transparent;border:0}
      .gm-mind-dashboard-head{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:18px}
      .gm-mind-dashboard-head h2{margin:4px 0 0;font:clamp(28px,3vw,38px)/1.08 Georgia,serif;color:#eadfbd}
      .gm-mind-dashboard-head p{max-width:650px;margin:0;color:#a9a18e;font-size:13px;line-height:1.65;border-left:2px solid #756a43;padding-left:14px}
      .gm-mind-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-flow:dense;gap:14px}
      .gm-mind-player.thread-card{min-height:390px}
      .gm-mind-player.thread-card:first-child{grid-column:auto}
      .gm-mind-player .thread-card-image{object-position:center 24%}
      .gm-mind-player .thread-card-content{padding:24px 24px 20px}
      .gm-mind-player-name{font:clamp(24px,2.3vw,32px)/1.08 Georgia,serif;margin:10px 0 12px;color:#f0e7ce;text-shadow:0 2px 14px rgba(0,0,0,.75)}
      .gm-mind-count{color:#e2c878;font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,.9)}
      .gm-mind-list{display:grid;gap:9px;margin-top:14px;border-top:1px solid rgba(221,202,142,.18);padding-top:13px}
      .gm-mind-item{display:block;width:100%;text-align:left;border:1px solid rgba(113,102,69,.52);background:rgba(20,20,15,.78);backdrop-filter:blur(7px);color:#d8d0bb;padding:11px 12px;cursor:pointer;font:12px/1.5 inherit;transition:border-color .18s ease,background .18s ease,transform .18s ease}
      .gm-mind-item:hover{border-color:#9c8a55;background:rgba(31,29,20,.92);transform:translateY(-1px)}
      .gm-mind-item small{display:block;margin-bottom:4px;color:#c4ad6e;font-size:8px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}
      .gm-mind-empty{margin-top:14px;padding:12px;border:1px solid rgba(113,102,69,.42);background:rgba(20,20,15,.65);color:#9d9684;font-size:11px;line-height:1.55}
      .gm-mind-open-inbox{margin-top:16px;background:#171712;border:1px solid #5b5233;color:#e3d7ad;padding:10px 13px;cursor:pointer;text-transform:uppercase;letter-spacing:.11em;font-size:9px}
      .gm-mind-open-inbox:hover{border-color:#8a7a49;color:#f1dfaa}
      #gmMindShortcut{border:1px solid #61583b;background:#211e14;color:#dfcd94;padding:8px 10px;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
      @media(max-width:1120px){.gm-mind-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.gm-mind-grid{grid-template-columns:1fr}.gm-mind-player.thread-card{min-height:360px}.gm-mind-dashboard-head{display:block}.gm-mind-dashboard-head p{margin-top:12px}}
      @media(max-width:650px){.gm-mind-player.thread-card{min-height:340px}.gm-mind-player .thread-card-content{padding:21px 20px 18px}.gm-mind-player-name{font-size:25px}}
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
      const rawName = playerName(group);
      const name = rawName[0] + rawName.slice(1).toLowerCase();
      const key = rawName.toUpperCase();
      const minds = activeMindCards(group);
      const items = minds.length ? minds.slice(0, 5).map(card => {
        const text = card.querySelector('.interest-thread-head h3')?.textContent?.trim() || 'Current interest';
        const status = (card.querySelector('.interest-status')?.textContent || '').replace(/^.*?·\s*/, '').trim();
        const id = card.dataset.goalId || '';
        return `<button type="button" class="gm-mind-item" data-mind-goal="${id}"><small>${status || 'ON THEIR MIND'}</small>${text}</button>`;
      }).join('') : `<div class="gm-mind-empty">Nothing is currently occupying one of ${name}'s five active slots.</div>`;
      const art = PLAYER_ART[key] || 'assets/tower-distant.jpg';

      return `<article class="gm-mind-player thread-card thread-personal">
        <img class="thread-card-image" src="${art}" alt="" loading="lazy" decoding="async">
        <div class="thread-card-shade"></div>
        <div class="thread-card-content">
          <div class="thread-topline"><span class="thread-status">PLAYER PRIORITIES</span><span class="gm-mind-count">${Math.min(minds.length,5)}/5 ON THEIR MIND</span></div>
          <div class="thread-direction">${name.toUpperCase()}</div>
          <h3 class="gm-mind-player-name">${name}</h3>
          <p class="thread-summary">The things currently at the front of ${name}'s mind. These are signals for prep, not promises or assigned quests.</p>
          <div class="gm-mind-list">${items}</div>
        </div>
      </article>`;
    }).join('');

    dashboard.innerHTML = `<div class="gm-mind-dashboard-head"><div><div class="eyebrow">PLAYER PRIORITY SIGNALS</div><h2>What's on their minds</h2></div><p>Each character can keep up to five active interests. This is your quickest view of what the players are currently signalling they care about. Questions stay in the inbox below and do not use these slots.</p></div><div class="gm-mind-grid">${cards}</div><button type="button" class="gm-mind-open-inbox">Open full questions & interests inbox ↓</button>`;
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
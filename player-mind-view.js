(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;
  let scheduled = false;

  function isPlayerView() {
    return document.body.dataset.role !== 'gm' || document.body.dataset.gmPreview === 'true';
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function activeMindCards() {
    return [...host.querySelectorAll('.interest-thread:not(.interest-thread-resolved)')].filter(card => {
      const kind = (card.dataset.entryKind || '').toLowerCase();
      const status = (card.querySelector('.interest-status')?.textContent || '').toUpperCase();
      return kind === 'interest' && !status.includes('DORMANT') && !status.includes('RESOLVED');
    }).slice(0, 5);
  }

  function titleFor(card) {
    return card.querySelector('.interest-thread-head h3')?.textContent?.trim() || 'Current interest';
  }

  function stateFor(card) {
    const status = (card.querySelector('.interest-status')?.textContent || '').trim().toUpperCase();
    return status.includes('PURSUING') ? 'PURSUING' : 'ON MY MIND';
  }

  function sourceFor(card) {
    return card.querySelector('.interest-source strong, .interest-source-link')?.textContent?.trim() || '';
  }

  function ensureStyles() {
    if (document.getElementById('player-mind-view-styles')) return;
    const style = document.createElement('style');
    style.id = 'player-mind-view-styles';
    style.textContent = `
      .player-mind-view{padding:52px clamp(22px,5vw,75px) 44px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#15150f 0%,#11120e 100%)}
      .player-mind-view .section-head{align-items:end}.player-mind-view .section-head p{max-width:610px}
      .player-mind-summary{margin:-4px 0 22px;color:#aaa28f;font-size:12px;line-height:1.65;border-left:2px solid #756a43;padding-left:14px}
      .player-mind-count{display:inline-flex;align-items:center;gap:7px;margin-top:10px;padding:6px 9px;border:1px solid rgba(210,190,128,.42);background:rgba(16,17,13,.76);color:#e4d298;font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
      .player-mind-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .player-mind-card{position:relative;min-height:260px;display:flex;flex-direction:column;justify-content:flex-end;isolation:isolate;border:1px solid #3a3b2e;background:#171811;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,.2);transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease;cursor:pointer;text-align:left;color:inherit;padding:0}
      .player-mind-card:before{content:"";position:absolute;inset:0;z-index:-3;background:radial-gradient(circle at 72% 18%,rgba(104,88,48,.54),#171811 58%)}
      .player-mind-card:after{content:"";position:absolute;inset:0;z-index:-2;background:linear-gradient(180deg,rgba(8,9,6,.06) 4%,rgba(8,9,6,.32) 38%,rgba(8,9,6,.92) 74%,rgba(8,9,6,.99) 100%)}
      .player-mind-card-content{position:relative;z-index:1;padding:22px 22px 20px}
      .player-mind-card:hover{border-color:#9c8a55;transform:translateY(-3px);box-shadow:0 24px 60px rgba(0,0,0,.34)}
      .player-mind-card:focus-visible{outline:2px solid #d6bd72;outline-offset:3px}
      .player-mind-topline{display:flex;justify-content:space-between;gap:14px;align-items:center}
      .player-mind-state,.player-mind-slot{font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,.9)}
      .player-mind-state{color:#e2c878}.player-mind-slot{color:#aaa28f}
      .player-mind-card h3{font:clamp(23px,2vw,30px)/1.08 Georgia,serif;margin:10px 0 10px;color:#f0e7ce;text-wrap:balance;text-shadow:0 2px 14px rgba(0,0,0,.75)}
      .player-mind-source{margin:0;color:#b9b09a;font-size:10px;line-height:1.5;text-transform:uppercase;letter-spacing:.08em}
      .player-mind-open{display:inline-block;margin-top:14px;color:#dcc989;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
      .player-mind-empty{min-height:260px;border:1px dashed #3e3c31;background:#14150f;display:flex;align-items:center;justify-content:center;padding:22px;text-align:center;color:#777261}
      .player-mind-empty strong{display:block;color:#9d9680;font:20px Georgia,serif;margin-bottom:6px}.player-mind-empty span{font-size:10px;line-height:1.5}
      @media(max-width:1120px){.player-mind-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.player-mind-grid{grid-template-columns:1fr}.player-mind-card,.player-mind-empty{min-height:220px}}
      @media(max-width:650px){.player-mind-view{padding-top:34px}.player-mind-view .section-head{display:block}.player-mind-summary{margin-top:12px}}
      @media(prefers-reduced-motion:reduce){.player-mind-card{transition:none}.player-mind-card:hover{transform:none}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    host.querySelector('.player-mind-view')?.remove();
    if (!isPlayerView()) return;

    const firstThread = host.querySelector('.interest-thread, .goals-empty, .goal-form');
    if (!firstThread && /Loading|unavailable/i.test(host.textContent || '')) return;

    const minds = activeMindCards();
    ensureStyles();

    const section = document.createElement('section');
    section.className = 'player-mind-view';
    section.setAttribute('aria-label', "What's on my mind");

    const cards = [];
    minds.forEach((card, index) => {
      const title = titleFor(card);
      const state = stateFor(card);
      const source = sourceFor(card);
      const id = card.dataset.goalId || '';
      cards.push(`<button type="button" class="player-mind-card" data-player-mind-goal="${escapeHTML(id)}"><span class="player-mind-card-content"><span class="player-mind-topline"><span class="player-mind-state">${escapeHTML(state)}</span><span class="player-mind-slot">SLOT ${index + 1} OF 5</span></span><h3>${escapeHTML(title)}</h3>${source ? `<span class="player-mind-source">Connected to · ${escapeHTML(source)}</span>` : ''}<span class="player-mind-open">Open this thought →</span></span></button>`);
    });
    for (let index = minds.length; index < 5; index++) {
      cards.push(`<div class="player-mind-empty" aria-label="Empty priority slot ${index + 1}"><div><strong>Open slot</strong><span>Anything you add to your mind from around Greywake can occupy this space.</span></div></div>`);
    }

    section.innerHTML = `<div class="section-head"><div><div class="eyebrow">YOUR CURRENT PRIORITIES</div><h2>What's on my mind</h2><div class="player-mind-count">${minds.length}/5 ACTIVE SLOTS</div></div><p>These are the things currently at the front of your character's mind. They are not promises or assigned quests — they tell the GM what you may want to explore.</p></div><p class="player-mind-summary">Add things from people, places, creatures, mysteries and other records around the site. When your interests change, your five slots can change with them.</p><div class="player-mind-grid">${cards.join('')}</div>`;

    host.prepend(section);
    section.querySelectorAll('[data-player-mind-goal]').forEach(button => button.addEventListener('click', () => {
      const target = host.querySelector(`.interest-thread[data-goal-id="${button.dataset.playerMindGoal}"]`);
      target?.scrollIntoView({behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'center'});
      target?.classList.add('engagement-flash');
      window.setTimeout(() => target?.classList.remove('engagement-flash'), 900);
    }));
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      render();
    });
  }

  new MutationObserver(schedule).observe(host, {childList:true, subtree:true});
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
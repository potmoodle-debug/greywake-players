(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;
  let scheduled = false;

  function isPlayerView() {
    return document.body.dataset.role !== 'gm' || document.body.dataset.gmPreview === 'true';
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[ch]));
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

  function sourceRouteFor(card) {
    return card.querySelector('.interest-source-link[data-engagement-route]')?.dataset.engagementRoute || '';
  }

  function matchingPossibilityImage(title, source) {
    const wanted = [title, source].filter(Boolean).map(value => value.toLowerCase());
    const cards = [...document.querySelectorAll('#currentThreadsGrid .thread-card')];
    for (const card of cards) {
      const cardTitle = card.querySelector('h3')?.textContent?.trim().toLowerCase() || '';
      if (!wanted.some(value => value && (cardTitle.includes(value) || value.includes(cardTitle)))) continue;
      const image = card.querySelector('.thread-card-image:not(.thread-card-image-fallback)');
      if (image?.getAttribute('src')) return image.getAttribute('src');
    }
    return '';
  }

  function ensureStyles() {
    if (document.getElementById('player-mind-view-styles')) return;
    const style = document.createElement('style');
    style.id = 'player-mind-view-styles';
    style.textContent = `
      .player-mind-view{padding:34px clamp(22px,5vw,75px) 32px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#15150f 0%,#11120e 100%)}
      .player-mind-view .section-head{align-items:center;margin-bottom:14px}.player-mind-view .section-head p{max-width:520px;font-size:11px}
      .player-mind-summary{margin:-2px 0 15px;color:#8f8875;font-size:10px;line-height:1.5;border-left:2px solid #756a43;padding-left:12px}
      .player-mind-count{display:inline-flex;align-items:center;margin-top:7px;padding:5px 8px;border:1px solid rgba(210,190,128,.42);background:rgba(16,17,13,.76);color:#e4d298;font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
      .player-mind-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}
      .player-mind-card{position:relative;min-height:164px;display:flex;flex-direction:column;justify-content:flex-end;isolation:isolate;border:1px solid #3a3b2e;background:#171811;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,.18);transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease;cursor:pointer;text-align:left;color:inherit;padding:0}
      .player-mind-card-bg{position:absolute;inset:0;z-index:-4;width:100%;height:100%;object-fit:cover;filter:saturate(.7) contrast(1.07) brightness(.65);transition:transform .4s ease,filter .4s ease}
      .player-mind-card-fallback{position:absolute;inset:0;z-index:-4;background:radial-gradient(circle at 72% 18%,rgba(104,88,48,.55),#171811 60%)}
      .player-mind-card:after{content:"";position:absolute;inset:0;z-index:-2;background:linear-gradient(180deg,rgba(8,9,6,.08) 3%,rgba(8,9,6,.30) 36%,rgba(8,9,6,.92) 76%,rgba(8,9,6,.99) 100%)}
      .player-mind-card:before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(195,169,104,.07),transparent 48%)}
      .player-mind-card-content{position:relative;z-index:1;padding:13px}
      .player-mind-card:hover{border-color:#9c8a55;transform:translateY(-3px);box-shadow:0 18px 38px rgba(0,0,0,.3)}
      .player-mind-card:hover .player-mind-card-bg{transform:scale(1.04);filter:saturate(.84) contrast(1.05) brightness(.72)}
      .player-mind-card:focus-visible{outline:2px solid #d6bd72;outline-offset:3px}
      .player-mind-topline{display:flex;justify-content:space-between;gap:8px;align-items:center}
      .player-mind-state,.player-mind-slot{font-size:7px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,.9)}
      .player-mind-state{color:#e2c878}.player-mind-slot{color:#aaa28f}
      .player-mind-card h3{font:17px/1.1 Georgia,serif;margin:7px 0 6px;color:#f0e7ce;text-wrap:balance;text-shadow:0 2px 12px rgba(0,0,0,.78)}
      .player-mind-source{display:block;color:#a9a18e;font-size:8px;line-height:1.4;text-transform:uppercase;letter-spacing:.07em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .player-mind-open{display:inline-block;margin-top:7px;color:#dcc989;font-size:7px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}
      .player-mind-empty{min-height:164px;border:1px dashed #3e3c31;background:linear-gradient(180deg,#171811,#13140f);display:flex;align-items:flex-end;padding:13px;text-align:left;color:#777261}
      .player-mind-empty strong{display:block;color:#9d9680;font:16px Georgia,serif;margin-bottom:3px}.player-mind-empty span{font-size:8px;line-height:1.4}
      @media(max-width:1200px){.player-mind-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:820px){.player-mind-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:520px){.player-mind-grid{grid-template-columns:1fr}.player-mind-card,.player-mind-empty{min-height:145px}.player-mind-view{padding-top:28px}.player-mind-view .section-head{display:block}.player-mind-summary{margin-top:10px}}
      @media(prefers-reduced-motion:reduce){.player-mind-card,.player-mind-card-bg{transition:none}.player-mind-card:hover{transform:none}}
    `;
    document.head.appendChild(style);
  }

  function openMind(card) {
    const route = sourceRouteFor(card);
    if (route) {
      location.hash = route;
      return;
    }
    window.dispatchEvent(new CustomEvent('greywake:open-player-inbox', {detail:{goalId:card.dataset.goalId || ''}}));
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
      const image = matchingPossibilityImage(title, source);
      const visual = image
        ? `<img class="player-mind-card-bg" src="${escapeHTML(image)}" alt="" loading="lazy" decoding="async">`
        : `<span class="player-mind-card-fallback" aria-hidden="true"></span>`;
      const openLabel = sourceRouteFor(card) ? 'Open record →' : 'Open details →';
      cards.push(`<button type="button" class="player-mind-card" data-player-mind-goal="${escapeHTML(id)}">${visual}<span class="player-mind-card-content"><span class="player-mind-topline"><span class="player-mind-state">${escapeHTML(state)}</span><span class="player-mind-slot">${index + 1}/5</span></span><h3>${escapeHTML(title)}</h3>${source ? `<span class="player-mind-source">${escapeHTML(source)}</span>` : ''}<span class="player-mind-open">${openLabel}</span></span></button>`);
    });
    for (let index = minds.length; index < 5; index++) {
      cards.push(`<div class="player-mind-empty" aria-label="Empty priority slot ${index + 1}"><div><strong>Open slot</strong><span>${index + 1}/5 · Add something from around Greywake.</span></div></div>`);
    }

    section.innerHTML = `<div class="section-head"><div><div class="eyebrow">YOUR CURRENT PRIORITIES</div><h2>What's on my mind</h2><div class="player-mind-count">${minds.length}/5 ACTIVE</div></div><p>The things your character currently cares about most.</p></div><p class="player-mind-summary">Open a card to return to its record or to its conversation with the GM.</p><div class="player-mind-grid">${cards.join('')}</div>`;

    host.prepend(section);
    section.querySelectorAll('[data-player-mind-goal]').forEach(button => button.addEventListener('click', () => {
      const card = host.querySelector(`.interest-thread[data-goal-id="${button.dataset.playerMindGoal}"]`);
      if (card) openMind(card);
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
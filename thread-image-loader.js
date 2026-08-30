(() => {
  const WHITE_DOOR_SRC = 'assets/canon/locations/white-door-canon.svg?v=canon1';
  const RELATED_RECORDS = {
    'groundfall-freight': 'Ash-Plate Groundfall',
    'route-markers': 'Failed Marker',
    'cistern-plate': 'Cistern Plate',
    'ash-plate-recovery': 'Ash-Plate',
    'greywake-work': 'Greywake',
    'nemi-stilling': 'Nemi',
    'tavi-faithful': 'Tavi',
    'closing-ways': 'Diggers'
  };
  const NEXT_STEPS = {
    'something-moved-in': 'Ask a Digger what changed at the ruin, pursue the southern lead, or leave it alone until it matters to you.',
    'groundfall-freight': 'Ask who wants the freight back, return east to the Groundfall, or find out whether anyone else has gone after it.',
    'route-markers': 'Compare known markers, inspect the physical cuts and repairs, or question people who regularly use the eastern routes.',
    'cistern-plate': 'Find out who currently has custody of the Plate, what examination is happening, or let Greywake deal with it without you.',
    'ash-plate-recovery': 'Check on Ash-Plate, speak to the handlers about her recovery, or inspect whether harness and load damage contributed.',
    'greywake-work': 'Talk to someone your character already knows and ask what currently needs doing. No formal quest is required.',
    'flickerfly-study': 'Identify the Digger linked to the translucent wing fragment and learn exactly where it was found before choosing an expedition.',
    'nemi-stilling': 'Review previous cases, ask what treatments have already been tried, speak to people around Nemi, or leave the question for play.',
    'tavi-faithful': 'Speak to Tavi, watch how the Faithful approach them, ask someone you trust what they have noticed, or leave the relationship alone.',
    'closing-ways': 'Inspect a closure, compare who knew each entrance, or quietly speak to Digger crews before deciding who you trust.',
    'white-tunnel': 'Return to the door, inspect its construction, compare it with the Oldwork finger, tell someone else, or leave it untouched.'
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[ch]));
  }

  function ensureStyles() {
    if (document.getElementById('thread-action-styles')) return;
    const style = document.createElement('style');
    style.id = 'thread-action-styles';
    style.textContent = `
      .thread-card[data-thread]{cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
      .thread-card[data-thread]:hover{transform:translateY(-2px);border-color:#786d49;box-shadow:0 18px 38px rgba(0,0,0,.28)}
      .thread-card[data-thread]:focus-visible{outline:2px solid #c6ae69;outline-offset:3px}
      .thread-card .context-question,.thread-card button,.thread-card textarea,.thread-card input,.thread-card a{cursor:auto}
      .thread-card-open-hint{position:absolute;right:16px;top:48px;z-index:4;padding:5px 8px;background:rgba(12,12,10,.72);border:1px solid rgba(205,183,118,.35);color:#d7c79b;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;pointer-events:none}
      .thread-detail-backdrop{position:fixed;inset:0;z-index:10020;background:rgba(4,4,3,.82);backdrop-filter:blur(7px);display:grid;place-items:center;padding:28px}
      .thread-detail{width:min(920px,100%);max-height:min(860px,92vh);overflow:auto;background:#151510;border:1px solid #5d5438;box-shadow:0 30px 90px rgba(0,0,0,.65);position:relative}
      .thread-detail-hero{height:260px;position:relative;overflow:hidden;background:#1b1a14}
      .thread-detail-hero img{width:100%;height:100%;object-fit:cover;display:block}
      .thread-detail-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,6,.12),rgba(8,8,6,.88))}
      .thread-detail-body{padding:24px clamp(20px,4vw,38px) 30px}
      .thread-detail-top{display:flex;gap:12px;justify-content:space-between;align-items:flex-start}
      .thread-detail-label{font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#cdb676}
      .thread-detail-scope{font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#827b67}
      .thread-detail h2{font:clamp(30px,5vw,48px) Georgia,serif;color:#eee4c8;margin:8px 0 12px}
      .thread-detail-direction{display:inline-block;border:1px solid #5c5234;background:#211f16;padding:6px 9px;color:#d8c78d;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px}
      .thread-detail-summary{font-size:16px;line-height:1.65;color:#d0c7ae;margin:0 0 18px}
      .thread-detail-known{font-size:13px;line-height:1.7;color:#aaa28d;border-top:1px solid #333126;padding-top:16px}
      .thread-detail-section{margin-top:20px;padding:16px 18px;background:#1d1c16;border:1px solid #373326}
      .thread-detail-section small{display:block;color:#b9a264;font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:7px}
      .thread-detail-section p{margin:0;color:#cec4aa;font-size:13px;line-height:1.65}
      .thread-detail-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
      .thread-detail-actions button{border:1px solid #655b3d;background:#222017;color:#e4d5a6;padding:11px 14px;cursor:pointer;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
      .thread-detail-actions button:hover{border-color:#a18d50;color:#fff0bd}
      .thread-detail-close{position:absolute;z-index:3;right:14px;top:14px;width:38px;height:38px;border:1px solid rgba(255,255,255,.28);background:rgba(10,10,8,.68);color:#f2e8cf;font-size:24px;line-height:1;cursor:pointer}
      .thread-card-help{margin-top:-12px;margin-bottom:20px;color:#77715f;font-size:10px;letter-spacing:.04em}
      @media(max-width:650px){.thread-detail-backdrop{padding:0;align-items:end}.thread-detail{max-height:94vh;border-left:0;border-right:0;border-bottom:0}.thread-detail-hero{height:190px}.thread-card-open-hint{top:44px;right:12px}}
    `;
    document.head.appendChild(style);
  }

  function hydrateWhiteDoor() {
    const card = document.querySelector('.thread-card[data-thread="white-tunnel"]');
    if (!card) return;
    const existing = card.querySelector('.thread-card-image');
    if (existing && !existing.classList.contains('thread-card-image-fallback')) {
      existing.src = WHITE_DOOR_SRC;
      card.dataset.whiteDoorImageReady = 'true';
      return;
    }
    const fallback = card.querySelector('.thread-card-image-fallback');
    if (!fallback) return;
    const img = document.createElement('img');
    img.className = 'thread-card-image';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = WHITE_DOOR_SRC;
    fallback.replaceWith(img);
    card.dataset.whiteDoorImageReady = 'true';
  }

  function isInteractiveTarget(target) {
    return Boolean(target.closest('button,a,input,textarea,select,label,form,.context-question'));
  }

  function closeDetail() {
    document.querySelector('.thread-detail-backdrop')?.remove();
    document.body.classList.remove('thread-detail-open');
  }

  function openAsk(card) {
    closeDetail();
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const tryOpen = () => {
      const toggle = card.querySelector('.context-question-toggle');
      if (toggle && toggle.getAttribute('aria-expanded') !== 'true') toggle.click();
    };
    tryOpen();
    setTimeout(tryOpen, 150);
  }

  function openInterest(card, title) {
    closeDetail();
    const form = document.getElementById('goalForm');
    const input = document.getElementById('goalInput');
    if (!form || !input) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    input.value = `I want to pursue: ${title}`;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => input.focus(), 350);
  }

  function goRecord(name) {
    closeDetail();
    location.hash = '#/record/' + encodeURIComponent(name);
  }

  function openDetail(card) {
    closeDetail();
    const id = card.dataset.thread || '';
    const title = card.querySelector('h3')?.textContent?.trim() || 'Possibility';
    const status = card.querySelector('.thread-status')?.textContent?.trim() || '';
    const scope = card.querySelector('.thread-scope')?.textContent?.trim() || '';
    const direction = card.querySelector('.thread-direction')?.textContent?.trim() || '';
    const summary = card.querySelector('.thread-summary')?.textContent?.trim() || '';
    const known = card.querySelector('.thread-known')?.textContent?.trim() || '';
    const relevanceLabel = card.querySelector('.thread-relevance span')?.textContent?.trim() || '';
    const relevance = card.querySelector('.thread-relevance p')?.textContent?.trim() || '';
    const image = card.querySelector('.thread-card-image:not(.thread-card-image-fallback)')?.getAttribute('src') || '';
    const user = window.GreywakePlayer || null;
    const canAct = user?.role === 'player' && document.body.dataset.gmPreview !== 'true';
    const related = RELATED_RECORDS[id];
    const hasRelated = Boolean(related && window.GREYWAKE_DATA?.[related]);
    const next = NEXT_STEPS[id] || 'Ask about this, make it one of your interests, or leave it alone until it matters.';

    const backdrop = document.createElement('div');
    backdrop.className = 'thread-detail-backdrop';
    backdrop.setAttribute('role', 'presentation');
    backdrop.innerHTML = `
      <section class="thread-detail" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <button class="thread-detail-close" type="button" aria-label="Close">×</button>
        ${image ? `<div class="thread-detail-hero"><img src="${esc(image)}" alt=""></div>` : ''}
        <div class="thread-detail-body">
          <div class="thread-detail-top"><span class="thread-detail-label">${esc(status)}</span><span class="thread-detail-scope">${esc(scope)}</span></div>
          <h2>${esc(title)}</h2>
          ${direction ? `<div class="thread-detail-direction">${esc(direction)}</div>` : ''}
          <p class="thread-detail-summary">${esc(summary)}</p>
          ${known ? `<p class="thread-detail-known">${esc(known)}</p>` : ''}
          ${relevance ? `<div class="thread-detail-section"><small>${esc(relevanceLabel || 'Why this might matter')}</small><p>${esc(relevance)}</p></div>` : ''}
          <div class="thread-detail-section"><small>What you can do next</small><p>${esc(next)}</p></div>
          <div class="thread-detail-actions">
            ${canAct ? '<button type="button" data-thread-action="ask">Ask about this</button><button type="button" data-thread-action="interest">Add to my interests</button>' : ''}
            ${hasRelated ? '<button type="button" data-thread-action="record">Open related record</button>' : ''}
            <button type="button" data-thread-action="all">Open all possibilities</button>
          </div>
        </div>
      </section>`;

    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) closeDetail();
    });
    backdrop.querySelector('.thread-detail-close')?.addEventListener('click', closeDetail);
    backdrop.querySelector('[data-thread-action="ask"]')?.addEventListener('click', () => openAsk(card));
    backdrop.querySelector('[data-thread-action="interest"]')?.addEventListener('click', () => openInterest(card, title));
    backdrop.querySelector('[data-thread-action="record"]')?.addEventListener('click', () => goRecord(related));
    backdrop.querySelector('[data-thread-action="all"]')?.addEventListener('click', () => goRecord('Jobs & Open Threads'));
    document.body.appendChild(backdrop);
    document.body.classList.add('thread-detail-open');
    backdrop.querySelector('.thread-detail-close')?.focus();
  }

  function enhanceCards() {
    ensureStyles();
    hydrateWhiteDoor();
    const intro = document.querySelector('.possibility-intro');
    if (intro && !document.querySelector('.thread-card-help')) {
      const hint = document.createElement('div');
      hint.className = 'thread-card-help';
      hint.textContent = 'Open a card for details, possible next steps and related records.';
      intro.insertAdjacentElement('afterend', hint);
    }
    document.querySelectorAll('.thread-card[data-thread]').forEach(card => {
      if (card.dataset.clickReady === 'true') return;
      card.dataset.clickReady = 'true';
      card.tabIndex = 0;
      const hint = document.createElement('span');
      hint.className = 'thread-card-open-hint';
      hint.textContent = 'Open details';
      card.appendChild(hint);
      card.addEventListener('click', event => {
        if (isInteractiveTarget(event.target)) return;
        openDetail(card);
      });
      card.addEventListener('keydown', event => {
        if ((event.key === 'Enter' || event.key === ' ') && !isInteractiveTarget(event.target)) {
          event.preventDefault();
          openDetail(card);
        }
      });
    });
  }

  const grid = document.getElementById('currentThreadsGrid');
  if (grid) new MutationObserver(() => requestAnimationFrame(enhanceCards)).observe(grid, { childList: true, subtree: true });
  window.addEventListener('greywake:player-ready', () => requestAnimationFrame(enhanceCards));
  window.addEventListener('greywake:engagement-changed', () => requestAnimationFrame(enhanceCards));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDetail();
  });
  document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(enhanceCards));
})();

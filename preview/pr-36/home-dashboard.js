(() => {
  const home = document.getElementById('home');
  const goals = document.getElementById('playerGoals');
  const threads = document.getElementById('currentThreads');
  const hero = home?.querySelector('.hero');
  const discoveries = home?.querySelector('.discoveries');
  if (!home || !goals || !threads || !hero) return;

  function isPlayerFacing() {
    return document.body.dataset.role !== 'gm' || document.body.dataset.gmPreview === 'true';
  }

  function recordHref(name) {
    return '#/record/' + encodeURIComponent(name);
  }

  function goRecord(name) {
    location.hash = recordHref(name);
  }

  function questionCount() {
    return goals.querySelectorAll('.interest-thread[data-entry-kind="question"]:not(.interest-thread-resolved)').length;
  }

  function activeMindCount() {
    return [...goals.querySelectorAll('.interest-thread[data-entry-kind="interest"]:not(.interest-thread-resolved)')].filter(card => {
      const status = (card.querySelector('.interest-status')?.textContent || '').toUpperCase();
      return !status.includes('DORMANT') && !status.includes('RESOLVED');
    }).length;
  }

  function replyCount() {
    return goals.querySelectorAll('.interest-message-gm').length;
  }

  function playerName() {
    return window.GreywakePlayer?.character || document.body.dataset.character || 'Character';
  }

  function ensureContinuePanel() {
    let panel = document.getElementById('playerContinuePanel');
    if (!isPlayerFacing()) {
      panel?.remove();
      return;
    }
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'playerContinuePanel';
      panel.className = 'player-continue-panel';
      hero.insertAdjacentElement('afterend', panel);
    }
    const q = questionCount();
    const replies = replyCount();
    const minds = activeMindCount();
    const name = playerName();
    panel.innerHTML = `
      <div class="player-continue-head"><div><div class="eyebrow">START HERE</div><h2>Continue as ${name}</h2></div><p>Your quickest routes back into the game.</p></div>
      <div class="player-continue-grid">
        <a href="#/character" class="player-continue-card player-continue-primary"><small>Character</small><strong>Open ${name}</strong><span>Hope, Stress, abilities, attacks, gear and character details.</span><em>Open dossier →</em></a>
        <button type="button" class="player-continue-card" data-home-action="inbox"><small>Between games</small><strong>Questions & replies</strong><span>${q ? `${q} open question${q === 1 ? '' : 's'}` : 'No open questions'}${replies ? ' · GM replies recorded' : ''}.</span><em>Open conversations ↓</em></button>
        <button type="button" class="player-continue-card" data-home-action="mind"><small>Your priorities</small><strong>${Math.min(minds,5)}/5 on my mind</strong><span>See what currently matters most to your character.</span><em>View priorities ↓</em></button>
      </div>`;
  }

  function ensureNav() {
    if (!isPlayerFacing()) {
      document.body.classList.remove('player-home-dashboard');
      document.getElementById('playerHomeNav')?.remove();
      document.getElementById('playerContinuePanel')?.remove();
      document.getElementById('playerInboxToggleWrap')?.remove();
      goals.classList.remove('player-inbox-open');
      return;
    }
    document.body.classList.add('player-home-dashboard');
    ensureContinuePanel();

    let nav = document.getElementById('playerHomeNav');
    if (!nav) {
      nav = document.createElement('section');
      nav.id = 'playerHomeNav';
      nav.className = 'player-home-nav';
      nav.setAttribute('aria-label', 'Explore Greywake');
    }
    if (threads.nextElementSibling !== nav) threads.insertAdjacentElement('afterend', nav);

    nav.innerHTML = `
      <div class="player-home-nav-head">
        <div><div class="eyebrow">EXPLORE GREYWAKE</div><h2>Where do you want to go?</h2></div>
        <p>Browse the parts of the campaign record that are useful to you now.</p>
      </div>
      <div class="player-home-nav-grid">
        <a class="player-home-tile" href="${recordHref('Known People')}"><small>People</small><strong>Who do I know?</strong><span>NPCs, contacts and people the party has learned about.</span><em>Browse people →</em></a>
        <a class="player-home-tile" href="${recordHref('Known Locations')}"><small>Places</small><strong>Where can I go?</strong><span>Greywake, Greater Greywake, routes and known locations.</span><em>Browse places →</em></a>
        <a class="player-home-tile" href="${recordHref('Known Flora and Fauna')}"><small>Field guide</small><strong>Creatures & plants</strong><span>Wildlife, flora, harvesting knowledge and encountered creatures.</span><em>Open field guide →</em></a>
        <a class="player-home-tile" href="#/brain"><small>Connections</small><strong>Player Brain</strong><span>Follow relationships between people, places, events and discoveries.</span><em>Explore connections →</em></a>
        <a class="player-home-tile" href="${recordHref('Greywake')}"><small>Settlement</small><strong>Greywake overview</strong><span>Return to the core record for the town and what the party knows about it.</span><em>Open overview →</em></a>
        <a class="player-home-tile" href="${recordHref('Jobs & Open Threads')}"><small>All possibilities</small><strong>Everything out there</strong><span>Open the complete list rather than only the featured possibilities on Home.</span><em>See all possibilities →</em></a>
      </div>`;

    ensureInboxToggle();
  }

  function ensureInboxToggle() {
    let wrap = document.getElementById('playerInboxToggleWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'playerInboxToggleWrap';
      wrap.className = 'player-inbox-toggle-wrap';
      goals.insertAdjacentElement('afterend', wrap);
    }
    const q = questionCount();
    const replies = replyCount();
    const open = goals.classList.contains('player-inbox-open');
    wrap.innerHTML = `<button type="button" class="player-inbox-toggle" aria-expanded="${open}"><span><strong>Questions & replies</strong><span>${q ? q + ' open question' + (q === 1 ? '' : 's') : 'No open questions'}${replies ? ' · GM replies recorded' : ''}</span></span><em>${open ? 'Close ↑' : 'Open ↓'}</em></button>`;
  }

  function toggleInbox(goalId = '') {
    const next = !goals.classList.contains('player-inbox-open') || Boolean(goalId);
    goals.classList.toggle('player-inbox-open', next);
    ensureInboxToggle();
    if (next) {
      requestAnimationFrame(() => {
        const target = goalId ? goals.querySelector(`.interest-thread[data-goal-id="${goalId}"]`) : goals.querySelector('.player-goals-head, .interest-thread');
        (target || goals).scrollIntoView({behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
        if (target?.classList.contains('interest-thread')) {
          target.classList.add('engagement-flash');
          setTimeout(() => target.classList.remove('engagement-flash'), 900);
        }
      });
    }
  }

  function mindSection() {
    return goals.querySelector('.player-mind-view');
  }

  function handleHomeClick(event) {
    const button = event.target.closest('button');
    if (!button || !home.contains(button)) return;

    const action = button.dataset.homeAction;
    if (action === 'inbox') { event.preventDefault(); toggleInbox(); return; }
    if (action === 'mind') { event.preventDefault(); mindSection()?.scrollIntoView({behavior:'smooth',block:'start'}); return; }
    if (action === 'out-there') { event.preventDefault(); threads.scrollIntoView({behavior:'smooth',block:'start'}); return; }

    if (button.id === 'openAllThreads') {
      event.preventDefault();
      goRecord('Jobs & Open Threads');
      return;
    }

    if (button.dataset.note && button.closest('.hero')) {
      event.preventDefault();
      goRecord(button.dataset.note);
    }
  }

  function enhance() {
    ensureNav();
    if (discoveries && document.getElementById('playerHomeNav') && discoveries.previousElementSibling !== document.getElementById('playerHomeNav')) {
      document.getElementById('playerHomeNav').insertAdjacentElement('afterend', discoveries);
    }
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; enhance(); });
  }

  home.addEventListener('click', handleHomeClick);
  window.addEventListener('greywake:open-player-inbox', event => toggleInbox(event.detail?.goalId || ''));
  new MutationObserver(schedule).observe(goals,{childList:true,subtree:true});
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
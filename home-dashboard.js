(() => {
  const home = document.getElementById('home');
  const goals = document.getElementById('playerGoals');
  const threads = document.getElementById('currentThreads');
  if (!home || !goals || !threads) return;

  function isPlayerFacing() {
    return document.body.dataset.role !== 'gm' || document.body.dataset.gmPreview === 'true';
  }

  function goRecord(name) {
    location.hash = '#/record/' + encodeURIComponent(name);
  }

  function questionCount() {
    return goals.querySelectorAll('.interest-thread[data-entry-kind="question"]:not(.interest-thread-resolved)').length;
  }

  function replyCount() {
    return goals.querySelectorAll('.interest-message-gm').length;
  }

  function ensureNav() {
    if (!isPlayerFacing()) {
      document.body.classList.remove('player-home-dashboard');
      document.getElementById('playerHomeNav')?.remove();
      document.getElementById('playerInboxToggleWrap')?.remove();
      goals.classList.remove('player-inbox-open');
      return;
    }
    document.body.classList.add('player-home-dashboard');

    let nav = document.getElementById('playerHomeNav');
    if (!nav) {
      nav = document.createElement('section');
      nav.id = 'playerHomeNav';
      nav.className = 'player-home-nav';
      nav.setAttribute('aria-label', 'Greywake home navigation');
      threads.insertAdjacentElement('beforebegin', nav);
    }

    const q = questionCount();
    const replies = replyCount();
    nav.innerHTML = `
      <div class="player-home-nav-head">
        <div><div class="eyebrow">QUICK NAVIGATION</div><h2>Where do you want to go?</h2></div>
        <p>Home is the doorway. Open the part of Greywake you actually want rather than scrolling through the whole campaign record.</p>
      </div>
      <div class="player-home-nav-grid">
        <button type="button" class="player-home-tile" data-home-action="out-there"><small>Possibilities</small><strong>What's out there</strong><span>Known leads, situations and things the party could pursue.</span></button>
        <button type="button" class="player-home-tile" data-home-action="character"><small>Personal</small><strong>My character</strong><span>Hope, Stress, abilities, attacks, gear and character record.</span></button>
        <button type="button" class="player-home-tile" data-home-record="Known People"><small>Greywake</small><strong>People</strong><span>People your character and the party currently know.</span></button>
        <button type="button" class="player-home-tile" data-home-record="Known Locations"><small>Explore</small><strong>Places</strong><span>Greywake, Greater Greywake and places learned through play.</span></button>
        <button type="button" class="player-home-tile" data-home-record="Known Flora and Fauna"><small>Field guide</small><strong>Creatures</strong><span>Known fauna, flora, harvesting knowledge and encountered wildlife.</span></button>
        <button type="button" class="player-home-tile" data-home-action="brain"><small>Connections</small><strong>Player Brain</strong><span>Explore the campaign through relationships between known records.</span></button>
        <button type="button" class="player-home-tile" data-home-action="inbox"><small>Between games</small><strong>Questions & replies</strong><span>Open your conversations with the GM and add a new thought.</span>${q || replies ? `<b class="player-home-badge">${q ? q + ' OPEN' : replies + ' REPLIES'}</b>` : ''}</button>
      </div>`;

    nav.querySelector('[data-home-action="out-there"]')?.addEventListener('click', () => threads.scrollIntoView({behavior:'smooth',block:'start'}));
    nav.querySelector('[data-home-action="character"]')?.addEventListener('click', () => { location.hash = '#/character'; });
    nav.querySelector('[data-home-action="brain"]')?.addEventListener('click', () => { location.hash = '#/brain'; });
    nav.querySelectorAll('[data-home-record]').forEach(button => button.addEventListener('click', () => goRecord(button.dataset.homeRecord)));
    nav.querySelector('[data-home-action="inbox"]')?.addEventListener('click', toggleInbox);

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
    wrap.querySelector('button')?.addEventListener('click', toggleInbox);
  }

  function toggleInbox() {
    const next = !goals.classList.contains('player-inbox-open');
    goals.classList.toggle('player-inbox-open', next);
    ensureInboxToggle();
    if (next) {
      goals.scrollIntoView({behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
    }
  }

  function enhance() {
    ensureNav();
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; enhance(); });
  }

  new MutationObserver(schedule).observe(goals,{childList:true,subtree:true});
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();

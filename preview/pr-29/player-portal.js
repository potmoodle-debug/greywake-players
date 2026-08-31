(() => {
  const main = document.getElementById('mainContent');
  const home = document.getElementById('home');
  const brain = document.getElementById('brainView');
  const article = document.getElementById('article');
  const goals = document.getElementById('playerGoals');
  const threads = document.getElementById('currentThreads');
  if (!main || !home || !goals || !threads) return;

  const goalsAnchor = document.createComment('player-goals-home-anchor');
  const threadsAnchor = document.createComment('current-threads-home-anchor');
  goals.parentNode?.insertBefore(goalsAnchor, goals);
  threads.parentNode?.insertBefore(threadsAnchor, threads);

  let pendingGoalId = '';

  function accessResolved() {
    return Boolean(document.body.dataset.role);
  }

  function isPlayerFacing() {
    if (!accessResolved()) return false;
    return document.body.dataset.role !== 'gm' || document.body.dataset.gmPreview === 'true';
  }

  function routeName() {
    const hash = location.hash || '#/';
    if (hash === '#/possibilities') return 'possibilities';
    if (hash === '#/mind') return 'mind';
    if (hash === '#/inbox') return 'inbox';
    if (hash === '#/explore') return 'explore';
    if (hash === '#/character') return 'character';
    if (hash === '#/brain') return 'brain';
    if (hash.startsWith('#/record/')) return 'record';
    return 'home';
  }

  function ensurePortal() {
    let portal = document.getElementById('playerPortal');
    if (portal) return portal;
    portal = document.createElement('section');
    portal.id = 'playerPortal';
    portal.className = 'player-portal hidden';
    portal.setAttribute('aria-label', 'Greywake player portal');
    portal.innerHTML = `
      <div class="player-portal-topbar">
        <a class="player-portal-home" href="#/">← Greywake home</a>
        <div class="player-portal-title"><small id="playerPortalEyebrow">PLAYER VIEW</small><strong id="playerPortalHeading">Greywake</strong></div>
        <a class="player-portal-explore" href="#/explore">Explore Greywake</a>
      </div>
      <div id="playerPortalContent" class="player-portal-content"></div>
      <div id="playerPortalParking" class="player-portal-parking" hidden></div>`;
    article?.insertAdjacentElement('beforebegin', portal);
    if (!portal.parentElement) main.appendChild(portal);
    return portal;
  }

  function parking() {
    return ensurePortal().querySelector('#playerPortalParking');
  }

  function parkLiveNodes() {
    const park = parking();
    if (!park) return;
    if (goals.parentElement !== park) park.appendChild(goals);
    if (threads.parentElement !== park) park.appendChild(threads);
  }

  function restoreForGM() {
    if (goalsAnchor.parentNode && goals.parentNode !== goalsAnchor.parentNode) goalsAnchor.parentNode.insertBefore(goals, goalsAnchor.nextSibling);
    if (threadsAnchor.parentNode && threads.parentNode !== threadsAnchor.parentNode) threadsAnchor.parentNode.insertBefore(threads, threadsAnchor.nextSibling);
  }

  function setHeading(eyebrow, heading) {
    const portal = ensurePortal();
    const eyebrowEl = portal.querySelector('#playerPortalEyebrow');
    const headingEl = portal.querySelector('#playerPortalHeading');
    if (eyebrowEl) eyebrowEl.textContent = eyebrow;
    if (headingEl) headingEl.textContent = heading;
    const crumb = document.getElementById('crumb');
    if (crumb) crumb.textContent = `Greywake / ${heading}`;
  }

  function showPortal(page, eyebrow, heading) {
    const portal = ensurePortal();
    const content = portal.querySelector('#playerPortalContent');
    parkLiveNodes();
    content?.replaceChildren();
    portal.className = `player-portal player-portal-${page}`;
    setHeading(eyebrow, heading);
    home.classList.add('hidden');
    brain?.classList.add('hidden');
    article?.classList.add('hidden');
    document.getElementById('characterPageView')?.classList.add('hidden');
    portal.classList.remove('hidden');
    window.scrollTo({top:0, behavior:'auto'});
    return content;
  }

  function introBlock(kicker, title, copy) {
    const section = document.createElement('section');
    section.className = 'player-portal-intro';
    section.innerHTML = `<div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${copy}</p>`;
    return section;
  }

  function renderPossibilities() {
    const content = showPortal('possibilities', 'PARTY-KNOWN POSSIBILITIES', "What's out there");
    if (!content) return;
    content.appendChild(introBlock('THE WORLD IS MOVING', "What's out there?", 'These are concrete things the party knows it could pursue. Nothing here is an assignment; choosing one is what turns a possibility into play.'));
    content.appendChild(threads);
    document.title = "What's out there — Greywake";
  }

  function renderMind() {
    const content = showPortal('mind', 'PERSONAL PRIORITIES', 'On my mind');
    if (!content) return;
    content.appendChild(introBlock('YOUR FIVE SLOTS', "What's on my mind", 'A quick reference to the few things currently at the front of your character’s attention. These are interests, not automatic quests or party commitments.'));
    content.appendChild(goals);
    document.title = 'On my mind — Greywake';
  }

  function renderInbox() {
    const content = showPortal('inbox', 'BETWEEN GAMES', 'Questions & replies');
    if (!content) return;
    content.appendChild(introBlock('YOUR CONVERSATIONS', 'Questions & replies', 'Ask about something you have seen, follow a reply from the GM, or turn a question into something you want to keep on your mind.'));
    content.appendChild(goals);
    document.title = 'Questions & replies — Greywake';
    requestAnimationFrame(() => {
      const safeEscape = window.CSS?.escape ? CSS.escape(String(pendingGoalId)) : String(pendingGoalId).replace(/[^a-zA-Z0-9_-]/g, '');
      const target = pendingGoalId ? goals.querySelector(`.interest-thread[data-goal-id="${safeEscape}"]`) : null;
      pendingGoalId = '';
      if (!target) return;
      target.scrollIntoView({behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
      target.classList.add('engagement-flash');
      setTimeout(() => target.classList.remove('engagement-flash'), 1000);
    });
  }

  function recordHref(name) {
    return '#/record/' + encodeURIComponent(name);
  }

  function renderExplore() {
    const content = showPortal('explore', 'CAMPAIGN RECORD', 'Explore Greywake');
    if (!content) return;
    content.appendChild(introBlock('KNOWN. SEEN. EARNED.', 'Explore Greywake', 'Browse the campaign record when you want context, people, places or field knowledge. This is the archive behind play, not the thing you have to read before playing.'));
    const grid = document.createElement('nav');
    grid.className = 'player-explore-grid';
    grid.setAttribute('aria-label', 'Explore Greywake records');
    grid.innerHTML = `
      <a href="${recordHref('Known People')}"><small>PEOPLE</small><strong>Who do I know?</strong><span>NPCs, contacts and people the party has learned about.</span><em>Browse people →</em></a>
      <a href="${recordHref('Known Locations')}"><small>PLACES</small><strong>Where can I go?</strong><span>Greywake, Greater Greywake, routes and discovered locations.</span><em>Browse places →</em></a>
      <a href="${recordHref('Known Flora and Fauna')}"><small>FIELD GUIDE</small><strong>Creatures & plants</strong><span>Wildlife, flora and practical harvesting knowledge.</span><em>Open field guide →</em></a>
      <a href="${recordHref('Greywake')}"><small>THE SETTLEMENT</small><strong>Greywake</strong><span>The party-known record of the hold itself.</span><em>Open overview →</em></a>
      <a href="#/brain"><small>CONNECTIONS</small><strong>Player Brain</strong><span>Follow relationships between people, places, events and discoveries.</span><em>Explore connections →</em></a>
      <a href="#/possibilities"><small>ACTIVE PLAY</small><strong>What's out there?</strong><span>Return to the concrete possibilities currently available to the party.</span><em>See possibilities →</em></a>`;
    content.appendChild(grid);
    document.title = 'Explore Greywake — Player Guide';
  }

  function render() {
    const page = routeName();
    document.body.dataset.playerRoute = page;

    if (!accessResolved()) {
      document.body.classList.remove('player-portal-enabled');
      document.getElementById('playerPortal')?.classList.add('hidden');
      return;
    }

    if (!isPlayerFacing()) {
      document.body.classList.remove('player-portal-enabled');
      document.getElementById('playerPortal')?.classList.add('hidden');
      restoreForGM();
      return;
    }

    document.body.classList.add('player-portal-enabled');
    parkLiveNodes();

    if (page === 'possibilities') return renderPossibilities();
    if (page === 'mind') return renderMind();
    if (page === 'inbox') return renderInbox();
    if (page === 'explore') return renderExplore();

    ensurePortal().classList.add('hidden');
    if (page === 'home') {
      home.classList.remove('hidden');
      brain?.classList.add('hidden');
      article?.classList.add('hidden');
      document.getElementById('characterPageView')?.classList.add('hidden');
      const crumb = document.getElementById('crumb');
      if (crumb) crumb.textContent = 'Greywake / Home';
      document.title = 'Greywake — Player Guide';
      window.scrollTo({top:0, behavior:'auto'});
    }
  }

  function navigate(route) {
    if (!route || !route.startsWith('#/')) return;
    if (location.hash === route) {
      render();
      return;
    }
    location.hash = route;
  }

  window.GreywakePlayerPortal = { render, navigate };

  window.addEventListener('greywake:open-player-inbox', event => {
    pendingGoalId = event.detail?.goalId || '';
    navigate('#/inbox');
  });
  window.addEventListener('greywake:player-ready', render);
  window.addEventListener('greywake:engagement-changed', () => {
    const page = routeName();
    if (['mind','inbox'].includes(page)) render();
  });
  window.addEventListener('hashchange', () => setTimeout(render, 0));
  window.addEventListener('popstate', () => setTimeout(render, 0));
  document.addEventListener('DOMContentLoaded', render);
  setTimeout(render, 140);
  render();
})();

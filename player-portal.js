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

  let knowledgeAnchor = null;
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
    if (hash === '#/my-greywake') return 'my-greywake';
    if (hash === '#/greywake' || hash === '#/explore') return 'greywake';
    if (hash === '#/campaign') return 'campaign';
    if (hash === '#/possibilities') return 'possibilities';
    if (hash === '#/mind') return 'mind';
    if (hash === '#/inbox') return 'inbox';
    if (hash === '#/character') return 'character';
    if (hash === '#/brain') return 'brain';
    if (hash.startsWith('#/record/')) return 'record';
    return 'home';
  }

  function primarySection(page = routeName()) {
    if (page === 'character') return 'character';
    if (['my-greywake','mind','inbox'].includes(page)) return 'my-greywake';
    if (['campaign','possibilities'].includes(page)) return 'campaign';
    if (['greywake','brain','record'].includes(page)) return 'greywake';
    return 'home';
  }

  function syncPrimaryNav(page = routeName()) {
    const active = primarySection(page);
    document.querySelectorAll('[data-primary-section]').forEach(node => {
      const selected = node.dataset.primarySection === active;
      node.classList.toggle('active', selected);
      if (selected) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });
  }

  function ensureKnowledgeAnchor() {
    const knowledge = document.getElementById('personalKnowledge');
    if (!knowledge || knowledgeAnchor) return knowledge;
    knowledgeAnchor = document.createComment('personal-knowledge-home-anchor');
    knowledge.parentNode?.insertBefore(knowledgeAnchor, knowledge);
    return knowledge;
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
        <a class="player-portal-home" href="#/">← Home</a>
        <div class="player-portal-title"><small id="playerPortalEyebrow">PLAYER VIEW</small><strong id="playerPortalHeading">Greywake</strong></div>
        <a class="player-portal-explore" href="#/greywake">Greywake archive</a>
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
    const knowledge = ensureKnowledgeAnchor();
    if (knowledge && knowledge.parentElement !== park) park.appendChild(knowledge);
  }

  function restoreForGM() {
    if (goalsAnchor.parentNode && goals.parentNode !== goalsAnchor.parentNode) goalsAnchor.parentNode.insertBefore(goals, goalsAnchor.nextSibling);
    if (threadsAnchor.parentNode && threads.parentNode !== threadsAnchor.parentNode) threadsAnchor.parentNode.insertBefore(threads, threadsAnchor.nextSibling);
    const knowledge = ensureKnowledgeAnchor();
    if (knowledge && knowledgeAnchor?.parentNode && knowledge.parentNode !== knowledgeAnchor.parentNode) knowledgeAnchor.parentNode.insertBefore(knowledge, knowledgeAnchor.nextSibling);
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
    syncPrimaryNav(page);
    window.scrollTo({top:0, behavior:'auto'});
    return content;
  }

  function introBlock(kicker, title, copy) {
    const section = document.createElement('section');
    section.className = 'player-portal-intro';
    section.innerHTML = `<div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${copy}</p>`;
    return section;
  }

  function hubGrid(items, className = '') {
    const nav = document.createElement('nav');
    nav.className = `player-explore-grid ${className}`.trim();
    nav.setAttribute('aria-label', 'Greywake section links');
    nav.innerHTML = items.map(item => `<a href="${item.href}"><small>${item.kicker}</small><strong>${item.title}</strong><span>${item.copy}</span><em>${item.action}</em></a>`).join('');
    return nav;
  }

  function renderMyGreywake() {
    const content = showPortal('my-greywake', 'PERSONAL RECORD', 'My Greywake');
    if (!content) return;
    content.appendChild(introBlock('WHAT BELONGS TO YOU', 'My Greywake', 'Your character’s own knowledge, relationships, interests and conversations live here. This is the personal layer of the campaign rather than the shared archive.'));
    content.appendChild(hubGrid([
      {href:'#/mind', kicker:'CURRENT PRIORITIES', title:'On my mind', copy:'The few things currently at the front of your character’s attention.', action:'Open priorities →'},
      {href:'#/inbox', kicker:'BETWEEN GAMES', title:'Questions & replies', copy:'Questions, GM replies and unfinished conversations that can continue between sessions.', action:'Open conversations →'}
    ], 'player-personal-links'));
    const knowledge = ensureKnowledgeAnchor();
    if (knowledge) {
      knowledge.classList.remove('hidden');
      content.appendChild(knowledge);
    }
    document.title = 'My Greywake — Player Guide';
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
    content.appendChild(introBlock('YOUR THREE SLOTS', "What's on my mind", 'A quick reference to the few things currently at the front of your character’s attention. These are interests, not automatic quests or party commitments.'));
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

  function renderGreywake() {
    const content = showPortal('greywake', 'SHARED WORLD RECORD', 'Greywake');
    if (!content) return;
    content.appendChild(introBlock('KNOWN. SEEN. EARNED.', 'Greywake', 'Browse the shared world when you want people, places, field knowledge or context. Player Brain remains available as a relationship view, but it is no longer the main way to navigate.'));
    content.appendChild(hubGrid([
      {href:recordHref('Known People'), kicker:'PEOPLE', title:'Who do we know?', copy:'NPCs, contacts and people the party has learned about.', action:'Browse people →'},
      {href:recordHref('Known Locations'), kicker:'PLACES', title:'Where can we go?', copy:'Greywake, Greater Greywake, routes and discovered locations.', action:'Browse places →'},
      {href:recordHref('Known Flora and Fauna'), kicker:'FIELD GUIDE', title:'Creatures & plants', copy:'Wildlife, flora and practical harvesting knowledge.', action:'Open field guide →'},
      {href:recordHref('Greywake'), kicker:'THE SETTLEMENT', title:'Greywake overview', copy:'The party-known record of the hold itself.', action:'Open overview →'},
      {href:'#/brain', kicker:'CONNECTIONS', title:'Player Brain', copy:'Follow relationships between people, places, events and discoveries.', action:'Explore connections →'}
    ]));
    document.title = 'Greywake — Shared World Record';
  }

  function renderCampaign() {
    const content = showPortal('campaign', 'ACTIVE CAMPAIGN', 'Campaign');
    if (!content) return;
    content.appendChild(introBlock('WHAT IS HAPPENING NOW', 'Campaign', 'Current possibilities and the record of what the party has already done live here. This is the shared campaign layer, separate from your character’s private material and the wider Greywake archive.'));
    const sessions = (window.GREYWAKE_CATEGORIES?.Sessions || []).filter(name => window.GREYWAKE_DATA?.[name]);
    const cards = [
      ...sessions.map((name, index) => ({href:recordHref(name), kicker:`SESSION ${String(index + 1).padStart(2,'0')}`, title:window.GREYWAKE_DATA[name].title, copy:'Player-facing recap of what the party established in play.', action:'Open recap →'})),
      {href:'#/brain', kicker:'RELATIONSHIPS', title:'Campaign connections', copy:'Use Player Brain when you specifically want to trace how known records connect.', action:'Open relationship view →'}
    ];
    content.appendChild(hubGrid(cards, 'player-campaign-links'));
    const label = document.createElement('section');
    label.className = 'player-campaign-current';
    label.innerHTML = '<div class="eyebrow">CURRENT POSSIBILITIES</div><h2>What could happen next</h2><p>These are known options, not assignments. The party decides what becomes play.</p>';
    content.appendChild(label);
    content.appendChild(threads);
    document.title = 'Campaign — Greywake';
  }

  function render() {
    const page = routeName();
    document.body.dataset.playerRoute = page;
    syncPrimaryNav(page);

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

    if (page === 'my-greywake') return renderMyGreywake();
    if (page === 'greywake') return renderGreywake();
    if (page === 'campaign') return renderCampaign();
    if (page === 'possibilities') return renderPossibilities();
    if (page === 'mind') return renderMind();
    if (page === 'inbox') return renderInbox();

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

  window.GreywakePlayerPortal = { render, navigate, syncPrimaryNav };

  window.addEventListener('greywake:open-player-inbox', event => {
    pendingGoalId = event.detail?.goalId || '';
    navigate('#/inbox');
  });
  window.addEventListener('greywake:player-ready', render);
  window.addEventListener('greywake:engagement-changed', () => {
    const page = routeName();
    if (['my-greywake','mind','inbox'].includes(page)) render();
  });
  window.addEventListener('hashchange', () => setTimeout(render, 0));
  window.addEventListener('popstate', () => setTimeout(render, 0));
  document.addEventListener('DOMContentLoaded', render);
  setTimeout(render, 140);
  render();
})();

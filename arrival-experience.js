(() => {
  if (!document.querySelector('script[data-p7-usability]')) {
    const script = document.createElement('script');
    script.src = 'p7-usability.js?v=p8-1';
    script.defer = true;
    script.dataset.p7Usability = 'true';
    document.head.appendChild(script);
  }

  if (!document.querySelector('script[data-p7-backpack]')) {
    const script = document.createElement('script');
    script.src = 'p7-backpack.js?v=pack1';
    script.defer = true;
    script.dataset.p7Backpack = 'true';
    document.head.appendChild(script);
  }

  if (!document.querySelector('link[data-greywake-item-cards]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'greywake-item-cards.css?v=p7-card1';
    link.dataset.greywakeItemCards = 'true';
    document.head.appendChild(link);
  }

  const home = document.getElementById('home');
  const hero = home?.querySelector('.hero');
  const goals = document.getElementById('playerGoals');
  const threads = document.getElementById('currentThreads');
  if (!home || !hero || !goals || !threads) return;
  let lastSignature = '';

  function isPlayerFacing() {
    if (!document.body.dataset.role) return false;
    return document.body.dataset.role !== 'gm' || document.body.dataset.gmPreview === 'true';
  }

  function characterName() {
    return window.GreywakePlayer?.character || document.body.dataset.character || 'Your character';
  }

  function activeMindCards() {
    return [...goals.querySelectorAll('.interest-thread[data-entry-kind="interest"]:not(.interest-thread-resolved)')].filter(card => {
      const status = (card.querySelector('.interest-status')?.textContent || '').toUpperCase();
      return !status.includes('DORMANT') && !status.includes('RESOLVED');
    });
  }

  function activeMindCount() {
    return activeMindCards().length;
  }

  function pursuingMindCount() {
    return activeMindCards().filter(card => {
      const status = (card.querySelector('.interest-status')?.textContent || '').toUpperCase();
      return status.includes('PURSUING');
    }).length;
  }

  function questionCount() {
    return goals.querySelectorAll('.interest-thread[data-entry-kind="question"]:not(.interest-thread-resolved)').length;
  }

  function gmReplyCount() {
    return goals.querySelectorAll('.interest-message-gm').length;
  }

  function possibilityCount() {
    return threads.querySelectorAll('.thread-card').length;
  }

  function engagementSnapshot() {
    const currentCharacter = String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase();
    const snapshot = window.GreywakeGoalSnapshot;
    return snapshot && snapshot.character === currentCharacter ? snapshot : null;
  }

  function findImage(root) {
    const img = root?.querySelector('img[src]');
    if (img?.getAttribute('src')) return img.getAttribute('src');
    const card = root?.querySelector('[style*="background-image"]');
    if (card) {
      const match = (card.style.backgroundImage || '').match(/url\(["']?(.*?)["']?\)/);
      if (match?.[1]) return match[1];
    }
    return '';
  }

  function applyCardImage(card, src) {
    if (!card || !src) return;
    card.style.setProperty('--arrival-card-image', `url("${String(src).replace(/"/g, '\\"')}")`);
    card.classList.add('arrival-action-has-image');
  }

  function latestDiscovery() {
    const card = document.querySelector('#discoveryGrid .discovery-card');
    return {
      title: card?.querySelector('strong')?.textContent?.trim() || '',
      note: card?.dataset?.note || ''
    };
  }

  function characterHomeState() {
    const key = String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase();
    return window.GREYWAKE_HOME_STATE?.[key] || null;
  }

  function cleanGMView() {
    document.getElementById('arrivalOrientation')?.remove();
    document.getElementById('arrivalActions')?.remove();
    document.getElementById('arrivalStatus')?.remove();
    lastSignature = '';
  }

  function build() {
    if (!isPlayerFacing()) {
      cleanGMView();
      return;
    }

    const copy = hero.querySelector('.hero-copy');
    if (!copy) return;

    const heading = copy.querySelector('h2');
    const intro = copy.querySelector(':scope > p');
    const homeState = characterHomeState() || {};
    if (heading) heading.textContent = homeState.heading || `${characterName()}, what matters now?`;
    if (intro) intro.textContent = 'Start with your live character sheet, pick up your own story, or follow whatever has caught your character’s attention.';
    let orientation = document.getElementById('arrivalOrientation');
    if (!orientation) {
      orientation = document.createElement('div');
      orientation.id = 'arrivalOrientation';
      orientation.className = 'arrival-orientation';
      const heroButtons = copy.querySelector('.hero-buttons');
      if (heroButtons) heroButtons.insertAdjacentElement('afterend', orientation);
      else copy.appendChild(orientation);
    }
    orientation.innerHTML = `
      <div class="arrival-orientation-item">
        <small>WHERE YOU ARE NOW</small>
        <strong>${homeState.location || 'Greywake'}</strong>
        <span>${homeState.locationDetail || 'Your current position in the story.'}</span>
      </div>
      <a class="arrival-orientation-item" href="${homeState.chapterRoute || '#/campaign'}">
        <small>YOUR LAST CHAPTER</small>
        <strong>${homeState.chapterTitle || 'Your story so far'}</strong>
        <span>${homeState.chapterDetail || 'Review the most recent part of your character’s story.'}</span>
      </a>
      <a class="arrival-orientation-item" href="#/possibilities">
        <small>WHAT IS MOVING NOW</small>
        <strong>${homeState.currentTitle || 'Known possibilities'}</strong>
        <span>${homeState.currentDetail || 'Things your character currently knows they could engage with.'}</span>
      </a>`;

    let actions = document.getElementById('arrivalActions');
    if (!actions) {
      actions = document.createElement('div');
      actions.id = 'arrivalActions';
      actions.className = 'arrival-actions';
      const ledger = copy.querySelector('.hero-ledger');
      if (ledger) ledger.insertAdjacentElement('beforebegin', actions);
      else copy.appendChild(actions);
    }

    const name = characterName();
    const engagement = engagementSnapshot();
    const mindCount = Math.min(engagement?.activeInterests ?? activeMindCount(), 12);
    const pursuingCount = Math.min(engagement?.pursuing ?? pursuingMindCount(), 3);
    const possibilities = possibilityCount();
    const q = engagement?.questions ?? questionCount();
    const replies = engagement?.replies ?? gmReplyCount();
    const latest = latestDiscovery();
    const characterImage = findImage(document.getElementById('characterSheet'));
    const worldImage = findImage(threads) || 'assets/tower-distant.jpg';
    const mindImage = findImage(goals.querySelector('.player-mind-view')) || worldImage;
    const signature = JSON.stringify({name,mindCount,pursuingCount,possibilities,q,replies,latest,homeState,characterImage,worldImage,mindImage});
    const existingStatus = document.getElementById('arrivalStatus');
    if (lastSignature === signature && actions.isConnected && existingStatus?.isConnected) return;
    lastSignature = signature;
    actions.innerHTML = `
      <a class="arrival-action arrival-action-character" href="#/character">
        <small>PLAY MY CHARACTER</small>
        <strong>${name}</strong>
        <span>Your live Daggerheart sheet. Everything you need to play ${name}.</span>
        <em>Play ${name} →</em>
      </a>
      <a class="arrival-action arrival-action-world" href="#/possibilities">
        <small>THE WORLD IS MOVING</small>
        <strong>What's out there?</strong>
        <span>${possibilities ? `${possibilities} known ${possibilities === 1 ? 'possibility' : 'possibilities'} the party could pursue.` : 'Known leads, rumours and situations the party could pursue.'}</span>
        <em>See possibilities →</em>
      </a>
      <a class="arrival-action arrival-action-mind" href="#/mind">
        <small>MY PRIORITIES · ${pursuingCount}/3 PURSUING</small>
        <strong>On my mind</strong>
        <span>${mindCount}/12 active interests. Pursuing is your focused shortlist.</span>
        <em>Review priorities →</em>
      </a>`;

    const characterCard = actions.querySelector('.arrival-action-character');
    const worldCard = actions.querySelector('.arrival-action-world');
    const mindCard = actions.querySelector('.arrival-action-mind');
    applyCardImage(characterCard, characterImage);
    applyCardImage(worldCard, worldImage);
    applyCardImage(mindCard, mindImage);

    let status = document.getElementById('arrivalStatus');
    if (!status) {
      status = document.createElement('div');
      status.id = 'arrivalStatus';
      status.className = 'arrival-status';
      actions.insertAdjacentElement('afterend', status);
    }
    status.innerHTML = `
      <a href="#/inbox"><strong>${replies || q}</strong><span>${replies ? `GM ${replies === 1 ? 'reply' : 'replies'}` : q ? `open ${q === 1 ? 'question' : 'questions'}` : 'questions & replies'}</span></a>
      ${latest.title ? `<div class="arrival-latest"><small>LATEST DISCOVERY</small><span>${latest.title}</span></div>` : ''}
      <a class="arrival-explore-link" href="#/explore">Explore Greywake →</a>`;
  }

  document.addEventListener('DOMContentLoaded', build);
  window.addEventListener('greywake:player-ready', build);
  window.addEventListener('greywake:engagement-changed', build);
  window.addEventListener('greywake:goals-rendered', build);
  window.addEventListener('hashchange', () => {
    if ((location.hash || '#/') === '#/' || !(location.hash || '')) setTimeout(build, 0);
  });
  new MutationObserver(() => {
    if ((location.hash || '#/') === '#/' || !(location.hash || '')) requestAnimationFrame(build);
  }).observe(goals, {childList:true, subtree:true});
  setTimeout(build, 180);
})();
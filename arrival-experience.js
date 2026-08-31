(() => {
  const home = document.getElementById('home');
  const hero = home?.querySelector('.hero');
  const goals = document.getElementById('playerGoals');
  const threads = document.getElementById('currentThreads');
  if (!home || !hero || !goals || !threads) return;

  function characterName() {
    return window.GreywakePlayer?.character || document.body.dataset.character || 'your character';
  }

  function scrollTo(target) {
    target?.scrollIntoView({
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  function build() {
    const copy = hero.querySelector('.hero-copy');
    if (!copy) return;

    const heading = copy.querySelector('h2');
    const intro = copy.querySelector(':scope > p');
    if (heading) heading.textContent = 'Greywake is moving. What matters to you?';
    if (intro) intro.textContent = 'Open your character, follow a known possibility, or keep track of the things currently on your mind. Nothing here chooses the campaign for you.';

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
    actions.innerHTML = `
      <a class="arrival-action arrival-action-character" href="#/character">
        <small>MY CHARACTER</small>
        <strong>${name}</strong>
        <span>Hope, Stress, abilities, attacks, gear and story.</span>
        <em>Open dossier →</em>
      </a>
      <button class="arrival-action arrival-action-world" type="button" data-arrival="threads">
        <small>THE WORLD IS MOVING</small>
        <strong>What's out there?</strong>
        <span>Known leads, rumours and situations the party could actually pursue.</span>
        <em>See possibilities ↓</em>
      </button>
      <button class="arrival-action arrival-action-mind" type="button" data-arrival="mind">
        <small>MY PRIORITIES</small>
        <strong>Things on my mind</strong>
        <span>The few things currently at the front of your character's attention.</span>
        <em>Open priorities ↓</em>
      </button>`;

    actions.querySelector('[data-arrival="threads"]')?.addEventListener('click', () => scrollTo(threads));
    actions.querySelector('[data-arrival="mind"]')?.addEventListener('click', () => {
      scrollTo(goals.querySelector('.player-mind-view') || goals);
    });

    let utility = document.getElementById('arrivalUtility');
    if (!utility) {
      utility = document.createElement('div');
      utility.id = 'arrivalUtility';
      utility.className = 'arrival-utility';
      actions.insertAdjacentElement('afterend', utility);
    }
    utility.innerHTML = `
      <button type="button" data-arrival="inbox">Questions & replies</button>
      <a href="#/record/${encodeURIComponent('Known People')}">People</a>
      <a href="#/record/${encodeURIComponent('Known Locations')}">Places</a>
      <a href="#/record/${encodeURIComponent('Known Flora and Fauna')}">Field guide</a>
      <a href="#/brain">Player Brain</a>`;
    utility.querySelector('[data-arrival="inbox"]')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('greywake:open-player-inbox'));
    });
  }

  document.addEventListener('DOMContentLoaded', build);
  window.addEventListener('greywake:player-ready', build);
  window.addEventListener('greywake:engagement-changed', build);
  setTimeout(build, 120);
  build();
})();

(() => {
  let previousHash = '#/';
  let initialized = false;

  function isCharacterRoute() {
    return (location.hash || '') === '#/character';
  }

  function ensureView() {
    const main = document.getElementById('mainContent');
    if (!main) return null;
    let view = document.getElementById('characterPageView');
    if (!view) {
      view = document.createElement('section');
      view.id = 'characterPageView';
      view.className = 'character-page-view hidden';
      view.setAttribute('aria-label', 'Character sheet page');
      view.innerHTML = `
        <div class="character-page-toolbar">
          <div class="character-page-toolbar-copy">
            <div class="eyebrow">PLAYER CHARACTER</div>
            <h1 id="characterPageHeading">Character sheet</h1>
          </div>
          <button id="characterPageClose" class="character-page-close" type="button">← Back to Greywake</button>
        </div>`;
      const article = document.getElementById('article');
      if (article) article.insertAdjacentElement('beforebegin', view);
      else main.appendChild(view);
      view.querySelector('#characterPageClose').addEventListener('click', closeCharacterPage);
    }
    return view;
  }

  function moveSheetIntoView() {
    const view = ensureView();
    const sheet = document.getElementById('characterSheet');
    if (!view || !sheet) return;
    if (sheet.parentElement !== view) view.appendChild(sheet);
    const character = window.GreywakePlayer?.character || document.body.dataset.character || 'Character';
    const heading = document.getElementById('characterPageHeading');
    if (heading) heading.textContent = `${character} · Character Sheet`;
  }

  function replaceCharacterButton() {
    const old = document.getElementById('characterSheetBtn');
    if (!old || old.dataset.standalonePage === 'true') return old;
    const button = old.cloneNode(true);
    button.dataset.standalonePage = 'true';
    button.textContent = 'Character';
    old.replaceWith(button);
    button.addEventListener('click', () => {
      if (isCharacterRoute()) closeCharacterPage();
      else openCharacterPage();
    });
    return button;
  }

  function openCharacterPage() {
    if (!isCharacterRoute()) previousHash = location.hash && location.hash !== '#/character' ? location.hash : '#/';
    location.hash = '#/character';
  }

  function closeCharacterPage() {
    location.hash = previousHash && previousHash !== '#/character' ? previousHash : '#/';
  }

  function renderCharacterRoute() {
    const view = ensureView();
    if (!view) return;
    moveSheetIntoView();
    const button = replaceCharacterButton();
    const home = document.getElementById('home');
    const brain = document.getElementById('brainView');
    const article = document.getElementById('article');

    if (isCharacterRoute()) {
      home?.classList.add('hidden');
      brain?.classList.add('hidden');
      article?.classList.add('hidden');
      view.classList.remove('hidden');
      button?.setAttribute('aria-current', 'page');
      button?.setAttribute('aria-label', 'Close character sheet');
      const crumb = document.getElementById('crumb');
      const character = window.GreywakePlayer?.character || document.body.dataset.character || 'Character';
      if (crumb) crumb.textContent = `Greywake / ${character} / Character`;
      document.title = `${character} — Character Sheet — Greywake`;
      requestAnimationFrame(() => view.querySelector('h1')?.focus?.({preventScroll:true}));
      window.scrollTo({top:0,behavior:'auto'});
    } else {
      view.classList.add('hidden');
      button?.removeAttribute('aria-current');
      button?.setAttribute('aria-label', 'Open character sheet');
    }
  }

  function schedule() {
    setTimeout(() => {
      moveSheetIntoView();
      replaceCharacterButton();
      renderCharacterRoute();
    }, 70);
  }

  function init() {
    if (initialized) return;
    initialized = true;
    ensureView();
    schedule();
    window.addEventListener('hashchange', () => setTimeout(renderCharacterRoute, 0));
    window.addEventListener('greywake:player-ready', schedule);
    window.addEventListener('greywake:sheet-enhanced', schedule);
    new MutationObserver(() => {
      const sheet = document.getElementById('characterSheet');
      const button = document.getElementById('characterSheetBtn');
      if ((sheet && sheet.parentElement?.id !== 'characterPageView') || (button && button.dataset.standalonePage !== 'true')) schedule();
    }).observe(document.documentElement, {childList:true, subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
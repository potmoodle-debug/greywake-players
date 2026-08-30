(() => {
  let previousHash = '#/';
  let initialized = false;
  let activeTab = 'overview';

  const TAB_RULES = {
    overview: ['Traits', 'Experiences'],
    abilities: ['Features', 'Domain cards'],
    gear: ['Weapons, armor & inventory'],
    story: ['Character details', 'Background', 'Connections']
  };

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
            <div class="eyebrow">GREYWAKE · PERSONAL DOSSIER</div>
            <h1 id="characterPageHeading" tabindex="-1">Character sheet</h1>
            <p id="characterPageSubheading">Field reference · rules · equipment · personal record</p>
          </div>
          <button id="characterPageClose" class="character-page-close" type="button">← Back to Greywake</button>
        </div>
        <nav id="characterPageTabs" class="character-page-tabs" aria-label="Character sheet sections"></nav>`;
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
    if (heading) heading.textContent = `${character} · Character Dossier`;
    sheet.dataset.dossier = 'true';
    buildTabs();
    applyTab();
  }

  function characterGroups() {
    return [...document.querySelectorAll('#characterSheet .sheet-group')];
  }

  function groupTitle(group) {
    return group.querySelector('.sheet-group-head h3')?.textContent.trim() || '';
  }

  function tabHasContent(tab) {
    const allowed = TAB_RULES[tab] || [];
    return characterGroups().some(group => allowed.includes(groupTitle(group)));
  }

  function buildTabs() {
    const nav = document.getElementById('characterPageTabs');
    if (!nav) return;
    const labels = { overview: 'Overview', abilities: 'Abilities', gear: 'Gear', story: 'Story' };
    const icons = { overview: '◇', abilities: '✦', gear: '⌁', story: '≋' };
    const availableTabs = Object.keys(TAB_RULES).filter(tabHasContent);
    if (!availableTabs.includes(activeTab)) activeTab = availableTabs[0] || 'overview';
    const signature = availableTabs.join('|');

    if (nav.dataset.tabSignature !== signature) {
      nav.dataset.tabSignature = signature;
      nav.innerHTML = availableTabs
        .map(tab => `<button type="button" data-sheet-tab="${tab}" aria-selected="false"><span aria-hidden="true">${icons[tab]}</span>${labels[tab]}</button>`)
        .join('');
      nav.querySelectorAll('[data-sheet-tab]').forEach(button => {
        button.addEventListener('click', () => {
          activeTab = button.dataset.sheetTab;
          applyTab();
          document.getElementById('characterSheet')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        });
      });
    }
  }

  function applyTab() {
    const nav = document.getElementById('characterPageTabs');
    nav?.querySelectorAll('[data-sheet-tab]').forEach(button => {
      const selected = button.dataset.sheetTab === activeTab;
      button.setAttribute('aria-selected', String(selected));
      button.classList.toggle('active', selected);
    });
    const allowed = TAB_RULES[activeTab] || [];
    characterGroups().forEach(group => {
      group.classList.toggle('dossier-group-hidden', !allowed.includes(groupTitle(group)));
    });
    const body = document.querySelector('#characterSheet .character-sheet-body');
    if (body) body.dataset.activeSection = activeTab;
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
    activeTab = 'overview';
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
      if (crumb) crumb.textContent = `Greywake / ${character} / Dossier`;
      document.title = `${character} — Character Dossier — Greywake`;
      buildTabs();
      applyTab();
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
    new MutationObserver(mutations => {
      const sheet = document.getElementById('characterSheet');
      const button = document.getElementById('characterSheetBtn');
      if ((sheet && sheet.parentElement?.id !== 'characterPageView') || (button && button.dataset.standalonePage !== 'true')) {
        schedule();
        return;
      }
      if (!isCharacterRoute()) return;
      const meaningfulChange = mutations.some(mutation => !mutation.target.closest?.('#characterPageTabs'));
      if (meaningfulChange) {
        buildTabs();
        applyTab();
      }
    }).observe(document.documentElement, {childList:true, subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
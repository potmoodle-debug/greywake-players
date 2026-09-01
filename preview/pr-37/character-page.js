(() => {
  let previousHash = '#/';
  let initialized = false;
  let activeTab = 'overview';
  let routeWasOpen = false;

  const TAB_RULES = {
    overview: ['Traits', 'Experiences'],
    abilities: ['Features', 'Domain cards'],
    gear: ['Weapons, armor & inventory'],
    story: ['Character details', 'Background', 'Connections']
  };

  function isCharacterRoute() {
    return (location.hash || '') === '#/character';
  }

  function ensureHeaderStyles() {
    if (document.getElementById('characterBackpackHeaderStyles')) return;
    const style = document.createElement('style');
    style.id = 'characterBackpackHeaderStyles';
    style.textContent = `
      .character-page-toolbar-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
      .character-page-backpack{display:inline-flex;align-items:center;gap:9px;border:1px solid #8f7540;background:linear-gradient(180deg,#352a18,#211a10);color:#f2d78e;padding:9px 13px;cursor:pointer;font-weight:900;letter-spacing:.05em;text-transform:uppercase;box-shadow:0 8px 20px rgba(0,0,0,.2)}
      .character-page-backpack-icon{font-size:22px;line-height:1}
      .character-page-backpack small{display:block;color:#b6aa8a;font-size:7px;letter-spacing:.13em;text-align:left}
      .character-page-backpack strong{display:block;color:#f3dfaa;font-size:11px;text-align:left}
      .character-page-backpack:hover,.character-page-backpack:focus-visible{border-color:#c2a45b;background:linear-gradient(180deg,#46371e,#2b2113)}
      #p7BackpackEntry{display:none!important}
      @media(max-width:760px){.character-page-toolbar-actions{width:100%;justify-content:stretch}.character-page-backpack{flex:1;justify-content:center}.character-page-close{flex:1}}
    `;
    document.head.appendChild(style);
  }

  function openBackpackFromHeader() {
    const trigger = document.querySelector('#p7BackpackEntry .p7-backpack-button');
    if (trigger) {
      trigger.click();
      return;
    }
    setTimeout(() => document.querySelector('#p7BackpackEntry .p7-backpack-button')?.click(), 120);
  }

  function ensureView() {
    const main = document.getElementById('mainContent');
    if (!main) return null;
    ensureHeaderStyles();
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
          <div class="character-page-toolbar-actions">
            <button id="characterBackpackButton" class="character-page-backpack" type="button" aria-label="Open backpack">
              <span class="character-page-backpack-icon" aria-hidden="true">🎒</span>
              <span><small>INVENTORY</small><strong>Backpack</strong></span>
            </button>
            <button id="characterPageClose" class="character-page-close" type="button">← Back to Greywake</button>
          </div>
        </div>
        <nav id="characterPageTabs" class="character-page-tabs" aria-label="Character sheet sections"></nav>`;
      const article = document.getElementById('article');
      if (article) article.insertAdjacentElement('beforebegin', view);
      else main.appendChild(view);
      view.querySelector('#characterPageClose').addEventListener('click', closeCharacterPage);
      view.querySelector('#characterBackpackButton').addEventListener('click', openBackpackFromHeader);
    }
    return view;
  }

  function ensureTabs() {
    const view = ensureView();
    if (!view) return null;
    let nav = document.getElementById('characterPageTabs');
    if (!nav) {
      nav = document.createElement('nav');
      nav.id = 'characterPageTabs';
      nav.className = 'character-page-tabs';
      nav.setAttribute('aria-label', 'Character sheet sections');
      const toolbar = view.querySelector('.character-page-toolbar');
      if (toolbar) toolbar.insertAdjacentElement('afterend', nav);
      else view.prepend(nav);
    }
    return nav;
  }

  function moveTabsNearContent() {
    const nav = ensureTabs();
    const body = document.querySelector('#characterSheet .character-sheet-body');
    if (!nav || !body) return;
    if (nav.parentElement !== body.parentElement || nav.nextElementSibling !== body) {
      body.insertAdjacentElement('beforebegin', nav);
    }
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
    moveTabsNearContent();
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
    const nav = ensureTabs();
    if (!nav) return;
    const labels = { overview: 'Overview', abilities: 'Abilities', gear: 'Gear', story: 'Story' };
    const icons = { overview: '◇', abilities: '✦', gear: '⌁', story: '≋' };
    const wanted = Object.keys(TAB_RULES)
      .filter(tabHasContent)
      .map(tab => `${tab}:${labels[tab]}`)
      .join('|');

    if (nav.dataset.tabsSignature !== wanted) {
      nav.dataset.tabsSignature = wanted;
      nav.innerHTML = Object.keys(TAB_RULES)
        .filter(tabHasContent)
        .map(tab => `<button type="button" data-sheet-tab="${tab}" aria-selected="${tab === activeTab ? 'true' : 'false'}"><span aria-hidden="true">${icons[tab]}</span>${labels[tab]}</button>`)
        .join('');
      nav.querySelectorAll('[data-sheet-tab]').forEach(button => {
        button.addEventListener('click', () => {
          activeTab = button.dataset.sheetTab;
          applyTab();
        });
      });
    }

    if (!tabHasContent(activeTab)) activeTab = 'overview';
  }

  function applyTab() {
    const nav = ensureTabs();
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

  function ensureCharacterButton() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return null;

    let button = document.getElementById('characterSheetBtn');
    if (!button) {
      button = document.createElement('button');
      button.id = 'characterSheetBtn';
      button.type = 'button';
      button.className = 'brain-cta sheet-topbar-button';
      button.textContent = 'Character';
      const brain = document.getElementById('brainBtn');
      topbar.insertBefore(button, brain || null);
    }

    if (button.dataset.characterNavOwner !== 'page') {
      const owned = button.cloneNode(true);
      owned.dataset.standalonePage = 'true';
      owned.dataset.characterNavOwner = 'page';
      owned.textContent = 'Character';
      button.replaceWith(owned);
      button = owned;
      button.addEventListener('click', () => {
        if (isCharacterRoute()) closeCharacterPage();
        else openCharacterPage();
      });
    }

    return button;
  }

  function openCharacterPage() {
    if (!isCharacterRoute()) previousHash = location.hash && location.hash !== '#/character' ? location.hash : '#/';
    activeTab = 'overview';
    if (location.hash !== '#/character') history.pushState(null, '', '#/character');
    renderCharacterRoute();
  }

  function closeCharacterPage() {
    const target = previousHash && previousHash !== '#/character' ? previousHash : '#/';
    if (location.hash !== target) history.pushState(null, '', target);
    renderCharacterRoute();
    window.GreywakePlayerPortal?.render?.();
  }

  function renderCharacterRoute() {
    const view = ensureView();
    if (!view) return;
    moveSheetIntoView();
    const button = ensureCharacterButton();
    const home = document.getElementById('home');
    const brain = document.getElementById('brainView');
    const article = document.getElementById('article');
    const portal = document.getElementById('playerPortal');
    const routeOpen = isCharacterRoute();

    if (routeOpen) {
      home?.classList.add('hidden');
      brain?.classList.add('hidden');
      article?.classList.add('hidden');
      portal?.classList.add('hidden');
      view.classList.remove('hidden');
      button?.setAttribute('aria-current', 'page');
      button?.setAttribute('aria-label', 'Close character sheet');
      const crumb = document.getElementById('crumb');
      const character = window.GreywakePlayer?.character || document.body.dataset.character || 'Character';
      if (crumb) crumb.textContent = `Greywake / ${character} / Dossier`;
      document.title = `${character} — Character Dossier — Greywake`;
      buildTabs();
      moveTabsNearContent();
      applyTab();

      if (!routeWasOpen) {
        requestAnimationFrame(() => view.querySelector('h1')?.focus?.({preventScroll:true}));
        window.scrollTo({top:0,behavior:'auto'});
      }
    } else {
      view.classList.add('hidden');
      button?.removeAttribute('aria-current');
      button?.setAttribute('aria-label', 'Open character sheet');
    }

    routeWasOpen = routeOpen;
  }

  function schedule() {
    setTimeout(() => {
      moveSheetIntoView();
      ensureCharacterButton();
      renderCharacterRoute();
    }, 70);
  }

  window.GreywakeCharacterPage = {
    open: openCharacterPage,
    close: closeCharacterPage,
    render: renderCharacterRoute
  };

  function init() {
    if (initialized) return;
    initialized = true;
    ensureView();
    ensureCharacterButton();
    schedule();
    window.addEventListener('hashchange', () => setTimeout(renderCharacterRoute, 0));
    window.addEventListener('popstate', () => setTimeout(renderCharacterRoute, 0));
    window.addEventListener('greywake:player-ready', schedule);
    window.addEventListener('greywake:sheet-enhanced', () => {
      setTimeout(() => {
        moveSheetIntoView();
        buildTabs();
        moveTabsNearContent();
        applyTab();
      }, 0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
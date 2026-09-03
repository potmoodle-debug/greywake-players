(() => {
  const ROUTES = {
    home: '#/',
    between: '#/gm-between',
    session: '#/gm-session',
    players: '#/gm-players',
    archive: '#/gm-archive'
  };

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function currentRoute() {
    const hash = location.hash || '#/';
    if (hash === ROUTES.between) return 'between';
    if (hash === ROUTES.session) return 'session';
    if (hash === ROUTES.players) return 'players';
    if (hash === ROUTES.archive) return 'archive';
    return 'home';
  }

  function ensureStyles() {
    if (document.getElementById('gm-operations-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-operations-styles';
    style.textContent = `
      body[data-role="gm"][data-gm-preview="false"] .gm-ops-hidden-player-home{display:none!important}
      .gm-ops-view{max-width:1500px;margin:0 auto;padding:26px clamp(18px,3vw,42px) 70px;color:#d8d0ba}
      .gm-ops-view.hidden{display:none!important}
      .gm-ops-authority{display:flex;gap:18px;align-items:center;justify-content:space-between;padding:13px 16px;border:1px solid #5f5434;background:#1b1a13;box-shadow:0 12px 30px rgba(0,0,0,.18);margin-bottom:22px}
      .gm-ops-authority strong{font:700 15px/1.2 Georgia,serif;color:#f0d98d}.gm-ops-authority span{font-size:10px;line-height:1.4;color:#aaa18a}.gm-ops-authority em{font-style:normal;color:#d8c786;font-size:9px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
      .gm-ops-head{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.7fr);gap:22px;align-items:end;margin-bottom:22px}.gm-ops-head small,.gm-ops-kicker{display:block;color:#9b8d65;font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:7px}.gm-ops-head h1{margin:0;font:700 clamp(30px,4vw,52px)/.98 Georgia,serif;color:#eee5cd}.gm-ops-head p{margin:0;color:#a79f8c;line-height:1.55;font-size:12px}
      .gm-ops-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}.gm-ops-card{grid-column:span 4;border:1px solid #3f3c30;background:#171813;padding:16px;min-height:138px}.gm-ops-card.wide{grid-column:span 8}.gm-ops-card.full{grid-column:1/-1}.gm-ops-card h2{margin:0 0 8px;color:#e6ddc7;font:700 18px/1.15 Georgia,serif}.gm-ops-card p{margin:0;color:#9b9484;font-size:11px;line-height:1.55}.gm-ops-card ul{margin:10px 0 0;padding-left:17px;color:#c4bba4;font-size:11px;line-height:1.65}.gm-ops-card li::marker{color:#8d7c4e}
      .gm-ops-status{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid #474230;background:#15160f;margin-bottom:14px}.gm-ops-status div{padding:13px 15px;border-right:1px solid #343226}.gm-ops-status div:last-child{border-right:0}.gm-ops-status small{display:block;color:#82785c;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}.gm-ops-status strong{display:block;color:#e3d9c0;font-size:12px}.gm-ops-status .priority strong{font:700 17px/1.2 Georgia,serif;color:#f0d98d}
      .gm-ops-pressure{display:flex;flex-wrap:wrap;gap:8px}.gm-ops-pill{border:1px solid #514a35;background:#201e16;padding:7px 9px;font-size:10px;color:#c9bea2}.gm-ops-pill b{color:#ead68e}.gm-ops-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}.gm-ops-actions button,.gm-ops-actions a{appearance:none;border:1px solid #665a3a;background:#252117;color:#e0cf99;text-decoration:none;padding:9px 11px;font:800 9px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}.gm-ops-actions button:hover,.gm-ops-actions a:hover{border-color:#a58e54;color:#f5e3a8}
      .gm-ops-stage{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:12px}.gm-ops-stage span{padding:9px;border:1px solid #38362c;background:#14150f;text-align:center;color:#8f8878;font-size:9px;text-transform:uppercase;letter-spacing:.06em}.gm-ops-stage span.active{border-color:#7f6d3e;color:#e2cd8c;background:#211d13}
      .gm-ops-note{margin-top:12px;padding:11px 12px;border-left:3px solid #75653d;background:#1b1a14;color:#aaa28e;font-size:10px;line-height:1.55}
      .gm-ops-player-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.gm-ops-player{border:1px solid #403d31;background:#171813;padding:15px}.gm-ops-player strong{display:block;color:#e8dec7;font:700 17px/1.2 Georgia,serif}.gm-ops-player span{display:block;color:#9d937b;font-size:10px;margin:5px 0 12px}.gm-ops-player button{border:1px solid #665a3a;background:#252117;color:#e0cf99;padding:8px 10px;font-size:9px;font-weight:800;text-transform:uppercase;cursor:pointer}
      body[data-role="gm"][data-gm-preview="false"] #primaryNav{display:flex!important}
      body[data-role="gm"][data-gm-preview="false"] #primaryNav button{white-space:nowrap}
      @media(max-width:1000px){.gm-ops-card,.gm-ops-card.wide{grid-column:span 6}.gm-ops-head{grid-template-columns:1fr}.gm-ops-status{grid-template-columns:1fr 1fr}.gm-ops-status div:nth-child(2){border-right:0}.gm-ops-status div:nth-child(-n+2){border-bottom:1px solid #343226}}
      @media(max-width:700px){.gm-ops-card,.gm-ops-card.wide{grid-column:1/-1}.gm-ops-player-grid{grid-template-columns:1fr}.gm-ops-stage{grid-template-columns:1fr}.gm-ops-status{display:block}.gm-ops-status div{border-right:0;border-bottom:1px solid #343226}.gm-ops-authority{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  function ensureWorkspace() {
    let workspace = document.getElementById('gmOperationsView');
    if (workspace) return workspace;
    workspace = document.createElement('section');
    workspace.id = 'gmOperationsView';
    workspace.className = 'gm-ops-view hidden';
    workspace.setAttribute('aria-label', 'Greywake GM workspace');
    document.getElementById('mainContent')?.appendChild(workspace);
    return workspace;
  }

  function authorityBanner() {
    return `<div class="gm-ops-authority"><div><strong>Canon Authority: Obsidian</strong><br><span>The site is an operational view and staging layer. If the site, ChatGPT or Foundry conflicts with Obsidian, Obsidian wins.</span></div><em>Source of truth</em></div>`;
  }

  function statusStrip() {
    return `<div class="gm-ops-status">
      <div class="priority"><small>Party priority</small><strong>The Closing Ways</strong></div>
      <div><small>Session</small><strong>Session Four</strong></div>
      <div><small>Party location</small><strong>Greywake</strong></div>
      <div><small>Party</small><strong>Marek · Velmira · Odie</strong></div>
    </div>`;
  }

  function renderHome() {
    return `${authorityBanner()}
      <div class="gm-ops-head"><div><small>GM OPERATING VIEW</small><h1>Greywake now.</h1></div><p>This page is for orientation, not canon creation. Use it to see the campaign state you need to operate from; reconcile anything uncertain back to Obsidian.</p></div>
      ${statusStrip()}
      <div class="gm-ops-grid">
        <section class="gm-ops-card wide"><span class="gm-ops-kicker">ACTIVE PRESSURES</span><h2>What is moving</h2><div class="gm-ops-pressure"><span class="gm-ops-pill"><b>↑ Critical</b> · The Closing Ways</span><span class="gm-ops-pill"><b>→ High</b> · Route-marker tampering</span><span class="gm-ops-pill"><b>→ High</b> · Cistern Plate</span><span class="gm-ops-pill">Ash-Plate recovery</span></div><div class="gm-ops-note">Operational snapshot only. Hidden causes, NPC motives and unrevealed truths remain subject to Obsidian canon and what has actually been established in play.</div></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">NEXT USE</span><h2>Where do you need to work?</h2><div class="gm-ops-actions"><button data-gm-go="between">Between sessions</button><button data-gm-go="session">Session support</button></div></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">CHATGPT</span><h2>Run and reason</h2><p>Live narration, NPC logic, consequences, Daggerheart adjudication, improvisation and post-session reasoning happen in ChatGPT.</p></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">FOUNDRY</span><h2>Show and position</h2><p>Maps, scenes, tokens, encounter layout, lighting and visible spatial information belong in Foundry.</p></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">SITE</span><h2>Operate and present</h2><p>Use this site for fast reference, player-facing knowledge, current operational summaries, between-session workflow and staging changes before canonisation.</p></section>
      </div>`;
  }

  function renderBetween() {
    return `${authorityBanner()}
      <div class="gm-ops-head"><div><small>BETWEEN SESSIONS</small><h1>Process what changed.</h1></div><p>Nothing captured here becomes true merely because it is on the site. Review it, reason through consequences with ChatGPT, then canonise approved changes in Obsidian.</p></div>
      <div class="gm-ops-grid">
        <section class="gm-ops-card"><span class="gm-ops-kicker">1 · LAST SESSION</span><h2>What happened?</h2><ul><li>Facts established in play</li><li>Meaningful PC choices</li><li>Promises and commitments</li><li>Resources or relationships changed</li></ul></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">2 · CONSEQUENCES</span><h2>Who noticed?</h2><ul><li>Who benefited or lost?</li><li>Who now needs to decide?</li><li>What changes if PCs do nothing?</li><li>What new pressure exists?</li></ul></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">3 · NPC & FACTION DECISIONS</span><h2>What will they do?</h2><ul><li>Want</li><li>What they know</li><li>Decision made</li><li>Next action</li></ul></section>
        <section class="gm-ops-card wide"><span class="gm-ops-kicker">CANON STAGING</span><h2>From capture to Obsidian</h2><div class="gm-ops-stage"><span class="active">Captured</span><span>Proposed</span><span>Canonised in Obsidian</span><span>Revealed in play</span><span>Resolved / superseded</span></div><div class="gm-ops-note"><strong>Rule:</strong> “Approved on the site” is not the final authority. Canonised means the authoritative record has been written or reconciled in Obsidian.</div></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">PLAYER INTERESTS</span><h2>Keep opportunities visible</h2><p>Marek: Flickerfly interest. Velmira: earlier Stilling case. Odie: The Closing Ways. Interests are invitations and pressures, not assignments.</p></section>
        <section class="gm-ops-card wide"><span class="gm-ops-kicker">NEXT SESSION</span><h2>Prepare only what is likely to matter</h2><ul><li>Starting state and immediate situation</li><li>NPC decisions already made</li><li>Evidence that can actually be found</li><li>Likely Daggerheart mechanics</li><li>Assets needed in Foundry</li></ul></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">FOUNDRY PREP</span><h2>Visual/spatial queue</h2><p>Maps, tokens, encounter scenes, handouts and any location imagery required for likely play.</p></section>
      </div>`;
  }

  function renderSession() {
    return `${authorityBanner()}
      <div class="gm-ops-head"><div><small>SESSION SUPPORT</small><h1>Know what is true now.</h1></div><p>ChatGPT remains the live GM workspace. Keep this page open only as a compact campaign reference beside the chat and Foundry.</p></div>
      ${statusStrip()}
      <div class="gm-ops-grid">
        <section class="gm-ops-card"><span class="gm-ops-kicker">CURRENT SCENE</span><h2>Greywake</h2><p>Use ChatGPT for the exact live scene state. This page should only carry stable operational facts that need rapid confirmation.</p></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">NPCs HERE</span><h2>Only what matters now</h2><p>For active NPCs show want, concern and current intention — not biography.</p></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">PRESSURES</span><h2>Maximum five</h2><div class="gm-ops-pressure"><span class="gm-ops-pill"><b>↑</b> Closing Ways</span><span class="gm-ops-pill">Route-marker tampering</span><span class="gm-ops-pill">Cistern Plate</span></div></section>
        <section class="gm-ops-card wide"><span class="gm-ops-kicker">EVIDENCE / KNOWLEDGE</span><h2>Keep the boundaries visible</h2><div class="gm-ops-stage"><span>Established facts</span><span>Suspicions / theories</span><span>Unknown questions</span><span>GM-only truth</span><span>Player-safe reveal</span></div></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">QUICK CAPTURE · NEXT</span><h2>Record, don't process</h2><p>The next phase will add a one-sentence capture tool for facts, NPC decisions, discoveries, rumours, resource changes, questions and canon candidates. Processing belongs after play.</p></section>
        <section class="gm-ops-card full"><span class="gm-ops-kicker">TOOL OWNERSHIP</span><h2>Do not duplicate work</h2><p><strong>ChatGPT:</strong> live GM, judgement, narrative, NPC logic and consequences. &nbsp; <strong>Site:</strong> stable reference and player-facing knowledge. &nbsp; <strong>Foundry:</strong> maps, tokens and spatial play. &nbsp; <strong>Obsidian:</strong> truth.</p></section>
      </div>`;
  }

  function renderPlayers() {
    return `${authorityBanner()}
      <div class="gm-ops-head"><div><small>PLAYER KNOWLEDGE CONTROL</small><h1>See exactly what they see.</h1></div><p>Use the existing GM preview system to check knowledge boundaries before giving information or changing player-facing records.</p></div>
      <div class="gm-ops-player-grid">
        <section class="gm-ops-player"><strong>Marek</strong><span>Martin · exact player-facing preview</span><button data-preview-player="martin">Preview Marek</button></section>
        <section class="gm-ops-player"><strong>Velmira</strong><span>Carla · exact player-facing preview</span><button data-preview-player="carla">Preview Velmira</button></section>
        <section class="gm-ops-player"><strong>Odie</strong><span>Ritchie · exact player-facing preview</span><button data-preview-player="ritchie">Preview Odie</button></section>
      </div>
      <div class="gm-ops-note">Knowledge rule: the site may present only shared knowledge plus information legitimately available to that character. Obsidian remains the authority when deciding whether a fact is known, hidden or unrevealed.</div>`;
  }

  function renderArchive() {
    return `${authorityBanner()}
      <div class="gm-ops-head"><div><small>GREYWAKE ARCHIVE</small><h1>Reference, not current pressure.</h1></div><p>Use the existing campaign records and sidebar search for people, places, creatures, sessions and historical material. Active GM work should stay out of the archive unless it has been canonised in Obsidian.</p></div>
      <div class="gm-ops-grid">
        <section class="gm-ops-card"><span class="gm-ops-kicker">PEOPLE</span><h2>Known People</h2><p>NPC records and established relationships.</p><div class="gm-ops-actions"><a href="#/record/${encodeURIComponent('Known People')}">Open records</a></div></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">PLACES</span><h2>Known Locations</h2><p>Greywake, Greater Greywake, routes and discovered sites.</p><div class="gm-ops-actions"><a href="#/record/${encodeURIComponent('Known Locations')}">Open records</a></div></section>
        <section class="gm-ops-card"><span class="gm-ops-kicker">FIELD GUIDE</span><h2>Flora & Fauna</h2><p>Established creatures, plants and practical knowledge.</p><div class="gm-ops-actions"><a href="#/record/${encodeURIComponent('Known Flora and Fauna')}">Open records</a></div></section>
        <section class="gm-ops-card full"><span class="gm-ops-kicker">ARCHIVE RULE</span><h2>Old is not active.</h2><p>Retired PCs, completed adventures, resolved pressures and superseded material remain searchable but should not clutter GM Home or Session Support.</p></section>
      </div>`;
  }

  function configureNav() {
    if (!isFullGM()) return;
    const config = [
      ['homeBtn', 'GM Home', ROUTES.home],
      ['characterSheetBtn', 'Between Sessions', ROUTES.between],
      ['myGreywakeBtn', 'Session Support', ROUTES.session],
      ['greywakeBtn', 'Players', ROUTES.players],
      ['campaignBtn', 'Archive', ROUTES.archive]
    ];
    config.forEach(([id, label, route]) => {
      const button = document.getElementById(id);
      if (!button) return;
      button.textContent = label;
      button.dataset.gmRoute = route;
      button.removeAttribute('onclick');
    });
  }

  function restorePlayerNavLabels() {
    if (isFullGM()) return;
    const labels = {
      homeBtn: 'Home', characterSheetBtn: 'Character', myGreywakeBtn: 'My Greywake', greywakeBtn: 'Greywake', campaignBtn: 'Campaign'
    };
    Object.entries(labels).forEach(([id, label]) => {
      const button = document.getElementById(id);
      if (button) {
        button.textContent = label;
        delete button.dataset.gmRoute;
      }
    });
  }

  function hideBaseViews(hide) {
    ['home','brainView','article','playerPortal','characterPageView'].forEach(id => document.getElementById(id)?.classList.toggle('gm-ops-hidden-player-home', hide));
  }

  function render() {
    ensureStyles();
    const workspace = ensureWorkspace();
    if (!isFullGM()) {
      workspace.classList.add('hidden');
      hideBaseViews(false);
      restorePlayerNavLabels();
      return;
    }

    configureNav();
    const page = currentRoute();
    const isGMWorkspaceRoute = ['between','session','players','archive'].includes(page);
    workspace.classList.toggle('hidden', !isGMWorkspaceRoute && page === 'home');
    hideBaseViews(isGMWorkspaceRoute);

    if (page === 'home') {
      const home = document.getElementById('home');
      if (home) {
        home.classList.remove('hidden','gm-ops-hidden-player-home');
        let gmHome = document.getElementById('gmOperationsHome');
        if (!gmHome) {
          gmHome = document.createElement('section');
          gmHome.id = 'gmOperationsHome';
          gmHome.className = 'gm-ops-view';
          home.prepend(gmHome);
        }
        gmHome.innerHTML = renderHome();
      }
    } else {
      workspace.classList.remove('hidden');
      workspace.innerHTML = page === 'between' ? renderBetween() : page === 'session' ? renderSession() : page === 'players' ? renderPlayers() : renderArchive();
    }

    const activeRoute = page === 'home' ? ROUTES.home : ROUTES[page];
    document.querySelectorAll('#primaryNav [data-gm-route]').forEach(button => {
      const selected = button.dataset.gmRoute === activeRoute;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
    });

    const crumb = document.getElementById('crumb');
    const title = page === 'home' ? 'GM Home' : page === 'between' ? 'Between Sessions' : page === 'session' ? 'Session Support' : page === 'players' ? 'Players' : 'Archive';
    if (crumb) crumb.textContent = `Greywake / ${title}`;
    if (isGMWorkspaceRoute) window.scrollTo({top:0,behavior:'auto'});
  }

  document.addEventListener('click', event => {
    if (!isFullGM()) return;
    const navButton = event.target.closest('[data-gm-route]');
    if (navButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      location.hash = navButton.dataset.gmRoute;
      return;
    }
    const go = event.target.closest('[data-gm-go]');
    if (go) {
      const route = ROUTES[go.dataset.gmGo];
      if (route) location.hash = route;
      return;
    }
    const preview = event.target.closest('[data-preview-player]');
    if (preview) {
      document.querySelector(`#gmPreviewBar [data-preview="${preview.dataset.previewPlayer}"]`)?.click();
    }
  }, true);

  window.addEventListener('hashchange', () => setTimeout(render, 0));
  window.addEventListener('greywake:player-ready', () => setTimeout(render, 0));
  document.addEventListener('DOMContentLoaded', () => setTimeout(render, 180));
  setTimeout(render, 260);
})();

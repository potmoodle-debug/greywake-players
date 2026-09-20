(() => {
  const main = document.getElementById('mainContent');
  const home = document.getElementById('home');
  const brain = document.getElementById('brainView');
  const article = document.getElementById('article');
  const goals = document.getElementById('playerGoals');
  if (!main || !home) return;

  const ROUTES = {
    '#/gm-cockpit': 'cockpit',
    '#/gm-players': 'players',
    '#/gm-greywake': 'greywake',
    '#/gm-campaign': 'campaign'
  };

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function ensureStyles() {
    if (document.getElementById('gm-navigation-fix-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-navigation-fix-styles';
    style.textContent = `
      .gm-route-workspace{display:none;max-width:1480px;margin:0 auto;padding:26px 30px 60px}.gm-route-workspace.is-open{display:block}
      .gm-route-top{display:flex;justify-content:space-between;gap:18px;align-items:center;margin:0 0 18px}.gm-route-back{border:1px solid #5b543c;background:#191a13;color:#ddcf9d;padding:9px 13px;font-size:9px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}.gm-route-label{color:#79715f;font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
      .gm-route-hero{padding:22px 24px;border:1px solid #454131;background:linear-gradient(135deg,#202117,#14150f);margin-bottom:14px}.gm-route-hero small{display:block;color:#a38e53;font-size:8px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.gm-route-hero h1{margin:5px 0 7px;font:34px/1.05 Georgia,serif;color:#f0e5c7}.gm-route-hero p{margin:0;max-width:780px;color:#9c947e;font-size:12px;line-height:1.55}
      .gm-route-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.gm-route-card{display:block;text-align:left;border:1px solid #3d3b2e;background:#151610;color:#dcd3bd;padding:15px 16px;text-decoration:none;cursor:pointer}.gm-route-card small{display:block;margin-bottom:5px;color:#a08d57;font-size:8px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.gm-route-card strong{display:block;font:20px/1.15 Georgia,serif;color:#e9dfc3;margin-bottom:6px}.gm-route-card span{display:block;color:#8d8673;font-size:10px;line-height:1.45}.gm-route-card:hover{border-color:#786b45;background:#1b1a12}
      .gm-route-section{margin-top:18px}.gm-route-section h2{font:26px/1.1 Georgia,serif;color:#e7ddbf;margin:0 0 12px}.gm-route-list{display:grid;gap:8px}.gm-route-line{padding:11px 12px;border-left:2px solid #655b3e;background:#13140f}.gm-route-line strong{display:block;color:#ddd3ba;font-size:11px;margin-bottom:3px}.gm-route-line span{display:block;color:#8f8875;font-size:10px;line-height:1.45}
      @media(max-width:900px){.gm-route-grid{grid-template-columns:1fr 1fr}}@media(max-width:620px){.gm-route-workspace{padding:18px 14px 40px}.gm-route-grid{grid-template-columns:1fr}.gm-route-top{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  function ensureWorkspace() {
    let ws = document.getElementById('gmRouteWorkspace');
    if (ws) return ws;
    ws = document.createElement('section');
    ws.id = 'gmRouteWorkspace';
    ws.className = 'gm-route-workspace';
    article?.insertAdjacentElement('beforebegin', ws);
    if (!ws.parentElement) main.appendChild(ws);
    return ws;
  }

  function hideBaseViews() {
    home.classList.add('hidden');
    brain?.classList.add('hidden');
    article?.classList.add('hidden');
    document.getElementById('playerPortal')?.classList.add('hidden');
    document.getElementById('characterPageView')?.classList.add('hidden');
    document.getElementById('gmCockpitWorkspace')?.classList.remove('is-open');
  }

  function baseTop(title) {
    return `<div class="gm-route-top"><button type="button" class="gm-route-back" data-gm-home>← GM Home</button><span class="gm-route-label">Greywake / ${esc(title)}</span></div>`;
  }

  function cockpitHTML() {
    const pressures = [
      ['CRITICAL ↑','The Closing Ways','Party choice. Concealed Digger haul entrances are being deliberately closed or filled. At least one closure required accurate knowledge of an undocumented entrance. Culprit, motive and whether all closures are connected remain open.'],
      ['HIGH →','Route-marker tampering','At least two route markers were deliberately altered. Culprit, motive and connection remain unknown.'],
      ['HIGH →','Cistern Plate','Intact in Greywake. Custody, examination, access and political handling remain unresolved.'],
      ['MEDIUM →','Ash-Plate recovery','Alive and walking, but injured and should not carry load until assessed.'],
      ['MEDIUM →','Abandoned freight','Valuable freight remains at Ash-Plate Groundfall; someone bears that economic loss.']
    ];
    const factions = [
      ['Diggers','Protect useful concealed haul access.','If ignored: affected crews become more guarded and improvise around lost entrances. Working inference.'],
      ['Cistern Keepers','Secure practical value from the returned Plate without damaging it.','If ignored: pressure grows for controlled custody and examination. Working inference.'],
      ['Caravan Syndicate','Account for losses, transport damage and unreliable routes.','If ignored: loss accounting and route-safety questions become harder to postpone.'],
      ['Tower Watch','Maintain observation and settlement order without claiming answers.','No automatic Closing Ways move unless evidence brings the Watch into it.'],
      ['The Faithful','Continue belief, comfort and interpretation.','Do not force them into unrelated mysteries.']
    ];
    const npcs = [
      ['Mara Vell','Practical truths must remain useful; fears certainty replacing evidence.'],
      ['Brannic Hale','Wants claims proportionate to evidence; resists rumour hardening into false certainty.'],
      ['Selka Marr','Needs reliable movement, loss accounting and commercial predictability.'],
      ['Maela Rusk','Her account can shape how Greywake understands the Kestrel Return losses and rescue.']
    ];
    const threads = [
      ['PURSUING','The Closing Ways','Who knows the routes? How are closures targeted? What is actually causing them?'],
      ['ACTIVE','Route-marker tampering','Who altered the markers, why, when, and whether the confirmed alterations are connected.'],
      ['ACTIVE','Cistern Plate','Custody, examination, practical effect, access and political consequences.'],
      ['ACTIVE','Nemi / The Stilling','Nemi is Stage 2. Treatments, progression and Velmira’s choices remain character-led.'],
      ['AVAILABLE','Flickerfly study','Marek’s declared interest; keep available without making it a mandatory detour.']
    ];
    return `${baseTop('GM Cockpit')}
      <div class="gm-route-hero"><small>GM LIVE INSTRUMENT PANEL</small><h1>Greywake Cockpit</h1><p>The next 30 seconds: where things stand, what is moving, who matters, and what remains unresolved.</p></div>
      <div class="gm-route-grid">
        <div class="gm-route-card"><small>NOW</small><strong>Session Four</strong><span>Greywake · Marek, Velmira, Odie · Party choice: The Closing Ways · opening time/weather not yet locked · confirm live Fear rather than reconstructing it.</span></div>
        <div class="gm-route-card"><small>PLAYER CHOICE</small><strong>The Closing Ways</strong><span>Odie suspects somebody is exposing concealed routes. That remains a hypothesis, not established truth.</span></div>
        <div class="gm-route-card"><small>REACTION CHECK</small><strong>After meaningful action</strong><span>Who benefits? Who loses? Who notices? Who profits? Who becomes suspicious? What rumour changes? What is different tomorrow?</span></div>
      </div>
      <section class="gm-route-section"><h2>Current pressures</h2><div class="gm-route-list">${pressures.map(([state,title,text])=>`<div class="gm-route-line"><strong>${esc(state)} · ${esc(title)}</strong><span>${esc(text)}</span></div>`).join('')}</div></section>
      <section class="gm-route-section"><h2>Faction pulse</h2><div class="gm-route-list">${factions.map(([name,goal,next])=>`<div class="gm-route-line"><strong>${esc(name)} — ${esc(goal)}</strong><span>${esc(next)}</span></div>`).join('')}</div></section>
      <section class="gm-route-section"><h2>NPC radar</h2><div class="gm-route-list">${npcs.map(([name,text])=>`<div class="gm-route-line"><strong>${esc(name)}</strong><span>${esc(text)}</span></div>`).join('')}</div></section>
      <section class="gm-route-section"><h2>Open threads</h2><div class="gm-route-list">${threads.map(([state,title,text])=>`<div class="gm-route-line"><strong>${esc(state)} · ${esc(title)}</strong><span>${esc(text)}</span></div>`).join('')}</div></section>
      <section class="gm-route-section"><h2>Session seeds</h2><div class="gm-route-grid"><div class="gm-route-card"><small>PHYSICAL LINE</small><strong>Inspect a closure</strong><span>Traces can establish how an entrance was closed without establishing who ordered it.</span></div><div class="gm-route-card"><small>PEOPLE LINE</small><strong>Compare route knowledge</strong><span>Different Digger crews know different fragments. Asking who knew creates trust and suspicion before it creates an answer.</span></div><div class="gm-route-card"><small>PATTERN LINE</small><strong>Compare the closures</strong><span>A pattern may emerge — or reveal that the closures do not share one cause.</span></div></div></section>`;
  }

  function playersHTML() {
    const groups = goals ? [...goals.querySelectorAll('.gm-goal-group')] : [];
    const cards = groups.map(group => {
      const name = group.querySelector(':scope > .eyebrow')?.textContent?.trim() || 'Player';
      const active = [...group.querySelectorAll('.gm-interest-thread:not(.interest-thread-resolved)')].filter(card => {
        const status = (card.querySelector('.interest-status')?.textContent || '').toUpperCase();
        return !status.includes('DORMANT') && !status.includes('RESOLVED');
      });
      const lines = active.length ? active.slice(0,5).map(card => {
        const title = card.querySelector('.interest-thread-head h3')?.textContent?.trim() || 'Current thread';
        const status = (card.querySelector('.interest-status')?.textContent || '').replace(/^.*?·\s*/, '').trim();
        return `<div class="gm-route-line"><strong>${esc(status || 'ACTIVE')} · ${esc(title)}</strong></div>`;
      }).join('') : '<div class="gm-route-line"><span>No active player threads.</span></div>';
      return `<section class="gm-route-section"><h2>${esc(name)}</h2><div class="gm-route-list">${lines}</div></section>`;
    }).join('');
    return `${baseTop('Player Priorities')}<div class="gm-route-hero"><small>PLAYER SIGNALS</small><h1>On their minds</h1><p>GM view of current player questions, interests and declared priorities. This is not the player-facing My Greywake page.</p></div>${cards || '<div class="gm-route-line"><span>Player priorities are still loading. Return here after the GM inbox appears on Home.</span></div>'}<div class="gm-route-section"><button class="gm-route-back" type="button" data-gm-home-scroll="goals">Open full GM inbox on Home</button></div>`;
  }

  function dataCards(category, kicker) {
    const data = window.GREYWAKE_DATA || {};
    const cats = window.GREYWAKE_CATEGORIES || {};
    return (cats[category] || []).filter(name => data[name]).slice(0,24).map(name => `<a class="gm-route-card" href="#/record/${encodeURIComponent(name)}"><small>${esc(kicker || category)}</small><strong>${esc(data[name].title || name)}</strong><span>Open record →</span></a>`).join('');
  }

  function greywakeHTML() {
    return `${baseTop('Greywake')}<div class="gm-route-hero"><small>WORLD RECORD</small><h1>Greywake</h1><p>Fast access to the shared world archive from the GM interface.</p></div>
      <section class="gm-route-section"><h2>People</h2><div class="gm-route-grid">${dataCards('People','PEOPLE')}</div></section>
      <section class="gm-route-section"><h2>Places & routes</h2><div class="gm-route-grid">${dataCards('Locations','PLACE')}</div></section>
      <section class="gm-route-section"><h2>Field guide</h2><div class="gm-route-grid">${dataCards('Flora & Fauna','FIELD GUIDE')}</div></section>`;
  }

  function campaignHTML() {
    const data = window.GREYWAKE_DATA || {};
    const sessions = (window.GREYWAKE_CATEGORIES?.Sessions || []).filter(name => data[name]);
    const sessionCards = sessions.map((name,i)=>`<a class="gm-route-card" href="#/record/${encodeURIComponent(name)}"><small>SESSION ${String(i+1).padStart(2,'0')}</small><strong>${esc(data[name].title || name)}</strong><span>Open recap →</span></a>`).join('');
    return `${baseTop('Campaign')}<div class="gm-route-hero"><small>ACTIVE CAMPAIGN</small><h1>Campaign</h1><p>Current direction and established session record, without forcing every open pressure into a quest.</p></div>
      <div class="gm-route-grid"><a class="gm-route-card" href="#/gm-cockpit"><small>PARTY PRIORITY</small><strong>The Closing Ways</strong><span>Open the live GM cockpit →</span></a><button type="button" class="gm-route-card" data-gm-home-scroll="threads"><small>CURRENT POSSIBILITIES</small><strong>Player-facing possibilities</strong><span>Open the live possibilities board on GM Home →</span></button></div>
      <section class="gm-route-section"><h2>Session record</h2><div class="gm-route-grid">${sessionCards || '<div class="gm-route-line"><span>No session records available.</span></div>'}</div></section>`;
  }

  function renderRoute() {
    if (!isFullGM()) {
      ensureWorkspace().classList.remove('is-open');
      return;
    }
    const route = ROUTES[location.hash || ''];
    const ws = ensureWorkspace();
    if (!route) {
      ws.classList.remove('is-open');
      return;
    }
    ensureStyles();
    hideBaseViews();
    ws.innerHTML = route === 'cockpit' ? cockpitHTML() : route === 'players' ? playersHTML() : route === 'greywake' ? greywakeHTML() : campaignHTML();
    ws.classList.add('is-open');
    document.getElementById('crumb').textContent = `Greywake / ${route === 'cockpit' ? 'GM Cockpit' : route === 'players' ? 'Player Priorities' : route[0].toUpperCase()+route.slice(1)}`;
    document.title = `${route === 'cockpit' ? 'GM Cockpit' : route === 'players' ? 'Player Priorities' : route[0].toUpperCase()+route.slice(1)} — Greywake`;
    window.scrollTo({top:0,behavior:'auto'});
  }

  function goHome(scrollId) {
    ensureWorkspace().classList.remove('is-open');
    location.hash = '#/';
    setTimeout(() => {
      if (!scrollId) return;
      const target = scrollId === 'goals' ? document.getElementById('playerGoals') : document.getElementById('currentThreads');
      target?.scrollIntoView({behavior:'smooth',block:'start'});
    }, 80);
  }

  document.addEventListener('click', event => {
    if (!isFullGM()) return;
    const target = event.target.closest('button,a');
    if (!target) return;
    const id = target.id;
    if (id === 'homeBtn') { event.preventDefault(); event.stopImmediatePropagation(); return goHome(); }
    if (id === 'myGreywakeBtn') { event.preventDefault(); event.stopImmediatePropagation(); location.hash = '#/gm-players'; return; }
    if (id === 'greywakeBtn') { event.preventDefault(); event.stopImmediatePropagation(); location.hash = '#/gm-greywake'; return; }
    if (id === 'campaignBtn') { event.preventDefault(); event.stopImmediatePropagation(); location.hash = '#/gm-campaign'; return; }
    if (id === 'gmCockpitShortcut' || target.matches('[data-open-gm-cockpit]')) { event.preventDefault(); event.stopImmediatePropagation(); location.hash = '#/gm-cockpit'; return; }
    if (id === 'gmMindShortcut' || target.matches('[data-open-gm-mind]')) { event.preventDefault(); event.stopImmediatePropagation(); location.hash = '#/gm-players'; return; }
    if (target.matches('[data-gm-home]')) { event.preventDefault(); return goHome(); }
    if (target.matches('[data-gm-home-scroll]')) { event.preventDefault(); return goHome(target.dataset.gmHomeScroll); }
  }, true);

  window.addEventListener('hashchange', () => setTimeout(renderRoute, 0));
  window.addEventListener('greywake:player-ready', renderRoute);
  document.addEventListener('DOMContentLoaded', renderRoute);
  setTimeout(renderRoute, 180);
  renderRoute();
})();
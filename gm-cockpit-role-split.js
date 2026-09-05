(() => {
  const COCKPIT_ROUTE = '#/gm-cockpit';
  const RUN_ROUTE = '#/gm-session';
  const PREP_ROUTE = '#/gm-prep';
  const UPDATE_ROUTE = '#/gm-update';
  const WORLD_ROUTE = '#/gm-world';
  const INBOX_ROUTE = '#/gm-inbox';
  const PLAYERS_ROUTE = '#/gm-players';
  const CAPTURE_KEY = 'greywake-gm-captures-v1';

  const fullGM = () => document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function activeCaptureCount() {
    try {
      const items = JSON.parse(localStorage.getItem(CAPTURE_KEY) || '[]');
      return Array.isArray(items) ? items.filter(item => item?.stage !== 'resolved').length : 0;
    } catch {
      return 0;
    }
  }

  function ensureStyles() {
    if (document.getElementById('gm-cockpit-role-split-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-cockpit-role-split-styles';
    style.textContent = `
      .gm-control-cockpit{max-width:1500px;margin:0 auto;padding:24px clamp(18px,3vw,42px) 72px;color:#d9d0ba}
      .gm-control-cockpit.hidden{display:none!important}
      .gm-control-hero{position:relative;overflow:hidden;min-height:300px;border:1px solid #554a31;background:#111;margin-bottom:16px}
      .gm-control-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.72) contrast(1.04)}
      .gm-control-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,11,8,.98),rgba(10,11,8,.77) 48%,rgba(10,11,8,.28))}
      .gm-control-hero-copy{position:relative;z-index:1;max-width:760px;padding:36px}
      .gm-control-hero small,.gm-control-card small,.gm-control-section>small{display:block;color:#aa945c;font-size:8px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
      .gm-control-hero h1{margin:7px 0 10px;color:#f0e5c8;font:700 clamp(38px,5vw,62px)/.95 Georgia,serif}
      .gm-control-hero p{margin:0;max-width:670px;color:#c0b7a3;font-size:12px;line-height:1.6}
      .gm-control-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}
      .gm-control-actions button,.gm-control-card{appearance:none;border:1px solid #665839;background:#1a1811;color:#e7d8ad;cursor:pointer;text-align:left}
      .gm-control-actions button{padding:11px 14px;font:900 9px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
      .gm-control-actions .gm-control-run{background:#c9a957;border-color:#e0c475;color:#17130b}
      .gm-control-actions button:hover,.gm-control-card:hover{border-color:#aa8d4d}
      .gm-control-job-strip{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
      .gm-control-job{border:1px solid #403c2f;background:#14150f;padding:15px 16px}
      .gm-control-job b{display:block;color:#eadfbe;font:700 20px/1.1 Georgia,serif;margin-bottom:5px}
      .gm-control-job span{display:block;color:#98907d;font-size:10px;line-height:1.5}
      .gm-control-job.live{border-color:#76633b;background:#1c1911}
      .gm-control-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px}
      .gm-control-card{padding:16px;min-height:142px}
      .gm-control-card strong{display:block;margin:6px 0;color:#e8dec4;font:700 21px/1.1 Georgia,serif}
      .gm-control-card span{display:block;color:#96907f;font-size:10px;line-height:1.48}
      .gm-control-card em{display:block;margin-top:12px;color:#d4bb76;font-size:9px;font-style:normal;font-weight:800}
      .gm-control-section{border:1px solid #3d3a2f;background:#171813;padding:17px;margin-bottom:16px}
      .gm-control-section h2{margin:5px 0 12px;color:#e9dfc8;font:700 24px/1.1 Georgia,serif}
      .gm-control-readiness{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
      .gm-control-readiness div{padding:11px;border:1px solid #37342a;background:#11120e}
      .gm-control-readiness small{display:block;color:#7e755e;font-size:7px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
      .gm-control-readiness strong{display:block;color:#d9cfb5;font-size:11px;line-height:1.35}
      body[data-role="gm"][data-gm-preview="false"] #primaryNav button[data-gm-cockpit="true"]{border-color:#75633b}
      @media(max-width:900px){.gm-control-grid{grid-template-columns:1fr 1fr}.gm-control-readiness{grid-template-columns:1fr 1fr}}
      @media(max-width:650px){.gm-control-cockpit{padding:18px 14px 60px}.gm-control-hero{min-height:360px}.gm-control-hero-copy{padding:26px}.gm-control-job-strip,.gm-control-grid,.gm-control-readiness{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureWorkspace() {
    let workspace = document.getElementById('gmControlCockpit');
    if (workspace) return workspace;
    workspace = document.createElement('section');
    workspace.id = 'gmControlCockpit';
    workspace.className = 'gm-control-cockpit hidden';
    workspace.setAttribute('aria-label', 'Greywake GM Cockpit');
    document.getElementById('mainContent')?.appendChild(workspace);
    return workspace;
  }

  function hideCompetingViews() {
    document.getElementById('gmOperationsView')?.classList.add('hidden');
    document.getElementById('gmRouteWorkspace')?.classList.remove('is-open');
    document.getElementById('home')?.classList.add('hidden');
    document.getElementById('brainView')?.classList.add('hidden');
    document.getElementById('article')?.classList.add('hidden');
    document.getElementById('playerPortal')?.classList.add('hidden');
    document.getElementById('characterPageView')?.classList.add('hidden');
  }

  function navigate(hash) {
    if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = hash;
  }

  function configureNav() {
    if (!fullGM()) return;
    const nav = document.getElementById('primaryNav');
    const runButton = document.querySelector('#primaryNav [data-gm-route="#/gm-session"]') || document.getElementById('homeBtn');
    const prepButton = document.querySelector('#primaryNav [data-gm-route="#/gm-prep"]') || document.getElementById('characterSheetBtn');
    if (!nav || !runButton || !prepButton) return;

    prepButton.textContent = 'COCKPIT';
    prepButton.dataset.gmRoute = COCKPIT_ROUTE;
    prepButton.dataset.gmCockpit = 'true';
    prepButton.removeAttribute('onclick');
    prepButton.removeAttribute('data-primary-section');

    if (prepButton !== nav.firstElementChild) nav.insertBefore(prepButton, runButton);
  }

  function syncNav() {
    if (!fullGM()) return;
    configureNav();
    if (location.hash !== COCKPIT_ROUTE) return;
    document.querySelectorAll('#primaryNav [data-gm-route]').forEach(button => {
      const selected = button.dataset.gmCockpit === 'true';
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function renderCockpit() {
    if (!fullGM()) return;
    const workspace = ensureWorkspace();
    if (location.hash !== COCKPIT_ROUTE) {
      workspace.classList.add('hidden');
      return;
    }

    ensureStyles();
    hideCompetingViews();
    const waiting = activeCaptureCount();
    workspace.innerHTML = `
      <div class="gm-authority"><div><small>GM CONTROL CENTRE</small><strong>Cockpit plans. Run plays.</strong><span>Campaign control stays here; table-time detail stays in Run.</span></div><span class="gm-status-badge">GM ONLY</span></div>

      <section class="gm-control-hero">
        <img src="assets/tower-distant.jpg" alt="">
        <div class="gm-control-hero-copy">
          <small>CAMPAIGN CONTROL</small>
          <h1>GM Cockpit</h1>
          <p>Use this before and between sessions to decide what needs attention, inspect the campaign, prepare likely material and process consequences. When play begins, launch Run and leave this overview behind.</p>
          <div class="gm-control-actions">
            <button type="button" class="gm-control-run" data-gm-split-go="${RUN_ROUTE}">Run Session →</button>
            <button type="button" data-gm-split-go="${PREP_ROUTE}">Open Prep</button>
            <button type="button" data-gm-split-go="${UPDATE_ROUTE}">Review ${waiting} capture${waiting === 1 ? '' : 's'}</button>
          </div>
        </div>
      </section>

      <div class="gm-control-job-strip" aria-label="GM workspace responsibilities">
        <div class="gm-control-job"><b>GM Cockpit</b><span>Campaign overview, prep, player priorities, world state, unresolved consequences and deciding what needs attention next.</span></div>
        <div class="gm-control-job live"><b>Run</b><span>Current scene, immediate pressures, live references, quick capture and the controls needed while the players are actually acting.</span></div>
      </div>

      <section class="gm-control-section">
        <small>SESSION READINESS</small>
        <h2>What needs to be ready before Run</h2>
        <div class="gm-control-readiness">
          <div><small>OPENING</small><strong>Marek / Odie / Velmira meet at the blocked Digger way</strong></div>
          <div><small>MAIN THREAD</small><strong>The Closing Ways remains the party-selected pressure</strong></div>
          <div><small>LIVE NAVIGATION</small><strong>Adventure routes belong in Prep; only the active route belongs in Run</strong></div>
          <div><small>CAPTURE QUEUE</small><strong>${waiting} item${waiting === 1 ? '' : 's'} waiting for review</strong></div>
        </div>
      </section>

      <div class="gm-control-grid">
        <button type="button" class="gm-control-card" data-gm-split-go="${PREP_ROUTE}"><small>BEFORE PLAY</small><strong>Prep</strong><span>Adventure nodes, likely locations, NPC decisions, player interests and material that may become relevant.</span><em>Open Prep →</em></button>
        <button type="button" class="gm-control-card" data-gm-split-go="${PLAYERS_ROUTE}"><small>PLAYER SIGNALS</small><strong>Players</strong><span>Review character priorities and what each player currently knows or is pursuing without turning those interests into assignments.</span><em>Open Players →</em></button>
        <button type="button" class="gm-control-card" data-gm-split-go="${WORLD_ROUTE}"><small>CAMPAIGN REFERENCE</small><strong>World</strong><span>Inspect Greywake records, places, people and established campaign material when preparing or checking consequences.</span><em>Open World →</em></button>
        <button type="button" class="gm-control-card" data-gm-split-go="${INBOX_ROUTE}"><small>NEEDS ATTENTION</small><strong>Inbox</strong><span>Questions, player messages and unresolved items that need a GM decision rather than live-session handling.</span><em>Open Inbox →</em></button>
        <button type="button" class="gm-control-card" data-gm-split-go="${UPDATE_ROUTE}"><small>AFTER PLAY</small><strong>Update</strong><span>Process captured changes, consequences and player-safe knowledge after the session instead of interrupting Run.</span><em>Open Update →</em></button>
        <button type="button" class="gm-control-card" data-gm-split-go="${RUN_ROUTE}"><small>AT THE TABLE</small><strong>Run Session</strong><span>Switch to the deliberately stripped-down live workspace once play starts.</span><em>Launch Run →</em></button>
      </div>
    `;
    workspace.classList.remove('hidden');

    const crumb = document.getElementById('crumb');
    if (crumb) crumb.textContent = 'Greywake / GM Cockpit';
    document.title = 'GM Cockpit — Greywake';
    syncNav();
    window.scrollTo({top: 0, behavior: 'auto'});
  }

  document.addEventListener('click', event => {
    if (!fullGM()) return;
    const cockpitButton = event.target.closest('[data-gm-cockpit="true"]');
    if (cockpitButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      navigate(COCKPIT_ROUTE);
      return;
    }
    const go = event.target.closest('[data-gm-split-go]');
    if (!go) return;
    event.preventDefault();
    navigate(go.dataset.gmSplitGo);
  }, true);

  function refresh() {
    if (!fullGM()) {
      document.getElementById('gmControlCockpit')?.classList.add('hidden');
      return;
    }
    configureNav();
    renderCockpit();
  }

  const observer = new MutationObserver(() => {
    if (!fullGM()) return;
    requestAnimationFrame(() => {
      configureNav();
      if (location.hash === COCKPIT_ROUTE) {
        hideCompetingViews();
        syncNav();
      }
    });
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});

  window.addEventListener('hashchange', () => setTimeout(refresh, 0));
  window.addEventListener('greywake:player-ready', () => setTimeout(refresh, 0));
  document.addEventListener('DOMContentLoaded', () => setTimeout(refresh, 0));
  setTimeout(refresh, 0);
  setTimeout(refresh, 250);
})();

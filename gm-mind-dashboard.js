(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;

  const MAX_MIND_SLOTS = 3;
  let scheduled = false;
  let observer = null;
  let cockpitOpen = false;

  const COCKPIT = {
    now: [
      ['Party', 'Marek · Velmira · Odie'],
      ['Location', 'Greywake'],
      ['Campaign point', 'End of Session Three / return aftermath'],
      ['Next session', 'Session Four'],
      ['Party choice', 'The Closing Ways'],
      ['Time', 'Opening clock not locked; use downtime rule if time jumps'],
      ['Fear', 'Confirm live total — do not reconstruct'],
      ['Weather', 'Not yet fixed']
    ],
    pressures: [
      { urgency: 'CRITICAL', trend: '↑', title: 'The Closing Ways', text: 'Party choice. Concealed Digger haul entrances are being deliberately closed or filled. At least one closure required accurate knowledge of an undocumented entrance. Culprit, motive and whether all closures are connected remain open.' },
      { urgency: 'HIGH', trend: '→', title: 'Route-marker tampering', text: 'At least two route markers were deliberately altered. Culprit, motive and connection remain unknown.' },
      { urgency: 'HIGH', trend: '→', title: 'Cistern Plate', text: 'Intact in Greywake. Custody, examination, access and political handling remain unresolved.' },
      { urgency: 'MEDIUM', trend: '→', title: 'Ash-Plate recovery', text: 'Alive and walking, but injured and should not carry load until assessed.' },
      { urgency: 'MEDIUM', trend: '→', title: 'Abandoned freight', text: 'Valuable freight remains at Ash-Plate Groundfall; someone bears that economic loss.' }
    ],
    factions: [
      ['Diggers', 'Protect useful concealed haul access.', 'If ignored: affected crews become more guarded and improvise around lost entrances. Working inference.'],
      ['Cistern Keepers', 'Secure practical value from the returned Plate without damaging it.', 'If ignored: pressure grows for controlled custody and examination. Working inference.'],
      ['Caravan Syndicate', 'Account for losses, transport damage and unreliable routes.', 'If ignored: loss accounting and route-safety questions become harder to postpone.'],
      ['Tower Watch', 'Maintain observation and settlement order without claiming answers.', 'No automatic Closing Ways move unless evidence brings the Watch into it.'],
      ['The Faithful', 'Continue belief, comfort and interpretation.', 'Do not force them into unrelated mysteries.']
    ],
    npcs: [
      ['Mara Vell', 'Wants practical truths to remain useful. Fears certainty replacing evidence.', 'Working model: friction when useful evidence is held too tightly.'],
      ['Brannic Hale', 'Wants claims proportionate to evidence and rumour kept from hardening into false certainty.', 'Working model: friction with fast circulation of unverified information.'],
      ['Selka Marr', 'Needs reliable movement, loss accounting and commercial predictability.', 'Route tampering and caravan losses make information economically important.'],
      ['Maela Rusk', 'Her account of the failed return can shape how Greywake understands the loss and rescue.', 'Do not pre-write her final report or blame.']
    ],
    threads: [
      ['PURSUING', 'The Closing Ways', 'Who knows the routes? How are closures targeted? What is actually causing them? Can more entrances be protected?'],
      ['ACTIVE', 'Route-marker tampering', 'Who altered the markers, why, when, and whether the confirmed alterations are connected.'],
      ['ACTIVE', 'Cistern Plate', 'Custody, examination, practical effect, access and political consequences.'],
      ['ACTIVE', 'Nemi / The Stilling', 'Nemi is Stage 2. Treatments, progression and Velmira’s choices remain character-led.'],
      ['AVAILABLE', 'Flickerfly study', 'Marek’s declared interest. Keep available without making it a mandatory detour.'],
      ['CONSEQUENCE', 'Abandoned freight', 'Economic loss and any later recovery follow ownership, risk and opportunity.']
    ],
    seeds: [
      ['Physical line', 'A recently sealed entrance offers traces showing how it was closed without establishing who ordered it.'],
      ['People line', 'Different Digger crews know different fragments of the network. Asking who knew a route creates trust and suspicion before it creates an answer.'],
      ['Pattern line', 'Compare which entrances were hit, when and what they were used for. A pattern may emerge — or show that the closures do not share one cause.']
    ]
  };

  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function ensureStyles() {
    if (document.getElementById('gm-mind-dashboard-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-mind-dashboard-styles';
    style.textContent = `
      .gm-home-status{margin:0 0 24px;border:1px solid #4b4734;background:#171811;box-shadow:0 14px 38px rgba(0,0,0,.18)}
      .gm-home-status-main{display:grid;grid-template-columns:minmax(220px,1.3fr) repeat(3,minmax(130px,.7fr)) auto;align-items:stretch}
      .gm-home-status-cell{padding:14px 16px;border-right:1px solid #343329;min-width:0}
      .gm-home-status-cell small{display:block;margin-bottom:5px;color:#8c8161;font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
      .gm-home-status-cell strong{display:block;color:#e5dcc3;font-size:12px;line-height:1.35}.gm-home-status-priority strong{font:19px/1.15 Georgia,serif;color:#f0dda2}
      .gm-home-status-action{display:flex;align-items:center;padding:10px}.gm-home-status-action button{height:100%;min-height:48px;border:1px solid #8a7440;background:#2c2515;color:#efd993;padding:10px 16px;font-size:9px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
      .gm-home-status-pressure{padding:9px 14px;border-top:1px solid #343329;color:#958d78;font-size:10px;line-height:1.45}.gm-home-status-pressure b{color:#bea96b;font-size:8px;letter-spacing:.1em;text-transform:uppercase;margin-right:8px}

      .gm-cockpit-workspace{display:none;padding:28px 32px 50px;max-width:1480px;margin:0 auto}.gm-cockpit-workspace.is-open{display:block}
      .gm-cockpit-workspace-nav{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:16px}
      .gm-cockpit-back{border:1px solid #55503b;background:#191a13;color:#d8c995;padding:9px 13px;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
      .gm-cockpit-workspace-nav span{color:#756f5f;font-size:9px;letter-spacing:.1em;text-transform:uppercase}
      .gm-cockpit{border:1px solid #454333;background:#12130e;box-shadow:0 20px 60px rgba(0,0,0,.28);overflow:hidden}
      .gm-cockpit-head{display:flex;justify-content:space-between;gap:22px;align-items:flex-end;padding:24px 26px;border-bottom:1px solid #39382c;background:linear-gradient(135deg,#1f2017,#14150f)}
      .gm-cockpit-head h2{margin:4px 0 0;font:34px/1.05 Georgia,serif;color:#f0e6c8}.gm-cockpit-head p{max-width:560px;margin:0;color:#9e967e;font-size:12px;line-height:1.55}
      .gm-cockpit-priority{padding:14px 26px;border-bottom:1px solid #39382c;background:#211d12;color:#d9c888;font-size:12px;line-height:1.5}.gm-cockpit-priority strong{color:#f1dda0;text-transform:uppercase;letter-spacing:.11em;font-size:9px;margin-right:8px}
      .gm-cockpit-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:1px;background:#333329}.gm-instrument{background:#151610;padding:18px 20px;min-width:0}.gm-instrument h3{margin:3px 0 14px;font:23px/1.1 Georgia,serif;color:#e7ddbf}.gm-instrument .eyebrow{font-size:8px;color:#9d8a53}
      .gm-now{grid-column:span 4}.gm-pressure-panel{grid-column:span 8}.gm-faction-panel{grid-column:span 6}.gm-npc-panel{grid-column:span 6}.gm-thread-panel{grid-column:span 7}.gm-seed-panel{grid-column:span 5}
      .gm-now-list{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;margin:0;font-size:11px}.gm-now-list dt{color:#827b67;text-transform:uppercase;letter-spacing:.08em;font-weight:800}.gm-now-list dd{margin:0;color:#d9d1bd}
      .gm-pressure-list,.gm-pulse-list,.gm-radar-list,.gm-thread-list,.gm-seed-list{display:grid;gap:9px}.gm-pressure{display:grid;grid-template-columns:66px 22px minmax(0,1fr);gap:9px;align-items:start;padding:10px 11px;border:1px solid #343428;background:#11120d}.gm-pressure-urgency{color:#c8b26f;font:800 8px/1.3 inherit;letter-spacing:.08em}.gm-pressure-trend{color:#d8c783;font-weight:900}.gm-pressure strong{display:block;color:#e3dac3;font-size:12px;margin-bottom:3px}.gm-pressure p{margin:0;color:#8f8977;font-size:10px;line-height:1.45}
      .gm-pulse,.gm-radar,.gm-thread,.gm-seed{padding:10px 11px;border-left:2px solid #5d573c;background:#11120d}.gm-pulse strong,.gm-radar strong,.gm-thread strong,.gm-seed strong{display:block;color:#ded4bb;font-size:11px;margin-bottom:3px}.gm-pulse span,.gm-radar span,.gm-thread span,.gm-seed span{display:block;color:#918a77;font-size:10px;line-height:1.45}.gm-pulse em,.gm-radar em{display:block;margin-top:4px;color:#77705f;font-size:9px;font-style:normal}.gm-thread{display:grid;grid-template-columns:70px minmax(0,1fr);gap:9px}.gm-thread-state{color:#bda968;font:800 8px/1.4 inherit;letter-spacing:.08em}
      .gm-cockpit-footer{padding:12px 26px;border-top:1px solid #39382c;color:#7f7866;font-size:10px;line-height:1.45}.gm-cockpit-footer strong{color:#bca96d}

      .gm-mind-dashboard{margin:0 0 28px;padding:18px 0;background:transparent}.gm-mind-dashboard-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:14px}.gm-mind-dashboard-head h2{margin:4px 0 0;font:27px/1.1 Georgia,serif;color:#eadfbd}.gm-mind-dashboard-head p{max-width:580px;margin:0;color:#9b927a;font-size:11px;line-height:1.45}.gm-mind-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .gm-mind-player{border:1px solid #38392d;background:#171811;padding:14px 15px;min-width:0}.gm-mind-player-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:9px}.gm-mind-player-head strong{font:21px/1.05 Georgia,serif;color:#f0e7ce}.gm-mind-count{color:#bba76b;font-size:7px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.gm-mind-list{display:grid;gap:6px}.gm-mind-item{display:block;width:100%;text-align:left;border:1px solid rgba(113,102,69,.42);background:#12130e;color:#d6cfbc;padding:8px 9px;cursor:pointer;font:10px/1.4 inherit}.gm-mind-item small{display:block;margin-bottom:3px;color:#a9945c;font-size:7px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.gm-mind-empty{padding:9px;border:1px dashed rgba(113,102,69,.34);color:#817a69;font-size:9px}.gm-mind-open-inbox{margin-top:10px;border:0;background:none;color:#bbaa78;padding:0;text-decoration:underline;cursor:pointer;font-size:9px}
      #gmCockpitShortcut,#gmMindShortcut{border:1px solid #61583b;background:#211e14;color:#dfcd94;padding:8px 10px;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}#gmCockpitShortcut{border-color:#88733f;background:#2a2415;color:#f0d98d}
      @media(max-width:1120px){.gm-home-status-main{grid-template-columns:1fr 1fr}.gm-home-status-action{grid-column:span 2}.gm-home-status-cell:nth-child(even){border-right:0}.gm-now,.gm-pressure-panel,.gm-faction-panel,.gm-npc-panel,.gm-thread-panel,.gm-seed-panel{grid-column:span 12}.gm-mind-grid{grid-template-columns:1fr}}
      @media(max-width:760px){.gm-cockpit-workspace{padding:18px 14px 36px}.gm-cockpit-head,.gm-mind-dashboard-head{display:block}.gm-cockpit-head p,.gm-mind-dashboard-head p{margin-top:8px}.gm-home-status-main{display:block}.gm-home-status-cell{border-right:0;border-bottom:1px solid #343329}.gm-home-status-action{display:block}.gm-home-status-action button{width:100%}.gm-pressure{grid-template-columns:58px 18px minmax(0,1fr)}}
    `;
    document.head.appendChild(style);
  }

  function activeMindCards(group) {
    return [...group.querySelectorAll('.gm-interest-thread:not(.interest-thread-resolved)')].filter(card => {
      const kind = (card.dataset.entryKind || '').toLowerCase();
      const status = (card.querySelector('.interest-status')?.textContent || '').toUpperCase();
      return kind === 'interest' && !status.includes('DORMANT') && !status.includes('RESOLVED');
    });
  }

  function playerName(group) {
    return group.querySelector(':scope > .eyebrow')?.textContent?.trim() || 'PLAYER';
  }

  function cockpitMarkup() {
    const now = COCKPIT.now.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
    const pressures = COCKPIT.pressures.map(p => `<div class="gm-pressure"><span class="gm-pressure-urgency">${esc(p.urgency)}</span><span class="gm-pressure-trend">${esc(p.trend)}</span><div><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p></div></div>`).join('');
    const factions = COCKPIT.factions.map(([name,goal,next]) => `<div class="gm-pulse"><strong>${esc(name)}</strong><span>${esc(goal)}</span><em>${esc(next)}</em></div>`).join('');
    const npcs = COCKPIT.npcs.map(([name,wants,relevance]) => `<div class="gm-radar"><strong>${esc(name)}</strong><span>${esc(wants)}</span><em>${esc(relevance)}</em></div>`).join('');
    const threads = COCKPIT.threads.map(([state,title,text]) => `<div class="gm-thread"><span class="gm-thread-state">${esc(state)}</span><div><strong>${esc(title)}</strong><span>${esc(text)}</span></div></div>`).join('');
    const seeds = COCKPIT.seeds.map(([title,text]) => `<div class="gm-seed"><strong>${esc(title)}</strong><span>${esc(text)}</span></div>`).join('');
    return `<div class="gm-cockpit-workspace-nav"><button type="button" class="gm-cockpit-back">← GM Home</button><span>GM-only workspace</span></div><section class="gm-cockpit" id="gmCockpit" aria-label="Greywake GM cockpit"><div class="gm-cockpit-head"><div><div class="eyebrow">GM LIVE INSTRUMENT PANEL</div><h2>Greywake Cockpit</h2></div><p>Answer the next 30 seconds: where things stand, what is moving, who matters and what remains open. Detailed lore stays in Obsidian.</p></div><div class="gm-cockpit-priority"><strong>Party choice</strong>The Closing Ways — investigate how concealed Digger routes are being exposed and stop further losses. Odie's culprit theory is a hypothesis, not established truth.</div><div class="gm-cockpit-grid"><section class="gm-instrument gm-now"><div class="eyebrow">NOW</div><h3>Live state</h3><dl class="gm-now-list">${now}</dl></section><section class="gm-instrument gm-pressure-panel"><div class="eyebrow">CURRENT PRESSURES</div><h3>What is moving</h3><div class="gm-pressure-list">${pressures}</div></section><section class="gm-instrument gm-faction-panel"><div class="eyebrow">FACTION PULSE</div><h3>If the PCs do nothing</h3><div class="gm-pulse-list">${factions}</div></section><section class="gm-instrument gm-npc-panel"><div class="eyebrow">NPC RADAR</div><h3>People likely to matter</h3><div class="gm-radar-list">${npcs}</div></section><section class="gm-instrument gm-thread-panel"><div class="eyebrow">OPEN THREADS</div><h3>Keep these unresolved</h3><div class="gm-thread-list">${threads}</div></section><section class="gm-instrument gm-seed-panel"><div class="eyebrow">SESSION SEEDS</div><h3>Prompts, not scenes</h3><div class="gm-seed-list">${seeds}</div></section></div><div class="gm-cockpit-footer"><strong>Reaction check:</strong> Who benefits? Who loses? Who notices? Who profits? Who becomes suspicious? What rumour changes? What is different tomorrow? Update one instrument rather than writing a new plot.</div></section>`;
  }

  function ensureCockpitWorkspace() {
    const main = document.getElementById('mainContent');
    if (!main) return null;
    let workspace = document.getElementById('gmCockpitWorkspace');
    if (!workspace) {
      workspace = document.createElement('section');
      workspace.id = 'gmCockpitWorkspace';
      workspace.className = 'gm-cockpit-workspace';
      workspace.innerHTML = cockpitMarkup();
      main.appendChild(workspace);
      workspace.querySelector('.gm-cockpit-back')?.addEventListener('click', closeCockpit);
    }
    return workspace;
  }

  function homeViews() {
    return [document.getElementById('home'), document.getElementById('brainView'), document.getElementById('article')].filter(Boolean);
  }

  function openCockpit() {
    if (!isFullGM()) return;
    const workspace = ensureCockpitWorkspace();
    if (!workspace) return;
    cockpitOpen = true;
    homeViews().forEach(el => { el.dataset.gmCockpitWasHidden = String(el.classList.contains('hidden') || el.hidden); el.classList.add('hidden'); });
    workspace.classList.add('is-open');
    workspace.scrollIntoView({behavior:'smooth', block:'start'});
    document.getElementById('crumb').textContent = 'Greywake / GM Cockpit';
  }

  function closeCockpit() {
    const workspace = document.getElementById('gmCockpitWorkspace');
    workspace?.classList.remove('is-open');
    cockpitOpen = false;
    const home = document.getElementById('home');
    home?.classList.remove('hidden');
    document.getElementById('brainView')?.classList.add('hidden');
    document.getElementById('article')?.classList.add('hidden');
    const crumb = document.getElementById('crumb');
    if (crumb) crumb.textContent = 'Greywake / Home';
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function homeStatusMarkup() {
    const p = COCKPIT.pressures;
    return `<section class="gm-home-status" aria-label="GM quick status"><div class="gm-home-status-main"><div class="gm-home-status-cell gm-home-status-priority"><small>Party choice · Session Four</small><strong>The Closing Ways</strong></div><div class="gm-home-status-cell"><small>Location</small><strong>Greywake</strong></div><div class="gm-home-status-cell"><small>Pressure</small><strong>${esc(p[0].urgency)} ${esc(p[0].trend)} ${esc(p[0].title)}</strong></div><div class="gm-home-status-cell"><small>Also moving</small><strong>${esc(p[1].title)} · ${esc(p[2].title)}</strong></div><div class="gm-home-status-action"><button type="button" data-open-gm-cockpit>Open GM Cockpit →</button></div></div><div class="gm-home-status-pressure"><b>30-second status</b>Concealed Digger routes are being closed. Odie suspects exposure of route locations; culprit, motive and whether every closure is connected remain open.</div></section>`;
  }

  function renderMindDashboard(groups) {
    const existing = host.querySelector('.gm-mind-dashboard');
    existing?.remove();
    const dashboard = document.createElement('section');
    dashboard.className = 'gm-mind-dashboard';
    dashboard.id = 'gmMindDashboard';
    const cards = groups.map(group => {
      const name = playerName(group);
      const minds = activeMindCards(group);
      const items = minds.length ? minds.slice(0, MAX_MIND_SLOTS).map(card => {
        const text = card.querySelector('.interest-thread-head h3')?.textContent?.trim() || 'Current interest';
        const status = (card.querySelector('.interest-status')?.textContent || '').replace(/^.*?·\s*/, '').trim();
        const id = card.dataset.goalId || '';
        return `<button type="button" class="gm-mind-item" data-mind-goal="${esc(id)}"><small>${esc(status || 'ON THEIR MIND')}</small>${esc(text)}</button>`;
      }).join('') : '<div class="gm-mind-empty">Nothing currently occupying an active slot.</div>';
      return `<article class="gm-mind-player"><div class="gm-mind-player-head"><strong>${esc(name[0] + name.slice(1).toLowerCase())}</strong><span class="gm-mind-count">${Math.min(minds.length, MAX_MIND_SLOTS)}/${MAX_MIND_SLOTS}</span></div><div class="gm-mind-list">${items}</div></article>`;
    }).join('');
    dashboard.innerHTML = `<div class="gm-mind-dashboard-head"><div><div class="eyebrow">PLAYER PRIORITY SIGNALS</div><h2>What's on their minds</h2></div><p>A compact glance at declared interests. The full inbox remains below.</p></div><div class="gm-mind-grid">${cards}</div><button type="button" class="gm-mind-open-inbox">Open full questions & interests inbox ↓</button>`;
    host.prepend(dashboard);
    dashboard.querySelectorAll('[data-mind-goal]').forEach(button => button.addEventListener('click', () => host.querySelector(`.gm-interest-thread[data-goal-id="${CSS.escape(button.dataset.mindGoal)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'})));
    dashboard.querySelector('.gm-mind-open-inbox')?.addEventListener('click', () => host.querySelector('.gm-goal-group')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }

  function renderHomeStatus() {
    host.querySelector('.gm-home-status')?.remove();
    const wrap = document.createElement('div');
    wrap.innerHTML = homeStatusMarkup();
    const status = wrap.firstElementChild;
    host.prepend(status);
    status.querySelector('[data-open-gm-cockpit]')?.addEventListener('click', openCockpit);
  }

  function ensureTopbarButtons() {
    const topbar = document.querySelector('.topbar');
    const brainBtn = document.getElementById('brainBtn');
    if (!topbar || !brainBtn) return;
    document.getElementById('gmCockpitShortcut')?.remove();
    document.getElementById('gmMindShortcut')?.remove();
    const cockpit = document.createElement('button');
    cockpit.id = 'gmCockpitShortcut'; cockpit.type = 'button'; cockpit.textContent = 'GM Cockpit'; cockpit.addEventListener('click', openCockpit);
    const minds = document.createElement('button');
    minds.id = 'gmMindShortcut'; minds.type = 'button'; minds.textContent = 'On their minds'; minds.addEventListener('click', () => { if (cockpitOpen) closeCockpit(); document.getElementById('gmMindDashboard')?.scrollIntoView({behavior:'smooth',block:'start'}); });
    topbar.insertBefore(cockpit, brainBtn); topbar.insertBefore(minds, brainBtn);
  }

  function cleanup() {
    host.querySelector('.gm-home-status')?.remove();
    host.querySelector('.gm-mind-dashboard')?.remove();
    document.getElementById('gmCockpitShortcut')?.remove();
    document.getElementById('gmMindShortcut')?.remove();
    document.getElementById('gmCockpitWorkspace')?.remove();
    cockpitOpen = false;
  }

  function enhance() {
    if (!isFullGM()) { cleanup(); return; }
    observer?.disconnect();
    try {
      ensureStyles();
      const groups = [...host.querySelectorAll('.gm-goal-group')];
      if (!groups.length) return;
      renderMindDashboard(groups);
      renderHomeStatus();
      ensureCockpitWorkspace();
      ensureTopbarButtons();
    } finally {
      if (isFullGM()) observer?.observe(host, {childList:true, subtree:true});
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  }

  observer = new MutationObserver(() => { if (isFullGM()) schedule(); });
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  window.addEventListener('hashchange', () => { if (cockpitOpen) closeCockpit(); });
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
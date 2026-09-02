(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;

  const MAX_MIND_SLOTS = 3;
  let scheduled = false;
  let observer = null;

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
      .gm-cockpit{margin:0 0 32px;border:1px solid #454333;background:#12130e;box-shadow:0 20px 60px rgba(0,0,0,.28);overflow:hidden}
      .gm-cockpit-head{display:flex;justify-content:space-between;gap:22px;align-items:flex-end;padding:24px 26px;border-bottom:1px solid #39382c;background:linear-gradient(135deg,#1f2017,#14150f)}
      .gm-cockpit-head h2{margin:4px 0 0;font:34px/1.05 Georgia,serif;color:#f0e6c8}
      .gm-cockpit-head p{max-width:560px;margin:0;color:#9e967e;font-size:12px;line-height:1.55}
      .gm-cockpit-priority{padding:14px 26px;border-bottom:1px solid #39382c;background:#211d12;color:#d9c888;font-size:12px;line-height:1.5}
      .gm-cockpit-priority strong{color:#f1dda0;text-transform:uppercase;letter-spacing:.11em;font-size:9px;margin-right:8px}
      .gm-cockpit-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:1px;background:#333329}
      .gm-instrument{background:#151610;padding:18px 20px;min-width:0}
      .gm-instrument h3{margin:3px 0 14px;font:23px/1.1 Georgia,serif;color:#e7ddbf}
      .gm-instrument .eyebrow{font-size:8px;color:#9d8a53}
      .gm-now{grid-column:span 4}.gm-pressure-panel{grid-column:span 8}.gm-faction-panel{grid-column:span 6}.gm-npc-panel{grid-column:span 6}.gm-thread-panel{grid-column:span 7}.gm-seed-panel{grid-column:span 5}
      .gm-now-list{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;margin:0;font-size:11px}
      .gm-now-list dt{color:#827b67;text-transform:uppercase;letter-spacing:.08em;font-weight:800}.gm-now-list dd{margin:0;color:#d9d1bd}
      .gm-pressure-list,.gm-pulse-list,.gm-radar-list,.gm-thread-list,.gm-seed-list{display:grid;gap:9px}
      .gm-pressure{display:grid;grid-template-columns:66px 22px minmax(0,1fr);gap:9px;align-items:start;padding:10px 11px;border:1px solid #343428;background:#11120d}
      .gm-pressure-urgency{color:#c8b26f;font:800 8px/1.3 inherit;letter-spacing:.08em}.gm-pressure-trend{color:#d8c783;font-weight:900}.gm-pressure strong{display:block;color:#e3dac3;font-size:12px;margin-bottom:3px}.gm-pressure p{margin:0;color:#8f8977;font-size:10px;line-height:1.45}
      .gm-pulse,.gm-radar,.gm-thread,.gm-seed{padding:10px 11px;border-left:2px solid #5d573c;background:#11120d}.gm-pulse strong,.gm-radar strong,.gm-thread strong,.gm-seed strong{display:block;color:#ded4bb;font-size:11px;margin-bottom:3px}.gm-pulse span,.gm-radar span,.gm-thread span,.gm-seed span{display:block;color:#918a77;font-size:10px;line-height:1.45}.gm-pulse em,.gm-radar em{display:block;margin-top:4px;color:#77705f;font-size:9px;font-style:normal}
      .gm-thread{display:grid;grid-template-columns:70px minmax(0,1fr);gap:9px}.gm-thread-state{color:#bda968;font:800 8px/1.4 inherit;letter-spacing:.08em}
      .gm-cockpit-footer{padding:12px 26px;border-top:1px solid #39382c;color:#7f7866;font-size:10px;line-height:1.45}.gm-cockpit-footer strong{color:#bca96d}
      .gm-mind-dashboard{margin:0 0 30px;padding:22px 0;background:transparent}
      .gm-mind-dashboard-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:18px}
      .gm-mind-dashboard-head h2{margin:4px 0 0;font:30px/1.1 Georgia,serif;color:#eadfbd}
      .gm-mind-dashboard-head p{max-width:600px;margin:0;color:#9b927a;font-size:12px;line-height:1.5}
      .gm-mind-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .gm-mind-player{position:relative;min-height:250px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid #3a3b2e;background:#171811;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,.2)}
      .gm-mind-player:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 72% 20%,#4a4028,#171811 58%);z-index:0}.gm-mind-player:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,9,6,.05),rgba(8,9,6,.25) 36%,rgba(8,9,6,.98) 100%);z-index:1}.gm-mind-player>*{position:relative;z-index:2}
      .gm-mind-player-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:22px 22px 0}.gm-mind-player-head strong{font:28px/1.08 Georgia,serif;color:#f0e7ce}.gm-mind-count{color:#e2c878;font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
      .gm-mind-list{display:grid;gap:8px;padding:16px 22px 22px}.gm-mind-item{display:block;width:100%;text-align:left;border:1px solid rgba(113,102,69,.52);background:rgba(20,20,15,.76);color:#ded6c2;padding:11px 12px;cursor:pointer;font:12px/1.45 inherit}.gm-mind-item small{display:block;margin-bottom:4px;color:#c4ad6e;font-size:8px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.gm-mind-empty{margin:0 22px 22px;padding:12px;border:1px solid rgba(113,102,69,.36);background:rgba(20,20,15,.62);color:#8f8875;font-size:11px;line-height:1.5}.gm-mind-open-inbox{margin-top:14px;border:0;background:none;color:#bbaa78;padding:0;text-decoration:underline;cursor:pointer;font-size:10px}
      #gmCockpitShortcut,#gmMindShortcut{border:1px solid #61583b;background:#211e14;color:#dfcd94;padding:8px 10px;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}#gmCockpitShortcut{border-color:#88733f;background:#2a2415;color:#f0d98d}
      @media(max-width:1120px){.gm-now,.gm-pressure-panel,.gm-faction-panel,.gm-npc-panel,.gm-thread-panel,.gm-seed-panel{grid-column:span 12}.gm-mind-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.gm-cockpit-head,.gm-mind-dashboard-head{display:block}.gm-cockpit-head p,.gm-mind-dashboard-head p{margin-top:8px}.gm-mind-grid{grid-template-columns:1fr}.gm-pressure{grid-template-columns:58px 18px minmax(0,1fr)}}
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
    return `<section class="gm-cockpit" id="gmCockpit" aria-label="Greywake GM cockpit">
      <div class="gm-cockpit-head"><div><div class="eyebrow">GM LIVE INSTRUMENT PANEL</div><h2>Greywake Cockpit</h2></div><p>Answer the next 30 seconds: where things stand, what is moving, who matters and what remains open. Detailed lore stays in Obsidian.</p></div>
      <div class="gm-cockpit-priority"><strong>Party choice</strong>The Closing Ways — investigate how concealed Digger routes are being exposed and stop further losses. Odie's culprit theory is a hypothesis, not established truth.</div>
      <div class="gm-cockpit-grid">
        <section class="gm-instrument gm-now"><div class="eyebrow">NOW</div><h3>Live state</h3><dl class="gm-now-list">${now}</dl></section>
        <section class="gm-instrument gm-pressure-panel"><div class="eyebrow">CURRENT PRESSURES</div><h3>What is moving</h3><div class="gm-pressure-list">${pressures}</div></section>
        <section class="gm-instrument gm-faction-panel"><div class="eyebrow">FACTION PULSE</div><h3>If the PCs do nothing</h3><div class="gm-pulse-list">${factions}</div></section>
        <section class="gm-instrument gm-npc-panel"><div class="eyebrow">NPC RADAR</div><h3>People likely to matter</h3><div class="gm-radar-list">${npcs}</div></section>
        <section class="gm-instrument gm-thread-panel"><div class="eyebrow">OPEN THREADS</div><h3>Keep these unresolved</h3><div class="gm-thread-list">${threads}</div></section>
        <section class="gm-instrument gm-seed-panel"><div class="eyebrow">SESSION SEEDS</div><h3>Prompts, not scenes</h3><div class="gm-seed-list">${seeds}</div></section>
      </div>
      <div class="gm-cockpit-footer"><strong>Reaction check:</strong> Who benefits? Who loses? Who notices? Who profits? Who becomes suspicious? What rumour changes? What is different tomorrow? Do not invent a mastermind simply to connect mysteries.</div>
    </section>`;
  }

  function cleanup() {
    host.querySelector('.gm-cockpit')?.remove();
    host.querySelector('.gm-mind-dashboard')?.remove();
    document.getElementById('gmCockpitShortcut')?.remove();
    document.getElementById('gmMindShortcut')?.remove();
  }

  function enhance() {
    if (!isFullGM()) { cleanup(); return; }
    observer?.disconnect();
    try {
      cleanup();
      ensureStyles();
      const groups = [...host.querySelectorAll('.gm-goal-group')];
      if (!groups.length) return;

      host.insertAdjacentHTML('afterbegin', cockpitMarkup());
      const cockpit = host.querySelector('#gmCockpit');

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
        return `<article class="gm-mind-player"><div class="gm-mind-player-head"><strong>${esc(name[0] + name.slice(1).toLowerCase())}</strong><span class="gm-mind-count">${Math.min(minds.length, MAX_MIND_SLOTS)}/${MAX_MIND_SLOTS} ON THEIR MIND</span></div><div class="gm-mind-list">${items}</div></article>`;
      }).join('');

      dashboard.innerHTML = `<div class="gm-mind-dashboard-head"><div><div class="eyebrow">PLAYER INTENT</div><h2>What's on their minds</h2></div><p>This remains driven by the live player inbox. It sits below the cockpit so player intention stays visible without replacing world state.</p></div><div class="gm-mind-grid">${cards}</div><button type="button" class="gm-mind-open-inbox">Open full questions & interests inbox ↓</button>`;
      cockpit?.insertAdjacentElement('afterend', dashboard);

      dashboard.querySelectorAll('[data-mind-goal]').forEach(button => button.addEventListener('click', () => {
        host.querySelector(`.gm-interest-thread[data-goal-id="${CSS.escape(button.dataset.mindGoal)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});
      }));
      dashboard.querySelector('.gm-mind-open-inbox')?.addEventListener('click', () => host.querySelector('.gm-goal-group')?.scrollIntoView({behavior:'smooth',block:'start'}));

      const topbar = document.querySelector('.topbar');
      const brainBtn = document.getElementById('brainBtn');
      if (topbar && brainBtn) {
        const cockpitShortcut = document.createElement('button');
        cockpitShortcut.id = 'gmCockpitShortcut'; cockpitShortcut.type = 'button'; cockpitShortcut.textContent = 'GM Cockpit';
        cockpitShortcut.addEventListener('click', () => cockpit?.scrollIntoView({behavior:'smooth',block:'start'}));
        topbar.insertBefore(cockpitShortcut, brainBtn);
        const mindShortcut = document.createElement('button');
        mindShortcut.id = 'gmMindShortcut'; mindShortcut.type = 'button'; mindShortcut.textContent = 'Player intent';
        mindShortcut.addEventListener('click', () => dashboard.scrollIntoView({behavior:'smooth',block:'start'}));
        topbar.insertBefore(mindShortcut, brainBtn);
      }
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
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();

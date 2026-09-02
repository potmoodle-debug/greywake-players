(() => {
  let scheduled = false;

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function ensureStyles() {
    if (document.getElementById('gm-visual-cockpit-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-visual-cockpit-styles';
    style.textContent = `
      .gm-vc{display:grid;gap:16px}
      .gm-vc-top{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(5,minmax(110px,.55fr));gap:8px}
      .gm-vc-instrument{min-height:76px;border:1px solid #403c2d;background:#151610;padding:12px 13px;display:flex;flex-direction:column;justify-content:space-between}
      .gm-vc-instrument small{color:#8f825e;font-size:7px;font-weight:900;letter-spacing:.15em;text-transform:uppercase}.gm-vc-instrument strong{color:#e9dfc4;font:18px/1.05 Georgia,serif}.gm-vc-instrument span{color:#8f8875;font-size:9px;line-height:1.35}
      .gm-vc-priority{background:linear-gradient(135deg,#302718,#18160f);border-color:#7e6939}.gm-vc-priority strong{font-size:25px;color:#f2dda0}

      .gm-vc-section{border:1px solid #39372b;background:#11120d;padding:16px}.gm-vc-section-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:12px}.gm-vc-section-head small{display:block;color:#9b8650;font-size:7px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.gm-vc-section-head h2{margin:3px 0 0;color:#eadfbd;font:26px/1.05 Georgia,serif}.gm-vc-section-head p{margin:0;max-width:560px;color:#817a68;font-size:9px;line-height:1.4}

      .gm-vc-pressure-board{display:grid;grid-template-columns:1.55fr 1fr 1fr;grid-template-rows:auto auto;gap:10px}.gm-vc-pressure{position:relative;min-height:126px;padding:14px 15px 16px;border:1px solid #3d392a;background:#171811;overflow:hidden}.gm-vc-pressure:after{content:"";position:absolute;inset:auto 0 0 0;height:3px;background:#5b553d}.gm-vc-pressure[data-level="critical"]{grid-row:span 2;min-height:262px;border-color:#80693a;background:radial-gradient(circle at 78% 16%,rgba(112,89,40,.25),transparent 35%),#1a1811}.gm-vc-pressure[data-level="critical"]:after{height:5px;background:#a98b49}.gm-vc-pressure[data-level="high"]:after{background:#82713f}.gm-vc-pressure[data-level="medium"]:after{background:#5e5a44}.gm-vc-pressure-top{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:14px}.gm-vc-pressure-badge{font-size:7px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#c7b06c}.gm-vc-trend{font-size:18px;font-weight:900;color:#d5c37f}.gm-vc-pressure h3{margin:0 0 7px;color:#ece1c5;font:22px/1.08 Georgia,serif}.gm-vc-pressure[data-level="critical"] h3{font-size:34px;color:#f2dda0}.gm-vc-pressure p{margin:0;color:#918a76;font-size:10px;line-height:1.48}.gm-vc-pressure .gm-vc-question{margin-top:12px;padding-top:10px;border-top:1px dashed #45402e;color:#c1b17d;font-size:9px;font-style:italic}

      .gm-vc-mid{display:grid;grid-template-columns:1.15fr .85fr;gap:16px}
      .gm-vc-investigation{position:relative;min-height:430px;background:radial-gradient(circle at 50% 45%,rgba(87,74,44,.12),transparent 34%),linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px),#13140f;background-size:auto,24px 24px,24px 24px;overflow:hidden}
      .gm-vc-investigation:before{content:"";position:absolute;left:50%;top:76px;bottom:76px;width:1px;background:#4a4430;opacity:.7}.gm-vc-investigation:after{content:"";position:absolute;left:16%;right:16%;top:50%;height:1px;background:#4a4430;opacity:.7}
      .gm-vc-node{position:absolute;width:180px;min-height:76px;padding:10px 11px;border:1px solid #504a36;background:#1a1b14;box-shadow:0 8px 20px rgba(0,0,0,.25);z-index:2}.gm-vc-node small{display:block;color:#9e8a57;font-size:7px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;margin-bottom:5px}.gm-vc-node strong{display:block;color:#e5dbc0;font:17px/1.08 Georgia,serif;margin-bottom:4px}.gm-vc-node span{display:block;color:#8d8673;font-size:9px;line-height:1.4}.gm-vc-node.confirmed{border-color:#6f6444}.gm-vc-node.hypothesis{border-style:dashed}.gm-vc-node.unknown{border-style:dotted;color:#857b60}.gm-vc-node.center{left:50%;top:50%;transform:translate(-50%,-50%);width:220px;min-height:100px;border-color:#8a7140;background:#211c11}.gm-vc-node.n1{left:5%;top:12%}.gm-vc-node.n2{right:5%;top:12%}.gm-vc-node.n3{left:5%;bottom:10%}.gm-vc-node.n4{right:5%;bottom:10%}
      .gm-vc-legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:10px}.gm-vc-legend span{color:#817966;font-size:8px}.gm-vc-legend b{display:inline-block;width:18px;border-top:1px solid #766b49;margin-right:5px;vertical-align:middle}.gm-vc-legend .dashed b{border-top-style:dashed}.gm-vc-legend .dotted b{border-top-style:dotted}

      .gm-vc-radar{display:grid;grid-template-columns:1fr 1fr;gap:10px}.gm-vc-radar-card{border:1px solid #38362a;background:#151610;padding:12px}.gm-vc-radar-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;border:1px solid #655a3d;background:#211e14;color:#d7c486;font:17px/1 Georgia,serif;margin-bottom:8px}.gm-vc-radar-card h3{margin:0 0 8px;color:#e3d9bf;font:18px/1.05 Georgia,serif}.gm-vc-radar-fields{display:grid;gap:5px}.gm-vc-radar-fields div{display:grid;grid-template-columns:54px 1fr;gap:7px;color:#918a75;font-size:8px;line-height:1.35}.gm-vc-radar-fields b{color:#aa9862;font-size:7px;letter-spacing:.1em;text-transform:uppercase}

      .gm-vc-factions{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.gm-vc-faction{border:1px solid #38362b;background:#151610;padding:11px 10px;text-align:center}.gm-vc-faction-symbol{width:42px;height:42px;margin:0 auto 8px;display:grid;place-items:center;border:1px solid #5e563d;transform:rotate(45deg);background:#1c1c14}.gm-vc-faction-symbol span{transform:rotate(-45deg);font:16px/1 Georgia,serif;color:#d4c17d}.gm-vc-faction strong{display:block;color:#ded4b9;font-size:10px;margin-bottom:4px}.gm-vc-faction em{display:block;color:#8c8471;font-size:8px;line-height:1.35;font-style:normal}.gm-vc-faction .arrow{margin:7px 0;color:#b19b60;font-size:15px}

      .gm-vc-lane{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.gm-vc-lane-col{border:1px solid #353329;background:#14150f;min-height:150px;padding:10px}.gm-vc-lane-col>small{display:block;padding-bottom:7px;border-bottom:1px solid #343126;color:#978552;font-size:7px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.gm-vc-thread{margin-top:8px;border-left:3px solid #695f42;background:#1a1a13;padding:9px 10px}.gm-vc-thread strong{display:block;color:#dfd5bb;font-size:10px;margin-bottom:4px}.gm-vc-thread span{display:block;color:#8b8471;font-size:8px;line-height:1.35}

      .gm-vc-seeds{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.gm-vc-seed{position:relative;min-height:150px;border:1px solid #403c2d;background:#171811;padding:14px;overflow:hidden}.gm-vc-seed:before{position:absolute;right:12px;top:8px;font:54px/1 Georgia,serif;color:rgba(208,187,121,.08)}.gm-vc-seed.physical:before{content:"⌕"}.gm-vc-seed.people:before{content:"◎"}.gm-vc-seed.pattern:before{content:"⌘"}.gm-vc-seed small{color:#9d8953;font-size:7px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.gm-vc-seed strong{display:block;margin:18px 0 7px;color:#e5dac0;font:21px/1.07 Georgia,serif}.gm-vc-seed span{display:block;color:#8f8874;font-size:9px;line-height:1.45}

      @media(max-width:1100px){.gm-vc-top{grid-template-columns:1fr 1fr 1fr}.gm-vc-priority{grid-column:span 3}.gm-vc-pressure-board{grid-template-columns:1fr 1fr}.gm-vc-pressure[data-level="critical"]{grid-column:span 2;grid-row:auto;min-height:210px}.gm-vc-mid{grid-template-columns:1fr}.gm-vc-factions{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:720px){.gm-vc-top{grid-template-columns:1fr 1fr}.gm-vc-priority{grid-column:span 2}.gm-vc-pressure-board{grid-template-columns:1fr}.gm-vc-pressure[data-level="critical"]{grid-column:auto}.gm-vc-radar,.gm-vc-seeds,.gm-vc-lane{grid-template-columns:1fr}.gm-vc-factions{grid-template-columns:1fr 1fr}.gm-vc-investigation{min-height:680px}.gm-vc-node{width:150px}.gm-vc-node.center{width:190px}.gm-vc-node.n1{left:3%;top:10%}.gm-vc-node.n2{right:3%;top:28%}.gm-vc-node.n3{left:3%;bottom:28%}.gm-vc-node.n4{right:3%;bottom:8%}}
    `;
    document.head.appendChild(style);
  }

  function visualCockpitHTML() {
    return `
      <div class="gm-route-top"><button type="button" class="gm-route-back" data-gm-home>← GM Home</button><span class="gm-route-label">Greywake / GM Cockpit</span></div>
      <div class="gm-vc">
        <div class="gm-vc-top">
          <div class="gm-vc-instrument gm-vc-priority"><small>PARTY PRIORITY</small><strong>The Closing Ways</strong><span>Chosen by Marek · Velmira · Odie</span></div>
          <div class="gm-vc-instrument"><small>SESSION</small><strong>04</strong><span>Next live session</span></div>
          <div class="gm-vc-instrument"><small>LOCATION</small><strong>Greywake</strong><span>Return aftermath</span></div>
          <div class="gm-vc-instrument"><small>FEAR</small><strong>—</strong><span>Confirm live total</span></div>
          <div class="gm-vc-instrument"><small>TIME</small><strong>Open</strong><span>Not yet locked</span></div>
          <div class="gm-vc-instrument"><small>WEATHER</small><strong>Open</strong><span>Not yet fixed</span></div>
        </div>

        <section class="gm-vc-section">
          <div class="gm-vc-section-head"><div><small>PRESSURE BOARD</small><h2>What is moving</h2></div><p>Size shows importance. Arrows show whether a pressure is rising or holding.</p></div>
          <div class="gm-vc-pressure-board">
            <article class="gm-vc-pressure" data-level="critical"><div class="gm-vc-pressure-top"><span class="gm-vc-pressure-badge">CRITICAL · PARTY CHOICE</span><span class="gm-vc-trend">↑</span></div><h3>The Closing Ways</h3><p>Several concealed Digger haul entrances are being deliberately closed or filled. At least one closure required accurate knowledge of an undocumented entrance.</p><div class="gm-vc-question">Keep open: who knows the routes, how are closures targeted, and are they even caused by the same thing?</div></article>
            <article class="gm-vc-pressure" data-level="high"><div class="gm-vc-pressure-top"><span class="gm-vc-pressure-badge">HIGH</span><span class="gm-vc-trend">→</span></div><h3>Route-marker tampering</h3><p>At least two route markers were deliberately altered. Culprit, motive and connection remain unknown.</p></article>
            <article class="gm-vc-pressure" data-level="high"><div class="gm-vc-pressure-top"><span class="gm-vc-pressure-badge">HIGH</span><span class="gm-vc-trend">→</span></div><h3>Cistern Plate</h3><p>Intact in Greywake. Custody, examination, access and political handling remain unresolved.</p></article>
            <article class="gm-vc-pressure" data-level="medium"><div class="gm-vc-pressure-top"><span class="gm-vc-pressure-badge">MEDIUM</span><span class="gm-vc-trend">→</span></div><h3>Ash-Plate</h3><p>Alive and walking, but injured and should not carry load until assessed.</p></article>
            <article class="gm-vc-pressure" data-level="medium"><div class="gm-vc-pressure-top"><span class="gm-vc-pressure-badge">MEDIUM</span><span class="gm-vc-trend">→</span></div><h3>Abandoned freight</h3><p>Valuable freight remains at the groundfall. Someone bears that economic loss.</p></article>
          </div>
        </section>

        <div class="gm-vc-mid">
          <section class="gm-vc-section">
            <div class="gm-vc-section-head"><div><small>INVESTIGATION BOARD</small><h2>The Closing Ways</h2></div><p>Solid = established. Dashed = character hypothesis. Dotted = unresolved.</p></div>
            <div class="gm-vc-investigation">
              <div class="gm-vc-node center confirmed"><small>ESTABLISHED PRESSURE</small><strong>Hidden routes are closing</strong><span>Several concealed Digger entrances have been deliberately filled or sealed.</span></div>
              <div class="gm-vc-node n1 confirmed"><small>CONFIRMED</small><strong>Precise closure</strong><span>At least one hit required knowledge of an undocumented entrance.</span></div>
              <div class="gm-vc-node n2 hypothesis"><small>ODIE'S HYPOTHESIS</small><strong>Someone is reporting them</strong><span>Useful theory, not established truth.</span></div>
              <div class="gm-vc-node n3 unknown"><small>UNKNOWN</small><strong>Same cause?</strong><span>Do not assume every closure is connected.</span></div>
              <div class="gm-vc-node n4 unknown"><small>UNKNOWN</small><strong>Why now?</strong><span>Motive, organisation and timing remain open.</span></div>
            </div>
            <div class="gm-vc-legend"><span><b></b> established</span><span class="dashed"><b></b> hypothesis</span><span class="dotted"><b></b> unresolved</span></div>
          </section>

          <section class="gm-vc-section">
            <div class="gm-vc-section-head"><div><small>NPC RADAR</small><h2>People likely to matter</h2></div></div>
            <div class="gm-vc-radar">
              <article class="gm-vc-radar-card"><div class="gm-vc-radar-avatar">MV</div><h3>Mara Vell</h3><div class="gm-vc-radar-fields"><div><b>Wants</b><span>Practical truths to remain useful.</span></div><div><b>Friction</b><span>Information held too tightly.</span></div><div><b>Status</b><span>Brannic tension is a working model.</span></div></div></article>
              <article class="gm-vc-radar-card"><div class="gm-vc-radar-avatar">BH</div><h3>Brannic Hale</h3><div class="gm-vc-radar-fields"><div><b>Wants</b><span>Claims proportionate to evidence.</span></div><div><b>Friction</b><span>Rumour hardening into certainty.</span></div><div><b>Status</b><span>Working model; adjust through play.</span></div></div></article>
              <article class="gm-vc-radar-card"><div class="gm-vc-radar-avatar">SM</div><h3>Selka Marr</h3><div class="gm-vc-radar-fields"><div><b>Wants</b><span>Reliable movement and loss accounting.</span></div><div><b>Watching</b><span>Route reliability and caravan losses.</span></div></div></article>
              <article class="gm-vc-radar-card"><div class="gm-vc-radar-avatar">MR</div><h3>Maela Rusk</h3><div class="gm-vc-radar-fields"><div><b>Matters</b><span>Her account shapes understanding of the failed return.</span></div><div><b>Keep open</b><span>Do not pre-write blame or final report.</span></div></div></article>
            </div>
          </section>
        </div>

        <section class="gm-vc-section">
          <div class="gm-vc-section-head"><div><small>FACTION PULSE</small><h2>If the party does nothing</h2></div></div>
          <div class="gm-vc-factions">
            <div class="gm-vc-faction"><div class="gm-vc-faction-symbol"><span>D</span></div><strong>Diggers</strong><em>Protect concealed haul access.</em><div class="arrow">↓</div><em>Crews become more guarded and improvise around lost entrances.</em></div>
            <div class="gm-vc-faction"><div class="gm-vc-faction-symbol"><span>C</span></div><strong>Cistern Keepers</strong><em>Secure practical value from the Plate.</em><div class="arrow">↓</div><em>Pressure grows for controlled custody and examination.</em></div>
            <div class="gm-vc-faction"><div class="gm-vc-faction-symbol"><span>S</span></div><strong>Caravan Syndicate</strong><em>Account for losses and route risk.</em><div class="arrow">↓</div><em>Loss accounting becomes harder to postpone.</em></div>
            <div class="gm-vc-faction"><div class="gm-vc-faction-symbol"><span>W</span></div><strong>Tower Watch</strong><em>Maintain order and observations.</em><div class="arrow">↓</div><em>No automatic Closing Ways move unless evidence brings them in.</em></div>
            <div class="gm-vc-faction"><div class="gm-vc-faction-symbol"><span>F</span></div><strong>The Faithful</strong><em>Continue belief and comfort.</em><div class="arrow">↓</div><em>Do not force them into unrelated mysteries.</em></div>
          </div>
        </section>

        <section class="gm-vc-section">
          <div class="gm-vc-section-head"><div><small>OPEN THREADS</small><h2>Status lane</h2></div></div>
          <div class="gm-vc-lane">
            <div class="gm-vc-lane-col"><small>PURSUING</small><div class="gm-vc-thread"><strong>The Closing Ways</strong><span>Party-selected Session Four direction.</span></div></div>
            <div class="gm-vc-lane-col"><small>ACTIVE</small><div class="gm-vc-thread"><strong>Route-marker tampering</strong><span>Deliberate changes confirmed.</span></div><div class="gm-vc-thread"><strong>Cistern Plate</strong><span>Custody and practical consequences open.</span></div><div class="gm-vc-thread"><strong>Nemi / The Stilling</strong><span>Stage 2; character-led.</span></div></div>
            <div class="gm-vc-lane-col"><small>AVAILABLE</small><div class="gm-vc-thread"><strong>Flickerfly study</strong><span>Marek's declared interest; no forced detour.</span></div></div>
            <div class="gm-vc-lane-col"><small>CONSEQUENCE</small><div class="gm-vc-thread"><strong>Abandoned freight</strong><span>Economic loss follows ownership, risk and opportunity.</span></div></div>
          </div>
        </section>

        <section class="gm-vc-section">
          <div class="gm-vc-section-head"><div><small>SESSION SEEDS</small><h2>Three ways play could develop</h2></div><p>Prompts, not scheduled scenes.</p></div>
          <div class="gm-vc-seeds">
            <div class="gm-vc-seed physical"><small>PHYSICAL</small><strong>Inspect a closure</strong><span>Traces can establish how an entrance was closed without establishing who ordered it.</span></div>
            <div class="gm-vc-seed people"><small>PEOPLE</small><strong>Compare route knowledge</strong><span>Different Digger crews know different fragments. Asking who knew creates trust and suspicion before an answer.</span></div>
            <div class="gm-vc-seed pattern"><small>PATTERN</small><strong>Compare the closures</strong><span>A pattern may emerge — or reveal that the closures do not share one cause.</span></div>
          </div>
        </section>
      </div>`;
  }

  function apply() {
    if (!isFullGM() || location.hash !== '#/gm-cockpit') return;
    const ws = document.getElementById('gmRouteWorkspace');
    if (!ws || !ws.classList.contains('is-open')) return;
    if (ws.dataset.visualCockpit === 'true') return;
    ensureStyles();
    ws.innerHTML = visualCockpitHTML();
    ws.dataset.visualCockpit = 'true';
    ws.querySelector('[data-gm-home]')?.addEventListener('click', () => { location.hash = '#/'; });
  }

  function resetMarker() {
    const ws = document.getElementById('gmRouteWorkspace');
    if (ws && location.hash !== '#/gm-cockpit') delete ws.dataset.visualCockpit;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; resetMarker(); apply(); }, 40);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList:true, subtree:true });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('greywake:player-ready', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();

(() => {
  const ROUTES = {
    home: '#/',
    between: '#/gm-between',
    session: '#/gm-session',
    players: '#/gm-players',
    archive: '#/gm-archive'
  };
  const CAPTURE_KEY = 'greywake-gm-captures-v1';
  const CAPTURE_TYPES = [
    ['fact','Fact established'],
    ['npc','NPC decision'],
    ['discovery','Player discovery'],
    ['promise','Player promise'],
    ['rumour','New rumour'],
    ['faction','Faction change'],
    ['resource','Item / resource change'],
    ['question','New question'],
    ['canon','Canon candidate']
  ];
  const STAGES = ['captured','proposed','canonised','revealed','resolved'];
  const STAGE_LABELS = {
    captured:'Captured', proposed:'Proposed', canonised:'Canonised in Obsidian', revealed:'Revealed in play', resolved:'Resolved / superseded'
  };

  function isFullGM(){ return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true'; }
  function routeName(){
    const h = location.hash || '#/';
    if(h === ROUTES.between) return 'between';
    if(h === ROUTES.session) return 'session';
    if(h === ROUTES.players) return 'players';
    if(h === ROUTES.archive) return 'archive';
    return 'home';
  }
  function escapeHTML(value){
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }
  function readCaptures(){
    try { const value = JSON.parse(localStorage.getItem(CAPTURE_KEY) || '[]'); return Array.isArray(value) ? value : []; }
    catch { return []; }
  }
  function saveCaptures(items){ localStorage.setItem(CAPTURE_KEY, JSON.stringify(items)); }
  function addCapture(type,text){
    const clean = String(text || '').trim(); if(!clean) return;
    const items = readCaptures();
    items.unshift({id:`cap-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type, text:clean, stage:'captured', session:'Session Four', createdAt:new Date().toISOString()});
    saveCaptures(items); render();
  }
  function updateCapture(id, patch){
    const items = readCaptures().map(item => item.id === id ? {...item,...patch} : item); saveCaptures(items); render();
  }
  function removeCapture(id){ saveCaptures(readCaptures().filter(item => item.id !== id)); render(); }
  function copyForObsidian(){
    const active = readCaptures().filter(item => item.stage !== 'resolved');
    const lines = ['# Greywake Session Capture','',`Source: GM site staging · ${new Date().toLocaleDateString('en-GB')}`,'','> Staging only. Obsidian remains canon authority.',''];
    for(const item of active){
      const type = CAPTURE_TYPES.find(([key]) => key === item.type)?.[1] || item.type;
      lines.push(`- [ ] **${type}** — ${item.text} _(${STAGE_LABELS[item.stage] || item.stage})_`);
    }
    navigator.clipboard?.writeText(lines.join('\n'));
  }

  function ensureStyles(){
    if(document.getElementById('gm-operations-styles')) return;
    const style = document.createElement('style'); style.id='gm-operations-styles'; style.textContent=`
      .gm-ops-view{max-width:1500px;margin:0 auto;padding:26px clamp(18px,3vw,42px) 70px;color:#d8d0ba}.gm-ops-view.hidden{display:none!important}
      .gm-ops-authority{display:flex;gap:18px;align-items:center;justify-content:space-between;padding:13px 16px;border:1px solid #5f5434;background:#1b1a13;box-shadow:0 12px 30px rgba(0,0,0,.18);margin-bottom:22px}.gm-ops-authority strong{font:700 15px/1.2 Georgia,serif;color:#f0d98d}.gm-ops-authority span{font-size:10px;line-height:1.4;color:#aaa18a}.gm-ops-authority em{font-style:normal;color:#d8c786;font-size:9px;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
      .gm-ops-head{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.7fr);gap:22px;align-items:end;margin-bottom:22px}.gm-ops-head small,.gm-ops-kicker{display:block;color:#9b8d65;font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:7px}.gm-ops-head h1{margin:0;font:700 clamp(30px,4vw,52px)/.98 Georgia,serif;color:#eee5cd}.gm-ops-head p{margin:0;color:#a79f8c;line-height:1.55;font-size:12px}
      .gm-ops-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}.gm-ops-card{grid-column:span 4;border:1px solid #3f3c30;background:#171813;padding:16px;min-height:138px}.gm-ops-card.wide{grid-column:span 8}.gm-ops-card.full{grid-column:1/-1}.gm-ops-card h2{margin:0 0 8px;color:#e6ddc7;font:700 18px/1.15 Georgia,serif}.gm-ops-card p{margin:0;color:#9b9484;font-size:11px;line-height:1.55}.gm-ops-card ul{margin:10px 0 0;padding-left:17px;color:#c4bba4;font-size:11px;line-height:1.65}
      .gm-ops-status{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid #474230;background:#15160f;margin-bottom:14px}.gm-ops-status div{padding:13px 15px;border-right:1px solid #343226}.gm-ops-status div:last-child{border-right:0}.gm-ops-status small{display:block;color:#82785c;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}.gm-ops-status strong{display:block;color:#e3d9c0;font-size:12px}.gm-ops-status .priority strong{font:700 17px/1.2 Georgia,serif;color:#f0d98d}
      .gm-ops-pressure{display:flex;flex-wrap:wrap;gap:8px}.gm-ops-pill{border:1px solid #514a35;background:#201e16;padding:7px 9px;font-size:10px;color:#c9bea2}.gm-ops-pill b{color:#ead68e}
      .gm-ops-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}.gm-ops-actions button,.gm-ops-actions a,.gm-capture-row button{appearance:none;border:1px solid #665a3a;background:#252117;color:#e0cf99;text-decoration:none;padding:9px 11px;font:800 9px/1 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.gm-ops-actions button:hover,.gm-capture-row button:hover{border-color:#a58e54;color:#f5e3a8}
      .gm-ops-stage{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:12px}.gm-ops-stage span{padding:9px;border:1px solid #38362c;background:#14150f;text-align:center;color:#8f8878;font-size:9px;text-transform:uppercase;letter-spacing:.05em}.gm-ops-stage span.active{border-color:#7f6d3e;color:#e2cd8c;background:#211d13}
      .gm-ops-note{margin-top:12px;padding:11px 12px;border-left:3px solid #75653d;background:#1b1a14;color:#aaa28e;font-size:10px;line-height:1.55}
      .gm-capture-form{display:grid;grid-template-columns:190px minmax(0,1fr) auto;gap:8px;margin-top:12px}.gm-capture-form select,.gm-capture-form input{min-width:0;border:1px solid #4e4937;background:#11120e;color:#ddd3ba;padding:10px;font:11px/1.2 system-ui,sans-serif}.gm-capture-form button{border:1px solid #8a7440;background:#2b2415;color:#f1db96;padding:10px 14px;font-size:9px;font-weight:900;text-transform:uppercase;cursor:pointer}
      .gm-capture-list{display:grid;gap:8px;margin-top:12px}.gm-capture-row{display:grid;grid-template-columns:minmax(0,1fr) 180px auto;gap:10px;align-items:center;padding:11px 12px;border:1px solid #39362b;background:#13140f}.gm-capture-row strong{display:block;color:#dfd5bd;font-size:11px}.gm-capture-row small{display:block;color:#817963;font-size:8px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}.gm-capture-row select{border:1px solid #494432;background:#1a1a13;color:#cfc4aa;padding:8px;font-size:9px}.gm-capture-row .remove{padding:8px;color:#ab927d}.gm-capture-empty{padding:20px;border:1px dashed #494433;color:#8d8572;text-align:center;font-size:10px}.gm-capture-count{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;border:1px solid #675a38;background:#211e14;color:#e6d08d;font-size:9px;margin-left:7px}
      .gm-ops-player-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.gm-ops-player{border:1px solid #403d31;background:#171813;padding:15px}.gm-ops-player strong{display:block;color:#e8dec7;font:700 17px/1.2 Georgia,serif}.gm-ops-player span{display:block;color:#9d937b;font-size:10px;margin:5px 0 12px}.gm-ops-player button{border:1px solid #665a3a;background:#252117;color:#e0cf99;padding:8px 10px;font-size:9px;font-weight:800;text-transform:uppercase;cursor:pointer}
      body[data-role="gm"][data-gm-preview="false"] #primaryNav{display:flex!important}body[data-role="gm"][data-gm-preview="false"] #primaryNav button{white-space:nowrap}body[data-role="gm"][data-gm-preview="false"] #gmCockpitShortcut,body[data-role="gm"][data-gm-preview="false"] #gmMindShortcut{display:none!important}
      @media(max-width:1000px){.gm-ops-card,.gm-ops-card.wide{grid-column:span 6}.gm-ops-head{grid-template-columns:1fr}.gm-ops-status{grid-template-columns:1fr 1fr}.gm-capture-row{grid-template-columns:1fr 160px}.gm-capture-row .remove{grid-column:2}}
      @media(max-width:700px){.gm-ops-card,.gm-ops-card.wide{grid-column:1/-1}.gm-ops-player-grid{grid-template-columns:1fr}.gm-ops-stage{grid-template-columns:1fr}.gm-ops-status{display:block}.gm-ops-status div{border-right:0;border-bottom:1px solid #343226}.gm-ops-authority{align-items:flex-start;flex-direction:column}.gm-capture-form,.gm-capture-row{grid-template-columns:1fr}.gm-capture-row .remove{grid-column:auto}}
    `; document.head.appendChild(style);
  }

  function ensureWorkspace(){
    let el=document.getElementById('gmOperationsView'); if(el) return el;
    el=document.createElement('section'); el.id='gmOperationsView'; el.className='gm-ops-view hidden'; el.setAttribute('aria-label','Greywake GM workspace'); document.getElementById('mainContent')?.appendChild(el); return el;
  }
  function authorityBanner(){ return `<div class="gm-ops-authority"><div><strong>Canon Authority: Obsidian</strong><br><span>The site is an operational view and staging layer. If the site, ChatGPT or Foundry conflicts with Obsidian, Obsidian wins.</span></div><em>Source of truth</em></div>`; }
  function statusStrip(){ return `<div class="gm-ops-status"><div class="priority"><small>Party priority</small><strong>The Closing Ways</strong></div><div><small>Session</small><strong>Session Four</strong></div><div><small>Party location</small><strong>Greywake</strong></div><div><small>Party</small><strong>Marek · Velmira · Odie</strong></div></div>`; }
  function captureForm(){ return `<form id="gmQuickCaptureForm" class="gm-capture-form"><select id="gmCaptureType" aria-label="Capture type">${CAPTURE_TYPES.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><input id="gmCaptureText" maxlength="360" placeholder="One sentence — record it and keep playing" aria-label="What happened"><button type="submit">Capture</button></form>`; }
  function captureList(filterResolved=false){
    const items=readCaptures().filter(item=>filterResolved || item.stage!=='resolved');
    if(!items.length) return `<div class="gm-capture-empty">Nothing is waiting for review.</div>`;
    return `<div class="gm-capture-list">${items.map(item=>{
      const type=CAPTURE_TYPES.find(([k])=>k===item.type)?.[1]||item.type;
      return `<div class="gm-capture-row" data-capture-id="${escapeHTML(item.id)}"><div><small>${escapeHTML(type)} · ${escapeHTML(item.session||'Session')}</small><strong>${escapeHTML(item.text)}</strong></div><select data-capture-stage aria-label="Capture status">${STAGES.map(stage=>`<option value="${stage}" ${stage===item.stage?'selected':''}>${STAGE_LABELS[stage]}</option>`).join('')}</select><button class="remove" type="button" data-capture-remove>Remove</button></div>`;
    }).join('')}</div>`;
  }
  function activeCaptureCount(){ return readCaptures().filter(item=>item.stage!=='resolved').length; }

  function renderHome(){ return `${authorityBanner()}<div class="gm-ops-head"><div><small>GM OPERATING VIEW</small><h1>Greywake now.</h1></div><p>Orientation, not canon creation. Use this to operate from the current state; reconcile uncertainty back to Obsidian.</p></div>${statusStrip()}<div class="gm-ops-grid"><section class="gm-ops-card wide"><span class="gm-ops-kicker">ACTIVE PRESSURES</span><h2>What is moving</h2><div class="gm-ops-pressure"><span class="gm-ops-pill"><b>↑ Critical</b> · The Closing Ways</span><span class="gm-ops-pill"><b>→ High</b> · Route-marker tampering</span><span class="gm-ops-pill"><b>→ High</b> · Cistern Plate</span><span class="gm-ops-pill">Ash-Plate recovery</span></div><div class="gm-ops-note">Operational snapshot only. Hidden causes and unrevealed truths remain subject to Obsidian canon and what has been established in play.</div></section><section class="gm-ops-card"><span class="gm-ops-kicker">STAGING</span><h2>Waiting for review <span class="gm-capture-count">${activeCaptureCount()}</span></h2><p>Session captures and proposed changes that have not yet been resolved.</p><div class="gm-ops-actions"><button data-gm-go="between">Review queue</button></div></section><section class="gm-ops-card"><span class="gm-ops-kicker">CHATGPT</span><h2>Run and reason</h2><p>Live narration, NPC logic, consequences, Daggerheart adjudication, improvisation and post-session reasoning.</p></section><section class="gm-ops-card"><span class="gm-ops-kicker">FOUNDRY</span><h2>Show and position</h2><p>Maps, scenes, tokens, encounter layout, lighting and visible spatial information.</p></section><section class="gm-ops-card"><span class="gm-ops-kicker">SITE</span><h2>Operate and present</h2><p>Fast reference, player-facing knowledge, current summaries and staging before canonisation.</p></section></div>`; }

  function renderBetween(){ return `${authorityBanner()}<div class="gm-ops-head"><div><small>BETWEEN SESSIONS</small><h1>Process what changed.</h1></div><p>Review session captures with ChatGPT, decide consequences, then reconcile approved changes into Obsidian.</p></div><div class="gm-ops-grid"><section class="gm-ops-card"><span class="gm-ops-kicker">1 · LAST SESSION</span><h2>What happened?</h2><ul><li>Facts established in play</li><li>Meaningful PC choices</li><li>Promises and commitments</li><li>Resources or relationships changed</li></ul></section><section class="gm-ops-card"><span class="gm-ops-kicker">2 · CONSEQUENCES</span><h2>Who noticed?</h2><ul><li>Who benefited or lost?</li><li>Who now needs to decide?</li><li>What changes if PCs do nothing?</li><li>What new pressure exists?</li></ul></section><section class="gm-ops-card"><span class="gm-ops-kicker">3 · NPC & FACTION DECISIONS</span><h2>What will they do?</h2><ul><li>Want</li><li>What they know</li><li>Decision made</li><li>Next action</li></ul></section><section class="gm-ops-card full"><span class="gm-ops-kicker">POST-SESSION REVIEW</span><h2>Captured during play <span class="gm-capture-count">${activeCaptureCount()}</span></h2><p>Change status only as the item moves through the real workflow. “Canonised in Obsidian” means you have actually reconciled it into the authoritative vault.</p>${captureList(false)}<div class="gm-ops-actions"><button id="gmCopyObsidian">Copy active queue for Obsidian</button></div></section><section class="gm-ops-card wide"><span class="gm-ops-kicker">CANON STAGING</span><h2>From capture to authority</h2><div class="gm-ops-stage"><span class="active">Captured</span><span>Proposed</span><span>Canonised in Obsidian</span><span>Revealed in play</span><span>Resolved / superseded</span></div><div class="gm-ops-note"><strong>Rule:</strong> a site status never overrides Obsidian. The status records workflow; Obsidian records truth.</div></section><section class="gm-ops-card"><span class="gm-ops-kicker">PLAYER INTERESTS</span><h2>Keep opportunities visible</h2><p>Marek: Flickerfly. Velmira: earlier Stilling case. Odie: The Closing Ways. Interests are invitations, not assignments.</p></section><section class="gm-ops-card wide"><span class="gm-ops-kicker">NEXT SESSION</span><h2>Prepare only what may matter</h2><ul><li>Starting state and immediate situation</li><li>NPC decisions already made</li><li>Evidence that can actually be found</li><li>Likely Daggerheart mechanics</li><li>Assets needed in Foundry</li></ul></section><section class="gm-ops-card"><span class="gm-ops-kicker">FOUNDRY PREP</span><h2>Visual/spatial queue</h2><p>Maps, tokens, scenes, handouts and location imagery needed for likely play.</p></section></div>`; }

  function renderSession(){ return `${authorityBanner()}<div class="gm-ops-head"><div><small>SESSION SUPPORT</small><h1>Know what is true now.</h1></div><p>ChatGPT remains the live GM workspace. This page is a compact reference and capture surface beside chat and Foundry.</p></div>${statusStrip()}<div class="gm-ops-grid"><section class="gm-ops-card"><span class="gm-ops-kicker">CURRENT SCENE</span><h2>Greywake</h2><p>Use ChatGPT for exact live scene state. Keep only stable operational facts here.</p></section><section class="gm-ops-card"><span class="gm-ops-kicker">NPCs HERE</span><h2>Only what matters now</h2><p>Want, concern and current intention — not biography.</p></section><section class="gm-ops-card"><span class="gm-ops-kicker">PRESSURES</span><h2>Maximum five</h2><div class="gm-ops-pressure"><span class="gm-ops-pill"><b>↑</b> Closing Ways</span><span class="gm-ops-pill">Route-marker tampering</span><span class="gm-ops-pill">Cistern Plate</span></div></section><section class="gm-ops-card wide"><span class="gm-ops-kicker">EVIDENCE / KNOWLEDGE</span><h2>Keep boundaries visible</h2><div class="gm-ops-stage"><span>Established facts</span><span>Suspicions / theories</span><span>Unknown questions</span><span>GM-only truth</span><span>Player-safe reveal</span></div></section><section class="gm-ops-card full"><span class="gm-ops-kicker">QUICK CAPTURE</span><h2>Record it. Do not process it.</h2><p>One sentence, then return to ChatGPT. Everything here is staging until reviewed after the session and reconciled with Obsidian.</p>${captureForm()}${captureList(false)}</section><section class="gm-ops-card full"><span class="gm-ops-kicker">TOOL OWNERSHIP</span><h2>Do not duplicate work</h2><p><strong>ChatGPT:</strong> live GM, judgement, narrative, NPC logic and consequences. &nbsp; <strong>Site:</strong> stable reference, player knowledge and captures. &nbsp; <strong>Foundry:</strong> maps and spatial play. &nbsp; <strong>Obsidian:</strong> canon authority.</p></section></div>`; }

  function renderPlayers(){ return `${authorityBanner()}<div class="gm-ops-head"><div><small>PLAYER KNOWLEDGE</small><h1>See exactly what they see.</h1></div><p>Preview player-facing knowledge without changing the authoritative canon record.</p></div><div class="gm-ops-player-grid"><div class="gm-ops-player"><strong>Marek</strong><span>Martin · Flickerfly interest</span><button data-preview-player="martin">Preview Marek</button></div><div class="gm-ops-player"><strong>Velmira</strong><span>Carla · Stilling interest</span><button data-preview-player="carla">Preview Velmira</button></div><div class="gm-ops-player"><strong>Odie</strong><span>Ritchie · The Closing Ways</span><button data-preview-player="ritchie">Preview Odie</button></div></div>`; }
  function renderArchive(){ return `${authorityBanner()}<div class="gm-ops-head"><div><small>GREYWAKE ARCHIVE</small><h1>History without clutter.</h1></div><p>Resolved and historical material belongs here rather than competing with the live campaign state. Obsidian remains the authoritative archive.</p></div><div class="gm-ops-grid"><section class="gm-ops-card wide"><span class="gm-ops-kicker">SITE ARCHIVE</span><h2>Player-known records</h2><p>Use the existing Greywake records and session summaries for material already available through the site.</p><div class="gm-ops-actions"><button data-open-records>Open Greywake records</button></div></section><section class="gm-ops-card"><span class="gm-ops-kicker">CAPTURE HISTORY</span><h2>Resolved staging</h2><p>${readCaptures().filter(x=>x.stage==='resolved').length} captured item(s) currently marked resolved or superseded.</p></section></div>`; }

  function configureNav(){
    const nav=document.getElementById('primaryNav'); if(!nav || !isFullGM()) return;
    const buttons=[...nav.querySelectorAll('button')];
    const defs=[['GM Home',ROUTES.home],['Between Sessions',ROUTES.between],['Session Support',ROUTES.session],['Players',ROUTES.players],['Archive',ROUTES.archive]];
    defs.forEach((def,i)=>{ if(!buttons[i]) return; buttons[i].textContent=def[0]; buttons[i].dataset.gmRoute=def[1]; buttons[i].onclick=null; });
  }
  function restorePlayerHomeVisibility(show){
    ['home','brainView','article','playerPortal','characterPageView'].forEach(id=>document.getElementById(id)?.classList.toggle('hidden',!show && isFullGM()));
  }
  function wireWorkspace(workspace){
    workspace.querySelectorAll('[data-gm-go]').forEach(btn=>btn.onclick=()=>navigate(ROUTES[btn.dataset.gmGo]));
    workspace.querySelectorAll('[data-preview-player]').forEach(btn=>btn.onclick=()=>document.querySelector(`#gmPreviewBar [data-preview="${btn.dataset.previewPlayer}"]`)?.click());
    workspace.querySelector('[data-open-records]')?.addEventListener('click',()=>{ location.hash='#/record/'+encodeURIComponent('Greywake'); });
    const form=workspace.querySelector('#gmQuickCaptureForm');
    form?.addEventListener('submit',e=>{ e.preventDefault(); const type=workspace.querySelector('#gmCaptureType')?.value||'fact'; const input=workspace.querySelector('#gmCaptureText'); addCapture(type,input?.value||''); if(input) input.focus(); });
    workspace.querySelectorAll('[data-capture-stage]').forEach(select=>select.addEventListener('change',()=>updateCapture(select.closest('[data-capture-id]').dataset.captureId,{stage:select.value})));
    workspace.querySelectorAll('[data-capture-remove]').forEach(btn=>btn.addEventListener('click',()=>removeCapture(btn.closest('[data-capture-id]').dataset.captureId)));
    workspace.querySelector('#gmCopyObsidian')?.addEventListener('click',copyForObsidian);
  }
  function navigate(hash){ if(location.hash===hash) render(); else location.hash=hash; }
  function syncNav(){
    const h=location.hash||'#/'; document.querySelectorAll('#primaryNav [data-gm-route]').forEach(btn=>{ const active=btn.dataset.gmRoute===h || (btn.dataset.gmRoute==='#/' && h==='#/'); btn.classList.toggle('active',active); if(active) btn.setAttribute('aria-current','page'); else btn.removeAttribute('aria-current'); });
  }
  function render(){
    ensureStyles(); const workspace=ensureWorkspace();
    if(!isFullGM()){ workspace.classList.add('hidden'); return; }
    configureNav();
    const route=routeName();
    const content=route==='between'?renderBetween():route==='session'?renderSession():route==='players'?renderPlayers():route==='archive'?renderArchive():renderHome();
    ['home','brainView','article','playerPortal','characterPageView'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
    workspace.innerHTML=content; workspace.classList.remove('hidden'); wireWorkspace(workspace); syncNav();
    const crumb=document.getElementById('crumb'); if(crumb) crumb.textContent=`Greywake / ${route==='home'?'GM Home':route==='between'?'Between Sessions':route==='session'?'Session Support':route==='players'?'Players':'Archive'}`;
  }

  document.addEventListener('click',e=>{ if(!isFullGM()) return; const btn=e.target.closest('#primaryNav [data-gm-route]'); if(!btn) return; e.preventDefault(); e.stopImmediatePropagation(); navigate(btn.dataset.gmRoute); },true);
  window.addEventListener('hashchange',()=>setTimeout(render,0));
  window.addEventListener('greywake:player-ready',()=>setTimeout(render,0));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(render,80));
  new MutationObserver(()=>{ if(isFullGM() && !document.getElementById('gmOperationsView')) render(); }).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(render,160);
})();
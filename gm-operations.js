(() => {
  const ROUTES={run:'#/gm-session',prep:'#/gm-prep',update:'#/gm-update',world:'#/gm-world',inbox:'#/gm-inbox',players:'#/gm-players',whiteboard:'#/gm-whiteboard'};
  const CAPTURE_KEY='greywake-gm-captures-v1';
  const CAPTURE_TYPES=[['fact','Fact established'],['npc','NPC decision'],['discovery','Player discovery'],['promise','Player promise'],['rumour','New rumour'],['faction','Faction change'],['resource','Item / resource change'],['question','New question'],['canon','Canon candidate']];
  const STAGES=['captured','proposed','canonised','revealed','resolved'];
  const STAGE_LABELS={captured:'Captured',proposed:'Proposed',canonised:'Canonised in Obsidian',revealed:'Revealed in play',resolved:'Resolved / superseded'};
  const PLAYER_NAV_IDS=['homeBtn','characterSheetBtn','myGreywakeBtn','greywakeBtn','campaignBtn'];
  const NPC_IMAGES={
    'Mara Vell':'assets/npcs/hq-v3/mara-vell.webp',
    'Brannic Hale':'assets/npcs/hq-v3/brannic-hale.webp',
    'Selka Marr':'assets/npcs/hq-v3/selka-marr.webp',
    'Maela Rusk':'assets/npcs/hq-v3/maela-rusk.webp',
    'Spencer Digger':'assets/npcs/hq-v3/spencer-digger.png?v=spencer4'
  };

  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const firstParagraph=html=>{const d=document.createElement('div');d.innerHTML=html||'';return(d.querySelector('p')?.textContent||'').replace(/\s+/g,' ').trim()};
  const recordExists=name=>!!window.GREYWAKE_DATA?.[name];
  const gmRecordRoute=name=>`#/gm-world/record/${encodeURIComponent(name)}`;
  const activeCaptureCount=()=>readCaptures().filter(x=>x.stage!=='resolved').length;
  const gmState=()=>window.GREYWAKE_GM_STATE||{session:'Current',partyLocation:'Current state unavailable',activeParty:[],backgroundParty:[],situationTitle:'Current Greywake state',situationDetail:'Current campaign state has not loaded yet.',sceneTitle:'Current state',sceneDetail:'Reload the page if this remains unavailable.',pressures:[]};

  function route(){
    const h=location.hash||'#/';
    if(h.startsWith('#/gm-world/record/'))return{type:'record',name:decodeURIComponent(h.slice('#/gm-world/record/'.length))};
    if(h===ROUTES.prep||h==='#/gm-between')return{type:'prep'};
    if(h===ROUTES.update)return{type:'update'};
    if(h===ROUTES.world||h==='#/gm-archive')return{type:'world'};
    if(h===ROUTES.inbox)return{type:'inbox'};
    if(h===ROUTES.players)return{type:'players'};
    if(h===ROUTES.whiteboard)return{type:'whiteboard'};
    return{type:'run'};
  }
  function navigate(hash){window.GreywakeNavigation.navigate(hash)}
  function readCaptures(){try{const x=JSON.parse(localStorage.getItem(CAPTURE_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
  function saveCaptures(items){localStorage.setItem(CAPTURE_KEY,JSON.stringify(items))}
  function addCapture(type,text){const clean=String(text||'').trim();if(!clean)return;const items=readCaptures();items.unshift({id:`cap-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type,text:clean,stage:'captured',session:gmState().session||'Current session',createdAt:new Date().toISOString()});saveCaptures(items);render()}
  function updateCapture(id,patch){saveCaptures(readCaptures().map(x=>x.id===id?{...x,...patch}:x));render()}
  function removeCapture(id){saveCaptures(readCaptures().filter(x=>x.id!==id));render()}

  function ensureStyles(){if(document.querySelector('link[data-gm-shell-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='gm-shell.css?v=ready-run-20261126';l.dataset.gmShellStyle='true';document.head.appendChild(l)}
  function ensureWorkspace(){let el=document.getElementById('gmOperationsView');if(el)return el;el=document.createElement('section');el.id='gmOperationsView';el.className='gm-shell hidden';el.setAttribute('aria-label','Greywake GM workspace');document.getElementById('mainContent')?.appendChild(el);return el}

  function restoreInboxThreads(){
    const threads=document.getElementById('playerGoals'),home=document.getElementById('home');
    if(!threads||!home||threads.parentElement===home)return;
    const current=document.getElementById('currentThreads');
    current?.parentNode===home?home.insertBefore(threads,current):home.prepend(threads);
  }
  function mountInboxThreads(){
    const host=document.getElementById('gmInboxHost'),threads=document.getElementById('playerGoals');
    if(!host||!threads)return;
    host.innerHTML='<small>PLAYER ACTIVITY</small><h2>Questions & interests</h2><p>The existing player thread controls are shown here directly.</p>';
    host.appendChild(threads);
    threads.classList.remove('hidden');
  }

  function rememberNav(){PLAYER_NAV_IDS.forEach(id=>{const b=document.getElementById(id);if(!b||b.dataset.gmOriginalSaved)return;b.dataset.gmOriginalSaved='1';b.dataset.gmOriginalText=b.textContent||'';b.dataset.gmOriginalOnclick=b.getAttribute('onclick')||'';b.dataset.gmOriginalSection=b.dataset.primarySection||''})}
  function configureNav(){
    const nav=document.getElementById('primaryNav');if(!nav||!fullGM())return;rememberNav();
    const defs=[['RUN',ROUTES.run],['PREP',ROUTES.prep],['UPDATE',ROUTES.update],['WORLD',ROUTES.world],['INBOX',ROUTES.inbox]];
    PLAYER_NAV_IDS.forEach((id,i)=>{const b=document.getElementById(id);if(!b)return;b.textContent=defs[i][0];b.dataset.gmRoute=defs[i][1];b.removeAttribute('onclick');b.removeAttribute('data-primary-section')});
    let white=document.getElementById('gmWhiteboardNav');if(!white){white=document.createElement('button');white.id='gmWhiteboardNav';nav.appendChild(white)}white.type='button';white.textContent='WHITEBOARD';white.dataset.gmRoute=ROUTES.whiteboard;
    let extra=document.getElementById('gmPlayersNav');if(!extra){extra=document.createElement('button');extra.id='gmPlayersNav';nav.appendChild(extra)}extra.type='button';extra.textContent='PLAYERS';extra.dataset.gmRoute=ROUTES.players;
  }
  function restoreNav(){
    document.getElementById('gmPlayersNav')?.remove();document.getElementById('gmWhiteboardNav')?.remove();
    PLAYER_NAV_IDS.forEach(id=>{const b=document.getElementById(id);if(!b||!b.dataset.gmOriginalSaved)return;b.textContent=b.dataset.gmOriginalText||'';const oc=b.dataset.gmOriginalOnclick||'';if(oc)b.setAttribute('onclick',oc);else b.removeAttribute('onclick');const sec=b.dataset.gmOriginalSection||'';if(sec)b.dataset.primarySection=sec;delete b.dataset.gmRoute})
    restoreSidebar();
  }
  function ensureGMSidebar(){
    const sidebar=document.getElementById('sidebar'),nav=document.getElementById('nav');
    if(!sidebar||!nav||!fullGM())return;
    let gmNav=document.getElementById('gmSidebarNav');
    if(!gmNav){
      gmNav=document.createElement('section');
      gmNav.id='gmSidebarNav';
      gmNav.className='gm-sidebar-nav';
      gmNav.setAttribute('aria-label','GM workspace');
      gmNav.innerHTML=`<div class="gm-sidebar-heading"><small>GM WORKSPACE</small><strong>Run Greywake</strong></div>
        <div class="gm-sidebar-links">
          <button type="button" data-gm-side-route="${ROUTES.run}"><span>RUN</span><small>Live session cockpit</small></button>
          <button type="button" data-gm-side-route="${ROUTES.prep}"><span>PREP</span><small>Prepare the next session</small></button>
          <button type="button" data-gm-side-route="${ROUTES.update}"><span>UPDATE</span><small>Pipeline health & captures</small></button>
          <button type="button" data-gm-side-route="${ROUTES.world}"><span>WORLD</span><small>GM records and campaign state</small></button>
          <button type="button" data-gm-side-route="${ROUTES.inbox}"><span>INBOX</span><small>Player questions and interests</small></button>
          <button type="button" data-gm-side-route="${ROUTES.players}"><span>PLAYERS</span><small>Preview what each player sees</small></button>
          <button type="button" data-gm-side-route="${ROUTES.whiteboard}"><span>WHITEBOARD</span><small>Interactive Daggerheart cards</small></button>
        </div>
        <section id="gmWhiteboardLibrary" class="gm-whiteboard-library" hidden><small>WHITEBOARD CARD LIBRARY</small><label for="gmWhiteboardSearch">Find a card</label><input type="search" id="gmWhiteboardSearch" placeholder="NPC, creature, location…" autocomplete="off"><select id="gmWhiteboardCategory" aria-label="Filter card category"><option value="">All categories</option></select><div id="gmWhiteboardResults" class="gm-whiteboard-results"></div><small class="gm-whiteboard-help">Select a record to place it on the canvas.</small></section>
        <div class="gm-sidebar-record-label"><small>GREYWAKE RECORDS</small><span>People, places, creatures, factions and session records</span></div>`;
      nav.parentNode.insertBefore(gmNav,nav);
      gmNav.addEventListener('click',e=>{const b=e.target.closest('[data-gm-side-route]');if(!b)return;navigate(b.dataset.gmSideRoute);window.GreywakeNavigation.closeSidebar()});
    }
    sidebar.classList.add('gm-sidebar-active');
    const brand=sidebar.querySelector('.eyebrow');if(brand){if(!brand.dataset.gmOriginalText)brand.dataset.gmOriginalText=brand.textContent||'';brand.textContent='GM CONSOLE'}
    const safe=sidebar.querySelector('.safe-mark');if(safe){if(!safe.dataset.gmOriginalText)safe.dataset.gmOriginalText=safe.textContent||'';safe.textContent='GM workspace + complete campaign record'}
    const foot=sidebar.querySelector('.sidebar-foot');if(foot){if(!foot.dataset.gmOriginalText)foot.dataset.gmOriginalText=foot.textContent||'';foot.textContent='Operational pages stay at the top. The complete Greywake record remains searchable below.'}
  }
  function restoreSidebar(){
    const sidebar=document.getElementById('sidebar');document.getElementById('gmSidebarNav')?.remove();sidebar?.classList.remove('gm-sidebar-active');
    sidebar?.querySelectorAll('[data-gm-original-text]').forEach(el=>{el.textContent=el.dataset.gmOriginalText;delete el.dataset.gmOriginalText});
  }

  function ensureGMRecordSidebarRouting(){
    const nav=document.getElementById('nav');
    if(!nav||nav.dataset.gmRecordRouting==='1')return;
    nav.dataset.gmRecordRouting='1';
    nav.addEventListener('click',e=>{
      if(!fullGM())return;
      const button=e.target.closest('.nav-link[data-note]');
      if(!button)return;
      const name=button.dataset.note;
      if(!name||!recordExists(name))return;
      e.preventDefault();
      e.stopImmediatePropagation();
      navigate(gmRecordRoute(name));
      window.GreywakeNavigation.closeSidebar();
    },true);
  }
  function syncNav(type){
    const target=type==='record'?ROUTES.world:ROUTES[type]||ROUTES.run;
    document.querySelectorAll('#primaryNav [data-gm-route]').forEach(b=>{const active=b.dataset.gmRoute===target;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
    document.querySelectorAll('#gmSidebarNav [data-gm-side-route]').forEach(b=>{const active=b.dataset.gmSideRoute===target;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  }

  const authority=()=>`<div class="gm-authority"><div><small>CANON AUTHORITY</small><strong>Obsidian remains the source of truth.</strong><span>The site runs Greywake; it does not silently decide Greywake.</span></div><span class="gm-status-badge">GM ONLY</span></div>`;
  const head=(k,t,c)=>`<header class="gm-page-head"><div><small>${esc(k)}</small><h1>${esc(t)}</h1></div><p>${esc(c)}</p></header>`;
  const status=()=>{const s=gmState(),active=(s.activeParty||[]).join(' · ')||'—';return`<div class="gm-status-strip"><div><small>SESSION</small><strong>${esc(s.session||'Current')}</strong></div><div><small>PARTY LOCATION</small><strong>${esc(s.partyLocation||'—')}</strong></div><div><small>ACTIVE PARTY</small><strong>${esc(active)}</strong></div><div><small>CAPTURED</small><strong>${activeCaptureCount()} waiting</strong></div></div>`};
  const captureForm=()=>`<form id="gmQuickCaptureForm" class="gm-capture-form"><select id="gmCaptureType">${CAPTURE_TYPES.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><input id="gmCaptureText" maxlength="360" placeholder="One sentence — record it and keep playing"><button type="submit">Capture</button></form>`;
  function captureList(showResolved=false){const items=readCaptures().filter(x=>showResolved||x.stage!=='resolved');if(!items.length)return'<div class="gm-empty">Nothing is waiting for review.</div>';return`<div class="gm-capture-list">${items.map(x=>`<article class="gm-capture-row" data-capture-id="${esc(x.id)}"><div><small>${esc(CAPTURE_TYPES.find(([k])=>k===x.type)?.[1]||x.type)} · ${esc(x.session||'Session')}</small><strong>${esc(x.text)}</strong></div><select data-capture-stage>${STAGES.map(s=>`<option value="${s}" ${s===x.stage?'selected':''}>${STAGE_LABELS[s]}</option>`).join('')}</select><button class="gm-small-danger" type="button" data-capture-remove>Remove</button></article>`).join('')}</div>`}
  function tile(name,label,copy,image){const exists=recordExists(name),tag=exists?'button':'div',attr=exists?` type="button" data-gm-record="${esc(name)}"`:'';return`<${tag} class="gm-nav-card${exists?' is-clickable':' is-static'}"${attr}>${image?`<img src="${image}" alt="" loading="lazy">`:''}<div><small>${esc(label)}</small><strong>${esc(name)}</strong><span>${esc(copy)}</span>${exists?'<em>Open →</em>':''}</div></${tag}>`}

  function renderRun(){return `${authority()}${head('RUN GREYWAKE','At the table.','Live scene updates from the Co-DM; capture established changes as you play.')}${status()}
    <section class="gm-run-hero" style="min-height:0"><div class="gm-run-hero-copy" style="width:100%;padding:16px"><div class="gm-primary-actions"><button data-focus-capture>+ Capture change</button><button data-focus-reveal>Reveal to players</button><button class="gm-update-action" data-gm-go="update">UPDATE GREYWAKE</button></div></div></section>
    <section class="gm-panel full" id="gmDynamicScene"><small>LIVE SCENE</small><h2>Connecting to live session…</h2></section>
    <div class="gm-ops-grid"><section class="gm-panel full" id="gmCapturePanel"><small>QUICK CAPTURE</small><h2>Record it. Keep playing.</h2><p>This is local staging, not automatic canonisation.</p>${captureForm()}${captureList(false)}</section></div>`}
  
  function renderPrep(){
    const s=gmState();
    const prep=s.prep||{};
    const snapshot=window.GreywakeGMGoalSnapshot||{};
    const players=[
      ['marek','Marek','assets/canon/characters/marek-canon.jpg'],
      ['odie','Odie','assets/canon/characters/odie-canon.webp'],
      ['velmira','Velmira','assets/canon/characters/velmira-poster.webp']
    ];
    const cards=players.map(([key,name,image])=>{
      const item=snapshot[key];
      const text=item?.text||'No current player interest or question recorded.';
      const state=item?.status==='pursuing'?'ACTIVE PURSUIT':item?.kind==='question'?'QUESTION':item?'INTERESTED':'NONE CURRENT';
      return `<article data-character="${key}"><img src="${image}" alt=""><div><strong>${name}</strong><span>${esc(text)}</span><em class="gm-live-goal-state ${item?.status==='pursuing'?'pursuing':''}">${state}</em></div></article>`;
    }).join('');

    const checklist=(prep.checklist||[]).map((x,i)=>`<article class="gm-prep-check"><span class="gm-prep-check-num">${String(i+1).padStart(2,'0')}</span><div><strong>${esc(x.label)}</strong><p>${esc(x.detail)}</p><small>${esc(x.status||'PREP')}</small></div></article>`).join('')||'<div class="gm-empty">No prep checklist loaded.</div>';

    const portraits={'Marek':'assets/canon/characters/marek-canon.jpg','Odie':'assets/canon/characters/odie-canon.webp','Velmira':'assets/canon/characters/velmira-poster.webp'};
    const positions=(prep.startingPositions||[]).map(x=>`<article class="gm-prep-position"><div class="gm-prep-position-image"><img src="${portraits[x.name]||''}" alt="${esc(x.name)} portrait" loading="lazy"></div><div class="gm-prep-position-info"><small>${esc(x.status||'CURRENT')}</small><strong>${esc(x.name)}</strong><em>${esc(x.location)}</em><p>${esc(x.detail)}</p></div></article>`).join('')||'<div class="gm-empty">No starting positions loaded.</div>';

    const scenes=(prep.likelyScenes||[]).map((x,i)=>{
      const links=(x.records||[]).filter(recordExists).map(n=>`<button class="gm-prep-link" data-gm-record="${esc(n)}">${esc(n)} →</button>`).join('');
      const art=/thirst.marrow/i.test(x.title)?'assets/canon/flora/thirst-marrow.webp':/haul/i.test(x.title)?'assets/generated-scenes/digger-yards.webp':'assets/generated-scenes/the-wastes-route.webp';
      const artLabel=/thirst.marrow/i.test(x.title)?'Thirst-Marrow reference':'Atmospheric reference';
      return `<article class="gm-ready-card"><div class="gm-ready-art"><img src="${art}" alt="${artLabel}" loading="lazy"><span>${artLabel}</span></div><div class="gm-ready-body"><small>${esc(x.readiness||'POSSIBLE')}</small><h3>${esc(x.title)}</h3><p>${esc(x.detail)}</p>${links?`<div class="gm-prep-links">${links}</div>`:''}<button type="button" class="gm-ready-activate" data-prep-activate="${esc(x.title)}">+ Add to RUN</button></div></article>`;
    }).join('')||'<div class="gm-empty">No likely scenes loaded.</div>';

    const threads=(prep.unresolvedThreads||[]).map(x=>{
      const links=(x.records||[]).filter(recordExists).map(n=>`<button class="gm-prep-link" data-gm-record="${esc(n)}">${esc(n)} →</button>`).join('');
      return `<article class="gm-prep-scene"><div><small>${esc(x.status||'UNRESOLVED')}</small><h3>${esc(x.title)}</h3><p>${esc(x.detail)}</p><p><strong>IF PLAYERS PURSUE IT:</strong> ${esc(x.choices)}</p>${links?`<div class="gm-prep-links">${links}</div>`:''}</div></article>`;
    }).join('')||'<div class="gm-empty">No unresolved threads selected for this session.</div>';

    const moves=(prep.npcMoves||[]).map(x=>`<article class="gm-prep-npc-move"><header><strong>${esc(x.name)}</strong><span>${esc(x.certainty||'CURRENT')}</span></header><dl><div><dt>KNOWS</dt><dd>${esc(x.knowledge)}</dd></div><div><dt>DECISION</dt><dd>${esc(x.decision)}</dd></div><div><dt>NEXT</dt><dd>${esc(x.next)}</dd></div></dl>${recordExists(x.name)?`<button class="gm-prep-link" data-gm-record="${esc(x.name)}">Open record →</button>`:''}</article>`).join('')||'<div class="gm-empty">No NPC moves established.</div>';

    const evidence=(prep.evidence||[]).map(x=>`<article class="gm-prep-evidence ${String(x.kind||'').toLowerCase()}"><b>${esc(x.kind||'NOTE')}</b><span>${esc(x.text)}</span></article>`).join('')||'<div class="gm-empty">No evidence loaded.</div>';

    const assets=(prep.assets||[]).map(x=>`<article class="gm-prep-asset"><div><small>${esc(x.type)}</small><strong>${esc(x.label)}</strong></div><span>${esc(x.status)}</span></article>`).join('')||'<div class="gm-empty">No assets queued.</div>';

    return`${authority()}${head('PREP','If we play right now.','Current starting positions, likely scenes, established NPC actions, evidence boundaries and only the assets that may actually matter.')}${status()}
      <div class="gm-ops-grid gm-prep-grid">
        <section class="gm-panel full gm-ready-run"><small>READY TO RUN</small><h2>What could happen next?</h2><p>Choose only when play makes it relevant. Add a card to the current scene without advancing the story or revealing player knowledge.</p><div class="gm-prep-scenes gm-ready-grid">${scenes}</div></section>
        <section class="gm-panel full gm-prep-start"><small>STARTING POSITIONS</small><h2>Where play actually resumes</h2><p>No assumed regrouping and no invented off-screen actions.</p><div class="gm-prep-position-grid">${positions}</div></section>
        <section class="gm-panel full"><small>SESSION READINESS</small><h2>What needs to be ready before play</h2><p>Operational checks and GM-only boundaries; not a predetermined sequence of scenes.</p><div class="gm-prep-check-grid">${checklist}</div></section>
        
        <section class="gm-panel full"><small>UNRESOLVED STORY THREADS</small><h2>Prepare connections, not encounters</h2><p>These threads may matter if the party follows them. They do not establish what is present in the opening scene.</p><div class="gm-prep-scenes">${threads}</div></section>
        <section class="gm-panel full"><small>PLAYER INTENTIONS</small><h2>What each player may pursue</h2><p>Player interests guide preparation, not a required path.</p><div class="gm-player-cards">${cards}</div></section>
        <section class="gm-panel wide"><small>NPC MOVES</small><h2>What people are actually about to do</h2><p>Established actions only. An open entry is permission not to invent an off-screen move.</p><div class="gm-prep-npc-list">${moves}</div></section>
        <section class="gm-panel"><small>KNOWLEDGE BOUNDARY</small><h2>GM truth · player facts · unresolved</h2><p>The GM view may show hidden truth. Only genuinely undecided material is marked unresolved.</p><div class="gm-prep-evidence-list">${evidence}</div></section>
        <section class="gm-panel wide"><small>ASSETS TO HAVE READY</small><h2>Only load what might hit the table</h2><div class="gm-prep-assets">${assets}</div></section>
        <section class="gm-panel"><small>SESSION CAPTURES</small><h2>${activeCaptureCount()} waiting</h2><p>These are unfinished updates from play, not prep material unless they affect the starting state.</p><button class="gm-inline-action" data-gm-go="update">Review captures →</button></section>
      </div>`;
  }

  function updatePacket(){const items=readCaptures().filter(x=>x.stage!=='resolved');return `Update Greywake. Retrieve and follow the latest private Greywake Update Protocol (90 GM Only/Greywake Update Protocol.md). Review actual play and explicitly approved changes only. Deduplicate, protect player knowledge, verify each stage and return the dashboard report JSON. These local captures are staging evidence, not canon:\n\n${items.length?items.map(x=>`- [${STAGE_LABELS[x.stage]||x.stage}] ${CAPTURE_TYPES.find(([k])=>k===x.type)?.[1]||x.type}: ${x.text}`).join('\n'):'- No local captures recorded.'}`}
  const CO_DM_PROJECT='https://chatgpt.com/g/g-p-69c7e0b8cfc08191a0b10aca2b3af8bc-greywake/project';
  const CO_DM_CONTROLS=[
    {key:'start',title:'Start new Co-DM',detail:'In a new project chat, load current canon and resume safely.',prompt:'This is the new Greywake Live Co-DM conversation. Retrieve the latest Greywake Update Protocol from 90 GM Only/Greywake Update Protocol.md in potmoodle-debug/greywake-vault, branch main. Read current authoritative canon, relevant character knowledge and approved preparation. Establish our current session position, pending actions, known resources and unresolved decisions. Do not advance play or invent missing information. If an earlier handoff is referenced but not accessible, ask me for it.'},
    {key:'update',title:'Update Greywake',detail:'Save established campaign changes and verify the result.'},
    {key:'handoff',title:'Change Co-DM conversation',detail:'Run this in the old chat before starting a new one.'},
    {key:'health',title:'Check pipeline health',detail:'Check current evidence and refresh the dashboard feed only.',prompt:'Refresh Greywake dashboard health. Retrieve the latest private Greywake Update Protocol and current authoritative source evidence directly from GitHub. Follow the automatic dashboard feed contract and publish only the allowlisted operational metadata to pipeline-health.json in the public website repository, then verify readback and report deployment separately. Use null or unknown where evidence is absent. Do not modify campaign canon, private vault records, other website content or databases. Do not publish narrative, names, credentials or private record details. If the feed cannot be written, return a copyable schema 1 JSON report instead.'},
    {key:'images',title:'Save approved images',detail:'Transfer approved original artwork to the private vault.',prompt:'Save approved Greywake images. Retrieve the latest private Greywake Update Protocol and follow its verified asset transfer procedure. Identify only original images with explicit approval and an unambiguous intended record and destination. Preserve original bytes, verify hashes and the private commit, update asset registry and operational health feed, and report local sync and any blockers separately. Never publish GM-only artwork or private details. Do not substitute or regenerate missing originals.'},
    {key:'prep',title:'Prepare next session',detail:'Read current canon and develop flexible preparation.',prompt:'Retrieve the current authoritative Greywake campaign state, relevant character knowledge, approved preparation and latest Greywake Update Protocol from the private vault repository. Help me prepare the next session using Daggerheart. Develop meaningful choices, exploration, jeopardy and possible encounters without advancing actual play. Distinguish proposals from established canon and preserve GM-only knowledge. Do not write changes unless I explicitly request an update.'}
  ];
  function coDMCommand(key){
    if(key==='update')return updatePacket();
    if(key==='handoff')return updatePacket()+'\n\nI am changing to a new Live Co-DM conversation. Save justified outstanding updates, verify each required stage, and prepare a private continuity handoff covering the current session position, character knowledge, resources only where established, unresolved actions, approved preparation and decisions still pending. Preserve unfinished or speculative material as such. If any evidence cannot be saved, clearly identify it for me to transfer manually. Do not claim synchronization or deployment without evidence.';
    return CO_DM_CONTROLS.find(x=>x.key===key)?.prompt||'';
  }
  async function copyCoDMCommand(key,workspace){
    if(!fullGM()||location.hash!==ROUTES.update)return;
    const command=coDMCommand(key),out=workspace.querySelector('#gmCoDMStatus'),fallback=workspace.querySelector('#gmCoDMFallback');
    if(!command||!out||!fallback)return;
    try{await navigator.clipboard.writeText(command);fallback.hidden=true;fallback.value='';out.textContent=key==='start'?'Copied. Open the Greywake project, create a new chat, then paste.':key==='handoff'?'Copied. Paste into the OLD Co-DM chat and verify its handoff before starting a new chat.':'Copied. Paste into the current Live Co-DM chat. No campaign files have changed.';}
    catch{fallback.hidden=false;fallback.value=command;fallback.focus();fallback.select();out.textContent='Clipboard unavailable. Copy the selected command manually.';}
  }
  function coDMControls(){
    const tiles=CO_DM_CONTROLS.map((x,i)=>'<button type="button" class="gw-codm-tile'+(x.key==='update'?' gw-codm-primary':'')+'" data-gm-codm-command="'+esc(x.key)+'"><span class="gw-codm-number">'+String(i+1).padStart(2,'0')+'</span><span class="gw-codm-label"><strong>'+esc(x.title)+'</strong><span>'+esc(x.detail)+'</span></span><span class="gw-codm-copy" aria-hidden="true">COPY</span></button>').join('');
    return '<section class="gm-panel full gw-codm" aria-labelledby="gmCoDMHeading"><style>.gw-codm{margin-bottom:14px;padding:18px!important}.gw-codm-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}.gw-codm-head h2{font-size:25px;margin:5px 0}.gw-codm-head p{margin:0}.gw-codm-project{color:#e4ca88;border:1px solid #74623b;background:#251f14;padding:10px 12px;font-size:10px;font-weight:800;text-decoration:none}.gw-codm-project:hover{border-color:#c9a957}.gw-codm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.gw-codm-tile{display:flex;align-items:center;gap:12px;text-align:left;background:#11130f;border:1px solid #454033;padding:12px;color:#e9dfc8;cursor:pointer;min-width:0}.gw-codm-tile:hover,.gw-codm-tile:focus-visible{border-color:#d2b267;background:#252115}.gw-codm-number{color:#c9a957;font:700 21px Georgia,serif}.gw-codm-label{flex:1;min-width:0}.gw-codm-label strong{display:block;font-size:14px;color:#eee2c7}.gw-codm-label>span{display:block;color:#aaa18f;font-size:11px;line-height:1.4;margin-top:4px}.gw-codm-copy{font-size:9px;font-weight:800;letter-spacing:.08em;color:#d8bd76}.gw-codm-primary{border-color:#8e7642;background:#201d13}.gw-codm-status{display:block;color:#d8bd76;font-size:12px;margin-top:12px;min-height:1.4em}.gw-codm-fallback{width:100%;box-sizing:border-box;min-height:110px;resize:vertical;background:#10110d;color:#eee2c7;border:1px solid #74623b;padding:10px;font:12px monospace;margin-top:8px}.gw-codm-fallback[hidden]{display:none}@media(max-width:700px){.gw-codm-grid{grid-template-columns:1fr}}</style><div class="gw-codm-head"><div><small>DIRECT CO-DM · COMMAND CENTRE</small><h2 id="gmCoDMHeading">Co-DM controls</h2><p>Choose a task, copy its instructions and paste into the appropriate Greywake chat.</p></div><a class="gw-codm-project" href="'+CO_DM_PROJECT+'" target="_blank" rel="noopener noreferrer">OPEN GREYWAKE PROJECT ↗</a></div><div class="gw-codm-grid">'+tiles+'</div><output id="gmCoDMStatus" class="gw-codm-status" aria-live="polite">Changing chats? Use Change Co-DM conversation in the old chat, then Start new Co-DM in the new chat.</output><textarea id="gmCoDMFallback" class="gw-codm-fallback" aria-label="Command to copy manually" readonly hidden></textarea></section>';
  }
  async function copyObsidian(){const active=readCaptures().filter(x=>x.stage!=='resolved'),lines=['# Greywake Session Capture','',`Source: GM site staging · ${new Date().toLocaleDateString('en-GB')}`,'','> Staging only. Obsidian remains canon authority.','',...active.map(x=>`- [ ] **${CAPTURE_TYPES.find(([k])=>k===x.type)?.[1]||x.type}** — ${x.text} _(${STAGE_LABELS[x.stage]||x.stage})_`)];await navigator.clipboard?.writeText(lines.join('\n'))}
  function renderUpdate(){return `${authority()}${head('UPDATE','Pipeline health.','Direct Co-DM updates, authoritative vault synchronization, publication and evidence.')}${coDMControls()}<section class="gm-update-hero"><small>LOCAL STAGING</small><strong>${activeCaptureCount()}</strong><span>local captures waiting</span><p>Update and handoff controls include the active local capture queue. This site does not write canon or send chat messages automatically.</p></section><div class="gm-ops-grid"><section class="gm-panel full" id="gmPipelineHealthHost"><small>PIPELINE HEALTH</small><h2>Loading diagnostics…</h2><p>If this remains visible, reload the page.</p></section><section class="gm-panel full"><small>CAPTURED CHANGES</small><h2>Review what actually happened</h2>${captureList(false)}<div class="gm-row-actions"><button id="gmCopyObsidian" class="gm-inline-action">Copy active queue for Obsidian</button></div></section></div>`}

  function renderWorld(){return`${authority()}${head('WORLD','Browse Greywake.','The encyclopaedia belongs here, not between you and the live game.')}<div class="gm-world-grid">${tile('Known People','PEOPLE','Portraits, relationships and known NPC records.','assets/brannic-hale.jpg')}${tile('Known Locations','PLACES','Settlement, routes and known locations.','assets/tower-distant.jpg')}${tile('Known Flora and Fauna','CREATURES','Known ecology and creature records.','assets/cacklemaw.jpg')}${tile('Greywake','SETTING','Settlement record and connected material.','assets/tower-distant.jpg')}</div><div class="gm-ops-grid"><section class="gm-panel wide"><small>CANON</small><h2>Status quo, not lore sprawl</h2><p>The current Canon Status Quo Register remains the highest Greywake setting authority. The site should surface it operationally, never replace it.</p></section><section class="gm-panel"><small>HISTORY</small><h2>Resolved material stays out of the way</h2><p>Historical and superseded material belongs here rather than competing with the live state.</p></section></div>`}
  function renderRecord(name){
    const item=window.GREYWAKE_DATA?.[name];
    if(!item)return`${authority()}${head('WORLD','Record unavailable.','This record is not currently present in the site dataset.')}<button class="gm-inline-action" data-gm-go="world">← Back to World</button>`;
    if(name==='Known People')return`${authority()}<div id="gmPeopleBrowserHost"></div>`;
    return`${authority()}<div class="gm-record-head"><button class="gm-inline-action" data-gm-go="world">← World</button><small>${esc(item.category||'GREYWAKE RECORD')}</small><h1>${esc(item.title||name)}</h1></div><article class="gm-world-record">${item.html||''}</article>`
  }
  const renderInbox=()=>`${authority()}${head('INBOX','What needs you?','Player questions, replies, downtime and choices should arrive here instead of competing with the live-session screen.')}<div class="gm-ops-grid"><section class="gm-panel full" id="gmInboxHost"><small>PLAYER ACTIVITY</small><h2>Loading player signals…</h2><p>The existing player-feed integration will appear here.</p></section></div>`;
  function renderPlayers(){
    const snapshot=window.GreywakeGMGoalSnapshot||{};
    const players=[
      ['martin','marek','MARTIN','Marek','assets/canon/characters/marek-canon.jpg'],
      ['ritchie','odie','RITCHIE','Odie','assets/canon/characters/odie-canon.webp'],
      ['carla','velmira','CARLA','Velmira','assets/canon/characters/velmira-poster.webp']
    ];
    const cards=players.map(([preview,key,player,name,image])=>{
      const item=snapshot[key],text=item?.text||'No current player interest or question recorded.';
      return `<article data-character="${key}"><img src="${image}" alt="${name}"><div><small>${player}</small><strong>${name}</strong><span>${esc(text)}</span><button data-preview-player="${preview}">Preview ${name}</button></div></article>`;
    }).join('');
    return`${authority()}${head('PLAYERS','See exactly what they see.','Preview each player-facing site without leaking GM-only or another character’s private information.')}<section class="gm-player-projection-guard"><small>KNOWLEDGE BOUNDARY</small><strong>Each character is a separate projection.</strong><p>WORLD or canon changes do not become player knowledge automatically. Update Marek, Odie or Velmira only when that character actually learned, witnessed or was explicitly told the information. Never copy another character’s private knowledge across.</p></section><div class="gm-player-cards gm-player-preview-cards">${cards}</div>`}

  function wire(workspace){
    workspace.querySelectorAll('[data-gm-go]').forEach(b=>b.addEventListener('click',()=>navigate(ROUTES[b.dataset.gmGo]||b.dataset.gmGo)));
    workspace.querySelectorAll('[data-gm-record]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.gmRecord;if(recordExists(n))navigate(gmRecordRoute(n))}));
    workspace.querySelectorAll('[data-preview-player]').forEach(b=>b.addEventListener('click',()=>document.querySelector(`#gmPreviewBar [data-preview="${b.dataset.previewPlayer}"]`)?.click()));
    workspace.querySelector('[data-focus-capture]')?.addEventListener('click',()=>{document.getElementById('gmCapturePanel')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.getElementById('gmCaptureText')?.focus(),250)});
    workspace.querySelector('[data-focus-reveal]')?.addEventListener('click',()=>{const input=document.getElementById('gmLiveRevealText');if(input){input.focus();input.scrollIntoView({behavior:'smooth',block:'center'})}});
    const form=workspace.querySelector('#gmQuickCaptureForm');form?.addEventListener('submit',e=>{e.preventDefault();const input=workspace.querySelector('#gmCaptureText');addCapture(workspace.querySelector('#gmCaptureType')?.value||'fact',input?.value||'')});
    workspace.querySelectorAll('[data-capture-stage]').forEach(s=>s.addEventListener('change',()=>updateCapture(s.closest('[data-capture-id]').dataset.captureId,{stage:s.value})));
    workspace.querySelectorAll('[data-capture-remove]').forEach(b=>b.addEventListener('click',()=>removeCapture(b.closest('[data-capture-id]').dataset.captureId)));
    workspace.querySelectorAll('[data-gm-codm-command]').forEach(b=>b.addEventListener('click',()=>copyCoDMCommand(b.dataset.gmCodmCommand,workspace)));workspace.querySelector('#gmCopyObsidian')?.addEventListener('click',copyObsidian);
    const peopleHost=workspace.querySelector('#gmPeopleBrowserHost');if(peopleHost&&window.GREYWAKE_RENDER_PEOPLE_BROWSER)window.GREYWAKE_RENDER_PEOPLE_BROWSER(peopleHost,{gm:true});
  }
  function renderWhiteboard(){return `${head('GM WHITEBOARD','The campaign on the table.','Search Greywake records, arrange Daggerheart-style cards and connect the evidence. Boards are saved in this browser, not in Obsidian.')}<iframe id="gmWhiteboardFrame" title="Greywake GM interactive whiteboard" src="gm-whiteboard.html?embedded=2" style="display:block;width:100%;height:clamp(570px,78vh,1150px);border:1px solid #5a5033;background:#14150f" loading="eager"></iframe>`}
  function enhanceRecordNav(){
    const root=document.getElementById('nav');
    if(!root||!fullGM())return;
    const searching=!!document.getElementById('searchInput')?.value.trim();
    root.querySelectorAll(':scope > .nav-group').forEach((group,i)=>{
      if(group.dataset.gmAccordion==='1')return;
      group.dataset.gmAccordion='1';
      const h=group.querySelector(':scope > h3');if(!h)return;
      const label=h.textContent.trim();
      const key='greywake.gm.menu.'+label.toLowerCase().replace(/[^a-z0-9]+/g,'-');
      const open=searching||sessionStorage.getItem(key)!=='closed';
      const btn=document.createElement('button');btn.type='button';btn.className='gm-record-toggle';btn.setAttribute('aria-expanded',String(open));btn.textContent=label+' ('+group.querySelectorAll('.nav-link').length+')';
      const content=document.createElement('div');content.className='gm-record-group-content';
      while(h.nextSibling)content.appendChild(h.nextSibling);
      h.replaceWith(btn);group.appendChild(content);content.hidden=!open;
      btn.addEventListener('click',()=>{const next=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(next));content.hidden=!next;sessionStorage.setItem(key,next?'open':'closed')});
    });
  }
  let navObserver;
  function initGMNavEnhancements(){
    const root=document.getElementById('nav');if(!root)return;
    if(!navObserver){navObserver=new MutationObserver(()=>{if(!fullGM())return;requestAnimationFrame(enhanceRecordNav)});navObserver.observe(root,{childList:true})}
    enhanceRecordNav();
  }
  const whiteboardRecords=()=>Object.entries(window.GREYWAKE_DATA||{}).map(([key,r])=>({key,title:r.title||key,category:r.category||'Record'})).sort((a,b)=>a.title.localeCompare(b.title));
  function whiteboardLibrary(){
    const area=document.getElementById('gmWhiteboardLibrary');if(!area)return;
    area.hidden=location.hash!==ROUTES.whiteboard||!fullGM();if(area.hidden)return;
    const search=document.getElementById('gmWhiteboardSearch'),category=document.getElementById('gmWhiteboardCategory'),results=document.getElementById('gmWhiteboardResults');
    if(!search||!category||!results)return;
    const records=whiteboardRecords();
    if(!area.dataset.ready){
      area.dataset.ready='1';
      const categories=[...new Set(records.map(r=>r.category))].sort();
      category.innerHTML='<option value="">All categories</option>'+categories.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
      const update=()=>{
        const q=search.value.trim().toLowerCase();
        const matches=records.filter(r=>(!category.value||r.category===category.value)&&(!q||(r.title+' '+r.category).toLowerCase().includes(q)));
        results.innerHTML=matches.slice(0,120).map(r=>'<button type="button" data-add-whiteboard="'+esc(r.key)+'"><small>'+esc(r.category)+'</small><span>'+esc(r.title)+'</span></button>').join('')||'<p>No matching records.</p>';
      };
      search.addEventListener('input',update);category.addEventListener('change',update);
      results.addEventListener('click',e=>{const btn=e.target.closest('[data-add-whiteboard]');if(!btn)return;const frame=document.getElementById('gmWhiteboardFrame');frame?.contentWindow?.postMessage({type:'greywake:whiteboard:add',key:btn.dataset.addWhiteboard},location.origin);if(matchMedia('(max-width:850px)').matches){window.GreywakeNavigation.closeSidebar()}});
      update();
    }
  }
  function render(){
    ensureStyles();const workspace=ensureWorkspace();if(!fullGM()){workspace.classList.add('hidden');restoreNav();return}
    if(!location.hash||location.hash==='#/'){location.hash=ROUTES.run;return}
    configureNav();ensureGMSidebar();ensureGMRecordSidebarRouting();const r=route();restoreInboxThreads();['home','brainView','article','playerPortal','characterPageView'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
    workspace.innerHTML=r.type==='prep'?renderPrep():r.type==='update'?renderUpdate():r.type==='world'?renderWorld():r.type==='record'?renderRecord(r.name):r.type==='inbox'?renderInbox():r.type==='players'?renderPlayers():r.type==='whiteboard'?renderWhiteboard():renderRun();
    workspace.classList.remove('hidden');wire(workspace);initGMNavEnhancements();whiteboardLibrary();if(r.type==='inbox')mountInboxThreads();syncNav(r.type);const crumb=document.getElementById('crumb');if(crumb)crumb.textContent=`Greywake / ${r.type==='record'?r.name:r.type.toUpperCase()}`;
  }

  document.addEventListener('click',e=>{if(!fullGM())return;const b=e.target.closest('#primaryNav [data-gm-route]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();navigate(b.dataset.gmRoute)},true);
  window.GreywakeNavigation.register('gm',render);window.addEventListener('greywake:player-ready',()=>setTimeout(render,0));window.addEventListener('greywake:gm-goals-rendered',()=>{if(fullGM()&&(location.hash===ROUTES.prep||location.hash===ROUTES.players))setTimeout(render,0)});document.addEventListener('DOMContentLoaded',()=>setTimeout(render,80));new MutationObserver(()=>{if(fullGM()&&!document.getElementById('gmOperationsView'))render()}).observe(document.documentElement,{childList:true,subtree:true});setTimeout(render,160);
})();
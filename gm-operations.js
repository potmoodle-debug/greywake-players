(() => {
  const ROUTES={run:'#/gm-session',prep:'#/gm-prep',update:'#/gm-update',world:'#/gm-world',inbox:'#/gm-inbox',players:'#/gm-players'};
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
    return{type:'run'};
  }
  function navigate(hash){if(location.hash===hash)render();else location.hash=hash}
  function readCaptures(){try{const x=JSON.parse(localStorage.getItem(CAPTURE_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
  function saveCaptures(items){localStorage.setItem(CAPTURE_KEY,JSON.stringify(items))}
  function addCapture(type,text){const clean=String(text||'').trim();if(!clean)return;const items=readCaptures();items.unshift({id:`cap-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type,text:clean,stage:'captured',session:gmState().session||'Current session',createdAt:new Date().toISOString()});saveCaptures(items);render()}
  function updateCapture(id,patch){saveCaptures(readCaptures().map(x=>x.id===id?{...x,...patch}:x));render()}
  function removeCapture(id){saveCaptures(readCaptures().filter(x=>x.id!==id));render()}

  function ensureStyles(){if(document.querySelector('link[data-gm-shell-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='gm-shell.css?v=dm2';l.dataset.gmShellStyle='true';document.head.appendChild(l)}
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
    let extra=document.getElementById('gmPlayersNav');if(!extra){extra=document.createElement('button');extra.id='gmPlayersNav';nav.appendChild(extra)}extra.type='button';extra.textContent='PLAYERS';extra.dataset.gmRoute=ROUTES.players;
  }
  function restoreNav(){
    document.getElementById('gmPlayersNav')?.remove();
    PLAYER_NAV_IDS.forEach(id=>{const b=document.getElementById(id);if(!b||!b.dataset.gmOriginalSaved)return;b.textContent=b.dataset.gmOriginalText||'';const oc=b.dataset.gmOriginalOnclick||'';if(oc)b.setAttribute('onclick',oc);else b.removeAttribute('onclick');const sec=b.dataset.gmOriginalSection||'';if(sec)b.dataset.primarySection=sec;delete b.dataset.gmRoute})
  }
  function syncNav(type){const target=type==='record'?ROUTES.world:ROUTES[type]||ROUTES.run;document.querySelectorAll('#primaryNav [data-gm-route]').forEach(b=>{const active=b.dataset.gmRoute===target;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}

  const authority=()=>`<div class="gm-authority"><div><small>CANON AUTHORITY</small><strong>Obsidian remains the source of truth.</strong><span>The site runs Greywake; it does not silently decide Greywake.</span></div><span class="gm-status-badge">GM ONLY</span></div>`;
  const head=(k,t,c)=>`<header class="gm-page-head"><div><small>${esc(k)}</small><h1>${esc(t)}</h1></div><p>${esc(c)}</p></header>`;
  const status=()=>{const s=gmState(),active=(s.activeParty||[]).join(' · ')||'—';return`<div class="gm-status-strip"><div><small>SESSION</small><strong>${esc(s.session||'Current')}</strong></div><div><small>PARTY LOCATION</small><strong>${esc(s.partyLocation||'—')}</strong></div><div><small>ACTIVE PARTY</small><strong>${esc(active)}</strong></div><div><small>CAPTURED</small><strong>${activeCaptureCount()} waiting</strong></div></div>`};
  const captureForm=()=>`<form id="gmQuickCaptureForm" class="gm-capture-form"><select id="gmCaptureType">${CAPTURE_TYPES.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><input id="gmCaptureText" maxlength="360" placeholder="One sentence — record it and keep playing"><button type="submit">Capture</button></form>`;
  function captureList(showResolved=false){const items=readCaptures().filter(x=>showResolved||x.stage!=='resolved');if(!items.length)return'<div class="gm-empty">Nothing is waiting for review.</div>';return`<div class="gm-capture-list">${items.map(x=>`<article class="gm-capture-row" data-capture-id="${esc(x.id)}"><div><small>${esc(CAPTURE_TYPES.find(([k])=>k===x.type)?.[1]||x.type)} · ${esc(x.session||'Session')}</small><strong>${esc(x.text)}</strong></div><select data-capture-stage>${STAGES.map(s=>`<option value="${s}" ${s===x.stage?'selected':''}>${STAGE_LABELS[s]}</option>`).join('')}</select><button class="gm-small-danger" type="button" data-capture-remove>Remove</button></article>`).join('')}</div>`}
  function tile(name,label,copy,image){const exists=recordExists(name),tag=exists?'button':'div',attr=exists?` type="button" data-gm-record="${esc(name)}"`:'';return`<${tag} class="gm-nav-card${exists?' is-clickable':' is-static'}"${attr}>${image?`<img src="${image}" alt="" loading="lazy">`:''}<div><small>${esc(label)}</small><strong>${esc(name)}</strong><span>${esc(copy)}</span>${exists?'<em>Open →</em>':''}</div></${tag}>`}

  function renderRun(){const s=gmState(),pressures=(s.pressures||[]).map(([level,label])=>`<div><b>${esc(level)}</b><span>${esc(label)}</span></div>`).join('')||'<div><b>—</b><span>No current pressures loaded.</span></div>';return`${authority()}${head('RUN GREYWAKE','At the table.','Stable reference beside ChatGPT and Foundry. Capture changes quickly; process them later.')}${status()}
    <section class="gm-run-hero"><img src="assets/tower-distant.jpg" alt=""><div class="gm-run-hero-shade"></div><div class="gm-run-hero-copy"><small>CURRENT SITUATION</small><h2>${esc(s.situationTitle||'Current Greywake state')}</h2><p>${esc(s.situationDetail||'')}</p><div class="gm-primary-actions"><button data-focus-capture>+ Capture change</button><button data-focus-reveal>Reveal to players</button><button class="gm-update-action" data-gm-go="update">UPDATE GREYWAKE</button></div></div></section>
    <div class="gm-ops-grid"><section class="gm-panel wide"><small>ACTIVE PRESSURES</small><h2>What is moving</h2><div class="gm-pressure-list">${pressures}</div></section><section class="gm-panel"><small>CURRENT SCENE</small><h2>${esc(s.sceneTitle||'Current state')}</h2><p>${esc(s.sceneDetail||'')}</p>${recordExists('The Closing Ways')?'<button class="gm-inline-action" data-gm-record="The Closing Ways">Open The Closing Ways →</button>':''}</section><section class="gm-panel"><small>EVIDENCE</small><h2>Keep boundaries visible</h2><div class="gm-evidence-legend"><span>FACT</span><span>THEORY</span><span>UNKNOWN</span><span>GM ONLY</span></div></section><section class="gm-panel full" id="gmCapturePanel"><small>QUICK CAPTURE</small><h2>Record it. Keep playing.</h2><p>This is local staging, not automatic canonisation.</p>${captureForm()}${captureList(false)}</section>${['Spencer Digger','Mara Vell','Brannic Hale','Selka Marr','Maela Rusk'].filter(n=>window.GREYWAKE_DATA?.[n]).length?`<section class="gm-panel full gm-live-npcs"><small>USEFUL PEOPLE NOW <span class="gm-live-source">CURRENT RECORDS</span></small><h2>People you may need at the table</h2><p>Established record text only. Untracked intentions are not invented.</p><div class="gm-live-npc-grid">${['Spencer Digger','Mara Vell','Brannic Hale','Selka Marr','Maela Rusk'].filter(n=>window.GREYWAKE_DATA?.[n]).map(n=>`<article class="gm-live-npc"><img src="${NPC_IMAGES[n]}" alt="" loading="lazy"><div><strong>${esc(n)}</strong><p>${esc(firstParagraph(window.GREYWAKE_DATA[n].html))}</p><button data-gm-record="${esc(n)}">Open record →</button></div></article>`).join('')}</div></section>`:''}<section class="gm-panel full gm-tool-ownership"><small>TOOL OWNERSHIP</small><h2>One job per tool</h2><div><span><b>ChatGPT</b> narration, judgement, NPC logic, consequences</span><span><b>Foundry</b> maps, tokens, spatial play</span><span><b>Site</b> operational view, player knowledge, captures</span><span><b>Obsidian</b> canon authority</span></div></section></div>`}

  function renderPrep(){
    const snapshot=window.GreywakeGMGoalSnapshot||{};
    const players=[
      ['marek','Marek','assets/canon/characters/marek-canon.jpg'],
      ['odie','Odie','assets/canon/characters/odie-canon.webp']
    ];
    const cards=players.map(([key,name,image])=>{
      const item=snapshot[key];
      const text=item?.text||'No current player interest or question recorded.';
      const state=item?.status==='pursuing'?'ACTIVE PURSUIT':item?.kind==='question'?'QUESTION':item?'INTERESTED':'NONE CURRENT';
      return `<article data-character="${key}"><img src="${image}" alt=""><div><strong>${name}</strong><span>${esc(text)}</span><em class="gm-live-goal-state ${item?.status==='pursuing'?'pursuing':''}">${state}</em></div></article>`;
    }).join('');
    return`${authority()}${head('PREP','Prepare only what may matter.','Use player interests, NPC decisions and likely locations to prepare possibilities rather than a fixed adventure.')}<div class="gm-ops-grid"><section class="gm-panel full"><small>NEXT SESSION</small><h2>Start from the changed world</h2><div class="gm-step-grid"><div><b>1</b><span>What was normal?</span></div><div><b>2</b><span>What changed?</span></div><div><b>3</b><span>Who noticed?</span></div><div><b>4</b><span>What did they decide?</span></div><div><b>5</b><span>What changes tomorrow?</span></div></div></section><section class="gm-panel full"><small>PLAYER INTENTIONS</small><h2>What each player wants to do</h2><p>Each character can have one active pursuit. Other interests are context, not commitments or votes.</p><div class="gm-player-cards">${cards}</div></section><section class="gm-panel wide"><small>NPC MOVES</small><h2>Want → Knowledge → Decision → Next action</h2><p>Prepare only decisions that follow from established wants, fears, loyalties, dependencies and what the NPC actually knows.</p></section><section class="gm-panel"><small>FOUNDRY PREP</small><h2>Visual / spatial queue</h2><ul><li>Maps and scenes</li><li>Tokens</li><li>Creature references</li><li>Handouts</li><li>Location imagery</li></ul></section><section class="gm-panel full"><small>UNPROCESSED SESSION CAPTURES</small><h2>${activeCaptureCount()} waiting</h2>${captureList(false)}<button class="gm-inline-action" data-gm-go="update">Take these to Update →</button></section></div>`}

  function updatePacket(){const items=readCaptures().filter(x=>x.stage!=='resolved');return`Use the current Greywake project files, connected Greywake tools, and this update packet as your source material.\n\nTreat the current Greywake Canon Status Quo Register as the highest Greywake setting authority.\n\nReview only what has actually changed. Preserve confirmed canon, separate fact from inference, keep player knowledge boundaries, and do not invent missing events. Update justified world state, NPC/faction state, unresolved consequences, access, rumours, promises, debts, evidence and player-facing knowledge.\n\nSESSION CAPTURES:\n${items.length?items.map(x=>`- [${STAGE_LABELS[x.stage]||x.stage}] ${CAPTURE_TYPES.find(([k])=>k===x.type)?.[1]||x.type}: ${x.text}`).join('\n'):'- No local captures recorded.'}\n\nAt the end report: 1. Confirmed changes 2. Unresolved consequences 3. Player-facing changes 4. Decisions still requiring Chris.`}
  async function copyUpdatePacket(){const state=document.getElementById('gmUpdateState');try{await navigator.clipboard.writeText(updatePacket());if(state)state.textContent='Update packet copied. Paste it into the Greywake updater chat.'}catch{if(state)state.textContent='Could not access the clipboard. Use “Copy active queue” instead.'}}
  async function copyObsidian(){const active=readCaptures().filter(x=>x.stage!=='resolved'),lines=['# Greywake Session Capture','',`Source: GM site staging · ${new Date().toLocaleDateString('en-GB')}`,'','> Staging only. Obsidian remains canon authority.','',...active.map(x=>`- [ ] **${CAPTURE_TYPES.find(([k])=>k===x.type)?.[1]||x.type}** — ${x.text} _(${STAGE_LABELS[x.stage]||x.stage})_`)];await navigator.clipboard?.writeText(lines.join('\n'))}
  function renderUpdate(){return`${authority()}${head('UPDATE','Update Greywake.','Turn captured session changes into a clean handoff for the updater chat without pretending the browser has already changed canon.')}<section class="gm-update-hero"><small>SINCE LAST REVIEW</small><strong>${activeCaptureCount()}</strong><span>local captures waiting</span><button id="gmRunUpdate">UPDATE GREYWAKE</button><p id="gmUpdateState">One update control: the live bridge routes this automatically when connected; otherwise the button copies the same handoff for the updater chat. It does not silently alter Obsidian or canon.</p></section><div class="gm-ops-grid"><section class="gm-panel full"><small>CAPTURED CHANGES</small><h2>Review what actually happened</h2>${captureList(false)}<div class="gm-row-actions"><button id="gmCopyObsidian" class="gm-inline-action">Copy active queue for Obsidian</button></div></section><section class="gm-panel wide"><small>PIPELINE</small><h2>Session → review → authority → player-safe state</h2><div class="gm-pipeline"><span class="active">Captured</span><span>ChatGPT review</span><span>Obsidian / canon</span><span>DM state</span><span>Player-safe state</span><span>Site</span></div><p class="gm-caution">Only “Captured” is automatically known by this browser. Later stages should show success only when the relevant system has actually been updated.</p></section><section class="gm-panel"><small>NEEDS CHRIS</small><h2>Hold uncertainty here</h2><p>Interpretation, culprit, hidden truth, major NPC choice or unresolved contradiction should remain a decision—not become canon because a button was pressed.</p></section></div>`}

  function renderWorld(){return`${authority()}${head('WORLD','Browse Greywake.','The encyclopaedia belongs here, not between you and the live game.')}<div class="gm-world-grid">${tile('Known People','PEOPLE','Portraits, relationships and known NPC records.','assets/brannic-hale.jpg')}${tile('Known Locations','PLACES','Settlement, routes and known locations.','assets/tower-distant.jpg')}${tile('Known Flora and Fauna','CREATURES','Known ecology and creature records.','assets/cacklemaw.jpg')}${tile('Greywake','SETTING','Settlement record and connected material.','assets/tower-distant.jpg')}</div><div class="gm-ops-grid"><section class="gm-panel wide"><small>CANON</small><h2>Status quo, not lore sprawl</h2><p>The current Canon Status Quo Register remains the highest Greywake setting authority. The site should surface it operationally, never replace it.</p></section><section class="gm-panel"><small>HISTORY</small><h2>Resolved material stays out of the way</h2><p>Historical and superseded material belongs here rather than competing with the live state.</p></section></div>`}
  function renderRecord(name){const item=window.GREYWAKE_DATA?.[name];if(!item)return`${authority()}${head('WORLD','Record unavailable.','This record is not currently present in the site dataset.')}<button class="gm-inline-action" data-gm-go="world">← Back to World</button>`;return`${authority()}<div class="gm-record-head"><button class="gm-inline-action" data-gm-go="world">← World</button><small>${esc(item.category||'GREYWAKE RECORD')}</small><h1>${esc(item.title||name)}</h1></div><article class="gm-world-record">${item.html||''}</article>`}
  const renderInbox=()=>`${authority()}${head('INBOX','What needs you?','Player questions, replies, downtime and choices should arrive here instead of competing with the live-session screen.')}<div class="gm-ops-grid"><section class="gm-panel full" id="gmInboxHost"><small>PLAYER ACTIVITY</small><h2>Loading player signals…</h2><p>The existing player-feed integration will appear here.</p></section></div>`;
  function renderPlayers(){
    const snapshot=window.GreywakeGMGoalSnapshot||{};
    const players=[
      ['martin','marek','MARTIN','Marek','assets/canon/characters/marek-canon.jpg'],
      ['ritchie','odie','RITCHIE','Odie','assets/canon/characters/odie-canon.webp']
    ];
    const cards=players.map(([preview,key,player,name,image])=>{
      const item=snapshot[key],text=item?.text||'No current player interest or question recorded.';
      return `<article data-character="${key}"><img src="${image}" alt="${name}"><div><small>${player}</small><strong>${name}</strong><span>${esc(text)}</span><button data-preview-player="${preview}">Preview ${name}</button></div></article>`;
    }).join('');
    return`${authority()}${head('PLAYERS','See exactly what they see.','Preview each player-facing site without leaking GM-only or another character’s private information.')}<section class="gm-player-projection-guard"><small>KNOWLEDGE BOUNDARY</small><strong>Each character is a separate projection.</strong><p>WORLD or canon changes do not become player knowledge automatically. Update Marek or Odie only when that character actually learned, witnessed or was explicitly told the information. Velmira is now an NPC and should be handled through NPC/world state rather than player projection. Never copy another character’s private knowledge across.</p></section><div class="gm-player-cards gm-player-preview-cards">${cards}</div>`}

  function wire(workspace){
    workspace.querySelectorAll('[data-gm-go]').forEach(b=>b.addEventListener('click',()=>navigate(ROUTES[b.dataset.gmGo]||b.dataset.gmGo)));
    workspace.querySelectorAll('[data-gm-record]').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.gmRecord;if(recordExists(n))navigate(gmRecordRoute(n))}));
    workspace.querySelectorAll('[data-preview-player]').forEach(b=>b.addEventListener('click',()=>document.querySelector(`#gmPreviewBar [data-preview="${b.dataset.previewPlayer}"]`)?.click()));
    workspace.querySelector('[data-focus-capture]')?.addEventListener('click',()=>{document.getElementById('gmCapturePanel')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.getElementById('gmCaptureText')?.focus(),250)});
    workspace.querySelector('[data-focus-reveal]')?.addEventListener('click',()=>{const input=document.getElementById('gmLiveRevealText');if(input){input.focus();input.scrollIntoView({behavior:'smooth',block:'center'})}});
    const form=workspace.querySelector('#gmQuickCaptureForm');form?.addEventListener('submit',e=>{e.preventDefault();const input=workspace.querySelector('#gmCaptureText');addCapture(workspace.querySelector('#gmCaptureType')?.value||'fact',input?.value||'')});
    workspace.querySelectorAll('[data-capture-stage]').forEach(s=>s.addEventListener('change',()=>updateCapture(s.closest('[data-capture-id]').dataset.captureId,{stage:s.value})));
    workspace.querySelectorAll('[data-capture-remove]').forEach(b=>b.addEventListener('click',()=>removeCapture(b.closest('[data-capture-id]').dataset.captureId)));
    workspace.querySelector('#gmRunUpdate')?.addEventListener('click',copyUpdatePacket);workspace.querySelector('#gmCopyObsidian')?.addEventListener('click',copyObsidian);
  }
  function render(){
    ensureStyles();const workspace=ensureWorkspace();if(!fullGM()){workspace.classList.add('hidden');restoreNav();return}
    if(!location.hash||location.hash==='#/'){location.hash=ROUTES.run;return}
    configureNav();const r=route();restoreInboxThreads();['home','brainView','article','playerPortal','characterPageView'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
    workspace.innerHTML=r.type==='prep'?renderPrep():r.type==='update'?renderUpdate():r.type==='world'?renderWorld():r.type==='record'?renderRecord(r.name):r.type==='inbox'?renderInbox():r.type==='players'?renderPlayers():renderRun();
    workspace.classList.remove('hidden');wire(workspace);if(r.type==='inbox')mountInboxThreads();syncNav(r.type);const crumb=document.getElementById('crumb');if(crumb)crumb.textContent=`Greywake / ${r.type==='record'?r.name:r.type.toUpperCase()}`;
  }

  document.addEventListener('click',e=>{if(!fullGM())return;const b=e.target.closest('#primaryNav [data-gm-route]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();navigate(b.dataset.gmRoute)},true);
  window.addEventListener('hashchange',()=>setTimeout(render,0));window.addEventListener('greywake:player-ready',()=>setTimeout(render,0));window.addEventListener('greywake:gm-goals-rendered',()=>{if(fullGM()&&(location.hash===ROUTES.prep||location.hash===ROUTES.players))setTimeout(render,0)});document.addEventListener('DOMContentLoaded',()=>setTimeout(render,80));new MutationObserver(()=>{if(fullGM()&&!document.getElementById('gmOperationsView'))render()}).observe(document.documentElement,{childList:true,subtree:true});setTimeout(render,160);
})();
(() => {
  if(window.__GreywakeGMPrepLive)return;
  window.__GreywakeGMPrepLive=true;

  const NPC_KEY='greywake-gm-active-npc-state-v1';
  const CAPTURE_KEY='greywake-gm-captures-v1';
  const PLAYER_NAMES=['Marek','Velmira','Odie'];
  let groupState=null, timer=null, queued=false;

  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const onPrep=()=>location.hash==='#/gm-prep'||location.hash==='#/gm-between';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const norm=v=>String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
  const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};

  function ensureStyles(){
    if(document.getElementById('gm-prep-live-styles'))return;
    const s=document.createElement('style');s.id='gm-prep-live-styles';s.textContent=`
      .gm-prep-live-summary{grid-column:1/-1}.gm-prep-live-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}
      .gm-prep-live-card{border:1px solid #3e3a2e;background:#11120e;padding:12px;min-width:0}.gm-prep-live-card small{display:block;color:#8f7d50;font-size:7px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}.gm-prep-live-card strong{display:block;color:#e2d7bc;font:700 17px/1.08 Georgia,serif;margin-bottom:6px}.gm-prep-live-card p{margin:0!important;color:#918978!important;font-size:9px!important;line-height:1.45!important}
      .gm-prep-player-list,.gm-prep-move-list,.gm-prep-thread-list,.gm-prep-decision-list{display:grid;gap:7px;margin-top:10px}.gm-prep-player-row,.gm-prep-move-row,.gm-prep-thread-row,.gm-prep-decision-row{border:1px solid #343228;background:#10110d;padding:9px 10px}.gm-prep-player-row{display:grid;grid-template-columns:80px minmax(0,1fr) auto;gap:9px;align-items:center}.gm-prep-player-row b,.gm-prep-move-row b,.gm-prep-thread-row b,.gm-prep-decision-row b{color:#d6c9aa;font-size:9px}.gm-prep-player-row span,.gm-prep-move-row span,.gm-prep-thread-row span,.gm-prep-decision-row span{color:#817a6a;font-size:8px;line-height:1.4}.gm-prep-player-row em{font-style:normal;border:1px solid #5c5032;color:#c5ac66;padding:3px 5px;font-size:7px;font-weight:900;text-transform:uppercase}
      .gm-prep-move-row{display:grid;grid-template-columns:130px minmax(0,1fr);gap:9px}.gm-prep-move-row div{display:grid;gap:3px}.gm-prep-move-row i{font-style:normal;color:#9a895a;font-size:7px;font-weight:900;text-transform:uppercase}.gm-prep-thread-row,.gm-prep-decision-row{display:grid;gap:3px}.gm-prep-thread-row small,.gm-prep-decision-row small{margin:0;color:#8f7e55}
      .gm-prep-empty{border:1px dashed #454033;background:#11120e;color:#817a69;padding:11px;font-size:9px}.gm-prep-source{color:#746b58;font-size:8px;margin-top:8px}
      @media(max-width:900px){.gm-prep-live-grid{grid-template-columns:1fr}.gm-prep-player-row{grid-template-columns:70px minmax(0,1fr)}.gm-prep-player-row em{grid-column:2}.gm-prep-move-row{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function playerPursuits(){
    const host=document.getElementById('playerGoals');if(!host)return[];
    return [...host.querySelectorAll('.gm-interest-thread')].map(card=>{
      const status=card.querySelector('.interest-status')?.textContent?.trim()||'';
      if(/RESOLVED/i.test(status))return null;
      const player=PLAYER_NAMES.find(n=>status.toLowerCase().includes(n.toLowerCase()));if(!player)return null;
      const source=card.querySelector('.interest-source button,.interest-source strong')?.textContent?.trim();
      const goal=card.querySelector('h3')?.textContent?.trim()||'';
      const title=source||goal;if(!title)return null;
      return{player,title,status:/PURSUING/i.test(status)?'Pursuing':'Interest'};
    }).filter(Boolean);
  }

  function groupChoice(){
    if(!groupState||!window.GreywakeGroupChoice?.aggregate)return null;
    const options=window.GreywakeGroupChoice.aggregate(groupState);if(!options.length)return null;
    const top=options[0],votes=top.voters?.size||0,tied=options.filter(x=>(x.voters?.size||0)===votes);
    return votes>=2&&tied.length===1?{title:top.source_title,votes}:null;
  }

  function npcMoves(){
    const state=readJSON(NPC_KEY,{});
    return Object.entries(state).map(([key,x])=>({key,...x})).filter(x=>x.want||x.knows||x.pressure||x.next);
  }

  function unresolvedThreads(){
    const grid=document.getElementById('currentThreadsGrid');if(!grid)return[];
    return [...grid.querySelectorAll('.thread-card')].map(card=>({
      title:card.querySelector('h3')?.textContent?.trim()||'',
      status:card.querySelector('.thread-status')?.textContent?.trim()||'',
      summary:card.querySelector('.thread-summary')?.textContent?.trim()||''
    })).filter(x=>x.title&&!/RESOLVED|DONE|CLOSED/i.test(x.status)).slice(0,8);
  }

  function decisions(){
    const items=readJSON(CAPTURE_KEY,[]);if(!Array.isArray(items))return[];
    return items.filter(x=>x.stage!=='resolved'&&(x.type==='question'||x.type==='canon')).slice(0,8);
  }

  function prettyNPC(key){
    const record=Object.keys(window.GREYWAKE_DATA||{}).find(name=>norm(name)===norm(key));
    return record||key.replace(/\b\w/g,c=>c.toUpperCase());
  }

  function renderSummary(root){
    const grid=root.querySelector('.gm-ops-grid');if(!grid)return;
    let panel=document.getElementById('gmPrepLiveSummary');
    if(!panel){panel=document.createElement('section');panel.id='gmPrepLiveSummary';panel.className='gm-panel full gm-prep-live-summary';const first=grid.querySelector('.gm-panel');first?.insertAdjacentElement('afterend',panel)}
    const pursuits=playerPursuits(),choice=groupChoice(),moves=npcMoves(),threads=unresolvedThreads(),needs=decisions();
    const sig=JSON.stringify([pursuits,choice,moves,threads,needs]);if(panel.dataset.signature===sig)return;panel.dataset.signature=sig;

    const direction=choice?`<strong>${esc(choice.title)}</strong><p>Settled group choice · ${choice.votes} votes.</p>`:pursuits.some(x=>x.status==='Pursuing')?`<strong>Player direction is forming</strong><p>${esc(pursuits.filter(x=>x.status==='Pursuing').map(x=>`${x.player}: ${x.title}`).join(' · '))}</p>`:`<strong>No settled direction</strong><p>Prepare broad possibilities only. Do not choose the party's next problem for them.</p>`;

    panel.innerHTML=`<small>LIVE PREP PICTURE</small><h2>What may actually matter next</h2><div class="gm-prep-live-grid"><div class="gm-prep-live-card"><small>PARTY DIRECTION</small>${direction}</div><div class="gm-prep-live-card"><small>NPC MOTION READY</small><strong>${moves.length}</strong><p>${moves.length?'NPCs have live wants / pressures / next actions recorded.':'No NPC move logic is currently prepared.'}</p></div><div class="gm-prep-live-card"><small>NEEDS CHRIS</small><strong>${needs.length}</strong><p>${needs.length?'Open questions or canon candidates are waiting for judgement.':'No captured judgement items are waiting.'}</p></div></div><p class="gm-prep-source">Live operational view only. Canon authority remains elsewhere.</p>`;
  }

  function renderPlayers(root){
    const panel=[...root.querySelectorAll('.gm-panel')].find(x=>/PLAYER INTENTIONS/i.test(x.querySelector('small')?.textContent||''));if(!panel)return;
    const pursuits=playerPursuits();
    let list=panel.querySelector('.gm-prep-player-list');if(!list){panel.querySelector('.gm-player-cards')?.remove();list=document.createElement('div');list.className='gm-prep-player-list';panel.appendChild(list)}
    const byPlayer=PLAYER_NAMES.map(player=>{const mine=pursuits.filter(x=>x.player===player);return{player,mine}});
    list.innerHTML=byPlayer.map(({player,mine})=>{const active=mine.find(x=>x.status==='Pursuing')||mine[0];return `<div class="gm-prep-player-row"><b>${esc(player)}</b><span>${esc(active?.title||'No live interest recorded')}</span><em>${esc(active?.status||'—')}</em></div>`}).join('');
  }

  function renderNPCMoves(root){
    const panel=[...root.querySelectorAll('.gm-panel')].find(x=>/NPC MOVES/i.test(x.querySelector('small')?.textContent||''));if(!panel)return;
    const moves=npcMoves();
    let list=panel.querySelector('.gm-prep-move-list');if(!list){panel.querySelector('p')?.remove();list=document.createElement('div');list.className='gm-prep-move-list';panel.appendChild(list)}
    list.innerHTML=moves.length?moves.map(x=>`<div class="gm-prep-move-row"><b>${esc(prettyNPC(x.key))}</b><div>${x.want?`<span><i>Wants</i> ${esc(x.want)}</span>`:''}${x.pressure?`<span><i>Pressure</i> ${esc(x.pressure)}</span>`:''}${x.next?`<span><i>Next</i> ${esc(x.next)}</span>`:''}</div></div>`).join(''):`<div class="gm-prep-empty">No NPC moves prepared yet. Add live logic from RUN only when an NPC's wants, knowledge or likely next action are actually established.</div>`;
  }

  function renderThreads(root){
    let panel=document.getElementById('gmPrepThreads');const grid=root.querySelector('.gm-ops-grid');if(!grid)return;
    if(!panel){panel=document.createElement('section');panel.id='gmPrepThreads';panel.className='gm-panel wide';const foundry=[...root.querySelectorAll('.gm-panel')].find(x=>/FOUNDRY PREP/i.test(x.querySelector('small')?.textContent||''));foundry?.insertAdjacentElement('beforebegin',panel)}
    const threads=unresolvedThreads();panel.innerHTML=`<small>UNRESOLVED CONSEQUENCES</small><h2>Things already in motion</h2>${threads.length?`<div class="gm-prep-thread-list">${threads.map(x=>`<div class="gm-prep-thread-row"><small>${esc(x.status||'OPEN')}</small><b>${esc(x.title)}</b><span>${esc(x.summary)}</span></div>`).join('')}</div>`:`<div class="gm-prep-empty">No unresolved player-facing threads are currently rendered.</div>`}`;
  }

  function renderDecisions(root){
    const needs=decisions();if(!needs.length)return;
    let panel=document.getElementById('gmPrepDecisions');const grid=root.querySelector('.gm-ops-grid');if(!grid)return;
    if(!panel){panel=document.createElement('section');panel.id='gmPrepDecisions';panel.className='gm-panel full';grid.appendChild(panel)}
    panel.innerHTML=`<small>DECISIONS BEFORE PLAY</small><h2>Only the things that need you</h2><div class="gm-prep-decision-list">${needs.map(x=>`<div class="gm-prep-decision-row"><small>${esc(x.type==='canon'?'CANON CANDIDATE':'OPEN QUESTION')}</small><b>${esc(x.text)}</b><span>${esc(x.session||'Session capture')}</span></div>`).join('')}</div>`;
  }

  function render(){
    if(!fullGM()||!onPrep())return;ensureStyles();const root=document.getElementById('gmOperationsView');if(!root||root.classList.contains('hidden'))return;
    renderSummary(root);renderPlayers(root);renderNPCMoves(root);renderThreads(root);renderDecisions(root);
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
  async function refreshGroup(){if(!fullGM()||!onPrep()||!window.GreywakeGroupChoice?.getStateForGM)return;try{groupState=await window.GreywakeGroupChoice.getStateForGM()}catch{}schedule()}
  function reset(){if(timer)clearInterval(timer);timer=null;if(fullGM()&&onPrep()){setTimeout(refreshGroup,100);timer=setInterval(refreshGroup,15000)}setTimeout(schedule,140)}

  window.addEventListener('hashchange',reset);window.addEventListener('greywake:player-ready',reset);window.addEventListener('greywake:engagement-changed',schedule);window.addEventListener('greywake:group-choice-changed',refreshGroup);document.addEventListener('DOMContentLoaded',reset);setTimeout(reset,700);
})();
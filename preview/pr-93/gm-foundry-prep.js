(() => {
  if(window.__GreywakeGMFoundryPrep)return;
  window.__GreywakeGMFoundryPrep=true;

  const KEY='greywake-gm-foundry-prep-v1';
  const NAMES=['Marek','Velmira','Odie'];
  const PORTRAITS={
    'bessa trant':'assets/npcs/hq-v3/bessa-trant.webp','brannic hale':'assets/npcs/hq-v3/brannic-hale.webp','hessa vey':'assets/npcs/hq-v3/hessa-vey.webp','high keeper varn':'assets/npcs/hq-v3/high-keeper-varn.webp','joric noll':'assets/npcs/hq-v3/joric-noll.webp','maela rusk':'assets/npcs/hq-v3/maela-rusk.webp','mara vell':'assets/npcs/hq-v3/mara-vell.webp','nemi':'assets/npcs/hq-v3/nemi.webp','rennic vale':'assets/npcs/hq-v3/rennic-vale.webp','sarn pell':'assets/npcs/hq-v3/sarn-pell.webp','selka marr':'assets/npcs/hq-v3/selka-marr.webp','sister elowen':'assets/npcs/hq-v3/sister-elowen.webp'
  };
  const FOCUS={
    'the closing ways':{
      assets:[
        {id:'closing-reference',kind:'Scene reference',label:'Digger Yards',path:'assets/generated-scenes/digger-yards.webp'},
        {id:'closing-tactical',kind:'Tactical map',label:'Sealed Digger entrance / access scene',note:'No dedicated tactical map is confirmed on the site yet.',optional:true}
      ],
      creature:'No creature or adversary requirement is established for The Closing Ways yet.',
      handout:'No specific handout is currently required by the established thread.'
    },
    'something moved in':{
      assets:[{id:'moved-ruins',kind:'Scene reference',label:'Greater Greywake ruins',path:'assets/generated-scenes/greater-greywake-ruins.webp'}],
      creature:'The occupant is still unknown. Do not prep a creature token as fact until its identity is established for play.',
      handout:'No specific handout is currently established.'
    },
    'the altered route markers':{
      assets:[{id:'markers-route',kind:'Scene reference',label:'The Wastes route',path:'assets/generated-scenes/the-wastes-route.webp'}],
      creature:'No creature requirement is established for the route-marker investigation.',
      handout:'Physical marker evidence may matter, but no dedicated handout is currently confirmed.'
    },
    'the cistern plate':{
      assets:[
        {id:'plate-case',kind:'Prop / reference',label:'Cistern Plate case',path:'assets/generated-scenes/cistern-plate-case.webp'},
        {id:'plate-valve',kind:'Location reference',label:'Valve Court',path:'assets/generated-scenes/valve-court.webp'}
      ],
      creature:'No creature requirement is established.',
      handout:'The Plate itself is the main visual evidence; no extra handout is currently required.'
    },
    "ash plate s recovery":{
      assets:[
        {id:'ash-pens',kind:'Location reference',label:'Great-Shell pens',path:'assets/generated-scenes/great-shell-pens.webp'},
        {id:'ash-portrait',kind:'Creature reference',label:'Ash-Plate',path:'assets/canon/fauna/ash-plate.webp'}
      ],
      creature:'Ash-Plate is already the relevant creature reference; no adversary is established.',
      handout:'No specific handout is established.'
    },
    'find a flickerfly':{
      assets:[],
      creature:'Marek wants to find a Flickerfly, but no confirmed sighting/location or dedicated site asset is established here yet.',
      handout:'No handout requirement is established.'
    },
    'an earlier stilling case':{
      assets:[{id:'stilling-nemi',kind:'NPC reference',label:'Nemi',path:'assets/npcs/hq-v3/nemi.webp'}],
      creature:'No creature requirement is established.',
      handout:'Historical case material may become relevant, but no specific player handout is confirmed by the current thread.'
    }
  };

  let groupState=null,timer=null,queued=false;
  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const onPrep=()=>location.hash==='#/gm-prep'||location.hash==='#/gm-between';
  const norm=v=>String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch{return{}}};
  const write=x=>localStorage.setItem(KEY,JSON.stringify(x));

  function pursuits(){
    const host=document.getElementById('playerGoals');if(!host)return[];
    return [...host.querySelectorAll('.gm-interest-thread')].map(card=>{
      const status=card.querySelector('.interest-status')?.textContent?.trim()||'';
      if(!/PURSUING/i.test(status)||/RESOLVED/i.test(status))return null;
      const player=NAMES.find(n=>status.toLowerCase().includes(n.toLowerCase()))||'Player';
      const source=card.querySelector('.interest-source button,.interest-source strong')?.textContent?.trim();
      const goal=card.querySelector('h3')?.textContent?.trim()||'';
      const title=source||goal;return title?{player,title,key:norm(title)}:null;
    }).filter(Boolean);
  }

  function focus(){
    if(groupState&&window.GreywakeGroupChoice?.aggregate){
      const options=window.GreywakeGroupChoice.aggregate(groupState);
      if(options.length){const top=options[0],votes=top.voters?.size||0,tied=options.filter(x=>(x.voters?.size||0)===votes);if(votes>=2&&tied.length===1)return{title:top.source_title,kind:'GROUP CHOICE'}}
    }
    const items=pursuits();if(!items.length)return{title:'No settled direction',kind:'BROAD PREP ONLY'};
    const groups=new Map();items.forEach(x=>{if(!groups.has(x.key))groups.set(x.key,{title:x.title,players:new Set()});groups.get(x.key).players.add(x.player)});
    const ranked=[...groups.values()].sort((a,b)=>b.players.size-a.players.size||a.title.localeCompare(b.title));
    if(ranked.length>1&&ranked[0].players.size===ranked[1].players.size)return{title:'Direction undecided',kind:'BROAD PREP ONLY'};
    return{title:ranked[0].title,kind:'PLAYER DIRECTION'};
  }

  function activeNPCs(){
    const names=String(window.GreywakeGMSessionState?.read?.().activeNPCs||'').split(',').map(x=>x.trim()).filter(Boolean);
    return names.map(name=>({name,path:PORTRAITS[norm(name)]||''}));
  }

  function stateKey(focusTitle,id){return `${norm(focusTitle)}::${id}`}
  function ready(state,focusTitle,id){return !!state.ready?.[stateKey(focusTitle,id)]}
  function toggleReady(focusTitle,id,value){const state=read();state.ready=state.ready||{};state.ready[stateKey(focusTitle,id)]=!!value;write(state);schedule()}
  function customItems(){const state=read();return Array.isArray(state.custom)?state.custom:[]}
  function saveCustom(items){const state=read();state.custom=items;write(state);schedule()}

  function ensureStyles(){
    if(document.getElementById('gm-foundry-prep-styles'))return;
    const s=document.createElement('style');s.id='gm-foundry-prep-styles';s.textContent=`
      .gm-foundry-live{display:grid;gap:10px}.gm-foundry-focus{border:1px solid #4c432e;background:#17150f;padding:10px 11px}.gm-foundry-focus small{display:block;color:#8f7c4c;font-size:7px;font-weight:900;letter-spacing:.1em}.gm-foundry-focus strong{display:block;color:#e6dabd;font:700 18px/1.1 Georgia,serif;margin:4px 0}.gm-foundry-focus span{color:#8d8573;font-size:8px}
      .gm-foundry-list{display:grid;gap:7px}.gm-foundry-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid #373329;background:#10110d;padding:9px 10px}.gm-foundry-item div{display:grid;gap:3px}.gm-foundry-item small{color:#8d7a4c;font-size:7px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.gm-foundry-item b{color:#d8ccb0;font-size:9px}.gm-foundry-item span{color:#7e7768;font-size:8px;line-height:1.35}.gm-foundry-item label{display:flex;align-items:center;gap:6px;color:#b9a66c;font-size:7px;font-weight:900;text-transform:uppercase;white-space:nowrap}.gm-foundry-item input{accent-color:auto}.gm-foundry-item.is-ready{border-color:#665a37}.gm-foundry-note{border:1px dashed #423e32;background:#11120e;padding:9px 10px;color:#817968;font-size:8px;line-height:1.45}.gm-foundry-note b{color:#b8a267}
      .gm-foundry-section-title{margin:2px 0 -2px;color:#8f8059;font-size:7px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.gm-foundry-add{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px}.gm-foundry-add input{border:1px solid #474131;background:#0d0e0b;color:#d8ceb5;padding:8px 9px;font-size:9px}.gm-foundry-add button,.gm-foundry-remove{border:1px solid #584b2e;background:#201b11;color:#cdb573;padding:7px 9px;font-size:7px;font-weight:900;text-transform:uppercase;cursor:pointer}.gm-foundry-remove{border-color:#443b30;color:#8d8371;background:#151510}
    `;document.head.appendChild(s)
  }

  function assetRow(state,focusTitle,item){
    const isReady=ready(state,focusTitle,item.id);
    const detail=item.path?`Site asset available · ${item.path}`:(item.note||'No site asset confirmed.');
    return `<div class="gm-foundry-item ${isReady?'is-ready':''}"><div><small>${esc(item.kind)}${item.optional?' · OPTIONAL':''}</small><b>${esc(item.label)}</b><span>${esc(detail)}</span></div><label><input type="checkbox" data-foundry-ready="${esc(item.id)}" ${isReady?'checked':''}>Ready in Foundry</label></div>`;
  }

  function render(){
    if(!fullGM()||!onPrep())return;ensureStyles();
    const root=document.getElementById('gmOperationsView');if(!root||root.classList.contains('hidden'))return;
    const panel=[...root.querySelectorAll('.gm-panel')].find(x=>/FOUNDRY PREP/i.test(x.querySelector('small')?.textContent||''));if(!panel)return;
    const current=focus(),data=FOCUS[norm(current.title)]||{assets:[],creature:'No creature or adversary requirement is established by the current player direction.',handout:'No specific handout requirement is established by the current player direction.'};
    const state=read(),npcs=activeNPCs(),custom=customItems();
    const npcAssets=npcs.map((x,i)=>({id:`npc-${norm(x.name)}`,kind:'NPC portrait',label:x.name,path:x.path,note:x.path?'':'No portrait path is currently mapped on the site.'}));
    const items=[...data.assets,...npcAssets];
    const sig=JSON.stringify([current,items,data.creature,data.handout,state]);if(panel.dataset.foundrySignature===sig)return;panel.dataset.foundrySignature=sig;
    panel.querySelector('ul')?.remove();
    let host=panel.querySelector('.gm-foundry-live');if(!host){host=document.createElement('div');host.className='gm-foundry-live';panel.appendChild(host)}
    host.innerHTML=`<div class="gm-foundry-focus"><small>${esc(current.kind)}</small><strong>${esc(current.title)}</strong><span>Prep only what this direction is likely to need. Site assets are not assumed to be imported into Foundry.</span></div>
      <div class="gm-foundry-section-title">Relevant assets</div>${items.length?`<div class="gm-foundry-list">${items.map(x=>assetRow(state,current.title,x)).join('')}</div>`:`<div class="gm-foundry-note">No specific site assets are currently tied to this direction.</div>`}
      <div class="gm-foundry-section-title">Do not invent prep</div><div class="gm-foundry-note"><b>Creatures / adversaries:</b> ${esc(data.creature)}<br><b>Handouts / evidence:</b> ${esc(data.handout)}</div>
      <div class="gm-foundry-section-title">Manual Foundry queue</div><form class="gm-foundry-add"><input maxlength="180" placeholder="Add only something you genuinely need in Foundry"><button type="submit">Add</button></form>
      ${custom.length?`<div class="gm-foundry-list">${custom.map(x=>`<div class="gm-foundry-item ${x.ready?'is-ready':''}" data-custom-id="${esc(x.id)}"><div><small>MANUAL PREP</small><b>${esc(x.text)}</b></div><label><input type="checkbox" data-custom-ready ${x.ready?'checked':''}>Ready</label><button class="gm-foundry-remove" type="button" data-custom-remove>Remove</button></div>`).join('')}</div>`:''}`;

    host.querySelectorAll('[data-foundry-ready]').forEach(box=>box.addEventListener('change',()=>toggleReady(current.title,box.dataset.foundryReady,box.checked)));
    host.querySelector('.gm-foundry-add')?.addEventListener('submit',event=>{event.preventDefault();const input=event.currentTarget.querySelector('input'),text=input.value.trim();if(!text)return;saveCustom([{id:`f-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,text,ready:false},...custom]);});
    host.querySelectorAll('[data-custom-ready]').forEach(box=>box.addEventListener('change',()=>{const row=box.closest('[data-custom-id]');saveCustom(custom.map(x=>x.id===row.dataset.customId?{...x,ready:box.checked}:x))}));
    host.querySelectorAll('[data-custom-remove]').forEach(btn=>btn.addEventListener('click',()=>{const row=btn.closest('[data-custom-id]');saveCustom(custom.filter(x=>x.id!==row.dataset.customId))}));
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
  async function refreshGroup(){if(!fullGM()||!onPrep()||!window.GreywakeGroupChoice?.getStateForGM)return;try{groupState=await window.GreywakeGroupChoice.getStateForGM()}catch{}schedule()}
  function reset(){if(timer)clearInterval(timer);timer=null;if(fullGM()&&onPrep()){setTimeout(refreshGroup,100);timer=setInterval(refreshGroup,15000)}setTimeout(schedule,150)}
  window.addEventListener('hashchange',reset);window.addEventListener('greywake:player-ready',reset);window.addEventListener('greywake:engagement-changed',schedule);window.addEventListener('greywake:group-choice-changed',refreshGroup);window.addEventListener('greywake:gm-session-state-changed',schedule);document.addEventListener('DOMContentLoaded',reset);setTimeout(reset,700);
})();
(() => {
  if(window.__GreywakeGMActiveNPCs)return;
  window.__GreywakeGMActiveNPCs=true;

  const KEY='greywake-gm-active-npc-state-v1';
  const PORTRAITS={
    'bessa trant':'assets/npcs/hq-v3/bessa-trant.webp',
    'brannic hale':'assets/npcs/hq-v3/brannic-hale.webp',
    'hessa vey':'assets/npcs/hq-v3/hessa-vey.webp',
    'high keeper varn':'assets/npcs/hq-v3/high-keeper-varn.webp',
    'joric noll':'assets/npcs/hq-v3/joric-noll.webp',
    'maela rusk':'assets/npcs/hq-v3/maela-rusk.webp',
    'mara vell':'assets/npcs/hq-v3/mara-vell.webp',
    'nemi':'assets/npcs/hq-v3/nemi.webp',
    'rennic vale':'assets/npcs/hq-v3/rennic-vale.webp',
    'sarn pell':'assets/npcs/hq-v3/sarn-pell.webp',
    'selka marr':'assets/npcs/hq-v3/selka-marr.webp',
    'sister elowen':'assets/npcs/hq-v3/sister-elowen.webp',
    'spencer digger':'assets/npcs/hq-v3/spencer-digger.webp'
  };
  let queued=false;

  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const onRun=()=>location.hash==='#/gm-session';
  const norm=v=>String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
  const activeNames=()=>String(window.GreywakeGMSessionState?.read?.().activeNPCs||'').split(',').map(x=>x.trim()).filter(Boolean).filter((v,i,a)=>a.findIndex(x=>norm(x)===norm(v))===i);

  function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch{return{}}}
  function write(state){localStorage.setItem(KEY,JSON.stringify(state))}
  function entry(state,name){return state[norm(name)]||{want:'',knows:'',pressure:'',next:''}}
  function recordExists(name){return !!window.GREYWAKE_DATA?.[name]}
  function recordRoute(name){return `#/gm-world/record/${encodeURIComponent(name)}`}
  function portrait(name){return PORTRAITS[norm(name)]||'assets/tower-distant.jpg'}

  function ensureStyles(){
    if(document.getElementById('gm-active-npcs-styles'))return;
    const s=document.createElement('style');s.id='gm-active-npcs-styles';s.textContent=`
      .gm-active-npcs{grid-column:1/-1}.gm-active-npcs-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:10px}.gm-active-npcs-head p{margin:0;color:#827b69;font-size:9px;max-width:540px}.gm-active-npc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .gm-active-npc{position:relative;min-width:0;border:1px solid #403b2e;background:#10110d;overflow:hidden}.gm-active-npc[data-priority="current"]{border-color:#7a673b}.gm-active-npc[data-priority="likely"]{border-color:#5f583e}.gm-active-npc-top{display:grid;grid-template-columns:76px minmax(0,1fr);min-height:92px;border-bottom:1px solid #373329}.gm-active-npc-top img{width:76px;height:92px;object-fit:cover;background:#161611}.gm-active-npc-ident{padding:11px 12px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-width:0}.gm-active-npc-ident small{color:#917d4c;font-size:7px;font-weight:900;letter-spacing:.11em}.gm-active-npc-ident strong{color:#eadfc5;font:700 18px/1.05 Georgia,serif;margin:4px 0 8px}.gm-active-npc-ident button,.gm-active-npc-record{border:0;background:none;color:#ad9b67;padding:0;font-size:8px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
      .gm-active-npc-logic{display:grid;gap:0}.gm-active-npc-logic div{display:grid;grid-template-columns:78px minmax(0,1fr);gap:8px;padding:8px 10px;border-top:1px solid #292820}.gm-active-npc-logic div:first-child{border-top:0}.gm-active-npc-logic b{color:#88784e;font-size:7px;letter-spacing:.08em;text-transform:uppercase}.gm-active-npc-logic span{color:#c8c0aa;font-size:9px;line-height:1.4}.gm-active-npc-logic span.empty{color:#6f695b;font-style:italic}
      .gm-active-npc-actions{padding:9px 10px;border-top:1px solid #302d24;display:flex;justify-content:flex-end}.gm-active-npc-actions button{border:1px solid #51482f;background:#191812;color:#c8b36f;padding:6px 8px;font-size:7px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
      .gm-active-npc-edit{display:none;padding:10px;border-top:1px solid #403926;background:#13130f}.gm-active-npc.is-editing .gm-active-npc-edit{display:grid;gap:7px}.gm-active-npc-edit label{display:grid;gap:4px;color:#82775b;font-size:7px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.gm-active-npc-edit textarea{min-height:52px;resize:vertical;border:1px solid #484231;background:#0b0c09;color:#ddd2b7;padding:8px;font:9px/1.4 system-ui,sans-serif}.gm-active-npc-edit .row{display:flex;gap:7px;justify-content:flex-end}.gm-active-npc-edit button{border:1px solid #6f5d35;background:#282114;color:#e2c97f;padding:7px 9px;font-size:7px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}.gm-active-npc-edit button.secondary{border-color:#444034;background:#171812;color:#978f7a}
      .gm-active-npcs-note{margin-top:9px;color:#716a5d;font-size:8px;line-height:1.4}.gm-active-npc-placeholder .gm-active-npc-top{grid-template-columns:1fr}.gm-active-npc-placeholder .gm-active-npc-ident{min-height:70px}.gm-active-npc-placeholder .gm-active-npc-ident strong{font-size:16px}
      @media(max-width:1050px){.gm-active-npc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.gm-active-npc-grid{grid-template-columns:1fr}.gm-active-npcs-head{display:block}.gm-active-npcs-head p{margin-top:6px}}
    `;document.head.appendChild(s);
  }

  function logic(label,value){return `<div><b>${esc(label)}</b><span class="${value?'':'empty'}">${esc(value||'Not established')}</span></div>`}

  function activeCard(name,state){
    const x=entry(state,name),open=recordExists(name);
    return `<article class="gm-active-npc" data-priority="current" data-npc="${esc(name)}"><div class="gm-active-npc-top"><img src="${esc(portrait(name))}" alt="" loading="lazy" onerror="this.src='assets/tower-distant.jpg';this.onerror=null"><div class="gm-active-npc-ident"><small>CURRENT · ACTIVE NPC</small><strong>${esc(name)}</strong>${open?`<button type="button" data-open-record="${esc(name)}">Open record →</button>`:''}</div></div><div class="gm-active-npc-logic">${logic('Wants',x.want)}${logic('Knows',x.knows)}${logic('Pressure',x.pressure)}${logic('Next action',x.next)}</div><div class="gm-active-npc-actions"><button type="button" data-edit-npc>Edit live logic</button></div><form class="gm-active-npc-edit"><label>Want<textarea name="want" maxlength="300">${esc(x.want)}</textarea></label><label>Knowledge<textarea name="knows" maxlength="400">${esc(x.knows)}</textarea></label><label>Pressure<textarea name="pressure" maxlength="300">${esc(x.pressure)}</textarea></label><label>Likely next action<textarea name="next" maxlength="400">${esc(x.next)}</textarea></label><div class="row"><button type="button" class="secondary" data-cancel-edit>Cancel</button><button type="submit">Save live logic</button></div></form></article>`;
  }

  function contextCard(priority,title,fields,recordName){
    const open=recordName&&recordExists(recordName);
    return `<article class="gm-active-npc gm-active-npc-placeholder" data-priority="${esc(priority)}"><div class="gm-active-npc-top"><div class="gm-active-npc-ident"><small>${priority==='likely'?'LIKELY NEXT':'CONDITIONAL'}</small><strong>${esc(title)}</strong>${open?`<button type="button" data-open-record="${esc(recordName)}">Open record →</button>`:''}</div></div><div class="gm-active-npc-logic">${fields.map(([a,b])=>logic(a,b)).join('')}</div></article>`;
  }

  function openingCard(){
    return contextCard('current','No NPC in the opening scene',[
      ['Now','Marek is inside the blocked Digger way; Odie and Velmira are on the other side.'],
      ['GM cue','Resolve the obstruction, contact and reconnection before bringing an NPC into the scene.']
    ]);
  }

  function suggestedCards(active){
    const cards=[];
    if(!active.some(name=>norm(name)==='spencer digger')) cards.push(contextCard('likely','Spencer Digger',[
      ['Trigger','The party seeks Digger expertise about the closure, fill or disturbed ground.'],
      ['Useful','He can read underground work and distinguish an older passage from recent alteration.'],
      ['Boundary','He is not automatically present and is not presumed to know who caused this closure.']
    ],'Spencer Digger'));
    cards.push(contextCard('conditional','Affected Digger route-user',[
      ['Trigger','The party asks who actually used this way or another closed route.'],
      ['Status','Identity is not yet established. Do not invent a named regular until play or prep establishes one.']
    ]));
    cards.push(contextCard('conditional','Relevant institutional contact',[
      ['Trigger','The party deliberately takes evidence toward the Syndicate, Keepers, Watch or another authority.'],
      ['Boundary','Choose the contact from the route the players take; surfacing the role does not imply faction involvement.']
    ]));
    return cards;
  }

  function mount(){
    if(!fullGM()||!onRun())return;
    ensureStyles();
    const root=document.getElementById('gmOperationsView'),grid=root?.querySelector('.gm-ops-grid');if(!grid)return;

    let panel=document.getElementById('gmActiveNPCs')||root.querySelector('.gm-live-npcs');
    if(!panel){
      panel=document.createElement('section');
      const capture=root.querySelector('#gmCapturePanel');
      if(capture)capture.parentNode.insertBefore(panel,capture);
      else grid.appendChild(panel);
    }
    panel.id='gmActiveNPCs';
    panel.className='gm-panel full gm-active-npcs gm-live-npcs';

    const active=activeNames(),state=read();
    const sig=JSON.stringify([active,state]);if(panel.dataset.signature===sig)return;panel.dataset.signature=sig;
    const cards=[...(active.length?active.map(name=>activeCard(name,state)):[openingCard()]),...suggestedCards(active)];
    panel.innerHTML=`<div class="gm-active-npcs-head"><div><small>USEFUL PEOPLE NOW · SESSION CONTEXT</small><h2>People you may need at the table</h2></div><p>Current scene first. Likely and conditional contacts appear only when play points toward them.</p></div><div class="gm-active-npc-grid">${cards.join('')}</div><p class="gm-active-npcs-note">Live GM operational guidance, not automatic canon. Unknown identities and intentions stay unknown until established.</p>`;

    panel.querySelectorAll('[data-open-record]').forEach(b=>b.addEventListener('click',()=>location.hash=recordRoute(b.dataset.openRecord)));
    panel.querySelectorAll('[data-edit-npc]').forEach(b=>b.addEventListener('click',()=>b.closest('.gm-active-npc')?.classList.add('is-editing')));
    panel.querySelectorAll('[data-cancel-edit]').forEach(b=>b.addEventListener('click',()=>b.closest('.gm-active-npc')?.classList.remove('is-editing')));
    panel.querySelectorAll('.gm-active-npc-edit').forEach(form=>form.addEventListener('submit',event=>{
      event.preventDefault();const card=event.currentTarget.closest('.gm-active-npc'),name=card?.dataset.npc;if(!name)return;
      const fd=new FormData(event.currentTarget),all=read();all[norm(name)]={want:String(fd.get('want')||'').trim(),knows:String(fd.get('knows')||'').trim(),pressure:String(fd.get('pressure')||'').trim(),next:String(fd.get('next')||'').trim(),updatedAt:new Date().toISOString()};write(all);panel.dataset.signature='';schedule();
    }));
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}
  window.addEventListener('hashchange',()=>setTimeout(schedule,120));
  window.addEventListener('greywake:player-ready',()=>setTimeout(schedule,180));
  window.addEventListener('greywake:gm-session-state-changed',()=>setTimeout(schedule,80));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,250));
  setInterval(()=>{if(fullGM()&&onRun())schedule()},2000);
  setTimeout(schedule,800);
})();
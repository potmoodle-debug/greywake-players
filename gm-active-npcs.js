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
    'sister elowen':'assets/npcs/hq-v3/sister-elowen.webp'
  };
  let queued=false;

  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const onRun=()=>location.hash==='#/gm-session';
  const norm=v=>String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const names=()=>String(window.GreywakeGMSessionState?.read?.().activeNPCs||'').split(',').map(x=>x.trim()).filter(Boolean).filter((v,i,a)=>a.findIndex(x=>norm(x)===norm(v))===i);

  function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch{return{}}}
  function write(state){localStorage.setItem(KEY,JSON.stringify(state))}
  function entry(state,name){return state[norm(name)]||{want:'',knows:'',pressure:'',next:''}}
  function recordExists(name){return !!window.GREYWAKE_DATA?.[name]}
  function recordRoute(name){return `#/gm-world/record/${encodeURIComponent(name)}`}

  function ensureStyles(){
    if(document.getElementById('gm-active-npcs-styles'))return;
    const s=document.createElement('style');s.id='gm-active-npcs-styles';s.textContent=`
      .gm-active-npcs{grid-column:1/-1}.gm-active-npcs-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:10px}.gm-active-npcs-head p{margin:0;color:#827b69;font-size:9px}.gm-active-npc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .gm-active-npc{position:relative;min-width:0;border:1px solid #403b2e;background:#10110d;overflow:hidden}.gm-active-npc-top{display:grid;grid-template-columns:76px minmax(0,1fr);min-height:92px;border-bottom:1px solid #373329}.gm-active-npc-top img{width:76px;height:92px;object-fit:cover;background:#161611}.gm-active-npc-ident{padding:11px 12px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-width:0}.gm-active-npc-ident small{color:#917d4c;font-size:7px;font-weight:900;letter-spacing:.11em}.gm-active-npc-ident strong{color:#eadfc5;font:700 19px/1.05 Georgia,serif;margin:4px 0 8px}.gm-active-npc-ident button{border:0;background:none;color:#ad9b67;padding:0;font-size:8px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
      .gm-active-npc-logic{display:grid;gap:0}.gm-active-npc-logic div{display:grid;grid-template-columns:78px minmax(0,1fr);gap:8px;padding:8px 10px;border-top:1px solid #292820}.gm-active-npc-logic div:first-child{border-top:0}.gm-active-npc-logic b{color:#88784e;font-size:7px;letter-spacing:.08em;text-transform:uppercase}.gm-active-npc-logic span{color:#c8c0aa;font-size:9px;line-height:1.35}.gm-active-npc-logic span.empty{color:#6f695b;font-style:italic}
      .gm-active-npc-actions{padding:9px 10px;border-top:1px solid #302d24;display:flex;justify-content:flex-end}.gm-active-npc-actions button{border:1px solid #51482f;background:#191812;color:#c8b36f;padding:6px 8px;font-size:7px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
      .gm-active-npc-edit{display:none;padding:10px;border-top:1px solid #403926;background:#13130f}.gm-active-npc.is-editing .gm-active-npc-edit{display:grid;gap:7px}.gm-active-npc-edit label{display:grid;gap:4px;color:#82775b;font-size:7px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.gm-active-npc-edit textarea{min-height:52px;resize:vertical;border:1px solid #484231;background:#0b0c09;color:#ddd2b7;padding:8px;font:9px/1.4 system-ui,sans-serif}.gm-active-npc-edit .row{display:flex;gap:7px;justify-content:flex-end}.gm-active-npc-edit button{border:1px solid #6f5d35;background:#282114;color:#e2c97f;padding:7px 9px;font-size:7px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}.gm-active-npc-edit button.secondary{border-color:#444034;background:#171812;color:#978f7a}
      .gm-active-npcs-empty{padding:14px;border:1px dashed #454033;color:#827a69;background:#11120e;font-size:9px}.gm-active-npcs-note{margin-top:9px;color:#716a5d;font-size:8px;line-height:1.4}
      @media(max-width:1050px){.gm-active-npc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.gm-active-npc-grid{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function logic(label,value){return `<div><b>${label}</b><span class="${value?'':'empty'}">${esc(value||'Not established')}</span></div>`}
  function portrait(name){return PORTRAITS[norm(name)]||'assets/tower-distant.jpg'}

  function card(name,state){
    const x=entry(state,name),open=recordExists(name);
    return `<article class="gm-active-npc" data-npc="${esc(name)}"><div class="gm-active-npc-top"><img src="${esc(portrait(name))}" alt="" loading="lazy" onerror="this.src='assets/tower-distant.jpg';this.onerror=null"><div class="gm-active-npc-ident"><small>ACTIVE NPC</small><strong>${esc(name)}</strong>${open?`<button type="button" data-open-record="${esc(name)}">Open record →</button>`:''}</div></div><div class="gm-active-npc-logic">${logic('Wants',x.want)}${logic('Knows',x.knows)}${logic('Pressure',x.pressure)}${logic('Next action',x.next)}</div><div class="gm-active-npc-actions"><button type="button" data-edit-npc>Edit live logic</button></div><form class="gm-active-npc-edit"><label>Want<textarea name="want" maxlength="300" placeholder="What this NPC currently wants — only if established or deliberately set for play">${esc(x.want)}</textarea></label><label>Knowledge<textarea name="knows" maxlength="400" placeholder="What they actually know, not what the GM knows">${esc(x.knows)}</textarea></label><label>Pressure<textarea name="pressure" maxlength="300" placeholder="Need, fear, loyalty, dependency or immediate pressure">${esc(x.pressure)}</textarea></label><label>Likely next action<textarea name="next" maxlength="400" placeholder="What they are likely to do next if nothing changes">${esc(x.next)}</textarea></label><div class="row"><button type="button" class="secondary" data-cancel-edit>Cancel</button><button type="submit">Save live logic</button></div></form></article>`;
  }

  function mount(){
    if(!fullGM()||!onRun())return;
    ensureStyles();
    const root=document.getElementById('gmOperationsView'),grid=root?.querySelector('.gm-ops-grid');if(!grid)return;
    let panel=document.getElementById('gmActiveNPCs');if(!panel){panel=document.createElement('section');panel.id='gmActiveNPCs';panel.className='gm-panel full gm-active-npcs';const scene=[...grid.querySelectorAll('.gm-panel')].find(x=>/CURRENT SCENE/i.test(x.querySelector('small')?.textContent||''));scene?scene.insertAdjacentElement('afterend',panel):grid.prepend(panel)}
    const active=names(),state=read();
    const sig=JSON.stringify([active,state]);if(panel.dataset.signature===sig)return;panel.dataset.signature=sig;
    panel.innerHTML=`<div class="gm-active-npcs-head"><div><small>ACTIVE NPCs</small><h2>Who matters in this scene</h2></div><p>Want → knowledge → pressure → likely next action</p></div>${active.length?`<div class="gm-active-npc-grid">${active.map(n=>card(n,state)).join('')}</div>`:`<div class="gm-active-npcs-empty">No active NPCs set. Add names in <b>Live Session State</b> when someone enters the scene.</div>`}<p class="gm-active-npcs-note">These are live GM operational notes, not automatic canon. Unknown fields stay unknown rather than being invented.</p>`;

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
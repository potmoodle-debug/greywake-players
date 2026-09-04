(() => {
  if(window.__GreywakeGMUpdateLive)return;
  window.__GreywakeGMUpdateLive=true;

  const CAPTURE_KEY='greywake-gm-captures-v1';
  const META_KEY='greywake-gm-update-capture-meta-v1';
  const HANDOFF_KEY='greywake-gm-rich-update-handoff-v1';
  const CONFIRM_KEY='greywake-gm-update-confirmations-v1';
  const AUDIENCES=['GM only','Party','Marek','Velmira','Odie'];
  const STRAIGHTFORWARD=new Set(['fact','discovery','promise','resource']);
  let queued=false,timer=null;

  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const onUpdate=()=>location.hash==='#/gm-update';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const captures=()=>{const x=readJSON(CAPTURE_KEY,[]);return Array.isArray(x)?x.filter(c=>c.stage!=='resolved'):[]};
  const meta=()=>readJSON(META_KEY,{});
  const confirmations=()=>readJSON(CONFIRM_KEY,{});

  function ensureStyles(){
    if(document.getElementById('gm-update-live-styles'))return;
    const s=document.createElement('style');s.id='gm-update-live-styles';s.textContent=`
      .gm-update-live{grid-column:1/-1}.gm-update-live-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:12px}.gm-update-live-head p{margin:0;color:#887f6b;font-size:9px;max-width:620px}
      .gm-update-routing{display:grid;gap:8px}.gm-update-route-row{display:grid;grid-template-columns:105px minmax(0,1fr) 145px 145px;gap:8px;align-items:center;border:1px solid #38352b;background:#10110d;padding:9px 10px}.gm-update-route-row small{color:#8d7c50;font-size:7px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.gm-update-route-row strong{display:block;color:#d9ceb2;font-size:9px;line-height:1.35}.gm-update-route-row select{min-width:0;border:1px solid #494334;background:#0d0e0b;color:#cfc4aa;padding:7px;font-size:8px}.gm-update-route-row label{display:flex;align-items:center;gap:6px;color:#a49a82;font-size:8px}.gm-update-route-row input[type=checkbox]{accent-color:#b2944f}.gm-update-route-row.is-held{border-color:#775b36;background:#19150f}
      .gm-update-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}.gm-update-summary-card{border:1px solid #3b382e;background:#11120e;padding:10px}.gm-update-summary-card small{display:block;color:#84785b;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.gm-update-summary-card strong{display:block;margin-top:4px;color:#e0d4b5;font:700 20px/1 Georgia,serif}.gm-update-summary-card span{display:block;margin-top:4px;color:#7f7868;font-size:8px;line-height:1.35}
      .gm-update-actions-live{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.gm-update-actions-live button{border:1px solid #6e5b34;background:#272014;color:#e0c475;padding:9px 11px;font-size:8px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;cursor:pointer}.gm-update-actions-live button.secondary{border-color:#494438;background:#151610;color:#a79e88}.gm-update-actions-live .state{margin-left:auto;color:#7f7766;font-size:8px;align-self:center}
      .gm-update-confirm-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:11px}.gm-update-confirm{border:1px solid #39362c;background:#10110d;padding:10px}.gm-update-confirm small{display:block;color:#80755a;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.gm-update-confirm strong{display:block;color:#cfc4aa;font-size:9px;margin:4px 0 7px}.gm-update-confirm button{border:1px solid #494334;background:#151610;color:#aaa18d;padding:6px 7px;font-size:7px;cursor:pointer}.gm-update-confirm.is-confirmed{border-color:#756338;background:#19170f}.gm-update-confirm.is-confirmed strong{color:#dcc57f}
      .gm-update-note{margin-top:10px;color:#766e5f;font-size:8px;line-height:1.4}
      @media(max-width:950px){.gm-update-route-row{grid-template-columns:90px minmax(0,1fr)}.gm-update-route-row select,.gm-update-route-row label{grid-column:2}.gm-update-summary-grid{grid-template-columns:1fr 1fr}.gm-update-confirm-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:600px){.gm-update-summary-grid,.gm-update-confirm-grid{grid-template-columns:1fr}.gm-update-live-head{display:block}.gm-update-live-head p{margin-top:8px}.gm-update-actions-live .state{width:100%;margin-left:0}}
    `;document.head.appendChild(s);
  }

  function defaultMeta(c){return{audience:'GM only',hold:!STRAIGHTFORWARD.has(c.type)}}
  function captureMeta(c,all){return{...defaultMeta(c),...(all[c.id]||{})}}
  function saveMeta(id,patch){const all=meta();all[id]={...(all[id]||{}),...patch};localStorage.setItem(META_KEY,JSON.stringify(all));schedule()}

  function counts(items,all){
    let held=0,straight=0;const people={Party:0,Marek:0,Velmira:0,Odie:0};
    items.forEach(c=>{const m=captureMeta(c,all);m.hold?held++:straight++;if(people[m.audience]!==undefined)people[m.audience]++});
    return{held,straight,people};
  }

  function sessionState(){return window.GreywakeGMSessionState?.read?.()||{} }
  function buildPacket(){
    const items=captures(),all=meta(),state=sessionState();
    const lines=[
      'Use the current Greywake project files, connected Greywake tools, and this update packet as your source material.',
      '',
      'Treat the current Greywake Canon Status Quo Register as the highest Greywake setting authority.',
      '',
      'Rules:',
      '- Preserve established canon. Do not invent events that did not happen.',
      '- Keep confirmed facts separate from inference, suggestions and unknowns.',
      '- Preserve unresolved mysteries and contradictions instead of silently resolving them.',
      '- Only facts established in play or explicitly approved by Chris become permanent canon.',
      '- Keep player knowledge separate. Only update a player if the capture below says they learned/witnessed it.',
      '- Items marked HOLD FOR CHRIS must not be canonised until Chris decides them.',
      '',
      'LIVE SESSION CONTEXT (operational context; not automatically canon):',
      `- Session: ${state.session||'Not set'}`,
      `- Phase: ${state.phase||'Not set'}`,
      `- Location: ${state.location||'Not set'}`,
      `- Scene: ${state.scene||'Not set'}`,
      `- Active party: ${state.party||'Not set'}`,
      `- Active NPCs: ${state.activeNPCs||'None set'}`,
      `- Fear: ${state.fear||'Not set'}`,
      `- Time/weather: ${state.timeWeather||'Not set'}`,
      `- Immediate danger: ${state.danger||'None set'}`,
      '',
      'SESSION CAPTURES:'
    ];
    if(!items.length)lines.push('- No active captures recorded.');
    items.forEach((c,i)=>{const m=captureMeta(c,all);lines.push(`${i+1}. [${String(c.type||'capture').toUpperCase()}] ${c.text}`);lines.push(`   Knowledge: ${m.audience}`);lines.push(`   Handling: ${m.hold?'HOLD FOR CHRIS':'Review as straightforward established change'}`);lines.push(`   Stage: ${c.stage||'captured'}`)});
    lines.push('','At the end report exactly:','1. Systems successfully updated','2. Systems not updated','3. Confirmed changes','4. Unresolved consequences','5. Player-facing changes by Marek / Velmira / Odie','6. Decisions still requiring Chris');
    return lines.join('\n');
  }

  async function copyPacket(stateEl){
    try{await navigator.clipboard.writeText(buildPacket());localStorage.setItem(HANDOFF_KEY,JSON.stringify({at:new Date().toISOString(),captureIds:captures().map(x=>x.id)}));if(stateEl)stateEl.textContent='Complete updater packet copied.';schedule()}catch{if(stateEl)stateEl.textContent='Clipboard access failed.'}
  }

  function confirmSystem(key){const all=confirmations();if(all[key])delete all[key];else all[key]=new Date().toISOString();localStorage.setItem(CONFIRM_KEY,JSON.stringify(all));schedule()}

  function mount(){
    if(!fullGM()||!onUpdate())return;ensureStyles();
    const root=document.getElementById('gmOperationsView'),grid=root?.querySelector('.gm-ops-grid');if(!grid)return;
    const items=captures(),all=meta(),summary=counts(items,all),handoff=readJSON(HANDOFF_KEY,null),conf=confirmations();
    let panel=document.getElementById('gmUpdateLive');if(!panel){panel=document.createElement('section');panel.id='gmUpdateLive';panel.className='gm-panel full gm-update-live';grid.prepend(panel)}
    const sig=JSON.stringify([items,all,handoff,conf,sessionState()]);if(panel.dataset.signature===sig)return;panel.dataset.signature=sig;

    const routing=items.length?items.map(c=>{const m=captureMeta(c,all);return `<div class="gm-update-route-row ${m.hold?'is-held':''}" data-id="${esc(c.id)}"><small>${esc(c.type||'capture')}</small><strong>${esc(c.text)}</strong><select data-update-audience>${AUDIENCES.map(a=>`<option ${a===m.audience?'selected':''}>${esc(a)}</option>`).join('')}</select><label><input type="checkbox" data-update-hold ${m.hold?'checked':''}> Hold for Chris</label></div>`}).join(''):`<div class="gm-update-note">No active session captures are waiting.</div>`;

    const systems=[['obsidian','Obsidian / canon'],['dm','DM state'],['marek','Marek knowledge'],['velmira','Velmira knowledge'],['odie','Odie knowledge']];
    panel.innerHTML=`<div class="gm-update-live-head"><div><small>UPDATE ROUTING</small><h2>What changed, who learned it, what needs judgement</h2></div><p>Classification here prepares the updater handoff. It does not canonise anything by itself.</p></div><div class="gm-update-summary-grid"><div class="gm-update-summary-card"><small>ACTIVE CAPTURES</small><strong>${items.length}</strong><span>Waiting in browser staging</span></div><div class="gm-update-summary-card"><small>STRAIGHTFORWARD REVIEW</small><strong>${summary.straight}</strong><span>Not held for a creative decision</span></div><div class="gm-update-summary-card"><small>NEEDS CHRIS</small><strong>${summary.held}</strong><span>Explicitly held from canonisation</span></div><div class="gm-update-summary-card"><small>PLAYER KNOWLEDGE</small><strong>${summary.people.Party+summary.people.Marek+summary.people.Velmira+summary.people.Odie}</strong><span>Captures routed beyond GM-only</span></div></div><div class="gm-update-routing">${routing}</div><div class="gm-update-actions-live"><button type="button" data-copy-rich-update>COPY COMPLETE UPDATER PACKET</button><button type="button" class="secondary" data-copy-preview>Preview packet</button><span class="state">${handoff?`Last complete handoff ${esc(new Date(handoff.at).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}))}`:'No complete handoff copied yet.'}</span></div><div class="gm-update-confirm-grid">${systems.map(([key,label])=>`<div class="gm-update-confirm ${conf[key]?'is-confirmed':''}"><small>${esc(label)}</small><strong>${conf[key]?'Manually confirmed':'Not confirmed by site'}</strong><button type="button" data-confirm-system="${key}">${conf[key]?'Clear confirmation':'Mark confirmed'}</button></div>`).join('')}</div><p class="gm-update-note">Manual confirmations are a record of what you or the updater have verified. They are not independent API verification. GitHub/site deployment status should only be claimed when an actual deployment is checked.</p>`;

    panel.querySelectorAll('[data-update-audience]').forEach(el=>el.addEventListener('change',()=>saveMeta(el.closest('[data-id]').dataset.id,{audience:el.value})));
    panel.querySelectorAll('[data-update-hold]').forEach(el=>el.addEventListener('change',()=>saveMeta(el.closest('[data-id]').dataset.id,{hold:el.checked})));
    const stateEl=panel.querySelector('.gm-update-actions-live .state');
    panel.querySelector('[data-copy-rich-update]')?.addEventListener('click',()=>copyPacket(stateEl));
    panel.querySelector('[data-copy-preview]')?.addEventListener('click',()=>{const text=buildPacket();window.prompt('Complete Greywake updater packet',text)});
    panel.querySelectorAll('[data-confirm-system]').forEach(b=>b.addEventListener('click',()=>confirmSystem(b.dataset.confirmSystem)));
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}
  function reset(){if(timer)clearInterval(timer);timer=null;if(fullGM()&&onUpdate()){setTimeout(schedule,120);timer=setInterval(schedule,1800)}}
  window.GreywakeGMUpdateLive={buildPacket};
  window.addEventListener('hashchange',reset);window.addEventListener('greywake:player-ready',reset);document.addEventListener('DOMContentLoaded',reset);setTimeout(reset,700);
})();
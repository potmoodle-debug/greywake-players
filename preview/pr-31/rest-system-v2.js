(() => {
  const CONFIG={marek:{name:'Marek',tier:1},velmira:{name:'Velmira',tier:1},odie:{name:'Odie',tier:1}};
  const PREFIX='greywake:rest-state:v2:';
  const PARTY_SIZE=3;
  let activeKey=null,activeStore=null,state=null,draft=null;

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  const die=sides=>{if(window.crypto?.getRandomValues){const b=new Uint32Array(1);window.crypto.getRandomValues(b);return(b[0]%sides)+1;}return Math.floor(Math.random()*sides)+1;};
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const key=()=>{const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return CONFIG[k]?k:null;};
  const isPreview=()=>document.body.dataset.gmPreview==='true';
  const storeKey=k=>`${PREFIX}${k}${isPreview()?':gmtest':''}`;
  const cfg=()=>activeKey?CONFIG[activeKey]:null;
  const resourceAPI=()=>activeKey==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const resources=()=>resourceAPI()?.getState?.()||null;
  const damageAPI=()=>window.GreywakeDamage||null;
  const base=()=>({water:null,lastRest:null,restCounter:0});

  function load(k){
    if(!CONFIG[k])return null;const sk=storeKey(k);
    if(activeKey===k&&activeStore===sk&&state)return state;
    activeKey=k;activeStore=sk;
    try{state={...base(),...JSON.parse(localStorage.getItem(sk)||'null')};}catch(_){state=base();}
    state.water=state.water===null||state.water===undefined?null:clamp(state.water,0,99);
    state.restCounter=Math.max(0,Number(state.restCounter)||0);
    return state;
  }
  function ensureState(){const k=key();return k?load(k):null;}
  function save(){if(!state||!activeStore)return;try{localStorage.setItem(activeStore,JSON.stringify(state));}catch(_){}}
  function snapshot(){return state?{water:state.water===null?null:Number(state.water),lastRest:state.lastRest||null,restCounter:Number(state.restCounter)||0}:null;}
  function emit(reason){window.dispatchEvent(new CustomEvent('greywake:rest-state-changed',{detail:{key:activeKey,reason,state:snapshot()}}));}
  function commit(next,reason){if(!state)return;Object.assign(state,next);state.water=state.water===null?null:clamp(state.water,0,99);state.restCounter=Math.max(0,Number(state.restCounter)||0);save();render();emit(reason);}
  function importState(remote){if(!remote)return;ensureState();if(!state)return;state.water=remote.water===null||remote.water===undefined?null:clamp(remote.water,0,99);state.lastRest=remote.lastRest||null;state.restCounter=Math.max(0,Number(remote.restCounter)||0);save();render();}
  function setWater(value){ensureState();if(!state)return;commit({water:value===null?null:clamp(value,0,99)},'Set carried Water');}

  function ensurePanel(){
    const identity=document.querySelector('#characterSheet .character-sheet-identity');if(!identity)return null;
    let p=document.getElementById('restPanel');
    if(!p){p=document.createElement('section');p.id='restPanel';p.className='rest-panel';const damage=document.getElementById('damageHealthPanel');if(damage)damage.insertAdjacentElement('afterend',p);else{const board=identity.querySelector('.pro-resource-board');if(board)board.insertAdjacentElement('afterend',p);else identity.appendChild(p);}}
    return p;
  }
  const waterText=()=>state?.water===null?'Not set':`${state.water} Water`;
  function renderPanel(){
    const p=ensurePanel();if(!p||!state)return;
    const status=window.GreywakeDamage?.getState?.()?.status||'active';
    const disabled=['dead','retired','death_move','blaze_pending'].includes(status);
    p.innerHTML=`<div class="rest-panel-head"><div><span>DOWNTIME</span><strong>Rest & Water</strong><small>${isPreview()?'GM preview · local test · not synced':'Synced with character state'}</small></div><div class="rest-open-buttons"><button type="button" data-rest="short" ${disabled?'disabled':''}>Short Rest</button><button type="button" data-rest="long" ${disabled?'disabled':''}>Long Rest</button></div></div>
      <div class="rest-water"><div class="rest-water-copy"><span>CARRIED WATER</span><strong>${waterText()}</strong><small>Greywake: each character spends 1 Water at the start of a Short or Long Rest.</small></div><div class="rest-water-controls"><button type="button" data-water-delta="-1" ${state.water===null||state.water<=0?'disabled':''}>−</button><input data-water-input type="number" min="0" max="99" value="${state.water===null?'':state.water}" placeholder="?"><button type="button" data-water-delta="1">+</button><button type="button" data-water-set>Set Water</button></div></div>
      <div class="rest-water-status ${state.water===null||state.water===0?'warn':''}">${state.water===null?'Carried Water has not been set yet.':state.water===0?'No Water: a Short Rest gives no benefits; a Long Rest only gives Short-Rest benefits.':'Water is available for a full rest.'}</div>
      ${isPreview()?'<button class="rest-reset-test" type="button" data-reset-rest-test>Reset rest test</button>':''}`;
    p.querySelectorAll('[data-rest]').forEach(b=>b.addEventListener('click',()=>openRest(b.dataset.rest)));
    p.querySelector('[data-water-set]')?.addEventListener('click',()=>{const input=p.querySelector('[data-water-input]');if(input?.value==='')return;setWater(Number(input.value));});
    p.querySelectorAll('[data-water-delta]').forEach(b=>b.addEventListener('click',()=>{const current=state.water===null?0:state.water;setWater(current+Number(b.dataset.waterDelta||0));}));
    p.querySelector('[data-reset-rest-test]')?.addEventListener('click',resetPreviewTest);
  }

  function ensureDialog(){const host=document.getElementById('characterPageView')||document.body;let d=document.getElementById('restDialog');if(!d){d=document.createElement('dialog');d.id='restDialog';d.className='rest-dialog';host.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});}return d;}
  function makeDraft(type){const useWater=state.water!==null&&state.water>0;return{attempted:type,useWater,moves:{tend:0,stress:0,armor:0,prepare:0,project:0},targets:{tend:'self',armor:'self'},groupPrepare:false};}
  const effectiveType=()=>draft.useWater?draft.attempted:(draft.attempted==='long'?'short':'none');
  const moveTotal=()=>Object.values(draft.moves).reduce((a,b)=>a+Number(b||0),0);
  function moveDefs(type){
    if(type==='long')return[
      {id:'tend',name:'Tend to All Wounds',copy:'Clear all marked HP. You can do this to an ally instead.',target:true},
      {id:'stress',name:'Clear All Stress',copy:'Clear all marked Stress.'},
      {id:'armor',name:'Repair All Armor',copy:'Clear all marked Armor Slots. You can do this to an ally instead.',target:true},
      {id:'prepare',name:'Prepare',copy:'Gain 1 Hope; if you Prepare with one or more party members, you each gain 2 Hope.',prepare:true},
      {id:'project',name:'Work on a Project',copy:'Establish or continue a project with the GM; the sheet does not invent project progress.'}
    ];
    return[
      {id:'tend',name:'Tend to Wounds',copy:`Clear 1d4 + Tier (${cfg().tier}) HP. You can do this to an ally instead.`,target:true},
      {id:'stress',name:'Clear Stress',copy:`Clear 1d4 + Tier (${cfg().tier}) Stress.`},
      {id:'armor',name:'Repair Armor',copy:`Clear 1d4 + Tier (${cfg().tier}) Armor Slots. You can do this to an ally instead.`,target:true},
      {id:'prepare',name:'Prepare',copy:'Gain 1 Hope; if you Prepare with one or more party members, you each gain 2 Hope.',prepare:true}
    ];
  }
  function moveCard(def){const count=draft.moves[def.id]||0;return `<div class="rest-move-card"><span>DOWNTIME MOVE</span><strong>${esc(def.name)}</strong><p>${esc(def.copy)}</p><div class="rest-move-counter"><button type="button" data-move-delta="-1" data-move="${def.id}" ${count<=0?'disabled':''}>−</button><b>${count}</b><button type="button" data-move-delta="1" data-move="${def.id}" ${moveTotal()>=2?'disabled':''}>+</button></div>${def.target?`<select class="rest-target-select" data-target="${def.id}" ${count?'':'disabled'}><option value="self" ${draft.targets[def.id]==='self'?'selected':''}>Apply to ${cfg().name}</option><option value="ally" ${draft.targets[def.id]==='ally'?'selected':''}>Apply to an ally · show result only</option></select>`:''}${def.prepare?`<div class="rest-move-extra"><label><input type="checkbox" data-group-prepare ${draft.groupPrepare?'checked':''} ${count?'':'disabled'}> Prepare together (+2 Hope instead of +1)</label></div>`:''}</div>`;}
  function ruleCopy(){if(draft.useWater)return`<strong>Spend 1 Water.</strong> ${draft.attempted==='long'?'Use full Long-Rest moves.':'Use normal Short-Rest moves.'}`;if(draft.attempted==='short')return'<strong>No Water:</strong> Short Rest gives no mechanical benefits.';return'<strong>No Water:</strong> Long Rest is reduced to Short-Rest benefits.';}
  function choiceSummary(effective){
    if(effective==='none')return '<div class="rest-choice-summary"><span>THIS REST WILL…</span><strong>No mechanical recovery</strong><small>Short Rest without Water gives no HP, Stress, Armor or Hope recovery.</small></div>';
    const defs=new Map(moveDefs(effective).map(def=>[def.id,def]));
    const effects=[];
    for(const [id,countRaw] of Object.entries(draft.moves)){
      const count=Number(countRaw)||0;if(!count)continue;
      const def=defs.get(id);if(!def)continue;
      const repeat=count>1?` ×${count}`:'';
      if(id==='tend')effects.push(`${effective==='long'?'clear all marked HP':'recover HP'}${repeat}`);
      else if(id==='stress')effects.push(`${effective==='long'?'clear all marked Stress':'recover Stress'}${repeat}`);
      else if(id==='armor')effects.push(`${effective==='long'?'repair all Armor Slots':'repair Armor Slots'}${repeat}`);
      else if(id==='prepare')effects.push(`gain Hope${repeat}`);
      else if(id==='project')effects.push(`work on a project${repeat}`);
    }
    if(!effects.length)return '<div class="rest-choice-summary"><span>THIS REST WILL…</span><strong>Choose two downtime moves</strong><small>A Long Rest does not automatically clear HP or Stress. The selected downtime moves determine recovery.</small></div>';
    const hp=effects.some(text=>/HP/i.test(text)),stress=effects.some(text=>/Stress/i.test(text));
    return `<div class="rest-choice-summary"><span>THIS REST WILL…</span><strong>${effects.map(esc).join(' + ')}</strong><small>${hp?'HP recovery selected.':'HP will not change.'} ${stress?'Stress recovery selected.':'Stress will not change.'}</small></div>`;
  }
  function renderDialog(){
    const d=ensureDialog(),effective=effectiveType(),defs=effective==='none'?[]:moveDefs(effective),available=state.water!==null&&state.water>0;
    d.innerHTML=`<div class="rest-dialog-shell"><div class="rest-dialog-head"><div><span>${draft.attempted.toUpperCase()} REST · GREYWAKE</span><h2>${cfg().name} rests</h2><p>Swap domain cards at the start of the rest if needed, then resolve downtime.</p></div><button class="rest-dialog-close" type="button" data-close>×</button></div>
      <div class="rest-water-choice"><label class="rest-water-option"><input type="radio" name="restWater" value="water" ${draft.useWater?'checked':''} ${available?'':'disabled'}><span><b>Spend 1 Water</b><small>${available?`${state.water} carried · ${state.water-1} after the rest`:'No Water available'}</small></span></label><label class="rest-water-option"><input type="radio" name="restWater" value="none" ${!draft.useWater?'checked':''}><span><b>Rest without Water</b><small>Apply Greywake’s reduced-benefit rule.</small></span></label></div>
      <div class="rest-rule-banner">${ruleCopy()}</div>
      ${effective!=='none'?`<div class="rest-moves-head"><strong>Choose two downtime moves</strong><span>${moveTotal()} / 2 selected · repeats allowed</span></div><div class="rest-moves">${defs.map(moveCard).join('')}</div>`:`<div class="rest-result"><span>NO RECOVERY</span><strong>Short Rest without Water</strong><p>No HP, Stress, Armor or Hope recovery is granted.</p></div>`}
      ${choiceSummary(effective)}
      <button class="rest-complete" type="button" data-complete-rest ${(effective!=='none'&&moveTotal()!==2)?'disabled':''}>Complete ${draft.attempted==='long'?'Long':'Short'} Rest</button><div id="restOutcome"></div></div>`;
    d.querySelector('[data-close]')?.addEventListener('click',()=>d.close());
    d.querySelectorAll('input[name="restWater"]').forEach(r=>r.addEventListener('change',()=>{draft.useWater=r.value==='water';draft.moves={tend:0,stress:0,armor:0,prepare:0,project:0};renderDialog();}));
    d.querySelectorAll('[data-move-delta]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.move,delta=Number(b.dataset.moveDelta||0);const old=draft.moves[id]||0;draft.moves[id]=clamp(old+delta,0,2);if(moveTotal()>2)draft.moves[id]=old;renderDialog();}));
    d.querySelectorAll('[data-target]').forEach(s=>s.addEventListener('change',()=>{draft.targets[s.dataset.target]=s.value;}));
    d.querySelector('[data-group-prepare]')?.addEventListener('change',e=>{draft.groupPrepare=e.target.checked;});
    d.querySelector('[data-complete-rest]')?.addEventListener('click',completeRest);
  }
  function openRest(type){ensureState();if(!state)return;draft=makeDraft(type);const d=ensureDialog();renderDialog();if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');}

  function clearHP(amount,reason){const a=resourceAPI(),r=resources();if(a&&r)a.setResource?.('hp',Math.max(0,r.hp-amount),reason);}
  function clearAllHP(reason){resourceAPI()?.setResource?.('hp',0,reason);}
  function clearStress(amount,reason){const a=resourceAPI(),r=resources();if(a&&r)a.setResource?.('stress',Math.max(0,r.stress-amount),reason);}
  function clearAllStress(reason){resourceAPI()?.setResource?.('stress',0,reason);}
  function gainHope(amount,reason){resourceAPI()?.gainHope?.(amount,reason);}
  function repairArmor(amount){damageAPI()?.repairArmor?.(amount);}
  function repairAllArmor(){damageAPI()?.repairAllArmor?.();}

  function applyShortMoves(lines){
    for(const [id,countRaw] of Object.entries(draft.moves)){
      const count=Number(countRaw)||0;if(!count)continue;
      if(id==='tend'){const rolls=Array.from({length:count},()=>die(4)+cfg().tier),total=rolls.reduce((a,b)=>a+b,0);if(draft.targets.tend==='self'){clearHP(total,'Short Rest · Tend to Wounds');lines.push(`Tend to Wounds: clear up to ${total} HP (${rolls.join(' + ')}).`);}else lines.push(`Tend to Wounds for ally: that ally may clear ${total} HP (${rolls.join(' + ')}).`);}
      if(id==='stress'){const rolls=Array.from({length:count},()=>die(4)+cfg().tier),total=rolls.reduce((a,b)=>a+b,0);clearStress(total,'Short Rest · Clear Stress');lines.push(`Clear Stress: clear up to ${total} Stress (${rolls.join(' + ')}).`);}
      if(id==='armor'){const rolls=Array.from({length:count},()=>die(4)+cfg().tier),total=rolls.reduce((a,b)=>a+b,0);if(draft.targets.armor==='self'){repairArmor(total);lines.push(`Repair Armor: clear up to ${total} Armor Slots (${rolls.join(' + ')}).`);}else lines.push(`Repair Armor for ally: that ally may clear ${total} Armor Slots (${rolls.join(' + ')}).`);}
      if(id==='prepare'){const total=(draft.groupPrepare?2:1)*count;gainHope(total,'Rest · Prepare');lines.push(`Prepare: gain up to ${total} Hope${draft.groupPrepare?' by preparing together':''}.`);}
    }
  }
  function applyLongMoves(lines){
    for(const [id,countRaw] of Object.entries(draft.moves)){
      const count=Number(countRaw)||0;if(!count)continue;
      if(id==='tend'){if(draft.targets.tend==='self'){clearAllHP('Long Rest · Tend to All Wounds');lines.push('Tend to All Wounds: clear all marked HP.');}else lines.push('Tend to All Wounds for ally: that ally may clear all marked HP.');}
      if(id==='stress'){clearAllStress('Long Rest · Clear All Stress');lines.push('Clear All Stress: clear all marked Stress.');}
      if(id==='armor'){if(draft.targets.armor==='self'){repairAllArmor();lines.push('Repair All Armor: clear all marked Armor Slots.');}else lines.push('Repair All Armor for ally: that ally may clear all marked Armor Slots.');}
      if(id==='prepare'){const total=(draft.groupPrepare?2:1)*count;gainHope(total,'Long Rest · Prepare');lines.push(`Prepare: gain up to ${total} Hope${draft.groupPrepare?' by preparing together':''}.`);}
      if(id==='project')lines.push(`Work on a Project${count>1?' ×'+count:''}: continue it with the GM; no project result was invented by the sheet.`);
    }
  }
  function finishEffects(attempted,effective){
    if(activeKey==='odie')window.GreywakeCompanion?.setEffect?.('rogueDodge',false,'Rest ends Rogue’s Dodge');
    if(effective==='long'){const d=damageAPI()?.getState?.();if(d?.status==='unconscious')damageAPI()?.importState?.({...d,status:'active'});}
    window.dispatchEvent(new CustomEvent('greywake:rest-completed',{detail:{character:activeKey,attempted,effective,waterSpent:draft.useWater?1:0}}));
  }
  function completeRest(){
    if(draft.useWater&&!(state.water>0)){
      draft.useWater=false;
      draft.moves={tend:0,stress:0,armor:0,prepare:0,project:0};
      renderDialog();
      const banner=document.querySelector('#restDialog .rest-rule-banner');
      banner?.setAttribute('role','status');
      banner?.scrollIntoView({behavior:'smooth',block:'nearest'});
      return;
    }
    const effective=effectiveType();if(effective!=='none'&&moveTotal()!==2)return;
    const complete=document.querySelector('#restDialog [data-complete-rest]');
    if(complete){complete.disabled=true;complete.setAttribute('aria-busy','true');complete.textContent='Resolving…';}
    const lines=[];
    if(effective==='short')applyShortMoves(lines);else if(effective==='long')applyLongMoves(lines);
    const waterSpent=draft.useWater?1:0;if(waterSpent)state.water=Math.max(0,(state.water||0)-1);
    const fearDie=die(4),fear=draft.attempted==='long'?PARTY_SIZE+fearDie:fearDie;
    const record={attempted:draft.attempted,effective,waterSpent,at:new Date().toISOString(),gmFear:fear};
    commit({water:state.water,lastRest:record,restCounter:state.restCounter+1},`${draft.attempted==='long'?'Long':'Short'} Rest completed`);
    finishEffects(draft.attempted,effective);
    const out=document.getElementById('restOutcome');
    if(out)out.innerHTML=`<div class="rest-result"><span>REST COMPLETE</span><strong>${draft.attempted==='long'?'Long':'Short'} Rest${effective!==draft.attempted?` · ${effective==='short'?'Short-Rest benefits only':'no recovery'}`:''}</strong><p>${waterSpent?`1 Water spent · ${state.water} remains.`:'No Water spent.'} GM Fear: <b>${fear}</b>${draft.attempted==='long'?` (${PARTY_SIZE} PCs + d4 ${fearDie})`:` (d4 ${fearDie})`}.</p>${lines.length?`<ul>${lines.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>No recovery benefits were applied.</p>'}<button type="button" data-finish-rest>Return to sheet</button></div>`;
    if(complete)complete.hidden=true;
    out?.querySelector('[data-finish-rest]')?.addEventListener('click',()=>document.getElementById('restDialog')?.close());
    out?.scrollIntoView({behavior:'smooth',block:'nearest'});
    setTimeout(()=>out?.querySelector('[data-finish-rest]')?.focus({preventScroll:true}),120);
  }

  function resetPreviewTest(){if(!isPreview())return;state={...base()};save();render();}
  function render(){if(!state)return;renderPanel();}
  function init(){const k=key();if(!k){activeKey=null;activeStore=null;state=null;document.getElementById('restPanel')?.remove();return;}load(k);if(!resourceAPI()||!window.GreywakeDamage){setTimeout(init,100);return;}render();}

  window.GreywakeRest={get key(){return activeKey;},getState(){ensureState();return snapshot();},importState,setWater,openShort:()=>openRest('short'),openLong:()=>openRest('long'),render};
  const schedule=()=>setTimeout(init,180);
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('greywake:damage-changed',()=>{if(activeKey)render();});
  document.addEventListener('DOMContentLoaded',schedule);
})();

(() => {
  const CONFIG={
    marek:{name:'Marek',level:1,major:6,severe:12,armor:4,maxHope:6},
    velmira:{name:'Velmira',level:1,major:7,severe:14,armor:3,maxHope:6},
    odie:{name:'Odie',level:1,major:6,severe:12,armor:3,maxHope:6}
  };
  const PREFIX='greywake:damage-state:v2:';
  const VALID_STATUS=['active','death_move','unconscious','blaze_pending','dead','retired'];
  let activeKey=null,activeStore=null,state=null,applyingCap=false,applyingDamage=false,openingDeath=false;

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  const die=sides=>{if(window.crypto?.getRandomValues){const b=new Uint32Array(1);window.crypto.getRandomValues(b);return(b[0]%sides)+1;}return Math.floor(Math.random()*sides)+1;};
  const key=()=>{const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return CONFIG[k]?k:null;};
  const isPreview=()=>document.body.dataset.gmPreview==='true';
  const storeKey=k=>`${PREFIX}${k}${isPreview()?':gmtest':''}`;
  const cfg=()=>activeKey?CONFIG[activeKey]:null;
  const api=()=>activeKey==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const resources=()=>api()?.getState?.()||null;
  const base=()=>({armorMarked:0,scars:0,status:'active',deathMove:null});

  function load(k){
    if(!CONFIG[k])return null;
    const sk=storeKey(k);
    if(activeKey===k&&activeStore===sk&&state)return state;
    activeKey=k;activeStore=sk;
    try{state={...base(),...JSON.parse(localStorage.getItem(sk)||'null')};}catch(_){state=base();}
    state.armorMarked=clamp(state.armorMarked,0,12);
    state.scars=clamp(state.scars,0,CONFIG[k].maxHope);
    if(!VALID_STATUS.includes(state.status))state.status='active';
    return state;
  }
  function ensureState(){const k=key();return k?load(k):null;}
  function save(){if(!state||!activeStore)return;try{localStorage.setItem(activeStore,JSON.stringify(state));}catch(_){}}
  function hopeCap(){return Math.max(0,(cfg()?.maxHope||6)-(state?.scars||0));}
  function snapshot(){if(!state)return null;return{armorMarked:Number(state.armorMarked),scars:Number(state.scars),status:state.status,deathMove:state.deathMove||null,hopeCap:hopeCap()};}
  function emit(reason){window.dispatchEvent(new CustomEvent('greywake:damage-changed',{detail:{key:activeKey,reason,state:snapshot()}}));}
  function commit(next,reason){if(!state)return;Object.assign(state,next);state.armorMarked=clamp(state.armorMarked,0,12);state.scars=clamp(state.scars,0,cfg().maxHope);save();enforceHopeCap();render();emit(reason);}
  function importState(remote){
    if(!remote)return;ensureState();if(!state)return;
    state.armorMarked=clamp(remote.armorMarked??state.armorMarked,0,12);
    state.scars=clamp(remote.scars??state.scars,0,cfg().maxHope);
    if(VALID_STATUS.includes(remote.status))state.status=remote.status;
    state.deathMove=remote.deathMove??state.deathMove;
    save();enforceHopeCap();checkHealth(false);render();
  }

  function enforceHopeCap(){
    if(applyingCap||!state)return;
    const r=resources(),a=api(),cap=hopeCap();if(!r||!a)return;
    if(Number(r.hope)>cap){applyingCap=true;try{a.setResource?.('hope',cap,'Scar reduces Hope capacity');}finally{applyingCap=false;}}
  }
  function statNode(label){return[...document.querySelectorAll('#characterSheet .character-stat')].find(n=>n.querySelector('span')?.textContent.trim().toLowerCase()===label.toLowerCase())||null;}
  function armorScore(){const n=statNode('Armor'),m=String(n?.querySelector('strong')?.textContent||'').match(/\d+/);return m?Number(m[0]):cfg().armor;}
  function freeArmor(){return Math.max(0,armorScore()-state.armorMarked);}
  function severity(amount){const n=Number(amount)||0;if(n<=0)return{name:'No damage',hp:0};if(n>=cfg().severe)return{name:'Severe',hp:3};if(n>=cfg().major)return{name:'Major',hp:2};return{name:'Minor',hp:1};}

  function decorateHope(){
    const r=resources();if(!r||!state)return;const cap=hopeCap();
    const stat=statNode('Hope');if(stat?.querySelector('strong'))stat.querySelector('strong').textContent=`${Math.min(r.hope,cap)} / ${cap}`;
    const row=document.querySelector('#characterSheet .live-resource-hope');const strong=row?.querySelector('.live-resource-copy strong');if(strong)strong.innerHTML=`${Math.min(r.hope,cap)}<small> / ${cap}</small>`;
    [...(row?.querySelectorAll('.live-resource-pip')||[])].forEach((pip,i)=>{const scarred=i>=cap;pip.classList.toggle('scarred-hope-slot',scarred);if(scarred){pip.disabled=true;pip.title='Crossed out by a scar';}});
  }
  function statusCopy(){return({active:['ACTIVE','Able to act normally.'],death_move:['DEATH MOVE','The last Hit Point is marked. Choose a Death Move now.'],unconscious:['UNCONSCIOUS','Cannot move or act and cannot be targeted by attacks until at least 1 HP is cleared or the party completes a long rest.'],blaze_pending:['BLAZE OF GLORY','One final action critically succeeds. Resolve it with the GM, then cross the veil.'],dead:['DEAD','This character has crossed through the veil of death.'],retired:['JOURNEY ENDED','The final Hope slot has been crossed out. This character’s adventuring journey ends.']})[state.status]||['ACTIVE',''];}
  function armorPips(){const score=armorScore(),count=Math.max(cfg().armor,score,state.armorMarked);return Array.from({length:count},(_,i)=>{const locked=i>=score,marked=i<state.armorMarked;return `<button type="button" class="armor-slot ${marked?'marked':''} ${locked?'locked':''}" data-armor-slot="${i+1}" ${locked?'disabled':''} aria-label="Armor slot ${i+1}${marked?' marked':''}"></button>`;}).join('');}

  function ensurePanel(){
    const identity=document.querySelector('#characterSheet .character-sheet-identity');if(!identity)return null;
    let panel=document.getElementById('damageHealthPanel');
    if(!panel){panel=document.createElement('section');panel.id='damageHealthPanel';panel.className='damage-health-panel';const board=identity.querySelector('.pro-resource-board');if(board)board.insertAdjacentElement('afterend',panel);else identity.appendChild(panel);}
    return panel;
  }
  function renderPanel(){
    const panel=ensurePanel();if(!panel||!state)return;const score=armorScore(),status=statusCopy();
    panel.innerHTML=`<div class="damage-health-head"><div><span>DAMAGE & ARMOR</span><strong>Thresholds · Armor Slots · Death</strong><small>${isPreview()?'GM preview · local test · not synced':'Synced with character state'}</small></div><button class="damage-take-button" type="button" data-take-damage ${['dead','retired','death_move'].includes(state.status)?'disabled':''}>Take Damage</button></div>
      <div class="damage-thresholds"><div class="damage-threshold"><span>MINOR · MARK 1 HP</span><strong>&lt; ${cfg().major}</strong><small>anything below Major</small></div><div class="damage-threshold"><span>MAJOR · MARK 2 HP</span><strong>${cfg().major}-${cfg().severe-1}</strong><small>at least Major, below Severe</small></div><div class="damage-threshold severe"><span>SEVERE · MARK 3 HP</span><strong>${cfg().severe}+</strong><small>at or above Severe</small></div></div>
      <div class="armor-track"><div class="armor-track-title"><span>ARMOR SLOTS</span><strong>${state.armorMarked} marked / Armor Score ${score}</strong></div><div class="armor-slot-row">${armorPips()}</div><small>Mark only 1 Armor Slot per incoming attack to reduce severity one step. Minor can become None. Direct Damage cannot use Armor.</small></div>
      <div class="damage-meta-line"><b>${status[0]}</b>${state.scars?`<b class="danger">${state.scars} scar${state.scars===1?'':'s'} · Hope cap ${hopeCap()}</b>`:''}${isPreview()?'<button type="button" class="damage-reset-test" data-reset-damage-test>Reset damage test</button>':''}</div>
      ${state.status!=='active'?`<div class="death-status-banner"><span>${status[0]}</span><strong>${cfg().name}</strong><p>${status[1]}</p>${state.status==='death_move'?'<button type="button" data-open-death>Choose Death Move</button>':''}${state.status==='blaze_pending'?'<button type="button" data-finish-blaze>Final action resolved · Cross the veil</button>':''}</div>`:''}`;
    panel.querySelector('[data-take-damage]')?.addEventListener('click',openDamage);
    panel.querySelector('[data-open-death]')?.addEventListener('click',openDeath);
    panel.querySelector('[data-finish-blaze]')?.addEventListener('click',()=>commit({status:'dead',deathMove:'blaze'},'Blaze of Glory resolved'));
    panel.querySelector('[data-reset-damage-test]')?.addEventListener('click',resetPreviewTest);
    panel.querySelectorAll('[data-armor-slot]').forEach(b=>b.addEventListener('click',()=>{const v=Number(b.dataset.armorSlot),next=state.armorMarked===v?v-1:v;commit({armorMarked:clamp(next,0,armorScore())},'Set Armor Slots');}));
  }

  function ensureDialogs(){
    const host=document.getElementById('characterPageView')||document.body;
    if(!document.getElementById('takeDamageDialog')){const d=document.createElement('dialog');d.id='takeDamageDialog';d.className='damage-dialog';d.innerHTML=`<div class="damage-dialog-shell"><div class="damage-dialog-head"><div><span>INCOMING DAMAGE</span><h2>Take Damage</h2></div><button class="damage-dialog-close" type="button" data-close>×</button></div><div class="damage-entry"><label><span>Damage total</span><input id="incomingDamage" type="number" min="0" max="999" value="1" inputmode="numeric"></label><label><span>Damage type</span><select id="incomingDamageType"><option value="physical">Physical</option><option value="magic">Magic</option></select></label><label class="damage-direct-toggle"><input id="incomingDirect" type="checkbox"><span><b>Direct Damage</b><small>Armor Slots cannot reduce it.</small></span></label></div><div id="damagePreview" class="damage-preview"></div></div>`;host.appendChild(d);d.querySelector('[data-close]').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close();});d.querySelectorAll('input,select').forEach(n=>n.addEventListener('input',renderDamagePreview));}
    if(!document.getElementById('deathMoveDialog')){const d=document.createElement('dialog');d.id='deathMoveDialog';d.className='death-dialog';host.appendChild(d);d.addEventListener('click',e=>{if(e.target===d&&state?.status!=='death_move')d.close();});}
  }
  function openDamage(){ensureState();ensureDialogs();const d=document.getElementById('takeDamageDialog');if(!d)return;renderDamagePreview();if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');}
  function renderDamagePreview(){
    const d=document.getElementById('takeDamageDialog'),host=document.getElementById('damagePreview');if(!d||!host||!state)return;
    const amount=Math.max(0,Number(d.querySelector('#incomingDamage')?.value||0)),direct=Boolean(d.querySelector('#incomingDirect')?.checked),type=d.querySelector('#incomingDamageType')?.value||'physical',sev=severity(amount),reduced=Math.max(0,sev.hp-1),canArmor=!direct&&sev.hp>0&&freeArmor()>0,r=resources(),remaining=r?Math.max(0,r.maxHP-r.hp):0;
    host.innerHTML=`<div class="damage-preview-main"><div><span>${direct?'DIRECT ':''}${type.toUpperCase()} DAMAGE</span><strong>${sev.name}</strong></div><b>${sev.hp} HP</b></div><p>${amount<=0?'Damage reduced to 0 or less: mark no HP.':`${amount} damage against ${cfg().name}’s ${cfg().major}/${cfg().severe} thresholds.`}${sev.hp>=remaining&&remaining>0?' This reaches the last Hit Point and triggers a Death Move.':''}</p><div class="damage-apply-actions"><button class="primary" type="button" data-apply-normal ${sev.hp===0?'disabled':''}>${sev.hp?`Take ${sev.hp} HP`:'No HP to mark'}</button><button type="button" data-apply-armor ${canArmor?'':'disabled'}>${direct?'Direct · Armor unavailable':canArmor?`Mark 1 Armor → Take ${reduced} HP`:'No Armor Slot available'}</button></div>`;
    host.querySelector('[data-apply-normal]')?.addEventListener('click',()=>applyDamage({amount,type,direct,hp:sev.hp,useArmor:false}));
    host.querySelector('[data-apply-armor]')?.addEventListener('click',()=>applyDamage({amount,type,direct,hp:reduced,useArmor:true}));
  }
  function applyDamage({amount,type,direct,hp,useArmor}){
    const a=api(),r=resources();if(!a||!r||!state)return;
    let armorMarked=state.armorMarked;if(useArmor){if(direct||freeArmor()<1)return;armorMarked++;}
    const nextHP=Math.min(r.maxHP,r.hp+Math.max(0,hp)),reached=r.hp<r.maxHP&&nextHP>=r.maxHP;
    applyingDamage=true;
    try{a.setResource?.('hp',nextHP,`${amount} ${direct?'direct ':''}${type} damage`);commit({armorMarked,status:reached?'death_move':state.status,deathMove:reached?null:state.deathMove},`Damage taken · ${amount} ${type}`);}finally{applyingDamage=false;}
    document.getElementById('takeDamageDialog')?.close();if(reached)setTimeout(openDeath,70);
  }

  const deathOptions=()=>`<div class="death-options"><div class="death-option blaze"><strong>Blaze of Glory</strong><p>Take one action that critically succeeds, then cross through the veil of death.</p><button type="button" data-death-choice="blaze">Choose Blaze of Glory</button></div><div class="death-option"><strong>Avoid Death</strong><p>Fall unconscious and worsen the situation. Roll the Hope Die; at level ${cfg().level}, ${cfg().level} or lower causes a scar and permanently crosses out one Hope slot.</p><button type="button" data-death-choice="avoid">Choose Avoid Death</button></div><div class="death-option risk"><strong>Risk It All</strong><p>Roll the Duality Dice. Hope higher: survive and clear HP/Stress equal to the Hope Die. Fear higher: die. Matching dice: clear all HP and Stress.</p><button type="button" data-death-choice="risk">Choose Risk It All</button></div></div>`;
  function openDeath(){if(openingDeath)return;ensureState();ensureDialogs();const d=document.getElementById('deathMoveDialog');if(!d)return;openingDeath=true;d.innerHTML=`<div class="death-dialog-shell"><div class="death-dialog-head"><div><span>LAST HIT POINT MARKED</span><h2>${cfg().name} · Death Move</h2></div></div><p>The Death Move is the player’s choice.</p>${deathOptions()}<div id="deathMoveResult"></div></div>`;d.querySelectorAll('[data-death-choice]').forEach(b=>b.addEventListener('click',()=>chooseDeath(b.dataset.deathChoice)));if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');openingDeath=false;}
  function resultHost(){return document.getElementById('deathMoveResult');}
  function chooseDeath(choice){if(choice==='blaze')chooseBlaze();else if(choice==='avoid')chooseAvoid();else if(choice==='risk')chooseRisk();}
  function chooseBlaze(){commit({status:'blaze_pending',deathMove:'blaze'},'Death Move · Blaze of Glory');const h=resultHost();if(h)h.innerHTML=`<div class="death-result"><strong>Blaze of Glory chosen.</strong><p>Resolve one final action with the GM. It critically succeeds automatically; do not make an action roll. Then use the button on the Damage & Armor panel to cross the veil.</p><button type="button" data-close-death>Return to sheet</button></div>`;h?.querySelector('[data-close-death]')?.addEventListener('click',()=>document.getElementById('deathMoveDialog')?.close());}
  function chooseAvoid(){const roll=die(12),scar=roll<=cfg().level,scars=state.scars+(scar?1:0),status=scars>=cfg().maxHope?'retired':'unconscious';commit({status,deathMove:'avoid',scars},'Death Move · Avoid Death');const h=resultHost();if(h)h.innerHTML=`<div class="death-result"><strong>Avoid Death · Hope Die ${roll}</strong><p>${scar?`The roll is ${cfg().level} or lower: ${cfg().name} gains a scar. One Hope slot is permanently crossed out; Hope capacity is now ${hopeCap()}.`:`No scar. ${cfg().name} remains unconscious until an ally clears at least 1 marked HP or the party completes a long rest.`} The situation worsens regardless; resolve that consequence with the GM.</p><button type="button" data-close-death>Close</button></div>`;h?.querySelector('[data-close-death]')?.addEventListener('click',()=>document.getElementById('deathMoveDialog')?.close());}
  function chooseRisk(){
    const hope=die(12),fear=die(12),h=resultHost(),a=api();if(!h||!a)return;
    if(hope===fear){applyingDamage=true;try{a.setResource?.('hp',0,'Risk It All · critical');a.setResource?.('stress',0,'Risk It All · critical');commit({status:'active',deathMove:'risk_critical'},'Death Move · Risk It All critical');}finally{applyingDamage=false;}h.innerHTML=`<div class="death-result"><strong>Critical · ${hope} / ${fear}</strong><div class="death-dice"><div class="death-die"><span>HOPE</span><b>${hope}</b></div><div class="death-die"><span>FEAR</span><b>${fear}</b></div></div><p>${cfg().name} stays up and clears all Hit Points and Stress.</p><button type="button" data-close-death>Return to sheet</button></div>`;h.querySelector('[data-close-death]').addEventListener('click',()=>document.getElementById('deathMoveDialog')?.close());return;}
    if(fear>hope){commit({status:'dead',deathMove:'risk_fear'},'Death Move · Risk It All with Fear');h.innerHTML=`<div class="death-result"><strong>Fear is higher · ${hope} / ${fear}</strong><div class="death-dice"><div class="death-die"><span>HOPE</span><b>${hope}</b></div><div class="death-die"><span>FEAR</span><b>${fear}</b></div></div><p>${cfg().name} crosses through the veil of death.</p><button type="button" data-close-death>Close</button></div>`;h.querySelector('[data-close-death]').addEventListener('click',()=>document.getElementById('deathMoveDialog')?.close());return;}
    const r=resources(),target=Math.min(hope,(r?.hp||0)+(r?.stress||0)),minHP=Math.max(0,target-(r?.stress||0)),maxHP=Math.min(r?.hp||0,target),opts=[];for(let hpClear=minHP;hpClear<=maxHP;hpClear++)opts.push(`<option value="${hpClear}">Clear ${hpClear} HP · ${target-hpClear} Stress</option>`);h.innerHTML=`<div class="death-result"><strong>Hope is higher · ${hope} / ${fear}</strong><div class="death-dice"><div class="death-die"><span>HOPE</span><b>${hope}</b></div><div class="death-die"><span>FEAR</span><b>${fear}</b></div></div><p>${cfg().name} stays on their feet. Clear ${target} total marked HP/Stress, divided however you choose.</p><div class="risk-allocation"><select data-risk-allocation>${opts.join('')}</select><button type="button" data-apply-risk>Apply recovery</button></div></div>`;h.querySelector('[data-apply-risk]')?.addEventListener('click',()=>{const hpClear=Number(h.querySelector('[data-risk-allocation]')?.value||0),stressClear=target-hpClear,now=resources();applyingDamage=true;try{a.setResource?.('hp',Math.max(0,now.hp-hpClear),'Risk It All recovery');a.setResource?.('stress',Math.max(0,now.stress-stressClear),'Risk It All recovery');commit({status:'active',deathMove:'risk_hope'},'Death Move · Risk It All with Hope');}finally{applyingDamage=false;}document.getElementById('deathMoveDialog')?.close();});
  }

  function checkHealth(open=true){
    if(!state||applyingDamage)return;const r=resources();if(!r)return;
    if(state.status==='unconscious'&&r.hp<r.maxHP){commit({status:'active'},'Recovered consciousness');return;}
    if(state.status==='death_move'&&r.hp<r.maxHP){commit({status:'active',deathMove:null},'Death Move cancelled by HP correction');return;}
    if(state.status==='active'&&r.hp>=r.maxHP){commit({status:'death_move',deathMove:null},'Last Hit Point marked');if(open)setTimeout(openDeath,50);}
  }
  function applyActionLock(){
    const locked=['death_move','unconscious','dead','retired'].includes(state?.status);document.body.classList.toggle('character-incapacitated',locked);
    document.querySelectorAll('#activeActionsPanel button,#activeActionsPanel input,#activeActionsPanel select,#companionActionsPanel button,#companionActionsPanel input,#companionActionsPanel select').forEach(n=>{if(locked){if(!n.disabled)n.dataset.damageDisabled='true';n.disabled=true;}else if(n.dataset.damageDisabled==='true'){n.disabled=false;delete n.dataset.damageDisabled;}});
  }
  function resetPreviewTest(){if(!isPreview())return;state={...base()};save();const a=api();applyingDamage=true;try{a?.setResource?.('hp',0,'Reset GM damage test');}finally{applyingDamage=false;}render();}
  function render(){if(!state)return;renderPanel();decorateHope();applyActionLock();}
  function init(){const k=key();if(!k){activeKey=null;activeStore=null;state=null;document.getElementById('damageHealthPanel')?.remove();return;}load(k);const a=api();if(!a||(activeKey!=='marek'&&window.GreywakeCompanion?.key!==activeKey)){setTimeout(init,100);return;}ensureDialogs();enforceHopeCap();checkHealth();render();}

  window.GreywakeDamage={get key(){return activeKey;},getState(){ensureState();return snapshot();},importState,render,openDamage,openDeath,setArmorMarked:n=>{ensureState();commit({armorMarked:clamp(n,0,12)},'Set Armor Slots');},repairArmor:n=>{ensureState();commit({armorMarked:Math.max(0,state.armorMarked-Math.max(0,Number(n)||0))},'Repair Armor');},repairAllArmor:()=>{ensureState();commit({armorMarked:0},'Repair All Armor');}};
  const schedule=()=>setTimeout(init,150);
  window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);window.addEventListener('hashchange',schedule);
  window.addEventListener('greywake:resources-changed',()=>{if(!applyingCap){enforceHopeCap();checkHealth();render();}});
  window.addEventListener('greywake:companion-resources-changed',()=>{if(!applyingCap){enforceHopeCap();checkHealth();render();}});
  document.addEventListener('click',e=>{if(e.target.closest?.('#chooseBeastform,#changeBeastform,#returnBeastform,[data-beastform-form]'))setTimeout(()=>{if(activeKey==='marek')render();},80);});
  document.addEventListener('DOMContentLoaded',schedule);
})();
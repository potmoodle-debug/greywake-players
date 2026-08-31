(() => {
  const CONFIG = {
    marek:   { name:'Marek',   level:1, major:6, severe:12, armor:4, maxHope:6 },
    velmira: { name:'Velmira', level:1, major:7, severe:14, armor:3, maxHope:6 },
    odie:    { name:'Odie',    level:1, major:6, severe:12, armor:3, maxHope:6 }
  };
  const STORAGE_PREFIX='greywake:damage-state:v1:';
  let activeKey=null,state=null,observer=null,applyingCap=false,openingDeath=false;

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  const die=sides=>{if(window.crypto?.getRandomValues){const b=new Uint32Array(1);window.crypto.getRandomValues(b);return(b[0]%sides)+1;}return Math.floor(Math.random()*sides)+1;};
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[ch]));

  function key(){const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return CONFIG[k]?k:null;}
  function cfg(){return activeKey?CONFIG[activeKey]:null;}
  function isPreview(){return document.body.dataset.gmPreview==='true';}
  function resourceAPI(){return activeKey==='marek'?window.GreywakeResources:window.GreywakeCompanion;}
  function resourceState(){return resourceAPI()?.getState?.()||null;}

  function baseState(){return{armorMarked:0,scars:0,status:'active',deathMove:null,history:[]};}
  function load(k){
    if(!CONFIG[k])return null;
    if(activeKey===k&&state)return state;
    activeKey=k;
    try{state={...baseState(),...JSON.parse(localStorage.getItem(STORAGE_PREFIX+k)||'null')};}catch(_){state=baseState();}
    state.armorMarked=clamp(state.armorMarked,0,12);
    state.scars=clamp(state.scars,0,CONFIG[k].maxHope);
    if(!['active','death_move','unconscious','blaze_pending','dead','retired'].includes(state.status))state.status='active';
    state.history=Array.isArray(state.history)?state.history.slice(-15):[];
    return state;
  }
  function save(){try{localStorage.setItem(STORAGE_PREFIX+activeKey,JSON.stringify(state));}catch(_){}}
  function snapshot(){return state?{armorMarked:Number(state.armorMarked),scars:Number(state.scars),status:state.status,deathMove:state.deathMove||null,hopeCap:hopeCap()}:null;}
  function commit(next,reason,{history=true}={}){
    if(!state)return{ok:false};
    if(history)state.history.push({state:{armorMarked:state.armorMarked,scars:state.scars,status:state.status,deathMove:state.deathMove},reason,at:Date.now()});
    state.history=state.history.slice(-15);
    Object.assign(state,next);
    state.armorMarked=clamp(state.armorMarked,0,12);state.scars=clamp(state.scars,0,cfg().maxHope);
    save();enforceHopeCap();render();
    const detail={ok:true,key:activeKey,reason,state:snapshot()};
    window.dispatchEvent(new CustomEvent('greywake:damage-changed',{detail}));
    return detail;
  }
  function importState(remote){
    if(!state||!remote)return;
    state.armorMarked=clamp(remote.armorMarked??state.armorMarked,0,12);
    state.scars=clamp(remote.scars??state.scars,0,cfg().maxHope);
    if(['active','death_move','unconscious','blaze_pending','dead','retired'].includes(remote.status))state.status=remote.status;
    state.deathMove=remote.deathMove??null;
    save();enforceHopeCap();render();checkHealthState(false);
  }

  function hopeCap(){return Math.max(0,(cfg()?.maxHope||6)-(state?.scars||0));}
  function enforceHopeCap(){
    if(applyingCap)return;
    const api=resourceAPI(),rs=resourceState(),cap=hopeCap();
    if(!api||!rs)return;
    if(Number(rs.hope)>cap){
      applyingCap=true;
      try{api.setResource?.('hope',cap,'Scar reduces Hope capacity');}finally{applyingCap=false;}
    }
  }

  function statNode(label){return[...document.querySelectorAll('#characterSheet .character-stat')].find(n=>n.querySelector('span')?.textContent.trim().toLowerCase()===label.toLowerCase())||null;}
  function currentArmorScore(){const n=statNode('Armor');const m=String(n?.querySelector('strong')?.textContent||'').match(/\d+/);return m?Number(m[0]):cfg().armor;}
  function freeArmor(){return Math.max(0,currentArmorScore()-state.armorMarked);}

  function decorateHope(){
    const cap=hopeCap(),rs=resourceState();if(!rs)return;
    const stat=statNode('Hope');if(stat?.querySelector('strong'))stat.querySelector('strong').textContent=`${Math.min(rs.hope,cap)} / ${cap}`;
    const row=document.querySelector('#characterSheet .live-resource-hope');
    const strong=row?.querySelector('.live-resource-copy strong');
    if(strong)strong.innerHTML=`${Math.min(rs.hope,cap)}<small> / ${cap}</small>`;
    [...(row?.querySelectorAll('.live-resource-pip')||[])].forEach((pip,i)=>{
      const scarred=i>=cap;pip.classList.toggle('scarred-hope-slot',scarred);if(scarred){pip.disabled=true;pip.title='Crossed out by a scar';}
    });
  }

  function severity(amount){
    const n=Number(amount)||0;if(n<=0)return{name:'No damage',hp:0};
    if(n>=cfg().severe)return{name:'Severe',hp:3};
    if(n>=cfg().major)return{name:'Major',hp:2};
    return{name:'Minor',hp:1};
  }

  function armorPips(){
    const score=currentArmorScore();const count=Math.max(cfg().armor,score,state.armorMarked);
    return Array.from({length:count},(_,i)=>{
      const locked=i>=score,marked=i<state.armorMarked;
      return `<button type="button" class="armor-slot ${marked?'marked':''} ${locked?'locked':''}" data-armor-slot="${i+1}" ${locked||isPreview()?'disabled':''} aria-label="Armor slot ${i+1}${marked?' marked':''}"></button>`;
    }).join('');
  }
  function statusCopy(){
    return ({active:['ACTIVE','Able to act normally.'],death_move:['DEATH MOVE','The last Hit Point is marked. Choose a Death Move now.'],unconscious:['UNCONSCIOUS','Avoid Death chosen. Cannot move or act and cannot be targeted by attacks until at least 1 HP is cleared or a long rest finishes.'],blaze_pending:['BLAZE OF GLORY','One final action critically succeeds. Resolve it with the GM, then cross the veil.'],dead:['DEAD','This character has crossed through the veil of death.'],retired:['JOURNEY ENDED','The final Hope slot has been crossed out. This character’s adventuring journey ends.']})[state.status]||['ACTIVE',''];
  }

  function ensurePanel(){
    const identity=document.querySelector('#characterSheet .character-sheet-identity');if(!identity)return null;
    let panel=document.getElementById('damageHealthPanel');
    if(!panel){panel=document.createElement('section');panel.id='damageHealthPanel';panel.className='damage-health-panel';const board=identity.querySelector('.pro-resource-board');if(board)board.insertAdjacentElement('afterend',panel);else identity.appendChild(panel);}
    return panel;
  }
  function renderPanel(){
    const panel=ensurePanel();if(!panel)return;
    const score=currentArmorScore(),status=statusCopy();
    panel.innerHTML=`<div class="damage-health-head"><div><span>DAMAGE & ARMOR</span><strong>Thresholds · Armor Slots · Death</strong><small data-damage-sync-label>${isPreview()?'GM preview · read only':'Live Greywake state'}</small></div><button class="damage-take-button" type="button" data-take-damage ${isPreview()||['dead','retired','death_move'].includes(state.status)?'disabled':''}>Take Damage</button></div>
      <div class="damage-thresholds"><div class="damage-threshold"><span>MINOR · MARK 1 HP</span><strong>&lt; ${cfg().major}</strong><small>anything below Major</small></div><div class="damage-threshold"><span>MAJOR · MARK 2 HP</span><strong>${cfg().major}-${cfg().severe-1}</strong><small>at least Major, below Severe</small></div><div class="damage-threshold severe"><span>SEVERE · MARK 3 HP</span><strong>${cfg().severe}+</strong><small>at or above Severe</small></div></div>
      <div class="armor-track"><div class="armor-track-title"><span>ARMOR SLOTS</span><strong>${state.armorMarked} marked / Armor Score ${score}</strong></div><div class="armor-slot-row">${armorPips()}</div><small>Mark at most 1 Armor Slot per incoming attack to reduce its severity by one threshold. Direct Damage cannot use Armor.</small></div>
      <div class="damage-meta-line"><b>${status[0]}</b>${state.scars?`<b class="danger">${state.scars} scar${state.scars===1?'':'s'} · Hope cap ${hopeCap()}</b>`:''}</div>
      ${state.status!=='active'?`<div class="death-status-banner"><span>${status[0]}</span><strong>${cfg().name}</strong><p>${status[1]}</p>${state.status==='death_move'?'<button type="button" data-open-death>Choose Death Move</button>':''}${state.status==='blaze_pending'?'<button type="button" data-finish-blaze>Final action resolved · Cross the veil</button>':''}</div>`:''}`;
    panel.querySelector('[data-take-damage]')?.addEventListener('click',openDamageDialog);
    panel.querySelector('[data-open-death]')?.addEventListener('click',openDeathDialog);
    panel.querySelector('[data-finish-blaze]')?.addEventListener('click',()=>{if(!isPreview())commit({status:'dead',deathMove:'blaze'},'Blaze of Glory resolved');});
    panel.querySelectorAll('[data-armor-slot]').forEach(b=>b.addEventListener('click',()=>{if(isPreview())return;const v=Number(b.dataset.armorSlot),next=state.armorMarked===v?v-1:v;commit({armorMarked:clamp(next,0,currentArmorScore())},'Set Armor Slots');}));
  }

  function ensureDialogs(){
    const host=document.getElementById('characterPageView')||document.body;
    if(!document.getElementById('takeDamageDialog')){
      const d=document.createElement('dialog');d.id='takeDamageDialog';d.className='damage-dialog';d.innerHTML=`<div class="damage-dialog-shell"><div class="damage-dialog-head"><div><span>INCOMING DAMAGE</span><h2>Take Damage</h2></div><button class="damage-dialog-close" type="button" data-close>×</button></div><div class="damage-entry"><label><span>Damage total</span><input id="incomingDamage" type="number" min="0" max="999" value="1" inputmode="numeric"></label><label><span>Damage type</span><select id="incomingDamageType"><option value="physical">Physical</option><option value="magic">Magic</option></select></label><label class="damage-direct-toggle"><input id="incomingDirect" type="checkbox"><span><b>Direct Damage</b><small>Armor Slots cannot reduce it.</small></span></label></div><div id="damagePreview" class="damage-preview"></div></div>`;host.appendChild(d);d.querySelector('[data-close]').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close();});d.querySelectorAll('input,select').forEach(n=>n.addEventListener('input',renderDamagePreview));
    }
    if(!document.getElementById('deathMoveDialog')){
      const d=document.createElement('dialog');d.id='deathMoveDialog';d.className='death-dialog';host.appendChild(d);d.addEventListener('click',e=>{if(e.target===d&&state.status!=='death_move')d.close();});
    }
  }

  function openDamageDialog(){if(isPreview())return;ensureDialogs();const d=document.getElementById('takeDamageDialog');if(!d)return;renderDamagePreview();if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');}
  function renderDamagePreview(){
    const d=document.getElementById('takeDamageDialog'),host=document.getElementById('damagePreview');if(!d||!host)return;
    const amount=Math.max(0,Number(d.querySelector('#incomingDamage')?.value||0)),direct=Boolean(d.querySelector('#incomingDirect')?.checked),type=d.querySelector('#incomingDamageType')?.value||'physical',sev=severity(amount),reduced=Math.max(0,sev.hp-1),canArmor=!direct&&sev.hp>0&&freeArmor()>0;
    const rs=resourceState(),remaining=rs?Math.max(0,rs.maxHP-rs.hp):0;
    host.innerHTML=`<div class="damage-preview-main"><div><span>${direct?'DIRECT ':''}${type.toUpperCase()} DAMAGE</span><strong>${sev.name}</strong></div><b>${sev.hp} HP</b></div><p>${amount<=0?'Damage reduced to 0 or less: mark no HP.':`${amount} damage against ${cfg().name}’s ${cfg().major}/${cfg().severe} thresholds.`}${sev.hp>remaining&&remaining>=0?' This reaches the last Hit Point and triggers a Death Move.':''}</p><div class="damage-apply-actions"><button class="primary" type="button" data-apply-damage="normal" ${sev.hp===0?'disabled':''}>${sev.hp?`Take ${sev.hp} HP`:'No HP to mark'}</button><button type="button" data-apply-damage="armor" ${canArmor?'':'disabled'}>${direct?'Direct · Armor unavailable':canArmor?`Mark 1 Armor → Take ${reduced} HP`:'No Armor Slot available'}</button></div>`;
    host.querySelector('[data-apply-damage="normal"]')?.addEventListener('click',()=>applyDamage({amount,type,direct,hp:sev.hp,useArmor:false}));
    host.querySelector('[data-apply-damage="armor"]')?.addEventListener('click',()=>applyDamage({amount,type,direct,hp:reduced,useArmor:true}));
  }
  function applyDamage({amount,type,direct,hp,useArmor}){
    if(isPreview())return;const api=resourceAPI(),rs=resourceState();if(!api||!rs)return;
    let armorMarked=state.armorMarked;if(useArmor){if(direct||freeArmor()<1)return;armorMarked++;}
    const nextHP=Math.min(rs.maxHP,rs.hp+Math.max(0,hp));
    api.setResource?.('hp',nextHP,`${amount} ${direct?'direct ':''}${type} damage`);
    const reached=rs.hp<rs.maxHP&&nextHP>=rs.maxHP;
    commit({armorMarked,status:reached?'death_move':state.status,deathMove:reached?null:state.deathMove},`Damage taken · ${amount} ${type}`);
    document.getElementById('takeDamageDialog')?.close();
    if(reached)setTimeout(openDeathDialog,60);
  }

  function deathOptionsMarkup(){return `<div class="death-options"><div class="death-option blaze"><strong>Blaze of Glory</strong><p>Take one action that critically succeeds, then cross through the veil of death.</p><button type="button" data-death-choice="blaze">Choose Blaze of Glory</button></div><div class="death-option"><strong>Avoid Death</strong><p>Fall unconscious. The situation worsens. Roll the Hope Die; at level ${cfg().level}, a ${cfg().level} or lower causes a scar and permanently crosses out one Hope slot.</p><button type="button" data-death-choice="avoid">Choose Avoid Death</button></div><div class="death-option risk"><strong>Risk It All</strong><p>Roll the Duality Dice. Hope higher: survive and clear HP/Stress equal to the Hope Die. Fear higher: die. Matching dice: clear all HP and Stress.</p><button type="button" data-death-choice="risk">Choose Risk It All</button></div></div>`;}
  function openDeathDialog(){
    if(isPreview()||openingDeath)return;ensureDialogs();const d=document.getElementById('deathMoveDialog');if(!d)return;openingDeath=true;
    d.innerHTML=`<div class="death-dialog-shell"><div class="death-dialog-head"><div><span>LAST HIT POINT MARKED</span><h2>${cfg().name} · Death Move</h2></div></div><p>The death move is a player choice. Choose how ${cfg().name} faces this moment.</p>${deathOptionsMarkup()}<div id="deathMoveResult"></div></div>`;
    d.querySelectorAll('[data-death-choice]').forEach(b=>b.addEventListener('click',()=>chooseDeathMove(b.dataset.deathChoice)));
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');openingDeath=false;
  }
  function chooseDeathMove(choice){if(choice==='blaze')chooseBlaze();if(choice==='avoid')chooseAvoid();if(choice==='risk')chooseRisk();}
  function resultHost(){return document.getElementById('deathMoveResult');}
  function chooseBlaze(){
    commit({status:'blaze_pending',deathMove:'blaze'},'Death Move · Blaze of Glory');
    const h=resultHost();if(h)h.innerHTML=`<div class="death-result"><strong>Blaze of Glory chosen.</strong><p>Resolve one final action with the GM. It critically succeeds automatically; do not make an action roll. When it is complete, use the button on the Damage & Armor panel to cross the veil.</p><button type="button" data-close-death>Return to sheet</button></div>`;h?.querySelector('[data-close-death]')?.addEventListener('click',()=>document.getElementById('deathMoveDialog')?.close());
  }
  function chooseAvoid(){
    const roll=die(12),scar=roll<=cfg().level;let scars=state.scars+(scar?1:0),status='unconscious';if(scars>=cfg().maxHope)status='retired';
    commit({status,deathMove:'avoid',scars},'Death Move · Avoid Death');enforceHopeCap();
    const h=resultHost();if(h)h.innerHTML=`<div class="death-result"><strong>Avoid Death · Hope Die ${roll}</strong><p>${scar?`The roll is ${cfg().level} or lower: ${cfg().name} gains a scar and one Hope slot is permanently crossed out. Hope capacity is now ${hopeCap()}.`:`No scar. ${cfg().name} remains unconscious until an ally clears at least 1 marked HP or the party completes a long rest.`} The situation still worsens; resolve that consequence with the GM.</p><button type="button" data-close-death>Close</button></div>`;h?.querySelector('[data-close-death]')?.addEventListener('click',()=>document.getElementById('deathMoveDialog')?.close());
  }
  function chooseRisk(){
    const hope=die(12),fear=die(12),h=resultHost();if(!h)return;
    if(hope===fear){const api=resourceAPI();api.setResource?.('hp',0,'Risk It All · critical');api.setResource?.('stress',0,'Risk It All · critical');commit({status:'active',deathMove:'risk_critical'},'Death Move · Risk It All critical');h.innerHTML=`<div class="death-result"><strong>Critical · ${hope} / ${fear}</strong><div class="death-dice"><div class="death-die"><span>HOPE</span><b>${hope}</b></div><div class="death-die"><span>FEAR</span><b>${fear}</b></div></div><p>${cfg().name} stays up and clears all Hit Points and Stress.</p><button type="button" data-close-death>Return to sheet</button></div>`;h.querySelector('[data-close-death]').addEventListener('click',()=>document.getElementById('deathMoveDialog')?.close());return;}
    if(fear>hope){commit({status:'dead',deathMove:'risk_fear'},'Death Move · Risk It All with Fear');h.innerHTML=`<div class="death-result"><strong>Fear is higher · ${hope} / ${fear}</strong><div class="death-dice"><div class="death-die"><span>HOPE</span><b>${hope}</b></div><div class="death-die"><span>FEAR</span><b>${fear}</b></div></div><p>${cfg().name} crosses through the veil of death.</p><button type="button" data-close-death>Close</button></div>`;h.querySelector('[data-close-death]').addEventListener('click',()=>document.getElementById('deathMoveDialog')?.close());return;}
    const rs=resourceState(),target=Math.min(hope,(rs?.hp||0)+(rs?.stress||0)),minHP=Math.max(0,target-(rs?.stress||0)),maxHP=Math.min(rs?.hp||0,target);const options=[];for(let hpClear=minHP;hpClear<=maxHP;hpClear++){options.push(`<option value="${hpClear}">Clear ${hpClear} HP · ${target-hpClear} Stress</option>`);}h.innerHTML=`<div class="death-result"><strong>Hope is higher · ${hope} / ${fear}</strong><div class="death-dice"><div class="death-die"><span>HOPE</span><b>${hope}</b></div><div class="death-die"><span>FEAR</span><b>${fear}</b></div></div><p>${cfg().name} stays on their feet. Clear ${target} total marked HP/Stress, divided however you choose.</p><div class="risk-allocation"><select data-risk-allocation>${options.join('')}</select><button type="button" data-apply-risk>Apply recovery</button></div></div>`;
    h.querySelector('[data-apply-risk]')?.addEventListener('click',()=>{const hpClear=Number(h.querySelector('[data-risk-allocation]')?.value||0),stressClear=target-hpClear,api=resourceAPI(),now=resourceState();api.setResource?.('hp',Math.max(0,now.hp-hpClear),'Risk It All recovery');api.setResource?.('stress',Math.max(0,now.stress-stressClear),'Risk It All recovery');commit({status:'active',deathMove:'risk_hope'},'Death Move · Risk It All with Hope');document.getElementById('deathMoveDialog')?.close();});
  }

  function checkHealthState(open=true){
    if(!state)return;const rs=resourceState();if(!rs)return;
    if(state.status==='unconscious'&&rs.hp<rs.maxHP){commit({status:'active'},'Recovered consciousness');return;}
    if(state.status==='death_move'&&rs.hp<rs.maxHP){commit({status:'active',deathMove:null},'Death Move cancelled by HP correction');return;}
    if(state.status==='active'&&rs.hp>=rs.maxHP){commit({status:'death_move',deathMove:null},'Last Hit Point marked');if(open&&!isPreview())setTimeout(openDeathDialog,40);}
  }

  function applyConditionLock(){
    const locked=['death_move','unconscious','dead','retired'].includes(state?.status);document.body.classList.toggle('character-incapacitated',locked);document.body.classList.toggle('damage-readonly',isPreview());
    const selector='#activeActionsPanel button,#activeActionsPanel input,#activeActionsPanel select,#companionActionsPanel button,#companionActionsPanel input,#companionActionsPanel select';
    document.querySelectorAll(selector).forEach(n=>{if(locked){if(!n.disabled)n.dataset.damageDisabled='true';n.disabled=true;}else if(n.dataset.damageDisabled==='true'){n.disabled=false;delete n.dataset.damageDisabled;}});
  }
  function render(){if(!activeKey||!state)return;renderPanel();decorateHope();applyConditionLock();}

  function init(){
    const k=key();if(!k){activeKey=null;state=null;observer?.disconnect();return;}
    load(k);const api=resourceAPI();if(!api){setTimeout(init,120);return;}ensureDialogs();enforceHopeCap();render();checkHealthState();
    observer?.disconnect();observer=new MutationObserver(()=>requestAnimationFrame(()=>{if(activeKey){decorateHope();applyConditionLock();if(!document.getElementById('damageHealthPanel'))renderPanel();}}));observer.observe(document.getElementById('characterSheet')||document.body,{childList:true,subtree:true});
  }

  window.GreywakeDamage={get key(){return activeKey;},getState:snapshot,importState,render,openDamage:openDamageDialog,openDeath:openDeathDialog,setArmorMarked:n=>commit({armorMarked:clamp(n,0,12)},'Set Armor Slots'),repairArmor:n=>commit({armorMarked:Math.max(0,state.armorMarked-Math.max(0,Number(n)||0))},'Repair Armor'),repairAllArmor:()=>commit({armorMarked:0},'Repair All Armor')};
  const schedule=()=>setTimeout(init,170);
  window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);window.addEventListener('hashchange',schedule);
  window.addEventListener('greywake:resources-changed',()=>{if(!applyingCap){enforceHopeCap();checkHealthState();render();}});
  window.addEventListener('greywake:companion-resources-changed',()=>{if(!applyingCap){enforceHopeCap();checkHealthState();render();}});
  document.addEventListener('DOMContentLoaded',schedule);
})();
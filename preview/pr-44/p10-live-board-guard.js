(() => {
  const SUPPORTED=['marek','velmira','odie'];
  const NAMES={marek:'Marek',velmira:'Velmira',odie:'Odie'};
  const MAX_WATER=9;
  const COSTS={
    marek:{
      'Nature’s Tongue':['hope',1],'Wall Walk':['hope',1],'Regeneration':['hope',3],
      Evolution:['hope',3],Beastform:['stress',1],Agile:['hope',1],
      'Elusive Prey':['stress',1],'Hobbling Strike':['stress',1]
    },
    velmira:{
      'Tava’s Armor':['hope',1],'Mending Touch':['hope',2],'Not This Time':['hope',3],
      'Nomadic Pack':['hope',1],Startling:['stress',1]
    },
    odie:{
      'Rain of Blades':['hope',1],'Shadow Stepper':['stress',1],'Rogue’s Dodge':['hope',3]
    }
  };
  let rootObserver=null;
  let observedRoot=null;
  let timer=null;
  let repairing=false;

  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const characterKey=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const supported=()=>SUPPORTED.includes(characterKey());
  const isMarek=()=>characterKey()==='marek';
  const resourceAPI=()=>isMarek()?window.GreywakeResources:window.GreywakeCompanion;
  const resources=()=>resourceAPI()?.getState?.()||null;
  const damage=()=>window.GreywakeDamage?.getState?.()||null;
  const rest=()=>window.GreywakeRest?.getState?.()||null;
  const combat=()=>window.GreywakeEquipment?.combatStats?.()||null;
  const water=()=>Math.max(0,Math.min(MAX_WATER,Number(rest()?.water)||0));

  function onCharacterRoute(){
    return location.hash==='#/character' || Boolean(document.querySelector('#characterSheet .character-sheet-shell'));
  }

  function stat(label){
    return [...document.querySelectorAll('#characterSheet .character-stat')]
      .find(node=>node.querySelector('span')?.textContent.trim().toLowerCase()===label.toLowerCase())
      ?.querySelector('strong')?.textContent.trim()||'—';
  }

  function ensurePolish(){
    if(!document.querySelector('link[data-p10-live-polish]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='p10-live-play-polish.css?v=p10polish3';
      link.dataset.p10LivePolish='true';
      document.head.appendChild(link);
    }
    if(document.getElementById('p10-parity-style'))return;
    const style=document.createElement('style');
    style.id='p10-parity-style';
    style.textContent=`
      #characterSheet .live-resource-hope .live-resource-pips,
      #characterSheet .live-resource-stress .live-resource-pips,
      #characterSheet .live-resource-hp .live-resource-pips,
      #characterSheet .live-resource-water .live-resource-pips{display:flex!important;align-items:center;justify-content:center;gap:6px!important}
      #characterSheet .live-resource-hope .live-resource-pip,
      #characterSheet .live-resource-stress .live-resource-pip,
      #characterSheet .live-resource-hp .live-resource-pip,
      #characterSheet .live-resource-water .live-resource-pip{width:22px!important;min-width:22px!important;height:22px!important;flex:0 0 22px!important;aspect-ratio:1/1}
      #traitRollPanel .trait-roll-dice-mark.p10-evasion-mark{min-width:92px;display:flex;align-items:center;justify-content:center;gap:8px;padding:7px 11px;border:1px solid rgba(190,170,111,.28);background:rgba(255,255,255,.02);color:#d9d0b8}
      #traitRollPanel .trait-roll-dice-mark.p10-evasion-mark span{font-size:.58rem;letter-spacing:.14em;color:#948c78;font-weight:800}
      #traitRollPanel .trait-roll-dice-mark.p10-evasion-mark strong{font:700 1.15rem/1 Georgia,serif;color:#f0e6c8}
      #characterSheet .character-sheet-subtitle{display:none!important}
      #characterSheet .character-sheet-identity{padding:1.35rem 1.5rem 1.05rem 1.35rem!important}
      #characterSheet .character-sheet-identity h2{margin:.05rem 0 .22rem!important;font-size:clamp(2.7rem,5vw,4.6rem)!important}
      #characterSheet .pro-identity-ribbon{margin:.45rem 0 .05rem!important}
      #traitRollPanel{margin-top:.65rem!important;padding:.75rem!important}
      #traitRollPanel .trait-roll-buttons{margin-top:.55rem!important;gap:.38rem!important}
      #traitRollPanel .trait-roll-buttons button{min-height:48px!important;padding:.42rem .35rem!important}
      #traitRollPanel .trait-roll-options{margin-top:.48rem!important;padding-top:.4rem!important}
      #characterSheet .live-resource-board{margin-top:.6rem!important;padding:10px!important;gap:8px!important}
      #characterSheet .live-resource-row{padding:8px 9px!important;gap:6px!important}
      #characterSheet .p10-field-actions{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:7px!important;padding-top:8px!important}
      #characterSheet .p10-field-action{min-height:44px!important;padding-top:8px!important;padding-bottom:8px!important}
      #characterSheet .p10-actions-button{border-color:rgba(103,117,149,.5);background:linear-gradient(180deg,#283044,#1b2030);color:#d7e0f4}
      #characterSheet .p10-actions-button::before{content:'✦'}
      #characterSheet .live-resource-board .pro-board-title{display:flex!important;align-items:center!important;gap:10px!important}
      #characterSheet .p10-rest-utility{margin-left:auto;display:flex;align-items:center;gap:6px}
      #characterSheet .p10-rest-utility button{min-height:30px;padding:5px 9px;border:1px solid rgba(100,125,139,.38);background:linear-gradient(180deg,#242d32,#171d21);color:#ccd9df;font-size:.64rem;font-weight:800;letter-spacing:.035em;cursor:pointer}
      #characterSheet .p10-rest-utility button:hover{border-color:rgba(139,167,181,.7);background:linear-gradient(180deg,#2d3a40,#1c262b)}
      #characterSheet .p10-rest-utility button span{display:inline-block;margin-right:5px;font-size:.82rem}
      #characterPageView .p10-sticky{position:sticky;top:0;z-index:35;display:flex;gap:10px;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid rgba(196,173,101,.3);background:rgba(17,17,13,.95);backdrop-filter:blur(10px);box-shadow:0 8px 22px rgba(0,0,0,.22);margin:0 0 10px}
      #characterPageView .p10-sticky strong{color:#f2dfaa}
      #characterPageView .p10-sticky-data{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      #characterPageView .p10-sticky-data span{font-size:10px;color:#c2b99f}
      #characterPageView .p10-sticky-data b{color:#fff0be}
      .p10-can-do-dialog{max-width:760px;width:min(94vw,760px);border:1px solid #79683c;background:#11110d;color:#e8dec2;padding:0}
      .p10-can-do-shell{padding:18px}.p10-can-do-list{display:grid;gap:8px;margin-top:14px}
      .p10-can-do-item{display:block;width:100%;text-align:left;border:1px solid #4f4935;background:#1b1912;padding:10px;color:inherit;cursor:pointer}
      .p10-can-do-item:hover,.p10-can-do-item:focus-visible{border-color:#9f874e;background:#272218}
      .p10-can-do-item span{font-size:8px;letter-spacing:.1em;color:#aa9d79}.p10-can-do-item strong{display:block;color:#f2dfaa;margin:3px 0}.p10-can-do-item small{display:block;color:#aaa18b}
      .p10-action-chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}.p10-action-chip{display:inline-flex;border:1px solid rgba(189,164,90,.32);padding:3px 6px;font-size:8px;letter-spacing:.06em;color:#d3c391;background:#242016}
      .p10-action-card-unavailable{opacity:.58}.p10-action-card-unavailable::after{content:'RESOURCE UNAVAILABLE';font-size:7px;letter-spacing:.09em;color:#cf8a74}
      .p10-parity-flash{outline:2px solid rgba(197,176,108,.7);outline-offset:4px;animation:p10ParityFlash 1.1s ease-out}
      @keyframes p10ParityFlash{from{outline-color:#f2dfaa}to{outline-color:transparent}}
      #damageHealthPanel,#readyGearPanel,#restPanel{display:none!important}
      #playDashboard .play-dashboard-rest{display:none!important}
      @media(max-width:950px){#characterSheet .p10-field-actions{grid-template-columns:repeat(2,1fr)!important}}
      @media(max-width:700px){#characterSheet .live-resource-hope .live-resource-pip,#characterSheet .live-resource-stress .live-resource-pip,#characterSheet .live-resource-hp .live-resource-pip,#characterSheet .live-resource-water .live-resource-pip{width:20px!important;min-width:20px!important;height:20px!important;flex-basis:20px!important}#characterSheet .live-resource-board .pro-board-title{align-items:flex-start!important;flex-wrap:wrap}#characterSheet .p10-rest-utility{width:100%;margin-left:0}#characterSheet .p10-rest-utility button{flex:1}#characterPageView .p10-sticky{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  function currentEvasion(){
    const live=combat()?.evasion;
    if(live!==undefined&&live!==null)return live;
    return stat('Evasion');
  }

  function ensureEvasionReadout(){
    const mark=document.querySelector('#traitRollPanel .trait-roll-dice-mark');
    if(!mark)return;
    const value=String(currentEvasion());
    if(mark.classList.contains('p10-evasion-mark')&&mark.dataset.evasion===value)return;
    mark.classList.add('p10-evasion-mark');
    mark.dataset.evasion=value;
    mark.removeAttribute('aria-hidden');
    mark.setAttribute('aria-label',`Evasion ${value}`);
    mark.innerHTML=`<span>EVASION</span><strong>${esc(value)}</strong>`;
  }

  function ensureRestButtons(){
    document.querySelectorAll('#characterSheet .p10-field-actions [data-p10-short-rest],#characterSheet .p10-field-actions [data-p10-long-rest]').forEach(node=>node.remove());
    const title=document.querySelector('#characterSheet .live-resource-board .pro-board-title');
    if(!title)return;
    let host=title.querySelector('.p10-rest-utility');
    if(!host){
      host=document.createElement('div');
      host.className='p10-rest-utility';
      host.setAttribute('aria-label','Rest controls');
      host.innerHTML=`<button type="button" data-p10-short-rest><span aria-hidden="true">◐</span>Short Rest</button><button type="button" data-p10-long-rest><span aria-hidden="true">☾</span>Long Rest</button>`;
      host.querySelector('[data-p10-short-rest]')?.addEventListener('click',()=>window.GreywakeRest?.openShort?.());
      host.querySelector('[data-p10-long-rest]')?.addEventListener('click',()=>window.GreywakeRest?.openLong?.());
      title.appendChild(host);
    }
  }

  function ensureSticky(){
    const view=document.getElementById('characterPageView'),sheet=document.getElementById('characterSheet');
    if(!view||!sheet||!supported())return;
    let bar=document.getElementById('p10StickyVitals');
    if(!bar){bar=document.createElement('div');bar.id='p10StickyVitals';bar.className='p10-sticky';sheet.insertAdjacentElement('beforebegin',bar);}
    const r=resources(),c=combat(),d=damage();
    if(!r)return;
    const signature=JSON.stringify([characterKey(),c?.evasion??stat('Evasion'),c?.armorScore??stat('Armor'),r.hp,r.maxHP,r.stress,r.maxStress,r.hope,r.maxHope,Number(d?.armorMarked||0),water()]);
    if(bar.dataset.signature===signature)return;
    bar.dataset.signature=signature;
    bar.innerHTML=`<strong>${esc(NAMES[characterKey()]||'Character')} · L1</strong><div class="p10-sticky-data"><span>Evasion <b>${esc(c?.evasion??stat('Evasion'))}</b></span><span>Armor <b>${esc(c?.armorScore??stat('Armor'))}</b></span><span>HP <b>${r.hp}/${r.maxHP}</b></span><span>Stress <b>${r.stress}/${r.maxStress}</b></span><span>Hope <b>${r.hope}/${r.maxHope}</b></span><span>Armor Slots <b>${Number(d?.armorMarked||0)}/${esc(c?.armorScore??stat('Armor'))}</b></span><span>Water <b>${water()}/${MAX_WATER}</b></span></div>`;
  }

  function setWater(value){window.GreywakeRest?.setWater?.(Math.max(0,Math.min(MAX_WATER,Number(value)||0)));}
  function setArmor(value){const score=Math.max(0,Number(combat()?.armorScore||stat('Armor'))||0);window.GreywakeDamage?.setArmorMarked?.(Math.max(0,Math.min(score,Number(value)||0)));}
  const waterPips=current=>Array.from({length:MAX_WATER},(_,i)=>`<button type="button" class="live-resource-pip ${i<current?'filled':''}" data-p10-water-value="${i+1}" aria-label="Set Water to ${i+1}" aria-pressed="${i<current?'true':'false'}"></button>`).join('');
  const armorPips=(current,max)=>Array.from({length:max},(_,i)=>`<button type="button" class="live-resource-pip ${i<current?'filled':''}" data-p10-armor-value="${i+1}" aria-label="Armor slot ${i+1}${i<current?' marked':''}" aria-pressed="${i<current?'true':'false'}"></button>`).join('');

  function ensureCompanionRows(){
    if(isMarek())return;
    const board=document.querySelector('#characterSheet .live-resource-board');if(!board)return;
    const currentWater=water();
    let waterRow=board.querySelector('.live-resource-water');
    if(!waterRow){waterRow=document.createElement('div');waterRow.className='live-resource-row live-resource-water';const foot=board.querySelector('.live-resource-foot');foot?foot.insertAdjacentElement('beforebegin',waterRow):board.appendChild(waterRow);}
    const waterSig=String(currentWater);
    if(waterRow.dataset.signature!==waterSig){
      waterRow.dataset.signature=waterSig;
      waterRow.innerHTML=`<div class="live-resource-copy"><span>Water</span><strong>${currentWater}<small> / ${MAX_WATER}</small></strong><em>carried · 1 spent per Short or Long Rest</em></div><div class="live-resource-controls"><button type="button" data-p10-water-delta="-1" ${currentWater<=0?'disabled':''}>−</button><div class="live-resource-pips">${waterPips(currentWater)}</div><button type="button" data-p10-water-delta="1" ${currentWater>=MAX_WATER?'disabled':''}>+</button></div>`;
      waterRow.querySelectorAll('[data-p10-water-delta]').forEach(b=>b.addEventListener('click',()=>setWater(currentWater+Number(b.dataset.p10WaterDelta||0))));
      waterRow.querySelectorAll('[data-p10-water-value]').forEach(b=>b.addEventListener('click',()=>{const v=Number(b.dataset.p10WaterValue||0);setWater(currentWater===v?v-1:v);}));
    }
    const d=damage(),score=Math.max(0,Number(combat()?.armorScore||stat('Armor'))||0),marked=Math.max(0,Math.min(score,Number(d?.armorMarked)||0));
    let armorRow=board.querySelector('.live-resource-armor');
    if(!armorRow){armorRow=document.createElement('div');armorRow.className='live-resource-row live-resource-armor';waterRow.insertAdjacentElement('beforebegin',armorRow);}
    const armorSig=`${marked}/${score}`;
    if(armorRow.dataset.signature!==armorSig){
      armorRow.dataset.signature=armorSig;
      armorRow.innerHTML=`<div class="live-resource-copy"><span>Armor Slots</span><strong>${marked}<small> / ${score}</small></strong><em>marked · click a shield to set marked slots</em></div><div class="live-resource-controls"><div class="live-resource-pips">${armorPips(marked,score)}</div></div>`;
      armorRow.querySelectorAll('[data-p10-armor-value]').forEach(b=>b.addEventListener('click',()=>{const v=Number(b.dataset.p10ArmorValue||0);setArmor(marked===v?v-1:v);}));
    }
  }

  function actionPanel(){return document.getElementById(isMarek()?'activeActionsPanel':'companionActionsPanel');}
  function titleOf(card){return card.querySelector('.active-action-copy strong')?.textContent.trim()||'';}
  function inferredCost(card){
    const known=COSTS[characterKey()]?.[titleOf(card)];if(known)return{resource:known[0],amount:known[1]};
    const text=card.textContent||'';
    let m=text.match(/spend\s+(\d+)\s+Hope/i);if(m)return{resource:'hope',amount:Number(m[1])};
    m=text.match(/mark\s+(\d+)\s+Stress/i);if(m)return{resource:'stress',amount:Number(m[1])};
    return null;
  }
  function affordable(card){
    if(card.disabled||card.classList.contains('equipment-action-disabled')||card.classList.contains('domain-card-vaulted'))return false;
    const cost=inferredCost(card),r=resources();if(!cost||!r)return true;
    return cost.resource==='hope'?Number(r.hope)>=cost.amount:(Number(r.maxStress)-Number(r.stress))>=cost.amount;
  }

  function enhanceCompanionActions(){
    if(isMarek())return;
    const panel=actionPanel();if(!panel)return;
    panel.querySelectorAll('.active-action-card').forEach(card=>{
      const meta=card.querySelector('em')?.textContent.trim()||'';
      const chips=meta.split(' · ').map(x=>x.trim()).filter(Boolean).slice(0,3);
      const cost=inferredCost(card);if(cost&&!chips.some(x=>new RegExp(cost.resource,'i').test(x)))chips.push(`${cost.amount} ${cost.resource==='hope'?'Hope':'Stress'}`);
      let host=card.querySelector('.p10-action-chips');
      const sig=chips.join('|');
      if(!host){host=document.createElement('span');host.className='p10-action-chips';card.querySelector('.active-action-copy')?.appendChild(host);}
      if(host.dataset.signature!==sig){host.dataset.signature=sig;host.innerHTML=chips.map(x=>`<span class="p10-action-chip">${esc(x)}</span>`).join('');}
      card.classList.toggle('p10-action-card-unavailable',!affordable(card));
    });
  }

  function ensureCanDoDialog(){
    let d=document.getElementById('p10CompanionCanDoDialog');
    if(!d){d=document.createElement('dialog');d.id='p10CompanionCanDoDialog';d.className='p10-can-do-dialog';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});}
    return d;
  }

  function openCompanionAction(title){
    const panel=actionPanel(),target=[...(panel?.querySelectorAll('.active-action-card')||[])].find(card=>titleOf(card)===title);if(!panel||!target)return;
    const already=target.classList.contains('selected')&&panel.querySelector('.active-action-detail h3')?.textContent.trim()===title;
    if(!already)target.click();
    setTimeout(()=>{
      const detail=panel.querySelector('.active-action-detail');if(!detail)return;
      detail.classList.add('p10-parity-flash');
      detail.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
      setTimeout(()=>detail.classList.remove('p10-parity-flash'),1200);
    },60);
  }

  function openCompanionCanDo(){
    const panel=actionPanel(),d=ensureCanDoDialog();if(!panel)return;
    const cards=[...panel.querySelectorAll('.active-action-card')].filter(affordable);
    d.innerHTML=`<div class="p10-can-do-shell"><div class="equip-dialog-head"><div><span>AVAILABLE RIGHT NOW</span><h2>What can ${esc(NAMES[characterKey()]||'this character')} do?</h2><p>Current equipped gear, active domain cards and live resources only. Select an action to jump straight to its real sheet controls.</p></div><button type="button" data-close>×</button></div><div class="p10-can-do-list">${cards.map(card=>{const title=titleOf(card),meta=card.querySelector('em')?.textContent.trim()||'';return `<button type="button" class="p10-can-do-item" data-p10-companion-action="${esc(title)}"><span>${card.classList.contains('active-action-attack')?'ATTACK':'ABILITY'}</span><strong>${esc(title)}</strong>${meta?`<small>${esc(meta)}</small>`:''}</button>`;}).join('')||'<div class="p10-can-do-item"><strong>No actions currently available.</strong></div>'}</div></div>`;
    d.querySelector('[data-close]')?.addEventListener('click',()=>d.close());
    d.querySelectorAll('[data-p10-companion-action]').forEach(button=>button.addEventListener('click',()=>{const title=button.dataset.p10CompanionAction;d.close();openCompanionAction(title);}));
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
  }

  function openCanDo(){
    if(isMarek())return window.GreywakeLivePlayUsability?.openCanDo?.();
    openCompanionCanDo();
  }

  function ensureCompanionFieldActions(){
    if(isMarek())return;
    const board=document.querySelector('#characterSheet .live-resource-board');if(!board)return;
    let host=board.querySelector('.p10-field-actions');
    if(!host){host=document.createElement('div');host.className='p10-field-actions';board.appendChild(host);}
    if(host.dataset.character===characterKey())return;
    host.dataset.character=characterKey();
    host.innerHTML=`<button type="button" class="p10-field-action p10-damage-button" data-p10-take-damage>Take Damage</button><button type="button" class="p10-field-action p10-can-do-field" data-p10-can-do>What can I do?</button><button type="button" class="p10-field-action p10-backpack-button" data-p10-backpack>Backpack</button><button type="button" class="p10-field-action p10-actions-button" data-p10-actions>Actions</button>`;
    host.querySelector('[data-p10-take-damage]')?.addEventListener('click',()=>window.GreywakeDamage?.openDamage?.());
    host.querySelector('[data-p10-can-do]')?.addEventListener('click',openCanDo);
    host.querySelector('[data-p10-backpack]')?.addEventListener('click',()=>window.GreywakeBackpack?.open?.());
    host.querySelector('[data-p10-actions]')?.addEventListener('click',()=>{const panel=actionPanel();panel?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});panel?.querySelector('.active-action-card')?.focus?.({preventScroll:true});});
  }

  function enforceWaterCap(){if(Number(rest()?.water)>MAX_WATER)setWater(MAX_WATER);}
  function simplifyLowerPanels(){for(const id of ['damageHealthPanel','readyGearPanel','restPanel'])document.getElementById(id)?.setAttribute('aria-hidden','true');}

  function needsRepair(){
    const board=document.querySelector('#characterSheet .live-resource-board');if(!board)return true;
    const common=!board.querySelector('.live-resource-water')||!board.querySelector('.live-resource-armor')||!board.querySelector('.p10-field-actions')||!board.querySelector('[data-p10-backpack]');
    if(common)return true;
    if(isMarek())return !board.querySelector('[data-p10-beastform]');
    return !board.querySelector('[data-p10-can-do]')||!board.querySelector('[data-p10-actions]');
  }

  function repair(){
    if(repairing||!supported()||!onCharacterRoute())return;
    const shell=document.querySelector('#characterSheet .character-sheet-shell');if(!shell)return;
    repairing=true;
    try{
      ensurePolish();
      enforceWaterCap();
      if(isMarek())window.GreywakeLivePlayUsability?.refresh?.();
      else{
        ensureCompanionRows();
        ensureCompanionFieldActions();
        enhanceCompanionActions();
      }
      ensureEvasionReadout();
      ensureRestButtons();
      ensureSticky();
      simplifyLowerPanels();
    }finally{setTimeout(()=>{repairing=false;},25);}
  }

  function verify(){
    if(!supported()||!onCharacterRoute())return;
    ensurePolish();
    if(needsRepair())repair();
    else{
      enforceWaterCap();
      if(!isMarek())enhanceCompanionActions();
      ensureEvasionReadout();
      ensureRestButtons();
      ensureSticky();
      simplifyLowerPanels();
    }
  }

  function watchRoot(){
    if(!supported()||!onCharacterRoute())return;
    ensurePolish();
    const root=document.getElementById('characterSheet');
    if(!root){timer=setTimeout(watchRoot,120);return;}
    if(root!==observedRoot){
      rootObserver?.disconnect();
      observedRoot=root;
      rootObserver=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(verify,35);});
      rootObserver.observe(root,{childList:true,subtree:true});
    }
    verify();
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(watchRoot,60);}

  for(const event of [
    'greywake:player-ready','greywake:sheet-enhanced','greywake:resources-changed',
    'greywake:companion-resources-changed','greywake:damage-changed','greywake:rest-state-changed',
    'greywake:equipment-state-changed','greywake:beastform-changed','greywake:domain-state-changed'
  ])window.addEventListener(event,schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);

  window.GreywakeLivePlayParity={refresh:verify,openCanDo,openCompanionCanDo};
  setTimeout(schedule,150);setTimeout(schedule,500);setTimeout(schedule,1200);setTimeout(schedule,2500);
})();

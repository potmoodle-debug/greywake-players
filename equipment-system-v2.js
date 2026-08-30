(() => {
  const CONFIG={
    marek:{
      name:'Marek',
      armor:{id:'gambeson',name:'Gambeson Armor',meta:'Armor Score 3 · Round Shield raises humanoid Armor to 4'},
      weapons:{
        'shortstaff':{name:'Shortstaff',slot:'primary',burden:1,meta:'Instinct · Close · 1d8+1 magic',actions:['Shortstaff']},
        'round-shield':{name:'Round Shield',slot:'secondary',burden:1,meta:'Strength · Melee · 1d4 physical · Protective +1 Armor',actions:['Round Shield']}
      },
      gear:['Torch','50 ft Rope','Basic Supplies','Small Bag of Rocks and Bones'],
      consumables:{'minor-stamina':{name:'Minor Stamina Potion',effect:'Clear 1d4 Stress',kind:'stress'}},
      base:{activePrimary:'shortstaff',activeSecondary:'round-shield',activeArmor:'gambeson',inventoryWeapons:[],consumables:{'minor-stamina':1}}
    },
    velmira:{
      name:'Velmira',
      armor:{id:'leather-armor',name:'Leather Armor',meta:'Armor Score 3 · thresholds 7 / 14 at level 1'},
      weapons:{
        'greatstaff':{name:'Greatstaff',slot:'primary',burden:2,meta:'Knowledge · Very Far · 1d6 magic · Powerful',actions:['Greatstaff']},
        'whip':{name:'Whip',slot:'secondary',burden:1,meta:'Presence · Very Close · 1d6 physical · Startling',actions:['Whip','Startling']}
      },
      gear:['Torch','50 ft Rope','Basic Supplies','Nomadic Pack','Book being translated','Leather Satchel'],
      consumables:{'minor-stamina':{name:'Minor Stamina Potion',effect:'Clear 1d4 Stress',kind:'stress'}},
      base:{activePrimary:'greatstaff',activeSecondary:null,activeArmor:'leather-armor',inventoryWeapons:['whip'],consumables:{'minor-stamina':1}}
    },
    odie:{
      name:'Odie',
      armor:{id:'gambeson',name:'Gambeson Armor',meta:'Armor Score 3 · thresholds 6 / 12 at level 1'},
      weapons:{
        'spear':{name:'Spear',slot:'primary',burden:2,meta:'Finesse · Very Close · 1d8+3 physical',actions:['Spear']},
        'small-dagger':{name:'Small Dagger',slot:'secondary',burden:1,meta:'Finesse · Melee · 1d8 physical · Paired',actions:['Small Dagger']}
      },
      gear:['Torch','50 ft Rope','Basic Supplies','Grappling Hook','Salvage-built Prosthetic Arm','Oldwork Finger · separate and unfitted'],
      consumables:{'minor-health':{name:'Minor Health Potion',effect:'Clear 1d4 HP',kind:'hp'}},
      base:{activePrimary:'spear',activeSecondary:null,activeArmor:'gambeson',inventoryWeapons:['small-dagger'],consumables:{'minor-health':1}}
    }
  };

  const PREFIX='greywake:equipment-state:v2:';
  let activeKey=null,activeStore=null,state=null,lastConsumableResult='',lastNotice='';
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const die=sides=>{if(window.crypto?.getRandomValues){const b=new Uint32Array(1);window.crypto.getRandomValues(b);return(b[0]%sides)+1;}return Math.floor(Math.random()*sides)+1;};
  const key=()=>{const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return CONFIG[k]?k:null;};
  const isPreview=()=>document.body.dataset.gmPreview==='true';
  const cfg=()=>activeKey?CONFIG[activeKey]:null;
  const storeKey=k=>`${PREFIX}${k}${isPreview()?':gmtest':''}`;
  const resourceAPI=()=>activeKey==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const resources=()=>resourceAPI()?.getState?.()||null;
  const weapon=id=>cfg()?.weapons?.[id]||null;
  const clone=value=>JSON.parse(JSON.stringify(value));

  function normalise(raw){
    const c=cfg();if(!c)return null;
    const base=clone(c.base),ids=new Set(Object.keys(c.weapons));
    let primary=ids.has(raw?.activePrimary)?raw.activePrimary:base.activePrimary;
    let secondary=ids.has(raw?.activeSecondary)?raw.activeSecondary:base.activeSecondary;
    if(primary&&weapon(primary)?.slot!=='primary')primary=null;
    if(secondary&&weapon(secondary)?.slot!=='secondary')secondary=null;
    if(primary&&weapon(primary)?.burden===2)secondary=null;
    const inventory=[];
    const wanted=[...(Array.isArray(raw?.inventoryWeapons)?raw.inventoryWeapons:base.inventoryWeapons),...ids];
    wanted.forEach(id=>{if(ids.has(id)&&id!==primary&&id!==secondary&&!inventory.includes(id))inventory.push(id);});
    const consumables={};
    Object.keys(c.consumables).forEach(id=>{consumables[id]=Math.max(0,Math.min(9,Number(raw?.consumables?.[id]??base.consumables[id]??0)||0));});
    return{activePrimary:primary||null,activeSecondary:secondary||null,activeArmor:c.armor.id,inventoryWeapons:inventory,consumables};
  }

  function load(k){
    const sk=storeKey(k);if(activeKey===k&&activeStore===sk&&state)return state;
    activeKey=k;activeStore=sk;let saved=null;
    try{saved=JSON.parse(localStorage.getItem(sk)||'null');}catch(_){saved=null;}
    state=normalise(saved||CONFIG[k].base);save();return state;
  }
  function ensureState(){const k=key();return k?load(k):null;}
  function save(){if(!state||!activeStore)return;try{localStorage.setItem(activeStore,JSON.stringify(state));}catch(_){}}
  function snapshot(){return state?{activePrimary:state.activePrimary||null,activeSecondary:state.activeSecondary||null,activeArmor:state.activeArmor||null,inventoryWeapons:[...state.inventoryWeapons],consumables:{...state.consumables}}:null;}
  function emit(reason){window.dispatchEvent(new CustomEvent('greywake:equipment-state-changed',{detail:{ok:true,key:activeKey,reason,state:snapshot()}}));}
  function commit(next,reason){if(!state)return{ok:false};state=normalise({...state,...next});save();render();emit(reason);return{ok:true,state:snapshot()};}
  function importState(remote){ensureState();if(!state||!remote)return;state=normalise(remote);save();render();}

  function setNotice(text){lastNotice=String(text||'');renderManager();renderReady();}
  function isRestOpen(){return Boolean(document.getElementById('restDialog')?.open);}
  function markStress(reason){
    const api=resourceAPI(),rs=resources();if(!api||!rs)return{ok:false,message:'Live Stress track unavailable.'};
    const free=Number(rs.maxStress)-Number(rs.stress);
    if(free<1)return{ok:false,message:`${cfg().name} has no free Stress slot to switch weapons under pressure.`};
    const result=api.markStress?.(1,{reason,cost:true});
    return result?.ok===false?{ok:false,message:result.message||'Could not mark Stress.'}:{ok:true};
  }

  function equip(id,{danger=false}={}){
    ensureState();if(!state||!state.inventoryWeapons.includes(id))return{ok:false};
    const w=weapon(id);if(!w)return{ok:false};
    if(danger&&!isRestOpen()){
      const paid=markStress(`Switch weapon · ${w.name}`);
      if(!paid.ok){setNotice(paid.message);return paid;}
    }
    let primary=state.activePrimary,secondary=state.activeSecondary,inventory=state.inventoryWeapons.filter(x=>x!==id);
    if(w.slot==='primary'){
      if(primary)inventory.push(primary);
      primary=id;
      if(w.burden===2&&secondary){inventory.push(secondary);secondary=null;}
    }else{
      if(secondary)inventory.push(secondary);
      secondary=id;
      if(primary&&weapon(primary)?.burden===2){inventory.push(primary);primary=null;}
    }
    lastNotice=`Equipped ${w.name}${danger&&!isRestOpen()?' · marked 1 Stress':''}.`;
    const result=commit({activePrimary:primary,activeSecondary:secondary,inventoryWeapons:inventory},`Equipped ${w.name}${danger&&!isRestOpen()?' under pressure':''}`);
    closeDialog();return result;
  }

  function ensureDialog(){
    let d=document.getElementById('equipmentDialog');
    if(!d){
      d=document.createElement('dialog');d.id='equipmentDialog';d.className='equipment-dialog';
      (document.getElementById('characterPageView')||document.body).appendChild(d);
      d.addEventListener('click',event=>{if(event.target===d)d.close();});
    }
    return d;
  }
  function closeDialog(){const d=document.getElementById('equipmentDialog');if(d?.open)d.close();}
  function openEquip(id){
    ensureState();const w=weapon(id);if(!w||!state?.inventoryWeapons.includes(id))return;
    if(isRestOpen()){equip(id,{danger:false});return;}
    const d=ensureDialog();
    d.innerHTML=`<div class="equip-dialog-shell"><div class="equip-dialog-head"><div><span>SWITCH WEAPON</span><h2>Equip ${esc(w.name)}</h2><p>Choose the fictional situation. The sheet will enforce two-handed/secondary hand limits automatically.</p></div><button class="equip-dialog-close" type="button" data-close aria-label="Close">×</button></div><div class="equip-contexts"><div class="equip-context"><strong>Calm / preparing</strong><p>Equip freely when there is time to prepare, including during a rest.</p><button type="button" data-context="calm">Equip free</button></div><div class="equip-context"><strong>Danger / under pressure</strong><p>Mark 1 Stress, then switch to the inventory weapon.</p><button type="button" data-context="danger">Mark 1 Stress & equip</button></div></div></div>`;
    d.querySelector('[data-close]')?.addEventListener('click',closeDialog);
    d.querySelector('[data-context="calm"]')?.addEventListener('click',()=>equip(id,{danger:false}));
    d.querySelector('[data-context="danger"]')?.addEventListener('click',()=>equip(id,{danger:true}));
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
  }

  function useConsumable(id){
    ensureState();const item=cfg()?.consumables?.[id],count=state?.consumables?.[id]||0,api=resourceAPI(),rs=resources();
    if(!item||count<1||!api||!rs)return;
    const current=Number(rs[item.kind]||0);
    if(current<=0){setNotice(`${cfg().name} has no marked ${item.kind==='hp'?'HP':'Stress'} to clear.`);return;}
    const roll=die(4),cleared=Math.min(roll,current);
    api.setResource?.(item.kind,current-cleared,`${item.name} · clear ${roll}`);
    lastConsumableResult=`${item.name}: rolled ${roll}; cleared ${cleared} ${item.kind==='hp'?'HP':'Stress'}.`;
    lastNotice='';
    commit({consumables:{...state.consumables,[id]:count-1}},`Used ${item.name}`);
  }
  function adjustConsumable(id,delta){
    ensureState();if(!cfg()?.consumables?.[id]||!state)return;
    const count=Math.max(0,Math.min(9,(state.consumables[id]||0)+Number(delta||0)));
    commit({consumables:{...state.consumables,[id]:count}},`${delta>0?'Add':'Remove'} ${cfg().consumables[id].name}`);
  }

  function groupByTitle(title){return[...document.querySelectorAll('#characterSheet .sheet-group')].find(g=>g.querySelector('.sheet-group-head h3')?.textContent.trim()===title)||null;}
  function ensureManager(){
    const group=groupByTitle('Weapons, armor & inventory');if(!group)return null;
    let manager=document.getElementById('equipmentManager');
    if(!manager){manager=document.createElement('section');manager.id='equipmentManager';manager.className='equipment-manager live-equipment-manager';const head=group.querySelector('.sheet-group-head');if(head)head.insertAdjacentElement('afterend',manager);else group.prepend(manager);}
    return manager;
  }
  function ensureReady(){
    const dashboard=document.querySelector('#playDashboard .play-dashboard-content');if(!dashboard)return null;
    let panel=document.getElementById('readyGearPanel');
    if(!panel){panel=document.createElement('section');panel.id='readyGearPanel';panel.className='ready-gear-panel';dashboard.appendChild(panel);}
    return panel;
  }
  function activeMarkup(id,label){
    const w=weapon(id);if(!w)return`<div class="equip-item active empty"><span>${esc(label)}</span><strong>Empty</strong><em>No weapon equipped.</em></div>`;
    return`<div class="equip-item active"><span>${esc(label)}</span><strong>${esc(w.name)}</strong><p>${esc(w.meta)}</p><em>${w.burden===2?'Two-Handed':'One-Handed'}</em></div>`;
  }
  function inventoryMarkup(id){
    const w=weapon(id);if(!w)return'';
    let note='';
    if(activeKey==='odie'&&id==='small-dagger')note='<small class="equip-special-note">Paired cannot combine with Odie’s two-handed Spear; equipping the dagger puts the Spear into inventory.</small>';
    if(activeKey==='velmira'&&id==='whip')note='<small class="equip-special-note">Equipping the Whip puts the two-handed Greatstaff into inventory.</small>';
    return`<div class="equip-item inventory"><span>INVENTORY WEAPON</span><strong>${esc(w.name)}</strong><p>${esc(w.meta)}</p><em>${w.burden===2?'Two-Handed':'One-Handed'} · ${esc(w.slot)}</em>${note}<div class="equip-item-actions"><button type="button" data-equip="${id}">Equip</button></div></div>`;
  }
  function consumableMarkup(id){
    const item=cfg().consumables[id],count=state.consumables[id]||0,rs=resources(),canUse=count>0&&Number(rs?.[item.kind]||0)>0;
    return`<div class="equip-item consumable"><span>CONSUMABLE</span><strong>${esc(item.name)}</strong><p>${esc(item.effect)} · one use.</p><div class="equip-item-actions"><button type="button" data-consume="${id}" ${canUse?'':'disabled'}>Use</button><button type="button" data-consume-adjust="${id}" data-delta="-1" ${count<=0?'disabled':''} aria-label="Remove one ${esc(item.name)}">−</button><b class="consumable-count">${count}</b><button type="button" data-consume-adjust="${id}" data-delta="1" ${count>=9?'disabled':''} aria-label="Add one ${esc(item.name)}">+</button></div></div>`;
  }

  function renderManager(){
    if(!state)return;const manager=ensureManager();if(!manager)return;
    const inventory=state.inventoryWeapons.map(inventoryMarkup).join('');
    const consumables=Object.keys(cfg().consumables).map(consumableMarkup).join('');
    const gear=cfg().gear.map(item=>`<div class="equip-item inventory gear-only"><span>GEAR</span><strong>${esc(item)}</strong></div>`).join('');
    manager.innerHTML=`<div class="equipment-head"><div><span>LIVE EQUIPMENT</span><strong>Weapons, Gear & Consumables</strong><small data-equipment-sync-label>${isPreview()?'GM preview · local test · not synced':'Equipment state syncs with this character'}</small></div>${isPreview()?'<button type="button" data-reset-equipment>Reset equipment test</button>':''}</div><div class="equipment-grid"><section class="equip-section"><div class="equip-section-title"><span>EQUIPPED</span><strong>Ready now</strong></div><div class="equip-list">${activeMarkup(state.activePrimary,'ACTIVE PRIMARY')}${activeMarkup(state.activeSecondary,'ACTIVE SECONDARY')}<div class="equip-item active"><span>ACTIVE ARMOR</span><strong>${esc(cfg().armor.name)}</strong><p>${esc(cfg().armor.meta)}</p></div></div></section><section class="equip-section"><div class="equip-section-title"><span>PACK</span><strong>Inventory</strong></div><div class="equip-list">${inventory||'<div class="equipment-empty">No unequipped weapons.</div>'}${consumables}${gear}</div></section></div>${lastConsumableResult?`<div class="consumable-result">${esc(lastConsumableResult)}</div>`:''}${lastNotice?`<div class="equipment-notice" role="status">${esc(lastNotice)}</div>`:''}<div class="equipment-rule"><b>Weapon switching:</b> free while calm or preparing; under danger/pressure the sheet marks 1 Stress before equipping. A two-handed primary cannot remain active with a secondary weapon.</div>`;
    manager.querySelectorAll('[data-equip]').forEach(b=>b.addEventListener('click',()=>openEquip(b.dataset.equip)));
    manager.querySelectorAll('[data-consume]').forEach(b=>b.addEventListener('click',()=>useConsumable(b.dataset.consume)));
    manager.querySelectorAll('[data-consume-adjust]').forEach(b=>b.addEventListener('click',()=>adjustConsumable(b.dataset.consumeAdjust,Number(b.dataset.delta))));
    manager.querySelector('[data-reset-equipment]')?.addEventListener('click',resetPreview);
  }

  function renderReady(){
    if(!state)return;const panel=ensureReady();if(!panel)return;
    const primary=weapon(state.activePrimary)?.name||'—',secondary=weapon(state.activeSecondary)?.name||'—';
    const consumableCount=Object.values(state.consumables).reduce((a,b)=>a+Number(b||0),0);
    const beast=activeKey==='marek'&&document.body.classList.contains('marek-beastform-active');
    panel.innerHTML=`<div class="ready-gear-copy"><span>READY GEAR</span><strong>${beast?'Beastform · humanoid weapons unavailable':`${esc(primary)}${secondary!=='—'?` + ${esc(secondary)}`:''}`}</strong><small>${esc(cfg().armor.name)} · ${state.inventoryWeapons.length} inventory weapon${state.inventoryWeapons.length===1?'':'s'} · ${consumableCount} consumable${consumableCount===1?'':'s'}</small></div><button type="button" data-open-gear>Open Gear</button>`;
    panel.querySelector('[data-open-gear]')?.addEventListener('click',openGearTab);
  }

  function openGearTab(){
    document.querySelector('[data-sheet-tab="gear"]')?.click();
    setTimeout(()=>document.getElementById('equipmentManager')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
  }

  function activeWeaponIds(){return new Set([state?.activePrimary,state?.activeSecondary].filter(Boolean));}
  function cardTitle(node){return node.querySelector('.active-action-copy strong')?.textContent.trim()||node.querySelector('strong')?.textContent.trim()||'';}
  function applyActionAvailability(){
    if(!state)return;const active=activeWeaponIds(),offActions=new Set();
    Object.entries(cfg().weapons).forEach(([id,w])=>{if(!active.has(id))w.actions.forEach(action=>offActions.add(action));});
    document.querySelectorAll('#activeActionsPanel .active-action-card,#companionActionsPanel .active-action-card').forEach(card=>{
      const off=offActions.has(cardTitle(card));card.classList.toggle('equipment-action-disabled',off);
      if(off){card.disabled=true;card.dataset.equipmentDisabled='true';card.title='Weapon is not equipped.';}
      else if(card.dataset.equipmentDisabled==='true'){card.disabled=false;delete card.dataset.equipmentDisabled;card.removeAttribute('title');}
    });
  }

  function applyMarekArmor(){
    if(activeKey!=='marek'||!state)return;
    const armor=[...document.querySelectorAll('#characterSheet .character-stat')].find(n=>n.querySelector('span')?.textContent.trim().toLowerCase()==='armor');
    const strong=armor?.querySelector('strong');if(!strong)return;
    const target=document.body.classList.contains('marek-beastform-active')?3:(state.activeSecondary==='round-shield'?4:3);
    if(Number(String(strong.textContent).match(/\d+/)?.[0])!==target)strong.textContent=String(target);
  }

  function apply(){if(!state)return;applyActionAvailability();applyMarekArmor();renderReady();}
  function render(){if(!state)return;renderManager();renderReady();applyActionAvailability();applyMarekArmor();window.GreywakeCharacterLayout?.normalize?.();}
  function resetPreview(){if(!isPreview())return;state=normalise(cfg().base);lastConsumableResult='';lastNotice='Equipment test reset.';save();render();emit('Reset equipment test');}

  function init(){
    const k=key();if(!k){activeKey=null;activeStore=null;state=null;document.getElementById('readyGearPanel')?.remove();document.getElementById('equipmentManager')?.remove();return;}
    load(k);if(!resourceAPI()||!document.querySelector('#characterSheet .character-sheet-shell')){setTimeout(init,120);return;}
    render();
  }

  window.GreywakeEquipment={
    get key(){return activeKey;},getState:snapshot,importState,render,equip,adjustConsumable,openGear:openGearTab,
    isEquipped:id=>Boolean(state&&(state.activePrimary===id||state.activeSecondary===id))
  };

  let timer;const schedule=()=>{clearTimeout(timer);timer=setTimeout(init,180);};
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('greywake:resources-changed',()=>setTimeout(()=>{apply();renderManager();},0));
  window.addEventListener('greywake:companion-resources-changed',()=>setTimeout(()=>{apply();renderManager();},0));
  window.addEventListener('greywake:damage-changed',()=>setTimeout(apply,0));
  window.addEventListener('greywake:rest-state-changed',()=>setTimeout(apply,0));
  document.addEventListener('click',event=>{if(event.target.closest?.('#chooseBeastform,#changeBeastform,#dropBeastform,[data-beastform]'))setTimeout(apply,120);});
  document.addEventListener('DOMContentLoaded',schedule);
})();

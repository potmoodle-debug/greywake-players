(() => {
  const WEAPONS={
    longsword:{name:'Longsword',slot:'primary',burden:2,trait:'Agility',range:'Melee',damage:'d10+3',damageType:'physical',feature:'—',actions:['Longsword']},
    battleaxe:{name:'Battleaxe',slot:'primary',burden:2,trait:'Strength',range:'Melee',damage:'d10+3',damageType:'physical',feature:'—',actions:['Battleaxe']},
    mace:{name:'Mace',slot:'primary',burden:1,trait:'Strength',range:'Melee',damage:'d8+1',damageType:'physical',feature:'—',actions:['Mace']},
    dagger:{name:'Dagger',slot:'primary',burden:1,trait:'Finesse',range:'Melee',damage:'d8+1',damageType:'physical',feature:'—',actions:['Dagger']},
    quarterstaff:{name:'Quarterstaff',slot:'primary',burden:2,trait:'Instinct',range:'Melee',damage:'d10+3',damageType:'physical',feature:'—',actions:['Quarterstaff']},
    cutlass:{name:'Cutlass',slot:'primary',burden:1,trait:'Presence',range:'Melee',damage:'d8+1',damageType:'physical',feature:'—',actions:['Cutlass']},
    spear:{name:'Spear',slot:'primary',burden:2,trait:'Finesse',range:'Very Close',damage:'d8+3',damageType:'physical',feature:'—',actions:['Spear']},
    shortbow:{name:'Shortbow',slot:'primary',burden:2,trait:'Agility',range:'Far',damage:'d6+3',damageType:'physical',feature:'—',actions:['Shortbow']},
    crossbow:{name:'Crossbow',slot:'primary',burden:1,trait:'Finesse',range:'Far',damage:'d6+1',damageType:'physical',feature:'—',actions:['Crossbow']},
    'arcane-gauntlets':{name:'Arcane Gauntlets',slot:'primary',burden:2,trait:'Strength',range:'Melee',damage:'d10+3',damageType:'magic',feature:'—',spellcast:true,actions:['Arcane Gauntlets']},
    'hallowed-axe':{name:'Hallowed Axe',slot:'primary',burden:1,trait:'Strength',range:'Melee',damage:'d8+1',damageType:'magic',feature:'—',spellcast:true,actions:['Hallowed Axe']},
    'glowing-rings':{name:'Glowing Rings',slot:'primary',burden:2,trait:'Agility',range:'Very Close',damage:'d10+2',damageType:'magic',feature:'—',spellcast:true,actions:['Glowing Rings']},
    'hand-runes':{name:'Hand Runes',slot:'primary',burden:1,trait:'Instinct',range:'Very Close',damage:'d10',damageType:'magic',feature:'—',spellcast:true,actions:['Hand Runes']},
    shortstaff:{name:'Shortstaff',slot:'primary',burden:1,trait:'Instinct',range:'Close',damage:'d8+1',damageType:'magic',feature:'—',spellcast:true,actions:['Shortstaff']},
    dualstaff:{name:'Dualstaff',slot:'primary',burden:2,trait:'Instinct',range:'Far',damage:'d6+3',damageType:'magic',feature:'—',spellcast:true,actions:['Dualstaff']},
    wand:{name:'Wand',slot:'primary',burden:1,trait:'Knowledge',range:'Far',damage:'d6+1',damageType:'magic',feature:'—',spellcast:true,actions:['Wand']},
    greatstaff:{name:'Greatstaff',slot:'primary',burden:2,trait:'Knowledge',range:'Very Far',damage:'d6',damageType:'magic',feature:'Powerful: on a successful attack, roll an additional damage die and discard the lowest result.',spellcast:true,actions:['Greatstaff']},
    'round-shield':{name:'Round Shield',slot:'secondary',burden:1,trait:'Strength',range:'Melee',damage:'d4',damageType:'physical',feature:'Protective: +1 to Armor Score',actions:['Round Shield']},
    'small-dagger':{name:'Small Dagger',slot:'secondary',burden:1,trait:'Finesse',range:'Melee',damage:'d8',damageType:'physical',feature:'Paired: +2 to primary weapon damage to targets within Melee range',actions:['Small Dagger']},
    whip:{name:'Whip',slot:'secondary',burden:1,trait:'Presence',range:'Very Close',damage:'d6',damageType:'physical',feature:'Startling: mark a Stress to force adversaries within Melee range back to Close range.',actions:['Whip','Startling']},
    'hand-crossbow':{name:'Hand Crossbow',slot:'secondary',burden:1,trait:'Finesse',range:'Far',damage:'d6+1',damageType:'physical',feature:'—',actions:['Hand Crossbow']}
  };
  const ARMORS={gambeson:{name:'Gambeson Armor',score:3,meta:'Armor Score 3'},'leather-armor':{name:'Leather Armor',score:3,meta:'Armor Score 3'}};
  const CONSUMABLES={
    'minor-health':{name:'Minor Health Potion',effect:'Clear 1d4 HP',kind:'hp'},
    'minor-stamina':{name:'Minor Stamina Potion',effect:'Clear 1d4 Stress',kind:'stress'}
  };
  const CONFIG={
    marek:{name:'Marek',spellcast:true,armor:'gambeson',gear:['Torch','50 ft Rope','Basic Supplies','Small Bag of Rocks and Bones'],base:{activePrimary:'shortstaff',activeSecondary:'round-shield',inventoryWeapons:[],ownedWeapons:['shortstaff','round-shield'],consumables:{'minor-stamina':1,'minor-health':0}}},
    velmira:{name:'Velmira',spellcast:true,armor:'leather-armor',gear:['Torch','50 ft Rope','Basic Supplies','Nomadic Pack','Book being translated','Leather Satchel'],base:{activePrimary:'greatstaff',activeSecondary:null,inventoryWeapons:['whip'],ownedWeapons:['greatstaff','whip'],consumables:{'minor-stamina':1,'minor-health':0}}},
    odie:{name:'Odie',spellcast:false,armor:'gambeson',gear:['Torch','50 ft Rope','Basic Supplies','Grappling Hook','Salvage-built Prosthetic Arm','Oldwork Finger · separate and unfitted'],base:{activePrimary:'spear',activeSecondary:null,inventoryWeapons:['small-dagger'],ownedWeapons:['spear','small-dagger'],consumables:{'minor-health':1,'minor-stamina':0}}}
  };
  const PREFIX='greywake:equipment-state:v4:';
  const V3_PREFIX='greywake:equipment-state:v3:';
  let activeKey=null,activeStore=null,state=null,lastConsumableResult='',lastNotice='';
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const clone=v=>JSON.parse(JSON.stringify(v));
  const die=s=>{if(window.crypto?.getRandomValues){const b=new Uint32Array(1);window.crypto.getRandomValues(b);return(b[0]%s)+1;}return Math.floor(Math.random()*s)+1;};
  const key=()=>{const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return CONFIG[k]?k:null;};
  const preview=()=>document.body.dataset.gmPreview==='true';
  const cfg=()=>activeKey?CONFIG[activeKey]:null;
  const storeKey=k=>`${PREFIX}${k}${preview()?':gmtest':''}`;
  const v3Key=k=>`${V3_PREFIX}${k}${preview()?':gmtest':''}`;
  const weapon=id=>WEAPONS[id]||null;
  const resourceAPI=()=>activeKey==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const resources=()=>resourceAPI()?.getState?.()||null;
  const armor=()=>ARMORS[cfg()?.armor]||null;
  function catalog(){const c=cfg();return c?Object.entries(WEAPONS).filter(([,w])=>!w.spellcast||c.spellcast).map(([id,w])=>({id,...w})):[];}
  function normalise(raw){
    const c=cfg();if(!c)return null;const base=clone(c.base),owned=[];
    [...(Array.isArray(raw?.ownedWeapons)?raw.ownedWeapons:base.ownedWeapons),raw?.activePrimary,raw?.activeSecondary,...(Array.isArray(raw?.inventoryWeapons)?raw.inventoryWeapons:base.inventoryWeapons)].filter(Boolean).forEach(id=>{const w=weapon(id);if(w&&(!w.spellcast||c.spellcast)&&!owned.includes(id))owned.push(id);});
    let primary=raw&&Object.prototype.hasOwnProperty.call(raw,'activePrimary')?raw.activePrimary:base.activePrimary;
    let secondary=raw&&Object.prototype.hasOwnProperty.call(raw,'activeSecondary')?raw.activeSecondary:base.activeSecondary;
    if(primary&&!owned.includes(primary))primary=null;if(primary&&weapon(primary)?.slot!=='primary')primary=null;
    if(secondary&&!owned.includes(secondary))secondary=null;if(secondary&&weapon(secondary)?.slot!=='secondary')secondary=null;
    if(primary&&weapon(primary)?.burden===2)secondary=null;
    const inventory=[];(Array.isArray(raw?.inventoryWeapons)?raw.inventoryWeapons:base.inventoryWeapons).forEach(id=>{if(owned.includes(id)&&id!==primary&&id!==secondary&&!inventory.includes(id)&&inventory.length<2)inventory.push(id);});
    owned.forEach(id=>{if(id!==primary&&id!==secondary&&!inventory.includes(id)&&inventory.length<2)inventory.push(id);});
    const consumables={};Object.keys(CONSUMABLES).forEach(id=>consumables[id]=Math.max(0,Math.min(5,Number(raw?.consumables?.[id]??base.consumables[id]??0)||0)));
    return{activePrimary:primary||null,activeSecondary:secondary||null,activeArmor:raw?.activeArmor||c.armor,inventoryWeapons:inventory,ownedWeapons:owned,consumables};
  }
  function migrate(k){try{return JSON.parse(localStorage.getItem(v3Key(k))||'null');}catch(_){return null;}}
  function load(k){const sk=storeKey(k);if(activeKey===k&&activeStore===sk&&state)return state;activeKey=k;activeStore=sk;let raw=null;try{raw=JSON.parse(localStorage.getItem(sk)||'null');}catch(_){}state=normalise(raw||migrate(k)||CONFIG[k].base);save();return state;}
  function ensure(){const k=key();return k?load(k):null;}
  function save(){if(state&&activeStore)try{localStorage.setItem(activeStore,JSON.stringify(state));}catch(_){} }
  function snapshot(){return state?{activePrimary:state.activePrimary,activeSecondary:state.activeSecondary,activeArmor:state.activeArmor,inventoryWeapons:[...state.inventoryWeapons],ownedWeapons:[...state.ownedWeapons],consumables:{...state.consumables}}:null;}
  function emit(reason){window.dispatchEvent(new CustomEvent('greywake:equipment-state-changed',{detail:{ok:true,key:activeKey,reason,state:snapshot()}}));}
  function commit(next,reason){if(!state)return{ok:false};state=normalise({...state,...next});save();render();emit(reason);return{ok:true,state:snapshot()};}
  function importState(remote){ensure();if(!state||!remote)return;state=normalise(remote);save();render();}
  function isRestOpen(){return Boolean(document.getElementById('restDialog')?.open);}
  function markStress(reason){const a=resourceAPI(),r=resources();if(!a||!r)return{ok:false,message:'Live Stress track unavailable.'};if(Number(r.maxStress)-Number(r.stress)<1)return{ok:false,message:'No free Stress slot.'};return a.markStress?.(1,{reason,cost:true})||{ok:false};}
  function addWeapon(id){ensure();const w=weapon(id);if(!state||!w||preview())return{ok:false,message:'Weapon cannot be added.'};if(w.spellcast&&!cfg().spellcast)return{ok:false,message:'This magic weapon requires a Spellcast trait.'};if(state.ownedWeapons.includes(id))return{ok:false,message:`${w.name} is already owned.`};if(state.inventoryWeapons.length>=2)return{ok:false,message:'Both inventory weapon slots are already full.'};lastNotice=`Added ${w.name}.`;return commit({ownedWeapons:[...state.ownedWeapons,id],inventoryWeapons:[...state.inventoryWeapons,id]},`Added ${w.name}`);}
  function removeWeapon(id){ensure();const w=weapon(id);if(!state||!w||preview()||!state.inventoryWeapons.includes(id))return{ok:false,message:'Only an unequipped inventory weapon can be removed.'};lastNotice=`Removed ${w.name}.`;return commit({ownedWeapons:state.ownedWeapons.filter(x=>x!==id),inventoryWeapons:state.inventoryWeapons.filter(x=>x!==id)},`Removed ${w.name}`);}
  function equip(id,{danger=false}={}){
    ensure();const w=weapon(id);if(!state||!w||!state.inventoryWeapons.includes(id))return{ok:false,message:'Weapon is not in inventory.'};
    if(danger&&!isRestOpen()){const p=markStress(`Switch weapon · ${w.name}`);if(p?.ok===false)return p;}
    let primary=state.activePrimary,secondary=state.activeSecondary,inventory=state.inventoryWeapons.filter(x=>x!==id);
    const stow=x=>{if(x&&!inventory.includes(x))inventory.push(x);};
    if(w.slot==='primary'){
      stow(primary);primary=id;
      if(w.burden===2){stow(secondary);secondary=null;}
    }else{
      stow(secondary);secondary=id;
      if(primary&&weapon(primary)?.burden===2){stow(primary);primary=null;}
    }
    if(inventory.length>2)return{ok:false,message:'That switch would exceed the two inventory weapon slots.'};
    lastNotice=`Equipped ${w.name}${w.burden===2?' · Two-Handed':' · One-Handed'}.`;const r=commit({activePrimary:primary,activeSecondary:secondary,inventoryWeapons:inventory},`Equipped ${w.name}`);closeDialog();return r;
  }
  function unequip(id){
    ensure();const w=weapon(id);if(!state||!w||preview())return{ok:false,message:'Weapon cannot be unequipped.'};const active=state.activePrimary===id||state.activeSecondary===id;if(!active)return{ok:false,message:'Weapon is not equipped.'};if(state.inventoryWeapons.length>=2)return{ok:false,message:'Both inventory weapon slots are full. Remove or equip another inventory weapon first.'};
    const next={activePrimary:state.activePrimary,activeSecondary:state.activeSecondary,inventoryWeapons:[...state.inventoryWeapons,id]};if(state.activePrimary===id)next.activePrimary=null;if(state.activeSecondary===id)next.activeSecondary=null;
    lastNotice=`Unequipped ${w.name}.`;return commit(next,`Unequipped ${w.name}`);
  }
  function ensureDialog(){let d=document.getElementById('equipmentDialog');if(!d){d=document.createElement('dialog');d.id='equipmentDialog';d.className='equipment-dialog';(document.getElementById('characterPageView')||document.body).appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});}return d;}
  function closeDialog(){const d=document.getElementById('equipmentDialog');if(d?.open)d.close();}
  function openEquip(id){ensure();const w=weapon(id);if(!w||!state?.inventoryWeapons.includes(id))return;if(isRestOpen()){equip(id,{danger:false});return;}const d=ensureDialog();d.innerHTML=`<div class="equip-dialog-shell"><div class="equip-dialog-head"><div><span>SWITCH WEAPON</span><h2>Equip ${esc(w.name)}</h2><p>${w.burden===2?'Two-Handed · occupies both hands':'One-Handed'}.</p></div><button class="equip-dialog-close" data-close type="button">×</button></div><div class="equip-contexts"><div class="equip-context"><strong>Calm / preparing</strong><button data-calm type="button">Equip free</button></div><div class="equip-context"><strong>Danger / under pressure</strong><button data-danger type="button">Mark 1 Stress & equip</button></div></div></div>`;d.querySelector('[data-close]')?.addEventListener('click',closeDialog);d.querySelector('[data-calm]')?.addEventListener('click',()=>equip(id,{danger:false}));d.querySelector('[data-danger]')?.addEventListener('click',()=>equip(id,{danger:true}));if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');}
  function useConsumable(id){
    ensure();const item=CONSUMABLES[id],count=Number(state?.consumables?.[id]||0),api=resourceAPI(),rs=resources();if(!item||count<1||!api||!rs)return{ok:false,message:'Consumable unavailable.'};const marked=Number(rs[item.kind]||0);if(marked<=0){lastNotice=`${cfg().name} has no marked ${item.kind==='hp'?'HP':'Stress'} to clear. Potion not consumed.`;render();return{ok:false,message:lastNotice};}
    const roll=die(4),cleared=Math.min(roll,marked),set=api.setResource?.(item.kind,marked-cleared,`${item.name} · rolled ${roll}`);if(set?.ok===false)return set;
    lastConsumableResult=`${item.name} · d4 rolled ${roll} · cleared ${cleared} ${item.kind==='hp'?'HP':'Stress'}${cleared<roll?' (only marked slots can be cleared)':''}.`;
    return commit({consumables:{...state.consumables,[id]:count-1}},`Used ${item.name}`);
  }
  function adjustConsumable(id,delta){ensure();if(!CONSUMABLES[id]||!state)return{ok:false};const old=Number(state.consumables[id]||0),count=Math.max(0,Math.min(5,old+Number(delta||0)));if(count===old)return{ok:false,message:count>=5?'Maximum 5 copies.':'No copies to remove.'};return commit({consumables:{...state.consumables,[id]:count}},`${delta>0?'Added':'Removed'} ${CONSUMABLES[id].name}`);}
  function group(){return[...document.querySelectorAll('#characterSheet .sheet-group')].find(g=>g.querySelector('.sheet-group-head h3')?.textContent.trim()==='Weapons, armor & inventory')||null;}
  function ensureManager(){const g=group();if(!g)return null;let m=document.getElementById('equipmentManager');if(!m){m=document.createElement('section');m.id='equipmentManager';m.className='equipment-manager live-equipment-manager';g.querySelector('.sheet-group-head')?.insertAdjacentElement('afterend',m);}return m;}
  function ensureReady(){const d=document.querySelector('#playDashboard .play-dashboard-content');if(!d)return null;let p=document.getElementById('readyGearPanel');if(!p){p=document.createElement('section');p.id='readyGearPanel';p.className='ready-gear-panel';d.appendChild(p);}return p;}
  function meta(w){return `${w.trait} · ${w.range} · ${w.damage} ${w.damageType}${w.feature&&w.feature!=='—'?` · ${w.feature}`:''}`;}
  function activeMarkup(id,label){const w=weapon(id);if(!w)return`<div class="equip-item active empty"><span>${label}</span><strong>Empty</strong><em>Hand slot free.</em></div>`;return`<div class="equip-item active"><span>${label} · ${w.burden===2?'TWO-HANDED':'ONE-HANDED'}</span><strong>${esc(w.name)}</strong><p>${esc(meta(w))}</p><div class="equip-item-actions"><button data-use-weapon="${id}" type="button">Use</button><button data-unequip="${id}" type="button">Unequip</button></div></div>`;}
  function inventoryMarkup(id){const w=weapon(id);return w?`<div class="equip-item inventory"><span>INVENTORY WEAPON · ${w.burden===2?'TWO-HANDED':'ONE-HANDED'}</span><strong>${esc(w.name)}</strong><p>${esc(meta(w))}</p><div class="equip-item-actions"><button data-equip="${id}" type="button">Equip</button><button data-remove-weapon="${id}" type="button">Remove</button></div></div>`:'';}
  function consumableMarkup(id){const item=CONSUMABLES[id],count=Number(state.consumables[id]||0);if(!count)return'';const marked=Number(resources()?.[item.kind]||0);return`<div class="equip-item consumable"><span>CONSUMABLE</span><strong>${esc(item.name)}</strong><p>${esc(item.effect)} · ${count}/5 carried.</p><div class="equip-item-actions"><button data-consume="${id}" ${marked>0?'':'disabled'} type="button">Use</button><button data-consume-adjust="${id}" data-delta="-1" type="button">−</button><b>${count}</b><button data-consume-adjust="${id}" data-delta="1" ${count>=5?'disabled':''} type="button">+</button></div></div>`;}
  function renderManager(){if(!state)return;const m=ensureManager();if(!m)return;const a=armor(),inv=state.inventoryWeapons.map(inventoryMarkup).join(''),cons=Object.keys(CONSUMABLES).map(consumableMarkup).join(''),gear=cfg().gear.map(x=>`<div class="equip-item inventory gear-only"><span>GEAR</span><strong>${esc(x)}</strong></div>`).join('');m.innerHTML=`<div class="equipment-head"><div><span>LIVE EQUIPMENT</span><strong>Weapons, Gear & Consumables</strong><small>${preview()?'GM preview · local test':'Live equipment state'}</small></div></div><div class="equipment-grid"><section class="equip-section"><div class="equip-section-title"><span>EQUIPPED</span><strong>Hands</strong></div><div class="equip-list">${activeMarkup(state.activePrimary,'PRIMARY')}${activeMarkup(state.activeSecondary,'SECONDARY')}<div class="equip-item active"><span>ACTIVE ARMOR</span><strong>${esc(a?.name||'Armor')}</strong><p>${esc(a?.meta||'')}</p></div></div></section><section class="equip-section"><div class="equip-section-title"><span>PACK</span><strong>Inventory · ${state.inventoryWeapons.length}/2 weapon slots</strong></div><div class="equip-list">${inv||'<div class="equipment-empty">No unequipped weapons.</div>'}${cons}${gear}</div></section></div>${lastConsumableResult?`<div class="consumable-result">${esc(lastConsumableResult)}</div>`:''}${lastNotice?`<div class="equipment-notice">${esc(lastNotice)}</div>`:''}`;
    m.querySelectorAll('[data-equip]').forEach(b=>b.addEventListener('click',()=>openEquip(b.dataset.equip)));m.querySelectorAll('[data-unequip]').forEach(b=>b.addEventListener('click',()=>unequip(b.dataset.unequip)));m.querySelectorAll('[data-use-weapon]').forEach(b=>b.addEventListener('click',()=>window.GreywakeEquipment?.openWeaponUse?.(b.dataset.useWeapon)));m.querySelectorAll('[data-remove-weapon]').forEach(b=>b.addEventListener('click',()=>removeWeapon(b.dataset.removeWeapon)));m.querySelectorAll('[data-consume]').forEach(b=>b.addEventListener('click',()=>useConsumable(b.dataset.consume)));m.querySelectorAll('[data-consume-adjust]').forEach(b=>b.addEventListener('click',()=>adjustConsumable(b.dataset.consumeAdjust,Number(b.dataset.delta))));
  }
  function renderReady(){const p=ensureReady();if(!p||!state)return;const p1=weapon(state.activePrimary)?.name||'Empty',p2=weapon(state.activeSecondary)?.name||'Empty',two=state.activePrimary&&weapon(state.activePrimary)?.burden===2;p.innerHTML=`<div class="ready-gear-copy"><span>READY GEAR</span><strong>${two?`${esc(p1)} · Two-Handed`:`${esc(p1)}${state.activeSecondary?` + ${esc(p2)}`:''}`}</strong><small>${esc(armor()?.name||'Armor')} · ${state.inventoryWeapons.length}/2 inventory weapons · ${Object.values(state.consumables).reduce((a,b)=>a+Number(b||0),0)} consumables</small></div><button data-open-gear type="button">Open Backpack</button>`;p.querySelector('[data-open-gear]')?.addEventListener('click',()=>window.GreywakeBackpack?.open?.());}
  function applyArmorScore(){const stat=[...document.querySelectorAll('#characterSheet .character-stat')].find(n=>n.querySelector('span')?.textContent.trim().toLowerCase()==='armor')?.querySelector('strong');if(!stat)return;const base=armor()?.score||3,shield=state?.activeSecondary==='round-shield'?1:0;stat.textContent=String(base+shield);}
  function applyActionAvailability(){const active=new Set([state?.activePrimary,state?.activeSecondary].filter(Boolean));const off=new Set();state?.ownedWeapons?.forEach(id=>{if(!active.has(id))(weapon(id)?.actions||[]).forEach(a=>off.add(a));});document.querySelectorAll('#activeActionsPanel .active-action-card,#companionActionsPanel .active-action-card').forEach(card=>{const title=card.querySelector('.active-action-copy strong')?.textContent.trim()||card.querySelector('strong')?.textContent.trim();const disabled=off.has(title);card.classList.toggle('equipment-action-disabled',disabled);if(disabled){card.disabled=true;card.dataset.equipmentDisabled='true';}else if(card.dataset.equipmentDisabled==='true'){card.disabled=false;delete card.dataset.equipmentDisabled;}});}
  function render(){if(!state)return;renderManager();renderReady();applyArmorScore();applyActionAvailability();window.GreywakeCharacterLayout?.normalize?.();}
  function init(){const k=key();if(!k){activeKey=null;activeStore=null;state=null;document.getElementById('equipmentManager')?.remove();document.getElementById('readyGearPanel')?.remove();return;}load(k);if(!document.querySelector('#characterSheet .character-sheet-shell'))return;render();}
  window.GreywakeEquipment={get key(){return activeKey;},getState:snapshot,importState,render,equip,unequip,openEquip,addWeapon,removeWeapon,adjustConsumable,useConsumable,openWeaponUse:()=>{},openGear:()=>window.GreywakeBackpack?.open?.(),isEquipped:id=>Boolean(state&&(state.activePrimary===id||state.activeSecondary===id)),isOwned:id=>Boolean(state?.ownedWeapons?.includes(id)),catalog,weapon:id=>weapon(id),consumables:()=>clone(CONSUMABLES)};
  let t;const schedule=()=>{clearTimeout(t);t=setTimeout(init,80);};window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);window.addEventListener('hashchange',schedule);window.addEventListener('greywake:resources-changed',()=>setTimeout(render,0));window.addEventListener('greywake:companion-resources-changed',()=>setTimeout(render,0));window.addEventListener('greywake:damage-changed',()=>setTimeout(()=>{applyArmorScore();renderReady();},0));document.addEventListener('DOMContentLoaded',schedule);
})();

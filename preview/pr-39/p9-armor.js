(() => {
  const ARMORS={
    gambeson:{id:'gambeson',name:'Gambeson Armor',baseMajor:5,baseSevere:11,score:3,evasion:1,agility:0,feature:'Flexible: +1 to Evasion'},
    'leather-armor':{id:'leather-armor',name:'Leather Armor',baseMajor:6,baseSevere:13,score:3,evasion:0,agility:0,feature:'—'},
    chainmail:{id:'chainmail',name:'Chainmail Armor',baseMajor:7,baseSevere:15,score:4,evasion:-1,agility:0,feature:'Heavy: −1 to Evasion'},
    'full-plate':{id:'full-plate',name:'Full Plate Armor',baseMajor:8,baseSevere:17,score:4,evasion:-2,agility:-1,feature:'Very Heavy: −2 to Evasion; −1 to Agility'}
  };
  const CONFIG={
    marek:{name:'Marek',level:1,start:'gambeson',baseEvasion:11,baseAgility:1},
    velmira:{name:'Velmira',level:1,start:'leather-armor',baseEvasion:11,baseAgility:-1},
    odie:{name:'Odie',level:1,start:'gambeson',baseEvasion:12,baseAgility:1}
  };
  const PREFIX='greywake:p9-armor:v2:';
  const LEGACY_PREFIX='greywake:p9-armor:v1:';
  let activeKey=null,state=null,originalGetState=null,originalImportState=null;
  const key=()=>{const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return CONFIG[k]?k:null;};
  const preview=()=>document.body.dataset.gmPreview==='true';
  const storeKey=k=>`${PREFIX}${k}${preview()?':gmtest':''}`;
  const legacyKey=k=>`${LEGACY_PREFIX}${k}${preview()?':gmtest':''}`;
  const cfg=()=>activeKey?CONFIG[activeKey]:null;
  const armor=id=>ARMORS[id]||null;
  const activeArmor=()=>armor(state?.activeArmor)||armor(cfg()?.start);
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function load(k){
    if(!CONFIG[k])return null;
    if(activeKey===k&&state)return state;
    activeKey=k;let raw=null;
    try{raw=JSON.parse(localStorage.getItem(storeKey(k))||'null');}catch(_){raw=null;}
    if(!raw){try{raw=JSON.parse(localStorage.getItem(legacyKey(k))||'null');}catch(_){raw=null;}}
    const start=CONFIG[k].start;
    const active=ARMORS[raw?.activeArmor]?raw.activeArmor:start;
    const owned=[];[start,active,...(Array.isArray(raw?.ownedArmor)?raw.ownedArmor:[])].filter(id=>ARMORS[id]).forEach(id=>{if(!owned.includes(id))owned.push(id);});
    state={activeArmor:active,ownedArmor:owned,marksByArmor:{...(raw?.marksByArmor||{})}};
    if(!Number.isFinite(Number(state.marksByArmor[start])))state.marksByArmor[start]=Number(window.GreywakeDamage?.getState?.()?.armorMarked||0);
    save();return state;
  }
  function ensure(){const k=key();return k?load(k):null;}
  function save(){if(!activeKey||!state)return;try{localStorage.setItem(storeKey(activeKey),JSON.stringify(state));}catch(_){}}
  function combatStats(){
    ensure();const a=activeArmor(),c=cfg();if(!a||!c)return null;
    const shield=window.GreywakeEquipment?.getState?.()?.activeSecondary==='round-shield'?1:0;
    const rogueDodge=activeKey==='odie'&&Boolean(window.GreywakeCompanion?.getState?.()?.effects?.rogueDodge);
    return{id:a.id,name:a.name,major:a.baseMajor+c.level,severe:a.baseSevere+c.level,armorScore:a.score+shield,evasion:c.baseEvasion+a.evasion+(rogueDodge?2:0),agility:c.baseAgility+a.agility,feature:a.feature,baseMajor:a.baseMajor,baseSevere:a.baseSevere,baseScore:a.score};
  }
  function snapshot(){ensure();return state?{activeArmor:state.activeArmor,ownedArmor:[...state.ownedArmor],marksByArmor:{...state.marksByArmor}}:null;}
  function emit(reason){window.dispatchEvent(new CustomEvent('greywake:equipment-state-changed',{detail:{ok:true,key:activeKey,reason,armor:snapshot()}}));}

  function statNode(label){return[...document.querySelectorAll('#characterSheet .character-stat')].find(n=>n.querySelector('span')?.textContent.trim().toLowerCase()===label.toLowerCase())||null;}
  function traitNode(label){return[...document.querySelectorAll('#characterSheet .sheet-grid.traits .sheet-card')].find(n=>n.querySelector('h4')?.textContent.trim()===label)||null;}
  function formatSigned(n){return n>0?`+${n}`:n<0?`−${Math.abs(n)}`:'0';}
  function beastformActive(){return activeKey==='marek'&&document.body.classList.contains('marek-beastform-active');}
  function applyStats(){
    ensure();const s=combatStats();if(!s||beastformActive())return;
    const armorStat=statNode('Armor')?.querySelector('strong');if(armorStat)armorStat.textContent=String(s.armorScore);
    const evasion=statNode('Evasion')?.querySelector('strong');if(evasion)evasion.textContent=String(s.evasion);
    const agility=traitNode('Agility')?.querySelector('.sheet-value');if(agility)agility.textContent=formatSigned(s.agility);
    decorateDamagePanel();decorateEquipmentManager();
  }
  function decorateDamagePanel(){
    const s=combatStats(),panel=document.getElementById('damageHealthPanel');if(!s||!panel)return;
    const thresholds=panel.querySelectorAll('.damage-threshold strong');
    if(thresholds[0])thresholds[0].textContent=`< ${s.major}`;
    if(thresholds[1])thresholds[1].textContent=`${s.major}-${s.severe-1}`;
    if(thresholds[2])thresholds[2].textContent=`${s.severe}+`;
    const track=panel.querySelector('.armor-track-title strong');if(track){const marked=Number(window.GreywakeDamage?.getState?.()?.armorMarked||0);track.textContent=`${marked} marked / Armor Score ${s.armorScore}`;}
  }
  function decorateEquipmentManager(){
    const s=combatStats(),manager=document.getElementById('equipmentManager');if(!s||!manager)return;
    const active=[...manager.querySelectorAll('.equip-item.active')].find(n=>n.querySelector('span')?.textContent.trim()==='ACTIVE ARMOR');
    if(active){const strong=active.querySelector('strong'),p=active.querySelector('p');if(strong)strong.textContent=s.name;if(p)p.textContent=`Base ${s.baseMajor}/${s.baseSevere} · Level ${cfg().level}: ${s.major}/${s.severe} · Armor Score ${s.baseScore}${s.feature&&s.feature!=='—'?` · ${s.feature}`:''}`;}
    const ready=document.querySelector('#readyGearPanel small');if(ready){ready.textContent=ready.textContent.replace(/^[^·]+/,s.name+' ');}
  }

  function rememberCurrentMarks(){ensure();if(!state)return;state.marksByArmor[state.activeArmor]=Number(window.GreywakeDamage?.getState?.()?.armorMarked||0);save();}
  function addArmor(id){
    ensure();const a=armor(id);if(!state||!a||preview())return{ok:false,message:'Armor cannot be added in GM preview.'};
    if(state.ownedArmor.includes(id))return{ok:false,message:`${a.name} is already owned.`};
    state.ownedArmor.push(id);save();emit(`Acquired ${a.name}`);
    return{ok:true,message:`${a.name} acquired and stored. Daggerheart does not allow spare armor in carried inventory.`};
  }
  function equipArmor(id){
    ensure();const next=armor(id);if(!state||!next||preview())return{ok:false,message:'Armor cannot be changed in GM preview.'};
    if(!state.ownedArmor.includes(id))return{ok:false,message:`${next.name} must be acquired before it can be equipped.`};
    if(state.activeArmor===id)return{ok:true,message:`${next.name} is already equipped.`};
    rememberCurrentMarks();state.activeArmor=id;save();
    const restore=Math.max(0,Math.min(next.score,Number(state.marksByArmor[id]||0)));window.GreywakeDamage?.setArmorMarked?.(restore);
    applyStats();window.GreywakeEquipment?.render?.();setTimeout(applyStats,20);emit(`Equipped ${next.name}`);
    return{ok:true,message:`Equipped ${next.name}. Previous armor is stored rather than carried.`};
  }
  function openArmorEquip(id){
    ensure();const a=armor(id);if(!a||preview()||!state?.ownedArmor.includes(id))return;
    let d=document.getElementById('p9ArmorEquipDialog');if(!d){d=document.createElement('dialog');d.id='p9ArmorEquipDialog';d.className='equipment-dialog';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});}
    const c=cfg(),major=a.baseMajor+c.level,severe=a.baseSevere+c.level;
    d.innerHTML=`<div class="equip-dialog-shell"><div class="equip-dialog-head"><div><span>SWITCH ARMOR</span><h2>${esc(a.name)}</h2><p>Daggerheart does not allow armor changes while in danger or under pressure. Confirm this is a calm/preparation moment.</p></div><button class="equip-dialog-close" type="button" data-close>×</button></div><div class="equip-contexts"><div class="equip-context" style="grid-column:1/-1"><strong>Level ${c.level} thresholds ${major}/${severe} · Armor ${a.score}</strong><p>${esc(a.feature==='—'?'No additional armor feature.':a.feature)}</p><button type="button" data-confirm-armor>Equip owned armor</button></div></div></div>`;
    d.querySelector('[data-close]')?.addEventListener('click',()=>d.close());d.querySelector('[data-confirm-armor]')?.addEventListener('click',()=>{equipArmor(id);d.close();});
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
  }

  function damageSeverity(amount,s){const n=Math.max(0,Number(amount)||0);if(n<=0)return{name:'No damage',hp:0};if(n>=s.severe)return{name:'Severe',hp:3};if(n>=s.major)return{name:'Major',hp:2};return{name:'Minor',hp:1};}
  function resourceAPI(){return activeKey==='marek'?window.GreywakeResources:window.GreywakeCompanion;}
  function openDamage(){
    ensure();const s=combatStats(),a=activeArmor();if(!s||!a)return;
    let d=document.getElementById('p9ArmorDamageDialog');if(!d){d=document.createElement('dialog');d.id='p9ArmorDamageDialog';d.className='damage-dialog';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});}
    d.innerHTML=`<div class="damage-dialog-shell"><div class="damage-dialog-head"><div><span>INCOMING DAMAGE</span><h2>Take Damage</h2><small>${esc(a.name)} · thresholds ${s.major}/${s.severe}</small></div><button class="damage-dialog-close" type="button" data-close>×</button></div><div class="damage-entry"><label><span>Damage total</span><input data-p9-damage type="number" min="0" max="999" value="1"></label><label><span>Damage type</span><select data-p9-type><option value="physical">Physical</option><option value="magic">Magic</option></select></label><label class="damage-direct-toggle"><input data-p9-direct type="checkbox"><span><b>Direct Damage</b><small>Armor Slots cannot reduce it.</small></span></label></div><div data-p9-preview class="damage-preview"></div></div>`;
    const render=()=>{const amount=Number(d.querySelector('[data-p9-damage]')?.value||0),direct=Boolean(d.querySelector('[data-p9-direct]')?.checked),sev=damageSeverity(amount,s),marked=Number(window.GreywakeDamage?.getState?.()?.armorMarked||0),free=Math.max(0,s.armorScore-marked),reduced=Math.max(0,sev.hp-1),canArmor=!direct&&sev.hp>0&&free>0,host=d.querySelector('[data-p9-preview]');host.innerHTML=`<div class="damage-preview-main"><div><span>${direct?'DIRECT ':''}${esc(d.querySelector('[data-p9-type]')?.value||'physical').toUpperCase()} DAMAGE</span><strong>${sev.name}</strong></div><b>${sev.hp} HP</b></div><p>${amount} damage against ${esc(a.name)} thresholds ${s.major}/${s.severe}.</p><div class="damage-apply-actions"><button class="primary" type="button" data-p9-normal ${sev.hp===0?'disabled':''}>${sev.hp?`Take ${sev.hp} HP`:'No HP to mark'}</button><button type="button" data-p9-armor ${canArmor?'':'disabled'}>${direct?'Direct · Armor unavailable':canArmor?`Mark 1 Armor → Take ${reduced} HP`:'No Armor Slot available'}</button></div>`;host.querySelector('[data-p9-normal]')?.addEventListener('click',()=>applyDamage(sev.hp,false));host.querySelector('[data-p9-armor]')?.addEventListener('click',()=>applyDamage(reduced,true));};
    const applyDamage=(hp,useArmor)=>{const api=resourceAPI(),r=api?.getState?.();if(!api||!r)return;if(useArmor){const ds=window.GreywakeDamage?.getState?.();window.GreywakeDamage?.setArmorMarked?.(Number(ds?.armorMarked||0)+1);}api.setResource?.('hp',Math.min(r.maxHP,Number(r.hp||0)+Math.max(0,hp)),`${a.name} damage`);d.close();setTimeout(()=>{decorateDamagePanel();applyStats();},30);};
    d.querySelector('[data-close]')?.addEventListener('click',()=>d.close());d.querySelectorAll('input,select').forEach(n=>n.addEventListener('input',render));render();
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
  }

  function extendEquipmentAPI(){
    const api=window.GreywakeEquipment;if(!api||api.__p9ArmorExtended)return false;
    originalGetState=api.getState?.bind(api);originalImportState=api.importState?.bind(api);
    api.getState=()=>({...((originalGetState?.()||{})),activeArmor:snapshot()?.activeArmor||cfg()?.start,ownedArmor:[...(snapshot()?.ownedArmor||[])],armorMarks:{...(snapshot()?.marksByArmor||{})}});
    api.importState=remote=>{originalImportState?.(remote);ensure();if(remote?.activeArmor&&ARMORS[remote.activeArmor]){rememberCurrentMarks();state.activeArmor=remote.activeArmor;if(Array.isArray(remote.ownedArmor))state.ownedArmor=[...new Set([cfg().start,remote.activeArmor,...remote.ownedArmor].filter(id=>ARMORS[id]))];if(remote.armorMarks&&typeof remote.armorMarks==='object')state.marksByArmor={...state.marksByArmor,...remote.armorMarks};save();const a=activeArmor();window.GreywakeDamage?.setArmorMarked?.(Math.min(a.score,Number(state.marksByArmor[state.activeArmor]||0)));setTimeout(applyStats,20);}};
    api.armorCatalog=()=>Object.values(ARMORS).map(x=>({...x,major:x.baseMajor+(cfg()?.level||1),severe:x.baseSevere+(cfg()?.level||1)}));
    api.armor=id=>armor(id)?{...armor(id),major:armor(id).baseMajor+(cfg()?.level||1),severe:armor(id).baseSevere+(cfg()?.level||1)}:null;
    api.isArmorEquipped=id=>snapshot()?.activeArmor===id;
    api.isArmorOwned=id=>Boolean(snapshot()?.ownedArmor?.includes(id));
    api.addArmor=addArmor;api.equipArmor=equipArmor;api.openArmorEquip=openArmorEquip;api.combatStats=combatStats;api.__p9ArmorExtended=true;return true;
  }

  function schedule(){setTimeout(()=>{const k=key();if(!k)return;load(k);if(!extendEquipmentAPI()){setTimeout(schedule,100);return;}applyStats();},80);}
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-take-damage]');if(!b)return;const s=combatStats();if(!s)return;e.preventDefault();e.stopImmediatePropagation();openDamage();},true);
  window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);window.addEventListener('hashchange',schedule);
  window.addEventListener('greywake:equipment-state-changed',()=>setTimeout(applyStats,0));window.addEventListener('greywake:damage-changed',()=>setTimeout(()=>{rememberCurrentMarks();applyStats();},0));window.addEventListener('greywake:resources-changed',()=>setTimeout(applyStats,0));window.addEventListener('greywake:companion-resources-changed',()=>setTimeout(applyStats,0));
  document.addEventListener('click',e=>{if(e.target.closest?.('#chooseBeastform,#changeBeastform,#dropBeastform,[data-beastform]'))setTimeout(applyStats,160);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();

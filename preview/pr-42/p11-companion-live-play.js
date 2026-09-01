(() => {
  const MAX_WATER=9;
  const SUPPORTED=['velmira','odie'];
  let observer=null, observedRoot=null, timer=null, repairing=false;
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const key=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const active=()=>SUPPORTED.includes(key());
  const combat=()=>window.GreywakeEquipment?.combatStats?.()||null;
  const damage=()=>window.GreywakeDamage?.getState?.()||null;
  const rest=()=>window.GreywakeRest?.getState?.()||null;
  const water=()=>Math.max(0,Math.min(MAX_WATER,Number(rest()?.water)||0));
  const name=()=>key()==='velmira'?'Velmira':'Odie';

  function onCharacterRoute(){return location.hash==='#/character'||Boolean(document.querySelector('#characterSheet .character-sheet-shell'));}
  function stat(label){return [...document.querySelectorAll('#characterSheet .character-stat')].find(n=>n.querySelector('span')?.textContent.trim().toLowerCase()===label.toLowerCase())?.querySelector('strong')?.textContent.trim()||'—';}
  function currentEvasion(){const c=combat();return c?.evasion??stat('Evasion');}
  function waterPips(current){return Array.from({length:MAX_WATER},(_,i)=>`<button type="button" class="live-resource-pip ${i<current?'filled':''}" data-p11-water-value="${i+1}" aria-label="Set Water to ${i+1}" aria-pressed="${i<current?'true':'false'}"></button>`).join('');}
  function armorPips(current,max){return Array.from({length:max},(_,i)=>`<button type="button" class="live-resource-pip ${i<current?'filled':''}" data-p11-armor-value="${i+1}" aria-label="Armor slot ${i+1}${i<current?' marked':''}" aria-pressed="${i<current?'true':'false'}"></button>`).join('');}
  function setWater(value){window.GreywakeRest?.setWater?.(Math.max(0,Math.min(MAX_WATER,Number(value)||0)));}
  function setArmor(value){const score=Number(combat()?.armorScore||stat('Armor'))||0;window.GreywakeDamage?.setArmorMarked?.(Math.max(0,Math.min(score,Number(value)||0)));}

  function ensureWaterRow(){
    const board=document.querySelector('#characterSheet .live-resource-board');if(!board)return;
    const current=water();let row=board.querySelector('.live-resource-water');
    if(!row){row=document.createElement('div');row.className='live-resource-row live-resource-water';const foot=board.querySelector('.live-resource-foot');foot?foot.insertAdjacentElement('beforebegin',row):board.appendChild(row);}
    const signature=String(current);
    if(row.dataset.p11Signature===signature)return;
    row.dataset.p11Signature=signature;
    row.innerHTML=`<div class="live-resource-copy"><span>Water</span><strong>${current}<small> / ${MAX_WATER}</small></strong><em>carried · 1 spent per Short or Long Rest</em></div><div class="live-resource-controls"><button type="button" data-p11-water-delta="-1" ${current<=0?'disabled':''}>−</button><div class="live-resource-pips">${waterPips(current)}</div><button type="button" data-p11-water-delta="1" ${current>=MAX_WATER?'disabled':''}>+</button></div>`;
  }

  function ensureArmorRow(){
    const board=document.querySelector('#characterSheet .live-resource-board'),d=damage(),c=combat();if(!board||!d)return;
    const score=Math.max(0,Number(c?.armorScore||stat('Armor'))||0),current=Math.max(0,Math.min(score,Number(d.armorMarked)||0));
    let row=board.querySelector('.live-resource-armor');
    if(!row){row=document.createElement('div');row.className='live-resource-row live-resource-armor';const waterRow=board.querySelector('.live-resource-water'),foot=board.querySelector('.live-resource-foot');waterRow?waterRow.insertAdjacentElement('beforebegin',row):foot?foot.insertAdjacentElement('beforebegin',row):board.appendChild(row);}
    const signature=`${current}/${score}`;
    if(row.dataset.p11Signature===signature)return;
    row.dataset.p11Signature=signature;
    row.innerHTML=`<div class="live-resource-copy"><span>Armor Slots</span><strong>${current}<small> / ${score}</small></strong><em>marked · click a shield to set marked slots</em></div><div class="live-resource-controls"><div class="live-resource-pips">${armorPips(current,score)}</div></div>`;
  }

  function ensureRestUtility(){
    const title=document.querySelector('#characterSheet .live-resource-board .pro-board-title');if(!title||title.querySelector('.p11-rest-utility'))return;
    const host=document.createElement('div');host.className='p11-rest-utility';host.setAttribute('aria-label','Rest controls');
    host.innerHTML='<button type="button" data-p11-short-rest><span aria-hidden="true">◐</span>Short Rest</button><button type="button" data-p11-long-rest><span aria-hidden="true">☾</span>Long Rest</button>';
    title.appendChild(host);
  }

  function ensureFieldActions(){
    const board=document.querySelector('#characterSheet .live-resource-board');if(!board||board.querySelector('.p11-field-actions'))return;
    const host=document.createElement('div');host.className='p11-field-actions';
    host.innerHTML='<button type="button" class="p11-field-action p11-damage-button" data-p11-take-damage>Take Damage</button><button type="button" class="p11-field-action p11-can-do-button" data-p11-can-do>What can I do?</button><button type="button" class="p11-field-action p11-backpack-button" data-p11-backpack>Backpack</button>';
    board.appendChild(host);
  }

  function ensureEvasionReadout(){
    const mark=document.querySelector('#traitRollPanel .trait-roll-dice-mark');if(!mark)return;
    const value=String(currentEvasion());if(mark.classList.contains('p11-evasion-mark')&&mark.dataset.evasion===value)return;
    mark.classList.add('p11-evasion-mark');mark.dataset.evasion=value;mark.removeAttribute('aria-hidden');mark.setAttribute('aria-label',`Evasion ${value}`);mark.innerHTML=`<span>EVASION</span><strong>${esc(value)}</strong>`;
  }

  function removeDuplicates(){
    document.querySelector('#characterSheet .character-sheet-subtitle')?.classList.add('p11-hidden-duplicate');
    document.querySelector('#characterSheet .pro-record-stamp')?.remove();
    const traits=[...document.querySelectorAll('#characterSheet .sheet-group')].find(g=>g.querySelector('.sheet-group-head h3')?.textContent.trim()==='Traits');traits?.classList.add('p11-hidden-duplicate');
  }
  function positionQuickRolls(){const traits=document.getElementById('traitRollPanel'),board=document.querySelector('#characterSheet .live-resource-board');if(traits&&board&&traits.nextElementSibling!==board)board.insertAdjacentElement('beforebegin',traits);}
  function titleOf(card){return card.querySelector('.active-action-copy strong')?.textContent.trim()||card.querySelector('strong')?.textContent.trim()||'';}
  function available(card){return !card.disabled&&!card.classList.contains('equipment-action-disabled')&&!card.classList.contains('active-action-disabled')&&!card.classList.contains('p10-action-card-unavailable');}
  function ensureCanDoDialog(){let d=document.getElementById('p11CanDoDialog');if(!d){d=document.createElement('dialog');d.id='p11CanDoDialog';d.className='p11-can-do-dialog';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});}return d;}
  function ensureActionDialog(){let d=document.getElementById('p11ActionUseDialog');if(!d){d=document.createElement('dialog');d.id='p11ActionUseDialog';d.className='p11-action-use-dialog';document.body.appendChild(d);}return d;}
  function closeActionUse(){const d=document.getElementById('p11ActionUseDialog'),detail=d?.querySelector('.active-action-detail'),panel=document.getElementById('activeActionsPanel');if(detail&&panel)panel.appendChild(detail);d?.close();}
  function openActionUse(title){
    const panel=document.getElementById('activeActionsPanel'),target=[...(panel?.querySelectorAll('.active-action-card')||[])].find(card=>titleOf(card)===title);if(!panel||!target)return;
    target.click();let tries=0;const wait=()=>{const detail=panel.querySelector('.active-action-detail');if((!detail||!detail.querySelector('button,input,select,.action-roller'))&&tries++<12){setTimeout(wait,25);return;}if(!detail)return;
      const d=ensureActionDialog();d.innerHTML=`<div class="p11-dialog-shell"><div class="equip-dialog-head"><div><span>USE NOW</span><h2>${esc(title)}</h2></div><button type="button" data-close>×</button></div><div class="p11-action-use-body"></div></div>`;d.querySelector('.p11-action-use-body')?.appendChild(detail);d.querySelector('[data-close]')?.addEventListener('click',closeActionUse);d.addEventListener('cancel',e=>{e.preventDefault();closeActionUse();},{once:true});if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');};wait();
  }
  function openCanDo(){
    const panel=document.getElementById('activeActionsPanel'),d=ensureCanDoDialog();if(!panel)return;const cards=[...panel.querySelectorAll('.active-action-card')].filter(available);
    d.innerHTML=`<div class="p11-dialog-shell"><div class="equip-dialog-head"><div><span>AVAILABLE RIGHT NOW</span><h2>What can ${esc(name())} do?</h2><p>Current equipment, abilities and live resources. Select an action to use it.</p></div><button type="button" data-close>×</button></div><div class="p11-can-do-list">${cards.map(card=>{const title=titleOf(card),meta=card.querySelector('em')?.textContent.trim()||'';return `<button type="button" class="p11-can-do-item" data-p11-action-title="${esc(title)}"><span>${card.classList.contains('active-action-attack')?'ATTACK':'ABILITY'}</span><strong>${esc(title)}</strong>${meta?`<small>${esc(meta)}</small>`:''}</button>`;}).join('')||'<p>No currently available actions were found.</p>'}</div></div>`;
    d.querySelector('[data-close]')?.addEventListener('click',()=>d.close());d.querySelectorAll('[data-p11-action-title]').forEach(b=>b.addEventListener('click',()=>{const title=b.dataset.p11ActionTitle;d.close();openActionUse(title);}));if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
  }

  function handleClick(e){
    if(!active()||!onCharacterRoute())return;const t=e.target.closest('button');if(!t||!document.getElementById('characterSheet')?.contains(t))return;
    if(t.matches('[data-p11-water-delta]')){e.preventDefault();setWater(water()+Number(t.dataset.p11WaterDelta||0));return;}
    if(t.matches('[data-p11-water-value]')){e.preventDefault();const v=Number(t.dataset.p11WaterValue||0),cur=water();setWater(cur===v?v-1:v);return;}
    if(t.matches('[data-p11-armor-value]')){e.preventDefault();const d=damage(),score=Math.max(0,Number(combat()?.armorScore||stat('Armor'))||0),cur=Math.max(0,Math.min(score,Number(d?.armorMarked)||0)),v=Number(t.dataset.p11ArmorValue||0);setArmor(cur===v?v-1:v);return;}
    if(t.matches('[data-p11-short-rest]')){e.preventDefault();window.GreywakeRest?.openShort?.();return;}
    if(t.matches('[data-p11-long-rest]')){e.preventDefault();window.GreywakeRest?.openLong?.();return;}
    if(t.matches('[data-p11-take-damage]')){e.preventDefault();window.GreywakeDamage?.openDamage?.();return;}
    if(t.matches('[data-p11-can-do]')){e.preventDefault();openCanDo();return;}
    if(t.matches('[data-p11-backpack]')){e.preventDefault();window.GreywakeBackpack?.open?.();}
  }

  function needsRepair(){const board=document.querySelector('#characterSheet .live-resource-board');return !board||!board.querySelector('.live-resource-water')||!board.querySelector('.live-resource-armor')||!board.querySelector('.p11-field-actions')||!board.querySelector('.p11-rest-utility');}
  function refresh(){if(!active()||!onCharacterRoute())return;ensureWaterRow();ensureArmorRow();ensureRestUtility();ensureFieldActions();ensureEvasionReadout();removeDuplicates();positionQuickRolls();document.body.dataset.p11Companion='true';}
  function repair(){if(repairing||!active()||!onCharacterRoute())return;repairing=true;try{refresh();}finally{setTimeout(()=>{repairing=false;},60);}}
  function verify(){if(!active()||!onCharacterRoute())return;if(needsRepair())repair();else{ensureWaterRow();ensureArmorRow();ensureEvasionReadout();removeDuplicates();positionQuickRolls();}}
  function watch(){if(!active()||!onCharacterRoute())return;const root=document.getElementById('characterSheet');if(!root){timer=setTimeout(watch,150);return;}if(root!==observedRoot){observer?.disconnect();observedRoot=root;root.addEventListener('click',handleClick);observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(verify,90);});observer.observe(root,{childList:true,subtree:true});}verify();}
  function schedule(){clearTimeout(timer);timer=setTimeout(watch,90);}
  for(const event of ['greywake:player-ready','greywake:sheet-enhanced','greywake:companion-resources-changed','greywake:damage-changed','greywake:rest-state-changed','greywake:equipment-state-changed'])window.addEventListener(event,schedule);
  window.addEventListener('hashchange',schedule);document.addEventListener('DOMContentLoaded',schedule);setTimeout(schedule,180);setTimeout(schedule,650);setTimeout(schedule,1400);
  window.GreywakeCompanionLivePlay={refresh};
})();

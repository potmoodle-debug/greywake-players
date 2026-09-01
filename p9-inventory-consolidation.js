(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function bootEquipmentV4(){
    if(document.querySelector('script[data-greywake-equipment-v4]'))return;
    const s=document.createElement('script');s.src='equipment-system-v4.js?v=equipment4';s.defer=true;s.dataset.greywakeEquipmentV4='true';
    s.addEventListener('load',()=>{
      window.dispatchEvent(new CustomEvent('greywake:sheet-enhanced',{detail:{reason:'Equipment v4 ready'}}));
      setTimeout(refresh,100);
    });
    document.head.appendChild(s);
  }

  function hideDuplicateGearView(){
    const gearTab=document.querySelector('[data-sheet-tab="gear"]');
    if(gearTab){
      gearTab.hidden=true;
      gearTab.setAttribute('aria-hidden','true');
      if(gearTab.getAttribute('aria-selected')==='true')document.querySelector('[data-sheet-tab="overview"]')?.click();
    }
  }

  function rerouteReadyGear(){
    const panel=document.getElementById('readyGearPanel');if(!panel)return;
    const button=panel.querySelector('[data-open-gear]');if(!button)return;
    button.textContent='Open Backpack';
    button.setAttribute('aria-label','Open Backpack');
  }

  function renderStoredArmorInBackpack(){
    const api=window.GreywakeEquipment,d=document.getElementById('p7BackpackDialog');
    if(!api||!d||typeof api.armor!=='function')return;
    d.querySelectorAll('[data-p9-backpack-stored-armor]').forEach(n=>n.remove());
    const state=api.getState?.()||{},active=state.activeArmor,owned=Array.isArray(state.ownedArmor)?state.ownedArmor:[];
    const grid=d.querySelector('.p7-backpack-grid');if(!grid)return;
    owned.filter(id=>id&&id!==active).forEach(id=>{
      const a=api.armor(id);if(!a)return;
      const card=document.createElement('article');card.className='p7-pack-card';card.dataset.p9BackpackStoredArmor=id;
      card.innerHTML=`<div class="p7-pack-art" aria-hidden="true"><span style="font-size:34px">⬡</span></div><div class="p7-pack-content"><span class="p7-pack-type">STORED ARMOR · NOT CARRIED</span><h3>${esc(a.name)}</h3><p>Thresholds ${a.major}/${a.severe} · Armor ${a.score}${a.feature&&a.feature!=='—'?` · ${esc(a.feature)}`:''}</p><div class="p9-card-actions"><button type="button" class="p9-item-action" data-p9-equip-stored-armor="${esc(id)}">Equip</button></div></div>`;
      card.querySelector('[data-p9-equip-stored-armor]')?.addEventListener('click',()=>api.openArmorEquip?.(id));
      grid.appendChild(card);
    });
  }

  function refresh(){hideDuplicateGearView();rerouteReadyGear();renderStoredArmorInBackpack();}

  document.addEventListener('click',e=>{
    const openGear=e.target.closest?.('[data-open-gear]');
    if(openGear){e.preventDefault();e.stopImmediatePropagation();window.GreywakeBackpack?.open?.();setTimeout(refresh,50);}
    if(e.target.closest?.('#characterBackpackButton,#p7BackpackEntry .p7-backpack-button'))setTimeout(refresh,60);
  },true);
  window.addEventListener('greywake:equipment-state-changed',()=>setTimeout(refresh,40));
  window.addEventListener('greywake:sheet-enhanced',()=>setTimeout(refresh,60));
  window.addEventListener('greywake:player-ready',()=>setTimeout(refresh,60));
  window.addEventListener('hashchange',()=>setTimeout(refresh,60));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bootEquipmentV4();setTimeout(refresh,80);});else{bootEquipmentV4();setTimeout(refresh,80);}
  window.GreywakeInventoryConsolidation={refresh};
})();

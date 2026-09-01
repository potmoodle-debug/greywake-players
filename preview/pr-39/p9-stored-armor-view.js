(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function renderStoredArmor(){
    const api=window.GreywakeEquipment,manager=document.getElementById('equipmentManager');
    if(!api||!manager||typeof api.armor!=='function')return;
    manager.querySelectorAll('[data-p9-stored-armor]').forEach(n=>n.remove());
    const state=api.getState?.()||{},active=state.activeArmor,owned=Array.isArray(state.ownedArmor)?state.ownedArmor:[];
    const stored=owned.filter(id=>id&&id!==active).map(id=>api.armor(id)).filter(Boolean);
    if(!stored.length)return;
    const packSections=[...manager.querySelectorAll('.equip-section')];
    const pack=packSections.find(section=>section.querySelector('.equip-section-title span')?.textContent.trim()==='PACK')||packSections.at(-1);
    const list=pack?.querySelector('.equip-list');if(!list)return;
    stored.forEach(a=>{
      const card=document.createElement('div');card.className='equip-item inventory gear-only';card.dataset.p9StoredArmor=a.id;
      card.innerHTML=`<span>STORED ARMOR · NOT CARRIED</span><strong>${esc(a.name)}</strong><p>Thresholds ${a.major}/${a.severe} · Armor ${a.score}${a.feature&&a.feature!=='—'?` · ${esc(a.feature)}`:''}</p><div class="equip-item-actions"><button type="button" data-p9-equip-stored="${esc(a.id)}">Equip</button></div>`;
      card.querySelector('[data-p9-equip-stored]')?.addEventListener('click',()=>api.openArmorEquip?.(a.id));
      list.prepend(card);
    });
  }

  let timer;
  function schedule(){clearTimeout(timer);timer=setTimeout(renderStoredArmor,60);}
  window.addEventListener('greywake:equipment-state-changed',schedule);
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-sheet-tab="gear"],#characterBackpackButton,#p7BackpackEntry'))schedule();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  window.GreywakeStoredArmorView={render:renderStoredArmor};
})();

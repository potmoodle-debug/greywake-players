(() => {
  const ITEMS={
    'Minor Health Potion':{id:'minor-health',kind:'hp',label:'HP'},
    'Minor Stamina Potion':{id:'minor-stamina',kind:'stress',label:'Stress'}
  };
  const character=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const resourceAPI=()=>character()==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const backpack=()=>document.getElementById('p7BackpackDialog');
  function resultHost(){
    const d=backpack();if(!d)return null;let host=d.querySelector('[data-p9-consumable-result]');
    if(!host){host=document.createElement('div');host.dataset.p9ConsumableResult='true';host.setAttribute('role','status');host.setAttribute('aria-live','polite');host.style.cssText='margin:0 0 14px;padding:12px 14px;border:1px solid rgba(205,187,121,.45);background:#211c11;color:#f0e2bd;font-weight:700;line-height:1.45';const body=d.querySelector('.p7-backpack-body');body?.prepend(host);}
    return host;
  }
  function show(message){
    window.GreywakeBackpack?.render?.();window.GreywakeEquipmentLibrary?.enhance?.();window.GreywakeInventoryConsolidation?.refresh?.();
    setTimeout(()=>{const host=resultHost();if(host)host.textContent=message;},40);
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest?.('#p7BackpackDialog .p9-item-action');if(!button||!/^Use\b/.test(button.textContent.trim()))return;
    const card=button.closest('.p7-pack-card'),name=card?.querySelector('h3')?.textContent.trim(),item=ITEMS[name];if(!item)return;
    e.preventDefault();e.stopImmediatePropagation();
    const equipment=window.GreywakeEquipment,resources=resourceAPI();if(!equipment||!resources){show('Potion could not be used because the live character resources are unavailable.');return;}
    const beforeResource=resources.getState?.()||{},beforeEquipment=equipment.getState?.()||{},beforeMarked=Number(beforeResource[item.kind]||0),beforeCount=Number(beforeEquipment.consumables?.[item.id]||0);
    const used=equipment.useConsumable?.(item.id);
    if(used?.ok===false){show(used.message||`${name} could not be used.`);return;}
    const afterResource=resources.getState?.()||{},afterEquipment=equipment.getState?.()||{},afterMarked=Number(afterResource[item.kind]||0),afterCount=Number(afterEquipment.consumables?.[item.id]??Math.max(0,beforeCount-1)),cleared=Math.max(0,beforeMarked-afterMarked);
    show(`${name} used — cleared ${cleared} ${item.label}. ${afterCount} ${afterCount===1?'potion':'potions'} remaining.`);
  },true);
})();

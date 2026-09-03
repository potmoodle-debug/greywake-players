(() => {
  const ITEMS={
    'Minor Health Potion':{id:'minor-health',kind:'hp',label:'HP'},
    'Minor Stamina Potion':{id:'minor-stamina',kind:'stress',label:'Stress'}
  };
  const character=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const resourceAPI=()=>character()==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const backpack=()=>document.getElementById('p7BackpackDialog');
  function ensureStyles(){
    if(document.getElementById('p9-consumable-result-styles'))return;
    const style=document.createElement('style');style.id='p9-consumable-result-styles';style.textContent=`
      .p9-consumable-result{margin:0 0 14px;padding:12px 14px;border:1px solid;font-weight:800;line-height:1.45;box-shadow:0 7px 20px rgba(0,0,0,.2)}
      .p9-consumable-result[data-tone="success"]{border-color:rgba(121,185,105,.72);background:linear-gradient(180deg,#1b321c,#122414);color:#ddf5d5;box-shadow:inset 3px 0 0 #79b969,0 7px 20px rgba(0,0,0,.2)}
      .p9-consumable-result[data-tone="error"]{border-color:rgba(194,105,88,.68);background:linear-gradient(180deg,#351d18,#271512);color:#ffd8cf;box-shadow:inset 3px 0 0 #c26958,0 7px 20px rgba(0,0,0,.2)}
      .p9-consumable-result strong{display:block;margin-bottom:2px;font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:inherit}.p9-consumable-result span{display:block;font-size:12px}
    `;document.head.appendChild(style);
  }
  function resultHost(tone='success'){
    const d=backpack();if(!d)return null;ensureStyles();let host=d.querySelector('[data-p9-consumable-result]');
    if(!host){host=document.createElement('div');host.className='p9-consumable-result';host.dataset.p9ConsumableResult='true';host.setAttribute('role','status');host.setAttribute('aria-live','polite');const body=d.querySelector('.p7-backpack-body');body?.prepend(host);}
    host.dataset.tone=tone;return host;
  }
  function show(message,tone='success'){
    window.GreywakeBackpack?.render?.();window.GreywakeEquipmentLibrary?.enhance?.();window.GreywakeInventoryConsolidation?.refresh?.();
    setTimeout(()=>{const host=resultHost(tone);if(host)host.innerHTML=`<strong>${tone==='success'?'Action complete':'Action not completed'}</strong><span>${String(message??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]))}</span>`;},40);
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest?.('#p7BackpackDialog .p9-item-action');if(!button||!/^Use\b/.test(button.textContent.trim()))return;
    const card=button.closest('.p7-pack-card'),name=card?.querySelector('h3')?.textContent.trim(),item=ITEMS[name];if(!item)return;
    e.preventDefault();e.stopImmediatePropagation();
    const equipment=window.GreywakeEquipment,resources=resourceAPI();if(!equipment||!resources){show('Potion could not be used because the live character resources are unavailable.','error');return;}
    const beforeResource=resources.getState?.()||{},beforeEquipment=equipment.getState?.()||{},beforeMarked=Number(beforeResource[item.kind]||0),beforeCount=Number(beforeEquipment.consumables?.[item.id]||0);
    const used=equipment.useConsumable?.(item.id);
    if(used?.ok===false){show(used.message||`${name} could not be used.`,'error');return;}
    const afterResource=resources.getState?.()||{},afterEquipment=equipment.getState?.()||{},afterMarked=Number(afterResource[item.kind]||0),afterCount=Number(afterEquipment.consumables?.[item.id]??Math.max(0,beforeCount-1)),cleared=Math.max(0,beforeMarked-afterMarked);
    show(`${name} used — cleared ${cleared} ${item.label}. ${afterCount} ${afterCount===1?'potion':'potions'} remaining.`,'success');
  },true);
})();

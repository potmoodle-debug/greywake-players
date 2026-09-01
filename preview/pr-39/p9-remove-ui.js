(() => {
  const text=s=>String(s??'').trim();
  const preview=()=>document.body.dataset.gmPreview==='true';
  function api(){return window.GreywakeEquipment||null;}
  function dialog(){return document.getElementById('p7BackpackDialog');}
  function show(message){const d=dialog();if(!d||!message)return;let n=d.querySelector('.p9-library-status');if(!n){n=document.createElement('div');n.className='p9-library-status';d.querySelector('.p7-backpack-body')?.prepend(n);}n.textContent=message;}
  function addButton(host,label,onClick){const b=document.createElement('button');b.type='button';b.className='p9-item-action p9-remove-action';b.textContent=label;b.addEventListener('click',onClick);host.appendChild(b);}
  function rerender(message=''){window.GreywakeBackpack?.render?.();window.GreywakeEquipmentLibrary?.enhance?.();setTimeout(()=>{enhance();window.GreywakeInventoryConsolidation?.refresh?.();if(message)show(message);},30);}
  function ensureHost(card){let host=card.querySelector('.p9-card-actions');if(!host){host=document.createElement('div');host.className='p9-card-actions';card.querySelector('.p7-pack-content')?.appendChild(host);}return host;}
  function enhance(){
    if(preview())return;const d=dialog(),a=api();if(!d||!a)return;
    const state=a.getState?.()||{},weapons=a.catalog?.()||[],armors=a.armorCatalog?.()||[],cons=a.consumables?.()||{};
    d.querySelectorAll('.p7-pack-card').forEach(card=>{
      const title=text(card.querySelector('h3')?.textContent);if(!title)return;
      const host=ensureHost(card);host.querySelectorAll('.p9-remove-action').forEach(x=>x.remove());
      const w=weapons.find(x=>x.name===title);
      if(w){
        if(a.isItemRemoved?.('weapons',w.id)){card.remove();return;}
        if(a.isOwned?.(w.id)&&!a.isEquipped?.(w.id))addButton(host,'Remove',()=>{const r=a.removeWeapon?.(w.id);rerender(r?.message||'Weapon removed.');});
        return;
      }
      const ar=armors.find(x=>x.name===title);
      if(ar){
        if(a.isItemRemoved?.('armor',ar.id)){card.remove();return;}
        if(a.isArmorOwned?.(ar.id)&&!a.isArmorEquipped?.(ar.id))addButton(host,'Remove',()=>{const r=a.removeArmor?.(ar.id);rerender(r?.message||'Armor removed.');});
        return;
      }
      const cid=Object.keys(cons).find(id=>cons[id]?.name===title);
      if(cid&&Number(state.consumables?.[cid]||0)>0){
        addButton(host,'Remove one',()=>{a.adjustConsumable?.(cid,-1);rerender(`Removed one ${title}.`);});
        return;
      }
      const type=text(card.querySelector('.p7-pack-type')?.textContent).toUpperCase();
      if(type==='GEAR'){
        if(a.isItemRemoved?.('gear',title)){card.remove();return;}
        addButton(host,'Remove',()=>{const r=a.removeGear?.(title);rerender(r?.message||`${title} removed.`);});
      }
    });
  }
  const schedule=()=>setTimeout(enhance,70);
  document.addEventListener('click',e=>{if(e.target.closest?.('#characterBackpackButton,#p7BackpackEntry .p7-backpack-button'))schedule();},true);
  window.addEventListener('greywake:equipment-state-changed',schedule);window.addEventListener('greywake:player-ready',schedule);window.addEventListener('hashchange',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();
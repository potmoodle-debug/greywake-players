(() => {
  const text=s=>String(s??'').trim();
  const preview=()=>document.body.dataset.gmPreview==='true';
  function api(){return window.GreywakeEquipment||null;}
  function dialog(){return document.getElementById('p7BackpackDialog');}
  function show(message){const d=dialog();if(!d||!message)return;let n=d.querySelector('.p9-library-status');if(!n){n=document.createElement('div');n.className='p9-library-status';d.querySelector('.p7-backpack-body')?.prepend(n);}n.textContent=message;}
  function addButton(host,label,onClick,cls=''){const b=document.createElement('button');b.type='button';b.className=`p9-item-action p9-remove-action ${cls}`.trim();b.textContent=label;b.addEventListener('click',onClick);host.appendChild(b);return b;}
  function rerender(message=''){window.GreywakeBackpack?.render?.();window.GreywakeEquipmentLibrary?.enhance?.();setTimeout(()=>{enhance();window.GreywakeInventoryConsolidation?.refresh?.();if(message)show(message);},30);}
  function ensureHost(card){let host=card.querySelector('.p9-card-actions');if(!host){host=document.createElement('div');host.className='p9-card-actions';card.querySelector('.p7-pack-content')?.appendChild(host);}return host;}
  function enhanceLibrary(){
    const d=dialog(),a=api();if(!d||!a)return;const panel=d.querySelector('.p9-library');if(!panel)return;
    const state=a.getState?.()||{},cons=a.consumables?.()||{};
    panel.querySelectorAll('[data-p9-add^="consumable:"]').forEach(button=>{
      const id=button.dataset.p9Add.split(':')[1],item=cons[id];if(!item)return;
      const count=Number(state.consumables?.[id]||0),full=count>=5;
      button.disabled=full||preview();
      button.textContent=full?`Max · ${count}/5`:count?`Add one · ${count}/5`:'Add';
    });
  }
  function enhance(){
    if(preview())return;const d=dialog(),a=api();if(!d||!a)return;
    const state=a.getState?.()||{},weapons=a.catalog?.()||[],armors=a.armorCatalog?.()||[],cons=a.consumables?.()||{};
    enhanceLibrary();
    d.querySelectorAll('.p7-pack-card').forEach(card=>{
      const title=text(card.querySelector('h3')?.textContent);if(!title)return;
      const host=ensureHost(card);host.querySelectorAll('.p9-remove-action,.p9-potion-count,.p9-potion-add-one').forEach(x=>x.remove());
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
        const count=Number(state.consumables?.[cid]||0);
        const badge=document.createElement('span');badge.className='p9-potion-count';badge.textContent=`${count}/5`;badge.style.cssText='align-self:center;padding:7px 9px;border:1px solid rgba(205,187,121,.25);color:#d8c582;font-weight:900;font-size:10px';host.appendChild(badge);
        const plus=addButton(host,'Add one',()=>{a.adjustConsumable?.(cid,1);rerender(`Added one ${title}.`);},'p9-potion-add-one');plus.disabled=count>=5;
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
  function ensureDamageUndo(){
    if(window.GreywakeDamageUndo||document.querySelector('script[data-p9-damage-undo]'))return;
    const s=document.createElement('script');s.src='p9-damage-undo.js?v=p9damageundo1';s.defer=true;s.dataset.p9DamageUndo='true';document.head.appendChild(s);
  }
  const schedule=()=>setTimeout(enhance,70);
  document.addEventListener('click',e=>{if(e.target.closest?.('#characterBackpackButton,#p7BackpackEntry .p7-backpack-button,[data-pack-add-open],[data-filter="consumable"]'))schedule();},true);
  window.addEventListener('greywake:equipment-state-changed',schedule);window.addEventListener('greywake:player-ready',schedule);window.addEventListener('hashchange',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureDamageUndo();schedule();});else{ensureDamageUndo();schedule();}
})();
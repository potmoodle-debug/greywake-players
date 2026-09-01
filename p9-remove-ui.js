(() => {
  const esc=s=>String(s??'').trim();
  const character=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const preview=()=>document.body.dataset.gmPreview==='true';
  const starts={
    marek:{weapons:new Set(['shortstaff','round-shield']),armor:'gambeson'},
    velmira:{weapons:new Set(['greatstaff','whip']),armor:'leather-armor'},
    odie:{weapons:new Set(['spear','small-dagger']),armor:'gambeson'}
  };
  function api(){return window.GreywakeEquipment||null;}
  function dialog(){return document.getElementById('p7BackpackDialog');}
  function show(text){
    const d=dialog();if(!d||!text)return;
    let n=d.querySelector('.p9-library-status');
    if(!n){n=document.createElement('div');n.className='p9-library-status';d.querySelector('.p7-backpack-body')?.prepend(n);}
    n.textContent=text;
  }
  function addButton(host,label,onClick){
    const b=document.createElement('button');b.type='button';b.className='p9-item-action p9-remove-action';b.textContent=label;b.addEventListener('click',onClick);host.appendChild(b);
  }
  function enhance(){
    if(preview())return;const d=dialog(),a=api();if(!d||!a)return;
    const state=a.getState?.()||{},who=starts[character()]||{weapons:new Set(),armor:''};
    const weapons=a.catalog?.()||[],armors=a.armorCatalog?.()||[],cons=a.consumables?.()||{};
    d.querySelectorAll('.p7-pack-card').forEach(card=>{
      const title=esc(card.querySelector('h3')?.textContent);if(!title)return;
      let host=card.querySelector('.p9-card-actions');if(!host)return;
      host.querySelectorAll('.p9-remove-action').forEach(x=>x.remove());
      const w=weapons.find(x=>x.name===title);
      if(w){
        const active=a.isEquipped?.(w.id),owned=a.isOwned?.(w.id);
        if(owned&&!active&&!who.weapons.has(w.id))addButton(host,'Remove',()=>{const r=a.removeWeapon?.(w.id);show(r?.message||'Item removed.');setTimeout(()=>{window.GreywakeBackpack?.render?.();window.GreywakeEquipmentLibrary?.enhance?.();setTimeout(enhance,20);},20);});
        return;
      }
      const ar=armors.find(x=>x.name===title);
      if(ar){
        const active=a.isArmorEquipped?.(ar.id),owned=a.isArmorOwned?.(ar.id);
        if(owned&&!active&&who.armor!==ar.id)addButton(host,'Remove',()=>{const r=a.removeArmor?.(ar.id);show(r?.message||'Stored armor removed.');setTimeout(()=>{window.GreywakeBackpack?.render?.();window.GreywakeEquipmentLibrary?.enhance?.();setTimeout(enhance,20);},20);});
        return;
      }
      const cid=Object.keys(cons).find(id=>cons[id]?.name===title);
      if(cid&&Number(state.consumables?.[cid]||0)>0){
        addButton(host,'Remove one',()=>{const r=a.adjustConsumable?.(cid,-1);show(r?.message||`${title} removed.`);setTimeout(()=>{window.GreywakeBackpack?.render?.();window.GreywakeEquipmentLibrary?.enhance?.();setTimeout(enhance,20);},20);});
      }
    });
  }
  const schedule=()=>setTimeout(enhance,70);
  document.addEventListener('click',e=>{if(e.target.closest?.('#characterBackpackButton,#p7BackpackEntry .p7-backpack-button'))schedule();},true);
  window.addEventListener('greywake:equipment-state-changed',schedule);window.addEventListener('greywake:player-ready',schedule);window.addEventListener('hashchange',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();

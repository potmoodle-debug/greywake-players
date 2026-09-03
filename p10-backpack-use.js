(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const dialog=()=>document.getElementById('p7BackpackDialog');
  const equipment=()=>window.GreywakeEquipment||null;
  const preview=()=>document.body.dataset.gmPreview==='true';

  function ensureStyles(){
    if(document.getElementById('p10-backpack-use-styles'))return;
    const s=document.createElement('style');s.id='p10-backpack-use-styles';s.textContent=`
      .p10-backpack-use-note{margin:0 0 12px;padding:10px 12px;border:1px solid rgba(205,187,121,.24);background:#17150f;color:#9f9782;font-size:10px;line-height:1.45}
      .p10-backpack-use-note strong{color:#e6d39a}.p10-backpack-use-status{margin:0 0 14px;padding:12px 14px;border:1px solid rgba(121,185,105,.66);background:linear-gradient(180deg,#1b321c,#122414);color:#ddf5d5;box-shadow:inset 3px 0 0 #79b969;font-size:11px;line-height:1.45}
      .p10-backpack-use-status strong{display:block;margin-bottom:2px;font-size:9px;letter-spacing:.13em;text-transform:uppercase}.p10-gear-use{border:1px solid #8e7640;background:#322716;color:#ffe29b;padding:8px 10px;font-weight:800;cursor:pointer;width:100%}
    `;document.head.appendChild(s);
  }

  function showStatus(message){
    const d=dialog();if(!d)return;let host=d.querySelector('[data-p10-backpack-use-status]');
    if(!host){host=document.createElement('div');host.className='p10-backpack-use-status';host.dataset.p10BackpackUseStatus='true';const body=d.querySelector('.p7-backpack-body');body?.prepend(host);}
    host.innerHTML=`<strong>Item in use</strong>${esc(message)}`;
  }

  function addNote(){
    const d=dialog(),body=d?.querySelector('.p7-backpack-body');if(!body||body.querySelector('[data-p10-backpack-use-note]'))return;
    const note=document.createElement('div');note.className='p10-backpack-use-note';note.dataset.p10BackpackUseNote='true';note.innerHTML='<strong>Use items here.</strong> Weapons, armor, consumables and special gear use their live rules. Ordinary gear can be declared in use here and then resolved normally if a roll is needed.';
    const filters=body.querySelector('.p7-backpack-filters');(filters||body.firstElementChild)?.insertAdjacentElement(filters?'afterend':'afterend',note);
  }

  function findWeapon(title){return (equipment()?.catalog?.()||[]).find(x=>x?.name===title)||null;}
  function findConsumable(title){const all=equipment()?.consumables?.()||{};return Object.entries(all).map(([id,v])=>({id,...v})).find(x=>x?.name===title)||null;}
  function findArmor(title){const api=equipment();const list=api?.armorCatalog?.()||[];return list.find(x=>x?.name===title)||null;}

  function actionHost(card){let host=card.querySelector('.p9-card-actions');if(!host){host=document.createElement('div');host.className='p9-card-actions';card.querySelector('.p7-pack-content')?.appendChild(host);}return host;}

  function bindFallbackMechanical(card,title){
    const api=equipment();if(!api||preview())return false;
    const existing=card.querySelector('.p9-card-actions .p9-item-action');if(existing)return true;
    const weapon=findWeapon(title);if(weapon){
      const host=actionHost(card),b=document.createElement('button');b.type='button';b.className='p9-item-action';
      const active=Boolean(api.isEquipped?.(weapon.id));b.textContent=active?'Use':'Equip';
      b.addEventListener('click',()=>active?api.openWeaponUse?.(weapon.id):api.openEquip?.(weapon.id));host.appendChild(b);return true;
    }
    const consumable=findConsumable(title);if(consumable){
      const count=Number(api.getState?.()?.consumables?.[consumable.id]||0);if(count<1)return false;
      const host=actionHost(card),b=document.createElement('button');b.type='button';b.className='p9-item-action';b.textContent=`Use · ${count} left`;
      b.addEventListener('click',()=>api.useConsumable?.(consumable.id));host.appendChild(b);return true;
    }
    const armor=findArmor(title);if(armor){
      const host=actionHost(card),b=document.createElement('button');b.type='button';b.className='p9-item-action';const active=Boolean(api.isArmorEquipped?.(armor.id));
      b.textContent=active?'Equipped':'Equip';b.disabled=active;b.addEventListener('click',()=>{if(!active)api.openArmorEquip?.(armor.id);});host.appendChild(b);return true;
    }
    return false;
  }

  function bindGear(card,title){
    if(preview()||card.querySelector('[data-p10-gear-use]'))return;
    const host=actionHost(card),b=document.createElement('button');b.type='button';b.className='p10-gear-use';b.dataset.p10GearUse='true';
    if(title==='Nomadic Pack'&&window.GreywakeNomadicPack?.open){
      b.textContent='Use Nomadic Pack';b.addEventListener('click',()=>{dialog()?.close?.();setTimeout(()=>window.GreywakeNomadicPack?.open?.(),20);});
    }else{
      b.textContent='Use in scene';b.addEventListener('click',()=>{
        showStatus(`${title} is being used. Describe how you are using it; if the outcome is uncertain, resolve it with the normal Daggerheart action roll.`);
        window.dispatchEvent(new CustomEvent('greywake:item-used',{detail:{item:title,source:'backpack'}}));
      });
    }
    host.appendChild(b);
  }

  function enhance(){
    ensureStyles();const d=dialog();if(!d)return;
    window.GreywakeEquipmentLibrary?.enhance?.();addNote();
    d.querySelectorAll('.p7-pack-card').forEach(card=>{
      const title=card.querySelector('h3')?.textContent?.trim();if(!title)return;
      if(bindFallbackMechanical(card,title))return;
      const kind=card.dataset.packKind||'';
      const type=(card.querySelector('.p7-pack-type')?.textContent||'').toLowerCase();
      if(kind==='gear'||kind==='custom'||type.includes('gear')||type.includes('backpack item'))bindGear(card,title);
    });
  }

  const schedule=(delay=70)=>setTimeout(enhance,delay);
  document.addEventListener('click',e=>{if(e.target.closest?.('#characterBackpackButton,#p7BackpackEntry .p7-backpack-button,[data-open-gear]'))schedule(90);},true);
  window.addEventListener('greywake:equipment-state-changed',()=>schedule(60));
  window.addEventListener('greywake:player-ready',()=>schedule(100));
  window.addEventListener('greywake:sheet-enhanced',()=>schedule(100));
  window.addEventListener('hashchange',()=>schedule(100));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>schedule(120));else schedule(120);
  window.GreywakeBackpackUse={enhance};
})();

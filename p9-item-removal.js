(() => {
  const PREFIX='greywake:p9-removed-items:v1:';
  const character=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const preview=()=>document.body.dataset.gmPreview==='true';
  const key=()=>`${PREFIX}${character()}${preview()?':gmtest':''}`;
  const load=()=>{try{const raw=JSON.parse(localStorage.getItem(key())||'null');return{weapons:Array.isArray(raw?.weapons)?raw.weapons:[],armor:Array.isArray(raw?.armor)?raw.armor:[],gear:Array.isArray(raw?.gear)?raw.gear:[]};}catch(_){return{weapons:[],armor:[],gear:[]};}};
  const save=s=>{try{localStorage.setItem(key(),JSON.stringify(s));}catch(_){}};
  const has=(kind,id)=>load()[kind]?.includes(id);
  const setRemoved=(kind,id,removed=true)=>{const s=load(),list=new Set(s[kind]||[]);removed?list.add(id):list.delete(id);s[kind]=[...list];save(s);window.dispatchEvent(new CustomEvent('greywake:equipment-state-changed',{detail:{ok:true,key:character(),reason:removed?'Item removed':'Item restored'}}));return s;};

  function extend(){
    const api=window.GreywakeEquipment;if(!api||api.__p9RemovalExtended||!api.getState)return false;
    const original={
      getState:api.getState.bind(api),
      isOwned:api.isOwned?.bind(api),
      addWeapon:api.addWeapon?.bind(api),
      removeWeapon:api.removeWeapon?.bind(api),
      isArmorOwned:api.isArmorOwned?.bind(api),
      addArmor:api.addArmor?.bind(api)
    };

    api.getState=()=>{
      const s=original.getState()||{},r=load();
      return{...s,
        ownedWeapons:(s.ownedWeapons||[]).filter(id=>!r.weapons.includes(id)),
        inventoryWeapons:(s.inventoryWeapons||[]).filter(id=>!r.weapons.includes(id)),
        ownedArmor:(s.ownedArmor||[]).filter(id=>!r.armor.includes(id))
      };
    };
    api.isOwned=id=>!has('weapons',id)&&Boolean(original.isOwned?.(id));
    api.isArmorOwned=id=>!has('armor',id)&&Boolean(original.isArmorOwned?.(id));

    api.removeWeapon=id=>{
      if(preview())return{ok:false,message:'Items cannot be removed in GM preview.'};
      const s=original.getState()||{};
      if(s.activePrimary===id||s.activeSecondary===id)return{ok:false,message:'Equip something else before removing an active weapon.'};
      if(!original.isOwned?.(id))return{ok:false,message:'That weapon is not owned.'};
      const result=original.removeWeapon?.(id);
      if(result?.ok)return result;
      setRemoved('weapons',id,true);
      return{ok:true,message:'Weapon removed from the backpack.'};
    };
    api.addWeapon=id=>{
      if(has('weapons',id)){
        setRemoved('weapons',id,false);
        return{ok:true,message:'Weapon added back to the backpack.'};
      }
      return original.addWeapon?.(id)||{ok:false,message:'Weapon could not be added.'};
    };

    api.removeArmor=id=>{
      if(preview())return{ok:false,message:'Items cannot be removed in GM preview.'};
      const s=original.getState()||{};
      if(s.activeArmor===id)return{ok:false,message:'Equip different armor before removing the active set.'};
      if(!original.isArmorOwned?.(id))return{ok:false,message:'That armor is not owned.'};
      setRemoved('armor',id,true);
      return{ok:true,message:'Stored armor removed.'};
    };
    api.addArmor=id=>{
      if(has('armor',id)){
        setRemoved('armor',id,false);
        return{ok:true,message:'Armor added back to storage.'};
      }
      return original.addArmor?.(id)||{ok:false,message:'Armor could not be added.'};
    };

    api.isItemRemoved=(kind,id)=>has(kind,id);
    api.removeGear=name=>{if(preview())return{ok:false};setRemoved('gear',String(name||''),true);return{ok:true,message:`${name} removed from the backpack.`};};
    api.restoreGear=name=>{setRemoved('gear',String(name||''),false);return{ok:true};};
    api.__p9RemovalExtended=true;
    return true;
  }
  function schedule(){if(!extend())setTimeout(schedule,100);}
  window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);window.addEventListener('hashchange',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();
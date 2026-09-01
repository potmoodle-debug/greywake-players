(() => {
  function character(){return String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();}
  function preview(){return document.body.dataset.gmPreview==='true';}
  function extend(){
    const api=window.GreywakeEquipment;if(!api||api.__p9RemovalExtended||!api.getState||!api.importState)return false;
    api.removeArmor=id=>{
      if(preview())return{ok:false,message:'Armor cannot be removed in GM preview.'};
      const s=api.getState?.();if(!s)return{ok:false,message:'Equipment state unavailable.'};
      if(s.activeArmor===id)return{ok:false,message:'Equip different armor before removing this set.'};
      const starts={marek:'gambeson',odie:'gambeson',velmira:'leather-armor'};
      if(starts[character()]===id)return{ok:false,message:'Starting armor is part of the canonical character record.'};
      if(!Array.isArray(s.ownedArmor)||!s.ownedArmor.includes(id))return{ok:false,message:'That armor is not owned.'};
      const next={...s,ownedArmor:s.ownedArmor.filter(x=>x!==id)};
      api.importState?.(next);
      window.dispatchEvent(new CustomEvent('greywake:equipment-state-changed',{detail:{ok:true,key:character(),reason:'Removed stored armor',state:api.getState?.()}}));
      return{ok:true,message:'Stored armor removed.'};
    };
    api.__p9RemovalExtended=true;return true;
  }
  function schedule(){if(!extend())setTimeout(schedule,100);}
  window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);window.addEventListener('hashchange',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();

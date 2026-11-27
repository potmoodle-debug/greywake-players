/* Offline GM rehearsal provider: receives pre-projected player-safe records
   only. All perspectives are deliberately present on the GM's computer.
   Never deploy a populated rehearsal pack to the public player site. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.GreywakeRehearsalProvider=api;
})(typeof window==='object'?window:globalThis,function(){
  const norm=v=>String(v||'').trim().toLowerCase();
  const copy=v=>JSON.parse(JSON.stringify(v));
  function create(pack){
    if(!pack||pack.format!=='greywake-knowledge-rehearsal-v1'||!Array.isArray(pack.managedRecordKeys)||!Array.isArray(pack.perspectives))throw Error('Invalid rehearsal pack');
    const keys=new Set(pack.managedRecordKeys);
    if(keys.size!==pack.managedRecordKeys.length||[...keys].some(k=>typeof k!=='string'||!k.trim()))throw Error('Invalid record registry');
    const views=new Map();
    for(const p of pack.perspectives){
      const id=norm(p?.characterId);
      if(!id||id==='gm'||views.has(id)||!Array.isArray(p.records))throw Error('Invalid perspective');
      const seen=new Set();
      for(const r of p.records){
        if(!keys.has(r?.recordKey)||seen.has(r.recordKey)||!Array.isArray(r.claims)||r.claims.some(c=>!['common','party','personal','selective'].includes(c?.visibility)||!Number.isInteger(c.tier)||c.tier<1||c.tier>4))throw Error('Invalid player projection');
        seen.add(r.recordKey);
      }
      views.set(id,copy({characterId:id,records:p.records}));
    }
    return {managedRecordKeys:[...keys],load:async characterId=>{
      const id=norm(characterId);
      return copy(views.get(id)||{characterId:id,records:[]});
    }};
  }
  return {create};
});

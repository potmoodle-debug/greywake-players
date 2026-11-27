/* Versioned read-only knowledge provider. Legacy code convention is a trusted-group
   preference, NOT strong authentication. New records arrive as scoped data. */
(() => {
  const registry=window.GREYWAKE_KNOWLEDGE_REGISTRY;
  const API='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-knowledge-projection?version=2';
  const API_KEY="sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl";
  const D=window.GREYWAKE_DATA,C=window.GREYWAKE_CATEGORIES;
  if(!D||!C||!Array.isArray(registry?.records))return;
  const categories=new Set(["World","Locations","Factions","People","Flora & Fauna","Caravans","Sessions","Objects","Personal Knowledge"]);
  const records=new Map(registry.records.map(r=>[r.key,r]));
  const dynamic=new Map();
  for(const r of registry.records){
    if(!Object.prototype.hasOwnProperty.call(D,r.key))D[r.key]={title:r.title,category:r.category,html:'<p>Character-perspective record. Use player preview to view the individual account.</p>'};
    const list=C[r.category]||(C[r.category]=[]);
    if(!list.includes(r.key))list.push(r.key);
  }
  function resetVisible(){
    for(const [key,meta] of dynamic){
      if(D[key]===meta.entry)delete D[key];
      const arr=C[meta.category];if(arr){const i=arr.indexOf(key);if(i>=0)arr.splice(i,1);}
    }
    dynamic.clear();
  }
  function registerVisible(visible){
    for(const r of visible){
      if(records.has(r.recordKey)){
        if(r.category&&r.category!==records.get(r.recordKey).category)throw Error('Legacy subject category mismatch');
        continue;
      }
      if(!categories.has(r.category)||Object.prototype.hasOwnProperty.call(D,r.recordKey))throw Error('Unregistered legacy alias or category');
    }
    for(const r of visible){
      if(records.has(r.recordKey))continue;
      const entry={title:r.title,category:r.category,kind:r.kind,knowledgeDynamic:true,html:''};
      D[r.recordKey]=entry;const arr=C[r.category]||(C[r.category]=[]);
      if(!arr.includes(r.recordKey))arr.push(r.recordKey);
      dynamic.set(r.recordKey,{entry,category:r.category,kind:r.kind});
    }
  }
  const oldTitles=new Set([...(registry.legacyCards||[]),...registry.records.flatMap(r=>r.legacyCards||[])]);
  window.GREYWAKE_KNOWLEDGE_PROVIDER={
    managedRecordKeys:registry.records.map(r=>r.key),
    baselineRevision:registry.baselineRevision||'',
    allowNewRecords:true, categories:[...categories],registerVisible,resetVisible,
    mediaAllowed:(key,record)=>{const r=records.get(key);return !!r&&(r.publicMedia===true||record?.claims.some(c=>c.id===r.mediaClaimId||r.mediaClaimIds?.includes(c.id)))},
    kindFor:key=>records.get(key)?.kind||dynamic.get(key)?.kind,
    replacesLegacyCard:title=>oldTitles.has(title),
    includePersonal:(key,record)=>D[key]?.category!=='Sessions'&&record?.claims.some(c=>c.visibility==='personal'||c.visibility==='selective'||c.visibility==='party'&&c.acquisition==='witnessed'),
    load:async characterId=>{
      const user=window.GreywakePlayer;
      if(user?.role!=='player'||String(user.character||'').toLowerCase()!==characterId||!user.code)throw Error('Player perspective unavailable');
      const r=await fetch(API,{method:'GET',cache:'no-store',headers:{apikey:API_KEY,'x-greywake-character':characterId,'x-greywake-code':user.code}});
      if(!r.ok)throw Error('Knowledge provider unavailable');
      return r.json();
    }
  };
})();

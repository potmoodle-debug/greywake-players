/* Public registry contains record names only; scoped claim text is fetched.
   Legacy login deliberately retained. No service credentials or private claims. */
(() => {
  const registry=[
  {
    "key": "Foldling",
    "title": "Foldling",
    "category": "Flora & Fauna",
    "mediaClaimId": "foldling-study",
    "legacyCards": [
      "The Foldling",
      "Foldling-form Agile Scout",
      "What the Foldling Told You",
      "What Marek Shared"
    ]
  },
  {
    "key": "Cistern Plate",
    "title": "Cistern Plate",
    "category": "Objects",
    "legacyCards": [
      "Same Technological Rules",
      "Lower-Draw Sectional"
    ]
  },
  {
    "key": "Mara Vell",
    "title": "Mara Vell",
    "category": "People",
    "publicMedia": true
  },
  {
    "key": "The Stripped Yards",
    "title": "The Stripped Yards",
    "category": "Locations"
  },
  {
    "key": "Session 04 — Player Recap",
    "title": "Session 04 — The Closing Ways",
    "category": "Sessions"
  },
  {
    "key": "Session 05 — Player Recap",
    "title": "Session 05 — The Southern Ways",
    "category": "Sessions"
  }
];
  const API='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-knowledge-projection';
  const API_KEY="sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl";
  const D=window.GREYWAKE_DATA,C=window.GREYWAKE_CATEGORIES;
  if(!D||!C)return;
  const records=new Map(registry.map(r=>[r.key,r]));
  for(const r of registry){
    if(!D[r.key])D[r.key]={title:r.title,category:r.category,html:'<p>Character-perspective record. Use player preview to view the individual account.</p>'};
    const list=C[r.category]||(C[r.category]=[]);
    if(!list.includes(r.key))list.push(r.key);
  }
  window.GREYWAKE_KNOWLEDGE_PROVIDER={
    managedRecordKeys:registry.map(r=>r.key),
    mediaAllowed:(key,record)=>{const r=records.get(key);return !!r&&(r.publicMedia===true||!!r.mediaClaimId&&record?.claims.some(c=>c.id===r.mediaClaimId))},
    replacesLegacyCard:title=>registry.some(r=>r.legacyCards?.includes(title)),
    includePersonal:key=>records.get(key)?.category!=='Sessions',
    load:async characterId=>{
      const user=window.GreywakePlayer;
      if(user?.role!=='player'||String(user.character||'').toLowerCase()!==characterId||!user.code)throw Error('Player perspective unavailable');
      const r=await fetch(API,{method:'GET',cache:'no-store',headers:{apikey:API_KEY,'x-greywake-character':characterId,'x-greywake-code':user.code}});
      if(!r.ok)throw Error('Knowledge provider unavailable');
      return r.json();
    }
  };
})();

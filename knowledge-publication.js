/* Player publication boundary. Do not ship private preparation in this public site.
   Explicit knowledgeStatus is independent of world canon and character visibility.
   Legacy published records without a status remain compatible.
   Corrected records can declare knowledgeRevision; overlays must match it exactly. */
(() => {
  const isPublished=record=>Boolean(record)&&(!Object.hasOwn(record,'knowledgeStatus')||record.knowledgeStatus==='established'||record.knowledgeStatus==='reported'||record.knowledgeStatus==='interest');
  const allowsUpdate=(recordRevision,updateRevision)=>recordRevision?recordRevision===updateRevision:!updateRevision;
  function filterArchive(data,categories,edges,discoveries){
    const excluded=new Set(Object.keys(data).filter(key=>!isPublished(data[key])));
    for(const key of excluded)delete data[key];
    for(const names of Object.values(categories))if(Array.isArray(names)){
      for(let i=names.length-1;i>=0;i--)if(excluded.has(names[i]))names.splice(i,1);
    }
    for(let i=edges.length-1;i>=0;i--)if(edges[i].some(key=>excluded.has(key)))edges.splice(i,1);
    for(let i=discoveries.length-1;i>=0;i--)if(excluded.has(discoveries[i].note)||!isPublished(discoveries[i]))discoveries.splice(i,1);
    return excluded.size;
  }
  window.GreywakeKnowledgePublication={isPublished,allowsUpdate,filterArchive};
  if(window.GREYWAKE_DATA)filterArchive(window.GREYWAKE_DATA,window.GREYWAKE_CATEGORIES||{},window.GREYWAKE_EDGES||[],window.GREYWAKE_DISCOVERIES||[]);
})();

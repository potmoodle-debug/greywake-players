/* Character-facing record projection adapter. A provider supplies already
   scoped payloads, never raw GM records. Legacy login is a trust convention,
   not authorization. Optional on this isolated development branch. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else {
    const view=api.create();root.GreywakeKnowledgeView=view;
    // Explicit opt-in only. No provider or private fixtures in the static site.
    const config=root.GREYWAKE_KNOWLEDGE_PROVIDER;
    if(config){
      view.configure(config);
      const notify=()=>root.dispatchEvent(new CustomEvent('greywake:knowledge-view-changed'));
      const sync=()=>{
        const user=root.GreywakePlayer;
        const pending=view.select(user?.role==='player'?user.character:null);
        notify();pending.then(notify);
      };
      root.addEventListener('greywake:player-ready',sync);
      root.addEventListener('greywake:knowledge-retry',sync);
      root.addEventListener('pagehide',()=>view.clear());
      root.addEventListener('pageshow',e=>{if(e.persisted)sync()});
      sync();
    }
  }
})(typeof window==='object'?window:globalThis,function(){
  const kinds={common:'Common knowledge',party:'Shared party knowledge',personal:'Your personal knowledge',selective:'Knowledge shared with you'};
  const source={common:'Common knowledge',witnessed:'Witnessed',investigated:'Investigated',practical:'Practical experience',reported:'Reported',rumour:'Rumour',inferred:'Inference',insider:'Insider knowledge',unknown:'Unknown'};
  const certainty=new Set(['established','reported','rumour','inferred','belief','unknown']);
  const nonempty=v=>typeof v==='string'&&v.trim().length>0;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const own=(obj,k)=>Object.prototype.hasOwnProperty.call(obj,k);
  const normalize=v=>String(v||'').trim().toLowerCase();
  const safeKey=v=>nonempty(v)&&v.length<=180&&!/[<>"\u0000-\u001f]/.test(v)&&!Object.prototype.hasOwnProperty.call(Object.prototype,v)&&v!=='prototype';
  function create(){
    let baseManaged=new Set(),managed=new Set(),records=new Map(),edges=[],edgeKeys=new Set(),identity='',epoch=0,ready=false,config=null,status='idle';
    const pair=(a,b)=>JSON.stringify([a,b].sort());
    function reset(){
      config?.resetVisible?.();managed=new Set(baseManaged);records=new Map();edges=[];edgeKeys=new Set();ready=false;
    }
    function configure(nextConfig){
      if(!nextConfig||!Array.isArray(nextConfig.managedRecordKeys)||typeof nextConfig.load!=='function')throw Error('Invalid knowledge provider');
      if(nextConfig.managedRecordKeys.some(k=>!safeKey(k)))throw Error('Invalid record key');
      reset();config=nextConfig;baseManaged=new Set(config.managedRecordKeys);managed=new Set(baseManaged);identity='';status='idle';epoch++;
    }
    function clear(){reset();identity='';status='idle';epoch++}
    function isManaged(key){return managed.has(key)}
    function validate(payload,expected){
      if(!payload||normalize(payload.characterId)!==expected||!Array.isArray(payload.records))throw Error('Mismatched knowledge perspective');
      const dynamic=config?.allowNewRecords===true;
      if(dynamic&&(payload.version!==2||!Array.isArray(payload.relationships)))throw Error('Unsupported knowledge response');
      const cats=new Set(config?.categories||[]),next=new Map(),keys=new Set(baseManaged);
      for(const r of payload.records){
        if(!r||!safeKey(r.recordKey)||!nonempty(r.id)||!safeKey(r.title)||!Array.isArray(r.claims)||next.has(r.recordKey))throw Error('Malformed knowledge record');
        if(!keys.has(r.recordKey)){
          if(!dynamic||!cats.has(r.category))throw Error('Unexpected knowledge record');
          keys.add(r.recordKey);
        }
        if(r.category!==undefined&&dynamic&&!cats.has(r.category))throw Error('Invalid record category');
        if(r.kind!==undefined&&!['flora','fauna'].includes(r.kind))throw Error('Invalid field-guide kind');
        const seen=new Set();
        const claims=r.claims.map(c=>{
          if(!c||!nonempty(c.id)||seen.has(c.id)||!Number.isSafeInteger(c.revision)||c.revision<1||!nonempty(c.body)||!own(kinds,c.visibility)||!own(source,c.acquisition)||!certainty.has(c.certainty)||!Number.isInteger(c.tier)||c.tier<1||c.tier>4)throw Error('Invalid player knowledge claim');
          if(c.discovered!==undefined&&(typeof c.discovered!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(c.discovered)))throw Error('Invalid discovery date');
          seen.add(c.id);return {id:c.id,revision:c.revision,body:c.body,visibility:c.visibility,acquisition:c.acquisition,certainty:c.certainty,tier:c.tier,...(c.discovered?{discovered:c.discovered}:{})};
        });
        if(claims.length)next.set(r.recordKey,{recordKey:r.recordKey,id:r.id,title:r.title,category:r.category,kind:r.kind,claims});
      }
      const validEdges=[],seenPairs=new Set();
      for(const e of dynamic?payload.relationships:[]){
        if(!Array.isArray(e)||e.length!==2||e[0]===e[1]||!next.has(e[0])||!next.has(e[1]))throw Error('Relationship outside perspective');
        const k=pair(...e);if(!seenPairs.has(k)){seenPairs.add(k);validEdges.push([...e]);}
      }
      return {next,keys,validEdges,seenPairs};
    }
    async function select(characterId){
      const selected=normalize(characterId),request=++epoch;
      reset();identity=selected;status=selected?'loading':'idle';
      if(!config||!selected)return false;
      try{
        const payload=await config.load(selected);if(request!==epoch)return false;
        const result=validate(payload,selected);
        config.registerVisible?.([...result.next.values()]);
        records=result.next;managed=result.keys;edges=result.validEdges;edgeKeys=result.seenPairs;ready=true;status='ready';return true;
      }catch(err){if(request===epoch){reset();status='error'}return false}
    }
    function get(key){return ready?records.get(key)||null:null}
    function allowed(key){return !isManaged(key)||Boolean(get(key))}
    function text(key){const r=get(key);return r?[r.title,...r.claims.map(c=>c.body)].join(' '):''}
    function html(key){
      const r=get(key);if(!r)return '';
      return Object.keys(kinds).map(kind=>{
        const list=r.claims.filter(c=>c.visibility===kind);if(!list.length)return '';
        return '<section class="personal-group knowledge-view-section"><h2>'+esc(kinds[kind])+'</h2><div class="personal-grid">'+list.map(c=>'<article class="personal-card"><div class="personal-tag">'+esc(source[c.acquisition])+' · '+esc(c.certainty)+' · Tier '+c.tier+'</div><p>'+esc(c.body)+'</p></article>').join('')+'</div></section>';
      }).join('');
    }
    function list(){return [...records.values()].map(r=>({...r,claims:r.claims.map(c=>({...c}))}))}
    function relationships(){return ready?edges.map(e=>[...e]):[]}
    function relationshipAllowed(a,b){return ready&&edgeKeys.has(pair(a,b))}
    function discoveries(){
      return list().flatMap(r=>{
        const c=r.claims.filter(c=>c.discovered).sort((a,b)=>b.discovered.localeCompare(a.discovered))[0];
        return c?[{note:r.recordKey,title:r.title,kind:r.category||'Discovery',text:c.body,when:c.discovered}]:[];
      }).sort((a,b)=>b.when.localeCompare(a.when));
    }
    return {configure,clear,select,isManaged,allowed,get,text,html,list,relationships,relationshipAllowed,discoveries,get ready(){return ready},get status(){return status},get identity(){return identity}};
  }
  return {create};
});

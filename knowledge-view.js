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
  function create(){
    let managed=new Set(),records=new Map(),identity='',epoch=0,ready=false,provider=null,status='idle';
    function configure(config){
      if(!config||!Array.isArray(config.managedRecordKeys)||typeof config.load!=='function')throw Error('Invalid knowledge provider');
      if(config.managedRecordKeys.some(k=>!nonempty(k)))throw Error('Invalid record key');
      managed=new Set(config.managedRecordKeys);provider=config.load;records=new Map();identity='';ready=false;status='idle';epoch++;
    }
    function clear(){records=new Map();identity='';ready=false;status='idle';epoch++}
    function isManaged(key){return managed.has(key)}
    function validate(payload,expected){
      if(!payload||normalize(payload.characterId)!==expected||!Array.isArray(payload.records))throw Error('Mismatched knowledge perspective');
      const next=new Map();
      for(const r of payload.records){
        if(!r||!managed.has(r.recordKey)||!nonempty(r.id)||!nonempty(r.title)||!Array.isArray(r.claims)||next.has(r.recordKey))throw Error('Malformed or unexpected knowledge record');
        const seen=new Set();
        const claims=r.claims.map(c=>{
          if(!c||!nonempty(c.id)||seen.has(c.id)||!Number.isSafeInteger(c.revision)||c.revision<1||!nonempty(c.body)||!own(kinds,c.visibility)||!own(source,c.acquisition)||!certainty.has(c.certainty)||!Number.isInteger(c.tier)||c.tier<1||c.tier>4)throw Error('Invalid player knowledge claim');
          seen.add(c.id);return {id:c.id,revision:c.revision,body:c.body,visibility:c.visibility,acquisition:c.acquisition,certainty:c.certainty,tier:c.tier};
        });
        if(claims.length)next.set(r.recordKey,{id:r.id,title:r.title,claims});
      }
      return next;
    }
    async function select(characterId){
      const selected=normalize(characterId);const request=++epoch;
      records=new Map();identity=selected;ready=false;status=selected?'loading':'idle';
      if(!provider||!selected)return false;
      try{const payload=await provider(selected);
        if(request!==epoch)return false;
        records=validate(payload,selected);ready=true;status='ready';return true;
      }catch(err){if(request===epoch){records=new Map();ready=false;status='error'}return false}
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
    function list(){return [...records.entries()].map(([recordKey,r])=>({recordKey,id:r.id,title:r.title,claims:r.claims.map(c=>({...c}))}))}
    return {configure,clear,select,isManaged,allowed,get,text,html,list,get ready(){return ready},get status(){return status},get identity(){return identity}};
  }
  return {create};
});

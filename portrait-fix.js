(function(){
  async function repairPortraits(){
    const hash=location.hash||'';
    if(!hash.startsWith('#/record/'))return;
    const name=decodeURIComponent(hash.slice(9));
    const entries=(window.GREYWAKE_MEDIA||{})[name]||[];
    const b64Entries=entries.filter(x=>x.b64);
    if(!b64Entries.length)return;
    const figures=[...document.querySelectorAll('#article .article-media figure')];
    await Promise.all(b64Entries.map(async (entry,i)=>{
      const img=figures[i]?.querySelector('img');
      if(!img)return;
      try{
        const r=await fetch(entry.b64+'?v=4',{cache:'no-store'});
        if(!r.ok)throw new Error('HTTP '+r.status);
        const encoded=(await r.text()).replace(/\s+/g,'');
        if(!encoded)throw new Error('empty portrait');
        img.onload=()=>{img.dataset.portraitOk='1'};
        img.onerror=()=>{console.error('Portrait decode failed for',name)};
        img.src='data:'+(entry.mime||'image/webp')+';base64,'+encoded;
        img.alt=name+' portrait';
      }catch(e){console.error('Portrait repair failed',e)}
    }));
  }
  window.addEventListener('hashchange',()=>setTimeout(repairPortraits,50));
  window.addEventListener('load',()=>setTimeout(repairPortraits,100));
  const observer=new MutationObserver(()=>setTimeout(repairPortraits,0));
  const article=document.getElementById('article');
  if(article)observer.observe(article,{childList:true,subtree:true});
})();

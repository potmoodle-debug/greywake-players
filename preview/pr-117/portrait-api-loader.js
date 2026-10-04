(()=>{
  const MEDIA=window.GREYWAKE_MEDIA||{};
  const byCaption=new Map();
  Object.values(MEDIA).flat().forEach(item=>{if(item?.api&&item?.caption)byCaption.set(item.caption,item)});

  async function hydrateFigure(fig){
    if(!fig||fig.dataset.apiHydrated==='1'||fig.dataset.apiHydrating==='1')return;
    const caption=fig.querySelector('figcaption')?.textContent?.trim();
    const item=byCaption.get(caption);
    if(!item)return;
    const img=fig.querySelector('img');
    if(!img)return;
    fig.dataset.apiHydrating='1';
    try{
      const response=await fetch(item.api,{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
      if(!response.ok)throw new Error(`GitHub portrait HTTP ${response.status}`);
      const payload=await response.json();
      const encoded=(payload.content||'').replace(/\s+/g,'');
      if(!encoded)throw new Error('Portrait API returned no image content');
      img.src=`data:${item.mime||'image/jpeg'};base64,${encoded}`;
      img.alt=(caption||'Portrait').replace(/\s+—.*$/,'')+' portrait';
      fig.dataset.apiHydrated='1';
    }catch(err){
      console.error('NPC portrait API load failed',err);
      img.alt='Portrait unavailable';
    }finally{
      delete fig.dataset.apiHydrating;
    }
  }

  function scan(){document.querySelectorAll('.article-media figure').forEach(hydrateFigure)}
  new MutationObserver(scan).observe(document.documentElement,{subtree:true,childList:true});
  scan();
})();

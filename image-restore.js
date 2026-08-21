(function(){
  const MEDIA=window.GREYWAKE_MEDIA||{};
  const article=document.getElementById('article');
  if(!article)return;

  function currentRecord(){
    const h=location.hash||'';
    return h.startsWith('#/record/')?decodeURIComponent(h.slice(9)):null;
  }

  async function hydrate(img,item){
    try{
      let encoded='';
      if(item.parts){
        const chunks=await Promise.all(item.parts.map(async src=>{
          const r=await fetch(src,{cache:'no-store'});
          if(!r.ok)throw new Error(`HTTP ${r.status}: ${src}`);
          return (await r.text()).trim();
        }));
        encoded=chunks.join('');
      }else if(item.b64){
        const r=await fetch(item.b64,{cache:'no-store'});
        if(!r.ok)throw new Error(`HTTP ${r.status}: ${item.b64}`);
        encoded=(await r.text()).trim();
      }
      if(!encoded)throw new Error('Empty image payload');
      img.src=`data:${item.mime||'image/avif'};base64,${encoded}`;
    }catch(err){
      console.error('Greywake image load failed',err);
      img.alt='Image unavailable';
    }
  }

  function renderMedia(){
    const name=currentRecord();
    if(!name)return;
    const items=MEDIA[name]||[];
    if(!items.length)return;
    if(article.querySelector(`.obsidian-media[data-record="${CSS.escape(name)}"]`))return;
    const h1=article.querySelector('h1');
    if(!h1)return;

    const host=document.createElement('div');
    host.className='article-media obsidian-media';
    host.dataset.record=name;

    items.forEach(item=>{
      const figure=document.createElement('figure');
      const img=document.createElement('img');
      img.alt=item.caption||name;
      img.loading='lazy';
      img.decoding='async';
      if(item.src)img.src=item.src;
      else hydrate(img,item);
      figure.appendChild(img);
      if(item.caption){
        const caption=document.createElement('figcaption');
        caption.textContent=item.caption;
        figure.appendChild(caption);
      }
      host.appendChild(figure);
    });

    h1.insertAdjacentElement('afterend',host);
  }

  const observer=new MutationObserver(renderMedia);
  observer.observe(article,{childList:true,subtree:false});
  window.addEventListener('hashchange',()=>requestAnimationFrame(renderMedia));
  requestAnimationFrame(renderMedia);
})();

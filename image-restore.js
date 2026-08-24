(function(){
  const MEDIA=window.GREYWAKE_MEDIA||{};
  const article=document.getElementById('article');
  if(!article)return;

  function currentRecord(){
    const h=location.hash||'';
    return h.startsWith('#/record/')?decodeURIComponent(h.slice(9)):null;
  }

  function closeLightbox(){
    const lightbox=document.querySelector('.image-lightbox');
    if(lightbox)lightbox.remove();
    document.body.classList.remove('lightbox-open');
  }

  function openLightbox(src,alt,caption){
    closeLightbox();
    const lightbox=document.createElement('div');
    lightbox.className='image-lightbox';
    lightbox.setAttribute('role','dialog');
    lightbox.setAttribute('aria-modal','true');
    lightbox.setAttribute('aria-label',caption||alt||'Full-size image');

    const close=document.createElement('button');
    close.className='image-lightbox-close';
    close.type='button';
    close.setAttribute('aria-label','Close full-size image');
    close.textContent='×';

    const img=document.createElement('img');
    img.src=src;
    img.alt=alt||'';
    img.decoding='async';

    lightbox.append(close,img);
    if(caption){
      const text=document.createElement('div');
      text.className='image-lightbox-caption';
      text.textContent=caption;
      lightbox.appendChild(text);
    }

    close.addEventListener('click',closeLightbox);
    lightbox.addEventListener('click',event=>{
      if(event.target===lightbox)closeLightbox();
    });
    document.body.appendChild(lightbox);
    document.body.classList.add('lightbox-open');
    close.focus();
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
      if(!item.src){
        console.warn('Greywake media entry skipped because it has no direct source file',item);
        return;
      }

      const figure=document.createElement('figure');
      const img=document.createElement('img');
      img.alt=item.caption||name;
      img.loading='lazy';
      img.decoding='async';
      img.src=item.src;
      img.title='Open full-size image';
      img.tabIndex=0;
      img.addEventListener('click',()=>openLightbox(item.src,img.alt,item.caption));
      img.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){
          event.preventDefault();
          openLightbox(item.src,img.alt,item.caption);
        }
      });
      figure.appendChild(img);

      if(item.caption){
        const caption=document.createElement('figcaption');
        caption.textContent=item.caption;
        figure.appendChild(caption);
      }
      host.appendChild(figure);
    });

    if(host.childElementCount)h1.insertAdjacentElement('afterend',host);
  }

  const observer=new MutationObserver(renderMedia);
  observer.observe(article,{childList:true,subtree:false});
  window.addEventListener('hashchange',()=>requestAnimationFrame(renderMedia));
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape')closeLightbox();
  });
  requestAnimationFrame(renderMedia);
})();

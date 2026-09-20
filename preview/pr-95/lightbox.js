(()=>{
  let box,img,caption,lastFocus;

  function ensure(){
    if(box)return;
    box=document.createElement('div');
    box.className='image-lightbox';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-modal','true');
    box.setAttribute('aria-label','Enlarged image');
    box.innerHTML=`<button class="image-lightbox__close" type="button" aria-label="Close enlarged image">×</button><div class="image-lightbox__stage"><img class="image-lightbox__image" alt=""><div class="image-lightbox__caption"></div></div><div class="image-lightbox__hint">Click outside the image or press Esc to close</div>`;
    document.body.appendChild(box);
    img=box.querySelector('.image-lightbox__image');
    caption=box.querySelector('.image-lightbox__caption');
    box.querySelector('.image-lightbox__close').addEventListener('click',close);
    box.addEventListener('click',e=>{if(e.target===box)close()});
  }

  function isPending(source){
    return source?.hasAttribute('data-parts')||source?.hasAttribute('data-b64-src')||source?.hasAttribute('data-api-src');
  }

  function open(source){
    if(!source?.src||isPending(source))return false;
    ensure();
    lastFocus=document.activeElement;
    img.src=source.src;
    img.alt=source.alt||'';
    const fig=source.closest('figure');
    const text=fig?.querySelector('figcaption')?.textContent?.trim()||source.alt||'';
    caption.textContent=text;
    caption.hidden=!text;
    box.classList.add('open');
    document.body.classList.add('lightbox-open');
    box.querySelector('.image-lightbox__close').focus();
    return true;
  }

  function close(){
    if(!box?.classList.contains('open'))return;
    box.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    img.removeAttribute('src');
    lastFocus?.focus?.();
  }

  async function openFromButton(button,source){
    if(!source)return;
    const original=button.textContent;
    if(isPending(source)){
      button.textContent='Loading image…';
      button.disabled=true;
      for(let i=0;i<50&&isPending(source);i++)await new Promise(r=>setTimeout(r,100));
      button.disabled=false;
      button.textContent=original;
    }
    if(!source.src||isPending(source)){
      button.textContent='Image unavailable';
      setTimeout(()=>{button.textContent=original},1800);
      return;
    }
    if(source.src.startsWith('data:')){
      open(source);
      return;
    }
    window.open(source.src,'_blank','noopener,noreferrer');
  }

  function makeImagesAccessible(){
    document.querySelectorAll('.article-media figure').forEach(fig=>{
      const source=fig.querySelector('img');
      if(!source)return;
      source.tabIndex=0;
      source.setAttribute('role','button');
      source.setAttribute('aria-label',`${source.alt||'Image'} — view larger`);
      source.title='View larger';

      if(!fig.querySelector('.image-open-button')){
        const button=document.createElement('button');
        button.type='button';
        button.className='image-open-button';
        button.textContent='Open full image';
        button.addEventListener('click',e=>{
          e.preventDefault();
          e.stopPropagation();
          openFromButton(button,source);
        });
        fig.appendChild(button);
      }

      if(!source.dataset.imageErrorWired){
        source.dataset.imageErrorWired='1';
        source.addEventListener('error',()=>fig.classList.add('image-load-failed'));
        source.addEventListener('load',()=>fig.classList.remove('image-load-failed'));
      }
    });
  }

  document.addEventListener('click',e=>{
    const target=e.target.closest?.('.article-media img');
    if(target)open(target);
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')close();
    const target=e.target.closest?.('.article-media img');
    if(target&&(e.key==='Enter'||e.key===' ')){
      e.preventDefault();
      open(target);
    }
  });

  const observer=new MutationObserver(makeImagesAccessible);
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','data-parts','data-b64-src','data-api-src']});
  makeImagesAccessible();
})();

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

  function open(source){
    if(!source?.src||source.hasAttribute('data-parts')||source.hasAttribute('data-b64-src'))return;
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
  }

  function close(){
    if(!box?.classList.contains('open'))return;
    box.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    img.removeAttribute('src');
    lastFocus?.focus?.();
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

  const makeImagesAccessible=()=>{
    document.querySelectorAll('.article-media img').forEach(el=>{
      el.tabIndex=0;
      el.setAttribute('role','button');
      el.setAttribute('aria-label',`${el.alt||'Image'} — view larger`);
      el.title='View larger';
    });
  };

  const observer=new MutationObserver(makeImagesAccessible);
  observer.observe(document.documentElement,{subtree:true,childList:true});
  makeImagesAccessible();
})();

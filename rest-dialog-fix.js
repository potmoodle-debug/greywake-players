(() => {
  function closeRestDialog(){
    const dialog=document.getElementById('restDialog');
    if(!dialog)return;
    if(typeof dialog.close==='function'&&dialog.open){
      try{dialog.close();return;}catch(_){}
    }
    dialog.removeAttribute('open');
  }

  function currentWater(){
    const value=window.GreywakeRest?.getState?.()?.water;
    return value===null||value===undefined?0:Number(value)||0;
  }

  function correctStaleWater(event,button){
    const dialog=button.closest('#restDialog');
    if(!dialog||currentWater()>0)return false;
    const noWater=dialog.querySelector('input[name="restWater"][value="none"]');
    const fullLongMoves=[...dialog.querySelectorAll('.rest-move-card>strong')].some(node=>node.textContent.trim()==='Work on a Project');
    if(!fullLongMoves)return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(noWater){
      noWater.checked=true;
      noWater.dispatchEvent(new Event('change',{bubbles:true}));
      requestAnimationFrame(()=>{
        const banner=document.querySelector('#restDialog .rest-rule-banner');
        if(banner){
          banner.setAttribute('role','status');
          banner.scrollIntoView({behavior:'smooth',block:'nearest'});
        }
      });
    }
    return true;
  }

  function revealOutcome(button){
    const original=button.textContent;
    if(button.dataset.restResolving==='true')return;
    button.dataset.restResolving='true';
    button.dataset.restOriginalLabel=original;
    button.textContent='Resolving…';
    button.setAttribute('aria-busy','true');

    setTimeout(()=>{
      const dialog=document.getElementById('restDialog');
      const result=dialog?.querySelector('#restOutcome .rest-result');
      if(result){
        button.hidden=true;
        result.scrollIntoView({behavior:'smooth',block:'nearest'});
        setTimeout(()=>dialog?.querySelector('[data-finish-rest]')?.focus({preventScroll:true}),220);
        return;
      }
      button.textContent=button.dataset.restOriginalLabel||original;
      button.removeAttribute('aria-busy');
      delete button.dataset.restResolving;
    },120);
  }

  document.addEventListener('click',event=>{
    const closeButton=event.target.closest?.('#restDialog [data-close], #restDialog [data-finish-rest]');
    if(closeButton){
      event.preventDefault();
      event.stopPropagation();
      closeRestDialog();
      return;
    }

    const completeButton=event.target.closest?.('#restDialog [data-complete-rest]');
    if(!completeButton||completeButton.disabled)return;
    if(correctStaleWater(event,completeButton))return;
    revealOutcome(completeButton);
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const dialog=document.getElementById('restDialog');
    if(dialog?.open)closeRestDialog();
  });

  window.GreywakeRestDialog={close:closeRestDialog};
})();

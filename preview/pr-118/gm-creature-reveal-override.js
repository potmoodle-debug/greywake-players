(() => {
  function labelAudience(a){return a==='party'?'Party':a? a[0].toUpperCase()+a.slice(1):'Player';}
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-eco-reveal]');
    if(!button)return;
    const record=window.GREYWAKE_GM_CREATURES?.[button.dataset.ecoReveal];
    const slice=record?.reveals?.find(x=>x[0]===button.dataset.stage);
    if(!record||!slice||typeof window.GREYWAKE_QUEUE_ECOLOGY_REVEAL!=='function')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const row=button.closest('article');
    row?.querySelectorAll('button').forEach(b=>b.disabled=true);
    row?.querySelector('.gm-reveal-result')?.remove();
    const result=document.createElement('div');
    result.className='gm-reveal-result';
    result.textContent='Sending '+slice[1]+' to '+labelAudience(button.dataset.audience)+'…';
    row?.appendChild(result);
    try{
      window.GREYWAKE_QUEUE_ECOLOGY_REVEAL(
        button.dataset.ecoReveal,
        button.dataset.stage,
        slice[1],
        slice[2],
        button.dataset.audience
      );
    }catch(err){
      result.textContent=err?.message||'Reveal failed.';
      row?.querySelectorAll('button').forEach(b=>b.disabled=false);
    }
  },true);
})();
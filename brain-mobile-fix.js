(()=>{
  const isTouch=()=>window.matchMedia?.('(pointer: coarse)').matches||('ontouchstart' in window);
  let queuedName=null;
  function enhance(){
    const host=document.getElementById('graph');if(!host)return;
    host.querySelectorAll('.brain-circle-node').forEach(g=>{
      if(g.dataset.mobileEnhanced)return;g.dataset.mobileEnhanced='1';
      const bg=g.querySelector('.brain-circle-bg');if(bg&&!g.querySelector('.brain-touch-hit')){
        const hit=document.createElementNS('http://www.w3.org/2000/svg','circle');
        const r=Math.max(64,Number(bg.getAttribute('r')||50)+14);hit.setAttribute('r',String(r));hit.setAttribute('class','brain-touch-hit');g.insertBefore(hit,bg);
      }
      if(isTouch()){
        g.addEventListener('pointerup',e=>{
          if(e.pointerType==='mouse')return;
          const name=g.dataset.name;if(!name)return;
          const stage=host.querySelector('#brainNetworkStage');
          if(stage?.classList.contains('is-transitioning'))queuedName=name;
        },{passive:true});
      }
    });
  }
  function flushQueued(){
    if(!queuedName)return;
    const host=document.getElementById('graph'),stage=host?.querySelector('#brainNetworkStage');
    if(stage?.classList.contains('is-transitioning'))return;
    const name=queuedName;queuedName=null;
    const sel=[...host.querySelectorAll('.brain-circle-node')].find(g=>g.dataset.name===name);
    sel?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
  }
  const obs=new MutationObserver(()=>{enhance();flushQueued()});
  window.addEventListener('hashchange',()=>setTimeout(()=>{enhance();flushQueued()},60));
  const host=document.getElementById('graph');if(host)obs.observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  setInterval(flushQueued,80);
  enhance();
})();
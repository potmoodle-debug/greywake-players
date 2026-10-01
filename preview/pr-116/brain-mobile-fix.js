(()=>{
  const isTouch=()=>window.matchMedia?.('(pointer: coarse)').matches||navigator.maxTouchPoints>0;
  if(!isTouch())return;

  let queuedName=null,lastTouchAt=0,flushTimer=null;

  function scheduleFlush(delay=0){
    clearTimeout(flushTimer);
    flushTimer=setTimeout(flushQueued,delay);
  }

  function selectByName(name,allowOpenCurrent=false){
    const host=document.getElementById('graph');if(!host||!name)return;
    const stage=host.querySelector('#brainNetworkStage');
    if(stage?.classList.contains('is-transitioning')){queuedName=name;return}

    const jump=host.querySelector('#brainJump');
    if(!jump)return;
    const exists=[...jump.options].some(o=>o.value===name);if(!exists)return;

    if(allowOpenCurrent&&jump.value===name){
      location.hash='#/record/'+encodeURIComponent(name);
      return;
    }

    if(jump.value!==name){
      jump.value=name;
      jump.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }

  function enhance(){
    const host=document.getElementById('graph');if(!host)return;
    host.querySelectorAll('.brain-circle-node').forEach(g=>{
      if(g.dataset.mobileEnhanced)return;g.dataset.mobileEnhanced='1';
      const bg=g.querySelector('.brain-circle-bg');
      if(bg&&!g.querySelector('.brain-touch-hit')){
        const hit=document.createElementNS('http://www.w3.org/2000/svg','circle');
        hit.setAttribute('r','58');hit.setAttribute('class','brain-touch-hit');g.insertBefore(hit,bg);
      }

      g.addEventListener('pointerup',e=>{
        if(e.pointerType==='mouse')return;
        e.preventDefault();e.stopPropagation();lastTouchAt=Date.now();
        const name=g.dataset.name;if(name)selectByName(name,true);
      },{passive:false});

      g.addEventListener('click',e=>{
        if(Date.now()-lastTouchAt<750){e.preventDefault();e.stopImmediatePropagation()}
      },true);
    });
  }

  function flushQueued(){
    if(!queuedName)return;
    const host=document.getElementById('graph'),stage=host?.querySelector('#brainNetworkStage');
    if(stage?.classList.contains('is-transitioning'))return;
    const name=queuedName;queuedName=null;selectByName(name,false);
  }

  const obs=new MutationObserver(()=>{enhance();scheduleFlush()});
  window.addEventListener('hashchange',()=>setTimeout(()=>{enhance();scheduleFlush()},60));
  const host=document.getElementById('graph');
  if(host)obs.observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  enhance();
})();

(()=>{
  if(document.querySelector('script[data-potion-targeting]'))return;
  const s=document.createElement('script');
  s.src='potion-targeting.js?v=potion1';
  s.dataset.potionTargeting='1';
  document.head.appendChild(s);
})();

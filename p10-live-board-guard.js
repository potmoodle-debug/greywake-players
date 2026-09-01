(() => {
  const isMarek=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase()==='marek';
  let rootObserver=null;
  let observedRoot=null;
  let timer=null;
  let repairing=false;

  function onCharacterRoute(){
    return location.hash==='#/character' || Boolean(document.querySelector('#characterSheet .character-sheet-shell'));
  }

  function ensurePolish(){
    if(document.querySelector('link[data-p10-live-polish]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='p10-live-play-polish.css?v=p10polish1';
    link.dataset.p10LivePolish='true';
    document.head.appendChild(link);
  }

  function needsRepair(){
    const board=document.querySelector('#characterSheet .live-resource-board');
    if(!board)return true;
    return !board.querySelector('.live-resource-water') ||
      !board.querySelector('.live-resource-armor') ||
      !board.querySelector('.p10-field-actions') ||
      !board.querySelector('[data-p10-backpack]') ||
      !board.querySelector('[data-p10-beastform]');
  }

  function repair(){
    if(repairing||!isMarek()||!onCharacterRoute())return;
    const shell=document.querySelector('#characterSheet .character-sheet-shell');
    const api=window.GreywakeLivePlayUsability;
    if(!shell||!api?.refresh)return;
    repairing=true;
    try{ api.refresh(); }
    finally{ setTimeout(()=>{repairing=false;},25); }
  }

  function verify(){
    if(!isMarek()||!onCharacterRoute())return;
    ensurePolish();
    if(needsRepair())repair();
  }

  function watchRoot(){
    if(!isMarek()||!onCharacterRoute())return;
    ensurePolish();
    const root=document.getElementById('characterSheet');
    if(!root){timer=setTimeout(watchRoot,120);return;}
    if(root!==observedRoot){
      rootObserver?.disconnect();
      observedRoot=root;
      rootObserver=new MutationObserver(()=>{
        clearTimeout(timer);
        timer=setTimeout(verify,30);
      });
      rootObserver.observe(root,{childList:true,subtree:true});
    }
    verify();
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(watchRoot,60);
  }

  for(const event of [
    'greywake:player-ready','greywake:sheet-enhanced','greywake:resources-changed',
    'greywake:damage-changed','greywake:rest-state-changed','greywake:equipment-state-changed',
    'greywake:beastform-changed'
  ])window.addEventListener(event,schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);

  setTimeout(schedule,150);
  setTimeout(schedule,500);
  setTimeout(schedule,1200);
  setTimeout(schedule,2500);
})();

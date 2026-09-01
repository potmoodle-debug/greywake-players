(() => {
  const isMarek=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase()==='marek';
  let observed=null;
  let observer=null;
  let timer=null;
  let probes=0;

  function needsRepair(board){
    return !board.querySelector('.live-resource-water')||
      !board.querySelector('.live-resource-armor')||
      !board.querySelector('.p10-field-actions');
  }

  function repair(){
    if(!isMarek()||!document.querySelector('#characterSheet .character-sheet-shell'))return;
    window.GreywakeLivePlayUsability?.refresh?.();
  }

  function watch(){
    if(!isMarek())return;
    const board=document.querySelector('.live-resource-board');
    if(!board){
      if(probes++<20)timer=setTimeout(watch,150);
      return;
    }
    if(board!==observed){
      observer?.disconnect();
      observed=board;
      observer=new MutationObserver(()=>{
        if(needsRepair(board))setTimeout(repair,0);
      });
      observer.observe(board,{childList:true,subtree:true});
    }
    if(needsRepair(board))repair();
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(watch,80);}
  for(const event of ['greywake:player-ready','greywake:sheet-enhanced','greywake:resources-changed','greywake:damage-changed','greywake:rest-state-changed','greywake:equipment-state-changed'])window.addEventListener(event,schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
  setTimeout(schedule,250);
  setTimeout(schedule,750);
  setTimeout(schedule,1500);
})();

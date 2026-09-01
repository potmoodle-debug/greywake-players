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
    if(!document.querySelector('link[data-p10-live-polish]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='p10-live-play-polish.css?v=p10polish2';
      link.dataset.p10LivePolish='true';
      document.head.appendChild(link);
    }
    if(document.getElementById('p10-square-resource-style'))return;
    const style=document.createElement('style');
    style.id='p10-square-resource-style';
    style.textContent=`
      #characterSheet .live-resource-hope .live-resource-pips,
      #characterSheet .live-resource-stress .live-resource-pips,
      #characterSheet .live-resource-hp .live-resource-pips,
      #characterSheet .live-resource-water .live-resource-pips{
        display:flex!important;
        align-items:center;
        justify-content:center;
        gap:6px!important;
      }
      #characterSheet .live-resource-hope .live-resource-pip,
      #characterSheet .live-resource-stress .live-resource-pip,
      #characterSheet .live-resource-hp .live-resource-pip,
      #characterSheet .live-resource-water .live-resource-pip{
        width:22px!important;
        min-width:22px!important;
        height:22px!important;
        flex:0 0 22px!important;
        aspect-ratio:1/1;
      }
      #traitRollPanel .trait-roll-dice-mark.p10-evasion-mark{
        min-width:92px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        padding:7px 11px;
        border:1px solid rgba(190,170,111,.28);
        background:rgba(255,255,255,.02);
        color:#d9d0b8;
      }
      #traitRollPanel .trait-roll-dice-mark.p10-evasion-mark span{
        font-size:.58rem;
        letter-spacing:.14em;
        color:#948c78;
        font-weight:800;
      }
      #traitRollPanel .trait-roll-dice-mark.p10-evasion-mark strong{
        font:700 1.15rem/1 Georgia,serif;
        color:#f0e6c8;
      }
      @media(max-width:700px){
        #characterSheet .live-resource-hope .live-resource-pip,
        #characterSheet .live-resource-stress .live-resource-pip,
        #characterSheet .live-resource-hp .live-resource-pip,
        #characterSheet .live-resource-water .live-resource-pip{
          width:20px!important;
          min-width:20px!important;
          height:20px!important;
          flex-basis:20px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function currentEvasion(){
    const live=window.GreywakeEquipment?.combatStats?.()?.evasion;
    if(live!==undefined&&live!==null)return live;
    const stat=[...document.querySelectorAll('#characterSheet .character-stat')].find(node=>node.querySelector('span')?.textContent.trim().toLowerCase()==='evasion');
    return stat?.querySelector('strong')?.textContent.trim()||'—';
  }

  function ensureEvasionReadout(){
    const mark=document.querySelector('#traitRollPanel .trait-roll-dice-mark');
    if(!mark)return;
    const value=String(currentEvasion());
    if(mark.classList.contains('p10-evasion-mark')&&mark.dataset.evasion===value)return;
    mark.classList.add('p10-evasion-mark');
    mark.dataset.evasion=value;
    mark.removeAttribute('aria-hidden');
    mark.setAttribute('aria-label',`Evasion ${value}`);
    mark.innerHTML=`<span>EVASION</span><strong>${value}</strong>`;
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
    ensureEvasionReadout();
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

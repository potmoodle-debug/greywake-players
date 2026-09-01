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
      #characterSheet .character-sheet-subtitle{display:none!important}
      #characterSheet .character-sheet-identity{
        padding:1.35rem 1.5rem 1.05rem 1.35rem!important;
      }
      #characterSheet .character-sheet-identity h2{
        margin:.05rem 0 .22rem!important;
        font-size:clamp(2.7rem,5vw,4.6rem)!important;
      }
      #characterSheet .pro-identity-ribbon{margin:.45rem 0 .05rem!important}
      #traitRollPanel{
        margin-top:.65rem!important;
        padding:.75rem!important;
      }
      #traitRollPanel .trait-roll-buttons{
        margin-top:.55rem!important;
        gap:.38rem!important;
      }
      #traitRollPanel .trait-roll-buttons button{
        min-height:48px!important;
        padding:.42rem .35rem!important;
      }
      #traitRollPanel .trait-roll-options{
        margin-top:.48rem!important;
        padding-top:.4rem!important;
      }
      #characterSheet .live-resource-board{
        margin-top:.6rem!important;
        padding:10px!important;
        gap:8px!important;
      }
      #characterSheet .live-resource-row{
        padding:8px 9px!important;
        gap:6px!important;
      }
      #characterSheet .p10-field-actions{
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:7px!important;
        padding-top:8px!important;
      }
      #characterSheet .p10-field-action{
        min-height:44px!important;
        padding-top:8px!important;
        padding-bottom:8px!important;
      }
      #characterSheet .live-resource-board .pro-board-title{
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
      }
      #characterSheet .p10-rest-utility{
        margin-left:auto;
        display:flex;
        align-items:center;
        gap:6px;
      }
      #characterSheet .p10-rest-utility button{
        min-height:30px;
        padding:5px 9px;
        border:1px solid rgba(100,125,139,.38);
        background:linear-gradient(180deg,#242d32,#171d21);
        color:#ccd9df;
        font-size:.64rem;
        font-weight:800;
        letter-spacing:.035em;
        cursor:pointer;
      }
      #characterSheet .p10-rest-utility button:hover{
        border-color:rgba(139,167,181,.7);
        background:linear-gradient(180deg,#2d3a40,#1c262b);
      }
      #characterSheet .p10-rest-utility button span{
        display:inline-block;
        margin-right:5px;
        font-size:.82rem;
      }
      #playDashboard .play-dashboard-rest{display:none!important}
      @media(max-width:950px){
        #characterSheet .p10-field-actions{grid-template-columns:repeat(2,1fr)!important}
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
        #characterSheet .live-resource-board .pro-board-title{align-items:flex-start!important;flex-wrap:wrap}
        #characterSheet .p10-rest-utility{width:100%;margin-left:0}
        #characterSheet .p10-rest-utility button{flex:1}
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

  function ensureRestButtons(){
    document.querySelectorAll('#characterSheet .p10-field-actions [data-p10-short-rest],#characterSheet .p10-field-actions [data-p10-long-rest]').forEach(node=>node.remove());
    const title=document.querySelector('#characterSheet .live-resource-board .pro-board-title');
    if(!title)return;
    let host=title.querySelector('.p10-rest-utility');
    if(!host){
      host=document.createElement('div');
      host.className='p10-rest-utility';
      host.setAttribute('aria-label','Rest controls');
      host.innerHTML=`<button type="button" data-p10-short-rest><span aria-hidden="true">◐</span>Short Rest</button><button type="button" data-p10-long-rest><span aria-hidden="true">☾</span>Long Rest</button>`;
      host.querySelector('[data-p10-short-rest]')?.addEventListener('click',()=>window.GreywakeRest?.openShort?.());
      host.querySelector('[data-p10-long-rest]')?.addEventListener('click',()=>window.GreywakeRest?.openLong?.());
      title.appendChild(host);
    }
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
    ensureRestButtons();
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

(() => {
  const VALID=['marek','velmira','odie'];
  let timers=[];

  function characterKey(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase();
  }

  function ensureDashboard(shell,hero){
    let dashboard=document.getElementById('playDashboard');
    if(!dashboard){
      dashboard=document.createElement('section');
      dashboard.id='playDashboard';
      dashboard.className='play-dashboard';
      dashboard.innerHTML=`<div class="play-dashboard-head"><div><span>LIVE PLAY</span><strong>Roll · Act · Resolve</strong><small>The controls used most often during a session.</small></div><div class="play-dashboard-rest"><button type="button" data-dashboard-rest="short">Short Rest</button><button type="button" data-dashboard-rest="long">Long Rest</button></div></div><div class="play-dashboard-content"></div>`;
      hero.insertAdjacentElement('afterend',dashboard);
      dashboard.querySelector('[data-dashboard-rest="short"]')?.addEventListener('click',()=>window.GreywakeRest?.openShort?.());
      dashboard.querySelector('[data-dashboard-rest="long"]')?.addEventListener('click',()=>window.GreywakeRest?.openLong?.());
    }else if(dashboard.parentElement!==shell || dashboard.previousElementSibling!==hero){
      hero.insertAdjacentElement('afterend',dashboard);
    }
    return dashboard.querySelector('.play-dashboard-content');
  }

  function normalize(){
    const key=characterKey();
    if(!VALID.includes(key))return;
    const shell=document.querySelector('#characterSheet .character-sheet-shell');
    const hero=shell?.querySelector('.character-sheet-hero');
    const identity=hero?.querySelector('.character-sheet-identity');
    const body=shell?.querySelector('.character-sheet-body');
    if(!shell||!hero||!identity||!body)return;

    identity.classList.add('play-dashboard-ready');

    const stats=identity.querySelector('.character-stat-strip');
    const resources=identity.querySelector('.pro-resource-board');
    const note=identity.querySelector('.character-sheet-note');
    if(stats&&resources&&stats.nextElementSibling!==resources)stats.insertAdjacentElement('afterend',resources);
    if(resources&&note&&resources.nextElementSibling!==note)resources.insertAdjacentElement('afterend',note);

    const content=ensureDashboard(shell,hero);
    if(!content)return;

    const traits=document.getElementById('traitRollPanel');
    const beast=key==='marek'?document.getElementById('beastformControl'):null;
    const actions=document.getElementById(key==='marek'?'activeActionsPanel':'companionActionsPanel');
    const readyGear=document.getElementById('readyGearPanel');
    const damage=document.getElementById('damageHealthPanel');

    if(key==='marek'&&traits&&resources){
      if(traits.parentElement!==identity || traits.nextElementSibling!==resources){
        resources.insertAdjacentElement('beforebegin',traits);
      }
    }else if(traits){
      content.appendChild(traits);
    }

    // Always append the remaining live-play panels in canonical order. appendChild
    // moves existing nodes without recreating them, preserving their handlers/state.
    [beast,actions,readyGear,damage].filter(Boolean).forEach(node=>content.appendChild(node));

    const rest=document.getElementById('restPanel');
    if(rest&&body.nextElementSibling!==rest)body.insertAdjacentElement('afterend',rest);

    const restButtons=document.querySelectorAll('#playDashboard [data-dashboard-rest]');
    restButtons.forEach(button=>button.disabled=!window.GreywakeRest);
  }

  function schedule(){
    timers.forEach(clearTimeout);timers=[];
    [0,140,360,720].forEach(delay=>timers.push(setTimeout(normalize,delay)));
  }

  window.GreywakeCharacterLayout={normalize,schedule};
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('greywake:resources-changed',()=>setTimeout(normalize,0));
  window.addEventListener('greywake:damage-changed',()=>setTimeout(normalize,0));
  window.addEventListener('greywake:rest-state-changed',()=>setTimeout(normalize,0));
  window.addEventListener('greywake:equipment-state-changed',()=>setTimeout(normalize,0));
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
})();
(() => {
  const VALID=['marek','velmira','odie'];
  let timers=[];

  function characterKey(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase();
  }

  function resourceState(key){
    const api=key==='marek'?window.GreywakeResources:window.GreywakeCompanion;
    return api?.getState?.()||null;
  }

  function ensureParityStyle(){
    if(document.getElementById('characterLayoutParityStyle'))return;
    const style=document.createElement('style');
    style.id='characterLayoutParityStyle';
    style.textContent=`
      #characterSheet .pro-identity-ribbon .character-proficiency{display:inline-flex;align-items:center;gap:5px;margin-left:auto;padding:4px 7px;border:1px solid rgba(204,185,124,.25);background:rgba(0,0,0,.18);font-size:.54rem;letter-spacing:.09em;color:#9d947d}
      #characterSheet .pro-identity-ribbon .character-proficiency b{color:#efe2b7;font-size:.68rem}
      #characterSheet .character-stat-strip>.character-stat{order:0}
      @media(max-width:620px){#characterSheet .pro-identity-ribbon .character-proficiency{margin-left:0}}
    `;
    document.head.appendChild(style);
  }

  function statNode(strip,label){
    return [...strip.querySelectorAll(':scope > .character-stat')].find(node=>node.querySelector('span')?.textContent.trim().toLowerCase()===label.toLowerCase())||null;
  }

  function normalizeHero(identity,key){
    ensureParityStyle();
    const strip=identity.querySelector('.character-stat-strip');
    if(!strip)return;

    const hpMax=statNode(strip,'HP max');
    const stressMax=statNode(strip,'Stress max');
    if(hpMax?.querySelector('span'))hpMax.querySelector('span').textContent='HP';
    if(stressMax?.querySelector('span'))stressMax.querySelector('span').textContent='Stress';

    let hope=statNode(strip,'Hope');
    if(!hope){
      hope=document.createElement('div');
      hope.className='character-stat pro-stat-resource';
      hope.innerHTML='<span>Hope</span><strong>2 / 6</strong>';
      strip.appendChild(hope);
    }

    const state=resourceState(key);
    const hp=statNode(strip,'HP');
    const stress=statNode(strip,'Stress');
    if(state){
      if(hp?.querySelector('strong'))hp.querySelector('strong').textContent=`${state.hp} / ${state.maxHP} marked`;
      if(stress?.querySelector('strong'))stress.querySelector('strong').textContent=`${state.stress} / ${state.maxStress} marked`;
      if(hope?.querySelector('strong'))hope.querySelector('strong').textContent=`${state.hope} / ${state.maxHope}`;
    }else{
      const hpStrong=hp?.querySelector('strong');
      const stressStrong=stress?.querySelector('strong');
      if(hpStrong&&!/marked/i.test(hpStrong.textContent)){
        const max=Number((hpStrong.textContent.match(/\d+/)||[])[0]||0);if(max)hpStrong.textContent=`0 / ${max} marked`;
      }
      if(stressStrong&&!/marked/i.test(stressStrong.textContent)){
        const max=Number((stressStrong.textContent.match(/\d+/)||[])[0]||0);if(max)stressStrong.textContent=`0 / ${max} marked`;
      }
    }

    const proficiency=statNode(strip,'Proficiency');
    const proficiencyValue=proficiency?.querySelector('strong')?.textContent.trim()||'1';
    proficiency?.remove();
    const ribbon=identity.querySelector('.pro-identity-ribbon');
    if(ribbon){
      let chip=ribbon.querySelector('.character-proficiency');
      if(!chip){chip=document.createElement('span');chip.className='character-proficiency';ribbon.appendChild(chip);}
      chip.innerHTML=`PROFICIENCY <b>${proficiencyValue}</b>`;
    }

    const desired=['Level','Evasion','Armor','HP','Stress','Hope'];
    desired.forEach(label=>{const node=statNode(strip,label);if(node)strip.appendChild(node);});

    const note=identity.querySelector('.character-sheet-note');
    if(note)note.textContent='Greywake is the live play sheet for rolls, Hope, Stress, Hit Points, Armor, Water, abilities and equipment. Changes made here are the current character state.';
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
    normalizeHero(identity,key);

    const stats=identity.querySelector('.character-stat-strip');
    const resources=identity.querySelector('.pro-resource-board');
    const note=identity.querySelector('.character-sheet-note');
    const traits=document.getElementById('traitRollPanel');

    // Marek established the preferred live-session hierarchy. Every character
    // now uses the same one: stats -> trait roller -> live resources -> note.
    if(stats&&traits&&stats.nextElementSibling!==traits)stats.insertAdjacentElement('afterend',traits);
    if(traits&&resources&&traits.nextElementSibling!==resources)traits.insertAdjacentElement('afterend',resources);
    else if(stats&&resources&&!traits&&stats.nextElementSibling!==resources)stats.insertAdjacentElement('afterend',resources);
    if(resources&&note&&resources.nextElementSibling!==note)resources.insertAdjacentElement('afterend',note);

    const content=ensureDashboard(shell,hero);
    if(!content)return;

    const beast=key==='marek'?document.getElementById('beastformControl'):null;
    const actions=document.getElementById(key==='marek'?'activeActionsPanel':'companionActionsPanel');
    const readyGear=document.getElementById('readyGearPanel');
    const damage=document.getElementById('damageHealthPanel');

    // Character-specific panels can differ, but their placement cannot. Beastform
    // is Marek-only; otherwise all PCs use actions -> ready gear -> damage.
    [beast,actions,readyGear,damage].filter(Boolean).forEach(node=>content.appendChild(node));

    const rest=document.getElementById('restPanel');
    if(rest&&body.nextElementSibling!==rest)body.insertAdjacentElement('afterend',rest);

    document.querySelectorAll('#playDashboard [data-dashboard-rest]').forEach(button=>button.disabled=!window.GreywakeRest);
  }

  function schedule(){
    timers.forEach(clearTimeout);timers=[];
    [0,140,360,720].forEach(delay=>timers.push(setTimeout(normalize,delay)));
  }

  window.GreywakeCharacterLayout={normalize,schedule};
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('greywake:resources-changed',()=>setTimeout(normalize,0));
  window.addEventListener('greywake:companion-resources-changed',()=>setTimeout(normalize,0));
  window.addEventListener('greywake:damage-changed',()=>setTimeout(normalize,0));
  window.addEventListener('greywake:rest-state-changed',()=>setTimeout(normalize,0));
  window.addEventListener('greywake:equipment-state-changed',()=>setTimeout(normalize,0));
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
})();

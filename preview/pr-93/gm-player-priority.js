(() => {
  if(window.__GreywakeGMPlayerPriority)return;
  window.__GreywakeGMPlayerPriority=true;

  const NAMES=['Marek','Velmira','Odie'];
  const LABELS={marek:'Marek',velmira:'Velmira',odie:'Odie'};
  const DIRECTION_IMAGES={
    'the closing ways':'assets/generated-scenes/digger-yards.webp'
  };
  let queued=false;
  let groupState=null;
  let groupTimer=null;
  let heroObserver=null;

  function isGM(){return document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true'}
  function onRun(){return location.hash==='#/gm-session'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]))}
  function normalise(v){return String(v||'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9]+/g,' ').trim()}

  function pursuing(){
    const host=document.getElementById('playerGoals');
    if(!host)return[];
    return [...host.querySelectorAll('.gm-interest-thread')].map(card=>{
      const status=card.querySelector('.interest-status')?.textContent?.trim()||'';
      if(!/PURSUING/i.test(status)||/RESOLVED/i.test(status))return null;
      const player=NAMES.find(n=>status.toLowerCase().includes(n.toLowerCase()))||'Player';
      const source=card.querySelector('.interest-source button,.interest-source strong')?.textContent?.trim();
      const goal=card.querySelector('h3')?.textContent?.trim()||'';
      const title=source||goal;
      return title?{player,title,goal,key:normalise(title)}:null;
    }).filter(Boolean);
  }

  function settledGroupChoice(){
    if(!groupState||!window.GreywakeGroupChoice?.aggregate)return null;
    const options=window.GreywakeGroupChoice.aggregate(groupState);
    if(!options.length)return null;
    const top=options[0];
    const topVotes=top.voters?.size||0;
    const tied=options.filter(option=>(option.voters?.size||0)===topVotes);
    if(topVotes<2||tied.length!==1)return null;
    const voters=[...(top.voters||[])].map(slug=>LABELS[slug]||slug);
    return{kind:'priority',title:top.source_title,detail:`Settled by group choice · ${topVotes} votes${voters.length?` (${voters.join(', ')})`:''}.`,voters};
  }

  function state(){
    const settled=settledGroupChoice();
    if(settled)return settled;
    const items=pursuing();
    if(!items.length)return{kind:'none',title:'No current direction',detail:'No player has currently marked an interest as Pursuing. World pressures remain active, but they do not decide what the party does next.'};
    const groups=new Map();
    items.forEach(item=>{
      if(!groups.has(item.key))groups.set(item.key,{title:item.title,players:new Set(),goals:[]});
      const group=groups.get(item.key);group.players.add(item.player);if(item.goal&&!group.goals.includes(item.goal))group.goals.push(item.goal);
    });
    const ranked=[...groups.values()].sort((a,b)=>b.players.size-a.players.size||a.title.localeCompare(b.title));
    const top=ranked[0];
    const tied=ranked.filter(x=>x.players.size===top.players.size);
    if(tied.length>1)return{kind:'tie',title:'Direction undecided',detail:`The party currently has more than one equally-backed pursuit: ${tied.map(x=>`${x.title} (${[...x.players].join(', ')})`).join(' · ')}. RUN will not choose between them.`};
    const players=[...top.players];
    const motivation=top.goals.find(g=>normalise(g)!==normalise(top.title));
    const voteCount=(groupState?.votes||[]).length;
    const voteNote=voteCount?` Group voting is still forming (${voteCount}/3 votes cast; no majority yet).`:'';
    return{kind:'direction',title:top.title,detail:`Currently pursued by ${players.join(', ')}${motivation?` · ${motivation}`:''}. This is player direction, not a settled group choice.${voteNote}`,players};
  }

  function ensureStyles(){
    if(document.getElementById('gm-player-priority-styles'))return;
    const s=document.createElement('style');s.id='gm-player-priority-styles';s.textContent=`
      .gm-run-hero-copy>small:not(.gm-player-priority-kicker),.gm-run-hero-copy>h2:not(.gm-player-priority-title),.gm-run-hero-copy>p:not(.gm-player-priority-detail){display:none!important}
      .gm-player-priority{margin-bottom:14px}.gm-player-priority-kicker{display:flex!important;gap:8px;align-items:center;color:#c7ad68;font-size:8px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;margin-bottom:8px}.gm-player-priority-kicker span{border:1px solid #6b5930;background:#1d180f;padding:3px 6px;color:#dfc27a}.gm-player-priority-title{display:block!important;margin:0 0 8px!important;color:#f0e3bd!important;font:700 clamp(30px,4vw,52px)/.98 Georgia,serif!important}.gm-player-priority-detail{display:block!important;max-width:760px;color:#b7ae98!important;font-size:11px!important;line-height:1.5!important;margin:0!important}.gm-player-priority[data-kind="priority"] .gm-player-priority-kicker span{border-color:#9c7e3e;background:#2d2413;color:#f0d58a}.gm-player-priority[data-kind="tie"] .gm-player-priority-kicker span,.gm-player-priority[data-kind="none"] .gm-player-priority-kicker span{border-style:dashed;color:#b9aa80}
    `;document.head.appendChild(s);
  }

  function syncHeroImage(next){
    const heroShell=document.querySelector('#gmOperationsView .gm-run-hero');
    if(!heroShell)return;
    const mapped=DIRECTION_IMAGES[normalise(next.title)]||'';
    const img=heroShell.querySelector('img');
    if(mapped){
      if(img&&img.getAttribute('src')!==mapped)img.setAttribute('src',mapped);
      heroShell.style.backgroundImage=`linear-gradient(90deg,rgba(8,8,6,.94) 0%,rgba(8,8,6,.78) 43%,rgba(8,8,6,.18) 76%),url("${mapped}")`;
      heroShell.dataset.priorityImage=mapped;
    }else{
      if(!heroShell.dataset.baseBackgroundImage)heroShell.dataset.baseBackgroundImage=heroShell.style.backgroundImage||'';
      heroShell.style.backgroundImage=heroShell.dataset.baseBackgroundImage;
      heroShell.dataset.priorityImage='';
    }
  }

  function watchHero(next){
    const heroShell=document.querySelector('#gmOperationsView .gm-run-hero');
    if(!heroShell)return;
    if(heroObserver)heroObserver.disconnect();
    heroObserver=new MutationObserver(()=>{
      const mapped=DIRECTION_IMAGES[normalise(next.title)]||'';
      const img=heroShell.querySelector('img');
      if(mapped&&img&&img.getAttribute('src')!==mapped)img.setAttribute('src',mapped);
    });
    heroObserver.observe(heroShell,{subtree:true,attributes:true,attributeFilter:['src']});
  }

  function syncPressureLabels(next){
    document.querySelectorAll('#gmOperationsView .gm-live-pressure').forEach(card=>{
      const title=card.querySelector('strong')?.textContent?.trim()||'';
      const label=card.querySelector('small');
      if(!label)return;
      const matches=normalise(title)===normalise(next.title);
      if(next.kind==='priority'&&matches)label.textContent='CURRENT PRIORITY';
      else if(next.kind==='direction'&&matches)label.textContent='CURRENT PLAYER DIRECTION';
      else if(/CURRENT PRIORITY|CURRENT PLAYER (PRIORITY|DIRECTION)|PLAYER PRIORITY/i.test(label.textContent||''))label.textContent='ACTIVE THREAD';
    });
  }

  function render(){
    if(!isGM()||!onRun())return;
    ensureStyles();
    const hero=document.querySelector('#gmOperationsView .gm-run-hero .gm-run-hero-copy');
    if(!hero)return;
    const next=state();
    let box=hero.querySelector('.gm-player-priority');
    if(!box){box=document.createElement('div');box.className='gm-player-priority';const actions=hero.querySelector('.gm-run-actions,.gm-primary-actions');actions?hero.insertBefore(box,actions):hero.appendChild(box)}
    const sig=JSON.stringify(next);
    if(box.dataset.signature!==sig){
      box.dataset.signature=sig;box.dataset.kind=next.kind;
      const kicker=next.kind==='priority'?'CURRENT PRIORITY':next.kind==='direction'?'PLAYER DIRECTION':next.kind==='tie'?'PRIORITY UNDECIDED':'NO CURRENT DIRECTION';
      const badge=next.kind==='priority'?'GROUP CHOICE':next.kind==='direction'?'INDIVIDUAL PURSUITS':next.kind==='tie'?'AWAITING GROUP CHOICE':'NO PARTY COMMITMENT';
      box.innerHTML=`<small class="gm-player-priority-kicker">${kicker} <span>${badge}</span></small><h2 class="gm-player-priority-title">${esc(next.title)}</h2><p class="gm-player-priority-detail">${esc(next.detail)}</p>`;
    }
    syncHeroImage(next);
    watchHero(next);
    syncPressureLabels(next);
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
  async function refreshGroupChoice(){if(!isGM()||!onRun()||!window.GreywakeGroupChoice?.getStateForGM)return;try{groupState=await window.GreywakeGroupChoice.getStateForGM();schedule()}catch(_){}}
  function resetGroupTimer(){if(groupTimer)clearInterval(groupTimer);groupTimer=null;if(isGM()&&onRun()){setTimeout(refreshGroupChoice,80);groupTimer=setInterval(refreshGroupChoice,15000)}}

  const goals=document.getElementById('playerGoals');if(goals)new MutationObserver(schedule).observe(goals,{childList:true,subtree:true,characterData:true});
  window.addEventListener('hashchange',()=>{setTimeout(schedule,80);resetGroupTimer()});
  window.addEventListener('greywake:player-ready',()=>{setTimeout(schedule,120);resetGroupTimer()});
  window.addEventListener('greywake:engagement-changed',()=>setTimeout(schedule,120));
  window.addEventListener('greywake:group-choice-changed',()=>setTimeout(refreshGroupChoice,80));
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(schedule,160);resetGroupTimer()});
  setTimeout(()=>{schedule();resetGroupTimer()},500);
})();
(() => {
  const NAMES=['Marek','Velmira','Odie'];
  let queued=false;

  function isGM(){return document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true'}
  function onRun(){return location.hash==='#/gm-session'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
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

  function state(){
    const items=pursuing();
    if(!items.length)return{kind:'none',title:'No shared priority yet',detail:'No player has currently marked an interest as Pursuing. World pressures remain active, but they do not decide what the party does next.'};
    const groups=new Map();
    items.forEach(item=>{
      if(!groups.has(item.key))groups.set(item.key,{title:item.title,players:new Set(),goals:[]});
      const group=groups.get(item.key);group.players.add(item.player);if(item.goal&&!group.goals.includes(item.goal))group.goals.push(item.goal);
    });
    const ranked=[...groups.values()].sort((a,b)=>b.players.size-a.players.size||a.title.localeCompare(b.title));
    const top=ranked[0];
    const tied=ranked.filter(x=>x.players.size===top.players.size);
    if(tied.length>1){
      return{kind:'tie',title:'Priority undecided',detail:`The party currently has more than one equally-backed pursuit: ${tied.map(x=>`${x.title} (${[...x.players].join(', ')})`).join(' · ')}. RUN will not choose between them.`};
    }
    const players=[...top.players];
    const motivation=top.goals.find(g=>normalise(g)!==normalise(top.title));
    return{kind:'priority',title:top.title,detail:`Currently pursued by ${players.join(', ')}${motivation?` · ${motivation}`:''}.`,players};
  }

  function ensureStyles(){
    if(document.getElementById('gm-player-priority-styles'))return;
    const s=document.createElement('style');s.id='gm-player-priority-styles';s.textContent=`
      .gm-run-hero-copy>small:not(.gm-player-priority-kicker),.gm-run-hero-copy>h2:not(.gm-player-priority-title),.gm-run-hero-copy>p:not(.gm-player-priority-detail){display:none!important}
      .gm-player-priority{margin-bottom:14px}.gm-player-priority-kicker{display:flex!important;gap:8px;align-items:center;color:#c7ad68;font-size:8px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;margin-bottom:8px}.gm-player-priority-kicker span{border:1px solid #6b5930;background:#1d180f;padding:3px 6px;color:#dfc27a}.gm-player-priority-title{display:block!important;margin:0 0 8px!important;color:#f0e3bd!important;font:700 clamp(30px,4vw,52px)/.98 Georgia,serif!important}.gm-player-priority-detail{display:block!important;max-width:760px;color:#b7ae98!important;font-size:11px!important;line-height:1.5!important;margin:0!important}.gm-player-priority[data-kind="tie"] .gm-player-priority-kicker span,.gm-player-priority[data-kind="none"] .gm-player-priority-kicker span{border-style:dashed;color:#b9aa80}
    `;document.head.appendChild(s);
  }

  function render(){
    if(!isGM()||!onRun())return;
    ensureStyles();
    const hero=document.querySelector('#gmOperationsView .gm-run-hero .gm-run-hero-copy');
    if(!hero)return;
    const next=state();
    let box=hero.querySelector('.gm-player-priority');
    if(!box){box=document.createElement('div');box.className='gm-player-priority';const actions=hero.querySelector('.gm-run-actions');actions?hero.insertBefore(box,actions):hero.appendChild(box)}
    const sig=JSON.stringify(next);if(box.dataset.signature===sig)return;box.dataset.signature=sig;box.dataset.kind=next.kind;
    box.innerHTML=`<small class="gm-player-priority-kicker">CURRENT PRIORITY <span>${next.kind==='priority'?'PLAYER MOTIVATION':next.kind==='tie'?'AWAITING GROUP DIRECTION':'NO PARTY COMMITMENT'}</span></small><h2 class="gm-player-priority-title">${esc(next.title)}</h2><p class="gm-player-priority-detail">${esc(next.detail)}</p>`;
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
  const goals=document.getElementById('playerGoals');if(goals)new MutationObserver(schedule).observe(goals,{childList:true,subtree:true,characterData:true});
  window.addEventListener('hashchange',()=>setTimeout(schedule,80));window.addEventListener('greywake:player-ready',()=>setTimeout(schedule,120));window.addEventListener('greywake:engagement-changed',()=>setTimeout(schedule,120));document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,160));setTimeout(schedule,500);
})();
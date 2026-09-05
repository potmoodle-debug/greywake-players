(() => {
  const API_URL='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const CODES={marek:'MAREK',velmira:'VELMIRA',odie:'ODIE'};
  const NAMES={marek:'Marek',velmira:'Velmira',odie:'Odie'};
  let token=0;

  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const key=()=>String(document.body.dataset.character||'').toLowerCase();
  const isPreview=()=>document.body.dataset.gmPreview==='true'&&document.body.dataset.role==='player'&&Boolean(CODES[key()]);
  const isMind=()=>location.hash==='#/mind';
  const active=g=>g.entry_kind!=='question'&&['open','pursuing'].includes(g.status);

  function ensureStyles(){
    if(document.getElementById('gm-preview-mind-direct-styles'))return;
    const style=document.createElement('style');
    style.id='gm-preview-mind-direct-styles';
    style.textContent=`
      body[data-player-route="mind"] #playerGoals>.section-head.player-goals-head,
      body[data-player-route="mind"] #playerGoals>.engagement-counts,
      body[data-player-route="mind"] #playerGoals>.question-flow-rule,
      body[data-player-route="mind"] #playerGoals>.goal-form,
      body[data-player-route="mind"] #playerGoals>.goal-hint{display:none!important}
      body[data-player-route="mind"] #playerGoals>.player-mind-view>.section-head,
      body[data-player-route="mind"] #playerGoals>.player-mind-view>.player-mind-summary{display:none!important}
      .gm-preview-direct{padding:0!important;border:0!important;background:transparent!important}
      .gm-preview-direct-note{margin:0 0 14px;padding:9px 11px;border-left:2px solid #7d6d45;background:#171610;color:#948b75;font-size:10px;line-height:1.45}
      .gm-preview-direct-note strong{color:#d7c281;letter-spacing:.08em;font-size:8px}
    `;
    document.head.appendChild(style);
  }

  function sourceImage(goal){
    const wanted=[goal.goal_text,goal.source_title].filter(Boolean).map(v=>String(v).trim().toLowerCase());
    for(const card of document.querySelectorAll('#currentThreadsGrid .thread-card')){
      const title=(card.querySelector('h3')?.textContent||'').trim().toLowerCase();
      if(!wanted.some(v=>v&&(title.includes(v)||v.includes(title))))continue;
      const img=card.querySelector('.thread-card-image:not(.thread-card-image-fallback)');
      if(img?.getAttribute('src'))return img.getAttribute('src');
    }
    return'';
  }

  function card(goal,index,tier){
    const title=goal.goal_text||goal.source_title||'Current interest';
    const source=goal.source_title||'';
    const image=sourceImage(goal);
    const visual=image?`<img class="player-mind-card-bg" src="${esc(image)}" alt="" loading="lazy">`:'<span class="player-mind-card-fallback" aria-hidden="true"></span>';
    return `<button type="button" class="player-mind-card" data-preview-source="${esc(goal.source_route||'#/campaign')}" disabled>${visual}<span class="player-mind-card-content"><span class="player-mind-topline"><span class="player-mind-state">${tier==='pursuing'?'PURSUING':'INTERESTED'}</span><span class="player-mind-rank">${tier==='pursuing'?`${index+1}/3`:'KEPT IN VIEW'}</span></span><h3>${esc(title)}</h3>${source?`<span class="player-mind-source">${esc(source)}</span>`:''}<span class="player-mind-open">GM preview · read only</span></span></button>`;
  }

  function tierMarkup(title,kicker,copy,items,tier){
    const cards=items.length?items.map((g,i)=>card(g,i,tier)).join(''):`<div class="mind-tier-empty">${tier==='pursuing'?'Nothing is being actively pursued yet.':'No other interests are being held in view.'}</div>`;
    return `<section class="mind-tier mind-tier-${tier}"><div class="mind-tier-head"><div><span>${kicker}</span><strong>${title}</strong><small>${copy}</small></div><div class="mind-tier-count">${tier==='pursuing'?`${items.length}/3`:`${items.length} INTERESTED`}</div></div><div class="player-mind-grid">${cards}</div></section>`;
  }

  async function load(){
    if(!isPreview()||!isMind())return;
    ensureStyles();
    const my=++token;
    const host=document.getElementById('playerGoals');
    if(!host)return;
    host.innerHTML='<div class="gm-preview-direct-note"><strong>GM PREVIEW</strong> Loading the same centrally saved priorities this player sees…</div>';
    try{
      const character=key();
      const response=await fetch(API_URL,{headers:{apikey:API_KEY,'Content-Type':'application/json','x-greywake-character':character,'x-greywake-code':CODES[character]}});
      const data=await response.json().catch(()=>({}));
      if(my!==token||!isPreview()||!isMind())return;
      if(!response.ok)throw new Error(data.error||'Could not load player priorities.');
      const goals=(Array.isArray(data.goals)?data.goals:[]).filter(g=>g.character_slug===character&&active(g));
      const pursuing=goals.filter(g=>g.status==='pursuing').slice(0,3);
      const interested=goals.filter(g=>g.status!=='pursuing');
      host.innerHTML=`<section class="player-mind-view gm-preview-direct" aria-label="What's on my mind"><div class="gm-preview-direct-note"><strong>GM PREVIEW · ${esc(NAMES[character]).toUpperCase()}</strong> Read-only mirror of this player’s centrally saved priorities.</div>${tierMarkup('Pursuing','TOP PRIORITY','Things this player wants treated as active choices for the group.',pursuing,'pursuing')}${tierMarkup('Interested','KEEP IN VIEW','Things that matter to this character but are not currently being pushed forward.',interested,'interested')}</section>`;
    }catch(error){
      if(my!==token)return;
      host.innerHTML=`<div class="gm-preview-direct-note"><strong>GM PREVIEW</strong> ${esc(error.message)}</div>`;
    }
  }

  function schedule(){setTimeout(load,30);setTimeout(load,250);}
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('greywake:portal-live-mounted',e=>{if(e.detail?.kind==='goals')schedule();});
  document.addEventListener('DOMContentLoaded',schedule);
  schedule();
})();

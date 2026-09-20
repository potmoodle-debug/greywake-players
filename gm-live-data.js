(() => {
  const NPC_IMAGES={
    'Mara Vell':'assets/npcs/hq-v3/mara-vell.webp',
    'Brannic Hale':'assets/npcs/hq-v3/brannic-hale.webp',
    'Selka Marr':'assets/npcs/hq-v3/selka-marr.webp',
    'Maela Rusk':'assets/npcs/hq-v3/maela-rusk.webp',
    'Spencer Digger':'assets/npcs/hq-v3/spencer-digger-canon.jpg'
  };
  let queued=false;

  const isGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function plain(html){const d=document.createElement('div');d.innerHTML=html||'';return(d.textContent||'').replace(/\s+/g,' ').trim()}
  function firstParagraph(html){const d=document.createElement('div');d.innerHTML=html||'';return plain(d.querySelector('p')?.innerHTML||'')}

  function styles(){
    if(document.getElementById('gm-live-data-styles'))return;
    const s=document.createElement('style');
    s.id='gm-live-data-styles';
    s.textContent=`
      .gm-live-source{display:inline-flex;border:1px solid #4c4634;background:#12130f;padding:4px 7px;color:#9f8d5b;font-size:7px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
      .gm-live-npcs{grid-column:1/-1}.gm-live-npc-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}.gm-live-npc{display:grid;grid-template-columns:92px minmax(0,1fr);min-height:130px;border:1px solid #3d3a2e;background:#13140f;overflow:hidden}.gm-live-npc img{width:100%;height:100%;object-fit:cover}.gm-live-npc>div{padding:11px}.gm-live-npc strong{display:block;color:#e6dcc2;font:700 17px/1.05 Georgia,serif;margin-bottom:5px}.gm-live-npc p{margin:0 0 9px!important;font-size:9px!important;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.gm-live-npc button{border:0;background:none;color:#d5bc72;padding:0;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer}
      .gm-live-goal-state{display:inline-flex;margin-top:6px;padding:3px 6px;border:1px solid #4d4736;color:#a99a70;font-size:7px;font-weight:900;text-transform:uppercase}.gm-live-goal-state.pursuing{border-color:#866e3c;color:#e0c77f}
      .gm-player-projection-guard{margin:0 0 14px;border:1px solid #665d42;background:#15150f;padding:14px}.gm-player-projection-guard small{display:block;color:#b6a161;font-size:7px;font-weight:900;letter-spacing:.11em;text-transform:uppercase}.gm-player-projection-guard strong{display:block;color:#eadfc2;font:700 18px/1.1 Georgia,serif;margin:5px 0 6px}.gm-player-projection-guard p{margin:0!important;color:#9b9483!important;font-size:10px!important;line-height:1.5!important}
      #gmInboxThreadsPortal{max-width:1500px;margin:-44px auto 70px;padding:0 clamp(18px,3vw,42px) 0;color:#d9d0ba}#gmInboxThreadsPortal.hidden{display:none!important}#gmInboxThreadsPortal .gm-inbox-thread-shell{border:1px solid #3d3a2f;background:#171813;padding:16px}#gmInboxThreadsPortal .gm-inbox-thread-shell>small{color:#9d8b5d;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}#gmInboxThreadsPortal .gm-inbox-thread-shell>h2{margin:5px 0 8px;color:#e9dfc8;font:700 19px/1.15 Georgia,serif}#gmInboxThreadsPortal .gm-inbox-thread-shell>p{color:#9f9786;font-size:11px}.gm-inbox-thread-anchor{cursor:pointer}.gm-inbox-thread-anchor:hover{background:#191a13}.gm-inbox-thread-anchor:focus-visible{outline:1px solid #a78c4c;outline-offset:2px}
      @media(max-width:1050px){.gm-live-npc-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:700px){.gm-live-npc-grid{grid-template-columns:1fr}#gmInboxThreadsPortal{margin:-50px 14px 70px;padding:0}}
    `;
    document.head.appendChild(s);
  }

  function run(root){
    // RUN owns its current situation, pressures and status through GREYWAKE_GM_STATE.
    // This enhancement only adds quick access to established NPC records.
    if(!root.querySelector('.gm-live-npcs')){
      const names=['Spencer Digger','Mara Vell','Brannic Hale','Selka Marr','Maela Rusk'].filter(n=>window.GREYWAKE_DATA?.[n]);
      if(names.length){
        const section=document.createElement('section');
        section.className='gm-panel full gm-live-npcs';
        section.innerHTML=`<small>USEFUL PEOPLE NOW &nbsp; <span class="gm-live-source">CURRENT RECORDS</span></small><h2>People you may need at the table</h2><p>Established record text only. Untracked intentions are not invented.</p><div class="gm-live-npc-grid">${names.map(n=>`<article class="gm-live-npc"><img src="${NPC_IMAGES[n]}" alt="" loading="lazy"><div><strong>${esc(n)}</strong><p>${esc(firstParagraph(window.GREYWAKE_DATA[n].html))}</p><button data-live-record="${esc(n)}">Open record →</button></div></article>`).join('')}</div>`;
        const capture=root.querySelector('#gmCapturePanel');
        capture?.parentNode?.insertBefore(section,capture);
        section.querySelectorAll('[data-live-record]').forEach(b=>b.onclick=()=>location.hash='#/gm-world/record/'+encodeURIComponent(b.dataset.liveRecord));
      }
    }
  }





  function players(root){
    const cards=root.querySelector('.gm-player-preview-cards');
    if(!cards||root.querySelector('.gm-player-projection-guard'))return;
    cards.querySelectorAll('article').forEach(card=>{
      const name=(card.querySelector('strong')?.textContent||'').trim().toLowerCase();
      if(name)card.dataset.character=name;
    });
    cards.insertAdjacentHTML('beforebegin','<section class="gm-player-projection-guard"><small>KNOWLEDGE BOUNDARY</small><strong>Each character is a separate projection.</strong><p>WORLD or canon changes do not become player knowledge automatically. Update Marek, Velmira or Odie only when that character actually learned, witnessed or was explicitly told the information. Never copy another character’s private knowledge across.</p></section>');
  }

  function portal(){
    let p=document.getElementById('gmInboxThreadsPortal');
    if(p)return p;
    p=document.createElement('section');
    p.id='gmInboxThreadsPortal';
    p.className='hidden';
    document.getElementById('mainContent')?.appendChild(p);
    return p;
  }
  function restoreThreads(){
    const threads=document.getElementById('playerGoals'),home=document.getElementById('home'),p=document.getElementById('gmInboxThreadsPortal');
    if(threads&&home&&threads.parentElement!==home){
      const current=document.getElementById('currentThreads');
      current?.parentNode===home?home.insertBefore(threads,current):home.prepend(threads);
    }
    if(p){p.classList.add('hidden');p.innerHTML=''}
  }
  function inbox(root){
    const feed=root.querySelector('#gmInboxHost'),threads=document.getElementById('playerGoals');
    if(!feed||!threads)return;
    const p=portal();
    if(threads.parentElement!==p){
      p.innerHTML='<div class="gm-inbox-thread-shell"><small>LIVE Q&A / INTEREST THREADS</small><h2>Open the actual conversation</h2><p>These are the existing GM thread controls from the player-goals system, not a duplicate.</p></div>';
      p.querySelector('.gm-inbox-thread-shell').appendChild(threads);
    }
    p.classList.remove('hidden');
    threads.classList.remove('hidden');
    setTimeout(()=>{
      root.querySelectorAll('.gm-player-feed-item:not([data-live-linked])').forEach(row=>{
        row.dataset.liveLinked='1';
        row.classList.add('gm-inbox-thread-anchor');
        row.tabIndex=0;
        const who=row.querySelector('.gm-player-feed-who strong')?.textContent?.trim(),text=row.querySelector('.gm-player-feed-copy p')?.textContent?.trim();
        const open=()=>{
          const cards=[...threads.querySelectorAll('.gm-interest-thread')];
          const match=cards.find(c=>(c.querySelector('.interest-status')?.textContent||'').includes(who)&&(c.textContent||'').includes(text?.slice(0,45)||''))||cards.find(c=>(c.querySelector('.interest-status')?.textContent||'').includes(who));
          if(match){match.scrollIntoView({behavior:'smooth',block:'start'});match.querySelector('textarea,button')?.focus()}
        };
        row.addEventListener('click',open);
        row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
      });
    },220);
  }

  function enhance(){
    if(!isGM()){restoreThreads();return}
    styles();
    const root=document.getElementById('gmOperationsView');
    if(!root||root.classList.contains('hidden'))return;
    const h=location.hash;
    if(h!=='#/gm-inbox')restoreThreads();
    if(h==='#/gm-session')run(root);
    else if(h==='#/gm-inbox')inbox(root);
    else if(h==='#/gm-players')players(root);
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(schedule,20));
  window.addEventListener('greywake:player-ready',()=>setTimeout(schedule,20));
  document.addEventListener('DOMContentLoaded',schedule);
  setTimeout(schedule,300);
})();

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
      @media(max-width:1050px){.gm-live-npc-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:700px){.gm-live-npc-grid{grid-template-columns:1fr}}
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









  function enhance(){
    if(!isGM())return
    styles();
    const root=document.getElementById('gmOperationsView');
    if(!root||root.classList.contains('hidden'))return;
    const h=location.hash;
    if(h==='#/gm-session')run(root);
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(schedule,20));
  window.addEventListener('greywake:player-ready',()=>setTimeout(schedule,20));
  document.addEventListener('DOMContentLoaded',schedule);
  setTimeout(schedule,300);
})();

(() => {
  const UPDATE_KEY='greywake-gm-last-update-packet-v1';
  const NPC_IMAGES={
    'Mara Vell':'assets/npcs/hq-v3/mara-vell.webp',
    'Brannic Hale':'assets/npcs/hq-v3/brannic-hale.webp',
    'Selka Marr':'assets/npcs/hq-v3/selka-marr.webp',
    'Maela Rusk':'assets/npcs/hq-v3/maela-rusk.webp'
  };
  const PRESSURE_META={
    'The Closing Ways':{level:'critical',origin:'PLAYER PRIORITY',image:'assets/canon/locations/caravan-gate.webp'},
    'The altered route markers':{level:'high',origin:'WORLD CONSEQUENCE',image:'assets/canon/sessions/session-03.webp'},
    'The Cistern Plate':{level:'high',origin:'WORLD CONSEQUENCE',image:'assets/canon/locations/valve-court-cistern-seal.webp'},
    "Ash-Plate's recovery":{level:'medium',origin:'WORLD CONSEQUENCE',image:'assets/canon/fauna/ash-plate.webp'},
    'Freight at Ash-Plate Groundfall':{level:'medium',origin:'OPEN CONSEQUENCE',image:'assets/canon/sessions/session-01.webp'},
    'Something Moved In':{level:'medium',origin:'SELECTABLE POSSIBILITY',image:'assets/canon/sessions/session-02.webp'}
  };
  let queued=false;

  function isGM(){return document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function plain(html){const d=document.createElement('div');d.innerHTML=html||'';return(d.textContent||'').replace(/\s+/g,' ').trim()}
  function firstParagraph(html){const d=document.createElement('div');d.innerHTML=html||'';return plain(d.querySelector('p')?.innerHTML||'')}
  function captureItems(){try{const x=JSON.parse(localStorage.getItem('greywake-gm-captures-v1')||'[]');return Array.isArray(x)?x:[]}catch{return[]}}

  function jobsSections(){
    const html=window.GREYWAKE_DATA?.['Jobs & Open Threads']?.html||'';
    const root=document.createElement('div');root.innerHTML=html;
    const out=[];
    root.querySelectorAll('h3').forEach(h=>{
      const paragraphs=[];let n=h.nextElementSibling;
      while(n&&n.tagName!=='H2'&&n.tagName!=='H3'){
        if(n.tagName==='P')paragraphs.push(plain(n.innerHTML));
        n=n.nextElementSibling;
      }
      out.push({title:h.textContent.trim().replace(/^[?↓↑→]+\s*/,'').replace(/^South\s+[—-]\s+/i,''),paragraphs});
    });
    return out;
  }
  function findSection(name){return jobsSections().find(x=>x.title.toLowerCase()===name.toLowerCase())||null}
  function sectionSummary(name){const x=findSection(name);if(!x)return'';const nonStatus=x.paragraphs.filter(p=>!/^status:/i.test(p)&&!/^possible benefit:/i.test(p));return(nonStatus[0]||x.paragraphs[0]||'').trim()}
  function currentPressures(){return Object.entries(PRESSURE_META).map(([title,meta])=>({title,meta,summary:sectionSummary(title)})).filter(x=>x.summary)}
  function currentPriority(){return currentPressures().find(x=>x.title==='The Closing Ways')||currentPressures()[0]||null}

  function ensureStyles(){
    if(document.getElementById('gm-live-data-styles'))return;
    const s=document.createElement('style');s.id='gm-live-data-styles';s.textContent=`
      .gm-live-source{display:inline-flex;align-items:center;gap:5px;border:1px solid #4c4634;background:#12130f;padding:4px 7px;color:#9f8d5b;font-size:7px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
      .gm-live-pressure-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}.gm-live-pressure{position:relative;min-height:125px;border:1px solid #48412e;background:#171811;overflow:hidden;padding:13px}.gm-live-pressure.has-image{padding-right:116px}.gm-live-pressure img{position:absolute;right:0;top:0;width:105px;height:100%;object-fit:cover;opacity:.58}.gm-live-pressure:after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:#665d42}.gm-live-pressure[data-level="critical"]{border-color:#80693a;background:#1d1a11}.gm-live-pressure[data-level="critical"]:after{height:5px;background:#ad8b45}.gm-live-pressure small{display:block;color:#b6a161;font-size:7px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}.gm-live-pressure strong{display:block;color:#eadfc2;font:700 18px/1.08 Georgia,serif;margin-bottom:6px}.gm-live-pressure p{margin:0!important;color:#96907f!important;font-size:9px!important;line-height:1.45!important}
      .gm-live-npcs{grid-column:1/-1}.gm-live-npc-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}.gm-live-npc{display:grid;grid-template-columns:92px minmax(0,1fr);min-height:130px;border:1px solid #3d3a2e;background:#13140f;overflow:hidden}.gm-live-npc img{width:100%;height:100%;object-fit:cover}.gm-live-npc>div{padding:11px}.gm-live-npc strong{display:block;color:#e6dcc2;font:700 17px/1.05 Georgia,serif;margin-bottom:5px}.gm-live-npc p{margin:0 0 9px!important;font-size:9px!important;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.gm-live-npc button{border:0;background:none;color:#d5bc72;padding:0;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer}
      .gm-live-goal-state{display:inline-flex;margin-top:6px;padding:3px 6px;border:1px solid #4d4736;color:#a99a70;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.gm-live-goal-state.pursuing{border-color:#866e3c;color:#e0c77f}
      .gm-pipeline span.known{border-color:#876e3b;color:#e5ca7c;background:#241f13}.gm-pipeline span.unknown{border-style:dashed;color:#746e61}.gm-update-truth{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.gm-update-truth div{border:1px solid #39362b;background:#12130f;padding:10px}.gm-update-truth small{display:block;color:#7f765e;font-size:7px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}.gm-update-truth strong{display:block;color:#d9cfb5;font-size:10px}.gm-update-truth span{display:block;color:#817a69;font-size:8px;margin-top:3px}
      .gm-inbox-threads{margin-top:14px}.gm-inbox-threads>small{display:block;margin-bottom:8px;color:#9d8b5d;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.gm-inbox-thread-anchor{cursor:pointer}.gm-inbox-thread-anchor:hover{background:#191a13}.gm-inbox-thread-anchor:focus-visible{outline:1px solid #a78c4c;outline-offset:2px}
      @media(max-width:1050px){.gm-live-npc-grid{grid-template-columns:1fr 1fr}.gm-update-truth{grid-template-columns:1fr 1fr}}
      @media(max-width:700px){.gm-live-pressure-grid,.gm-live-npc-grid,.gm-update-truth{grid-template-columns:1fr}.gm-live-pressure.has-image{padding-right:13px}.gm-live-pressure img{position:relative;float:right;width:90px;height:75px;margin:0 0 8px 10px}}
    `;document.head.appendChild(s);
  }

  function enhanceRun(root){
    const priority=currentPriority();
    if(priority){
      const hero=root.querySelector('.gm-run-hero');
      const h=hero?.querySelector('h2'),p=hero?.querySelector('p'),img=hero?.querySelector('img');
      if(h)h.textContent=priority.title;if(p)p.textContent=priority.summary;if(img&&priority.meta.image)img.src=priority.meta.image;
      const kicker=hero?.querySelector('.gm-run-hero-copy small');if(kicker)kicker.innerHTML='CURRENT PRIORITY &nbsp; <span class="gm-live-source">FROM CURRENT THREADS</span>';
    }
    const pressurePanel=[...root.querySelectorAll('.gm-panel')].find(x=>x.querySelector('h2')?.textContent.trim()==='What is moving');
    if(pressurePanel&&!pressurePanel.dataset.live){
      pressurePanel.dataset.live='true';const items=currentPressures();pressurePanel.querySelector('.gm-pressure-list')?.remove();
      pressurePanel.insertAdjacentHTML('beforeend',`<div class="gm-live-pressure-grid">${items.map(x=>`<article class="gm-live-pressure ${x.meta.image?'has-image':''}" data-level="${esc(x.meta.level)}">${x.meta.image?`<img src="${esc(x.meta.image)}" alt="" loading="lazy">`:''}<small>${esc(x.meta.origin)}</small><strong>${esc(x.title)}</strong><p>${esc(x.summary)}</p></article>`).join('')}</div>`);
      pressurePanel.querySelector('small').innerHTML='ACTIVE PRESSURES &nbsp; <span class="gm-live-source">CURRENT CAMPAIGN RECORD</span>';
    }
    if(!root.querySelector('.gm-live-npcs')){
      const npcNames=['Mara Vell','Brannic Hale','Selka Marr','Maela Rusk'].filter(n=>window.GREYWAKE_DATA?.[n]);
      if(npcNames.length){
        const capture=root.querySelector('#gmCapturePanel'),section=document.createElement('section');section.className='gm-panel full gm-live-npcs';
        section.innerHTML=`<small>USEFUL PEOPLE NOW &nbsp; <span class="gm-live-source">CURRENT RECORDS</span></small><h2>People you may need at the table</h2><p>Established record text only. If the site does not track a current intention, it is not invented here.</p><div class="gm-live-npc-grid">${npcNames.map(name=>`<article class="gm-live-npc">${NPC_IMAGES[name]?`<img src="${NPC_IMAGES[name]}" alt="" loading="lazy">`:''}<div><strong>${esc(name)}</strong><p>${esc(firstParagraph(window.GREYWAKE_DATA[name].html))}</p><button data-live-record="${esc(name)}">Open record →</button></div></article>`).join('')}</div>`;
        capture?.parentNode?.insertBefore(section,capture);section.querySelectorAll('[data-live-record]').forEach(b=>b.addEventListener('click',()=>{location.hash='#/gm-world/'+encodeURIComponent(b.dataset.liveRecord)}));
      }
    }
    const status=root.querySelector('.gm-status-strip');
    if(status&&!status.dataset.live){status.dataset.live='true';const cells=[...status.children];if(cells[0])cells[0].innerHTML='<small>CAMPAIGN PHASE</small><strong>Session Four prep / play</strong>';if(cells[1])cells[1].innerHTML='<small>PARTY LOCATION</small><strong>Greywake</strong>';if(cells[2])cells[2].innerHTML='<small>ACTIVE PARTY</small><strong>Marek · Velmira · Odie</strong>'}
  }

  function liveGoalCards(){
    const host=document.getElementById('playerGoals');if(!host)return{};const out={};
    host.querySelectorAll('.gm-interest-thread,.interest-thread').forEach(card=>{
      const status=(card.querySelector('.interest-status')?.textContent||'').toLowerCase();if(/question|resolved/.test(status))return;
      const name=(card.querySelector('.interest-status')?.textContent||'').toLowerCase();const slug=name.includes('marek')?'marek':name.includes('velmira')?'velmira':name.includes('odie')?'odie':null;if(!slug)return;
      const text=card.querySelector('h3')?.textContent?.trim();if(!text)return;
      const pursuing=status.includes('pursuing');if(!out[slug]||pursuing)out[slug]={text,pursuing};
    });return out;
  }
  function enhancePrep(root){
    const grid=root.querySelector('.gm-player-cards');if(!grid||grid.dataset.live)return;const goals=liveGoalCards();
    const cards=[...grid.querySelectorAll('article')],slugs=['marek','velmira','odie'];let changed=false;
    cards.forEach((card,i)=>{const g=goals[slugs[i]];if(!g)return;const span=card.querySelector('span');if(span)span.textContent=g.text;card.querySelector('div')?.insertAdjacentHTML('beforeend',`<em class="gm-live-goal-state ${g.pursuing?'pursuing':''}">${g.pursuing?'Pursuing':'Live player interest'}</em>`);changed=true});
    if(changed)grid.dataset.live='true';
  }

  function readUpdate(){try{return JSON.parse(localStorage.getItem(UPDATE_KEY)||'null')}catch{return null}}
  function writeUpdateSnapshot(){const active=captureItems().filter(x=>x.stage!=='resolved');localStorage.setItem(UPDATE_KEY,JSON.stringify({at:new Date().toISOString(),ids:active.map(x=>x.id),count:active.length}));setTimeout(schedule,50)}
  function enhanceUpdate(root){
    const hero=root.querySelector('.gm-update-hero');if(!hero)return;const previous=readUpdate(),active=captureItems().filter(x=>x.stage!=='resolved'),previousIds=new Set(previous?.ids||[]),newCount=active.filter(x=>!previousIds.has(x.id)).length;
    const state=hero.querySelector('#gmUpdateState');if(state&&previous)state.textContent=`Last updater handoff copied ${new Date(previous.at).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}. ${newCount} new capture${newCount===1?'':'s'} since that packet.`;
    if(!root.querySelector('.gm-update-truth')){
      const pipeline=[...root.querySelectorAll('.gm-panel')].find(x=>x.querySelector('h2')?.textContent.includes('Session → review'));
      if(pipeline){pipeline.insertAdjacentHTML('beforeend',`<div class="gm-update-truth"><div><small>BROWSER STAGING</small><strong>${active.length} active capture${active.length===1?'':'s'}</strong><span>Known here now</span></div><div><small>UPDATER HANDOFF</small><strong>${previous?'Packet copied':'Not copied yet'}</strong><span>${previous?new Date(previous.at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'No browser handoff record'}</span></div><div><small>OBSIDIAN / CANON</small><strong>Not verified by site</strong><span>Updater/Obsidian must confirm</span></div><div><small>PLAYER-SAFE SITE</small><strong>Not inferred</strong><span>Only actual reveals/updates count</span></div></div>`);const spans=[...pipeline.querySelectorAll('.gm-pipeline span')];spans.forEach((s,i)=>s.classList.add(i===0||(i===1&&previous)?'known':'unknown'))}
    }
    const btn=hero.querySelector('#gmRunUpdate');if(btn&&!btn.dataset.tracked){btn.dataset.tracked='true';btn.addEventListener('click',writeUpdateSnapshot)}
  }

  function enhanceInbox(root){
    const feed=root.querySelector('#gmInboxHost');const threads=document.getElementById('playerGoals');if(!feed||!threads||root.querySelector('.gm-inbox-threads'))return;
    const holder=document.createElement('section');holder.className='gm-panel full gm-inbox-threads';holder.innerHTML='<small>LIVE Q&A / INTEREST THREADS</small><h2>Open the actual conversation</h2><p>These are the existing GM thread controls from the player-goals system, not a duplicate.</p>';
    root.querySelector('.gm-ops-grid')?.appendChild(holder);
    holder.appendChild(threads);threads.classList.remove('hidden');
    setTimeout(()=>{
      root.querySelectorAll('.gm-player-feed-item').forEach(row=>{row.classList.add('gm-inbox-thread-anchor');row.tabIndex=0;const who=row.querySelector('.gm-player-feed-who strong')?.textContent?.trim(),text=row.querySelector('.gm-player-feed-copy p')?.textContent?.trim();const open=()=>{const cards=[...threads.querySelectorAll('.gm-interest-thread,.interest-thread')];const match=cards.find(c=>(c.querySelector('.interest-status')?.textContent||'').includes(who)&&(c.textContent||'').includes(text?.slice(0,50)||''))||cards.find(c=>(c.querySelector('.interest-status')?.textContent||'').includes(who));if(match){match.scrollIntoView({behavior:'smooth',block:'start'});match.querySelector('textarea,button')?.focus()}};row.addEventListener('click',open);row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})})
    },250);
  }

  function restorePlayerGoals(){
    const threads=document.getElementById('playerGoals'),home=document.getElementById('home');if(!threads||!home||threads.parentElement===home)return;const current=document.getElementById('currentThreads');if(current?.parentNode===home)home.insertBefore(threads,current);else home.prepend(threads)
  }
  function enhance(){
    if(!isGM()){restorePlayerGoals();return}ensureStyles();const root=document.getElementById('gmOperationsView');if(!root||root.classList.contains('hidden'))return;const h=location.hash;
    if(h!=='#/gm-inbox')restorePlayerGoals();
    if(h==='#/gm-session')enhanceRun(root);else if(h==='#/gm-prep')enhancePrep(root);else if(h==='#/gm-update')enhanceUpdate(root);else if(h==='#/gm-inbox')enhanceInbox(root)
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',()=>setTimeout(schedule,20));window.addEventListener('greywake:player-ready',()=>setTimeout(schedule,20));document.addEventListener('DOMContentLoaded',schedule);setTimeout(schedule,300)
})();
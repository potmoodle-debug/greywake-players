/* Player-scoped catch-up history. Existing feeds remain the owners of campaign data. */
(() => {
  const hash = value => { let n=2166136261; for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return (n>>>0).toString(36); };
  const fresh = () => ({version:1,sources:{},pending:{},lastVisit:null});
  function scan(state, source, items, at) {
    const prior=state.sources[source]; const next={};
    for(const item of items){
      const fingerprint=hash(JSON.stringify([item.title,item.sections,item.image,item.route,item.summary]));
      next[item.id]={fingerprint,sections:item.sections||[],image:item.image||''};
      const old=prior?.[item.id];
      if(prior && (!old || old.fingerprint!==fingerprint)){
        const changed=(item.sections||[]).find(section=>!(old?.sections||[]).includes(section));
        state.pending[source+':'+item.id]={...item,key:source+':'+item.id,source,revision:fingerprint,
          summary:changed||item.summary,label:!old?'New':old.image!==item.image&&!changed?'New image':'Updated',detectedAt:at};
      }
      if(state.pending[source+':'+item.id] && state.pending[source+':'+item.id].revision!==fingerprint){
        delete state.pending[source+':'+item.id];
      }
    }
    for(const [key,item] of Object.entries(state.pending)){if(item.source===source&&!next[item.id])delete state.pending[key];}
    state.sources[source]=next;
    return state;
  }
  window.GreywakeCatchupModel={fresh,scan,hash};
  if(typeof document==='undefined')return;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let character='',state=null,storageKey='',previousVisit=null,queued=false,filter='all',lastRoute=null,available={};
  const slug=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const playerName=()=>({marek:'Marek',odie:'Odie',velmira:'Velmira'})[slug()]||'your character';
  const playerFacing=()=>['marek','odie','velmira'].includes(slug()) && (document.body.dataset.role!=='gm'||document.body.dataset.gmPreview==='true');
  const preview=()=>document.body.dataset.gmPreview==='true';
  function load(){
    if(!playerFacing())return false;
    const key=slug()+ (preview()?':preview':'');
    if(key===character&&state)return true;
    character=key;storageKey='greywake:catchup:v1:'+key;lastRoute=null;available={};
    try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');state=saved?.version===1&&saved.sources&&saved.pending?saved:fresh();}catch{state=fresh();}
    previousVisit=state.lastVisit;
    try{const visitKey=storageKey+':visit';const current=JSON.parse(sessionStorage.getItem(visitKey)||'null');
      if(current&&Date.now()-current.at<30*60*1000){previousVisit=current.previous;}
      else {sessionStorage.setItem(visitKey,JSON.stringify({at:Date.now(),previous:previousVisit}));state.lastVisit=new Date().toISOString();}
    }catch{state.lastVisit=new Date().toISOString();}
    filter='all';return true;
  }
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{/* Browsers without storage keep this visit's history in memory. */}}
  function text(html){const box=document.createElement('div');box.innerHTML=html||'';return(box.textContent||'').replace(/\s+/g,' ').trim();}
  function paragraphs(html){const box=document.createElement('div');box.innerHTML=html||'';const parts=[...box.querySelectorAll('p,li,h2,h3')].map(x=>x.textContent.replace(/\s+/g,' ').trim()).filter(Boolean);return parts.length?parts:[text(html)].filter(Boolean);}
  function safeRoute(route){return typeof route==='string'&&/^#\/(record\/|my-greywake$|campaign$|possibilities$|inbox$|greywake$|mind$|map$)/.test(route)?route:'';}
  function media(name){const items=window.GREYWAKE_MEDIA?.[name]||[];const image=items.find(x=>x.src)?.src||'';return /^(assets\/|https:\/\/)/.test(image)?image:'';}
  function recordItems(){
    const revealed=new Set((window.GREYWAKE_LIVE_REVEALS||[]).filter(r=>!(r.audience||[]).length||(r.audience||[]).some(x=>x==='party'||x===slug())).map(r=>r.title));
    return Object.entries(window.GREYWAKE_DATA||{}).flatMap(([id,r])=>{
      if(r.gmOnly||r.dmOnly||/^(GM|DM)(\b|[- ])/i.test(r.category||''))return[];
      const known=(r.knownTo||[]).map(x=>String(x).toLowerCase());
      if(known.length&&!known.includes(slug())&&!revealed.has(id))return[];
      if(r.playerHidden===true&&!known.includes(slug())&&!revealed.has(id))return[];
      if(r.playerHidden===true&&!r.playerHtml)return[];
      const sections=paragraphs(r.playerHtml||r.html);if(!sections.length)return[];
      return[{id,title:r.title||id,kind:r.category||'Record',route:'#/record/'+encodeURIComponent(id),sections,summary:sections[0],image:media(id)}];
    });
  }
  function personalItems(){
    const root=document.getElementById('personalKnowledge');
    if(!root||root.querySelector('.gm-profile-block'))return null;
    return [...root.querySelectorAll('.personal-card')].map((card,i)=>({id:(card.closest('.personal-group')?.querySelector('h3')?.textContent||'')+':'+(card.querySelector('h4')?.textContent||i),title:card.querySelector('h4')?.textContent||'Your knowledge',kind:'Personal knowledge',route:'#/my-greywake',sections:[card.querySelector('p')?.textContent||''],summary:card.querySelector('p')?.textContent||'',image:card.querySelector('img')?.getAttribute('src')?.startsWith('assets/')?card.querySelector('img').getAttribute('src'):''}));
  }
  function revealItems(items){return items.filter(r=>!(r.audience||[]).length||(r.audience||[]).some(x=>x==='party'||x===slug())).map(r=>({id:String(r.id),title:r.title||'A new discovery',kind:'Discovery',route:safeRoute(r.source_route),sections:[String(r.body||'')],summary:String(r.body||''),image:r.title?media(r.title):'',publishedAt:r.created_at}));}
  function replyItems(items){return items.map(r=>({id:String(r.id),title:r.title||'The GM replied',kind:'GM reply',route:'#/inbox',goalId:r.goalId,sections:[r.body],summary:r.body,image:'',publishedAt:r.createdAt}));}
  function updateSource(source,items){if(!load())return;available[source]=new Set(items.map(item=>item.id));scan(state,source,items,new Date().toISOString());save();render();}
  function unread(){const records=new Set(recordItems().map(item=>item.id));return Object.values(state?.pending||{}).filter(item=>item.source==='records'?records.has(item.id):available[item.source]?.has(item.id)).sort((a,b)=>b.detectedAt.localeCompare(a.detectedAt));}
  function acknowledge(key){if(!state)return;delete state.pending[key];save();render();}
  function openItem(item){
    acknowledge(item.key);
    if(item.goalId)window.dispatchEvent(new CustomEvent('greywake:open-player-inbox',{detail:{goalId:item.goalId}}));
    else if(item.route)window.GreywakeNavigation.navigate(item.route);
  }
  function time(value){if(!value)return'';try{return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value));}catch{return'';}}
  function card(item){
    const summary=String(item.summary||'').slice(0,240);
    return `<article class="catchup-card" data-update-key="${esc(item.key||'')}">
      ${item.image?`<img src="${esc(item.image)}" alt="" loading="lazy">`:'<div class="catchup-card-art" aria-hidden="true">'+(item.kind==='GM reply'?'✉':'✦')+'</div>'}
      <div class="catchup-card-copy"><div class="catchup-card-meta"><span>${esc(item.label||'LATEST')}</span><small>${esc(item.kind)}</small></div><h2>${esc(item.title)}</h2><p>${esc(summary)}${String(item.summary||'').length>240?'…':''}</p>
      ${item.publishedAt?`<time>${esc(time(item.publishedAt))}</time>`:''}
      <div class="catchup-card-actions">${item.route?`<button type="button" ${item.key?`data-update-open="${esc(item.key)}"`:`data-update-latest="${esc(item.route)}"`}>${item.kind==='GM reply'?'Read reply':'Open record'}</button>`:''}${item.key?`<button type="button" class="catchup-reviewed" data-update-read="${esc(item.key)}">Mark reviewed</button>`:''}</div></div></article>`;
  }
  function ensureUI(){
    let panel=document.getElementById('catchupView');if(!panel){panel=document.createElement('section');panel.id='catchupView';panel.className='catchup-view hidden';panel.setAttribute('aria-label','Since your last visit');document.getElementById('mainContent')?.appendChild(panel);}
    let home=document.getElementById('homeCatchup');if(!home){home=document.createElement('a');home.id='homeCatchup';home.className='home-catchup';home.href='#/updates';const hero=document.querySelector('#home .hero-copy');hero?.insertBefore(home,document.getElementById('arrivalOrientation')||hero.querySelector('.arrival-actions'));}
    let badge=document.getElementById('updatesNav');if(!badge){badge=document.createElement('button');badge.id='updatesNav';badge.type='button';badge.addEventListener('click',()=>window.GreywakeNavigation.navigate('#/updates'));document.getElementById('primaryNav')?.appendChild(badge);}
    return panel;
  }
  function render(){
    const active=playerFacing();document.getElementById('homeCatchup')?.classList.toggle('hidden',!active);document.getElementById('updatesNav')?.classList.toggle('hidden',!active);
    if(!active){document.getElementById('catchupView')?.classList.add('hidden');return;}
    if(!load())return;
    const route=location.hash||'#/';
    const entered=route!==lastRoute;
    if(entered){
      if(route.startsWith('#/record/')||route==='#/my-greywake'){
        for(const item of unread())if(item.route===route)delete state.pending[item.key];save();
      }
      lastRoute=route;
    }
    const panel=ensureUI(),items=unread(),count=items.length;
    document.getElementById('homeCatchup').innerHTML=`<span class="catchup-seal" aria-hidden="true">${count||'✦'}</span><span><small>${esc(playerName().toUpperCase())} · SINCE YOUR LAST VISIT</small><strong>${count?`${count} ${count===1?'update is':'updates are'} waiting for you`:'You’re caught up'}</strong><span>${count?'Discoveries, changed records and conversations. Pick up where you left off.':previousVisit?'Nothing new to review. Revisit your latest discoveries.':'Your trail starts here. Future changes will be waiting when you return.'}</span></span><b>Open updates</b>`;
    const nav=document.getElementById('updatesNav');nav.textContent=count?`${playerName()} · ${count}`:`${playerName()} · Updates`;nav.setAttribute('aria-label',count?`${playerName()} updates, ${count} not reviewed`:`${playerName()} updates`);nav.classList.toggle('has-updates',count>0);nav.toggleAttribute('aria-current',location.hash==='#/updates');if(location.hash==='#/updates')nav.setAttribute('aria-current','page');
    if(location.hash!=='#/updates'){panel.classList.add('hidden');return;}
    for(const id of ['home','brainView','article','playerPortal','characterPageView','gmOperationsView'])document.getElementById(id)?.classList.add('hidden');panel.classList.remove('hidden');
    document.getElementById('crumb').textContent=`Greywake / ${playerName()} / Since your last visit`;document.title=`Since your last visit, ${playerName()} — Greywake`;
    document.querySelectorAll('[data-primary-section]').forEach(node=>{node.classList.remove('active');node.removeAttribute('aria-current');});
    const selected=items.filter(x=>filter==='all'||(filter==='replies'?x.kind==='GM reply':filter==='personal'?x.source==='personal':x.source!=='personal'&&x.kind!=='GM reply'));
    const first=!previousVisit;
    const allowed=new Set(recordItems().map(item=>item.id));
    const latest=(window.GREYWAKE_DISCOVERIES||[]).filter(d=>allowed.has(d.note)).slice(0,3).map(d=>({title:d.title,kind:d.kind,route:'#/record/'+encodeURIComponent(d.note),summary:d.text,label:'Known discovery',image:media(d.note)||(/^(assets\/|https:\/\/)/.test(d.image||'')?d.image:'')}));
    const signature=JSON.stringify([character,previousVisit,filter,items,latest]);
    if(panel.dataset.signature===signature){if(entered)panel.querySelector('h1')?.focus({preventScroll:true});return;}
    panel.dataset.signature=signature;
    panel.innerHTML=`<header class="catchup-head"><a href="#/">Home</a><div class="eyebrow">${esc(playerName().toUpperCase())} · YOUR TRAIL THROUGH GREYWAKE</div><h1 tabindex="-1">Since your last visit, ${esc(playerName())}</h1><p>${first?`This is the beginning of ${esc(playerName())}'s record here. Updates will stay until you open them or mark them reviewed.`:`Last visit: ${esc(time(previousVisit))}. This is ${esc(playerName())}'s personal trail through Greywake; updates stay here until you open them or mark them reviewed.`}</p></header>
      <div class="catchup-tools"><nav aria-label="Filter updates">${[['all','All'],['world','World'],['personal','Personal'],['replies','GM replies']].map(([key,label])=>`<button type="button" data-update-filter="${key}" aria-pressed="${filter===key}">${label}</button>`).join('')}</nav>${count?'<button type="button" data-update-all>Mark all reviewed</button>':''}</div>
      ${count?`<p class="catchup-count" role="status">${selected.length} of ${count} updates</p><div class="catchup-grid">${selected.length?selected.map(card).join(''):'<div class="catchup-empty"><h2>Nothing in this view</h2><p>Choose All to see your other updates.</p></div>'}</div>`:`<div class="catchup-empty"><div aria-hidden="true">✦</div><h2>${first?'A fresh page in your story':'You’re caught up'}</h2><p>${first?'We’ll remember the records available to you now. Future changes will appear here without marking the whole archive as new.':'There are no unreviewed changes in the information available to your character.'}</p><a href="#/greywake">Explore Greywake</a></div>`}
      ${!count&&latest.length?`<section class="catchup-recent"><h2>Where we left off</h2><p>Your latest known discoveries, ready to revisit.</p><div class="catchup-grid">${latest.map(card).join('')}</div></section>`:''}
      <footer class="catchup-foot">Remembered on this browser for ${esc(playerName())}${preview()?' · GM preview has its own history':''}. First visits on another device start a separate record.</footer>`;
    if(entered)panel.querySelector('h1')?.focus({preventScroll:true});
    panel.querySelectorAll('[data-update-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.updateFilter;render();}));
    panel.querySelectorAll('[data-update-open]').forEach(b=>b.addEventListener('click',()=>{const item=state.pending[b.dataset.updateOpen];if(item)openItem(item);}));
    panel.querySelectorAll('[data-update-latest]').forEach(b=>b.addEventListener('click',()=>window.GreywakeNavigation.navigate(b.dataset.updateLatest)));
    panel.querySelectorAll('[data-update-read]').forEach(b=>b.addEventListener('click',()=>acknowledge(b.dataset.updateRead)));
    panel.querySelector('[data-update-all]')?.addEventListener('click',()=>{state.pending={};save();render();});
    panel.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>img.remove(),{once:true}));
  }
  function scanPage(){queued=false;if(!load())return;const at=new Date().toISOString();scan(state,'records',recordItems(),at);const personal=personalItems();if(personal){available.personal=new Set(personal.map(item=>item.id));scan(state,'personal',personal,at);}save();render();}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(scanPage);}
  window.GreywakeCatchup={refresh:schedule,open:()=>window.GreywakeNavigation.navigate('#/updates')};
  window.GreywakeNavigation.register('catchup',render);
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:live-reveals-updated',e=>{updateSource('discoveries',revealItems(e.detail?.items||[]));schedule();});
  window.addEventListener('greywake:goals-rendered',e=>{if(e.detail?.character===slug()&&Array.isArray(e.detail.replyUpdates))updateSource('replies',replyItems(e.detail.replyUpdates));});
  document.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('hashchange',()=>{
    if(!load())return;
    const route=location.hash;
    if(route.startsWith('#/record/')||route==='#/my-greywake'){
      for(const item of unread())if(item.route===route)delete state.pending[item.key];save();render();
    }
  });
  schedule();
})();

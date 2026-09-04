(() => {
  const KEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const URLS={
    goals:'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals',
    downtime:'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/downtime',
    choice:'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/campaign-choice'
  };
  const NAMES={marek:'Marek',velmira:'Velmira',odie:'Odie'};
  let timer=null, filter='needs';

  function isGM(){return document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true'}
  function onHome(){return (location.hash||'#/')==='#/'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function headers(){return{apikey:KEY,'Content-Type':'application/json','x-greywake-character':'gm','x-greywake-code':'GREYWAKE'}}
  async function get(url){const r=await fetch(url,{headers:headers()});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Could not load player activity.');return d}
  function time(ts){if(!ts)return'';const d=new Date(ts);return Number.isNaN(d.valueOf())?'':d.toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}

  function ensureStyles(){if(document.getElementById('gm-player-feed-styles'))return;const s=document.createElement('style');s.id='gm-player-feed-styles';s.textContent=`
    .gm-player-feed{grid-column:1/-1;border:1px solid #4b4533;background:#151610;min-height:0;padding:0!important;overflow:hidden}
    .gm-player-feed-head{display:flex;justify-content:space-between;gap:18px;align-items:center;padding:15px 16px;border-bottom:1px solid #353328}.gm-player-feed-head h2{margin:2px 0 0!important}.gm-player-feed-head p{margin:4px 0 0!important}.gm-player-feed-count{display:inline-flex;align-items:center;justify-content:center;min-width:27px;height:27px;border:1px solid #7a6437;background:#251f13;color:#f0d58c;font-size:10px;font-weight:900}
    .gm-player-feed-tabs{display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid #302f27;flex-wrap:wrap}.gm-player-feed-tabs button{border:1px solid #4d493a;background:#191a14;color:#a89f89;padding:7px 9px;font-size:9px;font-weight:800;text-transform:uppercase;cursor:pointer}.gm-player-feed-tabs button.active{border-color:#8f7540;color:#f1d995;background:#272114}
    .gm-player-feed-list{display:grid}.gm-player-feed-item{display:grid;grid-template-columns:125px minmax(0,1fr) auto;gap:12px;padding:12px 16px;border-bottom:1px solid #2e2e26;align-items:start}.gm-player-feed-item:last-child{border-bottom:0}.gm-player-feed-who small,.gm-player-feed-meta{display:block;color:#80775f;font-size:8px;letter-spacing:.08em;text-transform:uppercase}.gm-player-feed-who strong{display:block;margin-top:3px;color:#dfd5bd;font-size:11px}.gm-player-feed-copy strong{display:block;color:#e4dac2;font-size:11px;line-height:1.4}.gm-player-feed-copy p{margin:4px 0 0!important;color:#9e9788;font-size:10px!important;line-height:1.45}.gm-player-feed-need{display:inline-block;border:1px solid #8a6245;background:#281a13;color:#e5b28e;padding:5px 7px;font-size:8px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}.gm-player-feed-empty{padding:20px 16px;color:#8c8574;font-size:10px}.gm-player-feed-error{padding:14px 16px;color:#d39e88;font-size:10px}
    @media(max-width:720px){.gm-player-feed-item{grid-template-columns:1fr}.gm-player-feed-need{justify-self:start}.gm-player-feed-head{align-items:flex-start}}
  `;document.head.appendChild(s)}

  function buildEvents(goalsData,dtData,choiceData){
    const events=[];
    const goals=goalsData.goals||[], messages=goalsData.messages||[];
    const goalMap=new Map(goals.map(g=>[Number(g.id),g]));
    const messagesByGoal=new Map();
    for(const message of messages){
      const id=Number(message.goal_id);
      if(!messagesByGoal.has(id))messagesByGoal.set(id,[]);
      messagesByGoal.get(id).push(message);
    }
    for(const g of goals){
      if(g.status==='done')continue;
      const name=NAMES[g.character_slug]||g.character_slug;
      const isQ=g.entry_kind==='question';
      const gmPrompt=g.source_kind==='gm-prompt';
      const firstGM=(messagesByGoal.get(Number(g.id))||[]).find(message=>message.author_role==='gm');
      events.push({kind:isQ?'question':'interest',who:name,title:gmPrompt?'GM asked a question':isQ?'Asked a question':g.status==='pursuing'?'Marked as Pursuing':'Player interest',text:gmPrompt&&firstGM?.message_text?firstGM.message_text:g.goal_text,ts:g.updated_at||g.created_at,needs:g.thread_state==='waiting_gm',route:'#/gm-players'});
    }
    for(const m of messages){
      if(m.author_role!=='player')continue;
      const g=goalMap.get(Number(m.goal_id));if(!g)continue;
      events.push({kind:'reply',who:NAMES[g.character_slug]||g.character_slug,title:'Player replied',text:m.message_text,ts:m.created_at,needs:g.thread_state==='waiting_gm',route:'#/gm-players'});
    }
    for(const a of (dtData.actions||[])){
      events.push({kind:'downtime',who:NAMES[a.character_slug]||a.character_slug,title:`Downtime · Day ${a.day_number}`,text:a.focus_text,ts:a.updated_at||a.created_at,needs:a.state==='waiting_gm',route:'#/gm-between'});
    }
    for(const v of (choiceData.votes||[])){
      events.push({kind:'choice',who:NAMES[v.character_slug]||v.character_slug,title:'Cast group vote',text:v.source_title,ts:v.updated_at,needs:false,route:'#/gm-players'});
    }
    const seen=new Set();
    return events.filter(e=>{const key=[e.kind,e.who,e.title,e.text,e.ts].join('|');if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>new Date(b.ts||0)-new Date(a.ts||0));
  }

  function ensureHost(){
    const workspace=document.getElementById('gmOperationsView');if(!workspace||!isGM()||!onHome())return null;
    const grid=workspace.querySelector('.gm-ops-grid');if(!grid)return null;
    let host=document.getElementById('gmPlayerFeed');
    if(!host){host=document.createElement('section');host.id='gmPlayerFeed';host.className='gm-ops-card gm-player-feed';grid.prepend(host)}
    return host;
  }

  function render(events){
    const host=ensureHost();if(!host)return;
    const needsCount=events.filter(e=>e.needs).length;
    const visible=events.filter(e=>filter==='all'||e.needs).slice(0,12);
    host.innerHTML=`<div class="gm-player-feed-head"><div><span class="gm-ops-kicker">PLAYER FEED</span><h2>${needsCount?'Needs GM attention':'Player signals'}</h2><p>Automatic activity from the player site. Player thoughts are signals, not world canon.</p></div><span class="gm-player-feed-count" title="Needs GM">${needsCount}</span></div>
      <div class="gm-player-feed-tabs"><button data-feed-filter="needs" class="${filter==='needs'?'active':''}">Needs GM</button><button data-feed-filter="all" class="${filter==='all'?'active':''}">All activity</button></div>
      <div class="gm-player-feed-list">${visible.length?visible.map(e=>`<article class="gm-player-feed-item"><div class="gm-player-feed-who"><small>${esc(e.kind)} · ${esc(time(e.ts))}</small><strong>${esc(e.who)}</strong></div><div class="gm-player-feed-copy"><strong>${esc(e.title)}</strong><p>${esc(e.text)}</p></div>${e.needs?'<span class="gm-player-feed-need">Needs GM</span>':'<span></span>'}</article>`).join(''):`<div class="gm-player-feed-empty">${filter==='needs'?'Nothing currently needs a GM response.':'No player activity has been recorded yet.'}</div>`}</div>`;
    host.querySelectorAll('[data-feed-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.feedFilter;render(events)}));
  }

  async function refresh(){
    if(!isGM()||!onHome()){document.getElementById('gmPlayerFeed')?.remove();return}
    ensureStyles();const host=ensureHost();if(host&&!host.dataset.loaded)host.innerHTML='<div class="gm-player-feed-empty">Checking player activity…</div>';
    try{const [goals,dt,choice]=await Promise.all([get(URLS.goals),get(URLS.downtime),get(URLS.choice)]);render(buildEvents(goals,dt,choice));if(host)host.dataset.loaded='true'}catch(e){const h=ensureHost();if(h)h.innerHTML=`<div class="gm-player-feed-error">${esc(e.message)}</div>`}
  }
  function schedule(){setTimeout(refresh,120)}
  function start(){if(timer)clearInterval(timer);schedule();if(isGM())timer=setInterval(refresh,15000)}
  window.addEventListener('greywake:player-ready',start);window.addEventListener('hashchange',start);window.addEventListener('greywake:group-choice-changed',schedule);window.addEventListener('greywake:engagement-changed',schedule);document.addEventListener('DOMContentLoaded',start);start();
})();
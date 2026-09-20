(() => {
  if (window.__GreywakeGMInboxV3) return;
  window.__GreywakeGMInboxV3 = true;

  const GOALS_API='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const DOWNTIME_API='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/downtime';
  const API_KEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const META_KEY='greywake-gm-inbox-meta-v2';
  const NAMES={marek:'Marek',velmira:'Velmira',odie:'Odie'};
  const PLAYERS={marek:'Martin',velmira:'Carla',odie:'Ritchie'};
  const MAX_REPLY=1200;

  let activeTab='needs';
  let searchText='';
  let state={goals:[],messages:[],downtime:null,loaded:false,error:null};
  let refreshPromise=null;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
  const clean=v=>String(v??'').trim().replace(/\s+/g,' ');
  const norm=v=>clean(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const isGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const onInbox=()=>location.hash==='#/gm-inbox';
  const host=()=>document.getElementById('gmInboxHost');
  const dateLabel=value=>{
    if(!value)return'';
    const d=new Date(value);
    return Number.isNaN(d.getTime())?'':d.toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  };

  function readMeta(){
    try{
      const value=JSON.parse(localStorage.getItem(META_KEY)||'{}');
      return value&&typeof value==='object'?value:{};
    }catch{return{}}
  }
  function patchMeta(id,patch){
    const all=readMeta(),key=String(id);
    all[key]={...(all[key]||{}),...patch,updatedAt:new Date().toISOString()};
    localStorage.setItem(META_KEY,JSON.stringify(all));
  }
  function itemMeta(id){return readMeta()[String(id)]||{};}

  async function request(url,method='GET',body=null){
    const response=await fetch(url,{
      method,
      headers:{
        apikey:API_KEY,
        'Content-Type':'application/json',
        'x-greywake-character':'gm',
        'x-greywake-code':'GREYWAKE'
      },
      body:body?JSON.stringify(body):undefined
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||`Greywake request failed (${response.status}).`);
    return data;
  }

  function ensureStyles(){
    if(document.getElementById('gm-inbox-v3-styles'))return;
    const s=document.createElement('style');
    s.id='gm-inbox-v3-styles';
    s.textContent=`
      #gmInboxHost.gmi-host{padding:0;background:transparent;border:0}
      .gmi-shell{display:grid;gap:14px}
      .gmi-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
      .gmi-summary button{display:flex;justify-content:space-between;align-items:end;gap:12px;min-height:78px;padding:14px 15px;border:1px solid #45402f;background:#171611;color:#d8cfb8;cursor:pointer;text-align:left}
      .gmi-summary button:hover{border-color:#7a6b46}.gmi-summary button.active{border-color:#ad995e;background:#282316;box-shadow:inset 0 -2px 0 #b49c5d}
      .gmi-summary small{display:block;color:#8f866f;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}.gmi-summary strong{font:500 18px/1.1 Georgia,serif;color:#eee5cb}.gmi-summary b{font:600 26px/1 Georgia,serif;color:#d8c98f}
      .gmi-tools{display:flex;gap:8px;align-items:center}.gmi-search{flex:1;min-width:0;background:#11110e;border:1px solid #484331;color:#e8dfc8;padding:10px 11px;font:inherit}.gmi-refresh{border:1px solid #5d553d;background:#1a1913;color:#d8cfb8;padding:10px 12px;cursor:pointer}
      .gmi-rule{padding:10px 12px;border-left:2px solid #ad995e;background:rgba(173,153,94,.07);color:#aaa18b;font-size:11px;line-height:1.5}.gmi-rule strong{color:#dfd3b1}
      .gmi-status{font-size:9px;color:#7f7868}.gmi-status.error{color:#d59b86}
      .gmi-list{display:grid;gap:10px}.gmi-empty{padding:24px 16px;border:1px dashed #45402f;background:#151510;color:#8f8875;text-align:center}
      .gmi-card{border:1px solid #413d2f;background:linear-gradient(145deg,#181712,#12120f);overflow:hidden}.gmi-card[open]{border-color:#655d43}
      .gmi-card>summary{list-style:none;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:14px 15px;cursor:pointer}.gmi-card>summary::-webkit-details-marker{display:none}
      .gmi-kicker{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}.gmi-pill{display:inline-flex;padding:4px 6px;border:1px solid #4e4937;color:#a89f89;font-size:7px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}
      .gmi-pill.needs{border-color:#8c7043;color:#dec18b}.gmi-pill.session{border-color:#765a50;color:#dfb3a5}.gmi-pill.resolved{border-color:#465344;color:#aabca4}.gmi-pill.waiting{border-color:#455367;color:#a9b7cc}
      .gmi-card h3{margin:0;color:#eee5cb;font:500 16px/1.3 Georgia,serif}.gmi-sub{margin-top:6px;color:#8f8876;font-size:10px}.gmi-chevron{align-self:center;color:#9c9279;font-size:17px}
      .gmi-body{border-top:1px solid #343126;padding:14px 15px;display:grid;gap:12px}.gmi-source{display:flex;gap:8px;align-items:center;flex-wrap:wrap;color:#8f8876;font-size:10px}.gmi-source button{border:0;background:none;color:#cfbd82;text-decoration:underline;cursor:pointer;padding:0}
      .gmi-thread{display:grid;gap:7px}.gmi-message{padding:10px 11px;border-left:2px solid #56503c;background:#14130f}.gmi-message.gm{border-left-color:#9d8750;background:#1b1912}.gmi-message.table{border-left-color:#865c4c}.gmi-message small{display:block;margin-bottom:4px;color:#8e866f;font-size:7px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}.gmi-message p{margin:0;color:#d4cbb4;line-height:1.5;white-space:pre-wrap}.gmi-message time{display:block;margin-top:5px;color:#6f695a;font-size:8px}
      .gmi-actions textarea{width:100%;box-sizing:border-box;min-height:72px;resize:vertical;background:#10100d;border:1px solid #4a4534;color:#ece3cb;padding:10px;font:inherit}.gmi-buttons{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.gmi-buttons button,.gmi-private button{border:1px solid #655c42;background:#201e16;color:#ddd3b9;padding:8px 10px;cursor:pointer}.gmi-buttons .primary{border-color:#a38d53;background:#2a2517;color:#f0e3bd}.gmi-buttons .resolve{margin-left:auto;border-color:#53634f}.gmi-buttons button:disabled,.gmi-private button:disabled{opacity:.5;cursor:wait}
      .gmi-private{padding:12px;border:1px solid #3a382f;background:#10110f}.gmi-private-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:8px}.gmi-private-head strong{color:#b9af96;font-size:9px;letter-spacing:.1em;text-transform:uppercase}.gmi-private-head span{color:#6f6a5b;font-size:8px}.gmi-private textarea,.gmi-private input{width:100%;box-sizing:border-box;margin:0 0 7px;background:#0d0e0c;border:1px solid #3f3d34;color:#d8d1bf;padding:8px 9px;font:inherit}
      .gmi-downtime{border:1px solid #47402f;background:#17150f;padding:14px}.gmi-downtime h3{margin:3px 0 7px;color:#eee4c8;font:500 17px/1.2 Georgia,serif}.gmi-downtime p{margin:0;color:#aaa18b;line-height:1.5}.gmi-dt-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:10px}.gmi-dt-grid div{padding:9px;border:1px solid #39362a;background:#12110e}.gmi-dt-grid small{display:block;color:#857d69;font-size:7px;letter-spacing:.11em;text-transform:uppercase}.gmi-dt-grid strong{display:block;margin-top:4px;color:#d8cfb7;font-size:11px}
      @media(max-width:720px){.gmi-summary{grid-template-columns:1fr}.gmi-dt-grid{grid-template-columns:1fr}.gmi-buttons .resolve{margin-left:0}}
    `;
    document.head.appendChild(s);
  }

  function goalRows(goal){return Array.isArray(goal._mergedGoals)?goal._mergedGoals:[goal];}
  function goalIds(goal){return goalRows(goal).map(g=>Number(g.id));}
  function messagesFor(goal){
    const ids=new Set(goalIds(goal));
    return state.messages
      .filter(m=>ids.has(Number(m.goal_id)))
      .sort((a,b)=>new Date(a.created_at||a.updated_at||0)-new Date(b.created_at||b.updated_at||0));
  }
  function latestAt(goal){
    const rows=messagesFor(goal);
    const goalDates=goalRows(goal).flatMap(g=>[g.updated_at,g.created_at]).filter(Boolean);
    const messageDates=rows.flatMap(m=>[m.updated_at,m.created_at]).filter(Boolean);
    return [...goalDates,...messageDates].sort((a,b)=>new Date(b)-new Date(a))[0]||'';
  }
  function topicKey(goal){
    const haystack=norm(`${goal.goal_text||''} ${goal.source_title||''}`);
    if(goal.character_slug==='marek'&&goal.entry_kind==='interest'&&haystack.includes('flickerfly'))return'marek:interest:flickerfly';
    return`goal:${goal.id}`;
  }
  function displayedGoals(){
    const groups=new Map();
    state.goals.forEach(goal=>{
      const key=topicKey(goal);
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(goal);
    });
    return [...groups.entries()].map(([key,rows])=>{
      if(rows.length===1)return rows[0];
      const primary=[...rows].sort((a,b)=>{
        const rank=g=>g.thread_state==='waiting_gm'?4:g.thread_state==='play_at_table'?3:g.thread_state==='waiting_player'?2:g.status==='pursuing'?1:0;
        const diff=rank(b)-rank(a);
        if(diff)return diff;
        return new Date(b.updated_at||b.created_at||0)-new Date(a.updated_at||a.created_at||0);
      })[0];
      return {...primary,_mergedGoals:rows,_displayTitle:key==='marek:interest:flickerfly'?'Find a Flickerfly':primary.goal_text};
    });
  }
  function bucket(goal){
    const rows=goalRows(goal);
    if(rows.every(g=>g.status==='done'||g.thread_state==='resolved'))return'resolved';
    if(rows.some(g=>g.thread_state==='play_at_table'))return'session';
    return'needs';
  }
  function stateLabel(goal){
    const rows=goalRows(goal);
    if(bucket(goal)==='resolved')return'Resolved';
    if(rows.some(g=>g.thread_state==='play_at_table'))return'Session Queue';
    if(rows.some(g=>g.thread_state==='waiting_gm'))return'Needs You';
    if(rows.some(g=>g.thread_state==='waiting_player'))return'Waiting on Player';
    if(rows.some(g=>g.status==='pursuing'))return'Pursuing';
    if(rows.some(g=>g.status==='dormant'))return'Dormant';
    return'Needs You';
  }
  function displayTitle(goal){return goal._displayTitle||goal.goal_text||'Greywake thread';}
  function searchable(goal){
    const goals=goalRows(goal);
    const metas=goals.map(g=>itemMeta(g.id));
    return [
      displayTitle(goal),goal.character_slug,NAMES[goal.character_slug],PLAYERS[goal.character_slug],
      ...goals.flatMap((g,i)=>[g.goal_text,g.entry_kind,g.source_title,metas[i].note,metas[i].linkTitle,metas[i].linkRoute]),
      ...messagesFor(goal).map(m=>m.message_text)
    ].filter(Boolean).join(' ').toLowerCase();
  }
  function counts(goals=displayedGoals()){
    const c={needs:0,session:0,resolved:0};
    goals.forEach(g=>c[bucket(g)]++);
    const w=state.downtime?.window;
    if(w){
      if(w.status==='paused')c.session++;
      else if(state.downtime?.readiness?.all_ready)c.needs++;
    }
    return c;
  }

  function sourceMarkup(goal,meta){
    const title=norm(displayTitle(goal));
    const links=[];
    const seen=new Set();
    goalRows(goal).forEach(g=>{
      const label=clean(g.source_title||'');
      if(!label||norm(label)===title)return;
      const route=String(g.source_route||'');
      const key=`${norm(label)}|${route}`;
      if(seen.has(key))return;
      seen.add(key);
      links.push(route?`<button type="button" data-gmi-route="${esc(route)}">${esc(label)}</button>`:`<strong>${esc(label)}</strong>`);
    });
    if(meta.linkRoute||meta.linkTitle){
      const label=clean(meta.linkTitle||meta.linkRoute||'');
      if(label&&norm(label)!==title)links.push(`<button type="button" data-gmi-route="${esc(meta.linkRoute||'')}">${esc(label)}</button>`);
    }
    return links.length?`<div class="gmi-source"><span>Linked to</span>${links.join('<span>·</span>')}</div>`:'';
  }

  function threadMarkup(goal){
    const char=NAMES[goal.character_slug]||goal.character_slug;
    const goals=goalRows(goal).slice().sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0));
    const merged=goals.length>1;
    const title=norm(displayTitle(goal));
    const rows=[];
    goals.forEach(g=>{
      const text=clean(g.goal_text);
      const duplicateOnly=!merged&&norm(text)===title&&norm(g.source_title||'')===title;
      if(duplicateOnly)return;
      rows.push(`<div class="gmi-message player"><small>${esc(char)} · ${g.entry_kind==='question'?'Question':'Interest'}</small><p>${esc(text)}</p>${g.created_at?`<time>${esc(dateLabel(g.created_at))}</time>`:''}</div>`);
    });
    messagesFor(goal).forEach(m=>{
      const gm=m.author_role==='gm';
      const type=m.message_kind==='lead'?'Lead':m.message_kind==='table'?'Held for session':'Reply';
      rows.push(`<div class="gmi-message ${gm?'gm':'player'} ${m.message_kind==='table'?'table':''}"><small>${gm?'GM':esc(char)} · ${esc(type)}</small><p>${esc(m.message_text)}</p>${m.created_at?`<time>${esc(dateLabel(m.created_at))}</time>`:''}</div>`);
    });
    return rows.length?`<div class="gmi-thread">${rows.join('')}</div>`:'';
  }

  function cardMarkup(goal){
    const meta=itemMeta(goal.id),b=bucket(goal),char=NAMES[goal.character_slug]||goal.character_slug,player=PLAYERS[goal.character_slug]||'Player';
    const title=displayTitle(goal);
    const sourceTitles=[...new Set(goalRows(goal).map(g=>clean(g.source_title||'')).filter(Boolean))].filter(t=>norm(t)!==norm(title));
    const sourceSuffix=sourceTitles.length?` · ${esc(sourceTitles.join(' · '))}`:'';
    return `<details class="gmi-card" data-gmi-id="${goal.id}" data-gmi-ids="${goalIds(goal).join(',')}">
      <summary><div><div class="gmi-kicker"><span class="gmi-pill ${b}">${esc(stateLabel(goal))}</span><span class="gmi-pill">${goal.entry_kind==='question'?'Question':'Interest'}</span><span class="gmi-pill">${esc(player)} · ${esc(char)}</span></div><h3>${esc(title)}</h3><div class="gmi-sub">${latestAt(goal)?`Last activity ${esc(dateLabel(latestAt(goal)))}`:'Saved Greywake thread'}${sourceSuffix}</div></div><span class="gmi-chevron">⌄</span></summary>
      <div class="gmi-body">${sourceMarkup(goal,meta)}${threadMarkup(goal)}
      ${b==='resolved'
        ? `<div class="gmi-buttons"><button type="button" data-gmi-reopen>Reopen thread</button></div>`
        : `<div class="gmi-actions"><textarea maxlength="${MAX_REPLY}" data-gmi-reply placeholder="Reply to ${esc(char)}…"></textarea><div class="gmi-buttons"><button type="button" class="primary" data-gmi-send="reply">Reply</button><button type="button" data-gmi-send="lead">Give Lead</button>${b!=='session'?'<button type="button" data-gmi-send="table">Hold for Session</button>':''}<button type="button" class="resolve" data-gmi-resolve>Resolve</button></div></div>`
      }
      <div class="gmi-private"><div class="gmi-private-head"><strong>Private GM material</strong><span>Browser-only; never sent to players.</span></div><textarea rows="3" data-gmi-note placeholder="Private GM note / spoiler…">${esc(meta.note||'')}</textarea><input data-gmi-link-title placeholder="Greywake link label (optional)" value="${esc(meta.linkTitle||'')}"><input data-gmi-link-route placeholder="Greywake route, e.g. #/record/The%20Closing%20Ways" value="${esc(meta.linkRoute||'')}"><button type="button" data-gmi-save-meta>Save GM note & link</button></div>
      </div></details>`;
  }

  function downtimeMarkup(){
    const d=state.downtime,w=d?.window;
    if(!w)return'';
    const today=(d.actions||[]).filter(a=>Number(a.day_number)===Number(w.current_day));
    const allReady=Boolean(d.readiness?.all_ready);
    const cards=['marek','velmira','odie'].map(slug=>{
      const a=today.find(x=>x.character_slug===slug);
      const label=!a?'No focus yet':a.state==='waiting_gm'?(allReady?'Ready for GM':'Focus received'):a.state==='waiting_player'?'Waiting on player':a.state==='live_scene'?'Live scene':a.state||'Received';
      return `<div><small>${esc(NAMES[slug])}</small><strong>${esc(label)}</strong>${a?.focus_text?`<span>${esc(a.focus_text)}</span>`:''}</div>`;
    }).join('');
    const show=(w.status==='paused'&&activeTab==='session')||(w.status!=='paused'&&allReady&&activeTab==='needs');
    if(!show||searchText)return'';
    return `<section class="gmi-downtime"><small>DOWNTIME</small><h3>${w.status==='paused'?'Live scene required':'All downtime choices are in'}</h3><p>${esc(w.pause_reason||w.reason||'Shared Greywake downtime needs GM attention.')}</p><div class="gmi-dt-grid">${cards}</div></section>`;
  }

  function renderLocal(){
    if(!isGM()||!onInbox())return;
    ensureStyles();
    const h=host(); if(!h)return;
    const displayed=displayedGoals();
    const c=counts(displayed),q=searchText.toLowerCase();
    const visible=displayed
      .filter(g=>bucket(g)===activeTab&&(!q||searchable(g).includes(q)))
      .sort((a,b)=>new Date(latestAt(b)||0)-new Date(latestAt(a)||0));
    h.className='gm-panel full gmi-host';
    if(!state.loaded&&!state.error){
      h.innerHTML='<div class="gmi-empty">Loading Greywake Inbox…</div>';
      return;
    }
    h.innerHTML=`<div class="gmi-shell">
      <div class="gmi-summary">
        <button type="button" data-gmi-tab="needs" class="${activeTab==='needs'?'active':''}"><span><small>TRIAGE</small><strong>Needs You</strong></span><b>${c.needs}</b></button>
        <button type="button" data-gmi-tab="session" class="${activeTab==='session'?'active':''}"><span><small>LIVE PLAY</small><strong>Session Queue</strong></span><b>${c.session}</b></button>
        <button type="button" data-gmi-tab="resolved" class="${activeTab==='resolved'?'active':''}"><span><small>PERMANENT HISTORY</small><strong>Resolved</strong></span><b>${c.resolved}</b></button>
      </div>
      <div class="gmi-tools"><input class="gmi-search" value="${esc(searchText)}" placeholder="Search player, character, question, reply, source or GM note…"><button type="button" class="gmi-refresh">Refresh</button></div>
      <div class="gmi-rule"><strong>Inbox state is not canon state.</strong> Replying, holding for session or resolving never canonises Greywake. Resolved threads remain here.</div>
      <div class="gmi-status ${state.error?'error':''}">${state.error?esc(state.error):`Loaded ${displayed.length} threads.`}</div>
      ${downtimeMarkup()}
      <div class="gmi-list">${visible.length?visible.map(cardMarkup).join(''):`<div class="gmi-empty">${q?'No threads match this search.':activeTab==='resolved'?'Nothing has been resolved yet.':activeTab==='session'?'Nothing is currently held for live play.':'Nothing currently needs GM attention.'}</div>`}</div>
    </div>`;
  }

  async function refresh(){
    if(!isGM()||!onInbox())return;
    if(refreshPromise)return refreshPromise;
    state.error=null;
    renderLocal();
    refreshPromise=(async()=>{
      try{
        const [g,d]=await Promise.allSettled([request(GOALS_API),request(DOWNTIME_API)]);
        if(g.status!=='fulfilled')throw g.reason;
        state.goals=Array.isArray(g.value.goals)?g.value.goals:[];
        state.messages=Array.isArray(g.value.messages)?g.value.messages:[];
        state.downtime=d.status==='fulfilled'?d.value:null;
        state.loaded=true;
      }catch(e){
        state.error=e instanceof Error?e.message:String(e);
        state.loaded=true;
      }finally{
        refreshPromise=null;
        renderLocal();
      }
    })();
    return refreshPromise;
  }

  async function mutate(card,work,nextTab=null){
    const buttons=card.querySelectorAll('button');
    buttons.forEach(b=>b.disabled=true);
    try{
      await work();
      if(nextTab)activeTab=nextTab;
      await refresh();
      window.dispatchEvent(new CustomEvent('greywake:engagement-changed'));
    }catch(e){
      alert(e instanceof Error?e.message:String(e));
      buttons.forEach(b=>b.disabled=false);
    }
  }

  document.addEventListener('click',event=>{
    if(!isGM()||!onInbox())return;
    const h=host(); if(!h||!h.contains(event.target))return;
    const tab=event.target.closest('[data-gmi-tab]');
    if(tab){activeTab=tab.dataset.gmiTab;renderLocal();return;}
    if(event.target.closest('.gmi-refresh')){refresh();return;}
    const route=event.target.closest('[data-gmi-route]');
    if(route){const r=route.dataset.gmiRoute;if(r)location.hash=r;return;}
    const card=event.target.closest('[data-gmi-id]');
    if(!card)return;
    const id=Number(card.dataset.gmiId);
    const ids=String(card.dataset.gmiIds||id).split(',').map(Number).filter(Number.isFinite);
    const send=event.target.closest('[data-gmi-send]');
    if(send){
      const kind=send.dataset.gmiSend;
      let message=clean(card.querySelector('[data-gmi-reply]')?.value||'');
      if(kind==='table'&&!message)message='This has reached a point that should be played at the table. We will pick it up during a game session.';
      if(!message){card.querySelector('[data-gmi-reply]')?.focus();return;}
      mutate(card,()=>request(GOALS_API,'POST',{goal_id:id,message:message.slice(0,MAX_REPLY),kind}),kind==='table'?'session':activeTab);
      return;
    }
    if(event.target.closest('[data-gmi-resolve]')){mutate(card,()=>Promise.all(ids.map(goalId=>request(GOALS_API,'PATCH',{id:goalId,status:'done'}))),'resolved');return;}
    if(event.target.closest('[data-gmi-reopen]')){mutate(card,()=>Promise.all(ids.map(goalId=>request(GOALS_API,'PATCH',{id:goalId,status:'open'}))),'needs');return;}
    if(event.target.closest('[data-gmi-save-meta]')){
      patchMeta(id,{
        note:card.querySelector('[data-gmi-note]')?.value||'',
        linkTitle:clean(card.querySelector('[data-gmi-link-title]')?.value||''),
        linkRoute:clean(card.querySelector('[data-gmi-link-route]')?.value||'')
      });
      const b=event.target.closest('[data-gmi-save-meta]'),old=b.textContent;b.textContent='Saved';setTimeout(()=>b.textContent=old,700);
      return;
    }
  });

  document.addEventListener('input',event=>{
    if(!isGM()||!onInbox())return;
    if(!event.target.matches('#gmInboxHost .gmi-search'))return;
    searchText=event.target.value;
    const pos=event.target.selectionStart;
    renderLocal();
    const next=host()?.querySelector('.gmi-search');
    if(next){next.focus();try{next.setSelectionRange(pos,pos)}catch{}}
  });

  window.addEventListener('hashchange',()=>{if(onInbox())setTimeout(()=>{renderLocal();refresh();},0);});
  window.addEventListener('greywake:player-ready',()=>{if(onInbox())setTimeout(refresh,0);});
  window.addEventListener('greywake:engagement-changed',()=>{if(onInbox())setTimeout(refresh,80);});
  document.addEventListener('DOMContentLoaded',()=>{if(onInbox())setTimeout(refresh,100);});
  setTimeout(()=>{if(onInbox())refresh();},220);

  window.GreywakeInboxDebug={
    getState:()=>({activeTab,searchText,loaded:state.loaded,error:state.error,goals:state.goals.length,displayedGoals:displayedGoals().length,messages:state.messages.length}),
    refresh
  };
})();
(() => {
  const API_URL='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/downtime';
  const GOALS_API_URL='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const NAMES={marek:'Marek',velmira:'Velmira',odie:'Odie'};
  const SUGGESTIONS={
    marek:['Investigate something','Study or research something','Prepare for the next expedition','Nothing special'],
    odie:['Check the Digger tunnels','Work on or repair something','Investigate something','Prepare for the next expedition','Nothing special'],
    velmira:['Check on Nemi','Spend time with Tavi','Follow a Stilling lead','Work trade contacts','Prepare for the next expedition','Nothing special']
  };

  const style=document.createElement('style');
  style.textContent=`
    .downtime-panel{max-width:1100px;margin:30px auto 36px;padding:0 18px;box-sizing:border-box;color:#e8dfc5}
    .downtime-shell{position:relative;overflow:hidden;border:1px solid rgba(203,184,119,.42);background:linear-gradient(135deg,rgba(23,22,18,.98),rgba(36,32,24,.95));box-shadow:0 16px 38px rgba(0,0,0,.32)}
    .downtime-shell:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 78% 18%,rgba(198,171,92,.10),transparent 34%),linear-gradient(90deg,rgba(255,255,255,.018),transparent 32%);pointer-events:none}
    .downtime-inner{position:relative;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(260px,.8fr);gap:0}
    .downtime-main{padding:24px 26px 26px;border-right:1px solid rgba(203,184,119,.20)}
    .downtime-side{padding:24px 24px 22px;background:rgba(8,8,7,.24)}
    .downtime-kicker{font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:#cdbb79;font-weight:700;margin-bottom:7px}
    .downtime-title{font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.55rem,2.2vw,2.15rem);line-height:1.05;margin:0 0 8px;color:#f2ead2;font-weight:500}
    .downtime-copy{margin:0;color:#c9c1aa;max-width:62ch;line-height:1.55}
    .downtime-clock{display:flex;align-items:center;gap:10px;margin:20px 0 0;flex-wrap:wrap}
    .downtime-day{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border:1px solid rgba(205,187,121,.42);background:rgba(205,187,121,.06);font-size:.78rem;letter-spacing:.04em}
    .downtime-day strong{font-size:1rem;color:#f2ead2}
    .downtime-state{font-size:.68rem;letter-spacing:.13em;text-transform:uppercase;color:#a99f84}
    .downtime-state.is-paused{color:#d89b7d}
    .downtime-progress{display:flex;gap:6px;margin-top:14px}
    .downtime-progress span{height:3px;flex:1;max-width:68px;background:rgba(205,187,121,.16)}
    .downtime-progress span.is-done,.downtime-progress span.is-current{background:#cdbb79}
    .downtime-progress span.is-current{box-shadow:0 0 0 1px rgba(205,187,121,.18)}
    .downtime-focus-label{font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:#a99f84;margin-bottom:8px}
    .downtime-focus{font-family:Georgia,'Times New Roman',serif;font-size:1.22rem;line-height:1.35;color:#f2ead2;margin:0 0 8px}
    .downtime-response{margin:10px 0 0;color:#d4ccb5;line-height:1.55}
    .downtime-waiting{margin-top:16px;padding-top:14px;border-top:1px solid rgba(205,187,121,.16);font-size:.78rem;letter-spacing:.11em;text-transform:uppercase;color:#cdbb79}
    .downtime-actions{display:grid;gap:10px;margin-top:16px}
    .downtime-actions textarea,.downtime-actions input,.downtime-actions select{width:100%;box-sizing:border-box;background:#14130f;color:#eee5cd;border:1px solid #5f5742;padding:11px 12px;font:inherit}
    .downtime-actions button,.downtime-suggestions button,.downtime-pursuits button{border:1px solid #766b4c;background:rgba(178,156,88,.08);color:#e8dfc5;padding:9px 12px;font:inherit;cursor:pointer}
    .downtime-actions button:hover,.downtime-suggestions button:hover,.downtime-pursuits button:hover{background:rgba(178,156,88,.16);border-color:#ad9b62}
    .downtime-suggestions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    .downtime-suggestions button{font-size:.84rem}
    .downtime-pursuits{display:grid;gap:7px;margin:12px 0 16px}
    .downtime-pursuits button{text-align:left;padding:11px 12px;border-color:rgba(205,187,121,.46);background:rgba(205,187,121,.09)}
    .downtime-pursuits button small{display:block;margin-bottom:3px;font-size:.62rem;letter-spacing:.13em;text-transform:uppercase;color:#cdbb79}
    .downtime-divider{height:1px;background:rgba(205,187,121,.15);margin:15px 0}
    .downtime-note{color:#aaa28d;line-height:1.5;margin:.35rem 0 0}
    .downtime-paused-note{margin-top:14px;padding:11px 12px;border-left:2px solid #b87456;background:rgba(129,68,45,.12);color:#dbc4b5}
    .downtime-error{color:#e2a18e}
    .downtime-grid{display:grid;gap:10px}
    .downtime-entry{padding:13px 0;border-top:1px solid rgba(205,187,121,.14)}
    .downtime-entry:first-child{border-top:0}
    .downtime-status{font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:#cdbb79;margin-bottom:5px}
    .downtime-gm-note{margin-top:16px;padding:12px 13px;border:1px solid rgba(205,187,121,.22);background:rgba(205,187,121,.05);color:#c9c1aa;line-height:1.5}
    @media(max-width:760px){.downtime-panel{padding:0 12px}.downtime-inner{grid-template-columns:1fr}.downtime-main{border-right:0;border-bottom:1px solid rgba(203,184,119,.20)}.downtime-main,.downtime-side{padding:20px}}
  `;
  document.head.appendChild(style);

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));}
  function currentUser(){return window.GreywakePlayer||null;}
  function identity(){
    const u=currentUser(); if(!u)return null;
    const isPreview=document.body.dataset.gmPreview==='true';
    if(u.role==='gm'&&!isPreview)return{character:'gm',code:'GREYWAKE',role:'gm'};
    const slug=(document.body.dataset.character||u.character||'').toLowerCase();
    return{character:slug,code:String(u.code||NAMES[slug]||'').toUpperCase(),role:u.role};
  }
  async function requestTo(url,method='GET',body=null){
    const id=identity(); if(!id)throw new Error('Player identity unavailable.');
    const r=await fetch(url,{method,headers:{apikey:API_KEY,'Content-Type':'application/json','x-greywake-character':id.character,'x-greywake-code':id.code},body:body?JSON.stringify(body):undefined});
    const d=await r.json().catch(()=>({})); if(!r.ok)throw new Error(d.error||'Greywake update failed.'); return d;
  }
  function req(method='GET',body=null){return requestTo(API_URL,method,body);}
  function reqGoals(){return requestTo(GOALS_API_URL,'GET');}
  function ensureHost(){
    let host=document.getElementById('downtimePanel'); if(host)return host;
    host=document.createElement('section'); host.id='downtimePanel'; host.className='downtime-panel';
    const home=document.getElementById('home');
    const goals=document.getElementById('playerGoals');
    if(goals?.parentElement===home) goals.insertAdjacentElement('beforebegin',host);
    else home?.querySelector('.hero')?.insertAdjacentElement('afterend',host);
    return host;
  }
  function stateLabel(s){return({waiting_gm:'Waiting on GM',waiting_player:'Waiting on player',resolved_today:'Resolved for today',live_scene:'Live scene',complete:'Complete'})[s]||s;}
  function progressMarkup(w){
    return `<div class="downtime-progress" aria-label="Downtime progress">${Array.from({length:w.total_days},(_,i)=>`<span class="${i+1<w.current_day?'is-done':i+1===w.current_day?'is-current':''}"></span>`).join('')}</div>`;
  }
  function shell(main,side){return `<div class="downtime-shell"><div class="downtime-inner"><div class="downtime-main">${main}</div><aside class="downtime-side">${side}</aside></div></div>`;}

  async function render(){
    const host=ensureHost(); if(!host)return; const id=identity(); if(!id){host.hidden=true;return;}
    host.hidden=false; host.innerHTML=shell('<div class="downtime-kicker">TIME IN GREYWAKE</div><h2 class="downtime-title">Loading…</h2>','<p class="downtime-note">Checking the shared clock.</p>');
    try{
      const data=await req(); const w=data.window,actions=data.actions||[];
      if(id.role==='gm'&&id.character==='gm')return renderGM(host,w,actions);
      let pursuing=[];
      try{const goalData=await reqGoals(); pursuing=(goalData.goals||[]).filter(g=>g.entry_kind==='interest'&&g.status==='pursuing');}catch(_){pursuing=[];}
      return renderPlayer(host,w,actions,id,pursuing);
    }catch(e){host.innerHTML=shell('<div class="downtime-kicker">TIME IN GREYWAKE</div><h2 class="downtime-title">Downtime unavailable</h2>',`<p class="downtime-error">${esc(e.message)}</p>`);}
  }

  function renderPlayer(host,w,actions,id,pursuing=[]){
    if(!w){host.innerHTML=shell('<div class="downtime-kicker">TIME IN GREYWAKE</div><h2 class="downtime-title">No downtime right now</h2><p class="downtime-copy">When the fiction creates a stretch of free time, it will appear here.</p>','<div class="downtime-focus-label">BETWEEN GAMES</div><p class="downtime-note">Interests and questions still work normally.</p>');return;}
    const a=actions.find(x=>x.day_number===w.current_day); const paused=w.status==='paused';
    const main=`<div class="downtime-kicker">TIME IN GREYWAKE</div><h2 class="downtime-title">${w.total_days===1?'A day in Greywake':`${w.total_days} days in Greywake`}</h2><p class="downtime-copy">${esc(w.reason||'There is time before the next major departure.')}</p><div class="downtime-clock"><span class="downtime-day">DAY <strong>${w.current_day}</strong> / ${w.total_days}</span><span class="downtime-state ${paused?'is-paused':''}">${paused?'Shared clock paused':'Shared clock active'}</span></div>${progressMarkup(w)}${paused?`<div class="downtime-paused-note"><strong>Something now needs live play.</strong><br>${esc(w.pause_reason||'Nobody moves further forward until that scene is resolved.')}</div>`:''}`;
    let side='';
    if(a){
      side=`<div class="downtime-focus-label">${esc(NAMES[id.character]||'Your character')} · TODAY</div><p class="downtime-focus">${esc(a.focus_text)}</p>${a.gm_response?`<p class="downtime-response">${esc(a.gm_response)}</p>`:''}<div class="downtime-waiting">${esc(stateLabel(a.state))}</div>`;
      if(!paused&&a.state==='waiting_player')side+=`<div class="downtime-actions"><textarea id="downtimeFocus" rows="3" placeholder="What does ${esc(NAMES[id.character]||'your character')} do next?"></textarea><button id="downtimeSubmit">Send next step</button></div>`;
    }else if(!paused){
      const pursuitMarkup=pursuing.length?`<div class="downtime-focus-label">ALREADY PURSUING</div><div class="downtime-pursuits">${pursuing.map(g=>`<button type="button" data-dt-focus="${esc(g.goal_text)}"><small>Continue this</small>${esc(g.goal_text)}</button>`).join('')}</div><div class="downtime-divider"></div>`:'';
      const buttons=(SUGGESTIONS[id.character]||SUGGESTIONS.marek).map(x=>`<button type="button" data-dt-suggestion="${esc(x)}">${esc(x)}</button>`).join('');
      side=`<div class="downtime-focus-label">${esc(NAMES[id.character]||'Your character')} · TODAY</div><p class="downtime-focus">What matters today?</p><p class="downtime-note">Choose one meaningful focus. A sentence is enough.</p>${pursuitMarkup}<div class="downtime-focus-label">OR CHOOSE A TYPE OF ACTIVITY</div><div class="downtime-suggestions">${buttons}</div><div class="downtime-actions"><textarea id="downtimeFocus" rows="3" maxlength="500" placeholder="Or write your own specific focus…"></textarea><button id="downtimeSubmit">Choose this focus</button></div>`;
    }else side='<div class="downtime-focus-label">TODAY</div><p class="downtime-note">This timeline is waiting for the live scene to be resolved.</p>';
    host.innerHTML=shell(main,side);
    host.querySelectorAll('[data-dt-focus]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await req('POST',{action:'submit_focus',focus:b.dataset.dtFocus});await render();}catch(e){alert(e.message);b.disabled=false;}});
    host.querySelectorAll('[data-dt-suggestion]').forEach(b=>b.onclick=()=>{const t=host.querySelector('#downtimeFocus');if(t){t.value='';t.placeholder=`What specifically does ${NAMES[id.character]||'your character'} do to ${b.dataset.dtSuggestion.toLowerCase()}?`;t.focus();}});
    const submit=host.querySelector('#downtimeSubmit'); if(submit)submit.onclick=async()=>{const t=host.querySelector('#downtimeFocus');const focus=t?.value.trim();if(!focus)return;t.disabled=submit.disabled=true;try{await req('POST',{action:'submit_focus',focus});await render();}catch(e){alert(e.message);t.disabled=submit.disabled=false;}};
  }

  function renderGM(host,w,actions){
    if(!w){
      host.innerHTML=shell('<div class="downtime-kicker">GM · TIME IN GREYWAKE</div><h2 class="downtime-title">No downtime window</h2><p class="downtime-copy">Downtime is managed through your Greywake ChatGPT conversation when the fiction creates a period of spare time.</p>','<div class="downtime-focus-label">GM WORKFLOW</div><p class="downtime-note">Tell ChatGPT when downtime begins. The site will update for the players automatically.</p>');
      return;
    }
    const cards=['marek','velmira','odie'].map(slug=>{
      const a=actions.find(x=>x.character_slug===slug&&x.day_number===w.current_day);
      return `<div class="downtime-entry"><div class="downtime-status">${esc(NAMES[slug])} · ${a?esc(stateLabel(a.state)):'No focus yet'}</div>${a?`<strong>${esc(a.focus_text)}</strong>${a.gm_response?`<p class="downtime-response">${esc(a.gm_response)}</p>`:''}`:'<p class="downtime-note">Waiting for player input.</p>'}</div>`;
    }).join('');
    const main=`<div class="downtime-kicker">GM · SHARED GREYWAKE CLOCK</div><h2 class="downtime-title">Day ${w.current_day} of ${w.total_days}</h2><p class="downtime-copy">${esc(w.reason)}</p><div class="downtime-clock"><span class="downtime-state ${w.status==='paused'?'is-paused':''}">${w.status==='paused'?'PAUSED — LIVE SCENE':'OPEN — CONCURRENT ACTIONS'}</span></div>${progressMarkup(w)}${w.status==='paused'?`<div class="downtime-paused-note"><strong>Shared timeline paused.</strong><br>${esc(w.pause_reason||'Resolve the live scene before time advances.')}</div>`:''}<div class="downtime-gm-note"><strong>GM actions happen in ChatGPT.</strong><br>Tell ChatGPT how you want to resolve a player action, whether it needs player input, or whether it becomes a live scene. ChatGPT updates the shared clock and player site.</div>`;
    host.innerHTML=shell(main,`<div class="downtime-grid">${cards}</div>`);
  }

  window.addEventListener('greywake:player-ready',render);
  window.addEventListener('greywake:engagement-changed',render);
  document.addEventListener('DOMContentLoaded',render);
  setTimeout(render,300);
})();
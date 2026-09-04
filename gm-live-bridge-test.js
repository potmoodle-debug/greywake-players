(() => {
  if(window.__GreywakeGMLiveBridgeTest)return;
  window.__GreywakeGMLiveBridgeTest=true;

  const SELECTED_KEY='greywake-live-bridge-selected-chat-v1';
  let bridgeReady=false,chats=[],pending=null,queued=false,timer=null;
  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const onUpdate=()=>location.hash==='#/gm-update';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const selectedKey=()=>localStorage.getItem(SELECTED_KEY)||'';
  const selectKey=key=>{localStorage.setItem(SELECTED_KEY,key||'');schedule()};
  const chosen=()=>chats.find(x=>x.key===selectedKey())||chats[0]||null;
  const age=v=>{const d=new Date(v);if(Number.isNaN(d.getTime()))return'unknown';const s=Math.max(0,Math.round((Date.now()-d.getTime())/1000));if(s<60)return`${s}s ago`;if(s<3600)return`${Math.round(s/60)}m ago`;return`${Math.round(s/3600)}h ago`};

  function ensureStyles(){
    if(document.getElementById('gm-live-bridge-test-styles'))return;
    const s=document.createElement('style');s.id='gm-live-bridge-test-styles';s.textContent=`
      .gm-bridge-test{grid-column:1/-1;border-color:#665332!important;background:#17140f!important}.gm-bridge-test-head{display:flex;justify-content:space-between;gap:16px;align-items:end}.gm-bridge-test-head p{margin:0;color:#9a8b67;font-size:9px;max-width:620px}.gm-bridge-badge{border:1px solid #725f38;padding:4px 7px;color:#d4ba73;font-size:7px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
      .gm-bridge-status{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.gm-bridge-status div{border:1px solid #3c372c;background:#10110d;padding:10px}.gm-bridge-status small{display:block;color:#80745a;font-size:7px;font-weight:900;text-transform:uppercase}.gm-bridge-status strong{display:block;color:#d8ccb0;font-size:10px;margin-top:4px}.gm-bridge-chat-list{display:grid;gap:7px;margin:10px 0}.gm-bridge-chat{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid #39352b;background:#10110d;padding:9px 10px}.gm-bridge-chat.is-selected{border-color:#856d3e;background:#1a160f}.gm-bridge-chat strong{display:block;color:#d9ceb3;font-size:9px}.gm-bridge-chat span{display:block;color:#817969;font-size:8px;margin-top:3px}.gm-bridge-chat button,.gm-bridge-actions button{border:1px solid #5c5036;background:#181711;color:#c9b16d;padding:7px 9px;font-size:7px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;cursor:pointer}.gm-bridge-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.gm-bridge-actions button.primary{border-color:#8b703d;background:#2a2112;color:#efd184}.gm-bridge-actions button:disabled{opacity:.45;cursor:not-allowed}.gm-bridge-note{margin-top:9px;color:#786f5d;font-size:8px;line-height:1.45}.gm-bridge-error{color:#c58f72!important}
      @media(max-width:700px){.gm-bridge-status{grid-template-columns:1fr}.gm-bridge-test-head{display:block}.gm-bridge-badge{display:inline-flex;margin-top:8px}.gm-bridge-chat{grid-template-columns:1fr}.gm-bridge-chat button{justify-self:start}}
    `;document.head.appendChild(s);
  }

  function requestBridge(){
    return new Promise(resolve=>{
      const requestId=`gw-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
      const timeout=setTimeout(()=>{if(pending?.id===requestId)pending=null;resolve({ok:false,error:'No response from Tampermonkey bridge.'})},1200);
      pending={id:requestId,resolve:value=>{clearTimeout(timeout);pending=null;resolve(value)}};
      window.dispatchEvent(new CustomEvent('greywake:live-bridge-request',{detail:{requestId}}));
    });
  }

  async function refresh(){
    if(!fullGM()||!onUpdate())return;
    const result=await requestBridge();
    if(result.ok){bridgeReady=true;chats=Array.isArray(result.chats)?result.chats:[];if(!selectedKey()&&chats[0])localStorage.setItem(SELECTED_KEY,chats[0].key)}else bridgeReady=false;
    schedule();
  }

  function transcript(chat){return(chat?.messages||[]).map(m=>`${String(m.role||'unknown').toUpperCase()}: ${m.text}`).join('\n\n')}
  function dryRunPacket(chat){
    const state=window.GreywakeGMSessionState?.read?.()||{};
    return [
      'GREYWAKE LIVE BRIDGE TEST — DRY RUN ONLY',
      'DO NOT WRITE TO LIVE CANON, OBSIDIAN, PLAYER KNOWLEDGE, GITHUB OR THE LIVE SITE.',
      '',
      'Purpose: test whether the live-session transcript can be handed to the updater accurately without manual capture during play.',
      '',
      `Source conversation: ${chat?.title||'Unknown'}`,
      `Source URL: ${chat?.url||'Unknown'}`,
      `Messages captured: ${chat?.messageCount||0}`,
      `Last transcript change: ${chat?.changedAt||'Unknown'}`,
      '',
      'SITE OPERATIONAL CONTEXT (not canon authority):',
      `Session: ${state.session||'Not set'}`,
      `Location: ${state.location||'Not set'}`,
      `Scene: ${state.scene||'Not set'}`,
      `Active party: ${state.party||'Not set'}`,
      `Active NPCs: ${state.activeNPCs||'None set'}`,
      '',
      'TEST TASK:',
      '- Read the transcript as session evidence.',
      '- Identify only events actually established in play.',
      '- Infer who witnessed/learned something only when the transcript supports it; otherwise mark knowledge routing uncertain.',
      '- Separate confirmed facts from inference, proposed canon and unresolved questions.',
      '- Identify which player-safe site updates would be appropriate if this were live.',
      '- Identify deeper canon/DM updates that should wait for the normal updater.',
      '- Make no writes. This is analysis only.',
      '',
      'Return:',
      '1. Confirmed session changes detected',
      '2. Proposed player-safe updates by Marek / Velmira / Odie / Party',
      '3. DM/canon changes that would be queued',
      '4. Decisions that would require Chris',
      '5. Anything the transcript is insufficient to determine',
      '',
      'LIVE SESSION TRANSCRIPT:',
      transcript(chat)||'[No transcript captured]'
    ].join('\n');
  }

  async function copyDryRun(chat,state){
    try{await navigator.clipboard.writeText(dryRunPacket(chat));state.textContent='Dry-run transcript packet copied. No live systems were changed.'}catch{state.textContent='Clipboard access failed.';state.classList.add('gm-bridge-error')}
  }

  function mount(){
    if(!fullGM()||!onUpdate())return;ensureStyles();
    const root=document.getElementById('gmOperationsView'),grid=root?.querySelector('.gm-ops-grid');if(!grid)return;
    let panel=document.getElementById('gmLiveBridgeTest');if(!panel){panel=document.createElement('section');panel.id='gmLiveBridgeTest';panel.className='gm-panel full gm-bridge-test';grid.prepend(panel)}
    const chat=chosen(),sig=JSON.stringify([bridgeReady,chats.map(x=>[x.key,x.title,x.messageCount,x.changedAt]),selectedKey()]);if(panel.dataset.signature===sig)return;panel.dataset.signature=sig;
    panel.innerHTML=`<div class="gm-bridge-test-head"><div><small>PARALLEL TEST PATH</small><h2>Live-session transcript bridge</h2><p>The existing UPDATE GREYWAKE button is unchanged. This test path only reads transcript snapshots and creates a dry-run updater packet.</p></div><span class="gm-bridge-badge">NO WRITES</span></div><div class="gm-bridge-status"><div><small>TAMPERMONKEY BRIDGE</small><strong>${bridgeReady?'Connected':'Not detected'}</strong></div><div><small>RECENT CHATGPT CHATS</small><strong>${chats.length}</strong></div><div><small>SELECTED TRANSCRIPT</small><strong>${chat?`${chat.messageCount||0} messages`:'None'}</strong></div></div>${bridgeReady?(chats.length?`<div class="gm-bridge-chat-list">${chats.slice(0,5).map(x=>`<div class="gm-bridge-chat ${x.key===chat?.key?'is-selected':''}"><div><strong>${esc(x.title||'ChatGPT conversation')}</strong><span>${esc(x.messageCount||0)} messages · changed ${esc(age(x.changedAt))}</span></div><button type="button" data-bridge-select="${esc(x.key)}">${x.key===chat?.key?'Selected':'Use this'}</button></div>`).join('')}</div>`:`<p class="gm-bridge-note">Bridge connected, but no ChatGPT conversation snapshot has been recorded yet. Open or refresh the live-session ChatGPT tab.</p>`):`<p class="gm-bridge-note gm-bridge-error">Install/enable the Greywake Live Session Bridge userscript in Tampermonkey, then refresh ChatGPT and this site.</p>`}<div class="gm-bridge-actions"><button type="button" data-bridge-refresh>Refresh bridge</button><button type="button" class="primary" data-bridge-dry ${chat?'':'disabled'}>TEST LIVE BRIDGE — COPY DRY RUN</button><span data-bridge-state class="gm-bridge-note">Nothing here can update canon or player state.</span></div>`;
    panel.querySelectorAll('[data-bridge-select]').forEach(b=>b.addEventListener('click',()=>selectKey(b.dataset.bridgeSelect)));
    panel.querySelector('[data-bridge-refresh]')?.addEventListener('click',refresh);
    const state=panel.querySelector('[data-bridge-state]');panel.querySelector('[data-bridge-dry]')?.addEventListener('click',()=>chat&&copyDryRun(chat,state));
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}
  function reset(){if(timer)clearInterval(timer);timer=null;if(fullGM()&&onUpdate()){setTimeout(refresh,180);timer=setInterval(refresh,5000)}}
  window.addEventListener('greywake:live-bridge-ready',()=>{bridgeReady=true;setTimeout(refresh,50)});
  window.addEventListener('greywake:live-bridge-response',event=>{if(!pending||event.detail?.requestId!==pending.id)return;pending.resolve(event.detail||{ok:false})});
  window.addEventListener('hashchange',reset);window.addEventListener('greywake:player-ready',reset);document.addEventListener('DOMContentLoaded',reset);setTimeout(reset,900);
})();

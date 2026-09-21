(() => {
  if(window.__GreywakeGMLiveBridgeTest)return;
  window.__GreywakeGMLiveBridgeTest=true;

  let bridgeReady=false,chats=[],roles={liveKey:'',updaterKey:''},status={},result={},pending=null,queued=false,timer=null;
  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const onUpdate=()=>location.hash==='#/gm-update';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const age=v=>{const d=new Date(v);if(Number.isNaN(d.getTime()))return'unknown';const s=Math.max(0,Math.round((Date.now()-d.getTime())/1000));if(s<60)return`${s}s ago`;if(s<3600)return`${Math.round(s/60)}m ago`;return`${Math.round(s/3600)}h ago`};
  const stamp=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?'—':d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'})};
  const liveChat=()=>chats.find(x=>x.key===roles.liveKey)||null;
  const updaterChat=()=>chats.find(x=>x.key===roles.updaterKey)||null;

  function ensureStyles(){
    if(document.getElementById('gm-live-bridge-test-styles'))return;
    const s=document.createElement('style');s.id='gm-live-bridge-test-styles';s.textContent=`
      .gm-bridge-test{grid-column:1/-1;border-color:#665332!important;background:#17140f!important}.gm-bridge-test-head{display:flex;justify-content:space-between;gap:16px;align-items:end}.gm-bridge-test-head p{margin:0;color:#9a8b67;font-size:9px;max-width:680px}.gm-bridge-badge{border:1px solid #725f38;padding:4px 7px;color:#d4ba73;font-size:7px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}.gm-bridge-status{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.gm-bridge-status div,.gm-bridge-delivery div{border:1px solid #3c372c;background:#10110d;padding:10px}.gm-bridge-status small,.gm-bridge-delivery small{display:block;color:#80745a;font-size:7px;font-weight:900;text-transform:uppercase}.gm-bridge-status strong,.gm-bridge-delivery strong{display:block;color:#d8ccb0;font-size:10px;margin-top:4px}.gm-bridge-delivery{display:grid;grid-template-columns:1.2fr 1.2fr .8fr .8fr;gap:8px;margin:10px 0}.gm-bridge-delivery strong.good{color:#b9c98b}.gm-bridge-delivery strong.warn{color:#e0be74}.gm-bridge-delivery strong.bad{color:#cf8d78}.gm-bridge-chat-list{display:grid;gap:7px;margin:10px 0}.gm-bridge-chat{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid #39352b;background:#10110d;padding:9px 10px}.gm-bridge-chat strong{display:block;color:#d9ceb3;font-size:9px}.gm-bridge-chat span{display:block;color:#817969;font-size:8px;margin-top:3px}.gm-bridge-role-buttons{display:flex;gap:6px;flex-wrap:wrap}.gm-bridge-chat button,.gm-bridge-actions button{border:1px solid #5c5036;background:#181711;color:#c9b16d;padding:7px 9px;font-size:7px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;cursor:pointer}.gm-bridge-chat button.is-live{border-color:#6e7f51;color:#c8d39d}.gm-bridge-chat button.is-updater{border-color:#7e5e86;color:#d8b5dd}.gm-bridge-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.gm-bridge-actions button:disabled{opacity:.45;cursor:not-allowed}.gm-bridge-note{margin-top:9px;color:#786f5d;font-size:8px;line-height:1.45}.gm-bridge-error{color:#c58f72!important}.gm-bridge-ok{color:#9cab76!important}
      .gm-update-result{margin-top:14px;border-top:1px solid #4a412d;padding-top:13px}.gm-update-result-head{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-bottom:9px}.gm-update-result-head small{display:block;color:#97875d;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.gm-update-result-head strong{display:block;color:#e8ddc1;font:700 16px/1.2 Georgia,serif;margin-top:3px}.gm-update-result-head span{font-size:8px;color:#807866}.gm-update-result-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.gm-update-result-card{border:1px solid #383329;background:#10110d;padding:10px}.gm-update-result-card h3{margin:0 0 7px;color:#bfa762;font-size:8px;letter-spacing:.08em;text-transform:uppercase}.gm-update-result-card div{color:#cfc5ad;font-size:9px;line-height:1.5;white-space:pre-wrap}.gm-update-result-empty{color:#7f7868;font-size:9px;padding:6px 0}
      @media(max-width:900px){.gm-bridge-delivery,.gm-update-result-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:700px){.gm-bridge-status,.gm-bridge-delivery,.gm-update-result-grid{grid-template-columns:1fr}.gm-bridge-test-head{display:block}.gm-bridge-badge{display:inline-flex;margin-top:8px}.gm-bridge-chat{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function requestBridge(){
    return new Promise(resolve=>{
      const requestId=`gw-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
      const timeout=setTimeout(()=>{if(pending?.id===requestId)pending=null;resolve({ok:false,error:'No response from Tampermonkey bridge.'})},1300);
      pending={id:requestId,resolve:value=>{clearTimeout(timeout);pending=null;resolve(value)}};
      window.dispatchEvent(new CustomEvent('greywake:live-bridge-request',{detail:{requestId}}));
    });
  }

  async function refresh(){
    if(!fullGM()||!onUpdate())return;
    const response=await requestBridge();
    if(response.ok){bridgeReady=true;chats=Array.isArray(response.chats)?response.chats:[];roles=response.roles||roles;status=response.status||status;result=response.result||result}else bridgeReady=false;
    schedule();
  }

  function setRole(role,key){window.dispatchEvent(new CustomEvent('greywake:live-bridge-set-role',{detail:{role,key}}));setTimeout(refresh,100)}
  function statusLabel(){const s=status.state||'';if(s==='queued')return['QUEUED','warn'];if(s==='processing')return['SENDING','warn'];if(s==='sent')return['SENT','good'];if(s==='accepted')return['ACCEPTED','good'];if(s==='completed')return['DONE','good'];if(s==='duplicate')return['ALREADY SENT','good'];if(s==='blocked')return['BLOCKED','bad'];return['READY','']}
  function splitResult(text){
    const raw=String(text||'').trim();
    if(!raw)return{updated:'',failed:'',decisions:''};
    const labels=['WHAT WAS UPDATED','WHAT COULD NOT BE UPDATED','DECISIONS QUEUED FOR CHRIS LATER'];
    const pos=labels.map(l=>raw.toUpperCase().indexOf(l));
    if(pos.every(x=>x>=0))return{
      updated:raw.slice(pos[0]+labels[0].length,pos[1]).replace(/^\s*[:\-]?\s*/,'').trim(),
      failed:raw.slice(pos[1]+labels[1].length,pos[2]).replace(/^\s*[:\-]?\s*/,'').trim(),
      decisions:raw.slice(pos[2]+labels[2].length).replace(/^\s*[:\-]?\s*/,'').trim()
    };
    return{updated:raw,failed:'',decisions:''};
  }
  function cleanSection(value){const v=String(value||'').trim();return v||'None reported.'}

  function mount(){
    if(!fullGM()||!onUpdate())return;ensureStyles();
    const root=document.getElementById('gmOperationsView'),grid=root?.querySelector('.gm-ops-grid');if(!grid)return;
    let panel=document.getElementById('gmLiveBridgeTest');if(!panel){panel=document.createElement('section');panel.id='gmLiveBridgeTest';panel.className='gm-panel full gm-bridge-test';grid.prepend(panel)}
    const live=liveChat(),updater=updaterChat(),configured=!!live&&!!updater&&live.key!==updater.key,[deliveryLabel,deliveryClass]=statusLabel(),sections=splitResult(result.text);
    const sig=JSON.stringify([bridgeReady,chats.map(x=>[x.key,x.title,x.messageCount,x.changedAt]),roles,status,result]);if(panel.dataset.signature===sig)return;panel.dataset.signature=sig;
    panel.innerHTML=`<div class="gm-bridge-test-head"><div><small>ROUTED LIVE UPDATE BRIDGE</small><h2>Live chat → updater chat</h2><p>You do not need to categorise session facts. The updater classifies player-safe reveals, persistent knowledge, DM/world state and unresolved decisions itself.</p></div><span class="gm-bridge-badge">${configured?'ROUTING ARMED':'SETUP REQUIRED'}</span></div><div class="gm-bridge-status"><div><small>BRIDGE</small><strong>${bridgeReady?'Connected':'Not detected'}</strong></div><div><small>LIVE SESSION</small><strong>${live?esc(live.title):'Not set'}</strong></div><div><small>UPDATER</small><strong>${updater?esc(updater.title):'Not set'}</strong></div></div><div class="gm-bridge-delivery"><div><small>LAST SOURCE</small><strong>${esc(status.sourceTitle||live?.title||'—')}</strong></div><div><small>LAST TARGET</small><strong>${esc(status.targetTitle||updater?.title||'—')}</strong></div><div><small>DELIVERY</small><strong class="${deliveryClass}">${deliveryLabel}</strong></div><div><small>TIME</small><strong>${esc(stamp(status.at))}</strong></div></div>${bridgeReady&&chats.length?`<div class="gm-bridge-chat-list">${chats.slice(0,8).map(x=>`<div class="gm-bridge-chat"><div><strong>${esc(x.title||'ChatGPT conversation')}</strong><span>${esc(x.messageCount||0)} messages · changed ${esc(age(x.changedAt))}</span></div><div class="gm-bridge-role-buttons"><button type="button" class="${x.key===roles.liveKey?'is-live':''}" data-bridge-live="${esc(x.key)}">${x.key===roles.liveKey?'LIVE SESSION ✓':'Set live'}</button><button type="button" class="${x.key===roles.updaterKey?'is-updater':''}" data-bridge-updater="${esc(x.key)}">${x.key===roles.updaterKey?'UPDATER ✓':'Set updater'}</button></div></div>`).join('')}</div>`:''}<div class="gm-bridge-actions"><button type="button" data-bridge-refresh>Refresh bridge</button><span data-bridge-state class="gm-bridge-note ${['sent','accepted','completed','duplicate'].includes(status.state)?'gm-bridge-ok':status.state==='blocked'?'gm-bridge-error':''}">${esc(status.message||'Main UPDATE GREYWAKE is blocked until LIVE SESSION and UPDATER are set to different chats.')}</span></div><div class="gm-update-result"><div class="gm-update-result-head"><div><small>LAST UPDATE RESULT</small><strong>What changed and where</strong></div><span>${result.at?`Completed ${esc(stamp(result.at))}`:'Waiting for a completed updater run'}</span></div>${result.text?`<div class="gm-update-result-grid"><div class="gm-update-result-card"><h3>What was updated</h3><div>${esc(cleanSection(sections.updated))}</div></div><div class="gm-update-result-card"><h3>What could not be updated</h3><div>${esc(cleanSection(sections.failed))}</div></div><div class="gm-update-result-card"><h3>Decisions queued for Chris later</h3><div>${esc(cleanSection(sections.decisions))}</div></div></div>`:`<div class="gm-update-result-empty">No completed routed update has been captured yet. After the updater finishes, its result will appear here automatically.</div>`}</div>`;
    panel.querySelectorAll('[data-bridge-live]').forEach(b=>b.addEventListener('click',()=>setRole('live',b.dataset.bridgeLive)));
    panel.querySelectorAll('[data-bridge-updater]').forEach(b=>b.addEventListener('click',()=>setRole('updater',b.dataset.bridgeUpdater)));
    panel.querySelector('[data-bridge-refresh]')?.addEventListener('click',refresh);
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}
  function reset(){if(timer)clearInterval(timer);timer=null;if(fullGM()&&onUpdate()){setTimeout(refresh,180);timer=setInterval(refresh,4000)}}
  window.addEventListener('greywake:live-bridge-ready',event=>{bridgeReady=true;roles=event.detail?.roles||roles;setTimeout(refresh,50)});
  window.addEventListener('greywake:live-bridge-response',event=>{if(!pending||event.detail?.requestId!==pending.id)return;pending.resolve(event.detail||{ok:false})});
  window.addEventListener('greywake:live-bridge-role-set',event=>{roles=event.detail?.roles||roles;schedule()});
  window.addEventListener('greywake:live-bridge-status',event=>{status=event.detail||{};schedule()});
  window.addEventListener('greywake:live-bridge-result',event=>{result=event.detail||{};schedule()});
  window.addEventListener('hashchange',reset);window.addEventListener('greywake:player-ready',reset);document.addEventListener('DOMContentLoaded',reset);setTimeout(reset,900);
})();

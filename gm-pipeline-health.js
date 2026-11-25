(() => {
  'use strict';
  if(window.__GreywakePipelineHealth)return;
  window.__GreywakePipelineHealth=true;
  const BUILD='pipeline-health-20261125-2';
  const KEY='greywake-pipeline-operational-report-v1';
  const API='https://api.github.com/repos/potmoodle-debug/greywake-players';
  const PRIVATE='https://github.com/potmoodle-debug/greywake-vault';
  const PUBLIC='https://github.com/potmoodle-debug/greywake-players';
  const fullGM=()=>document.body?.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true'&&location.hash==='#/gm-update';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stamp=v=>{const d=new Date(v);return v&&!Number.isNaN(d.getTime())?d.toLocaleString('en-GB'):'Not recorded'};
  const validSha=v=>typeof v==='string'&&/^[a-f0-9]{40}$/i.test(v);
  const date=v=>typeof v==='string'&&!Number.isNaN(Date.parse(v))&&v.length<=40?v:null;
  const count=v=>Number.isSafeInteger(v)&&v>=0&&v<=100000?v:null;
  const choice=(v,a)=>a.includes(v)?v:'unknown';
  function clean(x){
    if(!x||typeof x!=='object'||x.schema!==1||!date(x.reportedAt)||!validSha(x.vaultHead))throw Error('Report requires schema 1, a valid reportedAt timestamp and a full 40-character vaultHead SHA.');
    const outcome=choice(x.outcome,['verified','committed','partial','blocked','no_change','unknown']);
    return {schema:1,reportedAt:date(x.reportedAt),vaultHead:x.vaultHead.toLowerCase(),outcome,
      lastVerifiedAt:date(x.lastVerifiedAt),lastVerifiedCommit:validSha(x.lastVerifiedCommit)?x.lastVerifiedCommit.toLowerCase():null,
      obsidianSync:choice(x.obsidianSync,['verified','pending','failed','unknown']),obsidianCheckedAt:date(x.obsidianCheckedAt),
      openDecisions:count(x.openDecisions),assetPending:count(x.assetPending),assetValidation:choice(x.assetValidation,['passed','failed','pending','unknown']),
      assetCheckedAt:date(x.assetCheckedAt),openErrors:count(x.openErrors),privacy:choice(x.privacy,['reviewed','warning','blocked','unknown'])};
  }
  function read(){try{return clean(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return null}}
  let report=read(), feed=null, feedStatus='not checked', live={state:'unchecked'}, requestNumber=0, backend={goals:'unchecked',downtime:'unchecked'}, mounted=null;
  function css(){if(document.getElementById('gw-pipeline-style'))return;const el=document.createElement('style');el.id='gw-pipeline-style';el.textContent=
    '#gmPipelineHealthHost{padding:20px;min-width:0}.gwh-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}.gwh-head h2{font-size:clamp(23px,3vw,34px);margin:4px 0}.gwh-kicker{font-size:9px;letter-spacing:.14em;color:#a18d5d;font-weight:800}.gwh-head p,.gwh-note{font-size:12px!important;line-height:1.5;color:#b0a58e!important;margin:4px 0}.gwh-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.gwh-card{border:1px solid #454033;background:#11130f;padding:14px;min-width:0;min-height:135px;display:flex;flex-direction:column;gap:8px}.gwh-card h3{font:700 15px Georgia,serif;color:#eee2c7;margin:0}.gwh-card strong{font-size:17px;color:#e5d4a6;overflow-wrap:anywhere}.gwh-card p{font-size:11px!important;margin:0;overflow-wrap:anywhere}.gwh-card a,.gwh-foot a{color:#d8bd76;text-decoration:underline;font-size:11px;overflow-wrap:anywhere}.gwh-status{align-self:flex-start;font-size:9px;letter-spacing:.07em;font-weight:800;text-transform:uppercase;border:1px solid #514a36;padding:4px 6px;color:#b4ab94}.gwh-status.good{color:#b9d295;border-color:#596d43}.gwh-status.warn{color:#e2bf77;border-color:#8c713e}.gwh-status.bad{color:#eea18e;border-color:#945644}.gwh-alert{border-left:3px solid #b67b54;background:#261b15;padding:12px;margin:14px 0;color:#e2c1a9;font-size:12px;line-height:1.55}.gwh-foot{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.gwh-foot>section{border:1px solid #454033;padding:14px;background:#14150f;min-width:0}.gwh-foot h3{font:700 16px Georgia,serif;color:#eee2c7;margin:0 0 8px}.gwh-foot textarea{width:100%;box-sizing:border-box;min-height:96px;resize:vertical;background:#0f110d;border:1px solid #5a503b;color:#e6dcc2;padding:10px;font:12px/1.4 monospace}.gwh-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.gwh-actions button:disabled{opacity:.5;cursor:wait}.gwh-foot output{display:block;margin-top:8px;font-size:11px;color:#e0c580}.gwh-foot ul{padding-left:16px}.gwh-foot li{margin:4px 0}.gwh-foot code{overflow-wrap:anywhere}.gwh-stale{color:#e2bf77!important}@media(max-width:1050px){.gwh-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.gwh-grid,.gwh-foot{grid-template-columns:1fr}.gwh-card{min-height:0}.gwh-head{align-items:flex-start}}';
    document.head.appendChild(el)}
  const tone=v=>['verified','passed','reviewed','success','available'].includes(v)?'good':['failed','blocked','warning','unavailable','failure','error'].includes(v)?'bad':['pending','partial','committed','stale'].includes(v)?'warn':'';
  const label=v=>String(v||'unknown').replace(/_/g,' ');
  function card(title,status,value,detail,link,linkText){return '<article class="gwh-card"><h3>'+esc(title)+'</h3><span class="gwh-status '+tone(status)+'">'+esc(label(status))+'</span><strong>'+esc(value)+'</strong><p>'+esc(detail)+'</p>'+(link?'<a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">'+esc(linkText||'Open source')+'</a>':'')+'</article>'}
  function observeBackend(){
    const goal=document.getElementById('playerGoals');
    if(goal?.textContent.includes('Questions & Interests unavailable'))backend.goals='unavailable';
    else if(window.GreywakeGMGoalSnapshot)backend.goals='available';
    const dt=document.querySelector('.downtime-panel');
    if(dt?.textContent.includes('Downtime unavailable'))backend.downtime='unavailable';
    else if(dt?.querySelector('.downtime-day')&&!dt.querySelector('.downtime-error'))backend.downtime='available';
  }
  async function get(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);try{const r=await fetch(url,{cache:'no-store',headers:{Accept:'application/vnd.github+json'},signal:controller.signal});if(!r.ok)throw Error('GitHub HTTP '+r.status);return await r.json()}finally{clearTimeout(timer)}}
  function selectedReport(local,automatic){
    if(!automatic)return local;
    if(!local)return automatic;
    return Date.parse(local.reportedAt)>Date.parse(automatic.reportedAt)?local:automatic;
  }
  async function checkFeed(){
    try{
      const raw=await get(new URL('pipeline-health.json',document.baseURI).href);
      const allowed=['schema','reportedAt','vaultHead','outcome','lastVerifiedAt','lastVerifiedCommit','obsidianSync','obsidianCheckedAt','openDecisions','assetPending','assetValidation','assetCheckedAt','openErrors','privacy'];
      if(Object.keys(raw).some(k=>!allowed.includes(k)))throw Error('Unexpected field in public status feed');
      feed=clean(raw);feedStatus='available';
    }catch(e){feedStatus='unavailable';}
  }
  async function checkPublic(){
    if(!fullGM())return;const n=++requestNumber;live={...live,state:'checking'};paint();
    const feedCheck=checkFeed();
    let next={state:'unknown',checkedAt:new Date().toISOString()};
    try{
      const head=await get(API+'/commits/main');if(!validSha(head.sha))throw Error('Branch version unavailable');
      next.head=head.sha;
      const ds=await get(API+'/deployments?environment=github-pages&per_page=1');
      if(!Array.isArray(ds)||!ds.length)throw Error('No public Pages deployment record returned');
      const d=ds[0];if(!Number.isSafeInteger(d.id))throw Error('Deployment record unavailable');
      next.deploySha=validSha(d.sha)?d.sha:null;
      const statuses=await get(API+'/deployments/'+d.id+'/statuses?per_page=1');
      const st=statuses?.[0];if(!st)throw Error('Deployment status unavailable');
      next.state=st.state==='success'?(next.deploySha===next.head?'success':'stale'):['failure','error'].includes(st.state)?'failed':'pending';
      next.status=String(st.state||'unknown');next.deployedAt=date(st.created_at);
    }catch(e){next.detail=String(e.message||'Public GitHub API unavailable').slice(0,150)}
    await feedCheck;
    if(n!==requestNumber||!fullGM())return;live=next;observeBackend();paint();
  }
  function paint(){
    if(!fullGM())return;
    const host=document.getElementById('gmPipelineHealthHost');if(!host)return;
    if(mounted!==host){mounted=host;mount(host)}
    const r=selectedReport(report,feed),source=r===feed&&feed?'Automatic operational feed':r?'Local report override':'No report',grid=host.querySelector('[data-gwh-grid]');if(!grid)return;
    observeBackend();
    const old=r&&Date.now()-Date.parse(r.reportedAt)>86400000;
    const short=v=>v?v.slice(0,12):'Not recorded';
    const dep=live.state==='success'?'success':live.state==='stale'?'stale':live.state==='failed'?'failed':live.state==='pending'?'pending':'unknown';
    const back=Object.values(backend).includes('unavailable')?'unavailable':Object.values(backend).every(v=>v==='available')?'available':'unknown';
    grid.innerHTML=[
      card('Authoritative vault',r?(old?'stale':'reported'):'unknown',r?short(r.vaultHead):'Awaiting report',r?'Last observed private HEAD · '+stamp(r.reportedAt)+(old?' · report older than 24h':''):'Awaiting automatic status feed or optional local report.',PRIVATE+'/commits/main','Private commit history'),
      card('Last verified campaign update',r?.lastVerifiedAt?'reported':'unknown',r?.lastVerifiedAt?stamp(r.lastVerifiedAt):'Not recorded',r?'Latest outcome: '+label(r.outcome)+(r.lastVerifiedCommit?' · '+short(r.lastVerifiedCommit):''):'No independently verified actual-play update recorded. A dry run is not a verified write.',PRIVATE,'Open vault'),
      card('Obsidian synchronization',old&&r?.obsidianSync==='verified'?'stale':r?.obsidianSync||'unknown',r?label(r.obsidianSync):'Awaiting report',r?.obsidianCheckedAt?'Reported check: '+stamp(r.obsidianCheckedAt):'A remote commit does not prove a local pull. Confirm on the GM computer.',PRIVATE,'Open vault'),
      card('Website deployment',dep,live.state==='checking'?'Checking…':live.deploySha?short(live.deploySha):'Not confirmed',live.detail||('Public main: '+short(live.head)+' · '+(live.deployedAt?'Deployment '+stamp(live.deployedAt):'No deployment timestamp')+' · loaded dashboard '+BUILD),PUBLIC+'/actions','View deployment runs'),
      card('Outstanding GM decisions',r?.openDecisions===null||!r?'unknown':r.openDecisions?'pending':'reported',r?.openDecisions??'Not counted','Count only; private decision text stays in Obsidian.',PRIVATE,'Review private GM records'),
      card('Assets & validation',r?.assetValidation||'unknown',r?.assetPending===null||!r?'Not counted':r.assetPending+' awaiting upload',r?.assetCheckedAt?'Validation report: '+stamp(r.assetCheckedAt):'A successful workflow is not proof an image exists.',PRIVATE+'/actions','Private asset workflow runs'),
      card('Backend connectivity',back,back==='available'?'Modules available':back==='unavailable'?'Request failed':'Not confirmed','Observed in this browser: downtime '+label(backend.downtime)+' · questions & interests '+label(backend.goals)+'. Reload to repeat actual module requests.'),
      card('Errors & publication privacy', 'warning',r?.openErrors===null||!r?'Review required':r.openErrors+' reported errors','Privacy report: '+label(r?.privacy||'unknown')+'. Existing public client-side GM visibility is not a secure boundary.',PUBLIC,'Review public source')
    ].join('');
    host.querySelector('[data-gwh-stamp]').textContent=(r?source+': '+stamp(r.reportedAt)+(old?' · older than 24h':''):'No report available')+' · automatic feed '+feedStatus+' · '+(live.checkedAt?'Public check: '+stamp(live.checkedAt):'Public check not run');
    host.querySelector('[data-gwh-refresh]').disabled=live.state==='checking';
  }
  const template={schema:1,reportedAt:null,vaultHead:'',outcome:'unknown',lastVerifiedAt:null,lastVerifiedCommit:null,obsidianSync:'unknown',obsidianCheckedAt:null,openDecisions:null,assetPending:null,assetValidation:'unknown',assetCheckedAt:null,openErrors:null,privacy:'warning'};
  function mount(host){
    css();host.innerHTML='<div class="gwh-head"><div><div class="gwh-kicker">DIRECT CO-DM WORKFLOW · EVIDENCE FIRST</div><h2>Greywake Pipeline Health</h2><p>Automatic operational feed and live public checks. Manual import is an optional fallback. No automatic canon writes.</p><p data-gwh-stamp class="gwh-note" aria-live="polite"></p></div><button class="gm-inline-action" data-gwh-refresh type="button">Refresh pipeline checks</button></div><div class="gwh-grid" data-gwh-grid></div><div class="gwh-alert"><strong>Publication privacy warning.</strong> The public site uses client-side role switching. Do not place GM secrets, private decisions, character-only knowledge or credentials in this dashboard, public assets or JavaScript. Import operational counts and evidence metadata only. Authentication and a server-side boundary remain separate work.</div><div class="gwh-foot"><section><h3>Optional manual report override</h3><p>Normally updated automatically by the Co-DM. Use this fallback only for newer operational metadata. Saved in this browser; unknown values remain unknown.</p><label class="gwh-note" for="gwhReport">Operational report JSON</label><textarea id="gwhReport" spellcheck="false" placeholder="Paste schema 1 report JSON here"></textarea><div class="gwh-actions"><button class="gm-inline-action" type="button" data-gwh-import>Import report</button><button class="gm-inline-action" type="button" data-gwh-template>Copy report request</button><button class="gm-inline-action" type="button" data-gwh-clear>Clear local report</button></div><output data-gwh-output aria-live="polite"></output></section><section><h3>Verification sources</h3><ul><li><a href="'+PRIVATE+'" target="_blank" rel="noopener noreferrer">Authoritative private vault</a></li><li><a href="'+PUBLIC+'/actions" target="_blank" rel="noopener noreferrer">Public deployment actions</a></li><li><a href="'+PRIVATE+'/actions" target="_blank" rel="noopener noreferrer">Private asset validation &amp; ingest actions</a></li></ul><p>The automatic feed contains only approved operational fields, written by the Co-DM after updates. It is not a live private-vault query. Private decisions and credentials are never included. The public deployment API may be unavailable or rate-limited. Use the Actions links to inspect it independently.</p><p>Dashboard build: <code>'+BUILD+'</code>. Browser reports are not campaign canon.</p></section></div>';
    const out=host.querySelector('[data-gwh-output]'),input=host.querySelector('#gwhReport');
    host.querySelector('[data-gwh-refresh]').addEventListener('click',checkPublic);
    host.querySelector('[data-gwh-import]').addEventListener('click',()=>{if(!fullGM())return;try{const value=clean(JSON.parse(input.value));if(selectedReport(report,feed)&&Date.parse(value.reportedAt)<Date.parse(selectedReport(report,feed).reportedAt))throw Error('Report is older than the saved report. Clear the saved report first if intentional.');localStorage.setItem(KEY,JSON.stringify(value));report=value;input.value='';out.textContent='Operational metadata imported. Not independently verified by the browser.';paint()}catch(e){out.textContent='Import failed: '+e.message}});
    host.querySelector('[data-gwh-clear]').addEventListener('click',()=>{if(!fullGM())return;try{localStorage.removeItem(KEY);report=null;input.value='';out.textContent='Local override cleared. Automatic feed remains available.';paint()}catch{out.textContent='Local storage unavailable.'}});
    host.querySelector('[data-gwh-template]').addEventListener('click',async()=>{if(!fullGM())return;const prompt='Return a read-only Greywake pipeline health report as JSON only, using fresh authoritative evidence. No secrets, narrative, names or credentials. Null for unknown counts/timestamps; unknown for unverified enums. outcome: verified/committed/partial/blocked/no_change/unknown; obsidianSync: verified/pending/failed/unknown; assetValidation: passed/failed/pending/unknown; privacy: reviewed/warning/blocked/unknown. lastVerifiedAt and lastVerifiedCommit refer only to an independently verified actual campaign update, not a backup or dry run. Schema:\n'+JSON.stringify(template,null,2);try{await navigator.clipboard.writeText(prompt);out.textContent='Report request copied. Paste into the Live Co-DM.'}catch{input.value=prompt;out.textContent='Clipboard unavailable; select and copy the request.'}});
  }
  let scheduled=false,started=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(!fullGM()){mounted=null;started=false;backend={goals:'unchecked',downtime:'unchecked'};return}const host=document.getElementById('gmPipelineHealthHost');if(!host)return;if(mounted!==host){paint();if(!started){started=true;checkPublic()}}})}
  window.addEventListener('hashchange',schedule);
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:gm-goals-rendered',()=>{if(fullGM()){backend.goals='available';paint()}});
  new MutationObserver(records=>{if(!fullGM()){schedule();return}if(document.getElementById('gmPipelineHealthHost')!==mounted){schedule();return}if(records.some(r=>r.target instanceof Element&&(r.target.closest('#playerGoals')||r.target.closest('.downtime-panel')))){observeBackend();paint()}}).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',schedule);schedule();
})();
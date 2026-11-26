/* Live RUN display. Public-safe read projection; local GM presentation controls. */
(()=>{
'use strict';
const URL='https://tmqxxgzqiccclcjagdsh.supabase.co/rest/v1/live_scene_display?display_key=eq.current&select=revision,scene,updated_at';
const KEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
const LOCAL='greywake.live.scene.presentation.v1';
const gm=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true'&&location.hash==='#/gm-session';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let remote=null,busy=false,error='',queued=false;
let local={};try{local=JSON.parse(localStorage.getItem(LOCAL)||'{}')||{}}catch{}
function save(){try{localStorage.setItem(LOCAL,JSON.stringify(local))}catch{}}
const list=v=>Array.isArray(v)?v:[];
function mount(){
 if(!gm())return;
 const host=document.getElementById('gmDynamicScene');if(!host)return;
 const r=remote;const s=r?.scene;
 const signature=JSON.stringify([r?.revision,error,local]);
 if(host.dataset.signature===signature)return;
 host.dataset.signature=signature;
 if(!s){host.innerHTML='<small>LIVE SCENE</small><h2>Connecting to live session…</h2><p>'+esc(error||'Awaiting the first scene revision.')+'</p><button type="button" data-live-retry>Retry connection</button>';return}
 const cards=list(s.cards).filter(x=>x&&typeof x==='object');
 const hidden=list(local[s.session]?.hidden),pinned=list(local[s.session]?.pinned);
 const active=cards.filter(x=>!hidden.includes(x.id)).sort((a,b)=>Number(pinned.includes(b.id))-Number(pinned.includes(a.id)));
 const card=x=>'<article class="gw-live-card"><small>'+esc(x.kind)+'</small><h3>'+esc(x.title)+'</h3><p>'+esc(x.detail)+'</p><button type="button" data-live-pin="'+esc(x.id)+'">'+(pinned.includes(x.id)?'Unpin':'Pin')+'</button> <button type="button" data-live-hide="'+esc(x.id)+'">Dismiss</button></article>';
 host.innerHTML='<small>LIVE SCENE · REVISION '+esc(r.revision)+'</small><h2>'+esc(s.title)+'</h2><p><strong>'+esc(s.session)+' · '+esc(s.location)+'</strong> · '+esc(list(s.party).join(' · '))+'</p><p>'+esc(s.situation)+'</p><p role="status">'+esc(error?'Connection interrupted — showing last received revision.':'Connected · updated '+new Date(r.updated_at).toLocaleTimeString())+'</p><h3>Active objectives</h3><ul>'+list(s.objectives).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><h3>Active scene cards</h3><div class="gw-live-cards">'+(active.map(card).join('')||'<p>No active cards.</p>')+'</div><details><summary>Dismissed cards ('+cards.filter(x=>hidden.includes(x.id)).length+')</summary>'+cards.filter(x=>hidden.includes(x.id)).map(x=>'<p>'+esc(x.title)+' <button type="button" data-live-restore="'+esc(x.id)+'">Restore</button></p>').join('')+'</details><details><summary>Session timeline ('+list(s.events).length+')</summary><ol>'+list(s.events).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></details><p><small>Pin and dismiss are local presentation controls. Scene revisions come from the Co-DM backend. No automatic canon writes.</small></p>';
 const strip=document.querySelector('#gmOperationsView .gm-status-strip');
 for(const cell of strip?.children||[]){const label=cell.querySelector('small')?.textContent;const value=cell.querySelector('strong');if(!value)continue;if(label==='SESSION')value.textContent=s.session;if(label==='PARTY LOCATION')value.textContent=s.location;if(label==='ACTIVE PARTY')value.textContent=list(s.party).join(' · ')}
}
async function pull(){
 if(!gm()||busy)return;busy=true;
 try{const response=await fetch(URL,{headers:{apikey:KEY},cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);const rows=await response.json();if(!rows[0]?.scene)throw Error('No live scene published');remote=rows[0];error=''}catch(e){error=String(e.message||e)}finally{busy=false;mount()}
}
document.addEventListener('click',e=>{
 const b=e.target.closest('#gmDynamicScene button');if(!b||!gm())return;
 if(b.hasAttribute('data-live-retry')){pull();return}
 if(!remote)return;
 const k=remote.scene.session;const state=local[k]||={hidden:[],pinned:[]};
 const toggle=(arr,id)=>arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];
 if(b.dataset.livePin)state.pinned=toggle(state.pinned,b.dataset.livePin);
 else if(b.dataset.liveHide)state.hidden=toggle(state.hidden,b.dataset.liveHide);
 else if(b.dataset.liveRestore)state.hidden=state.hidden.filter(x=>x!==b.dataset.liveRestore);
 else return;
 save();mount();
});
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>{schedule();pull()});
window.addEventListener('greywake:player-ready',()=>{schedule();pull()});
setInterval(pull,3000);setTimeout(pull,200);
})();

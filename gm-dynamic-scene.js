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
 const media=name=>{const entry=(window.GREYWAKE_MEDIA||{})[name];return Array.isArray(entry)?entry[0]?.src:''};
 const safeAsset=path=>typeof path==='string'&&/^assets\/[a-zA-Z0-9_./-]+\.(webp|jpg|jpeg|png)(\?[a-zA-Z0-9_=&.-]+)?$/i.test(path)&&!path.includes('..')?path:'';
 const image=(path,alt,cls='')=>safeAsset(path)?'<img class="'+cls+'" src="'+esc(path)+'" alt="'+esc(alt)+'" loading="lazy">':'';
 const portraits={Marek:'assets/canon/characters/marek-canon.jpg',Odie:'assets/canon/characters/odie-canon.webp',Velmira:'assets/pcs/hq-v1/velmira.webp'};
 const exactScene=safeAsset(s.image)||safeAsset(media(s.location));
 const backdrop=exactScene||'assets/generated-scenes/the-wastes-route.webp';
 const party=list(s.party).map(n=>'<div class="gw-party-member">'+image(portraits[n]||media(n),n)+'<span>'+esc(n)+'</span></div>').join('');
 const card=x=>{const art=safeAsset(x.image)||safeAsset(media(x.record||x.title));const kind=String(x.kind||'scene');return '<article class="gw-live-card" data-kind="'+esc(kind)+'">'+(art?image(art,x.title,'gw-card-art'):'<div class="gw-card-symbol" aria-hidden="true">'+esc(({clue:'◇',location:'⌖',npc:'♙',adversary:'⚔',hazard:'△'})[kind]||'◈')+'</div>')+'<div class="gw-card-content"><small>'+esc(kind)+(pinned.includes(x.id)?' · PINNED':'')+'</small><h3>'+esc(x.title)+'</h3><p>'+esc(x.detail)+'</p><div class="gw-card-actions"><button type="button" data-live-pin="'+esc(x.id)+'">'+(pinned.includes(x.id)?'Unpin':'Pin')+'</button><button type="button" data-live-hide="'+esc(x.id)+'">Dismiss</button></div></div></article>'};
 const objectives=list(s.objectives).map(o=>{const name=typeof o==='string'?o:o.title;const art=typeof o==='object'?safeAsset(o.image):'';const src=art||(/thirst.marrow/i.test(name)?media('Thirst-Marrow'):'');return '<article class="gw-objective">'+image(src,'Objective reference')+'<div><small>ACTIVE OBJECTIVE</small><h3>'+esc(name)+'</h3></div></article>'}).join('');
 host.innerHTML='<div class="gw-scene-hero">'+image(backdrop,exactScene?s.location:'Greywake wilderness — atmospheric reference','gw-hero-art')+'<div class="gw-hero-overlay"><small>'+esc(s.session)+' · REVISION '+esc(r.revision)+'</small><h2>'+esc(s.location)+'</h2><h3>'+esc(s.title)+'</h3><p>'+esc(s.situation)+'</p><div class="gw-party">'+party+'</div></div>'+(!exactScene?'<span class="gw-art-caption">Wilderness atmosphere · not an exact location view</span>':'')+'</div><p class="gw-connection" role="status">'+esc(error?'Connection interrupted — showing last received revision.':'Connected · updated '+new Date(r.updated_at).toLocaleTimeString())+'</p><div class="gw-objectives">'+objectives+'</div><h3 class="gw-board-heading">Active scene</h3><div class="gw-live-cards">'+(active.map(card).join('')||'<p>No active cards.</p>')+'</div><details><summary>Dismissed cards ('+cards.filter(x=>hidden.includes(x.id)).length+')</summary>'+cards.filter(x=>hidden.includes(x.id)).map(x=>'<p>'+esc(x.title)+' <button type="button" data-live-restore="'+esc(x.id)+'">Restore</button></p>').join('')+'</details><details><summary>Session timeline ('+list(s.events).length+')</summary><ol>'+list(s.events).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></details><p><small>Local pin and dismiss controls · Live scene revisions · No automatic canon writes.</small></p>';
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

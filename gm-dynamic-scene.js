/* Live RUN display. Public-safe read projection; local GM presentation controls. */
(()=>{
'use strict';
const URL='https://tmqxxgzqiccclcjagdsh.supabase.co/rest/v1/live_scene_display?display_key=eq.current&select=revision,scene,updated_at';
const KEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
const LOCAL='greywake.live.scene.presentation.v1';
const gm=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true'&&location.hash==='#/gm-session';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let remote=null,busy=false,error='',queued=false; let encounters=[], encounterError='', writing=false; const encounterURL='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/gm-encounter-state'; async function encounterRequest(method='GET',body){const res=await fetch(encounterURL,{method,headers:{apikey:KEY,'Content-Type':'application/json','x-greywake-character':'gm','x-greywake-code':'GREYWAKE'},body:body?JSON.stringify(body):undefined,cache:'no-store'});const data=await res.json();if(!res.ok)throw Error(data.error||'Encounter sync failed');return data;}
let local={};try{local=JSON.parse(localStorage.getItem(LOCAL)||'{}')||{}}catch{}
function save(){try{localStorage.setItem(LOCAL,JSON.stringify(local))}catch{}}
const list=v=>Array.isArray(v)?v:[];
window.GreywakeActivateRunCard=async function(card){
 if(document.body.dataset.role!=='gm'||document.body.dataset.gmPreview==='true')throw Error('GM only');
 const response=await fetch(URL,{headers:{apikey:KEY},cache:'no-store'});if(!response.ok)throw Error('Unable to read current scene');
 const [current]=await response.json();if(!current)throw Error('No live scene');
 const result=await encounterRequest('POST',{...card,revision:current.revision});
 if(!gm()){window.GreywakeNavigation.navigate('#/gm-session');}else await pull();
 return result;
};

function mount(){
 if(!gm())return;
 const host=document.getElementById('gmDynamicScene');if(!host)return;
 const r=remote;const s=r?.scene;
 const signature=JSON.stringify([r?.revision,error,local,encounters,encounterError,writing]);
 if(host.dataset.signature===signature)return;
 host.dataset.signature=signature;
 if(!s){host.innerHTML='<small>LIVE SCENE</small><h2>Connecting to live session…</h2><p>'+esc(error||'Awaiting the first scene revision.')+'</p><button type="button" data-live-retry>Retry connection</button>';return}
 const cards=list(s.cards).filter(x=>x&&typeof x==='object');
 const hidden=list(local[s.session]?.hidden),pinned=list(local[s.session]?.pinned);
 const active=cards.filter(x=>!hidden.includes(x.id)&&!encounters.some(a=>a.instance_id===x.id&&a.session_key===s.session&&a.status!=='active')).sort((a,b)=>Number(pinned.includes(b.id))-Number(pinned.includes(a.id)));
 const media=name=>{const entry=(window.GREYWAKE_MEDIA||{})[name];return Array.isArray(entry)?entry[0]?.src:''};
 const safeAsset=path=>typeof path==='string'&&/^assets\/[a-zA-Z0-9_./-]+\.(webp|jpg|jpeg|png)(\?[a-zA-Z0-9_=&.-]+)?$/i.test(path)&&!path.includes('..')?path:'';
 const image=(path,alt,cls='')=>safeAsset(path)?'<img class="'+cls+'" src="'+esc(path)+'" alt="'+esc(alt)+'" loading="lazy">':'';
 const portraits={Marek:'assets/canon/characters/marek-canon.jpg',Odie:'assets/canon/characters/odie-canon.webp',Velmira:'assets/pcs/hq-v1/velmira.webp'};
 const exactScene=safeAsset(s.image)||safeAsset(media(s.location));
 const backdrop=exactScene||'assets/generated-scenes/the-wastes-route.webp';
 const party=list(s.party).map(n=>'<div class="gw-party-member">'+image(portraits[n]||media(n),n)+'<span>'+esc(n)+'</span></div>').join('');
 const mechanics=x=>{const a=encounters.find(a=>a.instance_id===x.id&&a.session_key===s.session);if(!a)return x.kind==='adversary'?'<p>Mechanics unavailable — link an approved adversary reference.</p>':'';const r=a.reference;const tracker=(label,field,max,value)=>'<p><strong>'+label+' '+value+'/'+max+'</strong> '+Array.from({length:max+1},(_,i)=>'<button type="button" aria-label="Set '+label+' marked to '+i+'" data-encounter="'+esc(a.instance_id)+'" data-field="'+field+'" data-value="'+i+'" aria-pressed="'+(i===value)+'" style="min-width:30px;margin:2px;'+(i===value?'background:#9a7541;color:white;':'')+'" '+(writing?'disabled':'')+'>'+i+'</button>').join('')+'</p>';return '<div class="gw-encounter-mechanics"><p>Tier '+esc(r.tier)+' · '+esc(r.role)+' | Difficulty '+esc(r.difficulty)+' | Thresholds '+esc(r.thresholds)+'</p>'+tracker('HP','hp_marked',a.hp_max,a.hp_marked)+tracker('Stress','stress_marked',a.stress_max,a.stress_marked)+'<p><strong>'+esc(r.attack_name)+'</strong> · '+esc(r.attack_range)+' · '+esc(r.atk)+' · '+esc(r.damage)+'</p><details><summary>Abilities and tactics</summary><p>'+esc(r.motives_tactics)+'</p><p>'+esc(r.experience)+'</p>'+list(r.features).map(f=>'<p><strong>'+esc(f.name)+' · '+esc(f.type)+'</strong> '+esc(f.text)+'</p>').join('')+'</details><p>'+['defeated','escaped','resolved'].map(v=>'<button type="button" data-encounter="'+esc(a.instance_id)+'" data-field="status" data-value="'+v+'" '+(writing?'disabled':'')+'>'+v+'</button>').join(' ')+'</p></div>'};
 const prepReference=x=>window.GreywakeResolvePrepReference?.(x,s.session)||(s.session==='Session Six'?({'Western Open Houses':'s6-western-sound','Animal tracks':'s6-examine-tracks','Examine the animal tracks':'s6-examine-tracks','Assess unstable masonry':'s6-assess-masonry','Explore the Abandoned Claim':'s6-abandoned-claim'})[x.title]:'')||'';
 const card=x=>{const art=safeAsset(x.image)||safeAsset(media(x.record||x.title));const kind=String(x.kind||'scene');return '<article class="gw-live-card" data-kind="'+esc(kind)+'">'+(art?image(art,x.title,'gw-card-art'):'<div class="gw-card-symbol" aria-hidden="true">'+esc(({clue:'◇',location:'⌖',npc:'♙',adversary:'⚔',hazard:'△'})[kind]||'◈')+'</div>')+'<div class="gw-card-content"><small>'+esc(kind)+(pinned.includes(x.id)?' · PINNED':'')+'</small><h3>'+esc(x.title)+'</h3><p>'+esc(x.detail)+'</p>'+mechanics(x)+'<div class="gw-card-actions">'+(prepReference(x)?'<button type="button" data-live-details="'+esc(prepReference(x))+'">Open details</button>':'')+'<button type="button" data-live-pin="'+esc(x.id)+'">'+(pinned.includes(x.id)?'Unpin':'Pin')+'</button><button type="button" data-live-hide="'+esc(x.id)+'">Dismiss</button></div></div></article>'};
 const objectives=list(s.objectives).map(o=>{const name=typeof o==='string'?o:o.title;const art=typeof o==='object'?safeAsset(o.image):'';const src=art||(/thirst.marrow/i.test(name)?media('Thirst-Marrow'):'');return '<article class="gw-objective">'+image(src,'Objective reference')+'<div><small>ACTIVE OBJECTIVE</small><h3>'+esc(name)+'</h3></div></article>'}).join('');
 host.innerHTML='<div class="gw-scene-hero">'+image(backdrop,exactScene?s.location:'Greywake wilderness — atmospheric reference','gw-hero-art')+'<div class="gw-hero-overlay"><small>'+esc(s.session)+' · REVISION '+esc(r.revision)+'</small><h2>'+esc(s.location)+'</h2><h3>'+esc(s.title)+'</h3><p>'+esc(s.situation)+'</p><div class="gw-party">'+party+'</div></div>'+(!exactScene?'<span class="gw-art-caption">Wilderness atmosphere · not an exact location view</span>':'')+'</div><p class="gw-connection" role="status">'+esc(error?'Connection interrupted — showing last received revision.':'Connected · updated '+new Date(r.updated_at).toLocaleTimeString())+'</p><div class="gw-objectives">'+objectives+'</div><h3 class="gw-board-heading">Active scene</h3><button type="button" data-live-add>Add card to RUN</button><div class="gw-live-cards">'+(active.map(card).join('')||'<p>No active cards.</p>')+'</div><p role="status">'+esc(encounterError||'Encounter controls sync across GM devices.')+'</p><details><summary>Resolved encounters ('+encounters.filter(a=>a.status!=='active').length+')</summary>'+encounters.filter(a=>a.status!=='active').map(a=>'<p>'+esc(cards.find(x=>x.id===a.instance_id)?.title||a.reference.name)+' · '+esc(a.status)+' <button type="button" data-encounter="'+esc(a.instance_id)+'" data-field="status" data-value="active">Reopen</button></p>').join('')+'</details><details><summary>Dismissed cards ('+cards.filter(x=>hidden.includes(x.id)).length+')</summary>'+cards.filter(x=>hidden.includes(x.id)).map(x=>'<p>'+esc(x.title)+' <button type="button" data-live-restore="'+esc(x.id)+'">Restore</button></p>').join('')+'</details><details><summary>Session timeline ('+list(s.events).length+')</summary><ol>'+list(s.events).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></details><p><small>Local pin and dismiss controls · Live scene revisions · No automatic canon writes.</small></p>';
 const strip=document.querySelector('#gmOperationsView .gm-status-strip');
 for(const cell of strip?.children||[]){const label=cell.querySelector('small')?.textContent;const value=cell.querySelector('strong');if(!value)continue;if(label==='SESSION')value.textContent=s.session;if(label==='PARTY LOCATION')value.textContent=s.location;if(label==='ACTIVE PARTY')value.textContent=list(s.party).join(' · ')}
}
async function pull(){
 if(!gm()||busy)return;busy=true;
 try{const response=await fetch(URL,{headers:{apikey:KEY},cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);const rows=await response.json();if(!rows[0]?.scene)throw Error('No live scene published');remote=rows[0];error='';if(!writing){try{const data=await encounterRequest();encounters=data.session===remote.scene.session?data.instances:[];encounterError=''}catch(e){encounterError=String(e.message)}}}catch(e){error=String(e.message||e)}finally{busy=false;mount()}
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('#gmDynamicScene button');if(!b||!gm())return;
 if(b.hasAttribute('data-live-retry')){pull();return}
 if(!remote)return;
 if(b.dataset.liveDetails){window.GreywakeOpenPrepReference?.(b.dataset.liveDetails);return;}
 if(b.hasAttribute('data-live-add')){window.GreywakeRunCardDialog?.();return;}
 if(b.dataset.encounter){if(writing)return;const a=encounters.find(a=>a.instance_id===b.dataset.encounter);if(!a)return;writing=true;mount();try{const field=b.dataset.field;const data=await encounterRequest('PATCH',{session_key:a.session_key,instance_id:a.instance_id,version:a.version,field,value:field==='status'?b.dataset.value:Number(b.dataset.value)});encounters=encounters.map(x=>x.instance_id===a.instance_id?{...x,...data.instance}:x);encounterError=''}catch(e){encounterError=String(e.message)}finally{writing=false;mount();}return;}
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
window.addEventListener('greywake:prep-feed-changed',()=>{const host=document.getElementById('gmDynamicScene');if(host)delete host.dataset.signature;schedule();});
window.addEventListener('hashchange',()=>{schedule();pull()});
window.addEventListener('greywake:player-ready',()=>{schedule();pull()});
setInterval(pull,3000);setTimeout(pull,200);
})();

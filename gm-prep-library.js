(()=>{'use strict';
const endpoint='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/gm-prep-library';
const gm=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true'&&['#/gm-prep','#/gm-between'].includes(location.hash);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=v=>typeof v==='string'&&/^assets\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp)$/i.test(v)&&!v.includes('..');
let cards=null,session='',error='',busy=false,queued=false;

// Regional browsing is local UI state only; it never changes the live scene.
const prepHexById={'s6-western-sound':'0,-1','s6-haul-grounds':'0,-1','s6-examine-tracks':'0,-1','s6-assess-masonry':'0,-1','s6-survey-south':'0,-1','s6-traveller':'1,-2','s6-pack-animal':'1,-2','s6-route-exchange':'1,-2','s6-region-a1':'0,-4','s6-region-a2':'0,-4','s6-region-a3':'0,-4','s6-region-b1':'1,-4','s6-region-b2':'1,-4','s6-region-b3':'1,-4'};
const hexLabels={'0,0':'Greywake','0,-1':'Stripped Yards','1,0':'Old Marker Wash','2,0':'Grey Seep Fields','2,-1':'Pale Tracts','2,-3':'Sunken Relay','0,-2':'Digger Ruin','1,-2':'Traveller preparation','0,-4':'Regional preparation','1,-4':'Glasswind'};
let selectedHex='all';

let vaultHandle=null, privateNotes={}, privateVersion=0, privateMessage='', privateBusy=false, privateEpoch=0;
const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
const noteHeading=s=>(s.match(/^# (.+)$/m)||[])[1]||'';
function sections(s,level){const rx=new RegExp('^'+'#'.repeat(level)+' (.+)$','gm');return [...s.matchAll(rx)].map(m=>{const start=m.index+m[0].length;const next=s.slice(start).search(new RegExp('^#{1,'+level+'} ','m'));return {title:m[1].trim(),body:s.slice(start,next<0?s.length:start+next).trim()};});}
function sectionNamed(s,level,name){return sections(s||'',level).find(x=>x.title===name);}
function privateCard(c){
 if(!c||!fullGM())return null;
 const k=c.id;let sec,notes=[];
 if(k.startsWith('s6-region-')){
  const a=k.startsWith('s6-region-a'),src=a?privateNotes.west:privateNotes.east;
  const group=sectionNamed(src,2,a?'Three discoverable sites':'Nodes');
  sec=sections(group?.body||'',3)[Number(k.slice(-1))-1];
  if(src)notes.push({title:noteHeading(src),body:src});
  if(privateNotes.region)notes.push({title:noteHeading(privateNotes.region),body:privateNotes.region});
 }else{
  sec=sectionNamed(privateNotes.session,2,c.title);
  if(['s6-traveller','s6-pack-animal','s6-route-exchange'].includes(k)&&privateNotes.traveller)notes.push({title:noteHeading(privateNotes.traveller),body:privateNotes.traveller});
  if(k==='s6-examine-tracks'&&privateNotes.creature)notes.push({title:noteHeading(privateNotes.creature),body:privateNotes.creature});
 }
 return sec?{title:sec.title.split(' — ')[0],body:sec.body,notes}:null;
}
const shownTitle=c=>privateCard(c)?.title||c.title;
function localHexLabel(k){if(fullGM()&&k==='0,-4'&&privateNotes.west)return noteHeading(privateNotes.west);if(fullGM()&&k==='1,-2'&&privateNotes.traveller)return noteHeading(privateNotes.traveller).split(' — ')[0];return hexLabels[k]||'Uncharted';}
function clearPrivate(){privateEpoch++;vaultHandle=null;privateNotes={};privateVersion++;privateMessage='Private notes cleared.';privateBusy=false;document.getElementById('gwPrepDetail')?.close();document.querySelectorAll('[data-private-vault]').forEach(el=>el.remove());mount();}
async function findLocalNotes(dir,accept){
 const result={};for await(const [name,h] of dir.entries()){if(h.kind!=='file'||!name.endsWith('.md'))continue;const f=await h.getFile();if(f.size>2000000)continue;const s=await f.text();const key=accept(name,s);if(key&&!result[key])result[key]=s;}return result;
}
async function loadPrivate(pick){
 if(!gm()||privateBusy)return;
 if(typeof window.showDirectoryPicker!=='function'){privateMessage='Folder access is unavailable in this browser. Use desktop Chrome or Edge.';privateVersion++;mount();return;}
 const epoch=++privateEpoch;privateBusy=true;privateMessage='Reading selected local vault…';privateVersion++;mount();
 try{
  const h=pick?await window.showDirectoryPicker({mode:'read'}):vaultHandle;
  if(!h)throw Error('Select the Greywake vault folder first.');
  const locations=await h.getDirectoryHandle('04 Locations'),npcs=await h.getDirectoryHandle('03 NPCs'),gmDir=await h.getDirectoryHandle('90 GM Only');
  const n={...await findLocalNotes(locations,(name,s)=>/^hex:\s*["']?\(0,-4\)/m.test(s)?'west':/^hex:\s*["']?\(\+1,-4\)/m.test(s)?'east':null),
   ...await findLocalNotes(npcs,(name,s)=>s.includes('(+1,-2)')&&s.includes('Session Six')&&s.includes('travelling north')?'traveller':null),
   ...await findLocalNotes(gmDir,(name,s)=>name==='Session 06 — Card Preparation.md'?'session':/^type: regional-preparation/m.test(s)&&s.includes('(0,-4)')&&s.includes('(+1,-4)')?'region':null)};
  try{const creatures=await h.getDirectoryHandle('06 Creatures and Beasts');const tracks=sectionNamed(n.session,2,'Examine the animal tracks');Object.assign(n,await findLocalNotes(creatures,(name,s)=>tracks?.body.includes('[['+name.slice(0,-3)+']]')?'creature':null));}catch{}
  if(epoch!==privateEpoch||!fullGM())return;
  if(!n.session||!n.west||!n.east)throw Error('Required session or regional notes missing. Pull the latest vault updates and select the Greywake root folder.');
  vaultHandle=h;privateNotes=n;privateMessage='Private vault loaded locally · '+Object.keys(n).length+' source notes · no upload.';
 }catch(e){if(epoch===privateEpoch)privateMessage=e.name==='AbortError'?'Folder selection cancelled.':String(e.message||e);}
 finally{if(epoch===privateEpoch){privateBusy=false;privateVersion++;mount();}}
}
function renderPrivatePanel(grid){
 let el=grid.parentElement.querySelector('[data-private-vault]');
 if(!el){el=document.createElement('section');el.dataset.privateVault='1';grid.before(el);}
 if(el.dataset.version===String(privateVersion))return;el.dataset.version=String(privateVersion);
 el.innerHTML='<div style="border:1px solid #82724b;padding:12px;margin:10px 0;background:#23251c;border-radius:6px"><strong>Private GM vault</strong><p>Load the synced vault to show full notes and names inside preparation cards. Read-only, in this tab; nothing is uploaded by this reader.</p><button type="button" data-vault-action="pick" '+(privateBusy?'disabled':'')+'>Select Greywake vault</button> '+(vaultHandle?'<button type="button" data-vault-action="reload" '+(privateBusy?'disabled':'')+'>Reload notes</button> <button type="button" data-vault-action="clear">Clear private notes</button>':'')+'<p role="status">'+esc(privateMessage||'No private source loaded yet.')+'</p></div>';
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-vault-action]');if(!b||!gm())return;const a=b.dataset.vaultAction;if(a==='clear')clearPrivate();else loadPrivate(a==='pick');});
function privateText(s){
 const clean=s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
 return '<div style="white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;font-size:15px">'+esc(clean)+'</div>';
}
function privateHtml(c){const p=privateCard(c);if(!p)return '';return '<section data-local-private style="border:1px solid #ad9457;padding:14px;margin:16px 0;background:#24251d"><small>PRIVATE · LOCAL CANON SOURCE</small><h3>'+esc(p.title)+'</h3>'+privateText(p.body)+p.notes.map(n=>'<details style="margin-top:12px"><summary>'+esc(n.title)+'</summary>'+privateText(n.body)+'</details>').join('')+'</section>';}

function renderHexBrowser(grid){
 let panel=grid.parentElement.querySelector('[data-prep-hex-browser]');
 if(!panel){panel=document.createElement('section');panel.dataset.prepHexBrowser='1';grid.before(panel);}
 const counts={};for(const c of cards||[]){const k=prepHexById[c.id]||'unassigned';counts[k]=(counts[k]||0)+1;}
 const sig=JSON.stringify([selectedHex,counts,privateVersion]);if(panel.dataset.sig===sig)return;panel.dataset.sig=sig;
 const cells=[];for(let r=1;r>=-4;r--)for(let q=-2;q<=2;q++){const k=q+','+r;const x=195+q*82+r*41,y=60+(1-r)*71;cells.push({k,x,y,label:localHexLabel(k)});}
 const fmt=k=>k.split(',').map(n=>Number(n)>0?'+'+n:n).join(', ');
 const polygons=cells.map(h=>{const active=selectedHex===h.k,party=h.k==='0,-1',count=counts[h.k]||0,lines=h.label.split(' '),split=lines.length>1?[lines.slice(0,-1).join(' '),lines.at(-1)]:lines;return '<g role="button" tabindex="0" aria-label="'+esc(fmt(h.k)+' '+h.label)+'" aria-pressed="'+active+'" data-prep-hex="'+esc(h.k)+'" transform="translate('+h.x+','+h.y+')" style="cursor:pointer"><polygon points="0,-47.3 41,-23.65 41,23.65 0,47.3 -41,23.65 -41,-23.65" fill="'+(active?'#69532a':party?'#49432a':hexLabels[h.k]?'#30372d':'#222620')+'" stroke="'+(active?'#f4cc76':party?'#bfa15b':'#5d6250')+'" stroke-width="'+(active?2.5:1)+'"/><text y="-23" text-anchor="middle" font-size="10" fill="#d0c8b3">'+esc(fmt(h.k))+'</text>'+split.map((t,i)=>'<text y="'+(i*12-4)+'" text-anchor="middle" font-size="10" font-weight="600" fill="#f0e5ca">'+esc(t)+'</text>').join('')+'<text y="30" text-anchor="middle" font-size="9" fill="#e1bc70">'+(party?'PARTY · '+count+' cards':count?count+' cards':'')+'</text></g>';}).join('');
 const label=selectedHex==='all'?'All preparation':selectedHex==='unassigned'?'Unassigned cards':localHexLabel(selectedHex)+' ('+fmt(selectedHex)+')';
 panel.innerHTML='<div style="border:1px solid #62563a;background:#181b16;padding:12px;margin:12px 0;border-radius:8px"><h3>Regional hex browser</h3><p>Browse preparation without moving the party. Six miles per hex; party marker is the Session Six starting position.</p><div style="overflow:auto"><svg viewBox="-185 0 650 470" style="width:100%;min-width:430px;max-height:520px" aria-label="Regional hex preparation selector">'+polygons+'</svg></div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button type="button" data-prep-hex="all" style="background:#30291c;color:#e8d098;border:1px solid #8a7440;padding:8px 12px;border-radius:4px;cursor:pointer">All cards ('+(cards||[]).length+')</button>'+(counts.unassigned?'<button type="button" data-prep-hex="unassigned">Unassigned ('+counts.unassigned+')</button>':'')+'<a style="color:#e8d098" href="obsidian://open?vault=Greywake&amp;file='+encodeURIComponent('04 Locations/Greywake Canon Hex Map')+'">Open canonical map in Obsidian ↗</a></div><p><strong>Viewing: '+esc(label)+'</strong></p></div>';
}
function chooseHex(k){selectedHex=k;mount();}
document.addEventListener('click',e=>{const b=e.target.closest('[data-prep-hex]');if(b&&gm())chooseHex(b.dataset.prepHex);});
document.addEventListener('keydown',e=>{const b=e.target.closest('g[data-prep-hex]');if(b&&gm()&&(e.key==='Enter'||e.key===' ')){e.preventDefault();chooseHex(b.dataset.prepHex);}});

function mount(){
 if(!gm())return;
 const grid=document.querySelector('.gm-ready-run .gm-ready-grid');if(!grid)return;
 const parent=grid.parentElement;
 let status=parent.querySelector('[data-prep-feed-status]');
 if(!status){status=document.createElement('p');status.dataset.prepFeedStatus='1';status.setAttribute('role','status');grid.before(status)}
 const message=error?'Preparation feed unavailable — '+(cards?'showing last successful load.':'showing bundled fallback.') :cards?'Shared preparation library · '+session+' · '+cards.length+' ready':'Connecting to preparation library…';
 if(status.textContent!==message)status.textContent=message;
 if(!cards)return;
 renderPrivatePanel(grid);
 renderHexBrowser(grid);
 const visible=selectedHex==='all'?cards:cards.filter(c=>(prepHexById[c.id]||'unassigned')===selectedHex);
 const sig=JSON.stringify([selectedHex,cards,privateVersion]);if(grid.dataset.prepSignature===sig)return;grid.dataset.prepSignature=sig;
 grid.innerHTML=visible.map(c=>'<article class="gm-ready-card" data-prep-id="'+esc(c.id)+'"><div class="gm-ready-art">'+(safe(c.image)?'<img src="'+esc(c.image)+'" alt="'+esc(c.image_label||c.title)+'" loading="lazy">':'<div class="gw-card-symbol">◇</div>')+'<span>'+esc(c.image_label||c.kind)+'</span></div><div class="gm-ready-body"><small>'+esc(c.readiness)+' · '+esc(c.kind)+'</small><h3>'+esc(shownTitle(c))+'</h3><p>'+esc(c.detail)+'</p>'+(c.record&&window.GREYWAKE_DATA?.[c.record]?'<button class="gm-prep-link" data-gm-record="'+esc(c.record)+'">'+esc(c.record)+' →</button>':'')+'<button type="button" class="gm-prep-link gw-prep-view" data-view-prep="'+esc(c.id)+'" style="display:block;width:100%;min-height:40px;border:1px solid #82724b;margin:4px 0 8px;padding:9px;text-align:center;background:#29251a;color:#e7d6ae;cursor:pointer">View preparation ↗</button><button type="button" class="gm-ready-activate" data-dynamic-prep="'+esc(c.id)+'">+ Add to RUN</button></div></article>').join('')||'<p>No live preparation cards assigned to this selection. Consult the canonical map and private location records.</p>';
}
async function pull(){if(!gm()||busy)return;busy=true;try{const r=await fetch(endpoint,{headers:{apikey:'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl','x-greywake-character':'gm','x-greywake-code':'GREYWAKE'},cache:'no-store'});const d=await r.json();if(!r.ok||!Array.isArray(d.cards))throw Error('Feed unavailable');cards=d.cards;session=d.session;error=''}catch(e){error=String(e.message)}finally{busy=false;mount()}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-dynamic-prep]');if(!b||!gm())return;const c=cards?.find(x=>x.id===b.dataset.dynamicPrep);if(c)window.GreywakeRunCardDialog?.({kind:c.kind,title:c.title,record:c.record,adversary_slug:c.adversary_slug});});
const preparedIds=new Set(['s6-western-sound','s6-haul-grounds','s6-examine-tracks','s6-assess-masonry','s6-survey-south','s6-traveller','s6-pack-animal','s6-route-exchange']);
const inlineGuidance={"s6-western-sound":["The sound has stopped. Roofless rooms and narrow lanes interrupt sightlines west of the road.","Listen, circle the buildings, inspect an entrance or move on.","No roll for obvious conditions. Call an action roll only for a risky or uncertain approach; choose the trait from the stated method.","Dust obscures evidence, a route becomes blocked, or shifting rubble changes positioning. Telegraph danger.","Track investigation or structural assessment; no forced encounter."],"s6-haul-grounds":["Heavy stone uprights flank a broad former sorting yard. Look for haul grooves and claim marks.","Follow the yard route, inspect marks, talk if workers are present, or bypass.","No roll for normal movement; use a relevant action roll for uncertain inspection or negotiation.","A crew arrives, a claim dispute develops, or a route costs time.","Old South Road, the Break, or further investigation."],"s6-examine-tracks":["Broad, deep impressions with narrow claw marks. Small stones have been pushed aside; the trail breaks towards old walls.","Marek: interpret signs. Odie: examine disturbed ground. Velmira: investigate practical ecology.","Visible evidence needs no roll; test uncertain identification or tracking only if consequences matter.","Lost trail, compromised footing or changing evidence.","Follow, avoid or inspect the masonry. Species identity remains undiscovered."],"s6-assess-masonry":["Empty beam sockets, stripped stonework and loose debris signal risk before entry.","Examine from safe ground, stabilise with tools, find another approach or retreat.","Good methods may remove uncertainty. Roll only where structural risk remains meaningful.","Dust, blocked route, lost evidence or awkward positioning. Signal injury risk before escalation.","Investigate safely or bypass."],"s6-survey-south":["The street pattern fragments; isolated buildings give way to open waste.","Old South Road: direct. Yard Route: working grounds. Old Streets: slower and exploratory.","No roll for stable movement. One hex is half a day; check established travel and rest rules.","Delay, exposure or difficult footing when circumstances warrant.","Choose onward direction. No confirmed local harvesting site."],"s6-traveller":["If paths cross, introduce a traveller approaching along the route.","Approach, converse, trade, offer assistance or pass.","Ordinary conversation requires no roll. Test uncertain persuasion or risky help only when meaningful.","A competing obligation or difficult trade-off may arise; no compulsory bargain.","Assess the animal or exchange information if relevant."],"s6-pack-animal":["If encountered, describe the animal's uneven gait and burden.","Marek: assess condition. Odie: inspect harness and load. Velmira: negotiate help.","Use the trait matching the chosen method. Do not guarantee a cure or invent a stat block.","Assistance may cost time, supplies or a revised delivery plan.","Rest, redistribute the load, offer help or continue."],"s6-route-exchange":["If conversation develops, ask what the traveller has seen on southern routes.","Compare descriptions, discuss landmarks, exchange goods or assistance, or negotiate an obligation.","No roll for freely offered information. Test uncertain negotiation where stakes are clear.","Information may be incomplete, dated, or require a meaningful exchange.","Follow a lead only if obtained in play; no guaranteed discovery."]};

const regionGuidance={
 's6-region-a1':['Describe only what the characters can see from their approach.','Inspect the terrain, observe signs, choose a safe route or bypass.','Roll only for meaningful uncertainty; do not gate basic observations.','A difficult approach may cost time or damage equipment.','Consult the private location record for this site.'],
 's6-region-a2':['Describe visible structure and condition before investigation.','Examine evidence, assess stability, follow physical traces or leave intact.','Use the trait matching the stated method; no assumed resource recovery.','Delay, lost evidence or compromised footing if warranted.','Consult the private location record for this site.'],
 's6-region-a3':['Present route evidence before committing to a passage.','Scout, compare alternatives, withdraw or continue.','No roll for stable travel; test a risky approach only if consequences matter.','Changing conditions can obscure signs or alter the route.','Consult the private location record for this site.'],
 's6-region-b1':['Describe the change in wind and exposure as shelter becomes apparent.','Inspect the ground, rest if suitable, look for signs or continue.','Check established rest and water rules; shelter does not guarantee water.','Weather, prior occupation or animal sign may affect the decision.','Consult the location record and regional conditions.'],
 's6-region-b2':['Describe visible stonework and physical evidence.','Inspect marks, evaluate practical salvage, avoid unstable ground or pass.','Roll only if the chosen method creates uncertainty.','Exposure, damage, delay or competing interest may change the situation.','Consult the location record and regional conditions.'],
 's6-region-b3':['Use only after a relevant change in fictional conditions.','Inspect newly accessible ground, compare evidence, salvage or bypass.','Do not assume an artifact, creature or hidden cause.','Wind or unstable footing can change access or evidence.','Consult the location record and regional conditions.']
};
Object.assign(inlineGuidance,regionGuidance);
function guidanceHtml(id){const v=inlineGuidance[id];if(!v)return '';const headings=['Opening description','Player choices','Daggerheart adjudication','Fear and consequences','Possible next steps'];return '<section aria-label="Running guidance">'+v.map((x,i)=>'<h3>'+headings[i]+'</h3><p>'+esc(x)+'</p>').join('')+'</section>';}
function viewPrep(c){
 if(!gm()||!c||document.getElementById('gwPrepDetail'))return;
 const d=document.createElement('dialog');d.id='gwPrepDetail';d.style.cssText='width:min(680px,90vw);max-height:85vh;overflow:auto;background:#191a14;color:#eee5cd;border:1px solid #8a7440;padding:24px';
 const hasNote=preparedIds.has(c.id);const regional=Object.hasOwn(regionGuidance,c.id);
 d.innerHTML='<header style="display:flex;justify-content:space-between;gap:16px;align-items:start"><div><small>'+esc(c.readiness)+' · '+esc(c.kind)+'</small><h2>'+esc(shownTitle(c))+'</h2></div><button type="button" data-close-prep aria-label="Close preparation">Close</button></header>'+(safe(c.image)?'<a href="'+esc(c.image)+'" target="_blank" rel="noopener noreferrer"><img style="width:100%;max-height:340px;object-fit:contain" src="'+esc(c.image)+'" alt="'+esc(c.image_label||c.title)+'"></a>':'')+'<h3>Overview</h3><p>'+esc(c.detail)+'</p>'+privateHtml(c)+guidanceHtml(c.id)+'<h3>Private preparation and records</h3>'+(hasNote?'<p>The private session sheet contains the opening description, GM guidance, choices, consequences and source links. Open it in your synced Obsidian vault.</p><p><a data-open-note style="display:inline-block;padding:12px;border:1px solid #c3a66c;color:#e8d098" href="'+esc('obsidian://open?vault='+encodeURIComponent('Greywake')+'&file='+encodeURIComponent('90 GM Only/Session 06 — Card Preparation'))+'">Open detailed preparation in Obsidian ↗</a></p><p>Section: <strong>'+esc(c.title)+'</strong></p><p style="font-size:12px">Requires the latest private vault sync. The private notes are not stored on this website.</p>':regional?'<p>Use the synced private map to open the full location record for this hex.</p><p><a style="color:#e8d098" href="obsidian://open?vault=Greywake&amp;file='+encodeURIComponent('04 Locations/Greywake Canon Hex Map')+'">Open canonical map in Obsidian ↗</a></p>':'<p>No linked private preparation sheet is configured for this card.</p>')+'<hr><button type="button" class="gm-ready-activate" data-detail-activate>+ Add to RUN</button>';
 d.querySelector('[data-close-prep]').onclick=()=>d.close();d.querySelector('[data-detail-activate]').onclick=()=>{d.close();window.GreywakeRunCardDialog?.({kind:c.kind,title:c.title,record:c.record,adversary_slug:c.adversary_slug});};d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();
}
document.addEventListener('click',e=>{if(!gm())return;const b=e.target.closest('[data-view-prep]');const a=e.target.closest('[data-prep-id]');if(b){viewPrep(cards?.find(x=>x.id===b.dataset.viewPrep));return}if(a&&!e.target.closest('button,a,input,select,textarea'))viewPrep(cards?.find(x=>x.id===a.dataset.prepId));});
function schedule(){if(!fullGM()&&(vaultHandle||Object.keys(privateNotes).length||privateBusy)){clearPrivate();}if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',()=>{schedule();pull()});window.addEventListener('greywake:player-ready',pull);setInterval(pull,3500);setTimeout(pull,250);
})();
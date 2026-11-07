/* Greywake: synced player-written sticky notes, GM-readable via existing character journal. */
(()=>{
'use strict';
const API='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/character-journal';
const APIKEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
const LEGACY_PREFIX='greywake.player.stickies.v1.';
const LIMIT=1500;
const PEOPLE=['velmira','marek','odie'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const own=()=>document.body.dataset.role==='player'&&document.body.dataset.gmPreview!=='true';
const gm=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
const slug=()=>String(document.body.dataset.character||'').toLowerCase();
let cache={},loadedFor='',busy=false,scheduled=false,gmFor='velmira',gmRows=[],gmBusy=false;
function ref(kind,id){return 'sticky:'+kind+':'+id}
function isSticky(n){return n.category==='In my words'&&String(n.linked_entity_id||'').startsWith('sticky:')}
async function request(method='GET',body=null,view=null){
 const user=window.GreywakePlayer;
 const who=gm()?'gm':slug();
 if(!user?.code||!['gm',...PEOPLE].includes(who))throw Error('Greywake access is unavailable.');
 const response=await fetch(API,{method,headers:{'Content-Type':'application/json','apikey':APIKEY,'x-greywake-character':who,'x-greywake-code':user.code,'x-greywake-view':view||who},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw Error(data?.error||'Could not reach shared notes.');
 return data;
}
const legacy=()=>{try{return JSON.parse(localStorage.getItem(LEGACY_PREFIX+slug())||'{}')||{}}catch{return{}}};
async function migrateLocal(){
 const old=legacy();const entries=Object.entries(old);
 if(!entries.length)return;
 for(const [key,value] of entries){
  const linked='sticky:'+key;
  if(!value||linked.length>160||cache[linked])continue;
  const title=key.split(':').slice(1).join(':').slice(0,140)||'My note';
  const data=await request('POST',{title,body:String(value).slice(0,LIMIT),category:'In my words',linked_entity_id:linked});
  cache[linked]={id:data.note.id,body:String(value).slice(0,LIMIT),title};
  delete old[key];localStorage.setItem(LEGACY_PREFIX+slug(),JSON.stringify(old));
 }
 // Also clear successfully matched local entries to prevent duplicate migration later.
 for(const key of Object.keys(old)){if(cache['sticky:'+key])delete old[key]}
 localStorage.setItem(LEGACY_PREFIX+slug(),JSON.stringify(old));
}
async function load(){
 if(!own()||busy||loadedFor===slug())return;
 busy=true;
 try{
  const data=await request();
  cache=Object.fromEntries((data.notes||[]).filter(isSticky).map(n=>[n.linked_entity_id,n]));
  await migrateLocal();
  loadedFor=slug();document.querySelectorAll('.gw-sticky-area').forEach(draw);
 }catch(e){console.warn('Sticky note sync failed',e);notify('Could not load shared notes. Check your connection.')}finally{busy=false}
}
function notify(msg){let el=document.getElementById('gwStickyStatus');if(!el){el=document.createElement('div');el.id='gwStickyStatus';el.setAttribute('role','status');el.style.cssText='position:fixed;bottom:16px;right:16px;z-index:9998;background:#292418;color:#eed6a2;padding:12px;border:1px solid #9c824f;font:12px system-ui;max-width:350px';document.body.appendChild(el)}el.textContent=msg;el.hidden=false}
function style(){
 if(document.getElementById('gwStickyStyle'))return;
 const css=document.createElement('style');css.id='gwStickyStyle';css.textContent=`
 .gw-sticky-area{margin:18px 0 24px;max-width:740px;clear:both}.gw-sticky-area.compact{margin:9px 0 15px}
 .gw-sticky-button{background:#342d1d!important;color:#efd79a!important;border:1px solid #957c4a!important;padding:9px 12px!important;cursor:pointer;font:700 11px system-ui!important}
 .gw-sticky-note{background:#342d1b;color:#f3e7c4;border:1px solid #aa8e55;padding:14px 16px;margin:10px 0;box-shadow:3px 5px 12px #0005;transform:rotate(-.25deg)}
 .gw-sticky-note small{font:700 10px system-ui;color:#dcc38b}.gw-sticky-note p{color:#f4e9c8!important;white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.5 system-ui!important;margin:9px 0!important}
 .gw-sticky-note button{margin-right:7px;padding:7px 10px;border:1px solid #8c7648;background:#25231b;color:#ecd4a1;cursor:pointer}
 .gw-sticky-area.compact .gw-sticky-note p{font-size:12px!important}
 .gw-sticky-modal{position:fixed;inset:0;z-index:99999;background:#000b;display:flex;align-items:center;justify-content:center;padding:15px}
 .gw-sticky-editor{background:#24251e;border:1px solid #ab915d;padding:23px;width:min(570px,100%);color:#e9dfc7}
 .gw-sticky-editor h2{margin:0 0 8px;font:26px Georgia,serif}.gw-sticky-editor p{font:12px/1.5 system-ui;color:#bdb39e}
 .gw-sticky-editor textarea{width:100%;min-height:170px;resize:vertical;background:#353021;color:#f4e8c5;border:1px solid #a78c5a;padding:12px;font:14px/1.5 system-ui}
 .gw-sticky-editor .actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}
 .gw-sticky-editor button{background:#473b26;border:1px solid #9a8150;color:#efddaf;padding:9px 14px;cursor:pointer}
 .gm-sticky-panel{padding:20px;border:1px solid #5a5033;background:#191912;margin:18px 0}.gm-sticky-panel h2{font:28px Georgia,serif;color:#efe0bf;margin:4px 0 10px}
 .gm-sticky-panel select,.gm-sticky-panel button{background:#2b281c;border:1px solid #766441;color:#e9d7a9;padding:8px}.gm-sticky-entry{border:1px solid #56482e;background:#29251a;padding:13px;margin:10px 0}.gm-sticky-entry small{color:#cfb778;font:10px system-ui}.gm-sticky-entry strong{display:block;font:18px Georgia,serif;margin:6px 0}.gm-sticky-entry p{white-space:pre-wrap;color:#dfd4ba;font:13px/1.5 system-ui}
 `;document.head.appendChild(css);
}
function area(kind,id,title,compact=false){
 const el=document.createElement('div');el.className='gw-sticky-area'+(compact?' compact':'');el.dataset.stickyRef=ref(kind,id);el.dataset.stickyTitle=title;return el;
}
function draw(el){
 const note=cache[el.dataset.stickyRef],label=loadedFor===slug()?'':' (loading…)';
 el.innerHTML=note?'<div class="gw-sticky-note"><small>MY WORDS · GM CAN READ</small><p>'+esc(note.body)+'</p><button data-edit>Edit</button><button data-delete>Remove</button></div>':'<button class="gw-sticky-button" data-edit>+ Add my sticky note'+label+'</button>';
 el.querySelector('[data-edit]').onclick=e=>{e.preventDefault();e.stopPropagation();edit(el)};
 el.querySelector('[data-delete]')?.addEventListener('click',async e=>{
  e.preventDefault();e.stopPropagation();if(!confirm('Remove this note from the shared character journal?'))return;
  try{await request('DELETE',{id:note.id});delete cache[el.dataset.stickyRef];redraw()}catch(err){notify(err.message)}
 });
}
function redraw(){document.querySelectorAll('.gw-sticky-area').forEach(draw)}
function edit(el){
 if(!own())return;
 const old=cache[el.dataset.stickyRef];const modal=document.createElement('div');modal.className='gw-sticky-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
 modal.innerHTML='<div class="gw-sticky-editor"><h2>My words</h2><p>The GM can read these notes. They do not alter Greywake canon.</p><textarea maxlength="'+LIMIT+'"></textarea><div class="actions"><button data-cancel>Cancel</button><button data-save>Save note</button></div></div>';
 const ta=modal.querySelector('textarea');ta.value=old?.body||'';
 const close=()=>modal.remove();modal.querySelector('[data-cancel]').onclick=close;
 modal.querySelector('[data-save]').onclick=async()=>{
  const value=ta.value.trim();if(!value){notify('Write something before saving, or use Remove on an existing note.');return}
  const saveBtn=modal.querySelector('[data-save]');saveBtn.disabled=true;
  try{
   const title=el.dataset.stickyTitle.slice(0,150)||'My note';
   const data=await request(old?'PATCH':'POST',{id:old?.id,title,body:value,category:'In my words',linked_entity_id:el.dataset.stickyRef});
   cache[el.dataset.stickyRef]={id:data.note.id,title,body:value,category:'In my words',linked_entity_id:el.dataset.stickyRef};
   close();redraw();
  }catch(err){notify('Save failed: '+err.message);saveBtn.disabled=false}
 };
 document.body.appendChild(modal);ta.focus();
}
function mountPlayer(){
 if(!own())return;
 style();load();
 const match=(location.hash||'').match(/^#\/record\/(.+)$/),article=document.getElementById('article');
 if(match&&article&&!article.classList.contains('hidden')&&article.querySelector('h1')){
  let id;try{id=decodeURIComponent(match[1])}catch{id=match[1]}
  let el=article.querySelector(':scope > .gw-sticky-area');const title=article.querySelector('h1')?.textContent||id;
  if(!el){el=area('record',id,title);article.querySelector('h1').insertAdjacentElement('afterend',el)}
  if(el.dataset.stickyRef!==ref('record',id)){el.dataset.stickyRef=ref('record',id);el.dataset.stickyTitle=title;el.innerHTML=''}
  if(!el.childElementCount)draw(el);
 }
 document.querySelectorAll('.player-mind-card-wrap[data-player-mind-wrap],.interest-thread[data-goal-id]').forEach(card=>{
  const id=card.dataset.playerMindWrap||card.dataset.goalId;if(card.querySelector(':scope > .gw-sticky-area'))return;
  const title=card.querySelector('h3')?.textContent||'Interest';
  const el=area('interest',id,title,true);card.appendChild(el);draw(el);
 });
}
async function loadGM(){
 if(!gm()||gmBusy)return;
 gmBusy=true;
 const panel=document.getElementById('gmStickyOverview');
 if(panel)panel.querySelector('.gm-sticky-status').textContent='Loading '+gmFor+' notes…';
 try{const data=await request('GET',null,gmFor);gmRows=(data.notes||[]).filter(isSticky);drawGM()}
 catch(e){if(panel)panel.querySelector('.gm-sticky-status').textContent='Could not load notes: '+e.message}
 finally{gmBusy=false}
}
function drawGM(){
 const panel=document.getElementById('gmStickyOverview');if(!panel)return;
 panel.querySelector('.gm-sticky-status').textContent=gmRows.length+' notes · player-written · read only';
 panel.querySelector('.gm-sticky-entries').innerHTML=gmRows.length?gmRows.map(n=>'<article class="gm-sticky-entry"><small>'+esc(gmFor.toUpperCase())+' · '+esc(n.linked_entity_id.replace(/^sticky:/,''))+'</small><strong>'+esc(n.title)+'</strong><p>'+esc(n.body)+'</p></article>').join(''):'<p>No sticky notes for this character yet.</p>';
}
function mountGM(){
 if(!gm()||location.hash!=='#/gm-inbox')return;
 style();
 const root=document.getElementById('gmOperationsView');if(!root||root.classList.contains('hidden'))return;
 if(root.querySelector('#gmStickyOverview'))return;
 const panel=document.createElement('section');panel.id='gmStickyOverview';panel.className='gm-sticky-panel';
 panel.innerHTML='<small>PLAYER-WRITTEN NOTES</small><h2>In their own words</h2><p>Notes from campaign records and interest cards. These are player interpretations, not canon.</p><label>Character <select id="gmStickyCharacter"><option value="velmira">Velmira (Carla)</option><option value="marek">Marek (Martin)</option><option value="odie">Odie (Ritchie)</option></select></label> <button id="gmStickyRefresh">Refresh</button><p class="gm-sticky-status" role="status"></p><div class="gm-sticky-entries"></div>';
 root.prepend(panel);panel.querySelector('select').value=gmFor;
 panel.querySelector('select').onchange=e=>{gmFor=e.target.value;loadGM()};
 panel.querySelector('#gmStickyRefresh').onclick=loadGM;loadGM();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mountPlayer();mountGM()})}
new MutationObserver(ms=>{if(ms.every(m=>m.target.nodeType===1&&m.target.closest?.('.gw-sticky-area,.gw-sticky-modal,.gm-sticky-panel')))return;schedule()}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',schedule);window.addEventListener('hashchange',schedule);window.addEventListener('greywake:player-ready',schedule);schedule();
})();

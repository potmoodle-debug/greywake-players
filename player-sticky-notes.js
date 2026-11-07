/* Player-owned interpretation notes. Local browser storage, never canonical or GM-shared. */
(()=>{
'use strict';
const PREFIX='greywake.player.stickies.v1.';
const MAX=1500;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function person(){return document.body.dataset.role==='player'&&document.body.dataset.gmPreview!=='true'?document.body.dataset.character:null}
function notes(){const p=person();if(!p)return{};try{return JSON.parse(localStorage.getItem(PREFIX+p)||'{}')||{}}catch{return{}}}
function store(data){const p=person();if(!p)return false;try{localStorage.setItem(PREFIX+p,JSON.stringify(data));return true}catch{alert('Your browser could not save these notes. Check available storage.');return false}}
const key=(kind,id)=>kind+':'+id;
function ensureStyles(){
 if(document.getElementById('greywake-sticky-style'))return;
 const style=document.createElement('style');style.id='greywake-sticky-style';
 style.textContent=`
 .gw-sticky-area{margin:20px 0 25px;max-width:730px;clear:both}
 .gw-sticky-trigger{border:1px solid #887348!important;background:#292319!important;color:#edda9d!important;padding:10px 13px!important;font:800 11px system-ui!important;letter-spacing:.02em;cursor:pointer}
 .gw-sticky-trigger:hover{border-color:#e5c77b!important}
 .gw-sticky{position:relative;border:1px solid #a68b54;background:#332d1d;padding:15px 17px;margin:12px 0;box-shadow:3px 5px 15px #0006;transform:rotate(-.35deg);max-width:720px}
 .gw-sticky::before{content:"";position:absolute;top:0;left:42%;width:65px;height:9px;background:#d6c08c46}
 .gw-sticky small{display:block;margin-bottom:9px;color:#ebd29a;font:800 10px system-ui;letter-spacing:.08em}
 .gw-sticky p{white-space:pre-wrap!important;overflow-wrap:anywhere;color:#f3e7c3!important;font:14px/1.55 system-ui!important;margin:0 0 12px!important}
 .gw-sticky-actions{display:flex;gap:8px;flex-wrap:wrap}
 .gw-sticky-actions button{font:700 11px system-ui;color:#eddfbc;border:1px solid #87764f;background:#26251e;padding:7px 11px;cursor:pointer}
 .gw-sticky-dialog{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#060706db;padding:16px}
 .gw-sticky-editor{background:#22241e;color:#ede1c8;border:1px solid #b29b68;padding:22px;width:min(560px,100%);box-shadow:0 18px 70px #000b}
 .gw-sticky-editor h2{font:26px Georgia,serif;margin:0 0 7px}
 .gw-sticky-editor p{font:12px/1.55 system-ui;color:#c1b49d}
 .gw-sticky-editor textarea{display:block;width:100%;min-height:180px;resize:vertical;background:#332d1d;color:#f4e9cd;border:1px solid #a08a55;font:15px/1.5 system-ui;padding:14px;box-sizing:border-box}
 .gw-sticky-editor .actions{display:flex;justify-content:flex-end;gap:9px;margin-top:13px}
 .gw-sticky-editor .actions button{padding:9px 15px;background:#352f22;border:1px solid #927d4f;color:#f0dfb5;cursor:pointer}
 .gw-sticky-editor .actions button.primary{background:#65512d}
 .gw-sticky-inline{margin:10px 0 18px;max-width:100%}
 .gw-sticky-inline .gw-sticky{padding:11px;margin:6px 0 10px}
 .gw-sticky-inline .gw-sticky p{font-size:12px!important}
 .gw-sticky-inline .gw-sticky-trigger{padding:7px 10px!important;font-size:10px!important}
 `;
 document.head.appendChild(style);
}
function editor(kind,id,title){
 const k=key(kind,id),old=notes()[k]||'';
 const backdrop=document.createElement('div');backdrop.className='gw-sticky-dialog';backdrop.setAttribute('role','dialog');backdrop.setAttribute('aria-modal','true');backdrop.setAttribute('aria-label','Personal sticky note');
 backdrop.innerHTML='<div class="gw-sticky-editor"><h2>My sticky note</h2><p></p><textarea maxlength="'+MAX+'" placeholder="What does this mean to me? What do I think is going on?"></textarea><div class="actions"><button type="button" data-cancel>Cancel</button><button class="primary" type="button" data-save>Save note</button></div></div>';
 backdrop.querySelector('p').textContent='Your own words about '+title+'. Personal to this browser and character; not shared with the GM or added to canon.';
 const ta=backdrop.querySelector('textarea');ta.value=old;
 const close=()=>{backdrop.remove();document.removeEventListener('keydown',onKey)};
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close()}};
 backdrop.querySelector('[data-cancel]').onclick=close;
 backdrop.querySelector('[data-save]').onclick=()=>{const updated=notes(),value=ta.value.trim();if(value)updated[k]=value;else delete updated[k];if(store(updated)){close();updateNotes();}};
 backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
 document.addEventListener('keydown',onKey);document.body.appendChild(backdrop);ta.focus();
}
function makeArea(kind,id,title,compact=false){
 const el=document.createElement('section');el.className='gw-sticky-area'+(compact?' gw-sticky-inline':'');el.dataset.stickyKind=kind;el.dataset.stickyId=id;el.dataset.stickyTitle=title;
 return el;
}
function draw(el,data){
 const kind=el.dataset.stickyKind,id=el.dataset.stickyId,title=el.dataset.stickyTitle,k=key(kind,id),value=data[k]||'';
 const label=value?'Edit my sticky note':'+ Add my sticky note';
 el.innerHTML=(value?'<div class="gw-sticky"><small>✎ MY WORDS · PERSONAL NOTE</small><p>'+esc(value)+'</p><div class="gw-sticky-actions"><button type="button" data-edit>Edit</button><button type="button" data-delete>Remove note</button></div></div>':'<button type="button" class="gw-sticky-trigger" data-edit>'+label+'</button>');
 el.querySelector('[data-edit]').onclick=e=>{e.preventDefault();e.stopPropagation();editor(kind,id,title)};
 el.querySelector('[data-delete]')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!confirm('Remove your personal note about '+title+'?'))return;const n=notes();delete n[k];if(store(n))updateNotes()});
}
function updateNotes(){const data=notes();document.querySelectorAll('[data-sticky-kind]').forEach(el=>draw(el,data))}
function mount(){
 if(!person())return;
 ensureStyles();
 const path=location.hash||'';
 const match=path.match(/^#\/record\/(.+)$/);
 const article=document.getElementById('article');
 if(match&&article&&!article.classList.contains('hidden')&&article.querySelector('h1')){
  let id;try{id=decodeURIComponent(match[1])}catch{id=match[1]}
  let area=article.querySelector(':scope > .gw-sticky-area');
  if(!area){area=makeArea('record',id,document.querySelector('#article h1')?.textContent||id);article.querySelector('h1')?.insertAdjacentElement('afterend',area)}
  if(area.dataset.stickyId!==id){area.dataset.stickyId=id;area.dataset.stickyTitle=article.querySelector('h1')?.textContent||id}
  if(!area.hasChildNodes())draw(area,notes());
 }
 document.querySelectorAll('.player-mind-card-wrap[data-player-mind-wrap],.interest-thread[data-goal-id]').forEach(card=>{
  const goal=card.dataset.playerMindWrap||card.dataset.goalId;if(!goal)return;
  if(card.querySelector(':scope > .gw-sticky-area'))return;
  const title=card.querySelector('h3')?.textContent?.trim()||'this interest';
  const area=makeArea('interest',goal,title,true);card.appendChild(area);draw(area,notes());
 });
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()})}
new MutationObserver(mutations=>{
 if(!person())return;
 // Ignore changes made within sticky UI; avoid re-render loops.
 if(mutations.every(m=>m.target.nodeType===1&&m.target.closest?.('.gw-sticky-area,.gw-sticky-dialog')))return;
 schedule();
}).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',schedule);
window.addEventListener('greywake:player-ready',schedule);
document.addEventListener('DOMContentLoaded',schedule);
schedule();
})();

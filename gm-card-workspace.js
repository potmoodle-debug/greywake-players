/* Greywake GM RUN: personal, reversible card workspace. */
(()=>{
'use strict';
const KEY='greywake.gm.run.cards.v1';
const DEFAULTS=['Played session','Parked positions','Unresolved consequences','What is moving','Current scene','Keep boundaries visible','Record it. Keep playing.','People you may need at the table','One job per tool'];
const slug=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {order:Array.isArray(x.order)?x.order:[],hidden:Array.isArray(x.hidden)?x.hidden:[],notes:Array.isArray(x.notes)?x.notes:[]}}catch{return {order:[],hidden:[],notes:[]}}}
let state=read(),busy=false;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn('Greywake cards could not be saved',e)}};
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function runGrid(){return location.hash==='#/gm-session'&&!document.querySelector('#gmOperationsView.hidden')?document.querySelector('#gmOperationsView .gm-ops-grid'):null}
function idFor(el,i){return el.id==='gmCapturePanel'?'capture':slug(el.querySelector('h2')?.textContent||DEFAULTS[i]||'panel-'+i)}
function toolbar(){return '<div class="gm-card-workspace-controls"><span>SESSION CARDS <small>Drag handles to reorder. Saved on this browser.</small></span><div><button type="button" data-gm-add-card>+ Add card</button><button type="button" data-gm-restore-cards>Restore hidden</button><button type="button" data-gm-reset-cards>Reset layout</button></div></div>'}
function custom(note){const el=document.createElement('section');el.className='gm-panel gm-custom-card';el.dataset.gmCard='custom-'+note.id;el.innerHTML='<small>GM NOTE · LOCAL ONLY</small><h2></h2><p class="gm-card-note-text"></p><div class="gm-card-edit" hidden><label>Title<input maxlength="100" data-note-title></label><label>Notes<textarea rows="5" data-note-text></textarea></label><button type="button" data-note-save>Save card</button><button type="button" data-note-cancel>Cancel</button></div>';el.querySelector('h2').textContent=note.title||'New card';el.querySelector('.gm-card-note-text').textContent=note.text||'';return el}
function enhance(){
if(busy)return;
const grid=runGrid();if(!grid||grid.dataset.gmCardsReady==='yes')return;
busy=true;
try{
grid.dataset.gmCardsReady='yes';
const originals=[...grid.children].filter(e=>e.classList.contains('gm-panel'));
originals.forEach((el,i)=>el.dataset.gmCard=idFor(el,i));
state.notes.forEach(n=>grid.appendChild(custom(n)));
const cards=[...grid.querySelectorAll(':scope > .gm-panel[data-gm-card]')];
cards.forEach(el=>el.querySelector(':scope > .gm-card-tools')?.remove());
cards.forEach(el=>{
 const id=el.dataset.gmCard;
 const heading=el.querySelector('h2');
 const bar=document.createElement('div');bar.className='gm-card-tools';
 bar.innerHTML='<button type="button" class="gm-card-handle" draggable="true" aria-label="Drag to move this card" title="Drag to rearrange">⠿ <span>Move</span></button><button type="button" data-gm-card-left aria-label="Move card earlier" title="Move earlier">←</button><button type="button" data-gm-card-right aria-label="Move card later" title="Move later">→</button>'+(id.startsWith('custom-')?'<button type="button" data-note-edit>Edit</button><button type="button" data-note-delete>Delete</button>':'<button type="button" data-gm-card-hide>Hide</button>');
 el.prepend(bar);el.hidden=state.hidden.includes(id);
 if(heading&&id.startsWith('custom-'))heading.classList.add('gm-card-custom-title');
});
const ordered=cards.slice().sort((a,b)=>{const ai=state.order.indexOf(a.dataset.gmCard),bi=state.order.indexOf(b.dataset.gmCard);return (ai<0?9999:ai)-(bi<0?9999:bi)});
ordered.forEach(el=>grid.appendChild(el));
grid.insertAdjacentHTML('beforebegin',toolbar());
const controls=grid.previousElementSibling;
controls.addEventListener('click',event=>{
 if(event.target.closest('[data-gm-add-card]')){
  const note={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),title:'New card',text:''};state.notes.push(note);save();const el=custom(note);grid.appendChild(el);grid.dataset.gmCardsReady='';controls.remove();enhance();const next=grid.querySelector('[data-gm-card="custom-'+note.id+'"]');next?.querySelector('[data-note-edit]')?.click();next?.scrollIntoView({block:'center',behavior:'smooth'});
 }else if(event.target.closest('[data-gm-restore-cards]')){state.hidden=[];save();grid.querySelectorAll('[data-gm-card]').forEach(el=>el.hidden=false)}
 else if(event.target.closest('[data-gm-reset-cards]')){if(!confirm('Reset card order and restore hidden cards? Your custom note cards will be kept.'))return;state.order=[];state.hidden=[];save();grid.dataset.gmCardsReady='';controls.remove();enhance()}
});
let dragged=null;
grid.addEventListener('dragstart',e=>{const handle=e.target.closest('.gm-card-handle');if(!handle){e.preventDefault();return}dragged=handle.closest('[data-gm-card]');dragged.classList.add('gm-card-dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragged.dataset.gmCard)});
grid.addEventListener('dragover',e=>{if(!dragged)return;const target=e.target.closest(':scope > .gm-panel[data-gm-card]')||e.target.closest('.gm-panel[data-gm-card]');if(!target||target===dragged)return;e.preventDefault();const rect=target.getBoundingClientRect();grid.insertBefore(dragged,e.clientY<rect.top+rect.height/2?target:target.nextSibling)});
grid.addEventListener('drop',e=>{if(!dragged)return;e.preventDefault();state.order=[...grid.querySelectorAll(':scope > [data-gm-card]')].map(x=>x.dataset.gmCard);save()});
grid.addEventListener('dragend',()=>{dragged?.classList.remove('gm-card-dragging');dragged=null;state.order=[...grid.querySelectorAll(':scope > [data-gm-card]')].map(x=>x.dataset.gmCard);save()});
grid.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 const el=button.closest('[data-gm-card]');if(!el)return;
 const id=el.dataset.gmCard;const note=state.notes.find(n=>'custom-'+n.id===id);
 if(button.matches('[data-gm-card-hide]')){el.hidden=true;if(!state.hidden.includes(id))state.hidden.push(id);save()}
 if(button.matches('[data-gm-card-left],[data-gm-card-right]')){
  const siblings=[...grid.querySelectorAll(':scope > [data-gm-card]:not([hidden])')];const idx=siblings.indexOf(el);const other=siblings[idx+(button.hasAttribute('data-gm-card-left')?-1:1)];if(!other)return;
  if(button.hasAttribute('data-gm-card-left'))grid.insertBefore(el,other);else grid.insertBefore(other,el);
  state.order=[...grid.querySelectorAll(':scope > [data-gm-card]')].map(x=>x.dataset.gmCard);save();el.querySelector('.gm-card-handle')?.focus()
 }
 if(!note)return;
 const editor=el.querySelector('.gm-card-edit');
 if(button.matches('[data-note-edit]')){editor.hidden=false;el.querySelector('[data-note-title]').value=note.title;el.querySelector('[data-note-text]').value=note.text;el.querySelector('[data-note-title]').focus()}
 if(button.matches('[data-note-cancel]'))editor.hidden=true;
 if(button.matches('[data-note-save]')){note.title=el.querySelector('[data-note-title]').value.trim()||'Untitled';note.text=el.querySelector('[data-note-text]').value;el.querySelector('h2').textContent=note.title;el.querySelector('.gm-card-note-text').textContent=note.text;editor.hidden=true;save()}
 if(button.matches('[data-note-delete]')){if(!confirm('Delete this local note card?'))return;state.notes=state.notes.filter(n=>n!==note);state.order=state.order.filter(k=>k!==id);save();el.remove()}
});
}catch(e){console.error('GM card workspace',e)}finally{busy=false}
}
const observer=new MutationObserver(()=>{if(runGrid())enhance()});
observer.observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('DOMContentLoaded',enhance);
window.addEventListener('hashchange',()=>setTimeout(enhance,40));
setTimeout(enhance,250);
})();

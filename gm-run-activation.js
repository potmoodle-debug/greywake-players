(()=>{'use strict';
const gm=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.GreywakeRunCardDialog=function(seed={}){
 if(!gm()||document.getElementById('gwRunAddDialog'))return;
 const d=document.createElement('dialog');d.id='gwRunAddDialog';d.style.cssText='max-width:540px;width:90%;background:#191a14;color:#eee5cd;border:1px solid #8a7440;padding:20px';
 d.innerHTML='<form><h2>Add card to RUN</h2><p>Only enter information safe for the live scene. This does not reveal knowledge or write canon.</p><label>Card type <select name="kind"><option>clue</option><option>location</option><option>npc</option><option>hazard</option><option>adversary</option></select></label><p><label>Title <input name="title" required maxlength="120" style="width:100%"></label></p><p><label>Scene description <textarea name="detail" maxlength="800" rows="3" style="width:100%"></textarea></label></p><p data-ref><label>Optional artwork record <input name="record" maxlength="120" style="width:100%"></label></p><p data-slug hidden><label>Approved adversary <select name="adversary_slug"><option value="foldling">Foldling</option></select></label></p><p role="status"></p><button type="submit">Activate in RUN</button> <button type="button" data-cancel>Cancel</button></form>';
 const f=d.querySelector('form');for(const k of ['kind','title','detail','record','adversary_slug'])if(seed[k]&&f.elements[k])f.elements[k].value=seed[k];
 const change=()=>{const a=f.elements.kind.value==='adversary';d.querySelector('[data-slug]').hidden=!a;d.querySelector('[data-ref]').hidden=a;};f.elements.kind.addEventListener('change',change);change();
 d.querySelector('[data-cancel]').onclick=()=>d.close();d.addEventListener('close',()=>d.remove());
 f.addEventListener('submit',async e=>{e.preventDefault();const submit=f.querySelector('[type=submit]');submit.disabled=true;const status=f.querySelector('[role=status]');status.textContent='Activating…';try{await window.GreywakeActivateRunCard(Object.fromEntries(new FormData(f)));d.close()}catch(e){status.textContent=e.message;submit.disabled=false}});
 document.body.append(d);d.showModal();
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-prep-activate],[data-run-adversary]');if(!b||!gm())return;if(b.hasAttribute('data-run-adversary'))window.GreywakeRunCardDialog({kind:'adversary',title:b.dataset.name,adversary_slug:b.dataset.runAdversary});else window.GreywakeRunCardDialog({kind:'location',title:b.dataset.prepActivate});});
})();
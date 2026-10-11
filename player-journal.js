(() => {
  'use strict';
  const API='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/character-journal';
  const KEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const people=['velmira','odie','marek'];
  const categories=['Session','People','Places','Clues','To remember','Character thoughts','In my words'];
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  let root,status,notes=[],selected='velmira',sequence=0;
  const identity=()=>window.GreywakePlayer || null;
  const gm=()=>identity()?.role==='gm' && document.body.dataset.gmPreview!=='true';
  const slug=()=>gm()?selected:String(identity()?.character||'').toLowerCase();
  function report(msg,error=false){if(status){status.textContent=msg;status.dataset.error=String(error);}}
  async function request(method='GET',body=null){
    const user=identity();
    if(!user?.code||!user?.character)throw Error('Greywake player identity is unavailable.');
    const who=gm()?'gm':String(user.character).toLowerCase();
    const response=await fetch(API,{
      method,
      headers:{'Content-Type':'application/json','apikey':KEY,'x-greywake-character':who,'x-greywake-code':user.code,'x-greywake-view':slug()},
      body:body?JSON.stringify(body):undefined
    });
    const data=await response.json().catch(()=>null);
    if(!response.ok)throw Error(data?.error||'The journal is not currently available.');
    return data;
  }
  function shell(){
    const area=document.querySelector('#characterSheet .character-sheet-body');
    if(!area)return false;
    if(!root){root=document.createElement('section');root.id='greywakeJournal';root.className='greywake-journal';area.appendChild(root);}
    root.hidden=false;
    return true;
  }
  function show(){
    if(!root)return;
    const view=slug(),readonly=gm();
    root.innerHTML=`<p class="journal-status" role="status"></p><div class="journal-paper">
      <div class="journal-heading"><div><span class="journal-overline">${readonly?'GM READING ROOM':'PERSONAL FIELD NOTES'}</span><h3>${readonly?'Player journals':esc(view.charAt(0).toUpperCase()+view.slice(1))+'’s Journal'}</h3><p class="journal-note">${readonly?'Read-only player notes, not campaign canon.':'Visible to you and the GM, not other players. Your own words never change official rules or canon.'}</p></div></div>
      ${readonly?`<label class="journal-filter">Character <select id="journalCharacter">${people.map(p=>`<option value="${p}" ${p===view?'selected':''}>${p.charAt(0).toUpperCase()+p.slice(1)}</option>`).join('')}</select></label>`:''}
      ${readonly?'':`<form id="journalNew" class="journal-compose"><label>Heading<input name="title" maxlength="160" required placeholder="Something I want to remember"></label><label>Type<select name="category">${categories.map(c=>`<option>${c}</option>`).join('')}</select></label><label>Related spell, item or place (optional)<input name="related" maxlength="160" placeholder="e.g. Strange Patterns"></label><label>My notes<textarea name="body" rows="5" maxlength="20000" required placeholder="What happened? What do I think it means?"></textarea></label><button type="submit">Save entry</button></form>`}
      <div class="journal-list">${notes.length?notes.map(n=>`<article class="journal-entry"><div class="journal-entry-top"><span>${esc(n.category)} · ${new Date(n.updated_at).toLocaleDateString('en-GB')}</span>${readonly?'':`<button type="button" class="journal-quiet" data-edit="${esc(n.id)}">Edit</button><button type="button" class="journal-quiet" data-delete="${esc(n.id)}">Delete</button>`}</div><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p>${n.linked_entity_id?`<small>Related to: ${esc(n.linked_entity_id)}</small>`:''}</article>`).join(''):'<p class="journal-empty">No entries yet.</p>'}</div></div>`;
    status=root.querySelector('.journal-status');
    root.querySelector('#journalCharacter')?.addEventListener('change',e=>{selected=e.target.value;refresh();});
    root.querySelector('#journalNew')?.addEventListener('submit',async e=>{
      e.preventDefault();
      const f=e.target,button=f.querySelector('button[type=submit]');button.disabled=true;report('Saving entry…');
      const value=name=>f.elements.namedItem(name).value;
      try{await request('POST',{title:value('title'),body:value('body'),category:value('category'),linked_entity_id:value('related')});await refresh();report('Entry saved.');}
      catch(err){button.disabled=false;report(err.message,true);}
    });
    root.querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',async()=>{
      if(!confirm('Delete this journal entry?'))return;
      try{await request('DELETE',{id:button.dataset.delete});await refresh();}
      catch(err){report(err.message,true);}
    }));
    root.querySelectorAll('[data-edit]').forEach(button=>button.addEventListener('click',()=>{
      const entry=notes.find(n=>n.id===button.dataset.edit);
      const article=button.closest('.journal-entry');if(!entry||!article)return;
      article.innerHTML=`<form class="journal-compose"><label>Heading<input name="title" required maxlength="160" value="${esc(entry.title)}"></label><label>My notes<textarea name="body" required rows="6" maxlength="20000">${esc(entry.body)}</textarea></label><button type="submit">Save changes</button><button type="button" data-cancel>Cancel</button></form>`;
      article.querySelector('[data-cancel]').onclick=show;
      article.querySelector('form').onsubmit=async e=>{
        e.preventDefault();const f=e.target;report('Saving changes…');
        try{await request('PATCH',{id:entry.id,title:f.elements.namedItem('title').value,body:f.elements.namedItem('body').value});await refresh();report('Changes saved.');}
        catch(err){report(err.message,true);}
      };
    }));
  }
  async function refresh(){
    const n=++sequence;
    if(!shell())return;
    const view=slug();
    if(!people.includes(view)){root.innerHTML='<p class="journal-message">Select a character to see their journal.</p>';return;}
    try{const data=await request();if(n!==sequence)return;notes=data.notes||[];show();}
    catch(err){if(n!==sequence)return;notes=[];show();report('Journal unavailable: '+err.message,true);}
  }
  window.GreywakeJournal={render:refresh,hide(){if(root)root.hidden=true;}};
})();
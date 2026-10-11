(() => {
  'use strict';
  const URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co';
  const KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const characters = ['velmira','odie','marek'];
  const categories = ['Session','People','Places','Clues','To remember','Character thoughts'];
  let client, session, member, notes=[], selected='velmira', requestId=0;
  let root, status, subscription;
  const getClient = () => {
    if (!client && window.supabase?.createClient) client = window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return client;
  };
  const isGM = () => member?.character_slug === 'gm';
  const selectedSlug = () => member?.character_slug === 'gm' ? selected : member?.character_slug;
  const msg = (message, danger=false) => {
    if (status) {status.textContent=message;status.dataset.error=String(danger);}
  };
  async function membership() {
    const api=getClient();
    if (!api) throw new Error('Journal sign-in library failed to load.');
    const {data:{session:active},error}=await api.auth.getSession();
    if(error)throw error;
    session=active;
    member=null;
    if (!session)return;
    const result=await api.from('greywake_journal_members').select('character_slug').eq('user_id',session.user.id).maybeSingle();
    if(result.error)throw result.error;
    member=result.data;
    if(member?.character_slug!=='gm') selected=member?.character_slug||'velmira';
  }
  async function load() {
    if(!member)return;
    const id=++requestId, api=getClient();
    const slug=selectedSlug();
    let query=api.from('greywake_journal_notes').select('id,owner_user_id,character_slug,title,body,category,linked_entity_type,linked_entity_id,created_at,updated_at').order('updated_at',{ascending:false}).limit(200);
    if (slug)query=query.eq('character_slug',slug);
    const {data,error}=await query;
    if(id!==requestId)return;
    if(error)throw error;
    notes=data||[];
  }
  function form() {
    if(!root)return;
    const oldStatus=status;
    const paintStatus=()=>{ status=document.createElement('p');status.className='journal-status';status.setAttribute('role','status');root.prepend(status);if(oldStatus?.textContent)msg(oldStatus.textContent,oldStatus.dataset.error==='true'); };
    if(!getClient()) {
      root.innerHTML='<p class="journal-message">Journal sign-in is unavailable. No notes have been saved.</p>';paintStatus();return;
    }
    if(!session){
      root.innerHTML=`<div class="journal-paper"><h3>Your journal</h3><p class="journal-note">Your notes are visible to the GM, but not to other players. Sign in with your email to keep them secure across devices.</p><form id="journalSignIn"><label>Email address<input type="email" name="email" required autocomplete="email" placeholder="you@example.com"></label><button type="submit">Send sign-in code</button></form><form id="journalVerify" hidden><label>Code from your email<input name="code" required inputmode="numeric" autocomplete="one-time-code" placeholder="6-digit code"></label><button type="submit">Confirm code</button></form></div>`;
      paintStatus();
      root.querySelector('#journalSignIn').onsubmit=async e=>{e.preventDefault(); const email=e.target.elements.namedItem('email').value.trim(); msg('Sending sign-in code…'); const {error}=await getClient().auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(error)return msg(error.message,true); root.querySelector('#journalVerify').hidden=false;root.dataset.pendingEmail=email;msg('Check your email for the sign-in code.');};
      root.querySelector('#journalVerify').onsubmit=async e=>{e.preventDefault();msg('Verifying…');const {error}=await getClient().auth.verifyOtp({email:root.dataset.pendingEmail,token:e.target.elements.namedItem('code').value.trim(),type:'email'});if(error)return msg(error.message,true);await refresh();};
      return;
    }
    if(!member){
      root.innerHTML='<div class="journal-paper"><h3>Account not yet connected</h3><p class="journal-note">Your email is signed in, but the GM must assign this account to your character before journal notes can be opened. No notes are shared or saved until that is done.</p><button type="button" id="journalRefresh">Check access again</button><button type="button" id="journalSignOut">Sign out</button></div>';
      paintStatus();
      root.querySelector('#journalRefresh').onclick=refresh;
      root.querySelector('#journalSignOut').onclick=signOut;
      return;
    }
    const gm=isGM(), slug=selectedSlug();
    const sheetSlug=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
    if(!gm && sheetSlug!==slug){ root.innerHTML='<div class="journal-paper"><h3>Character mismatch</h3><p>This signed-in journal belongs to a different character. Sign out and ask the GM to check your account.</p><button type="button" id="journalSignOut">Sign out</button></div>';paintStatus();root.querySelector('#journalSignOut').onclick=signOut;return; }
    root.innerHTML=`<div class="journal-paper">
      <div class="journal-heading"><div><span class="journal-overline">${gm?'GM READING ROOM':'PERSONAL FIELD NOTES'}</span><h3>${gm?'Player journals':esc(slug.charAt(0).toUpperCase()+slug.slice(1))+'’s Journal'}</h3><p class="journal-note">${gm?'Read-only notes, kept by each player.':'Visible to you and the GM; hidden from other players. Your words do not change official rules or canon.'}</p></div><button id="journalSignOut" type="button" class="journal-quiet">Sign out</button></div>
      ${gm?`<label class="journal-filter">Character <select id="journalCharacter">${characters.map(c=>`<option value="${c}" ${slug===c?'selected':''}>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('')}</select></label>`:''}
      ${gm?'':`<form id="journalNew" class="journal-compose"><label>Heading<input name="title" maxlength="160" placeholder="Something I want to remember" required></label><label>Type<select name="category">${categories.map(c=>`<option>${c}</option>`).join('')}</select></label><label>My notes<textarea name="body" rows="5" maxlength="20000" placeholder="What happened? What do I think it means?" required></textarea></label><button type="submit">Save entry</button></form>`}
      <div class="journal-list">${notes.length?notes.map(n=>`<article class="journal-entry" data-id="${esc(n.id)}"><div class="journal-entry-top"><span>${esc(n.category||'Session')} · ${new Date(n.updated_at).toLocaleDateString('en-GB')}</span>${gm?'':`<button type="button" class="journal-quiet" data-edit="${esc(n.id)}">Edit</button><button type="button" class="journal-quiet" data-delete="${esc(n.id)}">Delete</button>`}</div><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p>${n.linked_entity_id?`<small>Related to: ${esc(n.linked_entity_id)}</small>`:''}</article>`).join(''):'<p class="journal-empty">No entries yet.</p>'}</div>
    </div>`;
    paintStatus();
    root.querySelector('#journalSignOut').onclick=signOut;
    root.querySelector('#journalCharacter')?.addEventListener('change',async e=>{selected=e.target.value;await refresh();});
    root.querySelector('#journalNew')?.addEventListener('submit',async e=>{
      e.preventDefault();const submit=e.target.querySelector('[type=submit]');submit.disabled=true;msg('Saving…');
      const entry={owner_user_id:session.user.id,character_slug:slug,title:e.target.elements.namedItem('title').value.trim(),body:e.target.elements.namedItem('body').value,category:e.target.elements.namedItem('category').value};
      const {error}=await getClient().from('greywake_journal_notes').insert(entry);
      if(error){submit.disabled=false;return msg('Save failed: '+error.message,true);}
      await refresh();msg('Entry saved.');
    });
    root.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Delete this journal entry?'))return;
      const {error}=await getClient().from('greywake_journal_notes').delete().eq('id',b.dataset.delete);
      if(error)return msg(error.message,true);
      await refresh();
    });
    root.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{
      const entry=notes.find(n=>n.id===b.dataset.edit), card=b.closest('.journal-entry');
      if(!entry||!card)return;
      card.innerHTML=`<form class="journal-compose"><label>Heading<input name="title" maxlength="160" required value="${esc(entry.title)}"></label><label>My notes<textarea name="body" rows="6" maxlength="20000" required>${esc(entry.body)}</textarea></label><button type="submit">Save changes</button><button type="button" data-cancel>Cancel</button></form>`;
      card.querySelector('[data-cancel]').onclick=()=>form();
      card.querySelector('form').onsubmit=async e=>{
        e.preventDefault();msg('Saving changes…');
        const {error}=await getClient().from('greywake_journal_notes').update({title:e.target.elements.namedItem('title').value,body:e.target.elements.namedItem('body').value,updated_at:new Date().toISOString()}).eq('id',entry.id);
        if(error)return msg('Update failed: '+error.message,true);
        await refresh();msg('Changes saved.');
      };
    });
  }
  async function signOut(){await getClient()?.auth.signOut();await refresh();}
  async function refresh(){try{await membership();await load();form();msg('');}catch(e){msg('Journal error: '+e.message,true);}}
  function render(){
    if(!root){
      const body=document.querySelector('#characterSheet .character-sheet-body');
      if(!body)return;
      root=document.createElement('section');root.id='greywakeJournal';root.className='greywake-journal';body.appendChild(root);
      status=document.createElement('p');status.className='journal-status';status.setAttribute('role','status');root.appendChild(status);
    }
    root.hidden=false;
    if(!subscription&&getClient())subscription=getClient().auth.onAuthStateChange(()=>{setTimeout(refresh,0);});
    refresh();
  }
  function hide(){if(root)root.hidden=true;}
  window.GreywakeJournal={render,hide};
})();
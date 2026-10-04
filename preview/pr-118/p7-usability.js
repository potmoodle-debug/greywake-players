(() => {
  const PARTY=['Marek','Velmira','Odie'];
  let equipmentWrapped=false;
  let initTimer=null;

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[ch]));
  const characterKey=()=>{const key=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return ['marek','velmira','odie'].includes(key)?key:null;};
  const isPreview=()=>document.body.dataset.gmPreview==='true';
  const storeKey=()=>`greywake:p7-utilities:${characterKey()||'unknown'}${isPreview()?':gmtest':''}`;
  const die=sides=>{if(window.crypto?.getRandomValues){const b=new Uint32Array(1);window.crypto.getRandomValues(b);return(b[0]%sides)+1;}return Math.floor(Math.random()*sides)+1;};

  function loadUtilityState(){
    try{const raw=JSON.parse(localStorage.getItem(storeKey())||'null');return{items:Array.isArray(raw?.items)?raw.items.map(v=>String(v).trim()).filter(Boolean).slice(0,40):[],conditions:Array.isArray(raw?.conditions)?raw.conditions.map(v=>String(v).trim()).filter(Boolean).slice(0,20):[]};}
    catch(_){return{items:[],conditions:[]};}
  }

  function saveUtilityState(next,reason='Character utility update'){
    try{localStorage.setItem(storeKey(),JSON.stringify(next));}catch(_){}
    renderUtilities(true);
    window.dispatchEvent(new CustomEvent('greywake:equipment-state-changed',{detail:{ok:true,reason}}));
  }

  function wrapEquipmentSync(){
    const api=window.GreywakeEquipment;if(!api||equipmentWrapped||api.__p7Wrapped)return;
    const originalGet=api.getState?.bind(api),originalImport=api.importState?.bind(api);if(!originalGet||!originalImport)return;
    api.getState=()=>({...originalGet(),p7Utilities:loadUtilityState()});
    api.importState=remote=>{originalImport(remote);if(remote?.p7Utilities){const next={items:Array.isArray(remote.p7Utilities.items)?remote.p7Utilities.items.map(String).filter(Boolean).slice(0,40):[],conditions:Array.isArray(remote.p7Utilities.conditions)?remote.p7Utilities.conditions.map(String).filter(Boolean).slice(0,20):[]};try{localStorage.setItem(storeKey(),JSON.stringify(next));}catch(_){}renderUtilities(true);}};
    api.__p7Wrapped=true;equipmentWrapped=true;
  }

  function ensureStyles(){
    if(document.getElementById('p7-utility-styles'))return;
    const style=document.createElement('style');style.id='p7-utility-styles';style.textContent=`
      .p7-utilities{margin:14px 0 18px;border:1px solid rgba(202,179,111,.36);background:linear-gradient(180deg,rgba(38,34,23,.92),rgba(17,17,13,.94));padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:14px;box-shadow:0 12px 28px rgba(0,0,0,.2)}
      .p7-utility-intro{grid-column:1/-1;display:flex;justify-content:space-between;gap:12px;align-items:end;border-bottom:1px solid rgba(202,179,111,.18);padding-bottom:11px}.p7-utility-intro span{font-size:9px;letter-spacing:.14em;color:#b9a66c;font-weight:800}.p7-utility-intro strong{display:block;color:#f0dfaa;font:20px Georgia,serif;margin-top:3px}.p7-utility-intro small{color:#928a74}
      .p7-utility-card{border:1px solid rgba(202,179,111,.22);background:rgba(14,14,11,.62);padding:14px}.p7-utility-card>span{font-size:9px;letter-spacing:.14em;color:#9d947b;font-weight:800}.p7-utility-card>strong{display:block;margin:4px 0 4px;color:#ead79e}.p7-utility-card>small{display:block;color:#8e8774;margin-bottom:10px;line-height:1.4}
      .p7-add-row{display:flex;gap:7px}.p7-add-row input{min-width:0;flex:1;background:#12120f;border:1px solid #665c40;color:#eee3bf;padding:10px}.p7-add-row button,.p7-remove{border:1px solid #8b7542;background:#2b2416;color:#f1d68b;padding:9px 11px;cursor:pointer;font-weight:800}.p7-list{display:grid;gap:7px;margin-top:10px}.p7-list-row{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid rgba(202,179,111,.18);background:#181711;padding-left:10px}.p7-list-row span{font-size:12px}.p7-remove{border-width:0 0 0 1px}.p7-empty{font-size:11px;color:#8e8774;padding:7px 0}
      .p7-fixed-qna{position:fixed;right:18px;bottom:18px;z-index:1200;border:1px solid #b2934e;background:#2e2616;color:#ffe3a0;box-shadow:0 10px 28px rgba(0,0,0,.45);padding:11px 15px;font:800 11px/1 inherit;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}.p7-fixed-qna:before{content:'?';display:inline-grid;place-items:center;width:20px;height:20px;border:1px solid currentColor;border-radius:50%;margin-right:7px}
      .p7-effect-dialog{border:1px solid #806d3f;background:#15140f;color:#e9dfc4;max-width:520px;width:min(92vw,520px);padding:0;box-shadow:0 30px 90px rgba(0,0,0,.65)}.p7-effect-dialog::backdrop{background:rgba(0,0,0,.72)}.p7-dialog-shell{padding:20px}.p7-dialog-head{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(202,179,111,.2);padding-bottom:13px}.p7-dialog-head span{font-size:9px;letter-spacing:.15em;color:#bda96e;font-weight:800}.p7-dialog-head h2{margin:4px 0 0;font:25px Georgia,serif;color:#f4e7c5}.p7-dialog-close{border:0;background:transparent;color:#c8b98e;font-size:24px;cursor:pointer}.p7-rule{margin:15px 0;padding:12px;border-left:3px solid #b49350;background:#1d1a12}.p7-rule strong{display:block;color:#f1d68b;margin-bottom:4px}.p7-cost{display:inline-block;padding:5px 8px;border:1px solid #8b7542;color:#e9cc7e;font-size:10px;font-weight:800}.p7-dialog-fields{display:grid;gap:10px;margin:14px 0}.p7-dialog-fields label{display:grid;gap:5px;font-size:11px;color:#aaa18a}.p7-dialog-fields select{background:#10100d;border:1px solid #665c40;color:#eee3bf;padding:10px}.p7-dialog-action{width:100%;border:1px solid #a78b49;background:#332817;color:#ffe091;padding:12px;font-weight:900;cursor:pointer}.p7-dialog-action:disabled{opacity:.55;cursor:default}.p7-big-result{margin-top:14px;border:1px solid #77633a;background:#11110d;padding:15px;text-align:center}.p7-big-result strong{display:block;font:25px Georgia,serif;color:#f1d68b}.p7-big-result span{display:block;margin-top:5px;font-size:12px;color:#d4c9a8}.p7-paid{display:block;margin:8px 0;color:#a9bf89;font-size:11px;font-weight:800}
      @media(max-width:760px){.p7-utilities{grid-template-columns:1fr}.p7-fixed-qna{right:10px;bottom:10px}.p7-utility-intro{display:block}.p7-utility-intro small{display:block;margin-top:6px}}
    `;document.head.appendChild(style);
  }

  function groupByTitle(title){return[...document.querySelectorAll('#characterSheet .sheet-group')].find(g=>g.querySelector('.sheet-group-head h3')?.textContent.trim()===title)||null;}
  function utilityCard(kind,title,state){const values=state[kind],noun=kind==='items'?'item':'condition';return `<section class="p7-utility-card" data-p7-kind="${kind}"><span>${kind==='items'?'INVENTORY CONTROLS':'CONDITIONS'}</span><strong>${esc(title)}</strong><small>${kind==='items'?'Add things picked up in play. Remove them when used, lost or handed over.':'Track temporary conditions here and remove them when they end.'}</small><div class="p7-add-row"><input type="text" maxlength="80" placeholder="Add ${noun}…" aria-label="Add ${noun}"><button type="button" data-p7-add>Add ${noun}</button></div><div class="p7-list">${values.length?values.map((value,index)=>`<div class="p7-list-row"><span>${esc(value)}</span><button class="p7-remove" type="button" data-p7-remove="${index}">Remove</button></div>`).join(''):`<div class="p7-empty">No custom ${noun}${noun==='item'?'s':''} currently recorded.</div>`}</div></section>`;}
  function bindUtilityCard(card){const kind=card.dataset.p7Kind,input=card.querySelector('input');const add=()=>{if(isPreview())return;const value=String(input?.value||'').trim();if(!value)return;const next=loadUtilityState();if(!next[kind].some(v=>v.toLowerCase()===value.toLowerCase()))next[kind].push(value);saveUtilityState(next,`Added ${kind==='items'?'inventory item':'condition'}: ${value}`);};card.querySelector('[data-p7-add]')?.addEventListener('click',add);input?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add();}});card.querySelectorAll('[data-p7-remove]').forEach(button=>button.addEventListener('click',()=>{if(isPreview())return;const next=loadUtilityState();next[kind].splice(Number(button.dataset.p7Remove),1);saveUtilityState(next,`Removed ${kind==='items'?'inventory item':'condition'}`);}));}

  function renderUtilities(force=false){
    const group=groupByTitle('Weapons, armor & inventory');if(!group||!characterKey())return false;
    ensureStyles();wrapEquipmentSync();let root=group.querySelector(':scope > .p7-utilities');if(root&&!force)return true;
    if(!root){root=document.createElement('section');root.className='p7-utilities';const manager=document.getElementById('equipmentManager');if(manager)manager.insertAdjacentElement('afterend',root);else group.querySelector('.sheet-group-head')?.insertAdjacentElement('afterend',root);}
    const state=loadUtilityState();root.innerHTML=`<div class="p7-utility-intro"><div><span>PLAYER MANAGED</span><strong>Inventory & Conditions</strong></div><small>These controls stay with your character.</small></div>${utilityCard('items','Add to inventory',state)}${utilityCard('conditions','Current conditions',state)}`;root.querySelectorAll('[data-p7-kind]').forEach(bindUtilityCard);if(isPreview())root.querySelectorAll('input,button').forEach(n=>n.disabled=true);return true;
  }

  function ensureQnaAccess(){document.getElementById('qnaQuickBtn')?.remove();let button=document.getElementById('p7FixedQna');if(button)return;button=document.createElement('button');button.id='p7FixedQna';button.className='p7-fixed-qna';button.type='button';button.textContent='Q&A';button.setAttribute('aria-label','Open Questions and replies');button.addEventListener('click',()=>{location.hash='#/inbox';});document.body.appendChild(button);}

  function ensureDialog(){let dialog=document.getElementById('p7EffectDialog');if(dialog)return dialog;dialog=document.createElement('dialog');dialog.id='p7EffectDialog';dialog.className='p7-effect-dialog';document.body.appendChild(dialog);dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});return dialog;}
  function showDialog(html){const dialog=ensureDialog();dialog.innerHTML=`<div class="p7-dialog-shell">${html}</div>`;dialog.querySelector('[data-p7-close]')?.addEventListener('click',()=>dialog.close());if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();else dialog.setAttribute('open','');return dialog;}
  function targetOptions(includeNone=false){return `${includeNone?'<option value="">Nobody</option>':''}${PARTY.map(n=>`<option value="${n}">${n}</option>`).join('')}`;}
  function applyMarekStress(amount){const api=window.GreywakeResources,state=api?.getState?.();if(!api||!state)return 0;const current=Number(state.stress||0),clear=Math.min(amount,current);if(clear>0){if(api.clearStress)api.clearStress(clear,'Clarity of Nature');else api.setResource?.('stress',current-clear,'Clarity of Nature');}return clear;}

  function openClarity(){
    const dialog=showDialog(`<div class="p7-dialog-head"><div><span>WARDEN OF RENEWAL · ONCE PER LONG REST</span><h2>Clarity of Nature</h2></div><button class="p7-dialog-close" type="button" data-p7-close>×</button></div><div class="p7-rule"><strong>No roll · clear 2 Stress total</strong><span>After a few minutes resting in Marek's natural space, distribute two points of Stress recovery between Marek and allies.</span></div><div class="p7-dialog-fields"><label>First Stress recovery<select data-clarity-one>${targetOptions()}</select></label><label>Second Stress recovery<select data-clarity-two>${targetOptions()}</select></label></div><button class="p7-dialog-action" type="button" data-clarity-apply>Apply Clarity of Nature</button><div data-clarity-result aria-live="polite"></div>`);
    dialog.querySelector('[data-clarity-apply]')?.addEventListener('click',e=>{const button=e.currentTarget;if(button.disabled)return;button.disabled=true;const names=[dialog.querySelector('[data-clarity-one]')?.value,dialog.querySelector('[data-clarity-two]')?.value].filter(Boolean);const counts={};names.forEach(n=>counts[n]=(counts[n]||0)+1);const lines=[];Object.entries(counts).forEach(([name,count])=>{if(name==='Marek'){const cleared=applyMarekStress(count);lines.push(`Marek clears ${cleared} Stress${cleared<count?' (only marked Stress can be cleared)':''}.`);}else lines.push(`${name} clears ${count} Stress on their sheet.`);});const host=dialog.querySelector('[data-clarity-result]');host.innerHTML=`<div class="p7-big-result"><strong>2 Stress distributed</strong><span>${esc(lines.join(' '))}</span></div>`;});
  }

  function openRegeneration(){
    const dialog=showDialog(`<div class="p7-dialog-head"><div><span>WARDEN OF RENEWAL</span><h2>Regeneration</h2></div><button class="p7-dialog-close" type="button" data-p7-close>×</button></div><div class="p7-rule"><strong>No Duality roll</strong><span>Choose who Marek touches. The 3 Hope cost is paid once, then the healing die is rolled.</span></div><span class="p7-cost">COST · 3 HOPE</span><div class="p7-dialog-fields"><label>Apply healing to<select data-regen-target>${targetOptions()}</select></label></div><button class="p7-dialog-action" type="button" data-regen-roll>Spend 3 Hope & roll 1d4</button><div data-regen-result aria-live="polite"></div>`);
    dialog.querySelector('[data-regen-roll]')?.addEventListener('click',e=>{const button=e.currentTarget;if(button.disabled)return;button.disabled=true;button.textContent='Resolving…';const result=dialog.querySelector('[data-regen-result]');const resources=window.GreywakeResources;const spend=resources?.spendHope?.(3,'Regeneration');if(spend?.ok===false){result.innerHTML=`<div class="p7-big-result"><strong>Not used</strong><span>${esc(spend.message||'Not enough Hope.')}</span></div>`;button.disabled=false;button.textContent='Spend 3 Hope & roll 1d4';return;}const roll=die(4),target=dialog.querySelector('[data-regen-target]')?.value||'Marek';let message;if(target==='Marek'&&resources?.getState&&resources?.setResource){const state=resources.getState(),marked=Number(state.hp||0),cleared=Math.min(roll,marked);resources.setResource('hp',Math.max(0,marked-cleared),`Regeneration · ${roll}`);message=`Marek clears ${cleared} marked HP.`;}else message=`${target} clears up to ${roll} marked HP on their sheet.`;button.textContent='Regeneration used';result.innerHTML=`<span class="p7-paid">✓ 3 Hope spent once</span><div class="p7-big-result"><strong>1d4 → ${roll}</strong><span>${esc(message)}</span></div>`;});
  }

  function actionTitle(button){return button?.querySelector('.active-action-copy strong')?.textContent?.trim()||'';}
  function openFormPicker(mode){(document.getElementById('chooseBeastform')||document.getElementById('changeBeastform'))?.click();setTimeout(()=>{const radio=document.querySelector(`#beastformActivationChoice input[value="${mode}"]`);if(radio){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}},40);}
  function handleActionClick(event){const button=event.target.closest?.('#activeActionsPanel .active-action-card');if(!button)return;const title=actionTitle(button);if(!['Beastform','Evolution','Regeneration','Clarity of Nature'].includes(title))return;event.preventDefault();event.stopImmediatePropagation();if(title==='Beastform'||title==='Evolution')openFormPicker(title==='Evolution'?'evolution':'stress');else if(title==='Regeneration')openRegeneration();else openClarity();}

  function init(){clearTimeout(initTimer);ensureStyles();ensureQnaAccess();wrapEquipmentSync();if(!renderUtilities())initTimer=setTimeout(init,180);}

  window.GreywakeP7={renderUtilities,loadUtilityState};
  document.addEventListener('click',handleActionClick,true);
  window.addEventListener('greywake:player-ready',()=>setTimeout(init,120));
  window.addEventListener('greywake:sheet-enhanced',()=>setTimeout(init,100));
  window.addEventListener('hashchange',()=>setTimeout(init,80));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,180));
})();
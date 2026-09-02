(() => {
  const PREFIX='greywake:nomadic-pack:v1:';
  const isVelmira=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase()==='velmira';
  const preview=()=>document.body.dataset.gmPreview==='true';
  const key=()=>`${PREFIX}velmira${preview()?':gmtest':''}`;
  const load=()=>{try{return{used:false,item:null,...JSON.parse(localStorage.getItem(key())||'null')}}catch(_){return{used:false,item:null}}};
  const save=s=>{try{localStorage.setItem(key(),JSON.stringify(s))}catch(_){}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  function carried(){return !window.GreywakeEquipment?.isItemRemoved?.('gear','Nomadic Pack');}
  function ensureDialog(){let d=document.getElementById('nomadicPackDialog');if(!d){d=document.createElement('dialog');d.id='nomadicPackDialog';d.className='equipment-dialog';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});}return d;}
  function addCustomItem(name){
    window.GreywakeBackpack?.open?.();
    setTimeout(()=>{
      const d=document.getElementById('p7BackpackDialog'),panel=d?.querySelector('[data-pack-add-panel]');if(!d||!panel)return;
      panel.classList.add('open');const input=panel.querySelector('input'),button=panel.querySelector('[data-pack-save]');if(!input||!button)return;input.value=name;button.click();
    },60);
  }
  function resetForNewSession(){save({used:false,item:null});refresh();const d=document.getElementById('nomadicPackDialog');if(d?.open)open();return{ok:true};}
  function open(){
    if(!isVelmira())return;const state=load(),d=ensureDialog(),has=carried();
    d.innerHTML=`<div class="equip-dialog-shell"><div class="equip-dialog-head"><div><span>WANDERBORNE · COMMUNITY FEATURE</span><h2>Nomadic Pack</h2><p>Once per session, spend 1 Hope to pull out a mundane item useful to the current situation. Work with the GM to agree what the item is.</p></div><button class="equip-dialog-close" type="button" data-close>×</button></div><div class="equip-contexts"><div class="equip-context" style="grid-column:1/-1"><strong>${!has?'Nomadic Pack is not currently carried.':state.used?`Used this session${state.item?` · ${esc(state.item)}`:''}`:'Available · costs 1 Hope'}</strong>${has&&!state.used?'<label style="display:block;margin:12px 0"><span>Mundane useful item</span><input data-nomadic-item type="text" maxlength="80" placeholder="Agree the item with the GM" style="width:100%;box-sizing:border-box;margin-top:6px"></label><button data-use-nomadic type="button">Spend 1 Hope · Take item</button>':''}${state.used?'<p>This feature does not reset on a rest.</p><button data-reset-nomadic type="button">Reset for new session</button>':''}</div></div><div data-nomadic-result></div></div>`;
    d.querySelector('[data-close]')?.addEventListener('click',()=>d.close());
    d.querySelector('[data-use-nomadic]')?.addEventListener('click',()=>{
      const name=String(d.querySelector('[data-nomadic-item]')?.value||'').trim(),host=d.querySelector('[data-nomadic-result]');if(!name){if(host)host.textContent='Agree and enter the mundane item first.';return;}
      const api=window.GreywakeCompanion,r=api?.getState?.();if(!api||!r){if(host)host.textContent='Live Hope track unavailable.';return;}const paid=api.spendHope?.(1,'Nomadic Pack');if(paid?.ok===false){if(host)host.textContent=paid.message||'Not enough Hope.';return;}
      save({used:true,item:name,at:Date.now()});addCustomItem(name);d.close();setTimeout(refresh,80);
    });
    d.querySelector('[data-reset-nomadic]')?.addEventListener('click',resetForNewSession);
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
  }
  function enhanceBackpack(){
    if(!isVelmira())return;
    const d=document.getElementById('p7BackpackDialog');if(!d)return;
    const card=[...d.querySelectorAll('.p7-pack-card')].find(x=>x.querySelector('h3')?.textContent.trim()==='Nomadic Pack');if(!card)return;
    let use=card.querySelector('[data-use-nomadic-backpack]');
    if(!use){
      use=document.createElement('button');use.type='button';use.dataset.useNomadicBackpack='true';use.className='p9-item-action';
      const remove=card.querySelector('button[data-p9-remove],button[data-remove-item],button');
      const host=remove?.parentElement||card.querySelector('.p7-pack-content')||card;
      host.insertBefore(use,remove||null);
      use.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();d.close?.();open();});
    }
    const state=load();use.textContent=state.used?'Used this session · Open':'Use Nomadic Pack';use.disabled=!carried();
  }
  function refresh(){
    if(!isVelmira())return;const state=load(),has=carried(),card=document.querySelector('#companionActionsPanel [data-companion-action="nomadic"]');
    if(card){card.disabled=!has;card.classList.toggle('equipment-action-disabled',!has);card.title=!has?'Nomadic Pack is not currently carried.':state.used?'Nomadic Pack has been used this session. Open it to reset at the start of a new session.':'';}
    const detail=[...document.querySelectorAll('#companionActionsPanel .active-action-detail')].find(x=>x.querySelector('h3')?.textContent.trim()==='Nomadic Pack');
    if(detail){
      const b=detail.querySelector('[data-use-action]');if(b){b.textContent=state.used?'Used this session':'Spend 1 Hope · Use Nomadic Pack';b.disabled=!has||state.used;}
      let reset=detail.querySelector('[data-reset-nomadic-session]');
      if(state.used&&has){if(!reset){reset=document.createElement('button');reset.type='button';reset.dataset.resetNomadicSession='true';reset.textContent='Reset for new session';reset.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();resetForNewSession();});(b?.parentElement||detail).appendChild(reset);}}
      else reset?.remove();
    }
    enhanceBackpack();
  }
  document.addEventListener('click',e=>{
    if(!isVelmira())return;
    const detail=e.target.closest?.('#companionActionsPanel .active-action-detail');if(e.target.closest?.('[data-use-action]')&&detail?.querySelector('h3')?.textContent.trim()==='Nomadic Pack'){e.preventDefault();e.stopImmediatePropagation();open();return;}
    if(e.target.closest?.('[data-companion-action="nomadic"]'))setTimeout(refresh,20);
    if(e.target.closest?.('#characterBackpackButton,#p7BackpackEntry .p7-backpack-button,[data-p11-backpack]'))setTimeout(enhanceBackpack,70);
  },true);
  window.addEventListener('greywake:equipment-state-changed',()=>setTimeout(refresh,40));window.addEventListener('greywake:player-ready',()=>setTimeout(refresh,80));window.addEventListener('greywake:sheet-enhanced',()=>setTimeout(refresh,80));window.addEventListener('hashchange',()=>setTimeout(refresh,80));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,100));else setTimeout(refresh,100);
  window.GreywakeNomadicPack={open,reset:resetForNewSession,getState:load,refresh};
})();

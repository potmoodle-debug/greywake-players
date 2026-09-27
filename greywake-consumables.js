(() => {
  const DATA=window.GREYWAKE_DATA||(window.GREYWAKE_DATA={});
  const CATS=window.GREYWAKE_CATEGORIES||(window.GREYWAKE_CATEGORIES={});
  const MEDIA=window.GREYWAKE_MEDIA||(window.GREYWAKE_MEDIA={});
  const EDGES=window.GREYWAKE_EDGES||(window.GREYWAKE_EDGES=[]);

  DATA['Minor Stamina Potion']={
    title:'Minor Stamina Potion',
    category:'Equipment',
    html:'<p class="weapon-kicker">GREYWAKE RESTORATIVE · CONSUMABLE</p>'+
      '<p>A squat, repeatedly reused pale ceramic medicine bottle, sealed with waxed cloth and cord. The tonic inside is cloudy amber-brown, with dark sediment that settles when the vial has been standing.</p>'+
      '<div class="weapon-statline" role="list" aria-label="Potion statistics">'+
        '<span role="listitem"><small>TYPE</small><strong>Consumable</strong></span>'+
        '<span role="listitem"><small>EFFECT</small><strong>Clear 1d4 Stress</strong></span>'+
        '<span role="listitem"><small>FORM</small><strong>Amber tonic</strong></span>'+
        '<span role="listitem"><small>CONTAINER</small><strong>Reusable ceramic vial</strong></span>'+
      '</div>'+
      '<section class="weapon-feature"><small>GREYWAKE USE</small><h2>Made to be carried, returned and refilled</h2><p>It smells of bitter roots, hot resin and something medicinal. The bottle is valuable enough to wash and reuse; scratches, stains and rubbed markings are normal rather than defects.</p></section>'+
      '<section class="weapon-use"><small>LIVE SHEET EFFECT</small><p>Drink the potion to clear 1d4 Stress. The live character sheet rolls the d4 and only consumes the potion when there is marked Stress to clear.</p></section>'+
      '<div class="weapon-acquire" data-greywake-potion-acquire></div>'
  };

  MEDIA['Minor Stamina Potion']=[{src:'assets/consumables/minor-stamina-potion.webp',caption:'Minor Stamina Potion — a reused Greywake ceramic medicine vial.',layout:'reference'}];
  const equipment=CATS['Equipment']||(CATS['Equipment']=[]);
  if(!equipment.includes('Minor Stamina Potion'))equipment.push('Minor Stamina Potion');

  const safe=v=>String(v??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[ch]));
  function current(){const h=location.hash||'';return h.includes('/record/')?decodeURIComponent(h.split('/record/')[1]||''):'';}
  function refreshAcquire(){
    if(current()!=='Minor Stamina Potion')return;
    const host=document.querySelector('#article [data-greywake-potion-acquire]');if(!host)return;
    const api=window.GreywakeEquipment,role=window.GreywakePlayer?.role||document.body.dataset.role;
    if(role==='gm'&&document.body.dataset.gmPreview!=='true'){host.innerHTML='<div class="weapon-acquire-note">PLAYER INVENTORY CARD · switch to a player preview to test adding this potion.</div>';return;}
    if(!api){host.innerHTML='<button type="button" class="weapon-add-button" disabled>Inventory loading…</button>';return;}
    const state=api.getState?.()||{},count=Number(state.consumables?.['minor-stamina']||0),full=count>=5;
    const note=(count?count+'/5 currently carried. ':'')+(full?'Use or remove one before adding another.':'Adds one live Minor Stamina Potion to this character.');
    host.innerHTML='<button type="button" class="weapon-add-button '+(count?'is-owned':'')+'" data-add-greywake-potion '+(full?'disabled':'')+'>'+(full?'Maximum carried':'＋ Add to Backpack')+'</button><small>'+note+'</small>';
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest?.('[data-add-greywake-potion]');if(!b)return;
    const api=window.GreywakeEquipment;if(!api)return;
    b.parentElement?.querySelector('.weapon-add-error')?.remove();
    const result=api.adjustConsumable?.('minor-stamina',1);
    if(result?.ok===false)b.insertAdjacentHTML('afterend','<small class="weapon-add-error">'+safe(result.message||'Could not add potion.')+'</small>');
    refreshAcquire();window.GreywakeBackpack?.refresh?.();
  });
  window.addEventListener('hashchange',()=>setTimeout(refreshAcquire,80));
  window.addEventListener('greywake:equipment-state-changed',()=>setTimeout(refreshAcquire,0));
  window.addEventListener('greywake:player-ready',()=>setTimeout(refreshAcquire,100));
  setTimeout(refreshAcquire,150);

  const link=(a,b)=>{if(DATA[a]&&DATA[b]&&!EDGES.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a)))EDGES.push([a,b])};
  link('Minor Stamina Potion','Greywake');
})();
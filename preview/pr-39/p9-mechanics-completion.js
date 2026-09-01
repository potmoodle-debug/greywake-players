(() => {
  const character=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const preview=()=>document.body.dataset.gmPreview==='true';
  const equipment=()=>window.GreywakeEquipment||null;
  const resources=()=>character()==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const backpack=()=>document.getElementById('p7BackpackDialog');
  const die=sides=>{if(window.crypto?.getRandomValues){const b=new Uint32Array(1);window.crypto.getRandomValues(b);return(b[0]%sides)+1;}return Math.floor(Math.random()*sides)+1;};
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  const readNumber=text=>{const m=String(text||'').match(/[+−-]?\d+/);return m?Number(m[0].replace('−','-')):0;};

  const PERSONAL_GEAR={
    marek:[['Small Bag of Rocks and Bones','Personal carried gear']],
    velmira:[['Nomadic Pack','Wanderborne community gear · once per session feature'],['Book being translated','Personal carried item'],['Leather Satchel','Personal carried gear']],
    odie:[['Grappling Hook','Carried gear'],['Salvage-built Prosthetic Arm','Personal equipment'],['Oldwork Finger · separate and unfitted','Personal carried item']]
  };
  const CANONICAL_ACTIONS={
    marek:{shortstaff:'sheet-shortstaff','round-shield':'sheet-round-shield'},
    velmira:{greatstaff:'greatstaff',whip:'whip'},
    odie:{spear:'spear','small-dagger':'dagger'}
  };

  function visibleTitles(){return[...(backpack()?.querySelectorAll('.p7-pack-card h3')||[])].map(n=>n.textContent.trim());}
  function showLibraryStatus(message){const d=backpack();if(!d||!message)return;let n=d.querySelector('.p9-library-status');if(!n){n=document.createElement('div');n.className='p9-library-status';(d.querySelector('.p9-library')||d.querySelector('.p7-backpack-body'))?.appendChild(n);}n.textContent=message;}
  function rerenderBackpack(message=''){window.GreywakeBackpack?.render?.();window.GreywakeEquipmentLibrary?.enhance?.();setTimeout(()=>{enhanceLibrary();window.GreywakeInventoryConsolidation?.refresh?.();if(message)showLibraryStatus(message);},40);}

  function openCustomPanel(){
    const d=backpack(),panel=d?.querySelector('[data-pack-add-panel]');if(!panel)return;
    panel.classList.add('open');panel.querySelector('input')?.focus();
    const library=d.querySelector('.p9-library');if(library)library.hidden=false;
  }
  function injectCustomButton(panel){
    const filters=panel?.querySelector('.p9-library-filters');if(!filters||filters.querySelector('[data-p9-custom-item]'))return;
    const b=document.createElement('button');b.type='button';b.dataset.p9CustomItem='true';b.textContent='Other / custom item';b.addEventListener('click',openCustomPanel);filters.appendChild(b);
  }
  function injectPersonalGear(panel){
    if(!panel)return;const filter=panel.dataset.filter||'all';if(!['all','gear'].includes(filter))return;
    const q=String(panel.querySelector('.p9-library-search')?.value||'').trim().toLowerCase(),grid=panel.querySelector('.p9-library-grid'),api=equipment();if(!grid||!api)return;
    const existing=new Set([...grid.querySelectorAll('.p9-library-item strong')].map(n=>n.textContent.trim()));
    (PERSONAL_GEAR[character()]||[]).forEach(([name,effect],index)=>{
      if(existing.has(name)||q&&!`${name} gear ${effect}`.toLowerCase().includes(q))return;
      const removed=Boolean(api.isItemRemoved?.('gear',name)),carried=!removed&&visibleTitles().includes(name);
      const item=document.createElement('div');item.className='p9-library-item';item.dataset.p9PersonalGear=String(index);
      item.innerHTML=`<div><span>gear · known personal</span><strong>${esc(name)}</strong><small>${esc(effect)}</small></div><button type="button" ${carried?'disabled':''}>${carried?'Carried':removed?'Add back':'Add'}</button>`;
      item.querySelector('button')?.addEventListener('click',()=>{
        if(preview())return;
        if(removed){const r=api.restoreGear?.(name);rerenderBackpack(r?.message||`${name} added back.`);return;}
        openCustomPanel();const input=backpack()?.querySelector('[data-pack-add-panel] input');if(input)input.value=name;
      });
      grid.appendChild(item);
    });
  }
  function enhanceLibrary(){const panel=backpack()?.querySelector('.p9-library');if(!panel)return;injectCustomButton(panel);injectPersonalGear(panel);}

  function routeCanonicalWeapon(id){
    const map=CANONICAL_ACTIONS[character()]||{},actionId=map[id];if(!actionId)return false;
    let button=null;
    if(character()==='marek')button=document.querySelector(`#activeActionsPanel [data-active-action="${CSS.escape(actionId)}"]`);
    else button=document.querySelector(`#companionActionsPanel [data-companion-action="${CSS.escape(actionId)}"]`);
    if(!button)return false;
    backpack()?.close?.();button.click();setTimeout(()=>document.querySelector('#activeActionsPanel .active-action-detail,#companionActionsPanel .active-action-detail')?.scrollIntoView({behavior:'smooth',block:'center'}),60);return true;
  }

  function traitValue(name){const card=[...document.querySelectorAll('#characterSheet .sheet-grid.traits .sheet-card')].find(c=>c.querySelector('h4')?.textContent.trim()===name);return readNumber(card?.querySelector('.sheet-value')?.textContent);}
  function proficiency(){const stat=[...document.querySelectorAll('#characterSheet .character-stat')].find(n=>n.querySelector('span')?.textContent.trim().toLowerCase()==='proficiency');return Math.max(1,readNumber(stat?.querySelector('strong')?.textContent)||1);}
  function experiences(){const group=[...document.querySelectorAll('#characterSheet .sheet-group')].find(g=>g.querySelector('.sheet-group-head h3')?.textContent.trim()==='Experiences');if(!group)return[];return[...group.querySelectorAll('.sheet-card')].map(card=>({name:card.querySelector('h4')?.textContent.trim()||'Experience',bonus:readNumber(card.querySelector('.sheet-value')?.textContent)})).filter(x=>x.bonus);}
  function parseDamage(text){const m=String(text||'').match(/d(\d+)([+-]\d+)?/i);return m?{sides:Number(m[1]),mod:Number(m[2]||0)}:null;}
  function dynamicDialog(){let d=document.getElementById('p9DynamicWeaponDialog');if(!d){d=document.createElement('dialog');d.id='p9DynamicWeaponDialog';d.className='equipment-dialog';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});}return d;}
  function experienceMarkup(){const list=experiences();if(!list.length)return'';return`<fieldset class="action-roll-experiences"><legend>Experiences <small>${character()==='velmira'?'Hope or Adept Stress':'1 Hope each'}</small></legend>${list.map((x,i)=>`<label><input type="checkbox" data-p9-exp="${i}" data-bonus="${x.bonus}"><span><b>${esc(x.name)}</b><small>+${x.bonus}</small></span></label>`).join('')}</fieldset>`;}

  function openDynamicWeapon(id){
    const api=equipment(),w=api?.weapon?.(id),state=api?.getState?.();if(!w||!state||!api.isEquipped?.(id))return;
    if(routeCanonicalWeapon(id))return;
    const d=dynamicDialog(),trait=traitValue(w.trait),prof=proficiency(),isWhip=id==='whip';
    d.innerHTML=`<div class="equip-dialog-shell"><div class="equip-dialog-head"><div><span>ACTIVE WEAPON</span><h2>${esc(w.name)}</h2><p>${esc(w.trait)} ${trait>=0?'+':''}${trait} · ${esc(w.range)} · ${prof}${esc(w.damage)} ${esc(w.damageType)}</p></div><button class="equip-dialog-close" type="button" data-close>×</button></div><div class="equip-contexts"><div class="equip-context" style="grid-column:1/-1"><strong>${esc(w.feature||'—')}</strong>${experienceMarkup()}${character()==='velmira'?'<label style="display:block;margin:10px 0">Experience payment <select data-p9-exp-payment><option value="hope">Spend Hope</option><option value="adept">Adept · mark Stress and double Experience</option></select></label>':''}<div class="action-roll-fields"><label><span>Roll mode</span><select data-p9-mode><option value="normal">Normal</option><option value="advantage">Advantage +d6</option><option value="disadvantage">Disadvantage −d6</option></select></label><label><span>Other modifier</span><input data-p9-mod type="number" min="-20" max="20" value="0"></label><label><span>Difficulty (optional)</span><input data-p9-difficulty type="number" min="1" max="40" placeholder="GM target"></label></div><button type="button" data-p9-roll-weapon>Roll Attack</button>${isWhip?'<button type="button" data-p9-startling style="margin-left:8px">Startling · Mark 1 Stress</button>':''}<div data-p9-weapon-result style="margin-top:12px"></div></div></div></div>`;
    d.querySelector('[data-close]')?.addEventListener('click',()=>d.close());
    d.querySelector('[data-p9-roll-weapon]')?.addEventListener('click',()=>performDynamicRoll(d,id,false));
    d.querySelector('[data-p9-startling]')?.addEventListener('click',()=>{const r=resources()?.markStress?.(1,{reason:'Whip · Startling',cost:true});const host=d.querySelector('[data-p9-weapon-result]');if(host)host.innerHTML=r?.ok===false?`<b>Startling unavailable</b><br><small>${esc(r.message||'No free Stress slot.')}</small>`:'<b>Startling used</b><br><small>Marked 1 Stress. Force all adversaries within Melee range back to Close range.</small>';});
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
  }

  function payExperiences(d,reroll=false){
    const checked=[...d.querySelectorAll('[data-p9-exp]:checked')],count=checked.length,api=resources(),mode=character()==='velmira'?(d.querySelector('[data-p9-exp-payment]')?.value||'hope'):'hope';
    const raw=checked.reduce((s,n)=>s+Number(n.dataset.bonus||0),0),bonus=raw*(mode==='adept'?2:1);
    if(reroll||!count)return{ok:true,count,bonus,mode};
    const paid=mode==='adept'?api?.markStress?.(count,{reason:'Adept Experience use',cost:true}):api?.spendHope?.(count,'Experience use');
    return paid?.ok===false?{ok:false,message:paid.message}:{ok:true,count,bonus,mode};
  }
  function performDynamicRoll(d,id,reroll=false){
    const api=equipment(),w=api?.weapon?.(id),res=resources();if(!w||!res)return;
    const exp=payExperiences(d,reroll);const host=d.querySelector('[data-p9-weapon-result]');if(!exp.ok){if(host)host.innerHTML=`<b>ROLL NOT MADE</b><br><small>${esc(exp.message||'Required resource unavailable.')}</small>`;return;}
    const trait=traitValue(w.trait),hope=die(12),fear=die(12),critical=hope===fear,axis=critical||hope>fear?'Hope':'Fear',mode=d.querySelector('[data-p9-mode]')?.value||'normal',advDie=mode==='normal'?0:die(6),adv=mode==='advantage'?advDie:mode==='disadvantage'?-advDie:0,other=clamp(d.querySelector('[data-p9-mod]')?.value||0,-20,20),diffRaw=d.querySelector('[data-p9-difficulty]')?.value,diff=diffRaw?clamp(diffRaw,1,40):null,total=hope+fear+trait+exp.bonus+adv+other,success=critical?true:diff==null?null:total>=diff;
    if(critical){res.gainHope?.(1,'Critical success');res.clearStress?.(1,'Critical success');}else if(axis==='Hope')res.gainHope?.(1,'Roll with Hope');
    const state=res.getState?.()||{},pattern=character()==='velmira'&&state.effects?.strangePatternChosen&&(hope===state.strangePattern||fear===state.strangePattern),adapt=success===false&&exp.count>0;
    const headline=critical?'CRITICAL SUCCESS':success==null?`${total} WITH ${axis.toUpperCase()}`:`${success?'SUCCESS':'FAILURE'} WITH ${axis.toUpperCase()}`;
    if(host)host.innerHTML=`<div class="duality-result ${critical?'critical':axis.toLowerCase()}"><div class="duality-dice"><div class="hope-die"><span>HOPE</span><b>${hope}</b></div><div class="fear-die"><span>FEAR</span><b>${fear}</b></div></div><div class="duality-outcome"><span>${esc(w.name)}</span><strong>${headline}</strong><b>Total ${total}${diff?` / Difficulty ${diff}`:''}</b><small>${critical?'Gain 1 Hope · clear 1 Stress':axis==='Hope'?'Gain 1 Hope':'GM gains 1 Fear'}</small></div>${pattern?`<div class="companion-pattern-trigger"><strong>Strange Patterns · ${state.strangePattern}</strong><button type="button" data-p9-pattern-hope>Gain 1 Hope</button><button type="button" data-p9-pattern-stress>Clear 1 Stress</button></div>`:''}${adapt?'<button type="button" data-p9-adapt>Adaptability · mark 1 Stress and reroll</button>':''}${success===false?'':damageControls(id,w,critical)}</div>`;
    host?.querySelector('[data-p9-pattern-hope]')?.addEventListener('click',e=>{res.gainHope?.(1,'Strange Patterns');e.currentTarget.parentElement.remove();});
    host?.querySelector('[data-p9-pattern-stress]')?.addEventListener('click',e=>{res.clearStress?.(1,'Strange Patterns');e.currentTarget.parentElement.remove();});
    host?.querySelector('[data-p9-adapt]')?.addEventListener('click',()=>{const paid=res.markStress?.(1,{reason:'Adaptability reroll',cost:true});if(paid?.ok!==false)performDynamicRoll(d,id,true);});
    host?.querySelector('[data-p9-roll-damage]')?.addEventListener('click',()=>rollDynamicDamage(host,id,w,critical));
  }
  function damageControls(id,w,critical){
    const state=equipment()?.getState?.()||{},paired=state.activePrimary===id&&state.activeSecondary==='small-dagger',sneak=character()==='odie';
    return`<div class="damage-roll-controls companion-damage"><button type="button" data-p9-roll-damage>${critical?'Roll Critical Damage':'Roll Damage'}</button><span>${proficiency()}${esc(w.damage)} ${esc(w.damageType)}</span>${paired?'<label><input type="checkbox" data-p9-paired> Small Dagger Paired +2 · target within Melee</label>':''}${sneak?'<label><input type="checkbox" data-p9-sneak> Sneak Attack +1d6</label>':''}</div><div data-p9-damage-result></div>`;
  }
  function rollDynamicDamage(result,id,w,critical){
    const dmg=parseDamage(w.damage),prof=proficiency();if(!dmg)return;
    let rolls=[],kept=[];const powerful=/^Powerful:/i.test(String(w.feature||''));
    if(powerful){rolls=Array.from({length:prof+1},()=>die(dmg.sides));kept=[...rolls].sort((a,b)=>b-a).slice(0,prof);}else{rolls=Array.from({length:prof},()=>die(dmg.sides));kept=[...rolls];}
    let total=kept.reduce((a,b)=>a+b,0)+dmg.mod,notes=[];
    if(result.querySelector('[data-p9-paired]')?.checked){total+=2;notes.push('Paired +2');}
    if(result.querySelector('[data-p9-sneak]')?.checked){const r=die(6);total+=r;notes.push(`Sneak d6 ${r}`);}
    const crit=critical?prof*dmg.sides:0;total+=crit;
    const host=result.querySelector('[data-p9-damage-result]');if(host)host.innerHTML=`<div class="damage-roll-result ${critical?'critical':''}"><div><span>${critical?'CRITICAL DAMAGE':'DAMAGE'}</span><strong>${total}</strong><small>${esc(w.damageType)}</small></div><p>${powerful?`Powerful rolls ${rolls.join(' / ')}, discard ${Math.min(...rolls)}`:rolls.map(r=>`d${dmg.sides}: ${r}`).join(' · ')}${dmg.mod?` · ${dmg.mod>0?'+':''}${dmg.mod}`:''}${crit?` · critical +${crit}`:''}${notes.length?` · ${notes.join(' · ')}`:''}</p></div>`;
  }

  function extendEquipment(){const api=equipment();if(!api||api.__p9MechanicsComplete)return false;api.openWeaponUse=openDynamicWeapon;api.__p9MechanicsComplete=true;return true;}
  function applyNomadicPackAvailability(){if(character()!=='velmira')return;const removed=Boolean(equipment()?.isItemRemoved?.('gear','Nomadic Pack'));const card=document.querySelector('#companionActionsPanel [data-companion-action="nomadic"]');if(card){card.disabled=removed;card.classList.toggle('equipment-action-disabled',removed);card.title=removed?'Nomadic Pack is not currently carried.':'';}}
  function enhance(){extendEquipment();enhanceLibrary();applyNomadicPackAvailability();}
  const schedule=()=>setTimeout(enhance,60);

  document.addEventListener('click',e=>{
    const gear=e.target.closest?.('[data-p9-add^="gear:"]');
    if(gear){const card=gear.closest('.p9-library-item'),name=card?.querySelector('strong')?.textContent.trim(),api=equipment();if(name&&api?.isItemRemoved?.('gear',name)){e.preventDefault();e.stopImmediatePropagation();const r=api.restoreGear?.(name);rerenderBackpack(r?.message||`${name} added back.`);return;}}
    if(e.target.closest?.('[data-pack-add-open],[data-filter],#characterBackpackButton,#p7BackpackEntry .p7-backpack-button'))schedule();
  },true);
  document.addEventListener('input',e=>{if(e.target.closest?.('.p9-library-search'))setTimeout(enhanceLibrary,0);},true);
  window.addEventListener('greywake:equipment-state-changed',schedule);window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);window.addEventListener('hashchange',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  window.GreywakeP9Mechanics={enhance,openWeaponUse:openDynamicWeapon};
})();
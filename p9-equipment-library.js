(() => {
  const GEAR={
    marek:[{id:'torch',name:'Torch',type:'gear',effect:'Ordinary carried gear'},{id:'rope-50',name:'50 ft Rope',type:'gear',effect:'Ordinary carried gear'},{id:'basic-supplies',name:'Basic Supplies',type:'gear',effect:'Ordinary carried gear'}],
    velmira:[{id:'torch',name:'Torch',type:'gear',effect:'Ordinary carried gear'},{id:'rope-50',name:'50 ft Rope',type:'gear',effect:'Ordinary carried gear'},{id:'basic-supplies',name:'Basic Supplies',type:'gear',effect:'Ordinary carried gear'}],
    odie:[{id:'torch',name:'Torch',type:'gear',effect:'Ordinary carried gear'},{id:'rope-50',name:'50 ft Rope',type:'gear',effect:'Ordinary carried gear'},{id:'basic-supplies',name:'Basic Supplies',type:'gear',effect:'Ordinary carried gear'}]
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const character=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const preview=()=>document.body.dataset.gmPreview==='true';
  const equipment=()=>window.GreywakeEquipment||null;
  const backpackDialog=()=>document.getElementById('p7BackpackDialog');
  const visibleTitles=()=>[...(backpackDialog()?.querySelectorAll('.p7-pack-card h3')||[])].map(x=>x.textContent.trim().toLowerCase());

  function ensureStyles(){if(document.getElementById('p9-equipment-library-styles'))return;const s=document.createElement('style');s.id='p9-equipment-library-styles';s.textContent=`
    .p9-library{margin:0 0 16px;padding:14px;border:1px solid rgba(205,187,121,.3);background:#15140f}.p9-library[hidden]{display:none}.p9-library-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-bottom:12px}.p9-library-head strong{display:block;font:20px Georgia,serif;color:#f0e2bd}.p9-library-head small{color:#9e967f}.p9-library-search{width:100%;box-sizing:border-box;background:#0e0e0b;border:1px solid #62583b;color:#eee1bd;padding:10px 11px;margin-bottom:10px}.p9-library-filters{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.p9-library-filters button{border:1px solid #5b5239;background:#1b1912;color:#b9ad8c;padding:7px 9px;cursor:pointer}.p9-library-filters button.active{border-color:#9a7f43;color:#ffe29b;background:#302616}.p9-library-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.p9-library-item{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 11px;border:1px solid #4f4935;background:#1b1912}.p9-library-item span{display:block;font-size:8px;letter-spacing:.13em;text-transform:uppercase;color:#b8a66f}.p9-library-item strong{display:block;margin:3px 0;color:#eee1bd}.p9-library-item small{display:block;color:#938c79;line-height:1.35}.p9-library-item button,.p9-item-action{border:1px solid #8e7640;background:#322716;color:#ffe29b;padding:8px 10px;font-weight:800;cursor:pointer}.p9-library-item button:disabled{opacity:.45;cursor:default}.p9-card-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.p9-card-actions .p9-item-action{flex:1}.p9-library-note{margin:10px 0 0;color:#817a68;font-size:9px}.p9-library-status{margin-top:9px;color:#d8c582;font-size:10px;line-height:1.4}@media(max-width:620px){.p9-library-grid{grid-template-columns:1fr}.p9-library-head{display:block}}
  `;document.head.appendChild(s);}

  function customAdd(name){const d=backpackDialog();if(!d)return false;const open=d.querySelector('[data-pack-add-open]'),panel=d.querySelector('[data-pack-add-panel]');if(panel&&!panel.classList.contains('open'))open?.click();const input=d.querySelector('[data-pack-add-panel] input'),save=d.querySelector('[data-pack-save]');if(!input||!save)return false;input.value=name;save.click();return true;}
  function consumableItems(){const c=equipment()?.consumables?.()||{};return Object.entries(c).map(([id,item])=>({id,name:item.name,type:'consumable',effect:item.effect,automated:true}));}
  function weaponItems(){return (equipment()?.catalog?.()||[]).map(w=>({id:w.id,name:w.name,type:'weapon',effect:`${w.trait} · ${w.range} · ${w.damage} ${w.damageType}${w.feature&&w.feature!=='—'?` · ${w.feature}`:''}`,automated:true}));}
  function items(){return [...weaponItems(),...consumableItems(),...(GEAR[character()]||[])];}
  function isCarried(item){const api=equipment(),s=api?.getState?.();if(item.type==='weapon')return Boolean(api?.isOwned?.(item.id));if(item.type==='consumable')return Number(s?.consumables?.[item.id]||0)>0;return visibleTitles().includes(item.name.toLowerCase());}
  function addKnown(item){
    if(preview())return;
    const api=equipment();let result={ok:false};
    if(item.type==='weapon')result=api?.addWeapon?.(item.id)||result;
    else if(item.type==='consumable')result=api?.adjustConsumable?.(item.id,1)||result;
    else result={ok:customAdd(item.name)};
    const message=result?.message || (result?.ok===false ? 'Could not add that item.' : `${item.name} added.`);
    setTimeout(()=>refreshBackpack(message),30);
  }
  function showStatus(text){const d=backpackDialog();if(!d)return;let n=d.querySelector('.p9-library-status');if(!n){n=document.createElement('div');n.className='p9-library-status';d.querySelector('.p9-library')?.appendChild(n);}n.textContent=text||'';}

  function renderLibrary(panel){const q=(panel.querySelector('.p9-library-search')?.value||'').trim().toLowerCase(),filter=panel.dataset.filter||'all';const filtered=items().filter(i=>(filter==='all'||i.type===filter)&&(!q||`${i.name} ${i.type} ${i.effect}`.toLowerCase().includes(q)));const grid=panel.querySelector('.p9-library-grid');grid.innerHTML=filtered.map(i=>{const carried=isCarried(i);return `<div class="p9-library-item"><div><span>${esc(i.type)}${i.automated?' · live':''}</span><strong>${esc(i.name)}</strong><small>${esc(i.effect)}</small></div><button type="button" data-p9-add="${esc(i.type)}:${esc(i.id)}" ${carried?'disabled':''}>${carried?'Carried':'Add'}</button></div>`;}).join('')||'<div class="p9-library-note">No known items match that search.</div>';grid.querySelectorAll('[data-p9-add]').forEach(b=>b.addEventListener('click',()=>{const [type,id]=b.dataset.p9Add.split(':');const item=items().find(i=>i.type===type&&i.id===id);if(item)addKnown(item);}));}
  function openLibrary(){const d=backpackDialog();if(!d||preview())return;let panel=d.querySelector('.p9-library');if(!panel){panel=document.createElement('section');panel.className='p9-library';panel.dataset.filter='all';panel.innerHTML=`<div class="p9-library-head"><div><small>KNOWN · OFFICIAL DAGGERHEART</small><strong>Add from item library</strong></div><small>Tier 1 weapons supported by the live sheet, plus known consumables and gear.</small></div><input class="p9-library-search" type="search" placeholder="Search known items…" aria-label="Search known official items"><div class="p9-library-filters"><button type="button" data-filter="all" class="active">All</button><button type="button" data-filter="weapon">Weapons</button><button type="button" data-filter="consumable">Consumables</button><button type="button" data-filter="gear">Gear</button></div><div class="p9-library-grid"></div><p class="p9-library-note">Adding records equipment the character has actually acquired; it does not purchase or create it in the fiction. Inventory weapons are limited to two.</p>`;const addPanel=d.querySelector('[data-pack-add-panel]');(addPanel||d.querySelector('.p7-backpack-grid'))?.insertAdjacentElement('beforebegin',panel);panel.querySelector('.p9-library-search').addEventListener('input',()=>renderLibrary(panel));panel.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{panel.dataset.filter=b.dataset.filter;panel.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderLibrary(panel);}));}panel.hidden=!panel.hidden;if(!panel.hidden){renderLibrary(panel);panel.querySelector('.p9-library-search').focus();}}

  function bindCardAction(card,item){
    const api=equipment(),s=api?.getState?.();
    const active=item.type==='weapon' ? Boolean(api?.isEquipped?.(item.id)) : false;
    const count=item.type==='consumable' ? Number(s?.consumables?.[item.id]||0) : 0;
    const signature=item.type==='weapon'?`weapon:${item.id}:${active?'use':'equip'}`:`consumable:${item.id}:${count}`;
    let host=card.querySelector('.p9-card-actions');
    if(host?.dataset.signature===signature)return;
    if(!host){host=document.createElement('div');host.className='p9-card-actions';card.querySelector('.p7-pack-content')?.appendChild(host);}
    host.dataset.signature=signature;
    host.replaceChildren();
    if(item.type==='weapon'){
      const b=document.createElement('button');b.type='button';b.className='p9-item-action';b.textContent=active?'Use':'Equip';b.addEventListener('click',()=>active?api?.openWeaponUse?.(item.id):api?.openEquip?.(item.id));host.appendChild(b);
    }else if(item.type==='consumable'&&count>0){
      const b=document.createElement('button');b.type='button';b.className='p9-item-action';b.textContent=`Use · ${count} left`;b.addEventListener('click',()=>{api?.useConsumable?.(item.id);setTimeout(()=>refreshBackpack(),30);});host.appendChild(b);
    }
  }
  function enhanceBackpack(){
    ensureStyles();const d=backpackDialog();if(!d)return;
    const add=d.querySelector('[data-pack-add-open]');
    if(add&&!add.dataset.p9Owned){add.dataset.p9Owned='true';add.textContent='+ Add item';add.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openLibrary();},true);}
    const all=items();d.querySelectorAll('.p7-pack-card').forEach(card=>{const title=card.querySelector('h3')?.textContent.trim();const item=all.find(i=>i.name===title&&i.automated);if(item)bindCardAction(card,item);});
  }
  function refreshBackpack(status=''){
    if(!backpackDialog())return;
    window.GreywakeBackpack?.render?.();
    enhanceBackpack();
    if(status)showStatus(status);
  }
  function scheduleEnhance(){setTimeout(enhanceBackpack,40);}
  function init(){ensureStyles();enhanceBackpack();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  document.addEventListener('click',e=>{if(e.target.closest?.('#characterBackpackButton,#p7BackpackEntry .p7-backpack-button'))scheduleEnhance();},true);
  window.addEventListener('greywake:equipment-state-changed',()=>setTimeout(()=>refreshBackpack(),0));
  window.addEventListener('greywake:player-ready',scheduleEnhance);
  window.addEventListener('hashchange',scheduleEnhance);
  window.GreywakeEquipmentLibrary={known:()=>items().map(x=>({...x})),enhance:enhanceBackpack};
})();

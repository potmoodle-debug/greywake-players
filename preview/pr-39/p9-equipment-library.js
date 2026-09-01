(() => {
  const KNOWN = {
    marek: [
      {id:'minor-stamina',name:'Minor Stamina Potion',type:'consumable',effect:'Clear 1d4 Stress',automated:true},
      {id:'minor-health',name:'Minor Health Potion',type:'consumable',effect:'Clear 1d4 HP',automated:true},
      {id:'torch',name:'Torch',type:'gear',effect:'Ordinary carried gear'},
      {id:'rope-50',name:'50 ft Rope',type:'gear',effect:'Ordinary carried gear'},
      {id:'basic-supplies',name:'Basic Supplies',type:'gear',effect:'Ordinary carried gear'}
    ],
    velmira: [
      {id:'minor-stamina',name:'Minor Stamina Potion',type:'consumable',effect:'Clear 1d4 Stress',automated:true},
      {id:'minor-health',name:'Minor Health Potion',type:'consumable',effect:'Clear 1d4 HP',automated:true},
      {id:'torch',name:'Torch',type:'gear',effect:'Ordinary carried gear'},
      {id:'rope-50',name:'50 ft Rope',type:'gear',effect:'Ordinary carried gear'},
      {id:'basic-supplies',name:'Basic Supplies',type:'gear',effect:'Ordinary carried gear'}
    ],
    odie: [
      {id:'minor-health',name:'Minor Health Potion',type:'consumable',effect:'Clear 1d4 HP',automated:true},
      {id:'minor-stamina',name:'Minor Stamina Potion',type:'consumable',effect:'Clear 1d4 Stress',automated:true},
      {id:'torch',name:'Torch',type:'gear',effect:'Ordinary carried gear'},
      {id:'rope-50',name:'50 ft Rope',type:'gear',effect:'Ordinary carried gear'},
      {id:'basic-supplies',name:'Basic Supplies',type:'gear',effect:'Ordinary carried gear'}
    ]
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const character=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const preview=()=>document.body.dataset.gmPreview==='true';
  const die=sides=>{if(window.crypto?.getRandomValues){const a=new Uint32Array(1);window.crypto.getRandomValues(a);return(a[0]%sides)+1;}return Math.floor(Math.random()*sides)+1;};

  function ensureStyles(){
    if(document.getElementById('p9-equipment-library-styles'))return;
    const s=document.createElement('style');s.id='p9-equipment-library-styles';s.textContent=`
      .p9-library{margin:0 0 16px;padding:14px;border:1px solid rgba(205,187,121,.3);background:#15140f}.p9-library[hidden]{display:none}.p9-library-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-bottom:12px}.p9-library-head strong{display:block;font:20px Georgia,serif;color:#f0e2bd}.p9-library-head small{color:#9e967f}.p9-library-search{width:100%;box-sizing:border-box;background:#0e0e0b;border:1px solid #62583b;color:#eee1bd;padding:10px 11px;margin-bottom:10px}.p9-library-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.p9-library-item{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 11px;border:1px solid #4f4935;background:#1b1912}.p9-library-item span{display:block;font-size:8px;letter-spacing:.13em;text-transform:uppercase;color:#b8a66f}.p9-library-item strong{display:block;margin:3px 0;color:#eee1bd}.p9-library-item small{display:block;color:#938c79;line-height:1.35}.p9-library-item button,.p9-use-item{border:1px solid #8e7640;background:#322716;color:#ffe29b;padding:8px 10px;font-weight:800;cursor:pointer}.p9-library-item button:disabled{opacity:.45;cursor:default}.p9-use-item{margin-top:10px;width:100%}.p9-library-note{margin:10px 0 0;color:#817a68;font-size:9px}.p9-use-result{margin-top:8px;color:#d8c582;font-size:10px;line-height:1.4}@media(max-width:620px){.p9-library-grid{grid-template-columns:1fr}.p9-library-head{display:block}}
    `;document.head.appendChild(s);
  }

  function backpackDialog(){return document.getElementById('p7BackpackDialog');}
  function visibleTitles(){return [...(backpackDialog()?.querySelectorAll('.p7-pack-card h3')||[])].map(x=>x.textContent.trim().toLowerCase());}
  function customAdd(name){
    const d=backpackDialog();if(!d)return false;
    const open=d.querySelector('[data-pack-add-open]');
    const panel=d.querySelector('[data-pack-add-panel]');
    if(panel&&!panel.classList.contains('open'))open?.click();
    const input=d.querySelector('[data-pack-add-panel] input');
    const save=d.querySelector('[data-pack-save]');
    if(!input||!save)return false;
    input.value=name;input.dispatchEvent(new Event('input',{bubbles:true}));save.click();return true;
  }
  function managerHas(name){return [...document.querySelectorAll('#equipmentManager .equip-item strong')].some(x=>x.textContent.trim().toLowerCase()===name.toLowerCase());}

  function addKnown(item){
    if(preview())return;
    if(visibleTitles().includes(item.name.toLowerCase()))return;
    if(managerHas(item.name))return;
    customAdd(item.name);
    setTimeout(enhanceBackpack,40);
  }

  function resourceAPI(){return character()==='marek'?window.GreywakeResources:window.GreywakeCompanion;}
  function useCustomPotion(name,kind){
    const api=resourceAPI(),rs=api?.getState?.();if(!api||!rs)return 'Live resource track unavailable.';
    const current=Number(rs[kind]||0);
    if(current<=0)return `No marked ${kind==='hp'?'HP':'Stress'} to clear.`;
    const roll=die(4),cleared=Math.min(roll,current);
    api.setResource?.(kind,current-cleared,`${name} · clear ${roll}`);
    const d=backpackDialog();
    const card=[...(d?.querySelectorAll('.p7-pack-card')||[])].find(c=>c.querySelector('h3')?.textContent.trim()===name);
    card?.querySelector('[data-pack-remove]')?.click();
    window.GreywakeBackpack?.render?.();
    setTimeout(enhanceBackpack,20);
    return `Rolled ${roll}; cleared ${cleared} ${kind==='hp'?'HP':'Stress'}.`;
  }

  function useKnown(item){
    const built=[...document.querySelectorAll('#equipmentManager .equip-item')].find(c=>c.querySelector('strong')?.textContent.trim()===item.name);
    const builtUse=built?.querySelector('[data-consume]');
    if(builtUse&&!builtUse.disabled){builtUse.click();setTimeout(()=>{window.GreywakeBackpack?.render?.();enhanceBackpack();},30);return;}
    const result=useCustomPotion(item.name,item.id==='minor-health'?'hp':'stress');
    setTimeout(()=>{const d=backpackDialog();if(!d)return;const card=[...d.querySelectorAll('.p7-pack-card')].find(c=>c.querySelector('h3')?.textContent.trim()===item.name);if(card){let r=card.querySelector('.p9-use-result');if(!r){r=document.createElement('div');r.className='p9-use-result';card.querySelector('.p7-pack-content')?.appendChild(r);}r.textContent=result;}},30);
  }

  function renderLibrary(panel,query=''){
    const items=KNOWN[character()]||[];const q=query.trim().toLowerCase();const titles=visibleTitles();
    const filtered=items.filter(i=>!q||`${i.name} ${i.type} ${i.effect}`.toLowerCase().includes(q));
    const grid=panel.querySelector('.p9-library-grid');
    grid.innerHTML=filtered.map(i=>{const carried=titles.includes(i.name.toLowerCase())||managerHas(i.name);return `<div class="p9-library-item"><div><span>${esc(i.type)}${i.automated?' · usable':''}</span><strong>${esc(i.name)}</strong><small>${esc(i.effect)}</small></div><button type="button" data-p9-add="${esc(i.id)}" ${carried?'disabled':''}>${carried?'Carried':'Add'}</button></div>`;}).join('')||'<div class="p9-library-note">No known items match that search.</div>';
    grid.querySelectorAll('[data-p9-add]').forEach(b=>b.addEventListener('click',()=>{const item=items.find(i=>i.id===b.dataset.p9Add);if(item)addKnown(item);}));
  }

  function openLibrary(){
    const d=backpackDialog();if(!d||preview())return;
    let panel=d.querySelector('.p9-library');
    if(!panel){panel=document.createElement('section');panel.className='p9-library';panel.innerHTML=`<div class="p9-library-head"><div><small>KNOWN · OFFICIAL DAGGERHEART</small><strong>Add from item library</strong></div><small>Only items established as known in Greywake are shown.</small></div><input class="p9-library-search" type="search" placeholder="Search known items…" aria-label="Search known official items"><div class="p9-library-grid"></div><p class="p9-library-note">Choosing an item records something the character has actually acquired; it does not purchase or create the item in the fiction.</p>`;const addPanel=d.querySelector('[data-pack-add-panel]');(addPanel||d.querySelector('.p7-backpack-grid'))?.insertAdjacentElement('beforebegin',panel);panel.querySelector('.p9-library-search').addEventListener('input',e=>renderLibrary(panel,e.target.value));}
    panel.hidden=!panel.hidden;if(!panel.hidden){renderLibrary(panel,panel.querySelector('.p9-library-search').value);panel.querySelector('.p9-library-search').focus();}
  }

  function enhanceBackpack(){
    ensureStyles();const d=backpackDialog();if(!d)return;
    const add=d.querySelector('[data-pack-add-open]');
    if(add&&!add.dataset.p9Owned){add.dataset.p9Owned='true';add.textContent='+ Add item';add.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openLibrary();},true);}
    const items=KNOWN[character()]||[];
    d.querySelectorAll('.p7-pack-card').forEach(card=>{const title=card.querySelector('h3')?.textContent.trim();const item=items.find(i=>i.name===title&&i.automated);if(!item||card.querySelector('.p9-use-item'))return;const b=document.createElement('button');b.type='button';b.className='p9-use-item';b.textContent='Use';b.addEventListener('click',()=>useKnown(item));card.querySelector('.p7-pack-content')?.appendChild(b);});
  }

  const observer=new MutationObserver(()=>enhanceBackpack());
  function init(){ensureStyles();observer.observe(document.body,{childList:true,subtree:true});enhanceBackpack();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.GreywakeEquipmentLibrary={known:()=>[...(KNOWN[character()]||[])],enhance:enhanceBackpack};
})();

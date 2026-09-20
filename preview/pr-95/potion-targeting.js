(() => {
  const URL='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/cross-player-effects';
  const KEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const PARTY={marek:'Marek',velmira:'Velmira',odie:'Odie'};
  let observer=null,busy=false;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const who=()=>{const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return PARTY[k]?k:null;};
  const preview=()=>document.body.dataset.gmPreview==='true';
  const equipment=()=>window.GreywakeEquipment||null;
  const item=id=>equipment()?.consumables?.()?.[id]||null;
  const count=id=>Number(equipment()?.getState?.()?.consumables?.[id]||0);
  const auth=()=>{const k=who(),p=window.GreywakePlayer;return{character:k,code:String(p?.code||k||'').toUpperCase()};};

  function css(){
    if(document.getElementById('potionTargetCss'))return;
    const s=document.createElement('style');s.id='potionTargetCss';s.textContent=`
      .potion-target-dialog{border:1px solid #806d3f;background:#15140f;color:#e9dfc4;width:min(92vw,500px);padding:0;box-shadow:0 28px 80px #000a}.potion-target-dialog::backdrop{background:#000b}.potion-target-shell{padding:18px}.potion-target-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.potion-target-head span{display:block;color:#a99c78;font-size:9px;font-weight:900;letter-spacing:.16em}.potion-target-head h2{margin:4px 0 5px;color:#f2dfaa;font:25px Georgia,serif}.potion-target-head p{margin:0;color:#aaa18a;font-size:11px;line-height:1.5}.potion-target-close{border:0;background:transparent;color:#c8b98e;font-size:24px;cursor:pointer}.potion-target-dialog label{display:grid;gap:6px;margin:16px 0 10px;color:#aaa18a;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.potion-target-dialog select{width:100%;padding:11px;background:#10100d;color:#eee3bf;border:1px solid #665c40}.potion-target-use{width:100%;padding:11px 12px;border:1px solid #8b7542;background:#2b2416;color:#f1d68b;font-weight:900;cursor:pointer}.potion-target-use:disabled{opacity:.55;cursor:default}.potion-target-result{margin-top:12px;padding:11px;border:1px solid #665c40;background:#11110d;color:#ddd2b4;font-size:11px;line-height:1.45}.potion-target-result[data-tone="error"]{border-color:#8d4d42;color:#f0c5bb}.potion-target-result strong{color:#f2dfaa}`;
    document.head.appendChild(s);
  }

  function ensureDialog(){
    css();let d=document.getElementById('potionTargetDialog');
    if(!d){d=document.createElement('dialog');d.id='potionTargetDialog';d.className='potion-target-dialog';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});}
    return d;
  }

  function options(){return Object.entries(PARTY).map(([k,n])=>`<option value="${k}">${esc(n)}</option>`).join('');}

  async function request(effect){
    const a=auth();
    const r=await fetch(URL,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json','x-greywake-character':a.character,'x-greywake-code':a.code},body:JSON.stringify({effect})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||'Potion effect could not sync.');
    return d;
  }

  function refreshInventory(){
    equipment()?.render?.();
    window.GreywakeBackpack?.render?.();
    window.GreywakeInventoryConsolidation?.refresh?.();
  }

  function localUse(id,target,result){
    const before=count(id),meta=item(id),r=equipment()?.useConsumable?.(id)||{ok:false,message:'Consumable unavailable.'};
    if(r?.ok===false){result.dataset.tone='error';result.textContent=r.message||`${meta?.name||'Potion'} could not be used.`;return false;}
    const after=count(id);result.dataset.tone='success';result.innerHTML=`<strong>${esc(meta?.name||'Potion')} used on ${esc(PARTY[target])}.</strong><br>${after} ${after===1?'potion':'potions'} remaining.`;
    refreshInventory();
    return before>after;
  }

  async function remoteUse(id,target,result,button){
    const meta=item(id),before=count(id);
    if(!meta||before<1)throw new Error('That potion is no longer in the backpack.');
    const d=await request({type:'consumable',source:meta.name,target,item:id});
    const used=equipment()?.adjustConsumable?.(id,-1);
    if(used?.ok===false)throw new Error('The effect landed, but the potion could not be removed from the backpack. Check the inventory before continuing.');
    refreshInventory();
    result.dataset.tone='success';result.innerHTML=`<strong>${esc(d.summary||`${meta.name} used on ${PARTY[target]}.`)}</strong><br>${count(id)} ${count(id)===1?'potion':'potions'} remaining in ${esc(PARTY[who()])}'s backpack.`;
    window.dispatchEvent(new Event('focus'));
    return d;
  }

  function open(id){
    if(preview())return;
    const meta=item(id),copies=count(id),actor=who();if(!meta||!actor||copies<1)return;
    const d=ensureDialog();
    d.innerHTML=`<div class="potion-target-shell"><div class="potion-target-head"><div><span>USE CONSUMABLE · ${copies} CARRIED</span><h2>${esc(meta.name)}</h2><p>${esc(meta.effect)}. Choose who receives the effect. The potion is only removed after the use succeeds.</p></div><button class="potion-target-close" type="button" aria-label="Close">×</button></div><label>Use on<select data-potion-target>${options()}</select></label><button class="potion-target-use" type="button" data-potion-use>Use ${esc(meta.name)}</button><div class="potion-target-result" data-potion-result hidden></div></div>`;
    const select=d.querySelector('[data-potion-target]'),button=d.querySelector('[data-potion-use]'),result=d.querySelector('[data-potion-result]');
    select.value=actor;
    d.querySelector('.potion-target-close').onclick=()=>d.close();
    button.onclick=async()=>{
      if(busy)return;busy=true;button.disabled=true;result.hidden=false;result.removeAttribute('data-tone');result.textContent='Applying potion…';
      const target=select.value;
      try{
        if(target===actor)localUse(id,target,result);else await remoteUse(id,target,result,button);
      }catch(e){result.dataset.tone='error';result.textContent=e?.message||'Potion could not be used.';}
      finally{busy=false;button.disabled=false;}
    };
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
  }

  function enhance(){
    document.querySelectorAll('#equipmentManager [data-consume]').forEach(b=>{
      if(count(b.dataset.consume)>0){b.disabled=false;b.title='Choose which PC receives this potion';}
    });
  }

  function capture(e){
    const b=e.target.closest?.('[data-backpack-use-consumable],[data-consume]');if(!b||preview())return;
    const id=b.dataset.backpackUseConsumable||b.dataset.consume;if(!item(id)||count(id)<1)return;
    e.preventDefault();e.stopImmediatePropagation();open(id);
  }

  function init(){enhance();observer?.disconnect();observer=new MutationObserver(()=>requestAnimationFrame(enhance));observer.observe(document.body,{childList:true,subtree:true});}

  document.addEventListener('click',capture,true);
  window.addEventListener('greywake:equipment-state-changed',()=>setTimeout(enhance,20));
  window.addEventListener('greywake:player-ready',()=>setTimeout(init,500));
  window.addEventListener('greywake:sheet-enhanced',()=>setTimeout(enhance,80));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,520));
})();

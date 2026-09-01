(() => {
  const PREFIX='greywake:p9-damage-checkpoint:v1:';
  let restoring=false;
  const key=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
  const preview=()=>document.body.dataset.gmPreview==='true';
  const storeKey=()=>`${PREFIX}${key()}${preview()?':gmtest':''}`;
  const resourceAPI=()=>key()==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const damageAPI=()=>window.GreywakeDamage||null;
  function saveCheckpoint(resourceBefore){
    if(restoring||!resourceBefore)return;
    const damage=damageAPI()?.getState?.();if(!damage)return;
    try{localStorage.setItem(storeKey(),JSON.stringify({resources:resourceBefore,damage,at:Date.now()}));}catch(_){}
  }
  function loadCheckpoint(){try{return JSON.parse(localStorage.getItem(storeKey())||'null');}catch(_){return null;}}
  function clearCheckpoint(){try{localStorage.removeItem(storeKey());}catch(_){} }
  function restoreCheckpoint(){
    const cp=loadCheckpoint(),r=resourceAPI(),d=damageAPI();if(!cp||!r||!d)return false;
    restoring=true;
    try{
      if(cp.resources){
        if(Number.isFinite(Number(cp.resources.hp)))r.setResource?.('hp',Number(cp.resources.hp),'Undo lethal damage');
        if(Number.isFinite(Number(cp.resources.stress)))r.setResource?.('stress',Number(cp.resources.stress),'Undo lethal damage');
        if(Number.isFinite(Number(cp.resources.hope)))r.setResource?.('hope',Number(cp.resources.hope),'Undo lethal damage');
      }
      d.importState?.(cp.damage);
      clearCheckpoint();
    }finally{restoring=false;}
    setTimeout(refresh,30);return true;
  }
  function recoverCurrentAccident(){
    const r=resourceAPI(),d=damageAPI(),rs=r?.getState?.(),ds=d?.getState?.();if(!r||!d||!rs||!ds)return;
    if(restoreCheckpoint())return;
    restoring=true;
    try{
      const safeHP=Math.max(0,Number(rs.maxHP||0)-1);
      if(Number(rs.hp)>=Number(rs.maxHP||0))r.setResource?.('hp',safeHP,'Correct accidental death');
      d.importState?.({...ds,status:'active',deathMove:null});
    }finally{restoring=false;}
    setTimeout(refresh,30);
  }
  function refresh(){
    const panel=document.getElementById('damageHealthPanel'),d=damageAPI(),s=d?.getState?.();if(!panel||!s)return;
    panel.querySelector('[data-p9-undo-lethal]')?.remove();
    if(!['death_move','unconscious','blaze_pending','dead','retired'].includes(s.status))return;
    const host=panel.querySelector('.damage-meta-line')||panel.querySelector('.damage-health-head');if(!host)return;
    const b=document.createElement('button');b.type='button';b.dataset.p9UndoLethal='true';b.className='damage-reset-test';b.textContent=loadCheckpoint()?'Undo last lethal damage':'Correct accidental death';b.addEventListener('click',recoverCurrentAccident);host.appendChild(b);
  }
  function onResourceChange(event){
    if(restoring)return;const detail=event.detail||{},reason=String(detail.reason||'');
    if(/damage/i.test(reason)&&detail.before)saveCheckpoint(detail.before);
    setTimeout(refresh,20);
  }
  document.addEventListener('click',event=>{
    const undo=event.target.closest?.('[data-resource-undo],[data-companion-undo]');if(!undo||restoring||!loadCheckpoint())return;
    const status=damageAPI()?.getState?.()?.status;if(!['death_move','unconscious','blaze_pending','dead','retired'].includes(status))return;
    event.preventDefault();event.stopImmediatePropagation();restoreCheckpoint();
  },true);
  window.addEventListener('greywake:resources-changed',onResourceChange);
  window.addEventListener('greywake:companion-resources-changed',onResourceChange);
  window.addEventListener('greywake:damage-changed',()=>setTimeout(refresh,20));
  window.addEventListener('greywake:player-ready',()=>setTimeout(refresh,80));
  window.addEventListener('greywake:sheet-enhanced',()=>setTimeout(refresh,80));
  window.addEventListener('hashchange',()=>setTimeout(refresh,80));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,100));else setTimeout(refresh,100);
  window.GreywakeDamageUndo={restore:restoreCheckpoint,recover:recoverCurrentAccident};
})();
(() => {
  function key(){ return String(window.GreywakeCompanion?.key || window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase(); }
  function state(){ return window.GreywakeCompanion?.getState?.() || null; }
  function patternChosen(){ return Boolean(state()?.effects?.strangePatternChosen); }

  function normalizePatternUI(){
    if(key()!=='velmira') return;
    const select=document.querySelector('#companionActionsPanel [data-pattern-number]');
    if(select && !patternChosen()){
      let placeholder=select.querySelector('option[value=""]');
      if(!placeholder){ placeholder=document.createElement('option'); placeholder.value=''; placeholder.textContent='Choose'; select.prepend(placeholder); }
      select.value='';
    }
    if(!patternChosen()) document.querySelectorAll('#companionActionsPanel .companion-pattern-trigger').forEach(n=>n.remove());
  }

  function rollError(button,message){
    const detail=button.closest('.active-action-detail');
    const result=detail?.querySelector('[data-roll-result]');
    if(result) result.innerHTML=`<div class="duality-result resource-error"><div class="duality-outcome"><span>RESOURCE REQUIRED</span><strong>ROLL NOT MADE</strong><small>${message}</small></div></div>`;
  }

  document.addEventListener('change',event=>{
    const select=event.target.closest?.('#companionActionsPanel [data-pattern-number]');
    if(!select || key()!=='velmira' || document.body.dataset.gmPreview==='true') return;
    if(select.value) window.GreywakeCompanion?.setEffect?.('strangePatternChosen',true,'Choose Strange Patterns number');
  },true);

  document.addEventListener('click',event=>{
    const roll=event.target.closest?.('#companionActionsPanel [data-companion-roll]');
    if(roll){
      const s=state();
      const detail=roll.closest('.active-action-detail');
      const title=detail?.querySelector('h3')?.textContent.trim() || '';
      const expCount=detail?.querySelectorAll('[data-comp-exp]:checked').length || 0;
      const payment=detail?.querySelector('[data-exp-payment]')?.value || 'hope';
      const actionHope=title==='Rain of Blades'?1:0;
      const hopeNeeded=actionHope+(payment==='hope'?expCount:0);
      const stressNeeded=payment==='adept'?expCount:0;
      if(s && hopeNeeded>s.hope){
        event.preventDefault();event.stopImmediatePropagation();
        rollError(roll,`${hopeNeeded} Hope required for this roll; only ${s.hope} available.`);
        return;
      }
      if(s && stressNeeded>(s.maxStress-s.stress)){
        event.preventDefault();event.stopImmediatePropagation();
        rollError(roll,`${stressNeeded} free Stress slot${stressNeeded===1?'':'s'} required to use Adept.`);
        return;
      }
    }

    const adapt=event.target.closest?.('#companionActionsPanel [data-adapt-reroll]');
    if(adapt && key()==='velmira'){
      const detail=adapt.closest('.active-action-detail');
      if(detail?.querySelector('[data-exp-payment]')?.value==='adept'){
        const changed=[];
        detail.querySelectorAll('[data-comp-exp]:checked').forEach(input=>{
          const original=Number(input.dataset.bonus||0);
          input.dataset.bonus=String(original*2);
          changed.push([input,original]);
        });
        setTimeout(()=>changed.forEach(([input,original])=>{input.dataset.bonus=String(original);}),0);
      }
    }
  },true);

  const observer=new MutationObserver(()=>requestAnimationFrame(normalizePatternUI));
  document.addEventListener('DOMContentLoaded',()=>{observer.observe(document.documentElement,{childList:true,subtree:true});normalizePatternUI();});
  window.addEventListener('greywake:player-ready',()=>setTimeout(normalizePatternUI,220));
  window.addEventListener('greywake:companion-resources-changed',()=>requestAnimationFrame(normalizePatternUI));
})();
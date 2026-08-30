(() => {
  let pending = null;
  let observedDialog = null;
  let dialogObserver = null;

  function isMarek(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase() === 'marek';
  }

  function api(){ return window.GreywakeResources || null; }

  function ensureChoice(){
    if (!isMarek()) return;
    const dialog=document.getElementById('beastformDialog');
    if (!dialog) return;
    const foot=dialog.querySelector('.beastform-dialog-foot');
    if (!foot) return;
    let choice=dialog.querySelector('#beastformActivationChoice');
    if (!choice){
      choice=document.createElement('div');
      choice.id='beastformActivationChoice';
      choice.className='beastform-activation-choice';
      choice.innerHTML=`<div class="beastform-activation-title"><span>TRANSFORMATION COST</span><strong>Choose before selecting a form</strong></div>
        <label class="beastform-activation-option"><input type="radio" name="beastformActivation" value="stress" checked><span><b>Beastform</b><small>Mark 1 Stress</small></span></label>
        <label class="beastform-activation-option"><input type="radio" name="beastformActivation" value="evolution"><span><b>Evolution</b><small>Spend 3 Hope · mark no Stress · +1 to one trait</small></span></label>
        <label class="beastform-evolution-pretrait"><span>Evolution trait</span><select id="beastformPreTrait" disabled><option>Agility</option><option>Strength</option><option>Finesse</option><option>Instinct</option><option>Presence</option><option>Knowledge</option></select></label>
        <div id="beastformActivationError" class="beastform-activation-error" aria-live="polite"></div>`;
      foot.innerHTML='';
      foot.appendChild(choice);
      choice.querySelectorAll('input[name="beastformActivation"]').forEach(input=>input.addEventListener('change',()=>{
        const evolution=choice.querySelector('input[value="evolution"]')?.checked;
        const select=choice.querySelector('#beastformPreTrait');
        if (select) select.disabled=!evolution;
        updateAffordability();
      }));
    }
    updateAffordability();
    lockActiveEvolution();
  }

  function updateAffordability(){
    const choice=document.getElementById('beastformActivationChoice');
    const resource=api()?.getState?.();
    if (!choice || !resource) return;
    const stressOption=choice.querySelector('input[value="stress"]')?.closest('label');
    const evolutionOption=choice.querySelector('input[value="evolution"]')?.closest('label');
    stressOption?.classList.toggle('unavailable',resource.stress>=resource.maxStress);
    evolutionOption?.classList.toggle('unavailable',resource.hope<3);
    stressOption?.querySelector('small')?.replaceChildren(document.createTextNode(resource.stress>=resource.maxStress?'Unavailable · no free Stress slots':'Mark 1 Stress'));
    evolutionOption?.querySelector('small')?.replaceChildren(document.createTextNode(resource.hope<3?`Unavailable · ${resource.hope}/3 Hope`:'Spend 3 Hope · mark no Stress · +1 to one trait'));
  }

  function selectedMode(){
    return document.querySelector('#beastformActivationChoice input[name="beastformActivation"]:checked')?.value || 'stress';
  }

  function activationError(message=''){
    const node=document.getElementById('beastformActivationError');
    if (node) node.textContent=message;
  }

  function currentFormId(){
    return document.querySelector('#beastformOptions .beastform-option.selected')?.dataset.beastform || null;
  }

  function payForTransformation(formId){
    const resource=api();
    if (!resource) return {ok:true};
    const mode=selectedMode();
    const current=currentFormId();
    if (current && current===formId) return {ok:true,same:true};
    activationError('');
    if (mode==='evolution'){
      const result=resource.spendHope(3,`Evolution · ${formId}`);
      if (!result.ok){ activationError(result.message || 'Not enough Hope.'); return result; }
      pending={mode:'evolution',trait:document.getElementById('beastformPreTrait')?.value || 'Agility'};
      return result;
    }
    const result=resource.markStress(1,{reason:`Beastform · ${formId}`,cost:true});
    if (!result.ok){ activationError(result.message || 'No free Stress slot.'); return result; }
    pending={mode:'stress',trait:null};
    return result;
  }

  function applyPendingMode(){
    if (!pending) return;
    const desired=pending;
    pending=null;
    let attempts=0;
    const finish=()=>{
      attempts++;
      const checkbox=document.getElementById('beastformEvolution');
      if (!checkbox){ if (attempts<8) setTimeout(finish,25); return; }
      checkbox.disabled=false;
      checkbox.checked=desired.mode==='evolution';
      checkbox.dispatchEvent(new Event('change',{bubbles:true}));
      if (desired.mode==='evolution'){
        setTimeout(()=>{
          const select=document.getElementById('beastformEvolutionTrait');
          if (select){
            select.disabled=false;
            select.value=desired.trait;
            select.dispatchEvent(new Event('change',{bubbles:true}));
          }
          lockActiveEvolution();
        },20);
      }else{
        setTimeout(lockActiveEvolution,20);
      }
    };
    setTimeout(finish,0);
  }

  function lockActiveEvolution(){
    const checkbox=document.getElementById('beastformEvolution');
    const select=document.getElementById('beastformEvolutionTrait');
    if (checkbox){
      checkbox.disabled=true;
      checkbox.closest('label')?.classList.add('beastform-evolution-locked');
      const small=checkbox.closest('label')?.querySelector('small');
      if (small) small.textContent=checkbox.checked?'Evolution was paid when this form was chosen.':'Standard Beastform was paid when this form was chosen.';
    }
    if (select) select.disabled=true;
    const cost=document.querySelector('#beastformControl .beastform-cost');
    if (cost) cost.textContent=checkbox?.checked ? 'Activation paid automatically: 3 Hope · no Stress.' : 'Activation paid automatically: 1 Stress.';
  }

  function observeDialog(){
    const dialog=document.getElementById('beastformDialog');
    if (!dialog || dialog===observedDialog) return;
    dialogObserver?.disconnect();
    observedDialog=dialog;
    dialogObserver=new MutationObserver(()=>requestAnimationFrame(ensureChoice));
    dialogObserver.observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
    ensureChoice();
  }

  document.addEventListener('click',event=>{
    if (!isMarek()) return;
    const button=event.target.closest('#beastformOptions [data-beastform]');
    if (!button) return;
    const result=payForTransformation(button.dataset.beastform);
    if (!result.ok){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (!result.same) applyPendingMode();
  },true);

  function init(){
    if (!isMarek()) return;
    observeDialog();
    ensureChoice();
    lockActiveEvolution();
  }

  let timer;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(init,130)};
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('greywake:resources-changed',()=>{updateAffordability();lockActiveEvolution();});
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
})();
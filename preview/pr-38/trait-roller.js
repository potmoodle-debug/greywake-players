(() => {
  const TRAITS=['Agility','Strength','Finesse','Instinct','Presence','Knowledge'];
  let activeKey=null;

  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  const die=sides=>{if(window.crypto?.getRandomValues){const b=new Uint32Array(1);window.crypto.getRandomValues(b);return(b[0]%sides)+1;}return Math.floor(Math.random()*sides)+1;};
  const key=()=>{const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return['marek','velmira','odie'].includes(k)?k:null;};
  const resourceAPI=()=>activeKey==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const resourceState=()=>resourceAPI()?.getState?.()||null;

  function readModifier(text){const m=String(text||'').match(/[+−-]?\d+/);return m?Number(m[0].replace('−','-')):0;}
  function traitCard(name){return[...document.querySelectorAll('#characterSheet .sheet-grid.traits .sheet-card')].find(card=>card.querySelector('h4')?.textContent.trim()===name)||null;}
  function traitModifier(name){return readModifier(traitCard(name)?.querySelector('.sheet-value')?.textContent);}
  function experiences(){
    const group=[...document.querySelectorAll('#characterSheet .sheet-group')].find(g=>g.querySelector('.sheet-group-head h3')?.textContent.trim()==='Experiences');
    if(!group)return[];
    return[...group.querySelectorAll('.sheet-card')].map(card=>({name:card.querySelector('h4')?.textContent.trim()||'Experience',bonus:readModifier(card.querySelector('.sheet-value')?.textContent)})).filter(x=>x.bonus!==0);
  }

  function ensurePanel(){
    const identity=document.querySelector('#characterSheet .character-sheet-identity');
    if(!identity)return null;
    let panel=document.getElementById('traitRollPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='traitRollPanel';
      panel.className='trait-roll-panel';
      const damage=document.getElementById('damageHealthPanel');
      if(damage)damage.insertAdjacentElement('beforebegin',panel);
      else{
        const board=identity.querySelector('.pro-resource-board');
        if(board)board.insertAdjacentElement('afterend',panel);else identity.appendChild(panel);
      }
    }
    return panel;
  }

  function experienceOptions(){
    const items=experiences();
    if(!items.length)return'';
    return `<fieldset class="trait-roll-experiences"><legend>Experiences <small>${activeKey==='velmira'?'1 Hope each, or Adept':'1 Hope each'}</small></legend>${items.map((item,i)=>`<label><input type="checkbox" data-trait-exp="${i}" data-bonus="${item.bonus}"><span><b>${esc(item.name)}</b><small>+${item.bonus}</small></span></label>`).join('')}</fieldset>`;
  }

  function render(){
    const panel=ensurePanel();if(!panel)return;
    const oldOptions=panel.querySelector('.trait-roll-options')?.open||false;
    const oldMode=panel.querySelector('[data-trait-roll-mode]')?.value||'normal';
    const oldOther=panel.querySelector('[data-trait-other]')?.value||'0';
    const oldDifficulty=panel.querySelector('[data-trait-difficulty]')?.value||'';
    const oldPayment=panel.querySelector('[data-trait-exp-payment]')?.value||'hope';
    const selected=new Set([...panel.querySelectorAll('[data-trait-exp]:checked')].map(n=>Number(n.dataset.traitExp)));
    const priorResult=panel.querySelector('[data-trait-result]')?.innerHTML||'';

    panel.innerHTML=`<div class="trait-roll-head"><div><span>QUICK ACTION ROLLS</span><strong>Traits</strong><small>Click a trait to roll the Duality Dice immediately.</small></div><div class="trait-roll-dice-mark" aria-hidden="true"><i>H</i><i>F</i></div></div>
      <div class="trait-roll-buttons">${TRAITS.map(name=>{const mod=traitModifier(name);return`<button type="button" data-trait-roll="${name}"><span>${esc(name)}</span><b>${mod>0?'+':''}${mod}</b></button>`;}).join('')}</div>
      <details class="trait-roll-options" ${oldOptions?'open':''}><summary>Roll options <small>Experiences · advantage · Difficulty</small></summary><div class="trait-roll-options-body">${experienceOptions()}${activeKey==='velmira'?`<label class="trait-roll-field"><span>Experience payment</span><select data-trait-exp-payment><option value="hope" ${oldPayment==='hope'?'selected':''}>Spend Hope normally</option><option value="adept" ${oldPayment==='adept'?'selected':''}>Adept · mark Stress, double Experience</option></select></label>`:''}<div class="trait-roll-fields"><label class="trait-roll-field"><span>Roll mode</span><select data-trait-roll-mode><option value="normal" ${oldMode==='normal'?'selected':''}>Normal</option><option value="advantage" ${oldMode==='advantage'?'selected':''}>Advantage +d6</option><option value="disadvantage" ${oldMode==='disadvantage'?'selected':''}>Disadvantage −d6</option></select></label><label class="trait-roll-field"><span>Other modifier</span><input data-trait-other type="number" value="${esc(oldOther)}" min="-20" max="20" step="1"></label><label class="trait-roll-field"><span>Difficulty <small>optional</small></span><input data-trait-difficulty type="number" value="${esc(oldDifficulty)}" min="1" max="40" step="1" placeholder="GM target"></label></div></div></details>
      <div class="trait-roll-result" data-trait-result aria-live="polite">${priorResult}</div>`;

    panel.querySelectorAll('[data-trait-exp]').forEach(n=>{if(selected.has(Number(n.dataset.traitExp)))n.checked=true;});
    panel.querySelectorAll('[data-trait-roll]').forEach(button=>button.addEventListener('click',()=>performRoll(button.dataset.traitRoll)));
    bindResultClose(panel.querySelector('[data-trait-result]'));
  }

  function bindResultClose(host){
    host?.querySelector('[data-close-roll-result]')?.addEventListener('click',()=>host.replaceChildren());
  }

  function errorResult(message){
    const host=document.querySelector('#traitRollPanel [data-trait-result]');if(!host)return;
    host.innerHTML=`<div class="duality-result resource-error"><button type="button" class="action-roll-result-close" data-close-roll-result>Close result ×</button><div class="duality-outcome"><span>RESOURCE REQUIRED</span><strong>ROLL NOT MADE</strong><small>${esc(message)}</small></div></div>`;
    bindResultClose(host);
  }

  function selectedExperiences(){
    const items=experiences();
    return [...document.querySelectorAll('#traitRollPanel [data-trait-exp]:checked')].map(input=>({index:Number(input.dataset.traitExp),name:items[Number(input.dataset.traitExp)]?.name||'Experience',bonus:Number(input.dataset.bonus||0)}));
  }

  function payExperiences(selected,{reroll=false}={}){
    if(reroll||!selected.length)return{ok:true,bonus:selected.reduce((s,x)=>s+x.bonus,0),mode:'none',cost:0};
    const api=resourceAPI(),state=resourceState();if(!api||!state)return{ok:false,message:'Live resources are unavailable.'};
    const payment=activeKey==='velmira'?(document.querySelector('#traitRollPanel [data-trait-exp-payment]')?.value||'hope'):'hope';
    if(payment==='adept'){
      const needed=selected.length;
      if(state.maxStress-state.stress<needed)return{ok:false,message:`Adept requires ${needed} free Stress slot${needed===1?'':'s'}.`};
      const marked=api.markStress?.(needed,{reason:`Adept · ${selected.map(x=>x.name).join(' + ')}`,cost:true});
      if(marked&&!marked.ok)return{ok:false,message:marked.message||'Adept could not mark Stress.'};
      return{ok:true,bonus:selected.reduce((s,x)=>s+x.bonus*2,0),mode:'adept',cost:needed};
    }
    const needed=selected.length;
    if(state.hope<needed)return{ok:false,message:`${needed} Hope required for ${selected.map(x=>x.name).join(' + ')}; only ${state.hope} available.`};
    const spent=api.spendHope?.(needed,`Experience${needed>1?'s':''}: ${selected.map(x=>x.name).join(' + ')}`);
    if(spent&&!spent.ok)return{ok:false,message:spent.message||'Not enough Hope.'};
    return{ok:true,bonus:selected.reduce((s,x)=>s+x.bonus,0),mode:'hope',cost:needed};
  }

  function renderPatternChoice(result,hope,fear){
    if(activeKey!=='velmira')return'';
    const s=resourceState();
    if(!s?.effects?.strangePatternChosen)return'';
    if(hope!==Number(s.strangePattern)&&fear!==Number(s.strangePattern))return'';
    return `<div class="companion-pattern-trigger"><strong>Strange Patterns · ${s.strangePattern}</strong><span>Choose one:</span><button type="button" data-trait-pattern-gain>Gain 1 Hope</button><button type="button" data-trait-pattern-clear>Clear 1 Stress</button></div>`;
  }

  function performRoll(trait,{reroll=false}={}){
    const panel=document.getElementById('traitRollPanel');if(!panel||!TRAITS.includes(trait))return;
    const selected=selectedExperiences();
    const payment=payExperiences(selected,{reroll});
    if(!payment.ok){errorResult(payment.message);return;}

    const traitMod=traitModifier(trait);
    const hope=die(12),fear=die(12),critical=hope===fear,axis=critical||hope>fear?'Hope':'Fear';
    const mode=panel.querySelector('[data-trait-roll-mode]')?.value||'normal';
    const extraDie=mode==='normal'?0:die(6);
    const advantage=mode==='advantage'?extraDie:mode==='disadvantage'?-extraDie:0;
    const other=clamp(panel.querySelector('[data-trait-other]')?.value||0,-20,20);
    const difficultyRaw=panel.querySelector('[data-trait-difficulty]')?.value;
    const difficulty=difficultyRaw?clamp(difficultyRaw,1,40):null;
    const total=hope+fear+traitMod+payment.bonus+advantage+other;
    const success=critical?true:difficulty==null?null:total>=difficulty;
    const api=resourceAPI();

    if(critical){api?.gainHope?.(1,'Critical success');api?.clearStress?.(1,'Critical success');}
    else if(axis==='Hope')api?.gainHope?.(1,'Roll with Hope');

    const headline=critical?'CRITICAL SUCCESS':success==null?`${total} WITH ${axis.toUpperCase()}`:`${success?'SUCCESS':'FAILURE'} WITH ${axis.toUpperCase()}`;
    const parts=[`${hope} Hope`,`${fear} Fear`,`${trait} ${traitMod>=0?'+':''}${traitMod}`];
    if(payment.bonus)parts.push(`Experience ${payment.bonus>=0?'+':''}${payment.bonus}${payment.mode==='adept'?' (Adept)':''}`);
    if(mode!=='normal')parts.push(`${mode==='advantage'?'Advantage':'Disadvantage'} ${advantage>=0?'+':''}${advantage}`);
    if(other)parts.push(`Other ${other>=0?'+':''}${other}`);
    const after=resourceState();
    const expCost=!reroll&&selected.length?(payment.mode==='adept'?`${payment.cost} Stress marked · Experience doubled`:`${payment.cost} Hope spent for Experience${payment.cost===1?'':'s'}`):'';
    const canAdapt=success===false&&selected.length>0&&['odie','velmira'].includes(activeKey)&&!reroll;
    const result=panel.querySelector('[data-trait-result]');if(!result)return;

    result.innerHTML=`<div class="duality-result trait-duality-result ${critical?'critical':axis.toLowerCase()}"><button type="button" class="action-roll-result-close" data-close-roll-result>Close result ×</button><div class="duality-dice"><div class="hope-die"><span>HOPE</span><b>${hope}</b></div><div class="fear-die"><span>FEAR</span><b>${fear}</b></div></div><div class="duality-outcome"><span>${esc(trait)} ROLL</span><strong>${headline}</strong><b>Total ${total}${difficulty?` / Difficulty ${difficulty}`:''}</b><small>${critical?'Gain 1 Hope · clear 1 Stress':axis==='Hope'?'Gain 1 Hope':'GM gains 1 Fear'}</small></div><p class="duality-breakdown">${parts.map(esc).join(' · ')}</p>${expCost?`<p class="duality-cost">${esc(expCost)}</p>`:''}${after?`<p class="duality-resource-state"><b>Hope ${after.hope}/${after.maxHope}</b> · <b>Stress ${after.stress}/${after.maxStress}</b></p>`:''}${difficulty==null&&!critical?'<p class="duality-cost">No Difficulty entered: give the GM the total and whether it rolled with Hope or Fear.</p>':''}${renderPatternChoice(result,hope,fear)}${canAdapt?'<button class="companion-adaptability" type="button" data-trait-adapt>Adaptability · mark 1 Stress and reroll</button>':''}</div>`;

    bindResultClose(result);
    result.querySelector('[data-trait-pattern-gain]')?.addEventListener('click',e=>{api?.gainHope?.(1,'Strange Patterns');e.currentTarget.parentElement.remove();});
    result.querySelector('[data-trait-pattern-clear]')?.addEventListener('click',e=>{api?.clearStress?.(1,'Strange Patterns');e.currentTarget.parentElement.remove();});
    result.querySelector('[data-trait-adapt]')?.addEventListener('click',()=>{const s=resourceState();if(!s||s.maxStress-s.stress<1){errorResult('Adaptability requires 1 free Stress slot.');return;}const marked=api?.markStress?.(1,{reason:'Adaptability reroll',cost:true});if(marked?.ok!==false)performRoll(trait,{reroll:true});});
  }

  function refreshModifiers(){
    const panel=document.getElementById('traitRollPanel');if(!panel)return;
    panel.querySelectorAll('[data-trait-roll]').forEach(button=>{const mod=traitModifier(button.dataset.traitRoll);const b=button.querySelector('b');if(b)b.textContent=`${mod>0?'+':''}${mod}`;});
  }

  function init(){
    const k=key();
    if(!k){activeKey=null;document.getElementById('traitRollPanel')?.remove();return;}
    if(!document.querySelector('#characterSheet .character-sheet-shell'))return;
    if(activeKey!==k){activeKey=k;document.getElementById('traitRollPanel')?.remove();}
    render();
  }

  window.GreywakeTraitRoller={render:init,roll:performRoll,refresh:refreshModifiers};
  let timer;const schedule=()=>{clearTimeout(timer);timer=setTimeout(init,150);};
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('greywake:resources-changed',refreshModifiers);
  window.addEventListener('greywake:companion-resources-changed',refreshModifiers);
  document.addEventListener('click',e=>{if(e.target.closest?.('#chooseBeastform,#changeBeastform,#dropBeastform,[data-beastform]'))setTimeout(refreshModifiers,100);});
  document.addEventListener('DOMContentLoaded',schedule);
})();
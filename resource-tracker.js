(() => {
  const STORAGE_KEY = 'greywake:resources:marek:v1';
  const DEFAULT = { hope:2, maxHope:6, stress:0, maxStress:7, hp:0, maxHP:6, history:[] };
  const ACTION_COSTS = {
    'Wall Walk': { resource:'hope', amount:1, label:'Use Wall Walk', note:'Spend 1 Hope.' },
    'Regeneration': { resource:'hope', amount:3, label:'Use Regeneration', note:'Spend 3 Hope.' },
    'Nature’s Tongue': { resource:'hope', amount:1, label:'Use natural Spellcast +2', note:'Optional: spend 1 Hope before a Spellcast Roll in a natural environment for +2.' },
    'Agile': { resource:'hope', amount:1, label:'Use Agile movement', note:'Spend 1 Hope to move up to Far range without rolling.' },
    'Elusive Prey': { resource:'stress', amount:1, label:'Use Elusive Prey', note:'Mark 1 Stress, then roll the d4 Evasion bonus.' },
    'Hobbling Strike': { resource:'stress', amount:1, label:'Use Hobbling Strike', note:'After a successful Melee attack, mark 1 Stress to make the target temporarily Vulnerable.' }
  };

  let state = null;
  let detailObserver = null;
  let observedPanel = null;

  function isMarek(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase() === 'marek';
  }

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function clamp(n,min,max){ return Math.max(min,Math.min(max,Number(n)||0)); }
  function esc(value){ return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])); }

  function load(){
    if (state) return state;
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      state = saved ? {...DEFAULT,...saved} : clone(DEFAULT);
    }catch(_){ state = clone(DEFAULT); }
    state.hope = clamp(state.hope,0,state.maxHope);
    state.stress = clamp(state.stress,0,state.maxStress);
    state.hp = clamp(state.hp,0,state.maxHP);
    state.history = Array.isArray(state.history) ? state.history.slice(-20) : [];
    return state;
  }

  function save(){
    try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }catch(_){ }
  }

  function snapshot(){
    load();
    return { hope:state.hope,maxHope:state.maxHope,stress:state.stress,maxStress:state.maxStress,hp:state.hp,maxHP:state.maxHP,vulnerable:state.stress>=state.maxStress };
  }

  function commit(next, reason, extra={}){
    load();
    const before = snapshot();
    state.history.push({ before, reason, at:Date.now() });
    state.history = state.history.slice(-20);
    Object.assign(state,next);
    state.hope = clamp(state.hope,0,state.maxHope);
    state.stress = clamp(state.stress,0,state.maxStress);
    state.hp = clamp(state.hp,0,state.maxHP);
    save();
    render();
    const after = snapshot();
    const detail = { ok:true, reason, before, after, ...extra };
    window.dispatchEvent(new CustomEvent('greywake:resources-changed',{detail}));
    return detail;
  }

  function fail(reason,message){
    const detail={ok:false,reason,message,state:snapshot()};
    window.dispatchEvent(new CustomEvent('greywake:resource-error',{detail}));
    showNotice(message,'error');
    return detail;
  }

  function gainHope(amount=1,reason='Gain Hope'){
    load();
    const n=Math.max(0,Number(amount)||0);
    if (!n) return {ok:true,before:snapshot(),after:snapshot(),reason};
    if (state.hope>=state.maxHope){
      showNotice(`Hope is already at its maximum of ${state.maxHope}.`,'info');
      return {ok:true,before:snapshot(),after:snapshot(),reason,capped:true};
    }
    const actual=Math.min(n,state.maxHope-state.hope);
    const result=commit({hope:state.hope+actual},reason,{amount:actual,resource:'hope'});
    showNotice(`+${actual} Hope · ${result.after.hope}/${result.after.maxHope}`,'hope');
    return result;
  }

  function spendHope(amount=1,reason='Spend Hope'){
    load();
    const n=Math.max(0,Number(amount)||0);
    if (state.hope<n) return fail(reason,`Not enough Hope. ${n} required; Marek has ${state.hope}.`);
    const result=commit({hope:state.hope-n},reason,{amount:-n,resource:'hope'});
    showNotice(`−${n} Hope · ${result.after.hope}/${result.after.maxHope}`,'hope');
    return result;
  }

  function clearStress(amount=1,reason='Clear Stress'){
    load();
    const n=Math.max(0,Number(amount)||0);
    const actual=Math.min(n,state.stress);
    if (!actual) return {ok:true,before:snapshot(),after:snapshot(),reason,amount:0};
    const result=commit({stress:state.stress-actual},reason,{amount:-actual,resource:'stress'});
    showNotice(`Cleared ${actual} Stress · ${result.after.stress}/${result.after.maxStress} marked`,'stress');
    return result;
  }

  function markStress(amount=1,options={}){
    load();
    const n=Math.max(0,Number(amount)||0);
    const reason=options.reason || 'Mark Stress';
    const asCost=Boolean(options.cost);
    if (!n) return {ok:true,before:snapshot(),after:snapshot(),reason};
    const free=state.maxStress-state.stress;
    if (asCost && free<n){
      return fail(reason,`Marek cannot use this move: it requires ${n} Stress slot${n===1?'':'s'}, but only ${free} remain.`);
    }
    const stressToMark=Math.min(n,free);
    const overflow=n>free;
    const hpAfter=overflow ? Math.min(state.maxHP,state.hp+1) : state.hp;
    const result=commit({stress:state.stress+stressToMark,hp:hpAfter},reason,{amount:stressToMark,resource:'stress',overflow});
    let message=`Marked ${stressToMark} Stress · ${result.after.stress}/${result.after.maxStress}`;
    if (overflow) message += ` · overflow marked 1 HP`;
    if (result.after.vulnerable) message += ' · VULNERABLE';
    showNotice(message,'stress');
    return result;
  }

  function setResource(resource,value,reason='Manual adjustment'){
    load();
    if (resource==='hope') return commit({hope:clamp(value,0,state.maxHope)},reason,{resource});
    if (resource==='stress') return commit({stress:clamp(value,0,state.maxStress)},reason,{resource});
    if (resource==='hp') return commit({hp:clamp(value,0,state.maxHP)},reason,{resource});
    return fail(reason,'Unknown resource.');
  }

  function undo(){
    load();
    const entry=state.history.pop();
    if (!entry) return fail('Undo','Nothing to undo.');
    const history=state.history;
    state={...state,...entry.before,history};
    save();
    render();
    window.dispatchEvent(new CustomEvent('greywake:resources-changed',{detail:{ok:true,reason:`Undo: ${entry.reason}`,after:snapshot()}}));
    showNotice(`Undid: ${entry.reason}`,'info');
    return {ok:true,after:snapshot()};
  }

  function statNode(label){
    return [...document.querySelectorAll('#characterSheet .character-stat')].find(n=>n.querySelector('span')?.textContent.trim().toLowerCase()===label.toLowerCase()) || null;
  }

  function updateStatStrip(){
    const s=snapshot();
    const hope=statNode('Hope'); if (hope?.querySelector('strong')) hope.querySelector('strong').textContent=`${s.hope} / ${s.maxHope}`;
    const stress=statNode('Stress'); if (stress?.querySelector('strong')) stress.querySelector('strong').textContent=`${s.stress} / ${s.maxStress} marked`;
    const hp=statNode('HP'); if (hp?.querySelector('strong')) hp.querySelector('strong').textContent=`${s.hp} / ${s.maxHP} marked`;
  }

  function pips(resource,current,max,filledMeansMarked=true){
    return Array.from({length:max},(_,i)=>{
      const filled=i<current;
      const label=resource==='hope' ? `Set Hope to ${i+1}` : `Set ${resource==='stress'?'Stress':'HP'} marked to ${i+1}`;
      return `<button type="button" class="live-resource-pip ${filled?'filled':''}" data-resource-set="${resource}" data-resource-value="${i+1}" aria-label="${label}" aria-pressed="${filled?'true':'false'}"></button>`;
    }).join('');
  }

  function resourceRow(resource,label,current,max,sub){
    return `<div class="live-resource-row live-resource-${resource}">
      <div class="live-resource-copy"><span>${label}</span><strong>${current}<small> / ${max}</small></strong><em>${esc(sub)}</em></div>
      <div class="live-resource-controls"><button type="button" data-resource-adjust="${resource}" data-resource-delta="-1" aria-label="Decrease ${label}">−</button><div class="live-resource-pips">${pips(resource,current,max)}</div><button type="button" data-resource-adjust="${resource}" data-resource-delta="1" aria-label="Increase ${label}">+</button></div>
    </div>`;
  }

  function ensureBoard(){
    const identity=document.querySelector('#characterSheet .character-sheet-identity');
    if (!identity) return null;
    let board=identity.querySelector('.pro-resource-board');
    if (!board){
      board=document.createElement('div');
      board.className='pro-resource-board live-resource-board';
      const note=identity.querySelector('.character-sheet-note');
      if (note) note.insertAdjacentElement('beforebegin',board); else identity.appendChild(board);
    }
    board.classList.add('live-resource-board');
    return board;
  }

  function bindBoard(board){
    board.querySelectorAll('[data-resource-adjust]').forEach(button=>button.addEventListener('click',()=>{
      const resource=button.dataset.resourceAdjust;
      const delta=Number(button.dataset.resourceDelta||0);
      const s=snapshot();
      if (resource==='hope') delta>0 ? gainHope(delta,'Manual Hope adjustment') : spendHope(Math.min(-delta,s.hope),'Manual Hope adjustment');
      if (resource==='stress') delta>0 ? markStress(delta,{reason:'Manual Stress adjustment'}) : clearStress(Math.min(-delta,s.stress),'Manual Stress adjustment');
      if (resource==='hp') setResource('hp',s.hp+delta,'Manual HP adjustment');
    }));
    board.querySelectorAll('[data-resource-set]').forEach(button=>button.addEventListener('click',()=>{
      const resource=button.dataset.resourceSet;
      const value=Number(button.dataset.resourceValue||0);
      const s=snapshot();
      const current=resource==='hope'?s.hope:resource==='stress'?s.stress:s.hp;
      setResource(resource,current===value?value-1:value,`Set ${resource}`);
    }));
    board.querySelector('[data-resource-undo]')?.addEventListener('click',undo);
  }

  function renderBoard(){
    const board=ensureBoard();
    if (!board) return;
    const s=snapshot();
    board.innerHTML=`<div class="pro-board-title"><span>LIVE FIELD CONDITION</span><small>Greywake tracks these resources</small></div>
      ${resourceRow('hope','Hope',s.hope,s.maxHope,'spent on Experiences and Hope features')}
      ${resourceRow('stress','Stress',s.stress,s.maxStress,'marked slots')}
      ${resourceRow('hp','HP',s.hp,s.maxHP,'marked · Stress overflow can mark HP')}
      <div class="live-resource-foot"><span class="live-resource-condition ${s.vulnerable?'active':''}">${s.vulnerable?'VULNERABLE · last Stress marked':'Stable · Stress slots remain'}</span><button type="button" data-resource-undo>Undo last change</button></div>`;
    bindBoard(board);
  }

  function showNotice(message,type='info'){
    let host=document.getElementById('resourceNotice');
    if (!host){
      host=document.createElement('div'); host.id='resourceNotice'; host.className='resource-notice'; host.setAttribute('aria-live','polite');
      document.getElementById('characterPageView')?.appendChild(host);
    }
    if (!host) return;
    host.className=`resource-notice ${type} visible`;
    host.textContent=message;
    clearTimeout(showNotice.timer);
    showNotice.timer=setTimeout(()=>host.classList.remove('visible'),2600);
  }

  function render(){
    if (!isMarek()) return;
    load();
    updateStatStrip();
    renderBoard();
    document.body.classList.toggle('resource-vulnerable',snapshot().vulnerable);
  }

  function actionDetail(){ return document.querySelector('#activeActionsPanel .active-action-detail'); }

  function enhanceActionCost(){
    const detail=actionDetail();
    if (!detail) return;
    const title=detail.querySelector('h3')?.textContent.trim();
    const spec=ACTION_COSTS[title];
    detail.querySelector('.resource-action-use')?.remove();
    if (!spec) return;
    const tools=detail.querySelector('.active-action-detail-tools');
    if (!tools) return;
    const wrap=document.createElement('div');
    wrap.className='resource-action-use';
    const s=snapshot();
    const available=spec.resource==='hope' ? s.hope>=spec.amount : (s.maxStress-s.stress)>=spec.amount;
    wrap.innerHTML=`<button type="button" ${available?'':'disabled'}>${esc(spec.label)} · ${spec.resource==='hope'?'Spend':'Mark'} ${spec.amount} ${spec.resource==='hope'?'Hope':'Stress'}</button><small>${esc(available?spec.note:`Unavailable: not enough ${spec.resource==='hope'?'Hope':'free Stress slots'}.`)}</small>`;
    tools.insertAdjacentElement('beforebegin',wrap);
    wrap.querySelector('button')?.addEventListener('click',()=>{
      const result=spec.resource==='hope' ? spendHope(spec.amount,title) : markStress(spec.amount,{reason:title,cost:true});
      if (result.ok) enhanceActionCost();
    });
  }

  function observeActions(){
    const panel=document.getElementById('activeActionsPanel');
    if (!panel || panel===observedPanel) return;
    detailObserver?.disconnect();
    observedPanel=panel;
    detailObserver=new MutationObserver(()=>requestAnimationFrame(enhanceActionCost));
    detailObserver.observe(panel,{childList:true,subtree:true});
    enhanceActionCost();
  }

  function init(){
    if (!isMarek()) return;
    load();
    render();
    observeActions();
  }

  window.GreywakeResources={
    getState:snapshot,
    gainHope,
    spendHope,
    markStress,
    clearStress,
    setResource,
    undo,
    canSpendHope:(n)=>snapshot().hope>=Number(n||0),
    canMarkStress:(n)=>snapshot().stress+Number(n||0)<=snapshot().maxStress,
    render
  };

  let timer;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(init,120)};
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('greywake:resources-changed',()=>{render();enhanceActionCost();});
  document.addEventListener('DOMContentLoaded',schedule);
})();
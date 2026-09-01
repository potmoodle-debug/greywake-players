(() => {
  const BASE_STORAGE_KEY = 'greywake:marek:beastform:v1';

  const FORMS = [
    {
      id:'agile-scout', name:'Agile Scout', examples:'Fox · Mouse · Weasel',
      trait:'Agility', traitBonus:1, evasion:2, range:'Melee', damage:'d4 physical',
      advantages:['Deceive','Locate','Sneak'],
      features:[
        ['Agile','Movement is silent. Spend a Hope to move up to Far range without rolling.'],
        ['Fragile','Taking Major or greater damage immediately ends Beastform.']
      ]
    },
    {
      id:'nimble-grazer', name:'Nimble Grazer', examples:'Deer · Gazelle · Goat',
      trait:'Agility', traitBonus:1, evasion:3, range:'Melee', damage:'d6 physical',
      advantages:['Leap','Sneak','Sprint'],
      features:[
        ['Elusive Prey','When an attack would hit, mark a Stress and roll a d4; add it to Evasion against that attack.'],
        ['Fragile','Taking Major or greater damage immediately ends Beastform.']
      ]
    },
    {
      id:'aquatic-scout', name:'Aquatic Scout', examples:'Eel · Fish · Octopus',
      trait:'Agility', traitBonus:1, evasion:2, range:'Melee', damage:'d4 physical',
      advantages:['Navigate','Sneak','Swim'],
      features:[
        ['Aquatic','Breathe and move naturally underwater.'],
        ['Fragile','Taking Major or greater damage immediately ends Beastform.']
      ]
    },
    {
      id:'household-friend', name:'Household Friend', examples:'Cat · Dog · Rabbit',
      trait:'Instinct', traitBonus:1, evasion:2, range:'Melee', damage:'d6 physical',
      advantages:['Climb','Locate','Protect'],
      features:[
        ['Companion','When Helping an Ally, use a d8 as the advantage die.'],
        ['Fragile','Taking Major or greater damage immediately ends Beastform.']
      ]
    },
    {
      id:'pack-predator', name:'Pack Predator', examples:'Coyote · Hyena · Wolf',
      trait:'Strength', traitBonus:2, evasion:1, range:'Melee', damage:'d8+2 physical',
      advantages:['Attack','Sprint','Track'],
      features:[
        ['Hobbling Strike','After a successful Melee attack, mark a Stress to make the target temporarily Vulnerable.'],
        ['Pack Hunting','If an ally attacked the same target immediately before you, add a d8 to your damage roll.']
      ]
    },
    {
      id:'stalking-arachnid', name:'Stalking Arachnid', examples:'Tarantula · Wolf Spider',
      trait:'Finesse', traitBonus:1, evasion:2, range:'Melee', damage:'d6+1 physical',
      advantages:['Attack','Climb','Sneak'],
      features:[
        ['Venomous Bite','A successful Melee attack can temporarily Poison the target; Poison deals direct physical damage when it acts.'],
        ['Webslinger','Create strong webbing and use a Finesse Roll to temporarily Restrain a target within Close range.']
      ]
    }
  ];

  const state = {
    base:null,
    active:null,
    evolution:false,
    evolutionTrait:'Agility',
    injected:false
  };

  function isMarek(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase() === 'marek';
  }

  function isPreview(){
    return document.body.dataset.gmPreview === 'true';
  }

  function storageKey(){
    return `${BASE_STORAGE_KEY}${isPreview() ? ':gmtest' : ''}`;
  }

  function esc(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function statByLabel(label){
    return [...document.querySelectorAll('#characterSheet .character-stat')].find(n => n.querySelector('span')?.textContent.trim().toLowerCase() === label.toLowerCase()) || null;
  }

  function groupByTitle(title){
    return [...document.querySelectorAll('#characterSheet .sheet-group')].find(g => g.querySelector('.sheet-group-head h3')?.textContent.trim() === title) || null;
  }

  function traitCard(name){
    return [...document.querySelectorAll('#characterSheet .sheet-grid.traits .sheet-card')].find(c => c.querySelector('h4')?.textContent.trim() === name) || null;
  }

  function readNumber(text){
    const m = String(text || '').match(/[+−-]?\d+/);
    if (!m) return 0;
    return Number(m[0].replace('−','-'));
  }

  function formatModifier(n){
    if (n > 0) return `+${n}`;
    if (n < 0) return `−${Math.abs(n)}`;
    return '0';
  }

  function captureBase(){
    if (state.base) return true;
    const evasion = statByLabel('Evasion');
    const armor = statByLabel('Armor');
    if (!evasion || !armor) return false;
    const traits = {};
    ['Agility','Strength','Finesse','Instinct','Presence','Knowledge'].forEach(name => {
      const card = traitCard(name);
      traits[name] = readNumber(card?.querySelector('.sheet-value')?.textContent);
    });
    state.base = {
      evasion:readNumber(evasion.querySelector('strong')?.textContent),
      armor:readNumber(armor.querySelector('strong')?.textContent),
      traits
    };
    return true;
  }

  function loadSaved(){
    try{
      const saved = JSON.parse(localStorage.getItem(storageKey()) || 'null');
      if (!saved) return;
      if (FORMS.some(f => f.id === saved.active)) state.active = saved.active;
      state.evolution = Boolean(saved.evolution);
      if (state.base?.traits && Object.hasOwn(state.base.traits, saved.evolutionTrait)) state.evolutionTrait = saved.evolutionTrait;
      else if (['Agility','Strength','Finesse','Instinct','Presence','Knowledge'].includes(saved.evolutionTrait)) state.evolutionTrait = saved.evolutionTrait;
    }catch(_){ }
  }

  function save(){
    try{
      localStorage.setItem(storageKey(), JSON.stringify({
        active:state.active,
        evolution:state.evolution,
        evolutionTrait:state.evolutionTrait
      }));
    }catch(_){ }
  }

  function currentForm(){
    return FORMS.find(f => f.id === state.active) || null;
  }

  function ensureUI(){
    if (!isMarek()) return false;
    if (!captureBase()) return false;
    const identity = document.querySelector('#characterSheet .character-sheet-identity');
    const page = document.getElementById('characterPageView') || document.body;
    if (!identity) return false;

    if (!document.getElementById('beastformControl')){
      const control = document.createElement('section');
      control.id = 'beastformControl';
      control.className = 'beastform-control';
      control.setAttribute('aria-label','Beastform controls');
      const board = identity.querySelector('.pro-resource-board');
      if (board) board.insertAdjacentElement('beforebegin', control);
      else identity.appendChild(control);
    }

    if (!document.getElementById('beastformDialog')){
      const dialog = document.createElement('dialog');
      dialog.id = 'beastformDialog';
      dialog.className = 'beastform-dialog';
      dialog.innerHTML = `
        <form method="dialog" class="beastform-dialog-shell">
          <div class="beastform-dialog-head">
            <div><span>TIER 1 · DRUID</span><h2>Choose Beastform</h2><p>Marek can currently transform into Tier 1 forms. Choosing one previews and applies its derived sheet statistics.</p></div>
            <button type="submit" class="beastform-dialog-close" aria-label="Close Beastform selector">×</button>
          </div>
          <div id="beastformOptions" class="beastform-options"></div>
          <div class="beastform-dialog-foot">Standard transformation: <strong>mark 1 Stress</strong>. Evolution: <strong>spend 3 Hope instead</strong> and increase one chosen trait by +1.</div>
        </form>`;
      page.appendChild(dialog);
      dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
      });
    }

    return true;
  }

  function renderOptions(){
    const wrap = document.getElementById('beastformOptions');
    if (!wrap || !state.base) return;
    wrap.innerHTML = FORMS.map(form => {
      const newTrait = state.base.traits[form.trait] + form.traitBonus;
      const newEvasion = state.base.evasion + form.evasion;
      const featureNames = form.features.map(f=>f[0]).join(' · ');
      return `<button class="beastform-option ${state.active===form.id?'selected':''}" type="button" data-beastform="${form.id}">
        <span class="beastform-option-tier">TIER 1</span>
        <strong>${esc(form.name)}</strong>
        <small>${esc(form.examples)}</small>
        <div class="beastform-option-stats"><b>${esc(form.trait)} ${formatModifier(newTrait)}</b><b>Evasion ${newEvasion}</b><b>${esc(form.range)} ${esc(form.damage)}</b></div>
        <p>Advantage: ${esc(form.advantages.join(' · '))}</p>
        <em>${esc(featureNames)}</em>
      </button>`;
    }).join('');
    wrap.querySelectorAll('[data-beastform]').forEach(button => {
      button.addEventListener('click', () => {
        state.active = button.dataset.beastform;
        save();
        apply();
        document.getElementById('beastformDialog')?.close();
      });
    });
  }

  function renderControl(){
    const root = document.getElementById('beastformControl');
    if (!root) return;
    const form = currentForm();
    if (!form){
      root.innerHTML = `<div class="beastform-idle">
        <div><span class="beastform-kicker">DRUID · BEASTFORM</span><strong>Humanoid form</strong><small>Select a Tier 1 form to automatically recalculate Marek’s sheet.</small></div>
        <button id="chooseBeastform" type="button">Choose Beastform</button>
      </div>`;
    }else{
      const attackTrait = state.base.traits[form.trait] + form.traitBonus + (state.evolution && state.evolutionTrait===form.trait ? 1 : 0);
      const evasion = state.base.evasion + form.evasion;
      const featureHTML = form.features.map(([name,text])=>`<div><b>${esc(name)}</b><span>${esc(text)}</span></div>`).join('');
      root.innerHTML = `<div class="beastform-active-panel">
        <div class="beastform-active-head">
          <div><span class="beastform-kicker">ACTIVE BEASTFORM · TIER 1</span><strong>${esc(form.name)}</strong><small>${esc(form.examples)}</small></div>
          <div class="beastform-active-actions"><button id="changeBeastform" type="button">Change</button><button id="dropBeastform" type="button">Return to Marek</button></div>
        </div>
        <div class="beastform-combat-line">
          <div><span>EVASION</span><b>${evasion}</b><small>+${form.evasion} form</small></div>
          <div><span>ATTACK TRAIT</span><b>${esc(form.trait)} ${formatModifier(attackTrait)}</b><small>form bonus +${form.traitBonus}</small></div>
          <div><span>BEAST ATTACK</span><b>${esc(form.damage)}</b><small>${esc(form.range)} · ${esc(form.trait)}</small></div>
          <div><span>ARMOR</span><b>${Math.max(0,state.base.armor-1)}</b><small>shield unavailable</small></div>
        </div>
        <div class="beastform-advantages"><span>ADVANTAGE</span>${form.advantages.map(a=>`<b>${esc(a)}</b>`).join('')}</div>
        <div class="beastform-features">${featureHTML}</div>
        <div class="beastform-evolution">
          <label><input id="beastformEvolution" type="checkbox" ${state.evolution?'checked':''}> <span><b>Evolution</b><small>Spend 3 Hope instead of marking Stress; raise one trait by +1 while transformed.</small></span></label>
          <select id="beastformEvolutionTrait" ${state.evolution?'':'disabled'} aria-label="Evolution bonus trait">
            ${Object.keys(state.base.traits).map(t=>`<option value="${t}" ${state.evolutionTrait===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <p class="beastform-cost">${state.evolution?'Activation: spend 3 Hope · no Stress':'Activation: mark 1 Stress'}.</p>
      </div>`;
    }

    root.querySelector('#chooseBeastform')?.addEventListener('click', openDialog);
    root.querySelector('#changeBeastform')?.addEventListener('click', openDialog);
    root.querySelector('#dropBeastform')?.addEventListener('click', () => {
      state.active = null;
      state.evolution = false;
      save();
      apply();
    });
    const evolution = root.querySelector('#beastformEvolution');
    evolution?.addEventListener('change', () => {
      state.evolution = evolution.checked;
      save();
      apply();
    });
    root.querySelector('#beastformEvolutionTrait')?.addEventListener('change', event => {
      state.evolutionTrait = event.target.value;
      save();
      apply();
    });
  }

  function openDialog(){
    renderOptions();
    const dialog = document.getElementById('beastformDialog');
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
  }

  function setStat(label,value,deltaText=''){
    const stat = statByLabel(label);
    if (!stat) return;
    const strong = stat.querySelector('strong');
    if (strong) strong.textContent = String(value);
    stat.classList.toggle('beastform-modified', Boolean(deltaText));
    let delta = stat.querySelector('.beastform-stat-delta');
    if (deltaText && !delta){
      delta = document.createElement('small');
      delta.className='beastform-stat-delta';
      stat.appendChild(delta);
    }
    if (delta) delta.textContent = deltaText;
  }

  function setTrait(name,value,changed){
    const card = traitCard(name);
    if (!card) return;
    const valueNode = card.querySelector('.sheet-value');
    if (valueNode) valueNode.textContent = formatModifier(value);
    card.classList.toggle('beastform-trait-modified', changed);
    let note = card.querySelector('.beastform-trait-note');
    if (changed && !note){
      note=document.createElement('span');
      note.className='beastform-trait-note';
      card.querySelector('summary')?.appendChild(note);
    }
    if (note) note.textContent = changed ? 'BEASTFORM' : '';
  }

  function setAvailability(active){
    const domains = groupByTitle('Domain cards');
    const gear = groupByTitle('Weapons, armor & inventory');
    if (domains){
      domains.classList.toggle('beastform-domain-locked',active);
      let note=domains.querySelector('.beastform-lock-note');
      if (active && !note){
        note=document.createElement('div'); note.className='beastform-lock-note';
        note.innerHTML='<b>Unavailable while transformed</b><span>Beastform prevents Marek from casting spells from domain cards. Spells already active continue normally.</span>';
        domains.querySelector('.sheet-group-head')?.insertAdjacentElement('afterend',note);
      }
      if (note) note.hidden=!active;
    }
    if (gear){
      let note=gear.querySelector('.beastform-lock-note');
      if (active && !note){
        note=document.createElement('div'); note.className='beastform-lock-note';
        note.innerHTML='<b>Weapons unavailable while transformed</b><span>Shortstaff and Round Shield cannot be used. Gambeson becomes part of Marek’s Beastform and its Armor Slots remain in use.</span>';
        gear.querySelector('.sheet-group-head')?.insertAdjacentElement('afterend',note);
      }
      if (note) note.hidden=!active;
      [...gear.querySelectorAll('.sheet-card')].forEach(card => {
        const title=card.querySelector('h4')?.textContent.trim();
        card.classList.toggle('beastform-weapon-locked',active && ['Shortstaff','Round Shield'].includes(title));
      });
    }
  }

  function apply(){
    if (!isMarek() || !ensureUI() || !state.base) return;
    const form = currentForm();
    document.body.classList.toggle('marek-beastform-active',Boolean(form));
    const shell=document.querySelector('#characterSheet .character-sheet-shell');
    shell?.classList.toggle('beastform-active',Boolean(form));

    if (!form){
      setStat('Evasion',state.base.evasion,'');
      setStat('Armor',state.base.armor,'');
      Object.entries(state.base.traits).forEach(([name,value])=>setTrait(name,value,false));
      setAvailability(false);
      renderControl();
      renderOptions();
      return;
    }

    setStat('Evasion',state.base.evasion + form.evasion,`+${form.evasion} Beastform`);
    setStat('Armor',Math.max(0,state.base.armor-1),'Round Shield inactive');
    Object.entries(state.base.traits).forEach(([name,base])=>{
      let value=base;
      if (name===form.trait) value+=form.traitBonus;
      if (state.evolution && name===state.evolutionTrait) value+=1;
      setTrait(name,value,value!==base);
    });
    setAvailability(true);
    renderControl();
    renderOptions();
  }

  function init(){
    if (!isMarek()) return;
    if (!ensureUI()) return;
    if (!state.injected){
      state.injected=true;
      loadSaved();
    }
    apply();
  }

  let timer;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(init,100)};
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
})();

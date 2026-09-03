(() => {
  const META = {
    marek: { sigil:'⌇', line:'WARDEN OF RENEWAL', field:'WILDBORNE' },
    velmira: { sigil:'✦', line:'SCHOOL OF KNOWLEDGE', field:'WANDERBORNE' },
    odie: { sigil:'◇', line:'NIGHTWALKER', field:'UNDERBORNE' }
  };

  function characterKey(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase();
  }

  function parseCapacity(value){
    const raw = String(value || '');
    let m = raw.match(/(\d+)\s*\/\s*(\d+)\s*marked/i);
    if (m) return { current:Number(m[1]), max:Number(m[2]), mode:'marked' };
    m = raw.match(/(\d+)\s*\/\s*(\d+)/);
    if (m) return { current:Number(m[1]), max:Number(m[2]), mode:'current' };
    m = raw.match(/(\d+)/);
    if (m) return { current:null, max:Number(m[1]), mode:'capacity' };
    return null;
  }

  function readStats(){
    return [...document.querySelectorAll('#characterSheet .character-stat')].map(node => ({
      node,
      label:node.querySelector('span')?.textContent.trim() || '',
      value:node.querySelector('strong')?.textContent.trim() || ''
    }));
  }

  function track(label,value,kind){
    const parsed = parseCapacity(value);
    if (!parsed) return '';
    const max = Math.max(1, Math.min(parsed.max, 12));
    let filled = 0;
    if (parsed.mode === 'current') filled = Math.max(0, Math.min(parsed.current,max));
    if (parsed.mode === 'marked') filled = Math.max(0, max - Math.min(parsed.current,max));
    if (parsed.mode === 'capacity') filled = max;
    const pips = Array.from({length:max},(_,i)=>`<i class="pro-pip ${i<filled?'filled':''}" aria-hidden="true"></i>`).join('');
    const caption = parsed.mode === 'capacity' ? `capacity ${max}` : value;
    return `<div class="pro-resource pro-resource-${kind}"><div class="pro-resource-head"><span>${label}</span><strong>${caption}</strong></div><div class="pro-pips" aria-label="${label} ${caption}">${pips}</div></div>`;
  }

  function ensurePortraitFrame(hero){
    if (!hero) return;
    const portrait = hero.querySelector('.character-sheet-portrait,.character-sheet-monogram');
    if (!portrait || portrait.closest('.pro-portrait-frame')) return;
    const frame = document.createElement('div');
    frame.className = 'pro-portrait-frame';
    portrait.parentNode.insertBefore(frame, portrait);
    frame.appendChild(portrait);
    frame.insertAdjacentHTML('beforeend','<span class="pro-corner tl"></span><span class="pro-corner tr"></span><span class="pro-corner bl"></span><span class="pro-corner br"></span><em>FIELD IDENT</em>');
  }

  function buildHeroInstrumentation(){
    const shell = document.querySelector('#characterSheet .character-sheet-shell');
    const hero = shell?.querySelector('.character-sheet-hero');
    if (!shell || !hero) return false;

    shell.classList.add('pro-dossier');
    ensurePortraitFrame(hero);
    if (shell.dataset.professionalised === 'true') return false;

    const key = characterKey();
    const meta = META[key] || {sigil:'◇',line:'FIELD DOSSIER',field:'GREYWAKE'};
    shell.dataset.professionalised = 'true';

    const identity = hero.querySelector('.character-sheet-identity');
    const subtitle = identity?.querySelector('.character-sheet-subtitle');
    if (!identity) return false;

    const ribbon = document.createElement('div');
    ribbon.className = 'pro-identity-ribbon';
    ribbon.innerHTML = `<span class="pro-sigil" aria-hidden="true">${meta.sigil}</span><span>${meta.line}</span><b>${meta.field}</b>`;
    subtitle?.insertAdjacentElement('afterend', ribbon);

    const stats = readStats();
    const byLabel = label => stats.find(s => s.label.toLowerCase() === label.toLowerCase());
    const resources = [];
    const hp = byLabel('HP') || byLabel('HP max');
    const stress = byLabel('Stress') || byLabel('Stress max');
    const hope = byLabel('Hope');
    if (hp) resources.push(track('Hit Points',hp.value,'hp'));
    if (stress) resources.push(track('Stress',stress.value,'stress'));
    if (hope) resources.push(track('Hope',hope.value,'hope'));

    if (resources.length){
      const board = document.createElement('div');
      board.className = 'pro-resource-board';
      board.innerHTML = `<div class="pro-board-title"><span>FIELD CONDITION</span><small>reference state</small></div>${resources.join('')}`;
      const note = identity.querySelector('.character-sheet-note');
      if (note) note.insertAdjacentElement('beforebegin', board);
      else identity.appendChild(board);
    }

    stats.forEach(({node,label})=>{
      const l = label.toLowerCase();
      if (['hp','hp max','stress','stress max','hope'].includes(l)) node.classList.add('pro-stat-resource');
      if (l === 'evasion') node.classList.add('pro-stat-evasion');
      if (l === 'armor') node.classList.add('pro-stat-armor');
      if (l === 'level') node.classList.add('pro-stat-level');
    });

    return true;
  }

  function decorateGroups(){
    const shell = document.querySelector('#characterSheet .character-sheet-shell');
    if (!shell) return;
    [...shell.querySelectorAll('.sheet-group')].forEach((group,index)=>{
      if (group.dataset.proGroup === 'true') return;
      group.dataset.proGroup = 'true';
      const head = group.querySelector('.sheet-group-head');
      if (head){
        const code = document.createElement('span');
        code.className = 'pro-section-code';
        code.textContent = String(index+1).padStart(2,'0');
        head.prepend(code);
      }
      [...group.querySelectorAll('.sheet-card')].forEach((card,i)=>{
        card.style.setProperty('--card-index',String(i));
        const summary = card.querySelector('summary');
        if (!summary || summary.querySelector('.pro-card-mark')) return;
        const mark = document.createElement('span');
        mark.className='pro-card-mark';
        mark.setAttribute('aria-hidden','true');
        mark.textContent = '◈';
        summary.prepend(mark);
      });
    });
  }

  function enhance(){
    if (!document.querySelector('#characterSheet .character-sheet-shell')) return;
    buildHeroInstrumentation();
    decorateGroups();
  }

  let timer;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(enhance,40)};
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
})();

/* Contextual character-sheet help. Kept separate from all live sheet actions: the ? links only navigate to the player guide. */
(() => {
  const GUIDE = 'character-guide.html';
  const EXACT = new Map([
    ['level','level'],['evasion','evasion'],['armor','armor'],['armor score','armor'],['armor slots','armor'],
    ['hp','hit-points'],['hp max','hit-points'],['hit points','hit-points'],['stress','stress'],['stress max','stress'],['hope','hope'],
    ['proficiency','proficiency'],['damage thresholds','damage-thresholds'],['thresholds','damage-thresholds'],
    ['agility','agility'],['strength','strength'],['finesse','finesse'],['instinct','instinct'],['presence','presence'],['knowledge','knowledge'],
    ['traits','traits'],['experiences','experiences'],['features','features'],['domain cards','domain-cards'],
    ['weapons, armor & inventory','equipment'],['weapons, armour & inventory','equipment'],['weapons','weapons'],['inventory','inventory'],
    ['action rolls','action-rolls'],['advantage','advantage'],['disadvantage','advantage'],['conditions','conditions'],
    ['short rest','short-rest'],['long rest','long-rest'],['water','water'],['beastform','beastform']
  ]);

  function clean(text){
    return String(text || '').replace(/\?/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function injectStyles(){
    if (document.getElementById('greywakeSheetHelpStyles')) return;
    const style = document.createElement('style');
    style.id = 'greywakeSheetHelpStyles';
    style.textContent = `
      .sheet-help-host{display:inline-flex!important;align-items:center;gap:2px;min-width:0}
      .sheet-help-link{display:inline-grid!important;place-items:center;flex:0 0 26px;width:26px!important;height:26px!important;margin:-6px -5px -6px 1px!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;color:inherit!important;text-decoration:none!important;vertical-align:middle;opacity:.72;cursor:help;box-shadow:none!important;transform:none!important}
      .sheet-help-link::before{content:'?';display:grid;place-items:center;width:14px;height:14px;border:1px solid currentColor;border-radius:50%;font:800 9px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:0;opacity:.72}
      .sheet-help-link:hover,.sheet-help-link:focus-visible{opacity:1!important;color:#ead28c!important;outline:none!important;background:rgba(225,199,125,.05)!important}
      .sheet-help-link:focus-visible::before{box-shadow:0 0 0 2px rgba(225,199,125,.22)}
      #characterSheet summary .sheet-help-link{position:relative;z-index:4}
      #characterSheet .character-stat>span.sheet-help-host{justify-content:center}
      #characterSheet .pro-resource-head>span.sheet-help-host{gap:0}
      @media(pointer:coarse){.sheet-help-link{flex-basis:30px;width:30px!important;height:30px!important;margin:-8px -7px -8px 1px!important}}
    `;
    document.head.appendChild(style);
  }

  function topicForText(text){
    const value = clean(text);
    if (EXACT.has(value)) return EXACT.get(value);
    if (value.includes('damage threshold')) return 'damage-thresholds';
    if (value.includes('armor slot') || value.includes('armour slot')) return 'armor';
    if (value.includes('hit point')) return 'hit-points';
    if (value.includes('domain')) return 'domain-cards';
    if (value.includes('weapon')) return 'weapons';
    if (value.includes('recall')) return 'recall';
    return null;
  }

  function topicForCard(card, groupName){
    const title = clean(card.querySelector('h4')?.textContent);
    const value = clean(card.querySelector('.sheet-value')?.textContent);
    if (EXACT.has(title)) return EXACT.get(title);
    if (title.includes('beastform')) return 'beastform';
    if (value.includes('hope feature')) return 'hope-feature';
    if (value.includes('class feature')) return 'class-feature';
    if (value.includes('ancestry')) return 'ancestry';
    if (value.includes('community')) return 'community';
    if (value.includes('school of') || value.includes('nightwalker') || value.includes('warden of')) return 'subclass';
    if (value.includes('armor') || value.includes('armour')) return 'armor';
    if (value.includes('weapon')) return 'weapons';
    if (value.includes('inventory')) return 'inventory';
    if (value.includes('recall') || groupName.includes('domain')) return 'domain-cards';
    if (groupName.includes('trait')) return topicForText(title) || 'traits';
    if (groupName.includes('experience')) return 'experiences';
    if (groupName.includes('feature')) return 'features';
    if (groupName.includes('weapon') || groupName.includes('armor') || groupName.includes('inventory')) return 'equipment';
    return null;
  }

  function addHelp(host, topic, label){
    if (!host || !topic || host.dataset.sheetHelp === 'true') return;
    host.dataset.sheetHelp = 'true';
    host.classList.add('sheet-help-host');
    const link = document.createElement('a');
    link.className = 'sheet-help-link';
    link.href = `${GUIDE}#${topic}`;
    link.setAttribute('aria-label', `Explain ${label}`);
    link.title = `What is ${label}?`;
    link.addEventListener('click', event => event.stopPropagation());
    link.addEventListener('pointerdown', event => event.stopPropagation());
    link.addEventListener('keydown', event => event.stopPropagation());
    host.appendChild(link);
  }

  function decorate(){
    injectStyles();
    const root = document.querySelector('#characterSheet .character-sheet-shell');
    if (!root) return;

    root.querySelectorAll('.character-stat > span').forEach(host => {
      const label = host.childNodes[0]?.textContent?.trim() || host.textContent.trim();
      addHelp(host, topicForText(label), label);
    });

    root.querySelectorAll('.pro-resource-head > span').forEach(host => {
      const label = host.childNodes[0]?.textContent?.trim() || host.textContent.trim();
      addHelp(host, topicForText(label), label);
    });

    root.querySelectorAll('.sheet-group').forEach(group => {
      const heading = group.querySelector('.sheet-group-head h3');
      const groupName = clean(heading?.childNodes[0]?.textContent || heading?.textContent);
      if (heading) addHelp(heading, topicForText(groupName), heading.childNodes[0]?.textContent?.trim() || heading.textContent.trim());
      group.querySelectorAll('.sheet-card').forEach(card => {
        const title = card.querySelector('h4');
        if (!title) return;
        const label = title.childNodes[0]?.textContent?.trim() || title.textContent.trim();
        addHelp(title, topicForCard(card, groupName), label);
      });
    });

    root.querySelectorAll('h2,h3,h4,label,.resource-label,.stat-label').forEach(host => {
      if (host.dataset.sheetHelp === 'true' || host.closest('.sheet-card h4')) return;
      const label = host.childNodes[0]?.textContent?.trim() || host.textContent.trim();
      const topic = topicForText(label);
      if (topic) addHelp(host, topic, label);
    });
  }

  let timer;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(decorate, 55); };
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList:true, subtree:true });
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:sheet-enhanced', schedule);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();

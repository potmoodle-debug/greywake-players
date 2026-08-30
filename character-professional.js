(() => {
  const META = {
    marek: { sigil:'⌇', line:'WARDEN OF RENEWAL', field:'WILDBORNE', material:'FIELD BIOLOGY · WASTES' },
    velmira: { sigil:'✦', line:'SCHOOL OF KNOWLEDGE', field:'WANDERBORNE', material:'ARCANE RECORD · GREYWAKE' },
    odie: { sigil:'◇', line:'NIGHTWALKER', field:'UNDERBORNE', material:'SALVAGE RECORD · GREYWAKE' }
  };

  function characterKey(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase();
  }

  function parseCapacity(value){
    const raw = String(value || '');
    let m = raw.match(/(\d+)\s*\/\s*(\d+)/);
    if (m) return { current:Number(m[1]), max:Number(m[2]), mode:'current' };
    m = raw.match(/(\d+)\s*\/\s*(\d+)\s*marked/i);
    if (m) return { current:Number(m[1]), max:Number(m[2]), mode:'marked' };
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

  function buildHeroInstrumentation(){
    const shell = document.querySelector('#characterSheet .character-sheet-shell');
    const hero = shell?.querySelector('.character-sheet-hero');
    if (!shell || !hero || shell.dataset.professionalised === 'true') return false;
    const key = characterKey();
    const meta = META[key] || {sigil:'◇',line:'FIELD DOSSIER',field:'GREYWAKE',material:'PERSONAL RECORD'};
    shell.dataset.professionalised = 'true';
    shell.classList.add('pro-dossier');

    const identity = hero.querySelector('.character-sheet-identity');
    const subtitle = identity?.querySelector('.character-sheet-subtitle');
    if (!identity) return false;

    const ribbon = document.createElement('div');
    ribbon.className = 'pro-identity-ribbon';
    ribbon.innerHTML = `<span class="pro-sigil" aria-hidden="true">${meta.sigil}</span><span>${meta.line}</span><b>${meta.field}</b>`;
    subtitle?.insertAdjacentElement('afterend', ribbon);

    const stamp = document.createElement('div');
    stamp.className = 'pro-record-stamp';
    stamp.innerHTML = `<span>GREYWAKE</span><strong>${meta.material}</strong><small>PERSONAL / PLAYER SAFE</small>`;
    hero.appendChild(stamp);

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

    const portrait = hero.querySelector('.character-sheet-portrait,.character-sheet-monogram');
    if (portrait){
      const frame = document.createElement('div');
      frame.className = 'pro-portrait-frame';
      portrait.parentNode.insertBefore(frame, portrait);
      frame.appendChild(portrait);
      frame.insertAdjacentHTML('beforeend','<span class="pro-corner tl"></span><span class="pro-corner tr"></span><span class="pro-corner bl"></span><span class="pro-corner br"></span><em>FIELD IDENT</em>');
    }

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

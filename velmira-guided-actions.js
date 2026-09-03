(() => {
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const characterName = () => String(window.GreywakePlayer?.character || document.body.dataset.character || '').trim();
  const isVelmira = () => characterName().toLowerCase() === 'velmira';

  function ensureStyle(){
    if(document.getElementById('velmira-guided-actions-style')) return;
    const style = document.createElement('style');
    style.id = 'velmira-guided-actions-style';
    style.textContent = `
      .vga-dialog{max-width:820px;width:min(94vw,820px);border:1px solid #79683c;background:#11110d;color:#e8dec2;padding:0}
      .vga-shell{padding:18px}
      .vga-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;border-bottom:1px solid rgba(196,173,101,.28);padding-bottom:14px}
      .vga-head span{font-size:9px;letter-spacing:.16em;color:#c7b7dd;font-weight:800}
      .vga-head h2{margin:3px 0 4px;color:#f2e7c8;font-size:28px}
      .vga-head p{margin:0;color:#aaa18b;max-width:620px;line-height:1.45}
      .vga-close{border:1px solid #4f4935;background:#1b1912;color:#e8dec2;width:36px;height:36px;font-size:22px;cursor:pointer}
      .vga-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
      .vga-choice{display:block;width:100%;text-align:left;border:1px solid #4f4935;background:#1b1912;color:inherit;padding:13px;cursor:pointer;min-height:90px}
      .vga-choice:hover,.vga-choice:focus-visible{border-color:#9f874e;background:#272218}
      .vga-choice b{display:block;color:#f2dfaa;font-size:15px;margin-bottom:4px}
      .vga-choice small{display:block;color:#aaa18b;line-height:1.4}
      .vga-back{margin-top:12px;border:1px solid #4f4935;background:#1b1912;color:#d8cba8;padding:8px 11px;cursor:pointer}
      .vga-list{display:grid;gap:8px;margin-top:14px}
      .vga-action{display:block;width:100%;text-align:left;border:1px solid #4f4935;background:#1b1912;color:inherit;padding:11px;cursor:pointer}
      .vga-action:hover,.vga-action:focus-visible{border-color:#9f874e;background:#272218}
      .vga-action span{font-size:8px;letter-spacing:.1em;color:#aa9d79}
      .vga-action strong{display:block;color:#f2dfaa;margin:3px 0}
      .vga-action small{display:block;color:#aaa18b;line-height:1.35}
      .vga-empty{padding:18px;border:1px dashed #4f4935;color:#aaa18b;margin-top:14px}
      @media(max-width:680px){.vga-grid{grid-template-columns:1fr}.vga-head h2{font-size:23px}}
    `;
    document.head.appendChild(style);
  }

  function dialog(){
    let d = document.getElementById('velmiraGuidedActions');
    if(!d){
      d = document.createElement('dialog');
      d.id = 'velmiraGuidedActions';
      d.className = 'vga-dialog';
      document.body.appendChild(d);
      d.addEventListener('click', e => { if(e.target === d) d.close(); });
    }
    return d;
  }

  function cards(){
    const panel = document.getElementById('activeActionsPanel');
    if(!panel) return [];
    return [...panel.querySelectorAll('.active-action-card')]
      .filter(card => !card.disabled && !card.classList.contains('equipment-action-disabled') && !card.classList.contains('p10-action-card-unavailable'))
      .map(card => ({
        card,
        title: card.querySelector('.active-action-copy strong')?.textContent.trim() || 'Action',
        meta: card.querySelector('em')?.textContent.trim() || '',
        text: card.textContent.toLowerCase(),
        attack: card.classList.contains('active-action-attack') || /attack/i.test(card.querySelector('em')?.textContent || '')
      }));
  }

  const categories = [
    {id:'attack', title:'Attack or cast a spell', help:'Weapons, damaging spells and other direct offensive actions.', match:a => a.attack || /spell|damage|attack/.test(a.text)},
    {id:'social', title:'Help, persuade or deceive someone', help:'Social approaches, support and abilities that influence another person.', match:a => /presence|persuad|deceiv|help|ally|friend|social/.test(a.text)},
    {id:'investigate', title:'Investigate or understand something', help:'Knowledge, observation, magical understanding and information-gathering.', match:a => /knowledge|study|investigat|understand|recall|sense|detect|school/.test(a.text)},
    {id:'move', title:'Move, avoid danger or do something physical', help:'Mobility, positioning, escape and physical problem-solving.', match:a => /agility|finesse|strength|move|wall walk|dodge|avoid|escape|movement/.test(a.text)},
    {id:'special', title:'Use one of Velmira’s special abilities', help:'Class, subclass, ancestry and domain abilities that do not fit the choices above.', match:a => !a.attack},
    {id:'unsure', title:'I’m not sure', help:'Show every action Velmira can currently use, without making you choose a rules category first.', match:() => true}
  ];

  function head(title, subtitle){
    return `<div class="vga-head"><div><span>VELMIRA · PLAY GUIDE</span><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div><button type="button" class="vga-close" data-vga-close aria-label="Close">×</button></div>`;
  }

  function wireCommon(d){
    d.querySelector('[data-vga-close]')?.addEventListener('click', () => d.close());
  }

  function showRoot(){
    ensureStyle();
    const d = dialog();
    d.innerHTML = `<div class="vga-shell">${head('What does Velmira want to do?','Choose the intention first. The sheet will then show the relevant actions that are available right now.')}<div class="vga-grid">${categories.map(c => `<button type="button" class="vga-choice" data-vga-category="${c.id}"><b>${esc(c.title)}</b><small>${esc(c.help)}</small></button>`).join('')}</div></div>`;
    wireCommon(d);
    d.querySelectorAll('[data-vga-category]').forEach(btn => btn.addEventListener('click', () => showCategory(btn.dataset.vgaCategory)));
    if(typeof d.showModal === 'function' && !d.open) d.showModal(); else d.setAttribute('open','');
  }

  function showCategory(id){
    const category = categories.find(c => c.id === id) || categories[categories.length - 1];
    const all = cards();
    let matches = all.filter(category.match);
    if(id !== 'unsure' && id !== 'special'){
      const seen = new Set();
      matches = matches.filter(a => !seen.has(a.title) && seen.add(a.title));
    }
    const d = dialog();
    d.innerHTML = `<div class="vga-shell">${head(category.title, category.help)}<button type="button" class="vga-back" data-vga-back>← Back to intentions</button>${matches.length ? `<div class="vga-list">${matches.map((a,i) => `<button type="button" class="vga-action" data-vga-action="${i}"><span>${a.attack ? 'ATTACK / SPELL' : 'ABILITY'}</span><strong>${esc(a.title)}</strong>${a.meta ? `<small>${esc(a.meta)}</small>` : ''}</button>`).join('')}</div>` : '<div class="vga-empty">No matching live action is currently available. You can still make a normal trait roll from the sheet.</div>'}</div>`;
    wireCommon(d);
    d.querySelector('[data-vga-back]')?.addEventListener('click', showRoot);
    d.querySelectorAll('[data-vga-action]').forEach(btn => btn.addEventListener('click', () => {
      const action = matches[Number(btn.dataset.vgaAction)];
      d.close();
      action?.card?.click();
    }));
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest?.('[data-p10-can-do]');
    if(!btn || !isVelmira()) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    showRoot();
  }, true);
})();

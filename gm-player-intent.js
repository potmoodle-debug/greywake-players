(() => {
  const names = {marek:'Marek',velmira:'Velmira',odie:'Odie'};
  const players = Object.keys(names);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gm = () => document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  let pending = false;
  function installStyle() {
    if (document.getElementById('gm-player-intent-style')) return;
    const style = document.createElement('style');
    style.id = 'gm-player-intent-style';
    style.textContent = `
    .gm-player-intent{margin:0 0 24px;padding:23px;border:1px solid #5f5538;background:linear-gradient(145deg,#242218,#151610);color:#e7ddc3;scroll-margin-top:86px}
    .gm-player-intent h2{font:30px Georgia,serif;margin:6px 0}.gm-player-intent p{font-size:12px;color:#a9a08b;line-height:1.6;margin:0 0 16px}
    .gm-intent-top{display:flex;justify-content:space-between;align-items:center;gap:16px}.gm-intent-top button{border:1px solid #746342;background:transparent;color:#e8d4a0;padding:9px 13px;cursor:pointer}
    .gm-intent-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.gm-intent-player{border:1px solid #494435;background:#141510;padding:15px;min-width:0}.gm-intent-player h3{font:22px Georgia,serif;margin:0 0 12px;color:#ebdfc0}.gm-intent-player h3 small{font:10px sans-serif;letter-spacing:.1em;color:#918775}
    .gm-intent-group{margin-top:13px}.gm-intent-label{display:flex;justify-content:space-between;gap:8px;margin-bottom:7px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#b9a776}.gm-intent-group[data-state="pursuing"] .gm-intent-label{color:#efd17c}
    .gm-intent-item{display:block;width:100%;margin:5px 0;padding:10px 11px;text-align:left;border:1px solid #403d30;background:#202017;color:#ddd4bd;cursor:pointer;font:13px/1.4 Georgia,serif;overflow-wrap:anywhere}.gm-intent-item:hover,.gm-intent-item:focus-visible{border-color:#bb9c57;background:#2b281c;outline:none}.gm-intent-item small{display:block;font:10px/1.5 sans-serif;color:#988e78;margin-top:4px}.gm-intent-group[data-state="pursuing"] .gm-intent-item{border-left:3px solid #c9a85a}.gm-intent-group[data-state="dormant"] .gm-intent-item{opacity:.76}.gm-intent-empty{font:11px/1.4 sans-serif;color:#716b5b;margin:4px 0 0}.gm-intent-note{margin:16px 0 0!important;font-size:10px!important}
    .gm-intent-shortcut{border-color:#a68e56!important;color:#e4cb90!important}
    @media(max-width:900px){.gm-intent-grid{grid-template-columns:1fr}.gm-player-intent{padding:16px}}
    `;
    document.head.appendChild(style);
  }
  function parseGoal(card) {
    const kind = card.dataset.entryKind;
    if (kind !== 'interest') return null;
    const label = card.querySelector('.interest-status')?.textContent.toUpperCase() || '';
    const state = label.includes('SET ASIDE') ? 'dormant' : label.includes('PLAYED / RESOLVED') ? 'done' : label.includes('PURSUING') ? 'pursuing' : 'open';
    return {
      id: card.dataset.goalId,
      state,
      title: card.querySelector('.interest-thread-head h3')?.textContent.trim() || 'Untitled interest',
      source: card.querySelector('.interest-source')?.textContent.replace(/Connected to/i,'').trim() || '',
      card
    };
  }
  function openOriginal(id) {
    const cards = [...document.querySelectorAll('#playerGoals .gm-interest-thread')];
    const card = cards.find(c => c.dataset.goalId === id);
    if (!card) return;
    const group = card.closest('.gm-goal-group');
    group?.querySelectorAll('.resolved-goals').forEach(d => {if(d.contains(card)) d.open = true;});
    document.querySelectorAll('#playerGoals .gm-engagement-filter[aria-pressed="true"]').forEach(b => b.click());
    card.hidden = false;
    group.hidden = false;
    card.scrollIntoView({behavior:'smooth',block:'center'});
    card.style.outline = '2px solid #c9a85a';
    setTimeout(() => {card.style.outline='';},2000);
  }
  function groupMarkup(items,state,label) {
    const matches=items.filter(x=>x.state===state);
    return `<section class="gm-intent-group" data-state="${state}"><div class="gm-intent-label"><strong>${label}</strong><span>${matches.length}</span></div>${matches.length?matches.map(x=>`<button class="gm-intent-item" type="button" data-intent-open="${esc(x.id)}">${esc(x.title)}${x.source?`<small>${esc(x.source)}</small>`:''}</button>`).join(''):'<p class="gm-intent-empty">Nothing recorded</p>'}</section>`;
  }
  function render() {
    if(!gm()) {document.getElementById('gmPlayerIntent')?.remove();document.getElementById('gmIntentShortcut')?.remove();return;}
    const host=document.getElementById('playerGoals');
    if(!host || !host.querySelector('.gm-goal-group')) return;
    installStyle();
    let shortcut=document.getElementById('gmIntentShortcut');
    if(!shortcut) {
      shortcut=document.createElement('button');
      shortcut.id='gmIntentShortcut';
      shortcut.type='button';
      shortcut.className='gm-intent-shortcut';
      shortcut.dataset.primarySection='gm-intent';
      shortcut.textContent='Player Intent';
      shortcut.addEventListener('click',()=>{location.hash='#/gm-inbox';const focus=()=>{const panel=document.getElementById('gmPlayerIntent');if(panel && panel.getClientRects().length){panel.scrollIntoView({behavior:'smooth',block:'start'});return true;}return false;};if(!focus()){let attempts=0;const check=setInterval(()=>{if(focus()||++attempts>=20)clearInterval(check);},100);}});
      const nav=document.getElementById('primaryNav');
      nav?.appendChild(shortcut);
    }
    const entries={};
    for(const key of players) {
      const section=[...host.querySelectorAll('.gm-goal-group')].find(el => el.querySelector('.eyebrow')?.textContent.trim().toLowerCase()===key);
      entries[key]=section?[...section.querySelectorAll('.gm-interest-thread')].map(parseGoal).filter(Boolean):[];
    }
    const signature=JSON.stringify(players.map(k=>entries[k].map(x=>[x.id,x.state,x.title,x.source])));
    let panel=document.getElementById('gmPlayerIntent');
    if(panel?.dataset.signature===signature) return;
    panel?.remove();
    panel=document.createElement('section');
    panel.id='gmPlayerIntent';
    panel.className='gm-player-intent';
    panel.dataset.signature=signature;
    panel.setAttribute('aria-label','Player Intent');
    panel.innerHTML=`<div class="gm-intent-top"><div><div class="eyebrow">GM · PLAYER-DIRECTED PREP</div><h2>Player Intent</h2></div><button type="button" data-intent-refresh>Refresh view</button></div><p>What each player has chosen to pursue, keeps in mind, or deliberately sets aside. Only recorded player interests appear here; questions and played/resolved threads remain in the inbox below.</p><div class="gm-intent-grid">${players.map(key=>`<article class="gm-intent-player"><h3>${names[key]} <small>${key==='marek'?'MARTIN':key==='velmira'?'CARLA':'RITCHIE'}</small></h3>${groupMarkup(entries[key],'pursuing','Pursuing')}${groupMarkup(entries[key],'open','Interested')}${groupMarkup(entries[key],'dormant','Set Aside')}</article>`).join('')}</div><p class="gm-intent-note">Selecting an item opens its existing GM conversation below. Set Aside is not the same as Played / Resolved. This view does not change player choices.</p>`;
    host.prepend(panel);
    panel.querySelectorAll('[data-intent-open]').forEach(b=>b.addEventListener('click',()=>openOriginal(b.dataset.intentOpen)));
    panel.querySelector('[data-intent-refresh]')?.addEventListener('click',()=>{panel.dataset.signature='';render();});
  }
  function schedule() { if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;render();}); }
  const host=document.getElementById('playerGoals');
  if(host) new MutationObserver(schedule).observe(host,{childList:true,subtree:true,characterData:true});
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:gm-goals-rendered',schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
  schedule();
})();
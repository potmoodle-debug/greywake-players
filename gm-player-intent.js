(() => {
  const names = {marek:'Marek',velmira:'Velmira',odie:'Odie'};
  const players = Object.keys(names);
  const portraits = {marek:'assets/canon/characters/marek-canon.jpg',velmira:'assets/canon/characters/velmira-poster.webp',odie:'assets/canon/characters/odie-canon.webp'};
  const owners = {marek:'MARTIN',velmira:'CARLA',odie:'RITCHIE'};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gm = () => document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  let pending = false;
  function installStyle() {
    if (document.getElementById('gm-player-intent-style')) return;
    const style = document.createElement('style');
    style.id = 'gm-player-intent-style';
    style.textContent = `
    .gm-player-intent{margin:0 0 30px;border:1px solid #685a3b;background:#13140f;color:#eae2d0;scroll-margin-top:85px;overflow:hidden;box-shadow:0 22px 55px #0005}
    .gm-intent-hero{position:relative;min-height:205px;display:flex;align-items:end;padding:30px 34px;background:linear-gradient(90deg,#12140f 4%,#17170de8 38%,#1a1a0f42 100%),url('assets/tower-distant.jpg') center 37%/cover}
    .gm-intent-hero .eyebrow{color:#c4a569;letter-spacing:.19em}.gm-intent-hero h2{font:clamp(34px,5vw,58px)/1.08 Georgia,serif;margin:9px 0;color:#f7e9c8;text-shadow:0 2px 18px #000}
    .gm-intent-hero p{max-width:580px;margin:0;color:#d1c8ae;font-size:13px;line-height:1.6}
    .gm-intent-body{padding:22px 24px 24px}
    .gm-intent-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .gm-intent-player{background:#1c1e17;border:1px solid #514934;min-width:0;overflow:hidden}
    .gm-intent-person{position:relative;height:230px;overflow:hidden;background:#2d2921}
    .gm-intent-person img{position:absolute;width:100%;height:100%;object-fit:cover;object-position:center 27%;filter:saturate(.78) contrast(1.08)}
    .gm-intent-person:after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,#171a15 3%,#171a15a0 33%,transparent 83%)}
    .gm-intent-identity{position:absolute;bottom:18px;left:19px;right:12px;z-index:1}
    .gm-intent-identity small{font:700 10px sans-serif;letter-spacing:.2em;color:#d3bd88}
    .gm-intent-identity h3{font:32px Georgia,serif;color:#f8ead0;margin:2px 0 0}
    .gm-intent-states{display:flex;gap:5px;padding:10px 12px;background:#13150f;border-bottom:1px solid #343326}
    .gm-intent-states span{flex:1;text-align:center;color:#aaa38b;font:10px/1.5 sans-serif}.gm-intent-states b{display:block;font:20px Georgia,serif;color:#ead4a1}
    .gm-intent-content{padding:8px 14px 18px}
    .gm-intent-group{margin-top:16px}.gm-intent-label{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;color:#bba780;font:700 10px sans-serif;letter-spacing:.15em;text-transform:uppercase}
    .gm-intent-label span{display:inline-grid;place-items:center;width:24px;height:24px;border:1px solid #4b4430;border-radius:50%;letter-spacing:normal}
    .gm-intent-group[data-state="pursuing"] .gm-intent-label{color:#efcc70}
    .gm-intent-item{width:100%;display:block;margin:5px 0 0;padding:12px 13px;text-align:left;background:#252720;border:1px solid #484637;border-left:3px solid #817957;color:#eee3c9;cursor:pointer;font:15px/1.35 Georgia,serif;overflow-wrap:anywhere}
    .gm-intent-item:hover,.gm-intent-item:focus-visible{background:#383629;border-color:#e0be72;outline:none}
    .gm-intent-item small{display:block;margin-top:6px;color:#aa9e83;font:11px/1.4 sans-serif}
    .gm-intent-group[data-state="pursuing"] .gm-intent-item{border-left:4px solid #e2b654;background:#303022;box-shadow:inset 0 0 24px #bea15b0b}
    .gm-intent-group[data-state="dormant"] .gm-intent-item{background:#1b1c19;color:#b1ae9f;border-left-color:#55584c}
    .gm-intent-empty{margin:0;color:#817f70;font:12px/1.4 sans-serif;padding:9px 0}
    .gm-intent-footer{margin:18px 0 0;color:#9e967e;font:11px/1.5 sans-serif}
    .gm-intent-shortcut{border-color:#a68e56!important;color:#e4cb90!important}
    @media(max-width:1050px){.gm-intent-grid{grid-template-columns:1fr}.gm-intent-player{display:grid;grid-template-columns:240px 1fr}.gm-intent-person{height:100%;min-height:280px;grid-row:span 2}.gm-intent-states{align-self:start}}
    @media(max-width:570px){.gm-intent-hero{padding:23px;min-height:175px}.gm-intent-body{padding:12px}.gm-intent-player{display:block}.gm-intent-person{height:215px;min-height:0}}
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
    panel.innerHTML=`<header class="gm-intent-hero"><div><div class="eyebrow">GREYWAKE · GM FIELD NOTES</div><h2>Where their attention lies.</h2><p>Three characters. Three different directions. What they are actively pursuing, what still interests them, and what they have chosen to leave alone.</p></div></header><div class="gm-intent-body"><div class="gm-intent-grid">${players.map(key=>{const items=entries[key];return `<article class="gm-intent-player"><div class="gm-intent-person"><img src="${portraits[key]}" alt="Established portrait of ${names[key]}" loading="lazy"><div class="gm-intent-identity"><small>${owners[key]} · PLAYER CHARACTER</small><h3>${names[key]}</h3></div></div><div class="gm-intent-states"><span><b>${items.filter(x=>x.state==='pursuing').length}</b>Pursuing</span><span><b>${items.filter(x=>x.state==='open').length}</b>Interested</span><span><b>${items.filter(x=>x.state==='dormant').length}</b>Set Aside</span></div><div class="gm-intent-content">${groupMarkup(items,'pursuing','01 · Pursuing')}${groupMarkup(items,'open','02 · Interested')}${groupMarkup(items,'dormant','03 · Set Aside')}</div></article>`}).join('')}</div><p class="gm-intent-footer">Select an interest to open its existing GM conversation. Questions and played/resolved stories remain in the inbox. This view never changes the players' choices.</p></div>`;
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
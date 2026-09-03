(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/live-reveals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const POLL_MS = 3000;
  const SEEN_PREFIX = 'greywake-live-reveals-seen-v1:';
  const KINDS = {
    knowledge: 'Knowledge', npc: 'NPC', location: 'Location', creature: 'Creature',
    possibility: 'Possibility', conversation: 'Conversation', handout: 'Handout'
  };
  let timer = null;
  let lastSignature = '';

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }
  function fullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }
  function playerSlug() {
    return String(document.body.dataset.character || '').toLowerCase();
  }
  function identity() {
    if (fullGM()) return { character:'gm', code:'GREYWAKE' };
    const slug = playerSlug();
    const codes = { marek:'MAREK', velmira:'VELMIRA', odie:'ODIE' };
    return { character:slug, code:codes[slug] || '' };
  }
  async function request(method='GET', body=null) {
    const id = identity();
    if (!id.character || !id.code) throw new Error('Greywake identity unavailable.');
    const response = await fetch(API_URL, {
      method,
      headers:{ apikey:API_KEY, 'Content-Type':'application/json', 'x-greywake-character':id.character, 'x-greywake-code':id.code },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Greywake live reveal failed.');
    return data;
  }

  function ensureStyles() {
    if (document.getElementById('live-reveal-styles')) return;
    const style = document.createElement('style');
    style.id = 'live-reveal-styles';
    style.textContent = `
      .gm-live-reveal-bar{position:sticky;top:0;z-index:80;display:grid;grid-template-columns:120px minmax(220px,1fr) auto;gap:8px;align-items:center;padding:10px 14px;border-bottom:1px solid #5b5033;background:rgba(20,20,15,.97);box-shadow:0 8px 24px rgba(0,0,0,.25)}
      .gm-live-reveal-bar select,.gm-live-reveal-bar input{min-width:0;border:1px solid #494332;background:#10110d;color:#e1d7bf;padding:9px 10px;font:11px/1.2 system-ui,sans-serif}.gm-live-reveal-targets{display:flex;gap:5px;flex-wrap:wrap}.gm-live-reveal-targets button{border:1px solid #74623b;background:#262116;color:#ecd898;padding:9px 11px;font:800 9px/1 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.05em;cursor:pointer}.gm-live-reveal-targets button:hover{border-color:#b39655;color:#fff0bd}.gm-live-reveal-targets button:disabled{opacity:.45;cursor:wait}.gm-live-reveal-state{grid-column:2/-1;color:#9d947f;font-size:9px;min-height:12px}
      .live-reveals-panel{margin:0 0 22px;border:1px solid #50472f;background:#171812;box-shadow:0 12px 30px rgba(0,0,0,.14)}.live-reveals-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #39362a}.live-reveals-head small{color:#97875d;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.live-reveals-head strong{color:#eadba8;font:700 16px/1.2 Georgia,serif}.live-reveals-list{display:grid;gap:0}.live-reveal-item{padding:13px 14px;border-bottom:1px solid #302f27}.live-reveal-item:last-child{border-bottom:0}.live-reveal-item span{display:block;color:#8e8060;font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}.live-reveal-item strong{display:block;color:#e2d8bf;font-size:12px;margin-bottom:4px}.live-reveal-item p{margin:0;color:#b5ad9a;font-size:11px;line-height:1.5}.live-reveal-item button{margin-top:8px;border:0;background:none;color:#d4bd79;padding:0;font-size:9px;font-weight:800;cursor:pointer;text-transform:uppercase}.live-reveal-empty{padding:15px;color:#8d8574;font-size:10px}
      .live-reveal-toast{position:fixed;right:18px;bottom:18px;z-index:200;width:min(390px,calc(100vw - 36px));border:1px solid #8c7542;background:#1c1a12;box-shadow:0 18px 50px rgba(0,0,0,.45);padding:14px 15px}.live-reveal-toast small{display:block;color:#a89159;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin-bottom:5px}.live-reveal-toast strong{display:block;color:#f1dfa9;font:700 16px/1.2 Georgia,serif;margin-bottom:5px}.live-reveal-toast p{margin:0;color:#c5bba1;font-size:11px;line-height:1.45}.live-reveal-toast button{margin-top:10px;border:1px solid #76623b;background:#292215;color:#ecd898;padding:8px 10px;font-size:9px;font-weight:800;text-transform:uppercase;cursor:pointer}
      @media(max-width:850px){.gm-live-reveal-bar{grid-template-columns:1fr}.gm-live-reveal-state{grid-column:auto}.gm-live-reveal-targets button{flex:1}.gm-live-reveal-bar{position:relative}}
    `;
    document.head.appendChild(style);
  }

  function ensureGMBar() {
    const existing = document.getElementById('gmLiveRevealBar');
    const shouldShow = fullGM() && location.hash === '#/gm-session';
    if (!shouldShow) { existing?.remove(); return; }
    if (existing) return;
    const bar = document.createElement('section');
    bar.id = 'gmLiveRevealBar';
    bar.className = 'gm-live-reveal-bar';
    bar.setAttribute('aria-label','Publish player knowledge');
    bar.innerHTML = `
      <select id="gmLiveRevealKind" aria-label="Reveal type">${Object.entries(KINDS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>
      <input id="gmLiveRevealText" maxlength="1200" autocomplete="off" placeholder="What did they just learn?">
      <div class="gm-live-reveal-targets" aria-label="Reveal to"><button data-reveal-to="party">Party</button><button data-reveal-to="marek">Marek</button><button data-reveal-to="velmira">Velmira</button><button data-reveal-to="odie">Odie</button></div>
      <div id="gmLiveRevealState" class="gm-live-reveal-state">Type one player-safe sentence, then tap who sees it.</div>`;
    const main = document.getElementById('mainContent');
    main?.insertBefore(bar, main.firstChild);
    bar.querySelectorAll('[data-reveal-to]').forEach(btn => btn.addEventListener('click', () => publish(btn.dataset.revealTo)));
    bar.querySelector('input')?.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); publish('party'); }
    });
  }

  async function publish(audience) {
    const bar = document.getElementById('gmLiveRevealBar');
    const input = bar?.querySelector('#gmLiveRevealText');
    const kind = bar?.querySelector('#gmLiveRevealKind')?.value || 'knowledge';
    const state = bar?.querySelector('#gmLiveRevealState');
    const text = String(input?.value || '').trim();
    if (!text) { input?.focus(); return; }
    bar?.querySelectorAll('button').forEach(b => b.disabled = true);
    if (state) state.textContent = `Publishing to ${audience === 'party' ? 'the party' : audience}…`;
    try {
      await request('POST', { kind, audience:[audience], body:text });
      if (input) { input.value=''; input.focus(); }
      if (state) state.textContent = `Revealed to ${audience === 'party' ? 'Party' : audience[0].toUpperCase()+audience.slice(1)}.`;
      setTimeout(()=>{ if(state) state.textContent='Type one player-safe sentence, then tap who sees it.'; },1800);
    } catch (error) {
      if (state) state.textContent = error.message;
    } finally {
      bar?.querySelectorAll('button').forEach(b => b.disabled = false);
    }
  }

  function panelHost() {
    const home = document.getElementById('home');
    if (!home) return null;
    let panel = document.getElementById('liveRevealsPanel');
    if (!panel) {
      panel = document.createElement('section');
      panel.id='liveRevealsPanel'; panel.className='live-reveals-panel';
      const goals = document.getElementById('playerGoals');
      if (goals?.parentNode) goals.parentNode.insertBefore(panel, goals.nextSibling); else home.prepend(panel);
    }
    return panel;
  }

  function revealTitle(item) {
    return item.title || KINDS[item.reveal_kind] || 'New information';
  }
  function renderPlayerPanel(items) {
    const panel = panelHost(); if (!panel) return;
    panel.innerHTML = `<div class="live-reveals-head"><div><small>REVEALED IN PLAY</small><strong>What you have just learned</strong></div><small>${items.length} live ${items.length===1?'reveal':'reveals'}</small></div><div class="live-reveals-list">${items.length ? items.map(item=>`<article class="live-reveal-item"><span>${esc(KINDS[item.reveal_kind] || item.reveal_kind)}</span><strong>${esc(revealTitle(item))}</strong><p>${esc(item.body)}</p>${item.source_route ? `<button data-live-route="${esc(item.source_route)}">Open related record →</button>` : ''}</article>`).join('') : '<div class="live-reveal-empty">Nothing new has been revealed through the live GM controls yet.</div>'}</div>`;
    panel.querySelectorAll('[data-live-route]').forEach(btn => btn.addEventListener('click',()=>{ location.hash=btn.dataset.liveRoute; }));
  }
  function seenKey(){ return SEEN_PREFIX + playerSlug(); }
  function readSeen(){ try { return new Set(JSON.parse(localStorage.getItem(seenKey()) || '[]')); } catch { return new Set(); } }
  function writeSeen(set){ localStorage.setItem(seenKey(), JSON.stringify([...set].slice(-100))); }
  function showToast(item) {
    document.querySelector('.live-reveal-toast')?.remove();
    const toast = document.createElement('aside'); toast.className='live-reveal-toast';
    toast.innerHTML=`<small>NEW ${esc(KINDS[item.reveal_kind] || 'REVEAL')}</small><strong>${esc(revealTitle(item))}</strong><p>${esc(item.body)}</p><button type="button">Got it</button>`;
    toast.querySelector('button').addEventListener('click',()=>toast.remove()); document.body.appendChild(toast);
    setTimeout(()=>toast.remove(),12000);
  }

  async function poll() {
    if (fullGM()) return;
    const slug = playerSlug();
    if (!['marek','velmira','odie'].includes(slug)) return;
    try {
      const data = await request('GET');
      const items = Array.isArray(data.reveals) ? data.reveals : [];
      const signature = items.map(x=>x.id).join(',');
      if (signature === lastSignature) return;
      const firstLoad = lastSignature === '';
      lastSignature = signature;
      renderPlayerPanel(items);
      const seen = readSeen();
      const unseen = items.filter(item => !seen.has(item.id));
      if (!firstLoad && unseen.length) showToast(unseen[unseen.length-1]);
      items.forEach(item => seen.add(item.id)); writeSeen(seen);
    } catch (_) { /* quiet during play; next poll retries */ }
  }

  function refreshMode() {
    ensureStyles(); ensureGMBar();
    if (timer) { clearInterval(timer); timer=null; }
    if (!fullGM()) { poll(); timer=setInterval(poll,POLL_MS); }
    else document.getElementById('liveRevealsPanel')?.remove();
  }

  window.addEventListener('hashchange',()=>setTimeout(refreshMode,0));
  window.addEventListener('greywake:player-ready',()=>setTimeout(refreshMode,0));
  document.addEventListener('DOMContentLoaded',refreshMode);
  refreshMode();
})();
(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/live-reveals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const POLL_MS = 3000;
  const KINDS = { knowledge:'Knowledge', npc:'NPC', location:'Location', creature:'Creature', possibility:'Possibility', conversation:'Conversation', handout:'Handout' };
  const AUDIENCE = { party:'Party', marek:'Marek', velmira:'Velmira', odie:'Odie' };
  let timer = null;

  function fullGM() { return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true'; }
  function inSessionSupport() { return location.hash === '#/gm-session'; }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])); }
  function formatAudience(list) { const values = Array.isArray(list) ? list : []; if (values.includes('party')) return 'Party'; return values.map(x => AUDIENCE[x] || x).join(' · ') || 'Unknown'; }
  function formatTime(value) { const date = new Date(value); if (Number.isNaN(date.getTime())) return ''; return date.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }); }
  async function getReveals() {
    const response = await fetch(API_URL, { headers: { apikey: API_KEY, 'Content-Type':'application/json', 'x-greywake-character':'gm', 'x-greywake-code':'GREYWAKE' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not load recent reveals.');
    return Array.isArray(data.reveals) ? data.reveals : [];
  }
  function ensureStyles() {
    if (document.getElementById('gm-recent-reveals-styles')) return;
    const style = document.createElement('style'); style.id = 'gm-recent-reveals-styles'; style.textContent = `
      .gm-recent-reveals{grid-column:1/-1;border:1px solid #4b4431;background:#151611;padding:14px 15px;margin-top:0}
      .gm-recent-reveals-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.gm-recent-reveals-head div{min-width:0}.gm-recent-reveals-head small{display:block;color:#97875d;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}.gm-recent-reveals-head strong{color:#e8ddc1;font:700 17px/1.2 Georgia,serif}.gm-recent-reveals-head span{color:#857c68;font-size:9px;white-space:nowrap}
      .gm-recent-reveals-list{display:grid;gap:7px}.gm-recent-reveal{display:grid;grid-template-columns:110px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 10px;border:1px solid #353329;background:#11120e}.gm-recent-reveal-meta{color:#9c8c61;font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.gm-recent-reveal-text{color:#d8cfb8;font-size:10px;line-height:1.35;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gm-recent-reveal-time{color:#7f7868;font-size:9px;font-variant-numeric:tabular-nums}.gm-recent-reveals-empty{padding:10px 0;color:#88806e;font-size:10px}
      @media(max-width:700px){.gm-recent-reveal{grid-template-columns:1fr auto}.gm-recent-reveal-meta{grid-column:1}.gm-recent-reveal-text{grid-column:1/-1;white-space:normal}.gm-recent-reveal-time{grid-column:2;grid-row:1}}
    `; document.head.appendChild(style);
  }
  function host() { return document.getElementById('gmOperationsView')?.querySelector('.gm-ops-grid') || null; }
  function render(items) {
    if (!fullGM() || !inSessionSupport()) { document.getElementById('gmRecentReveals')?.remove(); return; }
    const grid = host(); if (!grid) return;
    let panel = document.getElementById('gmRecentReveals');
    if (!panel) { panel = document.createElement('section'); panel.id = 'gmRecentReveals'; panel.className = 'gm-recent-reveals'; grid.prepend(panel); }
    const recent = items.slice(0,5);
    panel.innerHTML = `<div class="gm-recent-reveals-head"><div><small>RECENT REVEALS</small><strong>What the players have just been told</strong></div><span>Latest ${recent.length}</span></div>${recent.length ? `<div class="gm-recent-reveals-list">${recent.map(item => `<div class="gm-recent-reveal"><div class="gm-recent-reveal-meta">${esc(formatAudience(item.audience))} · ${esc(KINDS[item.reveal_kind] || item.reveal_kind)}</div><div class="gm-recent-reveal-text" title="${esc(item.body)}">${esc(item.body)}</div><div class="gm-recent-reveal-time">${esc(formatTime(item.created_at))}</div></div>`).join('')}</div>` : '<div class="gm-recent-reveals-empty">No live reveals sent yet.</div>'}`;
  }
  async function refresh() { if (!fullGM() || !inSessionSupport()) { render([]); return; } try { render(await getReveals()); } catch (_) {} }
  function resetTimer() { if (timer) clearInterval(timer); timer = null; refresh(); if (fullGM() && inSessionSupport()) timer = setInterval(refresh, POLL_MS); }
  window.addEventListener('hashchange', () => setTimeout(resetTimer, 0)); window.addEventListener('greywake:player-ready', () => setTimeout(resetTimer, 0)); window.addEventListener('greywake:live-reveal-published', () => setTimeout(refresh, 0)); document.addEventListener('DOMContentLoaded', resetTimer); ensureStyles(); resetTimer();
})();

(() => {
  if (document.querySelector('script[data-gm-player-feed]')) return;
  const script = document.createElement('script'); script.src = 'player-feed.js?v=feed1'; script.defer = true; script.dataset.gmPlayerFeed = 'true'; document.head.appendChild(script);
})();

(() => {
  const helpers = [
    ['gm-player-priority.js?v=priority4','gmPlayerPriority'],
    ['gm-session-state.js?v=session1','gmSessionState']
  ];
  helpers.forEach(([src,key]) => {
    if (document.querySelector(`script[data-${key}]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset[key] = 'true';
    document.head.appendChild(script);
  });
})();
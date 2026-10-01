(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/gm-adversary-cards';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  let cards = null;
  let loading = null;
  let scheduled = false;

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function onSessionSupport() {
    return (location.hash || '#/') === '#/gm-session';
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[ch]));
  }

  function ensureStyles() {
    if (document.getElementById('gm-adversary-card-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-adversary-card-styles';
    style.textContent = `
      .gm-adversary-reference{grid-column:1/-1;border:1px solid #665a3a;background:#14150f;padding:16px;box-shadow:0 12px 28px rgba(0,0,0,.16)}
      .gm-adversary-reference-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:12px}
      .gm-adversary-reference-head small{display:block;color:#a58e54;font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px}
      .gm-adversary-reference-head h2{margin:0;color:#eee5cd;font:700 21px/1.15 Georgia,serif}
      .gm-adversary-reference-head p{margin:0;max-width:560px;color:#8f8878;font-size:10px;line-height:1.45;text-align:right}
      .gm-adversary-list{display:grid;gap:12px}
      .gm-adversary-card{border:1px solid #454132;background:#191a14;overflow:hidden}
      .gm-adversary-top{display:grid;grid-template-columns:minmax(190px,1.2fr) repeat(5,minmax(74px,.45fr));align-items:stretch;border-bottom:1px solid #39362b}
      .gm-adversary-title{padding:13px 14px;background:#211f16}
      .gm-adversary-title strong{display:block;color:#f0d98d;font:700 20px/1.05 Georgia,serif}
      .gm-adversary-title span{display:block;margin-top:4px;color:#a69b7e;font-size:9px;letter-spacing:.09em;text-transform:uppercase}
      .gm-adversary-stat{padding:11px 10px;border-left:1px solid #39362b;display:flex;flex-direction:column;justify-content:center}
      .gm-adversary-stat small{color:#786f59;font-size:7px;font-weight:900;letter-spacing:.11em;text-transform:uppercase;margin-bottom:3px}
      .gm-adversary-stat strong{color:#e7ddc5;font-size:13px}
      .gm-adversary-body{display:grid;grid-template-columns:minmax(220px,.75fr) minmax(0,1.7fr);gap:0}
      .gm-adversary-quick{padding:14px;border-right:1px solid #39362b;background:#171812}
      .gm-adversary-quick .escape{display:inline-block;border:1px solid #8a7440;background:#2b2415;color:#f1db96;padding:6px 8px;font-size:8px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;margin-bottom:10px}
      .gm-adversary-quick p{margin:0 0 9px;color:#aaa18a;font-size:10px;line-height:1.5}
      .gm-adversary-quick b{color:#ddd2b9}
      .gm-adversary-features{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px}
      .gm-adversary-feature{padding:10px 11px;border:1px solid #39362b;background:#12130f}
      .gm-adversary-feature strong{display:block;color:#dfd5bd;font-size:10px;margin-bottom:4px}
      .gm-adversary-feature strong span{color:#857b61;font-size:7px;letter-spacing:.08em;text-transform:uppercase;margin-left:5px}
      .gm-adversary-feature p{margin:0;color:#98907d;font-size:9px;line-height:1.45}
      .gm-adversary-guidance{grid-column:1/-1;padding:10px 12px;border-top:1px solid #39362b;background:#211d13;color:#b7ab8e;font-size:9px;line-height:1.5}
      .gm-adversary-guidance b{color:#f0d98d}
      .gm-adversary-empty{padding:14px;border:1px dashed #494433;color:#8d8572;text-align:center;font-size:10px}
      @media(max-width:900px){.gm-adversary-top{grid-template-columns:1fr 1fr 1fr}.gm-adversary-title{grid-column:1/-1}.gm-adversary-stat{border-top:1px solid #39362b}.gm-adversary-body{grid-template-columns:1fr}.gm-adversary-quick{border-right:0;border-bottom:1px solid #39362b}.gm-adversary-features{grid-template-columns:1fr}.gm-adversary-reference-head{align-items:flex-start;flex-direction:column}.gm-adversary-reference-head p{text-align:left}}
    `;
    document.head.appendChild(style);
  }

  async function loadCards(force = false) {
    if (!isFullGM()) return [];
    if (cards && !force) return cards;
    if (loading) return loading;
    loading = fetch(API_URL, {
      headers: {
        apikey: API_KEY,
        'x-greywake-character': 'gm',
        'x-greywake-code': 'GREYWAKE'
      }
    }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not load adversary cards.');
      cards = Array.isArray(data.cards) ? data.cards : [];
      return cards;
    }).catch(error => {
      console.warn('Greywake adversary quick-reference unavailable.', error);
      cards = [];
      return cards;
    }).finally(() => { loading = null; });
    return loading;
  }

  function stat(label, value) {
    return `<div class="gm-adversary-stat"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`;
  }

  function renderCard(card) {
    const features = Array.isArray(card.features) ? card.features : [];
    const guidance = Array.isArray(card.running_guidance) ? card.running_guidance : [];
    return `<article class="gm-adversary-card" data-adversary="${esc(card.slug)}">
      <div class="gm-adversary-top">
        <div class="gm-adversary-title"><strong>${esc(card.name)}</strong><span>Tier ${esc(card.tier)} · ${esc(card.role)}</span></div>
        ${stat('Difficulty', card.difficulty)}
        ${stat('Thresholds', card.thresholds)}
        ${stat('HP', card.hp)}
        ${stat('Stress', card.stress)}
        ${stat('ATK', card.atk)}
      </div>
      <div class="gm-adversary-body">
        <div class="gm-adversary-quick">
          <span class="escape">Escape first</span>
          <p><b>Motives & Tactics</b><br>${esc(card.motives_tactics)}</p>
          <p><b>${esc(card.attack_name)}</b> · ${esc(card.attack_range)}<br>${esc(card.atk)} · ${esc(card.damage)}</p>
          <p><b>Experience</b><br>${esc(card.experience)}</p>
        </div>
        <div class="gm-adversary-features">
          ${features.map(feature => `<div class="gm-adversary-feature"><strong>${esc(feature.name)}<span>${esc(feature.type)}</span></strong><p>${esc(feature.text)}</p></div>`).join('')}
        </div>
        ${guidance.length ? `<div class="gm-adversary-guidance"><b>RUN IT:</b> ${guidance.map(esc).join(' · ')}</div>` : ''}
      </div>
    </article>`;
  }

  async function render() {
    if (!isFullGM() || !onSessionSupport()) return;
    ensureStyles();
    const grid = document.querySelector('#gmOperationsView .gm-ops-grid');
    if (!grid || grid.querySelector('.gm-adversary-reference')) return;

    const section = document.createElement('section');
    section.className = 'gm-adversary-reference';
    section.innerHTML = `<div class="gm-adversary-reference-head"><div><small>LIVE ADVERSARY REFERENCE</small><h2>At-the-table cards</h2></div><p>GM-only mechanics loaded from the campaign database. Obsidian remains canon authority.</p></div><div class="gm-adversary-list"><div class="gm-adversary-empty">Loading adversary cards…</div></div>`;

    const quickCapture = [...grid.children].find(el => el.querySelector?.('#gmQuickCaptureForm'));
    if (quickCapture) grid.insertBefore(section, quickCapture);
    else grid.appendChild(section);

    const list = section.querySelector('.gm-adversary-list');
    const loadedCards = await loadCards();
    if (!section.isConnected || !list) return;
    list.innerHTML = loadedCards.length ? loadedCards.map(renderCard).join('') : '<div class="gm-adversary-empty">No active GM adversary cards.</div>';
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; render(); });
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('greywake:player-ready', () => { cards = null; schedule(); });
  document.addEventListener('DOMContentLoaded', schedule);
  setTimeout(schedule, 180);
})();
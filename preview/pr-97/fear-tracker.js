(() => {
  if (window.__GreywakeFearTracker) return;
  window.__GreywakeFearTracker = true;

  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/live-session-state';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const MAX_FEAR = 12;
  const POLL_MS = 2500;
  let fear = 0;
  let ready = false;
  let busy = false;
  let pollTimer = null;
  let renderQueued = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function identity() {
    const user = window.GreywakePlayer || {};
    const character = String(user.character || document.body.dataset.character || '').toLowerCase();
    const code = String(user.code || (character === 'gm' ? 'GREYWAKE' : '')).toUpperCase();
    return { character, code };
  }

  function isGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function isPlayer() {
    return document.body.dataset.role === 'player' || document.body.dataset.gmPreview === 'true';
  }

  async function request(method = 'GET', body = null) {
    const auth = identity();
    if (!auth.character || !auth.code) throw new Error('Greywake identity is not ready.');
    const response = await fetch(API_URL, {
      method,
      headers: {
        apikey: API_KEY,
        'Content-Type': 'application/json',
        'x-greywake-character': auth.character,
        'x-greywake-code': auth.code
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not sync Fear.');
    return data;
  }

  function ensureStyles() {
    if (document.getElementById('greywake-fear-styles')) return;
    const style = document.createElement('style');
    style.id = 'greywake-fear-styles';
    style.textContent = `
      .greywake-fear-display{display:flex;align-items:center;gap:9px;border:1px solid #6d5736;background:#18130f;padding:6px 9px;min-width:128px;color:#d7c59b;box-shadow:0 0 0 1px #17110b inset}
      .greywake-fear-display .fear-label{display:grid;line-height:1}.greywake-fear-display .fear-label small{font-size:7px;letter-spacing:.12em;font-weight:900;color:#937f59}.greywake-fear-display .fear-label strong{font-size:12px;color:#f0d991}
      .greywake-fear-display .fear-count{font:900 20px/1 system-ui,sans-serif;color:#f0d991;min-width:31px;text-align:right}.greywake-fear-display .fear-count span{font-size:8px;color:#82745c;font-weight:800}
      .greywake-fear-pips{display:grid;grid-template-columns:repeat(6,7px);gap:3px}.greywake-fear-pip{width:7px;height:7px;border:1px solid #4b4130;background:#0c0d0a;padding:0}.greywake-fear-pip.on{background:#c29a4b;border-color:#dbba72;box-shadow:0 0 5px rgba(194,154,75,.45)}
      .gm-fear-control{margin:-7px 0 16px;border:1px solid #6d5736;background:linear-gradient(135deg,#18130f,#10110d);padding:14px 16px;color:#c9b78c;display:grid;grid-template-columns:auto minmax(190px,1fr) auto;gap:16px;align-items:center}
      .gm-fear-total{display:flex;align-items:baseline;gap:5px;min-width:100px}.gm-fear-total strong{font:900 42px/1 system-ui,sans-serif;color:#f0d991}.gm-fear-total span{font-size:11px;color:#7f725b;font-weight:900}
      .gm-fear-main small{display:block;font-size:8px;font-weight:900;letter-spacing:.13em;color:#9b8457;margin-bottom:6px}.gm-fear-main p{margin:7px 0 0;font-size:9px;color:#7f7460}.gm-fear-main .greywake-fear-pips{grid-template-columns:repeat(12,20px);gap:5px}
      .gm-fear-main .greywake-fear-pip{width:20px;height:20px;cursor:pointer;border-radius:2px}.gm-fear-main .greywake-fear-pip:hover,.gm-fear-main .greywake-fear-pip:focus-visible{outline:1px solid #e0c47e;outline-offset:2px}
      .gm-fear-actions{display:grid;grid-template-columns:repeat(2,minmax(76px,1fr));gap:7px}.gm-fear-actions button{border:1px solid #685838;background:#241d13;color:#e6ce8d;padding:10px 11px;cursor:pointer;font-size:8px;font-weight:900;letter-spacing:.07em;text-transform:uppercase}.gm-fear-actions button:hover{background:#302719}.gm-fear-actions button:disabled{opacity:.4;cursor:not-allowed}.gm-fear-actions .fear-clear{grid-column:1/-1;border-color:#403a2f;background:#141510;color:#938875}
      .gm-fear-sync{grid-column:1/-1;font-size:8px;color:#756a56;margin-top:-6px}.gm-fear-sync.error{color:#c98d75}
      .gm-status-strip .fear-status-cell strong{color:#f0d991}
      @media(max-width:900px){.gm-fear-control{grid-template-columns:1fr auto}.gm-fear-total{grid-row:1/3}.gm-fear-main .greywake-fear-pips{grid-template-columns:repeat(6,20px)}} 
      @media(max-width:650px){.greywake-fear-display{min-width:0;padding:5px 7px}.greywake-fear-display .fear-label{display:none}.greywake-fear-pips{display:none}.gm-fear-control{grid-template-columns:1fr}.gm-fear-total{grid-row:auto}.gm-fear-main .greywake-fear-pips{display:grid}.gm-fear-actions{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  function pips({interactive = false} = {}) {
    return Array.from({length: MAX_FEAR}, (_, i) => {
      const value = i + 1;
      return interactive
        ? `<button type="button" class="greywake-fear-pip ${value <= fear ? 'on' : ''}" data-set-fear="${value}" title="Set Fear to ${value}" aria-label="Set Fear to ${value}"></button>`
        : `<span class="greywake-fear-pip ${value <= fear ? 'on' : ''}" aria-hidden="true"></span>`;
    }).join('');
  }

  function renderPlayer() {
    if (!isPlayer()) {
      document.getElementById('sharedFearDisplay')?.remove();
      return;
    }
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    let node = document.getElementById('sharedFearDisplay');
    if (!node) {
      node = document.createElement('div');
      node.id = 'sharedFearDisplay';
      node.className = 'greywake-fear-display';
      node.setAttribute('aria-live','polite');
      node.setAttribute('title','GM Fear pool — visible to players in Daggerheart');
      const identityNode = document.getElementById('playerIdentity');
      identityNode ? topbar.insertBefore(node, identityNode) : topbar.appendChild(node);
    }
    node.innerHTML = `<div class="fear-label"><small>GM FEAR</small><strong>LIVE</strong></div><div class="fear-count">${ready ? fear : '—'}<span>/12</span></div><div class="greywake-fear-pips">${ready ? pips() : ''}</div>`;
  }

  function syncGMStatus() {
    const root = document.getElementById('gmOperationsView');
    const strip = root?.querySelector('.gm-status-strip');
    if (!strip || !isGM() || location.hash !== '#/gm-session') return;
    let cell = [...strip.children].find(x => /^FEAR$/i.test((x.querySelector('small')?.textContent || '').trim()));
    if (!cell) {
      cell = document.createElement('div');
      const captured = [...strip.children].find(x => /CAPTURED/i.test(x.querySelector('small')?.textContent || ''));
      captured ? strip.insertBefore(cell, captured) : strip.appendChild(cell);
    }
    cell.classList.add('fear-status-cell');
    const value = ready ? `${fear} / 12` : '—';
    if ((cell.querySelector('strong')?.textContent || '').trim() !== value) {
      cell.innerHTML = `<small>FEAR</small><strong>${esc(value)}</strong>`;
    }
    [...strip.children].filter(x => x !== cell && /^FEAR$/i.test((x.querySelector('small')?.textContent || '').trim())).forEach(x => x.remove());
  }

  function renderGM() {
    if (!isGM() || location.hash !== '#/gm-session') {
      document.getElementById('gmFearControl')?.remove();
      return;
    }
    const root = document.getElementById('gmOperationsView');
    const strip = root?.querySelector('.gm-status-strip');
    if (!strip) return;
    syncGMStatus();
    let panel = document.getElementById('gmFearControl');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'gmFearControl';
      panel.className = 'gm-fear-control';
      strip.insertAdjacentElement('afterend', panel);
    }
    const disabledDown = busy || !ready || fear <= 0;
    const disabledUp = busy || !ready || fear >= MAX_FEAR;
    const signature = JSON.stringify([fear, ready, busy, disabledDown, disabledUp]);
    if (panel.dataset.fearSignature === signature) return;
    panel.dataset.fearSignature = signature;
    panel.innerHTML = `
      <div class="gm-fear-total"><strong>${ready ? fear : '—'}</strong><span>/ 12</span></div>
      <div class="gm-fear-main"><small>LIVE FEAR POOL · PLAYERS CAN SEE THIS</small><div class="greywake-fear-pips">${ready ? pips({interactive:true}) : ''}</div><p>Click a pip to set the exact total.</p></div>
      <div class="gm-fear-actions"><button type="button" data-fear-change="-1" ${disabledDown ? 'disabled' : ''}>Spend 1</button><button type="button" data-fear-change="1" ${disabledUp ? 'disabled' : ''}>Gain 1</button><button type="button" class="fear-clear" data-set-fear="0" ${busy || !ready || fear === 0 ? 'disabled' : ''}>Set to 0</button></div>
      <div class="gm-fear-sync" id="gmFearSync">${busy ? 'Updating shared Fear…' : ready ? 'Synced across GM and player devices.' : 'Loading shared Fear…'}</div>
    `;
    panel.querySelectorAll('[data-fear-change]').forEach(button => button.addEventListener('click', () => setFear(fear + Number(button.dataset.fearChange))));
    panel.querySelectorAll('[data-set-fear]').forEach(button => button.addEventListener('click', () => setFear(Number(button.dataset.setFear))));
  }

  function render() {
    ensureStyles();
    renderPlayer();
    renderGM();
    syncGMStatus();
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; render(); });
  }

  async function pull() {
    if (!identity().character) return;
    try {
      const data = await request('GET');
      const next = Number(data.fear);
      if (Number.isInteger(next) && next >= 0 && next <= MAX_FEAR) {
        fear = next;
        ready = true;
        window.GreywakeGMSessionState?.save?.({ fear: String(fear) });
        window.dispatchEvent(new CustomEvent('greywake:fear-changed',{detail:{fear,maxFear:MAX_FEAR,source:'remote'}}));
      }
      scheduleRender();
    } catch (error) {
      console.warn('Greywake Fear pull failed:', error);
      const state = document.getElementById('gmFearSync');
      if (state) { state.textContent = 'Fear sync unavailable — retrying.'; state.classList.add('error'); }
    }
  }

  let playerFearQueue = Promise.resolve();

  function applyFearResponse(data, source) {
    const next = Number(data?.fear);
    if (!Number.isInteger(next) || next < 0 || next > MAX_FEAR) return;
    fear = next;
    ready = true;
    window.GreywakeGMSessionState?.save?.({ fear: String(fear) });
    window.dispatchEvent(new CustomEvent('greywake:fear-changed',{detail:{fear,maxFear:MAX_FEAR,source}}));
    scheduleRender();
  }

  function gainFromPlayerRoll(meta = {}) {
    if (document.body.dataset.role !== 'player' || document.body.dataset.gmPreview === 'true') return Promise.resolve({ skipped:true });
    const character = identity().character;
    const payload = { delta:1, reason:'player_roll', character, ...meta };
    playerFearQueue = playerFearQueue.then(async () => {
      const data = await request('PATCH', payload);
      applyFearResponse(data, 'player-roll');
      return data;
    }).catch(error => {
      console.warn('Greywake automatic Fear gain failed:', error);
      window.dispatchEvent(new CustomEvent('greywake:fear-sync-error',{detail:{error:String(error?.message||error),source:'player-roll'}}));
      return { error:true };
    });
    return playerFearQueue;
  }

  async function setFear(value) {
    if (!isGM() || busy) return;
    const next = Math.max(0, Math.min(MAX_FEAR, Math.round(Number(value))));
    if (!Number.isFinite(next)) return;
    busy = true;
    scheduleRender();
    try {
      const data = await request('PATCH',{fear:next});
      applyFearResponse(data, 'gm');
    } catch (error) {
      console.warn('Greywake Fear update failed:', error);
      const state = document.getElementById('gmFearSync');
      if (state) { state.textContent = error.message || 'Fear update failed.'; state.classList.add('error'); }
    } finally {
      busy = false;
      scheduleRender();
    }
  }

  function start() {
    clearInterval(pollTimer);
    pollTimer = null;
    if (!identity().character) return;
    pull();
    pollTimer = setInterval(pull, POLL_MS);
    scheduleRender();
  }

  window.GreywakeFear = { get: () => fear, set: setFear, refresh: pull, gainFromPlayerRoll, max: MAX_FEAR };
  window.addEventListener('greywake:player-ready', () => setTimeout(start, 60));
  window.addEventListener('hashchange', () => setTimeout(() => { scheduleRender(); pull(); }, 30));
  new MutationObserver(mutations => {
    if (mutations.some(m => [...m.addedNodes, ...m.removedNodes].some(n => n.nodeType === 1 && (n.id === 'gmOperationsView' || n.querySelector?.('#gmOperationsView'))))) {
      scheduleRender();
    }
  }).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded', () => setTimeout(start, 120));
  setTimeout(start, 700);
})();
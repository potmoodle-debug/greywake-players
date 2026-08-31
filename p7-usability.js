(() => {
  const GOALS_API = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const CODES = { marek: 'MAREK', velmira: 'VELMIRA', odie: 'ODIE' };
  const PARTY = ['Marek', 'Velmira', 'Odie'];
  let utilityObserver = null;
  let priorityObserver = null;
  let equipmentWrapped = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const characterKey = () => {
    const key = String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase();
    return CODES[key] ? key : null;
  };
  const isPreview = () => document.body.dataset.gmPreview === 'true';
  const storeKey = () => `greywake:p7-utilities:${characterKey() || 'unknown'}${isPreview()?':gmtest':''}`;

  function loadUtilityState() {
    try {
      const raw = JSON.parse(localStorage.getItem(storeKey()) || 'null');
      return {
        items: Array.isArray(raw?.items) ? raw.items.map(v => String(v).trim()).filter(Boolean).slice(0, 40) : [],
        conditions: Array.isArray(raw?.conditions) ? raw.conditions.map(v => String(v).trim()).filter(Boolean).slice(0, 20) : []
      };
    } catch (_) {
      return { items: [], conditions: [] };
    }
  }

  function saveUtilityState(next, reason = 'Character utility update') {
    try { localStorage.setItem(storeKey(), JSON.stringify(next)); } catch (_) {}
    renderUtilities();
    window.dispatchEvent(new CustomEvent('greywake:equipment-state-changed', { detail: { ok:true, reason } }));
  }

  function wrapEquipmentSync() {
    const api = window.GreywakeEquipment;
    if (!api || equipmentWrapped || api.__p7Wrapped) return;
    const originalGet = api.getState?.bind(api);
    const originalImport = api.importState?.bind(api);
    if (!originalGet || !originalImport) return;
    api.getState = () => ({ ...originalGet(), p7Utilities: loadUtilityState() });
    api.importState = remote => {
      originalImport(remote);
      if (remote?.p7Utilities) {
        const next = {
          items: Array.isArray(remote.p7Utilities.items) ? remote.p7Utilities.items.map(String).filter(Boolean).slice(0,40) : [],
          conditions: Array.isArray(remote.p7Utilities.conditions) ? remote.p7Utilities.conditions.map(String).filter(Boolean).slice(0,20) : []
        };
        try { localStorage.setItem(storeKey(), JSON.stringify(next)); } catch (_) {}
        renderUtilities();
      }
    };
    api.__p7Wrapped = true;
    equipmentWrapped = true;
  }

  function ensureUtilityStyles() {
    if (document.getElementById('p7-utility-styles')) return;
    const style = document.createElement('style');
    style.id = 'p7-utility-styles';
    style.textContent = `
      .p7-utilities{margin-top:16px;border-top:1px solid rgba(202,179,111,.2);padding-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .p7-utility-card{border:1px solid rgba(202,179,111,.22);background:rgba(14,14,11,.5);padding:14px}
      .p7-utility-card>span{font-size:9px;letter-spacing:.14em;color:#9d947b;font-weight:800}.p7-utility-card>strong{display:block;margin:4px 0 10px;color:#ead79e}
      .p7-add-row{display:flex;gap:7px}.p7-add-row input{min-width:0;flex:1;background:#12120f;border:1px solid #5e553c;color:#eee3bf;padding:9px}.p7-add-row button,.p7-chip button{border:1px solid #756642;background:#211e15;color:#ead79e;padding:8px 10px;cursor:pointer}
      .p7-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.p7-chip{display:inline-flex;align-items:center;border:1px solid rgba(202,179,111,.25);background:#181711}.p7-chip span{padding:7px 9px;font-size:12px}.p7-chip button{border:0;border-left:1px solid rgba(202,179,111,.2);padding:7px 9px}
      .p7-empty{font-size:11px;color:#8e8774}.p7-action-effect{border:1px solid #756642;background:#181711;padding:14px;margin:12px 0}.p7-action-effect strong{display:block;color:#f1d68b;margin-bottom:5px}.p7-action-effect p{margin:4px 0;color:#cfc5a5}.p7-action-effect select{background:#12120f;color:#eee3bf;border:1px solid #5e553c;padding:8px;margin:8px 6px 8px 0}.p7-action-effect button{border:1px solid #9b7b42;background:#2d2517;color:#f1d68b;padding:9px 12px;cursor:pointer}.p7-action-result{margin-top:8px;font-size:12px;color:#ddd1ad}
      #qnaQuickBtn{white-space:nowrap}
      @media(max-width:760px){.p7-utilities{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function utilityCard(kind, title, state) {
    const values = state[kind];
    const noun = kind === 'items' ? 'item' : 'condition';
    return `<section class="p7-utility-card" data-p7-kind="${kind}"><span>${kind==='items'?'CUSTOM INVENTORY':'CONDITIONS'}</span><strong>${esc(title)}</strong><div class="p7-add-row"><input type="text" maxlength="80" placeholder="Add ${noun}…" aria-label="Add ${noun}"><button type="button" data-p7-add>Add</button></div><div class="p7-list">${values.length ? values.map((value,index)=>`<span class="p7-chip"><span>${esc(value)}</span><button type="button" data-p7-remove="${index}" aria-label="Remove ${esc(value)}">×</button></span>`).join('') : `<span class="p7-empty">No ${noun}${noun==='item'?'s':''} added.</span>`}</div></section>`;
  }

  function renderUtilities() {
    const manager = document.getElementById('equipmentManager');
    if (!manager || !characterKey()) return;
    ensureUtilityStyles();
    wrapEquipmentSync();
    let root = manager.querySelector('.p7-utilities');
    if (!root) {
      root = document.createElement('div');
      root.className = 'p7-utilities';
      manager.appendChild(root);
    }
    const state = loadUtilityState();
    root.innerHTML = utilityCard('items','Add to inventory',state) + utilityCard('conditions','Current conditions',state);
    root.querySelectorAll('[data-p7-kind]').forEach(card => {
      const kind = card.dataset.p7Kind;
      const input = card.querySelector('input');
      const add = () => {
        if (isPreview()) return;
        const value = String(input?.value || '').trim();
        if (!value) return;
        const next = loadUtilityState();
        if (!next[kind].some(v => v.toLowerCase() === value.toLowerCase())) next[kind].push(value);
        saveUtilityState(next, `Added ${kind === 'items' ? 'inventory item' : 'condition'}: ${value}`);
      };
      card.querySelector('[data-p7-add]')?.addEventListener('click', add);
      input?.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); add(); } });
      card.querySelectorAll('[data-p7-remove]').forEach(button => button.addEventListener('click', () => {
        if (isPreview()) return;
        const next = loadUtilityState();
        next[kind].splice(Number(button.dataset.p7Remove),1);
        saveUtilityState(next, `Removed ${kind === 'items' ? 'inventory item' : 'condition'}`);
      }));
    });
    if (isPreview()) root.querySelectorAll('input,button').forEach(node => node.disabled = true);
  }

  function ensureQnaAccess() {
    const nav = document.getElementById('primaryNav');
    if (!nav || document.getElementById('qnaQuickBtn')) return;
    const button = document.createElement('button');
    button.id = 'qnaQuickBtn';
    button.type = 'button';
    button.textContent = 'Q&A';
    button.title = 'Questions & replies';
    button.setAttribute('aria-label','Open Questions and replies');
    button.addEventListener('click', () => { location.hash = '#/inbox'; });
    nav.appendChild(button);
  }

  function actionTitle(button) {
    return button?.querySelector('.active-action-copy strong')?.textContent?.trim() || '';
  }

  function openFormPicker(mode) {
    const choose = document.getElementById('chooseBeastform');
    const change = document.getElementById('changeBeastform');
    (choose || change)?.click();
    setTimeout(() => {
      const radio = document.querySelector(`#beastformActivationChoice input[value="${mode}"]`);
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change',{bubbles:true}));
      }
      document.getElementById('beastformDialog')?.scrollTo?.({top:0,behavior:'auto'});
    }, 40);
  }

  function replaceActionDetail(title) {
    const detail = document.querySelector('#activeActionsPanel .active-action-detail');
    if (!detail || detail.dataset.p7Effect === title) return;
    const tools = detail.querySelector('.active-action-detail-tools');
    detail.querySelector('.action-roller')?.remove();
    const old = detail.querySelector('.p7-action-effect');
    old?.remove();
    const panel = document.createElement('section');
    panel.className = 'p7-action-effect';
    panel.dataset.p7Effect = title;
    detail.dataset.p7Effect = title;
    if (title === 'Clarity of Nature') {
      panel.innerHTML = `<strong>No roll · +2 Stress recovery</strong><p>Clear <b>2 Stress total</b>, distributed between Marek and allies after resting in the natural space.</p>`;
    } else if (title === 'Regeneration') {
      panel.innerHTML = `<strong>No action roll · roll 1d4 healing</strong><p>Spend 3 Hope, choose the creature Marek touches, then roll the healing.</p><label>Apply to <select data-regen-target>${PARTY.map(name=>`<option>${name}</option>`).join('')}</select></label><button type="button" data-regen-roll>Spend 3 Hope & roll 1d4</button><div class="p7-action-result" data-regen-result aria-live="polite"></div>`;
      panel.querySelector('[data-regen-roll]')?.addEventListener('click', () => {
        const result = panel.querySelector('[data-regen-result]');
        const resources = window.GreywakeResources;
        const spend = resources?.spendHope?.(3,'Regeneration');
        if (spend?.ok === false) { if (result) result.textContent = spend.message || 'Not enough Hope.'; return; }
        const roll = window.crypto?.getRandomValues ? (()=>{const b=new Uint32Array(1);window.crypto.getRandomValues(b);return (b[0]%4)+1;})() : Math.floor(Math.random()*4)+1;
        const target = panel.querySelector('[data-regen-target]')?.value || 'Marek';
        let applied = '';
        if (target === 'Marek' && resources?.getState && resources?.setResource) {
          const state = resources.getState();
          const marked = Number(state.hp || 0);
          const cleared = Math.min(roll, marked);
          resources.setResource('hp', Math.max(0, marked-cleared), `Regeneration · ${roll}`);
          applied = ` Marek clears ${cleared} marked HP.`;
        } else {
          applied = ` ${target} should clear up to ${roll} marked HP on their sheet.`;
        }
        if (result) result.textContent = `Regeneration rolled ${roll}.${applied}`;
      });
    }
    (tools || detail).insertAdjacentElement(tools ? 'beforebegin' : 'beforeend', panel);
  }

  function handleActionClick(event) {
    const button = event.target.closest?.('#activeActionsPanel .active-action-card');
    if (!button) return;
    const title = actionTitle(button);
    if (title === 'Beastform' || title === 'Evolution') {
      event.preventDefault();
      event.stopImmediatePropagation();
      openFormPicker(title === 'Evolution' ? 'evolution' : 'stress');
      return;
    }
    if (title === 'Regeneration' || title === 'Clarity of Nature') {
      setTimeout(() => replaceActionDetail(title), 0);
    }
  }

  function goalIdentityHeaders() {
    const character = characterKey();
    return { apikey:API_KEY, 'Content-Type':'application/json', 'x-greywake-character':character, 'x-greywake-code':String(window.GreywakePlayer?.code || CODES[character]).toUpperCase() };
  }

  function contextTitle(wrap) {
    const host = wrap.closest('.thread-card,.personal-card,#article');
    return host?.querySelector('h3,h4,h1')?.textContent?.trim() || '';
  }

  async function currentGoalFor(wrap) {
    const response = await fetch(GOALS_API,{headers:goalIdentityHeaders()});
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.error || 'Could not load interests.');
    const key = String(wrap.dataset.contextMind || '');
    const title = contextTitle(wrap).toLowerCase();
    return (data.goals || []).find(goal => goal.entry_kind !== 'question' && (String(goal.source_key || '') === key || String(goal.goal_text || '').trim().toLowerCase() === title)) || null;
  }

  async function patchGoal(id,status) {
    const response = await fetch(GOALS_API,{method:'PATCH',headers:goalIdentityHeaders(),body:JSON.stringify({id:Number(id),entry_kind:'interest',status})});
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.error || 'Could not update that interest.');
    window.dispatchEvent(new CustomEvent('greywake:engagement-changed'));
  }

  function makePriorityControlsReversible() {
    if (isPreview()) return;
    document.querySelectorAll('.context-mind-action').forEach(wrap => {
      const interest = wrap.querySelector('.context-mind-button.is-active');
      const pursue = wrap.querySelector('.context-pursue-button.is-active');
      if (interest && !interest.dataset.p7Reversible) {
        interest.disabled = false;
        interest.dataset.p7Reversible = 'interest';
        interest.title = 'Remove from Interested';
      }
      if (pursue && !pursue.dataset.p7Reversible) {
        pursue.disabled = false;
        pursue.dataset.p7Reversible = 'pursuing';
        pursue.title = 'Stop pursuing';
      }
    });
  }

  async function handlePriorityClick(event) {
    const button = event.target.closest?.('[data-p7-reversible]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const wrap = button.closest('.context-mind-action');
    if (!wrap) return;
    button.disabled = true;
    const status = wrap.querySelector('.context-mind-status');
    if (status) status.textContent = button.dataset.p7Reversible === 'pursuing' ? 'Stopping pursuit…' : 'Removing interest…';
    try {
      const goal = await currentGoalFor(wrap);
      if (!goal) throw new Error('Could not find that interest.');
      await patchGoal(goal.id, button.dataset.p7Reversible === 'pursuing' ? 'open' : 'dormant');
    } catch (error) {
      if (status) status.textContent = error.message;
      button.disabled = false;
    }
  }

  function observe() {
    utilityObserver?.disconnect();
    utilityObserver = new MutationObserver(() => { renderUtilities(); wrapEquipmentSync(); ensureQnaAccess(); });
    utilityObserver.observe(document.body,{childList:true,subtree:true});
    priorityObserver?.disconnect();
    priorityObserver = new MutationObserver(makePriorityControlsReversible);
    priorityObserver.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','class']});
  }

  function init() {
    ensureUtilityStyles();
    ensureQnaAccess();
    wrapEquipmentSync();
    renderUtilities();
    makePriorityControlsReversible();
    observe();
  }

  document.addEventListener('click', handleActionClick, true);
  document.addEventListener('click', handlePriorityClick, true);
  window.addEventListener('greywake:player-ready', () => setTimeout(init,180));
  window.addEventListener('greywake:sheet-enhanced', () => setTimeout(init,120));
  window.addEventListener('greywake:engagement-changed', () => setTimeout(makePriorityControlsReversible,120));
  window.addEventListener('hashchange', () => setTimeout(init,100));
  document.addEventListener('DOMContentLoaded', () => setTimeout(init,220));
})();

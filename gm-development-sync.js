(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;

  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const remote = new Map();
  let loaded = false;
  let loading = null;
  let scheduled = false;

  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function goalId(card) {
    return Number(card.dataset.goalId);
  }

  function field(panel, name) {
    return panel.querySelector(`[data-development-field="${name}"]`);
  }

  function value(panel, name) {
    return field(panel, name)?.value?.trim() || '';
  }

  function collect(panel) {
    return {
      status: value(panel, 'status') || 'proposed',
      visibility: value(panel, 'visibility') || 'mixed',
      why: value(panel, 'why'),
      canon: value(panel, 'canon'),
      development: value(panel, 'development'),
      unresolved: value(panel, 'unresolved'),
      pressure: value(panel, 'pressure'),
      reward: value(panel, 'reward'),
      playerCopy: value(panel, 'playerCopy')
    };
  }

  function fromRemote(row) {
    return {
      status: row?.status || 'proposed',
      visibility: row?.visibility || 'mixed',
      why: row?.why_text || '',
      canon: row?.canon_text || '',
      development: row?.development_text || '',
      unresolved: row?.unresolved_text || '',
      pressure: row?.pressure_text || '',
      reward: row?.reward_text || '',
      playerCopy: row?.player_copy || ''
    };
  }

  async function request(method = 'GET', body = null) {
    const response = await fetch(API_URL, {
      method,
      headers: {
        apikey: API_KEY,
        'Content-Type': 'application/json',
        'x-greywake-character': 'gm',
        'x-greywake-code': 'GREYWAKE'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Greywake could not save this handoff.');
    return data;
  }

  async function loadRemote(force = false) {
    if (!isFullGM()) return;
    if (loaded && !force) return;
    if (loading) return loading;
    loading = request('GET').then(data => {
      remote.clear();
      (data.developments || []).forEach(row => remote.set(Number(row.goal_id), row));
      loaded = true;
      schedule();
    }).catch(error => {
      console.warn('Greywake GM handoff sync unavailable; local fallback remains usable.', error);
    }).finally(() => { loading = null; });
    return loading;
  }

  function applyRemote(card, panel) {
    const id = goalId(card);
    if (!Number.isInteger(id) || !remote.has(id) || panel.dataset.remoteApplied === 'true' || panel.dataset.gmDirty === 'true') return;
    const data = fromRemote(remote.get(id));
    panel.dataset.remoteHydrating = 'true';
    Object.entries(data).forEach(([name, next]) => {
      const control = field(panel, name);
      if (control) control.value = next;
    });
    panel.dataset.remoteApplied = 'true';
    field(panel, 'status')?.dispatchEvent(new Event('change', { bubbles: true }));
    field(panel, 'playerCopy')?.dispatchEvent(new Event('input', { bubbles: true }));
    panel.dataset.remoteHydrating = 'false';
    panel.dataset.gmDirty = 'false';
  }

  async function saveRemote(card, panel) {
    const id = goalId(card);
    if (!Number.isInteger(id)) throw new Error('This thread has no server ID.');
    const data = collect(panel);
    const result = await request('POST', {
      gm_development_goal_id: id,
      status: data.status,
      visibility: data.visibility,
      why: data.why,
      canon: data.canon,
      development: data.development,
      unresolved: data.unresolved,
      pressure: data.pressure,
      reward: data.reward,
      playerCopy: data.playerCopy
    });
    if (result.development) remote.set(id, result.development);
    panel.dataset.gmDirty = 'false';
    panel.dataset.remoteApplied = 'true';
    return data;
  }

  function enhancePanel(card, panel) {
    if (panel.dataset.syncEnhanced === 'true') {
      applyRemote(card, panel);
      return;
    }
    panel.dataset.syncEnhanced = 'true';

    panel.querySelectorAll('[data-development-field]').forEach(control => {
      const markDirty = () => {
        if (panel.dataset.remoteHydrating !== 'true') panel.dataset.gmDirty = 'true';
      };
      control.addEventListener('input', markDirty);
      control.addEventListener('change', markDirty);
    });

    panel.querySelector('[data-development-save]')?.addEventListener('click', async () => {
      const line = panel.querySelector('.gm-development-statusline');
      try {
        await saveRemote(card, panel);
        if (line) line.innerHTML = '<strong>SAVED</strong><span>GM handoff updated. Continue doing the actual prep in ChatGPT.</span>';
      } catch (error) {
        if (line) line.innerHTML = `<strong>LOCAL ONLY</strong><span>${esc(error.message)}</span>`;
      }
    });

    applyRemote(card, panel);
  }

  function enhance() {
    if (!isFullGM()) return;
    host.querySelectorAll('.gm-interest-thread').forEach(card => {
      const panel = card.querySelector('.gm-development-workspace');
      if (panel) enhancePanel(card, panel);
    });
    loadRemote();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(host, { childList: true, subtree: true });
  window.addEventListener('greywake:player-ready', () => { if (isFullGM()) loadRemote(true); schedule(); });
  window.addEventListener('greywake:engagement-changed', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();

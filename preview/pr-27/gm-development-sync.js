(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;

  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const PLAYER_KEYS = { MAREK: 'martin', VELMIRA: 'carla', ODIE: 'ritchie' };
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

  function playerName(card) {
    const text = card.querySelector('.interest-status')?.textContent?.trim().toUpperCase() || '';
    const name = text.split('·')[0]?.trim();
    return PLAYER_KEYS[name] ? name : 'PLAYER';
  }

  function goalText(card) {
    return card.querySelector('.interest-thread-head h3')?.textContent?.trim() || 'Current player thread';
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
    if (!response.ok) throw new Error(data.error || 'Greywake could not save this development.');
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
      console.warn('Greywake GM development sync unavailable; local drafts remain usable.', error);
    }).finally(() => { loading = null; });
    return loading;
  }

  function applyRemote(card, panel) {
    const id = goalId(card);
    if (!Number.isInteger(id) || !remote.has(id) || panel.dataset.remoteApplied === 'true' || panel.dataset.gmDirty === 'true') return;
    const data = fromRemote(remote.get(id));
    Object.entries(data).forEach(([name, next]) => {
      const control = field(panel, name);
      if (control) control.value = next;
    });
    panel.dataset.remoteApplied = 'true';
    field(panel, 'status')?.dispatchEvent(new Event('change', { bubbles: true }));
    field(panel, 'playerCopy')?.dispatchEvent(new Event('input', { bubbles: true }));
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

  function cleanFilePart(text) {
    return String(text || 'Development').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 90) || 'Development';
  }

  function obsidianTarget(data, card) {
    if (data.status === 'proposed') return '90 GM Only/Canon Decisions Pending/Pending Canon Decisions.md';
    return `90 GM Only/Player-Led Developments/${cleanFilePart(playerName(card))} — ${cleanFilePart(goalText(card))}.md`;
  }

  function yamlString(text) {
    return `"${String(text ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
  }

  function pendingMarkdown(data, card) {
    return `### ${playerName(card)} — ${goalText(card)}\n- Status: proposed development; **not canon yet**.\n- Trigger: ${data.why || 'Player-led development thread.'}\n- Established canon: ${data.canon || 'No additional canon recorded here.'}\n- Proposed development: ${data.development || 'Undefined.'}\n- Proposed pressure / consequence: ${data.pressure || 'Undefined.'}\n- Proposed payoff: ${data.reward || 'Undefined.'}\n- Keep undefined: ${data.unresolved || 'Outcomes remain open for play.'}\n- Player-facing wording must not be published until the GM explicitly approves the development.\n`;
  }

  function fullMarkdown(data, card) {
    const today = new Date().toISOString().slice(0, 10);
    const player = playerName(card);
    const character = player[0] + player.slice(1).toLowerCase();
    const title = goalText(card);
    const tier = ({gm:'T5',t1:'T1',t2:'T2',t3:'T3',t4:'T4',mixed:'Mixed'})[data.visibility] || 'Mixed';
    const related = title.toLowerCase().includes('flickerfly') ? `- [[${character}]]\n- [[Flickerfly]]` : `- [[${character}]]`;
    return `---\ntype: player-led-development\naudience: gm\npublish: false\nstatus: ${data.status}\nsource_player: ${yamlString(PLAYER_KEYS[player] || player.toLowerCase())}\nsource_character: ${yamlString(character)}\nsource_thread: ${yamlString(title)}\nknowledge_tier: ${data.visibility}\ncreated: ${today}\napproved: ${today}\ntags: [greywake, player-led, development]\n---\n\n# ${character} — ${title}\n\n> [!info] Canon status\n> **${data.status.toUpperCase()}** · Player visibility: **${tier}**\n\n## Why This Matters\n${data.why || 'Not yet recorded.'}\n\n## Established Canon\n${data.canon || 'No additional established canon recorded here.'}\n\n## Development\n${data.development || 'No new development recorded.'}\n\n## Keep Unresolved\n${data.unresolved || 'Outcomes remain open for play.'}\n\n## Pressure / Consequence\n${data.pressure || 'None recorded.'}\n\n## Potential Reward / Payoff\n${data.reward || 'None recorded.'}\n\n## Player-Facing Knowledge\nKnowledge tier: **${tier}**\n\n${data.playerCopy || 'No player-facing copy has been approved.'}\n\n## Player-Site Copy\n${data.playerCopy || 'Not yet available to the player.'}\n\n## State Changes\n- Proposed → Approved: ${data.status === 'proposed' ? 'Pending explicit GM approval.' : today}\n- Approved → Active: ${data.status === 'active' || data.status === 'resolved' ? 'Development entered play.' : ''}\n- Active → Resolved / Dormant / Changed: ${data.status === 'resolved' ? 'Record the actual outcome here.' : ''}\n\n## Related Notes\n${related}\n\n## Promotion Rule\nOnly the accepted development is locked as canon. Undefined causes, motives, locations and outcomes remain undefined until separately established. Player knowledge is published only when the character has legitimately learned it.\n`;
  }

  function markdown(data, card) {
    return data.status === 'proposed' ? pendingMarkdown(data, card) : fullMarkdown(data, card);
  }

  function download(data, card) {
    const fileName = data.status === 'proposed'
      ? `${cleanFilePart(playerName(card))} — ${cleanFilePart(goalText(card))} — PENDING.md`
      : `${cleanFilePart(playerName(card))} — ${cleanFilePart(goalText(card))}.md`;
    const blob = new Blob([markdown(data, card)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function refreshHandoff(card, panel) {
    const data = collect(panel);
    panel.querySelector('[data-gm-obsidian-target]')?.replaceChildren(document.createTextNode(obsidianTarget(data, card)));
    const mode = panel.querySelector('[data-gm-obsidian-mode]');
    if (mode) mode.textContent = data.status === 'proposed' ? 'Pending canon fragment' : 'Standalone GM canon note';
  }

  function ensureStyles() {
    if (document.getElementById('gm-development-sync-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-development-sync-styles';
    style.textContent = `
      .gm-development-obsidian{margin-top:14px;padding:12px 13px;border:1px solid #3f4937;background:#11150f}
      .gm-development-obsidian-head,.gm-development-obsidian-target{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .gm-development-obsidian-head span,.gm-development-obsidian-target span{color:#8f9c78;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
      .gm-development-obsidian-head strong{color:#c9d6ad;font-size:9px;letter-spacing:.06em;text-transform:uppercase}
      .gm-development-obsidian-target{margin-top:9px;padding-top:9px;border-top:1px solid #2d3528}
      .gm-development-obsidian-target code{max-width:72%;color:#d7ddc9;font-size:10px;line-height:1.45;text-align:right;white-space:normal;overflow-wrap:anywhere}
      .gm-development-obsidian p{margin:9px 0 0;color:#77806d;font-size:10px;line-height:1.45}
      .gm-development-actions [data-gm-copy-obsidian],.gm-development-actions [data-gm-download-obsidian]{border-color:#526148;color:#c9d6ad}
    `;
    document.head.appendChild(style);
  }

  function enhancePanel(card, panel) {
    if (panel.dataset.syncEnhanced === 'true') {
      applyRemote(card, panel);
      refreshHandoff(card, panel);
      return;
    }
    panel.dataset.syncEnhanced = 'true';

    panel.querySelectorAll('[data-development-field]').forEach(control => {
      control.addEventListener('input', () => { panel.dataset.gmDirty = 'true'; refreshHandoff(card, panel); });
      control.addEventListener('change', () => { panel.dataset.gmDirty = 'true'; refreshHandoff(card, panel); });
    });

    const actions = panel.querySelector('.gm-development-actions');
    const handoff = document.createElement('div');
    handoff.className = 'gm-development-obsidian';
    handoff.innerHTML = `<div class="gm-development-obsidian-head"><span>Obsidian handoff</span><strong data-gm-obsidian-mode></strong></div><div class="gm-development-obsidian-target"><span>Target</span><code data-gm-obsidian-target></code></div><p>Proposed ideas stay in Pending Canon Decisions. Approved, active and resolved developments become GM-only notes in Player-Led Developments.</p>`;
    actions?.insertAdjacentElement('beforebegin', handoff);

    if (actions && !actions.querySelector('[data-gm-copy-obsidian]')) {
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.dataset.gmCopyObsidian = 'true';
      copy.textContent = 'Copy Obsidian markdown';
      copy.addEventListener('click', async () => {
        const data = collect(panel);
        try {
          await navigator.clipboard.writeText(markdown(data, card));
          const line = panel.querySelector('.gm-development-statusline');
          if (line) line.innerHTML = `<strong>COPIED</strong><span>${esc(obsidianTarget(data, card))}</span>`;
        } catch (_) {
          download(data, card);
        }
      });
      actions.insertBefore(copy, actions.children[1] || null);

      const save = actions.querySelector('[data-development-save]');
      const downloadButton = document.createElement('button');
      downloadButton.type = 'button';
      downloadButton.dataset.gmDownloadObsidian = 'true';
      downloadButton.textContent = 'Download Obsidian note';
      downloadButton.addEventListener('click', () => download(collect(panel), card));
      copy.insertAdjacentElement('afterend', downloadButton);

      save?.addEventListener('click', async () => {
        const line = panel.querySelector('.gm-development-statusline');
        try {
          const data = await saveRemote(card, panel);
          if (line) line.innerHTML = `<strong>SAVED TO GREYWAKE</strong><span>Shared GM notes updated. Obsidian target: ${esc(obsidianTarget(data, card))}</span>`;
        } catch (error) {
          if (line) line.innerHTML = `<strong>LOCAL ONLY</strong><span>${esc(error.message)} Browser draft was still kept by the site.</span>`;
        }
      });
    }

    applyRemote(card, panel);
    refreshHandoff(card, panel);
  }

  function enhance() {
    if (!isFullGM()) return;
    ensureStyles();
    host.querySelectorAll('.gm-interest-thread').forEach(card => {
      const panel = card.querySelector('.gm-development-workspace');
      if (panel) enhancePanel(card, panel);
    });
    loadRemote();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhance();
    });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(host, { childList: true, subtree: true });
  window.addEventListener('greywake:player-ready', () => { if (isFullGM()) loadRemote(true); schedule(); });
  window.addEventListener('greywake:engagement-changed', () => { if (isFullGM()) loadRemote(true); schedule(); });
  document.addEventListener('DOMContentLoaded', () => { loadRemote(); schedule(); });
  loadRemote();
  schedule();
})();

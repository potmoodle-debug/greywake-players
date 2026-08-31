(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;

  const STORAGE_PREFIX = 'greywake-gm-development-v1:';
  const PLAYER_KEYS = { MAREK: 'martin', VELMIRA: 'carla', ODIE: 'ritchie' };
  let scheduled = false;

  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function goalId(card) {
    return String(card.dataset.goalId || '').trim();
  }

  function playerName(card) {
    const text = card.querySelector('.interest-status')?.textContent?.trim().toUpperCase() || '';
    const name = text.split('·')[0]?.trim();
    return PLAYER_KEYS[name] ? name : 'PLAYER';
  }

  function goalText(card) {
    return card.querySelector('.interest-thread-head h3')?.textContent?.trim() || 'Current player thread';
  }

  function seedFor(card) {
    const text = goalText(card).toLowerCase();
    if (!text.includes('flickerfly')) return {
      status: 'proposed', visibility: 'mixed', why: '', canon: '', development: '', unresolved: '', pressure: '', reward: '', playerCopy: ''
    };

    return {
      status: 'proposed',
      visibility: 'mixed',
      why: 'Marek has specifically said he wants to study a flickerfly. This development follows a declared player interest rather than assigning the party a quest.',
      canon: 'Flickerflies exist in the wastes and are uncommon enough for a sighting or physical trace to be noteworthy. Greywake travel and danger remain player-led.',
      development: 'A returning scavenger brings back a translucent fragment of shed wing found caught in wirethorn several miles from a known route.',
      unresolved: 'Do not decide the exact location, whether a flickerfly is still nearby, what caused the surrounding damage, or what Marek ultimately learns.',
      pressure: 'The wirethorn around the find was badly disturbed by something larger. It is unclear whether the disturbance is connected to the flickerfly.',
      reward: 'Careful study or observation could give Marek reliable practical knowledge about flickerflies rather than simply another creature encounter.',
      playerCopy: 'Someone returning from the wastes has brought back what may be part of a Flickerfly wing. They remember where they found it well enough to indicate the general area. The surrounding wirethorn had been badly disturbed.'
    };
  }

  function load(card) {
    const id = goalId(card);
    if (!id) return seedFor(card);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_PREFIX + id) || 'null');
      if (saved && typeof saved === 'object') return { ...seedFor(card), ...saved };
    } catch (_) {}
    return seedFor(card);
  }

  function save(card, data) {
    const id = goalId(card);
    if (!id) return;
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(data));
  }

  function fieldValue(panel, name) {
    return panel.querySelector(`[data-development-field="${name}"]`)?.value?.trim() || '';
  }

  function collect(panel) {
    return {
      status: fieldValue(panel, 'status') || 'proposed',
      visibility: fieldValue(panel, 'visibility') || 'mixed',
      why: fieldValue(panel, 'why'),
      canon: fieldValue(panel, 'canon'),
      development: fieldValue(panel, 'development'),
      unresolved: fieldValue(panel, 'unresolved'),
      pressure: fieldValue(panel, 'pressure'),
      reward: fieldValue(panel, 'reward'),
      playerCopy: fieldValue(panel, 'playerCopy')
    };
  }

  function statusCopy(data) {
    if (data.status === 'approved') return 'Approved for canon handling; mirror the approved facts into Obsidian when ready.';
    if (data.status === 'active') return 'Active in play or between-session interaction. Keep outcomes responsive to player choices.';
    if (data.status === 'resolved') return 'Resolved development. Record consequences rather than adding more preparation here.';
    return 'Proposed only. Nothing in these GM notes becomes canon until you approve it.';
  }

  function renderPreview(panel, card) {
    const copy = fieldValue(panel, 'playerCopy');
    const player = playerName(card);
    const body = panel.querySelector('.gm-development-preview-card');
    if (!body) return;
    body.innerHTML = copy
      ? `<span>${esc(player)} · POSSIBLE LEAD</span><p>${esc(copy)}</p>`
      : `<span>${esc(player)} · PLAYER PREVIEW</span><p class="gm-development-preview-empty">Add player-facing wording to see exactly what would be presented as a lead.</p>`;
    const data = collect(panel);
    const line = panel.querySelector('.gm-development-statusline');
    if (line) line.innerHTML = `<strong>${esc(data.status.toUpperCase())}</strong><span>${esc(statusCopy(data))}</span>`;
  }

  function formMarkup(data, player) {
    return `
      <div class="gm-development-body">
        <p class="gm-development-rule"><strong>GM working layer.</strong> Use this to develop the thread without committing hidden assumptions. Only the player-facing wording can be moved into the existing conversation.</p>
        <div class="gm-development-grid">
          <div class="gm-development-field"><label>Status</label><select data-development-field="status"><option value="proposed" ${data.status === 'proposed' ? 'selected' : ''}>Proposed — not canon yet</option><option value="approved" ${data.status === 'approved' ? 'selected' : ''}>Approved — canon-safe</option><option value="active" ${data.status === 'active' ? 'selected' : ''}>Active — in play</option><option value="resolved" ${data.status === 'resolved' ? 'selected' : ''}>Resolved</option></select></div>
          <div class="gm-development-field"><label>Player visibility</label><select data-development-field="visibility"><option value="gm" ${data.visibility === 'gm' ? 'selected' : ''}>GM only / T5</option><option value="t1" ${data.visibility === 't1' ? 'selected' : ''}>T1 — Public</option><option value="t2" ${data.visibility === 't2' ? 'selected' : ''}>T2 — Practical / lived</option><option value="t3" ${data.visibility === 't3' ? 'selected' : ''}>T3 — Investigated</option><option value="t4" ${data.visibility === 't4' ? 'selected' : ''}>T4 — Insider</option><option value="mixed" ${data.visibility === 'mixed' ? 'selected' : ''}>Mixed tiers</option></select></div>
          <div class="gm-development-field gm-development-wide"><label>Why this matters</label><textarea data-development-field="why" placeholder="Which player interest, consequence, NPC pressure or world change makes this worth developing?">${esc(data.why)}</textarea></div>
          <div class="gm-development-field"><label>Canon already established</label><textarea data-development-field="canon" placeholder="Only facts already established in Greywake.">${esc(data.canon)}</textarea></div>
          <div class="gm-development-field"><label>New development</label><textarea data-development-field="development" placeholder="The one new thing you are considering adding.">${esc(data.development)}</textarea></div>
          <div class="gm-development-field"><label>Keep unresolved</label><textarea data-development-field="unresolved" placeholder="Questions and outcomes that must remain open for play.">${esc(data.unresolved)}</textarea></div>
          <div class="gm-development-field"><label>Pressure / consequence</label><textarea data-development-field="pressure" placeholder="A danger sign, NPC pressure or consequence — not a forced objective.">${esc(data.pressure)}</textarea></div>
          <div class="gm-development-field"><label>Potential reward / payoff</label><textarea data-development-field="reward" placeholder="What meaningful benefit could emerge if the players engage?">${esc(data.reward)}</textarea></div>
          <div class="gm-development-field gm-development-wide"><label>What ${esc(player)} may see</label><textarea data-development-field="playerCopy" placeholder="Spoiler-safe wording only. This can be loaded into Give Lead after you review it.">${esc(data.playerCopy)}</textarea></div>
        </div>
        <div class="gm-development-preview">
          <div class="gm-development-preview-head"><span>Player-facing preview</span><span>No GM notes included</span></div>
          <div class="gm-development-preview-card"></div>
        </div>
        <div class="gm-development-actions">
          <button type="button" class="gm-development-primary" data-development-save>Save GM notes</button>
          <button type="button" data-development-load>Load as Give Lead</button>
          <button type="button" data-development-preview-player>Preview whole site as ${esc(player)}</button>
        </div>
        <div class="gm-development-statusline" aria-live="polite"></div>
      </div>`;
  }

  function attach(panel, card) {
    panel.querySelectorAll('[data-development-field]').forEach(field => {
      field.addEventListener('input', () => renderPreview(panel, card));
      field.addEventListener('change', () => renderPreview(panel, card));
    });

    panel.querySelector('[data-development-save]')?.addEventListener('click', () => {
      save(card, collect(panel));
      const line = panel.querySelector('.gm-development-statusline');
      renderPreview(panel, card);
      if (line) line.classList.add('gm-development-saved');
      setTimeout(() => line?.classList.remove('gm-development-saved'), 1200);
    });

    panel.querySelector('[data-development-load]')?.addEventListener('click', () => {
      const copy = fieldValue(panel, 'playerCopy');
      if (!copy) {
        panel.querySelector('[data-development-field="playerCopy"]')?.focus();
        return;
      }
      const reply = card.querySelector('.gm-interest-reply textarea');
      if (!reply) return;
      reply.value = copy;
      reply.dispatchEvent(new Event('input', { bubbles: true }));
      reply.focus();
      card.querySelector('.gm-interest-reply')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const line = panel.querySelector('.gm-development-statusline');
      if (line) {
        line.classList.add('gm-development-loaded');
        line.innerHTML = '<strong>READY TO REVIEW</strong><span>The spoiler-safe copy is in the reply box. Use the existing Give Lead button only when you want the player to receive it.</span>';
      }
    });

    panel.querySelector('[data-development-preview-player]')?.addEventListener('click', () => {
      const key = PLAYER_KEYS[playerName(card)];
      const button = key ? document.querySelector(`#gmPreviewBar [data-preview="${key}"]`) : null;
      button?.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    renderPreview(panel, card);
  }

  function enhanceCard(card) {
    if (!isFullGM() || card.querySelector('.gm-development-workspace')) return;
    const data = load(card);
    const player = playerName(card);
    const panel = document.createElement('details');
    panel.className = 'gm-development-workspace';
    panel.innerHTML = `<summary><span>Develop this thread</span><span>${esc(data.status.toUpperCase())}</span></summary>${formMarkup(data, player)}`;
    const reply = card.querySelector('.gm-interest-reply');
    if (reply) reply.insertAdjacentElement('beforebegin', panel);
    else card.appendChild(panel);
    attach(panel, card);
  }

  function cleanup() {
    if (isFullGM()) return;
    host.querySelectorAll('.gm-development-workspace').forEach(panel => panel.remove());
  }

  function enhance() {
    if (!isFullGM()) {
      cleanup();
      return;
    }
    host.querySelectorAll('.gm-interest-thread').forEach(enhanceCard);
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
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();

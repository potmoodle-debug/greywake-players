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
    if (id) localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(data));
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

  function statusCopy(status) {
    if (status === 'approved') return 'Canon-safe and ready to carry forward.';
    if (status === 'active') return 'Now in play; let player choices determine the outcome.';
    if (status === 'resolved') return 'Outcome established; record consequences rather than adding prep.';
    return 'Still proposed. Nothing new here is canon yet.';
  }

  function summaryLine(label, text) {
    return text ? `<div class="gm-handoff-line"><span>${esc(label)}</span><p>${esc(text)}</p></div>` : '';
  }

  function render(panel, card) {
    const data = collect(panel);
    const player = playerName(card);
    const statusTag = panel.querySelector('[data-development-status-tag]');
    if (statusTag) statusTag.textContent = data.status.toUpperCase();

    const summary = panel.querySelector('.gm-handoff-summary');
    if (summary) {
      const core = data.development || data.why;
      summary.innerHTML = core
        ? `${summaryLine('Development', core)}${summaryLine('Pressure / sign', data.pressure)}${summaryLine('Keep open', data.unresolved)}${summaryLine('Possible payoff', data.reward)}`
        : `<div class="gm-handoff-empty"><strong>No prep handoff yet.</strong><span>Develop this thread in ChatGPT; the site is only for reviewing and publishing the result.</span></div>`;
    }

    const preview = panel.querySelector('.gm-development-preview-card');
    if (preview) {
      preview.innerHTML = data.playerCopy
        ? `<span>${esc(player)} · POSSIBLE LEAD</span><p>${esc(data.playerCopy)}</p>`
        : `<span>${esc(player)} · PLAYER PREVIEW</span><p class="gm-development-preview-empty">Nothing is currently prepared for the player to see.</p>`;
    }

    const line = panel.querySelector('.gm-development-statusline');
    if (line && !line.classList.contains('gm-development-loaded')) {
      line.innerHTML = `<strong>${esc(data.status.toUpperCase())}</strong><span>${esc(statusCopy(data.status))}</span>`;
    }
  }

  function hiddenField(name, valueText) {
    return `<textarea class="gm-development-hidden" hidden data-development-field="${name}">${esc(valueText)}</textarea>`;
  }

  function markup(data, player) {
    return `
      <div class="gm-development-body">
        <div class="gm-handoff-intro">
          <strong>Prep stays in ChatGPT.</strong>
          <span>This is the handoff: review what was prepared, decide its status, and control what reaches the player.</span>
        </div>

        <div class="gm-handoff-topline">
          <label>Status
            <select data-development-field="status">
              <option value="proposed" ${data.status === 'proposed' ? 'selected' : ''}>Proposed — not canon</option>
              <option value="approved" ${data.status === 'approved' ? 'selected' : ''}>Approved — canon-safe</option>
              <option value="active" ${data.status === 'active' ? 'selected' : ''}>Active — in play</option>
              <option value="resolved" ${data.status === 'resolved' ? 'selected' : ''}>Resolved</option>
            </select>
          </label>
          <span class="gm-handoff-source">Prepared in chat · managed here</span>
        </div>

        <div class="gm-handoff-summary" aria-label="GM prep summary"></div>

        ${hiddenField('visibility', data.visibility)}
        ${hiddenField('why', data.why)}
        ${hiddenField('canon', data.canon)}
        ${hiddenField('development', data.development)}
        ${hiddenField('unresolved', data.unresolved)}
        ${hiddenField('pressure', data.pressure)}
        ${hiddenField('reward', data.reward)}

        <div class="gm-development-preview">
          <div class="gm-development-preview-head">
            <span>What ${esc(player)} may see</span>
            <button type="button" data-development-edit-player>Edit wording</button>
          </div>
          <div class="gm-development-preview-card"></div>
          <div class="gm-player-copy-edit" hidden>
            <textarea data-development-field="playerCopy" rows="4" placeholder="Only spoiler-safe player-facing wording belongs here.">${esc(data.playerCopy)}</textarea>
            <span>This is the only prep text you should normally need to edit on the site.</span>
          </div>
        </div>

        <div class="gm-development-actions">
          <button type="button" class="gm-development-primary" data-development-save>Save handoff</button>
          <button type="button" data-development-load>Load as Give Lead</button>
          <button type="button" data-development-preview-player>Preview site as ${esc(player)}</button>
        </div>
        <div class="gm-development-statusline" aria-live="polite"></div>
      </div>`;
  }

  function attach(panel, card) {
    panel.querySelectorAll('[data-development-field]').forEach(control => {
      control.addEventListener('input', () => render(panel, card));
      control.addEventListener('change', () => render(panel, card));
    });

    panel.querySelector('[data-development-edit-player]')?.addEventListener('click', buttonEvent => {
      const editor = panel.querySelector('.gm-player-copy-edit');
      if (!editor) return;
      editor.hidden = !editor.hidden;
      buttonEvent.currentTarget.textContent = editor.hidden ? 'Edit wording' : 'Hide editor';
      if (!editor.hidden) field(panel, 'playerCopy')?.focus();
    });

    panel.querySelector('[data-development-save]')?.addEventListener('click', () => {
      save(card, collect(panel));
      render(panel, card);
      const line = panel.querySelector('.gm-development-statusline');
      line?.classList.add('gm-development-saved');
      setTimeout(() => line?.classList.remove('gm-development-saved'), 1200);
    });

    panel.querySelector('[data-development-load]')?.addEventListener('click', () => {
      const copy = value(panel, 'playerCopy');
      if (!copy) {
        const editor = panel.querySelector('.gm-player-copy-edit');
        if (editor) editor.hidden = false;
        field(panel, 'playerCopy')?.focus();
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
        line.innerHTML = '<strong>READY TO REVIEW</strong><span>The player-safe wording is in Give Lead. Nothing has been sent yet.</span>';
      }
    });

    panel.querySelector('[data-development-preview-player]')?.addEventListener('click', () => {
      const key = PLAYER_KEYS[playerName(card)];
      const button = key ? document.querySelector(`#gmPreviewBar [data-preview="${key}"]`) : null;
      button?.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    render(panel, card);
  }

  function enhanceCard(card) {
    if (!isFullGM() || card.querySelector('.gm-development-workspace')) return;
    const data = load(card);
    const player = playerName(card);
    const panel = document.createElement('details');
    panel.className = 'gm-development-workspace';
    panel.innerHTML = `<summary><span>GM handoff</span><span data-development-status-tag>${esc(data.status.toUpperCase())}</span></summary>${markup(data, player)}`;
    const reply = card.querySelector('.gm-interest-reply');
    if (reply) reply.insertAdjacentElement('beforebegin', panel);
    else card.appendChild(panel);
    attach(panel, card);
  }

  function cleanup() {
    if (!isFullGM()) host.querySelectorAll('.gm-development-workspace').forEach(panel => panel.remove());
  }

  function enhance() {
    if (!isFullGM()) return cleanup();
    host.querySelectorAll('.gm-interest-thread').forEach(enhanceCard);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(host, { childList: true, subtree: true });
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();

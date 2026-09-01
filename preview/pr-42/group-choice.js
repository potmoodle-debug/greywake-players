(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/campaign-choice';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const CHARACTER_CODES = { marek: 'MAREK', velmira: 'VELMIRA', odie: 'ODIE' };
  const CHARACTER_LABELS = { marek: 'Marek', velmira: 'Velmira', odie: 'Odie' };
  let timer;
  let requestId = 0;

  function currentUser() { return window.GreywakePlayer || null; }
  function characterKey(user = currentUser()) {
    const bodyKey = String(document.body.dataset.character || '').toLowerCase();
    if (CHARACTER_CODES[bodyKey]) return bodyKey;
    const userKey = String(user?.character || '').toLowerCase();
    return CHARACTER_CODES[userKey] ? userKey : null;
  }
  function isPreview() { return document.body.dataset.gmPreview === 'true'; }
  function onCampaign() { return (location.hash || '#/') === '#/campaign'; }
  function headers() {
    const user = currentUser();
    const character = characterKey(user);
    return {
      apikey: API_KEY,
      'Content-Type': 'application/json',
      'x-greywake-character': character || '',
      'x-greywake-code': String(user?.code || CHARACTER_CODES[character] || '').toUpperCase()
    };
  }
  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }
  function optionKey(row) { return `${row.source_kind || ''}::${row.source_key || ''}`; }

  async function loadState() {
    const response = await fetch(API_URL, { headers: headers() });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not load the group choice.');
    return data;
  }

  function aggregate(state) {
    const map = new Map();
    (state.pursuits || []).forEach(row => {
      const key = optionKey(row);
      if (!row.source_key || !row.source_title) return;
      if (!map.has(key)) map.set(key, {
        key,
        source_kind: row.source_kind || 'possibility-card',
        source_key: row.source_key,
        source_title: row.source_title || row.goal_text,
        backers: new Set(),
        voters: new Set()
      });
      map.get(key).backers.add(row.character_slug);
    });
    (state.votes || []).forEach(vote => {
      const option = map.get(optionKey(vote));
      if (option) option.voters.add(vote.character_slug);
    });
    return [...map.values()].sort((a, b) => b.voters.size - a.voters.size || b.backers.size - a.backers.size || a.source_title.localeCompare(b.source_title));
  }

  function ensureStyles() {
    if (document.getElementById('group-choice-styles')) return;
    const style = document.createElement('style');
    style.id = 'group-choice-styles';
    style.textContent = `
      .group-choice{margin:28px 0 34px;padding:22px;border:1px solid rgba(184,156,91,.36);background:linear-gradient(180deg,rgba(37,32,22,.96),rgba(24,22,17,.96))}
      .group-choice-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:15px}
      .group-choice-head h2{margin:3px 0 6px;font-size:clamp(24px,3vw,34px)}
      .group-choice-head p{margin:0;max-width:720px;color:#b8b09a;line-height:1.55}
      .group-choice-note{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9e936f;white-space:nowrap;margin-top:7px}
      .group-choice-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
      .group-choice-card{border:1px solid rgba(181,157,97,.28);background:#191812;padding:16px;display:flex;flex-direction:column;gap:11px}
      .group-choice-card.is-leading{border-color:#aa8c4d;background:#211d13}
      .group-choice-card h3{margin:0;font-size:18px;line-height:1.25;color:#eee0b4}
      .group-choice-meta{display:flex;gap:7px;flex-wrap:wrap}
      .group-choice-chip{font-size:10px;letter-spacing:.06em;text-transform:uppercase;border:1px solid #5e5743;padding:5px 7px;color:#bbb091}
      .group-choice-chip.vote{border-color:#8d7441;color:#e5cb87}
      .group-choice-actions{margin-top:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .group-choice-vote{appearance:none;border:1px solid #9b7b42;background:#2d2517;color:#f1d68b;padding:10px 13px;font:800 10px/1.1 inherit;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:38px}
      .group-choice-vote:hover{border-color:#c2a35c;background:#372b19;color:#fff0bd}
      .group-choice-vote.is-voted{border-color:#73815f;background:#1d2519;color:#dbe9bf;cursor:default}
      .group-choice-vote:disabled{opacity:.65;cursor:default}
      .group-choice-empty,.group-choice-error{border:1px dashed #5b543f;padding:16px;color:#a9a087;line-height:1.5}
      @media(max-width:700px){.group-choice-head{display:block}.group-choice-note{white-space:normal;margin-top:10px}}
    `;
    document.head.appendChild(style);
  }

  function mountPoint() {
    return document.querySelector('.player-portal-campaign .player-campaign-current');
  }

  function renderShell() {
    const anchor = mountPoint();
    if (!anchor) return null;
    let section = document.getElementById('groupChoice');
    if (!section) {
      section = document.createElement('section');
      section.id = 'groupChoice';
      section.className = 'group-choice';
      anchor.insertAdjacentElement('beforebegin', section);
    }
    return section;
  }

  function render(state) {
    const section = renderShell();
    if (!section) return;
    const options = aggregate(state);
    const me = characterKey();
    const myVote = (state.votes || []).find(v => v.character_slug === me);
    const topVotes = Math.max(0, ...options.map(o => o.voters.size));
    const preview = isPreview();

    const cards = options.map(option => {
      const voted = myVote && optionKey(myVote) === option.key;
      const leading = topVotes > 0 && option.voters.size === topVotes;
      const backers = [...option.backers].map(name => CHARACTER_LABELS[name] || name);
      const voters = [...option.voters].map(name => CHARACTER_LABELS[name] || name);
      return `<article class="group-choice-card${leading ? ' is-leading' : ''}">
        <h3>${esc(option.source_title)}</h3>
        <div class="group-choice-meta">
          <span class="group-choice-chip">Pursued by ${esc(backers.join(', '))}</span>
          <span class="group-choice-chip vote">${option.voters.size} vote${option.voters.size === 1 ? '' : 's'}${voters.length ? ` · ${esc(voters.join(', '))}` : ''}</span>
        </div>
        <div class="group-choice-actions">
          <button type="button" class="group-choice-vote${voted ? ' is-voted' : ''}" data-choice-key="${esc(option.key)}" ${voted || preview ? 'disabled' : ''}>${voted ? '✓ Your vote' : preview ? 'Vote · player control' : 'Vote for this'}</button>
        </div>
      </article>`;
    }).join('');

    section.innerHTML = `<div class="group-choice-head">
      <div><div class="eyebrow">GROUP CHOICE</div><h2>What should we play?</h2><p>Only options somebody has marked <strong>Pursuing</strong> appear here. Each player gets one vote and can move it to another option. This creates the group shortlist; it does not automatically start a quest.</p></div>
      <div class="group-choice-note">${preview ? 'GM preview · voting disabled' : 'One vote per player'}</div>
    </div>
    ${options.length ? `<div class="group-choice-grid">${cards}</div>` : '<div class="group-choice-empty">Nothing is in the group choice yet. When a player marks an interest <strong>Pursuing</strong>, it will appear here for everyone to consider.</div>'}`;

    if (!preview) section.querySelectorAll('[data-choice-key]').forEach(button => button.addEventListener('click', () => castVote(button.dataset.choiceKey, options)));
  }

  async function castVote(key, options) {
    const option = options.find(item => item.key === key);
    if (!option) return;
    const section = document.getElementById('groupChoice');
    section?.querySelectorAll('button').forEach(button => { button.disabled = true; });
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ source_kind: option.source_kind, source_key: option.source_key, source_title: option.source_title })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save your vote.');
      render(data);
      window.dispatchEvent(new CustomEvent('greywake:group-choice-changed'));
    } catch (error) {
      if (section) section.innerHTML = `<div class="group-choice-error">${esc(error.message)}</div>`;
      setTimeout(schedule, 1200);
    }
  }

  async function refresh() {
    const id = ++requestId;
    if (!onCampaign() || !currentUser() || !characterKey()) {
      document.getElementById('groupChoice')?.remove();
      return;
    }
    ensureStyles();
    const section = renderShell();
    if (section) section.innerHTML = '<div class="group-choice-empty">Checking the group choice…</div>';
    try {
      const state = await loadState();
      if (id !== requestId || !onCampaign()) return;
      render(state);
    } catch (error) {
      if (id !== requestId) return;
      const current = renderShell();
      if (current) current.innerHTML = `<div class="group-choice-error">${esc(error.message)}</div>`;
    }
  }

  function schedule() { clearTimeout(timer); timer = setTimeout(refresh, 80); }

  window.GreywakeGroupChoice = { refresh };
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:portal-live-mounted', event => { if (event.detail?.kind === 'threads') schedule(); });
  window.addEventListener('greywake:engagement-changed', schedule);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
})();
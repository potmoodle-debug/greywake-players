(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const MAX_LENGTH = 240;
  const CHARACTER_CODES = { marek: 'MAREK', velmira: 'VELMIRA', odie: 'ODIE' };
  let observer;
  let timer;

  function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function slug(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
  }

  function currentUser() {
    return window.GreywakePlayer || null;
  }

  function characterKey(user = currentUser()) {
    const bodyKey = (document.body.dataset.character || '').toLowerCase();
    if (CHARACTER_CODES[bodyKey]) return bodyKey;
    const userKey = (user?.character || '').toLowerCase();
    return CHARACTER_CODES[userKey] ? userKey : null;
  }

  function canAdd() {
    const user = currentUser();
    return Boolean(user && user.role === 'player' && document.body.dataset.gmPreview !== 'true' && characterKey(user));
  }

  async function createPriority(context) {
    const user = currentUser();
    const character = characterKey(user);
    if (!character) throw new Error('Greywake player identity is unavailable.');
    const code = String(user?.code || CHARACTER_CODES[character]).toUpperCase();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        apikey: API_KEY,
        'Content-Type': 'application/json',
        'x-greywake-character': character,
        'x-greywake-code': code
      },
      body: JSON.stringify({
        goal: String(context.source_title).slice(0, MAX_LENGTH),
        entry_kind: 'interest',
        source_kind: context.source_kind,
        source_key: context.source_key,
        source_title: context.source_title,
        source_route: context.source_route
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Greywake could not add that to your mind.');
    return data;
  }

  function personalContexts() {
    const character = characterKey() || 'player';
    return [...document.querySelectorAll('.personal-card')].map(card => {
      const title = card.querySelector('h4')?.textContent?.trim();
      if (!title) return null;
      return {
        element: card,
        source_kind: 'personal-card',
        source_key: `${character}:${slug(title)}`,
        source_title: title,
        source_route: '#/'
      };
    }).filter(Boolean);
  }

  function possibilityContexts() {
    return [...document.querySelectorAll('.thread-card[data-thread]')].map(card => {
      const title = card.querySelector('h3')?.textContent?.trim();
      if (!title) return null;
      return {
        element: card,
        source_kind: 'possibility-card',
        source_key: card.dataset.thread || slug(title),
        source_title: title,
        source_route: '#/'
      };
    }).filter(Boolean);
  }

  function recordContext() {
    const article = document.getElementById('article');
    if (!article || article.classList.contains('hidden')) return null;
    const heading = article.querySelector(':scope > h1');
    const hash = location.hash || '';
    if (!heading || !hash.startsWith('#/record/')) return null;
    const key = decodeURIComponent(hash.slice(9));
    return {
      element: article,
      source_kind: 'record',
      source_key: key,
      source_title: heading.textContent.trim(),
      source_route: hash
    };
  }

  function contexts() {
    const record = recordContext();
    return [...personalContexts(), ...possibilityContexts(), ...(record ? [record] : [])];
  }

  function ensureStyles() {
    if (document.getElementById('card-priority-styles')) return;
    const style = document.createElement('style');
    style.id = 'card-priority-styles';
    style.textContent = `
      .context-mind-action{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:10px}
      .context-mind-button{appearance:none;border:1px solid #5b5237;background:#1b1a14;color:#d8c88f;padding:8px 11px;font:800 10px/1.1 inherit;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
      .context-mind-button:hover{border-color:#9f8d56;background:#242117;color:#f1ddb0}
      .context-mind-button:focus-visible{outline:2px solid #c6ae69;outline-offset:2px}
      .context-mind-button:disabled{opacity:.58;cursor:default}
      .context-mind-status{font-size:10px;color:#8e876f;min-height:1em}
      .article > .context-mind-action{margin:4px 0 16px}
    `;
    document.head.appendChild(style);
  }

  function build(context) {
    const wrap = document.createElement('div');
    wrap.className = 'context-mind-action';
    wrap.dataset.contextMind = context.source_key;
    wrap.innerHTML = `<button type="button" class="context-mind-button">＋ Add to my mind</button><span class="context-mind-status" aria-live="polite"></span>`;
    const button = wrap.querySelector('button');
    const status = wrap.querySelector('.context-mind-status');
    button.addEventListener('click', async () => {
      button.disabled = true;
      status.textContent = 'Adding…';
      try {
        await createPriority(context);
        button.textContent = '✓ On my mind';
        status.textContent = 'Added to your current priorities.';
        window.dispatchEvent(new CustomEvent('greywake:engagement-changed'));
      } catch (error) {
        button.disabled = false;
        status.textContent = error.message;
      }
    });
    return wrap;
  }

  function enhance() {
    if (!canAdd()) {
      document.querySelectorAll('.context-mind-action').forEach(node => node.remove());
      return;
    }
    ensureStyles();
    contexts().forEach(context => {
      const exists = [...context.element.children].some(node => node.classList?.contains('context-mind-action') && node.dataset.contextMind === context.source_key);
      if (exists) return;
      const wrap = build(context);
      if (context.source_kind === 'record') {
        const question = [...context.element.children].find(node => node.classList?.contains('context-question'));
        const heading = context.element.querySelector(':scope > h1');
        (question || heading)?.insertAdjacentElement('afterend', wrap);
      } else {
        const question = [...context.element.children].find(node => node.classList?.contains('context-question'));
        if (question) question.insertAdjacentElement('beforebegin', wrap);
        else context.element.appendChild(wrap);
      }
    });
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(enhance, 60);
  }

  function setupObserver() {
    observer?.disconnect();
    const home = document.getElementById('home');
    const article = document.getElementById('article');
    observer = new MutationObserver(schedule);
    if (home) observer.observe(home, { childList: true, subtree: true });
    if (article) observer.observe(article, { childList: true, subtree: true });
  }

  window.addEventListener('greywake:player-ready', () => { setupObserver(); schedule(); });
  window.addEventListener('greywake:engagement-changed', schedule);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('DOMContentLoaded', () => { setupObserver(); schedule(); });
})();

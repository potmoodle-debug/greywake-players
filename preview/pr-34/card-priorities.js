(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const MAX_LENGTH = 240;
  const MAX_MIND_SLOTS = 3;
  const LOAD_TIMEOUT_MS = 5000;
  const CHARACTER_CODES = { marek: 'MAREK', velmira: 'VELMIRA', odie: 'ODIE' };
  let observer;
  let timer;
  let goalCache = null;
  let goalCacheKey = null;
  let goalRequest = null;

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

  function isPreview() {
    return document.body.dataset.gmPreview === 'true';
  }

  function canRender() {
    const user = currentUser();
    return Boolean(user && user.role === 'player' && characterKey(user));
  }

  function identityHeaders(user, character) {
    return {
      apikey: API_KEY,
      'Content-Type': 'application/json',
      'x-greywake-character': character,
      'x-greywake-code': String(user?.code || CHARACTER_CODES[character]).toUpperCase()
    };
  }

  function identityCacheKey(user, character) {
    return `${character}:${String(user?.code || CHARACTER_CODES[character]).toUpperCase()}`;
  }

  function clearGoalCache() {
    goalCache = null;
    goalRequest = null;
  }

  async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  async function loadGoals(force = false) {
    const user = currentUser();
    const character = characterKey(user);
    if (!user || !character) return [];
    const key = identityCacheKey(user, character);
    if (goalCacheKey !== key) {
      goalCacheKey = key;
      clearGoalCache();
    }
    if (!force && goalCache) return goalCache;
    if (!force && goalRequest) return goalRequest;
    goalRequest = fetchWithTimeout(API_URL, { headers: identityHeaders(user, character) })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Greywake could not check your current priorities.');
        goalCache = (Array.isArray(data.goals) ? data.goals : []).filter(goal => goal.character_slug === character);
        return goalCache;
      })
      .catch(error => {
        if (error?.name === 'AbortError') throw new Error('Priority check timed out.');
        throw error;
      })
      .finally(() => { goalRequest = null; });
    return goalRequest;
  }

  function activeMindCount(goals) {
    return goals.filter(goal => goal.entry_kind !== 'question' && ['open','pursuing'].includes(goal.status)).length;
  }

  function matchingGoal(goals, context) {
    const exact = goals.find(goal => goal.source_kind === context.source_kind && String(goal.source_key || '') === String(context.source_key));
    if (exact) return exact;
    return goals.find(goal => goal.entry_kind !== 'question' && String(goal.goal_text || '').trim().toLowerCase() === String(context.source_title || '').trim().toLowerCase());
  }

  async function patchGoal(id, patch) {
    const user = currentUser();
    const character = characterKey(user);
    const response = await fetchWithTimeout(API_URL, {
      method: 'PATCH',
      headers: identityHeaders(user, character),
      body: JSON.stringify({ id: Number(id), ...patch })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Greywake could not save that change.');
    clearGoalCache();
    return data;
  }

  async function createPriority(context) {
    const user = currentUser();
    const character = characterKey(user);
    if (!character) throw new Error('Greywake player identity is unavailable.');
    const goals = await loadGoals();
    const existing = matchingGoal(goals, context);
    if (existing) {
      if (['open','pursuing'].includes(existing.status)) return existing;
      await patchGoal(existing.id, { entry_kind: 'interest', status: 'open' });
      const refreshed = await loadGoals(true);
      return matchingGoal(refreshed, context) || existing;
    }
    if (activeMindCount(goals) >= MAX_MIND_SLOTS) throw new Error('Your three mind slots are full. Make one dormant or close it before adding another.');
    const response = await fetchWithTimeout(API_URL, {
      method: 'POST',
      headers: identityHeaders(user, character),
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
    clearGoalCache();
    return data.goal || data;
  }

  async function pursuePriority(context) {
    let goals = await loadGoals();
    let goal = matchingGoal(goals, context);
    if (!goal || !['open','pursuing'].includes(goal.status)) {
      await createPriority(context);
      goals = await loadGoals(true);
      goal = matchingGoal(goals, context);
    }
    if (!goal) throw new Error('Greywake could not find that priority after adding it.');
    if (goal.status !== 'pursuing') await patchGoal(goal.id, { entry_kind: 'interest', status: 'pursuing' });
    return goal;
  }

  function personalContexts() {
    const character = characterKey() || 'player';
    return [...document.querySelectorAll('.personal-card')].map(card => {
      const title = card.querySelector('h4')?.textContent?.trim();
      if (!title) return null;
      return { element: card, source_kind: 'personal-card', source_key: `${character}:${slug(title)}`, source_title: title, source_route: '#/my-greywake' };
    }).filter(Boolean);
  }

  function possibilityContexts() {
    return [...document.querySelectorAll('.thread-card[data-thread]')].map(card => {
      const title = card.querySelector('h3')?.textContent?.trim();
      if (!title) return null;
      return { element: card, source_kind: 'possibility-card', source_key: card.dataset.thread || slug(title), source_title: title, source_route: '#/campaign' };
    }).filter(Boolean);
  }

  function recordContext() {
    const article = document.getElementById('article');
    if (!article || article.classList.contains('hidden')) return null;
    const heading = article.querySelector(':scope > h1');
    const hash = location.hash || '';
    if (!heading || !hash.startsWith('#/record/')) return null;
    const key = decodeURIComponent(hash.slice(9));
    return { element: article, source_kind: 'record', source_key: key, source_title: heading.textContent.trim(), source_route: hash };
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
      .context-mind-action{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px}
      .context-mind-button,.context-pursue-button{appearance:none;border:1px solid #756642;background:#211e15;color:#ead79e;padding:10px 13px;font:800 10px/1.1 inherit;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:38px}
      .context-pursue-button{border-color:#9b7b42;background:#2d2517;color:#f1d68b}
      .context-mind-button:hover,.context-pursue-button:hover{border-color:#b39a5b;background:#2b2618;color:#fff0bf}
      .context-mind-button:focus-visible,.context-pursue-button:focus-visible{outline:2px solid #c6ae69;outline-offset:2px}
      .context-mind-button:disabled,.context-pursue-button:disabled{opacity:.72;cursor:default}
      .context-mind-button.is-active{border-color:#6f8059;background:#1d2519;color:#d9e8bd}
      .context-pursue-button.is-active{border-color:#b9934d;background:#342816;color:#ffe6a1}
      .context-mind-status{font-size:10px;color:#9d947b;min-height:1em;flex-basis:100%}
      .article > .context-mind-action{margin:6px 0 16px}
    `;
    document.head.appendChild(style);
  }

  function renderControl(wrap, context, goal, preview = false) {
    if (preview) {
      wrap.innerHTML = `<button type="button" class="context-mind-button" disabled>＋ Add to Things on my mind</button><span class="context-mind-status">Player control · disabled in GM preview</span>`;
      return;
    }
    if (goal?.status === 'pursuing') {
      wrap.innerHTML = `<button type="button" class="context-mind-button is-active" disabled>✓ On my mind</button><button type="button" class="context-pursue-button is-active" disabled>◆ Pursuing</button><span class="context-mind-status">This is one of your current priorities.</span>`;
      return;
    }
    if (goal && goal.status === 'open') {
      wrap.innerHTML = `<button type="button" class="context-mind-button is-active" disabled>✓ On my mind</button><button type="button" class="context-pursue-button" data-context-pursue>◆ Pursue this</button><span class="context-mind-status">Already using one of your three mind slots.</span>`;
      wrap.querySelector('[data-context-pursue]').addEventListener('click', () => actPursue(wrap, context));
      return;
    }
    wrap.innerHTML = `<button type="button" class="context-mind-button" data-context-add>＋ Add to Things on my mind</button><button type="button" class="context-pursue-button" data-context-pursue>◆ Pursue this</button><span class="context-mind-status"></span>`;
    wrap.querySelector('[data-context-add]').addEventListener('click', () => actAdd(wrap, context));
    wrap.querySelector('[data-context-pursue]').addEventListener('click', () => actPursue(wrap, context));
  }

  async function hydrateControl(wrap, context) {
    if (!canRender()) return;
    if (isPreview()) {
      renderControl(wrap, context, null, true);
      return;
    }
    const status = wrap.querySelector('.context-mind-status');
    if (status) status.textContent = 'Checking your current priorities…';
    try {
      const goals = await loadGoals();
      if (!wrap.isConnected) return;
      renderControl(wrap, context, matchingGoal(goals, context));
    } catch (error) {
      if (!wrap.isConnected) return;
      renderControl(wrap, context, null);
      const nextStatus = wrap.querySelector('.context-mind-status');
      if (nextStatus) nextStatus.textContent = error.message === 'Priority check timed out.' ? 'Priority check timed out. Controls are still available.' : 'Could not check current state. You can still try the control.';
    }
  }

  function disableControls(wrap) {
    wrap.querySelectorAll('button').forEach(button => { button.disabled = true; });
  }

  async function actAdd(wrap, context) {
    disableControls(wrap);
    const status = wrap.querySelector('.context-mind-status');
    if (status) status.textContent = 'Adding…';
    try {
      await createPriority(context);
      await loadGoals(true);
      window.dispatchEvent(new CustomEvent('greywake:engagement-changed'));
      await hydrateControl(wrap, context);
    } catch (error) {
      renderControl(wrap, context, null);
      const nextStatus = wrap.querySelector('.context-mind-status');
      if (nextStatus) nextStatus.textContent = error.message;
    }
  }

  async function actPursue(wrap, context) {
    disableControls(wrap);
    const status = wrap.querySelector('.context-mind-status');
    if (status) status.textContent = 'Marking as pursuing…';
    try {
      await pursuePriority(context);
      await loadGoals(true);
      window.dispatchEvent(new CustomEvent('greywake:engagement-changed'));
      await hydrateControl(wrap, context);
    } catch (error) {
      await hydrateControl(wrap, context);
      const nextStatus = wrap.querySelector('.context-mind-status');
      if (nextStatus) nextStatus.textContent = error.message;
    }
  }

  function build(context) {
    const wrap = document.createElement('div');
    wrap.className = 'context-mind-action';
    wrap.dataset.contextMind = context.source_key;
    if (isPreview()) {
      renderControl(wrap, context, null, true);
    } else {
      wrap.innerHTML = `<button type="button" class="context-mind-button" disabled>Checking…</button><span class="context-mind-status" aria-live="polite"></span>`;
      requestAnimationFrame(() => hydrateControl(wrap, context));
    }
    return wrap;
  }

  function enhance() {
    if (!canRender()) {
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

  function refreshControls() {
    clearGoalCache();
    document.querySelectorAll('.context-mind-action').forEach(node => node.remove());
    schedule();
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

  window.GreywakeCardPriorities = { refresh: refreshControls };
  window.addEventListener('greywake:player-ready', () => { clearGoalCache(); setupObserver(); schedule(); });
  window.addEventListener('greywake:engagement-changed', refreshControls);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('DOMContentLoaded', () => { setupObserver(); schedule(); });
})();
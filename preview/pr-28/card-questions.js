(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const MAX_LENGTH = 240;
  const CHARACTER_CODES = { marek: 'MAREK', velmira: 'VELMIRA', odie: 'ODIE' };
  let observer;
  let enhanceTimer;

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

  function canAsk() {
    const user = currentUser();
    return Boolean(
      user &&
      user.role === 'player' &&
      document.body.dataset.gmPreview !== 'true' &&
      characterKey(user)
    );
  }

  async function createQuestion(context, text) {
    const user = currentUser();
    const character = characterKey(user);
    if (!character) throw new Error('Greywake player identity is unavailable.');
    const code = String(user?.code || CHARACTER_CODES[character]).toUpperCase();
    const payload = {
      goal: text.slice(0, MAX_LENGTH),
      entry_kind: 'question'
    };

    if (context?.source_key) {
      payload.source_kind = context.source_kind;
      payload.source_key = context.source_key;
      payload.source_title = context.source_title;
      payload.source_route = context.source_route;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        apikey: API_KEY,
        'Content-Type': 'application/json',
        'x-greywake-character': character,
        'x-greywake-code': code
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Greywake could not save that question.');
    return data;
  }

  function personalContexts() {
    const character = characterKey() || 'player';
    return [...document.querySelectorAll('.personal-card')].map(card => {
      const title = card.querySelector('h4')?.textContent?.trim();
      if (!title) return null;
      return {
        element: card,
        placement: 'card',
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
        placement: 'card',
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
    if (!heading) return null;
    const hash = location.hash || '';
    if (!hash.startsWith('#/record/')) return null;
    const key = decodeURIComponent(hash.slice(9));
    return {
      element: article,
      placement: 'record',
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

  function build(context) {
    const wrap = document.createElement('div');
    wrap.className = 'context-question';
    wrap.dataset.contextQuestion = context.source_key;
    wrap.innerHTML = `
      <button type="button" class="context-question-toggle" aria-expanded="false">? Ask about this</button>
      <form class="context-question-form" hidden>
        <label>Ask about <strong>${esc(context.source_title)}</strong></label>
        <textarea rows="3" maxlength="${MAX_LENGTH}" placeholder="What does your character want to know about this?"></textarea>
        <div class="context-question-actions">
          <button type="submit">Send question</button>
          <button type="button" class="context-question-cancel">Cancel</button>
          <span class="context-question-status" aria-live="polite"></span>
        </div>
      </form>`;
    return wrap;
  }

  function wire(context, wrap) {
    const toggle = wrap.querySelector('.context-question-toggle');
    const form = wrap.querySelector('.context-question-form');
    const textarea = wrap.querySelector('textarea');
    const cancel = wrap.querySelector('.context-question-cancel');
    const status = wrap.querySelector('.context-question-status');

    const close = () => {
      form.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      status.textContent = '';
    };

    toggle.addEventListener('click', () => {
      const opening = form.hidden;
      form.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
      if (opening) textarea.focus();
    });
    cancel.addEventListener('click', close);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const question = textarea.value.trim().replace(/\s+/g, ' ');
      if (question.length < 3) {
        status.textContent = 'Add a little more detail.';
        textarea.focus();
        return;
      }
      form.querySelectorAll('button').forEach(button => { button.disabled = true; });
      status.textContent = 'Saving…';
      try {
        await createQuestion(context, question);
        textarea.value = '';
        status.textContent = 'Added to your Questions & Interests.';
        window.dispatchEvent(new CustomEvent('greywake:engagement-changed'));
        setTimeout(close, 900);
      } catch (error) {
        status.textContent = error.message;
      } finally {
        form.querySelectorAll('button').forEach(button => { button.disabled = false; });
      }
    });
  }

  function enhanceGeneralComposer() {
    const form = document.getElementById('goalForm');
    if (!form || form.dataset.generalQuestionReady === 'true') return;

    const label = form.querySelector('label[for="goalInput"]');
    const input = form.querySelector('#goalInput');
    const row = form.querySelector('.goal-input-row');
    const interestButton = row?.querySelector('button[type="submit"]');
    if (!input || !row || !interestButton) return;

    form.dataset.generalQuestionReady = 'true';
    if (label) label.textContent = 'Ask or tell the GM something else';
    input.placeholder = "A question, idea or direction that isn't attached to a card…";
    interestButton.textContent = 'Add interest';

    const askButton = document.createElement('button');
    askButton.type = 'button';
    askButton.className = 'general-question-button';
    askButton.textContent = 'Ask question';
    row.insertBefore(askButton, interestButton);

    const status = document.createElement('span');
    status.className = 'general-question-status';
    status.setAttribute('aria-live', 'polite');
    row.insertAdjacentElement('afterend', status);

    askButton.addEventListener('click', async () => {
      const question = input.value.trim().replace(/\s+/g, ' ');
      if (question.length < 3) {
        status.textContent = 'Add a little more detail.';
        input.focus();
        return;
      }
      askButton.disabled = true;
      status.textContent = 'Saving question…';
      try {
        await createQuestion(null, question);
        input.value = '';
        status.textContent = 'Added as a question.';
        window.dispatchEvent(new CustomEvent('greywake:engagement-changed'));
      } catch (error) {
        askButton.disabled = false;
        status.textContent = error.message;
      }
    });
  }

  function enhance() {
    if (!canAsk()) {
      document.querySelectorAll('.context-question').forEach(node => node.remove());
      return;
    }

    enhanceGeneralComposer();

    contexts().forEach(context => {
      const directExisting = [...context.element.children].find(
        node => node.classList?.contains('context-question') && node.dataset.contextQuestion === context.source_key
      );
      if (directExisting) return;

      const wrap = build(context);
      if (context.placement === 'record') {
        const meta = context.element.querySelector(':scope > .article-meta');
        const heading = context.element.querySelector(':scope > h1');
        (heading || meta)?.insertAdjacentElement('afterend', wrap);
      } else {
        context.element.appendChild(wrap);
      }
      wire(context, wrap);
    });
  }

  function scheduleEnhance() {
    clearTimeout(enhanceTimer);
    enhanceTimer = setTimeout(enhance, 40);
  }

  function setupObserver() {
    observer?.disconnect();
    const home = document.getElementById('home');
    const article = document.getElementById('article');
    observer = new MutationObserver(scheduleEnhance);
    if (home) observer.observe(home, { childList: true, subtree: true });
    if (article) observer.observe(article, { childList: true, subtree: true });
  }

  window.addEventListener('greywake:player-ready', () => {
    setupObserver();
    scheduleEnhance();
  });
  window.addEventListener('hashchange', scheduleEnhance);
  document.addEventListener('DOMContentLoaded', () => {
    setupObserver();
    scheduleEnhance();
  });
})();

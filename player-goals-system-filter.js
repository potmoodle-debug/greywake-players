(() => {
  const originalFetch = window.fetch.bind(window);
  const PLAYER_GOALS_PATH = '/functions/v1/player-goals';

  window.fetch = async (input, init = {}) => {
    const response = await originalFetch(input, init);
    try {
      const url = new URL(typeof input === 'string' ? input : input.url, location.href);
      const method = String(init?.method || (typeof input !== 'string' ? input.method : 'GET') || 'GET').toUpperCase();
      if (method !== 'GET' || !url.pathname.includes(PLAYER_GOALS_PATH) || url.searchParams.get('include_system') === '1') return response;
      const data = await response.clone().json();
      if (!data || !Array.isArray(data.goals)) return response;
      const hiddenIds = new Set(data.goals.filter(goal => String(goal?.source_kind || '').startsWith('system_')).map(goal => Number(goal.id)));
      if (!hiddenIds.size) return response;
      data.goals = data.goals.filter(goal => !hiddenIds.has(Number(goal.id)));
      if (Array.isArray(data.messages)) data.messages = data.messages.filter(message => !hiddenIds.has(Number(message.goal_id)));
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'application/json');
      return new Response(JSON.stringify(data), { status: response.status, statusText: response.statusText, headers });
    } catch (_) {
      return response;
    }
  };

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function setText(node, text) {
    if (node && node.textContent !== text) node.textContent = text;
  }

  function openQandA() {
    const host = document.getElementById('playerGoals');
    if (isFullGM()) {
      location.hash = '#/';
      const focusQuestions = () => {
        host?.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        const questionFilter = [...(host?.querySelectorAll('.gm-engagement-filter') || [])].find(button => button.textContent.trim().toUpperCase() === 'QUESTION');
        if (questionFilter && questionFilter.getAttribute('aria-pressed') !== 'true') questionFilter.click();
      };
      requestAnimationFrame(() => requestAnimationFrame(focusQuestions));
      setTimeout(focusQuestions, 180);
      return;
    }
    if (window.GreywakePlayerPortal?.navigate) window.GreywakePlayerPortal.navigate('#/inbox');
    else location.hash = '#/inbox';
  }

  function makeQuestionsConversational() {
    const host = document.getElementById('playerGoals');
    if (!host) return;
    host.querySelectorAll('.interest-thread[data-entry-kind="question"]').forEach(card => {
      const resolved = card.classList.contains('interest-thread-resolved');
      const pill = card.querySelector('.interest-waiting-pill');
      const atTable = (pill?.textContent || '').toUpperCase().includes('PLAY AT TABLE');
      if (!resolved && !atTable) setText(pill, 'OPEN CONVERSATION');

      const banner = card.querySelector('.interest-waiting');
      if (banner && !resolved && !atTable) {
        setText(banner.querySelector('strong'), 'OPEN CONVERSATION');
        setText(banner.querySelector('span'), 'Keep talking whenever you have something to add. Messages do not need to alternate, so nobody has to wait for the other person before continuing.');
      }

      const playerForm = card.querySelector('.interest-reply-form');
      if (playerForm && !resolved && !atTable) {
        setText(playerForm.querySelector('label'), 'Add to conversation');
        const textarea = playerForm.querySelector('textarea');
        if (textarea && textarea.placeholder !== 'Ask a follow-up, clarify something, add another thought, or say what you want to do next…') textarea.placeholder = 'Ask a follow-up, clarify something, add another thought, or say what you want to do next…';
        setText(playerForm.querySelector('button[type="submit"]'), 'Send message');
        setText(playerForm.querySelector('.interest-reply-actions span'), 'You can send another message at any time.');
      }

      const gmForm = card.querySelector('.gm-interest-reply');
      if (gmForm && !resolved) {
        setText(gmForm.querySelector('label'), 'Add to conversation');
        const textarea = gmForm.querySelector('textarea');
        if (textarea && textarea.placeholder !== 'Reply, ask a follow-up, clarify something, or add another thought…') textarea.placeholder = 'Reply, ask a follow-up, clarify something, or add another thought…';
        setText(gmForm.querySelector('[data-send-kind="reply"]'), 'Send message');
      }
    });
  }

  function ensureInformationFlow() {
    if (document.querySelector('script[data-player-information-flow]')) return;
    const script = document.createElement('script');
    script.src = 'player-information-flow.js?v=info1';
    script.defer = true;
    script.dataset.playerInformationFlow = 'true';
    document.head.appendChild(script);
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('#p7FixedQna, #qnaQuickBtn, [data-open-qa]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openQandA();
  }, true);

  const host = document.getElementById('playerGoals');
  if (host) new MutationObserver(() => requestAnimationFrame(makeQuestionsConversational)).observe(host, { childList: true, subtree: true });

  window.addEventListener('greywake:engagement-changed', makeQuestionsConversational);
  window.addEventListener('greywake:player-ready', makeQuestionsConversational);
  document.addEventListener('DOMContentLoaded', () => {
    ensureInformationFlow();
    makeQuestionsConversational();
  });
  ensureInformationFlow();
  makeQuestionsConversational();
})();
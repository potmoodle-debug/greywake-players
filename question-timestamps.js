(() => {
  let latestState = null;
  let timer = null;
  const originalFetch = window.fetch.bind(window);

  function formatTimestamp(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  function getBaseLabel(label) {
    if (!label) return '';

    if (!label.dataset.questionTimestampBase) {
      // Keep the original label once. The old implementation tried to remove
      // its own timestamp from textContent on every render, but en-GB can
      // format September as "Sept" (four letters), so the cleanup regex did
      // not match and the MutationObserver repeatedly appended the timestamp.
      const cleaned = String(label.textContent || '')
        .replace(/(?:\s*·\s*\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4},?\s+\d{2}:\d{2})+\s*$/i, '')
        .trimEnd();
      label.dataset.questionTimestampBase = cleaned;
    }

    return label.dataset.questionTimestampBase;
  }

  function setTimestamp(label, stamp) {
    if (!label || !stamp) return;
    const desired = getBaseLabel(label) + ' · ' + stamp;

    // Avoid mutating the DOM when nothing changed. This prevents our own
    // MutationObserver from creating a render loop.
    if (label.textContent !== desired) {
      label.textContent = desired;
    }
  }

  function decorate() {
    if (!latestState) return;
    const goals = Array.isArray(latestState.goals) ? latestState.goals : [];
    const messages = Array.isArray(latestState.messages) ? latestState.messages : [];
    const byId = new Map(goals.map(goal => [String(goal.id), goal]));

    document.querySelectorAll('.interest-thread[data-goal-id]').forEach(thread => {
      const goal = byId.get(String(thread.dataset.goalId));
      if (!goal) return;

      const blocks = [...thread.querySelectorAll('.interest-conversation .interest-message')];
      if (!blocks.length) return;

      const openingLabel = blocks[0].querySelector('span');
      setTimestamp(openingLabel, formatTimestamp(goal.created_at));

      const replies = messages
        .filter(message => Number(message.goal_id) === Number(goal.id))
        .sort((a, b) => {
          const ta = new Date(a.created_at || 0).getTime();
          const tb = new Date(b.created_at || 0).getTime();
          return ta - tb || Number(a.id || 0) - Number(b.id || 0);
        });

      blocks.slice(1).forEach((block, index) => {
        const label = block.querySelector('span');
        setTimestamp(label, formatTimestamp(replies[index]?.created_at));
      });
    });
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(decorate, 60);
  }

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    try {
      const url = String(args[0] instanceof Request ? args[0].url : args[0] || '');
      if (url.includes('/functions/v1/player-goals') && response.ok) {
        const data = await response.clone().json();
        if (Array.isArray(data?.goals) || Array.isArray(data?.messages)) {
          latestState = data;
          schedule();
        }
      }
    } catch (_) {}
    return response;
  };

  const observer = new MutationObserver(schedule);
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();
  });

  window.addEventListener('greywake:goals-rendered', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  window.addEventListener('hashchange', schedule);
})();

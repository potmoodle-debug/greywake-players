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
})();
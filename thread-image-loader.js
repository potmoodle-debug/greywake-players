(() => {
  const WHITE_DOOR_B64 = 'assets/canon/locations/odie-white-door-dark.webp.b64';
  let cachedDataUrl = null;
  let loading = null;

  async function loadWhiteDoor() {
    if (cachedDataUrl) return cachedDataUrl;
    if (loading) return loading;
    loading = fetch(WHITE_DOOR_B64, { cache: 'force-cache' })
      .then(response => {
        if (!response.ok) throw new Error('White Door image unavailable');
        return response.text();
      })
      .then(base64 => {
        cachedDataUrl = `data:image/webp;base64,${base64.trim()}`;
        return cachedDataUrl;
      })
      .finally(() => { loading = null; });
    return loading;
  }

  async function hydrate() {
    const card = document.querySelector('.thread-card[data-thread="white-tunnel"]');
    if (!card || card.dataset.whiteDoorImageReady === 'true') return;
    const fallback = card.querySelector('.thread-card-image-fallback');
    if (!fallback) return;
    try {
      const src = await loadWhiteDoor();
      if (!card.isConnected) return;
      const img = document.createElement('img');
      img.className = 'thread-card-image';
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = src;
      fallback.replaceWith(img);
      card.dataset.whiteDoorImageReady = 'true';
    } catch (_) {
      // Keep the styled fallback if the optional art cannot be read.
    }
  }

  const grid = document.getElementById('currentThreadsGrid');
  if (grid) new MutationObserver(() => hydrate()).observe(grid, { childList: true, subtree: true });
  window.addEventListener('greywake:player-ready', () => requestAnimationFrame(hydrate));
  document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(hydrate));
})();

(() => {
  const PRIORITY_ORIGINS = {
    'The Closing Ways': 'PLAYER CHOICE',
    'Route-marker tampering': 'WORLD CONSEQUENCE',
    'Cistern Plate': 'WORLD CONSEQUENCE',
    'Ash-Plate': 'WORLD CONSEQUENCE',
    'Abandoned freight': 'WORLD CONSEQUENCE'
  };

  const PORTRAITS = {
    'Mara Vell': 'assets/npcs/hq-v3/mara-vell.webp',
    'Brannic Hale': 'assets/npcs/hq-v3/brannic-hale.webp',
    'Selka Marr': 'assets/npcs/hq-v3/selka-marr.webp',
    'Maela Rusk': 'assets/npcs/hq-v3/maela-rusk.webp'
  };

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function ensureStyles() {
    if (document.getElementById('gm-cockpit-media-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-cockpit-media-styles';
    style.textContent = `
      .gm-vc-pressure-top{flex-wrap:wrap}
      .gm-vc-pressure-origin{display:inline-flex;align-items:center;min-height:19px;padding:3px 7px;border:1px solid #514a35;background:#12130e;color:#b9a66c;font:900 7px/1 inherit;letter-spacing:.11em;text-transform:uppercase}
      .gm-vc-pressure-origin[data-origin="PLAYER CHOICE"]{border-color:#8d7440;background:#2a2415;color:#f0d58a}
      .gm-vc-pressure-origin[data-origin="PLAYER INTEREST"]{border-style:dashed;color:#c8b77d}
      .gm-vc-radar-avatar{width:58px;height:58px;overflow:hidden;padding:0;background:#171811}
      .gm-vc-radar-avatar img{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%;filter:saturate(.78) contrast(1.04)}
      .gm-vc-pressure-media{float:right;width:112px;height:86px;object-fit:cover;margin:0 0 9px 12px;border:1px solid #504a37;box-shadow:0 8px 18px rgba(0,0,0,.28);filter:saturate(.76) contrast(1.03)}
      .gm-vc-thread-origin{display:inline-block;margin-top:6px;padding:3px 6px;border:1px dashed #57503a;color:#b7a66d;font:900 7px/1 inherit;letter-spacing:.1em;text-transform:uppercase}
      .gm-vc-location-image{position:relative;overflow:hidden;background:#12130e}
      .gm-vc-location-image:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,16,11,.93),rgba(15,16,11,.64)),url('assets/tower-distant.jpg') center/cover no-repeat;opacity:.72}
      .gm-vc-location-image>*{position:relative;z-index:1}
    `;
    document.head.appendChild(style);
  }

  function enhancePressures(root) {
    root.querySelectorAll('.gm-vc-pressure').forEach(card => {
      const title = card.querySelector('h3')?.textContent?.trim();
      const origin = PRIORITY_ORIGINS[title];
      if (!origin) return;
      const badge = card.querySelector('.gm-vc-pressure-badge');
      if (badge && title === 'The Closing Ways') badge.textContent = 'CRITICAL';
      if (!card.querySelector('.gm-vc-pressure-origin')) {
        const tag = document.createElement('span');
        tag.className = 'gm-vc-pressure-origin';
        tag.dataset.origin = origin;
        tag.textContent = origin;
        const top = card.querySelector('.gm-vc-pressure-top');
        top?.insertBefore(tag, top.querySelector('.gm-vc-trend'));
      }
      if (title === 'Ash-Plate' && !card.querySelector('.gm-vc-pressure-media')) {
        const img = document.createElement('img');
        img.className = 'gm-vc-pressure-media';
        img.src = 'assets/canon/fauna/ash-plate.webp?v=approved-shells-1';
        img.alt = '';
        img.loading = 'lazy';
        card.querySelector('h3')?.insertAdjacentElement('afterend', img);
      }
    });
  }

  function enhanceNPCs(root) {
    root.querySelectorAll('.gm-vc-radar-card').forEach(card => {
      const name = card.querySelector('h3')?.textContent?.trim();
      const src = PORTRAITS[name];
      const avatar = card.querySelector('.gm-vc-radar-avatar');
      if (!src || !avatar || avatar.querySelector('img')) return;
      avatar.textContent = '';
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      avatar.appendChild(img);
    });
  }

  function enhanceThreads(root) {
    root.querySelectorAll('.gm-vc-thread').forEach(card => {
      const title = card.querySelector('strong')?.textContent?.trim() || '';
      if (!/Flickerfly/i.test(title) || card.querySelector('.gm-vc-thread-origin')) return;
      const tag = document.createElement('span');
      tag.className = 'gm-vc-thread-origin';
      tag.textContent = 'PLAYER INTEREST';
      card.appendChild(tag);
    });
  }

  function enhanceLocation(root) {
    root.querySelectorAll('.gm-vc-instrument').forEach(card => {
      if (card.querySelector('small')?.textContent?.trim() === 'LOCATION') card.classList.add('gm-vc-location-image');
    });
  }

  function enhance() {
    if (!isFullGM() || location.hash !== '#/gm-cockpit') return;
    const root = document.querySelector('#gmRouteWorkspace .gm-vc');
    if (!root) return;
    ensureStyles();
    enhancePressures(root);
    enhanceNPCs(root);
    enhanceThreads(root);
    enhanceLocation(root);
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      enhance();
    });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {childList:true, subtree:true});
  window.addEventListener('hashchange', schedule);
  window.addEventListener('greywake:player-ready', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();

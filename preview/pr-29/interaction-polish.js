(() => {
  function loadVelmiraPlayView() {
    if (!document.querySelector('link[data-velmira-play-view]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'velmira-play-view.css?v=1';
      link.dataset.velmiraPlayView = 'true';
      document.head.appendChild(link);
    }

    if (!document.querySelector('script[data-velmira-play-view]')) {
      const script = document.createElement('script');
      script.src = 'velmira-play-view.js?v=1';
      script.defer = true;
      script.dataset.velmiraPlayView = 'true';
      document.body.appendChild(script);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadVelmiraPlayView, { once: true });
  } else {
    loadVelmiraPlayView();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest?.('.active-action-detail-close');
    if (!button) return;

    if (button.dataset.gentleReady === 'true') {
      delete button.dataset.gentleReady;
      return;
    }

    const detail = button.closest('.active-action-detail');
    if (!detail || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    detail.style.maxHeight = `${detail.scrollHeight}px`;
    detail.getBoundingClientRect();
    requestAnimationFrame(() => {
      detail.classList.add('gentle-closing');
      detail.style.maxHeight = '0px';
    });

    window.setTimeout(() => {
      button.dataset.gentleReady = 'true';
      button.click();
    }, 290);
  }, true);
})();

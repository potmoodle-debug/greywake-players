(() => {
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

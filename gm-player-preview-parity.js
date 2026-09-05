(() => {
  if (document.querySelector('script[data-gm-preview-mind-direct]')) return;
  const script=document.createElement('script');
  script.src='gm-preview-mind-direct.js?v=preview2';
  script.defer=true;
  script.dataset.gmPreviewMindDirect='true';
  document.head.appendChild(script);
})();

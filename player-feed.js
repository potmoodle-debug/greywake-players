(() => {
  // Legacy GM activity feed retired. The Inbox is now a persistent triage workspace.
  if (document.querySelector('script[data-gm-inbox-rebuild]')) return;
  const script = document.createElement('script');
  script.src = 'gm-inbox.js?v=inbox3';
  script.defer = true;
  script.dataset.gmInboxRebuild = 'true';
  document.head.appendChild(script);
})();

(() => {
  // Legacy GM activity feed retired. The Inbox is now a persistent triage workspace.
  if (!document.querySelector('script[data-gm-inbox-rebuild]')) {
    const inbox = document.createElement('script');
    inbox.src = 'gm-inbox.js?v=inbox3';
    inbox.defer = true;
    inbox.dataset.gmInboxRebuild = 'true';
    document.head.appendChild(inbox);
  }

  // GM Cockpit is campaign control; Run remains the focused live-session workspace.
  if (!document.querySelector('script[data-gm-cockpit-role-split]')) {
    const cockpit = document.createElement('script');
    cockpit.src = 'gm-cockpit-role-split.js?v=split2';
    cockpit.defer = true;
    cockpit.dataset.gmCockpitRoleSplit = 'true';
    document.head.appendChild(cockpit);
  }

  // Keep Run centred on the actual current scene rather than generic campaign pressures.
  if (!document.querySelector('script[data-gm-run-current-context]')) {
    const current = document.createElement('script');
    current.src = 'gm-run-current-context.js?v=current1';
    current.defer = true;
    current.dataset.gmRunCurrentContext = 'true';
    document.head.appendChild(current);
  }
})();

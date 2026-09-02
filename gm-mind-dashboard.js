(() => {
  const host = document.getElementById('playerGoals');
  if (!host) return;

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function ensureStyles() {
    if (document.getElementById('gm-home-status-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-home-status-styles';
    style.textContent = `
      .gm-home-status{margin:0 0 24px;border:1px solid #4b4734;background:#171811;box-shadow:0 14px 38px rgba(0,0,0,.18)}
      .gm-home-status-main{display:grid;grid-template-columns:minmax(220px,1.3fr) repeat(3,minmax(130px,.7fr));align-items:stretch}
      .gm-home-status-cell{padding:14px 16px;border-right:1px solid #343329;min-width:0}.gm-home-status-cell:last-child{border-right:0}.gm-home-status-cell small{display:block;margin-bottom:5px;color:#8c8161;font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.gm-home-status-cell strong{display:block;color:#e5dcc3;font-size:12px;line-height:1.35}.gm-home-status-priority strong{font:19px/1.15 Georgia,serif;color:#f0dda2}
      .gm-home-status-pressure{padding:9px 14px;border-top:1px solid #343329;color:#958d78;font-size:10px;line-height:1.45}.gm-home-status-pressure b{color:#bea96b;font-size:8px;letter-spacing:.1em;text-transform:uppercase;margin-right:8px}
      #gmCockpitShortcut,#gmMindShortcut{border:1px solid #61583b;background:#211e14;color:#dfcd94;padding:8px 10px;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}#gmCockpitShortcut{border-color:#88733f;background:#2a2415;color:#f0d98d}
      #gmCockpitShortcut.active,#gmMindShortcut.active{box-shadow:inset 0 -2px 0 #d7bf78;border-color:#b49a5e;color:#f4e2aa}
      @media(max-width:1120px){.gm-home-status-main{grid-template-columns:1fr 1fr}.gm-home-status-cell:nth-child(even){border-right:0}}@media(max-width:760px){.gm-home-status-main{display:block}.gm-home-status-cell{border-right:0;border-bottom:1px solid #343329}.gm-home-status-cell:last-child{border-bottom:0}}
    `;
    document.head.appendChild(style);
  }

  function ensureHomeStatus() {
    if (!isFullGM()) {
      document.querySelector('.gm-home-status')?.remove();
      return;
    }
    if (document.querySelector('.gm-home-status')) return;
    const status = document.createElement('section');
    status.className = 'gm-home-status';
    status.innerHTML = `
      <div class="gm-home-status-main">
        <div class="gm-home-status-cell gm-home-status-priority"><small>Party priority</small><strong>The Closing Ways</strong></div>
        <div class="gm-home-status-cell"><small>Session</small><strong>Session Four</strong></div>
        <div class="gm-home-status-cell"><small>Location</small><strong>Greywake</strong></div>
        <div class="gm-home-status-cell"><small>Party</small><strong>Marek · Velmira · Odie</strong></div>
      </div>
      <div class="gm-home-status-pressure"><b>Top pressures</b>The Closing Ways ↑ · Route-marker tampering → · Cistern Plate →</div>`;
    host.prepend(status);
  }

  function ensureShortcuts() {
    if (!isFullGM()) return;
    const topbar = document.querySelector('.topbar');
    const brainBtn = document.getElementById('brainBtn');
    if (!topbar || !brainBtn) return;
    if (!document.getElementById('gmCockpitShortcut')) {
      const cockpit = document.createElement('button');
      cockpit.id = 'gmCockpitShortcut'; cockpit.type = 'button'; cockpit.textContent = 'GM Cockpit';
      topbar.insertBefore(cockpit, brainBtn);
    }
    if (!document.getElementById('gmMindShortcut')) {
      const minds = document.createElement('button');
      minds.id = 'gmMindShortcut'; minds.type = 'button'; minds.textContent = 'On Their Minds';
      topbar.insertBefore(minds, brainBtn);
    }
  }

  function targetRoute(target) {
    if (target.closest('#gmCockpitShortcut')) return '#/gm-cockpit';
    if (target.closest('#gmMindShortcut')) return '#/gm-players';
    if (target.closest('#homeBtn')) return '#/';
    if (target.closest('#myGreywakeBtn')) return '#/gm-players';
    if (target.closest('#greywakeBtn')) return '#/gm-greywake';
    if (target.closest('#campaignBtn')) return '#/gm-campaign';
    return '';
  }

  function setSelected(node, selected) {
    if (!node) return;
    node.classList.toggle('active', selected);
    if (selected) node.setAttribute('aria-current', 'page'); else node.removeAttribute('aria-current');
  }

  function syncActive() {
    if (!isFullGM()) return;
    const h = location.hash || '#/';
    setSelected(document.getElementById('homeBtn'), h === '#/' || h === '');
    setSelected(document.getElementById('characterSheetBtn'), h === '#/character');
    setSelected(document.getElementById('myGreywakeBtn'), h === '#/gm-players');
    setSelected(document.getElementById('greywakeBtn'), h === '#/gm-greywake' || h === '#/brain' || h.startsWith('#/record/'));
    setSelected(document.getElementById('campaignBtn'), h === '#/gm-campaign');
    setSelected(document.getElementById('gmCockpitShortcut'), h === '#/gm-cockpit');
    setSelected(document.getElementById('gmMindShortcut'), h === '#/gm-players');
  }

  function navigate(hash) {
    if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = hash;
  }

  document.addEventListener('click', event => {
    if (!isFullGM()) return;
    const hash = targetRoute(event.target);
    if (!hash) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate(hash);
  }, true);

  function refresh() {
    if (!isFullGM()) return;
    ensureStyles();
    ensureHomeStatus();
    ensureShortcuts();
    setTimeout(syncActive, 0);
  }

  const observer = new MutationObserver(() => requestAnimationFrame(refresh));
  observer.observe(document.documentElement, {childList:true,subtree:true});
  window.addEventListener('hashchange', () => setTimeout(syncActive, 0));
  window.addEventListener('greywake:player-ready', refresh);
  document.addEventListener('DOMContentLoaded', refresh);
  refresh();
})();
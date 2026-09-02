(() => {
  // Velmira now uses the same Character dossier and live-play layout as Marek
  // and Odie. This compatibility shim only removes artifacts from the retired
  // Velmira-only full-screen/tabbed play mode if an older page state left any.
  function cleanup(){
    document.body.classList.remove('velmira-play-open','velmira-sidebar-collapsed');
    document.documentElement.classList.remove('velmira-play-open');
    document.getElementById('velmiraPlayBtn')?.remove();
    document.querySelector('.velmira-play-close')?.remove();

    const root=document.querySelector('#characterSheet .character-sheet-shell');
    const body=root?.querySelector('.character-sheet-body');
    if(!root||!body)return;

    // Recover groups from the retired nested panels without rebuilding them.
    const panels=[...root.querySelectorAll('.velmira-play-panel')];
    if(panels.length){
      const groups=panels.flatMap(panel=>[...panel.querySelectorAll(':scope > .sheet-group')]);
      const canonical=['Traits','Experiences','Features','Domain cards','Weapons, armor & inventory'];
      groups.sort((a,b)=>canonical.indexOf(a.querySelector('.sheet-group-head h3')?.textContent.trim())-canonical.indexOf(b.querySelector('.sheet-group-head h3')?.textContent.trim()));
      body.replaceChildren(...groups);
    }
    root.querySelector('.velmira-play-intro')?.remove();
    root.querySelector('.velmira-play-tabs')?.remove();
    root.classList.remove('velmira-play-view');
    delete root.dataset.velmiraTabs;

    window.GreywakeCharacterLayout?.schedule?.();
    window.GreywakePlayerPortal?.syncPrimaryNav?.('character');
  }

  window.addEventListener('greywake:player-ready',cleanup);
  window.addEventListener('greywake:sheet-enhanced',cleanup);
  window.addEventListener('hashchange',cleanup);
  document.addEventListener('DOMContentLoaded',cleanup);
  setTimeout(cleanup,180);
})();

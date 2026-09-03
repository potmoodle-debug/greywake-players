(() => {
  // Velmira, Odie and Marek now share one Character dossier/live-play layout.
  // This compatibility shim removes artifacts from the retired Velmira-only
  // play mode and hides the old body Traits cards once the live trait roller
  // is present. The trait cards remain in the DOM because live roll mechanics
  // still read their values as the character's trait data source.

  function ensureDuplicateTraitStyle(){
    if(document.getElementById('sharedDuplicateTraitStyle'))return;
    const style=document.createElement('style');
    style.id='sharedDuplicateTraitStyle';
    style.textContent='#characterSheet .character-sheet-body .p10-traits-duplicate{display:none!important}';
    document.head.appendChild(style);
  }

  function hideDuplicateTraits(root){
    const body=root?.querySelector('.character-sheet-body');
    if(!body)return;
    const traits=[...body.querySelectorAll(':scope > .sheet-group')]
      .find(group=>group.querySelector('.sheet-group-head h3')?.textContent.trim()==='Traits');
    traits?.classList.add('p10-traits-duplicate');
  }

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

    ensureDuplicateTraitStyle();
    hideDuplicateTraits(root);

    window.GreywakeCharacterLayout?.schedule?.();
    window.GreywakePlayerPortal?.syncPrimaryNav?.('character');
  }

  function ensureGuidedActions(){
    if(document.getElementById('velmiraGuidedActionsScript'))return;
    const script=document.createElement('script');
    script.id='velmiraGuidedActionsScript';
    script.src='velmira-guided-actions.js?v=guided1';
    script.defer=true;
    document.head.appendChild(script);
  }

  window.addEventListener('greywake:player-ready',cleanup);
  window.addEventListener('greywake:sheet-enhanced',cleanup);
  window.addEventListener('hashchange',cleanup);
  document.addEventListener('DOMContentLoaded',cleanup);
  document.addEventListener('DOMContentLoaded',ensureGuidedActions);
  ensureGuidedActions();
  setTimeout(cleanup,180);
})();

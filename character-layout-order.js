(() => {
  function characterKey(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase();
  }

  function normalize(){
    const key=characterKey();
    if(!['marek','velmira','odie'].includes(key))return;
    const identity=document.querySelector('#characterSheet .character-sheet-identity');
    if(!identity)return;

    const beast=document.getElementById('beastformControl');
    const actions=document.getElementById(key==='marek'?'activeActionsPanel':'companionActionsPanel');
    const resources=identity.querySelector('.pro-resource-board');
    const traits=document.getElementById('traitRollPanel');
    const damage=document.getElementById('damageHealthPanel');
    const rest=document.getElementById('restPanel');

    const ordered=[beast,actions,resources,traits,damage,rest].filter(node=>node && node.parentElement===identity);
    if(!ordered.length)return;

    let anchor=null;
    ordered.forEach(node=>{
      if(!anchor){
        const firstDynamic=[...identity.children].find(child=>[beast,actions,resources,traits,damage,rest].includes(child));
        if(firstDynamic && firstDynamic!==node) identity.insertBefore(node,firstDynamic);
      }else if(anchor.nextElementSibling!==node){
        anchor.insertAdjacentElement('afterend',node);
      }
      anchor=node;
    });
  }

  let timer=null;
  function schedule(delay=0){
    clearTimeout(timer);
    timer=setTimeout(normalize,delay);
  }

  window.GreywakeCharacterLayout={normalize};
  window.addEventListener('greywake:player-ready',()=>schedule(220));
  window.addEventListener('greywake:sheet-enhanced',()=>schedule(220));
  window.addEventListener('greywake:resources-changed',()=>schedule(0));
  window.addEventListener('greywake:companion-resources-changed',()=>schedule(0));
  window.addEventListener('greywake:damage-changed',()=>schedule(0));
  window.addEventListener('greywake:rest-state-changed',()=>schedule(0));
  window.addEventListener('hashchange',()=>schedule(220));
  document.addEventListener('DOMContentLoaded',()=>schedule(320));
})();

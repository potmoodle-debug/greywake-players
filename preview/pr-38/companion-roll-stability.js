(() => {
  function isCompanion(){
    const key=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();
    return key==='odie'||key==='velmira';
  }

  document.addEventListener('click',event=>{
    if(!isCompanion()) return;
    const button=event.target.closest?.('#companionActionsPanel [data-companion-roll]');
    if(!button) return;

    const oldDetail=button.closest('.active-action-detail');
    const oldResult=oldDetail?.querySelector('[data-roll-result]');
    const title=oldDetail?.querySelector('h3')?.textContent.trim()||'';
    if(!oldDetail||!oldResult||!title) return;

    queueMicrotask(()=>{
      if(!oldResult.innerHTML.trim()) return;
      const currentDetails=[...document.querySelectorAll('#companionActionsPanel .active-action-detail')];
      const currentDetail=currentDetails.find(detail=>detail.querySelector('h3')?.textContent.trim()===title);
      const currentResult=currentDetail?.querySelector('[data-roll-result]');
      if(!currentResult||currentResult===oldResult) return;

      // Move the actual result node rather than copying HTML so its Roll Damage
      // listener and any follow-up controls stay attached.
      currentResult.replaceWith(oldResult);
    });
  });
})();

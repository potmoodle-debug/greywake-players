(() => {
  function selectedMoves(dialog){
    const moves=[];
    dialog.querySelectorAll('[data-move]').forEach(button=>{
      if(button.dataset.moveDelta!=='1')return;
      const card=button.closest('.rest-move-card');
      const count=Number(card?.querySelector('.rest-move-counter b')?.textContent||0);
      if(!count)return;
      const name=card?.querySelector('strong')?.textContent?.trim()||button.dataset.move;
      moves.push({id:button.dataset.move,name,count});
    });
    return moves;
  }

  function effectText(move){
    const longRest=/LONG REST/i.test(document.querySelector('#restDialog .rest-dialog-head span')?.textContent||'');
    const count=move.count>1?` ×${move.count}`:'';
    if(move.id==='tend') return longRest ? `clear all marked HP${count}` : `recover HP${count}`;
    if(move.id==='stress') return longRest ? `clear all marked Stress${count}` : `recover Stress${count}`;
    if(move.id==='armor') return longRest ? `repair all marked Armor Slots${count}` : `repair Armor Slots${count}`;
    if(move.id==='prepare') return `gain Hope${count}`;
    if(move.id==='project') return `work on a project${count}`;
    return move.name.toLowerCase();
  }

  function updateSummary(){
    const dialog=document.getElementById('restDialog');
    if(!dialog?.open)return;
    const complete=dialog.querySelector('[data-complete-rest]');
    if(!complete)return;
    let summary=dialog.querySelector('[data-rest-choice-summary]');
    if(!summary){
      summary=document.createElement('div');
      summary.className='rest-choice-summary';
      summary.dataset.restChoiceSummary='true';
      complete.insertAdjacentElement('beforebegin',summary);
    }
    const moves=selectedMoves(dialog);
    if(!moves.length){
      summary.innerHTML='<span>THIS REST WILL…</span><strong>Choose two downtime moves</strong><small>A Long Rest does not automatically clear HP or Stress; the selected moves determine the recovery.</small>';
      return;
    }
    const effects=moves.map(effectText);
    summary.innerHTML=`<span>THIS REST WILL…</span><strong>${effects.join(' + ')}</strong><small>${effects.some(x=>/HP/i.test(x))?'HP recovery selected.':'HP will not change.'} ${effects.some(x=>/Stress/i.test(x))?'Stress recovery selected.':'Stress will not change.'}</small>`;
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.('[data-rest], #restDialog [data-move-delta], #restDialog [data-complete-rest]')) setTimeout(updateSummary,0);
  });
  document.addEventListener('change',event=>{
    if(event.target.closest?.('#restDialog')) setTimeout(updateSummary,0);
  });
  window.addEventListener('greywake:rest-completed',()=>setTimeout(updateSummary,0));
})();
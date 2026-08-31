(() => {
  function closeRestDialog(){
    const dialog=document.getElementById('restDialog');
    if(!dialog)return;
    if(typeof dialog.close==='function'&&dialog.open){
      try{dialog.close();return;}catch(_){}
    }
    dialog.removeAttribute('open');
  }

  function currentWater(){
    const value=window.GreywakeRest?.getState?.()?.water;
    return value===null||value===undefined?0:Number(value)||0;
  }

  function correctStaleWater(event,button){
    const dialog=button.closest('#restDialog');
    if(!dialog||currentWater()>0)return false;
    const noWater=dialog.querySelector('input[name="restWater"][value="none"]');
    const fullLongMoves=[...dialog.querySelectorAll('.rest-move-card>strong')].some(node=>node.textContent.trim()==='Work on a Project');
    if(!fullLongMoves)return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(noWater){
      noWater.checked=true;
      noWater.dispatchEvent(new Event('change',{bubbles:true}));
      requestAnimationFrame(()=>{
        const banner=document.querySelector('#restDialog .rest-rule-banner');
        if(banner){
          banner.setAttribute('role','status');
          banner.scrollIntoView({behavior:'smooth',block:'nearest'});
        }
        updateChoiceSummary();
      });
    }
    return true;
  }

  function revealOutcome(button){
    const original=button.textContent;
    if(button.dataset.restResolving==='true')return;
    button.dataset.restResolving='true';
    button.dataset.restOriginalLabel=original;
    button.textContent='Resolving…';
    button.setAttribute('aria-busy','true');

    setTimeout(()=>{
      const dialog=document.getElementById('restDialog');
      const result=dialog?.querySelector('#restOutcome .rest-result');
      if(result){
        button.hidden=true;
        result.scrollIntoView({behavior:'smooth',block:'nearest'});
        setTimeout(()=>dialog?.querySelector('[data-finish-rest]')?.focus({preventScroll:true}),220);
        return;
      }
      button.textContent=button.dataset.restOriginalLabel||original;
      button.removeAttribute('aria-busy');
      delete button.dataset.restResolving;
    },120);
  }

  function selectedMoves(dialog){
    const moves=[];
    dialog.querySelectorAll('.rest-move-card').forEach(card=>{
      const plus=card.querySelector('[data-move-delta="1"][data-move]');
      const count=Number(card.querySelector('.rest-move-counter b')?.textContent||0);
      if(!plus||!count)return;
      moves.push({id:plus.dataset.move,count,name:card.querySelector(':scope>strong')?.textContent?.trim()||plus.dataset.move});
    });
    return moves;
  }

  function effectText(move,longRest){
    const repeat=move.count>1?` ×${move.count}`:'';
    if(move.id==='tend')return longRest?`clear all marked HP${repeat}`:`recover HP${repeat}`;
    if(move.id==='stress')return longRest?`clear all marked Stress${repeat}`:`recover Stress${repeat}`;
    if(move.id==='armor')return longRest?`repair all marked Armor Slots${repeat}`:`repair Armor Slots${repeat}`;
    if(move.id==='prepare')return`gain Hope${repeat}`;
    if(move.id==='project')return`work on a project${repeat}`;
    return`${move.name.toLowerCase()}${repeat}`;
  }

  function updateChoiceSummary(){
    const dialog=document.getElementById('restDialog');
    if(!dialog?.open)return;
    const complete=dialog.querySelector('[data-complete-rest]');
    if(!complete)return;
    let summary=dialog.querySelector('[data-rest-choice-summary]');
    if(!summary){
      summary=document.createElement('div');
      summary.dataset.restChoiceSummary='true';
      summary.style.cssText='margin:.75rem 0;padding:.7rem;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025);color:#a89f8d;line-height:1.45';
      complete.insertAdjacentElement('beforebegin',summary);
    }
    const moves=selectedMoves(dialog);
    const longRest=/LONG REST/i.test(dialog.querySelector('.rest-dialog-head span')?.textContent||'') && [...dialog.querySelectorAll('.rest-move-card>strong')].some(n=>n.textContent.trim()==='Tend to All Wounds');
    if(!moves.length){
      summary.innerHTML='<span style="display:block;font-size:.62rem;letter-spacing:.14em;color:var(--dossier-accent);font-weight:800">THIS REST WILL…</span><strong style="display:block;color:#eee4cd;margin-top:.18rem">Choose two downtime moves</strong><small>A Long Rest does not automatically clear HP or Stress. Your selected downtime moves determine the recovery.</small>';
      return;
    }
    const effects=moves.map(move=>effectText(move,longRest));
    const hp=effects.some(text=>/HP/i.test(text));
    const stress=effects.some(text=>/Stress/i.test(text));
    summary.innerHTML=`<span style="display:block;font-size:.62rem;letter-spacing:.14em;color:var(--dossier-accent);font-weight:800">THIS REST WILL…</span><strong style="display:block;color:#eee4cd;margin-top:.18rem">${effects.join(' + ')}</strong><small>${hp?'HP recovery selected.':'HP will not change.'} ${stress?'Stress recovery selected.':'Stress will not change.'}</small>`;
  }

  document.addEventListener('click',event=>{
    const closeButton=event.target.closest?.('#restDialog [data-close], #restDialog [data-finish-rest]');
    if(closeButton){
      event.preventDefault();
      event.stopPropagation();
      closeRestDialog();
      return;
    }

    const completeButton=event.target.closest?.('#restDialog [data-complete-rest]');
    if(completeButton&&!completeButton.disabled){
      if(correctStaleWater(event,completeButton))return;
      revealOutcome(completeButton);
      return;
    }

    if(event.target.closest?.('[data-rest], #restDialog [data-move-delta]'))setTimeout(updateChoiceSummary,0);
  },true);

  document.addEventListener('change',event=>{
    if(event.target.closest?.('#restDialog'))setTimeout(updateChoiceSummary,0);
  });

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const dialog=document.getElementById('restDialog');
    if(dialog?.open)closeRestDialog();
  });

  window.addEventListener('greywake:rest-completed',()=>setTimeout(updateChoiceSummary,0));
  window.GreywakeRestDialog={close:closeRestDialog,refreshSummary:updateChoiceSummary};
})();
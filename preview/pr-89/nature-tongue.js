(() => {
  const isMarek=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase()==='marek';
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function natureCard(){
    return [...document.querySelectorAll('#characterSheet .sheet-group')].find(g=>g.querySelector('.sheet-group-head h3')?.textContent.trim()==='Domain cards')
      ?.querySelector('.sheet-card h4')?.textContent.trim()==='Nature’s Tongue'
      ? [...document.querySelectorAll('#characterSheet .sheet-group')].find(g=>g.querySelector('.sheet-group-head h3')?.textContent.trim()==='Domain cards')
          .querySelector('.sheet-card h4')?.closest('.sheet-card')
      : [...document.querySelectorAll('#characterSheet .sheet-card')].find(c=>c.querySelector('h4')?.textContent.trim()==='Nature’s Tongue')||null;
  }

  function ensureDialog(){
    let d=document.getElementById('natureTongueDialog');
    if(d)return d;
    d=document.createElement('dialog');
    d.id='natureTongueDialog';
    d.className='beastform-dialog nature-tongue-dialog';
    d.innerHTML=`
      <div class="beastform-dialog-shell nature-tongue-shell">
        <div class="beastform-dialog-head">
          <div>
            <span>SAGE · ABILITY</span>
            <h2>Nature’s Tongue</h2>
            <p>Speak with nearby plants and animals, or draw on the natural world before a Spellcast Roll.</p>
          </div>
          <button type="button" class="beastform-dialog-close" data-nature-close aria-label="Close Nature’s Tongue">×</button>
        </div>
        <div class="nature-tongue-body">
          <div class="nature-tongue-rule">
            <strong>Speak with the natural world</strong>
            <p>To speak to nearby plants or animals, make an <b>Instinct Roll (12)</b>. On success they give the information they know; Fear can limit knowledge or impose a cost.</p>
            <button type="button" data-nature-roll>Roll Instinct · Difficulty 12</button>
          </div>
          <div class="nature-tongue-rule">
            <strong>Natural Spellcast bonus</strong>
            <p>Before a Spellcast Roll in a natural environment, spend 1 Hope for <b>+2 to the roll</b>.</p>
            <button type="button" data-nature-spend-hope>Spend 1 Hope · Prepare +2</button>
          </div>
          <div class="nature-tongue-status" data-nature-status aria-live="polite"></div>
        </div>
      </div>`;
    (document.getElementById('characterPageView')||document.body).appendChild(d);
    d.addEventListener('click',e=>{if(e.target===d)d.close();});
    d.querySelector('[data-nature-close]')?.addEventListener('click',()=>d.close());
    d.querySelector('[data-nature-roll]')?.addEventListener('click',()=>{
      d.close();
      const panel=document.getElementById('traitRollPanel');
      if(!panel)return;
      const diff=panel.querySelector('[data-trait-difficulty]');
      if(diff)diff.value='12';
      panel.querySelector('[data-trait-roll="Instinct"]')?.click();
      setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'center'}),30);
    });
    d.querySelector('[data-nature-spend-hope]')?.addEventListener('click',()=>{
      const status=d.querySelector('[data-nature-status]');
      const api=window.GreywakeResources;
      const state=api?.getState?.();
      if(!api||!state){if(status)status.textContent='Live Hope track is unavailable.';return;}
      if(Number(state.hope)<1){if(status)status.textContent='Not enough Hope.';return;}
      const r=api.spendHope?.(1,'Nature’s Tongue · natural Spellcast bonus');
      if(r?.ok===false){if(status)status.textContent=r.message||'Hope could not be spent.';return;}
      if(status)status.innerHTML='<strong>+2 prepared</strong><span>Apply +2 to the next Spellcast Roll made in a natural environment.</span>';
      window.dispatchEvent(new CustomEvent('greywake:natures-tongue-spellcast-bonus',{detail:{bonus:2}}));
    });
    return d;
  }

  function openDialog(){
    const d=ensureDialog();
    const status=d.querySelector('[data-nature-status]');
    if(status)status.textContent='';
    if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');
  }

  function bind(){
    if(!isMarek())return;
    const card=natureCard();
    const summary=card?.querySelector('summary');
    if(!summary||summary.dataset.natureTongueBound==='true')return;
    summary.dataset.natureTongueBound='true';
    summary.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      openDialog();
    });
  }

  window.GreywakeNatureTongue={open:openDialog,bind};

  const schedule=()=>setTimeout(bind,120);
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
  if(document.readyState!=='loading')schedule();
})();
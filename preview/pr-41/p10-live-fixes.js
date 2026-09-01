(() => {
  const isMarek=()=>String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase()==='marek';

  function ensureStyles(){
    if(document.getElementById('p10-live-fixes-style'))return;
    const s=document.createElement('style');
    s.id='p10-live-fixes-style';
    s.textContent=`
      .live-resource-armor .live-resource-pip{width:24px!important;height:28px!important;border:1px solid #6d6650!important;border-radius:0!important;clip-path:polygon(50% 0,90% 14%,82% 72%,50% 100%,18% 72%,10% 14%)!important;background:#171813!important;box-shadow:none!important}
      .live-resource-armor .live-resource-pip.filled{background:#9b6a50!important;border-color:#d0a080!important;box-shadow:0 0 0 1px rgba(224,177,145,.2) inset!important}
      .p10-field-actions{grid-template-columns:repeat(4,minmax(0,1fr))!important}
      .p10-field-shortcut{width:100%;padding:11px 12px;font-weight:900;letter-spacing:.04em;cursor:pointer;border:1px solid #756b4d;background:#232119;color:#e5d8ae}
      .p10-field-shortcut:hover,.p10-field-shortcut:focus-visible{border-color:#b29a5e;background:#302a1b}
      #characterBackpackButton{display:none!important}
      @media(max-width:820px){.p10-field-actions{grid-template-columns:1fr 1fr!important}}
      @media(max-width:520px){.p10-field-actions{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(s);
  }

  function ensureFieldShortcuts(){
    const host=document.querySelector('.live-resource-board .p10-field-actions');
    if(!host)return;
    if(!host.querySelector('[data-p10-backpack]')){
      const b=document.createElement('button');
      b.type='button';
      b.className='p10-field-shortcut';
      b.dataset.p10Backpack='true';
      b.textContent='Backpack';
      b.addEventListener('click',()=>window.GreywakeBackpack?.open?.());
      host.appendChild(b);
    }
    if(!host.querySelector('[data-p10-beastform]')){
      const b=document.createElement('button');
      b.type='button';
      b.className='p10-field-shortcut';
      b.dataset.p10Beastform='true';
      b.textContent='Beastform';
      b.addEventListener('click',()=>{
        const trigger=document.getElementById('changeBeastform')||document.getElementById('chooseBeastform');
        if(trigger){trigger.click();return;}
        document.getElementById('beastformControl')?.scrollIntoView({behavior:'smooth',block:'center'});
      });
      host.appendChild(b);
    }
  }

  function protectActionUseDialog(){
    const d=document.getElementById('p10ActionUseDialog');
    if(!d||d.dataset.p10KeepContext==='true')return;
    d.dataset.p10KeepContext='true';
    const nativeClose=d.close.bind(d);
    d.close=(returnValue)=>{
      if(d.dataset.p10SuppressNextClose==='true'){
        d.dataset.p10SuppressNextClose='false';
        return;
      }
      return nativeClose(returnValue);
    };
    d.addEventListener('click',e=>{
      const action=e.target.closest?.('.p10-action-use-body button');
      if(action)d.dataset.p10SuppressNextClose='true';
      if(e.target.closest?.('[data-close]'))d.dataset.p10SuppressNextClose='false';
    },true);
  }

  function refresh(){
    if(!isMarek())return;
    ensureStyles();
    ensureFieldShortcuts();
    protectActionUseDialog();
  }

  let timer;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(refresh,70);};
  for(const event of ['greywake:player-ready','greywake:sheet-enhanced','greywake:resources-changed','greywake:damage-changed','greywake:equipment-state-changed','greywake:rest-state-changed','greywake:beastform-changed'])window.addEventListener(event,schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-p10-can-do],[data-p10-action-title],#chooseBeastform,#changeBeastform'))setTimeout(refresh,40);
  },true);
  window.GreywakeLivePlayFixes={refresh};
})();

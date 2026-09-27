(() => {
  const PLAYER_SHARED=[
    'Great-Shell','Cacklemaw','Glasshoof Runner','Dust-Muzzle','Wirethorn Skitter',
    'Cistern Threader','Carrion Kite','Shellfeed','Latchfan','Thirst-Marrow'
  ];

  const DM_RECORDS={
    'Flickerfly':{
      kind:'Fauna',state:'unrevealed',
      summary:'Established Greywake fauna. Marek has a confirmed interest in studying a Flickerfly.',
      detail:'<p><strong>Established:</strong> Flickerflies exist in Greywake and Marek wants to study one.</p><p>Their exact prey, lifecycle and wider ecological role remain undefined in the current consolidated canon. Do not invent those details just to complete the record.</p>'
    },
    'Juvenile Acid Burrower':{
      kind:'Fauna',state:'unrevealed',
      summary:'Established Greywake creature; juvenile form recorded. Wider ecology remains undefined.',
      detail:'<p><strong>Established:</strong> Juvenile Acid Burrowers are part of the live Greywake ecology catalogue.</p><p>Their exact ecology, adult form, territory and behaviour are not yet safely consolidated. Preserve that uncertainty until established in play or explicitly canonised.</p>'
    },
    'Drywalker':{
      kind:'Fauna',state:'unrevealed',
      summary:'Established consequence of prolonged Thirst-Marrow dependence.',
      detail:'<p><strong>Established:</strong> Drywalkers are connected to prolonged reliance on Thirst-Marrow and are part of that plant’s lifecycle/consequence.</p><p>Do not expand the transformation, physiology or cure beyond what has actually been established.</p>'
    },
    'Salt-Spine':{
      kind:'Fauna',state:'sparse',
      summary:'Established bestiary name; full current biology is not yet consolidated.',
      detail:'<p><strong>Established name.</strong> Salt-Spines belong to the Greywake bestiary.</p><p>The current authority files do not safely consolidate their exact appearance, behaviour or mechanics. Keep this record sparse until those details are recovered or re-approved.</p>'
    },
    'Glassback Viper':{
      kind:'Fauna',state:'sparse',
      summary:'Established bestiary name; full current biology is not yet consolidated.',
      detail:'<p><strong>Established name.</strong> Glassback Vipers belong to the Greywake bestiary.</p><p>The current authority files do not safely consolidate their exact appearance, behaviour or mechanics. Keep this record sparse until those details are recovered or re-approved.</p>'
    },
    'Bonehook Vulture':{
      kind:'Fauna',state:'sparse',
      summary:'Established scavenger name; must remain distinct from Carrion Kites.',
      detail:'<p><strong>Established name.</strong> Bonehook Vultures belong to the Greywake bestiary.</p><p>They must remain ecologically and visually distinct from Carrion Kites. Their full current biology is not yet consolidated.</p>'
    },
    'Siltmouth Burrower':{
      kind:'Fauna',state:'sparse',
      summary:'Established bestiary name; full current biology is not yet consolidated.',
      detail:'<p><strong>Established name.</strong> Siltmouth Burrowers belong to the Greywake bestiary.</p><p>The current authority files do not safely consolidate their exact appearance, behaviour or mechanics. Keep this record sparse until those details are recovered or re-approved.</p>'
    },
    'Sand-Skitter Swarm':{
      kind:'Fauna',state:'sparse',
      summary:'Established bestiary name; full current biology is not yet consolidated.',
      detail:'<p><strong>Established name.</strong> Sand-Skitter Swarms belong to the Greywake ecology.</p><p>The current authority files do not safely consolidate their exact appearance, behaviour or mechanics. Keep this record sparse until those details are recovered or re-approved.</p>'
    },
    'White-Eyed Listener':{
      kind:'Fauna',state:'sparse',
      summary:'Established bestiary name; details remain deliberately under-documented.',
      detail:'<p><strong>Established name.</strong> White-Eyed Listeners belong to the Greywake bestiary.</p><p>The current authority files do not safely consolidate their exact appearance, behaviour, origin or relationship to the Tower. Do not use older speculative material to fill those gaps.</p>'
    },
    'Rattlewing':{
      kind:'Fauna',state:'sparse',
      summary:'Established bestiary name; detailed ecology remains undefined.',
      detail:'<p><strong>Established name.</strong> Rattlewings belong to the Greywake bestiary.</p><p>Their current ecology and behaviour remain under-documented. Do not import older proposed ecology as canon without review.</p>'
    }
  };

  const INDIVIDUALS=['Hopkins','Ash-Plate','Lowbell','Cacklemaw Pack'];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const routeName=()=>{const h=location.hash||'';return h.startsWith('#/gm-world/record/')?decodeURIComponent(h.slice('#/gm-world/record/'.length)):''};
  const gmRoute=name=>'#/gm-world/record/'+encodeURIComponent(name);
  const mediaFor=name=>{
    const M=window.GREYWAKE_MEDIA||{};
    const alias=name==='Cacklemaw'?'Cacklemaw Pack':name;
    const item=(M[name]||M[alias]||[]).find(x=>x&&x.src);
    return item?.src||'';
  };
  const plainSummary=name=>{
    const item=window.GREYWAKE_DATA?.[name];
    if(!item)return'';
    const d=document.createElement('div');d.innerHTML=item.html||'';
    const t=(d.textContent||'').replace(/\s+/g,' ').trim();
    const m=t.match(/^(.{0,155}?[.!?])(?:\s|$)/);
    return m?m[1]:t.slice(0,155)+(t.length>155?'…':'');
  };

  window.GREYWAKE_GM_ECOLOGY={shared:PLAYER_SHARED.slice(),records:{...DM_RECORDS},individuals:INDIVIDUALS.slice()};

  function ensureStyle(){
    if(document.getElementById('gm-ecology-style'))return;
    const s=document.createElement('style');s.id='gm-ecology-style';s.textContent=`
      .gm-ecology-registry{margin-top:8px}.gm-ecology-hero{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(360px,.8fr);gap:28px;align-items:end;margin:0 0 18px;padding:28px 0 24px;border-top:1px solid #4b4431;border-bottom:1px solid #4b4431;background:linear-gradient(90deg,rgba(79,63,31,.12),transparent 58%)}.gm-ecology-hero-copy small{display:block;margin-bottom:8px;color:#b79c61;font-size:8px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.gm-ecology-hero-copy h2{margin:0 0 10px;color:#f0e6cd;font:clamp(36px,4vw,52px)/1 Georgia,serif}.gm-ecology-hero-copy p{max-width:60ch;margin:0;color:#b9b09d;font-size:11px;line-height:1.6}.gm-ecology-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:0}
      .gm-ecology-summary div{padding:13px 14px;border:1px solid #3e3a2d;background:#151611}.gm-ecology-summary strong{display:block;color:#eadba8;font:27px/1 Georgia,serif}.gm-ecology-summary span{color:#8f8771;font-size:8px;letter-spacing:.1em;text-transform:uppercase}
      .gm-ecology-section{margin-top:24px}.gm-ecology-section-head{display:flex;align-items:baseline;gap:12px;margin-bottom:10px}.gm-ecology-section-head small{color:#a99358;font-size:8px;font-weight:900;letter-spacing:.15em}.gm-ecology-section-head h2{margin:0;color:#e7dec6;font:24px/1.2 Georgia,serif}
      .gm-ecology-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.gm-ecology-card{position:relative;min-height:190px;overflow:hidden;border:1px solid #38372b;background:#11120e;text-align:left;cursor:pointer;color:#ddd5bf;padding:0}
      .gm-ecology-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.68) brightness(.6)}.gm-ecology-card:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,8,5,.06),rgba(7,8,5,.94) 80%)}
      .gm-ecology-card-copy{position:absolute;z-index:1;left:0;right:0;bottom:0;padding:13px}.gm-ecology-card small{display:block;color:#b9a469;font-size:7px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.gm-ecology-card strong{display:block;margin:4px 0 6px;color:#f0e6cd;font:19px/1.05 Georgia,serif}.gm-ecology-card p{margin:0;color:#bdb5a2;font-size:9px;line-height:1.35}
      .gm-ecology-card.no-image{padding:15px;min-height:160px}.gm-ecology-card.no-image .gm-ecology-card-copy{position:static;padding:0}.gm-ecology-card:hover{border-color:#9b8652;transform:translateY(-2px)}
      .gm-ecology-state{display:inline-flex!important;width:max-content;margin-bottom:7px;padding:3px 5px;border:1px solid #5a5037;background:#211e15;color:#cfb979!important}.gm-ecology-state.shared{border-color:#3f654d;background:#152219;color:#9fc7a7!important}.gm-ecology-state.sparse{border-color:#6a5540;background:#211912;color:#d4aa7c!important}
      .gm-ecology-note{margin:14px 0;padding:11px 12px;border-left:2px solid #a88f53;background:#191811;color:#c8bea7;font-size:10px;line-height:1.5}.gm-ecology-record-badge{display:inline-block;margin:0 0 12px;padding:4px 7px;border:1px solid #5c5034;color:#ceb777;font-size:8px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
      @media(max-width:900px){.gm-ecology-hero{grid-template-columns:1fr}.gm-ecology-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.gm-ecology-grid,.gm-ecology-summary{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function card(name,state,summary){
    const img=mediaFor(name),stateLabel=state==='shared'?'PLAYER SHARED':state==='sparse'?'ESTABLISHED · SPARSE':'DM ONLY · UNREVEALED';
    return `<button type="button" class="gm-ecology-card ${img?'':'no-image'}" data-gm-ecology-record="${esc(name)}">${img?`<img src="${esc(img)}" alt="">`:''}<div class="gm-ecology-card-copy"><small class="gm-ecology-state ${esc(state)}">${stateLabel}</small><strong>${esc(name)}</strong><p>${esc(summary)}</p></div></button>`;
  }

  function registryHTML(){
    const D=window.GREYWAKE_DATA||{};
    const shared=PLAYER_SHARED.filter(n=>D[n]);
    const hidden=Object.entries(DM_RECORDS).filter(([,x])=>x.state==='unrevealed');
    const sparse=Object.entries(DM_RECORDS).filter(([,x])=>x.state==='sparse');
    const individuals=INDIVIDUALS.filter(n=>D[n]);
    return `<section class="gm-ecology-registry"><header class="gm-ecology-hero"><div class="gm-ecology-hero-copy"><small>DM ECOLOGY REGISTER</small><h2>Greywake Ecology</h2><p>Everything currently established behind the screen, separated by what the players already know and what is still waiting to be discovered.</p></div><div class="gm-ecology-summary"><div><strong>${shared.length}</strong><span>player shared</span></div><div><strong>${hidden.length}</strong><span>unrevealed</span></div><div><strong>${sparse.length}</strong><span>sparse canon</span></div></div></header>
      <div class="gm-ecology-note">A record being in this register does not make it player knowledge. Sparse records preserve established names without inventing missing biology.</div>
      <section class="gm-ecology-section"><div class="gm-ecology-section-head"><small>PLAYER SHARED</small><h2>Already in the field guide</h2></div><div class="gm-ecology-grid">${shared.map(n=>card(n,'shared',plainSummary(n))).join('')}</div></section>
      <section class="gm-ecology-section"><div class="gm-ecology-section-head"><small>DM ONLY</small><h2>Established, waiting to be discovered</h2></div><div class="gm-ecology-grid">${hidden.map(([n,x])=>card(n,'unrevealed',x.summary)).join('')}</div></section>
      <section class="gm-ecology-section"><div class="gm-ecology-section-head"><small>UNDER-DOCUMENTED</small><h2>Established names, preserve the gaps</h2></div><div class="gm-ecology-grid">${sparse.map(([n,x])=>card(n,'sparse',x.summary)).join('')}</div></section>
      ${individuals.length?`<section class="gm-ecology-section"><div class="gm-ecology-section-head"><small>INDIVIDUALS / ENCOUNTERS</small><h2>Specific animals and packs</h2></div><div class="gm-ecology-grid">${individuals.map(n=>card(n,'shared',plainSummary(n))).join('')}</div></section>`:''}
    </section>`;
  }

  function enhanceWorld(){
    const host=document.getElementById('gmOperationsView');if(!host)return;
    if((location.hash||'')==='#/gm-world'){
      if(host.querySelector('.gm-ecology-world-summary'))return;
      const grid=host.querySelector('.gm-world-grid');if(!grid)return;
      const panel=document.createElement('section');panel.className='gm-panel full gm-ecology-world-summary';panel.innerHTML='<small>ECOLOGY</small><h2>Complete DM catalogue</h2><p>The GM side now holds player-shared species, established unrevealed species and sparse established names separately. Open <strong>Known Flora and Fauna</strong> for the full register.</p>';
      grid.insertAdjacentElement('afterend',panel);
    }
  }

  function enhanceRegistryRecord(){
    if(routeName()!=='Known Flora and Fauna')return;
    const host=document.getElementById('gmOperationsView');if(!host||host.dataset.ecologyRegistry==='1')return;
    const article=host.querySelector('.gm-world-record');if(!article)return;
    article.innerHTML=registryHTML();
    host.dataset.ecologyRegistry='1';
  }

  function enhanceHiddenRecord(){
    const name=routeName(),entry=DM_RECORDS[name];if(!entry)return;
    const host=document.getElementById('gmOperationsView');if(!host||host.dataset.ecologyHidden===name)return;
    const unavailable=[...host.querySelectorAll('h1,h2')].some(x=>/Record unavailable/i.test(x.textContent||''));
    if(!unavailable)return;
    host.innerHTML=`<div class="gm-record-head"><button class="gm-inline-action" data-gm-ecology-back>← Ecology register</button><small>FLORA &amp; FAUNA · GM RECORD</small><h1>${esc(name)}</h1></div><article class="gm-world-record"><span class="gm-ecology-record-badge">${entry.state==='sparse'?'ESTABLISHED · SPARSE':'DM ONLY · UNREVEALED'}</span>${entry.detail}<div class="gm-ecology-note">Player status: not in the shared field guide. Reveal only what the characters actually learn.</div></article>`;
    host.dataset.ecologyHidden=name;
    host.querySelector('[data-gm-ecology-back]')?.addEventListener('click',()=>location.hash=gmRoute('Known Flora and Fauna'));
  }

  function wireCards(){
    document.querySelectorAll('[data-gm-ecology-record]').forEach(b=>{
      if(b.dataset.bound==='1')return;b.dataset.bound='1';
      b.addEventListener('click',()=>location.hash=gmRoute(b.dataset.gmEcologyRecord));
    });
  }

  function enhance(){
    if(!fullGM())return;ensureStyle();
    const host=document.getElementById('gmOperationsView');if(host&&(location.hash||'')!=='#/gm-world/record/Known%20Flora%20and%20Fauna')delete host.dataset.ecologyRegistry;
    enhanceWorld();enhanceRegistryRecord();enhanceHiddenRecord();wireCards();
  }

  window.addEventListener('hashchange',()=>setTimeout(enhance,20));
  window.addEventListener('greywake:player-ready',()=>setTimeout(enhance,60));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(enhance,180));
  new MutationObserver(()=>setTimeout(enhance,0)).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(enhance,260);
})();
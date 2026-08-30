(() => {
  const DATA=window.GREYWAKE_DATA||{},EDGES=window.GREYWAKE_EDGES||[],DISC=window.GREYWAKE_DISCOVERIES||[],MEDIA=window.GREYWAKE_MEDIA||{};
  const expandedByDefault=new Set(['Start','Sessions','Player Characters','Jobs & Open Threads']);

  function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
  function routeFor(name){return '#/record/'+encodeURIComponent(name)}
  function discoveryImage(item){
    return item.image||(MEDIA[item.note]&&MEDIA[item.note][0]&&MEDIA[item.note][0].src)||
      (/creature|fauna/i.test(item.kind)?'assets/cacklemaw.jpg':/location/i.test(item.kind)?'assets/stone-lip.jpg':'assets/tower-distant.jpg');
  }

  function enhanceDiscoveries(){
    const grid=document.getElementById('discoveryGrid');if(!grid)return;
    grid.innerHTML='';
    DISC.forEach((item,index)=>{
      const card=document.createElement('button');card.type='button';card.className='discovery-card';card.dataset.note=item.note;
      const src=discoveryImage(item);
      card.innerHTML=`<img src="${escapeHTML(src)}" alt="" loading="${index?'lazy':'eager'}" decoding="async"><div><small>${escapeHTML(item.kind)}</small><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.text)}</p><em>${escapeHTML(item.when)}</em></div>`;
      card.addEventListener('click',()=>{location.hash=routeFor(item.note)});
      grid.appendChild(card);
    });
  }

  function enhanceNav(){
    const nav=document.getElementById('nav');if(!nav)return;
    const searching=Boolean(document.getElementById('searchInput')?.value.trim());
    nav.querySelectorAll('.nav-group').forEach(group=>{
      const heading=group.querySelector(':scope > h3');
      if(!heading||heading.dataset.enhanced)return;
      const label=heading.textContent.trim(),count=group.querySelectorAll(':scope > .nav-link').length;
      const toggle=document.createElement('button');toggle.type='button';toggle.className='nav-toggle';
      toggle.innerHTML=`<span>${escapeHTML(label)}</span><span class="nav-count">${count}</span>`;
      heading.replaceWith(toggle);toggle.dataset.enhanced='true';
      const hasActive=Boolean(group.querySelector('.nav-link.active'));
      const collapsed=!searching&&!hasActive&&!expandedByDefault.has(label);group.classList.toggle('is-collapsed',collapsed);toggle.setAttribute('aria-expanded',String(!collapsed));
      toggle.addEventListener('click',()=>{
        const next=!group.classList.contains('is-collapsed');group.classList.toggle('is-collapsed',next);toggle.setAttribute('aria-expanded',String(!next));
      });
    });
  }

  function setupNavigation(){
    const sidebar=document.querySelector('.sidebar'),menu=document.getElementById('menuBtn'),close=document.getElementById('sidebarClose'),backdrop=document.getElementById('navBackdrop');
    const sync=(moveFocus=false)=>{const open=sidebar?.classList.contains('open');document.body.classList.toggle('nav-open',!!open);menu?.setAttribute('aria-expanded',String(!!open));if(open&&moveFocus)requestAnimationFrame(()=>close?.focus())};
    const closeNav=(restoreFocus=false)=>{const wasOpen=sidebar?.classList.contains('open');sidebar?.classList.remove('open');sync();if(wasOpen&&restoreFocus)menu?.focus()};
    menu?.addEventListener('click',()=>queueMicrotask(()=>sync(true)));
    close?.addEventListener('click',()=>closeNav(true));backdrop?.addEventListener('click',()=>closeNav(true));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&sidebar?.classList.contains('open')){event.preventDefault();closeNav(true)}});
    window.addEventListener('hashchange',()=>closeNav(false));
    document.getElementById('searchInput')?.addEventListener('input',()=>queueMicrotask(enhanceNav));
  }

  function renderMobileBrainList(){
    const graph=document.getElementById('graph'),shell=graph?.querySelector('.brain-network-shell'),jump=graph?.querySelector('#brainJump'),stage=graph?.querySelector('.brain-network-stage');
    if(!shell||!jump||!stage)return;
    let panel=shell.querySelector('.brain-mobile-list');
    if(!panel){panel=document.createElement('section');panel.className='brain-mobile-list';panel.setAttribute('aria-label','Direct relationships');shell.insertBefore(panel,stage)}
    const current=jump.value,related=[];
    EDGES.forEach(([a,b])=>{if(a===current&&DATA[b])related.push(b);else if(b===current&&DATA[a])related.push(a)});
    const unique=[...new Set(related)].sort((a,b)=>(DATA[a]?.title||a).localeCompare(DATA[b]?.title||b));
    panel.innerHTML=`<div class="brain-mobile-kicker">${unique.length} direct relationships</div><div class="brain-mobile-links">${unique.map(name=>`<button type="button" class="brain-mobile-link" data-mobile-note="${escapeHTML(name)}"><small>${escapeHTML(DATA[name]?.category||'Record')}</small><strong>${escapeHTML(DATA[name]?.title||name)}</strong></button>`).join('')}</div>`;
    panel.querySelectorAll('[data-mobile-note]').forEach(button=>button.addEventListener('click',()=>{
      const name=button.dataset.mobileNote;if(jump.value===name)location.hash=routeFor(name);else{jump.value=name;jump.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(renderMobileBrainList,700)}
    }));
  }

  function setupBrain(){
    const graph=document.getElementById('graph');if(!graph)return;
    let timer;const refresh=()=>{clearTimeout(timer);timer=setTimeout(renderMobileBrainList,80)};
    graph.addEventListener('change',()=>{clearTimeout(timer);timer=setTimeout(renderMobileBrainList,720)});
    new MutationObserver(refresh).observe(graph,{childList:true,subtree:true});
    window.addEventListener('hashchange',refresh);refresh();
  }

  function setupReveal(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const items=document.querySelectorAll('.discoveries .section-head,.discovery-card,.field-note');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12});
    items.forEach((item,index)=>{item.classList.add('reveal-ready');item.style.transitionDelay=Math.min(index*55,220)+'ms';observer.observe(item)});
  }


  const CATEGORY_BACKDROPS={
    'Start':'assets/tower-distant.jpg',
    'World':'assets/tower-distant.jpg',
    'Locations':'assets/tower-distant.jpg',
    'People':'assets/tower-close.jpg',
    'Flora & Fauna':'assets/great-shell.jpg',
    'Sessions':'assets/canon/sessions/session-03.webp',
    'Player Characters':'assets/tower-distant.jpg',
    'Archived Characters':'assets/tower-distant.jpg',
    'Handouts':'assets/tower-close.jpg',
    'Field Rules':'assets/cacklemaw.jpg',
    'Factions':'assets/tower-close.jpg',
    'Caravans':'assets/great-shell.jpg',
    'Player Reference':'assets/tower-distant.jpg',
    'Objects':'assets/tower-close.jpg',
    'Jobs & Open Threads':'assets/canon/sessions/session-01.webp',
    'Equipment':'assets/tower-distant.jpg',
    'Archived Equipment':'assets/tower-distant.jpg'
  };
  const NAMED_BACKDROPS={
    'Greywake':'assets/tower-distant.jpg',
    'Greater Greywake':'assets/generated-scenes/greater-greywake-ruins.webp',
    'The Wastes':'assets/generated-scenes/the-wastes-route.webp',
    'Inner Greywake':'assets/generated-scenes/inner-greywake.webp',
    'Valve Court':'assets/generated-scenes/valve-court.webp',
    'Great-Shell Pens':'assets/generated-scenes/great-shell-pens.webp',
    'Digger Yards':'assets/generated-scenes/digger-yards.webp',
    'Caravan Gate':'assets/canon/locations/caravan-gate.webp',
    'Tangle Lanes':'assets/generated-scenes/tangle-lanes.webp',
    'Welcome to Greywake':'assets/tower-distant.jpg',
    'Player Brain':'assets/tower-distant.jpg',
    'White Tower':'assets/tower-close.jpg',
    'Stone-Lip Hollow':'assets/canon/sessions/session-02.webp',
    "Joric's Runnel":'assets/canon/sessions/session-01.webp',
    'Known Locations':'assets/tower-distant.jpg',
    'Known People':'assets/tower-close.jpg',
    'Known Flora and Fauna':'assets/great-shell.jpg',
    'Cistern Keepers':'assets/generated-scenes/valve-court.webp',
    'Caravan Syndicate':'assets/canon/locations/caravan-gate.webp',
    'Tower Watch':'assets/tower-close.jpg',
    'The Diggers':'assets/generated-scenes/digger-yards.webp',
    'The Faithful':'assets/npcs/hq-v3/sister-elowen.webp',
    'Creature Harvesting':'assets/generated-scenes/creature-harvesting-field-table.webp',
    'Cistern Plate':'assets/generated-scenes/cistern-plate-case.webp'
  };
  const FACTION_BACKDROPS=[
    ['Cistern Keepers','assets/generated-scenes/valve-court.webp','center 48%'],
    ['Caravan Syndicate','assets/canon/locations/caravan-gate.webp','center 52%'],
    ['Tower Watch','assets/tower-close.jpg','center 42%'],
    ['The Diggers','assets/generated-scenes/digger-yards.webp','center 50%'],
    ['The Faithful','assets/npcs/hq-v3/sister-elowen.webp','center 24%']
  ];
  const RECORD_FOCUS={
    'Caravan Syndicate':'center 52%',
    'Tower Watch':'center 42%',
    'The Faithful':'center 24%'
  };

  function currentRecordName(){
    const hash=location.hash||'';
    return hash.startsWith('#/record/')?decodeURIComponent(hash.slice(9)):null;
  }
  function normalizedAsset(src){
    try{return new URL(src,location.href).href.split('?')[0]}catch{return src.split('?')[0]}
  }
  function recordBackdrop(name){
    const direct=MEDIA[name]?.find(item=>item.backdrop!==false)?.src;if(direct)return direct;
    const equipment=name.match(/^(.+?) — Equipment$/);
    if(equipment&&MEDIA[equipment[1]])return MEDIA[equipment[1]][1]?.src||MEDIA[equipment[1]][0]?.src;
    return NAMED_BACKDROPS[name]||CATEGORY_BACKDROPS[DATA[name]?.category]||'assets/tower-distant.jpg';
  }
  function dedupeBackdropMedia(){
    const article=document.getElementById('article'),target=article?.dataset.backdropSrc;if(!target)return;
    article.querySelectorAll('.article-media figure').forEach(figure=>{
      const img=figure.querySelector('img');figure.classList.toggle('record-backdrop-source',Boolean(img&&normalizedAsset(img.getAttribute('src')||img.src)===target));
    });
  }
  function enhanceRecordBackdrop(){
    const article=document.getElementById('article'),name=currentRecordName();
    if(!article||!name||!DATA[name]){article?.classList.remove('has-record-backdrop');return}
    const src=recordBackdrop(name),category=DATA[name].category||'Record';
    let layer=article.querySelector(':scope > .record-backdrop');
    if(!layer){layer=document.createElement('div');layer.className='record-backdrop';layer.setAttribute('aria-hidden','true');article.prepend(layer)}
    layer.classList.toggle('faction-overview-backdrop',name==='Known Factions');
    if(name==='Known Factions'){
      layer.style.backgroundImage='none';
      layer.innerHTML=FACTION_BACKDROPS.map(([label,image,focus])=>`<span class="faction-backdrop-panel" style="background-image:url(&quot;${escapeHTML(image)}&quot;);background-position:${escapeHTML(focus)}"><span>${escapeHTML(label)}</span></span>`).join('');
    }else{
      layer.replaceChildren();
      layer.style.backgroundImage=`url("${String(src).replace(/"/g,'%22')}")`;
    }
    article.style.setProperty('--record-focus',RECORD_FOCUS[name]||(/People|Characters/.test(category)?'center 24%':'center 48%'));
    article.dataset.backdropSrc=normalizedAsset(src);
    article.dataset.recordCategory=category;
    article.classList.add('has-record-backdrop');
    requestAnimationFrame(dedupeBackdropMedia);
  }
  function setupRecordBackdrops(){
    const article=document.getElementById('article');if(!article)return;
    let timer;
    const refresh=()=>{clearTimeout(timer);timer=setTimeout(()=>{enhanceRecordBackdrop();dedupeBackdropMedia()},0)};
    new MutationObserver(refresh).observe(article,{childList:true,subtree:true});
    window.addEventListener('hashchange',refresh);
    refresh();
  }

  function syncPlayerChrome(){
    setTimeout(()=>document.body.classList.toggle('has-gm-preview',Boolean(document.querySelector('.gm-preview-bar'))),0);
  }

  enhanceDiscoveries();enhanceNav();setupNavigation();setupBrain();setupReveal();setupRecordBackdrops();syncPlayerChrome();
  window.addEventListener('greywake:player-ready',syncPlayerChrome);
})();


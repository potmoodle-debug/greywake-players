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
      const collapsed=!searching&&!expandedByDefault.has(label);group.classList.toggle('is-collapsed',collapsed);toggle.setAttribute('aria-expanded',String(!collapsed));
      toggle.addEventListener('click',()=>{
        const next=!group.classList.contains('is-collapsed');group.classList.toggle('is-collapsed',next);toggle.setAttribute('aria-expanded',String(!next));
      });
    });
  }

  function setupNavigation(){
    const sidebar=document.querySelector('.sidebar'),menu=document.getElementById('menuBtn'),close=document.getElementById('sidebarClose'),backdrop=document.getElementById('navBackdrop');
    const sync=()=>{const open=sidebar?.classList.contains('open');document.body.classList.toggle('nav-open',!!open);menu?.setAttribute('aria-expanded',String(!!open))};
    const closeNav=()=>{sidebar?.classList.remove('open');sync()};
    menu?.addEventListener('click',()=>queueMicrotask(sync));
    close?.addEventListener('click',closeNav);backdrop?.addEventListener('click',closeNav);
    document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNav()});
    window.addEventListener('hashchange',closeNav);
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

  function syncPlayerChrome(){
    setTimeout(()=>document.body.classList.toggle('has-gm-preview',Boolean(document.querySelector('.gm-preview-bar'))),0);
  }

  enhanceDiscoveries();enhanceNav();setupNavigation();setupBrain();setupReveal();syncPlayerChrome();
  window.addEventListener('greywake:player-ready',syncPlayerChrome);
})();
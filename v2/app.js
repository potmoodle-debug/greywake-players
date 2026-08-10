(() => {
  'use strict';

  const DATA = window.GREYWAKE_DATA || {};
  const EDGES = window.GREYWAKE_EDGES || [];
  const CATS = window.GREYWAKE_CATEGORIES || {};
  const DISC = window.GREYWAKE_DISCOVERIES || [];
  const MEDIA = window.GREYWAKE_MEDIA || {};

  const DIRECT_MEDIA = {
    'Greywake': [{src:'assets/tower-close.jpg',caption:'The White Tower from within Greywake.'},{src:'assets/tower-distant.jpg',caption:'Greywake across the wastes.'}],
    'Great-Shell': [{src:'assets/great-shell.jpg',caption:'Great-Shell — canon visual reference.'}],
    'Cacklemaw Pack': [{src:'assets/cacklemaw.jpg',caption:'Cacklemaw pack — canon visual reference.'}],
    'Stone-Lip Hollow': [{src:'assets/stone-lip.jpg',caption:'Approach to Stone-Lip Hollow through the Broken Runnels.'}],
    'Latchfan': [{src:'assets/flora/latchfan.jpg',caption:'Latchfan — mature specimen, canon visual reference.'}],
    'Brannic Hale': [{src:'assets/npcs/v2/brannic-hale.jpg',caption:'Brannic Hale — commander of the Tower Watch.'}],
    'Joric Noll': [{src:'assets/npcs/v2/joric-noll.jpg',caption:'Joric Noll — survivor of Kestrel Return.'}],
    'Sister Elowen': [{src:'assets/npcs/v2/sister-elowen.jpg',caption:'Sister Elowen — public voice among the Faithful.'}],
    'Talla Reed': [{src:'assets/npcs/v2/talla-reed.jpg',caption:'Talla Reed — Greywake runner and messenger.'}],
    'Maela Rusk': [{src:'assets/npcs/v2/maela-rusk.avif',caption:'Maela Rusk — caravan leader at Stone-Lip Hollow.'}],
    'Rennic Vale': [{src:'assets/npcs/v2/rennic-vale.avif',caption:'Rennic Vale — guardian of the sealed case.'}],
    'Sarn Pell': [{src:'assets/npcs/v2/sarn-pell.avif',caption:'Sarn Pell — Great-Shell handler.'}],
    'Mara Vell': [{src:'assets/npcs/v2/mara-vell.avif',caption:'Mara Vell — Dust Broker at Valve Court.'}]
  };

  const sidebar = document.getElementById('sidebar');
  const nav = document.getElementById('nav');
  const homeView = document.getElementById('homeView');
  const brainView = document.getElementById('brainView');
  const recordView = document.getElementById('recordView');
  const crumb = document.getElementById('crumb');
  const graphHost = document.getElementById('graph');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');

  let activeBrainCategory = 'All';
  let zoom = 1;

  function routeFor(name){ return '#/record/' + encodeURIComponent(name); }
  function go(hash){ if(location.hash === hash) renderRoute(); else location.hash = hash; }
  function parseRoute(){
    const hash = location.hash || '';
    if(hash === '#/brain') return {type:'brain'};
    if(hash.startsWith('#/record/')) return {type:'record', name:decodeURIComponent(hash.slice(9))};
    return {type:'home'};
  }
  function showOnly(view){
    [homeView,brainView,recordView].forEach(v => v.classList.toggle('hidden', v !== view));
    sidebar.classList.remove('open');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function escapeHTML(value){
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }
  function escapeRegExp(value){ return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

  function allCategoryNames(){
    const fromCats = Object.keys(CATS);
    const fromData = [...new Set(Object.values(DATA).map(x => x.category).filter(Boolean))];
    return [...new Set([...fromCats,...fromData])];
  }
  function recordsInCategory(cat){
    const ordered = (CATS[cat] || []).filter(n => DATA[n]);
    const extras = Object.keys(DATA).filter(n => DATA[n].category === cat && !ordered.includes(n));
    return [...ordered,...extras];
  }

  function buildNav(filter=''){
    const q = filter.trim().toLowerCase();
    nav.innerHTML = '';
    allCategoryNames().forEach(cat => {
      const names = recordsInCategory(cat).filter(name => {
        if(!q) return true;
        const entry = DATA[name];
        const text = `${entry.title || name} ${name} ${entry.category || ''} ${stripHTML(entry.html || '')}`.toLowerCase();
        return text.includes(q);
      });
      if(!names.length) return;
      const group = document.createElement('section');
      group.className = 'nav-group';
      group.innerHTML = `<h3>${escapeHTML(cat)}</h3>`;
      names.forEach(name => {
        const button = document.createElement('button');
        button.className = 'nav-link';
        button.dataset.record = name;
        button.textContent = DATA[name].title || name;
        group.appendChild(button);
      });
      nav.appendChild(group);
    });
    if(!nav.children.length) nav.innerHTML = '<div class="sidebar-note">No player-safe records match that search.</div>';
  }

  function stripHTML(html){
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
  }

  function buildCategoryGrid(){
    const host = document.getElementById('categoryGrid');
    host.innerHTML = '';
    const preferred = ['World','Locations','People','Flora & Fauna','Sessions','Player Characters','Handouts','Factions','Caravans','Start'];
    const categories = allCategoryNames().sort((a,b) => {
      const ai = preferred.indexOf(a), bi = preferred.indexOf(b);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.localeCompare(b);
    });
    categories.forEach(cat => {
      const names = recordsInCategory(cat);
      if(!names.length || cat === 'Start') return;
      const button = document.createElement('button');
      button.className = 'category-card';
      button.dataset.category = cat;
      button.innerHTML = `<small>Archive section</small><strong>${escapeHTML(cat)}</strong><span>${names.length} known ${names.length===1?'record':'records'} →</span>`;
      host.appendChild(button);
    });
  }

  function buildDiscoveries(){
    const host = document.getElementById('discoveryGrid');
    host.innerHTML = '';
    DISC.forEach(item => {
      if(!DATA[item.note]) return;
      const button = document.createElement('button');
      button.className = 'discovery-card';
      button.dataset.record = item.note;
      button.innerHTML = `<img src="${escapeHTML(item.image || '')}" alt=""><div class="discovery-copy"><small>${escapeHTML(item.kind || 'Discovery')}</small><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.text || '')}</p><em>${escapeHTML(item.when || '')}</em></div>`;
      const img = button.querySelector('img');
      img.addEventListener('error', () => img.remove());
      host.appendChild(button);
    });
  }

  function mediaItems(name){
    if(DIRECT_MEDIA[name]) return DIRECT_MEDIA[name];
    return (MEDIA[name] || []).filter(item => item && item.src).map(item => ({src:item.src,caption:item.caption || ''}));
  }

  function mediaHTML(name){
    const items = mediaItems(name);
    if(!items.length) return '';
    return `<section class="record-media">${items.map(item => `<figure><img src="${escapeHTML(item.src)}" alt="${escapeHTML(DATA[name]?.title || name)}"><figcaption>${escapeHTML(item.caption || DATA[name]?.title || name)}</figcaption></figure>`).join('')}</section>`;
  }

  function relatedFor(name){
    const found = [];
    EDGES.forEach(edge => {
      const [a,b] = edge;
      if(a === name && DATA[b]) found.push(b);
      else if(b === name && DATA[a]) found.push(a);
    });
    return [...new Set(found)].filter(n => n !== name).sort((a,b) => (DATA[a].category || '').localeCompare(DATA[b].category || '') || (DATA[a].title || a).localeCompare(DATA[b].title || b));
  }

  function cardsHTML(names){
    return `<div class="record-cards">${names.map(n => `<a class="record-card" href="${routeFor(n)}" data-record="${escapeHTML(n)}"><small>${escapeHTML(DATA[n].category || 'Record')}</small><strong>${escapeHTML(DATA[n].title || n)}</strong><span>Open record →</span></a>`).join('')}</div>`;
  }

  function directoryHTML(name){
    const map = {'Known Flora and Fauna':'Flora & Fauna','Known Locations':'Locations','Known People':'People'};
    const cat = map[name];
    if(!cat) return '';
    const names = recordsInCategory(cat).filter(n => n !== name).sort((a,b)=>(DATA[a].title||a).localeCompare(DATA[b].title||b));
    if(!names.length) return '';
    return `<section class="directory"><div class="eyebrow">PARTY-KNOWN ${escapeHTML(cat.toUpperCase())}</div><h2>${escapeHTML(cat)}</h2>${cardsHTML(names)}</section>`;
  }

  function relatedHTML(name){
    const related = relatedFor(name);
    if(!related.length) return '';
    return `<section class="related"><div class="eyebrow">CONNECTED RECORDS</div><h2>Related records</h2>${cardsHTML(related)}</section>`;
  }

  function autolink(container,current){
    const names = Object.keys(DATA).filter(n => n !== current && n !== 'Player Brain').sort((a,b)=>(DATA[b].title||b).length-(DATA[a].title||a).length);
    const walker = document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while(walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      if(node.parentElement?.closest('a,button,script,style,h1')) return;
      let parts = [{text:node.nodeValue,linked:false}];
      for(const name of names){
        const title = DATA[name].title || name;
        if(title.length < 4) continue;
        const re = new RegExp(`\\b(${escapeRegExp(title)})\\b`,'gi');
        parts = parts.flatMap(part => {
          if(part.linked) return [part];
          const out=[]; let last=0,match; re.lastIndex=0;
          while((match=re.exec(part.text))){
            if(match.index>last) out.push({text:part.text.slice(last,match.index),linked:false});
            out.push({text:match[0],linked:true,name});
            last=match.index+match[0].length;
          }
          if(last<part.text.length) out.push({text:part.text.slice(last),linked:false});
          return out.length?out:[part];
        });
      }
      if(!parts.some(p=>p.linked)) return;
      const frag=document.createDocumentFragment();
      parts.forEach(part=>{
        if(!part.linked) frag.appendChild(document.createTextNode(part.text));
        else {
          const a=document.createElement('a');a.href=routeFor(part.name);a.dataset.record=part.name;a.textContent=part.text;frag.appendChild(a);
        }
      });
      node.replaceWith(frag);
    });
  }

  function renderRecord(name){
    const entry = DATA[name];
    if(!entry){ go('#/'); return; }
    showOnly(recordView);
    crumb.textContent = `Greywake / ${entry.title || name}`;
    recordView.innerHTML = `
      <div class="record-topnav"><button data-action="back">← Back</button><button data-route="home">Archive home</button><button class="primary" data-route="brain">Player Brain</button></div>
      <div class="record-meta">${escapeHTML(entry.category || 'Record')} / Party-known record</div>
      <h1>${escapeHTML(entry.title || name)}</h1>
      ${mediaHTML(name)}
      <div class="record-body">${entry.html || ''}</div>
      ${directoryHTML(name)}
      ${relatedHTML(name)}`;
    recordView.querySelectorAll('h2').forEach(h => h.textContent = h.textContent.replace(/^##\s*/,''));
    autolink(recordView.querySelector('.record-body'),name);
    wireImageFallbacks(recordView);
    document.querySelectorAll('.nav-link').forEach(btn=>btn.classList.toggle('active',btn.dataset.record===name));
  }

  function wireImageFallbacks(scope){
    scope.querySelectorAll('img').forEach(img => {
      img.addEventListener('error',() => {
        const figure = img.closest('figure');
        if(figure){
          const fallback=document.createElement('div');
          fallback.className='image-fallback';
          fallback.textContent='Image file unavailable in the archive.';
          img.replaceWith(fallback);
        } else img.remove();
      },{once:true});
    });
  }

  function renderHome(){
    showOnly(homeView);
    crumb.textContent = 'Greywake / Archive';
    document.querySelectorAll('.nav-link').forEach(btn=>btn.classList.remove('active'));
  }

  function buildBrainFilters(){
    const host = document.getElementById('brainFilters');
    host.innerHTML='';
    ['All',...allCategoryNames().filter(c=>c!=='Start')].forEach(cat=>{
      const b=document.createElement('button');
      b.className='filter-chip'+(cat===activeBrainCategory?' active':'');
      b.dataset.brainCategory=cat;
      b.textContent=cat;
      host.appendChild(b);
    });
  }

  function graphNames(){
    return Object.keys(DATA).filter(name => name !== 'Player Brain' && (activeBrainCategory === 'All' || DATA[name].category === activeBrainCategory || relatedFor(name).some(r=>DATA[r]?.category===activeBrainCategory)));
  }

  function drawGraph(){
    const names = graphNames();
    const W=1200,H=760,cx=W/2,cy=H/2;
    const rootName='Player Brain';
    const nodes={};
    nodes[rootName]={x:cx,y:cy,name:rootName,category:'Start'};
    const grouped={};
    names.forEach(n => (grouped[DATA[n].category || 'Other'] ??= []).push(n));
    const categories=Object.keys(grouped);
    categories.forEach((cat,ci)=>{
      const arr=grouped[cat];
      const base=(ci/Math.max(categories.length,1))*Math.PI*2-Math.PI/2;
      const ring=categories.length>7?300:270;
      arr.forEach((name,i)=>{
        const spread=Math.min(.68,Math.max(.18,.52/Math.max(1,arr.length-1)));
        const angle=base+(i-(arr.length-1)/2)*spread;
        const offset=(i%2)*62;
        nodes[name]={x:cx+Math.cos(angle)*(ring+offset),y:cy+Math.sin(angle)*(ring+offset),name,category:cat};
      });
    });

    const visible=new Set(Object.keys(nodes));
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    const vbW=W/zoom,vbH=H/zoom;
    svg.setAttribute('viewBox',`${cx-vbW/2} ${cy-vbH/2} ${vbW} ${vbH}`);

    EDGES.forEach(([a,b])=>{
      if(!visible.has(a)||!visible.has(b)) return;
      const line=document.createElementNS(svg.namespaceURI,'line');
      line.setAttribute('x1',nodes[a].x);line.setAttribute('y1',nodes[a].y);line.setAttribute('x2',nodes[b].x);line.setAttribute('y2',nodes[b].y);line.setAttribute('class','edge');
      svg.appendChild(line);
    });
    names.forEach(name=>{
      if(!EDGES.some(([a,b]) => (a===rootName&&b===name)||(b===rootName&&a===name))) return;
      const line=document.createElementNS(svg.namespaceURI,'line');line.setAttribute('x1',cx);line.setAttribute('y1',cy);line.setAttribute('x2',nodes[name].x);line.setAttribute('y2',nodes[name].y);line.setAttribute('class','edge');svg.appendChild(line);
    });

    Object.values(nodes).forEach(node=>{
      const g=document.createElementNS(svg.namespaceURI,'g');
      g.setAttribute('class','node'+(node.name===rootName?' root':''));
      g.setAttribute('transform',`translate(${node.x},${node.y})`);
      const circle=document.createElementNS(svg.namespaceURI,'circle');circle.setAttribute('r',node.name===rootName?43:29);g.appendChild(circle);
      const title=document.createElementNS(svg.namespaceURI,'text');title.setAttribute('text-anchor','middle');title.setAttribute('y',node.name===rootName?4:47);title.textContent=node.name===rootName?'PLAYER BRAIN':shortLabel(DATA[node.name]?.title||node.name,24);g.appendChild(title);
      if(node.name!==rootName){const sub=document.createElementNS(svg.namespaceURI,'text');sub.setAttribute('class','node-sub');sub.setAttribute('text-anchor','middle');sub.setAttribute('y',62);sub.textContent=node.category;g.appendChild(sub);}
      g.addEventListener('click',()=>node.name===rootName?null:go(routeFor(node.name)));
      svg.appendChild(g);
    });
    graphHost.replaceChildren(svg);
    document.getElementById('nodeCount').textContent=names.length;
    document.getElementById('edgeCount').textContent=EDGES.filter(([a,b])=>visible.has(a)&&visible.has(b)).length;
  }

  function shortLabel(text,max){ return text.length<=max?text:text.slice(0,max-1)+'…'; }

  function renderBrain(){
    showOnly(brainView);
    crumb.textContent='Greywake / Player Brain';
    document.querySelectorAll('.nav-link').forEach(btn=>btn.classList.remove('active'));
    buildBrainFilters();
    drawGraph();
  }

  function renderRoute(){
    const route=parseRoute();
    if(route.type==='record') renderRecord(route.name);
    else if(route.type==='brain') renderBrain();
    else renderHome();
  }

  function openCategory(cat){
    const names=recordsInCategory(cat);
    const directoryName={'Locations':'Known Locations','People':'Known People','Flora & Fauna':'Known Flora and Fauna'}[cat];
    if(directoryName && DATA[directoryName]) go(routeFor(directoryName));
    else if(names.length) go(routeFor(names[0]));
  }

  document.addEventListener('click',event=>{
    const recordTarget=event.target.closest('[data-record]');
    if(recordTarget){ event.preventDefault(); go(routeFor(recordTarget.dataset.record)); return; }
    const routeTarget=event.target.closest('[data-route]');
    if(routeTarget){ event.preventDefault(); go(routeTarget.dataset.route==='brain'?'#/brain':'#/'); return; }
    const categoryTarget=event.target.closest('[data-category]');
    if(categoryTarget){ openCategory(categoryTarget.dataset.category); return; }
    const action=event.target.closest('[data-action]');
    if(action?.dataset.action==='back'){ history.length>1?history.back():go('#/'); return; }
    const chip=event.target.closest('[data-brain-category]');
    if(chip){ activeBrainCategory=chip.dataset.brainCategory;buildBrainFilters();drawGraph();return; }
    const image=event.target.closest('.record-media img');
    if(image){
      lightboxImage.src=image.src;lightboxImage.alt=image.alt;
      lightboxCaption.textContent=image.closest('figure')?.querySelector('figcaption')?.textContent||image.alt;
      lightbox.classList.remove('hidden');
    }
  });

  document.getElementById('searchInput').addEventListener('input',e=>buildNav(e.target.value));
  document.getElementById('menuBtn').addEventListener('click',()=>sidebar.classList.toggle('open'));
  document.getElementById('homeBtn').addEventListener('click',()=>go('#/'));
  document.getElementById('brainBtn').addEventListener('click',()=>go('#/brain'));
  document.getElementById('zoomIn').addEventListener('click',()=>{zoom=Math.min(1.8,zoom+.2);drawGraph();});
  document.getElementById('zoomOut').addEventListener('click',()=>{zoom=Math.max(.65,zoom-.2);drawGraph();});
  document.getElementById('zoomReset').addEventListener('click',()=>{zoom=1;drawGraph();});
  document.getElementById('lightboxClose').addEventListener('click',()=>lightbox.classList.add('hidden'));
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.classList.add('hidden');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){lightbox.classList.add('hidden');sidebar.classList.remove('open');}});
  window.addEventListener('hashchange',renderRoute);

  buildNav();
  buildCategoryGrid();
  buildDiscoveries();
  renderRoute();
})();

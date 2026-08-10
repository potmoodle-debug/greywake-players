(() => {
  'use strict';

  const DATA=window.GREYWAKE_DATA||{};
  const EDGES=window.GREYWAKE_EDGES||[];
  const CATS=window.GREYWAKE_CATEGORIES||{};
  const DISC=window.GREYWAKE_DISCOVERIES||[];
  const MEDIA=window.GREYWAKE_MEDIA||{};

  const DIRECT_MEDIA={
    'Greywake':[{src:'assets/tower-close.jpg',caption:'The White Tower from within Greywake.'},{src:'assets/tower-distant.jpg',caption:'Greywake across the wastes.'}],
    'Great-Shell':[{src:'assets/great-shell.jpg',caption:'Great-Shell — canon visual reference.'}],
    'Cacklemaw Pack':[{src:'assets/cacklemaw.jpg',caption:'Cacklemaw pack — canon visual reference.'}],
    'Stone-Lip Hollow':[{src:'assets/stone-lip.jpg',caption:'Approach to Stone-Lip Hollow through the Broken Runnels.'}],
    'Latchfan':[{src:'assets/flora/latchfan.jpg',caption:'Latchfan — mature specimen, canon visual reference.'}],
    'Brannic Hale':[{b64:'assets/npcs/portraits/brannic-hale.b64',mime:'image/jpeg',caption:'Brannic Hale — commander of the Tower Watch.'}],
    'Sister Elowen':[{b64:'assets/portraits/sister-elowen.b64',mime:'image/jpeg',caption:'Sister Elowen — public voice among the Faithful.'}],
    'Joric Noll':[{src:'assets/npcs/v2/joric-noll.jpg',caption:'Joric Noll — survivor of Kestrel Return.'}],
    'Talla Reed':[{src:'assets/npcs/v2/talla-reed.jpg',caption:'Talla Reed — Greywake runner and messenger.'}],
    'Maela Rusk':[{src:'assets/npcs/v2/maela-rusk.avif',caption:'Maela Rusk — caravan leader at Stone-Lip Hollow.'}],
    'Rennic Vale':[{src:'assets/npcs/v2/rennic-vale.avif',caption:'Rennic Vale — guardian of the sealed case.'}],
    'Sarn Pell':[{src:'assets/npcs/v2/sarn-pell.avif',caption:'Sarn Pell — Great-Shell handler.'}],
    'Mara Vell':[{src:'assets/npcs/v2/mara-vell.avif',caption:'Mara Vell — Dust Broker at Valve Court.'}]
  };

  const sidebar=document.getElementById('sidebar');
  const nav=document.getElementById('nav');
  const homeView=document.getElementById('homeView');
  const brainView=document.getElementById('brainView');
  const recordView=document.getElementById('recordView');
  const crumb=document.getElementById('crumb');
  const lightbox=document.getElementById('lightbox');
  const lightboxImage=document.getElementById('lightboxImage');
  const lightboxCaption=document.getElementById('lightboxCaption');

  const routeFor=name=>'#/record/'+encodeURIComponent(name);
  const escapeHTML=value=>String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

  function go(hash){if(location.hash===hash)renderRoute();else location.hash=hash;}
  function parseRoute(){const h=location.hash||'';if(h==='#/brain')return{type:'brain'};if(h.startsWith('#/record/'))return{type:'record',name:decodeURIComponent(h.slice(9))};return{type:'home'};}
  function showOnly(view){[homeView,brainView,recordView].forEach(v=>v.classList.toggle('hidden',v!==view));sidebar.classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});}
  function stripHTML(html){const d=document.createElement('div');d.innerHTML=html;return d.textContent||'';}
  function allCategoryNames(){return[...new Set([...Object.keys(CATS),...Object.values(DATA).map(x=>x.category).filter(Boolean)])];}
  function recordsInCategory(cat){const ordered=(CATS[cat]||[]).filter(n=>DATA[n]);const extras=Object.keys(DATA).filter(n=>DATA[n].category===cat&&!ordered.includes(n));return[...ordered,...extras];}

  function buildNav(filter=''){
    const q=filter.trim().toLowerCase();nav.innerHTML='';
    allCategoryNames().forEach(cat=>{
      const names=recordsInCategory(cat).filter(name=>{if(!q)return true;const e=DATA[name];return`${e.title||name} ${name} ${e.category||''} ${stripHTML(e.html||'')}`.toLowerCase().includes(q);});
      if(!names.length)return;
      const group=document.createElement('section');group.className='nav-group';group.innerHTML=`<h3>${escapeHTML(cat)}</h3>`;
      names.forEach(name=>{const b=document.createElement('button');b.className='nav-link';b.dataset.record=name;b.textContent=DATA[name].title||name;group.appendChild(b);});nav.appendChild(group);
    });
    if(!nav.children.length)nav.innerHTML='<div class="sidebar-note">No player-safe records match that search.</div>';
  }

  function buildCategoryGrid(){
    const host=document.getElementById('categoryGrid');host.innerHTML='';
    const preferred=['World','Locations','People','Flora & Fauna','Sessions','Player Characters','Handouts','Factions','Caravans','Player Reference','Objects','Start'];
    const categories=allCategoryNames().sort((a,b)=>{const ai=preferred.indexOf(a),bi=preferred.indexOf(b);return(ai<0?99:ai)-(bi<0?99:bi)||a.localeCompare(b);});
    categories.forEach(cat=>{const names=recordsInCategory(cat);if(!names.length||cat==='Start')return;const b=document.createElement('button');b.className='category-card';b.dataset.category=cat;b.innerHTML=`<small>Archive section</small><strong>${escapeHTML(cat)}</strong><span>${names.length} known ${names.length===1?'record':'records'} →</span>`;host.appendChild(b);});
  }

  function buildDiscoveries(){
    const host=document.getElementById('discoveryGrid');host.innerHTML='';
    DISC.forEach(item=>{if(!DATA[item.note])return;const b=document.createElement('button');b.className='discovery-card';b.dataset.record=item.note;b.innerHTML=`<img src="${escapeHTML(item.image||'')}" alt=""><div class="discovery-copy"><small>${escapeHTML(item.kind||'Discovery')}</small><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.text||'')}</p><em>${escapeHTML(item.when||'')}</em></div>`;b.querySelector('img')?.addEventListener('error',e=>e.currentTarget.remove());host.appendChild(b);});
  }

  function mediaItems(name){if(DIRECT_MEDIA[name])return DIRECT_MEDIA[name];return(MEDIA[name]||[]).filter(item=>item&&(item.src||item.b64)).map(item=>({src:item.src,b64:item.b64,mime:item.mime,caption:item.caption||''}));}
  function mediaHTML(name){
    const items=mediaItems(name);if(!items.length)return'';
    return`<section class="record-media">${items.map(item=>{const image=item.b64?`<img data-b64-src="${escapeHTML(item.b64)}" data-mime="${escapeHTML(item.mime||'image/jpeg')}" alt="${escapeHTML(DATA[name]?.title||name)}">`:`<img src="${escapeHTML(item.src)}" alt="${escapeHTML(DATA[name]?.title||name)}">`;return`<figure>${image}<figcaption>${escapeHTML(item.caption||DATA[name]?.title||name)}</figcaption></figure>`;}).join('')}</section>`;
  }

  async function hydrateMedia(scope){
    const pending=[...scope.querySelectorAll('img[data-b64-src]')];
    await Promise.all(pending.map(async img=>{
      try{
        const response=await fetch(img.dataset.b64Src+'?v=portrait-source-2',{cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);
        const encoded=(await response.text()).replace(/\s+/g,'');if(!encoded)throw new Error('Empty portrait source');
        img.src=`data:${img.dataset.mime||'image/jpeg'};base64,${encoded}`;img.removeAttribute('data-b64-src');
      }catch(err){console.error('Portrait source failed',err);replaceImageWithFallback(img);}
    }));
  }
  function replaceImageWithFallback(img){const figure=img.closest('figure');if(!figure){img.remove();return;}const fallback=document.createElement('div');fallback.className='image-fallback';fallback.textContent='Image file unavailable in the archive.';img.replaceWith(fallback);}
  function wireImageFallbacks(scope){scope.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>replaceImageWithFallback(img),{once:true}));}

  function relatedFor(name){const found=[];EDGES.forEach(([a,b])=>{if(a===name&&DATA[b])found.push(b);else if(b===name&&DATA[a])found.push(a);});return[...new Set(found)].filter(n=>n!==name).sort((a,b)=>(DATA[a].category||'').localeCompare(DATA[b].category||'')||(DATA[a].title||a).localeCompare(DATA[b].title||b));}
  function cardsHTML(names){return`<div class="record-cards">${names.map(n=>`<a class="record-card" href="${routeFor(n)}" data-record="${escapeHTML(n)}"><small>${escapeHTML(DATA[n].category||'Record')}</small><strong>${escapeHTML(DATA[n].title||n)}</strong><span>Open record →</span></a>`).join('')}</div>`;}
  function directoryHTML(name){const map={'Known Flora and Fauna':'Flora & Fauna','Known Locations':'Locations','Known People':'People'};const cat=map[name];if(!cat)return'';const names=recordsInCategory(cat).filter(n=>n!==name).sort((a,b)=>(DATA[a].title||a).localeCompare(DATA[b].title||b));return names.length?`<section class="directory"><div class="eyebrow">PARTY-KNOWN ${escapeHTML(cat.toUpperCase())}</div><h2>${escapeHTML(cat)}</h2>${cardsHTML(names)}</section>`:'';}
  function relatedHTML(name){const related=relatedFor(name);return related.length?`<section class="related"><div class="eyebrow">CONNECTED RECORDS</div><h2>Related records</h2>${cardsHTML(related)}</section>`:'';}

  function autolink(container,current){
    const names=Object.keys(DATA).filter(n=>n!==current&&n!=='Player Brain').sort((a,b)=>(DATA[b].title||b).length-(DATA[a].title||a).length);
    const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{if(node.parentElement?.closest('a,button,script,style,h1'))return;let parts=[{text:node.nodeValue,linked:false}];
      for(const name of names){const title=DATA[name].title||name;if(title.length<4)continue;const re=new RegExp(`\\b(${escapeRegExp(title)})\\b`,'gi');parts=parts.flatMap(part=>{if(part.linked)return[part];const out=[];let last=0,m;while((m=re.exec(part.text))){if(m.index>last)out.push({text:part.text.slice(last,m.index),linked:false});out.push({text:m[0],linked:true,name});last=m.index+m[0].length;}if(last<part.text.length)out.push({text:part.text.slice(last),linked:false});return out.length?out:[part];});}
      if(!parts.some(p=>p.linked))return;const frag=document.createDocumentFragment();parts.forEach(p=>{if(!p.linked)frag.appendChild(document.createTextNode(p.text));else{const a=document.createElement('a');a.href=routeFor(p.name);a.dataset.record=p.name;a.textContent=p.text;frag.appendChild(a);}});node.replaceWith(frag);
    });
  }

  async function renderRecord(name){
    const entry=DATA[name];if(!entry){go('#/');return;}showOnly(recordView);crumb.textContent=`Greywake / ${entry.title||name}`;
    recordView.innerHTML=`<div class="record-topnav"><button data-action="back">← Back</button><button data-route="home">Archive home</button><button class="primary" data-route="brain">Player Brain</button></div><div class="record-meta">${escapeHTML(entry.category||'Record')} / Party-known record</div><h1>${escapeHTML(entry.title||name)}</h1>${mediaHTML(name)}<div class="record-body">${entry.html||''}</div>${directoryHTML(name)}${relatedHTML(name)}`;
    recordView.querySelectorAll('h2').forEach(h=>h.textContent=h.textContent.replace(/^##\s*/,''));autolink(recordView.querySelector('.record-body'),name);wireImageFallbacks(recordView);await hydrateMedia(recordView);document.querySelectorAll('.nav-link').forEach(btn=>btn.classList.toggle('active',btn.dataset.record===name));
  }

  function renderHome(){showOnly(homeView);crumb.textContent='Greywake / Archive';document.querySelectorAll('.nav-link').forEach(btn=>btn.classList.remove('active'));}
  function renderBrain(){showOnly(brainView);crumb.textContent='Greywake / Player Brain';document.querySelectorAll('.nav-link').forEach(btn=>btn.classList.remove('active'));if(typeof window.GREYWAKE_DRAW_BRAIN==='function')window.GREYWAKE_DRAW_BRAIN();}
  function renderRoute(){const route=parseRoute();if(route.type==='record')renderRecord(route.name);else if(route.type==='brain')renderBrain();else renderHome();}
  function openCategory(cat){const names=recordsInCategory(cat);const directoryName={'Locations':'Known Locations','People':'Known People','Flora & Fauna':'Known Flora and Fauna'}[cat];if(directoryName&&DATA[directoryName])go(routeFor(directoryName));else if(names.length)go(routeFor(names[0]));}

  document.addEventListener('click',event=>{
    const recordTarget=event.target.closest('[data-record]');if(recordTarget){event.preventDefault();go(routeFor(recordTarget.dataset.record));return;}
    const routeTarget=event.target.closest('[data-route]');if(routeTarget){event.preventDefault();go(routeTarget.dataset.route==='brain'?'#/brain':'#/');return;}
    const categoryTarget=event.target.closest('[data-category]');if(categoryTarget){openCategory(categoryTarget.dataset.category);return;}
    const action=event.target.closest('[data-action]');if(action?.dataset.action==='back'){history.length>1?history.back():go('#/');return;}
    const image=event.target.closest('.record-media img');if(image&&image.src){lightboxImage.src=image.src;lightboxImage.alt=image.alt;lightboxCaption.textContent=image.closest('figure')?.querySelector('figcaption')?.textContent||image.alt;lightbox.classList.remove('hidden');}
  });

  document.getElementById('searchInput').addEventListener('input',e=>buildNav(e.target.value));
  document.getElementById('menuBtn').addEventListener('click',()=>sidebar.classList.toggle('open'));
  document.getElementById('homeBtn').addEventListener('click',()=>go('#/'));
  document.getElementById('brainBtn').addEventListener('click',()=>go('#/brain'));
  document.getElementById('lightboxClose').addEventListener('click',()=>lightbox.classList.add('hidden'));
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.classList.add('hidden');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){lightbox.classList.add('hidden');sidebar.classList.remove('open');}});
  window.addEventListener('hashchange',renderRoute);

  buildNav();buildCategoryGrid();buildDiscoveries();renderRoute();
})();
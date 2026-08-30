const DATA=window.GREYWAKE_DATA,EDGES=window.GREYWAKE_EDGES,CATS=window.GREYWAKE_CATEGORIES;
const DISC=window.GREYWAKE_DISCOVERIES||[];
const nav=document.getElementById('nav'),article=document.getElementById('article'),brain=document.getElementById('brainView'),home=document.getElementById('home');
const searchInput=document.getElementById('searchInput'),searchStatus=document.getElementById('searchStatus');
const SEARCH_INDEX=new Map();
const LOCATION_GROUPS=[
 {label:'Greywake',names:['Inner Greywake','Caravan Gate','White Tower','Valve Court','Tangle Lanes']},
 {label:'Greater Greywake',names:['Greater Greywake','Great-Shell Pens','Digger Yards']},
 {label:'Kestrel Return route',names:['High Shelf','Old Marker Wash','Old Marker Line','Failed Marker','Wrong Lower Line','Ash-Plate Groundfall','Broken Runnels',"Joric's Runnel",'Stone-Lip Hollow']},
 {label:'Other known places',names:['Split Rock Shade']}
];

function escapeRegExp(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function routeFor(name){return '#/record/'+encodeURIComponent(name)}
function currentRoute(){
 const h=location.hash||'';
 if(h==='#/brain')return{type:'brain'};
 if(h.startsWith('#/record/'))return{type:'record',name:decodeURIComponent(h.slice(9))};
 return{type:'home'};
}
function go(route){if(location.hash===route){renderRoute();return}location.hash=route}

function searchableText(name){
 if(SEARCH_INDEX.has(name))return SEARCH_INDEX.get(name);
 const entry=DATA[name]||{};
 const text=document.createElement('div');text.innerHTML=entry.html||'';
 const value=`${entry.title||name} ${name} ${entry.category||''} ${text.textContent||''}`.toLowerCase();SEARCH_INDEX.set(name,value);return value;
}
function groupedLocations(names){
 const remaining=new Set(names),groups=[];
 LOCATION_GROUPS.forEach(group=>{
   const matches=group.names.filter(name=>remaining.has(name));
   matches.forEach(name=>remaining.delete(name));
   if(matches.length)groups.push({label:group.label,names:matches});
 });
 if(remaining.size)groups.push({label:'Other known places',names:[...remaining].sort((a,b)=>(DATA[a].title||a).localeCompare(DATA[b].title||b))});
 return groups;
}
function navLink(name){
 const button=document.createElement('button');button.className='nav-link';button.textContent=DATA[name].title;button.dataset.note=name;button.onclick=()=>go(routeFor(name));return button;
}
function appendLocationNav(group,names,searching){
 const directory='Known Locations';
 if(names.includes(directory))group.appendChild(navLink(directory));
 const active=currentRoute().type==='record'?currentRoute().name:'';
 groupedLocations(names.filter(name=>name!==directory)).forEach(area=>{
   const subgroup=document.createElement('div');subgroup.className='nav-subgroup';
   const expanded=searching||area.names.includes(active);subgroup.classList.toggle('is-collapsed',!expanded);
   const toggle=document.createElement('button');toggle.type='button';toggle.className='nav-subtoggle';toggle.setAttribute('aria-expanded',String(expanded));
   toggle.innerHTML=`<span>${area.label}</span><small>${area.names.length}</small>`;
   toggle.onclick=()=>{const collapsed=subgroup.classList.toggle('is-collapsed');toggle.setAttribute('aria-expanded',String(!collapsed))};
   const items=document.createElement('div');items.className='nav-subitems';area.names.forEach(name=>items.appendChild(navLink(name)));
   subgroup.append(toggle,items);group.appendChild(subgroup);
 });
}
function buildNav(filter=''){
 nav.innerHTML='';
 const terms=filter.trim().toLowerCase().split(/\s+/).filter(Boolean);let resultCount=0;
 for(const [cat,names] of Object.entries(CATS)){
   const m=names.filter(n=>DATA[n]&&terms.every(term=>searchableText(n).includes(term)));
   if(!m.length)continue;
   const g=document.createElement('div');g.className='nav-group';g.innerHTML=`<h3>${cat==='Locations'?'Places & Routes':cat}</h3>`;
   if(cat==='Locations')appendLocationNav(g,m,Boolean(terms.length));else m.forEach(name=>g.appendChild(navLink(name)));
   nav.appendChild(g);resultCount+=m.length;
 }
 if(terms.length&&!resultCount){const empty=document.createElement('p');empty.className='nav-empty';empty.textContent='No known records match that search.';nav.appendChild(empty)}
 if(searchStatus)searchStatus.textContent=terms.length?`${resultCount} ${resultCount===1?'record':'records'} found`:'';
}

function renderDiscoveries(){
 const grid=document.getElementById('discoveryGrid');if(!grid)return;grid.innerHTML='';
 DISC.forEach(d=>{
   const b=document.createElement('button');b.className='discovery-card text-only';b.onclick=()=>go(routeFor(d.note));
   b.innerHTML=`<div><small>${d.kind}</small><strong>${d.title}</strong><p>${d.text}</p><em>${d.when}</em></div>`;
   grid.appendChild(b);
 });
}

function autoLinkHTML(html,current){
 const wrap=document.createElement('div');wrap.innerHTML=html;
 const names=Object.keys(DATA).filter(n=>n!==current&&n!=='Player Brain').sort((a,b)=>(DATA[b].title||b).length-(DATA[a].title||a).length);
 const walker=document.createTreeWalker(wrap,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{
   if(node.parentElement?.closest('a,button,script,style'))return;
   let parts=[{text:node.nodeValue,linked:false}];
   for(const name of names){
     const title=DATA[name].title||name;
     const re=new RegExp(`\\b(${escapeRegExp(title)})\\b`,'gi');
     parts=parts.flatMap(p=>{
       if(p.linked)return[p];
       const out=[];let last=0,m;re.lastIndex=0;
       while((m=re.exec(p.text))){
         if(m.index>last)out.push({text:p.text.slice(last,m.index),linked:false});
         out.push({text:m[0],linked:true,name});
         last=m.index+m[0].length;
       }
       if(last<p.text.length)out.push({text:p.text.slice(last),linked:false});
       return out.length?out:[p];
     });
   }
   if(parts.some(p=>p.linked)){
     const frag=document.createDocumentFragment();
     parts.forEach(p=>{
       if(!p.linked)frag.appendChild(document.createTextNode(p.text));
       else{const a=document.createElement('a');a.href=routeFor(p.name);a.dataset.note=p.name;a.textContent=p.text;frag.appendChild(a)}
     });
     node.replaceWith(frag);
   }
 });
 return wrap.innerHTML;
}

function categoryDirectoryHTML(name){
 const directories={'Known Flora and Fauna':'Flora & Fauna','Known Locations':'Locations','Known People':'People'};
 const category=directories[name];if(!category)return'';
 const names=(CATS[category]||[]).filter(n=>n!==name&&DATA[n]);
 if(!names.length)return'';
 if(category==='Locations'){
   const groups=groupedLocations(names);
   return `<section class="record-directory location-directory"><div class="related-kicker">PARTY-KNOWN REGIONS & ROUTES</div><h2>Explore known places</h2><p class="location-directory-intro">Places are grouped by the settlement, wider region or journey through which the party knows them. These groups describe the world naturally and do not imply a separate journey between every named landmark.</p>${groups.map(group=>`<details class="location-directory-group"><summary><strong>${group.label}</strong><span>${group.names.length} ${group.names.length===1?'place':'places'}</span></summary><div class="related-grid">${group.names.map(n=>`<a class="related-card" href="${routeFor(n)}" data-note="${n.replace(/"/g,'&quot;')}"><small>${group.label}</small><strong>${DATA[n].title}</strong><span>Open record →</span></a>`).join('')}</div></details>`).join('')}</section>`;
 }
 names.sort((a,b)=>(DATA[a].title||a).localeCompare(DATA[b].title||b));
 return `<section class="record-directory"><div class="related-kicker">PARTY-KNOWN ${category.toUpperCase()}</div><h2>${category}</h2><div class="related-grid">${names.map(n=>`<a class="related-card" href="${routeFor(n)}" data-note="${n.replace(/"/g,'&quot;')}"><small>${DATA[n].category}</small><strong>${DATA[n].title}</strong><span>Open record →</span></a>`).join('')}</div></section>`;
}

function relatedFor(name){
 const found=[];
 EDGES.forEach(([a,b])=>{if(a===name&&DATA[b])found.push(b);else if(b===name&&DATA[a])found.push(a)});
 return [...new Set(found)].filter(n=>n!==name).sort((a,b)=>(DATA[a].category||'').localeCompare(DATA[b].category||'')||(DATA[a].title||a).localeCompare(DATA[b].title||b));
}
function relatedHTML(name){
 const related=relatedFor(name);if(!related.length)return'';
 return `<section class="related-records"><div class="related-kicker">CONNECTED RECORDS</div><h2>Related records</h2><div class="related-grid">${related.map(n=>`<a class="related-card" href="${routeFor(n)}" data-note="${n.replace(/"/g,'&quot;')}"><small>${DATA[n].category}</small><strong>${DATA[n].title}</strong><span>Open record →</span></a>`).join('')}</div></section>`;
}
function articleNav(){return `<div class="article-nav"><button id="articleBack">← Back</button><button id="articleHome">Greywake home</button><button id="articleBrain">Player Brain</button></div>`}
function wireArticleLinks(){
 article.querySelectorAll('a[data-note]').forEach(a=>a.onclick=e=>{e.preventDefault();go(routeFor(a.dataset.note))});
 document.getElementById('articleBack')?.addEventListener('click',()=>history.length>1?history.back():go('#/'));
 document.getElementById('articleHome')?.addEventListener('click',()=>go('#/'));
 document.getElementById('articleBrain')?.addEventListener('click',()=>go('#/brain'));
}
function scrollToTop(){window.scrollTo({top:0,behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function focusRouteHeading(target){
 requestAnimationFrame(()=>{if(document.querySelector('.player-gate'))return;const heading=target?.querySelector('h1,h2');if(!heading)return;heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true})});
}
function expandActiveNav(name){
 const active=[...document.querySelectorAll('.nav-link')].find(item=>item.dataset.note===name);if(!active)return;
 document.querySelectorAll('.nav-link').forEach(item=>item.classList.toggle('active',item===active));
 const group=active.closest('.nav-group');group?.classList.remove('is-collapsed');group?.querySelector('.nav-toggle')?.setAttribute('aria-expanded','true');
 const subgroup=active.closest('.nav-subgroup');subgroup?.classList.remove('is-collapsed');subgroup?.querySelector('.nav-subtoggle')?.setAttribute('aria-expanded','true');
}
function showNote(name){
 if(!DATA[name]){go('#/');return}
 home.classList.add('hidden');brain.classList.add('hidden');article.classList.remove('hidden');
 const body=autoLinkHTML(DATA[name].html,name);
 article.innerHTML=`${articleNav()}<div class="article-meta">${DATA[name].category} / Party-known record</div><h1>${DATA[name].title}</h1>${body}${categoryDirectoryHTML(name)}${relatedHTML(name)}`;
 wireArticleLinks();
 document.getElementById('crumb').textContent=`Greywake / ${DATA[name].title}`;
 document.title=DATA[name].title==='Greywake'?'Greywake — Campaign Record':`${DATA[name].title} — Greywake`;expandActiveNav(name);
 scrollToTop();document.querySelector('.sidebar').classList.remove('open');focusRouteHeading(article);
}
function showBrain(){
 home.classList.add('hidden');article.classList.add('hidden');brain.classList.remove('hidden');
 document.getElementById('crumb').textContent='Greywake / Player Brain';document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active'));document.title='Player Brain — Greywake';scrollToTop();focusRouteHeading(brain);
 if(!window.GREYWAKE_DRAW_BRAIN&&!document.querySelector('#graph svg'))drawGraph();
}
function showHome(){
 article.classList.add('hidden');brain.classList.add('hidden');home.classList.remove('hidden');
 document.getElementById('crumb').textContent='Greywake / Home';document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active'));document.title='Greywake — Player Guide';scrollToTop();focusRouteHeading(home);
}
function renderRoute(){const r=currentRoute();if(r.type==='record')showNote(r.name);else if(r.type==='brain')showBrain();else showHome()}

document.getElementById('brainBtn').onclick=()=>go('#/brain');
document.getElementById('heroBrain').onclick=()=>go('#/brain');
document.getElementById('fieldBrain').onclick=()=>go('#/brain');
document.getElementById('menuBtn').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
searchInput.addEventListener('input',e=>buildNav(e.target.value));
document.addEventListener('keydown',event=>{
 if(event.key!=='/'||event.ctrlKey||event.metaKey||event.altKey||/input|textarea|select/i.test(event.target.tagName))return;
 event.preventDefault();searchInput.focus();searchInput.select();
});
document.querySelectorAll('[data-note]').forEach(x=>x.onclick=()=>go(routeFor(x.dataset.note)));
window.addEventListener('hashchange',renderRoute);

function drawGraph(){
 const host=document.getElementById('graph'),W=1200,H=650,svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);host.innerHTML='';host.appendChild(svg);
 const names=Object.keys(DATA).filter(n=>n!=='Player Brain'),center={x:W/2,y:H/2,name:'Player Brain'},nodes={'Player Brain':center},rings={'Start':220,'World':220,'Locations':350,'People':350,'Flora & Fauna':350,'Sessions':275,'Player Characters':275,'Handouts':350,'Factions':420,'Caravans':310},slots={};
 names.forEach(n=>(slots[DATA[n].category]??=[]).push(n));
 Object.keys(slots).forEach((cat,ci,all)=>{const arr=slots[cat],base=(ci/all.length)*Math.PI*2;arr.forEach((n,i)=>{const a=base+(i-(arr.length-1)/2)*.20,r=rings[cat]||320;nodes[n]={x:center.x+Math.cos(a)*r,y:center.y+Math.sin(a)*r,name:n}})});
 function line(a,b){const l=document.createElementNS(svg.namespaceURI,'line');l.setAttribute('x1',a.x);l.setAttribute('y1',a.y);l.setAttribute('x2',b.x);l.setAttribute('y2',b.y);l.setAttribute('class','edge');svg.appendChild(l)}
 EDGES.forEach(([a,b])=>{if(nodes[a]&&nodes[b])line(nodes[a],nodes[b])});names.forEach(n=>{if(nodes[n]&&!EDGES.some(e=>e.includes('Player Brain')&&e.includes(n)))line(center,nodes[n])});
 Object.values(nodes).forEach(nd=>{const g=document.createElementNS(svg.namespaceURI,'g');g.setAttribute('class','node'+(nd.name==='Player Brain'?' root':''));g.setAttribute('transform',`translate(${nd.x},${nd.y})`);const c=document.createElementNS(svg.namespaceURI,'circle');c.setAttribute('r',nd.name==='Player Brain'?38:25);g.appendChild(c);const t=document.createElementNS(svg.namespaceURI,'text');t.setAttribute('text-anchor','middle');t.setAttribute('y',nd.name==='Player Brain'?55:42);t.textContent=DATA[nd.name]?.title||nd.name;g.appendChild(t);g.onclick=()=>nd.name==='Player Brain'?go('#/brain'):go(routeFor(nd.name));svg.appendChild(g)});
 const nodeCount=document.getElementById('nodeCount'),edgeCount=document.getElementById('edgeCount');if(nodeCount)nodeCount.textContent=Object.keys(nodes).length;if(edgeCount)edgeCount.textContent=EDGES.length;
}

function updateSummary(){
 const records=document.getElementById('recordSummaryCount'),links=document.getElementById('linkSummaryCount'),sessions=document.getElementById('sessionSummaryCount');
 if(records)records.textContent=Object.keys(DATA).length;if(links)links.textContent=EDGES.length;if(sessions)sessions.textContent=String((CATS.Sessions||[]).length).padStart(2,'0');
}

buildNav();renderDiscoveries();updateSummary();renderRoute();

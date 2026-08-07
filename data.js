const DATA=window.GREYWAKE_DATA,EDGES=window.GREYWAKE_EDGES,CATS=window.GREYWAKE_CATEGORIES;
const DISC=(window.GREYWAKE_DISCOVERIES||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
const MEDIA=window.GREYWAKE_MEDIA||{};
const nav=document.getElementById('nav'),article=document.getElementById('article'),brain=document.getElementById('brainView'),drawer=document.getElementById('drawer'),scrim=document.getElementById('scrim');
const homeEls=[document.getElementById('homeView'),document.getElementById('latestView'),document.querySelector('.archive-strip'),document.querySelector('.field-plates'),document.querySelector('.party-section')];

function setHome(show){homeEls.forEach(el=>el.classList.toggle('hidden',!show))}
function openDrawer(){drawer.classList.add('open');scrim.classList.add('open')}
function closeDrawer(){drawer.classList.remove('open');scrim.classList.remove('open')}
menuBtn.onclick=openDrawer;closeDrawer.onclick=closeDrawer;scrim.onclick=closeDrawer;

function buildNav(filter=''){
 nav.innerHTML='';
 for(const [cat,names] of Object.entries(CATS)){
  const hits=names.filter(n=>DATA[n]&&(DATA[n].title+' '+n).toLowerCase().includes(filter.toLowerCase()));
  if(!hits.length)continue;
  const g=document.createElement('div');g.className='nav-group';g.innerHTML=`<h3>${cat}</h3>`;
  hits.forEach(name=>{const b=document.createElement('button');b.className='nav-link';b.textContent=DATA[name].title;b.dataset.note=name;b.onclick=()=>openNote(name);g.appendChild(b)});
  nav.appendChild(g);
 }
}
function renderDiscoveries(){
 const grid=document.getElementById('discoveryGrid');grid.innerHTML='';
 DISC.slice(0,4).forEach(d=>{
  const b=document.createElement('button');b.className='discovery-card';b.onclick=()=>openNote(d.note);
  b.innerHTML=`<img src="${d.image}" alt=""><div class="discovery-body"><span class="stamp">${d.label}</span><strong>${d.title}</strong><p>${d.summary}</p><em>${d.when}</em></div>`;
  grid.appendChild(b);
 })
}
function openHome(){article.classList.add('hidden');brain.classList.add('hidden');setHome(true);closeDrawer();window.scrollTo({top:0,behavior:'smooth'})}
function mediaHTML(name){
 const items=MEDIA[name]||[]; if(!items.length)return '';
 return `<div class="article-media">${items.map(m=>`<figure><img src="${m.src}" alt=""><figcaption>${m.caption}</figcaption></figure>`).join('')}</div>`;
}
function openNote(name){
 if(!DATA[name])return;
 setHome(false);brain.classList.add('hidden');article.classList.remove('hidden');
 article.innerHTML=`<div class="article-meta">${DATA[name].category} / Party-known field record</div><h1>${DATA[name].title}</h1>${mediaHTML(name)}${DATA[name].html}`;
 article.querySelectorAll('a[data-note]').forEach(a=>a.onclick=e=>{e.preventDefault();openNote(a.dataset.note)});
 document.querySelectorAll('.nav-link').forEach(x=>x.classList.toggle('active',x.dataset.note===name));
 closeDrawer();window.scrollTo({top:0,behavior:'smooth'})
}
function openBrain(){article.classList.add('hidden');setHome(false);brain.classList.remove('hidden');closeDrawer();window.scrollTo({top:0,behavior:'smooth'})}
function openCategory(cat){openDrawer();requestAnimationFrame(()=>{const g=[...document.querySelectorAll('.nav-group')].find(x=>x.querySelector('h3')?.textContent===cat);if(g)g.scrollIntoView({block:'start'})})}
brainBtn.onclick=openBrain;openBrainHero.onclick=openBrain;categoryBrain.onclick=openBrain;brainHome.onclick=openHome;brainReset.onclick=()=>document.getElementById('graph').scrollIntoView({block:'center',behavior:'smooth'});homeBtn.onclick=openHome;
document.querySelectorAll('[data-home]').forEach(x=>x.onclick=openHome);
document.querySelectorAll('[data-note]').forEach(x=>x.onclick=()=>openNote(x.dataset.note));
document.querySelectorAll('[data-cat]').forEach(x=>x.onclick=()=>openCategory(x.dataset.cat));
searchInput.addEventListener('input',e=>buildNav(e.target.value));

function drawGraph(){
 const host=document.getElementById('graph');host.innerHTML='';const W=1200,H=680;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);host.appendChild(svg);
 const names=Object.keys(DATA).filter(n=>n!=='Player Brain'),center={x:W/2,y:H/2,name:'Player Brain'},nodes={'Player Brain':center};
 const rings={'Start':210,'World':210,'Locations':370,'People':370,'Flora & Fauna':370,'Sessions':285,'Player Characters':285,'Handouts':370},slots={};
 names.forEach(n=>(slots[DATA[n].category]??=[]).push(n));
 Object.keys(slots).forEach((cat,ci,all)=>{const arr=slots[cat],base=(ci/all.length)*Math.PI*2;arr.forEach((n,i)=>{const a=base+(i-(arr.length-1)/2)*.19,r=rings[cat]||330;nodes[n]={x:center.x+Math.cos(a)*r,y:center.y+Math.sin(a)*r,name:n}})});
 function line(a,b){const l=document.createElementNS(svg.namespaceURI,'line');l.setAttribute('x1',a.x);l.setAttribute('y1',a.y);l.setAttribute('x2',b.x);l.setAttribute('y2',b.y);l.setAttribute('class','edge');svg.appendChild(l)}
 EDGES.forEach(([a,b])=>{if(nodes[a]&&nodes[b])line(nodes[a],nodes[b])});
 names.forEach(n=>{if(nodes[n]&&!EDGES.some(e=>e.includes('Player Brain')&&e.includes(n)))line(center,nodes[n])});
 Object.values(nodes).forEach(nd=>{const g=document.createElementNS(svg.namespaceURI,'g');g.setAttribute('class','node'+(nd.name==='Player Brain'?' root':''));g.setAttribute('transform',`translate(${nd.x},${nd.y})`);const c=document.createElementNS(svg.namespaceURI,'circle');c.setAttribute('r',nd.name==='Player Brain'?42:25);g.appendChild(c);const t=document.createElementNS(svg.namespaceURI,'text');t.setAttribute('text-anchor','middle');t.setAttribute('y',nd.name==='Player Brain'?60:43);t.textContent=DATA[nd.name]?.title||nd.name;g.appendChild(t);g.onclick=()=>nd.name==='Player Brain'?openBrain():openNote(nd.name);svg.appendChild(g)});
 nodeCount.textContent=Object.keys(nodes).length;edgeCount.textContent=EDGES.length;
}
buildNav();renderDiscoveries();drawGraph();
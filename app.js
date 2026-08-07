
const DATA=window.GREYWAKE_DATA, EDGES=window.GREYWAKE_EDGES, CATS=window.GREYWAKE_CATEGORIES;
const nav=document.getElementById('nav'), article=document.getElementById('article'), brain=document.getElementById('brainView'), hero=document.getElementById('hero');
const crumb=document.getElementById('crumb');

function buildNav(filter=''){
  nav.innerHTML='';
  for(const [cat, names] of Object.entries(CATS)){
    const matching=names.filter(n=>DATA[n] && (DATA[n].title+' '+n).toLowerCase().includes(filter.toLowerCase()));
    if(!matching.length) continue;
    const g=document.createElement('div'); g.className='nav-group';
    const h=document.createElement('h3'); h.textContent=cat; g.appendChild(h);
    matching.forEach(name=>{
      const b=document.createElement('button'); b.className='nav-link'; b.textContent=DATA[name].title; b.dataset.note=name;
      b.onclick=()=>openNote(name); g.appendChild(b);
    });
    nav.appendChild(g);
  }
}
function openNote(name){
  if(!DATA[name]) return;
  hero.classList.add('hidden'); brain.classList.add('hidden'); article.classList.remove('hidden');
  article.innerHTML=`<div class="article-meta">${DATA[name].category} / Party-known record</div><h1>${DATA[name].title}</h1>${DATA[name].html}`;
  crumb.textContent=`Greywake / ${DATA[name].title}`;
  document.querySelectorAll('.nav-link').forEach(x=>x.classList.toggle('active',x.dataset.note===name));
  article.querySelectorAll('a[data-note]').forEach(a=>a.onclick=e=>{e.preventDefault();openNote(a.dataset.note)});
  window.scrollTo({top:0,behavior:'smooth'});
  document.querySelector('.sidebar').classList.remove('open');
}
function openBrain(){
  article.classList.add('hidden'); brain.classList.remove('hidden'); hero.classList.remove('hidden');
  crumb.textContent='Greywake / Player Brain';
  document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active'));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.getElementById('brainBtn').onclick=openBrain;
document.getElementById('menuBtn').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
document.getElementById('searchInput').addEventListener('input',e=>buildNav(e.target.value));

function drawGraph(){
  const host=document.getElementById('graph'), W=1200,H=600;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`); host.appendChild(svg);
  const names=Object.keys(DATA).filter(n=>n!=='Player Brain');
  const center={x:W/2,y:H/2,name:'Player Brain'};
  const nodes={'Player Brain':center};
  const rings={
    'Start':220,'World':220,'Locations':340,'People':340,'Flora & Fauna':340,'Sessions':260,'Player Characters':260,'Handouts':340
  };
  const angleSlots={};
  names.forEach(n=>{
    const cat=DATA[n].category, arr=(angleSlots[cat]??=[]); arr.push(n);
  });
  let catIndex=0, cats=Object.keys(angleSlots);
  cats.forEach((cat)=>{
    const arr=angleSlots[cat], base=(catIndex/cats.length)*Math.PI*2;
    arr.forEach((n,i)=>{
      const a=base + (i-(arr.length-1)/2)*0.20;
      const r=rings[cat]||300;
      nodes[n]={x:center.x+Math.cos(a)*r,y:center.y+Math.sin(a)*r,name:n};
    });
    catIndex++;
  });
  function line(a,b){
    const l=document.createElementNS(svg.namespaceURI,'line'); l.setAttribute('x1',a.x);l.setAttribute('y1',a.y);l.setAttribute('x2',b.x);l.setAttribute('y2',b.y);l.setAttribute('class','edge');svg.appendChild(l)
  }
  EDGES.forEach(([a,b])=>{if(nodes[a]&&nodes[b])line(nodes[a],nodes[b])});
  names.forEach(n=>{ if(nodes[n] && !EDGES.some(e=>e.includes('Player Brain')&&e.includes(n))) line(center,nodes[n]); });
  Object.values(nodes).forEach(nd=>{
    const g=document.createElementNS(svg.namespaceURI,'g');g.setAttribute('class','node'+(nd.name==='Player Brain'?' root':''));g.setAttribute('transform',`translate(${nd.x},${nd.y})`);
    const c=document.createElementNS(svg.namespaceURI,'circle');c.setAttribute('r',nd.name==='Player Brain'?38:25);g.appendChild(c);
    const t=document.createElementNS(svg.namespaceURI,'text');t.setAttribute('text-anchor','middle');t.setAttribute('y',nd.name==='Player Brain'?55:42);t.textContent=DATA[nd.name]?.title||nd.name;g.appendChild(t);
    g.onclick=()=> nd.name==='Player Brain'?openBrain():openNote(nd.name); svg.appendChild(g);
  });
}
buildNav();drawGraph();

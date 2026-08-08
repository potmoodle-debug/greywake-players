(()=>{
  const DATA=window.GREYWAKE_DATA||{};
  const EDGES=window.GREYWAKE_EDGES||[];
  const host=document.getElementById('graph');
  if(!host)return;
  const NS='http://www.w3.org/2000/svg';
  const priority=['Player Characters','People','Factions','Caravans','Locations','Flora & Fauna','Sessions','Handouts','World','Start'];

  const titleOf=name=>DATA[name]?.title||name;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const routeFor=name=>'#/record/'+encodeURIComponent(name);
  const svgEl=(tag,attrs={})=>{
    const el=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
    return el;
  };
  const wrapTitle=(text,max=24)=>{
    const words=String(text).split(/\s+/),lines=[''];
    for(const word of words){
      const i=lines.length-1,next=(lines[i]+' '+word).trim();
      if(next.length<=max||!lines[i])lines[i]=next;
      else if(lines.length<2)lines.push(word);
      else{lines[1]=(lines[1]+' '+word).trim();}
    }
    if(lines[1]?.length>max+8)lines[1]=lines[1].slice(0,max+5).trimEnd()+'…';
    return lines.slice(0,2);
  };

  function draw(){
    const names=Object.keys(DATA).filter(n=>n!=='Player Brain');
    const byCategory={};
    names.forEach(name=>{const cat=DATA[name]?.category||'Other';(byCategory[cat]??=[]).push(name)});
    const categories=Object.keys(byCategory).sort((a,b)=>{
      const ai=priority.indexOf(a),bi=priority.indexOf(b);
      if(ai!==-1||bi!==-1)return(ai===-1?999:ai)-(bi===-1?999:bi);
      return a.localeCompare(b);
    });
    Object.values(byCategory).forEach(arr=>arr.sort((a,b)=>titleOf(a).localeCompare(titleOf(b))));

    const W=1380,nodeStartX=220,nodeW=190,nodeH=52,colGap=24,rowGap=14,cols=5;
    let y=28;
    const positions={},sections=[];
    categories.forEach(cat=>{
      const arr=byCategory[cat],rows=Math.max(1,Math.ceil(arr.length/cols));
      const sectionY=y,sectionH=58+rows*(nodeH+rowGap)+8;
      arr.forEach((name,i)=>{
        const col=i%cols,row=Math.floor(i/cols),x=nodeStartX+col*(nodeW+colGap),ny=sectionY+48+row*(nodeH+rowGap);
        positions[name]={name,x,y:ny,cx:x+nodeW/2,cy:ny+nodeH/2,category:cat};
      });
      sections.push({cat,y:sectionY,h:sectionH,count:arr.length});
      y+=sectionH+20;
    });
    const H=Math.max(760,y+24);

    host.innerHTML='';
    host.classList.add('brain-graph-enhanced');
    const toolbar=document.createElement('div');
    toolbar.className='brain-graph-toolbar';
    toolbar.innerHTML='<div class="brain-graph-hint"><strong>Trace a connection</strong><span>Hover or focus a record to highlight its known links. Click a record to open it.</span></div><div id="brainLinkSummary" class="brain-link-summary"><strong>Nothing selected</strong><span>Connections will appear here.</span></div>';
    host.appendChild(toolbar);
    const summary=toolbar.querySelector('#brainLinkSummary');

    const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,'aria-label':'Greywake Player Brain relationship map',role:'img',class:'brain-svg'});
    host.appendChild(svg);

    const bgLayer=svgEl('g',{class:'brain-sections'}),edgeLayer=svgEl('g',{class:'brain-edges'}),nodeLayer=svgEl('g',{class:'brain-nodes'});
    svg.append(bgLayer,edgeLayer,nodeLayer);

    sections.forEach(sec=>{
      const rect=svgEl('rect',{x:22,y:sec.y,width:W-44,height:sec.h,rx:14,class:'brain-section-bg'});
      const label=svgEl('text',{x:44,y:sec.y+31,class:'brain-category-label'});label.textContent=sec.cat.toUpperCase();
      const count=svgEl('text',{x:194,y:sec.y+31,class:'brain-category-count'});count.textContent=`${sec.count} ${sec.count===1?'record':'records'}`;
      bgLayer.append(rect,label,count);
    });

    const validEdges=EDGES.filter(([a,b])=>positions[a]&&positions[b]&&a!=='Player Brain'&&b!=='Player Brain');
    const connected={};
    names.forEach(n=>connected[n]=new Set());
    validEdges.forEach(([a,b])=>{connected[a]?.add(b);connected[b]?.add(a)});

    const edgeEls=[];
    validEdges.forEach(([a,b],i)=>{
      const A=positions[a],B=positions[b],dx=B.cx-A.cx,dy=B.cy-A.cy;
      const bend=Math.min(150,Math.max(45,Math.abs(dy)*.18+Math.abs(dx)*.08));
      const dir=dx>=0?1:-1;
      const d=`M ${A.cx} ${A.cy} C ${A.cx+dir*bend} ${A.cy}, ${B.cx-dir*bend} ${B.cy}, ${B.cx} ${B.cy}`;
      const p=svgEl('path',{d,class:'brain-edge','data-a':a,'data-b':b,'data-edge':i});
      edgeLayer.appendChild(p);edgeEls.push(p);
    });

    const nodeEls=[];
    names.forEach(name=>{
      const p=positions[name],g=svgEl('g',{class:'brain-node',transform:`translate(${p.x},${p.y})`,tabindex:'0',role:'link','aria-label':`${titleOf(name)}. ${connected[name]?.size||0} known links.`,'data-name':name});
      const rect=svgEl('rect',{x:0,y:0,width:nodeW,height:nodeH,rx:8,class:'brain-node-card'});g.appendChild(rect);
      const lines=wrapTitle(titleOf(name));
      const text=svgEl('text',{x:12,y:lines.length===1?31:22,class:'brain-node-label'});
      lines.forEach((line,i)=>{const t=svgEl('tspan',{x:12,dy:i===0?0:17});t.textContent=line;text.appendChild(t)});g.appendChild(text);
      const dot=svgEl('circle',{cx:nodeW-13,cy:13,r:3,class:'brain-node-dot'});g.appendChild(dot);
      g.addEventListener('click',()=>{location.hash=routeFor(name)});
      g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();location.hash=routeFor(name)}});
      nodeLayer.appendChild(g);nodeEls.push(g);
    });

    function focus(name){
      const links=connected[name]||new Set();
      host.classList.add('brain-has-focus');
      nodeEls.forEach(el=>{
        const n=el.dataset.name;
        el.classList.toggle('is-focus',n===name);
        el.classList.toggle('is-linked',links.has(n));
        el.classList.toggle('is-dim',n!==name&&!links.has(n));
      });
      edgeEls.forEach(el=>{
        const active=el.dataset.a===name||el.dataset.b===name;
        el.classList.toggle('is-active',active);
        el.classList.toggle('is-dim',!active);
      });
      const linked=[...links].sort((a,b)=>titleOf(a).localeCompare(titleOf(b)));
      summary.innerHTML=`<strong>${esc(titleOf(name))}</strong><span>${linked.length?`Linked to: ${linked.map(n=>esc(titleOf(n))).join(' · ')}`:'No direct party-known links recorded yet.'}</span>`;
    }
    function clear(){
      host.classList.remove('brain-has-focus');
      nodeEls.forEach(el=>el.classList.remove('is-focus','is-linked','is-dim'));
      edgeEls.forEach(el=>el.classList.remove('is-active','is-dim'));
      summary.innerHTML='<strong>Nothing selected</strong><span>Connections will appear here.</span>';
    }
    nodeEls.forEach(el=>{
      const name=el.dataset.name;
      el.addEventListener('mouseenter',()=>focus(name));
      el.addEventListener('mouseleave',clear);
      el.addEventListener('focus',()=>focus(name));
      el.addEventListener('blur',clear);
    });

    const nodeCount=document.getElementById('nodeCount'),edgeCount=document.getElementById('edgeCount');
    if(nodeCount)nodeCount.textContent=names.length;
    if(edgeCount)edgeCount.textContent=validEdges.length;
  }

  window.GREYWAKE_DRAW_BRAIN=draw;
  draw();
})();

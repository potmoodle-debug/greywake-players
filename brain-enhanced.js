(()=>{
  const DATA=window.GREYWAKE_DATA||{};
  const EDGES=window.GREYWAKE_EDGES||[];
  const host=document.getElementById('graph');
  if(!host)return;

  const NS='http://www.w3.org/2000/svg';
  const priority=['Player Characters','People','Factions','Caravans','Locations','Flora & Fauna','Sessions','Handouts','World','Start'];
  let lastWidth=0,resizeTimer=null;

  const titleOf=name=>DATA[name]?.title||name;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const routeFor=name=>'#/record/'+encodeURIComponent(name);
  const svgEl=(tag,attrs={})=>{
    const el=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
    return el;
  };
  const wrapTitle=(text,maxChars)=>{
    const words=String(text).split(/\s+/),lines=[''];
    for(const word of words){
      const i=lines.length-1,next=(lines[i]+' '+word).trim();
      if(next.length<=maxChars||!lines[i])lines[i]=next;
      else if(lines.length<2)lines.push(word);
      else lines[1]=(lines[1]+' '+word).trim();
    }
    if(lines[1]?.length>maxChars+5)lines[1]=lines[1].slice(0,maxChars+2).trimEnd()+'…';
    return lines.slice(0,2);
  };

  function measuredWidth(){
    const rect=host.getBoundingClientRect();
    return Math.max(280,Math.floor(rect.width||host.parentElement?.getBoundingClientRect().width||800));
  }

  function columnCount(w){
    if(w>=1180)return 5;
    if(w>=940)return 4;
    if(w>=700)return 3;
    if(w>=470)return 2;
    return 1;
  }

  function draw(force=false){
    const W=measuredWidth();
    if(!force&&Math.abs(W-lastWidth)<8&&host.querySelector('.brain-svg'))return;
    lastWidth=W;

    const names=Object.keys(DATA).filter(n=>n!=='Player Brain');
    const byCategory={};
    names.forEach(name=>{const cat=DATA[name]?.category||'Other';(byCategory[cat]??=[]).push(name)});
    const categories=Object.keys(byCategory).sort((a,b)=>{
      const ai=priority.indexOf(a),bi=priority.indexOf(b);
      if(ai!==-1||bi!==-1)return(ai===-1?999:ai)-(bi===-1?999:bi);
      return a.localeCompare(b);
    });
    Object.values(byCategory).forEach(arr=>arr.sort((a,b)=>titleOf(a).localeCompare(titleOf(b))));

    const cols=columnCount(W);
    const side=W<430?10:16;
    const gap=W<600?8:12;
    const nodeH=W<470?58:56;
    const rowGap=10;
    const headingH=44;
    const nodeW=Math.max(180,Math.floor((W-(side*2)-(gap*(cols-1)))/cols));
    const actualCols=Math.max(1,Math.floor((W-(side*2)+gap)/(nodeW+gap)));

    let y=18;
    const positions={},sections=[];
    categories.forEach(cat=>{
      const arr=byCategory[cat],rows=Math.max(1,Math.ceil(arr.length/actualCols));
      const sectionY=y;
      const sectionH=headingH+rows*nodeH+(rows-1)*rowGap+14;
      arr.forEach((name,i)=>{
        const col=i%actualCols,row=Math.floor(i/actualCols);
        const x=side+col*(nodeW+gap),ny=sectionY+headingH;
        const py=ny+row*(nodeH+rowGap);
        positions[name]={name,x,y:py,cx:x+nodeW/2,cy:py+nodeH/2,category:cat};
      });
      sections.push({cat,y:sectionY,h:sectionH,count:arr.length});
      y+=sectionH+14;
    });
    const H=Math.max(520,y+10);

    host.innerHTML='';
    host.classList.add('brain-graph-enhanced');

    const toolbar=document.createElement('div');
    toolbar.className='brain-graph-toolbar';
    toolbar.innerHTML='<div class="brain-graph-hint"><strong>Trace a connection</strong><span>Hover over a record. Only its direct party-known links will light up.</span></div><div id="brainLinkSummary" class="brain-link-summary"><strong>Nothing selected</strong><span>Hover a record to see what it connects to.</span></div>';
    host.appendChild(toolbar);
    const summary=toolbar.querySelector('#brainLinkSummary');

    const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,width:W,height:H,'aria-label':'Greywake Player Brain relationship map',role:'img',class:'brain-svg'});
    host.appendChild(svg);

    const bgLayer=svgEl('g',{class:'brain-sections'}),edgeLayer=svgEl('g',{class:'brain-edges'}),nodeLayer=svgEl('g',{class:'brain-nodes'});
    svg.append(bgLayer,edgeLayer,nodeLayer);

    sections.forEach(sec=>{
      const rect=svgEl('rect',{x:4,y:sec.y,width:W-8,height:sec.h,rx:12,class:'brain-section-bg'});
      const label=svgEl('text',{x:side+4,y:sec.y+27,class:'brain-category-label'});label.textContent=sec.cat.toUpperCase();
      const count=svgEl('text',{x:W-side-4,y:sec.y+27,'text-anchor':'end',class:'brain-category-count'});count.textContent=`${sec.count} ${sec.count===1?'record':'records'}`;
      bgLayer.append(rect,label,count);
    });

    const validEdges=EDGES.filter(([a,b])=>positions[a]&&positions[b]&&a!=='Player Brain'&&b!=='Player Brain');
    const connected={};names.forEach(n=>connected[n]=new Set());
    validEdges.forEach(([a,b])=>{connected[a].add(b);connected[b].add(a)});

    const edgeEls=[];
    validEdges.forEach(([a,b],i)=>{
      const A=positions[a],B=positions[b];
      const midY=(A.cy+B.cy)/2;
      const d=Math.abs(A.cy-B.cy)<4
        ? `M ${A.cx} ${A.cy} L ${B.cx} ${B.cy}`
        : `M ${A.cx} ${A.cy} C ${A.cx} ${midY}, ${B.cx} ${midY}, ${B.cx} ${B.cy}`;
      const p=svgEl('path',{d,class:'brain-edge','data-a':a,'data-b':b,'data-edge':i});
      edgeLayer.appendChild(p);edgeEls.push(p);
    });

    const nodeEls=[];
    names.forEach(name=>{
      const p=positions[name];if(!p)return;
      const g=svgEl('g',{class:'brain-node',transform:`translate(${p.x},${p.y})`,tabindex:'0',role:'link','aria-label':`${titleOf(name)}. ${connected[name]?.size||0} known links.`,'data-name':name});
      const rect=svgEl('rect',{x:0,y:0,width:nodeW,height:nodeH,rx:8,class:'brain-node-card'});g.appendChild(rect);
      const maxChars=Math.max(15,Math.floor(nodeW/8.2));
      const lines=wrapTitle(titleOf(name),maxChars);
      const text=svgEl('text',{x:12,y:lines.length===1?34:23,class:'brain-node-label'});
      lines.forEach((line,i)=>{const t=svgEl('tspan',{x:12,dy:i===0?0:17});t.textContent=line;text.appendChild(t)});g.appendChild(text);
      const badge=svgEl('text',{x:nodeW-12,y:34,'text-anchor':'end',class:'brain-node-count'});badge.textContent=connected[name]?.size||0;g.appendChild(badge);
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
      summary.innerHTML='<strong>Nothing selected</strong><span>Hover a record to see what it connects to.</span>';
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

  window.GREYWAKE_DRAW_BRAIN=()=>draw(true);
  window.addEventListener('hashchange',()=>{if(location.hash==='#/brain')setTimeout(()=>draw(true),0)});
  const observer=new ResizeObserver(entries=>{
    const w=Math.floor(entries[0]?.contentRect?.width||0);if(!w)return;
    clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>draw(false),80);
  });
  observer.observe(host);
  setTimeout(()=>draw(true),0);
})();

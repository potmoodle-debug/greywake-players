(()=>{
  const DATA=window.GREYWAKE_DATA||{},EDGES=window.GREYWAKE_EDGES||[],RELATIONS=window.GREYWAKE_RELATION_NOTES||{},host=document.getElementById('graph');
  if(!host)return;
  const NS='http://www.w3.org/2000/svg',W=1000,H=620,cx=500,cy=310,DURATION=520;
  const names=Object.keys(DATA).filter(n=>n!=='Player Brain'),titleOf=n=>DATA[n]?.title||n,categoryOf=n=>DATA[n]?.category||'Other',routeFor=n=>'#/record/'+encodeURIComponent(n);
  const connected={};names.forEach(n=>connected[n]=new Set());
  EDGES.forEach(([a,b])=>{if(a!=='Player Brain'&&b!=='Player Brain'&&connected[a]&&connected[b]){connected[a].add(b);connected[b].add(a)}});
  const validEdgeCount=EDGES.filter(([a,b])=>a!=='Player Brain'&&b!=='Player Brain'&&connected[a]&&connected[b]).length;
  const sortedNames=[...names].sort((a,b)=>titleOf(a).localeCompare(titleOf(b)));
  let current=(DATA.Greywake&&connected.Greywake?.size)?'Greywake':([...names].sort((a,b)=>(connected[b]?.size||0)-(connected[a]?.size||0))[0]||null),historyStack=[],animating=false;
  let svg,edgeLayer,nodeLayer,currentLayout=new Map(),nodeEls=new Map(),edgeEls=new Map();
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svgEl=(tag,attrs={})=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));return el};
  const short=(s,n=24)=>String(s).length>n?String(s).slice(0,n-1).trimEnd()+'…':String(s);
  const wrap=(text,max=15)=>{const words=String(text).split(/\s+/),lines=[''];for(const word of words){const i=lines.length-1,next=(lines[i]+' '+word).trim();if(next.length<=max||!lines[i])lines[i]=next;else if(lines.length<3)lines.push(word);else lines[2]=(lines[2]+' '+word).trim()}if(lines[2]?.length>max+2)lines[2]=lines[2].slice(0,max-1).trimEnd()+'…';return lines.slice(0,3)};
  const pairKey=(a,b)=>a<b?`${a}|||${b}`:`${b}|||${a}`;
  const relationNote=(a,b)=>RELATIONS[pairKey(a,b)]||'';

  function positionsFor(links){
    const pos=new Map(),n=links.length;if(!n)return pos;
    if(n<=10){const rx=n<=6?335:385,ry=n<=6?205:235;links.forEach((name,i)=>{const a=-Math.PI/2+(i/n)*Math.PI*2;pos.set(name,{x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry,ring:1})});return pos}
    const inner=Math.ceil(n/2),outer=n-inner;
    links.slice(0,inner).forEach((name,i)=>{const a=-Math.PI/2+(i/inner)*Math.PI*2;pos.set(name,{x:cx+Math.cos(a)*245,y:cy+Math.sin(a)*160,ring:1})});
    links.slice(inner).forEach((name,i)=>{const a=-Math.PI/2+Math.PI/Math.max(outer,1)+(i/Math.max(outer,1))*Math.PI*2;pos.set(name,{x:cx+Math.cos(a)*405,y:cy+Math.sin(a)*245,ring:2})});return pos;
  }
  function layoutFor(focus){
    const links=[...(connected[focus]||[])].sort((a,b)=>categoryOf(a).localeCompare(categoryOf(b))||titleOf(a).localeCompare(titleOf(b))),pos=positionsFor(links),layout=new Map();
    layout.set(focus,{x:cx,y:cy,r:78,isCenter:true});const r=links.length>12?43:50;links.forEach(n=>layout.set(n,{...pos.get(n),r,isCenter:false}));return{links,layout};
  }
  function edgesFor(focus,layout){
    const out=new Map(),visible=[...layout.keys()].filter(n=>n!==focus);
    visible.forEach(n=>out.set(pairKey(focus,n),{a:focus,b:n,cross:false}));
    for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){const a=visible[i],b=visible[j];if(connected[a]?.has(b))out.set(pairKey(a,b),{a,b,cross:true})}
    return out;
  }
  function controlsHTML(){return `<div class="brain-network-controls"><button id="brainBackFocus" class="brain-control-btn" ${historyStack.length?'':'disabled'}>← Previous focus</button><label class="brain-jump"><span>Choose starting record</span><select id="brainJump">${sortedNames.map(n=>`<option value="${esc(n)}"${n===current?' selected':''}>${esc(titleOf(n))}</option>`).join('')}</select></label><button id="brainOpenCurrent" class="brain-control-btn brain-open-btn">Open ${esc(short(titleOf(current||'record'),18))} →</button></div>`}
  function updateControls(){const jump=host.querySelector('#brainJump'),back=host.querySelector('#brainBackFocus'),open=host.querySelector('#brainOpenCurrent');if(jump)jump.value=current;if(back)back.disabled=!historyStack.length;if(open)open.textContent=`Open ${short(titleOf(current||'record'),18)} →`}
  function setStatus(name){
    const s=host.querySelector('#brainHoverStatus');if(!s||!name)return;
    const links=[...(connected[name]||[])].sort((a,b)=>titleOf(a).localeCompare(titleOf(b)));
    if(!links.length){s.innerHTML=`<strong>${esc(titleOf(name))}</strong><span>No direct party-known links recorded.</span>`;return}
    const details=links.map(n=>{const note=relationNote(name,n);return note?`<b>${esc(titleOf(n))}</b> — ${esc(note)}`:`<b>${esc(titleOf(n))}</b>`}).join('<br>');
    s.innerHTML=`<strong>${esc(titleOf(name))}</strong><span>${links.length} known ${links.length===1?'link':'links'}:<br>${details}</span>`;
  }
  function resetStatus(){const s=host.querySelector('#brainHoverStatus');if(!s)return;const count=connected[current]?.size||0;s.innerHTML=`<strong>${esc(titleOf(current||'No record'))}</strong><span>${count?`Showing ${count} direct ${count===1?'connection':'connections'}. Click a linked circle and it will move into the centre.`:'No direct party-known links recorded for this entry.'}</span>`}
  function circleNode(name){
    const g=svgEl('g',{class:'brain-circle-node',tabindex:'0',role:'button','data-name':name});g.style.opacity='1';
    g.appendChild(svgEl('circle',{cx:0,cy:0,r:50,class:'brain-circle-bg'}));
    const cat=svgEl('text',{x:0,y:-21,'text-anchor':'middle',class:'brain-circle-cat'});cat.textContent=short(categoryOf(name).toUpperCase(),18);g.appendChild(cat);
    const lines=wrap(titleOf(name),14),text=svgEl('text',{x:0,y:-(lines.length-1)*7+3,'text-anchor':'middle',class:'brain-circle-title'});lines.forEach((line,i)=>{const t=svgEl('tspan',{x:0,dy:i===0?0:14});t.textContent=line;text.appendChild(t)});g.appendChild(text);
    const hint=svgEl('text',{x:0,y:60,'text-anchor':'middle',class:'brain-circle-hint'});hint.textContent='CURRENT FOCUS';g.appendChild(hint);
    const act=()=>{if(animating)return;const n=g.dataset.name;if(n===current)location.hash=routeFor(n);else changeFocus(n,true)};
    g.addEventListener('click',act);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act()}});
    g.addEventListener('mouseenter',()=>{if(!animating)hover(name)});g.addEventListener('mouseleave',()=>{if(!animating)clearHover()});g.addEventListener('focus',()=>{if(!animating)hover(name)});g.addEventListener('blur',()=>{if(!animating)clearHover()});
    return g;
  }
  function applyNodeState(g,s){g.setAttribute('transform',`translate(${s.x},${s.y})`);g.querySelector('circle').setAttribute('r',s.r);g.classList.toggle('is-center',!!s.isCenter);const hint=g.querySelector('.brain-circle-hint');if(hint)hint.setAttribute('y',s.r-18)}
  function createEdge(meta){const l=svgEl('line',{class:'brain-network-edge','data-a':meta.a,'data-b':meta.b});edgeLayer.appendChild(l);return l}
  function setEdgeKind(el,meta){el.classList.toggle('is-cross',!!meta.cross);el.classList.toggle('is-spoke',!meta.cross)}
  function baseEdgeOpacity(meta){return meta.cross?.10:.42}
  function setEdgeCoords(el,meta,state){const A=state.get(meta.a),B=state.get(meta.b);if(!A||!B)return;el.setAttribute('x1',A.x);el.setAttribute('y1',A.y);el.setAttribute('x2',B.x);el.setAttribute('y2',B.y)}

  function buildInitial(){
    const scene=layoutFor(current);currentLayout=scene.layout;const edges=edgesFor(current,currentLayout);
    currentLayout.forEach((s,n)=>{const g=circleNode(n);applyNodeState(g,s);nodeLayer.appendChild(g);nodeEls.set(n,g)});
    edges.forEach((m,k)=>{const l=createEdge(m);setEdgeKind(l,m);setEdgeCoords(l,m,currentLayout);edgeEls.set(k,l)});
    resetStatus();
  }
  function hover(name){setStatus(name);const links=connected[name]||new Set();nodeEls.forEach((g,n)=>{g.classList.toggle('is-hovered',n===name);g.classList.toggle('is-related',links.has(n));g.classList.toggle('is-dim',n!==name&&!links.has(n))});edgeEls.forEach(el=>{const active=el.dataset.a===name||el.dataset.b===name;el.classList.toggle('is-active',active);el.classList.toggle('is-dim',!active)})}
  function clearHover(){resetStatus();nodeEls.forEach(g=>g.classList.remove('is-hovered','is-related','is-dim'));edgeEls.forEach(e=>e.classList.remove('is-active','is-dim'))}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}

  function transitionTo(next,push=true){
    if(animating||!DATA[next]||next===current)return;
    const oldCurrent=current,oldLayout=new Map(currentLayout),oldEdges=edgesFor(oldCurrent,oldLayout),newScene=layoutFor(next),newLayout=newScene.layout,newEdges=edgesFor(next,newLayout);
    if(push&&oldCurrent)historyStack.push(oldCurrent);animating=true;host.querySelector('#brainNetworkStage')?.classList.add('is-transitioning');clearHover();
    const source=oldLayout.get(next)||oldLayout.get(oldCurrent)||{x:cx,y:cy,r:50,isCenter:false},allNodes=new Set([...oldLayout.keys(),...newLayout.keys()]);
    allNodes.forEach(n=>{if(!nodeEls.has(n)){const g=circleNode(n);applyNodeState(g,{x:source.x,y:source.y,r:(newLayout.get(n)?.r||50)*.55,isCenter:newLayout.get(n)?.isCenter});g.style.opacity='0';nodeLayer.appendChild(g);nodeEls.set(n,g)}});
    newLayout.forEach((s,n)=>nodeEls.get(n)?.classList.toggle('is-center',!!s.isCenter));
    const edgeUnion=new Map(oldEdges);newEdges.forEach((m,k)=>edgeUnion.set(k,m));edgeUnion.forEach((m,k)=>{if(!edgeEls.has(k)){const l=createEdge(m);l.style.opacity='0';edgeEls.set(k,l)};setEdgeKind(edgeEls.get(k),newEdges.get(k)||m)});
    const nodeStart=new Map();allNodes.forEach(n=>{const a=oldLayout.get(n)||{x:source.x,y:source.y,r:(newLayout.get(n)?.r||50)*.55,isCenter:false},b=newLayout.get(n)||{...a,r:a.r*.7};nodeStart.set(n,{a,b,from:oldLayout.has(n)?1:0,to:newLayout.has(n)?1:0})});
    const edgeStart=new Map();edgeUnion.forEach((m,k)=>{edgeStart.set(k,{m:newEdges.get(k)||oldEdges.get(k),from:oldEdges.has(k)?baseEdgeOpacity(oldEdges.get(k)):0,to:newEdges.has(k)?baseEdgeOpacity(newEdges.get(k)):0})});
    const duration=reduced()?0:DURATION,start=performance.now();
    function frame(now){
      const raw=duration?Math.min(1,(now-start)/duration):1,t=ease(raw),state=new Map();
      nodeStart.forEach((v,n)=>{const s={x:v.a.x+(v.b.x-v.a.x)*t,y:v.a.y+(v.b.y-v.a.y)*t,r:v.a.r+(v.b.r-v.a.r)*t,isCenter:newLayout.get(n)?.isCenter||false};state.set(n,s);const g=nodeEls.get(n);applyNodeState(g,s);g.style.opacity=String(v.from+(v.to-v.from)*t)});
      edgeStart.forEach((v,k)=>{const el=edgeEls.get(k);setEdgeCoords(el,v.m,state);el.style.opacity=String(v.from+(v.to-v.from)*t)});
      if(raw<1){requestAnimationFrame(frame);return}
      allNodes.forEach(n=>{if(!newLayout.has(n)){nodeEls.get(n)?.remove();nodeEls.delete(n)}else{const g=nodeEls.get(n);applyNodeState(g,newLayout.get(n));g.style.opacity=''}});
      edgeUnion.forEach((m,k)=>{if(!newEdges.has(k)){edgeEls.get(k)?.remove();edgeEls.delete(k)}else{const el=edgeEls.get(k),meta=newEdges.get(k);setEdgeKind(el,meta);setEdgeCoords(el,meta,newLayout);el.style.opacity=''}});
      current=next;currentLayout=newLayout;animating=false;host.querySelector('#brainNetworkStage')?.classList.remove('is-transitioning');updateControls();resetStatus();
    }
    requestAnimationFrame(frame);
  }
  function changeFocus(name,push=true){transitionTo(name,push)}
  function wireControls(){
    host.querySelector('#brainJump')?.addEventListener('change',e=>changeFocus(e.target.value,true));
    host.querySelector('#brainOpenCurrent')?.addEventListener('click',()=>{if(current&&!animating)location.hash=routeFor(current)});
    host.querySelector('#brainBackFocus')?.addEventListener('click',()=>{if(animating)return;const prev=historyStack.pop();if(prev)transitionTo(prev,false)});
  }
  function render(){
    if(!current)return;host.innerHTML=`<div class="brain-network-shell">${controlsHTML()}<div id="brainNetworkStage" class="brain-network-stage"></div><div id="brainHoverStatus" class="brain-network-status"></div></div>`;
    const stage=host.querySelector('#brainNetworkStage');svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,class:'brain-network-svg',role:'img','aria-label':'Greywake relationship map'});edgeLayer=svgEl('g',{class:'brain-network-edges'});nodeLayer=svgEl('g',{class:'brain-network-nodes'});svg.append(edgeLayer,nodeLayer);stage.appendChild(svg);nodeEls=new Map();edgeEls=new Map();wireControls();buildInitial();
    const nc=document.getElementById('nodeCount'),ec=document.getElementById('edgeCount');if(nc)nc.textContent=names.length;if(ec)ec.textContent=validEdgeCount;
  }
  window.GREYWAKE_DRAW_BRAIN=render;window.addEventListener('hashchange',()=>{if(location.hash==='#/brain')setTimeout(render,0)});render();
})();
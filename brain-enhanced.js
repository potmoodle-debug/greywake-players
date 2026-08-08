(()=>{
  const DATA=window.GREYWAKE_DATA||{};
  const EDGES=window.GREYWAKE_EDGES||[];
  const host=document.getElementById('graph');
  if(!host)return;

  const NS='http://www.w3.org/2000/svg';
  const names=Object.keys(DATA).filter(n=>n!=='Player Brain');
  const titleOf=n=>DATA[n]?.title||n;
  const categoryOf=n=>DATA[n]?.category||'Other';
  const routeFor=n=>'#/record/'+encodeURIComponent(n);
  const connected={};
  names.forEach(n=>connected[n]=new Set());
  EDGES.forEach(([a,b])=>{
    if(a==='Player Brain'||b==='Player Brain')return;
    if(connected[a]&&connected[b]){connected[a].add(b);connected[b].add(a)}
  });
  const validEdgeCount=EDGES.filter(([a,b])=>a!=='Player Brain'&&b!=='Player Brain'&&connected[a]&&connected[b]).length;
  const sortedNames=[...names].sort((a,b)=>titleOf(a).localeCompare(titleOf(b)));
  let current=(DATA.Greywake&&connected.Greywake?.size)?'Greywake':([...names].sort((a,b)=>(connected[b]?.size||0)-(connected[a]?.size||0))[0]||null);
  let historyStack=[];

  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svgEl=(tag,attrs={})=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));return el};
  const short=(s,n=24)=>String(s).length>n?String(s).slice(0,n-1).trimEnd()+'…':String(s);
  const wrap=(text,max=15)=>{
    const words=String(text).split(/\s+/),lines=[''];
    for(const word of words){
      const i=lines.length-1,next=(lines[i]+' '+word).trim();
      if(next.length<=max||!lines[i])lines[i]=next;
      else if(lines.length<3)lines.push(word);
      else lines[2]=(lines[2]+' '+word).trim();
    }
    if(lines[2]?.length>max+2)lines[2]=lines[2].slice(0,max-1).trimEnd()+'…';
    return lines.slice(0,3);
  };

  function controlsHTML(){
    return `<div class="brain-network-controls">
      <button id="brainBackFocus" class="brain-control-btn" ${historyStack.length?'':'disabled'}>← Previous focus</button>
      <label class="brain-jump"><span>Choose starting record</span><select id="brainJump">${sortedNames.map(n=>`<option value="${esc(n)}"${n===current?' selected':''}>${esc(titleOf(n))}</option>`).join('')}</select></label>
      <button id="brainOpenCurrent" class="brain-control-btn brain-open-btn">Open ${esc(short(titleOf(current||'record'),18))} →</button>
    </div>`;
  }

  function setStatus(name){
    const status=host.querySelector('#brainHoverStatus');
    if(!status||!name)return;
    const links=[...(connected[name]||[])].sort((a,b)=>titleOf(a).localeCompare(titleOf(b)));
    status.innerHTML=`<strong>${esc(titleOf(name))}</strong><span>${links.length?`${links.length} known ${links.length===1?'link':'links'}: ${links.map(n=>esc(titleOf(n))).join(' · ')}`:'No direct party-known links recorded.'}</span>`;
  }

  function resetStatus(){
    const status=host.querySelector('#brainHoverStatus');
    if(!status)return;
    const count=connected[current]?.size||0;
    status.innerHTML=`<strong>${esc(titleOf(current||'No record'))}</strong><span>${count?`Showing ${count} direct ${count===1?'connection':'connections'}. Hover a circle to trace its relationships. Click a linked circle to make it the new centre.`:'No direct party-known links recorded for this entry.'}</span>`;
  }

  function circleNode(name,x,y,r,isCenter=false){
    const g=svgEl('g',{class:`brain-circle-node${isCenter?' is-center':''}`,transform:`translate(${x},${y})`,tabindex:'0',role:'button','data-name':name,'aria-label':`${titleOf(name)}, ${categoryOf(name)}, ${connected[name]?.size||0} known links`});
    g.appendChild(svgEl('circle',{cx:0,cy:0,r,class:'brain-circle-bg'}));
    const cat=svgEl('text',{x:0,y:isCenter?-29:-21,'text-anchor':'middle',class:'brain-circle-cat'});cat.textContent=short(categoryOf(name).toUpperCase(),18);g.appendChild(cat);
    const lines=wrap(titleOf(name),isCenter?18:14);
    const lineGap=isCenter?17:14;
    const startY=-(lines.length-1)*lineGap/2+(isCenter?4:3);
    const text=svgEl('text',{x:0,y:startY,'text-anchor':'middle',class:'brain-circle-title'});
    lines.forEach((line,i)=>{const t=svgEl('tspan',{x:0,dy:i===0?0:lineGap});t.textContent=line;text.appendChild(t)});g.appendChild(text);
    if(isCenter){const hint=svgEl('text',{x:0,y:r-18,'text-anchor':'middle',class:'brain-circle-hint'});hint.textContent='CURRENT FOCUS';g.appendChild(hint)}
    return g;
  }

  function positionsFor(links,cx,cy){
    const pos={};
    const n=links.length;
    if(!n)return pos;
    if(n<=10){
      const rx=n<=6?335:385,ry=n<=6?205:235;
      links.forEach((name,i)=>{
        const angle=-Math.PI/2+(i/n)*Math.PI*2;
        pos[name]={x:cx+Math.cos(angle)*rx,y:cy+Math.sin(angle)*ry,ring:1};
      });
      return pos;
    }
    const innerCount=Math.ceil(n/2),outerCount=n-innerCount;
    links.slice(0,innerCount).forEach((name,i)=>{
      const angle=-Math.PI/2+(i/innerCount)*Math.PI*2;
      pos[name]={x:cx+Math.cos(angle)*245,y:cy+Math.sin(angle)*160,ring:1};
    });
    links.slice(innerCount).forEach((name,i)=>{
      const angle=-Math.PI/2+Math.PI/(Math.max(outerCount,1))+(i/Math.max(outerCount,1))*Math.PI*2;
      pos[name]={x:cx+Math.cos(angle)*405,y:cy+Math.sin(angle)*245,ring:2};
    });
    return pos;
  }

  function drawNetwork(){
    const stage=host.querySelector('#brainNetworkStage');if(!stage||!current)return;
    const W=1000,H=620,cx=500,cy=310;
    const links=[...(connected[current]||[])].sort((a,b)=>categoryOf(a).localeCompare(categoryOf(b))||titleOf(a).localeCompare(titleOf(b)));
    stage.innerHTML='';
    const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,class:'brain-network-svg',role:'img','aria-label':`${titleOf(current)} relationship map`});
    stage.appendChild(svg);
    const edgeLayer=svgEl('g',{class:'brain-network-edges'}),nodeLayer=svgEl('g',{class:'brain-network-nodes'});svg.append(edgeLayer,nodeLayer);

    const pos=positionsFor(links,cx,cy);
    const spokeByName={};
    links.forEach(name=>{
      const p=pos[name];
      const line=svgEl('line',{x1:cx,y1:cy,x2:p.x,y2:p.y,class:'brain-network-spoke','data-link':name});
      edgeLayer.appendChild(line);spokeByName[name]=line;
    });

    const crossEdges=[];
    for(let i=0;i<links.length;i++)for(let j=i+1;j<links.length;j++){
      const a=links[i],b=links[j];
      if(!connected[a]?.has(b))continue;
      const A=pos[a],B=pos[b];
      const line=svgEl('line',{x1:A.x,y1:A.y,x2:B.x,y2:B.y,class:'brain-network-cross','data-a':a,'data-b':b});
      edgeLayer.appendChild(line);crossEdges.push(line);
    }

    const center=circleNode(current,cx,cy,78,true);nodeLayer.appendChild(center);
    const outer=[];
    const outerRadius=links.length>12?43:50;
    links.forEach(name=>{
      const p=pos[name],g=circleNode(name,p.x,p.y,outerRadius,false);nodeLayer.appendChild(g);outer.push(g);
    });

    function hover(name){
      setStatus(name);
      const linksOf=connected[name]||new Set();
      outer.forEach(g=>{
        const other=g.dataset.name;
        g.classList.toggle('is-hovered',other===name);
        g.classList.toggle('is-related',linksOf.has(other));
        g.classList.toggle('is-dim',other!==name&&!linksOf.has(other)&&name!==current);
      });
      center.classList.toggle('is-related',linksOf.has(current)||name===current);
      Object.entries(spokeByName).forEach(([other,line])=>{
        const active=name===current||other===name||(name!==current&&linksOf.has(other));
        line.classList.toggle('is-active',active);
        line.classList.toggle('is-dim',!active);
      });
      crossEdges.forEach(line=>{
        const active=line.dataset.a===name||line.dataset.b===name;
        line.classList.toggle('is-active',active);
      });
    }
    function clearHover(){
      resetStatus();
      outer.forEach(g=>g.classList.remove('is-hovered','is-related','is-dim'));
      center.classList.remove('is-related');
      Object.values(spokeByName).forEach(line=>line.classList.remove('is-active','is-dim'));
      crossEdges.forEach(line=>line.classList.remove('is-active'));
    }

    center.addEventListener('mouseenter',()=>hover(current));center.addEventListener('mouseleave',clearHover);center.addEventListener('focus',()=>hover(current));center.addEventListener('blur',clearHover);
    center.addEventListener('click',()=>{location.hash=routeFor(current)});
    center.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();location.hash=routeFor(current)}});
    outer.forEach(g=>{
      const name=g.dataset.name;
      g.addEventListener('mouseenter',()=>hover(name));g.addEventListener('mouseleave',clearHover);g.addEventListener('focus',()=>hover(name));g.addEventListener('blur',clearHover);
      g.addEventListener('click',()=>changeFocus(name,true));
      g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();changeFocus(name,true)}});
    });

    if(!links.length){
      const msg=svgEl('text',{x:cx,y:cy+130,'text-anchor':'middle',class:'brain-network-empty'});msg.textContent='No direct party-known connections recorded yet.';svg.appendChild(msg);
    }
  }

  function changeFocus(name,push=true){
    if(!DATA[name]||name===current)return;
    if(push&&current)historyStack.push(current);
    current=name;
    const jump=host.querySelector('#brainJump');if(jump)jump.value=name;
    const back=host.querySelector('#brainBackFocus');if(back)back.disabled=!historyStack.length;
    const open=host.querySelector('#brainOpenCurrent');if(open)open.textContent=`Open ${short(titleOf(current),18)} →`;
    drawNetwork();resetStatus();
  }

  function wireControls(){
    host.querySelector('#brainJump')?.addEventListener('change',e=>changeFocus(e.target.value,true));
    host.querySelector('#brainOpenCurrent')?.addEventListener('click',()=>{if(current)location.hash=routeFor(current)});
    host.querySelector('#brainBackFocus')?.addEventListener('click',()=>{
      const prev=historyStack.pop();if(!prev)return;
      current=prev;
      const jump=host.querySelector('#brainJump');if(jump)jump.value=current;
      const back=host.querySelector('#brainBackFocus');if(back)back.disabled=!historyStack.length;
      const open=host.querySelector('#brainOpenCurrent');if(open)open.textContent=`Open ${short(titleOf(current),18)} →`;
      drawNetwork();resetStatus();
    });
  }

  function render(){
    if(!current)return;
    host.innerHTML=`<div class="brain-network-shell">${controlsHTML()}<div id="brainNetworkStage" class="brain-network-stage"></div><div id="brainHoverStatus" class="brain-network-status"></div></div>`;
    wireControls();drawNetwork();resetStatus();
    const nodeCount=document.getElementById('nodeCount'),edgeCount=document.getElementById('edgeCount');
    if(nodeCount)nodeCount.textContent=names.length;if(edgeCount)edgeCount.textContent=validEdgeCount;
  }

  window.GREYWAKE_DRAW_BRAIN=render;
  window.addEventListener('hashchange',()=>{if(location.hash==='#/brain')setTimeout(render,0)});
  render();
})();
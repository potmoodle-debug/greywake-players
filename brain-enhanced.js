(()=>{
  const DATA=window.GREYWAKE_DATA||{};
  const EDGES=window.GREYWAKE_EDGES||[];
  const host=document.getElementById('graph');
  if(!host)return;

  const priority=['Player Characters','People','Factions','Caravans','Locations','Flora & Fauna','Sessions','Handouts','World','Start'];
  const names=Object.keys(DATA).filter(n=>n!=='Player Brain');
  const titleOf=name=>DATA[name]?.title||name;
  const categoryOf=name=>DATA[name]?.category||'Other';
  const routeFor=name=>'#/record/'+encodeURIComponent(name);
  const connected={};
  names.forEach(n=>connected[n]=new Set());
  EDGES.forEach(([a,b])=>{
    if(a==='Player Brain'||b==='Player Brain')return;
    if(connected[a]&&connected[b]){connected[a].add(b);connected[b].add(a)}
  });
  const validEdgeCount=EDGES.filter(([a,b])=>a!=='Player Brain'&&b!=='Player Brain'&&connected[a]&&connected[b]).length;

  const categories=[...new Set(names.map(categoryOf))].sort((a,b)=>{
    const ai=priority.indexOf(a),bi=priority.indexOf(b);
    if(ai!==-1||bi!==-1)return(ai===-1?999:ai)-(bi===-1?999:bi);
    return a.localeCompare(b);
  });
  const sortedNames=[...names].sort((a,b)=>categoryOf(a).localeCompare(categoryOf(b))||titleOf(a).localeCompare(titleOf(b)));
  let selected=sortedNames.find(n=>connected[n].size>0)||sortedNames[0]||null;

  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function directoryHTML(filter=''){
    const q=filter.trim().toLowerCase();
    return categories.map(cat=>{
      const matches=names
        .filter(n=>categoryOf(n)===cat)
        .filter(n=>!q||`${titleOf(n)} ${categoryOf(n)}`.toLowerCase().includes(q))
        .sort((a,b)=>titleOf(a).localeCompare(titleOf(b)));
      if(!matches.length)return'';
      return `<section class="brain-dir-group"><h3>${esc(cat)}</h3>${matches.map(n=>`<button class="brain-dir-item${n===selected?' is-selected':''}" data-brain-name="${esc(n)}"><span>${esc(titleOf(n))}</span><small>${connected[n].size} ${connected[n].size===1?'link':'links'}</small></button>`).join('')}</section>`;
    }).join('');
  }

  function linkCards(name){
    const links=[...(connected[name]||[])].sort((a,b)=>categoryOf(a).localeCompare(categoryOf(b))||titleOf(a).localeCompare(titleOf(b)));
    if(!links.length)return '<div class="brain-no-links">No direct party-known links are recorded for this entry yet.</div>';
    return `<div class="brain-link-grid">${links.map(n=>`<button class="brain-link-card" data-open-brain="${esc(n)}"><small>${esc(categoryOf(n))}</small><strong>${esc(titleOf(n))}</strong><span>Open record →</span></button>`).join('')}</div>`;
  }

  function focusHTML(name){
    if(!name||!DATA[name])return '<div class="brain-empty">No records available.</div>';
    const count=connected[name]?.size||0;
    return `<div class="brain-focus-head"><div><small>${esc(categoryOf(name))}</small><h3>${esc(titleOf(name))}</h3><p>${count} direct party-known ${count===1?'connection':'connections'}</p></div><button class="brain-open-selected" data-open-brain="${esc(name)}">Open record</button></div><div class="brain-focus-node"><span>SELECTED RECORD</span><strong>${esc(titleOf(name))}</strong></div><div class="brain-connector-label">DIRECT CONNECTIONS</div>${linkCards(name)}`;
  }

  function wireDirectory(){
    host.querySelectorAll('.brain-dir-item').forEach(btn=>{
      const name=btn.dataset.brainName;
      const choose=()=>select(name,false);
      btn.addEventListener('mouseenter',choose);
      btn.addEventListener('focus',choose);
      btn.addEventListener('click',e=>{e.preventDefault();select(name,true)});
    });
  }

  function wireOpenButtons(){
    host.querySelectorAll('[data-open-brain]').forEach(btn=>{
      btn.addEventListener('click',()=>{location.hash=routeFor(btn.dataset.openBrain)});
    });
  }

  function select(name,lock=false){
    if(!DATA[name])return;
    selected=name;
    host.querySelectorAll('.brain-dir-item').forEach(btn=>btn.classList.toggle('is-selected',btn.dataset.brainName===name));
    const focus=host.querySelector('.brain-focus-content');
    if(focus){focus.innerHTML=focusHTML(name);wireOpenButtons()}
    if(lock){
      const chosen=host.querySelector(`.brain-dir-item[data-brain-name="${CSS.escape(name)}"]`);
      chosen?.classList.add('is-locked');
      setTimeout(()=>chosen?.classList.remove('is-locked'),220);
    }
  }

  function render(){
    host.innerHTML=`<div class="brain-explorer"><aside class="brain-directory"><div class="brain-directory-head"><div><strong>Known records</strong><span>Hover or select a record</span></div><input id="brainSearch" type="search" placeholder="Filter Player Brain…" aria-label="Filter Player Brain"></div><div id="brainDirectoryList" class="brain-directory-list">${directoryHTML()}</div></aside><section class="brain-focus"><div class="brain-focus-help"><strong>Relationship view</strong><span>Only direct known links are shown, so the view stays readable.</span></div><div class="brain-focus-content">${focusHTML(selected)}</div></section></div>`;

    const search=host.querySelector('#brainSearch');
    const list=host.querySelector('#brainDirectoryList');
    search?.addEventListener('input',()=>{
      list.innerHTML=directoryHTML(search.value);
      wireDirectory();
    });
    wireDirectory();
    wireOpenButtons();

    const nodeCount=document.getElementById('nodeCount'),edgeCount=document.getElementById('edgeCount');
    if(nodeCount)nodeCount.textContent=names.length;
    if(edgeCount)edgeCount.textContent=validEdgeCount;
  }

  window.GREYWAKE_DRAW_BRAIN=render;
  window.addEventListener('hashchange',()=>{if(location.hash==='#/brain')setTimeout(render,0)});
  render();
})();
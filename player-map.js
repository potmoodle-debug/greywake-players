(() => {
  const RECORDS = [
    {label:'Tangle Lanes', record:'Tangle Lanes', x:34.9, y:40.2},
    {label:'White Tower', record:'White Tower', x:47.7, y:47.6},
    {label:'Inner Cistern Court', record:'Inner Greywake', x:60.3, y:56.3},
    {label:'Valve Court', record:'Valve Court', x:70.1, y:60.9},
    {label:'Caravan Gate', record:'Caravan Gate', x:84.1, y:64.6},
    {label:'Digger Yards', record:'Digger Yards', x:41.2, y:77.4},
    {label:'Digger Yards', record:'Digger Yards', x:55.8, y:77.8},
    {label:'Great-Shell Pens', record:'Great-Shell Pens', x:50.5, y:87.2}
  ];
  const IMAGE_SRC = 'assets/maps/greywake-v24-player-map.webp';

  function href(record){ return '#/record/' + encodeURIComponent(record); }

  function mount(root,{embedded=false,recordAllowed=record=>window.GreywakeArchiveAccess?window.GreywakeArchiveAccess.listed(record):Boolean(window.GREYWAKE_DATA?.[record]&&!window.GREYWAKE_DATA[record].playerHidden),recordHref=href}={}){
    if(!root) return;
    root._greywakeMapCleanup?.();
    const spots=RECORDS.filter(spot=>recordAllowed(spot.record));
    const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    root.innerHTML = `
      <section class="gw-map-shell${embedded?' gw-map-embedded':''}" aria-label="Interactive player map of Greywake">
        <div class="gw-map-toolbar" aria-label="Map controls">
          <div>
            <strong>Boundary and working grounds</strong>
            <span>Drag to move · ${embedded?'buttons':'wheel or buttons'} to zoom · select a known place to open its record</span>
          </div>
          <div class="gw-map-buttons">
            <button type="button" data-map-action="out" aria-label="Zoom out">−</button>
            <button type="button" data-map-action="reset">Fit</button>
            <button type="button" data-map-action="in" aria-label="Zoom in">+</button>
          </div>
        </div>
        <div class="gw-map-viewport" tabindex="0" aria-label="Map. Drag to pan and use plus or minus to zoom.">
          <div class="gw-map-stage">
            <img class="gw-map-image" src="${IMAGE_SRC}" alt="Greywake boundary and working grounds player map" draggable="false">
            <div class="gw-map-hotspots" aria-label="Known locations">
              ${spots.map(spot=>`<a class="gw-map-hotspot" style="--x:${spot.x}%;--y:${spot.y}%" href="${esc(recordHref(spot.record))}" title="${esc(spot.label)}" aria-label="Open ${esc(spot.label)}"><span>${esc(spot.label)}</span></a>`).join('')}
            </div>
          </div>
          <div class="gw-map-loading">Loading player map…</div>
        </div>
        <p class="gw-map-note">This is the player-known surface map. Hidden routes, concealed Digger entrances and unrevealed GM information are not shown.</p>
      </section>`;

    const viewport=root.querySelector('.gw-map-viewport');
    const stage=root.querySelector('.gw-map-stage');
    const img=root.querySelector('.gw-map-image');
    const loading=root.querySelector('.gw-map-loading');
    if(!viewport||!stage||!img) return;

    let scale=1, fitScale=1, x=0, y=0;
    let mapWidth=1,mapHeight=1;
    let dragging=false, moved=false, startX=0, startY=0, baseX=0, baseY=0;
    const min=()=>fitScale*.72, max=()=>Math.max(1,fitScale*5);

    function apply(){
      stage.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
    }
    function clamp(){
      const w=mapWidth*scale,h=mapHeight*scale,vw=viewport.clientWidth,vh=viewport.clientHeight;
      const margin=70;
      if(w<=vw){x=(vw-w)/2}else{x=Math.min(margin,Math.max(vw-w-margin,x))}
      if(h<=vh){y=(vh-h)/2}else{y=Math.min(margin,Math.max(vh-h-margin,y))}
    }
    function fit(){
      const vw=viewport.clientWidth,vh=viewport.clientHeight;
      if(!img.naturalWidth||!vw||!vh)return;
      mapWidth=img.naturalWidth;mapHeight=img.naturalHeight;
      stage.style.width=mapWidth+'px';stage.style.height=mapHeight+'px';
      fitScale=Math.min(vw/mapWidth,vh/mapHeight);
      scale=fitScale;
      x=(vw-mapWidth*scale)/2;
      y=(vh-mapHeight*scale)/2;
      apply();
    }
    function zoom(next,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2){
      const old=scale;
      next=Math.max(min(),Math.min(max(),next));
      if(Math.abs(next-old)<.0001)return;
      const wx=(cx-x)/old,wy=(cy-y)/old;
      scale=next;x=cx-wx*next;y=cy-wy*next;
      clamp();apply();
    }

    img.addEventListener('load',()=>{loading?.remove();fit();});
    img.addEventListener('error',()=>{if(loading)loading.textContent='Map image is not available yet.';});
    if(img.complete && img.naturalWidth){loading?.remove();fit();}

    viewport.addEventListener('wheel',e=>{
      if(embedded&&!e.ctrlKey&&!e.metaKey)return;
      e.preventDefault();
      const r=viewport.getBoundingClientRect();
      zoom(scale*(e.deltaY<0?1.14:.88),e.clientX-r.left,e.clientY-r.top);
    },{passive:false});

    viewport.addEventListener('pointerdown',e=>{
      if(e.button!==0 || e.target.closest('.gw-map-hotspot')) return;
      dragging=true;moved=false;startX=e.clientX;startY=e.clientY;baseX=x;baseY=y;
      viewport.setPointerCapture?.(e.pointerId);viewport.classList.add('is-dragging');
    });
    viewport.addEventListener('pointermove',e=>{
      if(!dragging)return;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      if(Math.abs(dx)+Math.abs(dy)>4)moved=true;
      x=baseX+dx;y=baseY+dy;clamp();apply();
    });
    const end=e=>{if(!dragging)return;dragging=false;viewport.classList.remove('is-dragging');try{viewport.releasePointerCapture?.(e.pointerId)}catch{}};
    viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);

    viewport.addEventListener('keydown',e=>{
      if(e.key==='+'||e.key==='='){e.preventDefault();zoom(scale*1.2)}
      if(e.key==='-'){e.preventDefault();zoom(scale/1.2)}
      if(e.key==='0'){e.preventDefault();fit()}
      const step=45;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')x+=step;if(e.key==='ArrowRight')x-=step;if(e.key==='ArrowUp')y+=step;if(e.key==='ArrowDown')y-=step;clamp();apply()}
    });
    root.querySelector('[data-map-action="in"]')?.addEventListener('click',()=>zoom(scale*1.25));
    root.querySelector('[data-map-action="out"]')?.addEventListener('click',()=>zoom(scale/1.25));
    root.querySelector('[data-map-action="reset"]')?.addEventListener('click',fit);

    const ro=new ResizeObserver(()=>fit());ro.observe(viewport);
    root._greywakeMapCleanup=()=>{ro.disconnect();root._greywakeMapCleanup=null;};
  }

  window.GreywakePlayerMap={mount};
})();
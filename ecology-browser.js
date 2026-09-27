(() => {
  const FLORA=new Set(['Shellfeed','Latchfan','Thirst-Marrow']);
  const ALIASES={'Cacklemaw':'Cacklemaw Pack'};
  function routeFor(name){ return '#/record/'+encodeURIComponent(name); }
  function textOf(html){ const d=document.createElement('div'); d.innerHTML=html||''; return (d.textContent||'').replace(/\s+/g,' ').trim(); }
  function summaryFor(entry){ const t=textOf(entry.html); const m=t.match(/^(.{0,150}?[.!?])(?:\s|$)/); return m?m[1]:t.slice(0,150)+(t.length>150?'…':''); }
  function imageFor(name){ const M=window.GREYWAKE_MEDIA||{}; const list=M[name]||M[ALIASES[name]]||[]; const item=list.find(x=>x&&x.src); return item?item.src:''; }
  function card(name){
    const D=window.GREYWAKE_DATA||{}; const e=D[name]; if(!e)return '';
    const img=imageFor(name); const type=FLORA.has(name)?'FLORA':'FAUNA';
    const visual=img?'<img src="'+img+'" alt="" loading="lazy" decoding="async">':'<div class="ecology-card-placeholder" aria-hidden="true"><span>FIELD NOTE</span></div>';
    return '<a class="ecology-card '+(img?'has-image':'no-image')+'" href="'+routeFor(name)+'" data-note="'+name.replace(/"/g,'&quot;')+'">'+visual+'<div class="ecology-card-shade"></div><div class="ecology-card-copy"><small>'+type+'</small><strong>'+e.title+'</strong><p>'+summaryFor(e)+'</p><span class="ecology-open">Open field record →</span></div></a>';
  }
  function enhance(){
    if((location.hash||'')!=='#/record/Known%20Flora%20and%20Fauna')return;
    const article=document.getElementById('article'); if(!article||article.dataset.ecologyEnhanced==='1')return;
    const D=window.GREYWAKE_DATA||{}, C=window.GREYWAKE_CATEGORIES||{};
    const names=(C['Flora & Fauna']||[]).filter(n=>n!=='Known Flora and Fauna'&&D[n]); if(!names.length)return;
    const old=article.querySelector('.record-directory'); if(!old)return;
    const fauna=names.filter(n=>!FLORA.has(n)), flora=names.filter(n=>FLORA.has(n));
    const section=document.createElement('section'); section.className='record-directory ecology-directory';
    section.innerHTML='<div class="ecology-directory-head"><div><div class="related-kicker">PARTY-KNOWN FIELD GUIDE</div><h2>Flora & Fauna</h2><p>What the party can currently recognise, use, avoid or interpret in the wastes. This is deliberately incomplete: Greywake is a living ecosystem, not a revealed bestiary.</p></div><div class="ecology-ledger"><strong>'+names.length+'</strong><span>shared records</span></div></div>'+
      (fauna.length?'<section class="ecology-group"><div class="ecology-group-title"><span>FAUNA</span><h3>Creatures of the wastes</h3></div><div class="ecology-grid">'+fauna.map(card).join('')+'</div></section>':'')+
      (flora.length?'<section class="ecology-group"><div class="ecology-group-title"><span>FLORA</span><h3>Plants & useful growths</h3></div><div class="ecology-grid">'+flora.map(card).join('')+'</div></section>':'');
    old.replaceWith(section); article.dataset.ecologyEnhanced='1';
    section.querySelectorAll('a[data-note]').forEach(a=>a.addEventListener('click',()=>{}));
  }
  const article=document.getElementById('article');
  if(article)new MutationObserver(()=>requestAnimationFrame(enhance)).observe(article,{childList:true,subtree:false});
  window.addEventListener('hashchange',()=>requestAnimationFrame(enhance));
  requestAnimationFrame(enhance);
})();
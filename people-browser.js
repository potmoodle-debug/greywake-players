(()=>{
  const stripHTML=(html='')=>{
    const box=document.createElement('div');
    box.innerHTML=html;
    box.querySelectorAll('.npc-affiliation-tags').forEach(x=>x.remove());
    return (box.textContent||'').replace(/\s+/g,' ').trim();
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const people=()=>((window.GREYWAKE_CATEGORIES?.People)||[])
    .filter(name=>name!=='Known People'&&window.GREYWAKE_DATA?.[name])
    .map(name=>({name,...window.GREYWAKE_DATA[name]}))
    .sort((a,b)=>(a.title||a.name).localeCompare(b.title||b.name));

  window.GREYWAKE_RENDER_PEOPLE_BROWSER=function(host){
    const records=people();
    let selected=records[0]?.name||'';
    host.innerHTML=`
      <section class="people-browser" aria-label="Known people browser">
        <div class="people-browser-head">
          <div>
            <div class="eyebrow">THE PEOPLE YOU KNOW</div>
            <h1>Known People</h1>
            <p>Browse people already established in the party record. This view uses only player-safe information: what is known, seen or earned in play.</p>
          </div>
          <div class="people-browser-stat"><strong id="peopleBrowserTopCount">${records.length}</strong><small>KNOWN PEOPLE</small></div>
        </div>
        <section class="people-browser-shell">
          <div class="people-browser-tools">
            <input id="peopleBrowserSearch" type="search" placeholder="Search name, faction, affiliation or known detail" autocomplete="off">
            <select id="peopleBrowserFaction"><option value="">All factions</option></select>
            <select id="peopleBrowserAffiliation"><option value="">All affiliations</option></select>
            <button id="peopleBrowserClear" type="button">Clear</button>
          </div>
          <div class="people-browser-layout">
            <div class="people-browser-directory-wrap">
              <div id="peopleBrowserCount" class="people-browser-count"></div>
              <div id="peopleBrowserList" class="people-browser-directory"></div>
            </div>
            <article id="peopleBrowserDetail" class="people-browser-detail"></article>
          </div>
        </section>
      </section>`;

    const search=host.querySelector('#peopleBrowserSearch');
    const faction=host.querySelector('#peopleBrowserFaction');
    const affiliation=host.querySelector('#peopleBrowserAffiliation');
    const list=host.querySelector('#peopleBrowserList');
    const detail=host.querySelector('#peopleBrowserDetail');
    const count=host.querySelector('#peopleBrowserCount');

    const factions=[...new Set(records.map(r=>r.faction).filter(Boolean))].sort();
    const affiliations=[...new Set(records.map(r=>r.affiliation).filter(Boolean))].sort();
    factions.forEach(v=>faction.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(v)}</option>`));
    affiliations.forEach(v=>affiliation.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(v)}</option>`));

    const matching=()=>{
      const q=search.value.trim().toLowerCase();
      return records.filter(r=>{
        if(faction.value && (r.faction||'')!==faction.value)return false;
        if(affiliation.value && (r.affiliation||'')!==affiliation.value)return false;
        if(!q)return true;
        return [r.title,r.name,r.faction,r.affiliation,stripHTML(r.html)].filter(Boolean).join(' ').toLowerCase().includes(q);
      });
    };

    const renderDetail=name=>{
      const r=records.find(x=>x.name===name);
      if(!r){
        detail.innerHTML='<div class="people-browser-empty"><small>KNOWN PEOPLE</small>Select a person to open their record.</div>';
        return;
      }
      selected=r.name;
      list.querySelectorAll('.people-browser-row').forEach(b=>b.classList.toggle('active',b.dataset.person===selected));
      const summary=stripHTML(r.html).split(/(?<=[.!?])\s+/)[0]||'Known person in Greywake.';
      const tags=[
        r.faction?'<span class="people-browser-tag">Faction · '+esc(r.faction)+'</span>':'',
        r.affiliation?'<span class="people-browser-tag">Affiliation · '+esc(r.affiliation)+'</span>':''
      ].join('');
      detail.innerHTML=`
        <header class="people-browser-detail-head">
          <div>
            <div class="eyebrow">KNOWN PERSON</div>
            <h2>${esc(r.title||r.name)}</h2>
            <p>${esc(summary)}</p>
          </div>
          <button type="button" id="peopleOpenRecord">Open full record →</button>
        </header>
        <div class="people-browser-tags">${tags}</div>
        <div class="people-browser-body">${r.html||''}</div>`;
      detail.querySelector('#peopleOpenRecord')?.addEventListener('click',()=>{
        location.hash='#/record/'+encodeURIComponent(r.name);
      });
      detail.scrollTop=0;
    };

    const renderList=()=>{
      const rows=matching();
      count.textContent=`${rows.length} / ${records.length} people`;
      list.innerHTML='';
      if(!rows.length){
        list.innerHTML='<div class="people-browser-empty"><small>NO MATCHES</small>No known people match those filters.</div>';
        renderDetail('');
        return;
      }
      if(!rows.some(r=>r.name===selected))selected=rows[0].name;
      rows.forEach(r=>{
        const b=document.createElement('button');
        b.type='button';
        b.className='people-browser-row'+(r.name===selected?' active':'');
        b.dataset.person=r.name;
        const sub=[r.faction&&r.faction!=='Not established'?r.faction:'',r.affiliation||''].filter(Boolean).join(' · ')||'Public record';
        b.innerHTML='<em>'+esc(r.category||'People')+'</em><strong>'+esc(r.title||r.name)+'</strong><span>'+esc(sub)+'</span>';
        b.addEventListener('click',()=>renderDetail(r.name));
        list.appendChild(b);
      });
      renderDetail(selected);
    };

    [search,faction,affiliation].forEach(el=>el.addEventListener(el===search?'input':'change',renderList));
    host.querySelector('#peopleBrowserClear').addEventListener('click',()=>{
      search.value='';faction.value='';affiliation.value='';renderList();search.focus();
    });
    renderList();
  };
})();
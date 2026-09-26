(()=>{
  const stripHTML=(html='')=>{
    const box=document.createElement('div');
    box.innerHTML=html;
    box.querySelectorAll('.npc-affiliation-tags').forEach(x=>x.remove());
    return (box.textContent||'').replace(/\s+/g,' ').trim();
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const PORTRAITS={
    'Mara Vell':'assets/npcs/hq-v3/mara-vell.webp',
    'High Keeper Varn':'assets/npcs/hq-v3/high-keeper-varn.webp',
    'Selka Marr':'assets/npcs/hq-v3/selka-marr.webp',
    'Brannic Hale':'assets/npcs/hq-v3/brannic-hale.webp',
    'Sister Elowen':'assets/npcs/hq-v3/sister-elowen.webp',
    'Nemi':'assets/npcs/hq-v3/nemi.webp',
    'Hessa Vey':'assets/npcs/hq-v3/hessa-vey.webp',
    'Talla Reed':'assets/npcs/hq-v3/talla-reed.webp',
    'Joric Noll':'assets/npcs/hq-v3/joric-noll.webp',
    'Maela Rusk':'assets/npcs/hq-v3/maela-rusk.webp',
    'Sarn Pell':'assets/npcs/hq-v3/sarn-pell.webp',
    'Bessa Trant':'assets/npcs/hq-v3/bessa-trant.webp',
    'Rennic Vale':'assets/npcs/hq-v3/rennic-vale.webp',
    'Spencer Digger':'assets/npcs/hq-v3/spencer-digger-canon.jpg',
    'Velmira':'assets/canon/characters/velmira-poster.webp',
    'Daro Pell':'assets/canon/characters/daro-pell.webp',
    'Meren':'assets/canon/characters/meren.webp'
  };
  const portraitFor=name=>PORTRAITS[name]||'';
  const initials=name=>String(name||'?').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();

  const currentCharacter=()=>String(document.body.dataset.character||'').toLowerCase();
  const revealedNpcNames=()=>new Set((window.GREYWAKE_LIVE_REVEALS||[])
    .filter(x=>x?.reveal_kind==='npc')
    .map(x=>String(x.title||'').trim())
    .filter(Boolean));
  const people=()=>{
    const gm=document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
    const revealed=revealedNpcNames();
    return ((window.GREYWAKE_CATEGORIES?.People)||[])
      .filter(name=>name!=='Known People'&&window.GREYWAKE_DATA?.[name])
      .map(name=>({name,...window.GREYWAKE_DATA[name]}))
      .filter(r=>gm||r.playerHidden!==true||revealed.has(r.name)||revealed.has(r.title))
      .sort((a,b)=>(a.title||a.name).localeCompare(b.title||b.name));
  };

  const connectedNames=name=>{
    const edges=window.GREYWAKE_EDGES||[],data=window.GREYWAKE_DATA||{};
    const found=[];
    edges.forEach(([a,b])=>{if(a===name&&data[b])found.push(b);else if(b===name&&data[a])found.push(a)});
    return [...new Set(found)].filter(n=>n!==name);
  };
  const summaryFor=r=>stripHTML(r.html).split(/(?<=[.!?])\s+/)[0]||'Known person in Greywake.';
  const detailText=(r,label)=>{
    const box=document.createElement('div');box.innerHTML=r.html||'';
    const heads=[...box.querySelectorAll('h2,h3,strong')];
    const hit=heads.find(h=>h.textContent.trim().toLowerCase().includes(label.toLowerCase()));
    if(hit){
      const next=hit.closest('h2,h3')?.nextElementSibling||hit.parentElement?.nextElementSibling;
      if(next?.textContent?.trim())return next.textContent.trim();
    }
    return '';
  };

  window.GREYWAKE_RENDER_PEOPLE_BROWSER=function(host,options={}){
    const records=people();
    const gmMode=options.gm===true || (document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true');
    let selected=records[0]?.name||'';
    host.innerHTML=`
      <section class="people-browser ${gmMode?'gm-people-browser':''}" aria-label="${gmMode?'Greywake people':'Known people'} browser">
        <div class="people-browser-head">
          <div>
            <div class="eyebrow">THE CAST</div>
            <h1>${gmMode?'People of Greywake':'Known People'}</h1>
            <p>${gmMode?'Run NPCs first. Current identity, faction, relationships and usable table information come before reference material.':'People your character has actually met, heard about or learned about in play. Hidden motives, private knowledge and GM running notes are not shown here.'}</p>
          </div>
          <div class="people-browser-stat"><strong id="peopleBrowserTopCount">${records.length}</strong><small>${gmMode?'NPC RECORDS':'KNOWN PEOPLE'}</small></div>
        </div>
        <section class="people-browser-shell">
          <div class="people-browser-tools">
            <input id="peopleBrowserSearch" type="search" placeholder="Search name, faction, affiliation, role or known detail" autocomplete="off">
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

    const factions=[...new Set(records.map(r=>r.faction).filter(v=>v&&v!=='Not established'))].sort();
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
        detail.innerHTML='<div class="people-browser-empty"><small>THE CAST</small>Select a person to open their record.</div>';
        return;
      }
      selected=r.name;
      list.querySelectorAll('.people-browser-row').forEach(b=>b.classList.toggle('active',b.dataset.person===selected));
      const summary=summaryFor(r);
      const factionText=r.faction&&r.faction!=='Not established'?r.faction:'Not established';
      const affiliationText=r.affiliation||'Not established';
      const connections=connectedNames(r.name);
      const relationshipText=connections.length?connections.slice(0,8).map(n=>window.GREYWAKE_DATA[n]?.title||n).join(' · '):'No connected record established.';
      const portrayal=detailText(r,'play')||detailText(r,'portray')||'No specific portrayal note is recorded yet.';
      const knows=detailText(r,'know')||'Use only the information established in this record and current campaign state.';
      const want=detailText(r,'want')||detailText(r,'goal')||'No current want is recorded yet.';
      const tags=[factionText!=='Not established'?factionText:'',r.affiliation||''].filter(Boolean).map(t=>`<span class="people-browser-tag">${esc(t)}</span>`).join('');
      const fullButton=gmMode?'':`<button type="button" id="peopleOpenRecord">Open full record →</button>`;
      const portrait=portraitFor(r.name);
      const portraitHTML=portrait
        ? `<img src="${portrait}" alt="${esc(r.title||r.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="people-browser-portrait-fallback" hidden>${initials(r.title||r.name)}</span>`
        : `<span class="people-browser-portrait-fallback">${initials(r.title||r.name)}</span>`;
      const gmReveal=gmMode?`
        <div class="people-browser-reveal">
          <div><small>REVEAL TO PLAYERS</small><span id="peopleRevealState">Choose who has just met or learned about this person.</span></div>
          <div class="people-browser-reveal-actions">
            <button type="button" data-reveal-npc="party">Party</button>
            <button type="button" data-reveal-npc="marek">Marek</button>
            <button type="button" data-reveal-npc="odie">Odie</button>
          </div>
        </div>`:'';

      detail.innerHTML=`
        <section class="people-browser-character-hero">
          <div class="people-browser-portrait">${portraitHTML}</div>
          <div class="people-browser-character-copy">
            <div class="eyebrow">${esc(factionText==='Not established'?'GREYWAKE':factionText)}</div>
            <h2>${esc(r.title||r.name)}</h2>
            <p>${esc(summary)}</p>
            <div class="people-browser-tags">${tags}</div>
            ${fullButton}
          </div>
        </section>
        ${gmReveal}
        ${gmMode ? `
          <div class="people-browser-facts">
            <div><small>FACTION</small><strong>${esc(factionText)}</strong></div>
            <div><small>AFFILIATION</small><strong>${esc(affiliationText)}</strong></div>
            <div><small>RECORD</small><strong>Current campaign</strong></div>
          </div>
          <section class="people-browser-at-table">
            <div class="eyebrow">AT THE TABLE</div>
            <div class="people-browser-field"><h4>What they want now</h4><p>${esc(want)}</p></div>
            <div class="people-browser-field"><h4>How to play them</h4><p>${esc(portrayal)}</p></div>
            <div class="people-browser-field"><h4>What they know</h4><p>${esc(knows)}</p></div>
            <div class="people-browser-field"><h4>Relationships</h4><p>${esc(relationshipText)}</p></div>
          </section>
          <details class="people-browser-reference">
            <summary>Campaign reference</summary>
            <div class="people-browser-body">${r.html||''}</div>
          </details>
        ` : `
          <div class="people-browser-player-known">
            <div class="eyebrow">WHAT YOU KNOW</div>
            <div class="people-browser-body">${r.html||''}</div>
          </div>
        `}`;

      detail.querySelector('#peopleOpenRecord')?.addEventListener('click',()=>{location.hash='#/record/'+encodeURIComponent(r.name)});
      detail.querySelectorAll('[data-reveal-npc]').forEach(btn=>btn.addEventListener('click',async()=>{
        const state=detail.querySelector('#peopleRevealState');
        const audience=btn.dataset.revealNpc;
        detail.querySelectorAll('[data-reveal-npc]').forEach(x=>x.disabled=true);
        if(state)state.textContent='Revealing…';
        try{
          if(!window.GREYWAKE_REVEAL_NPC)throw new Error('Live reveal service is not ready.');
          await window.GREYWAKE_REVEAL_NPC(r.name,audience,summary);
          if(state)state.textContent=`Revealed to ${audience==='party'?'Party':audience[0].toUpperCase()+audience.slice(1)}.`;
        }catch(err){if(state)state.textContent=err.message||'Reveal failed.'}
        finally{detail.querySelectorAll('[data-reveal-npc]').forEach(x=>x.disabled=false)}
      }));
      detail.scrollTop=0;
    };

    const renderList=()=>{
      const rows=matching();
      count.textContent=`${rows.length} / ${records.length} NPCs`;
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
        const factionName=r.faction&&r.faction!=='Not established'?r.faction:'';
        const sub=[r.affiliation||'',factionName].filter(Boolean).join(' · ')||'Greywake';
        const portrait=portraitFor(r.name);
        const thumb=portrait
          ? '<span class="people-browser-thumb"><img src="'+portrait+'" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><i hidden>'+initials(r.title||r.name)+'</i></span>'
          : '<span class="people-browser-thumb"><i>'+initials(r.title||r.name)+'</i></span>';
        b.innerHTML=thumb+'<div><strong>'+esc(r.title||r.name)+'</strong><span>'+esc(sub)+'</span></div><em>'+(gmMode?'CURRENT':'KNOWN')+'</em>';
        b.addEventListener('click',()=>renderDetail(r.name));
        list.appendChild(b);
      });
      renderDetail(selected);
    };

    [search,faction,affiliation].forEach(el=>el.addEventListener(el===search?'input':'change',renderList));
    host.querySelector('#peopleBrowserClear').addEventListener('click',()=>{search.value='';faction.value='';affiliation.value='';renderList();search.focus()});
    renderList();
    const refresh=()=>{ if(document.body.dataset.role!=='gm' || document.body.dataset.gmPreview==='true'){ window.GREYWAKE_RENDER_PEOPLE_BROWSER(host,options); } };
    window.addEventListener('greywake:live-reveals-updated',refresh,{once:true});
  };
})();
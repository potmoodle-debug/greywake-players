(() => {
  const GUIDE='character-guide.html';
  const MAP=new Map([
    ['level','level'],['proficiency','proficiency'],['evasion','evasion'],['armor','armor'],['armor score','armor'],['armor slots','armor'],
    ['hp','hit-points'],['hit points','hit-points'],['stress','stress'],['hope','hope'],['water','water'],
    ['traits','traits'],['agility','agility'],['strength','strength'],['finesse','finesse'],['instinct','instinct'],['presence','presence'],['knowledge','knowledge'],
    ['roll options','action-rolls'],['action rolls','action-rolls'],['experiences','experiences'],['experience payment','experiences'],['roll mode','action-rolls'],['difficulty','action-rolls'],['advantage','advantage'],['disadvantage','advantage'],
    ['short rest','short-rest'],['long rest','long-rest'],['backpack','inventory'],['inventory','inventory'],['take damage','damage'],['actions','features'],['what can i do?','action-rolls'],['beastform','beastform'],
    ['features','features'],['domain cards','domain-cards'],['weapons, armor & inventory','equipment'],['weapons, armour & inventory','equipment'],['weapons','weapons'],
    ['school of knowledge','subclass'],['nightwalker','subclass'],['warden of renewal','subclass'],['wanderborne','community'],['underborne','community'],['ridgeborne','community']
  ]);

  const clean=v=>String(v||'').replace(/\s+/g,' ').replace(/\?$/,'').trim().toLowerCase();
  const topicFor=v=>{
    const t=clean(v);
    if(MAP.has(t))return MAP.get(t);
    if(t.includes('damage threshold'))return'damage-thresholds';
    if(t.includes('armor slot')||t.includes('armour slot'))return'armor';
    if(t.includes('hit point'))return'hit-points';
    if(t.includes('domain'))return'domain-cards';
    if(t.includes('weapon'))return'weapons';
    if(t.includes('recall'))return'recall';
    return null;
  };

  function ensureStyles(){
    if(document.getElementById('gw-character-help-style'))return;
    const s=document.createElement('style');
    s.id='gw-character-help-style';
    s.textContent=`
      #characterSheet .gw-help-link{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:16px!important;height:16px!important;min-width:16px!important;min-height:16px!important;margin-left:5px!important;padding:0!important;border:1px solid rgba(218,196,126,.78)!important;border-radius:50%!important;background:rgba(20,19,14,.92)!important;color:#e6d28f!important;font:800 10px/1 Arial,sans-serif!important;letter-spacing:0!important;text-decoration:none!important;vertical-align:middle!important;opacity:.92!important;box-shadow:0 0 0 1px rgba(0,0,0,.28)!important;cursor:help!important;position:relative;z-index:20}
      #characterSheet .gw-help-link:hover,#characterSheet .gw-help-link:focus-visible{opacity:1!important;color:#fff0b8!important;border-color:#f0d98b!important;background:#282316!important;outline:2px solid rgba(230,210,143,.22)!important;outline-offset:2px!important}
      #characterSheet .gw-help-host{display:inline-flex!important;align-items:center!important;gap:0!important}
      #characterSheet .gw-help-control{position:relative!important;display:block!important;min-width:0!important}
      #characterSheet .trait-roll-buttons>.gw-help-control{min-width:0!important}
      #characterSheet .trait-roll-buttons>.gw-help-control>[data-trait-roll]{width:100%!important;height:100%!important}
      #characterSheet .gw-help-control>.gw-help-link{position:absolute!important;top:3px!important;right:3px!important;margin:0!important;z-index:30!important}
      #characterSheet .p10-field-actions>.gw-help-control>.p10-field-action{width:100%!important;height:100%!important}
      #characterSheet .p10-rest-utility>.gw-help-control{display:inline-block!important}
      #characterSheet .p10-rest-utility>.gw-help-control>.gw-help-link{top:-5px!important;right:-5px!important}
      #characterSheet .live-resource-copy>span.gw-help-host,#traitRollPanel .trait-roll-head strong.gw-help-host,#traitRollPanel .p10-evasion-mark span.gw-help-host{display:inline-flex!important}
      #characterSheet summary .gw-help-link{position:relative!important;z-index:30!important}
      @media(pointer:coarse){#characterSheet .gw-help-link{width:20px!important;height:20px!important;min-width:20px!important;min-height:20px!important;font-size:11px!important}}
    `;
    document.head.appendChild(s);
  }

  function makeLink(topic,label){
    const a=document.createElement('a');
    a.className='gw-help-link';
    a.href=`${GUIDE}#${topic}`;
    a.textContent='?';
    a.title=`What is ${label}?`;
    a.setAttribute('aria-label',`Explain ${label}`);
    a.addEventListener('click',e=>e.stopPropagation());
    a.addEventListener('pointerdown',e=>e.stopPropagation());
    a.addEventListener('keydown',e=>e.stopPropagation());
    return a;
  }

  function attach(host,topic,label){
    if(!host||!topic||host.dataset.sheetHelp==='true'||host.querySelector?.(':scope > .gw-help-link,:scope > .sheet-help-link'))return;
    host.dataset.sheetHelp='true';
    host.classList.add('gw-help-host');
    host.appendChild(makeLink(topic,label));
  }

  function wrapControl(button,topic,label){
    if(!button||!topic||button.dataset.sheetHelp==='true'||button.closest('.gw-help-control'))return;
    button.dataset.sheetHelp='true';
    const wrap=document.createElement('span');
    wrap.className='gw-help-control';
    button.parentNode.insertBefore(wrap,button);
    wrap.appendChild(button);
    wrap.appendChild(makeLink(topic,label));
  }

  function decorateLive(){
    const root=document.getElementById('characterSheet');
    if(!root)return;

    const direct=[
      ['#traitRollPanel .trait-roll-head strong','traits'],
      ['#traitRollPanel .p10-evasion-mark span','evasion']
    ];
    direct.forEach(([sel,topic])=>root.querySelectorAll(sel).forEach(n=>attach(n,topic,n.childNodes[0]?.textContent?.trim()||n.textContent.trim())));

    root.querySelectorAll('#traitRollPanel [data-trait-roll]').forEach(btn=>{
      const label=btn.dataset.traitRoll||btn.querySelector('span')?.textContent.trim()||btn.textContent.trim();
      wrapControl(btn,topicFor(label)||'traits',label);
    });

    root.querySelectorAll('#traitRollPanel .trait-roll-options summary').forEach(n=>attach(n,'action-rolls','Roll options'));
    root.querySelectorAll('#traitRollPanel .trait-roll-experiences legend').forEach(n=>attach(n,'experiences','Experiences'));
    root.querySelectorAll('#traitRollPanel .trait-roll-field > span').forEach(n=>{
      const label=n.childNodes[0]?.textContent?.trim()||n.textContent.trim();
      attach(n,topicFor(label),label);
    });

    root.querySelectorAll('.live-resource-copy > span').forEach(n=>{
      const label=n.childNodes[0]?.textContent?.trim()||n.textContent.trim();
      attach(n,topicFor(label),label);
    });

    root.querySelectorAll('.p10-rest-utility button').forEach(btn=>{
      const label=btn.textContent.trim();
      wrapControl(btn,topicFor(label),label);
    });

    root.querySelectorAll('.p10-field-actions .p10-field-action').forEach(btn=>{
      const label=btn.textContent.trim();
      wrapControl(btn,topicFor(label),label);
    });
  }

  function decorateBase(){
    const root=document.getElementById('characterSheet');
    if(!root)return;
    root.querySelectorAll('.character-stat > span,.pro-resource-head > span').forEach(n=>{
      const label=n.childNodes[0]?.textContent?.trim()||n.textContent.trim();
      attach(n,topicFor(label),label);
    });
    root.querySelectorAll('.pro-identity-ribbon span,.pro-identity-ribbon b').forEach(n=>{
      const label=n.childNodes[0]?.textContent?.trim()||n.textContent.trim();
      attach(n,topicFor(label),label);
    });
    root.querySelectorAll('.sheet-group').forEach(group=>{
      const head=group.querySelector('.sheet-group-head h3');
      const groupLabel=head?.childNodes[0]?.textContent?.trim()||head?.textContent.trim()||'';
      if(head)attach(head,topicFor(groupLabel),groupLabel);
      const groupKey=clean(groupLabel);
      group.querySelectorAll('.sheet-card h4').forEach(title=>{
        const label=title.childNodes[0]?.textContent?.trim()||title.textContent.trim();
        let topic=topicFor(label);
        if(!topic&&groupKey.includes('experience'))topic='experiences';
        if(!topic&&groupKey.includes('feature'))topic='features';
        if(!topic&&groupKey.includes('domain'))topic='domain-cards';
        if(!topic&&(groupKey.includes('weapon')||groupKey.includes('armor')||groupKey.includes('inventory')))topic='equipment';
        attach(title,topic,label);
      });
    });
  }

  function decorate(){ensureStyles();decorateLive();decorateBase();}
  let timer;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(decorate,40);};
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  ['greywake:player-ready','greywake:sheet-enhanced','greywake:resources-changed','greywake:companion-resources-changed','hashchange'].forEach(evt=>window.addEventListener(evt,schedule));
  document.addEventListener('DOMContentLoaded',schedule);
  schedule();
})();

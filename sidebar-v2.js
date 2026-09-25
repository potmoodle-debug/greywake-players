(()=>{
  const nav=document.getElementById('nav');
  const search=document.querySelector('#sidebar .search');
  if(!nav||!search)return;

  const makeButton=(label,route,detail)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='sidebar-primary-link';
    b.dataset.route=route;
    b.innerHTML='<span>'+label+'</span>'+(detail?'<small>'+detail+'</small>':'');
    b.addEventListener('click',()=>{location.hash=route});
    return b;
  };

  const primary=document.createElement('div');
  primary.className='sidebar-primary';
  const groups=[
    ['GREYWAKE',[
      ['Home','#/',''],
      ['What’s happening','#/possibilities',''],
      ['Explore Greywake','#/greywake',''],
      ['Relationships','#/brain','']
    ]],
    ['YOUR CHARACTER',[
      ['Character','#/character',''],
      ['My Greywake','#/my-greywake',''],
      ['Interests & questions','#/mind',''],
      ['Messages','#/inbox','']
    ]],
    ['CAMPAIGN',[
      ['Campaign record','#/campaign','']
    ]]
  ];
  groups.forEach(([title,items])=>{
    const g=document.createElement('section');
    g.className='sidebar-primary-group';
    const h=document.createElement('h3');h.textContent=title;g.appendChild(h);
    items.forEach(item=>g.appendChild(makeButton(item[0],item[1],item[2])));
    primary.appendChild(g);
  });
  search.parentNode.insertBefore(primary,search);

  const label=document.createElement('div');
  label.className='sidebar-browse-label';
  label.textContent='KNOWN WORLD';
  search.insertAdjacentElement('afterend',label);

  const foot=document.querySelector('.sidebar-foot');
  if(foot && !document.querySelector('.sidebar-mode-link')){
    const gm=document.createElement('a');
    gm.className='sidebar-mode-link';
    gm.href='gm.html';
    gm.innerHTML='<span>GM Control</span><span>→</span>';
    foot.appendChild(gm);
  }

  function decorateGroups(){
    const searching=(document.getElementById('searchInput')?.value||'').trim().length>0;
    [...nav.querySelectorAll(':scope > .nav-group')].forEach(group=>{
      if(group.dataset.sidebarV2)return;
      group.dataset.sidebarV2='1';
      const h=group.querySelector(':scope > h3');
      if(!h)return;
      const hasActive=!!group.querySelector('.nav-link.active');
      group.classList.toggle('is-open',searching||hasActive);
      h.setAttribute('role','button');
      h.setAttribute('tabindex','0');
      h.setAttribute('aria-expanded',String(searching||hasActive));
      const toggle=()=>{
        const open=group.classList.toggle('is-open');
        h.setAttribute('aria-expanded',String(open));
      };
      h.addEventListener('click',toggle);
      h.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}
      });
    });
  }

  function updateActive(){
    const hash=location.hash||'#/';
    document.querySelectorAll('.sidebar-primary-link').forEach(b=>{
      const r=b.dataset.route;
      const active=r==='#/' ? (hash===''||hash==='#/') : hash===r||hash.startsWith(r+'/');
      b.classList.toggle('active',active);
    });
    decorateGroups();
    const activeRecord=nav.querySelector('.nav-link.active');
    if(activeRecord){
      const g=activeRecord.closest('.nav-group');
      if(g){
        g.classList.add('is-open');
        g.querySelector(':scope > h3')?.setAttribute('aria-expanded','true');
      }
    }
  }

  const observer=new MutationObserver(()=>{
    [...nav.querySelectorAll(':scope > .nav-group')].forEach(g=>delete g.dataset.sidebarV2);
    decorateGroups();
    updateActive();
  });
  observer.observe(nav,{childList:true,subtree:false});
  document.getElementById('searchInput')?.addEventListener('input',()=>setTimeout(()=>{
    [...nav.querySelectorAll(':scope > .nav-group')].forEach(g=>{
      g.classList.toggle('is-open',!!document.getElementById('searchInput').value.trim()||!!g.querySelector('.nav-link.active'));
      g.querySelector(':scope > h3')?.setAttribute('aria-expanded',String(g.classList.contains('is-open')));
    });
  },0));
  window.addEventListener('hashchange',()=>setTimeout(updateActive,0));

  decorateGroups();
  updateActive();
})();
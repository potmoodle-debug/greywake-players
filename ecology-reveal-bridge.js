(() => {
  const QUEUE_KEY='greywake-ecology-reveal-queue-v1';
  const PREFIX='ECOLOGY';

  function fullGM(){return document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';}
  function player(){return String(document.body.dataset.character||'').toLowerCase();}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function packetBody(name,stage,label,text){return `[${PREFIX}|${name}|${stage}|${label}] ${text}`;}
  function parse(body){
    const m=String(body||'').match(/^\[ECOLOGY\|([^|]+)\|([^|]+)\|([^\]]+)\]\s*(.*)$/s);
    return m?{name:m[1],stage:m[2],label:m[3],text:m[4]}:null;
  }
  function stageRank(stage){return ({signs:1,seen:2,identified:3,practical:4,studied:5})[stage]||0;}

  window.GREYWAKE_QUEUE_ECOLOGY_REVEAL=function(name,stage,label,text,audience){
    if(!fullGM())throw new Error('GM access required.');
    sessionStorage.setItem(QUEUE_KEY,JSON.stringify({name,stage,label,text,audience}));
    location.hash='#/gm-session';
    setTimeout(flushQueue,80);
  };

  function flushQueue(){
    if(!fullGM()||location.hash!=='#/gm-session')return;
    const raw=sessionStorage.getItem(QUEUE_KEY);if(!raw)return;
    let q;try{q=JSON.parse(raw)}catch{sessionStorage.removeItem(QUEUE_KEY);return}
    const bar=document.getElementById('gmLiveRevealBar');if(!bar){setTimeout(flushQueue,120);return}
    const kind=bar.querySelector('#gmLiveRevealKind'),input=bar.querySelector('#gmLiveRevealText');
    const target=bar.querySelector(`[data-reveal-to="${CSS.escape(q.audience||'party')}"]`);
    if(!kind||!input||!target){setTimeout(flushQueue,120);return}
    kind.value='creature';
    input.value=packetBody(q.name,q.stage,q.label,q.text);
    sessionStorage.removeItem(QUEUE_KEY);
    target.click();
  }

  function ecologyReveals(){
    const items=window.GREYWAKE_LIVE_REVEALS||[];
    return items.map(item=>({item,data:parse(item.body)})).filter(x=>x.data);
  }
  function knowledgeFor(name){
    return ecologyReveals().filter(x=>x.data.name===name).sort((a,b)=>stageRank(a.data.stage)-stageRank(b.data.stage));
  }

  function ensureDynamicRecord(name,records){
    const D=window.GREYWAKE_DATA||(window.GREYWAKE_DATA={}),C=window.GREYWAKE_CATEGORIES||(window.GREYWAKE_CATEGORIES={});
    const max=Math.max(0,...records.map(x=>stageRank(x.data.stage)));
    if(max<3||D[name])return;
    D[name]={
      title:name,
      category:'Flora & Fauna',
      html:'<p>This creature has now been identified in play. The record below contains only what this character or the party has actually learned.</p>'
    };
    const cat=C['Flora & Fauna']||(C['Flora & Fauna']=[]);
    if(!cat.includes(name))cat.push(name);
  }

  function augmentRecord(){
    if(fullGM())return;
    const h=location.hash||'';if(!h.startsWith('#/record/'))return;
    const name=decodeURIComponent(h.slice(9));
    const records=knowledgeFor(name);if(!records.length)return;
    ensureDynamicRecord(name,records);
    const article=document.getElementById('article');if(!article||article.querySelector('.ecology-earned-knowledge'))return;
    const top=records.filter((x,i,a)=>a.findIndex(y=>y.data.stage===x.data.stage)===i);
    const block=document.createElement('section');block.className='ecology-earned-knowledge';
    block.innerHTML='<div class="related-kicker">EARNED IN PLAY</div><h2>What you know</h2><div class="ecology-earned-list">'+top.map(x=>`<article><small>${esc(x.data.label)}</small><p>${esc(x.data.text)}</p></article>`).join('')+'</div>';
    const h1=article.querySelector('h1');h1?.insertAdjacentElement('afterend',block);
  }

  function cleanLivePanel(){
    if(fullGM())return;
    document.querySelectorAll('.live-reveal-item').forEach(row=>{
      const p=row.querySelector('p');if(!p)return;
      const d=parse(p.textContent);if(!d)return;
      const title=row.querySelector('strong');if(title)title.textContent=d.name+' · '+d.label;
      p.textContent=d.text;
    });
    const toast=document.querySelector('.live-reveal-toast');
    if(toast){
      const p=toast.querySelector('p'),d=parse(p?.textContent||'');
      if(d){const s=toast.querySelector('strong');if(s)s.textContent=d.name+' · '+d.label;p.textContent=d.text;}
    }
  }

  function refresh(){
    if(fullGM()){flushQueue();return}
    ecologyReveals().forEach(x=>ensureDynamicRecord(x.data.name,knowledgeFor(x.data.name)));
    cleanLivePanel();augmentRecord();
  }

  const style=document.createElement('style');style.textContent=`
    .ecology-earned-knowledge{margin:22px 0 30px;padding:18px 0;border-top:1px solid #43402f;border-bottom:1px solid #343329}.ecology-earned-knowledge h2{margin:5px 0 12px;font-size:28px}.ecology-earned-list{display:grid;gap:8px}.ecology-earned-list article{padding:11px 12px;border:1px solid #36352a;background:#151610}.ecology-earned-list small{display:block;margin-bottom:5px;color:#b79f60;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.ecology-earned-list p{margin:0;color:#c9c1ae;font-size:11px;line-height:1.5}
  `;document.head.appendChild(style);

  window.addEventListener('greywake:live-reveals-updated',()=>setTimeout(refresh,0));
  window.addEventListener('hashchange',()=>setTimeout(refresh,30));
  window.addEventListener('greywake:player-ready',()=>setTimeout(refresh,80));
  new MutationObserver(()=>setTimeout(refresh,0)).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,250));
  setTimeout(refresh,350);
})();
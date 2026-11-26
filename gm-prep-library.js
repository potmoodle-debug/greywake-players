(()=>{'use strict';
const endpoint='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/gm-prep-library';
const gm=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true'&&['#/gm-prep','#/gm-between'].includes(location.hash);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=v=>typeof v==='string'&&/^assets\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp)$/i.test(v)&&!v.includes('..');
let cards=null,session='',error='',busy=false,queued=false;
function mount(){
 if(!gm())return;
 const grid=document.querySelector('.gm-ready-run .gm-ready-grid');if(!grid)return;
 const parent=grid.parentElement;
 let status=parent.querySelector('[data-prep-feed-status]');
 if(!status){status=document.createElement('p');status.dataset.prepFeedStatus='1';status.setAttribute('role','status');grid.before(status)}
 const message=error?'Preparation feed unavailable — '+(cards?'showing last successful load.':'showing bundled fallback.') :cards?'Shared preparation library · '+session+' · '+cards.length+' ready':'Connecting to preparation library…';
 if(status.textContent!==message)status.textContent=message;
 if(!cards)return;
 const sig=JSON.stringify(cards);if(grid.dataset.prepSignature===sig)return;grid.dataset.prepSignature=sig;
 grid.innerHTML=cards.map(c=>'<article class="gm-ready-card" data-prep-id="'+esc(c.id)+'"><div class="gm-ready-art">'+(safe(c.image)?'<img src="'+esc(c.image)+'" alt="'+esc(c.image_label||c.title)+'" loading="lazy">':'<div class="gw-card-symbol">◇</div>')+'<span>'+esc(c.image_label||c.kind)+'</span></div><div class="gm-ready-body"><small>'+esc(c.readiness)+' · '+esc(c.kind)+'</small><h3>'+esc(c.title)+'</h3><p>'+esc(c.detail)+'</p>'+(c.record&&window.GREYWAKE_DATA?.[c.record]?'<button class="gm-prep-link" data-gm-record="'+esc(c.record)+'">'+esc(c.record)+' →</button>':'')+'<button type="button" class="gm-ready-activate" data-dynamic-prep="'+esc(c.id)+'">+ Add to RUN</button></div></article>').join('')||'<p>No ready preparation cards for this session.</p>';
}
async function pull(){if(!gm()||busy)return;busy=true;try{const r=await fetch(endpoint,{headers:{apikey:'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl','x-greywake-character':'gm','x-greywake-code':'GREYWAKE'},cache:'no-store'});const d=await r.json();if(!r.ok||!Array.isArray(d.cards))throw Error('Feed unavailable');cards=d.cards;session=d.session;error=''}catch(e){error=String(e.message)}finally{busy=false;mount()}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-dynamic-prep]');if(!b||!gm())return;const c=cards?.find(x=>x.id===b.dataset.dynamicPrep);if(c)window.GreywakeRunCardDialog?.({kind:c.kind,title:c.title,record:c.record,adversary_slug:c.adversary_slug});});
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',()=>{schedule();pull()});window.addEventListener('greywake:player-ready',pull);setInterval(pull,3500);setTimeout(pull,250);
})();
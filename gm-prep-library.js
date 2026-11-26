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
 grid.innerHTML=cards.map(c=>'<article class="gm-ready-card" data-prep-id="'+esc(c.id)+'"><div class="gm-ready-art">'+(safe(c.image)?'<img src="'+esc(c.image)+'" alt="'+esc(c.image_label||c.title)+'" loading="lazy">':'<div class="gw-card-symbol">◇</div>')+'<span>'+esc(c.image_label||c.kind)+'</span></div><div class="gm-ready-body"><small>'+esc(c.readiness)+' · '+esc(c.kind)+'</small><h3>'+esc(c.title)+'</h3><p>'+esc(c.detail)+'</p>'+(c.record&&window.GREYWAKE_DATA?.[c.record]?'<button class="gm-prep-link" data-gm-record="'+esc(c.record)+'">'+esc(c.record)+' →</button>':'')+'<button type="button" class="gm-prep-link gw-prep-view" data-view-prep="'+esc(c.id)+'" style="display:block;width:100%;min-height:40px;border:1px solid #82724b;margin:4px 0 8px;padding:9px;text-align:center;background:#29251a;color:#e7d6ae;cursor:pointer">View preparation ↗</button><button type="button" class="gm-ready-activate" data-dynamic-prep="'+esc(c.id)+'">+ Add to RUN</button></div></article>').join('')||'<p>No ready preparation cards for this session.</p>';
}
async function pull(){if(!gm()||busy)return;busy=true;try{const r=await fetch(endpoint,{headers:{apikey:'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl','x-greywake-character':'gm','x-greywake-code':'GREYWAKE'},cache:'no-store'});const d=await r.json();if(!r.ok||!Array.isArray(d.cards))throw Error('Feed unavailable');cards=d.cards;session=d.session;error=''}catch(e){error=String(e.message)}finally{busy=false;mount()}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-dynamic-prep]');if(!b||!gm())return;const c=cards?.find(x=>x.id===b.dataset.dynamicPrep);if(c)window.GreywakeRunCardDialog?.({kind:c.kind,title:c.title,record:c.record,adversary_slug:c.adversary_slug});});
const preparedIds=new Set(['s6-western-sound','s6-haul-grounds','s6-examine-tracks','s6-assess-masonry','s6-survey-south','s6-traveller','s6-pack-animal','s6-route-exchange']);
function viewPrep(c){
 if(!gm()||!c||document.getElementById('gwPrepDetail'))return;
 const d=document.createElement('dialog');d.id='gwPrepDetail';d.style.cssText='width:min(680px,90vw);max-height:85vh;overflow:auto;background:#191a14;color:#eee5cd;border:1px solid #8a7440;padding:24px';
 const hasNote=preparedIds.has(c.id);
 d.innerHTML='<header style="display:flex;justify-content:space-between;gap:16px;align-items:start"><div><small>'+esc(c.readiness)+' · '+esc(c.kind)+'</small><h2>'+esc(c.title)+'</h2></div><button type="button" data-close-prep aria-label="Close preparation">Close</button></header>'+(safe(c.image)?'<a href="'+esc(c.image)+'" target="_blank" rel="noopener noreferrer"><img style="width:100%;max-height:340px;object-fit:contain" src="'+esc(c.image)+'" alt="'+esc(c.image_label||c.title)+'"></a>':'')+'<h3>Overview</h3><p>'+esc(c.detail)+'</p><h3>Detailed preparation</h3>'+(hasNote?'<p>The private session sheet contains the opening description, GM guidance, choices, consequences and source links. Open it in your synced Obsidian vault.</p><p><a data-open-note style="display:inline-block;padding:12px;border:1px solid #c3a66c;color:#e8d098" href="'+esc('obsidian://open?vault='+encodeURIComponent('Greywake')+'&file='+encodeURIComponent('90 GM Only/Session 06 — Card Preparation'))+'">Open detailed preparation in Obsidian ↗</a></p><p>Section: <strong>'+esc(c.title)+'</strong></p><p style="font-size:12px">Requires the latest private vault sync. The private notes are not stored on this website.</p>':'<p>No linked private preparation sheet is configured for this card.</p>')+'<hr><button type="button" class="gm-ready-activate" data-detail-activate>+ Add to RUN</button>';
 d.querySelector('[data-close-prep]').onclick=()=>d.close();d.querySelector('[data-detail-activate]').onclick=()=>{d.close();window.GreywakeRunCardDialog?.({kind:c.kind,title:c.title,record:c.record,adversary_slug:c.adversary_slug});};d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();
}
document.addEventListener('click',e=>{if(!gm())return;const b=e.target.closest('[data-view-prep]');const a=e.target.closest('[data-prep-id]');if(b){viewPrep(cards?.find(x=>x.id===b.dataset.viewPrep));return}if(a&&!e.target.closest('button,a,input,select,textarea'))viewPrep(cards?.find(x=>x.id===a.dataset.prepId));});
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',()=>{schedule();pull()});window.addEventListener('greywake:player-ready',pull);setInterval(pull,3500);setTimeout(pull,250);
})();
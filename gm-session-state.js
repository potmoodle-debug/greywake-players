(() => {
  if(window.__GreywakeGMSessionState)return;
  window.__GreywakeGMSessionState=true;

  const KEY='greywake-gm-live-session-state-v1';
  const DEFAULTS={session:'Session Four',phase:'Prep / play',location:'Greywake',party:'Marek · Velmira · Odie',scene:'Greywake',fear:'',timeWeather:'',danger:'',activeNPCs:''};
  let queued=false;
  let timer=null;

  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const onRun=()=>location.hash==='#/gm-session';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function read(){
    try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...DEFAULTS}}
  }
  function write(state){localStorage.setItem(KEY,JSON.stringify({...state,updatedAt:new Date().toISOString()}));window.dispatchEvent(new CustomEvent('greywake:gm-session-state-changed',{detail:state}))}

  function ensureStyles(){
    if(document.getElementById('gm-session-state-styles'))return;
    const s=document.createElement('style');s.id='gm-session-state-styles';s.textContent=`
      .gm-status-strip[data-live-session]{grid-template-columns:repeat(5,minmax(0,1fr))}
      .gm-session-state-editor{margin:-7px 0 16px;border:1px solid #39362b;background:#11120e;color:#a49b87}
      .gm-session-state-editor summary{cursor:pointer;list-style:none;padding:9px 12px;color:#c9b16e;font-size:8px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;display:flex;justify-content:space-between;gap:12px;align-items:center}
      .gm-session-state-editor summary::-webkit-details-marker{display:none}.gm-session-state-editor summary:after{content:'Edit';border:1px solid #514830;padding:3px 6px;color:#9d8c5f}.gm-session-state-editor[open] summary:after{content:'Close'}
      .gm-session-state-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;padding:12px;border-top:1px solid #302e26}.gm-session-state-form label{display:grid;gap:5px;color:#837a67;font-size:7px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.gm-session-state-form label.wide{grid-column:span 2}.gm-session-state-form input{min-width:0;border:1px solid #474232;background:#0d0e0b;color:#ded3ba;padding:9px 10px;font:10px/1.2 system-ui,sans-serif}
      .gm-session-state-actions{grid-column:1/-1;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px}.gm-session-state-actions button{border:1px solid #76623b;background:#292215;color:#ead392;padding:8px 10px;font-size:8px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.gm-session-state-actions button.secondary{border-color:#4b4637;background:#171812;color:#a99f87}.gm-session-state-actions span{margin-left:auto;color:#746d5e;font-size:8px}
      .gm-session-scene-meta{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 3px}.gm-session-scene-meta span{border:1px solid #413d31;background:#12130f;padding:5px 7px;color:#aaa08a;font-size:8px}.gm-session-scene-meta b{color:#d4bd78;font-weight:800}
      @media(max-width:1000px){.gm-status-strip[data-live-session]{grid-template-columns:repeat(3,minmax(0,1fr))}.gm-session-state-form{grid-template-columns:1fr 1fr}}@media(max-width:700px){.gm-status-strip[data-live-session],.gm-session-state-form{grid-template-columns:1fr 1fr}.gm-session-state-form label.wide{grid-column:1/-1}.gm-session-state-actions span{width:100%;margin-left:0}}
    `;document.head.appendChild(s);
  }

  const cell=(label,value)=>`<div><small>${esc(label)}</small><strong>${esc(value||'—')}</strong></div>`;

  function syncStatus(root,state){
    const status=root.querySelector('.gm-status-strip');if(!status)return;
    const captured=[...status.querySelectorAll('div')].find(x=>/CAPTURED/i.test(x.querySelector('small')?.textContent||''))?.querySelector('strong')?.textContent||'0 waiting';
    const sig=JSON.stringify([state.session,state.phase,state.location,state.fear,state.party,captured]);
    if(status.dataset.sessionSignature===sig)return;
    status.dataset.sessionSignature=sig;status.dataset.liveSession='1';
    status.innerHTML=cell('SESSION',`${state.session}${state.phase?` · ${state.phase}`:''}`)+cell('PARTY LOCATION',state.location)+cell('FEAR',state.fear)+cell('ACTIVE PARTY',state.party)+cell('CAPTURED',captured);
  }

  function syncScene(root,state){
    const panel=[...root.querySelectorAll('.gm-panel')].find(x=>/CURRENT SCENE/i.test(x.querySelector('small')?.textContent||''));if(!panel)return;
    const sig=JSON.stringify([state.scene,state.location,state.fear,state.timeWeather,state.danger,state.activeNPCs]);
    if(panel.dataset.sessionSignature===sig)return;
    panel.dataset.sessionSignature=sig;
    const small=panel.querySelector('small'),h2=panel.querySelector('h2'),p=panel.querySelector('p');
    if(small)small.textContent='CURRENT SCENE · LIVE SESSION STATE';
    if(h2)h2.textContent=state.scene||state.location||'Not set';
    if(p)p.textContent=state.danger?`Immediate danger: ${state.danger}`:'No immediate danger has been set in the live session state.';
    let meta=panel.querySelector('.gm-session-scene-meta');if(!meta){meta=document.createElement('div');meta.className='gm-session-scene-meta';p?.insertAdjacentElement('afterend',meta)}
    meta.innerHTML=`<span><b>Location</b> ${esc(state.location||'—')}</span><span><b>Fear</b> ${esc(state.fear||'—')}</span><span><b>Time / weather</b> ${esc(state.timeWeather||'—')}</span><span><b>NPCs</b> ${esc(state.activeNPCs||'—')}</span>`;
  }

  function ensureEditor(root,state){
    const status=root.querySelector('.gm-status-strip');if(!status)return;
    let editor=root.querySelector('.gm-session-state-editor');if(!editor){editor=document.createElement('details');editor.className='gm-session-state-editor';status.insertAdjacentElement('afterend',editor)}
    const sig=JSON.stringify(state);if(editor.dataset.renderedFor===sig)return;
    const wasOpen=editor.open;editor.dataset.renderedFor=sig;
    editor.innerHTML=`<summary>Live session state <span>Browser operational state · not canon authority</span></summary><form class="gm-session-state-form">
      <label>Session<input name="session" maxlength="60" value="${esc(state.session)}"></label><label>Phase<input name="phase" maxlength="80" value="${esc(state.phase)}"></label><label>Party location<input name="location" maxlength="100" value="${esc(state.location)}"></label><label>Fear<input name="fear" maxlength="30" value="${esc(state.fear)}" placeholder="e.g. 4"></label>
      <label class="wide">Current scene<input name="scene" maxlength="140" value="${esc(state.scene)}" placeholder="Where the immediate scene is happening"></label><label class="wide">Time / weather<input name="timeWeather" maxlength="140" value="${esc(state.timeWeather)}" placeholder="Only set this when established"></label><label class="wide">Active party<input name="party" maxlength="140" value="${esc(state.party)}"></label><label class="wide">Active NPCs<input name="activeNPCs" maxlength="240" value="${esc(state.activeNPCs)}" placeholder="Comma separated, e.g. Mara Vell, Sarn Pell"></label><label class="wide">Immediate danger<input name="danger" maxlength="180" value="${esc(state.danger)}" placeholder="Leave blank if none is established"></label>
      <div class="gm-session-state-actions"><button type="submit">Save live state</button><button type="button" class="secondary" data-session-reset>Reset manual fields</button><span>${state.updatedAt?`Last changed ${esc(new Date(state.updatedAt).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}))}`:'Uses established campaign defaults until you change it.'}</span></div></form>`;
    editor.open=wasOpen;
    editor.querySelector('form')?.addEventListener('submit',event=>{event.preventDefault();const form=new FormData(event.currentTarget);const next={...state};['session','phase','location','fear','scene','timeWeather','party','activeNPCs','danger'].forEach(key=>next[key]=String(form.get(key)||'').trim());write(next);schedule()});
    editor.querySelector('[data-session-reset]')?.addEventListener('click',()=>{write({...DEFAULTS});schedule()});
  }

  function render(){
    if(!fullGM()||!onRun())return;
    ensureStyles();const root=document.getElementById('gmOperationsView');if(!root||root.classList.contains('hidden'))return;
    const state=read();syncStatus(root,state);syncScene(root,state);ensureEditor(root,state);
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})}
  function resetTimer(){if(timer)clearInterval(timer);timer=null;if(fullGM()&&onRun()){setTimeout(schedule,120);timer=setInterval(schedule,1500)}}

  window.GreywakeGMSessionState={read,save:next=>{write({...read(),...next});schedule()}};
  window.addEventListener('hashchange',resetTimer);window.addEventListener('greywake:player-ready',resetTimer);document.addEventListener('DOMContentLoaded',resetTimer);setTimeout(resetTimer,600);
})();
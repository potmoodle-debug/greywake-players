(() => {
  const API_URL = 'https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals?include_system=1';
  const API_KEY = 'sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const SYSTEM_KIND = 'system_resource_state';
  const SYSTEM_KEY = 'marek';
  const CLIENT_KEY = 'greywake:resource-sync-client:v1';
  const POLL_MS = 5000;

  let systemGoalId = null;
  let lastServerMessageId = 0;
  let remoteRevision = 0;
  let applyingRemote = false;
  let pushPending = false;
  let pushTimer = null;
  let pollTimer = null;
  let initialized = false;
  let testingPreview = false;
  let lastRemoteState = null;

  function isMarek(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase() === 'marek';
  }

  function isPreview(){ return document.body.dataset.gmPreview === 'true'; }
  function isReadOnly(){ return isPreview() && !testingPreview; }

  function clientId(){
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id){
      id = window.crypto?.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(CLIENT_KEY,id);
    }
    return id;
  }

  function identity(){
    const user=window.GreywakePlayer;
    const character=String(user?.character || document.body.dataset.character || '').toLowerCase();
    const code=String(user?.code || (character==='marek'?'MAREK':'')).toUpperCase();
    return {character,code};
  }

  async function request(method='GET',body=null){
    const auth=identity();
    if(auth.character!=='marek'||!auth.code) throw new Error('Marek sync identity is unavailable.');
    const response=await fetch(API_URL,{method,headers:{apikey:API_KEY,'Content-Type':'application/json','x-greywake-character':auth.character,'x-greywake-code':auth.code},body:body?JSON.stringify(body):undefined});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||'Greywake live state could not sync.');
    return data;
  }

  function localState(){
    const s=window.GreywakeResources?.getState?.();
    if(!s)return null;
    return {hope:Number(s.hope),maxHope:Number(s.maxHope),stress:Number(s.stress),maxStress:Number(s.maxStress),hp:Number(s.hp),maxHP:Number(s.maxHP)};
  }

  function validRemote(v){
    if(!v||Number(v.v)!==1)return false;
    return [['hope','maxHope'],['stress','maxStress'],['hp','maxHP']].every(([current,max])=>Number.isInteger(Number(v[current]))&&Number.isInteger(Number(v[max]))&&Number(v[max])>0&&Number(v[current])>=0&&Number(v[current])<=Number(v[max]));
  }

  function sameState(a,b){
    return a&&b&&['hope','maxHope','stress','maxStress','hp','maxHP'].every(k=>Number(a[k])===Number(b[k]));
  }

  function parseLatest(bundle){
    const goals=Array.isArray(bundle?.goals)?bundle.goals:[];
    const messages=Array.isArray(bundle?.messages)?bundle.messages:[];
    const goal=goals.find(item=>item?.character_slug==='marek'&&item?.source_kind===SYSTEM_KIND&&item?.source_key===SYSTEM_KEY);
    if(!goal)return null;
    systemGoalId=Number(goal.id);
    const candidates=messages.filter(message=>Number(message.goal_id)===systemGoalId).sort((a,b)=>Number(b.id)-Number(a.id));
    for(const message of candidates){
      try{
        const parsed=JSON.parse(message.message_text);
        if(validRemote(parsed))return {...parsed,messageId:Number(message.id),createdAt:message.created_at||null};
      }catch(_){}
    }
    return {v:1,hope:2,maxHope:6,stress:0,maxStress:7,hp:0,maxHP:6,revision:0,source:'fallback',messageId:0};
  }

  function syncLabel(text,mode='ok'){
    const label=document.querySelector('#characterSheet .live-resource-board .pro-board-title small');
    if(label&&label.textContent!==text)label.textContent=text;
    if(label)label.dataset.syncMode=mode;
  }

  function applyRemote(remote){
    const api=window.GreywakeResources,current=localState();
    if(!api||!current||!validRemote(remote)||sameState(current,remote))return;
    applyingRemote=true;
    try{
      if(current.hope!==Number(remote.hope))api.setResource('hope',Number(remote.hope),'Synced from Greywake');
      if(current.stress!==Number(remote.stress))api.setResource('stress',Number(remote.stress),'Synced from Greywake');
      if(current.hp!==Number(remote.hp))api.setResource('hp',Number(remote.hp),'Synced from Greywake');
    }finally{applyingRemote=false;}
  }

  async function pull({initial=false}={}){
    if(!isMarek()||!window.GreywakeResources)return;
    if(pushPending&&!isPreview()){
      await push('Reconnect pending state');
      if(pushPending)return;
    }
    try{
      const bundle=await request('GET');
      const remote=parseLatest(bundle);
      if(!remote)throw new Error('Marek resource state is missing from Greywake.');
      lastRemoteState=remote;
      remoteRevision=Math.max(remoteRevision,Number(remote.revision)||0);
      const local=localState();
      const untouchedServer=remote.source==='initial_import'&&Number(remote.revision)<=1;
      if(initial&&!isPreview()&&untouchedServer&&local&&!sameState(local,remote)){
        lastServerMessageId=Number(remote.messageId)||0;
        await push('First cross-device sync','local_migration');
        return;
      }
      if(!testingPreview&&(Number(remote.messageId)>lastServerMessageId||isPreview())){
        applyRemote(remote);
        lastServerMessageId=Number(remote.messageId)||lastServerMessageId;
      }
      applyReadOnly();
    }catch(error){
      syncLabel('Local state · sync will retry','error');
      console.warn('Greywake resource sync pull failed:',error);
    }
  }

  async function push(reason='Resource update',source='client'){
    if(!isMarek()||isPreview()||applyingRemote)return;
    const state=localState();if(!state)return;
    try{
      if(!systemGoalId){
        const remote=parseLatest(await request('GET'));
        if(!remote||!systemGoalId)throw new Error('Marek resource sync thread is unavailable.');
        remoteRevision=Math.max(remoteRevision,Number(remote.revision)||0);
        lastServerMessageId=Math.max(lastServerMessageId,Number(remote.messageId)||0);
      }
      const payload={v:1,...state,revision:remoteRevision+1,source,reason:String(reason||'Resource update').slice(0,120),client:clientId(),at:new Date().toISOString()};
      const result=await request('POST',{goal_id:systemGoalId,message:JSON.stringify(payload),kind:'reply'});
      remoteRevision=payload.revision;
      lastRemoteState={...payload,messageId:Number(result?.message?.id)||lastServerMessageId};
      if(result?.message?.id)lastServerMessageId=Number(result.message.id);
      pushPending=false;
      syncLabel('Synced across devices','ok');
    }catch(error){
      pushPending=true;
      syncLabel('Local change waiting to sync','error');
      console.warn('Greywake resource sync push failed:',error);
    }
  }

  function schedulePush(event){
    if(applyingRemote||isPreview()||!isMarek())return;
    pushPending=true;clearTimeout(pushTimer);
    pushTimer=setTimeout(()=>push(event?.detail?.reason||'Resource update'),450);
  }

  const READONLY_SELECTOR=[
    '#characterSheet .live-resource-board button:not([data-resource-test-toggle])',
    '#characterSheet .resource-action-use button',
    '#characterSheet #beastformControl button',
    '#characterSheet #beastformControl input',
    '#characterSheet #beastformControl select',
    '#beastformDialog .beastform-option',
    '#beastformDialog input',
    '#beastformDialog select',
    '#characterSheet .action-roller [data-roll-action]',
    '#characterSheet .action-roller [data-roll-experience]',
    '#characterSheet .action-roller [data-roll-mode]',
    '#characterSheet .action-roller [data-roll-modifier]',
    '#characterSheet .action-roller [data-roll-difficulty]',
    '#characterSheet [data-roll-damage]'
  ].join(',');

  function ensureTestToggle(){
    const title=document.querySelector('#characterSheet .live-resource-board .pro-board-title');
    if(!title||!isPreview()){document.querySelector('[data-resource-test-toggle]')?.remove();return;}
    let button=title.querySelector('[data-resource-test-toggle]');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.dataset.resourceTestToggle='true';
      button.style.cssText='margin-left:auto;padding:.3rem .5rem;border:1px solid currentColor;background:transparent;color:inherit;font:inherit;cursor:pointer';
      title.appendChild(button);
      button.addEventListener('click',()=>{
        if(testingPreview&&lastRemoteState)applyRemote(lastRemoteState);
        testingPreview=!testingPreview;
        applyReadOnly();
      });
    }
    button.disabled=false;
    button.textContent=testingPreview?'End testing':'Enable testing';
  }

  function applyReadOnly(){
    const readonly=isReadOnly();
    document.body.classList.toggle('resource-sync-readonly',readonly);
    document.querySelectorAll(READONLY_SELECTOR).forEach(node=>{
      if(readonly){if(!node.disabled)node.dataset.syncDisabled='true';node.disabled=true;}
      else if(node.dataset.syncDisabled==='true'){node.disabled=false;delete node.dataset.syncDisabled;}
    });
    ensureTestToggle();
    if(isPreview())syncLabel(testingPreview?'GM TEST MODE · local only':'GM preview · live synced state · read only',testingPreview?'test':'readonly');
    else syncLabel('Synced across devices','ok');
  }

  function startPolling(){
    clearInterval(pollTimer);
    pollTimer=setInterval(()=>{if(document.visibilityState==='visible'&&isMarek())pull();},POLL_MS);
  }

  async function init(){
    if(!isMarek())return;
    if(!window.GreywakeResources){setTimeout(init,120);return;}
    applyReadOnly();startPolling();await pull({initial:true});initialized=true;
  }

  function refreshControls(){if(isMarek())requestAnimationFrame(applyReadOnly);}

  window.addEventListener('greywake:resources-changed',event=>{schedulePush(event);refreshControls();});
  window.addEventListener('greywake:sheet-enhanced',refreshControls);
  window.addEventListener('hashchange',refreshControls);
  window.addEventListener('greywake:player-ready',()=>{
    if(testingPreview&&lastRemoteState)applyRemote(lastRemoteState);
    testingPreview=false;systemGoalId=null;lastServerMessageId=0;remoteRevision=0;pushPending=false;initialized=false;
    clearInterval(pollTimer);
    if(isMarek())setTimeout(init,160);
  });
  window.addEventListener('focus',()=>{if(initialized&&isMarek())pull();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&initialized&&isMarek())pull();});
  document.addEventListener('DOMContentLoaded',()=>{if(window.GreywakePlayer&&isMarek())setTimeout(init,160);});
})();
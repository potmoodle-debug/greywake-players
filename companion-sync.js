(() => {
  const API_URL='https://tmqxxgzqiccclcjagdsh.supabase.co/functions/v1/player-goals?include_system=1';
  const API_KEY='sb_publishable_zML4qGtgQgMALEXFJn501w_1imfz8wl';
  const SYSTEM_KIND='system_resource_state';
  const POLL_MS=5000;
  let activeKey=null,systemGoalId=null,lastServerMessageId=0,remoteRevision=0,applying=false,pushPending=false,pushTimer=null,pollTimer=null,initialized=false;

  function key(){const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return['odie','velmira'].includes(k)?k:null;}
  function isPreview(){return document.body.dataset.gmPreview==='true';}
  function identity(){const user=window.GreywakePlayer,character=key(),code=String(user?.code||character||'').toUpperCase();return{character,code};}
  async function request(method='GET',body=null){const auth=identity();if(!auth.character||!auth.code)throw new Error('Greywake sync identity is unavailable.');const res=await fetch(API_URL,{method,headers:{apikey:API_KEY,'Content-Type':'application/json','x-greywake-character':auth.character,'x-greywake-code':auth.code},body:body?JSON.stringify(body):undefined});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||'Greywake live state could not sync.');return data;}

  function localState(){const s=window.GreywakeCompanion?.getState?.();if(!s)return null;return{hope:Number(s.hope),maxHope:Number(s.maxHope),stress:Number(s.stress),maxStress:Number(s.maxStress),hp:Number(s.hp),maxHP:Number(s.maxHP),effects:s.effects||{},strangePattern:Number(s.strangePattern||1),damage:window.GreywakeDamage?.getState?.()||null};}
  function valid(v){if(!v||Number(v.v)!==1)return false;return[['hope','maxHope'],['stress','maxStress'],['hp','maxHP']].every(([a,b])=>Number.isInteger(Number(v[a]))&&Number.isInteger(Number(v[b]))&&Number(v[b])>0&&Number(v[a])>=0&&Number(v[a])<=Number(v[b]));}
  function sameResources(a,b){return a&&b&&['hope','maxHope','stress','maxStress','hp','maxHP','strangePattern'].every(k=>Number(a[k]||0)===Number(b[k]||0))&&JSON.stringify(a.effects||{})===JSON.stringify(b.effects||{});}
  function same(a,b){return sameResources(a,b)&&JSON.stringify(a?.damage||null)===JSON.stringify(b?.damage||null);}
  function parseLatest(bundle){const goals=Array.isArray(bundle?.goals)?bundle.goals:[],messages=Array.isArray(bundle?.messages)?bundle.messages:[];const g=goals.find(x=>x?.character_slug===activeKey&&x?.source_kind===SYSTEM_KIND&&x?.source_key===activeKey);if(!g)return null;systemGoalId=Number(g.id);const candidates=messages.filter(m=>Number(m.goal_id)===systemGoalId).sort((a,b)=>Number(b.id)-Number(a.id));for(const m of candidates){try{const p=JSON.parse(m.message_text);if(valid(p))return{...p,messageId:Number(m.id),createdAt:m.created_at||null};}catch(_){}}return null;}
  function syncLabel(text,mode='ok'){const n=document.querySelector('#characterSheet .live-resource-board .pro-board-title small');if(n){n.textContent=text;n.dataset.syncMode=mode;}}
  function applyRemote(remote){const companion=window.GreywakeCompanion,current=localState();if(!companion||!current||!valid(remote)||same(current,remote))return;applying=true;try{if(!sameResources(current,remote))companion.importState(remote);if(remote.damage)window.GreywakeDamage?.importState?.(remote.damage);}finally{applying=false;}}

  async function pull({initial=false}={}){
    if(!activeKey||!window.GreywakeCompanion)return;
    if(pushPending&&!isPreview()){await push('Reconnect pending state');if(pushPending)return;}
    try{const bundle=await request('GET'),remote=parseLatest(bundle);if(!remote)throw new Error('Resource sync record missing.');remoteRevision=Math.max(remoteRevision,Number(remote.revision)||0);const local=localState(),untouched=remote.source==='initial_import'&&Number(remote.revision)<=1;if(initial&&!isPreview()&&untouched&&local&&!same(local,remote)){lastServerMessageId=Number(remote.messageId)||0;await push('First cross-device sync','local_migration');return;}if(Number(remote.messageId)>lastServerMessageId||initial){applyRemote(remote);lastServerMessageId=Number(remote.messageId)||lastServerMessageId;}syncLabel(isPreview()?'GM preview · local test · not synced':'Synced across devices','ok');}catch(error){syncLabel('Local state · sync will retry','error');console.warn('Greywake companion sync pull failed:',error);}
  }
  async function push(reason='Resource update',source='client'){
    if(!activeKey||isPreview()||applying)return;const s=localState();if(!s)return;
    try{if(!systemGoalId){const remote=parseLatest(await request('GET'));if(!remote||!systemGoalId)throw new Error('Resource sync record unavailable.');remoteRevision=Math.max(remoteRevision,Number(remote.revision)||0);lastServerMessageId=Math.max(lastServerMessageId,Number(remote.messageId)||0);}const payload={v:1,...s,revision:remoteRevision+1,source,reason:String(reason||'Resource update').slice(0,120),at:new Date().toISOString()};const result=await request('POST',{goal_id:systemGoalId,message:JSON.stringify(payload),kind:'reply'});remoteRevision=payload.revision;if(result?.message?.id)lastServerMessageId=Number(result.message.id);pushPending=false;syncLabel('Synced across devices','ok');}catch(error){pushPending=true;syncLabel('Local change waiting to sync','error');console.warn('Greywake companion sync push failed:',error);}
  }
  function schedulePush(event){if(applying||isPreview()||!activeKey)return;pushPending=true;clearTimeout(pushTimer);pushTimer=setTimeout(()=>push(event?.detail?.reason||'Resource update'),450);}
  function stopPolling(){clearInterval(pollTimer);pollTimer=null;}
  function startPolling(){stopPolling();if(isPreview())return;pollTimer=setInterval(()=>{if(document.visibilityState==='visible'&&activeKey&&!isPreview())pull();},POLL_MS);}
  async function init(){const k=key();if(!k){activeKey=null;stopPolling();return;}if(activeKey!==k){activeKey=k;systemGoalId=null;lastServerMessageId=0;remoteRevision=0;pushPending=false;initialized=false;}if(!window.GreywakeCompanion||window.GreywakeCompanion.key!==k){setTimeout(init,120);return;}stopPolling();await pull({initial:true});if(!isPreview())startPolling();initialized=true;}

  window.addEventListener('greywake:companion-resources-changed',schedulePush);
  window.addEventListener('greywake:damage-changed',schedulePush);
  window.addEventListener('greywake:player-ready',()=>setTimeout(init,180));
  window.addEventListener('focus',()=>{if(initialized&&activeKey&&!isPreview())pull();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&initialized&&activeKey&&!isPreview())pull();});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,220));
})();
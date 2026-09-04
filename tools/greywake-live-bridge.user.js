// ==UserScript==
// @name         Greywake Live Session Bridge
// @namespace    greywake
// @version      0.4.0
// @description  Routes UPDATE GREYWAKE from a designated live-session chat to a designated updater chat, then reports the updater result back to Greywake.
// @match        https://chatgpt.com/*
// @match        https://potmoodle-debug.github.io/greywake-players/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_openInTab
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  const REGISTRY_KEY='greywake-live-bridge-registry-v1';
  const ROLES_KEY='greywake-live-bridge-roles-v1';
  const QUEUE_KEY='greywake-live-bridge-update-queue-v1';
  const STATUS_KEY='greywake-live-bridge-status-v1';
  const RESULT_KEY='greywake-live-bridge-last-result-v1';
  const MAX_CHATS=8;
  const isChatGPT=location.hostname==='chatgpt.com';
  const isGreywake=location.hostname==='potmoodle-debug.github.io'&&location.pathname.startsWith('/greywake-players');
  let routedPress=false,restoreTimer=null;

  const now=()=>new Date().toISOString();
  const clean=v=>String(v||'').replace(/\s+$/g,'').trim();
  const readObject=(key,fallback={})=>{const v=GM_getValue(key,fallback);return v&&typeof v==='object'&&!Array.isArray(v)?v:fallback};
  const readArray=(key)=>{const v=GM_getValue(key,[]);return Array.isArray(v)?v:[]};
  const conversationKey=()=>{const m=location.pathname.match(/\/c\/([^/?#]+)/);return m?m[1]:`page:${location.pathname}`};
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};

  function collectMessages(){
    const nodes=[...document.querySelectorAll('[data-message-author-role]')];
    return nodes.map((node,index)=>{
      const role=node.getAttribute('data-message-author-role')||'unknown';
      if(role!=='user'&&role!=='assistant')return null;
      const body=node.querySelector('.markdown,.prose')||node;
      const text=clean(body.innerText||body.textContent||'');
      return text?{index,role,text}:null;
    }).filter(Boolean);
  }

  function snapshot(){
    if(!isChatGPT)return;
    const messages=collectMessages();
    if(!messages.length)return;
    const key=conversationKey(),registry=readObject(REGISTRY_KEY,{});
    const signature=hash(messages.map(m=>`${m.role}:${m.text}`).join('\n\u241e\n'));
    const previous=registry[key],changed=!previous||previous.signature!==signature;
    registry[key]={key,title:document.title.replace(/\s*[-–—]\s*ChatGPT\s*$/i,'').trim()||'ChatGPT conversation',url:location.href,messageCount:messages.length,messages,signature,seenAt:now(),changedAt:changed?now():(previous.changedAt||now())};
    const keep=Object.values(registry).sort((a,b)=>new Date(b.changedAt)-new Date(a.changedAt)).slice(0,MAX_CHATS);
    GM_setValue(REGISTRY_KEY,Object.fromEntries(keep.map(x=>[x.key,x])));
  }

  function transcript(chat){return(chat?.messages||[]).map(m=>`${String(m.role||'unknown').toUpperCase()}: ${m.text}`).join('\n\n')}
  function updaterPrompt(source){
    return [
      'UPDATE GREYWAKE — LIVE SESSION HANDOFF','',
      'Use the current Greywake project files, connected Greywake tools, and the live-session transcript below as your source material.',
      'Treat the current Greywake Canon Status Quo Register as the highest Greywake setting authority.','',
      'This request came from the separate live-play chat. Do not write anything back into that live-play chat.','',
      'Chris does NOT need to label or categorise session facts. You must classify them yourself from the transcript, established canon and player knowledge boundaries.','Classify each justified change as appropriate: immediate player-safe reveal, persistent player knowledge, DM/world/canon state, NPC/faction consequence, unresolved consequence, or a decision genuinely requiring Chris.','Do not ask Chris to choose a category. Only queue something for Chris when the underlying truth, motive, contradiction or creative canon decision is genuinely unresolved.','',
      'Review only what has changed since the last justified Greywake update and APPLY available writes directly.',
      'Update relevant available destinations including Obsidian through the existing Greywake workflow, DM-facing site/repository, player-facing content with strict knowledge boundaries, connected campaign state where appropriate, canon/world state, NPC/faction state, unresolved consequences, access, rumours, promises, debts, evidence and player knowledge.','',
      'For player-facing information: if the transcript clearly establishes that a character or the party learned/witnessed something, update the appropriate persistent player knowledge automatically. Use the live Recent Reveals feed only when the information is an immediate at-the-table reveal that belongs in that activity feed; durable knowledge/world updates do not need a Recent Reveals entry.','',
      'Rules:',
      '- Preserve established canon and unresolved mysteries.',
      '- Do not invent events, motives, witnesses or knowledge.',
      '- Separate confirmed facts from inference, suggestions and unknowns.',
      '- Only facts established in play or explicitly approved by Chris become permanent canon.',
      '- Apply direct logical consequences only when no new creative decision is required.',
      '- Never leak DM-only information into player-facing material.',
      '- Only update a character knowledge state when the transcript supports that they learned or witnessed it.',
      '- If something requires Chris to choose an unresolved truth, motive, contradiction or major canon question, leave it unresolved and queue it.',
      '- Do not stop for approval unless a required write cannot be completed safely without clarification.',
      '- If one destination fails, continue with the others and report the failure.','',
      `LIVE SOURCE CHAT: ${source?.title||'Unknown'}`,
      `SOURCE URL: ${source?.url||'Unknown'}`,
      `TRANSCRIPT CHANGE TIME: ${source?.changedAt||'Unknown'}`,
      `MESSAGES CAPTURED: ${source?.messageCount||0}`,'',
      'LIVE SESSION TRANSCRIPT:',transcript(source)||'[No transcript captured]','',
      'At the end give exactly these three headings with concise bullet lists and no extra headings:','WHAT WAS UPDATED','WHAT COULD NOT BE UPDATED','DECISIONS QUEUED FOR CHRIS LATER'
    ].join('\n');
  }

  function rolesWithChats(){
    const roles=readObject(ROLES_KEY,{liveKey:'',updaterKey:''}),registry=readObject(REGISTRY_KEY,{});
    return{...roles,live:registry[roles.liveKey]||null,updater:registry[roles.updaterKey]||null};
  }

  function setRole(role,key){
    const roles=readObject(ROLES_KEY,{liveKey:'',updaterKey:''});
    if(role==='live')roles.liveKey=roles.liveKey===key?'':(key||'');
    if(role==='updater')roles.updaterKey=roles.updaterKey===key?'':(key||'');
    GM_setValue(ROLES_KEY,roles);
  }

  function setStatus(status){
    GM_setValue(STATUS_KEY,status);
    if(isGreywake){window.dispatchEvent(new CustomEvent('greywake:live-bridge-status',{detail:status}));updateButton(status)}
  }

  function queueUpdate(){
    const r=rolesWithChats();
    if(!r.live||!r.updater||!r.liveKey||!r.updaterKey||r.liveKey===r.updaterKey){setStatus({state:'blocked',at:now(),message:'Set two different chats: LIVE SESSION and UPDATER.'});return false}
    const queue=readArray(QUEUE_KEY);
    const duplicate=queue.slice().reverse().find(x=>x.targetKey===r.updaterKey&&x.sourceKey===r.liveKey&&x.sourceSignature===r.live.signature&&['pending','processing','sent','accepted','completed'].includes(x.state));
    if(duplicate){setStatus({state:'duplicate',at:now(),id:duplicate.id,sourceTitle:r.live.title,targetTitle:r.updater.title,message:'Already sent this exact live transcript. No duplicate queued.'});return false}
    const id=`gwupd-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    queue.push({id,targetKey:r.updaterKey,sourceKey:r.liveKey,sourceSignature:r.live.signature,createdAt:now(),state:'pending',prompt:updaterPrompt(r.live)});
    GM_setValue(QUEUE_KEY,queue.slice(-10));
    setStatus({state:'queued',at:now(),id,sourceTitle:r.live.title,targetTitle:r.updater.title,message:`Queued: ${r.live.title} → ${r.updater.title}`});
    const updaterSeen=new Date(r.updater.seenAt||0).getTime();
    if(!updaterSeen||Date.now()-updaterSeen>12000){try{GM_openInTab(r.updater.url,{active:false,insert:true,setParent:true})}catch{}}
    return true;
  }

  function composer(){return document.querySelector('#prompt-textarea,[contenteditable="true"][data-virtualkeyboard],main [contenteditable="true"]')}
  function sendButton(){return document.querySelector('button[data-testid="send-button"],button[aria-label="Send prompt"],button[aria-label="Send"]')}
  function fillComposer(el,text){el.focus();if(el.tagName==='TEXTAREA'){el.value=text;el.dispatchEvent(new Event('input',{bubbles:true}));return true}try{document.execCommand('selectAll',false,null);document.execCommand('insertText',false,text)}catch{}if(!clean(el.innerText||el.textContent||'')){el.textContent=text;el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:text}))}return clean(el.innerText||el.textContent||'').length>0}

  async function processQueue(){
    if(!isChatGPT)return;
    const key=conversationKey(),roles=rolesWithChats();if(key!==roles.updaterKey)return;
    const queue=readArray(QUEUE_KEY),item=queue.find(x=>x.targetKey===key&&x.state==='pending');if(!item)return;
    const el=composer();if(!el)return;
    item.state='processing';item.processingAt=now();GM_setValue(QUEUE_KEY,queue);
    setStatus({state:'processing',at:now(),id:item.id,sourceTitle:roles.live?.title||'',targetTitle:roles.updater?.title||'',message:'Sending update to designated updater chat…'});
    if(!fillComposer(el,item.prompt)){item.state='pending';GM_setValue(QUEUE_KEY,queue);return}
    await new Promise(r=>setTimeout(r,250));const btn=sendButton();if(!btn||btn.disabled){item.state='pending';GM_setValue(QUEUE_KEY,queue);return}
    btn.click();item.state='sent';item.sentAt=now();GM_setValue(QUEUE_KEY,queue);
    setStatus({state:'sent',at:now(),id:item.id,sourceTitle:roles.live?.title||'',targetTitle:roles.updater?.title||'',message:'Prompt sent to designated updater chat.'});
  }

  function captureUpdaterResult(){
    if(!isChatGPT)return;
    const key=conversationKey(),roles=rolesWithChats();if(key!==roles.updaterKey)return;
    const messages=collectMessages(),queue=readArray(QUEUE_KEY);
    const item=queue.slice().reverse().find(x=>x.targetKey===key&&['sent','accepted'].includes(x.state));if(!item)return;
    const handoff=messages.slice().reverse().find(m=>m.role==='user'&&m.text.startsWith('UPDATE GREYWAKE — LIVE SESSION HANDOFF'));
    if(!handoff)return;
    if(item.state==='sent'){item.state='accepted';item.acceptedAt=now();item.handoffIndex=handoff.index;GM_setValue(QUEUE_KEY,queue);setStatus({state:'accepted',at:now(),id:item.id,sourceTitle:roles.live?.title||'',targetTitle:roles.updater?.title||'',message:'Updater chat accepted the prompt.'})}
    const assistant=messages.find(m=>m.role==='assistant'&&m.index>handoff.index);if(!assistant)return;
    const sig=hash(assistant.text),t=Date.now();
    if(item.resultCandidateSignature!==sig){item.resultCandidateSignature=sig;item.resultCandidateAt=t;GM_setValue(QUEUE_KEY,queue);return}
    if(t-Number(item.resultCandidateAt||t)<2500)return;
    item.state='completed';item.completedAt=now();item.resultText=assistant.text;GM_setValue(QUEUE_KEY,queue);
    const result={id:item.id,at:item.completedAt,sourceTitle:roles.live?.title||'',targetTitle:roles.updater?.title||'',text:assistant.text};
    GM_setValue(RESULT_KEY,result);
    setStatus({state:'completed',at:now(),id:item.id,sourceTitle:result.sourceTitle,targetTitle:result.targetTitle,message:'Updater finished. Result available on Greywake UPDATE.'});
  }

  function updateControls(){return [...document.querySelectorAll('button,a,[role="button"]')].filter(el=>{const original=el.dataset?.greywakeUpdateOriginal,label=clean(el.textContent).toUpperCase();return original==='1'||label==='UPDATE GREYWAKE'||['QUEUED…','SENDING…','SENT ✓','ALREADY SENT ✓','DONE ✓'].includes(label)})}
  function updateButton(status=GM_getValue(STATUS_KEY,{})){
    if(!isGreywake)return;if(restoreTimer){clearTimeout(restoreTimer);restoreTimer=null}
    const controls=updateControls();controls.forEach(el=>{if(el.dataset)el.dataset.greywakeUpdateOriginal='1'});
    const state=status?.state||'';let text='UPDATE GREYWAKE',disabled=false,restore=0;
    if(state==='queued'){text='QUEUED…';disabled=true}else if(state==='processing'){text='SENDING…';disabled=true}else if(state==='sent'||state==='accepted'){text='SENT ✓';disabled=true;restore=4500}else if(state==='completed'){text='DONE ✓';disabled=true;restore=5000}else if(state==='duplicate'){text='ALREADY SENT ✓';disabled=true;restore=3000}
    controls.forEach(el=>{el.textContent=text;if('disabled'in el)el.disabled=disabled;el.setAttribute('aria-disabled',disabled?'true':'false')});
    if(restore)restoreTimer=setTimeout(()=>{updateControls().forEach(el=>{el.textContent='UPDATE GREYWAKE';if('disabled'in el)el.disabled=false;el.setAttribute('aria-disabled','false')})},restore)
  }

  if(isChatGPT){
    let snapTimer=null;const scheduleSnapshot=()=>{clearTimeout(snapTimer);snapTimer=setTimeout(snapshot,350)};
    const start=()=>{new MutationObserver(scheduleSnapshot).observe(document.documentElement,{subtree:true,childList:true,characterData:true});setInterval(snapshot,4000);setInterval(processQueue,1200);setInterval(captureUpdaterResult,1200);setTimeout(snapshot,900);setTimeout(processQueue,1500)};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  }

  if(isGreywake){
    const isUpdateControl=target=>{const el=target?.closest?.('button,a,[role="button"]');if(!el)return null;const original=el.dataset?.greywakeUpdateOriginal,label=clean(el.textContent).toUpperCase();return original==='1'||label==='UPDATE GREYWAKE'?el:null};
    const swallow=e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()};
    const routePress=e=>{if(!isUpdateControl(e.target))return;swallow(e);if(routedPress)return;routedPress=true;queueUpdate();setTimeout(()=>{routedPress=false},700)};
    ['pointerdown','mousedown','touchstart','click'].forEach(type=>{window.addEventListener(type,routePress,true);document.addEventListener(type,routePress,true)});
    window.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&isUpdateControl(document.activeElement))routePress(e)},true);

    const startSite=()=>{
      if(!document.querySelector('script[data-greywake-live-bridge-test]')){const script=document.createElement('script');script.src='https://potmoodle-debug.github.io/greywake-players/gm-live-bridge-test.js?v=bridge6';script.defer=true;script.dataset.greywakeLiveBridgeTest='true';document.head.appendChild(script)}
      window.addEventListener('greywake:live-bridge-request',event=>{const requestId=event.detail?.requestId||'',chats=Object.values(readObject(REGISTRY_KEY,{})).sort((a,b)=>new Date(b.changedAt)-new Date(a.changedAt));window.dispatchEvent(new CustomEvent('greywake:live-bridge-response',{detail:{requestId,ok:true,chats,roles:rolesWithChats(),status:GM_getValue(STATUS_KEY,{}),result:GM_getValue(RESULT_KEY,{})}}))});
      window.addEventListener('greywake:live-bridge-set-role',event=>{setRole(event.detail?.role,event.detail?.key);window.dispatchEvent(new CustomEvent('greywake:live-bridge-role-set',{detail:{roles:rolesWithChats()}}))});
      GM_addValueChangeListener?.(STATUS_KEY,(_key,_old,value)=>{if(value){window.dispatchEvent(new CustomEvent('greywake:live-bridge-status',{detail:value}));updateButton(value)}});
      GM_addValueChangeListener?.(RESULT_KEY,(_key,_old,value)=>{if(value)window.dispatchEvent(new CustomEvent('greywake:live-bridge-result',{detail:value}))});
      window.dispatchEvent(new CustomEvent('greywake:live-bridge-ready',{detail:{version:'0.4.0',roles:rolesWithChats()}}));setTimeout(()=>updateButton(GM_getValue(STATUS_KEY,{})),500);
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startSite,{once:true});else startSite();
  }
})();

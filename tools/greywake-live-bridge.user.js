// ==UserScript==
// @name         Greywake Live Session Bridge
// @namespace    greywake
// @version      0.2.1
// @description  Routes UPDATE GREYWAKE from a designated live-session chat to a designated updater chat. Live chat is transcript-source only.
// @match        https://chatgpt.com/*
// @match        https://potmoodle-debug.github.io/greywake-players/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_openInTab
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  const REGISTRY_KEY='greywake-live-bridge-registry-v1';
  const ROLES_KEY='greywake-live-bridge-roles-v1';
  const QUEUE_KEY='greywake-live-bridge-update-queue-v1';
  const STATUS_KEY='greywake-live-bridge-status-v1';
  const MAX_CHATS=8;
  const isChatGPT=location.hostname==='chatgpt.com';
  const isGreywake=location.hostname==='potmoodle-debug.github.io'&&location.pathname.startsWith('/greywake-players');
  let routedPress=false;

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
      'Review only what has changed since the last justified Greywake update and APPLY available writes directly.',
      'Update relevant available destinations including Obsidian through the existing Greywake workflow, DM-facing site/repository, player-facing content with strict knowledge boundaries, connected campaign state where appropriate, canon/world state, NPC/faction state, unresolved consequences, access, rumours, promises, debts, evidence and player knowledge.','',
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
      'At the end give only:','1. What was updated','2. What could not be updated','3. Decisions queued for Chris later'
    ].join('\n');
  }

  function rolesWithChats(){
    const roles=readObject(ROLES_KEY,{liveKey:'',updaterKey:''}),registry=readObject(REGISTRY_KEY,{});
    return{...roles,live:registry[roles.liveKey]||null,updater:registry[roles.updaterKey]||null};
  }

  function setRole(role,key){
    const roles=readObject(ROLES_KEY,{liveKey:'',updaterKey:''});
    if(role==='live')roles.liveKey=key||'';
    if(role==='updater')roles.updaterKey=key||'';
    GM_setValue(ROLES_KEY,roles);
  }

  function queueUpdate(){
    const r=rolesWithChats();
    if(!r.live||!r.updater||!r.liveKey||!r.updaterKey||r.liveKey===r.updaterKey){
      const status={state:'blocked',at:now(),message:'Set two different chats: LIVE SESSION and UPDATER.'};
      GM_setValue(STATUS_KEY,status);
      if(isGreywake)window.dispatchEvent(new CustomEvent('greywake:live-bridge-status',{detail:status}));
      return false;
    }
    const queue=readArray(QUEUE_KEY),id=`gwupd-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    queue.push({id,targetKey:r.updaterKey,sourceKey:r.liveKey,createdAt:now(),state:'pending',prompt:updaterPrompt(r.live)});
    GM_setValue(QUEUE_KEY,queue.slice(-10));
    const status={state:'queued',at:now(),id,message:`Queued from ${r.live.title} to ${r.updater.title}.`};
    GM_setValue(STATUS_KEY,status);
    if(isGreywake)window.dispatchEvent(new CustomEvent('greywake:live-bridge-status',{detail:status}));
    const updaterSeen=new Date(r.updater.seenAt||0).getTime();
    if(!updaterSeen||Date.now()-updaterSeen>12000){try{GM_openInTab(r.updater.url,{active:false,insert:true,setParent:true})}catch{}}
    return true;
  }

  function composer(){return document.querySelector('#prompt-textarea,[contenteditable="true"][data-virtualkeyboard],main [contenteditable="true"]')}
  function sendButton(){return document.querySelector('button[data-testid="send-button"],button[aria-label="Send prompt"],button[aria-label="Send"]')}
  function fillComposer(el,text){
    el.focus();
    if(el.tagName==='TEXTAREA'){el.value=text;el.dispatchEvent(new Event('input',{bubbles:true}));return true}
    try{document.execCommand('selectAll',false,null);document.execCommand('insertText',false,text)}catch{}
    if(!clean(el.innerText||el.textContent||'')){el.textContent=text;el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:text}))}
    return clean(el.innerText||el.textContent||'').length>0;
  }

  async function processQueue(){
    if(!isChatGPT)return;
    const key=conversationKey(),roles=rolesWithChats();
    if(key!==roles.updaterKey)return;
    const queue=readArray(QUEUE_KEY),item=queue.find(x=>x.targetKey===key&&x.state==='pending');
    if(!item)return;
    const el=composer();if(!el)return;
    item.state='processing';item.processingAt=now();GM_setValue(QUEUE_KEY,queue);
    if(!fillComposer(el,item.prompt)){item.state='pending';GM_setValue(QUEUE_KEY,queue);return}
    await new Promise(r=>setTimeout(r,250));
    const btn=sendButton();
    if(!btn||btn.disabled){item.state='pending';GM_setValue(QUEUE_KEY,queue);return}
    btn.click();item.state='sent';item.sentAt=now();GM_setValue(QUEUE_KEY,queue);
    GM_setValue(STATUS_KEY,{state:'sent',at:now(),id:item.id,message:'Update prompt sent only to the designated updater chat.'});
  }

  if(isChatGPT){
    let snapTimer=null;
    const scheduleSnapshot=()=>{clearTimeout(snapTimer);snapTimer=setTimeout(snapshot,350)};
    const start=()=>{new MutationObserver(scheduleSnapshot).observe(document.documentElement,{subtree:true,childList:true,characterData:true});setInterval(snapshot,4000);setInterval(processQueue,1200);setTimeout(snapshot,900);setTimeout(processQueue,1500)};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  }

  if(isGreywake){
    const isUpdateControl=target=>{
      const el=target?.closest?.('button,a,[role="button"]');
      if(!el)return null;
      const label=clean(el.textContent).toUpperCase();
      return label==='UPDATE GREYWAKE'?el:null;
    };
    const swallow=e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()};
    const routePress=e=>{
      if(!isUpdateControl(e.target))return;
      swallow(e);
      if(routedPress)return;
      routedPress=true;
      queueUpdate();
      setTimeout(()=>{routedPress=false},700);
    };
    ['pointerdown','mousedown','touchstart','click'].forEach(type=>{
      window.addEventListener(type,routePress,true);
      document.addEventListener(type,routePress,true);
    });
    window.addEventListener('keydown',e=>{
      if((e.key==='Enter'||e.key===' ')&&isUpdateControl(document.activeElement))routePress(e);
    },true);

    const startSite=()=>{
      if(!document.querySelector('script[data-greywake-live-bridge-test]')){const script=document.createElement('script');script.src='https://potmoodle-debug.github.io/greywake-players/gm-live-bridge-test.js?v=bridge3';script.defer=true;script.dataset.greywakeLiveBridgeTest='true';document.head.appendChild(script)}
      window.addEventListener('greywake:live-bridge-request',event=>{const requestId=event.detail?.requestId||'',chats=Object.values(readObject(REGISTRY_KEY,{})).sort((a,b)=>new Date(b.changedAt)-new Date(a.changedAt));window.dispatchEvent(new CustomEvent('greywake:live-bridge-response',{detail:{requestId,ok:true,chats,roles:rolesWithChats(),status:GM_getValue(STATUS_KEY,{})}}))});
      window.addEventListener('greywake:live-bridge-set-role',event=>{setRole(event.detail?.role,event.detail?.key);window.dispatchEvent(new CustomEvent('greywake:live-bridge-role-set',{detail:{roles:rolesWithChats()}}))});
      window.dispatchEvent(new CustomEvent('greywake:live-bridge-ready',{detail:{version:'0.2.1',roles:rolesWithChats()}}));
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startSite,{once:true});else startSite();
  }
})();

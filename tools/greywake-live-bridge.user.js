// ==UserScript==
// @name         Greywake Live Session Bridge (TEST)
// @namespace    greywake
// @version      0.1.0
// @description  TEST ONLY: snapshots ChatGPT conversations for the Greywake dry-run updater bridge. Does not send messages or update canon/player state.
// @match        https://chatgpt.com/*
// @match        https://potmoodle-debug.github.io/greywake-players/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';
  const REGISTRY_KEY='greywake-live-bridge-registry-v1';
  const MAX_CHATS=8;
  const isChatGPT=location.hostname==='chatgpt.com';
  const isGreywake=location.hostname==='potmoodle-debug.github.io'&&location.pathname.startsWith('/greywake-players');

  const readRegistry=()=>{
    const value=GM_getValue(REGISTRY_KEY,{});
    return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  };
  const writeRegistry=value=>GM_setValue(REGISTRY_KEY,value);
  const conversationKey=()=>{
    const m=location.pathname.match(/\/c\/([^/?#]+)/);
    return m?m[1]:`page:${location.pathname}`;
  };
  const clean=v=>String(v||'').replace(/\s+$/g,'').trim();
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
    const key=conversationKey();
    const registry=readRegistry();
    const signature=hash(messages.map(m=>`${m.role}:${m.text}`).join('\n\u241e\n'));
    const previous=registry[key];
    const changed=!previous||previous.signature!==signature;
    registry[key]={
      key,
      title:document.title.replace(/\s*[-–—]\s*ChatGPT\s*$/i,'').trim()||'ChatGPT conversation',
      url:location.href,
      messageCount:messages.length,
      messages,
      signature,
      seenAt:new Date().toISOString(),
      changedAt:changed?new Date().toISOString():(previous.changedAt||new Date().toISOString())
    };
    const keep=Object.values(registry).sort((a,b)=>new Date(b.changedAt)-new Date(a.changedAt)).slice(0,MAX_CHATS);
    writeRegistry(Object.fromEntries(keep.map(x=>[x.key,x])));
  }

  if(isChatGPT){
    let timer=null;
    const schedule=()=>{clearTimeout(timer);timer=setTimeout(snapshot,350)};
    const observer=new MutationObserver(schedule);
    observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
    setInterval(snapshot,4000);
    setTimeout(snapshot,1000);
  }

  if(isGreywake){
    window.addEventListener('greywake:live-bridge-request',event=>{
      const requestId=event.detail?.requestId||'';
      const chats=Object.values(readRegistry()).sort((a,b)=>new Date(b.changedAt)-new Date(a.changedAt));
      window.dispatchEvent(new CustomEvent('greywake:live-bridge-response',{detail:{requestId,ok:true,chats}}));
    });
    window.dispatchEvent(new CustomEvent('greywake:live-bridge-ready',{detail:{version:'0.1.0'}}));
  }
})();

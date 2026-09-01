(() => {
  function loadRestSystem(){
    if(!document.querySelector('link[data-greywake-rest]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='rest-system.css?v=rest1';link.dataset.greywakeRest='true';document.head.appendChild(link);
    }
    if(window.GreywakeRest||document.querySelector('script[data-greywake-rest-system]'))return;
    const script=document.createElement('script');script.src='rest-system.js?v=rest1';script.async=false;script.dataset.greywakeRestSystem='true';
    script.addEventListener('load',()=>{
      if(document.querySelector('script[data-greywake-rest-sync]'))return;
      const sync=document.createElement('script');sync.src='rest-sync.js?v=rest1';sync.async=false;sync.dataset.greywakeRestSync='true';document.head.appendChild(sync);
    });
    document.head.appendChild(script);
  }
  loadRestSystem();

  let lastKey=null,lastArmor=null,observer=null;
  function key(){return String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();}
  function armor(){const n=[...document.querySelectorAll('#characterSheet .character-stat')].find(x=>x.querySelector('span')?.textContent.trim().toLowerCase()==='armor');const m=String(n?.querySelector('strong')?.textContent||'').match(/\d+/);return m?Number(m[0]):null;}
  function check(){const k=key(),a=armor();if(!['marek','velmira','odie'].includes(k)||a==null)return;if(k!==lastKey||a!==lastArmor){lastKey=k;lastArmor=a;window.GreywakeDamage?.render?.();}}
  function init(){observer?.disconnect();const strip=document.querySelector('#characterSheet .character-stat-strip');if(strip){observer=new MutationObserver(()=>requestAnimationFrame(check));observer.observe(strip,{childList:true,subtree:true,characterData:true});}check();}
  const schedule=()=>setTimeout(init,260);
  window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);window.addEventListener('hashchange',schedule);document.addEventListener('DOMContentLoaded',schedule);
})();
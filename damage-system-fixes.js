(() => {
  let lastKey=null,lastArmor=null,observer=null;
  function key(){return String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();}
  function armor(){const n=[...document.querySelectorAll('#characterSheet .character-stat')].find(x=>x.querySelector('span')?.textContent.trim().toLowerCase()==='armor');const m=String(n?.querySelector('strong')?.textContent||'').match(/\d+/);return m?Number(m[0]):null;}
  function check(){const k=key(),a=armor();if(!['marek','velmira','odie'].includes(k)||a==null)return;if(k!==lastKey||a!==lastArmor){lastKey=k;lastArmor=a;window.GreywakeDamage?.render?.();}}
  function init(){observer?.disconnect();const strip=document.querySelector('#characterSheet .character-stat-strip');if(strip){observer=new MutationObserver(()=>requestAnimationFrame(check));observer.observe(strip,{childList:true,subtree:true,characterData:true});}check();}
  const schedule=()=>setTimeout(init,260);
  window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);window.addEventListener('hashchange',schedule);document.addEventListener('DOMContentLoaded',schedule);
})();
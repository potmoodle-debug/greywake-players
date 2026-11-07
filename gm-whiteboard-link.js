/* Greywake: GM-only entry point to the independent whiteboard. */
(()=>{
 'use strict';
 function ready(){
   const gm=document.body?.dataset.role==='gm'&&document.body?.dataset.gmPreview!=='true';
   document.getElementById('gmWhiteboardNav')?.toggleAttribute('hidden',!gm);
   document.getElementById('gmWhiteboardSidebar')?.toggleAttribute('hidden',!gm);
   if(!gm)return;
   const nav=document.getElementById('primaryNav');
   if(nav&&!document.getElementById('gmWhiteboardNav')){
     const b=document.createElement('button');b.id='gmWhiteboardNav';b.type='button';b.textContent='WHITEBOARD';
     b.title='Open interactive GM whiteboard';b.addEventListener('click',()=>location.href='gm-whiteboard.html');
     nav.appendChild(b);
   }
   const sidebar=document.getElementById('gmSidebarNav');
   if(sidebar&&!document.getElementById('gmWhiteboardSidebar')){
     const container=sidebar.querySelector('.gm-sidebar-links')||sidebar;
     const b=document.createElement('button');b.id='gmWhiteboardSidebar';b.type='button';
     b.innerHTML='<span>WHITEBOARD</span><small>Arrange campaign cards freely</small>';
     b.addEventListener('click',()=>location.href='gm-whiteboard.html');
     container.appendChild(b);
   }
 }
 let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ready()})};
 new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-role','data-gm-preview']});
 document.addEventListener('DOMContentLoaded',schedule);window.addEventListener('hashchange',schedule);schedule();
})();
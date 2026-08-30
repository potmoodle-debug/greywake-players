(() => {
  function closeRestDialog(){
    const dialog=document.getElementById('restDialog');
    if(!dialog)return;
    if(typeof dialog.close==='function'&&dialog.open){
      try{dialog.close();return;}catch(_){}
    }
    dialog.removeAttribute('open');
  }

  document.addEventListener('click',event=>{
    const closeButton=event.target.closest?.('#restDialog [data-close], #restDialog [data-finish-rest]');
    if(!closeButton)return;
    event.preventDefault();
    event.stopPropagation();
    closeRestDialog();
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const dialog=document.getElementById('restDialog');
    if(dialog?.open)closeRestDialog();
  });

  window.GreywakeRestDialog={close:closeRestDialog};
})();

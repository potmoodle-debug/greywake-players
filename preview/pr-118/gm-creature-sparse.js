(() => {
  const SPARSE=['Salt-Spine','Glassback Viper','Bonehook Vulture','Siltmouth Burrower','Sand-Skitter Swarm','White-Eyed Listener','Rattlewing'];
  const DEFAULTS={
    'Salt-Spine':'Established bestiary name; exact appearance, behaviour and mechanics are not yet consolidated.',
    'Glassback Viper':'Established bestiary name; exact appearance, behaviour and mechanics are not yet consolidated.',
    'Bonehook Vulture':'Established scavenger name; keep it distinct from Carrion Kites. Full biology is not yet consolidated.',
    'Siltmouth Burrower':'Established bestiary name; exact appearance, behaviour and mechanics are not yet consolidated.',
    'Sand-Skitter Swarm':'Established ecology name; exact appearance, behaviour and mechanics are not yet consolidated.',
    'White-Eyed Listener':'Established bestiary name; appearance, behaviour, origin and any Tower relationship remain unconsolidated.',
    'Rattlewing':'Established bestiary name; detailed ecology and behaviour remain unconsolidated.'
  };
  function add(){
    const C=window.GREYWAKE_GM_CREATURES;if(!C)return false;
    for(const name of SPARSE){
      if(C[name])continue;
      C[name]={
        type:'Fauna · sparse canon',
        status:'Established · DM only · details sparse',
        habitat:'Not yet consolidated',
        tells:'Not yet consolidated',
        behaviour:'Not yet consolidated',
        pressure:'Not yet consolidated',
        practical:'No additional reliable player-facing knowledge is currently established.',
        hidden:DEFAULTS[name],
        encounter:'Use only observable details established in the actual scene. Do not fill gaps from the creature name.',
        ecology:'Not yet consolidated',
        reveals:[
          ['signs','Signs','You find signs of an unfamiliar creature here, but not enough to identify it.'],
          ['seen','Seen','You get a clear look at the creature. Record only the details actually established in this scene.'],
          ['identified','Identified','This creature is known as a '+name+'.']
        ]
      };
    }
    return true;
  }
  if(!add()){
    const t=setInterval(()=>{if(add())clearInterval(t)},60);
    setTimeout(()=>clearInterval(t),4000);
  }
})();
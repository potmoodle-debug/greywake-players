(() => {
  const CREATURES={
    'Great-Shell':{
      type:'Working animal · heavy transport',status:'Established · player shared',
      habitat:'Greywake, caravan routes and Great-Shell pens',
      tells:'Enormous six-legged beetle-like body; broad pale weathered carapace; fitted load frames and harness.',
      behaviour:'Endurance transport animal. Its practical importance is movement of water, tools, trade goods, salvage and injured people.',
      pressure:'Loss or injury can strand supplies, break a route and damage a family livelihood.',
      practical:'Shellfeed is a major wild food source. Dependable beds affect route planning and carrying capacity.',
      hidden:'No additional hidden biology is currently established.',
      encounter:'Usually encountered as working stock, caravan infrastructure or an animal under strain rather than as a hostile creature.',
      ecology:'Feeds on Shellfeed. Wider diet, breeding cycle and natural predators are not yet consolidated.',
      reveals:[
        ['signs','Signs','You find the unmistakable passage of a Great-Shell: broad, heavy six-legged impressions and load-scuffed ground.'],
        ['seen','Seen','You have seen a Great-Shell: an enormous organic beetle-like animal with six powerful legs and a broad weathered carapace.'],
        ['identified','Identified','Great-Shells are Greywake’s principal heavy transport animals. They are living animals, not machines or Oldwork.'],
        ['practical','Practical knowledge','Great-Shells depend heavily on Shellfeed along established routes; losing one can break a caravan’s carrying capacity.']
      ]
    },
    'Cacklemaw':{
      type:'Predator · pack hunter',status:'Established · player shared',
      habitat:'Broken ground, runnels and waste routes',
      tells:'Lean pursuit build; broken breathy calls; paired soft resonating membranes beneath the throat.',
      behaviour:'Circles, tests defences, closes safe routes and exploits separation rather than simply charging.',
      pressure:'Creates movement pressure. The visible animal may be drawing attention while the rest of the pack changes position.',
      practical:'Treat calls and movement as coordinated pack behaviour. Protect isolated or vulnerable people first.',
      hidden:'No further secret lifecycle or vulnerability is currently canon.',
      encounter:'Signal with calls, silhouettes or pressure on an escape line before escalating to direct attack where possible.',
      ecology:'Established as a predator of the wastes. Detailed prey base, breeding and territory size are not yet consolidated.',
      reveals:[
        ['signs','Signs','You hear broken, breathy calls moving through the broken ground. They do not sound random.'],
        ['seen','Seen','You see a lean pursuit predator keeping pace across broken ground while another call answers from elsewhere.'],
        ['identified','Identified','It is a Cacklemaw, a Greywake pack predator that uses broken calls to coordinate pressure.'],
        ['practical','Practical knowledge','Cacklemaws circle, test defences and exploit separation. The one you can see may not be the one controlling your movement.']
      ]
    },
    'Glasshoof Runner':{
      type:'Grazer · terrain reader',status:'Established · player shared',
      habitat:'Salt flats, dried runnels, fractured clay pans, shallow ruins, mineral seams and Seep Field edges',
      tells:'Light build, broad translucent ears, sealable nostrils, pale eye membranes and spreading glasslike hoof plates.',
      behaviour:'Moves cautiously across unstable crust and reacts to hollow ground, buried silt, rubble or vibration.',
      pressure:'Its refusal to cross a line may indicate terrain danger before people can detect it.',
      practical:'Travellers use a calm Runner as an imperfect sign of stable footing.',
      hidden:'No hidden biology is currently established.',
      encounter:'Useful as environmental evidence before it is an obstacle or threat.',
      ecology:'Desert grazer. Full diet, predators and breeding cycle remain unconsolidated.',
      reveals:[
        ['signs','Signs','Light tracks end abruptly at a patch of apparently ordinary ground, as if the animal refused to cross it.'],
        ['seen','Seen','You see a lightly built grazer with broad translucent ears and spreading glasslike hoof plates.'],
        ['identified','Identified','It is a Glasshoof Runner, a desert grazer common around flats, runnels and mineral ground.'],
        ['practical','Practical knowledge','Experienced travellers watch a Glasshoof’s feet: hesitation can warn of hollow ground, buried silt or unstable rubble.']
      ]
    },
    'Dust-Muzzle':{
      type:'Settlement scavenger · living warning',status:'Established · player shared',
      habitat:'Homes, workshops, refuse lanes, repair yards, wall cavities and cistern edges',
      tells:'Large-rabbit-sized body, long scenting muzzle and oversized independently moving ears.',
      behaviour:'Hunts vermin, consumes waste and learns familiar footsteps and routines.',
      pressure:'Sudden alarm behaviour can indicate gas, smoke, rot, contamination, unstable rubble or movement behind walls.',
      practical:'Locals watch the ears before investigating a wall or enclosed space.',
      hidden:'No hidden biology is currently established.',
      encounter:'Best used as a clue inside Greywake rather than as combat.',
      ecology:'Settlement scavenger and vermin hunter. Wider breeding and diet remain unconsolidated.',
      reveals:[
        ['signs','Signs','A small scavenger bolts from a wall cavity and keeps both oversized ears fixed on the opening.'],
        ['seen','Seen','You see a lean, large-rabbit-sized scavenger with a long scenting muzzle and independently moving ears.'],
        ['identified','Identified','It is a Dust-Muzzle, a familiar Greywake scavenger that lives around homes, workshops and refuse lanes.'],
        ['practical','Practical knowledge','Dust-Muzzles are useful warnings for smoke, gas, rot, contamination, unstable rubble and unfamiliar movement behind walls.']
      ]
    },
    'Wirethorn Skitter':{
      type:'Scavenger · vibration reader',status:'Established · player shared',
      habitat:'Collapsed walls, cistern pipework, abandoned streets, rubble cavities and salvage piles',
      tells:'Flattened six-legged body, wire-thin limbs, hooked feet and a crown of flexible sensory thorns.',
      behaviour:'Reads vibration, moving air, shifting stone and water movement rather than relying on normal sight.',
      pressure:'A sudden flight from a structure can warn of collapse or disturbance below.',
      practical:'If several begin leaving a structure at once, locals treat that as a reason to stop and reassess.',
      hidden:'No hidden biology is currently established.',
      encounter:'Use as early warning and environmental evidence.',
      ecology:'Scavenger adapted to buried and built environments. Full diet and lifecycle remain unconsolidated.',
      reveals:[
        ['signs','Signs','Several tiny hooked tracks emerge from rubble at once, all moving away from the same structure.'],
        ['seen','Seen','You see a flattened six-legged scavenger with wire-thin limbs and a crown of flexible sensory thorns.'],
        ['identified','Identified','It is a Wirethorn Skitter, a creature that reads vibration, pressure and moving air.'],
        ['practical','Practical knowledge','When Wirethorn Skitters suddenly abandon a wall, pipe run or ruin, experienced locals check for collapse or another disturbance below.']
      ]
    },
    'Cistern Threader':{
      type:'Amphibious water-system animal',status:'Established · player shared',
      habitat:'Cistern chambers, seep channels, flooded conduits, cracked distribution pipes and wet waterworks',
      tells:'Long flattened body, folding side fins, gripping limbs and pressure-sensitive pits around the head.',
      behaviour:'Moves through narrow wet spaces and follows connected water routes.',
      pressure:'Sudden flight can signal pressure change, contamination, heat, collapse or larger movement.',
      practical:'A healthy Threader can indicate persistent wet habitat and connected flow.',
      hidden:'No hidden biology is currently established.',
      encounter:'Environmental indicator inside water infrastructure.',
      ecology:'Requires persistent wet habitat. Wider feeding and breeding ecology remain unconsolidated.',
      reveals:[
        ['signs','Signs','Something long and flattened has moved through the wet channel, leaving disturbed silt where the flow continues.'],
        ['seen','Seen','You see a long flattened amphibious creature folding itself through a narrow wet conduit.'],
        ['identified','Identified','It is a Cistern Threader, an animal adapted to Greywake’s buried water systems.'],
        ['practical','Practical knowledge','Healthy Threaders suggest connected wet habitat; sudden flight can warn of contamination, pressure change, heat, collapse or something larger moving below.']
      ]
    },
    'Carrion Kite':{
      type:'Aerial scavenger',status:'Established · player shared',
      habitat:'Open wastes and thermal country',
      tells:'Ribbed gas-filled body with thin steering membranes; drifts on thermals rather than beating wings.',
      behaviour:'Prefers carrion already opened by stronger creatures and usually avoids healthy people.',
      pressure:'Becomes more dangerous around the unconscious, trapped, badly bleeding, isolated or exhausted.',
      practical:'Circling or descent can be a clue to injury, carrion or danger below, but it is not proof.',
      hidden:'No hidden biology is currently established.',
      encounter:'Use overhead behaviour as distant evidence before direct contact.',
      ecology:'Carrion scavenger. Exact breeding cycle and predators remain unconsolidated.',
      reveals:[
        ['signs','Signs','A gas-buoyed shape begins circling lower over one patch of the wastes.'],
        ['seen','Seen','You see a ribbed gas-filled scavenger drifting on thermals and steering with thin membranes.'],
        ['identified','Identified','It is a Carrion Kite, a scavenger that follows injury and carrion across the wastes.'],
        ['practical','Practical knowledge','Carrion Kites usually avoid healthy people but become bolder around someone trapped, unconscious, badly bleeding or too exhausted to drive them away.']
      ]
    },
    'Flickerfly':{
      type:'Fauna · exact niche unresolved',status:'Established · DM only',
      habitat:'Not yet consolidated',
      tells:'Not yet canonically consolidated.',
      behaviour:'Not yet canonically consolidated.',
      pressure:'Not yet established.',
      practical:'Marek has a confirmed interest in studying a Flickerfly.',
      hidden:'Exact prey, lifecycle and wider ecological role are intentionally undefined.',
      encounter:'Use only details established in the actual scene. Do not prefill missing biology.',
      ecology:'Existence is established; wider ecology remains open.',
      reveals:[
        ['signs','Signs','You notice evidence of a small creature nearby, but not enough to identify it yet.'],
        ['seen','Seen','You get a clear look at a Flickerfly specimen. Its exact behaviour must come from what happens in the scene.'],
        ['identified','Identified','The creature is a Flickerfly.'],
        ['practical','Studied','You have begun building reliable observations about the Flickerfly. Record only the behaviours actually established through study.']
      ]
    },
    'Juvenile Acid Burrower':{
      type:'Burrowing creature · juvenile form',status:'Established · DM only',
      habitat:'Not yet consolidated',tells:'Not yet consolidated.',behaviour:'Not yet consolidated.',pressure:'Not yet consolidated.',
      practical:'Only the juvenile form is currently established in the live ecology catalogue.',
      hidden:'Adult form, lifecycle, territory and detailed behaviour remain undefined.',
      encounter:'Do not invent adult traits or ecology from the name alone.',ecology:'Wider ecology remains open.',
      reveals:[['signs','Signs','You find evidence that something has moved beneath or through the ground here.'],['seen','Seen','You see a juvenile burrowing creature.'],['identified','Identified','It is a Juvenile Acid Burrower.'],['practical','Studied','You have reliable first-hand observations of this juvenile specimen; record only what the scene actually established.']]
    },
    'Drywalker':{
      type:'Fauna · Thirst-Marrow consequence',status:'Established · DM only',
      habitat:'Not yet consolidated',tells:'Not yet consolidated.',behaviour:'Not yet consolidated.',pressure:'Not yet consolidated.',
      practical:'Connected to prolonged reliance on Thirst-Marrow.',
      hidden:'Transformation, physiology and cure are not to be expanded beyond established canon.',
      encounter:'Reveal the connection only when evidence supports it.',ecology:'Part of the Thirst-Marrow lifecycle/consequence; details remain open.',
      reveals:[['signs','Signs','You find evidence of something connected to prolonged Thirst-Marrow exposure, but the nature of it is not yet clear.'],['seen','Seen','You encounter a Drywalker.'],['identified','Identified','The creature is known as a Drywalker.'],['practical','Studied','You have evidence linking Drywalkers to prolonged reliance on Thirst-Marrow. Do not infer more than the evidence supports.']]
    }
  };

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const fullGM=()=>document.body.dataset.role==='gm'&&document.body.dataset.gmPreview!=='true';
  const routeName=()=>{const h=location.hash||'';return h.startsWith('#/gm-world/record/')?decodeURIComponent(h.slice('#/gm-world/record/'.length)):''};
  const mediaFor=name=>{const M=window.GREYWAKE_MEDIA||{},alias=name==='Cacklemaw'?'Cacklemaw Pack':name;return (M[name]||M[alias]||[]).find(x=>x&&x.src)?.src||''};
  const liveReveal=async(name,stage,audience)=>{
    const record=CREATURES[name],slice=record?.reveals?.find(x=>x[0]===stage);if(!record||!slice)throw new Error('Reveal slice unavailable.');
    if(typeof window.GREYWAKE_REVEAL_CREATURE!=='function')throw new Error('Live reveal service is not ready.');
    return window.GREYWAKE_REVEAL_CREATURE(name,audience,slice[2],stage);
  };

  function section(title,body,klass=''){return `<section class="gm-creature-section ${klass}"><small>${esc(title)}</small><div>${body}</div></section>`;}
  function revealLadder(name,record){
    return `<section class="gm-creature-reveals"><div class="gm-creature-section-title"><small>PLAYER REVEAL LADDER</small><h2>Reveal only what they earned</h2><p>Each row is a safe slice. Choose who learned it; later stages do not need to be revealed until play supports them.</p></div>
      <div class="gm-reveal-ladder">${record.reveals.map(([key,label,text],i)=>`<article data-stage="${esc(key)}"><div class="gm-reveal-stage"><span>${i+1}</span><div><small>${esc(label)}</small><p>${esc(text)}</p></div></div><div class="gm-reveal-actions"><button data-eco-reveal="${esc(name)}" data-stage="${esc(key)}" data-audience="marek">Marek</button><button data-eco-reveal="${esc(name)}" data-stage="${esc(key)}" data-audience="odie">Odie</button><button data-eco-reveal="${esc(name)}" data-stage="${esc(key)}" data-audience="party">Party</button></div></article>`).join('')}</div></section>`;
  }
  function page(name,record){
    const img=mediaFor(name);
    return `<div class="gm-creature-master">${img?`<figure class="gm-creature-hero"><img src="${esc(img)}" alt=""><figcaption>Canon visual reference</figcaption></figure>`:''}
      <div class="gm-creature-status"><span>${esc(record.type)}</span><strong>${esc(record.status)}</strong></div>
      <div class="gm-creature-grid">
        ${section('AT A GLANCE',`<dl><dt>Habitat</dt><dd>${esc(record.habitat)}</dd><dt>Recognition</dt><dd>${esc(record.tells)}</dd></dl>`)}
        ${section('BEHAVIOUR',`<p>${esc(record.behaviour)}</p>`)}
        ${section('PRESSURE IN PLAY',`<p>${esc(record.pressure)}</p>`)}
        ${section('PRACTICAL GREYWAKE KNOWLEDGE',`<p>${esc(record.practical)}</p>`)}
        ${section('ENCOUNTER USE',`<p>${esc(record.encounter)}</p>`)}
        ${section('ECOLOGY',`<p>${esc(record.ecology)}</p>`)}
        ${section('GM-ONLY / UNKNOWN',`<p>${esc(record.hidden)}</p>`,'gm-only')}
      </div>
      ${revealLadder(name,record)}
    </div>`;
  }

  function ensureStyles(){
    if(document.getElementById('gm-creature-pages-style'))return;
    const s=document.createElement('style');s.id='gm-creature-pages-style';s.textContent=`
      .gm-creature-master{max-width:1180px}.gm-creature-hero{position:relative;margin:0 0 18px;min-height:300px;max-height:500px;overflow:hidden;border:1px solid #403d30;background:#10110d}.gm-creature-hero img{width:100%;height:100%;max-height:500px;object-fit:cover;display:block;filter:saturate(.78) contrast(1.05)}.gm-creature-hero figcaption{position:absolute;right:10px;bottom:10px;padding:5px 7px;background:rgba(10,11,8,.82);color:#a99b75;font-size:8px;letter-spacing:.1em;text-transform:uppercase}
      .gm-creature-status{display:flex;justify-content:space-between;gap:14px;margin:0 0 18px;padding:11px 13px;border:1px solid #403b2c;background:#171812}.gm-creature-status span{color:#c8b371;font-size:9px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.gm-creature-status strong{color:#d9d0bb;font-size:10px}
      .gm-creature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gm-creature-section{padding:15px 16px;border:1px solid #37362b;background:#13140f}.gm-creature-section>small{display:block;margin-bottom:8px;color:#a9955e;font-size:8px;font-weight:900;letter-spacing:.14em}.gm-creature-section p{margin:0;color:#c9c0ac;font-size:11px;line-height:1.55}.gm-creature-section dl{display:grid;grid-template-columns:110px 1fr;gap:7px 10px;margin:0}.gm-creature-section dt{color:#847d6b;font-size:8px;text-transform:uppercase;letter-spacing:.08em}.gm-creature-section dd{margin:0;color:#d3cab5;font-size:10px;line-height:1.45}.gm-creature-section.gm-only{border-color:#604b38;background:#1b1511}
      .gm-creature-reveals{margin-top:24px;padding-top:20px;border-top:1px solid #484332}.gm-creature-section-title h2{margin:4px 0 7px;color:#eee3c7;font:28px/1.1 Georgia,serif}.gm-creature-section-title>small{color:#b29a5f;font-size:8px;font-weight:900;letter-spacing:.16em}.gm-creature-section-title p{max-width:70ch;color:#9e9684;font-size:10px;line-height:1.5}.gm-reveal-ladder{display:grid;gap:8px;margin-top:14px}.gm-reveal-ladder article{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:12px;border:1px solid #38362b;background:#11120e}.gm-reveal-stage{display:flex;gap:11px;align-items:flex-start}.gm-reveal-stage>span{display:grid;place-items:center;flex:0 0 27px;width:27px;height:27px;border:1px solid #675a39;color:#d5bc75;font:15px Georgia,serif}.gm-reveal-stage small{color:#d6c48c;font-size:8px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.gm-reveal-stage p{margin:4px 0 0;color:#bdb5a3;font-size:10px;line-height:1.45}.gm-reveal-actions{display:flex;gap:5px}.gm-reveal-actions button{border:1px solid #665737;background:#211d14;color:#dac27a;padding:7px 8px;font-size:8px;font-weight:900;text-transform:uppercase;cursor:pointer}.gm-reveal-actions button:hover{border-color:#aa8d4d}.gm-reveal-actions button:disabled{opacity:.45}.gm-reveal-result{grid-column:1/-1;color:#9cab8c;font-size:9px}
      @media(max-width:800px){.gm-creature-grid{grid-template-columns:1fr}.gm-reveal-ladder article{grid-template-columns:1fr}.gm-reveal-actions{flex-wrap:wrap}}
    `;document.head.appendChild(s);
  }
  function enhance(){
    if(!fullGM())return;ensureStyles();
    const name=routeName(),record=CREATURES[name];if(!record)return;
    const host=document.getElementById('gmOperationsView'),article=host?.querySelector('.gm-world-record');if(!article)return;
    if(article.dataset.creatureMaster===name)return;
    article.innerHTML=page(name,record);article.dataset.creatureMaster=name;
    article.querySelectorAll('[data-eco-reveal]').forEach(button=>button.addEventListener('click',async()=>{
      const row=button.closest('article'),buttons=row.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);
      row.querySelector('.gm-reveal-result')?.remove();
      const result=document.createElement('div');result.className='gm-reveal-result';result.textContent='Publishing…';row.appendChild(result);
      try{await liveReveal(button.dataset.ecoReveal,button.dataset.stage,button.dataset.audience);result.textContent='Revealed to '+(button.dataset.audience==='party'?'Party':button.dataset.audience[0].toUpperCase()+button.dataset.audience.slice(1))+'.';}
      catch(err){result.textContent=err?.message||'Reveal failed.';}
      finally{buttons.forEach(b=>b.disabled=false)}
    }));
  }
  window.GREYWAKE_GM_CREATURES=CREATURES;
  window.addEventListener('hashchange',()=>setTimeout(enhance,25));
  window.addEventListener('greywake:player-ready',()=>setTimeout(enhance,80));
  new MutationObserver(()=>setTimeout(enhance,0)).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(enhance,220));
  setTimeout(enhance,320);
})();
(() => {
  const D = window.GREYWAKE_DATA || (window.GREYWAKE_DATA = {});
  const C = window.GREYWAKE_CATEGORIES || (window.GREYWAKE_CATEGORIES = {});
  const E = window.GREYWAKE_EDGES || (window.GREYWAKE_EDGES = []);
  const DISC = window.GREYWAKE_DISCOVERIES || (window.GREYWAKE_DISCOVERIES = []);

  function link(a,b){
    if(!E.some(e => (e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a))) E.push([a,b]);
  }

  // CURRENT PARTY: Clay remains historical canon, but is no longer an active PC.
  D['Marek'] = {
    title: 'Marek',
    category: 'Player Characters',
    html: `<p>Marek is Martin's current Greywake character.</p><p>His established personal network includes practical links to Daro Pell and Meren. Further public background, equipment and expertise will be added only when confirmed rather than inherited from Clay.</p>`
  };
  if (D['Clay']) {
    D['Clay'].title = 'Clay — Historical PC';
    D['Clay'].category = 'Archived Characters';
    D['Clay'].html = `<p>Clay was Martin's Ridgeborne Ranger during Sessions One to Three. He was a Great-Shell handler, caravan scout and practical judge of desert risk, travelling with Hopkins, his giant kangaroo-rat companion.</p><p>Clay is retired from active play. His actions during the Kestrel Return remain historical canon and are not reassigned to Marek.</p>`;
  }
  C['Player Characters'] = ['Marek','Odie','Velmira'];
  C['Archived Characters'] = ['Clay'];
  if (D['Velmira']) {
    D['Velmira'].category = 'Player Characters';
    D['Velmira'].html = `<p>Velmira is a Wanderborne Human Wizard of the School of Knowledge, a trader of practical goods and a well-connected local in Greywake.</p><p>She is an active player character. During Session Five she investigated the Foldling sightings with Jessa Vale, spoke to Captain Brannic Hale and joined Marek and Odie on the southern Thirst-Marrow search.</p>`;
  }
  C['People'] = C['People'] || [];
  C['People'] = C['People'].filter(name => name !== 'Velmira');

  D['Jessa Vale'] = {
    title: 'Jessa Vale',
    category: 'People',
    faction: 'Not established',
    playerHidden: true,
    html: `<p>Jessa Vale is the witness whose report led to Brannic Hale authorising Tower Watch closure #1 after she saw the Foldling emerge. Her exact role, wider knowledge and motives are not established.</p>`,
    playerHtml: `<p>Jessa Vale is a person in Greywake. Further information should only appear here after it is learned in play.</p>`
  };
  D['Tavi'] = {
    title: 'Tavi',
    category: 'People',
    faction: 'Not established',
    playerHidden: true,
    html: `<p>Tavi is part of Velmira's established relationship network and has a growing visible connection to the Faithful. Tavi's private beliefs and knowledge are not established.</p>`,
    playerHtml: `<p>Tavi is connected to people around the Faithful. What Tavi actually believes or knows must be learned in play.</p>`
  };
  D['Lysa'] = {
    title: 'Lysa',
    category: 'People',
    faction: 'Not established',
    playerHidden: true,
    html: `<p>Lysa is part of Velmira's established personal network and lives in the Tangle Lanes household connected to Nemi. Lysa's private motives and knowledge are not established.</p>`,
    playerHtml: `<p>Lysa is part of Nemi's household in the Tangle Lanes. Further information should come from meeting her or learning about her in play.</p>`
  };
  D['Meren'] = {
    title: 'Meren',
    category: 'People',
    faction: 'Not established',
    knownTo: ['marek'],
    html: `<p>Meren is established in Marek's current personal knowledge as his former teacher. Her speciality is herbs, medicine and medicinal biology. She respects Marek's ability but is cautious about his tendency to experiment before he fully understands a phenomenon.</p><p>Broader social and faction details remain unestablished.</p>`,
    playerHtml: `<p>Meren trained Marek. Her speciality is herbs, medicine and medicinal biology, complementing his interest in fauna and anatomy.</p>`
  };
  D['Daro Pell'] = {
    title: 'Daro Pell',
    category: 'People',
    faction: 'Not established',
    playerHidden: true,
    html: `<p>Daro Pell is named by the current site state as part of Marek's personal network, but the exact relationship, role, knowledge and faction ties are not yet established in the authoritative Marek reference.</p><p>Keep this as a GM reconciliation record rather than inventing missing detail.</p>`,
    playerHtml: `<p>Daro Pell is connected to Marek. The exact nature of that relationship has not yet been established in the player-facing record.</p>`
  };
  C['People'] = [...new Set([...(C['People'] || []), 'Jessa Vale','Tavi','Lysa','Meren','Daro Pell'])];
  link('Jessa Vale','Brannic Hale');
  link('Jessa Vale','Jobs & Open Threads');
  link('Tavi','The Faithful');
  link('Lysa','Tangle Lanes');
  link('Lysa','Nemi');
  link('Meren','Marek');
  link('Daro Pell','Marek');

  // PEOPLE AUDIT: named current NPCs that were referenced elsewhere but missing from the People index.
  D['Jessa Vale'] = {
    title: 'Jessa Vale',
    category: 'People',
    faction: 'Not established',
    playerHidden: true,
    html: `<p>Jessa Vale is the witness whose report led to Brannic Hale authorising Tower Watch closure #1 after she saw the Foldling emerge. Her exact role, wider knowledge and motives are not established.</p>`,
    playerHtml: `<p>Jessa Vale is a person in Greywake. Anything further about what she saw, who she spoke to or what she knows should appear here only after it is learned in play.</p>`
  };
  D['Tavi'] = {
    title: 'Tavi',
    category: 'People',
    faction: 'Not established',
    playerHidden: true,
    html: `<p>Tavi is part of Velmira's established relationship network and has a growing visible connection to the Faithful. The exact nature of that connection, and Tavi's private beliefs, are not established here beyond what has been observed.</p>`,
    playerHtml: `<p>Tavi is connected to people around the Faithful. What Tavi actually believes or knows is not assumed until learned in play.</p>`
  };
  D['Lysa'] = {
    title: 'Lysa',
    category: 'People',
    faction: 'Not established',
    playerHidden: true,
    html: `<p>Lysa is part of Velmira's established personal network and lives in the Tangle Lanes household connected to Nemi. Lysa's private beliefs, motives and knowledge are not established.</p>`,
    playerHtml: `<p>Lysa is part of Nemi's household in the Tangle Lanes. Further information should come from meeting her or learning about her in play.</p>`
  };
  D['Meren'] = {
    title: 'Meren',
    category: 'People',
    faction: 'Not established',
    knownTo: ['marek'],
    html: `<p>Meren is established in Marek's current personal knowledge as his former teacher. Her speciality is herbs, medicine and medicinal biology. She respects Marek's ability but is cautious about his tendency to experiment before he fully understands a phenomenon.</p><p>This relationship appears in the current personal-knowledge layer; broader social and faction details remain unestablished.</p>`,
    playerHtml: `<p>Meren trained Marek. Her speciality is herbs, medicine and medicinal biology, complementing his interest in fauna and anatomy.</p>`
  };
  D['Daro Pell'] = {
    title: 'Daro Pell',
    category: 'People',
    faction: 'Not established',
    playerHidden: true,
    html: `<p>Daro Pell is named by the current site state as part of Marek's personal network, but the authoritative Marek reference does not yet establish the exact relationship, role, knowledge or faction ties.</p><p>Treat this as a reconciliation-needed GM record until those details are confirmed rather than inventing them.</p>`,
    playerHtml: `<p>Daro Pell is a person connected to Marek. The exact nature of that relationship has not yet been established in the player-facing record.</p>`
  };

  C['People'] = [...new Set([...(C['People'] || []), 'Jessa Vale','Tavi','Lysa','Meren','Daro Pell'])];
  link('Jessa Vale','Brannic Hale');
  link('Jessa Vale','Jobs & Open Threads');
  link('Tavi','The Faithful');
  link('Lysa','Tangle Lanes');
  link('Lysa','Nemi');
  link('Meren','Marek');
  link('Daro Pell','Marek');

  link('Marek','Player Brain');
  link('Marek','Greywake');

  // CURRENT EQUIPMENT: do not invent Marek's loadout. Clay's confirmed loadout remains historical.
  if (D['Clay — Equipment']) D['Clay — Equipment'].category = 'Archived Equipment';
  C['Equipment'] = (C['Equipment'] || []).filter(n => n !== 'Clay — Equipment');
  if (D['Clay — Equipment']) C['Archived Equipment'] = ['Clay — Equipment'];

  // Archive copy now reflects both shared and character-specific knowledge.
  if (D['Welcome to Greywake']) D['Welcome to Greywake'].html = `<p>This is the player-facing Greywake reference.</p>
    <h2>What belongs here</h2><ul>
      <li>Things the whole party can reasonably know.</li>
      <li>Things witnessed or learned during play.</li>
      <li>Player-facing maps, images, handouts and recaps.</li>
      <li>Character-specific knowledge shown only in that character's personal view.</li>
    </ul>
    <h2>What stays out</h2><ul>
      <li>GM-only information and unrevealed truth.</li>
      <li>Future events and hidden threats.</li>
      <li>Another character's private information unless it has been shared in play.</li>
      <li>Working ideas that have not become part of the game.</li>
    </ul><p>Absence is not evidence. The archive grows as Greywake is discovered.</p>`;
  if (D['Player Brain']) D['Player Brain'].html = `<p>The Player Brain connects the records available in your current view.</p><p>Shared knowledge is visible to every player. Character-specific material appears only in the appropriate personal view. GM-only and unrevealed information remains outside player views.</p>`;
  if (D['Known Locations']) {
    D['Known Locations'].title = 'Known Regions & Routes';
    D['Known Locations'].html = `<p>Browse the places the party knows through settlements, wider regions and journeys. Smaller landmarks remain attached to the route or area that gives them meaning, rather than appearing as unrelated destinations.</p><p>Distances are described through travel time, conditions and recognised landmarks. A known place does not automatically have a known cardinal direction.</p>`;
  }

  // Published lived locations that were missing from the site.
  D['Tangle Lanes'] = {
    title: 'Tangle Lanes',
    category: 'Locations',
    html: `<p>A lived-in part of Greywake associated with tightly packed homes, ordinary households and local relationships. Velmira lives here, and Nemi and Lysa's household is here.</p><p>The Tangle Lanes are part of daily Greywake rather than a faction precinct or hidden district.</p>`
  };
  if (!C['Locations']) C['Locations'] = [];
  if (!C['Locations'].includes('Tangle Lanes')) C['Locations'].push('Tangle Lanes');
  link('Tangle Lanes','Greywake');
  link('Tangle Lanes','Velmira');
  link('Tangle Lanes','Nemi');

  // Known route history. The party travelled this route during Kestrel Return, so the Groundfall's broad direction is established.
  D['Ash-Plate Groundfall'] = {
    title: 'Ash-Plate Groundfall',
    category: 'Locations',
    html: `<p>The place where Kestrel Return's route failure ended in a groundfall and Ash-Plate was injured. The party reached the site during the rescue and later chose to leave significant expensive freight there rather than risk lives recovering it.</p><p>The Groundfall lies <strong>east of Greywake</strong> along the known Kestrel Return route. The freight may still be recoverable, though time, scavengers, weather or other travellers may have changed what remains there.</p>`
  };
  if (!C['Locations'].includes('Ash-Plate Groundfall')) C['Locations'].push('Ash-Plate Groundfall');
  link('Ash-Plate Groundfall','Known Locations');
  link('Ash-Plate Groundfall','Session 01 — Player Recap');
  link('Ash-Plate Groundfall','Session 03 — Player Recap');

  // Session Six resume: source of truth is the played Session Five record.
  window.GREYWAKE_HOME_STATE = {
    marek: {
      heading:'Marek, what matters now?', location:'The Stripped Yards',
      locationDetail:'You are travelling with Odie and Velmira through the abandoned southern outskirts, seeking Thirst-Marrow for Meren.',
      chapterTitle:'The Southern Ways', chapterDetail:'Your Foldling Beastform experience, conversation with Meren and bargain with Mara Vell brought you to this southern expedition.',
      chapterRoute:'#/record/' + encodeURIComponent('Session 05 — Player Recap'),
      currentTitle:'Thirst-Marrow search', currentDetail:'Velmira recalled a credible southern lead, but no plant has yet been located. Mara owes you one information favour.'
    },
    odie: {
      heading:'Odie, what matters now?', location:'The Stripped Yards',
      locationDetail:'You are with Marek and Velmira south of Greywake, near the Old South Road.',
      chapterTitle:'The Southern Ways', chapterDetail:'You inspected the reopened passage with Spencer, concealed yourself and overheard two workers examining the closure.',
      chapterRoute:'#/record/' + encodeURIComponent('Session 05 — Player Recap'),
      currentTitle:'Southern journey', currentDetail:'You are searching for Thirst-Marrow with the others. Your Cistern Plate reconstruction sketch remains incomplete at one quarter.'
    },
    velmira: {
      heading:'Velmira, what matters now?', location:'The Stripped Yards',
      locationDetail:'You are an active PC travelling with Marek and Odie in the abandoned southern outskirts.',
      chapterTitle:'The Southern Ways', chapterDetail:'You met Jessa Vale, accompanied her to Captain Brannic Hale and helped change the Watch response to the Foldling.',
      chapterRoute:'#/record/' + encodeURIComponent('Session 05 — Player Recap'),
      currentTitle:'A lead to the south', currentDetail:'You recalled a promising, unconfirmed Thirst-Marrow lead and joined the expedition. You know what Captain Hale agreed to, but have not automatically told the others.'
    }
  };

  window.GREYWAKE_GM_STATE = {
    session:'Session Five complete · Session Six next · Fear 12',
    partyLocation:'Stripped Yards (hex 0,-1) · Old South Road · western Open Houses / eastern Old Haul Yard',
    activeParty:['Marek','Odie','Velmira'], backgroundParty:[],
    situationTitle:'The Stripped Yards · the road south',
    situationDetail:'All three PCs travelled south from Greywake in search of Thirst-Marrow for Meren. The search lead is credible but unconfirmed. Animal tracks enter abandoned houses; an unexplained stone-striking sound came twice from the western ruins. No cactus has been found.',
    lastPlayed:[
      ['ODIE','Inspected the reopened blockage with Spencer, watched while concealed and overheard two labourers discuss another Watch closure. Their identities and the second location remain unknown.'],
      ['MAREK','Experienced Foldling Beastform instincts, consulted Meren and traded firsthand Foldling information to Mara Vell for one future information favour.'],
      ['VELMIRA','Met Jessa Vale and accompanied her to Captain Brannic Hale. He halted new Foldling-related closures pending evidence. She protected Marek as an unnamed witness.'],
      ['PARTY','Rested, collected water at Valve Court, reunited and set out south to find Thirst-Marrow. The Stripped Yards closing sound remains unexplained.']
    ],
    parked:[
      ['PARTY','Together in the Stripped Yards. Do not return them to the underground split scene.'],
      ['THIRST-MARROW','Not located or harvested. Velmira has only a general southern lead.'],
      ['GM FEAR','12 at end of Session Five.']
    ],
    openConsequences:[
      'Unidentified stone-on-stone sound from the western Open Houses',
      'Unusual animal tracks entering abandoned dwellings',
      'Thirst-Marrow location and safe collection unconfirmed',
      'Mara Vell owes Marek one unredeemed information favour',
      'Identity of the two closure workers and their other inspection',
      'Brannic Hale wants firsthand Foldling testimony; existing Watch closures remain under review',
      'Odie Cistern Plate reconstruction is 1/4 complete',
      'Nemi Stilling, eastern route markers, Ash-Plate recovery and abandoned freight remain unresolved'
    ],
    sceneTitle:'Session Six opening · the Stripped Yards',
    sceneDetail:'Marek, Odie and Velmira are together on or near the Old South Road in the Stripped Yards. The western Open Houses produced two stone-striking sounds. Let the players choose whether to investigate, continue the cactus search or take another action. No source of the sound or encounter has been established.',
    pressures:[
      ['→ High','Unknown sound in the western Open Houses'],
      ['→ High','Thirst-Marrow search south of Greywake'],
      ['→','Altered animal shelter patterns'],
      ['→','Watch passage closures under review'],
      ['→','Mara Vell information favour outstanding'],
      ['→','Cistern Plate reconstruction and controlled custody'],
      ['→','Nemi Stilling, Ash-Plate recovery and abandoned eastern freight']
    ],
    prep:{
      startingPositions:[
        {name:'Marek',location:'The Stripped Yards · Old South Road',detail:'With Odie and Velmira, searching for Thirst-Marrow for Meren. The sound came from the western ruins. Mara owes him one information favour.',status:'ACTIVE PC'},
        {name:'Odie',location:'The Stripped Yards · Old South Road',detail:'Travelling with Marek and Velmira. Previously overheard two labourers checking a passage closure. Cistern Plate sketch progress: 1/4.',status:'ACTIVE PC'},
        {name:'Velmira',location:'The Stripped Yards · Old South Road',detail:'Travelling with Marek and Odie. Recalled an unconfirmed southern Thirst-Marrow lead. Knows Brannic agreed to halt new Foldling closures.',status:'ACTIVE PC'}
      ],
      checklist:[
        {label:'Confirm live resources',detail:'GM Fear 12. Each spent 1 Water on the previous Long Rest and collected a daily ration; confirm exact Water, Hope, HP, Stress and Armor from sheets.',status:'CHECK AT TABLE'},
        {label:'Opening spotlight',detail:'All three PCs are together. The stone-striking sound came twice from western abandoned buildings; source unestablished. Ask what they do.',status:'READY'},
        {label:'Stripped Yards geography',detail:'Old South Road north-south, Open Houses west, Old Haul Yard east, abandoned claim southwest and the Break farther south. No forced encounter.',status:'READY'},
        {label:'Thirst-Marrow lead',detail:'Velmira recalled a credible scavenger description, not an exact location. Searching and harvesting remain to be played.',status:'READY'},
        {label:'Knowledge separation',detail:'Velmira knows Hale decision; others do not automatically. Mara knows only what Marek traded. Do not expose GM-only Foldling cause.',status:'GM ONLY'},
        {label:'Site and live capture',detail:'Check player view, questions, capture and updates before play; do not publish GM-only facts.',status:'TEST'}
      ],
      likelyScenes:[
        {title:'Investigate the western sound',detail:'The players may examine the Open Houses and the stone-striking sound. Its source is not yet established.',readiness:'PLAYER CHOICE',records:['The Stripped Yards']},
        {title:'Search for Thirst-Marrow',detail:'Follow Velmira general lead and decide how to survey the neglected southern ground. No exact patch has been confirmed.',readiness:'PLAYER CHOICE',records:['Thirst-Marrow','The Stripped Yards']},
        {title:'Explore the old haul grounds',detail:'The eastern Old Haul Yard provides a different route and visibility from the narrow western Open Houses.',readiness:'OPTION',records:['The Stripped Yards']}
      ],
      npcMoves:[
        {name:'Mara Vell',knowledge:'Marek provided firsthand Foldling details but withheld the reason it came north.',decision:'Accepted a deferred trade for one information favour.',next:'Owes Marek one answer or lead she knows or can reasonably obtain; not automatically redeemed.',certainty:'ESTABLISHED'},
        {name:'Brannic Hale',knowledge:'Jessa and Velmira described the Foldling as frightened rather than aggressive.',decision:'Halted NEW Foldling-related passage closures pending evidence.',next:'Existing Watch seals remain under review; firsthand witness welcome.',certainty:'ESTABLISHED'},
        {name:'Spencer Digger',knowledge:'Inspected deliberate packing and tool marks in the reopened passage.',decision:'Ask discreet questions about tools, timber and paid closure work.',next:'No confirmed new lead from his inquiries has been played.',certainty:'OPEN'}
      ],
      evidence:[
        {kind:'PLAYER FACT',text:'All three PCs are together in the Stripped Yards (0,-1), seeking Thirst-Marrow.'},
        {kind:'PLAYER FACT',text:'Tracks lead into abandoned houses; stone struck stone twice among the western ruins. Cause unknown.'},
        {kind:'PLAYER FACT',text:'Mara owes Marek one information favour. Odie Plate sketch is 1/4 complete.'},
        {kind:'PLAYER FACT',text:'Velmira and Jessa persuaded Brannic to halt new Foldling-related closures.'},
        {kind:'UNRESOLVED',text:'Thirst-Marrow patch, western sound source, labourers and second inspection remain unknown.'},
        {kind:'GM ONLY',text:'Two Watch closures stem from Jessa Foldling reports; the Syndicate gate-side closure has a separate trade motive.'},
        {kind:'GM ONLY',text:'Foldling was displaced by an unidentified disturbance farther south. Do not connect it automatically to Stilling, Oldwork or Tower.'}
      ],
      assets:[
        {label:'The Stripped Yards',type:'LOCATION / MAP',status:'OPENING AREA'},
        {label:'Open Houses and Old Haul Yard',type:'LOCATION / OPTIONS',status:'READY'},
        {label:'Thirst-Marrow',type:'FLORA / SEARCH',status:'NOT YET FOUND'},
        {label:'Marek, Odie, Velmira',type:'ACTIVE PCS',status:'ALL PRESENT'},
        {label:'Mara Vell and Brannic Hale',type:'NPC / CONSEQUENCES',status:'REFERENCES'}
      ]
    }
  };

  // Current state after Session Three.
  if (D['Stone-Lip Hollow']) D['Stone-Lip Hollow'].html = `<p>A shallow side basin beneath a curved stone overhang where the Kestrel Return survivors sheltered.</p><p>The cacklemaw assault here was broken during Session Three. The survivors, the Cistern Plate, Ash-Plate and Lowbell subsequently returned to Greywake.</p><p>Stone-Lip Hollow remains part of the known route history, but the party is no longer trapped there.</p>`;
  if (D['Cacklemaw Pack']) D['Cacklemaw Pack'].html = `<p>Cacklemaws are lean pursuit predators that use broken, breathy calls to coordinate. The party has seen them circle, test defences, exploit separation and change tactics rather than simply rush the nearest target.</p><p>The pack pursued the Kestrel Return survivors from the broken runnels to Stone-Lip Hollow. During Session Three the party broke the attack; surviving scavengers fled rather than regrouping nearby.</p><p>A useful lesson from direct experience: the animal you can see may not be the only one choosing where your attention goes.</p>`;
  if (D['Ash-Plate']) D['Ash-Plate'].html = `<p>A Great-Shell from Kestrel Return. The party freed Ash-Plate after the groundfall and kept her alive.</p><p>She returned to Greywake under her own strength but remains injured. She is carrying no load until properly assessed and recovered.</p>`;
  if (D['Lowbell']) D['Lowbell'].html = `<p>A Great-Shell from Kestrel Return. Lowbell survived the caravan crisis and returned to Greywake in serviceable condition with only minor strain.</p>`;
  if (D['Cistern Plate']) D['Cistern Plate'].html = `<p>The large precision-made ceramic waterworks plate carried in Kestrel Return's heavy pale transport case.</p><p>It was recovered from an abandoned route cistern, opened safely at Stone-Lip Hollow and brought back to Greywake intact. Its deeper origin is not part of the shared player record.</p><p>Rennic believed it could matter to Greywake's waterworks. Its exact function, compatibility, custody and eventual value remain unresolved.</p>`;

  // Current Kestrel Return people: surviving named crew are now home, not still on the survivor trail.
  const returned = {
    'Joric Noll': `<p>Joric Noll is a Kestrel Return crew member the party found injured in the broken runnels. He was rescued, reunited with the surviving caravan crew at Stone-Lip Hollow and returned to Greywake alive at the end of Session Three.</p>`,
    'Maela Rusk': `<p>Maela Rusk is one of Kestrel Return's surviving caravan leaders. The party reached her group at Stone-Lip Hollow and later helped bring her and the other survivors back to Greywake.</p>`,
    'Sarn Pell': `<p>Sarn Pell is a Great-Shell handler who travelled with Kestrel Return. He survived the caravan failure and returned to Greywake with the surviving crew, Ash-Plate and Lowbell.</p>`,
    'Rennic Vale': `<p>Rennic Vale is a Kestrel Return crew member who protected the heavy pale transport case and repeatedly insisted that it remain flat. He returned to Greywake alive with the Cistern Plate intact.</p>`,
    'Bessa Trant': `<p>Bessa Trant is a Kestrel Return crew member who survived the caravan failure and returned to Greywake. During the return journey she spotted fresh work on the second altered route marker near the High Shelf shade.</p>`
  };
  Object.entries(returned).forEach(([name, html]) => { if (D[name]) D[name].html = html; });

  // Nemi is party-publishable, but deeper household and progression details remain in Velmira's personal view.
  if (D['Nemi']) D['Nemi'].html = `<p>Nemi is Lysa's 11-year-old daughter from the Tangle Lanes and is suffering from Greywake's current active case of the Stilling.</p><p>Her body is becoming pale, dry, cold, heavy and slow, with persistent thirst and progressive loss of warmth and ease of movement. Rumours and competing interpretations have gathered around the condition, but its cause and cure remain unknown.</p>`;

  // Shared field guide: do not expose an undiscovered Flickerfly as if the party has already confirmed one.
  if (D['Known Flora and Fauna']) D['Known Flora and Fauna'].html = `<p>This field guide contains creatures and plants established as shared party knowledge through life in Greywake or direct play.</p><p>Current shared entries include Great-Shells, cacklemaws, Latchfan and Thirst-Marrow. A creature can exist in Greywake canon without appearing here: Marek is interested in finding a Flickerfly, but the party has not yet seen a confirmed specimen.</p>`;

  // Locked travel scale.
  if (D['Travel & Routes']) D['Travel & Routes'].html = `<p>Greywake travellers think about journeys in practical terms: <strong>time, routes, landmarks, shelter, conditions and risk</strong>.</p><p>A place might be a few hours away, half a day out, a full day's travel or farther depending on the route and conditions. What matters is whether the group can reach it and still get home safely.</p><h2>What matters on a route</h2><ul><li>Reliable shade or shelter.</li><li>Known landmarks and route markers.</li><li>Whether the ground is safe for people, Great-Shells and loaded sleds.</li><li>Heat, wind and changing weather.</li><li>Recent predator or raider signs.</li><li>How much daylight remains.</li><li>Whether a rest point is genuinely usable.</li><li>Whether turning back is still possible.</li></ul><p>The safest route is not always the shortest one.</p>`;

  // Keep the older archive record consistent with the current Session Four choice board.
  if (D['Jobs & Open Threads']) D['Jobs & Open Threads'].html = `
    <p>This is not a quest log. It records situations the party knows about and could choose to engage with. Some can be acted on immediately; others first need information that has not yet been established.</p>
    <h2>Player priorities</h2>
    <h3>Marek — Find a Flickerfly</h3><p><strong>Status:</strong> Interest; no actionable expedition lead yet.</p><p>Marek wants to find and study a Flickerfly. The party does not currently have a confirmed specimen, location, spoor find or established travel direction to one.</p>
    <h3>Velmira — An Earlier Stilling Case</h3><p><strong>Status:</strong> Current priority; not selectable as a Wastes expedition yet.</p><p>An earlier publicly known Stilling case apparently stabilised for a time after a journey outside Greywake. The place visited is still identifiable, but its broad direction has not yet been established.</p>
    <h3>Odie — The Closing Ways</h3><p><strong>Status:</strong> Active Greywake problem; one concealed way reopened.</p><p>Odie and Marek reopened one deliberately packed and braced southern access. The route is passable but visibly disturbed. Odie established final packing from the Greywake side and is returning with Spencer to inspect the original closure work. Odie’s informer theory remains unproven.</p>
    <h2>Selectable beyond Greater Greywake</h2>
    <h3>↓ South — Something Moved In</h3><p><strong>Status:</strong> Selectable expedition.</p><p>Diggers say something dangerous has occupied an old ruin south of Greywake and work has stopped. The creature, why it chose the site and what else may be inside remain unknown.</p><p><strong>Possible benefit:</strong> getting the work moving again may earn access to a Minor Stamina Potion recipe.</p>
    <h2>Selectable beyond Greater Greywake</h2>
    <h3>→ East — Freight at Ash-Plate Groundfall</h3><p><strong>Status:</strong> Selectable external opportunity.</p><p>Significant expensive freight remains potentially recoverable at the Groundfall east of Greywake along the known Kestrel Return route corridor. Time, scavengers, weather or other travellers may have changed what remains there.</p>
    <h2>Things you can act on in Greywake</h2>
    <h3>The altered route markers</h3><p>At least two route markers were deliberately altered. The party can begin inside Greywake by comparing evidence, witnesses, route knowledge and who might recognise the work.</p>
    <h3>The Cistern Plate</h3><p>The Plate reached Greywake intact. Its exact function, compatibility, custody, examination and practical consequences remain unresolved.</p>
    <h3>Ash-Plate's recovery</h3><p>Ash-Plate returned alive but injured and cannot simply return to carrying loads. Assessment, treatment, cost and consequences for Great-Shell work remain unresolved.</p>
    <h2>Completed introduction</h2><p>Clay, Velmira and Odie completed the Kestrel Return rescue during Sessions One to Three. Clay's participation remains historical canon; Marek joined the active party afterwards.</p>`;

  // Session Two is no longer the latest recap.
  DISC.forEach(d => {
    if (d.note === 'Session 02 — Player Recap') {
      d.text = 'The shared record of the party reaching Stone-Lip Hollow and rejoining the surviving caravan crew.';
      d.when = 'Session Two';
    }
  });

  // Public PC records: add established public details only.
  if (D['Odie']) D['Odie'].html = `<p>Odie is an Underborne Rogue of the Nightwalker subclass, a fixer, repairman and scavenger who keeps broken things working.</p><p>He lost his arm two to three years ago and built himself a crude salvage prosthetic. His strengths are practical repair, improvisation and finding useful parts where other people see scrap.</p>`;
  if (D['Velmira']) D['Velmira'].html = `<p>Velmira is a Wanderborne Human Wizard of the School of Knowledge, a trader of useful practical goods and a well-connected Greywake local.</p><p>She is in her late 30s, wears leather armour and lives in the Tangle Lanes. Her strengths are attention to people, patterns, rumours, fear and need. Her magic is useful, careful and grounded rather than spectacular.</p>`;
})();
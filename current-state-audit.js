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
    D['Velmira'].html = `<p>Velmira is a Wanderborne Human Wizard of the School of Knowledge, a trader of practical goods and a well-connected local in Greywake.</p><p>She is Carla's active player character in Greywake. Her established history, relationships and knowledge remain part of the campaign.</p>`;
  }
  C['People'] = (C['People'] || []).filter(name => name !== 'Velmira');

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

  // Player Home is character-perspective state, not a single shared campaign camera.
  // Shared history may be known without being presented as something this character personally lived through.
  window.GREYWAKE_HOME_STATE = {
    marek: {
      heading: 'Marek, what matters now?',
      location: 'Buried Ways Beneath Greywake',
      locationDetail: 'You ended Session Four in Foldling-form Agile Scout in buried spaces beneath Greywake after leaving the real Foldling alive.',
      chapterTitle: 'The Pale Thread',
      chapterDetail: 'Your southern creature trail led through the reopened Digger way and onward to a direct encounter with a Foldling beneath Greywake.',
      chapterRoute: '#/my-greywake',
      currentTitle: 'The Closing Ways',
      currentDetail: 'You know the Foldling is primarily evasive, vibration-sensitive and adapted to enclosed ruins. Through Nature’s Tongue you learned it fled north from repeated danger or disturbance in buried places to the south. Separately, your own investigation into Flickerflies produced a lead: stories tend to come from travellers returning from south of Greywake, and a recently returned Digger is said to have brought back a thin translucent wing fragment that someone thought might be from a Flickerfly. Neither the fragment nor an exact Flickerfly location is confirmed.'
    },
    odie: {
      heading: 'Odie, what matters now?',
      location: 'Returning to the Reopened Digger Way',
      locationDetail: 'You ended Session Four travelling with Spencer back toward the reopened southern blockage so he can inspect the original closure work.',
      chapterTitle: 'Kestrel Return',
      chapterDetail: 'You helped bring the surviving caravan crew and the Cistern Plate back to Greywake, then escorted the Plate into the Inner Cistern Court before joining the Closing Ways investigation.',
      chapterRoute: '#/record/' + encodeURIComponent('Session 03 — Player Recap'),
      currentTitle: 'The Closing Ways',
      currentDetail: 'You established that the Opening Blockage was finally packed from the Greywake side and reopened it with Marek. The route is passable but visibly disturbed. Spencer’s inspection has not yet been played.'
    },
    velmira: {
      heading: 'Velmira, what matters now?',
      location: 'Greywake',
      locationDetail: 'Velmira is in Greywake. Carla decides her next action; her return to active play does not move her to the Digger way.',
      chapterTitle: 'Kestrel Return',
      chapterDetail: 'You helped bring the surviving caravan crew and the Cistern Plate back to Greywake after the cacklemaw attack and the longer return route.',
      chapterRoute: '#/record/' + encodeURIComponent('Session 03 — Player Recap'),
      currentTitle: 'The Closing Ways',
      currentDetail: 'The route closure is deliberate, but who is exposing the concealed ways, who is closing them and why remain unresolved.'
    }
  };


  // Single GM-facing owner for the current operational campaign state.
  // GM views should read this object rather than maintaining a second hand-written snapshot.
  window.GREYWAKE_GM_STATE = {
    session: 'Two days after Kestrel Return',
    partyLocation: 'Greywake and the buried ways: Marek below Greywake · Odie returning with Spencer · Velmira in Greywake',
    activeParty: ['Marek','Odie','Velmira'],
    backgroundParty: [],
    situationTitle: 'Greywake has reacted',
    situationDetail: 'Two days have passed since Kestrel Return reached Greywake. The rescue is no longer fresh news: accounts are circulating, losses are being counted, Ash-Plate remains out of normal work, the Cistern Plate is under controlled attention, Digger crews are guarding route knowledge more tightly, and the altered-marker and closure questions remain unresolved.',
    sceneTitle: 'Between scenes — Day 2',
    sceneDetail: 'Session Four left Marek beneath Greywake and Odie travelling back toward the reopened southern blockage with Spencer. Around them, Greywake has had time to react to the return without solving the underlying mysteries.',
    pressures: [
      ['→ High','The Closing Ways'],
      ['→ High','Disturbance south of Greywake'],
      ['→ High','Cistern Plate custody and examination'],
      ['→','Altered route markers under renewed scrutiny'],
      ['→','Ash-Plate out of normal hauling work'],
      ['→','Abandoned freight still exposed east of Greywake']
    ],
    prep: {
      startingPositions: [
        {
          name: 'Marek',
          location: 'Beneath Greywake',
          detail: 'Session Four ended with Marek below Greywake after the Foldling encounter. He is separated from Odie and knows the Foldling fled repeated danger or disturbance from buried places farther south.',
          status: 'ACTIVE PC'
        },
        {
          name: 'Odie',
          location: 'Returning to the southern Digger way',
          detail: 'Odie is travelling back with Spencer so the deliberately packed and braced closure can be inspected. The reopened access is now visibly disturbed rather than an untouched scene.',
          status: 'ACTIVE PC'
        },
        {
          name: 'Velmira',
          location: 'Greywake',
          detail: 'Velmira is Carla’s active player character and remains in Greywake. Her next action is for Carla to choose.',
          status: 'ACTIVE PC'
        }
      ],
      checklist: [
        {label:'Confirm live starting resources', detail:'Read Hope, Fear, Stress, HP, Armor and Water from current sheets/session state; do not copy old PDF values.', status:'CHECK AT TABLE'},
        {label:'Opening spotlight', detail:'Marek below Greywake in Foldling form; Odie travelling with Spencer toward the reopened blockage; Velmira in Greywake. Ask each player what they do next; do not force a reunion.', status:'READY'},
        {label:'Spencer inspection evidence', detail:'Have original packing/bracing versus reopening damage ready. Offer physical observations first; do not reveal the Tower Watch order from tool marks alone.', status:'PREP'},
        {label:'Velmira entry and relationships', detail:'Ask Carla what Velmira is doing as the session begins. Keep Nemi (Stage 2 Stilling), Tavi and the Faithful available without dragging her into a different PC’s scene.', status:'PREP'},
        {label:'Three independent closure chains', detail:'GM-only: Jessa sighting → Brannic/Tower Watch ordered two safety closures; Syndicate separately ordered one commercial closure. Odie’s informer suspicion is not a proven fact.', status:'GM ONLY'},
        {label:'Evidence and knowledge permissions', detail:'Marek personally met the Foldling and learned it fled disturbance south. Odie has not automatically received that information. Neither the public nor Velmira knows unless told in play.', status:'GM ONLY'},
        {label:'Ready locations and NPCs', detail:'Reopened southern passage, buried service spaces, Spencer, Jessa Vale, Brannic Hale, Gate corridor and relevant Greywake social areas. Use established visuals only.', status:'PREP'},
        {label:'Live capture and player site', detail:'Test GM capture, player questions/updates, site navigation and the two-chat update handoff before starting. Stage new discoveries; never auto-promote to canon.', status:'TEST'}
      ],
      likelyScenes: [
        {
          title: 'Spencer inspects the reopened blockage',
          detail: 'Odie is bringing Spencer back specifically to examine the original closure work. The physical scene has been altered by reopening, so Spencer can distinguish some original work from later disturbance but cannot recover evidence that no longer exists.',
          readiness: 'READY',
          records: ['Spencer Digger','The Closing Ways']
        },
        {
          title: 'Marek follows the Foldling question',
          detail: 'Marek knows the Foldling came from buried places to the south and was driven north by repeated danger or disturbance. The cause remains unknown. His current practical next steps include questioning Diggers about the affected worksite or pursuing the southern evidence himself.',
          readiness: 'READY',
          records: ['The Closing Ways']
        },
        {
          title: 'Greywake after two days of reaction',
          detail: 'The Kestrel Return story has spread into ordinary life. Caravan workers are discussing losses and route safety, Diggers are sharing less route information, Ash-Plate is visibly unavailable for work, and the Plate is no longer a casual object anyone can simply handle.',
          readiness: 'AMBIENT',
          records: ['Cistern Plate','Ash-Plate','Maela Rusk','Selka Marr']
        },
        {
          title: 'Velmira chooses her next move',
          detail: 'Carla decides Velmira’s immediate action in Greywake. Her social network, Nemi’s Stage 2 Stilling and Tavi’s growing Faithful connection are credible ways into play. She does not automatically know Marek’s Foldling encounter or the closure culprits.',
          readiness: 'PLAYER CHOICE',
          records: ['Nemi','The Faithful','The Closing Ways']
        },
        {
          title: 'Regroup or stay split',
          detail: 'There is no assumed reunion. If either player turns back, pushes deeper or seeks the other, let that choice determine the next connection between scenes.',
          readiness: 'CHOICE',
          records: []
        }
      ],
      npcMoves: [
        {
          name: 'Spencer Digger',
          knowledge: 'A southern access was deliberately packed and braced, and Odie has brought him back to inspect the original work after the way was reopened.',
          decision: 'Return with Odie and inspect the closure.',
          next: 'Separate original packing and bracing from the later disturbance caused by reopening, then report only what the remaining evidence supports.',
          certainty: 'ESTABLISHED'
        },
        {
          name: 'Maela Rusk',
          knowledge: 'She survived Kestrel Return and can give a firsthand account of the failed route, groundfall, losses and rescue.',
          decision: 'Give an honest account of what happened rather than leave the return to rumour.',
          next: 'Her version becomes one of the main accounts people in Greywake compare, without fixing blame that has not been established.',
          certainty: 'OFF-SCREEN MOVE'
        },
        {
          name: 'Selka Marr',
          knowledge: 'Kestrel Return lost freight, transport capacity and confidence in an eastern route after deliberately altered markers were found.',
          decision: 'Begin practical loss accounting and route-safety review.',
          next: 'Press for clarity over abandoned freight and whether another caravan can safely use the same route.',
          certainty: 'OFF-SCREEN MOVE'
        },
        {
          name: 'High Keeper Varn',
          knowledge: 'The Cistern Plate reached Greywake intact and may have practical value to the waterworks, but its exact function and compatibility are not fully established.',
          decision: 'Keep access controlled while examination proceeds cautiously.',
          next: 'Limit casual handling, record who is examining it and avoid installation until there is enough evidence to justify the risk.',
          certainty: 'OFF-SCREEN MOVE'
        },
        {
          name: 'Mara Vell',
          knowledge: 'Several versions of the Kestrel Return story are circulating, with different people emphasising markers, freight, the groundfall or the recovered Plate.',
          decision: 'Compare accounts rather than repeat the loudest version.',
          next: 'Notice contradictions, repeated details and claims that outrun the evidence.',
          certainty: 'OFF-SCREEN MOVE'
        }
      ],
      evidence: [
        {kind:'PLAYER FACT', text:'Two days have passed since Kestrel Return reached Greywake.'},
        {kind:'PLAYER FACT', text:'Ash-Plate returned alive but remains injured and unavailable for normal hauling work.'},
        {kind:'PLAYER FACT', text:'Significant freight remains abandoned at the Groundfall east of Greywake unless play establishes otherwise.'},
        {kind:'PLAYER FACT', text:'At least two eastern route markers were deliberately altered; culprit and purpose remain unresolved.'},
        {kind:'PLAYER FACT', text:'The southern Digger way was deliberately packed and braced, and Odie and Marek reopened it. The route is passable but visibly disturbed.'},
        {kind:'PLAYER FACT', text:'Marek encountered a Foldling below Greywake and learned that it fled repeated danger or disturbance from buried places farther south.'},
        {kind:'GM STATE', text:'Over the two days, the Kestrel Return account has spread, the Caravan Syndicate has begun loss accounting and route review, Keepers have tightened control around the Cistern Plate, and Digger crews have become more guarded about concealed route knowledge.'},
        {kind:'GM STATE', text:'The abandoned freight has not automatically been recovered. Its continued exposure creates pressure around ownership, salvage cost and whether another expedition is worth the risk.'},
        {kind:'GM STATE', text:'The Foldling discovery has not become general Greywake knowledge unless Marek or Odie shares it. Rumours may describe something moving through the southern ways without naming it correctly.'},
        {kind:'UNRESOLVED', text:'Who altered the route markers, what caused the deeper southern disturbance, the precise original closure labour, what the Cistern Plate ultimately does, and whether the abandoned freight has changed hands remain unresolved. GM-only responsibility for the three prepared closures IS established and separate.'},
        {kind:'GM ONLY', text:'The reopened southern blockage is Tower Watch closure #1. Jessa Vale saw the Foldling emerge through this concealed access; Brannic Hale then authorised it to be sealed from the Greywake side for containment and public safety.'},
        {kind:'GM ONLY', text:'There are two established Tower Watch closures caused by Jessa revealing accesses, plus a separate third closure by the Caravan Syndicate after it inferred another route and acted for commercial advantage by redirecting movement through Caravan Gate.'},
        {kind:'GM ONLY', text:'The Cistern Plate is Oldwork, recovered from an abandoned route cistern. Its construction resembles Odie’s Oldwork finger, suggesting related craftsmanship without proving the same civilisation. Greywake can recognise and use the Plate, not manufacture it.'},
        {kind:'GM ONLY', text:'The buried southern disturbance displaced the Foldling northward. That displacement led to Jessa witnessing it use concealed Digger accesses. The exact nature of the deeper disturbance remains unrevealed and not fully defined.'}
      ],
      assets: [
        {label:'Southern Digger way', type:'SCENE / MAP', status:'USE IF PLAY GOES THERE'},
        {label:'Spencer Digger', type:'NPC / PORTRAIT', status:'READY'},
        {label:'Kestrel Return aftermath', type:'GM STATE', status:'UPDATED — DAY 2'},
        {label:'Cistern Plate', type:'OBJECT / PRESSURE', status:'CONTROLLED ACCESS'},
        {label:'Ash-Plate', type:'CREATURE / CONSEQUENCE', status:'INJURED — OUT OF WORK'},
        {label:'Foldling reference', type:'CREATURE', status:'READY IF MAREK CONTINUES'},
        {label:'The Closing Ways', type:'HANDOUT / RECORD', status:'READY'},
        {label:'Jessa Vale and Brannic Hale', type:'NPC / WITNESS', status:'GM ONLY — IF INVESTIGATED'},
        {label:'Velmira: Nemi and Tavi', type:'CHARACTER THREADS', status:'AVAILABLE — PLAYER CHOICE'}
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
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
  C['Player Characters'] = ['Marek','Velmira','Odie'];
  C['Archived Characters'] = ['Clay'];
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

  // Known route history. The party knows the Groundfall, but current canon does not establish its cardinal direction.
  D['Ash-Plate Groundfall'] = {
    title: 'Ash-Plate Groundfall',
    category: 'Locations',
    html: `<p>The place where Kestrel Return's route failure ended in a groundfall and Ash-Plate was injured. The party reached the site during the rescue and later chose to leave significant expensive freight there rather than risk lives recovering it.</p><p>The freight may still be recoverable, but Greywake's current canon does <strong>not</strong> establish whether the Groundfall is north, east, south or west of Greywake. Its broad direction must be learned before it becomes a selectable Wastes expedition.</p>`
  };
  if (!C['Locations'].includes('Ash-Plate Groundfall')) C['Locations'].push('Ash-Plate Groundfall');
  link('Ash-Plate Groundfall','Known Locations');
  link('Ash-Plate Groundfall','Session 01 — Player Recap');
  link('Ash-Plate Groundfall','Session 03 — Player Recap');

  // Current state after Session Three.
  if (D['Stone-Lip Hollow']) D['Stone-Lip Hollow'].html = `<p>A shallow side basin beneath a curved stone overhang where the Kestrel Return survivors sheltered.</p><p>The cacklemaw assault here was broken during Session Three. The survivors, the Cistern Plate, Ash-Plate and Lowbell subsequently returned to Greywake.</p><p>Stone-Lip Hollow remains part of the known route history, but the party is no longer trapped there.</p>`;
  if (D['Cacklemaw Pack']) D['Cacklemaw Pack'].html = `<p>Cacklemaws are lean pursuit predators that use broken, breathy calls to coordinate. The party has seen them circle, test defences, exploit separation and change tactics rather than simply rush the nearest target.</p><p>The pack pursued the Kestrel Return survivors from the broken runnels to Stone-Lip Hollow. During Session Three the party broke the attack; surviving scavengers fled rather than regrouping nearby.</p><p>A useful lesson from direct experience: the animal you can see may not be the only one choosing where your attention goes.</p>`;
  if (D['Ash-Plate']) D['Ash-Plate'].html = `<p>A Great-Shell from Kestrel Return. The party freed Ash-Plate after the groundfall and kept her alive.</p><p>She returned to Greywake under her own strength but remains injured. She is carrying no load until properly assessed and recovered.</p>`;
  if (D['Lowbell']) D['Lowbell'].html = `<p>A Great-Shell from Kestrel Return. Lowbell survived the caravan crisis and returned to Greywake in serviceable condition with only minor strain.</p>`;
  if (D['Cistern Plate']) D['Cistern Plate'].html = `<p>The large precision-made ceramic waterworks plate carried in Kestrel Return's heavy pale transport case.</p><p>It was recovered from an abandoned route cistern, opened safely at Stone-Lip Hollow and brought back to Greywake intact. It is <strong>not Oldwork</strong>.</p><p>Rennic believed it could matter to Greywake's waterworks. Its exact function, compatibility, custody and eventual value remain unresolved.</p>`;

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
    <h3>Odie — The Closing Ways</h3><p><strong>Status:</strong> Active Greywake problem.</p><p>Several concealed Digger haul entrances are being deliberately closed or filled. At least one closure required precise knowledge of a hidden entrance. Odie suspects someone is reporting the routes, but that remains his theory rather than established fact.</p>
    <h2>Selectable beyond Greater Greywake</h2>
    <h3>↓ South — Something Moved In</h3><p><strong>Status:</strong> Selectable expedition.</p><p>Diggers say something dangerous has occupied an old ruin south of Greywake and work has stopped. The creature, why it chose the site and what else may be inside remain unknown.</p><p><strong>Possible benefit:</strong> getting the work moving again may earn access to a Minor Stamina Potion recipe.</p>
    <h2>Known opportunity — not selectable yet</h2>
    <h3>? — Freight at Ash-Plate Groundfall</h3><p>Significant expensive freight remains potentially recoverable. Its cardinal direction is not established, so under Greywake's directional opportunity rule it should not be presented as a selectable Wastes expedition yet.</p>
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
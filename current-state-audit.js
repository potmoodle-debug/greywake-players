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
  if (D['Clay']) D['Clay'].category = 'Archived Characters';
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

  // Current state after Session Three.
  if (D['Stone-Lip Hollow']) D['Stone-Lip Hollow'].html = `<p>A shallow side basin beneath a curved stone overhang where the Kestrel Return survivors sheltered.</p><p>The cacklemaw assault here was broken during Session Three. The survivors, the Cistern Plate, Ash-Plate and Lowbell subsequently returned to Greywake.</p><p>Stone-Lip Hollow remains part of the known route history, but the party is no longer trapped there.</p>`;
  if (D['Cacklemaw Pack']) D['Cacklemaw Pack'].html = `<p>Cacklemaws are lean pursuit predators that use broken, breathy calls to coordinate. The party has seen them circle, test defences, exploit separation and change tactics rather than simply rush the nearest target.</p><p>The pack pursued the Kestrel Return survivors from the broken runnels to Stone-Lip Hollow. During Session Three the party broke the attack; surviving scavengers fled rather than regrouping nearby.</p><p>A useful lesson from direct experience: the animal you can see may not be the only one choosing where your attention goes.</p>`;
  if (D['Ash-Plate']) D['Ash-Plate'].html = `<p>A Great-Shell from Kestrel Return. The party freed Ash-Plate after the groundfall and kept her alive.</p><p>She returned to Greywake under her own strength but remains injured. She is carrying no load until properly assessed and recovered.</p>`;
  if (D['Lowbell']) D['Lowbell'].html = `<p>A Great-Shell from Kestrel Return. Lowbell survived the caravan crisis and returned to Greywake in serviceable condition with only minor strain.</p>`;
  if (D['Cistern Plate']) D['Cistern Plate'].html = `<p>The large precision-made ceramic waterworks plate carried in Kestrel Return's heavy pale transport case.</p><p>It was recovered from an abandoned route cistern, opened safely at Stone-Lip Hollow and brought back to Greywake intact. It is <strong>not Oldwork</strong>.</p><p>Rennic believed it could matter to Greywake's waterworks. Its exact function, compatibility, custody and eventual value remain unresolved.</p>`;

  // Locked travel scale.
  if (D['Travel & Routes']) D['Travel & Routes'].html = `<p>Greywake travellers think about journeys in practical terms: <strong>time, routes, landmarks, shelter, conditions and risk</strong>.</p><p><strong>Campaign scale:</strong> 1 hex is 6 miles and represents roughly half a day of travel.</p><h2>What matters on a route</h2><ul><li>Reliable shade or shelter.</li><li>Known landmarks and route markers.</li><li>Whether the ground is safe for people, Great-Shells and loaded sleds.</li><li>Heat, wind and changing weather.</li><li>Recent predator or raider signs.</li><li>How much daylight remains.</li><li>Whether a rest point is genuinely usable.</li><li>Whether turning back is still possible.</li></ul><p>The safest route is not always the shortest one.</p>`;

  // The recipe question remains unresolved: remove the unpublished promised reward from the shared job page.
  if (D['Jobs & Open Threads']) {
    D['Jobs & Open Threads'].html = D['Jobs & Open Threads'].html
      .replace(/<p>There is also talk that helping get the dig moving again could earn access to a <strong>Minor Stamina Potion recipe<\/strong>\.<\/p>/, '')
      .replace('<p><strong>Status:</strong> Rumour / possible expedition lead</p>', '<p><strong>Status:</strong> Rumour / possible expedition lead</p><p><strong>Reward:</strong> Not yet established.</p>');
  }

  // Session Two is no longer the latest recap.
  DISC.forEach(d => {
    if (d.note === 'Session 02 — Player Recap') {
      d.text = 'The shared record of the party reaching Stone-Lip Hollow and rejoining the surviving caravan crew.';
      d.when = 'Session Two';
    }
  });

  // Public PC records: add established current details without exposing private hooks.
  if (D['Odie']) D['Odie'].html = `<p>Odie is an Underborne Rogue of the Nightwalker subclass, a fixer, repairman and scavenger who keeps broken things working.</p><p>He lost his arm two to three years ago and built himself a crude salvage prosthetic. His strengths are practical repair, improvisation and finding useful parts where other people see scrap.</p><p>He regularly checks on Joric's parents.</p>`;
  if (D['Velmira']) D['Velmira'].html = `<p>Velmira is a Wanderborne Human Wizard of the School of Knowledge, a trader of useful practical goods and a well-connected Greywake local.</p><p>She is in her late 30s, wears leather armour and lives in the Tangle Lanes. Her strengths are attention to people, patterns, rumours, fear and need. Her magic is useful, careful and grounded rather than spectacular.</p>`;

  link('Odie',"Joric's Parents");
})();
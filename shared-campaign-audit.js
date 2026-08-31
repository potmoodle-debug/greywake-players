(() => {
  const D = window.GREYWAKE_DATA || (window.GREYWAKE_DATA = {});
  const C = window.GREYWAKE_CATEGORIES || (window.GREYWAKE_CATEGORIES = {});
  const E = window.GREYWAKE_EDGES || (window.GREYWAKE_EDGES = []);

  function link(a, b) {
    if (!E.some(([x,y]) => (x === a && y === b) || (x === b && y === a))) E.push([a,b]);
  }

  // Clay remains part of the campaign record, but only historically.
  if (D.Clay) {
    D.Clay.title = 'Clay — Historical PC';
    D.Clay.category = 'Archived Characters';
    D.Clay.html = `<p>Clay was Martin's Ridgeborne Ranger during Sessions One to Three. He was a Great-Shell handler, caravan scout and practical judge of desert risk, travelling with Hopkins, his giant kangaroo-rat companion.</p><p>Clay is retired from active play. His actions during the Kestrel Return remain historical canon and are not reassigned to Marek.</p>`;
  }
  C['Player Characters'] = ['Marek','Velmira','Odie'];
  C['Archived Characters'] = ['Clay'];

  // Current Kestrel Return people: all surviving named crew are now back in Greywake.
  const returned = {
    'Joric Noll': `<p>Joric Noll is a Kestrel Return crew member the party found injured in the broken runnels. He was rescued, reunited with the surviving caravan crew at Stone-Lip Hollow and returned to Greywake alive at the end of Session Three.</p>`,
    'Maela Rusk': `<p>Maela Rusk is one of Kestrel Return's surviving caravan leaders. The party reached her group at Stone-Lip Hollow and later helped bring her and the other survivors back to Greywake.</p>`,
    'Sarn Pell': `<p>Sarn Pell is a Great-Shell handler who travelled with Kestrel Return. He survived the caravan failure and returned to Greywake with the surviving crew, Ash-Plate and Lowbell.</p>`,
    'Rennic Vale': `<p>Rennic Vale is a Kestrel Return crew member who protected the heavy pale transport case and repeatedly insisted that it remain flat. He returned to Greywake alive with the Cistern Plate intact.</p>`,
    'Bessa Trant': `<p>Bessa Trant is a Kestrel Return crew member who survived the caravan failure and returned to Greywake. During the return journey she spotted fresh work on the second altered route marker near the High Shelf shade.</p>`
  };
  Object.entries(returned).forEach(([name, html]) => { if (D[name]) D[name].html = html; });

  // Known route history. The site may show the place, but must not invent a cardinal direction.
  D['Ash-Plate Groundfall'] = {
    title: 'Ash-Plate Groundfall',
    category: 'Locations',
    html: `<p>The place where Kestrel Return's route failure ended in a groundfall and Ash-Plate was injured. The party reached the site during the rescue and later chose to leave significant expensive freight there rather than risk lives recovering it.</p><p>The freight may still be recoverable, but Greywake's current canon does <strong>not</strong> establish whether the Groundfall is north, east, south or west of Greywake. Its broad direction must be learned before it becomes a selectable Wastes expedition.</p>`
  };
  C.Locations = C.Locations || [];
  if (!C.Locations.includes('Ash-Plate Groundfall')) C.Locations.push('Ash-Plate Groundfall');
  link('Ash-Plate Groundfall','Known Locations');
  link('Ash-Plate Groundfall','Session 01 — Player Recap');
  link('Ash-Plate Groundfall','Session 03 — Player Recap');

  // Shared field guide: Flickerflies exist in canon, but the party has not yet seen a confirmed specimen.
  if (D['Known Flora and Fauna']) {
    D['Known Flora and Fauna'].html = `<p>This field guide contains creatures and plants established as shared party knowledge through life in Greywake or direct play.</p><p>Current shared entries include Great-Shells, cacklemaws, Latchfan and Thirst-Marrow. A creature can exist in Greywake canon without appearing here: for example, Marek is interested in finding a Flickerfly, but the party has not yet seen a confirmed specimen.</p>`;
  }

  // Keep the older archive record consistent with the Session Four choice board and Campaign cards.
  if (D['Jobs & Open Threads']) {
    D['Jobs & Open Threads'].html = `
      <p>This is not a quest log. It records situations the party knows about and could choose to engage with. Some can be acted on immediately; others first need information that has not yet been established.</p>

      <h2>Player priorities</h2>
      <h3>Marek — Find a Flickerfly</h3>
      <p><strong>Status:</strong> Interest; no actionable expedition lead yet.</p>
      <p>Marek wants to find and study a Flickerfly. The party does not currently have a confirmed specimen, location, spoor find or established travel direction to one.</p>

      <h3>Velmira — An Earlier Stilling Case</h3>
      <p><strong>Status:</strong> Current priority; not selectable as a Wastes expedition yet.</p>
      <p>An earlier publicly known Stilling case apparently stabilised for a time after a journey outside Greywake. The place visited is still identifiable, but its broad direction has not yet been established.</p>

      <h3>Odie — The Closing Ways</h3>
      <p><strong>Status:</strong> Active Greywake problem.</p>
      <p>Several concealed Digger haul entrances are being deliberately closed or filled. At least one closure required precise knowledge of a hidden entrance. Odie suspects someone is reporting the routes, but that remains his theory rather than established fact.</p>

      <h2>Selectable beyond Greater Greywake</h2>
      <h3>↓ South — Something Moved In</h3>
      <p><strong>Status:</strong> Selectable expedition.</p>
      <p>Diggers say something dangerous has occupied an old ruin south of Greywake and work has stopped. The creature, why it chose the site and what else may be inside remain unknown.</p>
      <p><strong>Possible benefit:</strong> getting the work moving again may earn access to a Minor Stamina Potion recipe.</p>

      <h2>Known opportunity — not selectable yet</h2>
      <h3>? — Freight at Ash-Plate Groundfall</h3>
      <p>Significant expensive freight remains potentially recoverable. Its cardinal direction is not established, so under Greywake's directional opportunity rule it should not be presented as a selectable Wastes expedition yet.</p>

      <h2>Things you can act on in Greywake</h2>
      <h3>The altered route markers</h3>
      <p>At least two route markers were deliberately altered. The party can begin inside Greywake by comparing evidence, witnesses, route knowledge and who might recognise the work.</p>

      <h3>The Cistern Plate</h3>
      <p>The Plate reached Greywake intact. Its exact function, compatibility, custody, examination and practical consequences remain unresolved.</p>

      <h3>Ash-Plate's recovery</h3>
      <p>Ash-Plate returned alive but injured and cannot simply return to carrying loads. Assessment, treatment, cost and consequences for Great-Shell work remain unresolved.</p>

      <h2>Completed introduction</h2>
      <p>Clay, Velmira and Odie completed the Kestrel Return rescue during Sessions One to Three. Clay's participation remains historical canon; Marek joined the active party afterwards.</p>
    `;
  }
})();

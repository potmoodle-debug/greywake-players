(() => {
  if (!window.GREYWAKE_DATA || !window.GREYWAKE_CATEGORIES || !window.GREYWAKE_EDGES) return;

  window.GREYWAKE_DATA["Jobs & Open Threads"] = {
    title: "What's Out There",
    category: "Possibilities",
    html: `
      <p>This is not a quest log. It is a record of things the party knows exist, people they could speak to, places they could investigate, and problems they could choose to become involved in.</p>
      <p><strong>Nothing here is the campaign until you decide to pursue it.</strong> Some possibilities come from Greywake itself; others begin with something a player has said their character wants to follow.</p>

      <h2>Player-originated possibilities</h2>
      <p>These began with something one of the characters put at the front of their mind, then developed into a concrete lead the party could actually pursue. They are shared possibilities, not obligations.</p>

      <h3>Marek — Find a Flickerfly</h3>
      <p><strong>Status:</strong> Player interest; no actionable lead yet</p>
      <p>Marek wants to find and study a flickerfly. The interest is established, but a specific sighting, witness, specimen, route or cardinal direction is not.</p>
      <p>The first step is finding a credible in-world source. Until that happens, this is not a selectable Wastes expedition.</p>

      <h3>Velmira — An Earlier Stilling Case</h3>
      <p><strong>Status:</strong> Player proposal / known lead</p>
      <p>One of the earlier publicly known Stilling cases apparently seemed to stabilise for a time after the person had been somewhere outside Greywake.</p>
      <p>Velmira wants to find that place and see whether anything there might help Nemi. The place is still identifiable, but the exact direction has not yet been established and nobody knows whether the journey actually caused the apparent improvement.</p>

      <h3>Odie — The Closing Ways</h3>
      <p><strong>Status:</strong> Active Greywake problem; one concealed way reopened</p>
      <p>Odie and Marek reopened one deliberately packed southern Digger way. The route is passable but visibly disturbed.</p>
      <p>Odie established that the final packing was done from the Greywake side and is returning with Spencer so the original closure work can be inspected. Who is exposing or closing the concealed ways, and why, remains unresolved.</p>

      <h2>Beyond Greywake</h2>

      <h3>↓ South — Something Moved In</h3>
      <p><strong>Status:</strong> Rumour / possible expedition</p>
      <p>Word among the Diggers is that work at an old ruin south of Greywake has stopped because something dangerous has nested inside the dig site. Nobody seems certain what the creature is, or why it chose that particular ruin.</p>
      <p>You could investigate it, ask around first, leave it alone, approach the problem without killing the creature, or never go there at all.</p>

      <h3>→ East — Freight at Ash-Plate Groundfall</h3>
      <p><strong>Status:</strong> Selectable external opportunity</p>
      <p>Significant expensive freight was deliberately left behind rather than risk lives recovering it while Ash-Plate was injured and the survivors were exhausted.</p>
      <p>The party travelled the Kestrel Return route and knows the Groundfall lies east of Greywake. The freight may still be recoverable, though its present condition and current hazards are unknown.</p>

      <p><strong>North:</strong> no current known external expedition.</p>
      <p><strong>East:</strong> Ash-Plate Groundfall is a known return expedition along the Kestrel Return route.</p>
      <p><strong>West:</strong> no current known external expedition.</p>

      <h2>Things you could pursue in Greywake</h2>

      <h3>The altered route markers</h3>
      <p><strong>Status:</strong> Unresolved</p>
      <p>At least two route markers were deliberately altered. The party does not know who did it, when, why, or whether the same person was responsible for both.</p>
      <p>This can begin inside Greywake by speaking to people, comparing route knowledge or examining known evidence. The party has encountered altered markers during the Kestrel Return, but this record does not establish a shared cardinal direction for those sites.</p>

      <h3>The Cistern Plate</h3>
      <p><strong>Status:</strong> Back in Greywake</p>
      <p>The Plate reached Greywake intact. Its custody, examination and practical consequences were not resolved during the return.</p>
      <p>People in Greywake may act on that without waiting for the party. The players can involve themselves only if they decide it matters to them.</p>

      <h3>Ash-Plate's recovery</h3>
      <p><strong>Status:</strong> Safely home and recovering</p>
      <p>Ash-Plate returned injured and needs proper assessment before returning to work. This is part of Greywake's continuing life rather than an obligation placed on the party.</p>

      <h3>Other work in Greywake</h3>
      <p><strong>Status:</strong> Always possible</p>
      <p>Greywake has repairs, shortages, animals, trade, water, disputes, medicine, salvage and people who need help. Not every problem is an expedition and not every request needs an answer.</p>
      <p>Talking to people your characters already know is enough to discover what currently matters to them.</p>

      <h2>Background consequences from the Kestrel Return</h2>
      <p>The Kestrel Return expedition was the opening situation that brought the party into play. Its consequences remain real, but they are <strong>not assumed to be the party's next story</strong>. Greywake's NPCs and factions can deal with these matters unless the players choose to get involved.</p>

      <h2>Completed introduction</h2>
      <h3>Kestrel Return — bring the survivors and cargo home</h3>
      <p><strong>Status:</strong> Completed</p>
      <p>Clay, Odie and Velmira broke the cacklemaw attack at Stone-Lip Hollow, brought Maela, Rennic, Sarn, Bessa and Joric home alive, returned Lowbell and the injured Ash-Plate to Greywake, and delivered the Cistern Plate intact.</p>
      <p>They chose the longer, safer route and deliberately sacrificed expensive freight rather than gamble with lives.</p>

      <h3>Find Kestrel Return</h3>
      <p><strong>Status:</strong> Completed</p>
      <p>The party followed the failed caravan route, found Joric alive, reached Stone-Lip Hollow and rejoined the surviving crew.</p>
    `
  };

  window.GREYWAKE_CATEGORIES["Possibilities"] = ["Jobs & Open Threads"];

  const edgesToAdd = [
    ["Jobs & Open Threads", "Player Brain"],
    ["Jobs & Open Threads", "Greywake"]
  ];

  edgesToAdd.forEach(edge => {
    const exists = window.GREYWAKE_EDGES.some(e =>
      (e[0] === edge[0] && e[1] === edge[1]) || (e[0] === edge[1] && e[1] === edge[0])
    );
    if (!exists) window.GREYWAKE_EDGES.push(edge);
  });
})();

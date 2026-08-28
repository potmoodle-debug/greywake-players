(() => {
  if (!window.GREYWAKE_DATA || !window.GREYWAKE_CATEGORIES || !window.GREYWAKE_EDGES) return;

  window.GREYWAKE_DATA["Jobs & Open Threads"] = {
    title: "What's Out There",
    category: "Possibilities",
    html: `
      <p>This is not a quest log. It is a record of things the party knows exist, people they could speak to, places they could investigate, and problems they could choose to become involved in.</p>
      <p><strong>Nothing here is the campaign until you decide to pursue it.</strong> You can follow a possibility, ignore it, return to it later, or choose a direction that is not listed here at all.</p>

      <h2>Player-chosen direction</h2>
      <p><strong>Current active direction:</strong> none selected yet.</p>
      <p>When the party takes meaningful action toward something, it can become an active thread. Until then these are simply possibilities in a living Greywake.</p>

      <h2>Things you could follow</h2>

      <h3>Something Moved In</h3>
      <p><strong>Status:</strong> Rumour</p>
      <p>Word among the Diggers is that work at an old ruin has stopped because something dangerous has nested inside the dig site. Nobody seems certain what the creature is, or why it chose that particular ruin.</p>
      <p>You could investigate it, ask around, leave it alone, approach the problem without killing the creature, or never go there at all.</p>

      <h3>Work in Greywake</h3>
      <p><strong>Status:</strong> Always possible</p>
      <p>Greywake has repairs, shortages, animals, trade, water, disputes, medicine, salvage and people who need help. Not every problem is an expedition and not every request needs an answer.</p>
      <p>Talking to people your characters already know is enough to discover what currently matters to them.</p>

      <h3>Beyond Greywake</h3>
      <p><strong>Status:</strong> Open exploration</p>
      <p>Routes, abandoned shelters, failed cisterns, ruins, creature territories and places nobody has checked recently remain beyond the settlement.</p>
      <p>The party does not need a formal job before choosing to go somewhere. Curiosity, need, a rumour, a personal question or a practical goal are all valid reasons to head into the wastes.</p>

      <h2>Background consequences from the Kestrel Return</h2>
      <p>The Kestrel Return expedition was the opening situation that brought the party into play. Its consequences remain real, but they are <strong>not assumed to be the party's next story</strong>. Greywake's NPCs and factions can deal with these matters unless the players choose to get involved.</p>

      <h3>The altered route markers</h3>
      <p><strong>Status:</strong> Unresolved background consequence</p>
      <p>At least two route markers were deliberately altered. The party does not know who did it, when, why, or whether the same person was responsible for both.</p>
      <p>This remains true in the world. It does not require the party to investigate it.</p>

      <h3>The Cistern Plate</h3>
      <p><strong>Status:</strong> Back in Greywake</p>
      <p>The Plate reached Greywake intact. Its custody, examination and practical consequences were not resolved during the return.</p>
      <p>People in Greywake may act on that without waiting for the party. The players can involve themselves only if they decide it matters to them.</p>

      <h3>The freight left at Ash-Plate Groundfall</h3>
      <p><strong>Status:</strong> Left in the wastes</p>
      <p>Significant expensive freight was deliberately abandoned rather than risk lives recovering it.</p>
      <p>Its owners, scavengers, animals or other travellers may affect what happens next. It is not automatically a recovery mission.</p>

      <h3>Ash-Plate's recovery</h3>
      <p><strong>Status:</strong> Safely home and recovering</p>
      <p>Ash-Plate returned injured and needs proper assessment before returning to work. This is part of Greywake's continuing life rather than an obligation placed on the party.</p>

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

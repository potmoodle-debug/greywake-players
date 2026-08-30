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
      <p>For any selectable expedition beyond Greywake and Greater Greywake, the broad direction will be shown before you choose it. Exact paths, hazards and hidden causes may still be unknown.</p>

      <h2>Beyond Greywake</h2>

      <h3>↓ South — Something Moved In</h3>
      <p><strong>Status:</strong> Rumour / possible expedition</p>
      <p>Word among the Diggers is that work at an old ruin south of Greywake has stopped because something dangerous has nested inside the dig site. Nobody seems certain what the creature is, or why it chose that particular ruin.</p>
      <p>You could investigate it, ask around first, leave it alone, approach the problem without killing the creature, or never go there at all.</p>

      <h3>→ East — Freight at Ash-Plate Groundfall</h3>
      <p><strong>Status:</strong> Abandoned, potentially recoverable</p>
      <p>Significant expensive freight was deliberately left behind rather than risk lives recovering it while Ash-Plate was injured and the survivors were exhausted.</p>
      <p>Ash-Plate Groundfall lies on the eastern Kestrel Return route corridor through Old Marker Wash. The party travelled this route during Sessions One to Three, so its broad direction is known even though exact current hazards and the freight's present condition are not.</p>

      <p><strong>North:</strong> no current known external expedition.</p>
      <p><strong>East:</strong> the Kestrel Return road, Old Marker Wash, Ash-Plate Groundfall and Stone-Lip Hollow lie on this corridor; recovering the abandoned freight is a current known possibility.</p>
      <p><strong>West:</strong> no current known external expedition.</p>

      <h2>Things you could pursue in Greywake</h2>

      <h3>The altered route markers</h3>
      <p><strong>Status:</strong> Unresolved</p>
      <p>At least two route markers were deliberately altered. The party does not know who did it, when, why, or whether the same person was responsible for both.</p>
      <p>This can begin inside Greywake by speaking to people, comparing route knowledge or examining known evidence. The marker sites already encountered during the Kestrel Return lie on the eastern route corridor.</p>

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

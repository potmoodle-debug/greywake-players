(() => {
  if (!window.GREYWAKE_DATA || !window.GREYWAKE_CATEGORIES || !window.GREYWAKE_EDGES) return;

  window.GREYWAKE_DATA["Jobs & Open Threads"] = {
    title: "Jobs & Open Threads",
    category: "Jobs & Open Threads",
    html: `
      <p>This is the party's shared record of unfinished business: jobs people have asked you to do, situations still in motion, rumours worth following, and leads you may choose to pursue.</p>
      <p>It is <strong>not</strong> a list of things the GM expects you to do. A thread can be followed, ignored, delayed, changed or abandoned. Greywake will continue to change around those choices.</p>

      <h2>Open leads</h2>
      <h3>Someone is altering the route markers</h3>
      <p><strong>Status:</strong> Unresolved</p>
      <p><strong>Known evidence:</strong> At least two markers have been deliberately altered.</p>
      <p>The first bad marker helped send Kestrel Return onto the wrong lower line before the ground failed. On the journey home, the group found another old marker deliberately recut so that a competent traveller could be drawn away from the safer High Shelf route and toward the lower line.</p>
      <p>Odie restored the second marker to its original meaning, with Clay helping reconstruct the correct reading, while leaving visible evidence of the tampering for later inspection.</p>
      <p>The party does not know who altered either marker, when the work was done, whether the same person was responsible for both, or why anyone would want travellers sent onto the more dangerous route.</p>

      <h3>The Cistern Plate</h3>
      <p><strong>Status:</strong> Back in Greywake — unresolved</p>
      <p>The recovered precision-made ceramic waterworks plate reached Greywake intact. It is not Oldwork, but Rennic believed it could matter to the settlement's waterworks.</p>
      <p>What it can actually do, who takes responsibility for examining it, and what changes it might make possible are still unresolved.</p>

      <h3>The freight left at Ash-Plate Groundfall</h3>
      <p><strong>Status:</strong> Abandoned, potentially recoverable</p>
      <p>The group deliberately left significant expensive caravan freight behind rather than risk lives by returning for it while Ash-Plate was injured and the survivors were exhausted.</p>
      <p>The freight remains out in the wastes. Whether anyone attempts to recover it — and what may have happened to it in the meantime — is an open question.</p>

      <h3>Ash-Plate's recovery</h3>
      <p><strong>Status:</strong> Injured, safely back in Greywake</p>
      <p>Ash-Plate made the return journey under her own strength but carried no load. She is back in Greywake and needs proper assessment and recovery before she can return to work.</p>

      <h2>Rumours</h2>
      <h3>Something Moved In</h3>
      <p><strong>Status:</strong> Rumour / possible expedition lead</p>
      <p>Word among the Diggers is that work at an old ruin has stopped because something dangerous has nested inside the dig site. Nobody seems certain what the creature is, or why it chose that particular ruin.</p>
      <p>The Diggers will not resume work while it remains there. Clearing the site could mean killing the animal, driving it off, relocating it, or discovering and removing whatever drew it there in the first place.</p>
      <p>There is also talk that helping get the dig moving again could earn access to a <strong>Minor Stamina Potion recipe</strong>.</p>

      <h2>Completed</h2>
      <h3>Kestrel Return — bring the survivors and cargo home</h3>
      <p><strong>Status:</strong> Completed</p>
      <p>Clay, Odie and Velmira broke the cacklemaw attack at Stone-Lip Hollow, brought Maela, Rennic, Sarn, Bessa and Joric home alive, returned Lowbell and the injured Ash-Plate to Greywake, and delivered the Cistern Plate intact.</p>
      <p>They chose the longer, safer route and deliberately sacrificed expensive freight rather than gamble with lives.</p>

      <h3>Find Kestrel Return</h3>
      <p><strong>Status:</strong> Completed</p>
      <p>The party followed the failed caravan route, found Joric alive, reached Stone-Lip Hollow and rejoined the surviving crew.</p>
    `
  };

  window.GREYWAKE_CATEGORIES["Jobs & Open Threads"] = ["Jobs & Open Threads"];

  const edgesToAdd = [
    ["Jobs & Open Threads", "Player Brain"],
    ["Jobs & Open Threads", "Session 03 — Player Recap"],
    ["Jobs & Open Threads", "Greywake"],
    ["Jobs & Open Threads", "Stone-Lip Hollow"],
    ["Jobs & Open Threads", "Great-Shell"]
  ];

  edgesToAdd.forEach(edge => {
    const exists = window.GREYWAKE_EDGES.some(e =>
      (e[0] === edge[0] && e[1] === edge[1]) || (e[0] === edge[1] && e[1] === edge[0])
    );
    if (!exists) window.GREYWAKE_EDGES.push(edge);
  });
})();

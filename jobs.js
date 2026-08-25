(() => {
  if (!window.GREYWAKE_DATA || !window.GREYWAKE_CATEGORIES || !window.GREYWAKE_EDGES) return;

  window.GREYWAKE_DATA["Jobs & Open Threads"] = {
    title: "Jobs & Open Threads",
    category: "Jobs & Open Threads",
    html: `
      <p>This is the party's shared record of unfinished business: jobs people have asked you to do, situations still in motion, and leads you may choose to follow.</p>
      <p>It is <strong>not</strong> a list of things the GM expects you to do. An open thread can be followed, ignored, delayed, changed or abandoned.</p>

      <h2>Rumours</h2>
      <h3>Something Moved In</h3>
      <p>Word has spread that a Digger site in an old ruin has gone quiet. The crew working it pulled out after something dangerous made a nest somewhere inside, and they have refused to go back while it remains there.</p>
      <p>Nobody seems certain what the creature is, or why it chose that ruin in particular. Some say it simply found shelter. Others think the Diggers uncovered something that drew it in.</p>
      <p>If the site could be made safe again, the dig could continue. There is also talk that useful practical knowledge may change hands for whoever helps solve the problem — including a recipe for a minor stamina potion.</p>

      <h2>In progress</h2>
      <h3>Kestrel Return — get people and cargo home</h3>
      <p><strong>Status:</strong> In progress</p>
      <p><strong>Where:</strong> Stone-Lip Hollow</p>
      <p>The surviving Kestrel Return crew, Lowbell, the surviving sled and the recovered ceramic waterworks plate are still away from Greywake. The cacklemaw attack was still active when play stopped.</p>
      <p><strong>What remains unresolved:</strong> survive the immediate attack and decide how to get the survivors, beasts and recovered cargo back to Greywake.</p>

      <h2>Open leads</h2>
      <h3>The wrong route marker</h3>
      <p><strong>Status:</strong> Unresolved</p>
      <p>While tracing Kestrel Return's route, the party learned that an old marker had sent the caravan onto the wrong lower line before the ground failed.</p>
      <p>The party knows the marker was wrong. They do not yet know why.</p>

      <h3>The recovered waterworks plate</h3>
      <p><strong>Status:</strong> Waiting on return to Greywake</p>
      <p>The heavy pale case contained a precision-made ceramic waterworks plate recovered from an abandoned route cistern. It is not Oldwork. Rennic believed it could matter to Greywake's waterworks.</p>
      <p>What it can actually do for Greywake remains to be established.</p>

      <h2>Completed</h2>
      <h3>Find Kestrel Return</h3>
      <p><strong>Status:</strong> Completed</p>
      <p>The party followed the failed caravan route, found Joric alive, reached Stone-Lip Hollow and rejoined the surviving crew.</p>
    `
  };

  window.GREYWAKE_CATEGORIES["Jobs & Open Threads"] = ["Jobs & Open Threads"];

  const edgesToAdd = [
    ["Jobs & Open Threads", "Player Brain"],
    ["Jobs & Open Threads", "Stone-Lip Hollow"],
    ["Jobs & Open Threads", "Session 01 — Player Recap"],
    ["Jobs & Open Threads", "Session 02 — Player Recap"],
    ["Jobs & Open Threads", "Joric's Runnel"]
  ];

  edgesToAdd.forEach(edge => {
    const exists = window.GREYWAKE_EDGES.some(e =>
      (e[0] === edge[0] && e[1] === edge[1]) || (e[0] === edge[1] && e[1] === edge[0])
    );
    if (!exists) window.GREYWAKE_EDGES.push(edge);
  });
})();

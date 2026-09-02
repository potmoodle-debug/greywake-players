// Additional spoiler-safe Greywake location entries.
window.GREYWAKE_DATA = window.GREYWAKE_DATA || {};
window.GREYWAKE_EDGES = window.GREYWAKE_EDGES || [];
window.GREYWAKE_CATEGORIES = window.GREYWAKE_CATEGORIES || {};

window.GREYWAKE_DATA["Caravan Gate"] = {
  title: "Caravan Gate",
  category: "Locations",
  html: `<p>Greywake's main controlled entry and exit point for caravan traffic and journeys into the wastes. It is practical rather than grand: patched walls, guards, route ledgers, animal handling space and people trying to work out who is leaving, who is late and who has come back.</p>
<p>The gate is a natural pressure point for route arguments, caravan business and families waiting for news. Great-Shells, handlers, guards and Syndicate workers all pass through its orbit, so trouble on the roads often becomes public here before the whole settlement understands what happened.</p>
<h2>Session One</h2>
<p>The campaign began here when Talla returned with an incomplete warning about Kestrel Return. Clay, Velmira and Odie stepped forward from the crowd and left Greywake to find the caravan.</p>`
};

if (!window.GREYWAKE_CATEGORIES["Locations"]) window.GREYWAKE_CATEGORIES["Locations"] = [];
if (!window.GREYWAKE_CATEGORIES["Locations"].includes("Caravan Gate")) {
  window.GREYWAKE_CATEGORIES["Locations"].splice(1, 0, "Caravan Gate");
}

const additionalLocationEdges = [
  ["Caravan Gate", "Greywake"],
  ["Caravan Gate", "Known Locations"],
  ["Caravan Gate", "Session 01 — Player Recap"],
  ["Caravan Gate", "Clay"],
  ["Caravan Gate", "Velmira"],
  ["Caravan Gate", "Odie"]
];

for (const edge of additionalLocationEdges) {
  if (!window.GREYWAKE_EDGES.some(existing => existing[0] === edge[0] && existing[1] === edge[1])) {
    window.GREYWAKE_EDGES.push(edge);
  }
}

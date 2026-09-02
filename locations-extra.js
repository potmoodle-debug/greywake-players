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

window.GREYWAKE_DATA["Glasswind"] = {
  title: "Glasswind",
  category: "Locations",
  html: `<p><strong>South · 4 hexes from Greywake · roughly two days one-way before rests or delays · Tier 2 expedition pressure.</strong></p>
<p>Glasswind is a broad southern region of exposed vitrified stone, pale shelves, fractured mineral fins and dark gravel channels. It often announces itself by sound before sight: wind moving over the mineral fins produces thin ringing, scraping and chattering tones.</p>
<blockquote>Dark ground carries. Bright ground cuts.</blockquote>
<h2>What people commonly know</h2>
<ul>
<li>The dark gravel channels are generally the safer ground to travel.</li>
<li>Bright exposed shelves can cut boots, straps and equipment, while wind and glare make exposed crossings harder.</li>
<li>Diggers work parts of Glasswind for useful mineral fragments rather than great treasure.</li>
<li>Glass Snakes are strongly associated with the region.</li>
<li>Wirethorn often grows where fractures or sheltered pockets collect dust and a little moisture.</li>
</ul>
<h2>Ways through</h2>
<ul>
<li><strong>Central crossing:</strong> fastest, but the most exposed to wind, glare, sharp ground and the densest mineral fins.</li>
<li><strong>Eastern lee:</strong> roughly a quarter-day slower, with more shelter, gravel and vegetation while remaining distinctly Glasswind.</li>
<li><strong>Go around:</strong> roughly a half-day slower, avoiding most Glasswind-specific ground but trading it for longer exposure to the ordinary southern wastes.</li>
</ul>
<p>There is no universally safest choice. Weather, daylight, supplies and what travellers are trying to accomplish can change which route makes sense.</p>`
};

if (!window.GREYWAKE_CATEGORIES["Locations"]) window.GREYWAKE_CATEGORIES["Locations"] = [];
if (!window.GREYWAKE_CATEGORIES["Locations"].includes("Caravan Gate")) {
  window.GREYWAKE_CATEGORIES["Locations"].splice(1, 0, "Caravan Gate");
}
if (!window.GREYWAKE_CATEGORIES["Locations"].includes("Glasswind")) {
  window.GREYWAKE_CATEGORIES["Locations"].push("Glasswind");
}

const additionalLocationEdges = [
  ["Caravan Gate", "Greywake"],
  ["Caravan Gate", "Known Locations"],
  ["Caravan Gate", "Session 01 — Player Recap"],
  ["Caravan Gate", "Clay"],
  ["Caravan Gate", "Velmira"],
  ["Caravan Gate", "Odie"],
  ["Glasswind", "Known Locations"],
  ["Glasswind", "Greywake"]
];

for (const edge of additionalLocationEdges) {
  if (!window.GREYWAKE_EDGES.some(existing => existing[0] === edge[0] && existing[1] === edge[1])) {
    window.GREYWAKE_EDGES.push(edge);
  }
}

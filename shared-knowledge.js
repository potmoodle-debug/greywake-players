// Shared, spoiler-safe Greywake knowledge established before or during play.
window.GREYWAKE_DATA = window.GREYWAKE_DATA || {};
window.GREYWAKE_EDGES = window.GREYWAKE_EDGES || [];
window.GREYWAKE_CATEGORIES = window.GREYWAKE_CATEGORIES || {};

function addKnown(name, category, html) {
  if (!window.GREYWAKE_DATA[name]) window.GREYWAKE_DATA[name] = { title: name, category, html };
  if (!window.GREYWAKE_CATEGORIES[category]) window.GREYWAKE_CATEGORIES[category] = [];
  if (!window.GREYWAKE_CATEGORIES[category].includes(name)) window.GREYWAKE_CATEGORIES[category].push(name);
}
function linkKnown(a,b){
  if (!window.GREYWAKE_EDGES.some(e => e[0]===a && e[1]===b)) window.GREYWAKE_EDGES.push([a,b]);
}

addKnown("White Tower","Locations",`<p>The impossibly old white Tower stands at the centre of Greywake. Its surface is smooth, brilliantly pale and has no visible doors, windows, stairs or other obvious entrance.</p><p>The Tower Watch observes it and keeps records. The Faithful attach religious meaning to it. Neither group has a complete public explanation for what it is.</p>`);
addKnown("Valve Court","Locations",`<p>The controlled public point where Greywake's rationed water is distributed. The Cistern Keepers manage access, measurements, queues and the valves used in ordinary distribution.</p><p>For most people, this is where Greywake's water system becomes visible: not as a reservoir, but as rules, containers, records and carefully measured allotments.</p>`);
addKnown("Great-Shell Pens","Locations",`<p>Working pens in Greater Greywake where Great-Shells are handled, rested, harnessed and prepared for caravan work. They sit outside the maintained inner settlement where there is room for large beasts, loads and movement.</p>`);
addKnown("Digger Yards","Locations",`<p>Working salvage yards in Greater Greywake where recovered material is sorted, assessed and reused. Diggers bring back useful ceramics, metal, tools, fittings and Oldwork fragments rather than treasure in the heroic sense.</p>`);
addKnown("Digger Ways","Locations",`
<div class="digger-guide">
  <header class="digger-hero">
    <img src="assets/generated-scenes/digger-yards.webp" alt="The Digger Yards: a place where useful salvage returns to Greywake" loading="lazy" decoding="async">
    <div class="digger-hero-shade"></div>
    <div class="digger-hero-text"><span>GREYWAKE FIELD GUIDE · KNOWN TO LOCALS</span><h2>Beneath the streets.</h2><p>A thousand repairs above. A patchwork of passages below.</p></div>
  </header>
  <div class="digger-lede"><span class="digger-dropcap">W</span><p>Greywake stands upon older ruins. Beneath its streets and around its edges are buried rooms, collapsed corridors and passages left behind by structures that no longer stand. For generations, Diggers have cleared and joined some of these spaces into the working routes now called the <strong>Digger Ways</strong>.</p></div>
  <figure class="digger-cutaway" aria-label="Illustrative cross-section showing older buried passages and newer Digger-made connecting tunnels. This is not an actual route map.">
    <div class="digger-diagram-head"><span>BELOW GREYWAKE</span><strong>How the Ways fit together</strong><small>Illustration only · not a known route map</small></div>
    <div class="digger-ground"><div class="digger-building a"></div><div class="digger-building b"></div><div class="digger-building c"></div><span>SURFACE · PATCHED STREETS AND BUILDINGS</span></div>
    <div class="digger-earth">
      <div class="digger-ruin ruin-one"><span>01</span> Older buried passage</div>
      <div class="digger-join"><span>02</span> Newer Digger-made link</div>
      <div class="digger-ruin ruin-two"><span>03</span> Reused buried structure</div>
      <div class="digger-rubble"></div>
    </div>
    <figcaption><span><b>01</b> Old spaces</span><span><b>02</b> Dug connections</span><span><b>03</b> Reused ruins</span></figcaption>
  </figure>
  <div class="digger-quickfacts">
    <div><span>01 / PURPOSE</span><strong>Salvage & passage</strong><p>Recover useful material and move it without always using the public gates.</p></div>
    <div><span>02 / KNOWLEDGE</span><strong>No master map</strong><p>Different crews know different stretches; a useful entrance is valuable knowledge.</p></div>
    <div><span>03 / DANGER</span><strong>Ground that shifts</strong><p>Braced routes can fail; older rooms may be unstable or blocked.</p></div>
  </div>
  <section class="digger-story"><div class="digger-story-number">I</div><div><h2>Why they matter</h2><p>Greywake survives by keeping broken things useful. Metal, ceramic, fittings, tools and fragments of old machinery may keep a home, cart or piece of infrastructure working. The Digger Ways help workers reach buried places and bring those finds back.</p><p>Much organised trade passes through the gates, where the Caravan Syndicate has influence. Concealed ways can let a Digger retain control of their own finds and avoid unwanted scrutiny.</p></div></section>
  <section class="digger-story"><div class="digger-story-number">II</div><div><h2>What the Ways are not</h2><p>They are <strong>not one planned underground tunnel system</strong>. Some stretches were built long before Greywake; others were cleared, cut or connected much later. There is no universally known map. These are working routes, not treasure-filled dungeons.</p></div></section>
  <aside class="digger-closure"><div class="digger-closure-mark" aria-hidden="true">✕</div><div><span>WHAT HAS CHANGED</span><h2>Some of the Ways have been deliberately closed.</h2><p>A blocked entrance may cut someone off from salvage, make a journey longer and more dangerous, or end a crew's work. Several concealed entrances have recently been blocked. <strong>Who did it, why, and how they knew where to find them are still unknown.</strong></p></div></aside>
</div>`);

addKnown("Cistern Keepers","Factions",`<p>The people who control Greywake's water distribution, valves, ration records and cistern maintenance. Their authority is practical and immediate because every household depends on the system continuing to work.</p>`);
addKnown("Caravan Syndicate","Factions",`<p>The organisation that coordinates long-distance trade, caravan movement, Great-Shell transport, supply contracts and route logistics. It does not need to rule Greywake to matter: it controls much of what can still move in and out.</p>`);
addKnown("Tower Watch","Factions",`<p>The Watch maintains observation of the White Tower, records unusual events and protects the Tower precinct. They are known for observations and records, not for possessing a final answer to the Tower.</p>`);
addKnown("The Diggers","Factions",`<p>Salvagers who work buried streets, ruins and abandoned infrastructure for useful material. Their work feeds Greywake's repair culture with ceramics, fittings, metal, tools and fragments that can still serve a purpose.</p>`);
addKnown("The Faithful","Factions",`<p>A religious community that believes the White Tower has sacred significance. Their public influence comes through belief, ritual, comfort and interpretation rather than proof of what the Tower is.</p>`);

addKnown("Kestrel Return","Caravans",`<p>The caravan whose failed return triggered the first expedition of the campaign. It had been coming back toward Greywake after collecting a seasonal route-maintenance crew and recovered materials from Greater Greywake.</p><p>Its route failure, groundfall and cacklemaw attack led Clay, Velmira and Odie out from the Caravan Gate to find the survivors.</p>`);

addKnown("Talla Reed","People",`<p>The runner who made it back to Greywake with the first incomplete warning that something had gone wrong with Kestrel Return.</p><p>Her arrival at the Caravan Gate was the moment the settlement realised the caravan was in serious trouble.</p>`);
addKnown("Joric Noll","People",`<p>A member of Kestrel Return found injured and alive at the broken runnels. The party extracted him, and he later rejoined the surviving caravan crew at Stone-Lip Hollow.</p>`);
addKnown("Maela Rusk","People",`<p>One of Kestrel Return's surviving caravan leaders. She was part of the group caught in the route failure and groundfall that split the caravan.</p>`);
addKnown("Sarn Pell","People",`<p>A Great-Shell handler travelling with Kestrel Return and one of the people caught up in the caravan disaster.</p>`);
addKnown("Rennic Vale","People",`<p>A Kestrel Return survivor who protected the heavy pale transport case and insisted that it had to remain flat while the survivors moved toward Stone-Lip Hollow.</p>`);

addKnown("Hopkins","Flora & Fauna",`<p>Clay's giant kangaroo-rat companion and working scout-beast. Hopkins is quick, alert and useful for noticing movement, danger and disturbances ahead of the group.</p>`);
addKnown("Ash-Plate","Flora & Fauna",`<p>A Great-Shell from Kestrel Return. The party freed Ash-Plate after the caravan disaster and kept the beast alive. By Stone-Lip Hollow, Ash-Plate could no longer carry passengers or cargo.</p>`);
addKnown("Lowbell","Flora & Fauna",`<p>A Great-Shell with the surviving caravan group at Stone-Lip Hollow. Lowbell remained usable alongside the surviving sled during the cacklemaw attack.</p>`);

addKnown("Old Marker Wash","Locations",`<p>A known stretch on Kestrel Return's route and one of the places tied to the caravan's failed return. The party followed the caravan's trail through this country while looking for survivors.</p>`);
addKnown("High Shelf","Locations",`<p>A higher section of Kestrel Return's return route, reached before the old marker line and the route failure that followed.</p>`);
addKnown("Old Marker Line","Locations",`<p>The marked route Kestrel Return was following before reaching the failed marker. The party later traced the same line while reconstructing what had happened.</p>`);
addKnown("Failed Marker","Locations",`<p>An old route marker that had sent Kestrel Return onto the wrong lower line. By the time the party investigated it, the important fact was clear: the marker had directed the caravan where it should not have gone.</p>`);
addKnown("Wrong Lower Line","Locations",`<p>The lower route Kestrel Return took after the failed marker diverted them. It led toward the groundfall that split the caravan.</p>`);
addKnown("Ash-Plate Groundfall","Locations",`<p>The place where the ground failed beneath Kestrel Return while the caravan was under load. People, beasts and cargo were separated there before the cacklemaws became the immediate threat.</p>`);
addKnown("Broken Runnels","Locations",`<p>A broken runnel area reached while following the caravan's trail. Joric was found injured in this stretch before the party continued toward Stone-Lip Hollow.</p>`);

[
 ["White Tower","Greywake"],["White Tower","Tower Watch"],["White Tower","The Faithful"],
 ["Valve Court","Greywake"],["Valve Court","Cistern Keepers"],
 ["Great-Shell Pens","Greater Greywake"],["Great-Shell Pens","Great-Shell"],
 ["Digger Yards","Greater Greywake"],["Digger Yards","The Diggers"],
 ["Digger Ways","Greywake"],["Digger Ways","The Diggers"],["Digger Ways","Digger Yards"],
 ["Caravan Syndicate","Caravan Gate"],["Caravan Syndicate","Kestrel Return"],
 ["Kestrel Return","Session 01 — Player Recap"],["Kestrel Return","Talla Reed"],["Kestrel Return","Joric Noll"],["Kestrel Return","Maela Rusk"],["Kestrel Return","Sarn Pell"],["Kestrel Return","Rennic Vale"],["Kestrel Return","Ash-Plate"],["Kestrel Return","Lowbell"],
 ["Hopkins","Clay"],["Ash-Plate","Great-Shell"],["Lowbell","Great-Shell"],
 ["Old Marker Wash","Kestrel Return"],["High Shelf","Kestrel Return"],["Old Marker Line","Kestrel Return"],["Failed Marker","Kestrel Return"],["Wrong Lower Line","Kestrel Return"],["Ash-Plate Groundfall","Kestrel Return"],["Broken Runnels","Kestrel Return"],
 ["Broken Runnels","Joric Noll"],["Ash-Plate Groundfall","Ash-Plate"],
 ["Talla Reed","Caravan Gate"]
].forEach(e=>linkKnown(e[0],e[1]));

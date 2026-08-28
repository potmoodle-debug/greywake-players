// Additional spoiler-safe player reference records.
window.GREYWAKE_DATA=window.GREYWAKE_DATA||{};
window.GREYWAKE_EDGES=window.GREYWAKE_EDGES||[];
window.GREYWAKE_CATEGORIES=window.GREYWAKE_CATEGORIES||{};

function addReference(name,category,html){
  if(!window.GREYWAKE_DATA[name])window.GREYWAKE_DATA[name]={title:name,category,html};
  if(!window.GREYWAKE_CATEGORIES[category])window.GREYWAKE_CATEGORIES[category]=[];
  if(!window.GREYWAKE_CATEGORIES[category].includes(name))window.GREYWAKE_CATEGORIES[category].push(name);
}
function linkReference(a,b){
  if(!window.GREYWAKE_EDGES.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a)))window.GREYWAKE_EDGES.push([a,b]);
}

addReference("Inner Greywake","Locations",`<p>Inner Greywake is the maintained, protected part of the settlement inside the current working perimeter. It is the part people still actively hold together: homes, working lanes, public spaces and the infrastructure Greywake cannot afford to lose.</p><p>Beyond it lies Greater Greywake, where older streets, yards and structures have been partly abandoned or reclaimed by sand.</p>`);

addReference("The Wastes","World",`<p>The country beyond Greywake is dry, exposed and unforgiving. Distance matters as much as danger: heat, exhaustion, damaged equipment, bad navigation and running out of safe options can turn a manageable journey into a fatal one.</p><p>Day travel puts the greatest pressure on heat and endurance. At night the heat eases, but predators and raiders become a larger concern.</p><p>Most experienced travellers judge a route by whether they can still get home, not merely whether they can reach the destination.</p>`);

addReference("Travel & Routes","Player Reference",`<p>Greywake travellers think about journeys in practical terms: <strong>time, routes, landmarks, shelter, conditions and risk</strong>.</p><p>A place might be described as a few hours away, half a day out, a full day's travel, or farther depending on the route and conditions. Experienced travellers care less about a precise map measurement than whether the group can reach the destination and still get home safely.</p><h2>What matters on a route</h2><ul><li>Reliable shade or shelter.</li><li>Known landmarks and route markers.</li><li>Whether the ground is safe for people, Great-Shells and loaded sleds.</li><li>Heat, wind and changing weather.</li><li>Recent predator or raider signs.</li><li>How much daylight remains.</li><li>Whether a rest point is genuinely usable.</li><li>Whether turning back is still possible.</li></ul><p>The safest route is not always the shortest one.</p>`);

addReference("Water & Rest","Player Reference",`<p>Water is tracked because rest outside Greywake depends on having enough to recover.</p><ul><li>A <strong>Short Rest</strong> costs 1 Water per character.</li><li>A <strong>Long Rest</strong> costs 1 Water per character.</li><li>Water is spent when resting, not simply because time passes while travelling.</li></ul><p><strong>Without Water:</strong> a Short Rest provides no benefit. A Long Rest provides only the benefits of a Short Rest.</p><p>Inside Greywake, ordinary water is rationed through Valve Court under the Cistern Keepers.</p>`);

addReference("Repair & Salvage","World",`<p>Greywake repairs far more than it replaces. Cloth is patched, braces are reused, cracked fittings are made useful again and old material is stripped for whatever still works.</p><p>The Diggers recover ceramics, metal, tools, fittings and Oldwork fragments from buried or abandoned places. Fixers such as Odie turn that recovered material into another day of useful life.</p><p>In Greywake, something being broken does not automatically mean it is finished.</p>`);

addReference("Caravan Work","World",`<p>Caravans are one of the ways Greywake remains connected to supplies, workers and information beyond the settlement. The Caravan Syndicate coordinates much of the long-distance movement, while handlers, scouts, guards, load-workers, repairers and Great-Shells do the practical work that makes a journey possible.</p><p>A caravan failure is more than lost cargo. It can mean missing people, injured beasts, shortages, broken contracts and increased pressure on households back in Greywake.</p>`);

addReference("Known Factions","Factions",`<p>The major groups openly known in Greywake are the <strong>Cistern Keepers</strong>, <strong>Caravan Syndicate</strong>, <strong>Tower Watch</strong>, <strong>The Diggers</strong> and <strong>The Faithful</strong>.</p><p>These records describe only their public roles and what the party can safely know. Individual members can disagree, make mistakes and have motives that are not part of the shared archive.</p>`);

addReference("Cistern Plate","Objects",`<p>The large ceramic waterworks plate carried in Kestrel Return's heavy pale transport case.</p><p>The case was opened safely at Stone-Lip Hollow. The plate had been recovered from an abandoned route cistern and was protected carefully during the caravan disaster because it had to remain flat.</p><p>It is <strong>not Oldwork</strong>. Rennic believed it could matter to Greywake's waterworks.</p>`);

addReference("Known Objects","Objects",`<p>Objects appear here once the whole party has seen them or learned enough about them for a shared record.</p><p>The archive records what is known, not every theory about what an object might eventually prove to be.</p>`);

addReference("Sister Elowen","People",`<p>Sister Elowen is a public voice among the Faithful in Greywake. She is associated with the community's rituals, comfort and religious interpretation of the White Tower.</p><p>The Faithful possess belief and conviction, not a proven explanation of the Tower.</p>`);

[
 ["Inner Greywake","Greywake"],["Inner Greywake","Greater Greywake"],["Inner Greywake","Caravan Gate"],["Inner Greywake","Valve Court"],["Inner Greywake","White Tower"],
 ["The Wastes","Greywake"],["The Wastes","Travel & Routes"],["The Wastes","Caravan Work"],["The Wastes","Clay"],
 ["Travel & Routes","Water & Rest"],["Travel & Routes","Caravan Gate"],["Travel & Routes","Split Rock Shade"],["Travel & Routes","Old Marker Wash"],["Travel & Routes","Known Locations"],["Travel & Routes","Player Brain"],
 ["Water & Rest","Valve Court"],["Water & Rest","Cistern Keepers"],["Water & Rest","Greywake"],
 ["Repair & Salvage","The Diggers"],["Repair & Salvage","Digger Yards"],["Repair & Salvage","Odie"],["Repair & Salvage","Greater Greywake"],
 ["Caravan Work","Caravan Syndicate"],["Caravan Work","Great-Shell"],["Caravan Work","Great-Shell Pens"],["Caravan Work","Kestrel Return"],["Caravan Work","Caravan Gate"],
 ["Known Factions","Cistern Keepers"],["Known Factions","Caravan Syndicate"],["Known Factions","Tower Watch"],["Known Factions","The Diggers"],["Known Factions","The Faithful"],["Known Factions","Player Brain"],
 ["Known Objects","Cistern Plate"],["Known Objects","Player Brain"],["Cistern Plate","Kestrel Return"],["Cistern Plate","Rennic Vale"],["Cistern Plate","Stone-Lip Hollow"],["Cistern Plate","Session 02 — Player Recap"],
 ["Sister Elowen","The Faithful"],["Sister Elowen","Greywake"],["Sister Elowen","Known People"]
].forEach(e=>linkReference(e[0],e[1]));

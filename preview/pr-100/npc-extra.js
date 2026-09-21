// Additional spoiler-safe NPC records generated from the LIVE Greywake vault.
window.GREYWAKE_DATA=window.GREYWAKE_DATA||{};
window.GREYWAKE_EDGES=window.GREYWAKE_EDGES||[];
window.GREYWAKE_CATEGORIES=window.GREYWAKE_CATEGORIES||{};

const npcTags=(faction,affiliation='')=>`<div class="npc-affiliation-tags" style="display:flex;flex-wrap:wrap;gap:7px;margin:0 0 14px"><span style="display:inline-flex;align-items:center;border:1px solid rgba(193,168,94,.42);background:rgba(55,46,25,.72);color:#e7d59c;padding:5px 8px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">FACTION · ${faction}</span>${affiliation?`<span style="display:inline-flex;align-items:center;border:1px solid rgba(139,155,163,.38);background:rgba(27,37,41,.72);color:#c9d9df;padding:5px 8px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">AFFILIATION · ${affiliation}</span>`:''}</div>`;

const people={
  "Mara Vell":{
    title:"Mara Vell",
    category:"People",
    faction:"Independent",
    html:`${npcTags('Independent')}<p>Mara Vell is an independent Dust Broker who works near Valve Court under a faded awning. She trades in route rumours, hazard warnings, lost-place names, Digger reports, favours and silence.</p>`
  },
  "High Keeper Varn":{
    title:"High Keeper Varn",
    category:"People",
    faction:"Cistern Keepers",
    html:`${npcTags('Cistern Keepers')}<p>High Keeper Varn leads the Cistern Keepers, the faction responsible for Greywake's water control, ration records, cistern maintenance and valve authority.</p>`
  },
  "Selka Marr":{
    title:"Selka Marr",
    category:"People",
    faction:"Caravan Syndicate",
    html:`${npcTags('Caravan Syndicate')}<p>Selka Marr is a known figure within the Caravan Syndicate, the organisation tied to long-distance trade, guarded caravans, Great-Shell transport and supply contracts.</p>`
  },
  "Brannic Hale":{
    title:"Brannic Hale",
    category:"People",
    faction:"Tower Watch",
    html:`${npcTags('Tower Watch')}<p>Brannic Hale commands the Tower Watch. The Watch observes and records the White Tower, maintains the precinct and treats claims about the Tower as matters for evidence rather than certainty.</p>`
  },
  "Sister Elowen":{
    title:"Sister Elowen",
    category:"People",
    faction:"The Faithful",
    html:`${npcTags('The Faithful')}<p>Sister Elowen is a known voice of the Faithful, offering comfort, ritual and meaning to people trying to understand Greywake's hardships and the White Tower.</p>`
  },
  "Nemi":{
    title:"Nemi",
    category:"People",
    faction:"Not established",
    html:`${npcTags('Not established')}<p>Nemi is a child from Tangle Lanes suffering from an active case of the Stilling. Her condition has become the subject of rumour and competing interpretations around Greywake; none of those interpretations is established here as the truth.</p>`
  },
  "Hessa Vey":{
    title:"Hessa Vey",
    category:"People",
    faction:"The Diggers",
    html:`${npcTags('The Diggers')}<p>Hessa Vey is a senior Digger and salvage-claim organiser. People often turn to her when dangerous recoveries, competing crews or disputed salvage become difficult to sort out.</p><p>She is known for judging whether something is genuinely worth recovering, and for the view that Greywake cannot afford to leave useful material buried simply because somebody insists on a claim they are no longer willing to recover themselves.</p>`
  },
  "Talla Reed":{
    title:"Talla Reed",
    category:"People",
    faction:"Not established",
    affiliation:"Kestrel Return",
    html:`${npcTags('Not established','Kestrel Return')}<p>Talla Reed is the runner who returned to Greywake with the first warning that something had gone wrong on Kestrel Return's route. Her report was urgent and incomplete, but it was enough to send the party outward.</p>`
  },
  "Joric Noll":{
    title:"Joric Noll",
    category:"People",
    faction:"Not established",
    affiliation:"Kestrel Return",
    html:`${npcTags('Not established','Kestrel Return')}<p>Joric Noll is a Kestrel Return crew member the party found injured in the broken runnels. They rescued him and later got him back to the surviving caravan crew at Stone-Lip Hollow.</p>`
  },
  "Maela Rusk":{
    title:"Maela Rusk",
    category:"People",
    faction:"Not established",
    affiliation:"Kestrel Return",
    html:`${npcTags('Not established','Kestrel Return')}<p>Maela Rusk is one of Kestrel Return's surviving caravan leaders. The party reached her group at Stone-Lip Hollow after tracing the failed return route outward from Greywake.</p>`
  },
  "Sarn Pell":{
    title:"Sarn Pell",
    category:"People",
    faction:"Not established",
    affiliation:"Kestrel Return",
    html:`${npcTags('Not established','Kestrel Return')}<p>Sarn Pell is a Great-Shell handler travelling with Kestrel Return. Talla's first warning identified Sarn as injured during the caravan failure.</p>`
  },
  "Rennic Vale":{
    title:"Rennic Vale",
    category:"People",
    faction:"Not established",
    affiliation:"Kestrel Return",
    html:`${npcTags('Not established','Kestrel Return')}<p>Rennic Vale is a Kestrel Return crew member who protected the heavy pale transport case during the caravan crisis and repeatedly insisted that it remain flat. The case reached Stone-Lip Hollow under Rennic's protection.</p>`
  },
  "Bessa Trant":{
    title:"Bessa Trant",
    category:"People",
    faction:"Not established",
    affiliation:"Kestrel Return",
    html:`${npcTags('Not established','Kestrel Return')}<p>Bessa Trant is one of the Kestrel Return crew members the party was trying to find after the caravan split. She was associated with the main survivor trail toward Stone-Lip Hollow.</p>`
  }
};

Object.entries(people).forEach(([name,entry])=>{window.GREYWAKE_DATA[name]=entry;});

const knownPersonLine=(name,description)=>{const entry=people[name];return `<li><strong>${name}</strong> <span style="display:inline-block;margin-left:5px;border:1px solid rgba(193,168,94,.36);padding:2px 5px;color:#cdbb83;font-size:9px;letter-spacing:.05em;text-transform:uppercase">${entry.faction==='Not established'?'Faction not established':entry.faction}</span>${entry.affiliation?` <span style="display:inline-block;margin-left:3px;border:1px solid rgba(139,155,163,.3);padding:2px 5px;color:#b8c8ce;font-size:9px;letter-spacing:.05em;text-transform:uppercase">${entry.affiliation}</span>`:''} — ${description}</li>`;};

window.GREYWAKE_DATA["Known People"]={
  title:"Known People",
  category:"People",
  html:`<p>These are people the whole party can reasonably know: public Greywake figures and people established through recent play.</p>
  <p><em>Faction tags only state affiliations the party record actually establishes. Where a faction is not established, the record says so rather than guessing. A caravan or crew can be shown as an affiliation without being treated as a faction.</em></p>
  <h2>Greywake</h2>
  <ul>
    ${knownPersonLine('Mara Vell','independent Dust Broker near Valve Court.')}
    ${knownPersonLine('High Keeper Varn','leader of the Cistern Keepers.')}
    ${knownPersonLine('Selka Marr','known figure within the Caravan Syndicate.')}
    ${knownPersonLine('Brannic Hale','commander of the Tower Watch.')}
    ${knownPersonLine('Sister Elowen','known voice of the Faithful.')}
    ${knownPersonLine('Nemi','child from Tangle Lanes suffering from the Stilling.')}
    ${knownPersonLine('Hessa Vey','senior Digger and salvage-claim organiser.')}
  </ul>
  <h2>Kestrel Return</h2>
  <ul>
    ${knownPersonLine('Talla Reed','runner who brought the first warning.')}
    ${knownPersonLine('Joric Noll','survivor rescued from the broken runnels.')}
    ${knownPersonLine('Maela Rusk','surviving caravan leader.')}
    ${knownPersonLine('Sarn Pell','Great-Shell handler.')}
    ${knownPersonLine('Rennic Vale','protected the recovered transport case.')}
    ${knownPersonLine('Bessa Trant','Kestrel Return crew member associated with the main survivor trail.')}
  </ul>
  <p>This page records public or shared knowledge only. Private relationships, motives, fears and unrevealed information stay outside the archive.</p>`
};

window.GREYWAKE_CATEGORIES["People"]=["Known People","Mara Vell","High Keeper Varn","Selka Marr","Brannic Hale","Sister Elowen","Nemi","Hessa Vey","Talla Reed","Joric Noll","Maela Rusk","Sarn Pell","Rennic Vale","Bessa Trant"];

const links=[
  ["Mara Vell","Greywake"],["Mara Vell","Known People"],["Mara Vell","Valve Court"],
  ["High Keeper Varn","Greywake"],["High Keeper Varn","Known People"],
  ["Selka Marr","Greywake"],["Selka Marr","Known People"],
  ["Brannic Hale","Greywake"],["Brannic Hale","Known People"],
  ["Sister Elowen","Greywake"],["Sister Elowen","Known People"],
  ["Nemi","Greywake"],["Nemi","Known People"],
  ["Hessa Vey","Greywake"],["Hessa Vey","Known People"],["Hessa Vey","Greater Greywake"],
  ["Talla Reed","Known People"],["Talla Reed","Session 01 — Player Recap"],
  ["Joric Noll","Joric's Runnel"],["Joric Noll","Stone-Lip Hollow"],["Joric Noll","Known People"],
  ["Maela Rusk","Stone-Lip Hollow"],["Maela Rusk","Known People"],
  ["Sarn Pell","Great-Shell"],["Sarn Pell","Known People"],
  ["Rennic Vale","Stone-Lip Hollow"],["Rennic Vale","Known People"],["Rennic Vale","Session 02 — Player Recap"],
  ["Bessa Trant","Stone-Lip Hollow"],["Bessa Trant","Known People"]
];
links.forEach(([a,b])=>{if(!window.GREYWAKE_EDGES.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a)))window.GREYWAKE_EDGES.push([a,b]);});

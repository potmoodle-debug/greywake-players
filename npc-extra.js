// Additional spoiler-safe NPC records.
window.GREYWAKE_DATA=window.GREYWAKE_DATA||{};
window.GREYWAKE_EDGES=window.GREYWAKE_EDGES||[];
window.GREYWAKE_CATEGORIES=window.GREYWAKE_CATEGORIES||{};

const people={
  "Brannic Hale":{
    title:"Brannic Hale",
    category:"People",
    html:`<p>Brannic Hale is the commander of the Tower Watch.</p><p>The Tower Watch keeps watch around the White Tower, records observations, and protects the Tower precinct. Brannic is known for treating the Tower as something to observe carefully rather than something he claims to understand.</p>`
  },
  "Mara Vell":{
    title:"Mara Vell",
    category:"People",
    html:`<p>Mara Vell is known in Greywake as the Dust Broker and is associated with Valve Court.</p><p>She is a familiar public figure in the settlement, someone people seek out when reports, rumours and conflicting accounts need sorting through.</p>`
  },
  "Sister Elowen":{
    title:"Sister Elowen",
    category:"People",
    html:`<p>Sister Elowen is a public voice among the Faithful.</p><p>She is known for listening to people, offering meaning and speaking about hardship, survival and the White Tower through the language of belief. Her faith is an interpretation, not proof of what the Tower is.</p>`
  },
  "Talla Reed":{
    title:"Talla Reed",
    category:"People",
    html:`<p>Talla Reed is a runner and messenger known around Greywake.</p><p>She returned through the Caravan Gate with the first warning that something had gone wrong on Kestrel Return's route, drawing Clay, Velmira and Odie into the caravan crisis.</p>`
  },
  "Joric Noll":{
    title:"Joric Noll",
    category:"People",
    html:`<p>Joric Noll travelled with Kestrel Return.</p><p>The party found him injured and alive at the broken runnel now known as Joric's Runnel. He was extracted safely and later rejoined the surviving caravan crew at Stone-Lip Hollow.</p>`
  },
  "Maela Rusk":{
    title:"Maela Rusk",
    category:"People",
    html:`<p>Maela Rusk is one of Kestrel Return's caravan leaders.</p><p>She was among the surviving crew reached at Stone-Lip Hollow after the caravan's route failure and groundfall.</p>`
  },
  "Sarn Pell":{
    title:"Sarn Pell",
    category:"People",
    html:`<p>Sarn Pell is a Great-Shell handler associated with Greywake's pens and caravan work.</p><p>He travelled with Kestrel Return and was among the people caught up in the caravan's failed return journey.</p>`
  },
  "Rennic Vale":{
    title:"Rennic Vale",
    category:"People",
    html:`<p>Rennic Vale travelled with Kestrel Return and took responsibility for the heavy pale transport case.</p><p>He insisted the case remain flat. When it was opened at Stone-Lip Hollow, the party learned it contained a precision-made ceramic waterworks plate recovered from an abandoned route cistern.</p>`
  }
};

Object.entries(people).forEach(([name,entry])=>{window.GREYWAKE_DATA[name]=entry;});

window.GREYWAKE_DATA["Known People"]={
  title:"Known People",
  category:"People",
  html:`<p>People the whole party can reasonably know: familiar Greywake figures and people made important by recent events.</p>
  <h2>Greywake</h2>
  <ul>
    <li><strong>Brannic Hale</strong> — commander of the Tower Watch.</li>
    <li><strong>Mara Vell</strong> — the Dust Broker, associated with Valve Court.</li>
    <li><strong>Sister Elowen</strong> — a public voice among the Faithful.</li>
  </ul>
  <h2>Kestrel Return</h2>
  <ul>
    <li><strong>Talla Reed</strong> — runner who brought the first warning.</li>
    <li><strong>Joric Noll</strong> — survivor found at Joric's Runnel.</li>
    <li><strong>Maela Rusk</strong> — caravan leader.</li>
    <li><strong>Sarn Pell</strong> — Great-Shell handler.</li>
    <li><strong>Rennic Vale</strong> — protected the recovered transport case.</li>
  </ul>
  <p>This page records public or shared knowledge only. Private motives, fears and unrevealed information stay outside the archive.</p>`
};

if(!window.GREYWAKE_CATEGORIES["People"])window.GREYWAKE_CATEGORIES["People"]=[];
const ordered=["Known People","Brannic Hale","Mara Vell","Sister Elowen","Talla Reed","Joric Noll","Maela Rusk","Sarn Pell","Rennic Vale"];
ordered.forEach(name=>{if(!window.GREYWAKE_CATEGORIES["People"].includes(name))window.GREYWAKE_CATEGORIES["People"].push(name);});

const links=[
  ["Brannic Hale","Greywake"],["Brannic Hale","Known People"],
  ["Mara Vell","Greywake"],["Mara Vell","Valve Court"],["Mara Vell","Known People"],
  ["Sister Elowen","Greywake"],["Sister Elowen","Known People"],
  ["Talla Reed","Caravan Gate"],["Talla Reed","Known People"],["Talla Reed","Session 01 — Player Recap"],
  ["Joric Noll","Joric's Runnel"],["Joric Noll","Stone-Lip Hollow"],["Joric Noll","Known People"],
  ["Maela Rusk","Stone-Lip Hollow"],["Maela Rusk","Known People"],
  ["Sarn Pell","Great-Shell"],["Sarn Pell","Known People"],
  ["Rennic Vale","Stone-Lip Hollow"],["Rennic Vale","Known People"],["Rennic Vale","Session 02 — Player Recap"]
];
links.forEach(([a,b])=>{if(!window.GREYWAKE_EDGES.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a)))window.GREYWAKE_EDGES.push([a,b]);});

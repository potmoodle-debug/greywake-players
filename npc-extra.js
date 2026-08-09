// Additional spoiler-safe NPC records.
window.GREYWAKE_DATA=window.GREYWAKE_DATA||{};
window.GREYWAKE_EDGES=window.GREYWAKE_EDGES||[];
window.GREYWAKE_CATEGORIES=window.GREYWAKE_CATEGORIES||{};

if(!window.GREYWAKE_DATA["Mara Vell"]){
  window.GREYWAKE_DATA["Mara Vell"]={
    title:"Mara Vell",
    category:"People",
    html:`<p>Mara Vell is known in Greywake as the Dust Broker and is associated with Valve Court.</p><p>She is a familiar public figure in the settlement rather than hidden or GM-only information.</p>`
  };
}
if(!window.GREYWAKE_DATA["Brannic Hale"]){
  window.GREYWAKE_DATA["Brannic Hale"]={
    title:"Brannic Hale",
    category:"People",
    html:`<p>Brannic Hale is the commander of the Tower Watch.</p><p>The Tower Watch keeps watches around the White Tower, records observations, and protects the Tower precinct. Their records contain observations, not answers about what the Tower is.</p>`
  };
}
if(!window.GREYWAKE_CATEGORIES["People"])window.GREYWAKE_CATEGORIES["People"]=[];
["Mara Vell","Brannic Hale"].forEach(name=>{
  if(!window.GREYWAKE_CATEGORIES["People"].includes(name))window.GREYWAKE_CATEGORIES["People"].push(name);
});
[["Mara Vell","Greywake"],["Mara Vell","Valve Court"],["Mara Vell","Known People"],["Brannic Hale","Greywake"],["Brannic Hale","Known People"]].forEach(([a,b])=>{
  if(!window.GREYWAKE_EDGES.some(e=>e[0]===a&&e[1]===b))window.GREYWAKE_EDGES.push([a,b]);
});

// Spencer Digger — spoiler-safe player-facing record.
// Source of truth: LIVE Greywake Obsidian vault. Keep unrevealed motives and Closing Ways details out of this layer.
(function(){
  window.GREYWAKE_DATA=window.GREYWAKE_DATA||{};
  window.GREYWAKE_EDGES=window.GREYWAKE_EDGES||[];
  window.GREYWAKE_CATEGORIES=window.GREYWAKE_CATEGORIES||{};
  window.GREYWAKE_MEDIA=window.GREYWAKE_MEDIA||{};

  const tags=`<div class="npc-affiliation-tags" style="display:flex;flex-wrap:wrap;gap:7px;margin:0 0 14px"><span style="display:inline-flex;align-items:center;border:1px solid rgba(193,168,94,.42);background:rgba(55,46,25,.72);color:#e7d59c;padding:5px 8px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">FACTION · The Diggers</span></div>`;

  window.GREYWAKE_DATA["Spencer Digger"]={
    title:"Spencer Digger",
    category:"People",
    faction:"The Diggers",
    html:`${tags}
      <p>Spencer Digger is a working Digger in his late twenties or early thirties, usually coated in dust and wearing salvaged round spectacles with mismatched lenses in a repeatedly repaired frame.</p>
      <p>An obvious lightning-shaped scar crosses his forehead. Spencer has offered several incompatible explanations for it, including an Oldwork discharge, a Glassback, a tunnel collapse and “something beneath the southern workings.” None of those stories is established as the truth.</p>
      <p>For all the embellishment, Spencer genuinely knows underground work. He is particularly good at reading disturbed ground, recent digging, fill, collapse edges and the difference between an old passage and something altered more recently.</p>`
  };

  const people=window.GREYWAKE_CATEGORIES["People"]||(window.GREYWAKE_CATEGORIES["People"]=[]);
  if(!people.includes("Spencer Digger")) people.push("Spencer Digger");

  const known=window.GREYWAKE_DATA["Known People"];
  if(known && !known.html.includes("Spencer Digger")){
    known.html=known.html.replace(
      "  </ul>\n  <h2>Kestrel Return</h2>",
      `    <li><strong>Spencer Digger</strong> <span style="display:inline-block;margin-left:5px;border:1px solid rgba(193,168,94,.36);padding:2px 5px;color:#cdbb83;font-size:9px;letter-spacing:.05em;text-transform:uppercase">The Diggers</span> — working Digger, notorious storyteller and capable reader of underground work.</li>\n  </ul>\n  <h2>Kestrel Return</h2>`
    );
  }

  window.GREYWAKE_MEDIA["Spencer Digger"]=[
    {src:"assets/npcs/hq-v3/spencer-digger.webp",caption:"Spencer Digger — Digger and salvage worker."}
  ];

  [["Spencer Digger","Greywake"],["Spencer Digger","Known People"],["Spencer Digger","Mara Vell"],["Spencer Digger","The Diggers"]].forEach(([a,b])=>{
    if(!window.GREYWAKE_EDGES.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a))) window.GREYWAKE_EDGES.push([a,b]);
  });
})();

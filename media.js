window.GREYWAKE_MEDIA = {
  "Clay": [
    {"src":"assets/canon/characters/clay-canon.webp","caption":"Clay — canon portrait."},
    {"src":"assets/canon/characters/clay-poster.webp","caption":"Clay — character poster.","layout":"portrait"},
    {"src":"assets/canon/characters/clay-loadout.webp","caption":"Clay — ranger loadout.","layout":"reference"}
  ],
  "Odie": [
    {"src":"assets/canon/characters/odie-canon.webp","caption":"Odie — fixer, repairer and scavenger."},
    {"src":"assets/canon/characters/odie-poster.webp","caption":"Odie — repairer character poster.","layout":"portrait"},
    {"src":"assets/canon/characters/odie-kit.webp","caption":"Odie — equipment and repair reference.","layout":"reference"}
  ],
  "Velmira": [
    {"src":"assets/pcs/hq-v1/velmira.webp","caption":"Velmira — trader and School of Knowledge wizard."},
    {"src":"assets/canon/characters/velmira-poster.webp","caption":"Velmira — character poster.","layout":"portrait"},
    {"src":"assets/canon/characters/velmira-kit.webp","caption":"Velmira — labelled trader kit.","layout":"reference"}
  ],
  "Mara Vell": [
    {"src":"assets/npcs/hq-v3/mara-vell.webp","caption":"Mara Vell — Dust Broker at Valve Court."}
  ],
  "High Keeper Varn": [
    {"src":"assets/npcs/hq-v3/high-keeper-varn.webp","caption":"High Keeper Varn — Cistern Keepers."}
  ],
  "Selka Marr": [
    {"src":"assets/npcs/hq-v3/selka-marr.webp","caption":"Selka Marr — Caravan Syndicate representative."}
  ],
  "Brannic Hale": [
    {"src":"assets/npcs/hq-v3/brannic-hale.webp","caption":"Brannic Hale — Tower Watch commander."}
  ],
  "Sister Elowen": [
    {"src":"assets/npcs/hq-v3/sister-elowen.webp","caption":"Sister Elowen — a known voice of the Faithful."}
  ],
  "Nemi": [
    {"src":"assets/npcs/hq-v3/nemi.webp","caption":"Nemi — before the Stilling."}
  ],
  "Talla Reed": [
    {"src":"assets/npcs/hq-v3/talla-reed.webp","caption":"Talla Reed — Greywake runner."}
  ],
  "Joric Noll": [
    {"src":"assets/npcs/hq-v3/joric-noll.webp","caption":"Joric Noll — Kestrel Return route-hand."}
  ],
  "Maela Rusk": [
    {"src":"assets/npcs/hq-v3/maela-rusk.webp","caption":"Maela Rusk — Kestrel Return caravan leader."}
  ],
  "Sarn Pell": [
    {"src":"assets/npcs/hq-v3/sarn-pell.webp","caption":"Sarn Pell — Great-Shell handler."}
  ],
  "Rennic Vale": [
    {"src":"assets/npcs/hq-v3/rennic-vale.webp","caption":"Rennic Vale — Kestrel Return crew."}
  ],
  "Bessa Trant": [
    {"src":"assets/npcs/hq-v3/bessa-trant.webp","caption":"Bessa Trant — Kestrel Return survivor."}
  ],
  "Hessa Vey": [
    {"src":"assets/npcs/hq-v3/hessa-vey.webp","caption":"Hessa Vey — senior Digger and salvage-claim organiser."}
  ],
  "Spencer Digger": [
    {"src":"assets/npcs/hq-v3/spencer-digger.webp?v=spencer2","caption":"Spencer Digger — Digger and salvage worker."}
  ],
  "Greywake": [
    {"src":"assets/tower-distant.jpg","caption":"Greywake and the White Tower across the wastes."},
    {"src":"assets/tower-close.jpg","caption":"The White Tower from within Greywake.","layout":"portrait"}
  ],
  "White Tower": [
    {"src":"assets/tower-close.jpg","caption":"The White Tower from within Greywake."}
  ],
  "Caravan Gate": [
    {"src":"assets/canon/locations/caravan-gate.webp","caption":"Greywake's Caravan Gate."}
  ],
  "Stone-Lip Hollow": [
    {"src":"assets/canon/sessions/session-02.webp","caption":"Stone-Lip Hollow — shelter beneath the stone overhang."},
    {"src":"assets/canon/locations/stone-lip-battlemap.webp","caption":"Stone-Lip Hollow — player battlemap.","layout":"wide"}
  ],
  "Session 01 — Player Recap": [
    {"src":"assets/canon/sessions/session-01.webp","caption":"Kestrel Return's route through the wastes."}
  ],
  "Session 02 — Player Recap": [
    {"src":"assets/canon/sessions/session-02.webp","caption":"Stone-Lip Hollow at the end of Session Two."}
  ],
  "Session 03 — Player Recap": [
    {"src":"assets/canon/sessions/session-03.webp","caption":"The Kestrel Return survivors on the road home."}
  ],
  "Great-Shell": [
    {"src":"assets/canon/fauna/great-shell.webp","caption":"Great-Shell — canon visual reference.","layout":"wide","backdrop":false}
  ],
  "Cacklemaw Pack": [
    {"src":"assets/canon/fauna/cacklemaw-pack.webp","caption":"Cacklemaw pack — Stone-Lip view."}
  ],
  "Hopkins": [
    {"src":"assets/canon/fauna/hopkins.webp","caption":"Hopkins — Clay's giant kangaroo-rat scout companion."}
  ],
  "Ash-Plate": [
    {"src":"assets/canon/fauna/ash-plate.webp?v=approved-shells-1","caption":"Ash-Plate — recovering after the Kestrel Return groundfall."}
  ],
  "Lowbell": [
    {"src":"assets/canon/fauna/lowbell.webp?v=approved-shells-1","caption":"Lowbell — a working Great-Shell of Kestrel Return."}
  ],
  "Latchfan": [
    {"src":"assets/canon/flora/latchfan-specimen.webp","caption":"Latchfan — mature specimen."},
    {"src":"assets/canon/flora/latchfan-habitat.webp","caption":"Latchfan — Stone-Lip habitat.","layout":"wide"}
  ],
  "Thirst-Marrow": [
    {"src":"assets/canon/flora/thirst-marrow.webp","caption":"Thirst-Marrow — emergency moisture of the outer wastes."}
  ]
};

// Spencer Digger — player-safe publication layer.
(function(){
  window.GREYWAKE_DATA=window.GREYWAKE_DATA||{};
  window.GREYWAKE_EDGES=window.GREYWAKE_EDGES||[];
  window.GREYWAKE_CATEGORIES=window.GREYWAKE_CATEGORIES||{};

  const tags=`<div class="npc-affiliation-tags" style="display:flex;flex-wrap:wrap;gap:7px;margin:0 0 14px"><span style="display:inline-flex;align-items:center;border:1px solid rgba(193,168,94,.42);background:rgba(55,46,25,.72);color:#e7d59c;padding:5px 8px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">FACTION · The Diggers</span></div>`;

  window.GREYWAKE_DATA["Spencer Digger"]={
    title:"Spencer Digger",
    category:"People",
    faction:"The Diggers",
    html:`${tags}<p>Spencer Digger is a working Digger in his late twenties or early thirties, usually coated in dust and wearing salvaged round spectacles with mismatched lenses in a repeatedly repaired frame.</p><p>An obvious lightning-shaped scar crosses his forehead. Spencer has offered several incompatible explanations for it, including an Oldwork discharge, a Glassback, a tunnel collapse and “something beneath the southern workings.” None of those stories is established as the truth.</p><p>For all the embellishment, Spencer genuinely knows underground work. He is particularly good at reading disturbed ground, recent digging, fill, collapse edges and the difference between an old passage and something altered more recently.</p>`
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

  [["Spencer Digger","Greywake"],["Spencer Digger","Known People"],["Spencer Digger","Mara Vell"],["Spencer Digger","The Diggers"]].forEach(([a,b])=>{
    if(!window.GREYWAKE_EDGES.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a))) window.GREYWAKE_EDGES.push([a,b]);
  });
})();

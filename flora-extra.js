(() => {
  const D=window.GREYWAKE_DATA||(window.GREYWAKE_DATA={});
  const C=window.GREYWAKE_CATEGORIES||(window.GREYWAKE_CATEGORIES={});
  const E=window.GREYWAKE_EDGES||(window.GREYWAKE_EDGES=[]);

  D["Known Flora and Fauna"]={
    ...(D["Known Flora and Fauna"]||{}),
    title:"Known Flora and Fauna",
    category:"Flora & Fauna",
    html:"<p>This field guide collects creatures and plants that are established as ordinary party-safe knowledge or have been encountered in play. It is not a complete bestiary of Greywake.</p><p>Some creatures may be known only to one character. Those stay in that character’s own knowledge until they are shared in play.</p>"
  };

  D["Great-Shell"]={
    title:"Great-Shell",
    category:"Flora & Fauna",
    html:"<p><strong>Greywake’s principal heavy transport animal.</strong> Great-Shells are enormous, entirely organic beetle-like creatures with six powerful legs and broad pale, weathered carapaces.</p><p>Heavy loads are secured across their backs using fitted frames and harnesses. They are animals, not machines or Oldwork.</p><p><strong>Shellfeed</strong> is one of their major wild food sources, so dependable Shellfeed beds matter to caravan route planning and carrying capacity.</p><p>Losing a working Great-Shell can break a route, strand supplies and damage the livelihood of the families who breed, handle and work them.</p><blockquote>Who controls the Great-Shells controls what can still move.</blockquote>"
  };

  D["Cacklemaw"]={
    title:"Cacklemaw",
    category:"Flora & Fauna",
    html:"<p>Cacklemaws are lean pursuit predators of the wastes, built for sustained movement across broken ground rather than brute-force confrontation.</p><p>They hunt by circling, testing defences, closing safe routes and exploiting separation. Their broken, breathy calls help a pack coordinate pressure through runnels and hard stone.</p><p>The paired structures beneath the throat are soft resonating membranes, not tusks or horns.</p><p>The pack encountered around Joric’s Runnel and Stone-Lip Hollow was defeated during the return of Kestrel Return. Cacklemaws remain established predators elsewhere in the wastes.</p><blockquote>The animal you can see may not be the only one choosing where your attention goes.</blockquote>"
  };

  D["Cacklemaw Pack"]={
    ...(D["Cacklemaw Pack"]||{}),
    title:"Cacklemaw Pack — Stone-Lip encounter",
    category:"Flora & Fauna",
    html:"<p>The coordinated cacklemaw threat encountered around Joric’s Runnel and Stone-Lip Hollow is now historical.</p><p>Four young cacklemaws were killed near Joric’s Runnel. At Stone-Lip Hollow, Clay killed the mature Hunter, Odie broke the circling pack threat, one Scavenger was killed and three remaining Scavengers fled.</p><p>See <strong>Cacklemaw</strong> for the species field guide.</p>"
  };

  D["Glasshoof Runner"]={
    title:"Glasshoof Runner",
    category:"Flora & Fauna",
    html:"<p>A lightly built desert grazer with broad translucent ears, sealable nostrils, pale eye membranes and spreading glasslike hoof plates.</p><p>Glasshoof Runners favour salt flats, dried runnels, fractured clay pans, shallow ruins, mineral seams and the edges of the Seep Fields.</p><p>Travellers watch their feet: a calm Runner often indicates stable crust and a passable line, while one that refuses to step forward may have detected hollow ground, buried silt, unstable rubble or vibration below.</p><blockquote>Follow the feet, not the fear. If it stops, you stop.</blockquote>"
  };

  D["Dust-Muzzle"]={
    title:"Dust-Muzzle",
    category:"Flora & Fauna",
    html:"<p>A large-rabbit-sized settlement scavenger with a lean body, long scenting muzzle and oversized independently moving ears.</p><p>Dust-Muzzles live around homes, workshops, refuse lanes, repair yards, wall cavities and cistern edges. They hunt vermin, consume waste and learn familiar footsteps and routines.</p><p>Greywake people value them as living warnings for gas, smoke, rot, contamination, movement behind walls, unstable rubble and unfamiliar scents.</p><blockquote>Watch the ears before you watch the wall.</blockquote>"
  };

  D["Wirethorn Skitter"]={
    title:"Wirethorn Skitter",
    category:"Flora & Fauna",
    html:"<p>A flattened six-legged scavenger with wire-thin limbs, hooked feet and a crown of flexible sensory thorns.</p><p>It has little conventional sight and reads vibration, pressure, moving air, shifting stone and water travelling through walls and pipes.</p><p>Wirethorn Skitters live in collapsed walls, cistern pipework, abandoned streets, rubble cavities and salvage piles. Their sudden flight from a structure is widely treated as a warning of collapse or another disturbance below.</p><blockquote>When the wire starts walking, stop arguing and leave.</blockquote>"
  };

  D["Cistern Threader"]={
    title:"Cistern Threader",
    category:"Flora & Fauna",
    html:"<p>A long, flattened amphibious creature adapted to Greywake’s buried water systems. It uses folding side fins, gripping limbs and pressure-sensitive pits around the head to navigate narrow wet spaces.</p><p>Threaders require persistent wet habitat: cistern chambers, seep channels, flooded conduits, cracked distribution pipes and surviving wet waterworks.</p><p>Workers treat a healthy Threader as a useful sign of connected water, viable flow and a route through the pipework. When they suddenly flee a channel, experienced workers check for pressure changes, contamination, heat, collapse or something larger moving below.</p><blockquote>Where the threader goes, the water still remembers a road.</blockquote>"
  };

  D["Carrion Kite"]={
    title:"Carrion Kite",
    category:"Flora & Fauna",
    html:"<p>Gas-buoyed scavengers of the wastes. Carrion Kites drift on thermals rather than beating wings, steering with thin membranes beneath ribbed gas-filled bodies.</p><p>They prefer carrion already opened by stronger creatures and are not normally aggressive toward healthy people. They become more dangerous around someone unconscious, trapped, badly bleeding, isolated or too exhausted to drive them away.</p><p>Travellers read their circling and descent as imperfect clues to injury, carrion or danger below.</p><blockquote>Wave at the first one. Don’t wait for the second.</blockquote>"
  };

  D["Shellfeed"]={
    title:"Shellfeed",
    category:"Flora & Fauna",
    html:"<p>Shellfeed is a hardy growth of the wastes and a major wild food source for Great-Shells.</p><p>Reliable Shellfeed beds matter to caravan route planning because feeding on the route reduces how much fodder must be carried, leaving more capacity for water, tools, trade goods, salvage and injured people.</p><p>The exact wider biology and human uses of Shellfeed are not yet fully established.</p>"
  };

  D["Latchfan"]={
    title:"Latchfan",
    category:"Flora & Fauna",
    html:"<p>Latchfan is a low, stone-rooted plant that grows in cool cracks and shaded rock shelters. Its broad ribbed fronds are dust-grey above and dark reddish underneath, with pale fibrous roots running deep into fractures.</p><p>Fresh fronds make tough temporary padding or wrapping, root fibres can reinforce bindings and lashings, and a small amount of amber sap works as a practical emergency sealant or tack.</p><p>It is not predatory. When heavily crushed, its fronds fold inward around the crown. Healthy patches are also a useful sign of dependable shade and stable cracks beneath the surface.</p>"
  };

  D["Thirst-Marrow"]={
    title:"Thirst-Marrow",
    category:"Flora & Fauna",
    html:"<p><strong>Emergency moisture of the outer wastes.</strong> Recognise it by squat clustered lobes and pale, stringy flesh inside.</p><p>The fibres hold enough moisture to keep a traveller moving when their water is gone. It is emergency food for the thirsty, not a substitute for a waterskin and not a replacement for the Water required to rest.</p><p>Prolonged reliance is unsafe. Reach real water as soon as possible.</p><blockquote>Marrow keeps your feet moving. Water brings you home.</blockquote>"
  };

  const directory=[
    "Known Flora and Fauna",
    "Great-Shell",
    "Cacklemaw",
    "Glasshoof Runner",
    "Dust-Muzzle",
    "Wirethorn Skitter",
    "Cistern Threader",
    "Carrion Kite",
    "Shellfeed",
    "Latchfan",
    "Thirst-Marrow"
  ];
  C["Flora & Fauna"]=directory.filter(n=>D[n]);

  const links=[
    ["Known Flora and Fauna","Great-Shell"],
    ["Known Flora and Fauna","Cacklemaw"],
    ["Known Flora and Fauna","Glasshoof Runner"],
    ["Known Flora and Fauna","Dust-Muzzle"],
    ["Known Flora and Fauna","Wirethorn Skitter"],
    ["Known Flora and Fauna","Cistern Threader"],
    ["Known Flora and Fauna","Carrion Kite"],
    ["Known Flora and Fauna","Shellfeed"],
    ["Known Flora and Fauna","Latchfan"],
    ["Known Flora and Fauna","Thirst-Marrow"],
    ["Great-Shell","Shellfeed"],
    ["Cacklemaw","Cacklemaw Pack"],
    ["Latchfan","Stone-Lip Hollow"]
  ];
  for(const edge of links){
    if(!E.some(([a,b])=>(a===edge[0]&&b===edge[1])||(a===edge[1]&&b===edge[0]))) E.push(edge);
  }
})();
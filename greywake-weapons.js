(() => {
  const DATA=window.GREYWAKE_DATA||(window.GREYWAKE_DATA={});
  const CATS=window.GREYWAKE_CATEGORIES||(window.GREYWAKE_CATEGORIES={});
  const MEDIA=window.GREYWAKE_MEDIA||(window.GREYWAKE_MEDIA={});
  const EDGES=window.GREYWAKE_EDGES||(window.GREYWAKE_EDGES=[]);

  const stat=(type,range,trait,damage)=>`
    <div class="weapon-statline" role="list" aria-label="Weapon statistics">
      <span role="listitem"><small>TYPE</small><strong>${type}</strong></span>
      <span role="listitem"><small>RANGE</small><strong>${range}</strong></span>
      <span role="listitem"><small>TRAIT</small><strong>${trait}</strong></span>
      <span role="listitem"><small>DAMAGE</small><strong>${damage}</strong></span>
    </div>`;

  DATA["Greywake Weapons"]={
    title:"Greywake Weapons",
    category:"Equipment",
    html:`<p>Greywake weapons tend to begin as useful objects: salvage tools, caravan implements, breaching hammers and compact blades that still have a job when nobody is fighting.</p>
    <p>They are repaired instead of replaced. Handles are rewrapped, metal is reworked, and parts rarely match for long. These five weapons are recognised Greywake designs or local adaptations.</p>
    <div class="weapon-directory">
      <p><strong>Digger's Tooth</strong> — compact pick-chisel used in buried work and close spaces.</p>
      <p><strong>Hookspike</strong> — short hooked spear for catching, dragging and controlling.</p>
      <p><strong>Longhook</strong> — caravan polearm descended from freight and line-handling tools.</p>
      <p><strong>Gatehammer</strong> — short two-handed breaching hammer for doors, braces and cramped fights.</p>
      <p><strong>White Shard</strong> — a rare locally mounted pale cutting fragment of uncertain provenance.</p>
    </div>
    <p class="weapon-rules-note">These are custom Greywake weapon records using ordinary Daggerheart traits, range, damage and Hope/Stress language.</p>`
  };

  DATA["Digger's Tooth"]={
    title:"Digger's Tooth",
    category:"Equipment",
    html:`<p class="weapon-kicker">GREYWAKE WEAPON · TIER 1</p>
    <p>A belt-carried pick-chisel hybrid used as often on old fittings and buried seams as on people. One side punches; the other wedges and pries. The short haft makes it useful where a long weapon becomes a nuisance.</p>
    ${stat("Secondary","Melee","Finesse","d6 physical")}
    <section class="weapon-feature"><small>FEATURE</small><h2>Pry and Wedge</h2><p>When you use the Digger's Tooth to pry, wedge, chisel, force open a gap, or work in cramped salvage conditions, gain advantage when the fiction supports it.</p></section>
    <section class="weapon-use"><small>COMMON USE</small><p>Diggers, fixers, route-workers and anyone who needs one object to be both tool and last-resort weapon.</p></section>`
  };

  DATA["Hookspike"]={
    title:"Hookspike",
    category:"Equipment",
    html:`<p class="weapon-kicker">GREYWAKE WEAPON · TIER 1</p>
    <p>A rugged short spear with a heavy inward hook beneath the point. It can thrust like a spear, but Greywake fighters value it for catching straps, limbs, packs and anything else that can be pulled out of position.</p>
    ${stat("Primary","Melee","Strength","d8 physical")}
    <section class="weapon-feature"><small>FEATURE</small><h2>Catch and Drag</h2><p>When you succeed on an attack, you may spend 1 Hope to either pull the target slightly off position or make them temporarily Vulnerable.</p></section>
    <section class="weapon-use"><small>COMMON USE</small><p>Route guards, salvage escorts and Diggers who expect trouble in narrow or broken ground.</p></section>`
  };

  DATA["Longhook"]={
    title:"Longhook",
    category:"Equipment",
    html:`<p class="weapon-kicker">GREYWAKE WEAPON · TIER 1</p>
    <p>A long-shafted caravan tool adapted into a fighting weapon. Its deep hook can snag cargo lines, shift awkward loads, catch a fleeing target or keep somebody exactly where the wielder wants them.</p>
    ${stat("Primary · Two-Handed","Very Close","Strength","d8 physical")}
    <section class="weapon-feature"><small>FEATURE</small><h2>Hold the Line</h2><p>When you succeed on an attack, you may spend 1 Hope to prevent the target from cleanly disengaging or escaping your immediate reach.</p></section>
    <section class="weapon-use"><small>COMMON USE</small><p>Caravan crews, freight handlers and guards working around Great-Shell loads and crowded approaches.</p></section>`
  };

  DATA["Gatehammer"]={
    title:"Gatehammer",
    category:"Equipment",
    html:`<p class="weapon-kicker">GREYWAKE WEAPON · TIER 1</p>
    <p>A short-handled two-handed breaching hammer. Its compact haft sacrifices reach for control in gates, alleys, yards and other places where a long battlefield weapon has nowhere to swing.</p>
    ${stat("Primary · Two-Handed","Melee","Strength","d10 physical")}
    <section class="weapon-feature"><small>FEATURE</small><h2>Break the Brace</h2><p>When you use the Gatehammer against a door, brace, lock, support, hinge, or other structural weak point, gain advantage when brute force is the right approach.</p></section>
    <section class="weapon-use"><small>COMMON USE</small><p>Gate and yard defenders, heavy labourers, and anyone whose work already involves breaking what refuses to move.</p></section>`
  };

  DATA["White Shard"]={
    title:"White Shard",
    category:"Equipment",
    html:`<p class="weapon-kicker">RARE GREYWAKE WEAPON · TIER 1</p>
    <p>A local grip, bindings and braces built around a pale cutting fragment that does not resemble ordinary Greywake metalwork. The mounting is crude but competent. The fragment's original purpose and provenance are not assumed by this record.</p>
    ${stat("Primary","Melee","Finesse","d8 physical")}
    <section class="weapon-feature"><small>FEATURE</small><h2>Unnerving Edge</h2><p>Once per scene, when cutting or piercing a stubborn mundane material, you may mark 1 Stress to do so with unusual efficiency.</p></section>
    <section class="weapon-use"><small>COMMON USE</small><p>Not common. A White Shard should feel like a specific salvaged object somebody has mounted and maintained, not a standard manufactured weapon.</p></section>`
  };

  MEDIA["Greywake Weapons"]=[
    {src:"assets/weapons/diggers-tooth.webp",caption:"Digger's Tooth — compact salvage pick and close-quarters tool.","layout":"reference"},
    {src:"assets/weapons/hookspike.webp",caption:"Hookspike — hooked short spear.","layout":"reference"},
    {src:"assets/weapons/longhook.webp",caption:"Longhook — caravan line-control polearm.","layout":"reference"},
    {src:"assets/weapons/gatehammer.webp",caption:"Gatehammer — short breaching hammer.","layout":"reference"},
    {src:"assets/weapons/white-shard.webp",caption:"White Shard — locally mounted pale cutting fragment.","layout":"reference"}
  ];
  MEDIA["Digger's Tooth"]=[{src:"assets/weapons/diggers-tooth.webp",caption:"Digger's Tooth — tool first, weapon when needed."}];
  MEDIA["Hookspike"]=[{src:"assets/weapons/hookspike.webp",caption:"Hookspike — built to catch and drag."}];
  MEDIA["Longhook"]=[{src:"assets/weapons/longhook.webp",caption:"Longhook — caravan tool turned controlling weapon."}];
  MEDIA["Gatehammer"]=[{src:"assets/weapons/gatehammer.webp",caption:"Gatehammer — compact weight for cramped spaces."}];
  MEDIA["White Shard"]=[{src:"assets/weapons/white-shard.webp",caption:"White Shard — a Greywake mounting around an unusual pale fragment."}];

  const equipment=CATS["Equipment"]||(CATS["Equipment"]=[]);
  ["Greywake Weapons","Digger's Tooth","Hookspike","Longhook","Gatehammer","White Shard"].forEach(name=>{if(!equipment.includes(name))equipment.push(name)});

  const link=(a,b)=>{if(DATA[a]&&DATA[b]&&!EDGES.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a)))EDGES.push([a,b])};
  ["Digger's Tooth","Hookspike","Longhook","Gatehammer","White Shard"].forEach(name=>link("Greywake Weapons",name));
  link("Greywake Weapons","Greywake");
  link("Digger's Tooth","The Diggers");
  link("Hookspike","The Diggers");
  link("Longhook","Caravan Syndicate");
  link("Gatehammer","Caravan Gate");
})();
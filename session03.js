(function(){
  const key = "Session 03 — Player Recap";
  window.GREYWAKE_DATA = window.GREYWAKE_DATA || {};
  window.GREYWAKE_DATA[key] = {
    title: "Session 03 — Return to Greywake",
    category: "Sessions",
    html: `<p>Session Three began in the middle of the Cacklemaw assault at Stone-Lip Hollow. Clay was being dragged toward the entrance, Odie was bloodied on the rope line, and Velmira was deeper inside with the survivors.</p>
<p>The party broke the attack. Clay brought down the Cacklemaw Hunter, Odie shattered the circling pack, and the remaining scavengers fled into the dark.</p>
<p>After the fight, the survivors reorganised and kept watch through the night. At first light, Clay and Sarn assessed the Great-Shells. Ash-Plate was injured but able to walk, so she carried nothing on the return journey. Lowbell remained fit enough to carry a sensible load.</p>
<p>Velmira produced an old carrying sling from her Nomadic Pack, allowing four people at a time to carry the Cistern Plate flat and rotate before fatigue became dangerous. The group chose not to return to Ash-Plate Groundfall for the expensive abandoned freight. Odie put the decision simply: <strong>“At this point, it’s about lives.”</strong></p>
<p>The caravan took the longer, safer route back toward Greywake, with Ash-Plate setting the pace.</p>
<p>A slumped section of the High Shelf forced the group to cross loose limestone. Clay found a safe line and guided Ash-Plate over without worsening her injury. Odie then led the Cistern Plate team across the same route while the rest of the group stripped themselves down to make the crossing easier.</p>
<p>Later, near a known High Shelf shade stop, Bessa spotted fresh work on an old route marker. Odie confirmed that somebody had deliberately altered the stone. Clay reconstructed the original reading: it should have directed travellers along the safer High Shelf route, but the newer cuts changed it enough to suggest the lower route instead.</p>
<p>The group could not tell who had altered it, when exactly it had been done, or whether the same person was responsible for the failed marker that had sent Kestrel Return onto the wrong lower line. Bessa’s reaction was simple: <strong>“That’s twice.”</strong></p>
<p>Clay identified the correct original reading and Odie carefully restored the marker while leaving enough evidence of the tampering visible for later inspection.</p>
<p>The caravan rested in the High Shelf shade, then continued home at a controlled pace.</p>
<p>By late day, Greywake appeared through the heat haze.</p>
<p><strong>The Kestrel Return survivors came home.</strong></p>
<h2>What the party returned with</h2>
<ul>
<li>Maela Rusk, Rennic Vale, Sarn Pell, Bessa Trant and Joric Noll alive.</li>
<li>The Cistern Plate intact.</li>
<li>Ash-Plate alive but injured.</li>
<li>Lowbell returned in serviceable condition.</li>
<li>Evidence of a second deliberately altered route marker.</li>
<li>Significant expensive freight still abandoned at Ash-Plate Groundfall.</li>
</ul>
<p>The immediate danger of the journey is over. What Greywake does with the survivors, the recovered Plate and the evidence from the route is still unresolved.</p>`
  };

  window.GREYWAKE_CATEGORIES = window.GREYWAKE_CATEGORIES || {};
  window.GREYWAKE_CATEGORIES.Sessions = window.GREYWAKE_CATEGORIES.Sessions || [];
  if (!window.GREYWAKE_CATEGORIES.Sessions.includes(key)) {
    window.GREYWAKE_CATEGORIES.Sessions.push(key);
  }

  window.GREYWAKE_EDGES = window.GREYWAKE_EDGES || [];
  const links = [
    "Session 02 — Player Recap",
    "Stone-Lip Hollow",
    "Cacklemaw Pack",
    "Great-Shell",
    "Clay",
    "Odie",
    "Velmira",
    "Greywake",
    "Known People",
    "Player Brain"
  ];
  links.forEach(other => {
    const edge = [key, other];
    if (!window.GREYWAKE_EDGES.some(e => (e[0] === edge[0] && e[1] === edge[1]) || (e[0] === edge[1] && e[1] === edge[0]))) {
      window.GREYWAKE_EDGES.push(edge);
    }
  });

  window.GREYWAKE_DISCOVERIES = window.GREYWAKE_DISCOVERIES || [];
  if (!window.GREYWAKE_DISCOVERIES.some(d => d.note === key)) {
    window.GREYWAKE_DISCOVERIES.unshift({
      title: "Session Three",
      note: key,
      kind: "Session",
      image: "assets/canon/sessions/session-03.webp",
      text: "The Kestrel Return survivors made it back to Greywake with the Cistern Plate and evidence of a second altered route marker.",
      when: "Latest recap"
    });
  }
})();

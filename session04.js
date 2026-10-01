(function(){
  const key = "Session 04 — Player Recap";
  window.GREYWAKE_DATA = window.GREYWAKE_DATA || {};
  window.GREYWAKE_DATA[key] = {
    title: "Session 04 — The Closing Ways",
    category: "Sessions",
    html: `<p>Session Four opened after the Kestrel Return survivors were safely back inside Greywake. Before returning to the concealed ways beneath the settlement, Odie followed the recovered Cistern Plate as far as he was allowed.</p>
<p>Rennic took the Plate into the cistern works. Odie saw enough to establish that it belonged to the same broad Oldwork technological tradition as the strange finger he already carried: the construction logic, channels, joining methods and tolerances felt related. That did <strong>not</strong> prove they came from the same civilisation or makers.</p>
<p>At a lower-draw section of the cistern works, the Plate's geometry came close to matching part of the existing infrastructure. It was not installed and no successful fit was established. Odie committed what he could of the shape and arrangement to memory before he had to leave. A record keeper noticed his attention; Varn gave no obvious reaction.</p>
<p>Attention then returned to the concealed Digger ways. A southern blockage that had previously stopped movement had been reopened. The route was passable again, but the work around it was visibly disturbed rather than simply returning to normal.</p>
<p>Marek went beneath Greywake and followed pale traces through the buried passages. The trail led him to a living <strong>Foldling</strong>.</p>
<p>Rather than treating it as an enemy, Marek approached through his connection to the natural world. He took an Agile Scout Beastform suited to the creature and used Nature's Tongue to communicate.</p>
<p>The Foldling was frightened rather than hunting. Marek learned that it had come north from buried ruins farther south after something there repeatedly disturbed it and drove it from where it had been living. Marek reassured it — <strong>“Safe here.”</strong> The creature eventually scuttered away.</p>
<p>The encounter established the Foldling as a creature Marek can reasonably take as an <strong>Agile Scout</strong> Beastform. It is not his pet or companion.</p>
<p>Elsewhere, Odie joined Spencer Digger and started back toward the reopened southern blockage so Spencer could inspect the disturbed work firsthand.</p>
<p><strong>The session ended before that inspection took place.</strong></p>
<h2>What the party established</h2>
<ul>
<li>The Cistern Plate is Oldwork, and Odie can recognise meaningful similarities between its construction and his Oldwork finger without knowing exactly what connects them.</li>
<li>The Plate nearly corresponded to part of the lower cistern infrastructure, but no fit or installation was confirmed.</li>
<li>A previously blocked southern concealed way has been reopened and remains visibly disturbed.</li>
<li>Marek encountered a living Foldling beneath Greywake.</li>
<li>The Foldling had fled north from southern buried ruins after repeated disturbance there.</li>
<li>Foldling is now a valid Agile Scout Beastform for Marek.</li>
<li>Odie and Spencer were on their way to inspect the reopened blockage when play stopped.</li>
</ul>
<p>Who closed the route, who reopened it, what disturbed the Foldling, and what Spencer will conclude from the site all remain unresolved.</p>`
  };

  window.GREYWAKE_CATEGORIES = window.GREYWAKE_CATEGORIES || {};
  window.GREYWAKE_CATEGORIES.Sessions = window.GREYWAKE_CATEGORIES.Sessions || [];
  if (!window.GREYWAKE_CATEGORIES.Sessions.includes(key)) {
    window.GREYWAKE_CATEGORIES.Sessions.push(key);
  }

  window.GREYWAKE_EDGES = window.GREYWAKE_EDGES || [];
  const links = [
    "Session 03 — Player Recap",
    "Odie",
    "Marek",
    "Greywake",
    "Spencer Digger",
    "The Diggers"
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
      title: "Session Four",
      note: key,
      kind: "Session",
      text: "Odie followed the Cistern Plate into the cistern works while Marek encountered a living Foldling beneath Greywake. The reopened southern way remains unresolved.",
      when: "Latest recap"
    });
  }
})();
(function(){
  const key = "Session 05 — Player Recap";
  window.GREYWAKE_DATA = window.GREYWAKE_DATA || {};
  window.GREYWAKE_DATA[key] = {
    title: "Session 05 — Southern Lanes (In Progress)",
    category: "Sessions",
    html: `<p><strong>11 October 2026 — Live session, paused at the lunch break.</strong> This is a spoiler-safe account of the party's shared movements, not a completed-session recap.</p>
<p>With the Kestrel Return safely home, attention turned to the old southern buildings and the concealed ways beneath Greywake.</p>
<p>Marek returned to the surface after exploring the buried passages, while Velmira followed a personal lead through the trading lanes and the Digger yards.</p>
<p>Marek and Velmira met at the yards and discovered they were both trying to find Odie. They spoke briefly of Marek's newly tried form, and Velmira said she had no Stamina Potions at present but was working on it.</p>
<p>Following Spencer's directions, they travelled together into the quieter southern lanes and reached old masonry showing signs of recent work.</p>
<p><strong>Current position:</strong> Marek and Velmira are in the lane outside the old southern buildings, looking for Odie. Their next action has not yet been played.</p>
<p>Other discoveries and character-specific information remain with the characters who learned them until shared during play.</p>`
  };
  window.GREYWAKE_CATEGORIES = window.GREYWAKE_CATEGORIES || {};
  window.GREYWAKE_CATEGORIES.Sessions = window.GREYWAKE_CATEGORIES.Sessions || [];
  if (!window.GREYWAKE_CATEGORIES.Sessions.includes(key)) window.GREYWAKE_CATEGORIES.Sessions.push(key);
  window.GREYWAKE_EDGES = window.GREYWAKE_EDGES || [];
  ["Session 04 — Player Recap", "Marek", "Velmira", "Greywake", "Spencer Digger"].forEach(other => {
    if (!window.GREYWAKE_EDGES.some(e => (e[0] === key && e[1] === other) || (e[0] === other && e[1] === key))) window.GREYWAKE_EDGES.push([key, other]);
  });
  window.GREYWAKE_DISCOVERIES = window.GREYWAKE_DISCOVERIES || [];
  if (!window.GREYWAKE_DISCOVERIES.some(d => d.note === key)) window.GREYWAKE_DISCOVERIES.unshift({title:"Session Five — In Progress",note:key,kind:"Session",text:"Marek and Velmira have reached the old southern lanes while looking for Odie. Play is paused here.",when:"11 October 2026"});
})();
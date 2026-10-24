(function(){
  const key = "Session 05 — Player Recap";
  window.GREYWAKE_DATA = window.GREYWAKE_DATA || {};
  window.GREYWAKE_DATA[key] = {
    title: "Session 05 — The Southern Ways",
    category: "Sessions",
    html: `<p><strong>11 October 2026 — Session Five complete.</strong> Marek, Odie and Velmira each followed separate leads before reuniting and setting out south.</p>
<h3>Odie: the reopened passage</h3>
<p>Odie brought Spencer to inspect the braced passage he and Marek had reopened. The orderly packing and timber cuts suggested deliberate work, not an ordinary repair. Spencer agreed to ask discreet questions in the yards. Odie hid nearby using his Cloaked ability and later overheard two labourers inspecting the entrance. They had a sketch of two closures and intended to visit another site; Odie could not identify it.</p>
<h3>Velmira: Jessa's account</h3>
<p>Messenger Tess led Velmira to Jessa Vale, who described a pale, six-limbed creature squeezing into narrow gaps in two old southern passages. Velmira reassured her, visited Odie's concealed home and left a note, then sought Spencer's help finding him. Velmira later accompanied Jessa to Captain Brannic Hale. The captain agreed to halt new Foldling-related closures pending evidence, while existing Watch seals remained under review. Velmira did not reveal the identity of a firsthand witness without permission.</p>
<h3>Marek: a new form and a new purpose</h3>
<p>Marek explored the Foldling-shaped Agile Scout Beastform, discovering its instinctive comfort in tight spaces and fear of open sky. He later discussed the experience with Odie and demonstrated the form to his mentor Meren. Meren needed Thirst-Marrow, a desert cactus Marek had not yet managed to find.</p>
<h3>Rest and reunion</h3>
<p>After a Long Rest, Odie began reconstructing a remembered Cistern Plate sketch, Marek recovered, and Velmira prepared for the next day. All three collected water at Valve Court. Velmira recalled a promising but unconfirmed lead for Thirst-Marrow in neglected southern ground and agreed to help Marek search.</p>
<h3>A bargain at Valve Court</h3>
<p>Marek told information trader Mara Vell what he knew of the Foldling's appearance and frightened behaviour, while withholding details of its movements. In return, Mara promised one future information favour. They sealed the agreement with a handshake.</p>
<h3>The road south</h3>
<p>Marek, Odie and Velmira travelled south beyond the Great-Shell pens into the Stripped Yards: roofless dwellings, stripped workshops and old loading grounds slowly reclaimed by sand. They noticed animal tracks leading into abandoned houses. Then, from the western ruins, came the sound of stone striking stone. Once, then twice, then silence.</p>
<p><strong>At session end:</strong> All three are in the Stripped Yards searching for Thirst-Marrow. They have not found any yet, and the sound's source remains unknown.</p>`
  };
  window.GREYWAKE_CATEGORIES = window.GREYWAKE_CATEGORIES || {};
  window.GREYWAKE_CATEGORIES.Sessions = window.GREYWAKE_CATEGORIES.Sessions || [];
  if (!window.GREYWAKE_CATEGORIES.Sessions.includes(key)) window.GREYWAKE_CATEGORIES.Sessions.push(key);
  window.GREYWAKE_EDGES = window.GREYWAKE_EDGES || [];
  ["Session 04 — Player Recap", "Marek", "Odie", "Velmira", "Greywake", "Spencer Digger"].forEach(other => {
    if (!window.GREYWAKE_EDGES.some(e => (e[0] === key && e[1] === other) || (e[0] === other && e[1] === key))) window.GREYWAKE_EDGES.push([key, other]);
  });
  window.GREYWAKE_DISCOVERIES = window.GREYWAKE_DISCOVERIES || [];
  if (!window.GREYWAKE_DISCOVERIES.some(d => d.note === key)) window.GREYWAKE_DISCOVERIES.unshift({title:"Session Five — The Southern Ways",note:key,kind:"Session",text:"Marek, Odie and Velmira have entered the Stripped Yards to seek Thirst-Marrow. An unexplained sound came from the western ruins.",when:"11 October 2026"});
})();
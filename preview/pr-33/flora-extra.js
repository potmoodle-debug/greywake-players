(() => {
  const D=window.GREYWAKE_DATA||(window.GREYWAKE_DATA={});
  const C=window.GREYWAKE_CATEGORIES||(window.GREYWAKE_CATEGORIES={});
  const E=window.GREYWAKE_EDGES||(window.GREYWAKE_EDGES=[]);

  D["Latchfan"]={
    title:"Latchfan",
    category:"Flora & Fauna",
    html:"<p>Latchfan is a low, stone-rooted plant that grows in cool cracks and shaded rock shelters. Its broad ribbed fronds are dust-grey above and dark reddish underneath, and mature plants send pale fibrous roots deep into fractures in the stone.</p><p>Greywake travellers value it because several parts of the plant are useful in the field. Fresh fronds make tough temporary padding or wrapping, the root fibres can reinforce bindings and lashings, and a small amount of amber sap from a cut frond works as a practical sealant or tack for emergency repairs.</p><p>A Latchfan is not predatory. When heavily stepped on or crushed, its fronds fold inward around the centre of the plant to protect the crown. In a tight space, that reaction can snag loose cloth, straps, or footing, but only if someone deliberately makes use of it.</p><p>Healthy patches also tell experienced travellers something about the ground: the site holds dependable shade, has stable cracks beneath the surface, and traps enough fine debris or condensation for persistent growth.</p>"
  };

  D["Thirst-Marrow"]={
    title:"Thirst-Marrow",
    category:"Flora & Fauna",
    html:"<p><strong>Emergency moisture of the outer wastes.</strong> Recognise it by the squat clustered lobes and pale, stringy flesh inside.</p><p>The pale fibres hold enough moisture to keep a traveller moving when their water is gone. It is emergency food for the thirsty, not a substitute for a waterskin.</p><p>Break or cut through the hard outer growth and take the pale marrow from within. It is fibrous, unpleasant, and used because the alternative is worse.</p><p>A person can survive on Thirst-Marrow for days. The longer they rely on it, the less anyone in Greywake will call that survival safe. Reach real water as soon as you can.</p><blockquote>Marrow keeps your feet moving. Water brings you home.</blockquote><p><em>Common field knowledge among caravan hands, route-readers, salvagers and waste travellers.</em></p>"
  };

  C["Flora & Fauna"]=[...(C["Flora & Fauna"]||[]).filter(n=>n!=="Latchfan"&&n!=="Thirst-Marrow"),"Latchfan","Thirst-Marrow"];

  const links=[
    ["Known Flora and Fauna","Latchfan"],
    ["Known Flora and Fauna","Thirst-Marrow"],
    ["Latchfan","Stone-Lip Hollow"]
  ];
  for(const edge of links){
    if(!E.some(([a,b])=>(a===edge[0]&&b===edge[1])||(a===edge[1]&&b===edge[0]))) E.push(edge);
  }
})();

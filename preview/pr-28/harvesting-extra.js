(() => {
  const D=window.GREYWAKE_DATA||(window.GREYWAKE_DATA={});
  const C=window.GREYWAKE_CATEGORIES||(window.GREYWAKE_CATEGORIES={});
  const E=window.GREYWAKE_EDGES||(window.GREYWAKE_EDGES=[]);

  D["Creature Harvesting"]={
    title:"Creature Harvesting",
    category:"Field Rules",
    html:"<p>In Greywake, a dead creature can be a resource: shell, hide, bone, teeth, tendon, venom, glands or other useful material may matter if somebody can recognise it, remove it cleanly and keep it usable.</p><h2>How it works</h2><p>Say what you want to recover and what you hope to do with it. If the part is obvious and there is no meaningful danger, no roll is needed. A roll matters when the anatomy is uncertain, the extraction is delicate, the carcass is damaged, preservation is difficult, or time and danger are pressing.</p><p>Use normal Daggerheart action rolls. The trait depends on what you are actually doing: Instinct or Knowledge might identify useful anatomy, Finesse might extract a fragile gland, and Strength might be needed to hold open a heavy jaw or move a plate.</p><h2>Carcass condition matters</h2><p>How a creature died changes what can still be recovered. Fire can ruin hide and soft tissue. Crushing can break shell or bone. A controlled kill may leave more useful material intact.</p><h2>Keeping it useful</h2><p>Hard materials such as shell, teeth, bone and spines usually travel well. Meat, organs, untreated hide and soft tissue need sensible preparation. Venom, glands, secretions and fragile membranes need proper containers or specialist care.</p><h2>What parts can become</h2><ul><li><strong>Immediate use</strong> — something useful in the field.</li><li><strong>Material</strong> — repair or crafting stock.</li><li><strong>Trade</strong> — something another Greywake local wants.</li><li><strong>Special</strong> — a component that can become a distinctive item or consumable when worked by the right person.</li></ul><p>Having the part is not the same as having the finished item. Some jobs need the right craftsperson, equipment, time or a longer project.</p><blockquote>Greywake wastes very little that can keep something working one more day.</blockquote>"
  };

  C["Field Rules"]=[...(C["Field Rules"]||[]).filter(n=>n!=="Creature Harvesting"),"Creature Harvesting"];

  const links=[
    ["Creature Harvesting","Known Flora and Fauna"],
    ["Creature Harvesting","Great-Shell"],
    ["Creature Harvesting","Cacklemaw Pack"],
    ["Creature Harvesting","Odie"],
    ["Creature Harvesting","Clay"]
  ];
  for(const edge of links){
    if(!E.some(([a,b])=>(a===edge[0]&&b===edge[1])||(a===edge[1]&&b===edge[0]))) E.push(edge);
  }
})();

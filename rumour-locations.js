(() => {
  window.GREYWAKE_DATA = window.GREYWAKE_DATA || {};
  window.GREYWAKE_CATEGORIES = window.GREYWAKE_CATEGORIES || {};
  window.GREYWAKE_EDGES = window.GREYWAKE_EDGES || [];

  function addLocation(name, html) {
    if (!window.GREYWAKE_DATA[name]) {
      window.GREYWAKE_DATA[name] = { title: name, category: 'Locations', html };
    }
    const locations = window.GREYWAKE_CATEGORIES.Locations ||= [];
    if (!locations.includes(name)) locations.push(name);
    if (!window.GREYWAKE_EDGES.some(([a,b]) => a === name && b === 'Known Locations')) {
      window.GREYWAKE_EDGES.push([name, 'Known Locations']);
    }
  }

  // Party-known only through Digger reports. The record deliberately preserves that uncertainty.
  addLocation('Old Ruin South of Greywake', `
    <p><strong>Knowledge quality: rumour.</strong> Diggers say an old ruin somewhere south of Greywake has become unsafe after something dangerous moved into it and work stopped.</p>
    <p>The party has not established the exact route, who personally witnessed the creature, what the creature is, or why it is there. The ruin is known as a reported place, not as a confirmed explored location.</p>
  `);

})();

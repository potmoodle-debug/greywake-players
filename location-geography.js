/* Player-facing geography. Region IDs are geographical, never session or expedition IDs.
   Add regions here and geography metadata on location records; the UI needs no changes.
   Optional order controls presentation, not distance or travel sequence.
   Existing journey links in GREYWAKE_EDGES remain independent of geography.
   Parent and position are optional; omit them unless established in player knowledge. */
(() => {
  const D=window.GREYWAKE_DATA;
  const C=window.GREYWAKE_CATEGORIES;
  const E=window.GREYWAKE_EDGES;
  if(!D||!C||!E)return;
  window.GREYWAKE_GEOGRAPHY={regions:{
    'inner-greywake':{label:'Inner Greywake',order:10},
    'greater-greywake':{label:'Greater Greywake',order:20},
    'greywake-underground':{label:'Greywake — underground ways',order:30},
    'eastern-wastes':{label:'The Wastes — East',order:40},
    'southern-wastes':{label:'The Wastes — South',order:50}
  }};
  // Current party-known data, not navigation logic.
  const geography={
    'Inner Greywake':{regionId:'inner-greywake',order:10},
    'Caravan Gate':{regionId:'inner-greywake',parent:'Inner Greywake',order:20},
    'White Tower':{regionId:'inner-greywake',parent:'Inner Greywake',order:30},
    'Valve Court':{regionId:'inner-greywake',parent:'Inner Greywake',order:40},
    'Tangle Lanes':{regionId:'inner-greywake',parent:'Inner Greywake',order:50},
    'Greater Greywake':{regionId:'greater-greywake',order:10},
    'Great-Shell Pens':{regionId:'greater-greywake',parent:'Greater Greywake',order:20},
    'Digger Yards':{regionId:'greater-greywake',parent:'Greater Greywake',order:30},
    'The Stripped Yards':{regionId:'greater-greywake',parent:'Greater Greywake',order:40,positionKnowledge:'broad'},
    'Digger Ways':{regionId:'greywake-underground',order:10},
    'High Shelf':{regionId:'eastern-wastes',order:10,positionKnowledge:'broad-route-area'},
    'Old Marker Wash':{regionId:'eastern-wastes',order:20,positionKnowledge:'broad-route-area'},
    'Old Marker Line':{regionId:'eastern-wastes',order:30,positionKnowledge:'broad-route-area'},
    'Failed Marker':{regionId:'eastern-wastes',order:40,positionKnowledge:'broad-route-area'},
    'Wrong Lower Line':{regionId:'eastern-wastes',order:50,positionKnowledge:'broad-route-area'},
    'Ash-Plate Groundfall':{regionId:'eastern-wastes',order:60,positionKnowledge:'broad'},
    'Broken Runnels':{regionId:'eastern-wastes',order:70,positionKnowledge:'broad-route-area'},
    "Joric's Runnel":{regionId:'eastern-wastes',parent:'Broken Runnels',order:80,positionKnowledge:'broad-route-area'},
    'Stone-Lip Hollow':{regionId:'eastern-wastes',order:90,positionKnowledge:'broad-route-area'},
    'Old Ruin South of Greywake':{regionId:'southern-wastes',positionKnowledge:'reported'}
  };
  // Already visited in Session Five; register the public account, not GM preparation.
  const name='The Stripped Yards';
  if(!D[name])D[name]={title:name,category:'Locations',html:'<p>Abandoned southern outskirts beyond the Great-Shell pens, with roofless dwellings, stripped workshops and old loading grounds reclaimed by sand.</p><p>The party entered this area while searching for Thirst-Marrow. Animal tracks led into abandoned houses and two sounds of stone striking stone came from the western ruins. Neither the source nor a Thirst-Marrow patch has been identified.</p>'};
  const locations=C.Locations||=([]);
  if(!locations.includes(name))locations.push(name);
  for(const related of ['Known Locations','Greater Greywake','Session 05 — Player Recap']){
    if(D[related]&&!E.some(([a,b])=>(a===name&&b===related)||(b===name&&a===related)))E.push([name,related]);
  }
  for(const [key,metadata] of Object.entries(geography)){
    if(D[key]&&D[key].category==='Locations')D[key].geography={...metadata,...D[key].geography};
  }
})();

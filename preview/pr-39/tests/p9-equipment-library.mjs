import fs from 'node:fs';
const js=fs.readFileSync('p9-equipment-library.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const must=[
  "Minor Health Potion",
  "Minor Stamina Potion",
  "KNOWN · OFFICIAL DAGGERHEART",
  "data-p9-add",
  "p9-item-action",
  "window.GreywakeEquipmentLibrary",
  "p9-equipment-library.js?v=p9-1"
];
for(const needle of must){
  const hay=needle.includes('p9-equipment-library.js')?html:js;
  if(!hay.includes(needle)) throw new Error(`Missing P9 equipment-library marker: ${needle}`);
}
if(js.includes('new MutationObserver')) throw new Error('P9 must not observe and rewrite the whole DOM');
console.log('P9 equipment-library smoke test passed');

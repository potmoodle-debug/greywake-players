import fs from 'node:fs';
const library=fs.readFileSync('p9-equipment-library.js','utf8');
const equipment=fs.readFileSync('equipment-system-v2.js','utf8');
const html=fs.readFileSync('index.html','utf8');

for(const needle of [
  'KNOWN · OFFICIAL DAGGERHEART',
  'consumableItems',
  'equipment()?.consumables',
  'data-filter="consumable"',
  'data-p9-add',
  'p9-item-action',
  'window.GreywakeEquipmentLibrary'
]){
  if(!library.includes(needle)) throw new Error(`Missing P9 equipment-library marker: ${needle}`);
}
for(const needle of ['Minor Health Potion','Minor Stamina Potion','Math.min(5']){
  if(!equipment.includes(needle)) throw new Error(`Missing equipment-owner consumable marker: ${needle}`);
}
if(!html.includes('p9-equipment-library.js?v=p9-4')) throw new Error('Current P9 equipment library script is not loaded');
if(library.includes('new MutationObserver')) throw new Error('P9 library must remain event-driven and not observe/rewrite the whole DOM');
console.log('P9 equipment-library smoke test passed');

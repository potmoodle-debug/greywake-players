import fs from 'node:fs';
const library=fs.readFileSync('backpack-system.js','utf8');
const equipment=fs.readFileSync('equipment-system-v4.js','utf8');
const html=fs.readFileSync('index.html','utf8');

for(const needle of [
  'KNOWN · OFFICIAL DAGGERHEART',
  'equipment()?.consumables',
  'data-filter="consumable"',
  'p9-item-action',
  'libraryItems',
  'window.GreywakeBackpack'
]){
  if(!library.includes(needle)) throw new Error(`Missing current Backpack equipment-library marker: ${needle}`);
}
for(const needle of ['Minor Health Potion','Minor Stamina Potion','Math.min(5']){
  if(!equipment.includes(needle)) throw new Error(`Missing equipment-owner consumable marker: ${needle}`);
}
if(!html.includes('backpack-system.js?v=backpack1')) throw new Error('Current Backpack equipment library is not loaded');
if(library.includes('new MutationObserver')) throw new Error('Backpack library must remain event-driven and not observe/rewrite the whole DOM');
console.log('P9 equipment-library smoke test passed');

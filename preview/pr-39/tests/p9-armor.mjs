import fs from 'node:fs';
const armor=fs.readFileSync('p9-armor.js','utf8');
const library=fs.readFileSync('p9-equipment-library.js','utf8');
const html=fs.readFileSync('index.html','utf8');
for(const needle of ['Gambeson Armor','Leather Armor','Chainmail Armor','Full Plate Armor','openArmorEquip','combatStats']){
  if(!armor.includes(needle)) throw new Error(`Missing armor marker: ${needle}`);
}
for(const needle of ['data-filter="armor"','armorCatalog','isArmorEquipped']){
  if(!library.includes(needle)) throw new Error(`Missing armor library marker: ${needle}`);
}
if(!html.includes('p9-armor.js?v=p9armor1')) throw new Error('Armor integration script is not loaded');
if(armor.includes('MutationObserver')) throw new Error('Armor integration must remain event-driven');
console.log('P9 armor smoke test passed');

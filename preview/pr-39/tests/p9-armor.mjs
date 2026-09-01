import fs from 'node:fs';
const armor=fs.readFileSync('p9-armor.js','utf8');
const library=fs.readFileSync('p9-equipment-library.js','utf8');
const html=fs.readFileSync('index.html','utf8');
for(const needle of ['Gambeson Armor','Leather Armor','Chainmail Armor','Full Plate Armor','addArmor','isArmorOwned','openArmorEquip','combatStats','ownedArmor']){
  if(!armor.includes(needle)) throw new Error(`Missing armor marker: ${needle}`);
}
for(const needle of ['data-filter="armor"','armorCatalog','isArmorEquipped','isArmorOwned','stored']){
  if(!library.includes(needle)) throw new Error(`Missing armor library marker: ${needle}`);
}
if(!html.includes('p9-armor.js?v=p9armor2')) throw new Error('Armor integration script is not loaded with current cache version');
if(!html.includes('p9-equipment-library.js?v=p9-4')) throw new Error('Equipment library is not loaded with current cache version');
if(armor.includes('MutationObserver')) throw new Error('Armor integration must remain event-driven');
console.log('P9 armor ownership/equip smoke test passed');

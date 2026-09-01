import fs from 'node:fs';

const read = path => fs.readFileSync(path,'utf8');
const mechanics = read('p9-mechanics-completion.js');
const removal = read('p9-item-removal.js');
const damageUndo = read('p9-damage-undo.js');
const equipment = read('equipment-system-v4.js');
const nomadic = read('p9-nomadic-pack.js');
const consumableFeedback = read('p9-consumable-feedback.js');
const consolidation = read('p9-inventory-consolidation.js');
const html = read('index.html');

for (const needle of ['Other / custom item','PERSONAL_GEAR','CANONICAL_ACTIONS','Powerful rolls','Small Dagger Paired +2','Startling · Mark 1 Stress','api.openWeaponUse=openDynamicWeapon']) {
  if (!mechanics.includes(needle)) throw new Error(`Missing P9 mechanics marker: ${needle}`);
}
for (const needle of ['function unequip(id)','TWO-HANDED','ONE-HANDED','next.activePrimary=null','Potion not consumed','d4 rolled','count-1','inventoryWeapons.length>=2']) {
  if (!equipment.includes(needle)) throw new Error(`Missing equipment v4 marker: ${needle}`);
}
for (const needle of ['Once per session','spendHope','Nomadic Pack','data-nomadic-item','addCustomItem','Reset for new session','does not reset on a rest']) {
  if (!nomadic.includes(needle)) throw new Error(`Missing Nomadic Pack marker: ${needle}`);
}
for (const needle of ['Minor Health Potion','Minor Stamina Potion','cleared ${cleared}','potion','data-p9-consumable-result']) {
  if (!consumableFeedback.includes(needle)) throw new Error(`Missing Backpack consumable feedback marker: ${needle}`);
}
for (const needle of ['equipment-system-v4.js?v=equipment4','p9-nomadic-pack.js?v=nomadic3','p9-consumable-feedback.js?v=consumables2']) {
  if (!consolidation.includes(needle)) throw new Error(`Missing P9 bootstrap marker: ${needle}`);
}
for (const needle of ['removedItems:clean(r)','api.importState=remote','remote.removedItems','api.restoreGear']) {
  if (!removal.includes(needle)) throw new Error(`Missing synchronized removal marker: ${needle}`);
}
for (const needle of ["[data-resource-undo],[data-companion-undo]",'restoreCheckpoint','Correct accidental death']) {
  if (!damageUndo.includes(needle)) throw new Error(`Missing damage undo marker: ${needle}`);
}
for (const needle of ['p9-damage-undo.js?v=p9damage2','p9-mechanics-completion.js?v=p9mechanics1']) {
  if (!html.includes(needle)) throw new Error(`P9 runtime script is not loaded: ${needle}`);
}
if (fs.existsSync('p9-stored-armor-view.js')) throw new Error('Obsolete stored armor helper should not remain in P9.');
if (/MutationObserver/.test(mechanics+equipment+nomadic+consumableFeedback)) throw new Error('P9 mechanics must remain event-driven; no broad mutation observer.');
console.log('P9 hand slots, Nomadic Pack session reset, consumable feedback and mechanics checks passed');

import fs from 'node:fs';

const read = path => fs.readFileSync(path,'utf8');
const mechanics = read('p9-mechanics-completion.js');
const removal = read('p9-item-removal.js');
const damageUndo = read('p9-damage-undo.js');
const html = read('index.html');

for (const needle of [
  'Other / custom item',
  'PERSONAL_GEAR',
  'CANONICAL_ACTIONS',
  'Powerful rolls',
  'Small Dagger Paired +2',
  'Startling · Mark 1 Stress',
  'Nomadic Pack is not currently carried',
  'api.openWeaponUse=openDynamicWeapon'
]) {
  if (!mechanics.includes(needle)) throw new Error(`Missing P9 mechanics marker: ${needle}`);
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
if (/MutationObserver/.test(mechanics)) throw new Error('P9 mechanics must remain event-driven; no broad mutation observer.');

console.log('P9 final mechanics smoke test passed');

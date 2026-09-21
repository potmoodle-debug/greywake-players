import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(join(root, 'index.html'), 'utf8');
const portal = readFileSync(join(root, 'player-portal.js'), 'utf8');
const failures = [];

if (existsSync(join(root, 'group-choice.js'))) failures.push('Retired automatic group-choice runtime still exists.');
if (index.includes('group-choice.js')) failures.push('Retired group-choice runtime is still loaded by index.html.');
if (portal.includes('Vote for this') || portal.includes('One vote per player')) failures.push('Party voting language returned to the player portal.');
if (!portal.includes('Pursuing informs the GM — it does not commit the party.')) failures.push('Missing Pursuing/party boundary guidance.');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}
console.log('P6 automatic group-choice retirement checks passed.');

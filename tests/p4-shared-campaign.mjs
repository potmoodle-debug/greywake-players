import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'current-threads.js'), 'utf8');
const failures = [];
const requireText = (text, label = text) => { if (!source.includes(text)) failures.push(`Missing P4 campaign boundary: ${label}`); };
const forbidText = (text, label = text) => { if (source.includes(text)) failures.push(`Unsupported P4 campaign claim present: ${label}`); };

requireText("title: 'Something Moved In'", 'south selectable expedition');
requireText("direction: 'SOUTH ↓'", 'south direction shown');
requireText('Minor Stamina Potion recipe', 'known possible reward');

requireText("title: 'Freight at Ash-Plate Groundfall'", 'groundfall opportunity');
requireText("status: 'KNOWN OPPORTUNITY · NOT SELECTABLE YET'", 'groundfall not selectable');
requireText("direction: 'DIRECTION NOT YET ESTABLISHED'", 'unknown-direction boundary');
forbidText("direction: 'EAST →'", 'unsupported Groundfall east direction');
forbidText('eastern Kestrel Return route corridor', 'unsupported eastern route claim');

requireText("title: 'Find a Flickerfly'", 'Marek Flickerfly interest');
requireText("status: 'PLAYER INTEREST · NO ACTIONABLE LEAD YET'", 'Flickerfly not fabricated into expedition');
requireText('a specific sighting, Digger witness, wing fragment, route or cardinal direction is not', 'Flickerfly evidence boundary');
forbidText('thin translucent piece of wing caught among broken stone', 'invented Flickerfly wing lead');
forbidText('Stories about them mostly seem to come from travellers returning from south', 'invented Flickerfly south lead');

requireText("title: 'The Cistern Plate'", 'Cistern Plate current pressure');
requireText('compatibility are not established', 'Cistern Plate compatibility boundary');
forbidText('intended to interface with Greywake’s waterworks', 'unsupported exact Plate intent');

requireText("direction: 'GREYWAKE FIRST'", 'route-marker investigation starts in town');
requireText("status: 'ODIE PRIORITY · ACTIVE IN GREYWAKE'", 'Closing Ways state');
requireText("status: 'VELMIRA PRIORITY · NOT SELECTABLE YET'", 'Stilling lead state');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('P4 shared campaign audit passed.');

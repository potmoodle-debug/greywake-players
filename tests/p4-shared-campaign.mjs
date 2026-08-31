import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const threads = readFileSync(join(root, 'current-threads.js'), 'utf8');
const state = readFileSync(join(root, 'current-state-audit.js'), 'utf8');
const failures = [];
const requireIn = (source, text, label = text) => { if (!source.includes(text)) failures.push(`Missing P4 campaign boundary: ${label}`); };
const forbidIn = (source, text, label = text) => { if (source.includes(text)) failures.push(`Unsupported P4 campaign claim present: ${label}`); };

requireIn(threads, "title: 'Something Moved In'", 'south selectable expedition');
requireIn(threads, "direction: 'SOUTH ↓'", 'south direction shown');
requireIn(threads, 'Minor Stamina Potion recipe', 'known possible reward');

requireIn(threads, "title: 'Freight at Ash-Plate Groundfall'", 'groundfall opportunity');
requireIn(threads, "status: 'KNOWN OPPORTUNITY · NOT SELECTABLE YET'", 'groundfall not selectable');
requireIn(threads, "direction: 'DIRECTION NOT YET ESTABLISHED'", 'unknown-direction boundary');
forbidIn(threads, "direction: 'EAST →'", 'unsupported Groundfall east direction');
forbidIn(threads, 'eastern Kestrel Return route corridor', 'unsupported eastern route claim');

requireIn(threads, "title: 'Find a Flickerfly'", 'Marek Flickerfly interest');
requireIn(threads, "status: 'PLAYER INTEREST · NO ACTIONABLE LEAD YET'", 'Flickerfly not fabricated into expedition');
requireIn(threads, 'a specific sighting, Digger witness, wing fragment, route or cardinal direction is not', 'Flickerfly evidence boundary');
forbidIn(threads, 'thin translucent piece of wing caught among broken stone', 'invented Flickerfly wing lead');
forbidIn(threads, 'Stories about them mostly seem to come from travellers returning from south', 'invented Flickerfly south lead');

requireIn(threads, "title: 'The Cistern Plate'", 'Cistern Plate current pressure');
requireIn(threads, 'compatibility are not established', 'Cistern Plate compatibility boundary');
forbidIn(threads, 'intended to interface with Greywake’s waterworks', 'unsupported exact Plate intent');
requireIn(threads, "direction: 'GREYWAKE FIRST'", 'route-marker investigation starts in town');
requireIn(threads, "status: 'ODIE PRIORITY · ACTIVE IN GREYWAKE'", 'Closing Ways state');
requireIn(threads, "status: 'VELMIRA PRIORITY · NOT SELECTABLE YET'", 'Stilling lead state');

requireIn(state, "D['Clay'].title = 'Clay — Historical PC'", 'Clay historical continuity');
requireIn(state, "C['Player Characters'] = ['Marek','Velmira','Odie']", 'active PC list');
requireIn(state, "D['Ash-Plate Groundfall']", 'Groundfall shared location record');
requireIn(state, 'does <strong>not</strong> establish whether the Groundfall is north, east, south or west', 'Groundfall location direction boundary');
requireIn(state, 'returned to Greywake alive at the end of Session Three', 'Kestrel survivor current state');
requireIn(state, 'the party has not yet seen a confirmed specimen', 'Flickerfly shared field-guide boundary');
requireIn(state, 'Possible benefit:</strong> getting the work moving again may earn access to a Minor Stamina Potion recipe', 'archive choice-board reward alignment');
requireIn(state, 'Clay, Velmira and Odie completed the Kestrel Return rescue during Sessions One to Three', 'historical party attribution');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('P4 shared campaign audit passed.');

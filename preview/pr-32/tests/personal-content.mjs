import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'personal-knowledge.js'), 'utf8');
const failures = [];
const requireText = (text, label = text) => { if (!source.includes(text)) failures.push(`Missing personal-content boundary: ${label}`); };
const forbidText = (text, label = text) => { if (source.includes(text)) failures.push(`Unsupported personal-content claim present: ${label}`); };

// Marek: current canon establishes Meren, the unknown Beastform and fresh PC relationships.
requireText("title: 'Meren'", 'Marek — Meren');
requireText("title: 'The Unknown Beastform'", 'Marek — unknown Beastform');
requireText('his body seemed to know what it was becoming before he did.', 'Marek — Beastform memory boundary');
forbidText("title: 'Daro Pell'", 'Marek — unsupported Daro Pell personal contact');

// Velmira: personal relationship set and explicit knowledge boundaries.
requireText("title: 'Lysa'", 'Velmira — Lysa');
requireText("title: 'What You Saw on Kestrel Return'", 'Velmira — firsthand expedition knowledge');
requireText('does not automatically know its exact function', 'Velmira — plate knowledge boundary');

// Odie: Closing Ways are current, the reporting theory remains a suspicion, and Oldwork finger stays separate.
requireText("title: 'The Closing Ways'", 'Odie — Closing Ways');
requireText("tag: 'Odie’s suspicion · not established fact'", 'Odie — reporting suspicion boundary');
requireText('It is not fitted to his salvage prosthetic.', 'Odie — separate Oldwork finger');
forbidText("title: 'No Sign of Anyone Before You'", 'Odie — unsupported first-discoverer claim');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('Greywake personalised content audit passed.');

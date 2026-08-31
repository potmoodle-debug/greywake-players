import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'p7-usability.js'), 'utf8');
const loader = readFileSync(join(root, 'arrival-experience.js'), 'utf8');
const failures = [];
const requireText = (text, label = text) => { if (!source.includes(text)) failures.push(`Missing P7 behaviour: ${label}`); };

requireText('Add to inventory', 'player-added inventory');
requireText('Current conditions', 'condition tracking');
requireText('No action roll · roll 1d4 healing', 'Regeneration uses d4 rather than Duality roll');
requireText('Apply to', 'Regeneration target selector');
requireText('No roll · +2 Stress recovery', 'Clarity of Nature fixed +2 effect');
requireText("title === 'Beastform' || title === 'Evolution'", 'Beastform and Evolution open form picker');
requireText("title === 'Evolution' ? 'evolution' : 'stress'", 'correct transformation mode preselection');
requireText("button.dataset.p7Reversible === 'pursuing' ? 'open' : 'dormant'", 'Pursuing and Interested can be unticked');
requireText("button.textContent = 'Q&A'", 'quick Q&A access');
requireText('p7Utilities: loadUtilityState()', 'custom inventory and conditions join equipment sync payload');
requireText("priorityObserver.observe(root,{childList:true,subtree:true})", 'priority observer is scoped');
if (source.includes("observe(document.body,{childList:true,subtree:true})")) failures.push('P7 must not use a full-page childList observer that re-renders character utilities.');
if (source.includes('new MutationObserver(() => { renderUtilities()')) failures.push('P7 utility rendering must not recursively trigger from its own DOM mutations.');
if (!loader.includes("p7-usability.js?v=p7-2")) failures.push('P7 usability script is not loaded with the fixed cache version');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}
console.log('P7 usability checks passed.');

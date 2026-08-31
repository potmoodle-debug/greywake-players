import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'p7-usability.js'), 'utf8');
const mind = readFileSync(join(root, 'player-mind-view.js'), 'utf8');
const failures = [];
const requireSource = (text, label = text) => { if (!source.includes(text)) failures.push(`Missing P7 behaviour: ${label}`); };
const requireMind = (text, label = text) => { if (!mind.includes(text)) failures.push(`Missing mind hierarchy: ${label}`); };

requireSource('Inventory & Conditions', 'stable visible inventory and conditions area');
requireSource("group.querySelector(':scope > .p7-utilities')", 'utilities mount outside live equipment manager');
requireSource('Add to inventory', 'player-added inventory');
requireSource('Current conditions', 'condition tracking');
requireSource('No Duality roll', 'Regeneration does not use a Duality roll');
requireSource('✓ 3 Hope spent once', 'Regeneration makes the single cost explicit');
requireSource("if(button.disabled)return", 'Regeneration/Clarity action cannot double-trigger while resolving');
requireSource('Apply Clarity of Nature', 'Clarity is an actionable control');
requireSource('First Stress recovery', 'Clarity can distribute its first Stress');
requireSource('Second Stress recovery', 'Clarity can distribute its second Stress');
requireSource("['Beastform','Evolution','Regeneration','Clarity of Nature']", 'special Marek actions are captured directly');
requireSource("title==='Evolution'?'evolution':'stress'", 'correct Beastform transformation mode');
requireSource('MAX_ACTIVE_INTERESTS=12', 'Interested capacity expanded');
requireSource('MAX_PURSUING=3', 'Pursuing remains a focused shortlist');
requireSource("goal?.status==='pursuing'", 'Pursuing can be demoted');
requireSource("goal?.status==='open'", 'Interested can be removed or promoted');
requireSource("className='p7-fixed-qna'", 'Q&A is a fixed global affordance');
requireSource("location.hash='#/inbox'", 'fixed Q&A opens inbox');
requireSource('p7Utilities:loadUtilityState()', 'custom inventory and conditions join equipment sync payload');
if (source.includes("observe(document.body,{childList:true,subtree:true})")) failures.push('P7 must not use a full-page recursive childList observer.');

requireMind('Pursuing', 'Pursuing tier');
requireMind('Interested', 'Interested tier');
requireMind('This is a hierarchy', 'hierarchy explanation');
requireMind('MAX_PURSUING=3', 'three-item Pursuing cap');
requireMind('MAX_INTERESTS=12', 'larger Interested holding area');
requireMind('Interested → Pursuing → Group Choice.', 'player-facing hierarchy path');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}
console.log('P7 usability checks passed.');

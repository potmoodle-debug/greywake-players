import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'p7-usability.js'), 'utf8');
const priorities = readFileSync(join(root, 'card-priorities.js'), 'utf8');
const mind = readFileSync(join(root, 'player-mind-view.js'), 'utf8');
const cardCss = readFileSync(join(root, 'greywake-item-cards.css'), 'utf8');
const arrival = readFileSync(join(root, 'arrival-experience.js'), 'utf8');
const backpack = readFileSync(join(root, 'p7-backpack.js'), 'utf8');
const characterPage = readFileSync(join(root, 'character-page.js'), 'utf8');
const failures = [];
const requireSource = (text, label = text) => { if (!source.includes(text)) failures.push(`Missing P7 behaviour: ${label}`); };
const requirePriority = (text, label = text) => { if (!priorities.includes(text)) failures.push(`Missing priority-owner behaviour: ${label}`); };
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
requireSource("className='p7-fixed-qna'", 'Q&A is a fixed global affordance');
requireSource("location.hash='#/inbox'", 'fixed Q&A opens inbox');
requireSource('p7Utilities:loadUtilityState()', 'custom inventory and conditions join equipment sync payload');
if (source.includes('handlePriorityClick')) failures.push('P7 must not intercept priority clicks after consolidation.');
if (source.includes('MAX_ACTIVE_INTERESTS') || source.includes('MAX_PURSUING')) failures.push('Priority hierarchy limits must not be owned by P7.');
if (source.includes("observe(document.body,{childList:true,subtree:true})")) failures.push('P7 must not use a full-page recursive childList observer.');

requirePriority('MAX_ACTIVE_INTERESTS = 12', 'Interested capacity is twelve');
requirePriority('MAX_PURSUING = 3', 'Pursuing remains a focused shortlist');
requirePriority("await patchGoal(goal.id, 'dormant')", 'Interested can be set aside');
requirePriority("await patchGoal(goal.id, 'open')", 'Pursuing can be demoted');
requirePriority("await patchGoal(goal.id, 'pursuing')", 'Interested can be promoted');
requirePriority('ownsPriorityActions: true', 'card-priorities declares action ownership');
requirePriority("data-context-interest", 'priority owner binds Interested directly');
requirePriority("data-context-pursue", 'priority owner binds Pursue directly');

requireMind('Pursuing', 'Pursuing tier');
requireMind('Interested', 'Interested tier');
requireMind('This is a hierarchy', 'hierarchy explanation');
requireMind('MAX_PURSUING=3', 'three-item Pursuing cap');
requireMind('MAX_INTERESTS=12', 'larger Interested holding area');
requireMind('Interested → Pursuing → Group Choice.', 'player-facing hierarchy path');
requireMind('Open source card →', 'mind cards clearly return to their source card');
requireMind("location.hash='#/campaign'", 'mind card fallback opens Campaign rather than Q&A');
requireMind('greywake:mind-source-card', 'mind card fallback remembers which source card to focus');
requireMind('player-mind-source-focus', 'source card gets a visible focus state');
if (mind.includes('greywake:open-player-inbox')) failures.push('On my mind must never open Q&A/inbox as a fallback.');

if (!cardCss.includes('#equipmentManager .equip-item')) failures.push('Equipment cards are not covered by the Greywake item-card theme.');
if (!cardCss.includes('.p7-utility-card[data-p7-kind="items"] .p7-list-row')) failures.push('Player-added items are not covered by the Greywake item-card theme.');
if (!cardCss.includes('aspect-ratio:5/7')) failures.push('Greywake item cards must retain a collectible-card proportion.');
if (!arrival.includes('greywake-item-cards.css?v=p7-card1')) failures.push('Greywake item-card stylesheet is not loaded by the player site.');
if (!arrival.includes('p7-backpack.js?v=pack1')) failures.push('Backpack experience is not loaded by the player site.');
if (!backpack.includes('Open Backpack')) failures.push('Backpack experience does not expose an open control.');
if (!backpack.includes(".p7-utility-card[data-p7-kind=\"items\"]{display:none!important}")) failures.push('Old permanent item-entry form is still visible.');
if (!backpack.includes('What did you pick up?')) failures.push('Backpack add-item flow is missing.');
if (!backpack.includes("location.hash") && !backpack.includes("#/character")) failures.push('Backpack is not scoped to the character page.');
if (!characterPage.includes('characterBackpackButton')) failures.push('Backpack is not exposed in the top character toolbar.');
if (!characterPage.includes('character-page-toolbar-actions')) failures.push('Character toolbar does not group primary character actions.');
if (!characterPage.includes('openBackpackFromHeader')) failures.push('Top Backpack button is not wired to the backpack experience.');
if (!characterPage.includes('#p7BackpackEntry{display:none!important}')) failures.push('Old lower Backpack entry remains visible after promoting Backpack to the header.');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}
console.log('P7/P8 usability checks passed.');

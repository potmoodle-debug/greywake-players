import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'card-priorities.js'), 'utf8');
const portal = readFileSync(join(root, 'player-portal.js'), 'utf8');
const failures = [];
const requireText = (haystack, text, label = text) => { if (!haystack.includes(text)) failures.push(`Missing P5 player-choice behaviour: ${label}`); };

requireText(source, 'matchingGoal(goals, context)', 'existing interest matching');
requireText(source, 'goal.source_kind === context.source_kind', 'source identity matching');
requireText(source, 'MAX_ACTIVE_INTERESTS = 12', 'twelve-interest boundary');
requireText(source, 'MAX_PURSUING = 3', 'three-item Pursuing boundary');
requireText(source, 'Your Interested list already has twelve active items', 'Interested limit guidance');
requireText(source, 'You already have three things Pursuing', 'Pursuing limit guidance');
requireText(source, '☆ Interested', 'clear interested action');
requireText(source, '✓ Interested', 'interested active state');
requireText(source, '◆ Pursuing', 'campaign card pursuing state');
requireText(source, '◆ Pursue', 'direct pursue action');
requireText(source, 'Interested saves this to My Greywake', 'button meaning explained');
requireText(source, 'Preview only — these are player controls.', 'GM preview explains disabled controls');
requireText(source, "source_route: '#/campaign'", 'Campaign source route');
requireText(source, "source_route: '#/my-greywake'", 'My Greywake source route');
requireText(source, 'greywake:engagement-changed', 'cross-view state refresh');
requireText(source, 'window.GreywakeCardPriorities', 'shared priority refresh API');
requireText(source, 'ownsPriorityActions: true', 'priority action ownership is explicit');
requireText(source, 'requestAnimationFrame(() => hydrateControl(wrap, context))', 'hydrate only after control is mounted');
requireText(source, 'if (isPreview()) { renderControl(wrap, context, null, true); return; }', 'GM preview renders immediately without API wait');
requireText(source, 'LOAD_TIMEOUT_MS = 5000', 'bounded interest state check');
requireText(source, 'Interest check timed out. Controls are still available.', 'clean timeout fallback');
requireText(portal, '<strong>Interested</strong> means this matters to your character', 'Campaign explains Interested');
requireText(portal, '<strong>Pursue</strong> means you want it treated as an active choice', 'Campaign explains Pursue');
requireText(portal, 'Neither automatically commits the whole party.', 'My Greywake preserves player choice boundary');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('P5 player choice controls passed.');

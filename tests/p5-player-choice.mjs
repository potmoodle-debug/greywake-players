import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'card-priorities.js'), 'utf8');
const failures = [];
const requireText = (text, label = text) => { if (!source.includes(text)) failures.push(`Missing P5 player-choice behaviour: ${label}`); };

requireText('matchingGoal(goals, context)', 'existing interest matching');
requireText("goal.source_kind === context.source_kind", 'source identity matching');
requireText("['open','pursuing'].includes(existing.status)", 'duplicate prevention for active priorities');
requireText('Your three mind slots are full', 'three-slot boundary');
requireText('✓ On my mind', 'campaign card active state');
requireText('◆ Pursuing', 'campaign card pursuing state');
requireText('◆ Pursue this', 'direct pursue action');
requireText("source_route: '#/campaign'", 'Campaign source route');
requireText("source_route: '#/my-greywake'", 'My Greywake source route');
requireText('greywake:engagement-changed', 'cross-view state refresh');
requireText('window.GreywakeCardPriorities', 'shared priority refresh API');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('P5 player choice controls passed.');

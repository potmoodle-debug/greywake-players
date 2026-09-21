import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'card-priorities.js'), 'utf8');
const goals = readFileSync(join(root, 'player-goals.js'), 'utf8');
const portal = readFileSync(join(root, 'player-portal.js'), 'utf8');
const gm = readFileSync(join(root, 'gm-operations.js'), 'utf8');
const failures = [];
const requireText = (haystack, text, label = text) => { if (!haystack.includes(text)) failures.push(`Missing P5 player-choice behaviour: ${label}`); };
const forbidText = (haystack, text, label = text) => { if (haystack.includes(text)) failures.push(`Retired P5 behaviour returned: ${label}`); };

requireText(source, 'matchingGoal(goals, context)', 'existing interest matching');
requireText(source, 'goal.source_kind === context.source_kind', 'source identity matching');
requireText(source, 'MAX_PURSUING = 1', 'one active pursuit per character');
requireText(source, 'pursuingGoals(goals)', 'current pursuit discovery');
requireText(source, "await patchGoal(other.id, 'open')", 'new pursuit demotes the previous pursuit to Interested');
requireText(source, '☆ Interested', 'clear interested action');
requireText(source, '✓ Interested', 'interested active state');
requireText(source, '◆ Pursuing', 'pursuing state');
requireText(source, '◆ Pursue', 'direct pursue action');
requireText(source, 'Pursue tells the GM you actively want to follow it in play.', 'Pursue meaning explained');
requireText(source, 'limits: { interested: null, pursuing: MAX_PURSUING }', 'Interested has no hard shortlist cap');
requireText(source, 'Preview only — these are player controls.', 'GM preview explains disabled controls');
requireText(source, "source_route: '#/campaign'", 'Campaign source route');
requireText(source, "source_route: '#/my-greywake'", 'My Greywake source route');
requireText(source, 'greywake:engagement-changed', 'cross-view state refresh');

forbidText(source, 'MAX_ACTIVE_INTERESTS', 'hard Interested cap');
forbidText(source, 'three things Pursuing', 'three-pursuit rule');
forbidText(source, 'twelve active items', 'twelve-interest rule');

requireText(goals, 'setSinglePursuit', 'single-pursuit enforcement from Questions & Interests');
requireText(goals, "other.status === 'pursuing'", 'existing pursuit demotion');
requireText(goals, "status: 'dormant'", 'Set Aside state');
requireText(goals, "return 'SET ASIDE'", 'Set Aside label');
requireText(goals, "return 'PLAYED / RESOLVED'", 'Played / Resolved label');
requireText(goals, "one current pursuit", 'player guidance for one pursuit');
forbidText(goals, 'MAX_INTERESTS', 'old three-interest cap');

requireText(portal, 'Pursuing is your one current intention for play.', 'My Greywake explains Pursuing');
requireText(portal, 'Pursuing informs the GM — it does not commit the party.', 'party commitment boundary');
requireText(gm, 'ACTIVE PURSUIT', 'GM sees active pursuit clearly');
requireText(gm, 'Other interests are context, not commitments or votes.', 'GM prep distinguishes pursuit from interests');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('P5 player intention model checks passed.');

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'group-choice.js'), 'utf8');
const index = readFileSync(join(root, 'index.html'), 'utf8');
const failures = [];
const requireText = (text, label = text) => { if (!source.includes(text)) failures.push(`Missing P6 group-choice behaviour: ${label}`); };

requireText('campaign-choice', 'dedicated group-choice API');
requireText('(state.pursuits || [])', 'group options derive from pursuing state returned by API');
requireText('One vote per player', 'single-vote player guidance');
requireText('Vote for this', 'vote action');
requireText('✓ Your vote', 'current vote state');
requireText('Pursued by', 'backer visibility');
requireText('GM preview · voting disabled', 'GM preview is read-only');
requireText('greywake:engagement-changed', 'refresh when pursuits change');
requireText('greywake:portal-live-mounted', 'mount after Campaign portal is ready');
if (!index.includes('group-choice.js?v=group1')) failures.push('Missing group-choice.js load from index.html');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}
console.log('P6 group choice checks passed.');

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(join(root, 'index.html'), 'utf8');
const portal = readFileSync(join(root, 'player-portal.js'), 'utf8');
const css = readFileSync(join(root, 'player-portal.css'), 'utf8');
const failures = [];
const fail = message => failures.push(message);

const wanted = ['home','character','my-greywake','greywake','campaign'];
const positions = wanted.map(section => index.indexOf(`data-primary-section="${section}"`));
if (positions.some(position => position < 0)) fail('Primary navigation must expose Home, Character, My Greywake, Greywake and Campaign.');
if (positions.some((position, index) => index > 0 && position <= positions[index - 1])) fail('Primary navigation must remain ordered Home → Character → My Greywake → Greywake → Campaign.');

for (const route of ['#/my-greywake','#/greywake','#/campaign']) {
  if (!portal.includes(route)) fail(`player-portal.js must own the ${route} route.`);
}
for (const renderer of ['renderMyGreywake','renderGreywake','renderCampaign']) {
  if (!portal.includes(`function ${renderer}`)) fail(`Missing P1 renderer: ${renderer}.`);
}
if (!portal.includes("['my-greywake','mind','inbox']")) fail('Mind and Inbox must remain subordinate to My Greywake.');
if (!portal.includes("['campaign','possibilities']")) fail('Possibilities must remain subordinate to Campaign.');
if (!portal.includes("['greywake','brain','record']")) fail('Records and Player Brain must remain subordinate to Greywake.');
if (!index.includes('id="brainBtn"') || !index.includes('p1-legacy-route')) fail('Legacy Player Brain hook must remain available to app.js without being top-level UI.');
if (!css.includes('.primary-nav') || !css.includes('.player-portal-my-greywake') || !css.includes('.player-portal-campaign')) fail('P1 hierarchy styling is incomplete.');

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}
console.log('P1 navigation hierarchy check passed.');

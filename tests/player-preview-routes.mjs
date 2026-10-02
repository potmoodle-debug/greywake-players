import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../player-access.js', import.meta.url), 'utf8');
const start = source.indexOf('  function playerRouteFromGM(');
const end = source.indexOf('  function reloadAt(', start);
const context = vm.createContext({ location: { hash: '#/' } });
vm.runInContext(source.slice(start, end), context);
const pairs = [
  ['#/gm-players', '#/my-greywake', '#/gm-players'],
  ['#/gm-world', '#/greywake', '#/gm-world'],
  ['#/gm-inbox', '#/inbox', '#/gm-inbox'],
  ['#/gm-prep', '#/', '#/gm-session'],
  ['#/gm-update', '#/', '#/gm-session'],
  ['#/gm-session', '#/', '#/gm-session'],
  ['#/gm-world/record/Stone-Lip%20Hollow', '#/record/Stone-Lip%20Hollow', '#/gm-world/record/Stone-Lip%20Hollow'],
];
for (const [gm, player, returned] of pairs) {
  assert.equal(context.playerRouteFromGM(gm), player, `Preview from ${gm}`);
  assert.equal(context.gmRouteFromPlayer(player), returned, `Return from ${player}`);
}
for (const player of ['#/brain', '#/map', '#/explore']) {
  assert.equal(context.gmRouteFromPlayer(player), '#/gm-world');
}
assert.equal(context.gmRouteFromPlayer('#/campaign'), '#/gm-prep');
assert.equal(context.gmRouteFromPlayer('#/character'), '#/gm-session');
assert.equal(context.playerRouteFromGM('#/gm-unknown'), '#/');
console.log('Player preview and GM return routes passed.');

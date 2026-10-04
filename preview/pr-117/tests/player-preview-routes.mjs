import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../player-access.js', import.meta.url), 'utf8');
const registry = vm.runInNewContext("(" + source.match(/const USERS = (\{[\s\S]*?\n  \});/)[1] + ")");
for (const [, key] of source.matchAll(/data-user="([^"]+)"/g)) {
  assert.ok(registry[key], `Visible login choice ${key} must have an identity`);
}
assert.equal(registry.carla.character, 'Velmira');
assert.equal(registry.carla.role, 'player');
// Exercise Carla's actual gate selection and submit handlers in an isolated DOM.
const node = () => ({ classList: { toggle() {}, remove() {} }, addEventListener(type, fn) { this[type] = fn; }, focus() {}, select() {}, remove() {} });
const buttons = Object.keys(registry).map(key => ({ ...node(), dataset: { user: key } }));
const elements = Object.fromEntries(['playerCodeForm', 'chosenPlayer', 'playerCode', 'codeError'].map(id => [id, node()]));
const shell = { setAttribute() {}, removeAttribute() {} };
const gate = { ...node(), setAttribute() {}, querySelectorAll() { return buttons; }, querySelector() { return buttons[0]; } };
let entered;
const gateContext = vm.createContext({
  USERS: registry,
  document: { querySelector() { return shell; }, createElement() { return gate; }, body: { appendChild() {} }, getElementById(id) { return elements[id]; } },
  setCurrent(key) { entered = key; },
});
vm.runInContext(source.slice(source.indexOf('  function showGate()'), source.indexOf('  function boot()')), gateContext);
gateContext.showGate();
buttons.find(b => b.dataset.user === 'carla').click();
assert.equal(elements.chosenPlayer.textContent, 'Carla · Velmira');
elements.playerCode.value = registry.carla.code;
elements.playerCodeForm.submit({ preventDefault() {} });
assert.equal(entered, 'carla');
const entryContext = vm.createContext({
  STORAGE_KEY: 'test-player', PREVIEW_KEY: 'test-preview', USERS: registry, localStorage: { setItem() {} }, sessionStorage: { removeItem() {}, setItem() {} },
  ownerIsGM: () => true, reloadAt: route => { entered = route; },
});
vm.runInContext('let gmPreviewKey; ' + source.slice(source.indexOf('  function setCurrent('), source.indexOf('  function clearCurrent(')) + source.slice(source.indexOf('  function enterGMPreview('), source.indexOf('  function returnToGM(')), entryContext);
entryContext.setCurrent('carla');
assert.equal(entered, '#/', 'Selecting Carla should open Home');
entered = null;
entryContext.enterGMPreview('carla');
assert.equal(entered, '#/', 'Previewing Carla should open Home');
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

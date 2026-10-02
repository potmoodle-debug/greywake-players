import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const navigation = fs.readFileSync(new URL('../navigation.js', import.meta.url), 'utf8');
const character = fs.readFileSync(new URL('../character-page.js', import.meta.url), 'utf8');
const close = character.slice(character.indexOf('  function closeCharacterPage()'), character.indexOf('  function renderCharacterRoute()'));
function fixture(hash = '#/', returnTo) {
  const frames = [], events = {}, calls = [], entries = [];
  const context = {location: {hash}, document: {querySelector: () => null, getElementById: () => null}, requestAnimationFrame: fn => frames.push(fn)};
  context.window = {addEventListener: (name, fn) => {events[name] = fn;}};
  context.history = {state: returnTo ? {greywakeReturn: returnTo} : null,
    pushState(state, _, route) {this.state = state; context.location.hash = route; entries.push(route);},
    replaceState(state, _, route) {this.state = state; context.location.hash = route;}};
  vm.createContext(context); vm.runInContext(navigation, context);
  const api = context.window.GreywakeNavigation;
  for (const name of ['archive','portal','character','gm']) api.register(name, () => calls.push(name));
  const flush = () => {while (frames.length) frames.shift()();};
  flush(); calls.length = 0;
  return {context, api, calls, entries, events, flush};
}
for (const record of ['#/record/Stone-Lip%20Hollow', '#/my-greywake', '#/campaign', '#/brain']) {
  const f = fixture(record);
  f.api.navigate('#/character'); f.flush();
  assert.equal(f.api.returnRoute(), record);
  assert.deepEqual(f.calls, ['archive','portal','character','gm']);
  vm.runInContext(close, f.context); f.calls.length = 0;
  f.context.closeCharacterPage(); f.flush();
  assert.equal(f.context.location.hash, record);
  assert.deepEqual(f.calls, ['archive','portal','character','gm'], 'Character return must render the archive as well as the sheet and portal');
  f.calls.length = 0; const count = f.entries.length;
  f.api.navigate(record); f.api.render(); f.flush();
  assert.equal(f.entries.length, count, 'Repeated navigation must not add duplicate history');
  assert.equal(f.calls.length, 4, 'Route rendering should be batched');
}
const refreshed = fixture('#/character', '#/record/Stone-Lip%20Hollow');
vm.runInContext(close, refreshed.context); refreshed.context.closeCharacterPage(); refreshed.flush();
assert.equal(refreshed.context.location.hash, '#/record/Stone-Lip%20Hollow', 'Return destination survives reload');
for (const event of ['hashchange','popstate']) {
  refreshed.calls.length = 0; refreshed.events[event](); refreshed.flush();
  assert.deepEqual(refreshed.calls, ['archive','portal','character','gm']);
}
assert(!character.includes('if (isCharacterRoute()) closeCharacterPage();'), 'Character navigation must not toggle closed');
console.log('Navigation lifecycle passed: record return, reload return, history events, batching and repeated destinations.');

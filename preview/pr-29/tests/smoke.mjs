import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataScripts = [
  'data.js',
  'flora-extra.js',
  'harvesting-extra.js',
  'locations-extra.js',
  'shared-knowledge.js',
  'npc-extra.js',
  'reference-extra.js',
  'backstory-public.js',
  'discoveries.js',
  'session03.js',
  'jobs.js',
  'inventory-extra.js',
  'current-state-audit.js',
  'media.js'
];

const window = {};
const context = vm.createContext({ console, window });
const failures = [];
const fail = message => failures.push(message);

for (const file of dataScripts) {
  const path = join(root, file);
  if (!existsSync(path)) {
    fail(`Missing data script: ${file}`);
    continue;
  }
  try {
    vm.runInContext(readFileSync(path, 'utf8'), context, { filename: file });
  } catch (error) {
    fail(`${file} could not load: ${error.message}`);
  }
}

const data = window.GREYWAKE_DATA || {};
const categories = window.GREYWAKE_CATEGORIES || {};
const edges = window.GREYWAKE_EDGES || [];
const discoveries = window.GREYWAKE_DISCOVERIES || [];
const media = window.GREYWAKE_MEDIA || {};

if (data['Known Locations']?.title !== 'Known Regions & Routes') {
  fail('The player-facing location directory must remain titled Known Regions & Routes.');
}
const playerFacingText = Object.values(data).map(entry => `${entry?.title || ''} ${entry?.html || ''}`).join(' ');
if (/\bhex(?:es)?\b/i.test(playerFacingText)) {
  fail('Player-facing records expose GM hex terminology.');
}

for (const [category, names] of Object.entries(categories)) {
  const seen = new Set();
  for (const name of names) {
    if (!data[name]) fail(`Category ${category} points to missing record: ${name}`);
    if (seen.has(name)) fail(`Category ${category} repeats record: ${name}`);
    seen.add(name);
  }
}

const seenEdges = new Set();
for (const [a, b] of edges) {
  if (!data[a]) fail(`Relationship starts at missing record: ${a}`);
  if (!data[b]) fail(`Relationship ends at missing record: ${b}`);
  const key = [a, b].sort().join('|||');
  if (seenEdges.has(key)) fail(`Duplicate relationship: ${a} ↔ ${b}`);
  seenEdges.add(key);
}

for (const discovery of discoveries) {
  if (!data[discovery.note]) fail(`Discovery points to missing record: ${discovery.note}`);
  const source = discovery?.image?.split(/[?#]/, 1)[0];
  if (source && !/^(?:data:|https?:)/.test(source) && !existsSync(join(root, source))) {
    fail(`Discovery references missing image: ${source}`);
  }
}

for (const [record, items] of Object.entries(media)) {
  if (!data[record]) fail(`Media is attached to missing record: ${record}`);
  for (const item of items) {
    const source = item?.src?.split(/[?#]/, 1)[0];
    if (!source || /^(?:data:|https?:)/.test(source)) continue;
    if (!existsSync(join(root, source))) fail(`Missing media file for ${record}: ${source}`);
  }
}

const index = readFileSync(join(root, 'index.html'), 'utf8');
for (const match of index.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
  const path = match[1];
  if (/^(?:data:|https?:|#)/.test(path)) continue;
  if (!existsSync(join(root, path))) fail(`index.html references missing file: ${path}`);
}

for (const file of ['visual-refresh.js', 'discoveries.js', 'session03.js', 'personal-knowledge.js']) {
  const source = readFileSync(join(root, file), 'utf8');
  for (const match of source.matchAll(/['"](assets\/[^'"?#]+)(?:[?#][^'"]*)?['"]/g)) {
    if (!existsSync(join(root, match[1]))) fail(`${file} references missing asset: ${match[1]}`);
  }
}

// P0 stability checks: feature modules are loaded once by index.html and must not be
// dynamically re-injected by visual-polish or compatibility layers.
const scriptSources = [...index.matchAll(/<script\b[^>]*\bsrc="([^"?#]+)(?:[?#][^"]*)?"[^>]*>/g)].map(match => match[1]);
const duplicateScripts = scriptSources.filter((src, index, all) => all.indexOf(src) !== index);
for (const src of [...new Set(duplicateScripts)]) fail(`index.html loads script more than once: ${src}`);

// Presentation shims must not intercept functional controls. The old interaction-polish
// script used capture-phase stopImmediatePropagation around Close buttons and is deleted.
if (index.includes('interaction-polish.js')) {
  fail('index.html must not load the obsolete interaction-polish.js interception shim.');
}
if (existsSync(join(root, 'interaction-polish.js'))) {
  fail('interaction-polish.js must remain deleted after P0 handler consolidation.');
}

// Character navigation has one effective owner. character-page.js may replace an
// earlier compatibility button once, then must keep and reuse the owned button.
const characterPageSource = readFileSync(join(root, 'character-page.js'), 'utf8');
if (!/characterNavOwner/.test(characterPageSource)) {
  fail('character-page.js must explicitly own Character navigation.');
}
if (/function\s+replaceCharacterButton\b/.test(characterPageSource)) {
  fail('character-page.js must not use the old repeated Character-button replacement path.');
}
if (!/dataset\.characterNavOwner\s*=\s*['"]page['"]/.test(characterPageSource)) {
  fail('character-page.js must mark the Character button with its navigation owner.');
}

// GM preview must never write the real Hope / Stress / HP browser keys.
const accessSource = readFileSync(join(root, 'player-access.js'), 'utf8');
for (const character of ['marek', 'velmira', 'odie']) {
  if (!accessSource.includes(`greywake:resources:${character}:v1`)) {
    fail(`player-access.js is missing preview isolation for ${character} resources.`);
  }
}
if (!/gmPreview\s*===\s*['"]true['"]/.test(accessSource) && !/dataset\.gmPreview\s*===\s*['"]true['"]/.test(accessSource)) {
  fail('player-access.js must scope resource storage when GM preview is active.');
}
if (!/:gmtest/.test(accessSource)) {
  fail('GM preview resource storage must use isolated :gmtest keys.');
}

// Marek's selected Beastform is also live character state and must be isolated in GM preview.
const beastformSource = readFileSync(join(root, 'beastform.js'), 'utf8');
if (!/BASE_STORAGE_KEY\s*=\s*['"]greywake:marek:beastform:v1['"]/.test(beastformSource)) {
  fail('beastform.js must keep the canonical Marek Beastform storage key.');
}
if (!/storageKey\s*\(/.test(beastformSource) || !/:gmtest/.test(beastformSource)) {
  fail('beastform.js must isolate Beastform state while GM preview is active.');
}
if (/localStorage\.(?:getItem|setItem)\(STORAGE_KEY/.test(beastformSource)) {
  fail('beastform.js must not bypass preview-aware Beastform storage.');
}

// Rest completion belongs to rest-system-v2.js. The old capture-phase compatibility
// layer must stay deleted so no second script can stop or replace core rest handlers.
if (index.includes('rest-dialog-fix.js')) {
  fail('index.html must not load the obsolete rest-dialog-fix.js compatibility layer.');
}
if (existsSync(join(root, 'rest-dialog-fix.js'))) {
  fail('rest-dialog-fix.js must remain deleted after its guard logic is folded into rest-system-v2.js.');
}
const restSource = readFileSync(join(root, 'rest-system-v2.js'), 'utf8');
if (!/draft\.useWater\s*&&\s*!\(state\.water>0\)/.test(restSource)) {
  fail('rest-system-v2.js must guard against stale Water before applying rest benefits.');
}
if (/stopImmediatePropagation/.test(restSource)) {
  fail('rest-system-v2.js must not depend on capture-phase event cancellation.');
}

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log(`Greywake smoke check passed: ${Object.keys(data).length} records, ${edges.length} relationships, ${discoveries.length} discoveries.`);

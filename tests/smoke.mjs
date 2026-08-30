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

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log(`Greywake smoke check passed: ${Object.keys(data).length} records, ${edges.length} relationships, ${discoveries.length} discoveries.`);

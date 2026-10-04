import fs from 'node:fs';
import assert from 'node:assert/strict';

const client=fs.readFileSync('cross-player-effects.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const edge=fs.readFileSync('supabase/functions/cross-player-effects/index.ts','utf8');

assert.match(index,/cross-player-effects\.js\?v=cross1/,'cross-player-effects.js must load on the live site');
assert.match(client,/mending_touch/,'Mending Touch must use the cross-player bridge');
assert.match(client,/tavas_armor/,'Tava\'s Armor must use the cross-player bridge');
assert.match(client,/regeneration/,'Regeneration must use the cross-player bridge');
assert.match(client,/clarity_of_nature/,'Clarity of Nature must use the cross-player bridge');
assert.match(client,/rest_clear_hp/,'ally Tend to Wounds must update the target sheet');
assert.match(client,/rest_repair_armor/,'ally Repair Armor must update the target sheet');
assert.match(client,/rest_prepare/,'Prepare Together must update participating sheets');
assert.match(client,/undo_effect_id/,'cross-player effects must expose a safe undo path');
assert.match(client,/dispatchEvent\(new Event\('focus'\)\)/,'cross-player resource changes must trigger the existing owner sync instead of writing another sheet directly');
assert.match(client,/data-cross-prepare-target/,'rest UI must name the other PCs instead of saying only ally');
assert.match(client,/crossMessageId/,'target sheets must notice newly synced cross-player events');
assert.match(client,/tavaArmor:null/,'rest completion must clear Tava\'s Armor');

assert.match(edge,/system_cross_player_state/,'backend must keep cross-effect state separate from normal resource ownership');
assert.match(edge,/status:\s*["']dormant["']/,'hidden cross-player state must not consume an active player-interest slot');
assert.match(edge,/Only Velmira can use Mending Touch/,'backend must restrict Mending Touch to Velmira');
assert.match(edge,/Only Velmira can use Tava's Armor/,'backend must restrict Tava\'s Armor to Velmira');
assert.match(edge,/Only Marek can use Regeneration/,'backend must restrict Regeneration to Marek');
assert.match(edge,/Only Marek can use Clarity of Nature/,'backend must restrict Clarity of Nature to Marek');
assert.match(edge,/spend_hope/,'ability Hope costs must be part of the server-side cross-player transaction');
assert.match(edge,/Cannot safely undo/,'backend must reject unsafe undo after later state changes');
assert.match(edge,/Choose another PC for a cross-player rest effect/,'cross-player rest endpoint must not be usable as a second self-healing path');
assert.doesNotMatch(client,/localStorage\.setItem\([^\n]*greywake:resources:/,'client must not write another PC resource store directly');

console.log('Cross-player effects checks passed.');

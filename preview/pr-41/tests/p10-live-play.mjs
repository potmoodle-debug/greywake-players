import fs from 'node:fs';
const live=fs.readFileSync('p10-live-play-usability.js','utf8');
const guard=fs.readFileSync('p10-live-board-guard.js','utf8');
const boot=fs.readFileSync('p9-inventory-consolidation.js','utf8');
const index=fs.readFileSync('index.html','utf8');
for(const marker of ['MAX_WATER=9','live-resource-water','live-resource-armor','data-p10-take-damage','openDamage','p10-sticky','p10-can-do-field','What can I do?','data-p10-action-title','openActionUse','p10-action-use-dialog','p10-action-chip','p10-traits-duplicate','#damageHealthPanel,#readyGearPanel,#restPanel','GreywakeLivePlayUsability']){
  if(!live.includes(marker))throw new Error(`Missing P10 live-play marker: ${marker}`);
}
for(const marker of ['#4d9bc7','#8bd4fa','setArmorMarked','click a shield','clip-path:polygon','data-p10-backpack','data-p10-beastform','GreywakeBackpack','changeBeastform','p10-backpack-button','p10-beastform-button']){
  if(!live.includes(marker))throw new Error(`Missing P10 Water/Armor/field-control marker: ${marker}`);
}
for(const marker of ['appendChild(detail)','closeActionUse','action-roller']){
  if(!live.includes(marker))throw new Error(`P10 must use the real live action detail, not a cloned roller: ${marker}`);
}
for(const marker of ['MutationObserver','needsRepair','live-resource-water','live-resource-armor','p10-field-actions','GreywakeLivePlayUsability?.refresh']){
  if(!guard.includes(marker))throw new Error(`Missing P10 live-board redraw guard marker: ${marker}`);
}
if(/source\.outerHTML/.test(live)||/cloneButtons/.test(live))throw new Error('P10 must not clone action detail/roller controls.');
if(/data-p10-armor-delta/.test(live))throw new Error('Armor Slots should be controlled by shield pips only; no plus/minus controls.');
for(const marker of ["'Nature’s Tongue':['1 Hope'","'Wall Walk':['1 Hope'","'Regeneration':['3 Hope'","'Beastform':['1 Stress'"]){
  if(!live.includes(marker))throw new Error(`Missing P10 action metadata: ${marker}`);
}
if(boot.includes('p10-live-play-usability.js')||boot.includes('p10-live-fixes.js'))throw new Error('P10 must not be bootstrapped through the shared inventory loader.');
if(!index.includes('p9-inventory-consolidation.js?v=p9inventory1'))throw new Error('Shared inventory loader must retain the normal-site cache key.');
if(!index.includes('p10-live-play-usability.js?v=p10live7'))throw new Error('P10 must be loaded directly with its own cache key.');
if(!index.includes('p10-live-board-guard.js?v=p10guard1'))throw new Error('P10 live board guard must load after the usability layer.');
if(/beastform\.js/.test(live)||/beastform\.js/.test(guard))throw new Error('P10 must not replace or load Beastform owner.');
console.log('P10 isolated live-play controls, real action bridge and board redraw guard checks passed');

import fs from 'node:fs';
const live=fs.readFileSync('p10-live-play-usability.js','utf8');
const boot=fs.readFileSync('p9-inventory-consolidation.js','utf8');
for(const marker of ['MAX_WATER=9','live-resource-water','live-resource-armor','data-p10-take-damage','openDamage','p10-sticky','p10-can-do-field','What can I do?','data-p10-action-title','openActionUse','p10-action-use-dialog','p10-action-chip','p10-traits-duplicate','#damageHealthPanel,#readyGearPanel,#restPanel','GreywakeLivePlayUsability']){
  if(!live.includes(marker))throw new Error(`Missing P10 live-play marker: ${marker}`);
}
for(const marker of ['#4d9bc7','#8bd4fa','setArmorMarked','click a shield','p10-can-do-field{border:1px solid #648453']){
  if(!live.includes(marker))throw new Error(`Missing P10 Water/Armor/action presentation marker: ${marker}`);
}
if(/data-p10-armor-delta/.test(live))throw new Error('Armor Slots should be controlled by pips only; no plus/minus controls.');
for(const marker of ["'Nature’s Tongue':['1 Hope'","'Wall Walk':['1 Hope'","'Regeneration':['3 Hope'","'Beastform':['1 Stress'"]){
  if(!live.includes(marker))throw new Error(`Missing P10 action metadata: ${marker}`);
}
if(!boot.includes("p10-live-play-usability.js?v=p10live5"))throw new Error('P10 live-play script is not bootstrapped with the current cache key.');
if(/beastform\.js/.test(live))throw new Error('P10 must not replace or load Beastform owner.');
console.log('P10 streamlined live-play controls checks passed');

import fs from 'node:fs';
const live=fs.readFileSync('p10-live-play-usability.js','utf8');
const boot=fs.readFileSync('p9-inventory-consolidation.js','utf8');
for(const marker of ['MAX_WATER=9','live-resource-water','live-resource-armor','data-p10-take-damage','openDamage','p10-sticky','data-p10-can-do','What can I do?','data-p10-action-title','target.click()','p10-action-chip','p10-traits-duplicate','#damageHealthPanel,#readyGearPanel','restPanel .rest-water','GreywakeLivePlayUsability']){
  if(!live.includes(marker))throw new Error(`Missing P10 live-play marker: ${marker}`);
}
for(const marker of ['#4d9bc7','#8bd4fa','setArmorMarked','Armor Slots']){
  if(!live.includes(marker))throw new Error(`Missing P10 Water/Armor presentation marker: ${marker}`);
}
for(const marker of ["'Nature’s Tongue':['1 Hope'","'Wall Walk':['1 Hope'","'Regeneration':['3 Hope'","'Beastform':['1 Stress'"]){
  if(!live.includes(marker))throw new Error(`Missing P10 action metadata: ${marker}`);
}
if(!boot.includes("p10-live-play-usability.js?v=p10live1"))throw new Error('P10 live-play script is not bootstrapped.');
if(/beastform\.js/.test(live))throw new Error('P10 must not replace or load Beastform owner.');
console.log('P10 consolidated live-play surface checks passed');

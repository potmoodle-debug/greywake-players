import fs from 'node:fs';

const live=fs.readFileSync('p11-companion-live-play.js','utf8');
const css=fs.readFileSync('p11-companion-live-play.css','utf8');
const companion=fs.readFileSync('companion-play.js','utf8');
const rest=fs.readFileSync('rest-system-v2.js','utf8');
const layout=fs.readFileSync('character-layout-order.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const nomadic=fs.readFileSync('p9-nomadic-pack.js','utf8');
const consolidation=fs.readFileSync('p9-inventory-consolidation.js','utf8');

for(const marker of ['velmira','odie','MAX_WATER=9','live-resource-water','live-resource-armor','data-p11-short-rest','data-p11-long-rest','data-p11-take-damage','data-p11-can-do','data-p11-backpack','GreywakeBackpack','openCanDo','setArmorMarked','EVASION']){
  if(!live.includes(marker))throw new Error(`Missing P11 live-play marker: ${marker}`);
}

if(live.includes('MutationObserver'))throw new Error('P11 must not use a MutationObserver repair loop.');
const resourceListener=live.match(/window\.addEventListener\('greywake:companion-resources-changed',[^\n]+/g)||[];
if(resourceListener.length!==1||!resourceListener[0].includes('ensureEvasionReadout()')||/setup\(|schedule\(|ensureWaterRow\(|ensureArmorRow\(|positionQuickRolls\(/.test(resourceListener[0])){
  throw new Error('Companion resource changes may update Evasion only; they must not trigger layout or board reconstruction.');
}
if(layout.includes("window.addEventListener('greywake:companion-resources-changed'"))throw new Error('Character layout must not normalize on companion resource changes.');
if(/visibility\s*:\s*hidden/.test(css))throw new Error('P11 must never hide the base character sheet while enhancements initialise.');

for(const marker of ['width:22px!important','height:22px!important','p11-rest-utility button','background:linear-gradient(180deg,#242d32,#171d21)','position:fixed']){
  if(!css.includes(marker))throw new Error(`Missing P11 stable presentation marker: ${marker}`);
}

for(const marker of ["effect:'rogueDodge'","cost:{resource:'hope',amount:3}","13+(state.effects.rogueDodge?2:0)","Sneak Attack","data-sneak"]){
  if(!companion.includes(marker))throw new Error(`Missing Odie mechanic marker: ${marker}`);
}
if(!rest.includes("setEffect?.('rogueDodge',false,'Rest ends Rogue’s Dodge')"))throw new Error('Odie Rogue’s Dodge must end on rest.');

for(const marker of ['Adept · mark Stress, double Experience','Strange Patterns','data-pattern-number','data-exp-payment','Mending Touch','Not This Time','Nomadic Pack']){
  if(!companion.includes(marker))throw new Error(`Missing Velmira mechanic marker: ${marker}`);
}
for(const marker of ["${PREFIX}velmira${preview()?':gmtest':''}",'Once per session','spendHope','addCustomItem','Reset for new session','data-use-nomadic-backpack','Use Nomadic Pack']){
  if(!nomadic.includes(marker))throw new Error(`Missing Velmira Nomadic Pack marker: ${marker}`);
}
if(nomadic.includes('if(!isVelmira()||preview())return'))throw new Error('Nomadic Pack must be locally testable in GM preview using its :gmtest state.');
if(!consolidation.includes('p9-nomadic-pack.js?v=nomadic4'))throw new Error('Nomadic Pack Backpack-use fix requires the current cache key.');

if(!index.includes('character-layout-order.js?v=order7'))throw new Error('P11 requires the current stable layout cache key.');
if(!index.includes('p11-companion-live-play.js?v=p11companion5'))throw new Error('P11 requires the current stable live-play JS cache key.');
if(!index.includes('p11-companion-live-play.css?v=p11companion4'))throw new Error('P11 requires the current stable CSS cache key.');

console.log('P11 Velmira/Odie parity, character mechanics, and no-glitch regression checks passed');

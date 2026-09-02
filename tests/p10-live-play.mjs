import fs from 'node:fs';
const live=fs.readFileSync('p10-live-play-usability.js','utf8');
const guard=fs.readFileSync('p10-live-board-guard.js','utf8');
const companion=fs.readFileSync('companion-play.js','utf8');
const layout=fs.readFileSync('character-layout-order.js','utf8');
const velmira=fs.readFileSync('velmira-play-view.js','utf8');
const velmiraCss=fs.readFileSync('velmira-play-view.css','utf8');
const boot=fs.readFileSync('p9-inventory-consolidation.js','utf8');
const index=fs.readFileSync('index.html','utf8');

for(const marker of ['MAX_WATER=9','live-resource-water','live-resource-armor','data-p10-take-damage','openDamage','p10-sticky','p10-can-do-field','What can I do?','data-p10-action-title','openActionUse','p10-action-use-dialog','p10-action-chip','p10-traits-duplicate','#damageHealthPanel,#readyGearPanel,#restPanel','GreywakeLivePlayUsability']){
  if(!live.includes(marker))throw new Error(`Missing P10 Marek live-play marker: ${marker}`);
}
for(const marker of ['#4d9bc7','#8bd4fa','setArmorMarked','click a shield','clip-path:polygon','data-p10-backpack','data-p10-beastform','GreywakeBackpack','changeBeastform','p10-backpack-button','p10-beastform-button']){
  if(!live.includes(marker))throw new Error(`Missing P10 Marek Water/Armor/field-control marker: ${marker}`);
}
for(const marker of ['appendChild(detail)','closeActionUse','action-roller']){
  if(!live.includes(marker))throw new Error(`P10 Marek must use the real live action detail, not a cloned roller: ${marker}`);
}
if(/source\.outerHTML/.test(live)||/cloneButtons/.test(live))throw new Error('P10 must not clone action detail/roller controls.');
if(/data-p10-armor-delta/.test(live))throw new Error('Armor Slots should be controlled by shield pips only; no plus/minus controls.');
for(const marker of ["'Nature’s Tongue':['1 Hope'","'Wall Walk':['1 Hope'","'Regeneration':['3 Hope'","'Beastform':['1 Stress'"]){
  if(!live.includes(marker))throw new Error(`Missing P10 Marek action metadata: ${marker}`);
}

for(const marker of [
  "SUPPORTED=['marek','velmira','odie']",
  "NAMES={marek:'Marek',velmira:'Velmira',odie:'Odie'}",
  'GreywakeCompanion','greywake:companion-resources-changed','companionActionsPanel',
  'ensureCompanionRows','ensureCompanionFieldActions','enhanceCompanionActions',
  'openCompanionCanDo','openCompanionAction','data-p10-actions','data-p10-can-do',
  'live-resource-water','live-resource-armor','setArmorMarked','setWater',
  'ensureSticky','p10StickyVitals','ensureRestButtons','p10-rest-utility',
  'data-p10-short-rest','data-p10-long-rest','GreywakeBackpack','openDamage',
  'MutationObserver','needsRepair','observedRoot','GreywakeLivePlayParity',
  'data-p10-backpack','data-p10-beastform'
]){
  if(!guard.includes(marker))throw new Error(`Missing all-PC live-play parity marker: ${marker}`);
}

for(const marker of [
  "'Tava’s Armor':['hope',1]","'Mending Touch':['hope',2]","'Not This Time':['hope',3]","'Nomadic Pack':['hope',1]","Startling:['stress',1]",
  "'Rain of Blades':['hope',1]","'Shadow Stepper':['stress',1]","'Rogue’s Dodge':['hope',3]"
]){
  if(!guard.includes(marker))throw new Error(`Missing companion live-resource cost marker: ${marker}`);
}

for(const marker of [
  "odie: {","velmira: {",'performRoll(root,a,false)','Adept Experience use','Adaptability reroll','Strange Patterns','Rogue’s Dodge active','Sneak Attack +1d6'
]){
  if(!companion.includes(marker))throw new Error(`Companion-specific mechanics must remain in the character engine: ${marker}`);
}

// Visual/structural parity: Marek is the canonical layout, not a separate sheet.
for(const marker of [
  "VALID=['marek','velmira','odie']",'normalizeHero(identity,key)',
  "desired=['Level','Evasion','Armor','HP','Stress','Hope']",'character-proficiency',
  'stats -> trait roller -> live resources -> note',
  "const beast=key==='marek'?document.getElementById('beastformControl'):null",
  "document.getElementById(key==='marek'?'activeActionsPanel':'companionActionsPanel')",
  'Greywake is the live play sheet for rolls, Hope, Stress, Hit Points, Armor, Water, abilities and equipment.'
]){
  if(!layout.includes(marker))throw new Error(`Missing Marek-style shared character layout marker: ${marker}`);
}
if(layout.includes("if(key==='marek'&&traits&&resources)"))throw new Error('Trait roller placement must not special-case Marek anymore.');

for(const forbidden of [
  'function makeTabs(',
  "button.className = 'velmira-play-launch'",
  "root.classList.add('velmira-play-view')",
  "document.body.classList.add('velmira-play-open')"
]){
  if(velmira.includes(forbidden))throw new Error(`Retired Velmira-only layout creation returned: ${forbidden}`);
}
if(!velmira.includes('compatibility shim')||!velmira.includes('GreywakeCharacterLayout'))throw new Error('Velmira compatibility file must only clean up old artifacts and defer to the shared character layout.');
if(/\.velmira-play-tab\s*\{|\.velmira-play-panel\s*\{|velmira-sidebar-collapsed/.test(velmiraCss))throw new Error('Velmira-only visual skin must remain retired.');

if(guard.includes('localStorage.setItem')||guard.includes('greywake:resources:odie')||guard.includes('greywake:resources:velmira')){
  throw new Error('Parity guard must not become a second owner of character resource state.');
}
if(/beastform\.js/.test(live)||/beastform\.js/.test(guard))throw new Error('P10 must not replace or load Beastform owner.');
if(boot.includes('p10-live-play-usability.js')||boot.includes('p10-live-fixes.js'))throw new Error('P10 must not be bootstrapped through the shared inventory loader.');
if(!index.includes('p9-inventory-consolidation.js?v=p9inventory1'))throw new Error('Shared inventory loader must retain the normal-site cache key.');
if(!index.includes('velmira-play-view.css?v=velmira3')||!index.includes('velmira-play-view.js?v=velmira3'))throw new Error('Retired Velmira-only skin/shim cache keys must be bumped.');
if(!index.includes('character-layout-order.js?v=order6'))throw new Error('Shared character layout must load with the new cache key.');
if(!index.includes('p10-live-play-usability.js?v=p10live7'))throw new Error('P10 must be loaded directly with its own cache key.');
if(!index.includes('p10-live-board-guard.js?v=p10guard3'))throw new Error('All-PC live board guard must load after the usability layer with the new cache key.');

console.log('P10 live-play and Marek-style sheet parity checks passed for Marek, Velmira and Odie');

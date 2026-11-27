/* Validate the actual published data; no campaign-specific names or session numbers. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const check = (condition,message) => { if(!condition) throw new Error(message); };
const sameSet = (a,b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());
const normalize = text => String(text||'').toLowerCase().replace(/\bthe\b/g,'').replace(/[^a-z0-9]+/g,' ').trim();
function validate(w) {
  const g=w.GREYWAKE_GM_STATE, h=w.GREYWAKE_HOME_STATE, d=w.GREYWAKE_DATA,c=w.GREYWAKE_CATEGORIES;
  check(g&&h&&d&&c,'Campaign state or indexes unavailable');
  const r=g.release;
  check(r&&Number.isInteger(r.completedSession)&&r.completedSession>=0&&r.nextSession===r.completedSession+1,'Invalid completed/next session metadata');
  check(Number.isInteger(r.fear)&&r.fear>=0&&r.fear<=12,'Invalid Fear value');
  check(new RegExp('Fear\\s+'+r.fear+'(?:\\D|$)','i').test(g.session),'GM heading Fear disagrees with release metadata');
  const recap=d[r.recapRecord];
  check(recap?.category==='Sessions'&&c.Sessions?.includes(r.recapRecord),'Completed recap missing from session archive');
  const numbered=c.Sessions.map(key=>({key,number:Number((d[key]?.title||'').match(/\bSession\s+(\d+)\b/i)?.[1])})).filter(s=>Number.isInteger(s.number));
  check(numbered.some(s=>s.key===r.recapRecord&&s.number===r.completedSession),'Completed recap number does not match metadata');
  check(!numbered.some(s=>s.number>r.completedSession),'A newer recap exists than the declared completed session');
  check(!/\bin progress\b/i.test(recap.title),'Completed recap still labelled in progress');
  const party=g.activeParty;
  check(Array.isArray(party)&&party.length>0&&new Set(party).size===party.length,'Active party missing or duplicated');
  check(Array.isArray(g.backgroundParty)&&!g.backgroundParty.some(n=>party.includes(n)),'Active/background party overlap');
  check(sameSet(party,c['Player Characters']||[]),'Player Character index differs from active party');
  const positions=g.prep?.startingPositions||[];
  check(sameSet(party,positions.filter(p=>p.status==='ACTIVE PC').map(p=>p.name)),'GM Prep starting positions differ from active party');
  for(const name of party){
    const key=name.toLowerCase(), state=h[key], position=positions.find(p=>p.name===name);
    check(d[name]?.category==='Player Characters'&&!(c.People||[]).includes(name),'Active character has incorrect record classification: '+name);
    check(state?.location&&position?.location,'Missing player/GM starting location: '+name);
    check(normalize(position.location).includes(normalize(state.location)),'Player/GM starting locations differ: '+name);
    check(state.chapterRoute==='#/record/'+encodeURIComponent(r.recapRecord),'Player recap link is stale: '+name);
    if(state.currentThreadId)check(w.GreywakeCurrentThreads?.getVisible(state.currentThreadId,{role:'player',character:name}),'Home thread is missing or not visible: '+name);
  }
  check(g.sceneTitle&&g.sceneDetail&&g.partyLocation,'GM opening state missing');
}
function loadCurrent(){
  const page=read('index.html');
  const scripts=[...page.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map(m=>m[1]);
  const names=scripts.map(s=>s.split('?')[0]);
  const stateIndex=names.indexOf('current-state-audit.js');
  check(stateIndex>=0&&stateIndex<names.indexOf('gm-operations.js'),'State script load order invalid');
  check(scripts[stateIndex].includes('?v=')&&scripts[stateIndex].split('?v=')[1],'State script cache version missing');
  const recapScripts=names.filter(n=>/^session\d+\.js$/.test(n));
  check(recapScripts.every(n=>names.indexOf(n)<stateIndex),'Recap loaded after campaign state');
  const window={addEventListener(){}}, document={body:{dataset:{}},addEventListener(){}};
  const ctx=vm.createContext({window,document});
  for(const file of ['data.js',...recapScripts,'current-state-audit.js','knowledge-publication.js','current-threads.js'])vm.runInContext(read(file),ctx,{filename:file});
  return window;
}
function testFuture(){
  const name='Example PC', recap='Session 42 — Player Recap';
  const w={GREYWAKE_GM_STATE:{release:{completedSession:42,nextSession:43,recapRecord:recap,fear:3},session:'Session 43 next · Fear 3',activeParty:[name],backgroundParty:[],partyLocation:'Example region',sceneTitle:'Opening',sceneDetail:'Open choice',prep:{startingPositions:[{name,location:'Example region',status:'ACTIVE PC'}]}},GREYWAKE_HOME_STATE:{[name.toLowerCase()]:{location:'Example region',chapterRoute:'#/record/'+encodeURIComponent(recap)}},GREYWAKE_DATA:{[name]:{category:'Player Characters'},[recap]:{category:'Sessions',title:'Session 42 — Example'}},GREYWAKE_CATEGORIES:{Sessions:[recap],'Player Characters':[name],People:[]}};
  validate(w);
  w.GREYWAKE_HOME_STATE[name.toLowerCase()].location='Wrong region';
  assert.throws(()=>validate(w),/starting locations differ/);
}
try {testFuture();validate(loadCurrent());console.log('PASS: campaign release state and future-session regression checks.');}
catch(error){console.error('FAIL: '+error.message);process.exitCode=1;}

'use strict';
const {project,publicExport,search,relationships,legacyPlayerProjection}=require('../src/knowledge-projection.cjs');
const assert=(x,msg)=>{if(!x)throw Error(msg)};
const eq=(a,b,msg)=>assert(JSON.stringify(a)===JSON.stringify(b),msg);
const throws=(f,msg)=>{let failed=false;try{f()}catch{failed=true}assert(failed,msg)};
const claim=(id,over={})=>({id,revision:1,subjectId:'subject-a',subjectTitle:'Example creature',body:id,scope:'recipients',status:'approved',certainty:'established',tier:3,sourceRef:'PRIVATE SOURCE',...over});
const grant=(claimId,characterId,over={})=>({claimId,revision:1,characterId,acquisition:'witnessed',disclosure:'personal',tier:3,evidenceRef:'PRIVATE EVIDENCE',status:'approved',...over});
const player=characterId=>({verified:true,role:'player',characterId});
const gm={verified:true,role:'gm'};
const ids=records=>records.flatMap(r=>r.claims.map(c=>c.id)).sort();
const claims=[
 claim('common',{scope:'public',tier:1}),
 claim('firsthand'),claim('selective'),claim('unrevealed',{scope:'gm',tier:5,subjectId:'secret',subjectTitle:'Hidden subject'}),
 claim('draft',{status:'draft'}),claim('withdrawn',{status:'withdrawn'}),claim('missing-recipient'),
 claim('rumour',{certainty:'rumour'}),claim('location',{subjectId:'location-a',subjectTitle:'Approximate route',scope:'public',tier:1}),
 claim('survey',{subjectId:'survey',subjectTitle:'Hidden survey',scope:'gm',tier:5}),
 claim('correction',{body:'Old statement'}),claim('correction',{revision:2,body:'Corrected statement',certainty:'reported'})
];
const grants=[
 grant('firsthand','pc-a'),grant('selective','pc-a',{disclosure:'selective'}),grant('selective','pc-b',{acquisition:'reported',disclosure:'selective',tier:2}),
 grant('draft','pc-a'),grant('withdrawn','pc-a'),grant('rumour','pc-b',{acquisition:'rumour',tier:1}),
 grant('correction','pc-a'),grant('correction','pc-b',{revision:2,acquisition:'reported',tier:2})
];
let passed=0;const test=(name,f)=>{f();passed++;console.log('PASS '+name)};
test('public export contains only approved common claims',()=>eq(ids(publicExport(claims,grants)),['common','location'],'public leakage'));
test('firsthand perspective',()=>eq(ids(project(claims,grants,player('pc-a'))),['common','firsthand','location','selective'],'firsthand projection'));
test('selective sharing preserves acquisition and tier',()=>{const r=project(claims,grants,player('pc-b'));eq(ids(r),['common','correction','location','rumour','selective'],'shared projection');const c=r.flatMap(x=>x.claims).find(x=>x.id==='selective');eq([c.acquisition,c.tier],['reported',2],'recipient provenance')});
test('third character has no private or hidden knowledge',()=>eq(ids(project(claims,grants,player('pc-c'))),['common','location'],'third character leakage'));
test('unknown future character does not inherit party shares',()=>eq(ids(project(claims,grants,player('future-pc-50'))),['common','location'],'new character leakage'));
test('unverified claimed role is not authority',()=>eq(ids(project(claims,grants,{role:'gm',characterId:'pc-a'})),['common','location'],'unverified identity'));
test('GM has approved truths but not superseded or draft text',()=>{const r=project(claims,grants,gm);assert(ids(r).includes('unrevealed')&&ids(r).includes('survey')&&!ids(r).includes('draft')&&!ids(r).includes('withdrawn'),'GM visibility');assert(!JSON.stringify(r).includes('Old statement'),'stale correction')});
test('missing grant fails closed and source metadata never leaves projection',()=>{const s=JSON.stringify(project(claims,grants,player('pc-a')));assert(!s.includes('missing-recipient')&&!s.includes('PRIVATE SOURCE')&&!s.includes('PRIVATE EVIDENCE')&&!s.includes('Hidden subject'),'private payload')});
test('search only finds visible claims',()=>eq(search(project(claims,grants,player('pc-c')),'firsthand'),[],'search leakage'));
test('relationships do not expose hidden endpoints',()=>eq(relationships(project(claims,grants,player('pc-c')),[{from:'subject-a',to:'location-a'},{from:'subject-a',to:'secret'}]),[{from:'subject-a',to:'location-a'}],'graph leakage'));
test('correction invalidates stale grants',()=>{assert(!ids(project(claims,grants,player('pc-a'))).includes('correction'),'stale recipient approval');assert(JSON.stringify(project(claims,grants,player('pc-b'))).includes('Corrected statement'),'corrected grant')});
test('revoked grants do not confer access',()=>{const g=grants.map(x=>x.claimId==='firsthand'?{...x,status:'revoked'}:x);assert(!ids(project(claims,g,player('pc-a'))).includes('firsthand'),'revoked access')});
test('new sharing event grants only the chosen recipient',()=>{const g=[...grants,grant('firsthand','future-pc-50',{acquisition:'reported',tier:2})];assert(ids(project(claims,g,player('future-pc-50'))).includes('firsthand'),'new grant absent');assert(!ids(project(claims,g,player('pc-c'))).includes('firsthand'),'unintended recipient')});
test('GM-only truth cannot be granted to player scope',()=>throws(()=>publicExport([...claims,claim('bad',{tier:5,scope:'public'})],grants),'tier 5 leaked'));
test('missing classification or duplicate grant fails closed',()=>{throws(()=>project([...claims,claim('bad',{scope:undefined})],grants,gm),'bad scope');throws(()=>project(claims,[...grants,grants[0]],gm),'duplicate grant')});
test('private maps and survey are never included in public output',()=>assert(!JSON.stringify(publicExport(claims,grants)).includes('Hidden survey'),'map leaked'));
test('party-at-time-of-sharing never leaks to later roster',()=>{const g=[...grants,grant('missing-recipient','pc-a',{disclosure:'party'}),grant('missing-recipient','pc-b',{disclosure:'party',acquisition:'reported'})];const r=project(claims,g,player('pc-a')).flatMap(r=>r.claims).find(c=>c.id==='missing-recipient');assert(r.visibility==='party'&&!ids(project(claims,g,player('future-pc-50'))).includes('missing-recipient'),'party snapshot')});
test('recipient wording may distinguish testimony from observation',()=>{const g=grants.map(x=>x.claimId==='selective'&&x.characterId==='pc-b'?{...x,playerBody:'A witness told you this.'}:x);const c=project(claims,g,player('pc-b')).flatMap(r=>r.claims).find(c=>c.id==='selective');eq([c.body,c.visibility],['A witness told you this.','selective'],'recipient wording')});
test('legacy login selects a perspective but cannot project GM truth',()=>{eq(ids(legacyPlayerProjection(claims,grants,'pc-a')),ids(project(claims,grants,player('pc-a'))),'legacy selection');assert(!ids(legacyPlayerProjection(claims,grants,'gm')).includes('unrevealed'),'GM leak')});
test('missing disclosure fails closed',()=>throws(()=>project(claims,grants.map((g,i)=>i?g:{...g,disclosure:undefined}),player('pc-a')),'missing disclosure'));
console.log(passed+' synthetic knowledge projection tests passed');

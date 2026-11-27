const {create}=require('../knowledge-rehearsal-provider.js');
const {create:makeView}=require('../knowledge-view.js');
const assert=(v,m)=>{if(!v)throw Error(m)};
const claim={id:'example-claim',revision:1,body:'Test observation',tier:2,acquisition:'witnessed',certainty:'established',visibility:'personal'};
const record={recordKey:'Example record',id:'example-subject',title:'Example subject',claims:[claim]};
const pack={format:'greywake-knowledge-rehearsal-v1',managedRecordKeys:['Example record'],perspectives:[{characterId:'pc-a',records:[record]},{characterId:'pc-b',records:[]}]};
(async()=>{
 const provider=create(pack),view=makeView();view.configure(provider);
 await view.select('pc-a');assert(view.allowed('Example record'),'first perspective absent');
 await view.select('pc-b');assert(!view.allowed('Example record'),'second perspective leaked');
 await view.select('future-pc');assert(!view.allowed('Example record'),'future perspective leaked');
 const response=await provider.load('pc-a');response.records[0].claims[0].body='Changed';assert((await provider.load('pc-a')).records[0].claims[0].body==='Test observation','provider mutated');
 let rejected=false;try{create({...pack,perspectives:[{characterId:'pc-a',records:[{...record,claims:[{...claim,visibility:'gm',tier:5}]}]}]})}catch{rejected=true}assert(rejected,'GM truth accepted');
 console.log('5 offline provider integration checks passed');
})().catch(e=>{console.error(e);process.exitCode=1});

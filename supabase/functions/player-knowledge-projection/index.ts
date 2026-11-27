// Read-only trusted-group perspective endpoint. Existing character-code
// convention is intentionally retained; it is not strong authentication.
// Only explicitly staged player-safe claims are read; no GM tables or raw rows.
const SECTION='Player knowledge projection v1';
const CORS={'Access-Control-Allow-Origin':'https://potmoodle-debug.github.io','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'apikey, authorization, content-type, x-greywake-character, x-greywake-code','Cache-Control':'no-store','Vary':'Origin','Content-Type':'application/json'};
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:CORS});
const isText=v=>typeof v==='string'&&v.trim().length>0;
const kinds=new Set(['common','party','personal','selective']);
const sources=new Set(['common','witnessed','investigated','practical','reported','rumour','inferred','insider','unknown']);
const certainties=new Set(['established','reported','rumour','inferred','belief','unknown']);
function projectRows(rows,character){
 const latest=new Map();
 for(const row of rows){
  if(row.section!==SECTION||!['private','party'].includes(row.visibility))throw Error('Unexpected projection source');
  const c=JSON.parse(row.body);
  if(c.format!=='greywake-player-claim-v1'||!isText(c.id)||!Number.isSafeInteger(c.revision)||c.revision<1||
     !isText(c.recordKey)||!isText(c.title)||!isText(c.subjectId)||!isText(c.body)||!kinds.has(c.visibility)||!sources.has(c.acquisition)||
     !certainties.has(c.certainty)||!Number.isInteger(c.tier)||c.tier<1||c.tier>4||!Array.isArray(c.recaps)||
     !Array.isArray(row.knowledge_entry_characters))throw Error('Malformed staged claim');
  const common=c.visibility==='common';
  if(common?(row.visibility!=='party'||c.tier!==1||c.acquisition!=='common'||row.knowledge_entry_characters.length!==0):(row.visibility!=='private'||c.acquisition==='common'||row.knowledge_entry_characters.length===0))throw Error('Invalid staged scope');
  const prior=latest.get(c.id);
  if(prior&&prior.c.revision===c.revision)throw Error('Ambiguous revision');
  if(prior&&(prior.c.recordKey!==c.recordKey||prior.c.subjectId!==c.subjectId))throw Error('Changed subject');
  if(!prior||prior.c.revision<c.revision)latest.set(c.id,{row,c});
 }
 const records=new Map();
 function add(meta,claim){
  if(!isText(meta.recordKey)||!isText(meta.id)||!isText(meta.title))throw Error('Invalid subject metadata');
  const r=records.get(meta.recordKey)||{recordKey:meta.recordKey,id:meta.id,title:meta.title,claims:[]};
  if(r.id!==meta.id||r.title!==meta.title)throw Error('Conflicting record metadata');
  if(!r.claims.some(x=>x.id===claim.id))r.claims.push(claim);
  records.set(meta.recordKey,r);
 }
 for(const {row,c} of latest.values()){
  if(row.status!=='active')continue;
  if(c.visibility!=='common'&&!row.knowledge_entry_characters.some(g=>g.character_slug===character))continue;
  const claim={id:c.id,revision:c.revision,body:c.body,visibility:c.visibility,acquisition:c.acquisition,certainty:c.certainty,tier:c.tier};
  add({recordKey:c.recordKey,id:c.subjectId,title:c.title},claim);
  for(const recap of c.recaps)add(recap,claim);
 }
 return {characterId:character,records:[...records.values()]};
}
async function requestRows(table,params){
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)throw Error('Backend unavailable');
 const q=Object.entries(params).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');
 const r=await fetch(url+'/rest/v1/'+table+'?'+q,{headers:{apikey:key,Authorization:'Bearer '+key,'Accept':'application/json'}});
 if(!r.ok)throw Error('Knowledge source unavailable');
 const data=await r.json();if(!Array.isArray(data))throw Error('Unexpected backend response');return data;
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
 if(req.method!=='GET')return reply({error:'Read only'},405);
 const character=String(req.headers.get('x-greywake-character')||'').trim().toLowerCase();
 const code=String(req.headers.get('x-greywake-code')||'').trim().toUpperCase();
 if(!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(character)||character==='gm'||code!==character.toUpperCase())return reply({error:'Player perspective unavailable'},403);
 try{
  const roster=await requestRows('characters',{select:'slug',slug:'eq.'+character,status:'eq.active',limit:'2'});
  if(roster.length!==1)return reply({error:'Player perspective unavailable'},403);
  const rows=[];let offset=0;
  for(;;){
   const page=await requestRows('knowledge_entries',{select:'id,slug,section,visibility,status,body,knowledge_entry_characters(character_slug)',section:'eq.'+SECTION,visibility:'in.(private,party)',order:'id.asc',limit:'200',offset:String(offset)});
   rows.push(...page);
   if(page.length<200)break;
   offset+=page.length;
   if(offset>=10000)throw Error('Projection exceeds safety limit');
  }
  return reply(projectRows(rows,character));
 }catch(_error){return reply({error:'Knowledge provider unavailable'},503)}
});

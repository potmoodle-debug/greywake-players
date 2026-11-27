'use strict';
// Pure, server-side projection reference. This is NOT authentication.
// Never load raw claims, grants or source references into a public client.
// No campaign-specific names, roster, locations or session dependencies.
const SCOPES=new Set(['public','recipients','gm']);
const STATUS=new Set(['approved','draft','withdrawn','superseded']);
const ACQUISITION=new Set(['common','witnessed','investigated','practical','reported','rumour','inferred','insider','unknown']);
const DISCLOSURES=new Set(['personal','selective','party']);
const CERTAINTY=new Set(['established','reported','rumour','inferred','belief','unknown']);
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const rev=x=>Number.isSafeInteger(x)&&x>0;
const key=(id,revision)=>JSON.stringify([id,revision]);
const ensure=(condition,msg)=>{if(!condition)throw new Error(msg)};

function buildIndex(claims,grants){
  ensure(Array.isArray(claims)&&Array.isArray(grants),'Missing knowledge collections');
  const revisions=new Map(),latest=new Map(),byGrant=new Map(),subjects=new Map();
  for(const c of claims){
    ensure(c&&nonempty(c.id)&&rev(c.revision)&&nonempty(c.subjectId)&&nonempty(c.subjectTitle)&&nonempty(c.body)&&nonempty(c.sourceRef),'Malformed claim');
    ensure(SCOPES.has(c.scope)&&STATUS.has(c.status)&&CERTAINTY.has(c.certainty),'Unknown claim classification');
    ensure(Number.isInteger(c.tier)&&c.tier>=1&&c.tier<=5,'Invalid subject-specific tier');
    ensure(c.scope==='gm'||c.tier<5,'GM truth cannot be player scoped');
    ensure(c.scope!=='public'||c.tier===1,'Only common tier-one claims may be public');
    const k=key(c.id,c.revision);
    ensure(!revisions.has(k),'Duplicate claim revision');
    const previous=latest.get(c.id);
    ensure(!previous||previous.subjectId===c.subjectId,'Claim moved between subjects');
    ensure(!subjects.has(c.subjectId)||subjects.get(c.subjectId)===c.subjectTitle,'Conflicting subject title');
    subjects.set(c.subjectId,c.subjectTitle);revisions.set(k,c);
    if(!previous||previous.revision<c.revision)latest.set(c.id,c);
  }
  for(const g of grants){
    ensure(g&&nonempty(g.claimId)&&rev(g.revision)&&nonempty(g.characterId)&&nonempty(g.evidenceRef),'Malformed knowledge grant');
    ensure(ACQUISITION.has(g.acquisition)&&g.acquisition!=='common','Invalid individual acquisition');
    ensure(['approved','revoked','draft'].includes(g.status),'Invalid grant status');
    ensure(DISCLOSURES.has(g.disclosure),'Missing or invalid disclosure classification');
    ensure(g.playerBody===undefined||nonempty(g.playerBody),'Invalid recipient wording');
    ensure(Number.isInteger(g.tier)&&g.tier>=1&&g.tier<=4,'Invalid recipient tier');
    const k=key(g.claimId,g.revision),c=revisions.get(k);
    ensure(c&&c.scope==='recipients','Grant references missing or non-recipient claim');
    const list=byGrant.get(k)||new Map();
    ensure(!list.has(g.characterId),'Ambiguous recipient grant; reconcile ledger first');
    list.set(g.characterId,g);byGrant.set(k,list);
  }
  return {latest,byGrant};
}
// A grant applies to one exact approved revision. New corrections never inherit
// old approvals, and revoked/draft grants confer no access. A party-wide event
// is represented as explicit grants to its evidenced recipients, not the live roster.
function project(claims,grants,principal){
  const {latest,byGrant}=buildIndex(claims,grants);
  // principal must be resolved by a trusted backend from verified identity.
  // A browser-selected character name or role must never be passed here as authority.
  const character=principal?.verified===true&&principal.role==='player'&&nonempty(principal.characterId)?principal.characterId:null;
  const gm=principal?.verified===true&&principal.role==='gm';
  const records=new Map();
  for(const c of latest.values()){
    if(c.status!=='approved')continue;
    const grant=character?byGrant.get(key(c.id,c.revision))?.get(character):null;
    const recipient=grant?.status==='approved'&&c.scope==='recipients';
    if(!gm&&c.scope!=='public'&&!recipient)continue;
    const result={id:c.id,revision:c.revision,body:recipient?(grant.playerBody??c.body):c.body,certainty:c.certainty,
      tier:recipient?grant.tier:c.tier,acquisition:recipient?grant.acquisition:(c.scope==='public'?'common':'gm'),
      visibility:c.scope==='public'?'common':recipient?grant.disclosure:'gm'};
    // No sourceRef, evidenceRef, other character IDs or hidden titles in payload.
    if(!records.has(c.subjectId))records.set(c.subjectId,{id:c.subjectId,title:c.subjectTitle,claims:[]});
    records.get(c.subjectId).claims.push(result);
  }
  return [...records.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
// Static publication is explicitly public-only. Approved recipient or GM content
// must never be serialized into client bundles, search indexes or static assets.
function publicExport(claims,grants){return project(claims,grants,null)}
function search(records,query){
  const q=String(query||'').toLowerCase().trim();
  if(!q)return records;
  return records.filter(r=>r.title.toLowerCase().includes(q)||r.claims.some(c=>c.body.toLowerCase().includes(q)));
}
function relationships(records,edges){
  const allowed=new Set(records.map(r=>r.id));
  // Edges themselves are knowledge claims in production; this helper only
  // accepts an already audience-filtered edge list from the backend.
  return edges.filter(e=>allowed.has(e.from)&&allowed.has(e.to)).map(e=>({from:e.from,to:e.to}));
}
// Compatibility adapter for the trusted-group legacy login. It selects a
// perspective, not an authenticated identity. It deliberately never exposes
// GM-only truth, including when a caller supplies role:'gm'.
function legacyPlayerProjection(claims,grants,selectedCharacterId){
  if(!nonempty(selectedCharacterId))return publicExport(claims,grants);
  return project(claims,grants,{verified:true,role:'player',characterId:selectedCharacterId});
}
module.exports={project,publicExport,search,relationships,legacyPlayerProjection};

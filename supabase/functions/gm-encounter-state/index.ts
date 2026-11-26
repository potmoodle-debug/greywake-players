import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const headers={"Access-Control-Allow-Origin":"https://potmoodle-debug.github.io","Access-Control-Allow-Headers":"apikey,authorization,content-type,x-greywake-character,x-greywake-code","Access-Control-Allow-Methods":"GET,PATCH,POST,OPTIONS","Content-Type":"application/json"};
const reply=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers});
 if(req.headers.get("x-greywake-character")!=="gm"||req.headers.get("x-greywake-code")!=="GREYWAKE")return reply({error:"GM access required"},403);
 const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 try{
 const {data:display,error:de}=await db.from("live_scene_display").select("scene,revision").eq("display_key","current").single();if(de)throw de;
 const scene=display.scene,session=String(scene.session);
 if(req.method==="POST"){
 const b=await req.json();
 if(b.revision!==display.revision)return reply({error:"Scene changed; refresh and retry."},409);
 if(!["clue","location","npc","hazard","adversary"].includes(b.kind)||typeof b.title!=="string"||!b.title.trim()||b.title.length>120||typeof b.detail!=="string"||b.detail.length>800)return reply({error:"Invalid card"},400);
 const card:Record<string,unknown>={id:crypto.randomUUID(),kind:b.kind,title:b.title.trim(),detail:b.detail.trim()};
 if(b.kind==="adversary"){const {data,error}=await db.from("gm_adversary_cards").select("slug,name").eq("slug",b.adversary_slug).eq("active",true).maybeSingle();if(error)throw error;if(!data)return reply({error:"Approved adversary required"},400);card.adversary_slug=data.slug;card.record=data.name;}
 else if(typeof b.record==="string"&&b.record.length<=120)card.record=b.record;
 const next={...scene,cards:[...(Array.isArray(scene.cards)?scene.cards:[]),card]};
 const {data,error}=await db.from("live_scene_display").update({scene:next,revision:display.revision+1,updated_at:new Date().toISOString()}).eq("display_key","current").eq("revision",display.revision).select("revision").maybeSingle();
 if(error)throw error;if(!data)return reply({error:"Scene changed; retry."},409);return reply({revision:data.revision,card});
 }
 const candidates=(Array.isArray(scene.cards)?scene.cards:[]).filter((c:any)=>c.kind==="adversary"&&typeof c.id==="string"&&typeof c.adversary_slug==="string");
 const active=[];
 for(const c of candidates){
 const {data:ref,error:e}=await db.from("gm_adversary_cards").select("slug,name,tier,role,difficulty,thresholds,hp,stress,atk,attack_name,attack_range,damage,experience,motives_tactics,features").eq("slug",c.adversary_slug).eq("active",true).maybeSingle();if(e)throw e;if(!ref)continue;
 const {error:ie}=await db.from("gm_encounter_instances").upsert({session_key:session,instance_id:c.id,adversary_slug:ref.slug,hp_max:ref.hp,stress_max:ref.stress},{onConflict:"session_key,instance_id",ignoreDuplicates:true});if(ie)throw ie;
 const {data:instance,error:se}=await db.from("gm_encounter_instances").select("*").eq("session_key",session).eq("instance_id",c.id).single();if(se)throw se;
 if(instance.adversary_slug!==ref.slug)continue;
 active.push({...instance,reference:ref});
 }
 if(req.method==="GET")return reply({session,instances:active});
 if(req.method!=="PATCH")return reply({error:"Method not allowed"},405);
 const b=await req.json();const a=active.find(x=>x.instance_id===b.instance_id);
 if(!a||b.session_key!==session)return reply({error:"Encounter no longer active in this scene"},409);
 if(b.version!==a.version)return reply({error:"Another GM changed this card. Refresh and retry."},409);
 const change:Record<string,unknown>={version:a.version+1,updated_at:new Date().toISOString()};
 if(b.field==="hp_marked"||b.field==="stress_marked"){const max=b.field==="hp_marked"?a.hp_max:a.stress_max;if(a.status!=="active"||!Number.isInteger(b.value)||b.value<0||b.value>max)return reply({error:"Invalid tracker update"},400);change[b.field]=b.value}
 else if(b.field==="status"&&["active","defeated","escaped","resolved"].includes(b.value))change.status=b.value;
 else return reply({error:"Invalid change"},400);
 const {data,error}=await db.from("gm_encounter_instances").update(change).eq("session_key",session).eq("instance_id",a.instance_id).eq("version",a.version).select().maybeSingle();
 if(error)throw error;if(!data)return reply({error:"Concurrent update; retry"},409);return reply({instance:data});
 }catch(e){console.error(e);return reply({error:"Encounter sync unavailable"},500)}
});
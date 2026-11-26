import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const headers={"Access-Control-Allow-Origin":"https://potmoodle-debug.github.io","Access-Control-Allow-Headers":"apikey,authorization,content-type,x-greywake-character,x-greywake-code","Access-Control-Allow-Methods":"GET,OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers});
 if(req.headers.get("x-greywake-character")!=="gm"||req.headers.get("x-greywake-code")!=="GREYWAKE")return reply({error:"GM access required"},403);
 if(req.method!=="GET")return reply({error:"Method not allowed"},405);
 try{
 const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 const {data:display,error:de}=await db.from("live_scene_display").select("scene").eq("display_key","current").single();if(de)throw de;
 const session=String(display.scene.session);
 const {data,error}=await db.from("gm_prep_cards").select("id,session_key,kind,title,detail,readiness,image,image_label,record,adversary_slug,sort_order,updated_at").eq("status","ready").in("session_key",[session,"reusable"]).order("sort_order").order("id");
 if(error)throw error;return reply({session,cards:data});
 }catch(e){console.error(e);return reply({error:"Preparation library unavailable"},500)}
});
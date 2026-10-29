import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const unsupported=()=>NextResponse.json({connected:false,ok:false,message:'Google Sheets is not connected yet.'},{headers:{'Cache-Control':'no-store'}});
export async function GET(){
 const connected=Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL&&process.env.GOOGLE_SHEETS_SHARED_SECRET);
 return NextResponse.json({connected},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request){
 const webhook=process.env.GOOGLE_SHEETS_WEBHOOK_URL;
 const secret=process.env.GOOGLE_SHEETS_SHARED_SECRET;
 if(!webhook||!secret)return unsupported();
 // Validate that the destination is a deployed Google Apps Script owned by the site operator.
 let endpoint:URL;
 try{endpoint=new URL(webhook);if(endpoint.protocol!=='https:'||endpoint.hostname!=='script.google.com'||!endpoint.pathname.startsWith('/macros/s/'))throw Error('Invalid Google Apps Script URL');}
 catch{return NextResponse.json({connected:true,ok:false,error:'Google Sheets configuration is invalid.'},{status:503})}
 // Prevent unrelated cross-site browser requests. This is only abuse reduction, not authentication.
 const origin=request.headers.get('origin');
 const host=request.headers.get('host');
 if(origin&&host){try{if(new URL(origin).host!==host)return NextResponse.json({error:'Invalid origin'},{status:403})}catch{return NextResponse.json({error:'Invalid origin'},{status:403})}}
 const url=process.env.NEXT_PUBLIC_PRESTO_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_PRESTO_SUPABASE_KEY;
 if(!url||!key)return NextResponse.json({connected:true,ok:false,error:'Cloud database is not configured.'},{status:503});
 // Only a verified PRESTO account may trigger a complete driver-data export.
 const authorization=request.headers.get('authorization')||'';
 const token=authorization.startsWith('Bearer ')?authorization.slice(7):'';
 if(!token)return NextResponse.json({error:'Authentication required.'},{status:401});
 const client=createClient(url,key,{
  auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:'Bearer '+token}}
 });
 const {data:verified,error:authError}=await client.auth.getUser(token);
 if(authError||!verified.user)return NextResponse.json({error:'Invalid or expired session.'},{status:401});
 const records:unknown[]=[];
 for(let i=0;i<10000;i+=1000){
  const {data,error}=await client.from('presto_drivers')
   .select('id,name,phone,bag,shirt,verified,bankily,masrvi,sedad,click,bankily_account,masrvi_account,sedad_account,click_account,delivery_date,observations')
   .order('id',{ascending:true}).range(i,i+999);
  if(error)return NextResponse.json({connected:true,ok:false,error:'Cannot read saved PRESTO records.'},{status:502});
  records.push(...(data||[]));
  if((data||[]).length<1000)break;
 }
 const {data:profile}=await client.from('presto_profile').select('company,city').eq('id',1).maybeSingle();
 const body=JSON.stringify({secret,drivers:records,company:profile?.company||'PRESTO',city:profile?.city||'Nouakchott'});
 try{
  const result=await fetch(endpoint.href,{method:'POST',body,headers:{'Content-Type':'application/json'},cache:'no-store',redirect:'follow',signal:AbortSignal.timeout(25000)});
  if(!result.ok)throw Error('Google Apps Script returned '+result.status);
  const json=await result.json();
  if(json?.ok!==true)throw Error(typeof json?.error==='string'?json.error:'Google Sheets did not confirm synchronization.');
  return NextResponse.json({connected:true,ok:true,rows:records.length},{headers:{'Cache-Control':'no-store'}});
 }catch(e){
  return NextResponse.json({connected:true,ok:false,error:'Google Sheets sync failed: '+(e instanceof Error?e.message:'Unknown error')},{status:502});
 }
}

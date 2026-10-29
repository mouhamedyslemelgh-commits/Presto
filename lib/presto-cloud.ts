import {createClient} from '@supabase/supabase-js';
const url=process.env.NEXT_PUBLIC_PRESTO_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_PRESTO_SUPABASE_KEY;
/** Browser-safe publishable key. Database RLS limits writes to registered PRESTO admins. */
export const prestoCloud=url&&key?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true}}):null;

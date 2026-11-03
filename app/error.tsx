'use client';

import {useEffect} from 'react';
import {AlertTriangle,RefreshCcw,Home} from 'lucide-react';

/** Friendly route-level recovery screen; never displays sensitive error details. */
export default function ErrorPage({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
 useEffect(()=>{console.error('PRESTO page error',error)},[error]);
 return <main dir="auto" style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f4f8f7',color:'#143d35',fontFamily:'system-ui,sans-serif'}}>
  <section role="alert" style={{width:'100%',maxWidth:480,textAlign:'center',background:'#fff',border:'1px solid #dceae5',borderRadius:24,padding:'40px 24px',boxShadow:'0 12px 40px #0a302010'}}>
   <AlertTriangle size={38} aria-hidden="true" style={{color:'#c67a2c',marginBottom:18}}/>
   <h1 style={{fontSize:23,margin:'0 0 12px'}}>تعذر عرض هذه الصفحة</h1>
   <p style={{lineHeight:1.8,margin:'0 0 8px'}}>لم تُحذف سجلاتك. يمكنك إعادة المحاولة أو فتح الصفحة الرئيسية.</p>
   <p lang="fr" style={{lineHeight:1.7,margin:'0 0 24px',color:'#536b62'}}>La page a rencontré un problème. Veuillez réessayer.</p>
   <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:12}}>
    <button type="button" onClick={reset} style={{display:'inline-flex',alignItems:'center',gap:8,border:0,borderRadius:12,padding:'13px 18px',background:'#125b46',color:'#fff',cursor:'pointer',fontWeight:700}}><RefreshCcw size={18}/> إعادة المحاولة</button>
    <a href="/" style={{display:'inline-flex',alignItems:'center',gap:8,border:'1px solid #c8dfd5',borderRadius:12,padding:'13px 18px',color:'#125b46',textDecoration:'none',fontWeight:700}}><Home size={18}/> الرئيسية</a>
   </div>
  </section>
 </main>;
}

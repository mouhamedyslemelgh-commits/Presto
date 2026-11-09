'use client';
import Link from 'next/link';
import PrestoAppGuide from '../../components/presto-app-guide';
import {useLanguage} from '../../components/presto-language';

/** Public, read-only training page: does not expose driver or customer data. */
export default function DriverGuidePage(){
 const {language}=useLanguage();
 return <main style={{minHeight:'100vh',padding:'clamp(12px,3vw,36px)',background:'var(--background,#f4f7fa)'}}>
  <div style={{maxWidth:1240,margin:'0 auto'}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:18}}>
    <Link href="/" style={{fontWeight:800,textDecoration:'none',color:'#b91c1c'}}>PRESTO · بريستو</Link>
    <span style={{fontSize:13,color:'#475569'}}>{language==='ar'?'دليل تدريب السائقين':'Guide des livreurs'}</span>
   </header>
   <PrestoAppGuide language={language}/>
  </div>
 </main>;
}

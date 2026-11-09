'use client';
import {Download,ExternalLink} from 'lucide-react';
export default function InactiveDrivers({language}:{language:string}){
 const ar=language==='ar';
 const source='/api/inactive-drivers/pdf';
 return <section className="panel" dir={ar?'rtl':'ltr'}>
  <div className="panelTitle"><div><h2>{ar?'سائقون لديهم حقيبة ولا يعملون':'Livreurs avec sac sans activité'}</h2><p>{ar?'الملف الأصلي كاملًا — 6 صفحات، بجميع الصور والجداول وتعليمات المتابعة.':'Document original intégral — 6 pages, photos, tableaux et consignes de suivi.'}</p></div></div>
  <div style={{display:'flex',gap:12,flexWrap:'wrap',margin:'20px 0'}}>
   <a className="primary" href={source} download="PRESTO-inactive-drivers.pdf"><Download size={18}/>{ar?'تنزيل PDF كامل':'Télécharger le PDF complet'}</a>
   <a className="secondary" href={source} target="_blank" rel="noopener noreferrer"><ExternalLink size={18}/>{ar?'فتح جميع الصفحات':'Ouvrir toutes les pages'}</a>
  </div>
  <object data={source} type="application/pdf" width="100%" height="1000" style={{border:'1px solid #eee',borderRadius:16,background:'#f4f4f4',maxHeight:'80vh'}} aria-label={ar?'الملف الأصلي للسائقين غير النشطين':'Document original des livreurs inactifs'}>
   <p>{ar?'اضغط لفتح الملف كاملًا على جهازك:':'Ouvrez le document complet :'} <a href={source} target="_blank" rel="noopener noreferrer">PDF · 6 {ar?'صفحات':'pages'}</a></p>
  </object>
 </section>;
}

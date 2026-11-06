'use client';

import {useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,CalendarDays,Check,ChevronDown,ClipboardCheck,Download,FileBadge,FileText,GraduationCap,IdCard,MapPin,PackageCheck,Pencil,Phone,Printer,Search,Shirt,UserRound,Users,X} from 'lucide-react';
import styles from './presto-pdf-roster.module.css';

export type RosterDriver={
 id:number;name:string;phone:string;bag:boolean;shirt:boolean;verified:boolean;
 city?:string;vehicle_type?:string;app_code?:string;delivery_date?:string;
 observations?:string;driver_photo_path?:string;license_plate?:string;presto_reference?:string;
 pdf_position?:number|null;training_completed?:boolean|null;pdf_source_phone?:string;
 pdf_source_date?:string|null;
};
type Update={license_plate?:string;presto_reference?:string;training_completed?:boolean|null;bag?:boolean;shirt?:boolean;delivery_date?:string};
type Props={
 rows:RosterDriver[];photos:Record<string,string>;language:string;editable:boolean;
 onUpdate:(id:number,payload:Update)=>Promise<void>;
 onOpenTraining?:()=>void;
};
const present=(text?:string|null)=>String(text||'').trim()||'—';
function dateDisplay(date?:string|null){
 if(!date)return '—';
 const val=date.slice(0,10);
 const match=val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
 return match?match[3]+'/'+match[2]+'/'+match[1]:val;
}
function normalizedDate(date?:string|null){
 const match=String(date||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
 return match?match[3]+'-'+match[2]+'-'+match[1]:String(date||'').slice(0,10);
}
function driverPosition(row:RosterDriver,index:number){
 return row.pdf_position??(100+index);
}
const fileDate='06/11/2026';
export default function PrestoPdfRoster({rows,photos,language,editable,onUpdate,onOpenTraining}:Props){
 const ar=language==='ar';
 const L=(a:string,b:string)=>ar?a:b;
 const [query,setQuery]=useState('');
 const [showOther,setShowOther]=useState(false);
 const [selected,setSelected]=useState<number|null>(null);
 const [tab,setTab]=useState<'profile'|'card'>('profile');
 const [edit,setEdit]=useState(false);
 const [working,setWorking]=useState(false);
 const [message,setMessage]=useState('');
 const [form,setForm]=useState<Update>({});
 const canonical=useMemo(()=>[...rows].filter(x=>x.pdf_position!=null).sort((a,b)=>(a.pdf_position||0)-(b.pdf_position||0)),[rows]);
 const extras=useMemo(()=>[...rows].filter(x=>x.pdf_position==null&&x.bag).sort((a,b)=>a.id-b.id),[rows]);
 const roster=showOther?[...canonical,...extras]:canonical;
 const filtered=roster.filter(x=>[x.name,x.phone,x.pdf_source_phone,x.presto_reference,x.license_plate,x.pdf_position].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 const summary={all:roster.length,both:roster.filter(x=>x.bag&&x.shirt).length,partial:roster.filter(x=>(x.bag||x.shirt)&&!(x.bag&&x.shirt)).length,none:roster.filter(x=>!x.bag&&!x.shirt).length};
 const person=roster.find(x=>x.id===selected);
 const viewPerson=(x:RosterDriver)=>{setSelected(x.id);setEdit(false);setTab('profile');setMessage('');};
 const editPerson=(x:RosterDriver)=>{setForm({license_plate:x.license_plate||'',presto_reference:x.presto_reference||'',training_completed:x.training_completed,bag:x.bag,shirt:x.shirt,delivery_date:normalizedDate(x.delivery_date)});setEdit(true);};
 const save=async()=>{
  if(!person||!editable||working)return;
  setWorking(true);setMessage('');
  try{await onUpdate(person.id,form);setEdit(false);setMessage(L('حُفظت التعديلات بنجاح.','Les modifications ont été enregistrées.'));}
  catch(e){setMessage(e instanceof Error?e.message:L('تعذر الحفظ.','Enregistrement impossible.'));}
  finally{setWorking(false);}
 };
 const badge=(yes:boolean|null|undefined)=>yes===true?<Check className={styles.check} aria-label={L('نعم','Oui')} size={20} strokeWidth={3}/>:<span className={styles.dash} aria-label={L('لا أو غير مسجل','Non ou non renseigné')}>—</span>;
 const exportCSV=()=>{
  const header=['#','الاسم','رقم السائق','الهاتف','اللوحة','الحقيبة','القميص','التكوين','سلم في'];
  const body=filtered.map((d,i)=>[String(driverPosition(d,i)),d.name,d.presto_reference||'',d.pdf_source_phone||d.phone,d.license_plate||'',d.bag?'نعم':'لا',d.shirt?'نعم':'لا',d.training_completed===true?'نعم':d.training_completed===false?'لا':'غير مسجل',dateDisplay(d.pdf_source_date||d.delivery_date)]);
  const lines=[header,...body].map(line=>line.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(';'));
  const blob=new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='PRESTO-equipes-formation-2026-11-06.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <section className={styles.root} dir="rtl">
  <header className={styles.heading}>
   <div className={styles.brand}><img src="/logos/presto.webp" alt="PRESTO بريستو"/><span>PRESTO<br/><b>بريستو</b></span></div>
   <div className={styles.headerMeta}>بريستو موريتانيا · إدارة العمليات<br/><strong>6 نوفمبر 2026</strong></div>
  </header>
  <div className={styles.titleBlock}><span className={styles.overline}>PRESTO · {L('سجل المتدربين وتسليم المستلزمات','FORMATION ET REMISES')}</span><h2>{L('تسليم المعدات — الحقيبة والقميص','Remise des équipements — sac et chemise')}</h2><p>{roster.length} {L('سائقًا', 'livreurs')} · {L('بيانات قائمة 6 نوفمبر 2026','Liste du 6 novembre 2026')}{showOther&&extras.length?' · +'+extras.length+' '+L('من السجل الحالي','du registre actuel'):''}</p></div>
  <div className={styles.summary}>
   {[
    [summary.all,L('في القائمة','Sur la liste'),L('سائقون','Livreurs'),'#fff0e8'],
    [summary.both,L('الحقيبة والقميص','Sac et chemise'),L('معدات مكتملة','Équipement complet'),'#fff5f0'],
    [summary.partial,L('جزئيًا','Partiel'),L('قطعة واحدة','Un équipement'),'#fff6f1'],
    [summary.none,L('لا شيء','Aucun'),L('لم يستلم','Aucune remise'),'#fff1eb']
   ].map(([number,title,desc,background],i)=><div className={styles.stat} style={{background:String(background)}} key={i}><strong className={i===1?styles.green:i===2?styles.orange:styles.ink}>{number as number}</strong><b>{title as string}</b><small>{desc as string}</small></div>)}
  </div>
  <div className={styles.actions}>
   <label className={styles.search}><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={L('ابحث بالاسم أو الهاتف أو رقم السائق أو اللوحة','Rechercher un livreur, un numéro, une plaque')}/></label>
   {extras.length>0&&<button className={styles.chip} type="button" onClick={()=>setShowOther(!showOther)}>{showOther?L('عرض القائمة الأصلية فقط','Liste d’origine'):L('عرض السائقين الإضافيين','Autres livreurs')} ({extras.length}) <ChevronDown size={15}/></button>}
   <button className={styles.chip} type="button" onClick={exportCSV}><Download size={16}/>{L('تصدير الجدول','Exporter CSV')}</button>
   {onOpenTraining&&<button className={styles.chip} type="button" onClick={onOpenTraining}><GraduationCap size={17}/>{L('بيانات تدريب إضافية','Autres formations')}</button>}
  </div>
  <div className={styles.tableScroller}>
   <table className={styles.table}>
    <thead><tr><th>#</th><th>{L('السائق','Livreur')}</th><th>{L('الهاتف','Téléphone')}</th><th>{L('اللوحة','Plaque')}</th><th>{L('الحقيبة','Sac')}</th><th>{L('القميص','Chemise')}</th><th>{L('التكوين','Formation')}</th><th>{L('سلم في','Date')}</th></tr></thead>
    <tbody>{filtered.map((d,i)=><tr key={d.id} onClick={()=>viewPerson(d)} tabIndex={0} role="button" onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();viewPerson(d);}}} aria-label={L('افتح ملف السائق','Ouvrir la fiche du livreur')+' '+d.name}>
      <td className={styles.serial}>{driverPosition(d,i)}</td>
      <td className={styles.driverName}><strong>{d.name}</strong><small>#{present(d.presto_reference)}</small></td>
      <td className={styles.phone} dir="ltr">{d.pdf_source_phone||d.phone}</td>
      <td>{d.license_plate?<span className={styles.plate} dir="ltr">{d.license_plate}<span className={styles.plateFlag}>◉</span></span>:<span className={styles.dash}>—</span>}</td>
      <td>{badge(d.bag)}</td><td>{badge(d.shirt)}</td><td>{badge(d.training_completed)}</td>
      <td className={styles.date} dir="ltr">{dateDisplay(d.pdf_source_date||d.delivery_date)}</td>
     </tr>)}</tbody>
   </table>
   {!filtered.length&&<p className={styles.noResults}>{L('لا توجد نتائج مطابقة.','Aucun résultat.')}</p>}
  </div>
  <div className={styles.foot}><span>بريستو موريتانيا · {L('للاستخدام الداخلي','Usage interne')}</span><span>{L('المرجع: القائمة المرفقة بتاريخ 6 نوفمبر 2026','Référence : document du 6 novembre 2026')} · {filtered.length} / {roster.length}</span></div>
  {person&&<div className={styles.overlay} onMouseDown={e=>{if(e.target===e.currentTarget&&!working)setSelected(null)}}><div className={styles.modal} role="dialog" aria-modal="true" aria-label={L('ملف السائق','Dossier livreur')}>
    <div className={styles.modalHead}><div className={styles.modalHeadline}><span className={styles.overline}>PRESTO · #{present(person.presto_reference)}</span><h2>{L('الملف الشخصي للسائق','Profil du livreur')}</h2></div><button className={styles.iconButton} onClick={()=>setSelected(null)} aria-label={L('إغلاق','Fermer')}><X size={21}/></button></div>
    <div className={styles.hero}><div className={styles.avatar}><img src="/images/presto-uniform-rider.webp" alt={person.name} style={{objectPosition:'center 17%'}}/></div><div><small>{L('سائق PRESTO','Livreur PRESTO')}</small><h3>{person.name}</h3><span><IdCard size={14}/> #{present(person.presto_reference)} · {L('رقم في القائمة','Rang')} {person.pdf_position??'—'}</span></div><div className={styles.heroLogo}><img src="/logos/presto.webp" alt="PRESTO"/></div></div>
    <div className={styles.tabs}><button className={tab==='profile'?styles.active:''} onClick={()=>setTab('profile')}><FileText size={16}/>{L('الملف الكامل','Dossier')}</button><button className={tab==='card'?styles.active:''} onClick={()=>setTab('card')}><IdCard size={16}/>{L('بطاقة السائق','Carte du livreur')}</button></div>
    {message&&<p role="status" className={styles.notice}>{message}</p>}
    {tab==='profile'?<div className={styles.modalContent}>
     <div className={styles.detailGrid}>
      <div><Phone size={17}/><small>{L('رقم الهاتف','Téléphone')}</small><strong dir="ltr">{person.pdf_source_phone||person.phone}</strong></div>
      <div><IdCard size={17}/><small>{L('رقم اللوحة','Immatriculation')}</small><strong dir="ltr">{present(person.license_plate)}</strong></div>
      <div><CalendarDays size={17}/><small>{L('تاريخ التسليم','Date de remise')}</small><strong dir="ltr">{dateDisplay(person.pdf_source_date||person.delivery_date)}</strong></div>
      <div><GraduationCap size={17}/><small>{L('التكوين','Formation')}</small><strong>{person.training_completed===true?L('مكتمل','Terminée'):person.training_completed===false?L('غير مكتمل','Non terminée'):L('غير مسجل','Non renseigné')}</strong></div>
      <div><MapPin size={17}/><small>{L('المدينة','Ville')}</small><strong>{present(person.city)}</strong></div>
      <div><ClipboardCheck size={17}/><small>{L('كود التطبيق','Code application')}</small><strong>{present(person.app_code)}</strong></div>
     </div>
     <div className={styles.statusLine}><div><PackageCheck size={23}/><b>{L('الحقيبة','Sac')}</b>{badge(person.bag)}</div><div><Shirt size={23}/><b>{L('القميص','Chemise')}</b>{badge(person.shirt)}</div><div><GraduationCap size={23}/><b>{L('التكوين','Formation')}</b>{badge(person.training_completed)}</div></div>
     {person.observations&&<p className={styles.notes}>{person.observations}</p>}
     {editable&&edit&&<div className={styles.editor}>
      <label>{L('اللوحة','Plaque')}<input value={form.license_plate||''} onChange={e=>setForm({...form,license_plate:e.target.value})} maxLength={30}/></label>
      <label>{L('رقم السائق','N° livreur')}<input value={form.presto_reference||''} onChange={e=>setForm({...form,presto_reference:e.target.value})} maxLength={32}/></label>
      <label>{L('تاريخ التسليم','Date de remise')}<input type="date" value={form.delivery_date||''} onChange={e=>setForm({...form,delivery_date:e.target.value})}/></label>
      <label>{L('حالة التكوين','Formation')}<select value={String(form.training_completed)} onChange={e=>setForm({...form,training_completed:e.target.value==='true'?true:e.target.value==='false'?false:null})}><option value="true">{L('مكتمل','Terminée')}</option><option value="false">{L('لم يكمل','Non terminée')}</option><option value="null">{L('غير مسجل','Non renseigné')}</option></select></label>
      <label className={styles.checkBox}><input type="checkbox" checked={Boolean(form.bag)} onChange={e=>setForm({...form,bag:e.target.checked})}/>{L('استلم الحقيبة','Sac remis')}</label>
      <label className={styles.checkBox}><input type="checkbox" checked={Boolean(form.shirt)} onChange={e=>setForm({...form,shirt:e.target.checked})}/>{L('استلم القميص','Chemise remise')}</label>
     </div>}
     <div className={styles.profileButtons}>{editable&&(edit?<><button className={styles.secondary} disabled={working} onClick={()=>setEdit(false)}>{L('إلغاء','Annuler')}</button><button className={styles.primary} disabled={working} onClick={()=>void save()}>{working?L('جار الحفظ...','Enregistrement...'):L('حفظ التعديلات','Enregistrer')}</button></>:<button className={styles.secondary} onClick={()=>editPerson(person)}><Pencil size={16}/>{L('تعديل البيانات','Modifier')}</button>)}<button className={styles.primary} onClick={()=>setTab('card')}><IdCard size={17}/>{L('عرض البطاقة','Voir la carte')}</button></div>
    </div>:<div className={styles.cardView}>
      <div className={styles.printCard}>
       <div className={styles.cardTop}><img src="/logos/presto.webp" alt="PRESTO"/><span>PRESTO · <b>{L('بطاقة تعريف السائق','CARTE LIVREUR')}</b></span></div>
       <div className={styles.cardBody}><div className={styles.cardPhoto}><img src="/images/presto-uniform-rider.webp" alt={person.name} style={{objectPosition:'center 17%'}}/></div><div><small>{L('الاسم الكامل','Nom complet')}</small><h3>{person.name}</h3><span>#{present(person.presto_reference)}</span><p><Phone size={14}/> <bdi>{person.pdf_source_phone||person.phone}</bdi></p><p><IdCard size={14}/> <bdi>{present(person.license_plate)}</bdi></p></div></div>
       <div className={styles.cardBottom}><span><Check size={17}/>{L('الحقيبة','Sac')} {person.bag?'✓':'—'}</span><span><Check size={17}/>{L('القميص','Chemise')} {person.shirt?'✓':'—'}</span><span><GraduationCap size={17}/>{L('التكوين','Formation')} {person.training_completed?'✓':'—'}</span></div>
       <footer>PRESTO · MAURITANIE <b>#{present(person.presto_reference)}</b></footer>
      </div>
      <p className={styles.printHint}>{L('اضغط طباعة ثم اختر «حفظ بصيغة PDF» إذا أردت تنزيل البطاقة.','Imprimez ou choisissez « Enregistrer en PDF ».')}</p>
      <div className={styles.profileButtons}><button className={styles.secondary} onClick={()=>setTab('profile')}><ArrowRight size={17}/>{L('العودة للملف','Retour au profil')}</button><button className={styles.primary} onClick={()=>window.print()}><Printer size={17}/>{L('طباعة / حفظ PDF','Imprimer / enregistrer PDF')}</button></div>
     </div>}
   </div></div>}
 </section>;
}

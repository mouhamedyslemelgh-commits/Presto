'use client';

import {useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,CalendarDays,Check,ChevronDown,ClipboardCheck,Download,FileBadge,FileText,GraduationCap,IdCard,MapPin,PackageCheck,Pencil,Phone,Plus,Printer,Search,Shirt,UserRound,Users,X} from 'lucide-react';
import styles from './presto-pdf-roster.module.css';

export type RosterDriver={
 id:number;name:string;phone:string;bag:boolean;shirt:boolean;verified:boolean;
 city?:string;vehicle_type?:string;app_code?:string;delivery_date?:string;
 observations?:string;driver_photo_path?:string;license_plate?:string;presto_reference?:string;
 pdf_position?:number|null;training_completed?:boolean|null;pdf_source_phone?:string;
 pdf_source_date?:string|null;latest_training_date?:string;latest_trainer?:string;
};
type Update={license_plate?:string;presto_reference?:string;training_completed?:boolean|null;bag?:boolean;shirt?:boolean;delivery_date?:string};
type NumberCorrection={id:number;previous:number|null;position:number};
type Props={
 rows:RosterDriver[];photos:Record<string,string>;language:string;editable:boolean;
 onUpdate:(id:number,payload:Update)=>Promise<void>;
 onOpenTraining?:(person?:RosterDriver)=>void;
 onShowTraining?:()=>void;
 onFixNumbering?:(changes:NumberCorrection[])=>Promise<void>;
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
const fileDate='06/11/2026';
export default function PrestoPdfRoster({rows,photos,language,editable,onUpdate,onOpenTraining,onShowTraining,onFixNumbering}:Props){
 const ar=language==='ar';
 const L=(a:string,b:string)=>ar?a:b;
 const [query,setQuery]=useState('');
 const [showOther,setShowOther]=useState(true);
 const [selected,setSelected]=useState<number|null>(null);
 const [tab,setTab]=useState<'profile'|'card'>('profile');
 const [edit,setEdit]=useState(false);
 const [working,setWorking]=useState(false);
 const [fixingNumbers,setFixingNumbers]=useState(false);
 const [numberMessage,setNumberMessage]=useState('');
 const [message,setMessage]=useState('');
 const [form,setForm]=useState<Update>({});
 const canonical=useMemo(()=>[...rows].filter(x=>x.pdf_position!=null).sort((a,b)=>(a.pdf_position||0)-(b.pdf_position||0)),[rows]);
 const extras=useMemo(()=>[...rows].filter(x=>x.pdf_position==null&&x.bag).sort((a,b)=>a.id-b.id),[rows]);
 // Display positions belong to the visible roster order, never to database IDs.
 // Historic PDF import numbers such as 199/200/201 must display as 100/101/102.
 const fullRoster=[...canonical,...extras];
 const rankById=new Map(fullRoster.map((x,i)=>[x.id,i+1]));
 const roster=showOther?fullRoster:canonical;
 const positionFor=(x:RosterDriver)=>rankById.get(x.id)??0;
 // Supplementary recipient rows carry database IDs such as 199–201.
 // Store their sequential display position in pdf_position, without ever
 // changing the immutable primary key or historical rider reference.
 const corrections:NumberCorrection[]=extras.map((row,index)=>({id:row.id,previous:null,position:canonical.length+index+1}));
 const fixNumbering=async()=>{
  if(!editable||!onFixNumbering||fixingNumbers||!corrections.length)return;
  setFixingNumbers(true);setNumberMessage('');
  try{await onFixNumbering(corrections);setNumberMessage(L('حُفظت أرقام السائقين الإضافيين دون تغيير معرّفاتهم.','Numéros des livreurs supplémentaires enregistrés, identifiants inchangés.'));}
  catch(error){setNumberMessage(error instanceof Error?error.message:L('تعذر حفظ الترقيم.','Erreur de numérotation.'));}
  finally{setFixingNumbers(false);}
 };
 const filtered=roster.filter(x=>[x.name,x.phone,x.pdf_source_phone,x.presto_reference,x.license_plate,positionFor(x)].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
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
  const body=filtered.map((d,i)=>[String(positionFor(d)),d.name,d.presto_reference||'',d.pdf_source_phone||d.phone,d.license_plate||'',d.bag?'نعم':'لا',d.shirt?'نعم':'لا',d.training_completed===true?'نعم':d.training_completed===false?'لا':'غير مسجل',dateDisplay(d.pdf_source_date||d.delivery_date)]);
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
   {onShowTraining&&<button className={styles.chip} type="button" onClick={onShowTraining}><GraduationCap size={17}/>{L('عرض سجل المتدربين','Registre des formations')}</button>}
   {editable&&onFixNumbering&&corrections.length>0&&<button className={styles.chip} disabled={fixingNumbers} type="button" onClick={()=>void fixNumbering()}><Check size={17}/>{fixingNumbers?L('جار حفظ الترتيب...','Mise à jour...'):L('حفظ الترقيم حتى '+fullRoster.length,'Enregistrer les numéros jusqu’à '+fullRoster.length)}</button>}
  </div>
  {numberMessage&&<p className={styles.numberNotice} role="status">{numberMessage}</p>}
  {onOpenTraining&&<div className={styles.trainingInvite} role="region" aria-label={L('تسجيل المتدربين','Enregistrer des participants')}>
   <span className={styles.trainingIcon}><GraduationCap size={25}/></span>
   <div><strong>{L('التدريب مرتبط بملف كل سائق','Formation reliée au dossier livreur')}</strong><p>{L('أضف المتدربين وسجّل تاريخ التدريب والتطبيق والنتيجة. ينعكس إكمال التدريب على ملف السائق المطابق.','Enregistrez les participants, la date et le résultat. La formation terminée sera liée au livreur correspondant.')}</p></div>
   {editable&&<button type="button" className={styles.trainingAdd} onClick={()=>onOpenTraining()}><Plus size={18}/>{L('إضافة متدرب','Ajouter un participant')}</button>}
  </div>}
  <div className={styles.tableScroller}>
   <table className={styles.table}>
    <thead><tr><th>#</th><th>{L('السائق','Livreur')}</th><th>{L('الهاتف','Téléphone')}</th><th>{L('اللوحة','Plaque')}</th><th>{L('الحقيبة','Sac')}</th><th>{L('القميص','Chemise')}</th><th>{L('التكوين','Formation')}</th><th>{L('سلم في','Date')}</th></tr></thead>
    <tbody>{filtered.map((d,i)=><tr key={d.id} onClick={()=>viewPerson(d)} tabIndex={0} role="button" onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();viewPerson(d);}}} aria-label={L('افتح ملف السائق','Ouvrir la fiche du livreur')+' '+d.name}>
      <td className={styles.serial}>{positionFor(d)}</td>
      <td className={styles.driverName}><div className={styles.nameCell}><img src="/images/presto-uniform-rider.webp" alt="" loading="lazy"/><span><strong>{d.name}</strong><small>#{present(d.presto_reference)}</small></span></div></td>
      <td className={styles.phone} dir="ltr">{d.pdf_source_phone||d.phone}</td>
      <td>{d.license_plate?<span className={styles.plate} dir="ltr">{d.license_plate}<span className={styles.plateFlag}>◉</span></span>:<span className={styles.dash}>—</span>}</td>
      <td>{badge(d.bag)}</td><td>{badge(d.shirt)}</td><td>{badge(d.training_completed)}</td>
      <td className={styles.date} dir="ltr">{dateDisplay(d.pdf_source_date||d.delivery_date)}</td>
     </tr>)}</tbody>
   </table>
   {!filtered.length&&<p className={styles.noResults}>{L('لا توجد نتائج مطابقة.','Aucun résultat.')}</p>}
  </div>
  <div className={styles.mobileCards}>
   {filtered.map(d=><button type="button" key={d.id} className={styles.mobileCard} onClick={()=>viewPerson(d)}>
    <span className={styles.mobileTop}><span className={styles.mobileNumber}>#{positionFor(d)}</span><span className={styles.mobileAvatar}><img src="/images/presto-uniform-rider.webp" alt="" loading="lazy"/></span><span className={styles.mobileIdentity}><strong>{d.name}</strong><small>PRESTO #{present(d.presto_reference)}</small></span><ArrowLeft size={18}/></span>
    <span className={styles.mobileMeta}><span><Phone size={13}/><bdi>{d.pdf_source_phone||d.phone}</bdi></span><span><IdCard size={13}/><bdi>{present(d.license_plate)}</bdi></span></span>
    <span className={styles.mobileStatus}><span><PackageCheck size={15}/>{L('الحقيبة','Sac')}{badge(d.bag)}</span><span><Shirt size={15}/>{L('القميص','Chemise')}{badge(d.shirt)}</span><span><GraduationCap size={15}/>{L('التدريب','Formation')}{badge(d.training_completed)}</span></span>
   </button>)}
   {!filtered.length&&<p className={styles.noResults}>{L('لا توجد نتائج مطابقة.','Aucun résultat.')}</p>}
  </div>
  <div className={styles.foot}><span>بريستو موريتانيا · {L('للاستخدام الداخلي','Usage interne')}</span><span>{L('المرجع: القائمة المرفقة بتاريخ 6 نوفمبر 2026','Référence : document du 6 novembre 2026')} · {filtered.length} / {roster.length}</span></div>
  {person&&<div className={styles.overlay} onMouseDown={e=>{if(e.target===e.currentTarget&&!working)setSelected(null)}}><div className={styles.modal} role="dialog" aria-modal="true" aria-label={L('ملف السائق','Dossier livreur')}>
    <div className={styles.modalHead}><div className={styles.modalHeadline}><span className={styles.overline}>PRESTO · #{present(person.presto_reference)}</span><h2>{L('الملف الشخصي للسائق','Profil du livreur')}</h2></div><button className={styles.iconButton} onClick={()=>setSelected(null)} aria-label={L('إغلاق','Fermer')}><X size={21}/></button></div>
    <div className={styles.hero}><div className={styles.avatar}><img src="/images/presto-uniform-rider.webp" alt={person.name} style={{objectPosition:'center 17%'}}/></div><div><small>{L('سائق PRESTO','Livreur PRESTO')}</small><h3>{person.name}</h3><span><IdCard size={14}/> #{present(person.presto_reference)} · {L('رقم في القائمة','Rang')} {positionFor(person)}</span></div><div className={styles.heroLogo}><img src="/logos/presto.webp" alt="PRESTO"/></div></div>
    <div className={styles.tabs} role="tablist" aria-label={L('أقسام ملف السائق','Sections du dossier')}><button type="button" role="tab" aria-selected={tab==='profile'} className={tab==='profile'?styles.active:''} onClick={()=>setTab('profile')}><FileText size={16}/>{L('الملف الكامل','Dossier')}</button><button type="button" role="tab" aria-selected={tab==='card'} className={tab==='card'?styles.active:''} onClick={()=>setTab('card')}><IdCard size={16}/>{L('بطاقة السائق','Carte du livreur')}</button></div>
    {message&&<p role="status" className={styles.notice}>{message}</p>}
    {tab==='profile'?<div className={styles.modalContent}>
     <div className={styles.detailGrid}>
      <div><Phone size={17}/><small>{L('رقم الهاتف','Téléphone')}</small><strong dir="ltr">{person.pdf_source_phone||person.phone}</strong></div>
      <div><IdCard size={17}/><small>{L('رقم اللوحة','Immatriculation')}</small><strong dir="ltr">{present(person.license_plate)}</strong></div>
      <div><CalendarDays size={17}/><small>{L('تاريخ التسليم','Date de remise')}</small><strong dir="ltr">{dateDisplay(person.pdf_source_date||person.delivery_date)}</strong></div>
      <div><GraduationCap size={17}/><small>{L('التكوين','Formation')}</small><strong>{person.training_completed===true?L('مكتمل','Terminée'):person.training_completed===false?L('غير مكتمل','Non terminée'):L('غير مسجل','Non renseigné')}</strong></div>
      {person.latest_training_date&&<div><CalendarDays size={17}/><small>{L('آخر تاريخ تدريب','Dernière formation')}</small><strong dir="ltr">{dateDisplay(person.latest_training_date)}</strong></div>}
      <div><MapPin size={17}/><small>{L('المدينة','Ville')}</small><strong>{present(person.city)}</strong></div>
      <div><ClipboardCheck size={17}/><small>{L('كود التطبيق','Code application')}</small><strong>{present(person.app_code)}</strong></div>
     </div>
     <div className={styles.statusLine}><div><PackageCheck size={23}/><b>{L('الحقيبة','Sac')}</b>{badge(person.bag)}</div><div><Shirt size={23}/><b>{L('القميص','Chemise')}</b>{badge(person.shirt)}</div><div><GraduationCap size={23}/><b>{L('التكوين','Formation')}</b>{badge(person.training_completed)}</div></div>
     {person.observations&&<p className={styles.notes}>{person.observations}</p>}
     {editable&&edit&&<div className={styles.editor}>
      <label>{L('اللوحة','Plaque')}<input value={form.license_plate||''} onChange={e=>setForm({...form,license_plate:e.target.value})} maxLength={30}/></label>
      <label>{L('رقم السائق','N° livreur')}<input value={form.presto_reference||''} onChange={e=>setForm({...form,presto_reference:e.target.value})} maxLength={32}/></label>
      <label>{L('تاريخ التسليم','Date de remise')}<input type="date" value={form.delivery_date||''} onChange={e=>setForm({...form,delivery_date:e.target.value})}/></label>
      <div className={styles.trainingEditTip}><GraduationCap size={17}/><span>{L('تحديث حالة التدريب يتم عبر سجل المتدربين المرتبط بهذا السائق.','La formation se met à jour depuis le registre des participants relié à ce livreur.')}</span></div>
      <label className={styles.checkBox}><input type="checkbox" checked={Boolean(form.bag)} onChange={e=>setForm({...form,bag:e.target.checked})}/>{L('استلم الحقيبة','Sac remis')}</label>
      <label className={styles.checkBox}><input type="checkbox" checked={Boolean(form.shirt)} onChange={e=>setForm({...form,shirt:e.target.checked})}/>{L('استلم القميص','Chemise remise')}</label>
     </div>}
     <div className={styles.profileButtons}>{onOpenTraining&&editable&&<button className={styles.secondary} type="button" onClick={()=>{setSelected(null);onOpenTraining(person);}}><GraduationCap size={17}/>{L('تسجيل تدريب السائق','Enregistrer sa formation')}</button>}{editable&&(edit?<><button className={styles.secondary} disabled={working} onClick={()=>setEdit(false)}>{L('إلغاء','Annuler')}</button><button className={styles.primary} disabled={working} onClick={()=>void save()}>{working?L('جار الحفظ...','Enregistrement...'):L('حفظ التعديلات','Enregistrer')}</button></>:<button className={styles.secondary} onClick={()=>editPerson(person)}><Pencil size={16}/>{L('تعديل البيانات','Modifier')}</button>)}<button className={styles.primary} onClick={()=>setTab('card')}><IdCard size={17}/>{L('عرض البطاقة','Voir la carte')}</button></div>
    </div>:<div className={styles.cardView}>
      <div className={styles.printCard}>
       <div className={styles.cardTop}><img src="/logos/presto.webp" alt="PRESTO"/><span>PRESTO · <b>{L('بطاقة تعريف السائق','CARTE LIVREUR')}</b></span><strong className={styles.cardRank}>N° {positionFor(person)}</strong></div>
       <div className={styles.cardBody}><div className={styles.cardPhoto}><img src="/images/presto-uniform-rider.webp" alt={person.name} style={{objectPosition:'center 17%'}}/></div><div><small>{L('الاسم الكامل','Nom complet')}</small><h3>{person.name}</h3><span>#{present(person.presto_reference)}</span><p><Phone size={14}/> <bdi>{person.pdf_source_phone||person.phone}</bdi></p><p><IdCard size={14}/> <bdi>{present(person.license_plate)}</bdi></p></div></div>
       <div className={styles.cardBottom}><span data-state={person.bag?'yes':'no'}>{person.bag?<Check size={17}/>:<X size={17}/>} {L('الحقيبة','Sac')} {person.bag?'✓':'—'}</span><span data-state={person.shirt?'yes':'no'}>{person.shirt?<Check size={17}/>:<X size={17}/>} {L('القميص','Chemise')} {person.shirt?'✓':'—'}</span><span data-state={person.training_completed===true?'yes':'no'}><GraduationCap size={17}/> {L('التكوين','Formation')} {person.training_completed===true?'✓':'—'}</span></div>
       <footer><span>PRESTO · MAURITANIE</span><b>{L('سجل رقم','N° dossier')} {positionFor(person)} · #{present(person.presto_reference)}</b></footer>
      </div>
      <p className={styles.printHint}>{L('لطباعة البطاقة أو تنزيلها بصيغة PDF، اضغط الزر أدناه واختر «حفظ بتنسيق PDF» من خيارات الطباعة.','Pour télécharger la carte en PDF, cliquez ci-dessous et choisissez « Enregistrer en PDF » dans la fenêtre d’impression.')}</p>
      <div className={styles.profileButtons}><button className={styles.secondary} onClick={()=>setTab('profile')}><ArrowRight size={17}/>{L('العودة للملف','Retour au profil')}</button><button className={styles.primary} onClick={()=>window.print()}><Printer size={17}/>{L('طباعة / حفظ PDF','Imprimer / enregistrer PDF')}</button></div>
     </div>}
   </div></div>}
 </section>;
}

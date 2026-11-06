'use client';

import {useRef,useState,type ChangeEvent} from 'react';
import {AlertTriangle,CheckCircle2,FileText,Upload,X} from 'lucide-react';
import {extractPrestoPdf,type PdfRecord,type PdfPreview} from '../lib/presto-pdf';
import {useLanguage} from './presto-language';
import styles from './presto-pdf-importer.module.css';

type ImportResult={added:number;updated:number;skipped:number;googleSheets?:string};
type Props={
 disabled?:boolean;
 onImport:(records:PdfRecord[],mode:'add'|'merge')=>Promise<ImportResult>;
};
const money=['bankily','masrvi','sedad','click'] as const;
export default function PrestoPdfImporter({disabled=false,onImport}:Props){
 const {language}=useLanguage();
 const ar=language==='ar';
 const L=(arabic:string,french:string)=>ar?arabic:french;
 const picker=useRef<HTMLInputElement>(null);
 const [open,setOpen]=useState(false);
 const [fileName,setFileName]=useState('');
 const [preview,setPreview]=useState<PdfPreview|null>(null);
 const [records,setRecords]=useState<PdfRecord[]>([]);
 const [mode,setMode]=useState<'add'|'merge'>('add');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [result,setResult]=useState<ImportResult|null>(null);
 const [visible,setVisible]=useState(20);
 const patch=(index:number,partial:Partial<PdfRecord>)=>
  setRecords(old=>old.map((r,i)=>i===index?{...r,...partial}:r));
 const choose=async(event:ChangeEvent<HTMLInputElement>)=>{
  const file=event.target.files?.[0];
  event.target.value='';
  if(!file)return;
  setOpen(true);setPreview(null);setRecords([]);setResult(null);setError('');
  setFileName(file.name);setBusy(true);setVisible(20);
  try{
   const data=await extractPrestoPdf(file);
   setPreview(data);setRecords(data.records);
  }catch(e){setError(e instanceof Error?e.message:L('تعذرت قراءة الملف.','Lecture du document impossible.'));}
  finally{setBusy(false);}
 };
 const commit=async()=>{
  if(!records.length||busy||result)return;
  const invalid=records.find(r=>!r.name.trim()||(r.destination==='training'&&(!r.phone.trim()||!r.training_date)));
  if(invalid){setError(L('راجع الاسم والهاتف وتاريخ التدريب في السجلات قبل الحفظ.','Corrigez les noms, téléphones et dates de formation avant de valider.'));return;}
  setBusy(true);setError('');
  try{
   const saved=await onImport(records,mode);
   setResult(saved);
  }catch(e){setError(e instanceof Error?e.message:L('تعذر الحفظ.','Enregistrement impossible.'));}
  finally{setBusy(false);}
 };
 const driverCount=records.filter(r=>r.destination==='drivers').length;
 const trainingCount=records.filter(r=>r.destination==='training').length;
 return <>
  <input ref={picker} className={styles.hidden} type="file" accept=".pdf,application/pdf" onChange={e=>void choose(e)} aria-label={L('اختيار ملف PDF','Choisir un fichier PDF')}/>
  <button className="secondary excelImportButton" type="button" disabled={disabled||busy} onClick={()=>picker.current?.click()}>
   <FileText size={17}/>{L('استيراد PDF','Importer PDF')}
  </button>
  {open&&<div className={styles.overlay} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setOpen(false)}}>
   <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="pdf-import-title" dir={ar?'rtl':'ltr'}>
    <header className={styles.header}>
     <div><span className={styles.eyebrow}>PRESTO · PDF</span><h2 id="pdf-import-title"><FileText size={22}/>{L('استيراد بيانات PDF الذكي','Importation intelligente PDF')}</h2><p>{fileName}</p></div>
     <button type="button" onClick={()=>setOpen(false)} disabled={busy} className={styles.close} aria-label={L('إغلاق','Fermer')}><X size={20}/></button>
    </header>
    <div className={styles.body}>
     {busy&&!result&&<p role="status" className={styles.notice}>{L('جارٍ معالجة البيانات أو حفظها...','Lecture ou enregistrement en cours...')}</p>}
     {preview&&<div className={styles.metrics}>
      <div><strong>{preview.pages}</strong><span>{L('الصفحات','Pages')}</span></div>
      <div><strong>{driverCount}</strong><span>{L('سجلات السائقين','Livreurs')}</span></div>
      <div><strong>{trainingCount}</strong><span>{L('سجلات التدريب','Formations')}</span></div>
     </div>}
     <p className={styles.tip}>{L('تُقرأ ملفات PDF النصية داخل جهازك دون رفع الملف الأصلي. راجع النتائج ثم اختر الحفظ. المستندات الممسوحة ضوئيًا تحتاج OCR.','Le PDF texte est lu sur votre appareil, sans envoyer le document original. Vérifiez les champs avant validation. Les scans nécessitent un OCR.')}</p>
     {preview?.warnings.map((w,i)=><div key={i} className={styles.warning}><AlertTriangle size={17}/>{w}</div>)}
     {records.length>0&&<>
      <div className={styles.mode}>
       <label><input name="pdf-import-mode" type="radio" checked={mode==='add'} onChange={()=>setMode('add')}/>{L('إضافة السجلات الجديدة فقط دون تغيير القديمة','Ajouter uniquement les nouvelles fiches')}</label>
       <label><input name="pdf-import-mode" type="radio" checked={mode==='merge'} onChange={()=>setMode('merge')}/>{L('إضافة الجدد وتحديث الحقول الموجودة في الملف فقط','Ajouter et mettre à jour uniquement les champs présents dans le PDF')}</label>
      </div>
      <div className={styles.sectionHead}><h3>{L('مراجعة المعلومات قبل التسجيل','Vérifier avant d’enregistrer')}</h3><span>{records.length} {L('سجل','fiches')}</span></div>
      <div className={styles.cards}>
       {records.slice(0,visible).map((record,i)=><article className={styles.record} key={i}>
        <div className={styles.recordHead}><strong>{String(i+1).padStart(2,'0')} · {record.name||L('بدون اسم','Sans nom')}</strong>
         <select value={record.destination} onChange={e=>patch(i,{destination:e.target.value as PdfRecord['destination']})} aria-label={L('القسم','Destination')}>
          <option value="drivers">{L('السائقون والمركبات والمعدات','Livreurs, véhicules et équipements')}</option>
          <option value="training">{L('سجل التدريب','Formations')}</option>
         </select>
        </div>
        <div className={styles.fields}>
         <label>{L('الاسم','Nom')}<input value={record.name} maxLength={100} onChange={e=>patch(i,{name:e.target.value})}/></label>
         <label>{L('الهاتف','Téléphone')}<input dir="ltr" value={record.phone} maxLength={30} onChange={e=>patch(i,{phone:e.target.value})}/></label>
         <label>{L('المدينة','Ville')}<input value={record.city??''} maxLength={90} onChange={e=>patch(i,{city:e.target.value})}/></label>
         {record.destination==='training'?<>
          <label>{L('تاريخ التدريب','Date de formation')}<input type="date" value={record.training_date??''} onChange={e=>patch(i,{training_date:e.target.value})}/></label>
          <label>{L('المدرب','Formateur')}<input value={record.trainer??''} maxLength={100} onChange={e=>patch(i,{trainer:e.target.value})}/></label>
          <label>{L('مكان التدريب','Lieu de formation')}<input value={record.training_location??''} maxLength={120} onChange={e=>patch(i,{training_location:e.target.value})}/></label>
          <label>{L('الحالة','Statut')}<select value={record.training_status??'completed'} onChange={e=>patch(i,{training_status:e.target.value as PdfRecord['training_status']})}>
           <option value="completed">{L('مكتمل','Terminé')}</option>
           <option value="in_progress">{L('قيد التدريب','En cours')}</option>
           <option value="needs_review">{L('تحتاج مراجعة','À revoir')}</option>
          </select></label>
         </>:<>
          <label>{L('نوع المركبة','Type de véhicule')}<input value={record.vehicle_type??''} maxLength={80} onChange={e=>patch(i,{vehicle_type:e.target.value})}/></label>
          <label>{L('كود التطبيق','Code application')}<input value={record.app_code??''} maxLength={80} onChange={e=>patch(i,{app_code:e.target.value})}/></label>
          <label>{L('تاريخ التسليم','Date de remise')}<input value={record.delivery_date??''} maxLength={30} onChange={e=>patch(i,{delivery_date:e.target.value})}/></label>
          <div className={styles.checks}>{([
           ['bag',L('الحقيبة','Sac')],['shirt',L('القميص','Chemise')],['verified',L('الملف','Dossier')]
          ] as const).map(([key,label])=><label key={key}><input type="checkbox" checked={record[key]===true} onChange={e=>patch(i,{[key]:e.target.checked})}/>{label}</label>)}</div>
          {money.map(method=><label key={method}>{method.toUpperCase()}<input value={record[(method+'_account') as 'bankily_account']??''} maxLength={80} onChange={e=>patch(i,{[method+'_account']:e.target.value,[method]:Boolean(e.target.value)})}/></label>)}
         </>}
        </div>
       </article>)}
      </div>
      {records.length>visible&&<button className={styles.more} onClick={()=>setVisible(x=>Math.min(x+20,records.length))}>{L('عرض المزيد','Afficher davantage')} ({records.length-visible})</button>}
     </>}
     {error&&<div role="alert" className={styles.error}>{error}</div>}
     {result&&<div role="status" className={styles.success}><CheckCircle2 size={19}/>{L('تم الحفظ في سجلات PRESTO: ','Enregistrement PRESTO terminé : ')}{result.added} {L('إضافة،','ajoutées,')} {result.updated} {L('تحديث،','mises à jour,')} {result.skipped} {L('متجاوزة','ignorées')}.</div>}
     {result?.googleSheets==='error'&&<div className={styles.warning}>{L('حُفظت السجلات، لكن مزامنة Google Sheets لم تكتمل.','Données enregistrées, mais Google Sheets non synchronisé.')}</div>}
     {records.length>0&&!result&&<p className={styles.privacy}><AlertTriangle size={16}/>{L('قد تظهر بيانات السائقين في الموقع المشترك. لا تستورد ملفات تحتوي معلومات حساسة لا تريد مشاركتها.','Les données des livreurs peuvent être visibles dans le site partagé. N’importez pas d’informations sensibles non destinées au partage.')}</p>}
    </div>
    <footer className={styles.footer}><button className="secondary" disabled={busy} onClick={()=>setOpen(false)}>{L('إغلاق','Fermer')}</button>
     <button className="primary" disabled={busy||records.length===0||Boolean(result)} onClick={()=>void commit()}><Upload size={17}/>{L('حفظ','Enregistrer')} {records.length} {L('سجلًا','fiches')}</button>
    </footer>
   </section>
  </div>}
 </>;
}

'use client';
import {useMemo,useState} from 'react';
import {Download,FileSpreadsheet,X,Users,ArrowDownUp,UserRound,CheckCircle2,Info} from 'lucide-react';
import {useLanguage} from './presto-language';
export type ExcelExportScope='all'|'range'|'single';
type DriverChoice={id:number;name:string};
type Props={
 drivers:DriverChoice[];busy?:boolean;variant?:'compact'|'wide';
 onExport:(ids:number[]|null,scope:ExcelExportScope,filenameSuffix:string)=>Promise<void>;
};
export default function ExcelExportDialog({drivers,busy=false,variant='compact',onExport}:Props){
 const {language}=useLanguage();
 const ar=language==='ar';
 const [open,setOpen]=useState(false);
 const [scope,setScope]=useState<ExcelExportScope>('all');
 const [from,setFrom]=useState('');
 const [to,setTo]=useState('');
 const [selected,setSelected]=useState('');
 const [error,setError]=useState('');
 const sorted=useMemo(()=>[...drivers].sort((a,b)=>a.id-b.id),[drivers]);
 const min=sorted[0]?.id??1,max=sorted[sorted.length-1]?.id??1;
 const first=from.trim()===''?min:Number(from);
 const last=to.trim()===''?max:Number(to);
 const isNumber=(n:number)=>Number.isSafeInteger(n)&&n>0;
 const rangeValid=isNumber(first)&&isNumber(last);
 const chosenId=selected?Number(selected):min;
 const picked=useMemo(()=>{
  if(scope==='all')return sorted;
  if(scope==='single')return sorted.filter(d=>d.id===chosenId);
  if(!rangeValid)return [];
  const low=Math.min(first,last),high=Math.max(first,last);
  const list=sorted.filter(d=>d.id>=low&&d.id<=high);
  return first<=last?list:list.reverse();
 },[sorted,scope,first,last,chosenId,rangeValid]);
 const canExport=scope==='all'||(scope==='single'?picked.length===1:rangeValid&&picked.length>0);
 const summary=scope==='all'?(ar?'كل السائقين المسجلين':'Tous les livreurs enregistrés'):scope==='single'?(picked[0]?.name||'—'):(ar?'من '+first+' إلى '+last+'، شاملًا الرقمين':'Du N° '+first+' au N° '+last+', bornes incluses');
 const confirm=async()=>{
  if(busy)return;
  if(!canExport){setError(ar?'لم يتم العثور على سائق مطابق للاختيار.':'Aucun livreur ne correspond à cette sélection.');return}
  setError('');
  const ids=scope==='all'?null:picked.map(d=>d.id);
  const suffix=scope==='range'?String(first)+'-a-'+String(last):scope==='single'?String(chosenId):'';
  try{await onExport(ids,scope,suffix);setOpen(false)}
  catch(e){setError(e instanceof Error?e.message:(ar?'تعذّر إنشاء ملف Excel.':'Impossible de créer le classeur Excel.'))}
 };
 return <>
  <button type="button" className={'excelExportTrigger '+(variant==='wide'?'excelExportWide':'')} disabled={busy} onClick={()=>{setError('');setOpen(true)}}><Download size={17}/>{busy?(ar?'جارٍ تجهيز Excel...':'Génération Excel...'):(ar?'تنزيل Excel':'Exporter Excel')}</button>
  {open&&<div className="excelExportOverlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setOpen(false)}}>
   <section className="excelExportDialog" role="dialog" aria-modal="true" aria-label={ar?'خيارات تنزيل Excel':'Options export Excel'} dir={ar?'rtl':'ltr'}>
    <div className="excelExportHeader">
     <span className="excelExportIcon"><FileSpreadsheet size={25}/></span>
     <div><h2>{ar?'تنزيل سجل السائقين':'Exporter les livreurs vers Excel'}</h2><p>{ar?'اختر السائقين الذين تريد إدراجهم في الملف.':'Choisissez les livreurs à inclure dans le fichier.'}</p></div>
     <button className="excelExportClose" onClick={()=>setOpen(false)} disabled={busy} aria-label={ar?'إغلاق':'Fermer'}><X size={21}/></button>
    </div>
    <div className="excelExportBody">
     <div className="excelExportChoices">
      <button type="button" onClick={()=>{setScope('all');setError('')}} className={'excelExportChoice '+(scope==='all'?'active':'')} aria-pressed={scope==='all'}><Users size={21}/><strong>{ar?'الملف كاملًا':'Tout le registre'}</strong><small>{ar?'جميع السائقين':'Tous les livreurs'}</small><span className="excelExportRadio"/></button>
      <button type="button" onClick={()=>{setScope('range');setError('')}} className={'excelExportChoice '+(scope==='range'?'active':'')} aria-pressed={scope==='range'}><ArrowDownUp size={21}/><strong>{ar?'مجموعة بالأرقام':'Plage de numéros'}</strong><small>{ar?'مثل 37 إلى 14':'Par ex. de 37 à 14'}</small><span className="excelExportRadio"/></button>
      <button type="button" onClick={()=>{setScope('single');setError('')}} className={'excelExportChoice '+(scope==='single'?'active':'')} aria-pressed={scope==='single'}><UserRound size={21}/><strong>{ar?'سائق واحد':'Un seul livreur'}</strong><small>{ar?'ملف شخص محدد':'Fiche individuelle'}</small><span className="excelExportRadio"/></button>
     </div>
     {scope==='range'&&<div className="excelExportInputs">
      <label>{ar?'من رقم':'Du numéro'}<input type="number" inputMode="numeric" min="1" step="1" value={from} placeholder={String(min)} onChange={e=>setFrom(e.target.value)}/></label>
      <span className="excelExportDash">⇄</span>
      <label>{ar?'إلى رقم':'Au numéro'}<input type="number" inputMode="numeric" min="1" step="1" value={to} placeholder={String(max)} onChange={e=>setTo(e.target.value)}/></label>
      <p className="excelExportHint"><Info size={15}/>{ar?'تُحتسب الأرقام الأولى والأخيرة، ويحافظ الملف على الترتيب الذي حددته.':'Les deux numéros sont inclus et l’ordre demandé est respecté.'}</p>
     </div>}
     {scope==='single'&&<label className="excelExportSingle">{ar?'اختر السائق من القائمة':'Sélectionnez un livreur'}
      <select value={String(chosenId)} disabled={!sorted.length} onChange={e=>setSelected(e.target.value)}>
       {sorted.map(d=><option key={d.id} value={d.id}>{String(d.id).padStart(2,'0')} — {d.name}</option>)}
       {!sorted.length&&<option value="">{ar?'لم يتم تسجيل سائقين':'Aucun livreur enregistré'}</option>}
      </select>
     </label>}
     <div className="excelExportPreview">
      <span className="excelExportPreviewBadge"><CheckCircle2 size={18}/>{picked.length}</span>
      <div><strong>{ar?'عدد السائقين في الملف':'Livreurs dans le fichier'}</strong><p>{summary}</p></div>
     </div>
     <div className="excelExportDesignInfo"><FileSpreadsheet size={18}/><p>{ar?'سيحتفظ التنزيل بنفس تصميم PRESTO: ورقة التسليم وورقة الملخص اليومي، والألوان والشعار والعدادات.':'Même modèle PRESTO : feuille de remise et synthèse par jour, avec logo, couleurs et indicateurs adaptés à la sélection.'}</p></div>
     {error&&<p className="excelExportError" role="alert">{error}</p>}
    </div>
    <div className="excelExportFooter"><button className="excelExportCancel" onClick={()=>setOpen(false)} disabled={busy}>{ar?'إلغاء':'Annuler'}</button>
     <button className="excelExportDownload" disabled={busy||!canExport} onClick={()=>void confirm()}><Download size={17}/>{busy?(ar?'جارٍ الإنشاء...':'Génération...'):(ar?'تنزيل ('+picked.length+')':'Télécharger ('+picked.length+')')}</button>
    </div>
   </section>
  </div>}
 </>;
}

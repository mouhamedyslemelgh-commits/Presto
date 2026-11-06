'use client';
import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import {prestoCloud} from '../lib/presto-cloud';
import {Award,CalendarDays,Camera,CheckCircle2,ClipboardList,Download,Edit3,Image as ImageIcon,MapPin,Phone,Plus,Search,Trash2,UserRound,Users,X} from 'lucide-react';
import styles from './presto-training-records.module.css';

type Status='completed'|'in_progress'|'needs_review';
type RecordRow={
 id:number;name:string;phone:string;city:string;photo_path:string;
 training_date:string;trainer:string;training_location:string;
 training_status:Status;app_type:string;notes:string;created_at:string;
};
type Draft=Omit<RecordRow,'id'|'created_at'>;
const blank=():Draft=>({
 name:'',phone:'',city:'',photo_path:'',training_date:new Date().toISOString().slice(0,10),
 trainer:'',training_location:'',training_status:'completed',app_type:'driver',notes:''
});
const isStatus=(value:string):value is Status=>['completed','in_progress','needs_review'].includes(value);
export default function PrestoTrainingRecords({language,editable=true}:{language:string;editable?:boolean}){
 const ar=language==='ar';
 const L=(a:string,f:string)=>ar?a:f;
 const [items,setItems]=useState<RecordRow[]>([]);
 const [photos,setPhotos]=useState<Record<string,string>>({});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [search,setSearch]=useState('');
 const [filter,setFilter]=useState<'all'|Status>('all');
 const [open,setOpen]=useState(false);
 const [selectedId,setSelectedId]=useState<number|null>(null);
 const [draft,setDraft]=useState<Draft>(blank);
 const [file,setFile]=useState<File|null>(null);
 const [preview,setPreview]=useState<string>('');
 const refresh=useCallback(async()=>{
  if(!prestoCloud){setError('PRESTO Supabase unavailable');setLoading(false);return;}
  const {data,error:loadError}=await prestoCloud.from('presto_training_records')
   .select('id,name,phone,city,photo_path,training_date,trainer,training_location,training_status,app_type,notes,created_at')
   .order('id',{ascending:false}).limit(1000);
  if(loadError){setError(loadError.code==='42P01'
   ?(ar?'يلزم تفعيل جدول سجل التدريب في قاعدة PRESTO.':'La table des formations doit être activée dans PRESTO.')
   :loadError.message);}
  else {setItems((data||[]) as RecordRow[]);setError('');}
  setLoading(false);
 },[ar]);
 useEffect(()=>{
  void refresh();
  const timer=setInterval(()=>{if(document.visibilityState==='visible')void refresh();},20000);
  return ()=>clearInterval(timer);
 },[refresh]);
 useEffect(()=>{
  if(!prestoCloud)return;
  let active=true;
  const paths=[...new Set(items.map(x=>x.photo_path).filter(Boolean))].filter(x=>!photos[x]);
  if(paths.length)void Promise.all(paths.map(async path=>{
   const {data}=await prestoCloud!.storage.from('presto-driver-photos').createSignedUrl(path,3600);
   return [path,data?.signedUrl||''] as const;
  })).then(entries=>{if(active)setPhotos(old=>({...old,...Object.fromEntries(entries.filter(x=>Boolean(x[1])))}));});
  return ()=>{active=false;};
 },[items,photos]);
 useEffect(()=>{
  if(!file){setPreview('');return;}
  const url=URL.createObjectURL(file);setPreview(url);
  return ()=>URL.revokeObjectURL(url);
 },[file]);
 const statusLabel=(s:Status)=>s==='completed'?L('أكمل التدريب','Formation terminée'):s==='in_progress'?L('قيد التدريب','En formation'):L('يحتاج مراجعة','À revoir');
 const filtered=useMemo(()=>items.filter(x=>(filter==='all'||x.training_status===filter)&&
  [x.name,x.phone,x.city,x.trainer,x.training_location,x.notes,String(x.id)].join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())),[items,filter,search]);
 const stats={total:items.length,completed:items.filter(x=>x.training_status==='completed').length,in_progress:items.filter(x=>x.training_status==='in_progress').length,needs_review:items.filter(x=>x.training_status==='needs_review').length};
 const metrics:[string,number,typeof Users][]=[[L('إجمالي المسجلين','Inscrits'),stats.total,Users],[L('أكملوا التدريب','Formations terminées'),stats.completed,CheckCircle2],[L('قيد التدريب','En formation'),stats.in_progress,ClipboardList],[L('تحتاج مراجعة','À revoir'),stats.needs_review,Award]];
 const edit=(row?:RecordRow)=>{
  setSelectedId(row?.id??null);setDraft(row?{name:row.name,phone:row.phone,city:row.city,photo_path:row.photo_path,training_date:row.training_date,trainer:row.trainer,training_location:row.training_location,training_status:row.training_status,app_type:row.app_type,notes:row.notes}:blank());
  setFile(null);setSuccess('');setError('');setOpen(true);
 };
 const save=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(!prestoCloud||!editable||saving)return;
  if(!draft.name.trim()||!draft.phone.trim()||!draft.training_date){setError(L('الاسم والهاتف وتاريخ التدريب مطلوبة.','Nom, téléphone et date sont obligatoires.'));return;}
  setSaving(true);setError('');setSuccess('');
  try{
   let photoPath=draft.photo_path;
   if(file){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error(L('الصورة يجب أن تكون JPG أو PNG أو WebP وأقل من 5MB.','Photo JPG, PNG ou WebP, maximum 5 Mo.'));
    const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    const key='training/'+crypto.randomUUID()+'.'+ext;
    const {error:uploadError}=await prestoCloud.storage.from('presto-driver-photos').upload(key,file,{contentType:file.type,upsert:false});
    if(uploadError)throw uploadError;
    photoPath=key;
   }
   const payload={...draft,name:draft.name.trim(),phone:draft.phone.trim(),city:draft.city.trim(),trainer:draft.trainer.trim(),training_location:draft.training_location.trim(),notes:draft.notes.trim(),photo_path:photoPath};
   const result=selectedId===null?await prestoCloud.from('presto_training_records').insert(payload):await prestoCloud.from('presto_training_records').update(payload).eq('id',selectedId);
   if(result.error)throw result.error;
   setOpen(false);setFile(null);setSuccess(L('حُفظ سجل التدريب بنجاح.','Fiche de formation enregistrée.'));
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:L('تعذر الحفظ.','Enregistrement impossible.'));}
  finally{setSaving(false);}
 };
 const remove=async(row:RecordRow)=>{
  if(!prestoCloud||!editable||!confirm(L('حذف سجل تدريب '+row.name+'؟','Supprimer la fiche de '+row.name+' ?')))return;
  const {error:delError}=await prestoCloud.from('presto_training_records').delete().eq('id',row.id);
  if(delError)setError(delError.message);else{setSuccess(L('تم حذف السجل.','Fiche supprimée.'));await refresh();}
 };
 const exportCSV=()=>{
  const headers=['N°','Nom / الاسم','Téléphone / الهاتف','Ville / المدينة','Date / التاريخ','Formateur / المدرب','Lieu / المكان','Application','Statut / الحالة','Notes / ملاحظات'];
  const rows=filtered.map((x,i)=>[i+1,x.name,x.phone,x.city,x.training_date,x.trainer,x.training_location,x.app_type,x.training_status,x.notes]);
  const quote=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';
  const csv='\uFEFF'+[headers,...rows].map(row=>row.map(quote).join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=url;a.download='PRESTO-training-records.csv';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <section className={styles.root} dir={ar?'rtl':'ltr'}>
  <div className={styles.intro}>
   <div><span className={styles.eyebrow}>PRESTO · {L('سجل التدريب','REGISTRE DES FORMATIONS')}</span><h2>{L('الأشخاص الذين تلقوا تدريب التطبيق','Personnes formées à l’application')}</h2><p>{L('سجل مستقل يوثّق حضور التدريب: الهوية، الصورة، الهاتف، التاريخ، المدرب، والحالة.','Un registre indépendant : identité, photo, téléphone, date, formateur et statut de la formation.')}</p></div>
   <div className={styles.actions}><button className={styles.outline} onClick={exportCSV} disabled={!filtered.length}><Download size={17}/>{L('تصدير Excel/CSV','Exporter CSV/Excel')}</button>{editable&&<button className={styles.add} onClick={()=>edit()}><Plus size={18}/>{L('إضافة متدرب','Ajouter une personne')}</button>}</div>
  </div>
  <div className={styles.stats}>
   {metrics.map(([label,count,Icon],i)=><div className={styles.metric} key={i}><span>{label as string}</span><strong>{count as number}</strong>{<Icon size={19}/>}</div>)}
  </div>
  <div className={styles.toolbar}><label className={styles.search}><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={L('بحث بالاسم أو الهاتف أو المدرب...','Rechercher nom, téléphone, formateur...')}/></label><select aria-label={L('تصفية حسب حالة التدريب','Filtrer par statut')} value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="all">{L('جميع الحالات','Tous les statuts')}</option><option value="completed">{statusLabel('completed')}</option><option value="in_progress">{statusLabel('in_progress')}</option><option value="needs_review">{statusLabel('needs_review')}</option></select><span>{filtered.length} / {items.length}</span></div>
  {error&&<p role="alert" className={styles.error}>{error}</p>}
  {success&&<p role="status" className={styles.success}>{success}</p>}
  {loading?<p className={styles.empty}>{L('جار تحميل السجلات...','Chargement des fiches...')}</p>:!filtered.length?<div className={styles.empty}><ClipboardList size={35}/><strong>{L('لا توجد سجلات تدريب حتى الآن','Aucune fiche de formation')}</strong><span>{L('أضف أول شخص بعد تدريبه على التطبيق.','Ajoutez une personne après sa formation.')}</span></div>:<div className={styles.cards}>{filtered.map((row,i)=><article className={styles.card} key={row.id}><div className={styles.cardTop}><div className={styles.picture}><img src="/images/presto-uniform-rider.webp" alt={row.name}/></div><div className={styles.person}><small>#{String(filtered.length-i).padStart(3,'0')}</small><h3>{row.name}</h3><a href={'tel:'+row.phone}><Phone size={14}/><bdi>{row.phone}</bdi></a></div><span className={styles.status} data-status={isStatus(row.training_status)?row.training_status:'needs_review'}>{statusLabel(row.training_status)}</span></div>
    <dl className={styles.details}><div><dt><CalendarDays size={15}/>{L('تاريخ التدريب','Date')}</dt><dd>{row.training_date||'—'}</dd></div><div><dt><MapPin size={15}/>{L('المدينة / المكان','Ville / lieu')}</dt><dd>{[row.city,row.training_location].filter(Boolean).join(' · ')||'—'}</dd></div><div><dt><UserRound size={15}/>{L('المدرب','Formateur')}</dt><dd>{row.trainer||'—'}</dd></div><div><dt><ClipboardList size={15}/>{L('التطبيق','Application')}</dt><dd>{row.app_type==='driver'?L('تطبيق السائق','Livreur'):row.app_type==='customer'?L('تطبيق الزبون','Client'):L('التطبيقان','Les deux')}</dd></div></dl>
    {row.notes&&<p className={styles.notes}>{row.notes}</p>}
    {editable&&<div className={styles.cardActions}><button onClick={()=>edit(row)}><Edit3 size={15}/>{L('تعديل','Modifier')}</button><button className={styles.danger} onClick={()=>void remove(row)}><Trash2 size={15}/>{L('حذف','Supprimer')}</button></div>}
   </article>)}</div>}
  {open&&<div className={styles.overlay} onMouseDown={e=>{if(e.target===e.currentTarget&&!saving)setOpen(false)}}><div className={styles.dialog} role="dialog" aria-modal="true" aria-label={L('بيانات المتدرب','Fiche du participant')}><div className={styles.dialogHeader}><div><span className={styles.eyebrow}>PRESTO · FORMATION</span><h2>{selectedId!==null?L('تعديل بيانات المتدرب','Modifier la fiche'):L('تسجيل متدرب جديد','Nouvelle fiche de formation')}</h2></div><button aria-label={L('إغلاق','Fermer')} onClick={()=>setOpen(false)} disabled={saving}><X size={22}/></button></div><form onSubmit={e=>void save(e)}><div className={styles.fields}>
    <label className={styles.photoPicker}><span>{L('صورة الشخص','Photo du participant')}</span><div className={styles.photoPreview}><img src={preview||'/images/presto-uniform-rider.webp'} alt=""/><Camera size={17}/></div><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>{L('صورة اختيارية، حتى 5 ميغابايت','Photo facultative, 5 Mo max.')}</small></label>
    <label>{L('الاسم الكامل *','Nom complet *')}<input required maxLength={100} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
    <label>{L('رقم الهاتف *','Téléphone *')}<input required type="tel" maxLength={30} dir="ltr" value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})}/></label>
    <label>{L('المدينة','Ville')}<input maxLength={100} value={draft.city} onChange={e=>setDraft({...draft,city:e.target.value})}/></label>
    <label>{L('تاريخ التدريب *','Date de formation *')}<input required type="date" value={draft.training_date} onChange={e=>setDraft({...draft,training_date:e.target.value})}/></label>
    <label>{L('اسم المدرب','Nom du formateur')}<input maxLength={100} value={draft.trainer} onChange={e=>setDraft({...draft,trainer:e.target.value})}/></label>
    <label>{L('مكان التدريب','Lieu de formation')}<input maxLength={120} value={draft.training_location} onChange={e=>setDraft({...draft,training_location:e.target.value})}/></label>
    <label>{L('التطبيق','Application')}<select value={draft.app_type} onChange={e=>setDraft({...draft,app_type:e.target.value})}><option value="driver">{L('تطبيق السائق','Application livreur')}</option><option value="customer">{L('تطبيق الزبون','Application client')}</option><option value="both">{L('التطبيقان','Les deux applications')}</option></select></label>
    <label>{L('نتيجة التدريب','Statut de formation')}<select value={draft.training_status} onChange={e=>setDraft({...draft,training_status:e.target.value as Status})}><option value="completed">{statusLabel('completed')}</option><option value="in_progress">{statusLabel('in_progress')}</option><option value="needs_review">{statusLabel('needs_review')}</option></select></label>
    <label className={styles.full}>{L('ملاحظات','Observations')}<textarea maxLength={1200} rows={3} value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label>
   </div>{error&&<p className={styles.error} role="alert">{error}</p>}<div className={styles.formActions}><button type="button" className={styles.outline} disabled={saving} onClick={()=>setOpen(false)}>{L('إلغاء','Annuler')}</button><button type="submit" className={styles.add} disabled={saving}>{saving?L('جار الحفظ...','Enregistrement...'):L('حفظ البيانات','Enregistrer')}</button></div></form></div></div>}
 </section>;
}

'use client';
import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import {prestoCloud} from '../lib/presto-cloud';
import {Award,CalendarDays,Camera,CheckCircle2,ClipboardList,Download,Edit3,MapPin,Phone,Plus,Search,Trash2,UserRound,Users,X,GraduationCap,Link2,Save,FileText,Check,Smartphone,ShieldCheck} from 'lucide-react';
import styles from './presto-training-records.module.css';

type Status='completed'|'in_progress'|'needs_review'|'not_trained';
type RecordRow={
 id:number;name:string;phone:string;city:string;photo_path:string;
 training_date:string|null;trainer:string;training_location:string;
 training_status:Status;app_type:string;notes:string;created_at:string;
};
type Draft=Omit<RecordRow,'id'|'created_at'|'training_date'> & {training_date:string};
const blank=():Draft=>({
 name:'',phone:'',city:'',photo_path:'',training_date:new Date().toISOString().slice(0,10),
 trainer:'',training_location:'',training_status:'completed',app_type:'driver',notes:''
});
const isStatus=(value:string):value is Status=>['completed','in_progress','needs_review','not_trained'].includes(value);
type LinkedDriver={id:number;name:string;phone:string;city?:string};
type Props={initialFilter?:Status;language:string;editable?:boolean;drivers?:LinkedDriver[];openRequest?:number;prefillDriver?:LinkedDriver|null;onSaved?:()=>void|Promise<void>};
const phoneDigits=(value:string)=>String(value||'').replace(/\D/g,'');
export default function PrestoTrainingRecords({initialFilter,language,editable=true,drivers=[],openRequest=0,prefillDriver=null,onSaved}:Props){
 const ar=language==='ar';
 const L=(a:string,f:string)=>ar?a:f;
 const [items,setItems]=useState<RecordRow[]>([]);
 const [photos,setPhotos]=useState<Record<string,string>>({});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [search,setSearch]=useState('');
 const [filter,setFilter]=useState<'all'|Status>(initialFilter||'all');
 const [open,setOpen]=useState(false);
 // Keep the underlying dashboard fixed while the registration form is open.
 useEffect(()=>{
  if(!open)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!saving)setOpen(false)};
  document.addEventListener('keydown',onEscape);
  return ()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',onEscape)};
 },[open,saving]);
 const [selectedId,setSelectedId]=useState<number|null>(null);
 const [draft,setDraft]=useState<Draft>(blank);
 const [file,setFile]=useState<File|null>(null);
 const [preview,setPreview]=useState<string>('');
 const [linkedDriverId,setLinkedDriverId]=useState<number|null>(null);
 const [driverSearch,setDriverSearch]=useState('');
 const linkedDriver=drivers.find(d=>d.id===linkedDriverId)||null;
 const autoMatched=drivers.filter(d=>phoneDigits(d.phone).length>=7&&phoneDigits(d.phone)===phoneDigits(draft.phone));
 const target=linkedDriver||(autoMatched.length===1?autoMatched[0]:null);
 const labelDriver=(d:LinkedDriver)=>d.name+' · '+d.phone;
 const driverOptions=drivers.filter(d=>d.name.trim()&&phoneDigits(d.phone).length>=7&&[d.name,d.phone].join(' ').toLocaleLowerCase().includes(driverSearch.trim().toLocaleLowerCase())).slice(0,180);
 if(linkedDriver&&!driverOptions.some(d=>d.id===linkedDriver.id))driverOptions.unshift(linkedDriver);
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
 const statusLabel=(s:Status)=>s==='completed'?L('أكمل التدريب','Formation terminée'):s==='in_progress'?L('قيد التدريب','En formation'):s==='not_trained'?L('لم يقم بالتكوين','Non formé'):L('يحتاج مراجعة','À revoir');
 const filtered=useMemo(()=>items.filter(x=>(filter==='all'||x.training_status===filter)&&
  [x.name,x.phone,x.city,x.training_location,x.notes,String(x.id)].join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())),[items,filter,search]);
 const stats={total:items.length,completed:items.filter(x=>x.training_status==='completed').length,in_progress:items.filter(x=>x.training_status==='in_progress').length,needs_review:items.filter(x=>x.training_status==='needs_review').length,not_trained:items.filter(x=>x.training_status==='not_trained').length};
 const metrics:[string,number,typeof Users][]=[[L('إجمالي المسجلين','Inscrits'),stats.total,Users],[L('أكملوا التدريب','Formations terminées'),stats.completed,CheckCircle2],[L('قيد التدريب','En formation'),stats.in_progress,ClipboardList],[L('لم يقوموا بالتكوين','Non formés'),stats.not_trained,GraduationCap]];
 const edit=(row?:RecordRow,initialStatus?:Status)=>{
  const values=row?{name:row.name,phone:row.phone,city:row.city,photo_path:row.photo_path,training_date:row.training_date||'',trainer:row.trainer,training_location:row.training_location,training_status:row.training_status,app_type:row.app_type,notes:row.notes}:{...blank(),training_status:initialStatus||'completed'};
  const matches=drivers.filter(d=>phoneDigits(d.phone).length>=7&&phoneDigits(d.phone)===phoneDigits(values.phone));
  setLinkedDriverId(matches.length===1?matches[0].id:null);
  setSelectedId(row?.id??null);setDraft(values);setDriverSearch('');
  setFile(null);setSuccess('');setError('');setOpen(true);
 };
 useEffect(()=>{
  if(openRequest<1)return;
  const source=prefillDriver;
  setSelectedId(null);
  setLinkedDriverId(source?.id??null);setDriverSearch('');
  setDraft({...blank(),name:source?.name||'',phone:source?.phone||'',city:source?.city||''});
  setFile(null);setSuccess('');setError('');setOpen(true);
 // openRequest only changes in response to explicit user input.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[openRequest]);
 const save=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(!prestoCloud||!editable||saving)return;
  if(!draft.name.trim()||!draft.phone.trim()||(draft.training_status!=='not_trained'&&!draft.training_date)){setError(L('الاسم والهاتف مطلوبان، وتاريخ التدريب مطلوب عند إجرائه.','Nom et téléphone obligatoires ; date requise pour une formation effectuée.'));return;}
  if(linkedDriver&&phoneDigits(linkedDriver.phone)!==phoneDigits(draft.phone)){
   setError(L('رقم الهاتف يختلف عن السائق المحدد. اختر السائق مرة أخرى أو صحّح الرقم.','Le téléphone est différent de celui du livreur sélectionné. Corrigez-le ou changez de livreur.'));return;
  }
  if(!linkedDriver&&autoMatched.length>1){setError(L('يوجد أكثر من سائق بهذا الرقم. اختر السائق من القائمة.','Plusieurs livreurs portent ce numéro. Choisissez le bon profil.'));return;}
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
   const payload={...draft,training_date:draft.training_status==='not_trained'?null:draft.training_date,name:draft.name.trim(),phone:draft.phone.trim(),city:draft.city.trim(),trainer:draft.trainer.trim(),training_location:draft.training_location.trim(),notes:draft.notes.trim(),photo_path:photoPath};
   if(selectedId===null&&items.some(row=>phoneDigits(row.phone)===phoneDigits(payload.phone)&&row.training_date===payload.training_date&&row.app_type===payload.app_type)){
    throw new Error(L('هذا المتدرب مسجل بالفعل في نفس التاريخ ولنفس التطبيق. افتح سجله وعدّله بدل تكراره.','Ce participant a déjà une fiche pour cette date et cette application. Modifiez-la au lieu de la dupliquer.'));
   }
   const result=selectedId===null?await prestoCloud.from('presto_training_records').insert(payload):await prestoCloud.from('presto_training_records').update(payload).eq('id',selectedId);
   if(result.error)throw result.error;
   let syncNotice='';
   if(target){
    const {error:driverError}=await prestoCloud.from('presto_drivers')
     .update({training_completed:payload.training_status==='completed'}).eq('id',target.id);
    if(driverError)syncNotice=L('تم حفظ التدريب، لكن تعذر تحديث ملف السائق: ','Formation enregistrée mais mise à jour du dossier impossible : ')+driverError.message;
   }
   setOpen(false);setFile(null);setSuccess(syncNotice||L('حُفظ سجل التدريب ورُبط بملف السائق المطابق إن وُجد.','Fiche enregistrée et liée au livreur correspondant, le cas échéant.'));
   await refresh();
   await onSaved?.();
  }catch(e){setError(e instanceof Error?e.message:L('تعذر الحفظ.','Enregistrement impossible.'));}
  finally{setSaving(false);}
 };
 const remove=async(row:RecordRow)=>{
  if(!prestoCloud||!editable||!confirm(L('حذف سجل تدريب '+row.name+'؟','Supprimer la fiche de '+row.name+' ?')))return;
  const {error:delError}=await prestoCloud.from('presto_training_records').delete().eq('id',row.id);
  if(delError)setError(delError.message);else{setSuccess(L('تم حذف سجل التدريب.','Fiche de formation supprimée.'));await refresh();await onSaved?.();}
 };
 const markCompleted=async(row:RecordRow)=>{
  if(!prestoCloud||!editable||saving)return;
  const date=new Date().toISOString().slice(0,10);
  setSaving(true);setError('');
  try{
   const {error:upError}=await prestoCloud.from('presto_training_records').update({training_status:'completed',training_date:date}).eq('id',row.id);
   if(upError)throw upError;
   const matches=drivers.filter(d=>phoneDigits(d.phone).length>=7&&phoneDigits(d.phone)===phoneDigits(row.phone));
   if(matches.length===1){const {error:driverError}=await prestoCloud.from('presto_drivers').update({training_completed:true}).eq('id',matches[0].id);if(driverError)setError(driverError.message);}
   setSuccess(L('تم نقل الشخص إلى المتدربين الذين أكملوا التكوين.','Personne transférée aux formations terminées.'));
   await refresh();await onSaved?.();
  }catch(e){setError(e instanceof Error?e.message:L('تعذر التحديث.','Mise à jour impossible.'));}
  finally{setSaving(false);}
 };
 const [exporting,setExporting]=useState(false);
 const exportExcel=async()=>{
  if(exporting)return;
  setExporting(true);setError('');
  try{
   const {Workbook}=await import('exceljs');
   const workbook=new Workbook();
   const now=new Date();
   workbook.creator='PRESTO';
   workbook.created=now;
   workbook.modified=now;
   const title=filter==='all'?L('سجل التكوين والمتدربين','Registre des formations'):statusLabel(filter);
   workbook.title='PRESTO · '+title;
   const sheet=workbook.addWorksheet(L('سجل التكوين','Formations'),{
    views:[{rightToLeft:ar,state:'frozen',ySplit:13,showGridLines:false}],
    properties:{defaultRowHeight:30,tabColor:{argb:'FFED6A25'}},
    pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,
     horizontalCentered:true,printTitlesRow:'13:13',margins:{left:0.25,right:0.25,top:0.4,bottom:0.4,header:0.2,footer:0.2}},
    headerFooter:{oddFooter:'&LPRESTO&C&P / &N&R'+now.toISOString().slice(0,10)}
   });
   const ink='FF201E1C',orange='FFFF3D17';
   const align=ar?'right':'left';
   sheet.columns=[{width:7},{width:30},{width:20},{width:22},{width:19},{width:24},{width:24},{width:27},{width:48},{width:21}];
   const banner=(range:string,value:string,bg:string,fg:string,size:number)=>{
    sheet.mergeCells(range);
    const cell=sheet.getCell(range.split(':')[0]);
    cell.value=value;
    cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};
    cell.font={name:'Arial',size,bold:true,color:{argb:fg}};
    cell.alignment={horizontal:align,vertical:'middle',wrapText:true,indent:1};
   };
   banner('A1:J1','',orange,orange,11);
   sheet.getRow(1).height=5;sheet.getRow(2).height=12;
   banner('A3:J3','PRESTO  |  '+title,'FFFFFFFF',ink,22);
   sheet.getRow(3).height=42;
   const exportedAt=new Intl.DateTimeFormat(ar?'ar-MR':'fr-FR',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Nouakchott'}).format(now);
   banner('A4:J4',L('مكتب شؤون السائقين · تاريخ التصدير: ','Bureau des livreurs · Exporté le : ')+exportedAt,'FFFFFFFF','FF57534E',11);
   sheet.getRow(4).height=28;sheet.getRow(5).height=12;
   banner('A6:J6',L('متابعة التكوين','Suivi des formations'),'FFFAF8F6',orange,13);
   banner('A7:J7',L('لم يقم بالتكوين: حدّد معه موعدًا للحضور إلى المكتب.','Non formé : convenir d’un rendez-vous au bureau.'),'FFFAF8F6',ink,12);
   banner('A8:J8',L('أكمل التكوين: تُعرض حالة التكوين وتاريخه كما سُجّلا في الملف.','Formé : le statut et la date figurent tels qu’enregistrés dans la fiche.'),'FFFAF8F6',ink,12);
   banner('A9:J9',L('دوّن نتيجة المتابعة في خانة الملاحظات داخل التطبيق قبل تنزيل نسخة جديدة.','Consignez le suivi dans les notes de l’application avant de télécharger une nouvelle copie.'),'FFFAF8F6',ink,12);
   for(let r=6;r<=9;r++){
    sheet.getRow(r).height=r===6?30:28;
    const cell=sheet.getCell('A'+r);
    cell.border={left:{style:'thin',color:{argb:'FFE5DDD6'}},right:{style:'thin',color:{argb:'FFE5DDD6'}},
     ...(r===6?{top:{style:'thin' as const,color:{argb:'FFE5DDD6'}}}:{}),
     ...(r===9?{bottom:{style:'thin' as const,color:{argb:'FFE5DDD6'}}}:{})};
   }
   sheet.getRow(10).height=14;
   banner('A11:A11',String(filtered.length),'FF2563EB','FFFFFFFF',17);
   banner('B11:J11',title,'FFFFFFFF',ink,17);
   sheet.getRow(11).height=36;
   banner('A12:J12',L('عدد الأشخاص: ','Personnes : ')+filtered.length+' · '+L('البحث: ','Recherche : ')+(search.trim()||L('جميع النتائج','Tous les résultats')),'FFFFFFFF','FF57534E',11);
   sheet.getRow(12).height=26;
   const headings=['#',L('الاسم الكامل','Nom complet'),L('رقم الهاتف','Téléphone'),L('المدينة','Ville'),L('تاريخ التكوين','Date de formation'),L('مكان التكوين','Lieu de formation'),L('المكوّن','Formateur'),L('الحالة','Statut'),L('ملاحظات','Notes'),L('تاريخ التسجيل','Date d’inscription')];
   const header=sheet.getRow(13);header.height=36;
   headings.forEach((value,i)=>{
    const cell=header.getCell(i+1);cell.value=value;
    cell.font={name:'Arial',bold:true,size:11,color:{argb:ink}};
    cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFFFFF'}};
    cell.border={bottom:{style:'thin',color:{argb:ink}}};
    cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};
   });
   const excelDate=(value:string|null)=>{
    if(!value)return null;
    const date=new Date(value.length===10?value+'T12:00:00Z':value);
    return Number.isNaN(date.getTime())?value:date;
   };
   const tones:Record<Status,[string,string]>={
    completed:['FFFFFFFF','FF006837'],in_progress:['FFFFFFFF','FF2563EB'],
    needs_review:['FFFFFFFF','FF854D0E'],not_trained:['FFFFFFFF','FFFF3D17']
   };
   filtered.forEach((x,i)=>{
    const row=sheet.getRow(i+14);
    const values=[i+1,x.name,x.phone,x.city,excelDate(x.training_date),x.training_location,x.trainer,statusLabel(x.training_status),x.notes,excelDate(x.created_at)];
    values.forEach((value,j)=>{
     const cell=row.getCell(j+1);cell.value=value;
     cell.font={name:'Arial',size:11,bold:j===1||j===2,color:{argb:j===2?'FF006837':ink}};
     cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFFFFF'}};
     cell.alignment={vertical:'middle',horizontal:[0,2,4,7,9].includes(j)?'center':align,wrapText:true};
     cell.border={bottom:{style:'hair',color:{argb:'FFE5DDD6'}}};
    });
    row.getCell(3).numFmt='@';
    row.getCell(3).alignment={horizontal:'center',vertical:'middle',readingOrder:'ltr'};
    row.getCell(5).numFmt='dd/mm/yyyy';row.getCell(10).numFmt='dd/mm/yyyy';
    const [bg,fg]=tones[x.training_status]||tones.needs_review;
    row.getCell(8).fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};
    row.getCell(8).font={name:'Arial',size:11,bold:true,color:{argb:fg}};
    // Estimate wrapped lines so long names and notes stay readable.
    const lines=Math.max(...values.map((v,j)=>typeof v==='string'?v.split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/([5,28,18,20,17,22,22,25,44,19][j]))),0):1));
    row.height=Math.min(409,Math.max(64,lines*16+12));
   });
   sheet.autoFilter={from:'A13',to:'J'+Math.max(13,sheet.rowCount)};
   sheet.pageSetup.printArea='A1:J'+Math.max(13,sheet.rowCount);
   const buffer=await workbook.xlsx.writeBuffer();
   const url=URL.createObjectURL(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
   const a=document.createElement('a');a.href=url;a.download='PRESTO-'+filter+'-'+now.toISOString().slice(0,10)+'.xlsx';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){setError(e instanceof Error?e.message:L('تعذر تنزيل Excel','Export impossible'));}
  finally{setExporting(false);}
 };

 return <section className={styles.root} dir={ar?'rtl':'ltr'}>
  <div className={styles.intro}>
   <div><span className={styles.eyebrow}>PRESTO · {L('سجل التدريب','REGISTRE DES FORMATIONS')}</span><h2>{L('سجل التكوين والمتدربين','Registre des formations et participants')}</h2><p>{L('إدارة من أتموا التكوين ومن لم يقوموا به بعد في قوائم مستقلة.','Gérez séparément les personnes formées et celles qui ne le sont pas encore.')}</p></div>
   <div className={styles.actions}><button className={styles.outline} onClick={()=>void exportExcel()} disabled={exporting||!filtered.length}><Download size={17}/>{exporting?L('جار تجهيز الملف…','Préparation…'):L('تنزيل Excel','Télécharger Excel')+' · '+filtered.length}</button>{editable&&<><button className={styles.outline} onClick={()=>{setFilter('not_trained');edit(undefined,'not_trained')}}><Plus size={18}/>{L('إضافة شخص لم يتكوّن','Ajouter une personne non formée')}</button><button className={styles.add} onClick={()=>edit()}><Plus size={18}/>{L('إضافة متدرب','Ajouter une personne')}</button></>}</div>
  </div>
  <div className={styles.stats}>
   {metrics.map(([label,count,Icon],i)=><div className={styles.metric} key={i}><span>{label as string}</span><strong>{count as number}</strong>{<Icon size={19}/>}</div>)}
  </div>
  <nav className={styles.rosterTabs} aria-label={L('فئات التكوين','Catégories de formation')}><button type="button" aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>{L('جميع المسجلين','Tous')} ({stats.total})</button><button type="button" aria-pressed={filter==='not_trained'} onClick={()=>setFilter('not_trained')}>{L('لم يقوموا بالتكوين','Non formés')} ({stats.not_trained})</button><button type="button" aria-pressed={filter==='completed'} onClick={()=>setFilter('completed')}>{L('أكملوا التكوين','Formés')} ({stats.completed})</button></nav>
  <div className={styles.toolbar}><label className={styles.search}><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={L('بحث بالاسم أو الهاتف أو المدينة...','Rechercher nom, téléphone, ville...')}/></label><select aria-label={L('تصفية حسب حالة التدريب','Filtrer par statut')} value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="all">{L('جميع الحالات','Tous les statuts')}</option><option value="completed">{statusLabel('completed')}</option><option value="in_progress">{statusLabel('in_progress')}</option><option value="needs_review">{statusLabel('needs_review')}</option><option value="not_trained">{statusLabel('not_trained')}</option></select><span>{filtered.length} / {items.length}</span></div>
  {error&&<p role="alert" className={styles.error}>{error}</p>}
  {success&&<p role="status" className={styles.success}>{success}</p>}
  {loading?<p className={styles.empty}>{L('جار تحميل السجلات...','Chargement des fiches...')}</p>:!filtered.length?<div className={styles.empty}><ClipboardList size={35}/><strong>{L('لا توجد سجلات تدريب حتى الآن','Aucune fiche de formation')}</strong><span>{filter==='not_trained'?L('أضف الأشخاص الذين لم يقوموا بالتكوين بعد.','Ajoutez les personnes qui n’ont pas encore suivi la formation.'):L('أضف أول شخص إلى السجل.','Ajoutez votre première personne.')}</span></div>:<div className={styles.cards}>{filtered.map((row,i)=><article className={styles.card} key={row.id}><div className={styles.cardTop}><div className={styles.picture}><img src="/images/presto-uniform-rider.webp" alt={row.name}/></div><div className={styles.person}><small>#{String(filtered.length-i).padStart(3,'0')}</small><h3>{row.name}</h3><a href={'tel:'+row.phone}><Phone size={14}/><bdi>{row.phone}</bdi></a></div><span className={styles.status} data-status={isStatus(row.training_status)?row.training_status:'needs_review'}>{statusLabel(row.training_status)}</span></div>
    <dl className={styles.details}><div><dt><CalendarDays size={15}/>{L('تاريخ التدريب','Date')}</dt><dd>{row.training_status==='not_trained'?L('لم يتم بعد','Pas encore'):row.training_date||'—'}</dd></div><div><dt><MapPin size={15}/>{L('المدينة / المكان','Ville / lieu')}</dt><dd>{[row.city,row.training_location].filter(Boolean).join(' · ')||'—'}</dd></div><div><dt><ClipboardList size={15}/>{L('التطبيق','Application')}</dt><dd>{row.app_type==='driver'?L('تطبيق السائق','Livreur'):row.app_type==='customer'?L('تطبيق الزبون','Client'):L('التطبيقان','Les deux')}</dd></div></dl>
    {row.notes&&<p className={styles.notes}>{row.notes}</p>}
     {drivers.some(d=>phoneDigits(d.phone).length>=7&&phoneDigits(d.phone)===phoneDigits(row.phone))&&<span className={styles.linkTag}><CheckCircle2 size={15}/>{L('مرتبط بملف سائق PRESTO','Lié à un livreur PRESTO')}</span>}
    {editable&&<div className={styles.cardActions}>{row.training_status==='not_trained'&&<button disabled={saving} onClick={()=>void markCompleted(row)}><CheckCircle2 size={15}/>{L('إتمام التكوين','Marquer formé')}</button>}<button onClick={()=>edit(row)}><Edit3 size={15}/>{L('تعديل','Modifier')}</button><button className={styles.danger} onClick={()=>void remove(row)}><Trash2 size={15}/>{L('حذف','Supprimer')}</button></div>}
   </article>)}</div>}
  {open&&<div className={styles.overlay} onMouseDown={e=>{if(e.target===e.currentTarget&&!saving)setOpen(false)}}>
   <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="presto-training-dialog-title" aria-describedby="presto-training-dialog-description">
    <div className={styles.dialogHeader}>
     <div className={styles.headingContent}>
      <span className={styles.headingIcon}><GraduationCap size={25}/></span>
      <div><span className={styles.headerEyebrow}>PRESTO · FORMATION</span><h2 id="presto-training-dialog-title">{selectedId!==null?L('تعديل بيانات المتدرب','Modifier le participant'):L('تسجيل متدرب جديد','Nouveau participant')}</h2>
       <p id="presto-training-dialog-description">{L('سجّل التدريب واربطه بملف السائق عند الحاجة','Enregistrer et associer la formation à un livreur')}</p></div>
     </div>
     <button type="button" aria-label={L('إغلاق','Fermer')} onClick={()=>setOpen(false)} disabled={saving}><X size={22}/></button>
    </div>
    <form onSubmit={e=>void save(e)} className={styles.registerForm}>
     <div className={styles.dialogBody}>
      <div className={styles.topCards}>
       <label className={styles.photoCard}>
        <span className={styles.photoPreview}><img src={preview||photos[draft.photo_path]||'/images/presto-uniform-rider.webp'} alt={L('صورة PRESTO الافتراضية','Portrait PRESTO par défaut')}/></span>
        <span className={styles.photoInfo}><strong><Camera size={17}/>{L('صورة المتدرب','Photo du participant')}</strong>
         <span>{file?.name||L('الصورة اختيارية، وستظهر صورة PRESTO الافتراضية عند عدم رفع صورة.','Facultatif : le portrait PRESTO sera affiché par défaut.')}</span>
         <span className={styles.photoButton}><Camera size={15}/>{L('اختيار صورة','Choisir une photo')}</span>
        </span>
        <input className={styles.photoInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/>
       </label>
       <div className={styles.formIntro}><span className={styles.formIntroIcon}><ShieldCheck size={24}/></span>
        <div><strong>{L('بيانات بسيطة، ملف متكامل','Une fiche claire et complète')}</strong>
         <p>{L('املأ المعلومات الأساسية فقط. يُحفظ التدريب بصورة مستقلة، ويُحدّث ملف السائق تلقائيًا عند مطابقته.','Renseignez les informations essentielles. La formation est enregistrée et associée au livreur correspondant.')}</p>
         <span><CheckCircle2 size={15}/>{L('الحقول المعلَّمة بنجمة إلزامية','Les champs marqués * sont obligatoires')}</span>
        </div>
       </div>
      </div>
      <section className={styles.driverLink} aria-labelledby="presto-driver-link-title">
       <div className={styles.sectionTitle}><span className={styles.sectionIcon}><Link2 size={20}/></span><div>
        <h3 id="presto-driver-link-title">{L('ربط بسائق مسجل','Lier à un livreur')}</h3>
        <p>{L('اختياري — اختر سائقًا لتعبئة اسمه ورقمه تلقائيًا','Facultatif — sélectionnez un livreur pour remplir ses coordonnées')}</p>
       </div></div>
       <div className={styles.linkInputs}>
        <label className={styles.linkSearch}><Search size={17}/><input type="search" value={driverSearch} onChange={e=>setDriverSearch(e.target.value)} placeholder={L('ابحث عن سائق بالاسم أو الهاتف','Rechercher par nom ou téléphone')}/></label>
        <label className={styles.linkSelect}><span className={styles.srOnly}>{L('اختر سائقًا','Choisir un livreur')}</span>
         <select value={linkedDriverId??''} onChange={e=>{
          const id=e.target.value?Number(e.target.value):null;
          const d=drivers.find(item=>item.id===id);
          setLinkedDriverId(id);
          if(d)setDraft(old=>({...old,name:d.name,phone:d.phone,city:d.city||old.city}));
         }}>
          <option value="">{L('متدرب جديد غير مرتبط بسائق','Participant indépendant')}</option>
          {driverOptions.map(d=><option value={d.id} key={d.id}>{labelDriver(d)}</option>)}
         </select>
        </label>
       </div>
       <p className={styles.linkHint}>{target?<><CheckCircle2 size={16}/>{L('تم العثور على السائق، وستُحدَّث حالة التدريب في ملفه.','Livreur trouvé : son statut de formation sera mis à jour.')}</>:<><Link2 size={16}/>{L('يمكن تسجيل متدرب مستقل، أو الربط تلقائيًا إذا كان رقم الهاتف مطابقًا لسائق واحد.','Un participant peut être indépendant ou associé par correspondance exacte du téléphone.')}</>}</p>
      </section>
      <section className={styles.formSection} aria-labelledby="presto-training-details-title">
       <div className={styles.sectionTitle}><span className={styles.sectionIcon}><ClipboardList size={20}/></span><div>
        <h3 id="presto-training-details-title">{L('بيانات التدريب','Informations de formation')}</h3>
        <p>{L('المعلومات اللازمة لإتمام التسجيل','Informations nécessaires à l’enregistrement')}</p>
       </div></div>
       <div className={styles.fields}>
        <label><span className={styles.fieldTitle}><UserRound size={16}/>{L('الاسم الكامل','Nom complet')} <em>*</em></span>
         <input required autoComplete="name" maxLength={100} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder={L('أدخل الاسم الكامل','Nom et prénom')}/></label>
        <label><span className={styles.fieldTitle}><Phone size={16}/>{L('رقم الهاتف','Téléphone')} <em>*</em></span>
         <input required type="tel" inputMode="tel" autoComplete="tel" maxLength={30} dir="ltr" value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})} placeholder="Ex. 4X XX XX XX"/></label>
        <label><span className={styles.fieldTitle}><MapPin size={16}/>{L('المدينة','Ville')}</span>
         <input maxLength={100} value={draft.city} onChange={e=>setDraft({...draft,city:e.target.value})} placeholder={L('مثال: نواكشوط','Ex. Nouakchott')}/></label>
        <label><span className={styles.fieldTitle}><CalendarDays size={16}/>{L('تاريخ التدريب','Date de formation')} <em>*</em></span>
         <input required={draft.training_status!=='not_trained'} disabled={draft.training_status==='not_trained'} type="date" value={draft.training_date} onChange={e=>setDraft({...draft,training_date:e.target.value})}/></label>
        <label><span className={styles.fieldTitle}><MapPin size={16}/>{L('مكان التدريب','Lieu de formation')}</span>
         <input maxLength={120} value={draft.training_location} onChange={e=>setDraft({...draft,training_location:e.target.value})} placeholder={L('المقر أو الفرع (اختياري)','Centre ou agence (facultatif)')}/></label>
        <label><span className={styles.fieldTitle}><Smartphone size={16}/>{L('التطبيق','Application')}</span>
         <select value={draft.app_type} onChange={e=>setDraft({...draft,app_type:e.target.value})}>
          <option value="driver">{L('تطبيق السائق','Application livreur')}</option>
          <option value="customer">{L('تطبيق الزبون','Application client')}</option>
          <option value="both">{L('التطبيقان معًا','Les deux applications')}</option>
         </select></label>
        <label className={styles.full}><span className={styles.fieldTitle}><Award size={16}/>{L('نتيجة التدريب','Résultat de formation')}</span>
         <select value={draft.training_status} onChange={e=>setDraft({...draft,training_status:e.target.value as Status})}>
          <option value="completed">{statusLabel('completed')}</option>
          <option value="in_progress">{statusLabel('in_progress')}</option>
          <option value="needs_review">{statusLabel('needs_review')}</option>
          <option value="not_trained">{statusLabel('not_trained')}</option>
         </select>
        </label>
        <label className={styles.full}><span className={styles.fieldTitle}><FileText size={16}/>{L('ملاحظات إضافية','Notes complémentaires')}</span>
         <textarea maxLength={1200} rows={3} value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})} placeholder={L('ملاحظات اختيارية تخص التدريب...','Notes facultatives sur la formation...')}/></label>
       </div>
      </section>
     </div>
     {error&&<p className={styles.error} role="alert">{error}</p>}
     <div className={styles.formActions}><span className={styles.footerHint}><ShieldCheck size={16}/>{L('سيُحفظ السجل في PRESTO','Enregistrement dans PRESTO')}</span>
      <button type="button" className={styles.outline} disabled={saving} onClick={()=>setOpen(false)}><X size={16}/>{L('إلغاء','Annuler')}</button>
      <button type="submit" className={styles.add} disabled={saving}><Save size={17}/>{saving?L('جار الحفظ...','Enregistrement...'):L('حفظ بيانات المتدرب','Enregistrer le participant')}</button>
     </div>
    </form>
   </div>
  </div>}
 </section>;
}

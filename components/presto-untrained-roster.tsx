'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {Check,Download,FileText,GraduationCap,Plus,RefreshCw,Save,Search,Edit3,Trash2,CheckCircle2,X} from 'lucide-react';
import {prestoCloud} from '../lib/presto-cloud';
import styles from './presto-untrained-roster.module.css';

type Source={number:number;name:string;ref:string;phone:string;plate:string;date:string};
type Driver={id:number;name:string;phone:string;pdf_source_phone?:string;presto_reference?:string;driver_photo_path?:string;training_completed?:boolean|null;};
type Training={id:number;name:string;phone:string;training_status:string;notes:string;created_at:string};
type Props={language:string;editable:boolean;drivers:Driver[];photos:Record<string,string>};
const source:Source[]=[
[1,'محمد إبراهيم','7466','43178284','2324 BC 00','27/10/2026'],
[2,'احمدو احمد يوسف محمد','7465','41474754','8126 BC 00','27/10/2026'],
[3,'عبدالرحمان احمد','7459','33620793','1676 BE 00','27/10/2026'],
[4,'محمد لمين امبارك','7455','28011444','2360 BC 00','27/10/2026'],
[5,'محمد محمود الطالب محمد','7319','20405636','1922 AA 10','28/10/2026'],
[6,'ابوبكرن ابراهيم ليل','7273','33643690','2355 BC 00','23/10/2026'],
[7,'علي محمد امبارك','7272','32162030','8248 BA 00','23/10/2026'],
[8,'الحسن سالم موسى','7192','43235012','3700 BB 00','27/10/2026'],
[9,'عبد الحميد خونة','7151','38614178','9397 BB 00','25/07/2026'],
[10,'سيدي محمد افالي','6867','27341228','','24/10/2026'],
[11,'ابراهيم باب','6648','34823038','1145 BC 00','26/10/2026'],
[12,'لمرابط محمد حبيبا','6642','28604573','1116 AE 06','19/10/2026'],
[13,'الشيخ حبيب بلال','6588','34173559','8167 AB 03','19/10/2026'],
[14,'عالي احمد سالم','6586','42607608','0176 BE 00','29/10/2026'],
[15,'النجاح عبد الرحمن السالك','6544','20054109','4023 BE 00','04/11/2026'],
[16,'سعدنا محمد فال احمد','6498','31304400','7265 BC 00','21/10/2026'],
[17,'عبدالله سيدي','6436','49894170','1033 BC 00','19/10/2026'],
[18,'احمد محفوظ امبارك','6345','34355235','3297 BE 00','20/10/2026'],
[19,'محمود امبارك','6233','20882678','8976 BC 00','20/10/2026'],
[20,'باتي معطل غائب','6231','37330811','2849 BE 00','20/10/2026'],
[21,'محمد تابا كمر','6230','41969809','','22/10/2026'],
[22,'سري بيرو','6222','33827614','','31/10/2026'],
[23,'البخاري الميمون','6128','27686102','6035 BC 00','20/10/2026'],
[24,'الحسن الحسين البلوث','5934','34946412','2038 BE 00','01/11/2026'],
[25,'محمد مختار','5931','48683896','','20/10/2026'],
[26,'ابوه محمد بابتي','5763','43132193','','21/09/2026']
].map(([number,name,ref,phone,plate,date])=>({number:Number(number),name:String(name),ref:String(ref),phone:String(phone),plate:String(plate),date:String(date)}));
const digits=(value:string)=>String(value||'').replace(/\D/g,'');
const reasonOf=(notes:string)=>notes.match(/(?:^|\n)سبب:\s*([^\n]*)/)?.[1]||'';
const META='PRESTO_ROSTER_META:';
const FOLLOW='PRESTO_FOLLOWUP:';
type Followup={contactDate:string;contactResult:string;requiredAction:string;observations:string};
const emptyFollowup=():Followup=>({contactDate:'',contactResult:'',requiredAction:'',observations:''});
const followupOf=(notes:string):Followup=>{try{const line=notes.split('\n').find(x=>x.startsWith(FOLLOW));return {...emptyFollowup(),...(line?JSON.parse(line.slice(FOLLOW.length)):{} as Partial<Followup>)};}catch{return emptyFollowup();}};
const withFollowup=(notes:string,data:Followup)=>[notes.split('\n').filter(x=>!x.startsWith(FOLLOW)).join('\n').trim(),FOLLOW+JSON.stringify(data)].filter(Boolean).join('\n');
const metaOf=(notes:string):Partial<Source>&{deleted?:boolean}=>{try{const line=notes.split('\\n').find(x=>x.startsWith(META));return line?JSON.parse(line.slice(META.length)):{};}catch{return {};}};
const setMeta=(notes:string,meta:Partial<Source>&{deleted?:boolean})=>[notes.split('\\n').filter(x=>!x.startsWith(META)).join('\\n').trim(),META+JSON.stringify(meta)].filter(Boolean).join('\\n');
const notesWithReason=(notes:string,reason:string)=>[notes.replace(/(?:^|\n)سبب:[^\n]*/g,'').trim(),reason.trim()?'سبب: '+reason.trim():''].filter(Boolean).join('\n');
export default function PrestoUntrainedRoster({language,editable,drivers,photos}:Props){
 const ar=language==='ar';const L=(a:string,f:string)=>ar?a:f;
 const [records,setRecords]=useState<Training[]>([]);
 const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);
 const [search,setSearch]=useState('');const [error,setError]=useState('');const [success,setSuccess]=useState('');
 const [edited,setEdited]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<Source|null>(null);const [draft,setDraft]=useState<Source|null>(null);
 const [showCompleted,setShowCompleted]=useState(false);
 const [followupDriver,setFollowupDriver]=useState<Source|null>(null);
 const [followupDraft,setFollowupDraft]=useState<Followup>(emptyFollowup());
 const reload=useCallback(async()=>{
  if(!prestoCloud){setLoading(false);setError(L('اتصال PRESTO بقاعدة البيانات غير متاح. يمكن عرض القائمة وتنزيلها.','Connexion PRESTO indisponible. Consultation et export restent possibles.'));return;}
  const {data,error:err}=await prestoCloud.from('presto_training_records').select('id,name,phone,training_status,notes,created_at').order('id',{ascending:false}).limit(2000);
  if(err)setError(err.message);else{setRecords((data||[]) as Training[]);setError('');}
  setLoading(false);
 },[ar]);
 useEffect(()=>{void reload();},[reload]);
 const known=new Map<string,Training>();
 for(const item of records){const k=digits(item.phone);if(k.length>=7&&!known.has(k))known.set(k,item);}
 const driverFor=(entry:Source)=>drivers.find(d=>digits(d.pdf_source_phone||d.phone)===entry.phone||String(d.presto_reference||'').replace('#','')===entry.ref);
 const full=useMemo(()=>source.map(base=>{const training=known.get(base.phone);const meta=metaOf(training?.notes||'');const item={...base,...meta,number:base.number,phone:meta.phone||base.phone};return {source:item,originalPhone:base.phone,driver:driverFor(base),training,deleted:meta.deleted===true};}).filter(v=>!v.deleted&&(showCompleted||(v.training?.training_status!=='completed'&&v.driver?.training_completed!==true))),[drivers,records,showCompleted]);
 const filtered=full.filter(v=>[v.source.name,v.source.phone,v.source.ref,v.source.plate,reasonOf(v.training?.notes||''),edited[v.source.phone]||''].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
 const stat=[full.length,full.filter(v=>v.driver?.training_completed!==false).length,full.filter(v=>v.training?.training_status==='not_trained').length];
 const saveOne=async(entry:Source)=>{
  if(!prestoCloud||!editable)return;setBusy(true);setError('');setSuccess('');
  try{
   const existing=known.get(source.find(x=>x.number===entry.number)?.phone||entry.phone);if(existing?.training_status==='completed')throw new Error(L('تم تكوين هذا السائق بالفعل.','Ce livreur est déjà formé.'));
   const notes=notesWithReason(existing?.notes||'',edited[entry.phone]??reasonOf(existing?.notes||''));
   const payload={name:entry.name,phone:entry.phone,training_status:'not_trained' as const,training_date:null,notes,app_type:'driver'};
   const result=existing?await prestoCloud.from('presto_training_records').update({notes}).eq('id',existing.id):await prestoCloud.from('presto_training_records').insert(payload);
   if(result.error)throw result.error;
   setSuccess(L('تم حفظ السائق والسبب بنجاح.','Livreur et motif enregistrés.'));await reload();
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 };
 const updateStatus=async(entry:Source,completed:boolean)=>{
  if(!editable||!prestoCloud||busy)return;
  const original=source.find(x=>x.number===entry.number)!;const training=known.get(original.phone);setBusy(true);setError('');
  try{
   const status=completed?'completed':'not_trained';
   const date=completed?new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Nouakchott'}):null;
   const result=training?await prestoCloud.from('presto_training_records').update({training_status:status,training_date:date}).eq('id',training.id):await prestoCloud.from('presto_training_records').insert({name:entry.name,phone:original.phone,training_status:status,training_date:date,app_type:'driver'});
   if(result.error)throw result.error;
   const driver=driverFor(original);if(driver){const {error:err}=await prestoCloud.from('presto_drivers').update({training_completed:completed}).eq('id',driver.id);if(err)throw err;}
   await reload();setSuccess(completed?L('تم التكوين بنجاح.','Formation terminée.'):L('تم إرجاعه إلى لم يتم.','Formation annulée.'));
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 };
 const saveDetails=async()=>{
  if(!draft||!selected||!editable||!prestoCloud||busy)return;
  const original=source.find(x=>x.number===selected.number)!;const training=known.get(original.phone);setBusy(true);setError('');
  try{
   if(!draft.name.trim()||digits(draft.phone).length<7)throw new Error(L('أدخل اسمًا ورقم هاتف صحيحين.','Nom et téléphone valides requis.'));
   const meta={name:draft.name.trim(),phone:draft.phone.trim(),plate:draft.plate.trim(),date:draft.date};
   const notes=setMeta(training?.notes||'',meta);
   const result=training?await prestoCloud.from('presto_training_records').update({notes}).eq('id',training.id):await prestoCloud.from('presto_training_records').insert({name:original.name,phone:original.phone,training_status:'not_trained',training_date:null,app_type:'driver',notes});
   if(result.error)throw result.error;
   setSelected(null);setDraft(null);await reload();setSuccess(L('تم حفظ تعديلات البطاقة.','Fiche modifiée.'));
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 };
 const deleteOne=async(entry:Source)=>{
  if(!editable||!prestoCloud||busy||!window.confirm(L('هل تريد حذف البطاقة من هذه القائمة؟','Supprimer cette fiche de la liste ?')))return;
  const original=source.find(x=>x.number===entry.number)!;const training=known.get(original.phone);setBusy(true);setError('');
  try{
   const notes=setMeta(training?.notes||'',{...metaOf(training?.notes||''),deleted:true});
   const result=training?await prestoCloud.from('presto_training_records').update({notes}).eq('id',training.id):await prestoCloud.from('presto_training_records').insert({name:original.name,phone:original.phone,training_status:'not_trained',training_date:null,app_type:'driver',notes});
   if(result.error)throw result.error;
   await reload();setSuccess(L('تم حذف البطاقة من القائمة.','Fiche retirée de la liste.'));
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 };
 const importAll=async()=>{
  if(!prestoCloud||!editable||busy)return;setBusy(true);setError('');setSuccess('');
  try{
   const pending=full.filter(v=>!v.training).map(v=>({name:v.source.name,phone:v.source.phone,training_status:'not_trained',training_date:null,app_type:'driver',notes:notesWithReason('',edited[v.source.phone]||'')}));
   if(pending.length){const {error:err}=await prestoCloud.from('presto_training_records').insert(pending);if(err)throw err;}
   await reload();setSuccess(L('تمت مزامنة '+pending.length+' سجلات جديدة دون تكرار الموجود.','Synchronisation : '+pending.length+' nouveaux dossiers, sans doublons.'));
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 };
 const saveFollowup=async()=>{
  if(!followupDriver||!prestoCloud||!editable||busy)return;
  setBusy(true);setError('');setSuccess('');
  try{
   const original=source.find(x=>x.number===followupDriver.number)!;
   const existing=known.get(original.phone);
   const notes=withFollowup(existing?.notes||'',followupDraft);
   const result=existing?await prestoCloud.from('presto_training_records').update({notes}).eq('id',existing.id):await prestoCloud.from('presto_training_records').insert({name:original.name,phone:original.phone,training_status:'not_trained',training_date:null,app_type:'driver',notes});
   if(result.error)throw result.error;
   setFollowupDriver(null);await reload();setSuccess(L('تم حفظ المتابعة والملاحظات.','Suivi et observations enregistrés.'));
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 };
 const exportExcel=async()=>{
  setBusy(true);setError('');
  try{
   const {Workbook}=await import('exceljs');
   const wb=new Workbook();wb.creator='PRESTO';wb.title='PRESTO | '+L('تقرير السائقين غير المكوّنين','Rapport des livreurs non formés');
   const sh=wb.addWorksheet(L('لم يقوموا بالتكوين','Non formés'),{views:[{rightToLeft:ar,state:'frozen',ySplit:12,showGridLines:false}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,printTitlesRow:'12:12',margins:{left:.2,right:.2,top:.35,bottom:.35,header:.15,footer:.15}}});
   sh.columns=[{width:7},{width:34},{width:16},{width:18},{width:20},{width:14},{width:14},{width:19},{width:39},{width:19},{width:21},{width:33}];
   const C={navy:'FF313D46',coral:'FFE58E73',orange:'FFCE674D',cream:'FFFFF4EF',white:'FFFFFFFF',muted:'FF7B858D',green:'FF167E55',red:'FFB94C43',line:'FFE5E9EB',pale:'FFF8FAFB'};
   const merged=(range:string,value:string,bg:string,size:number,color=C.navy,center=false)=>{sh.mergeCells(range);const cell=sh.getCell(range.split(':')[0]);cell.value=value;cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};cell.font={name:'Arial',size,bold:true,color:{argb:color}};cell.alignment={vertical:'middle',horizontal:center?'center':ar?'right':'left',indent:center?0:1,wrapText:true};};
   merged('A1:L2','PRESTO  |  '+L('إدارة العمليات — موريتانيا','DIRECTION DES OPÉRATIONS — MAURITANIE'),C.navy,15,C.white);sh.getRow(1).height=28;sh.getRow(2).height=27;
   merged('A3:L4',L('تقرير تسليم المستلزمات — السائقون غير المكوّنين','REMISE D’ÉQUIPEMENT — LIVREURS NON FORMÉS'),C.navy,21,C.white);sh.getRow(3).height=34;sh.getRow(4).height=29;
   merged('A5:L5',L('PRESTO · متابعة الحقيبة والقميص والتكوين | المصدر: قائمة 10/11/2026','PRESTO · Suivi des sacs, chemises et formations | Source : liste du 10/11/2026'),C.navy,10,'FFE4E8EA');sh.getRow(5).height=29;
   const done=filtered.filter(v=>v.training?.training_status==='completed'||v.driver?.training_completed===true).length;
   const metrics:[string,string,string,number][]=[['A7:B7',L('السائقون','LIVREURS'),String(filtered.length),0],['C7:D7',L('استلموا الحقيبة','SACS REMIS'),String(filtered.length),0],['E7:F7',L('استلموا القميص','CHEMISES REMISES'),String(filtered.length),0],['G7:H7',L('لم يتم التكوين','NON FORMÉS'),String(filtered.length-done),0],['I7:J7',L('تم التكوين','FORMÉS'),String(done),0],['K7:L7',L('أسباب مسجلة','MOTIFS SAISIS'),String(filtered.filter(v=>Boolean((edited[v.source.phone]??reasonOf(v.training?.notes||'')).trim())).length),0]];
   for(const [range,label] of metrics){const [from,to]=range.split(':');const left=from.match(/^[A-Z]+/)?.[0]||'A';const right=to.match(/^[A-Z]+/)?.[0]||'B';merged(range,label,C.cream,10,C.muted,true);merged(left+'8:'+right+'9',String(metrics.find(m=>m[0]===range)?.[2]||0),C.cream,24,C.orange,true);}sh.getRow(7).height=26;sh.getRow(8).height=27;sh.getRow(9).height=25;
   merged('A11:L11',L('بيانات السائقين · استخدم المرشحات للبحث والفرز · السبب يسبق تاريخ التسليم','DONNÉES DES LIVREURS · Filtres de recherche et de tri · Motif avant date de remise'),C.pale,10,C.muted);sh.getRow(11).height=27;
   const headers=['N°',L('اسم السائق','LIVREUR'),L('مرجع PRESTO','RÉFÉRENCE'),L('الهاتف','TÉLÉPHONE'),L('اللوحة','PLAQUE'),L('الحقيبة','SAC'),L('القميص','CHEMISE'),L('التكوين','FORMATION'),L('السبب','MOTIF'),L('سُلّم في','DATE DE REMISE'),L('الحالة','STATUT'),L('ملاحظات','OBSERVATIONS')];
   const header=sh.getRow(12);header.height=40;headers.forEach((label,i)=>{const cell=header.getCell(i+1);cell.value=label;cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:i>=5&&i<=9?C.coral:C.navy}};cell.font={name:'Arial',size:10,bold:true,color:C.white};cell.alignment={vertical:'middle',horizontal:'center',wrapText:true};cell.border={bottom:{style:'medium',color:{argb:C.orange}}};});
   filtered.forEach((v,i)=>{const d=v.source;const trained=v.training?.training_status==='completed'||v.driver?.training_completed===true;const reason=edited[d.phone]??reasonOf(v.training?.notes||'');const notes=(v.training?.notes||'').split('\\n').filter(x=>!x.startsWith('PRESTO_ROSTER_META:')&&!x.startsWith('PRESTO_FOLLOWUP:')&&!x.startsWith('سبب:')).join(' ').trim();const vals=[d.number,d.name,'#'+d.ref,d.phone,d.plate||'—',L('نعم','Oui'),L('نعم','Oui'),trained?L('تم','Formé'):L('لم يتم','Non formé'),reason||'—',d.date,trained?L('مكتمل','Terminé'):L('بانتظار التكوين','À former'),notes||'—'];const row=sh.getRow(i+13);row.height=35;vals.forEach((value,j)=>{const cell=row.getCell(j+1);cell.value=value;cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:i%2===0?C.white:C.pale}};cell.font={name:'Arial',size:10,bold:j===1||j===10,color:{argb:j===5||j===6||trained&&j===7?C.green:j===7||j===10?C.red:C.navy}};cell.alignment={vertical:'middle',horizontal:j===1||j===8||j===11?(ar?'right':'left'):'center',wrapText:true};cell.border={bottom:{style:'hair',color:{argb:C.line}}};});row.getCell(4).numFmt='@';});
   const last=12+filtered.length;sh.autoFilter={from:'A12',to:'L'+Math.max(13,last)};sh.pageSetup.printArea='A1:L'+Math.max(13,last);sh.headerFooter.oddFooter='PRESTO | &P / &N';
   const buf=await wb.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download='PRESTO-Rapport-Formation-Equipement-2026-11-10.xlsx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 };
 return <section className={styles.root} dir={ar?'rtl':'ltr'}>
  <div className={styles.hero}><div className={styles.brand}><img src="/logos/presto.webp" alt="PRESTO" width={130} height={70}/><span>{L('بريستو موريتانيا · إدارة العمليات','PRESTO Mauritanie · Opérations')}<small>10 / 11 / 2026</small></span></div><div className={styles.heroBody}><span className={styles.eyebrow}>PRESTO · {L('سجل السائقين','REGISTRE DES LIVREURS')}</span><h2>{L('السائقون — لم يتم تكوينهم بعد','Livreurs — Formation non effectuée')}</h2><p>{L('استلموا الحقيبة والقميص · قائمة مرجعية مطابقة لتقرير 10 نوفمبر 2026','Sac et chemise remis · Selon le rapport du 10 novembre 2026')}</p></div></div>
  <div className={styles.metrics}><div><span>{L('في القائمة','Dans la liste')}</span><strong>{stat[0]}</strong><small>{L('سائقون','Livreurs')}</small></div><div><span>{L('الحقيبة والقميص','Sac + chemise')}</span><strong className={styles.green}>{stat[1]}</strong><small>{L('مستلمة','Reçus')}</small></div><div><span>{L('موجودون في سجل التكوين','Dans le registre')}</span><strong>{stat[2]}</strong><small>{L('حالة: غير مكوّن','Non formés')}</small></div><div><span>{L('التكوين','Formation')}</span><strong className={styles.orange}>0</strong><small>{L('منجز من هذه القائمة','Terminés sur la liste')}</small></div></div>
  <div className={styles.toolbar}><label><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={L('ابحث بالاسم، الهاتف، اللوحة أو السبب','Recherche nom, téléphone, plaque ou motif')}/></label><div><button type="button" onClick={()=>void reload()} disabled={busy}><RefreshCw size={16}/>{L('تحديث','Actualiser')}</button><button type="button" onClick={()=>setShowCompleted(v=>!v)}>{showCompleted?L('إخفاء المكتملين','Masquer les formés'):L('عرض المكتملين','Afficher les formés')}</button>{editable&&<button type="button" onClick={()=>void importAll()} disabled={busy||loading}><Plus size={16}/>{L('مزامنة الـ26 مع قاعدة البيانات','Synchroniser les 26')}</button>}<button type="button" className={styles.download} onClick={()=>void exportExcel()} disabled={busy}><Download size={17}/>{L('تنزيل Excel بنفس التصميم','Exporter Excel')}</button></div></div>
  {error&&<p className={styles.error} role="alert">{error}</p>}{success&&<p className={styles.success} role="status">{success}</p>}
  <div className={styles.tablewrap}><table className={styles.table}><thead><tr>{['#',L('السائق','Livreur'),L('الهاتف','Téléphone'),L('اللوحة','Plaque'),L('الحقيبة','Sac'),L('القميص','Chemise'),L('التكوين','Formation'),L('سبب','Motif'),L('سُلّم في','Remis le'),L('المتابعة والملاحظات','Suivi et notes'),L('إجراءات','Actions')].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{filtered.map(v=>{const s=v.source;const d=v.driver;const photo=d?.driver_photo_path?photos[d.driver_photo_path]:null;return <tr key={s.phone}><td className={styles.number}>{s.number}</td><td><div className={styles.person}><img src={photo||'/images/presto-uniform-rider.webp'} alt="" width={37} height={37}/><span><strong>{s.name}</strong><small>#{s.ref}</small></span></div></td><td dir="ltr">{s.phone}</td><td>{s.plate?<span className={styles.plate}>{s.plate}</span>:'—'}</td><td><Check className={styles.tick} size={18}/></td><td><Check className={styles.tick} size={18}/></td><td><button type="button" className={styles.notTrained} disabled={!editable||busy} onClick={()=>void updateStatus(s,v.training?.training_status!=='completed')}>{v.training?.training_status==='completed'?L('تم ✓','Formé ✓'):L('لم يتم · اضغط للإتمام','Non formé · Valider')}</button></td><td className={styles.reason}>{editable?<div className={styles.reasonInput}><input aria-label={L('سبب عدم التكوين لـ ','Motif pour ')+s.name} maxLength={350} value={edited[s.phone]??reasonOf(v.training?.notes||'')} onChange={e=>setEdited(old=>({...old,[s.phone]:e.target.value}))} placeholder={L('أضف سبب عدم التكوين','Ajouter le motif')}/><button type="button" title={L('حفظ السبب','Enregistrer le motif')} disabled={busy} onClick={()=>void saveOne(s)}><Save size={15}/></button></div>:<span>{reasonOf(v.training?.notes||'')||'—'}</span>}</td><td dir="ltr">{s.date}</td><td><button type="button" className={styles.notTrained} disabled={!editable||busy} onClick={()=>{setFollowupDriver(s);setFollowupDraft(followupOf(v.training?.notes||''));}}>{L('فتح بطاقة المتابعة','Ouvrir le suivi')}</button>{followupOf(v.training?.notes||'').contactDate&&<small style={{display:'block',marginTop:5}}>{followupOf(v.training?.notes||'').contactDate}</small>}</td><td>{editable&&<div className={styles.rowActions}><button type="button" disabled={busy} onClick={()=>{setSelected(s);setDraft({...s});}} title={L('تعديل البطاقة','Modifier')}><Edit3 size={16}/></button><button type="button" disabled={busy} onClick={()=>void deleteOne(s)} title={L('حذف البطاقة','Supprimer')}><Trash2 size={16}/></button></div>}</td></tr>;})}</tbody></table></div>
  {followupDriver&&<div className={styles.overlay}><div className={styles.dialog} role="dialog" aria-modal="true" dir={ar?'rtl':'ltr'} style={{maxWidth:720,width:'min(94vw,720px)'}}><div className={styles.dialogTop}><h3>{L('بطاقة متابعة التواصل — ','Fiche de suivi — ')+followupDriver.name}</h3><button type="button" onClick={()=>setFollowupDriver(null)}><X size={19}/></button></div><p style={{color:'#68737c'}}>{L('مرجع بريستو: ','Référence PRESTO : ')}#{followupDriver.ref} · {followupDriver.phone}</p><label>{L('تاريخ التواصل','Date de contact')}<input type="date" value={followupDraft.contactDate} onChange={e=>setFollowupDraft(v=>({...v,contactDate:e.target.value}))}/></label><label>{L('نتيجة الاتصال','Résultat de l’appel')}<select value={followupDraft.contactResult} onChange={e=>setFollowupDraft(v=>({...v,contactResult:e.target.value}))}><option value="">{L('اختر النتيجة','Choisir')}</option>{['تم التواصل','لم يرد','الهاتف مغلق','رقم غير صحيح','طلب التواصل لاحقًا','رفض التكوين','وافق على التكوين'].map(v=><option key={v} value={v}>{v}</option>)}</select></label><label>{L('الإجراء المطلوب','Action requise')}<textarea rows={3} value={followupDraft.requiredAction} onChange={e=>setFollowupDraft(v=>({...v,requiredAction:e.target.value}))} placeholder={L('حدد الإجراء القادم والمسؤول عنه','Précisez la prochaine action')}/></label><label>{L('ملاحظات تفصيلية','Observations détaillées')}<textarea rows={7} value={followupDraft.observations} onChange={e=>setFollowupDraft(v=>({...v,observations:e.target.value}))} placeholder={L('اكتب ملاحظات المتابعة هنا...','Saisissez les observations...')}/></label><div className={styles.dialogActions}><button type="button" onClick={()=>setFollowupDriver(null)}>{L('إلغاء','Annuler')}</button><button type="button" disabled={busy} onClick={()=>void saveFollowup()}><Save size={16}/>{L('حفظ المتابعة','Enregistrer le suivi')}</button></div></div></div>}
  {selected&&draft&&<div className={styles.overlay}><div className={styles.dialog} role="dialog" aria-modal="true"><div className={styles.dialogTop}><h3>{L('تعديل بطاقة السائق','Modifier la fiche')}</h3><button type="button" onClick={()=>setSelected(null)}><X size={19}/></button></div>{([['name',L('اسم السائق','Nom')],['phone',L('رقم الهاتف','Téléphone')],['plate',L('لوحة المركبة','Plaque')],['date',L('تاريخ التسليم','Date de remise')]] as const).map(([key,label])=><label key={key}>{label}<input value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}<div className={styles.dialogActions}><button type="button" onClick={()=>setSelected(null)}>{L('إلغاء','Annuler')}</button><button type="button" disabled={busy} onClick={()=>void saveDetails()}><Save size={16}/>{L('حفظ التعديلات','Enregistrer')}</button></div></div></div>}
  <footer className={styles.footer}><span>{L('بريستو موريتانيا — للاستخدام الداخلي · إدارة العمليات','PRESTO Mauritanie — Usage interne · Opérations')}</span><span>{L('المصدر: تقرير السائقين 10 نوفمبر 2026','Source : rapport des livreurs du 10 novembre 2026')}</span></footer>
  <div className={styles.hint}><FileText size={18}/><span>{L('تظهر البيانات الأصلية مباشرة. لحفظها في سجل التكوين المشترك اضغط «مزامنة الـ26 مع قاعدة البيانات». لا تتكرر السجلات المسجلة بالفعل.','Les 26 données source sont affichées. Synchronisez-les pour les enregistrer sans doublons.')}</span><GraduationCap size={19}/></div>
 </section>;
}

'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {Check,Download,FileText,GraduationCap,PackageCheck,Plus,RefreshCw,Save,Search,Shirt,Users} from 'lucide-react';
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
const notesWithReason=(notes:string,reason:string)=>[notes.replace(/(?:^|\n)سبب:[^\n]*/g,'').trim(),reason.trim()?'سبب: '+reason.trim():''].filter(Boolean).join('\n');
export default function PrestoUntrainedRoster({language,editable,drivers,photos}:Props){
 const ar=language==='ar';const L=(a:string,f:string)=>ar?a:f;
 const [records,setRecords]=useState<Training[]>([]);
 const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);
 const [search,setSearch]=useState('');const [error,setError]=useState('');const [success,setSuccess]=useState('');
 const [edited,setEdited]=useState<Record<string,string>>({});
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
 const full=useMemo(()=>source.map(s=>({source:s,driver:driverFor(s),training:known.get(s.phone)})).filter(v=>v.training?.training_status!=='completed'&&v.driver?.training_completed!==true),[drivers,records]);
 const filtered=full.filter(v=>[v.source.name,v.source.phone,v.source.ref,v.source.plate,reasonOf(v.training?.notes||''),edited[v.source.phone]||''].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
 const stat=[full.length,full.length,full.filter(v=>v.training?.training_status==='not_trained').length];
 const saveOne=async(entry:Source)=>{
  if(!prestoCloud||!editable)return;setBusy(true);setError('');setSuccess('');
  try{
   const existing=known.get(entry.phone);if(existing?.training_status==='completed')throw new Error(L('تم تكوين هذا السائق بالفعل.','Ce livreur est déjà formé.'));
   const notes=notesWithReason(existing?.notes||'',edited[entry.phone]??reasonOf(existing?.notes||''));
   const payload={name:entry.name,phone:entry.phone,training_status:'not_trained' as const,training_date:null,notes,app_type:'driver'};
   const result=existing?await prestoCloud.from('presto_training_records').update({notes}).eq('id',existing.id):await prestoCloud.from('presto_training_records').insert(payload);
   if(result.error)throw result.error;
   setSuccess(L('تم حفظ السائق والسبب بنجاح.','Livreur et motif enregistrés.'));await reload();
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
 const exportExcel=async()=>{
  setBusy(true);setError('');
  try{
   const {Workbook}=await import('exceljs');const wb=new Workbook();wb.creator='PRESTO';wb.title='PRESTO · Non formés';const sh=wb.addWorksheet(L('لم يقوموا بالتكوين','Non formés'),{views:[{rightToLeft:ar,state:'frozen',ySplit:10,showGridLines:false}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,printTitlesRow:'10:10'}});
   sh.columns=[{width:7},{width:31},{width:15},{width:17},{width:19},{width:15},{width:15},{width:17},{width:40},{width:20}];
   const merged=(range:string,value:string,bg:string,size:number,color='FF182321')=>{sh.mergeCells(range);const c=sh.getCell(range.split(':')[0]);c.value=value;c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.font={name:'Arial',size,bold:true,color:{argb:color}};c.alignment={vertical:'middle',horizontal:ar?'right':'left',indent:1,wrapText:true};};
   merged('A1:J1','PRESTO  |  '+L('إدارة العمليات • بريستو موريتانيا','Direction des opérations · PRESTO Mauritanie'),'FFFFEDE7',15,'FFED420F');sh.getRow(1).height=37;
   merged('A2:J3',L('السائقون — لم يتم تكوينهم بعد · استلموا الحقيبة والقميص','Livreurs — Non formés · Sac et chemise reçus'),'FFFFFFFF',21);sh.getRow(2).height=34;sh.getRow(3).height=24;
   merged('A4:J4',L('المصدر: قائمة 10 نوفمبر 2026 | عدد السائقين: ','Source : liste du 10 novembre 2026 | Livreurs : ')+filtered.length,'FFF9F4F0',11);sh.getRow(4).height=30;
   merged('A6:C6',L('في القائمة: ','Dans la liste : ')+filtered.length,'FFFFF0E9',12);
   merged('D6:F6',L('الحقيبة والقميص: ','Sac et chemise : ')+filtered.length,'FFE9F7EF',12);
   merged('G6:J6',L('التكوين: لم يتم','Formation : non effectuée'),'FFFFF0E9',12);sh.getRow(6).height=34;
   merged('A8:J8',L('الملاحظات والسبب قابلة للتعديل داخل PRESTO. تاريخ التسليم مأخوذ من تقرير PDF الأصلي.','Motifs modifiables dans PRESTO. Dates de remise provenant du PDF.'),'FFF9F4F0',10);sh.getRow(8).height=25;
   const headings=['#',L('السائق','Livreur'),L('رقم PRESTO','Référence'),L('الهاتف','Téléphone'),L('اللوحة','Plaque'),L('الحقيبة','Sac'),L('القميص','Chemise'),L('التكوين','Formation'),L('سبب','Motif'),L('سُلّم في','Remis le')];
   const head=sh.getRow(10);head.height=39;head.eachCell(()=>{});
   headings.forEach((h,i)=>{const c=head.getCell(i+1);c.value=h;c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF202F34'}};c.font={name:'Arial',size:11,bold:true,color:{argb:'FFFFFFFF'}};c.alignment={vertical:'middle',horizontal:'center',wrapText:true};});
   filtered.forEach((v,i)=>{const s=v.source;const reason=edited[s.phone]??reasonOf(v.training?.notes||'');const vals=[s.number,s.name,'#'+s.ref,s.phone,s.plate||'—','✓','✓',L('لم يتم','Non formé'),reason||'—',s.date];const row=sh.getRow(i+11);row.height=38;vals.forEach((val,j)=>{const c=row.getCell(j+1);c.value=val;c.font={name:'Arial',size:11,bold:j===1,color:{argb:j===5||j===6?'FF169B65':'FF26343A'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:i%2?'FFFFF5F1':'FFFFFFFF'}};c.alignment={horizontal:j===1||j===8?(ar?'right':'left'):'center',vertical:'middle',wrapText:true};c.border={bottom:{style:'hair',color:{argb:'FFE9DDD7'}}};});row.getCell(4).numFmt='@';});
   sh.autoFilter={from:'A10',to:'J'+(filtered.length+10)};sh.pageSetup.printArea='A1:J'+(filtered.length+10);
   const buf=await wb.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='PRESTO-non-formes-2026-11-10.xlsx';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 };
 return <section className={styles.root} dir={ar?'rtl':'ltr'}>
  <div className={styles.hero}><div className={styles.brand}><img src="/logos/presto.webp" alt="PRESTO" width={130} height={70}/><span>{L('بريستو موريتانيا · إدارة العمليات','PRESTO Mauritanie · Opérations')}<small>10 / 11 / 2026</small></span></div><div className={styles.heroBody}><span className={styles.eyebrow}>PRESTO · {L('سجل السائقين','REGISTRE DES LIVREURS')}</span><h2>{L('السائقون — لم يتم تكوينهم بعد','Livreurs — Formation non effectuée')}</h2><p>{L('استلموا الحقيبة والقميص · قائمة مرجعية مطابقة لتقرير 10 نوفمبر 2026','Sac et chemise remis · Selon le rapport du 10 novembre 2026')}</p></div></div>
  <div className={styles.metrics}><div><span>{L('في القائمة','Dans la liste')}</span><strong>{stat[0]}</strong><small>{L('سائقون','Livreurs')}</small></div><div><span>{L('الحقيبة والقميص','Sac + chemise')}</span><strong className={styles.green}>{stat[1]}</strong><small>{L('مستلمة','Reçus')}</small></div><div><span>{L('موجودون في سجل التكوين','Dans le registre')}</span><strong>{stat[2]}</strong><small>{L('حالة: غير مكوّن','Non formés')}</small></div><div><span>{L('التكوين','Formation')}</span><strong className={styles.orange}>0</strong><small>{L('منجز من هذه القائمة','Terminés sur la liste')}</small></div></div>
  <div className={styles.toolbar}><label><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={L('ابحث بالاسم، الهاتف، اللوحة أو السبب','Recherche nom, téléphone, plaque ou motif')}/></label><div><button type="button" onClick={()=>void reload()} disabled={busy}><RefreshCw size={16}/>{L('تحديث','Actualiser')}</button>{editable&&<button type="button" onClick={()=>void importAll()} disabled={busy||loading}><Plus size={16}/>{L('مزامنة الـ26 مع قاعدة البيانات','Synchroniser les 26')}</button>}<button type="button" className={styles.download} onClick={()=>void exportExcel()} disabled={busy}><Download size={17}/>{L('تنزيل Excel بنفس التصميم','Exporter Excel')}</button></div></div>
  {error&&<p className={styles.error} role="alert">{error}</p>}{success&&<p className={styles.success} role="status">{success}</p>}
  <div className={styles.tablewrap}><table className={styles.table}><thead><tr>{['#',L('السائق','Livreur'),L('الهاتف','Téléphone'),L('اللوحة','Plaque'),L('الحقيبة','Sac'),L('القميص','Chemise'),L('التكوين','Formation'),L('سبب','Motif'),L('سُلّم في','Remis le')].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{filtered.map(v=>{const s=v.source;const d=v.driver;const photo=d?.driver_photo_path?photos[d.driver_photo_path]:null;return <tr key={s.phone}><td className={styles.number}>{s.number}</td><td><div className={styles.person}><img src={photo||'/images/presto-uniform-rider.webp'} alt="" width={37} height={37}/><span><strong>{s.name}</strong><small>#{s.ref}</small></span></div></td><td dir="ltr">{s.phone}</td><td>{s.plate?<span className={styles.plate}>{s.plate}</span>:'—'}</td><td><Check className={styles.tick} size={18}/></td><td><Check className={styles.tick} size={18}/></td><td><span className={styles.notTrained}>{L('لم يتم','Non formé')}</span></td><td className={styles.reason}>{editable?<div className={styles.reasonInput}><input aria-label={L('سبب عدم التكوين لـ ','Motif pour ')+s.name} maxLength={350} value={edited[s.phone]??reasonOf(v.training?.notes||'')} onChange={e=>setEdited(old=>({...old,[s.phone]:e.target.value}))} placeholder={L('أضف سبب عدم التكوين','Ajouter le motif')}/><button type="button" title={L('حفظ السبب','Enregistrer le motif')} disabled={busy} onClick={()=>void saveOne(s)}><Save size={15}/></button></div>:<span>{reasonOf(v.training?.notes||'')||'—'}</span>}</td><td dir="ltr">{s.date}</td></tr>;})}</tbody></table></div>
  <footer className={styles.footer}><span>{L('بريستو موريتانيا — للاستخدام الداخلي · إدارة العمليات','PRESTO Mauritanie — Usage interne · Opérations')}</span><span>{L('المصدر: تقرير السائقين 10 نوفمبر 2026','Source : rapport des livreurs du 10 novembre 2026')}</span></footer>
  <div className={styles.hint}><FileText size={18}/><span>{L('تظهر البيانات الأصلية مباشرة. لحفظها في سجل التكوين المشترك اضغط «مزامنة الـ26 مع قاعدة البيانات». لا تتكرر السجلات المسجلة بالفعل.','Les 26 données source sont affichées. Synchronisez-les pour les enregistrer sans doublons.')}</span><GraduationCap size={19}/></div>
 </section>;
}

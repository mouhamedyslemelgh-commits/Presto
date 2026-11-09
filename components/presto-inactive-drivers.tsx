'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {prestoCloud} from '../lib/presto-cloud';
import styles from './presto-inactive.module.css';
import {Download,ExternalLink} from 'lucide-react';
export default function InactiveDrivers({language,editable=false}:{language:string;editable?:boolean}){
 type Row={id:number;name:string;phone:string;app_code:string;group_no:number;trained:boolean;bag_date:string;last_seen:string;answered:string;reason:string;decision:string};
 const empty={name:'',phone:'',app_code:'',group_no:1,trained:false,bag_date:'',last_seen:'',answered:'',reason:'',decision:''};
 const [rows,setRows]=useState<Row[]>([]),[draft,setDraft]=useState(empty),[editing,setEditing]=useState<number|null>(null),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(){if(!prestoCloud){setError('اتصال قاعدة البيانات غير متاح');return;}const r=await prestoCloud.from('presto_inactive_drivers').select('*').order('id');if(r.error)setError(r.error.message);else setRows(r.data||[]);}
 useEffect(()=>{if(editable)void load()},[editable]);
 async function save(e:FormEvent){e.preventDefault();if(!prestoCloud||!editable||busy)return;setBusy(true);setError('');try{const payload={...draft,name:draft.name.trim(),phone:draft.phone.trim()};const r=editing===null?await prestoCloud.from('presto_inactive_drivers').insert(payload):await prestoCloud.from('presto_inactive_drivers').update(payload).eq('id',editing);if(r.error)throw r.error;setOpen(false);setDraft(empty);setEditing(null);await load();}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 function printList(){const w=window.open('','_blank');if(!w){setError('يرجى السماح بفتح نافذة الطباعة');return;}const sheet=document.getElementById('inactive-print-sheet');if(!sheet){w.close();return;}w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>PRESTO — سائقون لديهم حقيبة ولا يعملون</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;color:#172e36}h1{color:#0c8070}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#e5f4f0}td,th{border:1px solid #b8d4cd;padding:12px 7px;text-align:right}tr{break-inside:avoid}button{display:none}h2{margin-top:24px}p{line-height:1.8}</style></head><body>'+sheet.innerHTML+'</body></html>');w.document.close();w.onload=()=>{w.focus();w.print()};}
 const ar=language==='ar';
 const source='/api/inactive-drivers/pdf';
 return <section className={`panel ${styles.root}`} dir={ar?'rtl':'ltr'}>
  <div className="panelTitle"><div><h2>{ar?'سائقون لديهم حقيبة ولا يعملون':'Livreurs avec sac sans activité'}</h2><p>{ar?'الملف الأصلي كاملًا — 6 صفحات، بجميع الصور والجداول وتعليمات المتابعة.':'Document original intégral — 6 pages, photos, tableaux et consignes de suivi.'}</p></div></div>
  <div style={{display:'flex',gap:12,flexWrap:'wrap',margin:'20px 0'}}>
   <a className="primary" href={source} download="PRESTO-inactive-drivers.pdf"><Download size={18}/>{ar?'تنزيل PDF كامل':'Télécharger le PDF complet'}</a>
   <a className="secondary" href={source} target="_blank" rel="noopener noreferrer"><ExternalLink size={18}/>{ar?'فتح جميع الصفحات':'Ouvrir toutes les pages'}</a>
  </div>
  <div className={styles.toolbar}>
   {editable&&<button className="primary" onClick={()=>{setDraft(empty);setEditing(null);setOpen(!open)}}>{ar?'إضافة سائق':'Ajouter un livreur'}</button>}
   <button className="secondary" onClick={printList}>{ar?'تنزيل القائمة المحدثة PDF / طباعة':'Exporter la liste PDF / Imprimer'}</button>
  </div>
  {error&&<p role="alert">{error}</p>}
  {open&&editable&&<form onSubmit={save} className={styles.form}>
   {(['name','phone','app_code','bag_date','last_seen','reason'] as const).map((key,i)=><label key={key}>{['الاسم','الهاتف','رقم السائق','استلم الحقيبة','آخر اتصال','السبب'][i]}<input required={key==='name'||key==='phone'} maxLength={key==='reason'?1000:150} value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}
   <label>المجموعة<select value={draft.group_no} onChange={e=>setDraft({...draft,group_no:Number(e.target.value)})}><option value={1}>1 · يتصل قليلاً</option><option value={2}>2 · لم ينجز أي طلبية</option><option value={3}>3 · عمل ثم توقف</option></select></label>
   <label>تكوّن؟<select value={String(draft.trained)} onChange={e=>setDraft({...draft,trained:e.target.value==='true'})}><option value="false">لا</option><option value="true">نعم</option></select></label>
   <label>ردّ؟<select value={draft.answered} onChange={e=>setDraft({...draft,answered:e.target.value})}><option value="">لم يتم الاتصال</option><option>نعم</option><option>لا</option></select></label>
   <label>القرار<select value={draft.decision} onChange={e=>setDraft({...draft,decision:e.target.value})}><option value="">لم يحدد</option>{['موعد للتكوين','مهلة 7 أيام','اتصالان + رسالة','يبلغ المسؤول','عاد للعمل'].map(x=><option key={x}>{x}</option>)}</select></label>
   <button className="primary" disabled={busy}>{busy?'جارٍ الحفظ…':'حفظ السائق'}</button><button type="button" className="secondary" disabled={busy} onClick={()=>setOpen(false)}>إلغاء</button>
  </form>}
  <div id="inactive-print-sheet" className={styles.sheet} dir="rtl">
   <h1>سائقون لديهم حقيبة Presto ولا يعملون</h1>
   <p>قائمة لمكتب شؤون السائقين · املأ الأعمدة الثلاثة الأخيرة بعد كل اتصال.</p>
   <p><strong>أولاً: انظر عمود «تكوّن؟»</strong><br/>لم يتكوّن: حدّد معه يوماً وساعة للحضور إلى المكتب للتكوين، أو إعادة الحقيبة.<br/>تكوّن: اسأله لماذا لا يتصل أو لا يعمل، ثم طبّق قاعدة مجموعته.</p>
   <p>المجموعة 1: شجّعه على الاتصال وقت الغداء أو العشاء، وفريق الدعم يساعده في أول طلبية.<br/>المجموعة 2: إذا قال سأبدأ، مهلة 7 أيام. إذا لم يردّ، اتصالان ثم الرسالة. إذا تعذّر العمل أو بقي دون ردّ، يُبلّغ المسؤول.<br/>المجموعة 3: اسأله عن السبب وشجّعه على العودة.<br/><strong>لا يتم استرجاع أي حقيبة بالقوة؛ القرار للمسؤول.</strong></p>
   <p>الرسالة بعد اتصالين بدون ردّ: «السلام عليكم، معك فريق Presto. حاولنا الاتصال بك. لديك حقيبة Presto ولم تبدأ العمل بعد. نرجو أن تتصل بنا لنساعدك على أول طلبية. شكراً.»</p>
   {[1,2,3].map(g=><div key={g}><h2>المجموعة {g} · {['يتصلون قليلاً','لا يتصلون ولم ينجزوا أي طلبية','عملوا من قبل ثم توقفوا'][g-1]} ({rows.filter(r=>r.group_no===g).length})</h2><div className={styles.scroll}><table><thead><tr>{['السائق','الهاتف','استلم الحقيبة','تكوّن؟','آخر اتصال','ردّ؟','السبب','القرار'].map(x=><th key={x}>{x}</th>)}{editable&&<th>تعديل</th>}</tr></thead><tbody>{rows.filter(r=>r.group_no===g).map(r=><tr key={r.id}><td>{r.name}<br/><small>#{r.app_code}</small></td><td dir="ltr">{r.phone}</td><td>{r.bag_date}</td><td>{r.trained?'نعم':'لا'}</td><td>{r.last_seen}</td><td>{r.answered||'☐ نعم  ☐ لا'}</td><td>{r.reason}</td><td>{r.decision||'☐ موعد للتكوين · ☐ مهلة 7 أيام · ☐ اتصالان + رسالة · ☐ يبلغ المسؤول · ☐ عاد للعمل'}</td>{editable&&<td><button className="secondary" onClick={()=>{const {id,...values}=r;setDraft(values);setEditing(id);setOpen(true)}}>تعديل</button></td>}</tr>)}</tbody></table></div></div>)}
   {rows.length===0&&<p>لا توجد إضافات في السجل بعد. القائمة الأصلية كاملة متاحة أدناه.</p>}
  </div>
  <details><summary>{ar?'عرض الملف الأصلي كاملاً':'Afficher le document original'}</summary>
  <object data={source} type="application/pdf" width="100%" height="1000" style={{border:'1px solid #eee',borderRadius:16,background:'#f4f4f4',maxHeight:'80vh'}} aria-label={ar?'الملف الأصلي للسائقين غير النشطين':'Document original des livreurs inactifs'}>
   <p>{ar?'اضغط لفتح الملف كاملًا على جهازك:':'Ouvrez le document complet :'} <a href={source} target="_blank" rel="noopener noreferrer">PDF · 6 {ar?'صفحات':'pages'}</a></p>
  </object></details>
 </section>;
}

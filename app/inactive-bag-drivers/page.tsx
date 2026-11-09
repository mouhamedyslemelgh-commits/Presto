'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import PrestoAuthGate from '../../components/presto-auth-gate';

type FollowUp={answered:''|'نعم'|'لا';reason:string;decision:string;date:string};
const groups=[
 {title:'يتصلون قليلاً: آخر اتصال منذ أكثر من 3 أيام، دون أي طلبية',goal:'تشجيع السائق على الاتصال وقت الغداء أو العشاء. فريق الدعم يعطيه أول طلبية عندما يتصل.',ids:'7058 6642 5811 6346 6230 7496 7461 7319 7471 7561 7359 6701 6696 7596'.split(' ')},
 {title:'لا يتصلون ولم ينجزوا أي طلبية',goal:'معرفة السبب ومساعدته على البدء. لا تُسترجع الحقيبة إلا بقرار من المسؤول.',ids:'7502 6233 7272 6128 6231 6588 6543 6225 5931 5940 5763 5765 6436 6996 6345 6498 6640 7363 6697 7455 7192 6990 7628 7550 7551 7507 7503 7505 7151 5934 6544 7515'.split(' ')},
 {title:'عملوا ثم توقفوا',goal:'معرفة سبب التوقف وتشجيع السائق على العودة إلى العمل.',ids:'6222 5622 5764'.split(' ')}
];
const decisions=['موعد للتكوين','مهلة 7 أيام','اتصالان + رسالة','يُبلّغ المسؤول','عاد للعمل'];
const key='presto-inactive-bag-followups-20261109';
const dbName='presto-confidential-documents';
function openDb():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(dbName,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('docs'))request.result.createObjectStore('docs')};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
}
async function writePdf(pdf:ArrayBuffer){
 const db=await openDb();
 await new Promise<void>((resolve,reject)=>{const tx=db.transaction('docs','readwrite');tx.objectStore('docs').put(pdf,'inactive-bag-roster');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});
 db.close();
}
async function readPdf():Promise<ArrayBuffer|undefined>{
 const db=await openDb();const result=await new Promise<ArrayBuffer|undefined>((resolve,reject)=>{const tx=db.transaction('docs','readonly');const request=tx.objectStore('docs').get('inactive-bag-roster');request.onsuccess=()=>resolve(request.result as ArrayBuffer|undefined);request.onerror=()=>reject(request.error)});db.close();return result;
}
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
function Roster(){
 const [pdf,setPdf]=useState<ArrayBuffer|null>(null);
 const [url,setUrl]=useState('');
 const [status,setStatus]=useState('');
 const [rows,setRows]=useState<Record<string,FollowUp>>({});
 const [selected,setSelected]=useState(0);
 const [search,setSearch]=useState('');
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  try{const data=localStorage.getItem(key);if(data){const parsed:unknown=JSON.parse(data);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))setRows(parsed as Record<string,FollowUp>);}}catch{}
  void readPdf().then(x=>{if(x)setPdf(x)}).catch(()=>{});
  setReady(true);
 },[]);
 useEffect(()=>{if(ready){try{localStorage.setItem(key,JSON.stringify(rows))}catch{setStatus('تعذر حفظ المتابعات في هذا المتصفح. نزّل نسخة احتياطية.')}}},[ready,rows]);
 useEffect(()=>{if(!pdf)return;const objectUrl=URL.createObjectURL(new Blob([pdf],{type:'application/pdf'}));setUrl(objectUrl);return()=>URL.revokeObjectURL(objectUrl)},[pdf]);
 const update=(id:string,field:keyof FollowUp,value:string)=>setRows(old=>({...old,[id]:{answered:'',reason:'',decision:'',date:'',...old[id],[field]:value}}));
 const count=groups.reduce((sum,g)=>sum+g.ids.length,0);
 const completed=useMemo(()=>Object.values(rows).filter(x=>x.answered||x.reason||x.decision).length,[rows]);
 const importPdf=async(event:React.ChangeEvent<HTMLInputElement>)=>{
  const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(!file)return;
  if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){setStatus('اختر ملف PDF صحيحًا.');return;}
  if(file.size>30*1024*1024){setStatus('الحد الأقصى لحجم الملف 30 ميغابايت.');return;}
  try{const bytes=await file.arrayBuffer();if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('صيغة غير صحيحة');await writePdf(bytes);setPdf(bytes);setStatus('حُفظ ملف PDF الأصلي في هذا المتصفح دون رفع أرقام السائقين إلى مستودع عام.');}
  catch{setStatus('تعذر قراءة الملف أو حفظه. تحقق من مساحة المتصفح.');}
 };
 const exportBackup=()=>download(new Blob([JSON.stringify({format:key,exportedAt:new Date().toISOString(),rows},null,2)],{type:'application/json'}),'PRESTO-متابعة-السائقين.json');
 const restoreBackup=async(event:React.ChangeEvent<HTMLInputElement>)=>{
  const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(!file)return;
  try{if(file.size>1_000_000)throw Error('too large');const payload:unknown=JSON.parse(await file.text());if(!payload||typeof payload!=='object')throw Error('invalid');const data=payload as {format?:string;rows?:Record<string,FollowUp>};if(data.format!==key||!data.rows||typeof data.rows!=='object')throw Error('invalid');if(!confirm('استبدال متابعة السائقين الحالية بملف النسخة الاحتياطية؟'))return;setRows(data.rows);setStatus('تم استيراد المتابعة.');}catch{setStatus('ملف المتابعة غير صالح.');}
 };
 const visible=groups.map((group,i)=>({...group,index:i,ids:group.ids.filter(id=>id.includes(search))})).filter(g=>selected===0||g.index===selected-1);
 return <main className="prestoBagReport" dir="rtl">
 <style>{`
 .prestoBagReport{font-family:Tahoma,Arial,sans-serif;max-width:1280px;margin:0 auto;padding:22px;background:#fff;color:#222;min-height:100vh}
 .prestoBagReport *{box-sizing:border-box}.prestoBagReport .redLine{height:6px;background:#ff401e;border-radius:6px;margin:0 0 20px}.prestoBagReport h1{font-size:26px;margin:0 0 7px}.prestoBagReport p.note{color:#777;font-size:12px}
 .prestoBagReport .instructions{background:#faf9f8;border:1px solid #e0deda;border-radius:10px;padding:15px 20px;font-size:13px;line-height:1.9}.prestoBagReport .instructions strong{color:#dd401e}
 .prestoBagReport .actions{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin:18px 0}.prestoBagReport button,.prestoBagReport .btn,.prestoBagReport .actions label{background:#fff;border:1px solid #ddd;padding:10px 12px;border-radius:8px;color:#222;cursor:pointer;font:inherit;font-size:12px;text-decoration:none}
 .prestoBagReport .actions button.primary,.prestoBagReport .actions label.primary{background:#e84520;color:#fff;border-color:#e84520}.prestoBagReport .actions input[type=file]{display:none}.prestoBagReport .actions input[type=search],.prestoBagReport .actions select{padding:10px;border:1px solid #ddd;border-radius:8px}
 .prestoBagReport .message{padding:10px;background:#f0f7fa;border-radius:8px;font-size:12px}.prestoBagReport .viewer{width:100%;height:76vh;min-height:500px;border:1px solid #ddd;border-radius:8px;background:#f6f6f6}
 .prestoBagReport .emptyPdf{border:2px dashed #ddd;border-radius:10px;padding:40px;text-align:center;color:#666}.prestoBagReport h2{font-size:17px;border-right:5px solid #2867cc;padding-right:12px;margin:27px 0 10px}.prestoBagReport h2 b{background:#2867cc;color:#fff;border-radius:5px;padding:3px 8px;margin-left:10px}.prestoBagReport .g2 h2{border-color:#df4c24}.prestoBagReport .g2 h2 b{background:#df4c24}.prestoBagReport .g3 h2{border-color:#777}.prestoBagReport .g3 h2 b{background:#777}
 .prestoBagReport .scroll{overflow-x:auto}.prestoBagReport table{width:100%;border-collapse:collapse;text-align:right;font-size:12px;min-width:680px}.prestoBagReport th{background:#fafafa;border-bottom:2px solid #333;padding:10px}.prestoBagReport td{border-bottom:1px solid #ddd;padding:8px}.prestoBagReport td input:not([type=radio]),.prestoBagReport td select{width:100%;padding:7px;border:1px solid #ddd;border-radius:5px;background:#fff;font:inherit}.prestoBagReport td.code{font-weight:bold;direction:ltr;text-align:center}.prestoBagReport .privacy{font-size:12px;color:#777;margin:26px 0}
 @media print{@page{size:A4 landscape;margin:11mm}.prestoBagReport{max-width:none;padding:0}.prestoBagReport .actions,.prestoBagReport .viewer,.prestoBagReport .emptyPdf,.prestoBagReport .message,.prestoBagReport .privacy{display:none!important}.prestoBagReport h1{font-size:18px}.prestoBagReport .instructions{font-size:10px}.prestoBagReport table{min-width:0;font-size:9px}.prestoBagReport tr{break-inside:avoid}.prestoBagReport th,.prestoBagReport td{padding:5px}.prestoBagReport td input,.prestoBagReport td select{border:0!important;padding:0!important;background:transparent!important}}
 `}</style>
 <div className="redLine"/>
 <h1>سائقون لديهم حقيبة Presto ولا يعملون</h1>
 <p className="note">مكتب شؤون السائقين · بيانات التقرير الأصلي 09/11 الساعة 00:06 · {count} سائقًا في ثلاث مجموعات</p>
 <div className="instructions"><strong>أولاً: انظر عمود «تكوّن؟» في الملف الأصلي.</strong><div>• <strong>لم يتكوّن (لا):</strong> عليه الحضور للمكتب للتكوين في أقرب وقت أو إعادة الحقيبة؛ حدد معه يومًا وساعة.</div><div>• <strong>تكوّن (نعم):</strong> اسأله لماذا لا يتصل أو لا يعمل، ثم طبق قاعدة مجموعته.</div><strong>ثانيًا: قاعدة كل مجموعة</strong><div>• <strong>المجموعة 1:</strong> شجعه على الاتصال وقت الغداء أو العشاء، والدعم يعطيه أول طلبية.</div><div>• <strong>المجموعة 2:</strong> إذا قال «سأبدأ»: مهلة 7 أيام. إذا قال «لا أستطيع»: إبلاغ المسؤول. إذا لم يرد: اتصالان ثم الرسالة ثم إبلاغ المسؤول.</div><div>• <strong>المجموعة 3:</strong> اسأله عن سبب التوقف وشجعه على العودة.</div><div><strong>مهم:</strong> لا يتم استرجاع حقيبة بالقوة؛ القرار للمسؤول.</div><div><strong>الرسالة:</strong> «السلام عليكم، معك فريق Presto. حاولنا الاتصال بك. لديك حقيبة Presto ولم تبدأ العمل بعد. نرجو أن تتصل بنا لنساعدك على أول طلبية. شكرًا».</div></div>
 <div className="actions"><Link className="btn" href="/">العودة إلى PRESTO</Link><label className="primary">تحميل PDF الأصلي إلى المكتب<input type="file" accept="application/pdf,.pdf" onChange={importPdf}/></label><button type="button" disabled={!pdf} onClick={()=>{if(pdf)download(new Blob([pdf],{type:'application/pdf'}),'Presto-سائقون-لديهم-حقيبة-ولا-يعملون.pdf')}}>تنزيل PDF الأصلي (6 صفحات)</button><button className="primary" type="button" onClick={()=>window.print()}>طباعة / حفظ متابعة PDF</button><button type="button" onClick={exportBackup}>نسخة احتياطية للمتابعة</button><label>استعادة المتابعة<input type="file" accept=".json,application/json" onChange={restoreBackup}/></label></div>
 {status&&<p className="message" role="status">{status}</p>}
 <h2>الوثيقة الأصلية — بنفس التصميم والصفحات تمامًا</h2>
 {url?<iframe title="ملف السائقين الأصلي" className="viewer" src={url}/>:<div className="emptyPdf">أضف ملف PDF المرفق مرة واحدة من زر «تحميل PDF الأصلي». سيُحفظ محليًا في هذا المتصفح ويظهر هنا بكل صفحاته وصوره وأعمدته، دون نشر أرقام الهواتف على GitHub.</div>}
 <div className="actions"><input type="search" value={search} onChange={e=>setSearch(e.target.value.trim())} placeholder="ابحث برقم السائق #..." aria-label="البحث برقم السائق"/><select value={selected} onChange={e=>setSelected(Number(e.target.value))} aria-label="تصفية المجموعات"><option value={0}>كل المجموعات</option>{groups.map((g,i)=><option value={i+1} key={i}>المجموعة {i+1}</option>)}</select><span>المتابعات المسجّلة: {completed} من {count}</span></div>
 {visible.map(group=>group.ids.length?<section key={group.index} className={'g'+(group.index+1)}><h2><b>{group.ids.length}</b> المجموعة {group.index+1} · {group.title}</h2><p className="note">{group.goal}</p><div className="scroll"><table><thead><tr><th>#</th><th>رقم السائق في PDF</th><th>هل ردّ؟</th><th>السبب</th><th>القرار</th><th>تاريخ المتابعة</th></tr></thead><tbody>{group.ids.map((id,i)=><tr key={id}><td>{i+1}</td><td className="code">#{id}</td><td><select value={rows[id]?.answered||''} onChange={e=>update(id,'answered',e.target.value)} aria-label={'ردّ '+id}><option value="">—</option><option value="نعم">نعم</option><option value="لا">لا</option></select></td><td><input aria-label={'سبب '+id} maxLength={1000} value={rows[id]?.reason||''} onChange={e=>update(id,'reason',e.target.value)}/></td><td><select aria-label={'قرار '+id} value={rows[id]?.decision||''} onChange={e=>update(id,'decision',e.target.value)}><option value="">—</option>{decisions.map(d=><option key={d}>{d}</option>)}</select></td><td><input aria-label={'تاريخ '+id} type="date" value={rows[id]?.date||''} onChange={e=>update(id,'date',e.target.value)}/></td></tr>)}</tbody></table></div></section>:null)}
 <p className="privacy">الحقيبة ملك لـ Presto وأمانة عند السائق كما وُقّع عند استلامها. وثيقة داخلية تحتوي على أرقام هواتف. لا تُرفع الوثيقة إلى مستودع GitHub العام. يُحفظ ملف PDF والمتابعات داخل هذا المتصفح فقط، مع خيار تنزيل نسخة احتياطية؛ لا توجد مزامنة تلقائية بين الأجهزة.</p>
 </main>;
}
export default function InactiveBagDriversPage(){return <PrestoAuthGate><Roster/></PrestoAuthGate>}

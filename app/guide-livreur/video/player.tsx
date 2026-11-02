'use client';

import {useRef,useState,useEffect} from 'react';
import {Play,Pause,Volume2,VolumeX,Maximize,Download,CheckCircle2,BookOpen,ExternalLink,ChevronLeft,RotateCcw,Subtitles,Clock3,Film,Headphones,ShieldCheck} from 'lucide-react';
import css from './video.module.css';

const VIDEO_URL='https://media.base44.com/videos/public/6ae8bd09dac4efaf96cc7645/bc7d61fd2_PRESTO_Driver_Training_FullHD.mp4';
const chapters=[
 {time:0,title:'مرحباً بك في PRESTO',brief:'تعرف على خدمة التوصيل ودور السائق'},
 {time:13,title:'تطبيقان وخدمة واحدة',brief:'تطبيق للزبون وآخر خاص بالسائق'},
 {time:27,title:'دورك كسائق PRESTO',brief:'الاحتراف واحترام المطعم والزبون'},
 {time:39,title:'تجهيز نفسك قبل العمل',brief:'الهاتف، الإنترنت، المركبة والحقيبة'},
 {time:52,title:'استقبال الطلب الجديد',brief:'قراءة اسم المطعم ورقم الطلب'},
 {time:65,title:'بدء الرحلة',brief:'متى تضغط على زر بدء الرحلة'},
 {time:77,title:'فتح خريطة المطعم',brief:'اضغط اسم المطعم لفتح Google Maps'},
 {time:92,title:'وصلت للمطعم',brief:'تأكيد وصولك والتعريف بنفسك'},
 {time:105,title:'التحقق من الأصناف',brief:'رقم الطلب، العدد، المشروبات والتغليف'},
 {time:120,title:'تأكيد الاستلام',brief:'بعد التحقق ووضع الطلب في الحقيبة'},
 {time:134,title:'فتح خريطة الزبون',brief:'اضغط الزبون للوصول إلى عنوانه'},
 {time:149,title:'وصلت للزبون',brief:'إشعار الزبون ووصولك الفعلي'},
 {time:163,title:'تسليم الطلب والدفع',brief:'التسليم ورد باقي المبلغ'},
 {time:178,title:'تم التوصيل للزبون',brief:'التأكيد فقط بعد التسليم والدفع'},
 {time:192,title:'أجرتك وعمولة 0%',brief:'الجدول حسب مسافة التوصيل'},
 {time:209,title:'مثال على احتساب الأجرة',brief:'تعرف على شريحة الرحلة'},
 {time:224,title:'أرباحك ومال العملاء',brief:'الفصل بين حقك والأموال المستحقة'},
 {time:241,title:'التسوية عبر Bankily',brief:'المبلغ الواجب تسليمه وإثبات الدفع'},
 {time:258,title:'محفظة الزبون',brief:'كيف تتعامل مع نقص الصرف'},
 {time:274,title:'الزبون لا يجيب',brief:'اتصالات ورسائل ثم الدعم'},
 {time:289,title:'العنوان خاطئ أو بعيد',brief:'لا تطلب رسومًا إضافية'},
 {time:303,title:'تأخر المطعم أو نقص الطلب',brief:'الانتظار الهادئ وطلب الدعم'},
 {time:317,title:'رفض الطلب أو تعطل التطبيق',brief:'ماذا تفعل قبل التأكيد أو الإلغاء'},
 {time:332,title:'السلامة والاحتراف',brief:'القيادة الآمنة واحترام خصوصية الزبون'},
 {time:347,title:'مراجعة أخيرة',brief:'كل نقرة في وقتها، والدعم أولاً'}
];
const length=365;
const format=(n:number)=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');

export default function PrestoVideoPlayer(){
 const player=useRef<HTMLVideoElement|null>(null);
 const [current,setCurrent]=useState(0);
 const [duration,setDuration]=useState(length);
 const [paused,setPaused]=useState(true);
 const [muted,setMuted]=useState(false);
 const [captions,setCaptions]=useState(true);
 const [speed,setSpeed]=useState(1);
 const [showChapters,setShowChapters]=useState(true);
 const [issue,setIssue]=useState('');
 const index=chapters.reduce((best,item,i)=>item.time<=current?i:best,0);
 const selected=chapters[index];
 const seek=(seconds:number)=>{
  if(!player.current)return;
  player.current.currentTime=seconds;setCurrent(seconds);setIssue('');
  void player.current.play().then(()=>setPaused(false)).catch(()=>setPaused(true));
 };
 const play=()=>{
  if(!player.current)return;
  if(player.current.paused){void player.current.play().then(()=>setPaused(false)).catch(()=>setIssue('اضغط على شاشة الفيديو للسماح بالتشغيل.'))}
  else{player.current.pause();setPaused(true)}
 };
 const fullscreen=()=>{const el=player.current;if(el?.requestFullscreen)void el.requestFullscreen()};
 useEffect(()=>{if(player.current)player.current.playbackRate=speed},[speed]);
 return <main className={css.page} dir="rtl">
  <header className={css.top}><a className={css.brand} href="/"><span>P</span><strong>PRESTO <small>ACADEMY</small></strong></a><a className={css.back} href="/guide-livreur"><ChevronLeft size={17}/> الدليل التفاعلي</a></header>
  <section className={css.hero}>
   <span className={css.eyebrow}><Film size={14}/> دليل السائق الرسمي · فيديو توضيحي</span>
   <h1>تعلم تطبيق PRESTO من أول طلب إلى أول أرباحك</h1>
   <p>25 مشهدًا توضيحيًا، خطوة بخطوة: المطعم، الخرائط، الاستلام، الزبون، الدفع، الأرباح، Bankily والمشكلات.</p>
   <div className={css.stats}><span><Film size={16}/> Full HD 1080p</span><span><Clock3 size={16}/> 6:05 دقائق</span><span><BookOpen size={16}/> 25 درسًا</span></div>
  </section>
  <div className={css.grid}>
   <article className={css.videoCard}>
    <div className={css.videoTop}><span className={css.liveDot}/> PRESTO DRIVER MASTERCLASS <span className={css.chip}>الفصل {index+1} من 25</span></div>
    <div className={css.stage}>
     <video ref={player} src={VIDEO_URL} playsInline preload="metadata" controls={false}
      onTimeUpdate={e=>setCurrent(e.currentTarget.currentTime)}
      onLoadedMetadata={e=>setDuration(e.currentTarget.duration||length)}
      onPlay={()=>setPaused(false)} onPause={()=>setPaused(true)}
      onEnded={()=>setPaused(true)}
      onError={()=>setIssue('تعذر تحميل الفيديو. تحقق من اتصال الإنترنت ثم أعد المحاولة.')}
      muted={muted}
      className={css.video}/>
     {paused&&<button type="button" className={css.bigPlay} onClick={play} aria-label="تشغيل الفيديو"><Play size={32} fill="currentColor"/></button>}
     {captions&&<div className={css.chapterCaption}><span className={css.chapterBadge}>{String(index+1).padStart(2,'0')}</span><div><strong>{selected.title}</strong><small>{selected.brief}</small></div></div>}
    </div>
    <div className={css.controls}>
     <div className={css.progressControl}><input type="range" min="0" max={duration||length} step="0.1" value={Math.min(duration,current)} aria-label="تقدم الفيديو" onChange={e=>{if(player.current){player.current.currentTime=Number(e.target.value);setCurrent(Number(e.target.value))}}}/><span dir="ltr">{format(current)} / {format(duration||length)}</span></div>
     <div className={css.buttonRow}>
      <button type="button" className={css.primary} onClick={play}>{paused?<><Play size={17}/> تشغيل</>:<><Pause size={17}/> إيقاف مؤقت</>}</button>
      <button type="button" onClick={()=>setMuted(v=>!v)} aria-label={muted?'تشغيل الصوت':'كتم الصوت'} title={muted?'تشغيل الصوت':'كتم الصوت'}>{muted?<VolumeX size={19}/>:<Volume2 size={19}/>}</button>
      <button type="button" onClick={()=>setCaptions(v=>!v)} aria-label="إظهار نص المشهد" title="إظهار نص المشهد"><Subtitles size={19}/></button>
      <button type="button" onClick={()=>seek(0)} aria-label="إعادة" title="إعادة"><RotateCcw size={18}/></button>
      <button type="button" onClick={fullscreen} aria-label="ملء الشاشة" title="ملء الشاشة"><Maximize size={19}/></button>
      <select aria-label="سرعة الفيديو" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select>
      <a className={css.download} href={VIDEO_URL} target="_blank" rel="noopener noreferrer" download><Download size={16}/> تنزيل MP4</a>
     </div>
    </div>
    {issue&&<p className={css.issue} role="status">{issue}</p>}
    <div className={css.lessonExplainer}><span>ما الذي تتعلمه الآن؟</span><h2>{selected.title}</h2><p>{selected.brief}</p><div className={css.navLesson}><button disabled={index===0} onClick={()=>seek(chapters[Math.max(0,index-1)].time)}>السابق</button><button disabled={index>=chapters.length-1} onClick={()=>seek(chapters[Math.min(chapters.length-1,index+1)].time)}>المشهد التالي <ChevronLeft size={15}/></button></div></div>
    <div className={css.disclaimer}><Headphones size={20}/><div><strong>ملاحظة عن الصوت</strong><p>هذا ملف الفيديو المصمم بدقة 1080p مع موسيقى ونصوص تعليمية. التعليق الجديد بصوت صاحب التسجيل لم يُنتج بعد، والتسجيل الأصلي لا يُنشر منفردًا. للاستماع إلى شرح آلي مستمر يمكن فتح <a href="/guide-livreur">الدليل التفاعلي</a>.</p></div></div>
   </article>
   <aside className={css.sidebar}>
    <div className={css.sidebarHead}><div><small>LEARNING TRACK</small><h3>فصول الفيديو</h3></div><span>{chapters.length} مشهدًا</span></div>
    <div className={css.chapterScroll}>{chapters.map((item,i)=><button key={i} type="button" className={[css.lesson,i===index?css.active:'',i<index?css.done:''].join(' ')} onClick={()=>seek(item.time)}><span className={css.num}>{i<index?<CheckCircle2 size={15}/>:String(i+1).padStart(2,'0')}</span><span className={css.lessonText}><strong>{item.title}</strong><small>{item.brief}</small></span><time dir="ltr">{format(item.time)}</time></button>)}</div>
    <a className={css.sideLink} href="/guide-livreur"><BookOpen size={18}/> شاهد الدليل التفاعلي بصوت المتصفح <ExternalLink size={15}/></a>
   </aside>
  </div>
  <footer className={css.footer}>© PRESTO Academy · فيديو تدريبي توضيحي. عند الاختلاف، اتبع تعليمات التطبيق وسياسات الإدارة.</footer>
 </main>;
}

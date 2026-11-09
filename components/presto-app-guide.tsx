'use client';
import {useRef,useState} from 'react';
import {BookOpen,PlayCircle,Monitor,Smartphone,MapPin,CheckCircle2,Navigation,Volume2,ExternalLink} from 'lucide-react';

const steps=[
 {time:0,title:'استقبال الرحلة',detail:'عند ظهور رقم الرحلة واسم المطعم، راجع المعلومات ثم اضغط «استمرار» للانتقال إلى الطلب.'},
 {time:58,title:'تفاصيل المطعم والطلب',detail:'تعرّف على اسم المطعم، موقعه، رقم الطلب، وزر «تفاصيل الطلب» قبل التحرك.'},
 {time:99,title:'زر «وصلت»',detail:'عند الوصول فعليًا إلى المطعم اضغط «وصلت». لا تضغط الزر قبل الوصول.'},
 {time:157,title:'متابعة حالة الزبون',detail:'راجع عناصر الطلب ومعلومات الزبون ووقت الانتظار المعروض، ثم اتبع تعليمات التطبيق.'},
 {time:207,title:'فتح خرائط Google',detail:'افتح التوجيه، راجع الوجهة والمسار المقترح، وانتبه إلى الطريق بدل استخدام الهاتف أثناء القيادة.'},
 {time:315,title:'وقت الانتظار والتأكيد',detail:'يظهر اختيار مدة الانتظار وزر «تأكيد». حدد المدة الصحيحة ثم أكد فقط إذا كانت الحالة مطابقة للواقع.'},
];
const buttons=[
 ['مفعّل','يدل على أن حالة العمل نشطة. تحقق منها قبل استقبال الطلبات.'],
 ['القائمة ☰','تفتح قائمة التطبيق وخياراته؛ تختلف العناصر بحسب الصلاحيات وإصدار التطبيق.'],
 ['نواكشوط','يعرض المدينة أو نطاق العمل الذي تحدده واجهة السائق.'],
 ['استمرار','ينقلك من إشعار الرحلة إلى المرحلة التالية من التعامل مع الطلب.'],
 ['تفاصيل الطلب','لفتح معلومات الطلب ومراجعة بياناته.'],
 ['وصلت','لتأكيد وصول السائق إلى نقطة الاستلام، لا لتأكيد تسليم الطلب.'],
 ['الخريطة / تحديد الموقع','لمشاهدة موقعك والوجهة، وقد تحتاج إلى السماح باستخدام الموقع الجغرافي.'],
 ['ابدأ في Google Maps','يبدأ الإرشاد الملاحي على الهاتف، وقد تختلف التسمية بحسب الجهاز.'],
 ['25 / 50 / 75 دقيقة','خيارات للمدة الظاهرة في جزء الانتظار بالفيديو؛ اختر ما يطابق الحالة الحقيقية.'],
 ['تأكيد','يحفظ الاختيار أو ينفذ الإجراء المعروض بعد مراجعة المعلومات.']
];
export default function PrestoAppGuide({language='ar'}:{language?:string}){
 const player=useRef<HTMLVideoElement>(null);
 const [selected,setSelected]=useState(0);
 const [failed,setFailed]=useState(false);
 const ar=language==='ar';
 const seek=(index:number)=>{setSelected(index);if(player.current){player.current.currentTime=steps[index].time;void player.current.play().catch(()=>{});}};
 return <section className="prestoGuide" dir={ar?'rtl':'ltr'}>
  <div className="prestoGuideHero"><span className="prestoGuideEyebrow"><BookOpen size={17}/> PRESTO · PRESTOMAN</span>
   <h2>{ar?'دليل استخدام تطبيق السائق خطوة بخطوة':'Guide de l’application livreur — pas à pas'}</h2>
   <p>{ar?'شرح عملي مبني على تسجيل شاشة تطبيق السائق: من استقبال الرحلة ومعلومات المطعم إلى الوصول والتوجيه والموافقة على مدة الانتظار.':'Guide visuel du livreur, de la réception de la course au restaurant, à la navigation et à la confirmation.'}</p>
   <div className="prestoGuideTags"><span><Smartphone size={15}/> {ar?'تسجيل من الهاتف':'Vidéo mobile'}</span><span><Monitor size={15}/> {ar?'عرض على الكمبيوتر':'Lecture sur ordinateur'}</span><span><PlayCircle size={15}/> 06:10</span></div>
  </div>
  <div className="prestoGuideLayout">
   <div className="prestoGuideCinema"><div className="prestoGuidePlayer">
    <video ref={player} controls playsInline preload="metadata" poster="/images/presto-uniform-rider.webp" onError={()=>setFailed(true)} aria-label={ar?'فيديو شرح تطبيق بريستو للسائق':'Vidéo de formation PRESTO'}><source src="/training/prestoman-driver-guide.mp4" type="video/mp4"/>{ar?'المتصفح لا يدعم تشغيل الفيديو':'Vidéo non prise en charge'}</video>
   </div><p className="prestoGuideNote">{ar?'اضغط على أي فصل للانتقال إلى اللحظة المناسبة في الفيديو. يمكنك استخدام زر ملء الشاشة لمشاهدته على الكمبيوتر.':'Cliquez sur un chapitre pour avancer dans la vidéo ; vous pouvez activer le plein écran.'}</p>
   {failed&&<p className="prestoGuideWarning" role="status">{ar?'ملف الفيديو غير متاح حاليًا على خادم الموقع. يجب رفع الملف باسم public/training/prestoman-driver-guide.mp4 أو ربطه بمصدر تخزين آمن. الشرح النصي متاح أدناه.':'La vidéo doit être publiée sous public/training/prestoman-driver-guide.mp4 ou liée à un hébergement vidéo sécurisé.'}</p>}
   </div>
   <div className="prestoGuideChapters"><h3>{ar?'فصول الفيديو':'Chapitres de la vidéo'}</h3>{steps.map((s,i)=><button type="button" key={s.time} className={'prestoGuideChapter '+(selected===i?'isActive':'')} onClick={()=>seek(i)}><span className="prestoGuideTime">{String(Math.floor(s.time/60)).padStart(2,'0')}:{String(s.time%60).padStart(2,'0')}</span><span><strong>{s.title}</strong><small>{s.detail}</small></span><PlayCircle size={18}/></button>)}</div>
  </div>
  <div className="prestoGuideHeading"><h3>{ar?'شرح أزرار Prestoman':'Boutons Prestoman expliqués'}</h3><p>{ar?'تعريف وظيفة كل زر ظهر في التسجيل، مع التنبيه إلى أن شكل التطبيق قد يتغير عند التحديث.':'Fonctions des boutons visibles dans l’enregistrement.'}</p></div>
  <div className="prestoGuideButtons">{buttons.map(([name,description])=><article key={name}><span><CheckCircle2 size={17}/></span><div><strong>{name}</strong><p>{description}</p></div></article>)}</div>
  <div className="prestoGuideSafety"><Navigation size={22}/><div><strong>{ar?'ملاحظة مهمة للسائق':'Consigne de sécurité'}</strong><p>{ar?'تأكد من رقم الطلب والعنوان واسم المطعم قبل تغيير حالته. لا تستخدم الهاتف أثناء قيادة الدراجة، واستعمل الملاحة بأمان. الإجراءات المعروضة مستندة إلى الفيديو المرفق ولا تمثل جميع وظائف Prestoman.':'Vérifiez la commande et la destination avant de modifier son statut. N’utilisez pas le téléphone en conduisant. Ce guide couvre la vidéo fournie, pas toutes les fonctionnalités de Prestoman.'}</p></div></div>
 </section>;
}

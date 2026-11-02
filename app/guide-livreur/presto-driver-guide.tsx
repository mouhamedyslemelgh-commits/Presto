'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronLeft,ChevronRight,Globe2,Headphones,MapPin,Navigation,PackageCheck,Pause,Play,RotateCcw,ShieldCheck,Smartphone,Store,Truck,UserRound,Volume2,VolumeX,Wallet,Phone,Clock3} from 'lucide-react';
import styles from './guide.module.css';

type Lang='ar'|'fr';
type Screen='apps'|'customer'|'order'|'restaurantMap'|'restaurant'|'pickup'|'customerMap'|'arrival'|'delivery'|'money'|'support'|'complete';
type Lesson={screen:Screen;ar:string;fr:string;captionAr:string;captionFr:string;voiceAr:string;voiceFr:string};
const lessons:Lesson[]=[
 {screen:'apps',ar:'بريستو فيها تطبيقان',fr:'Presto a deux applications',captionAr:'تطبيق للزبون وتطبيق لك أنت السائق',captionFr:'Une application client et une application livreur',voiceAr:'مرحباً بك في بريستو! عندنا تطبيق للزبون يطلب منه الطعام والمنتجات، وتطبيق خاص بك أنت السائق. من تطبيقك تصلك الطلبات وتعرف المطعم والزبون، وتؤكد مراحل التوصيل واحدة واحدة.',voiceFr:'Bienvenue chez Presto ! Le client utilise son application pour commander. Toi, le livreur, tu utilises la tienne pour recevoir les courses et confirmer chaque étape.'},
 {screen:'customer',ar:'الزبون يطلب من تطبيقه',fr:'Le client passe commande',captionAr:'المطعم يستلم الطلب ويحضرّه',captionFr:'Le restaurant prépare la commande',voiceAr:'هذه أول مرحلة. الزبون يدخل إلى تطبيق بريستو، ويختار المطعم وما يريد شراءه ويؤكد الطلب. بريستو توصل الطلب إلى المطعم، ثم تصل مهمة التوصيل إلى السائق المتاح.',voiceFr:'Le client ouvre Presto, choisit le restaurant et les articles. Le restaurant prépare la commande et un livreur reçoit la course.'},
 {screen:'order',ar:'استقبل الطلب وابدأ الرحلة',fr:'Reçois et démarre la course',captionAr:'اضغط «بدء الرحلة» بعد قراءة التفاصيل',captionFr:'Lis les détails et démarre la course',voiceAr:'عندما يظهر الطلب عندك، اقرأ اسمه ورقمه وموقع المطعم. تأكد من جاهزية هاتفك والإنترنت والمركبة. ثم اضغط على زر بدء الرحلة، وانتبه، لا تضغط أزرار الخطوات الأخرى قبل تنفيذها.',voiceFr:'Quand la course arrive, consulte le numéro et le restaurant. Vérifie ton téléphone et ta connexion, puis appuie sur Démarrer la course.'},
 {screen:'restaurantMap',ar:'اسم المطعم يفتح الخريطة',fr:'Le nom du restaurant ouvre la carte',captionAr:'اضغط اسم المطعم أو موقعه الأزرق لتظهر خرائط Google',captionFr:'Clique sur le restaurant pour ouvrir Google Maps',voiceAr:'هنا ركز معي! عندما ترى اسم المطعم في شاشة الطلب، اضغط على اسمه أو على خانة موقعه الزرقاء. ستُفتح خرائط غوغل فوراً، وتدلك على الطريق إلى المطعم. لا تحتاج إلى كتابة العنوان بنفسك. اتبع الطريق الآمن حتى تصل.',voiceFr:'Très important : appuie sur le nom du restaurant ou sur sa localisation bleue. Google Maps te montre la route jusqu’au restaurant.'},
 {screen:'restaurant',ar:'عند المطعم اضغط «وصلت للمطعم»',fr:'Confirme ton arrivée au restaurant',captionAr:'عرّف بنفسك وأعط رقم الطلب للعامل',captionFr:'Présente-toi et indique le numéro de commande',voiceAr:'حين تقف فعلياً أمام المطعم، ارجع لتطبيق السائق واضغط وصلت للمطعم. قدم نفسك بأدب، وقل أنا سائق بريستو، ثم أعط العامل رقم الطلب. إذا لم يكن الطلب جاهزاً، انتظر بهدوء ولا تستعجل العاملين.',voiceFr:'Devant le restaurant, appuie sur Arrivé au restaurant. Présente-toi et donne le numéro de commande. Attends calmement si elle n’est pas prête.'},
 {screen:'pickup',ar:'تحقق من الطلب ثم استلمه',fr:'Vérifie, puis récupère la commande',captionAr:'بعد استلام جميع الأصناف اضغط «تأكيد الاستلام»',captionFr:'Confirme après vérification des articles',voiceAr:'راجع رقم الطلب، وعدد الأصناف، والمشروبات والصلصات، وتأكد أن التغليف سليم. لا تفتح طلب الزبون. ضع جميع المنتجات داخل حقيبتك. بعد أن تستلم الطلب كاملاً فقط، اضغط تأكيد الاستلام.',voiceFr:'Vérifie le numéro, les articles, les boissons et les sauces, sans ouvrir les emballages. Mets tout dans ton sac, puis confirme la récupération.'},
 {screen:'customerMap',ar:'اضغط «الزبون» لتفتح الخريطة',fr:'Clique sur le client pour la carte',captionAr:'الخريطة الآن ترشدك إلى عنوان الزبون',captionFr:'La carte te guide maintenant chez le client',voiceAr:'بعد أخذ الطلب، اضغط على اسم الزبون أو خانة الزبون الزرقاء في تطبيق السائق. مثل المطعم تماماً، ستفتح الخريطة مرة ثانية، لكنها ستدلك هذه المرة على عنوان الزبون. اتبع الطريق الآمن.',voiceFr:'Après la récupération, appuie sur le client ou sur sa localisation bleue. Google Maps s’ouvre à nouveau pour te guider vers son adresse.'},
 {screen:'arrival',ar:'أخبر الزبون بوصولك',fr:'Préviens le client de ton arrivée',captionAr:'اضغط «وصلت للزبون» فقط عند عنوانه',captionFr:'Appuie sur Arrivé chez le client sur place',voiceAr:'عندما تصل إلى عنوان الزبون فعلاً، اضغط وصلت للزبون. هكذا يصله إشعار بأنك أمامه. لو لم يرد، اتصل وأرسل رسائل لمدة خمس عشرة دقيقة، وبعدها تواصل مع دعم السائقين من داخل التطبيق.',voiceFr:'Une fois à l’adresse du client, appuie sur Arrivé chez le client pour envoyer une notification. Sans réponse après quinze minutes d’appels et messages, contacte le support.'},
 {screen:'delivery',ar:'سلّم الطلب ثم أكد التوصيل',fr:'Remets et confirme la livraison',captionAr:'«تم التوصيل للزبون» بعد التسليم والدفع فقط',captionFr:'Confirme seulement après livraison et paiement',voiceAr:'سلّم طلبه باحترام، وتأكد من دفع المبلغ الكامل، ورد الباقي إذا كان مطلوباً. وبعد أن يتسلم الطلب فعلاً، اضغط تم التوصيل للزبون. لا تضغط كل الأزرار مرة واحدة، فكل خطوة لها وقتها.',voiceFr:'Remets la commande au client, encaisse le montant dû et rends la monnaie. Confirme la livraison uniquement quand tout est réellement terminé.'},
 {screen:'money',ar:'أرباحك ومال الزبون',fr:'Tes gains et l’argent du client',captionAr:'احتفظ بأرباحك، وسلّم باقي الأموال حسب التعليمات',captionFr:'Garde tes gains et reverse les fonds dus',voiceAr:'أجرتك تحتسب لكل رحلة بحسب المسافة، وتراها في خانة أرباحي. أما ما استلمته من الزبائن زيادة على أرباحك فهو أمانة، يجب تسليمه حسب تعليمات بريستو، مع الاحتفاظ بصورة عملية التحويل كإثبات.',voiceFr:'Ta rémunération dépend de chaque course et de sa distance. Garde tes gains, reverse les sommes dues selon les consignes de Presto et conserve une preuve du paiement.'},
 {screen:'support',ar:'عند وجود مشكلة، الدعم أولاً',fr:'En cas de problème, contacte le support',captionAr:'لا تتصرف وحدك في الطلب أو المال أو بيانات الزبون',captionFr:'Ne modifie pas la commande toi-même',voiceAr:'إذا نقص صنف، أخبر المطعم قبل المغادرة. وإذا تغيّر العنوان، أو رفض الزبون الطلب، تواصل مع دعم السائقين من التطبيق. لا تشارك حسابك أو رقم الزبون، ولا تفتح الطلب ولا تطلب مالاً إضافياً من الزبون.',voiceFr:'Article manquant : préviens le restaurant. Adresse incorrecte ou refus : contacte le support. Ne partage pas ton compte et ne demande pas de supplément.'},
 {screen:'complete',ar:'ممتاز! أنت الآن جاهز',fr:'Bravo ! Tu es prêt',captionAr:'اسم المطعم ثم الخريطة، اسم الزبون ثم الخريطة، كل زر في وقته',captionFr:'Deux cartes, chaque bouton au bon moment',voiceAr:'تذكر أهم شيء: الزبون يطلب من تطبيقه، وأنت تعمل من تطبيق السائق. اسم المطعم يفتح خريطة المطعم، واسم الزبون يفتح خريطة الزبون. أكّد كل خطوة بعد حصولها فقط. نتمنى لك رحلات آمنة وناجحة مع بريستو!',voiceFr:'Retiens bien : le client commande dans son application, toi tu livres dans la tienne. Le restaurant et le client ouvrent chacun leur carte. Confirme chaque étape au bon moment !'}
];
const sectionSeconds=(step:Lesson)=>Math.max(22,Math.round(Math.max(step.voiceAr.split(' ').length,step.voiceFr.split(' ').length)/1.7)+5);
const durations=lessons.map(sectionSeconds);
const total=durations.reduce((a,b)=>a+b,0);
const show=(lang:Lang,ar:string,fr:string)=>lang==='ar'?ar:fr;

function Visual({screen,language}:{screen:Screen;language:Lang}){
 const ar=language==='ar';
 const restaurant=screen==='restaurantMap';
 const map=restaurant||screen==='customerMap';
 const apps=screen==='apps';
 const finish=screen==='complete';
 const title=map?(restaurant?show(language,'مطعم الأمل','Restaurant Amal'):show(language,'عنوان الزبون','Client')):show(language,'مطعم الأمل','Restaurant Amal');
 let button=show(language,'بدء الرحلة','Démarrer');
 if(screen==='restaurant')button=show(language,'وصلت للمطعم','Au restaurant');
 if(screen==='pickup')button=show(language,'تأكيد الاستلام','Récupérer');
 if(screen==='arrival')button=show(language,'وصلت للزبون','Chez le client');
 if(screen==='delivery')button=show(language,'تم التوصيل للزبون','Livré');
 if(screen==='customer')button=show(language,'تأكيد الطلب','Commander');
 return <div className={styles.visualWorld} dir={ar?'rtl':'ltr'}>
  <div className={styles.glowOne}/><div className={styles.glowTwo}/>
  {apps?<div className={styles.twoApps}><div className={styles.miniApp}><div className={styles.miniAppIcon}><Store size={35}/></div><strong>{show(language,'تطبيق الزبون','Application client')}</strong><p>{show(language,'اختيار وطلب','Choisir et commander')}</p></div><div className={styles.exchange}><ArrowLeft size={24}/><ArrowRight size={24}/></div><div className={styles.miniApp}><div className={styles.miniAppIcon}><Truck size={35}/></div><strong>{show(language,'تطبيق السائق','Application livreur')}</strong><p>{show(language,'استلام وتوصيل','Récupérer et livrer')}</p></div></div>:null}
  {finish?<div className={styles.finish}><div className={styles.successRing}><Check size={70}/></div><strong>PRESTO</strong><p>{show(language,'كل خطوة في وقتها','Chaque étape au bon moment')}</p></div>:null}
  {!apps&&!finish?<div className={styles.phone} key={screen}>
   <div className={styles.phoneHeader}><span>9:41</span><span className={styles.camera}/><span>●●●</span></div>
   <div className={styles.phoneBrand}><span className={styles.brandDot}>P</span><strong>PRESTO</strong><span className={styles.liveDot}/></div>
   {map?<div className={styles.mapDisplay}><div className={styles.mapRoadHorizontal}/><div className={styles.mapRoadVertical}/><div className={styles.mapRoadTilt}/><div className={styles.mapDotStart}><Truck size={17}/></div><div className={styles.mapPath}/><div className={styles.mapDotEnd}>{restaurant?<Store size={20}/>:<UserRound size={20}/>}</div><div className={styles.mapLabel}><Navigation size={16}/>{title}</div></div>:<div className={styles.phoneBody}>
    {screen==='support'?<><div className={styles.sectionSymbol}><Headphones size={38}/></div><strong>{show(language,'دعم السائقين','Assistance')}</strong><div className={styles.issue}><Phone size={17}/>{show(language,'تواصل مع الدعم','Contacter le support')}</div></>:null}
    {screen==='money'?<><div className={styles.sectionSymbol}><Wallet size={38}/></div><strong>{show(language,'أرباحي','Mes gains')}</strong><div className={styles.earnings}>600 <small>MRU</small></div><div className={styles.issue}><ShieldCheck size={17}/>{show(language,'مال الزبون أمانة','Fonds du client confiés')}</div></>:null}
    {screen!=='support'&&screen!=='money'?<><div className={styles.phoneTopLabel}>{show(language,'طلب جديد · 2486','Nouvelle commande · 2486')}</div><div className={styles.orderCard}><div className={styles.restaurantIcon}><Store size={25}/></div><div><b>{title}</b><small>{show(language,'طلب رقم 2486','Commande 2486')}</small></div><Check size={17}/></div><div className={styles.orderLine}><PackageCheck size={16}/>{show(language,'وجبة ومشروب','Repas et boisson')}<strong>× 2</strong></div><div className={styles.orderLine}><MapPin size={16}/>{show(language,'العنوان','Adresse')}<strong>2.4 km</strong></div><div className={styles.phoneAction}><Check size={17}/>{button}<div className={styles.tapPulse}/></div></>:null}
   </div>}
   <div className={styles.homeBar}/>
  </div>:null}
  {!apps&&!finish?<div className={styles.callout}><span className={styles.calloutIcon}><Navigation size={22}/></span><strong>{map?show(language,'الاسم يفتح الخريطة','Le nom ouvre la carte'):button}</strong><span>{show(language,'محاكاة تعليمية','Simulation pédagogique')}</span></div>:null}
  <span className={styles.sampleMark}>{show(language,'شاشات توضيحية غير حقيقية','Écrans de démonstration')}</span>
 </div>;
}
export default function PrestoDriverGuide(){
 const [lang,setLang]=useState<Lang>('ar');
 const [index,setIndex]=useState(0);
 const [playing,setPlaying]=useState(false);
 const [voice,setVoice]=useState(true);
 const [elapsed,setElapsed]=useState(0);
 const lastTick=useRef(0);
 const synth=()=>typeof window!=='undefined'&&'speechSynthesis' in window?window.speechSynthesis:null;
 const speak=(i:number,language:Lang)=>{
  const s=synth();if(!s||!voice)return;s.cancel();
  const u=new SpeechSynthesisUtterance(show(language,lessons[i].voiceAr,lessons[i].voiceFr));
  const wanted=language==='ar'?'ar':'fr';
  const voices=s.getVoices();const v=voices.find(x=>x.lang.toLowerCase().startsWith(wanted));
  if(v)u.voice=v;
  u.lang=v?.lang||(language==='ar'?'ar-SA':'fr-FR');u.rate=.95;
  s.speak(u);
 };
 const go=(i:number,autoplay=playing,language=lang)=>{
  const n=Math.max(0,Math.min(lessons.length-1,i));synth()?.cancel();
  setIndex(n);setElapsed(0);setPlaying(autoplay);
  if(autoplay)speak(n,language);
 };
 const toggle=()=>{if(playing){synth()?.pause();setPlaying(false);}else{if(synth()?.paused)synth()?.resume();else speak(index,lang);lastTick.current=Date.now();setPlaying(true);}};
 useEffect(()=>{
  if(!playing)return;
  lastTick.current=Date.now();
  const timer=setInterval(()=>{const now=Date.now(),delta=(now-lastTick.current)/1000;lastTick.current=now;setElapsed(v=>{
    if(v+delta<durations[index])return v+delta;
    if(index===lessons.length-1){setPlaying(false);synth()?.cancel();return durations[index];}
    go(index+1,true);return 0;
  });},250);
  return()=>clearInterval(timer);
 },[playing,index]);
 useEffect(()=>()=>{synth()?.cancel()},[]);
 const swap=()=>{const next=lang==='ar'?'fr':'ar';setLang(next);go(index,playing,next);};
 const lesson=lessons[index];
 const passed=durations.slice(0,index).reduce((a,b)=>a+b,0)+elapsed;
 const duration=(sec:number)=>Math.floor(sec/60)+':'+String(Math.floor(sec%60)).padStart(2,'0');
 return <main className={styles.shell} dir={lang==='ar'?'rtl':'ltr'}>
  <header className={styles.header}><a href="/" className={styles.logo}><span className={styles.brandDot}>P</span><span><strong>PRESTO</strong><small>ACADEMY</small></span></a><div className={styles.headerActions}><button onClick={swap}><Globe2 size={16}/>{lang==='ar'?'Français':'العربية'}</button><a href="/">{show(lang,'العودة','Retour')}<ArrowLeft size={17}/></a></div></header>
  <section className={styles.hero}><span className={styles.eyebrow}>PRESTO · DRIVER TRAINING</span><h1>{show(lang,'دليل سائق بريستو','Guide du livreur Presto')}</h1><p>{show(lang,'شرح مرئي جديد من تصميم PRESTO لكل خطوات التوصيل','Un guide animé original, étape par étape')}</p><div className={styles.highlights}><span><Check size={15}/>{show(lang,'تطبيق الزبون والسائق','Deux applications')}</span><span><Navigation size={15}/>{show(lang,'خرائط المطعم والزبون','Deux cartes GPS')}</span><span><ShieldCheck size={15}/>{show(lang,'التوصيل الصحيح','Bonnes pratiques')}</span></div></section>
  <div className={styles.playerGrid}><section className={styles.player}><div className={styles.filmHeader}><span className={styles.playingLight}/> PRESTO ORIGINAL GUIDE <span>{index+1} / {lessons.length}</span></div><Visual screen={lesson.screen} language={lang}/><div className={styles.caption}><span>{show(lang,'المشهد','Scène')} {index+1}</span><h2>{show(lang,lesson.ar,lesson.fr)}</h2><p>{show(lang,lesson.captionAr,lesson.captionFr)}</p></div><div className={styles.controls}><div className={styles.progressBar}><span style={{width:Math.min(100,passed/total*100)+'%'}}/></div><div className={styles.controlRow}><button className={styles.minor} disabled={index===0} onClick={()=>go(index-1)}><ChevronRight size={20}/></button><button className={styles.primary} onClick={toggle}>{playing?<><Pause size={17}/>{show(lang,'إيقاف','Pause')}</>:<><Play size={17}/>{show(lang,'تشغيل الشرح','Lire le guide')}</>}</button><button className={styles.minor} disabled={index===lessons.length-1} onClick={()=>go(index+1)}><ChevronLeft size={20}/></button><span className={styles.runtime} dir="ltr">{duration(passed)} / {duration(total)}</span><button className={styles.minor} onClick={()=>{synth()?.cancel();setVoice(!voice)}} aria-label={show(lang,'الصوت','Audio')}>{voice?<Volume2 size={19}/>:<VolumeX size={19}/>}</button><button className={styles.minor} onClick={()=>go(0)}><RotateCcw size={18}/></button></div></div></section>
  <aside className={styles.sidePanel}><div className={styles.sideTitle}><div><span>LEARNING PATH</span><h3>{show(lang,'خطوات الشرح','Les étapes')}</h3></div><span className={styles.duration}><Clock3 size={14}/>{duration(total)}</span></div><div className={styles.playlist}>{lessons.map((s,i)=><button key={s.screen} className={[styles.chapter,i===index?styles.selected:'',i<index?styles.completed:''].join(' ')} onClick={()=>go(i)}><span className={styles.chapterNumber}>{i<index?<Check size={14}/>:i+1}</span><span><strong>{show(lang,s.ar,s.fr)}</strong><small>{show(lang,s.captionAr,s.captionFr)}</small></span></button>)}</div><div className={styles.voiceNote}><Headphones size={20}/><p>{show(lang,'اضغط تشغيل لتسمع التعليق الصوتي حسب الأصوات المتاحة في جهازك.','Appuie sur Lecture pour écouter la voix disponible sur ton appareil.')}</p></div></aside></div>
  <footer className={styles.footer}>© PRESTO · {show(lang,'الدليل التوضيحي لا يحل محل تعليمات التطبيق المباشرة','Ce guide illustre les étapes sans remplacer les consignes de l’application')}</footer>
 </main>;
}

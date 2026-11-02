'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,CheckCheck,ChevronLeft,ChevronRight,Clock3,Headphones,MapPin,Navigation,PackageCheck,Pause,Play,RotateCcw,ShieldCheck,Smartphone,Store,Truck,UserRound,Volume2,VolumeX,Wallet,X,HelpCircle,Phone,Globe2} from 'lucide-react';
import styles from './guide.module.css';

type Lang='ar'|'fr';
type Scene={
 id:string;
 titleAr:string;titleFr:string;subtitleAr:string;subtitleFr:string;
 speakAr:string;speakFr:string;
 duration:number;
 view:'intro'|'customer'|'order'|'restaurantMap'|'restaurant'|'pickup'|'customerMap'|'arrival'|'delivery'|'money'|'support'|'finish';
};

const sceneTemplates:Scene[]=[
 {id:'welcome',titleAr:'مرحباً بك في PRESTO',titleFr:'Bienvenue chez PRESTO',subtitleAr:'تطبيق للزبون وتطبيق خاص بك أنت السائق',subtitleFr:'Une application client et une application livreur',duration:15,view:'intro',
 speakAr:'أهلاً بك في بريستو! قبل أن تبدأ أول رحلة، دعني أشرح لك كيف تعمل الخدمة. بريستو فيها تطبيق للزبون يطلب منه الطعام أو المنتجات، وتطبيق آخر خاص بك أنت السائق، تصلك فيه الطلبات وتتابعها خطوة بخطوة.',
 speakFr:'Bienvenue chez Presto ! Presto comporte une application pour les clients, qui passent leurs commandes, et une autre application spécialement pour toi, le livreur, pour recevoir et suivre chaque course.'},
 {id:'client',titleAr:'كيف يبدأ الطلب؟',titleFr:'Comment commence la commande ?',subtitleAr:'الزبون يختار مطعماً ويُرسل طلبه',subtitleFr:'Le client commande depuis son application',duration:13,view:'customer',
 speakAr:'أولاً، يفتح الزبون تطبيق بريستو ويختار المطعم أو المتجر، ثم يحدد ما يريد ويؤكد طلبه. يستقبل المطعم الطلب ليحضّره، وفي الوقت نفسه تُرسل بريستو مهمة التوصيل إلى أحد السائقين المتاحين.',
 speakFr:'Le client ouvre Presto, choisit un restaurant ou un commerce, sélectionne ses articles et confirme. Le restaurant prépare la commande et une course est proposée à un livreur disponible.'},
 {id:'order',titleAr:'استقبل المهمة وابدأ الرحلة',titleFr:'Reçois et démarre la course',subtitleAr:'افتح تفاصيل الطلب واضغط «بدء الرحلة»',subtitleFr:'Consulte les détails puis démarre',duration:14,view:'order',
 speakAr:'عندما تصلك مهمة جديدة، اقرأ رقم الطلب واسم المطعم والتفاصيل بعناية. تأكد أنك جاهز، هاتفك مشحون والإنترنت يعمل، ثم اضغط على زر بدء الرحلة. لا تؤكد أي خطوة لم تنفذها بعد.',
 speakFr:'Quand une nouvelle course arrive, lis son numéro, le restaurant et les détails. Vérifie que tu es prêt, puis appuie sur Démarrer la course. Ne valide jamais une étape en avance.'},
 {id:'restaurant-route',titleAr:'اضغط على اسم المطعم',titleFr:'Appuie sur le nom du restaurant',subtitleAr:'ستفتح الخريطة لترشدك إلى المطعم',subtitleFr:'La carte te guide jusqu’au restaurant',duration:16,view:'restaurantMap',
 speakAr:'انتبه لهذه الخطوة المهمة جداً: عندما يظهر أمامك اسم المطعم في الطلب، اضغط مباشرة على اسم المطعم أو خانة موقعه الزرقاء. ستفتح لك خرائط غوغل، وتظهر الطريق إلى المطعم. اتبع المسار الآمن حتى تصل.',
 speakFr:'Étape très importante : appuie sur le nom du restaurant ou sur sa localisation bleue. Google Maps s’ouvre et te guide vers le restaurant. Suis un itinéraire sûr.'},
 {id:'restaurant',titleAr:'وصلت إلى المطعم',titleFr:'Tu es arrivé au restaurant',subtitleAr:'اضغط «وصلت للمطعم» أمام المطعم فقط',subtitleFr:'Confirme ton arrivée sur place',duration:13,view:'restaurant',
 speakAr:'عند الوصول فعلياً إلى باب المطعم، ارجع إلى تطبيق السائق واضغط وصلت للمطعم. ادخل بأدب، وقل السلام عليكم، أنا سائق بريستو، ثم أعط العامل رقم الطلب. إذا لم يكن جاهزاً، انتظر بهدوء.',
 speakFr:'Une fois devant le restaurant, reviens dans l’application et appuie sur Arrivé au restaurant. Présente-toi poliment avec le numéro de commande. Si elle n’est pas prête, attends calmement.'},
 {id:'pickup',titleAr:'تحقق ثم أكّد الاستلام',titleFr:'Vérifie avant de confirmer',subtitleAr:'راجع الطلب كاملاً وضعه في الحقيبة',subtitleFr:'Vérifie les articles avant le départ',duration:15,view:'pickup',
 speakAr:'قبل مغادرة المطعم، تأكد من رقم الطلب وعدد الأصناف والمشروبات والصلصات وسلامة التغليف. ضع الطلب كاملاً داخل حقيبتك، وبعد أن تستلمه بيدك فقط اضغط تأكيد الاستلام. لا تضغط هذا الزر مسبقاً.',
 speakFr:'Avant de partir, vérifie le numéro, les produits, les boissons, les sauces et l’emballage. Place tout dans ton sac. Appuie sur Confirmer la récupération uniquement après avoir reçu la commande.'},
 {id:'customer-route',titleAr:'الآن اتجه إلى الزبون',titleFr:'Maintenant, va chez le client',subtitleAr:'اضغط «الزبون» لفتح موقعه على الخريطة',subtitleFr:'Appuie sur Client pour ouvrir la carte',duration:15,view:'customerMap',
 speakAr:'الآن صار الطلب معك. في تفاصيل الرحلة ستجد اسم الزبون أو خانة الزبون الزرقاء. اضغط عليها، وستفتح الخريطة مرة أخرى، لكن هذه المرة لتدلك على عنوان الزبون، تماماً مثلما فعلت مع المطعم.',
 speakFr:'La commande est avec toi. Dans les détails, appuie sur le client ou sur sa localisation bleue. Google Maps s’ouvre à nouveau, cette fois vers l’adresse du client.'},
 {id:'arrived-customer',titleAr:'أبلغ الزبون بوصولك',titleFr:'Préviens le client de ton arrivée',subtitleAr:'اضغط «وصلت للزبون» عند عنوانه',subtitleFr:'Appuie sur Arrivé chez le client',duration:13,view:'arrival',
 speakAr:'حين تصل فعلياً إلى عنوان الزبون، اضغط وصلت للزبون. بهذه الخطوة يتلقى الزبون إشعاراً بوصولك. إذا لم يرد على الاتصال أو الرسائل، حاول التواصل لمدة خمس عشرة دقيقة، ثم استخدم دعم السائقين في التطبيق.',
 speakFr:'Quand tu es à l’adresse du client, appuie sur Arrivé chez le client. Il reçoit une notification. S’il ne répond pas, essaie appels et messages pendant quinze minutes puis contacte le support.'},
 {id:'delivered',titleAr:'سلّم الطلب ثم أكّد التوصيل',titleFr:'Remets, puis confirme la livraison',subtitleAr:'«تم التوصيل للزبون» بعد التسليم والدفع فقط',subtitleFr:'Confirme après remise et paiement',duration:15,view:'delivery',
 speakAr:'سلّم الطلب باحترام، وتأكد من إتمام الدفع وردّ الباقي إن وُجد. بعد تسليم الطلب واستلام المبلغ المطلوب، اضغط تم التوصيل للزبون. تذكّر: لا تضغط وصلت للزبون وتم التوصيل وأنت ما زلت في المطعم.',
 speakFr:'Remets le colis avec respect, encaisse le montant prévu et rends toute la monnaie. Seulement après la remise et le paiement, appuie sur Livré au client. N’anticipe jamais ce bouton.'},
 {id:'earnings',titleAr:'أرباحك ومال العميل',titleFr:'Tes gains et l’argent du client',subtitleAr:'احتفظ بأرباحك وسلّم المبالغ المستحقة',subtitleFr:'Garde tes gains et reverse le reste',duration:14,view:'money',
 speakAr:'في بريستو أجرتك على كل توصيلة تُحسب حسب المسافة. يمكنك متابعة مستحقاتك من خانة أرباحي. أمّا المال الذي دفعه الزبون وليس من أجرتك، فهو أمانة، ويُسلّم وفق تعليمات بريستو، مع الاحتفاظ بإثبات التحويل.',
 speakFr:'Tes gains sont calculés par livraison selon la distance. Consulte Mes gains. L’argent encaissé pour Presto n’est pas ton salaire : reverse-le selon les consignes et conserve le justificatif.'},
 {id:'help',titleAr:'إذا حدثت مشكلة',titleFr:'Si tu rencontres un problème',subtitleAr:'الدعم أولاً، ولا تتصرف وحدك',subtitleFr:'Le support est là pour t’aider',duration:14,view:'support',
 speakAr:'إذا نقص صنف، أخبر المطعم قبل المغادرة. إذا تعذر العثور على العنوان أو رفض الزبون الطلب، تواصل مع الدعم من داخل التطبيق. لا تفتح الطلب ولا تغيّره، ولا تعطه لسائق آخر، ولا تشارك حسابك أو رقم الزبون.',
 speakFr:'S’il manque un article, signale-le au restaurant avant de partir. Adresse incorrecte ou client qui refuse ? Contacte le support de l’application. Ne modifie pas la commande et ne partage pas ton compte.'},
 {id:'end',titleAr:'أنت الآن جاهز للانطلاق!',titleFr:'Tu es prêt à livrer !',subtitleAr:'كل زر في وقته، وكل رحلة باحتراف',subtitleFr:'Chaque bouton au bon moment',duration:12,view:'finish',
 speakAr:'وهكذا اكتملت الرحلة! تذكّر جيداً: الزبون يطلب من تطبيقه، وأنت تدير التوصيل من تطبيق السائق. اضغط اسم المطعم لفتح الخريطة، وبعد الاستلام اضغط الزبون لفتح خريطته. أكّد كل خطوة فقط عندما تحدث فعلاً. نتمنى لك رحلات آمنة وناجحة مع بريستو!',
 speakFr:'Voilà toute la course ! Le client commande dans son application et tu suis la livraison dans la tienne. Le restaurant ouvre la première carte et le client la deuxième. Confirme chaque étape au bon moment. Bonne route avec Pre ];
const scenes:Scene[]=sceneTemplates.map(scene=>({...scene,duration:Math.max(scene.duration,Math.ceil(scene.speakAr.trim().split(' ').filter(Boolean).length/2)+6,Math.ceil(scene.speakFr.trim().split(' ').filter(Boolean).length/2)+6)}));)+6)}));

const labels={
 ar:{guide:'دليل السائق التفاعلي',presto:'PRESTO ACADEMY',home:'العودة إلى PRESTO',watch:'ابدأ الشرح',pause:'إيقاف مؤقت',resume:'متابعة الشرح',replay:'إعادة من البداية',audio:'التعليق الصوتي',step:'المشهد',auto:'تشغيل تلقائي',language:'Français',subtitle:'شرح جديد بالرسوم المتحركة · صوت حسب إعدادات جهازك',map:'فتح الخريطة',start:'بدء الرحلة',restaurant:'مطعم الأمل',customer:'الزبون',arrivedRestaurant:'وصلت للمطعم',pickup:'تأكيد الاستلام',arrivedClient:'وصلت للزبون',delivered:'تم التوصيل للزبون',order:'طلب جديد',support:'دعم السائقين',next:'المشهد التالي',previous:'السابق',tip:'اضغط على التشغيل لسماع الشرح بصوت المتصفح. يمكنك الانتقال إلى أي مشهد.',demo:'محاكاة توضيحية — ليست واجهة التطبيق الحقيقية'},
 fr:{guide:'Guide interactif du livreur',presto:'PRESTO ACADEMY',home:'Retour à PRESTO',watch:'Lancer le guide',pause:'Pause',resume:'Reprendre',replay:'Recommencer',audio:'Voix',step:'Scène',auto:'Lecture automatique',language:'العربية',subtitle:'Animation originale · voix selon ton appareil',map:'Ouvrir la carte',start:'Démarrer la course',restaurant:'Restaurant Amal',customer:'Client',arrivedRestaurant:'Arrivé au restaurant',pickup:'Confirmer la récupération',arrivedClient:'Arrivé chez le client',delivered:'Livré au client',order:'Nouvelle commande',support:'Assistance',next:'Scène suivante',previous:'Précédent',tip:'Appuie sur Lecture pour écouter une narration vocale. Tu peux choisir une scène.',demo:'Simulation pédagogique, non une capture réelle de l’application'}
};

function PhoneScene({scene,language}:{scene:Scene;language:Lang}){
 const t=labels[language],ar=language==='ar';
 const type=scene.view;
 const map=type==='restaurantMap'||type==='customerMap';
 const isClient=type==='customer';
 const isIntro=type==='intro';
 const end=type==='finish';
 const isHelp=type==='support';
 const showMapLink=type==='restaurantMap'||type==='customerMap';
 return <div className={styles.visualWorld} dir={ar?'rtl':'ltr'}>
  <div className={styles.glowOne}/><div className={styles.glowTwo}/>
  {isIntro?<div className={styles.twoApps}>
    <div className={styles.miniApp}><div className={styles.miniAppIcon}><Store size={35}/></div><strong>{ar?'تطبيق الزبون':'Application client'}</strong><p>{ar?'يختار · يطلب · يتابع':'Choisir · Commander · Suivre'}</p></div>
    <div className={styles.exchange}><ArrowLeft size={25}/><ArrowRight size={25}/></div>
    <div className={styles.miniApp}><div className={styles.miniAppIcon}><Truck size={35}/></div><strong>{ar?'تطبيق السائق':'Application livreur'}</strong><p>{ar?'يستقبل · يستلم · يوصّل':'Recevoir · Récupérer · Livrer'}</p></div>
  </div>:end?<div className={styles.finish}><div className={styles.successRing}><CheckCheck size={76}/></div><strong>PRESTO</strong><p>{ar?'رحلة ناجحة تبدأ بخطوة صحيحة':'Une livraison réussie commence par le bon geste'}</p></div>:<div className={styles.phone} key={scene.id}>
   <div className={styles.phoneHeader}><span className={styles.time}>9:41</span><span className={styles.camera}/><span>●●●</span></div>
   <div className={styles.phoneBrand}><span className={styles.brandDot}>P</span><strong>PRESTO</strong><span className={styles.liveDot}/></div>
   {map?<div className={styles.mapDisplay}>
     <div className={styles.mapRoadHorizontal}/><div className={styles.mapRoadVertical}/><div className={styles.mapRoadTilt}/>
     <div className={styles.mapDotStart}><Truck size={17}/></div>
     <div className={styles.mapPath}><span/><span/><span/></div>
     <div className={styles.mapDotEnd}>{type==='restaurantMap'?<Store size={23}/>:<UserRound size={23}/>}</div>
     <div className={styles.mapLabel}><Navigation size={16}/>{type==='restaurantMap'?t.restaurant:t.customer}</div>
    </div>:isHelp?<div className={styles.phoneBody}>
     <div className={styles.sectionSymbol}><Headphones size={40}/></div>
     <strong>{t.support}</strong>
     <div className={styles.issue}><HelpCircle size={18}/>{ar?'الزبون لا يرد؟':'Client injoignable ?'}</div>
     <div className={styles.issue}><MapPin size={18}/>{ar?'الموقع غير واضح؟':'Adresse peu claire ?'}</div>
     <div className={styles.issue}><PackageCheck size={18}/>{ar?'طلب ناقص؟':'Article manquant ?'}</div>
     <div className={styles.phoneAction}><Phone size={18}/>{t.support}</div>
    </div>:type==='money'?<div className={styles.phoneBody}><div className={styles.sectionSymbol}><Wallet size={42}/></div><strong>{ar?'أرباحي':'Mes gains'}</strong><div className={styles.earnings}>+ 600 <small>MRU</small></div><div className={styles.issue}><ShieldCheck size={18}/>{ar?'أموال العملاء أمانة':'Les fonds du client sont confiés'}</div></div>:<div className={styles.phoneBody}>
    <div className={styles.phoneTopLabel}>{isClient?(ar?'تطبيق الزبون':'Application client'):t.order}</div>
    <div className={styles.orderCard}>
      <div className={styles.restaurantIcon}><Store size={26}/></div>
      <div><b>{t.restaurant}</b><small>{ar?'طلب رقم 2486':'Commande Nº 2486'}</small></div>
      <Check size={18} color="#27a46a"/>
    </div>
    <div className={styles.orderLine}><PackageCheck size={17}/><span>{ar?'وجبة + مشروب':'Repas + boisson'}</span><strong>× 2</strong></div>
    <div className={styles.orderLine}><MapPin size={17}/><span>{t.customer}</span><strong>2.4 km</strong></div>
    {(type==='restaurant'||type==='pickup'||type==='arrival'||type==='delivery')&&<div className={styles.progressSteps}>
     <span className={styles.done}/><span className={styles.done}/><span className={type==='restaurant'?'':styles.done}/><span className={type==='delivery'?styles.done:''}/>
    </div>}
    <div className={styles.phoneAction} key={scene.id}>
     {type==='customer'?<><Store size={18}/>{ar?'تأكيد الطلب':'Confirmer la commande'}</>:
     type==='order'?<><Play size={17}/>{t.start}</>:
     type==='restaurant'?<><MapPin size={18}/>{t.arrivedRestaurant}</>:
     type==='pickup'?<><PackageCheck size={18}/>{t.pickup}</>:
     type==='arrival'?<><MapPin size={18}/>{t.arrivedClient}</>:
     <><CheckCheck size={18}/>{t.delivered}</>}
     <div className={styles.tapPulse}/>
    </div>
    {(type==='arrival')&&<div className={styles.notification}><Check size={14}/>{ar?'تم إرسال إشعار للزبون':'Client prévenu'}</div>}
    </div>}
   <div className={styles.homeBar}/>
  </div>}
  {!isIntro&&!end&&<div className={styles.callout}><span className={styles.calloutIcon}>{showMapLink?<Navigation size={22}/>:type==='delivery'?<CheckCheck size={22}/>:<Smartphone size={22}/>}</span><strong>{scene.titleAr&& (ar?scene.titleAr:scene.titleFr)}</strong><span>{ar?scene.subtitleAr:scene.subtitleFr}</span></div>}
  <span className={styles.sampleMark}>{t.demo}</span>
 </div>;
}

export default function PrestoDriverGuide(){
 const [language,setLanguage]=useState<Lang>('ar');
 const [index,setIndex]=useState(0);
 const [playing,setPlaying]=useState(false);
 const [voice,setVoice]=useState(true);
 const [seconds,setSeconds]=useState(0);
 const [voiceAvailable,setVoiceAvailable]=useState(true);
 const timer=useRef<ReturnType<typeof setInterval>|null>(null);
 const utterance=useRef<SpeechSynthesisUtterance|null>(null);
 const scene=scenes[index],t=labels[language];
 const durationTotal=useMemo(()=>scenes.reduce((a,s)=>a+s.duration,0),[]);
 const elapsed=scenes.slice(0,index).reduce((a,s)=>a+s.duration,0)+seconds;
 const speak=useCallback((step:number,lang:Lang,force=false)=>{
  if(typeof window==='undefined'||!('speechSynthesis' in window)){setVoiceAvailable(false);return;}
  window.speechSynthesis.cancel();
  if(!voice&&!force)return;
  const utter=new SpeechSynthesisUtterance(lang==='ar'?scenes[step].speakAr:scenes[step].speakFr);
  const all=window.speechSynthesis.getVoices();
  const wanted=lang==='ar'?'ar':'fr';
  const selected=all.find(v=>v.lang.toLowerCase().startsWith(wanted)&&(v.name.toLowerCase().includes('google')||v.name.toLowerCase().includes('microsoft')||v.localService===false))||all.find(v=>v.lang.toLowerCase().startsWith(wanted));
  if(selected)utter.voice=selected;
  utter.lang=selected?.lang||(lang==='ar'?'ar-SA':'fr-FR');
  utter.rate=lang==='ar'?0.91:0.94;
  utter.pitch=1;
  utter.volume=1;
  utterance.current=utter;
  window.speechSynthesis.speak(utter);
 },[voice]);
 const transition=useCallback((next:number,shouldPlay:boolean,lang=language)=>{
  const n=Math.max(0,Math.min(next,scenes.length-1));
  if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();
  setIndex(n);setSeconds(0);setPlaying(shouldPlay);
  if(shouldPlay) speak(n,lang);
 },[language,speak]);
 useEffect(()=>{
  if(!playing){if(timer.current)clearInterval(timer.current);timer.current=null;return;}
  const start=Date.now()-seconds*1000;
  timer.current=setInterval(()=>{
   const sec=Math.floor((Date.now()-start)/1000);
   if(sec>=scenes[index].duration){
    if(timer.current)clearInterval(timer.current);timer.current=null;
    if(index+1<scenes.length)transition(index+1,true);
    else {setSeconds(scenes[index].duration);setPlaying(false);if('speechSynthesis' in window)window.speechSynthesis.cancel();}
   }else setSeconds(sec);
  },250);
  return()=>{if(timer.current)clearInterval(timer.current);timer.current=null;};
 },[playing,index,transition]); // restart the clock only when scene or play state changes
 useEffect(()=>()=>{if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel()},[]);
 const pause=()=>{if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.pause();setPlaying(false);};
 const resume=()=>{
  setPlaying(true);
  if(!voice)return;
  if(typeof window==='undefined'||!('speechSynthesis' in window))return;
  if(window.speechSynthesis.paused)window.speechSynthesis.resume();
  else speak(index,language);
 };
 const toggle=()=>{if(playing)pause();else if(index===scenes.length-1&&seconds>=scene.duration)transition(0,true);else resume();};
 const swapLanguage=()=>{const next=language==='ar'?'fr':'ar';setLanguage(next);transition(index,playing,next);};
 const toggleVoice=()=>{if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();setVoice(v=>!v);if(!voice&&playing)speak(index,language,true);};
 const format=(s:number)=>Math.floor(s/60)+':'+String(Math.round(s%60)).padStart(2,'0');
 return <main className={styles.shell} dir={language==='ar'?'rtl':'ltr'}>
  <header className={styles.header}><a className={styles.logo} href="/"><span className={styles.brandDot}>P</span><span><strong>PRESTO</strong><small>ACADEMY</small></span></a><div className={styles.headerActions}><button type="button" onClick={swapLanguage}><Globe2 size={17}/>{t.language}</button><a href="/"><span>{t.home}</span>{language==='ar'?<ArrowLeft size={17}/>:<ArrowRight size={17}/>}</a></div></header>
  <section className={styles.hero}><span className={styles.eyebrow}><span/> PRESTO · DRIVER TRAINING</span><h1>{t.guide}</h1><p>{t.subtitle}</p><div className={styles.highlights}><span><Check size={15}/>{language==='ar'?'تطبيق الزبون والسائق':'Deux applications'}</span><span><Navigation size={15}/>{language==='ar'?'المطعم والزبون على الخريطة':'Navigation GPS'}</span><span><ShieldCheck size={15}/>{language==='ar'?'خطوات توصيل صحيحة':'Livraison correcte'}</span></div></section>
  <div className={styles.playerGrid}>
   <section className={styles.player} aria-label={t.guide}>
    <div className={styles.filmHeader}><span className={styles.playingLight}/><span>PRESTO ORIGINAL GUIDE</span><span>{String(index+1).padStart(2,'0')} / {scenes.length}</span></div>
    <PhoneScene scene={scene} language={language}/>
    <div className={styles.caption}><span>{t.step} {index+1} / {scenes.length}</span><h2>{language==='ar'?scene.titleAr:scene.titleFr}</h2><p>{language==='ar'?scene.subtitleAr:scene.subtitleFr}</p></div>
    <div className={styles.controls}>
     <div className={styles.progressBar} role="progressbar" aria-valuemin={0} aria-valuemax={durationTotal} aria-valuenow={elapsed} aria-label={language==='ar'?'تقدم الشرح':'Progression'}><span style={{width:Math.min(100,elapsed/durationTotal*100)+'%'}}/></div>
     <div className={styles.controlRow}>
      <button type="button" className={styles.minor} onClick={()=>transition(index-1,playing)} disabled={index===0} aria-label={t.previous}>{language==='ar'?<ChevronRight size={22}/>:<ChevronLeft size={22}/>}</button>
      <button type="button" className={styles.primary} onClick={toggle}>{playing?<><Pause size={20}/>{t.pause}</>:<><Play size={20}/>{index===0&&!seconds?t.watch:t.resume}</>}</button>
      <button type="button" className={styles.minor} onClick={()=>transition(index+1,playing)} disabled={index===scenes.length-1} aria-label={t.next}>{language==='ar'?<ChevronLeft size={22}/>:<ChevronRight size={22}/>}</button>
      <span className={styles.runtime} dir="ltr">{format(elapsed)} / {format(durationTotal)}</span>
      <button type="button" className={styles.minor} onClick={toggleVoice} aria-label={t.audio} title={t.audio}>{voice?<Volume2 size={20}/>:<VolumeX size={20}/>}</button>
      <button type="button" className={styles.minor} onClick={()=>transition(0,playing)} aria-label={t.replay} title={t.replay}><RotateCcw size={18}/></button>
     </div>
    </div>
   </section>
   <aside className={styles.sidePanel}>
    <div className={styles.sideTitle}><div><span>LEARNING PATH</span><h3>{language==='ar'?'مراحل الشرح':'Les étapes du guide'}</h3></div><span className={styles.duration}><Clock3 size={15}/>{format(durationTotal)}</span></div>
    <div className={styles.playlist}>{scenes.map((s,i)=><button key={s.id} type="button" className={[styles.chapter,i===index?styles.selected:'',i<index?styles.completed:''].join(' ')} onClick={()=>transition(i,playing)}><span className={styles.chapterNumber}>{i<index?<Check size={14}/>:String(i+1).padStart(2,'0')}</span><span><strong>{language==='ar'?s.titleAr:s.titleFr}</strong><small>{language==='ar'?s.subtitleAr:s.subtitleFr}</small></span>{i===index&&<span className={styles.activeBars}><i/><i/><i/></span>}</button>)}</div>
    <div className={styles.voiceNote}><Headphones size={20}/><p>{t.tip}{!voiceAvailable?' '+(language==='ar'?'ميزة الصوت غير متوفرة في هذا المتصفح.':'La voix n’est pas disponible dans ce navigateur.'):''}</p></div>
   </aside>
  </div>
  <footer className={styles.footer}>© PRESTO · {language==='ar'?'تعليم السائقين | اتبع تعليمات التطبيق الفعلية عند الاختلاف':'Formation des livreurs | Les consignes de l’application font foi'}</footer>
 </main>;
}

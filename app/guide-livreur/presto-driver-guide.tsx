'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,CheckCircle2,ChevronLeft,ChevronRight,Globe2,Headphones,MapPin,Navigation,PackageCheck,Pause,Play,RotateCcw,ShieldCheck,Smartphone,Store,Truck,UserRound,Volume2,VolumeX,Wallet,Phone,Clock3,BookOpen,AlertCircle,CreditCard,Bike,Signal,Headset,Mic2,ChevronDown,GraduationCap,ArrowUpRight,Ban,Gift,Menu,Star,Maximize2,Minimize2,Subtitles} from 'lucide-react';
import {guideLessons,guideRates,guideQuiz,type GuideChapter,type GuideLang,type GuideView} from './guide-content';
import styles from './guide.module.css';

const trans=(lang:GuideLang,ar:string,fr:string)=>lang==='ar'?ar:fr;
const chapters:{key:GuideChapter;ar:string;fr:string;icon:string}[]=[
 {key:'basics',ar:'البداية والتجهيز',fr:'Début et préparation',icon:'01'},
 {key:'delivery',ar:'خطوات التوصيل',fr:'Étapes de livraison',icon:'02'},
 {key:'finance',ar:'الأرباح والمال',fr:'Gains et règlements',icon:'03'},
 {key:'issues',ar:'المشاكل والسلامة',fr:'Incidents et sécurité',icon:'04'}
];
const estimatedSeconds=guideLessons.map(s=>Math.max(23,Math.ceil(Math.max(s.narrationAr.split(' ').length,s.narrationFr.split(' ').length)/2.15)+8));
const totalTime=estimatedSeconds.reduce((a,b)=>a+b,0);
const formatTime=(n:number)=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');
// Prefer enhanced voices when the browser actually makes them available.
// This cannot turn a basic system voice into a human recording.
const voiceRank=(v:SpeechSynthesisVoice)=>{
 const label=(v.name+' '+v.voiceURI).toLowerCase();
 return (/natural|neural|premium|enhanced|siri/i.test(label)?100:0)
   + (/microsoft|google|apple/i.test(label)?30:0)
   + (/h[oao]med|shakir|majed|zariyah|naayf|maged|amina/i.test(label)?10:0)
   + (!v.localService?5:0);
};
const selectNarrator=(available:SpeechSynthesisVoice[],uri:string)=>
 available.find(v=>v.voiceURI===uri)||[...available].sort((a,b)=>voiceRank(b)-voiceRank(a))[0];
// Breaking long paragraphs into sentences avoids the robotic, uninterrupted monotone
// and also makes narration more stable in Safari and on mobile devices.
const speechPhrases=(text:string)=>{
 const sentences=text.replace(/\s+/g,' ').trim().replace(/([.!؟؛])\s+/g,'$1\n').split('\n').filter(Boolean);
 const parts:string[]=[];
 for(const sentence of sentences){
  if(sentence.length<=185){parts.push(sentence);continue;}
  const clauses=sentence.split(/([،,])/);
  let current='';
  for(let i=0;i<clauses.length;i+=2){
   const clause=(clauses[i]||'')+(clauses[i+1]||'');
   if(current.length>95&&current.length+clause.length>175){parts.push(current.trim());current=clause;}
   else current+=clause;
  }
  if(current.trim())parts.push(current.trim());
 }
 return parts.length?parts:[text];
};
const screenName=(view:GuideView,lang:GuideLang)=>{
 const names:Record<string,string>={
 restaurant:'وصلت للمطعم|Arrivé au restaurant',pickup:'تأكيد الاستلام|Confirmer la réception',
 arrival:'وصلت للزبون|Arrivé chez le client',delivery:'تم التوصيل للزبون|Livraison effectuée',
 order:'بدء الرحلة|Démarrer la course',ready:'أنا متصل|Je suis en ligne'
 };
 const item=names[view]?.split('|');
 return item?lang==='ar'?item[0]:item[1]:trans(lang,'طلب جديد','Nouvelle commande');
};

function FilmScene({view,lang,sceneId}:{view:GuideView;lang:GuideLang;sceneId:string}){
 const ar=lang==='ar';
 const restaurantMap=view==='restaurantMap',customerMap=view==='customerMap';
 const map=restaurantMap||customerMap;
 const intro=view==='intro',finish=view==='finish';
 const rates=view==='earnings',bankily=view==='bankily',wallet=view==='wallet';
 const rules=view==='rules',safety=view==='safety';
 const alerts=view==='support';
 const value=screenName(view,lang);
 return <div className={styles.visualWorld} dir={ar?'rtl':'ltr'} key={sceneId}>
  <div className={styles.glowOne}/><div className={styles.glowTwo}/>
  {intro?<div className={styles.twoApps}>
   <div className={styles.miniApp}><div className={styles.miniAppIcon}><Store size={35}/></div><strong>{trans(lang,'تطبيق الزبون','Application client')}</strong><p>{trans(lang,'يختار · يطلب · يتابع','Choisir · Commander · Suivre')}</p></div>
   <div className={styles.exchange}><ArrowLeft size={25}/><ArrowRight size={25}/></div>
   <div className={styles.miniApp}><div className={styles.miniAppIcon}><Bike size={35}/></div><strong>{trans(lang,'تطبيق السائق','Application livreur')}</strong><p>{trans(lang,'يستلم · يوصّل · يربح','Récupérer · Livrer · Gagner')}</p></div>
  </div>:null}
  {finish?<div className={styles.finish}><div className={styles.successRing}><Check size={73}/></div><strong>PRESTO</strong><p>{trans(lang,'كل نقرة في وقتها. وكل رحلة بأمان.','Chaque clic au bon moment. Bonne route !')}</p></div>:null}
  {rates?<div className={styles.financeBoard}>
    <div className={styles.financeHead}><span><Wallet size={22}/>{trans(lang,'أجرة التوصيل حسب المسافة','Rémunération par distance')}</span><strong>0% <small>{trans(lang,'عمولة','commission')}</small></strong></div>
    <div className={styles.fares}>{guideRates.map((r,i)=><div key={r.from} className={styles.fare} style={{animationDelay:(i*90)+'ms'}}><span>{r.from} <small>km</small></span><strong>{r.amount} <small>MRU</small></strong></div>)}</div>
    <div className={styles.financeFoot}><CheckCircle2 size={16}/>{trans(lang,'هذه الشرائح وفق دليل PRESTO','Barème indiqué dans le guide PRESTO')}</div>
   </div>:null}
  {bankily?<div className={styles.financeBoard}>
   <div className={styles.financeHead}><span><Wallet size={24}/>{trans(lang,'تسوية مال العملاء','Règlement des fonds clients')}</span><strong>{trans(lang,'يوميًا','Chaque jour')}</strong></div>
   <div className={styles.bankFormula} dir="ltr"><span>3 000 <small>MRU</small></span><b>−</b><span>600 <small>MRU</small></span><b>=</b><strong>2 400 <small>MRU</small></strong></div>
   <div className={styles.bankAccount}><div><b>BANKILY</b><small>{trans(lang,'رمز التاجر في الدليل','Code commerçant du guide')}</small></div><strong dir="ltr">027901</strong></div>
   <div className={styles.financeFoot}><ShieldCheck size={16}/>{trans(lang,'تحقق من جهة الدفع واحتفظ بصورة العملية','Vérifie le destinataire et garde la preuve')}</div>
  </div>:null}
  {wallet?<div className={styles.financeBoard}>
   <div className={styles.financeHead}><span><CreditCard size={23}/>{trans(lang,'رد الباقي للزبون','Rendre la monnaie')}</span><strong>{trans(lang,'حق الزبون','Droit du client')}</strong></div>
   <div className={styles.bankFormula} dir="ltr"><span>500</span><b>−</b><span>430</span><b>=</b><strong>70 <small>MRU</small></strong></div>
   <div className={styles.walletCard}><Wallet size={29}/><span><strong>{trans(lang,'شحن محفظة الزبون','Portefeuille du client')}</strong><small>{trans(lang,'عند عدم توفر الصرف','Si la monnaie manque')}</small></span><CheckCircle2 size={22}/></div>
   <div className={styles.financeFoot}>{trans(lang,'لا تحتفظ بأي جزء من باقي الزبون','Ne garde pas la monnaie du client')}</div>
  </div>:null}
  {(rules||safety)?<div className={styles.cautionBoard}>
    <div className={styles.cautionIcon}>{rules?<Ban size={40}/>:<ShieldCheck size={43}/>}</div>
    <h3>{rules?trans(lang,'ممنوعات تحميك','Règles à respecter'):trans(lang,'سلامتك أولاً','La sécurité d’abord')}</h3>
    {(rules?[
     trans(lang,'لا تفتح الطلب ولا تغيّره','Ne pas ouvrir le colis'),
     trans(lang,'لا تشارك الحساب أو رقم الزبون','Ne pas partager le compte'),
     trans(lang,'لا تحتفظ بأموال العملاء','Ne pas garder les fonds')
    ]:[
     trans(lang,'قد بأمان وارتد ملابس لائقة','Conduire prudemment'),
     trans(lang,'حقيبة نظيفة ومن دون مرافق','Sac propre, pas d’accompagnant'),
     trans(lang,'عند الحادث: السلامة والإسعاف أولاً','Accident : priorité aux secours')
    ]).map((label,i)=><div className={styles.cautionRow} key={label}><span>{rules?<Ban size={18}/>:<Check size={18}/>}</span><strong>{label}</strong></div>)}
   </div>:null}
  {!intro&&!finish&&!rates&&!bankily&&!wallet&&!rules&&!safety?<div className={styles.phone}>
   <div className={styles.phoneHeader}><span>9:41</span><span className={styles.camera}/><span>●●●</span></div>
   <div className={styles.phoneBrand}><span className={styles.brandDot}>P</span><strong>PRESTO</strong><span className={styles.liveDot}/></div>
   {map?<div className={styles.mapDisplay}><div className={styles.mapRoadHorizontal}/><div className={styles.mapRoadVertical}/><div className={styles.mapRoadTilt}/><div className={styles.mapDotStart}><Truck size={18}/></div><div className={styles.mapPath}/><div className={styles.mapDotEnd}>{restaurantMap?<Store size={21}/>:<UserRound size={21}/>}</div><div className={styles.mapLabel}><Navigation size={16}/>{restaurantMap?trans(lang,'مطعم الأمل','Restaurant Amal'):trans(lang,'عنوان الزبون','Adresse du client')}</div></div>:
   <div className={styles.phoneBody}>
    {alerts?<><div className={styles.sectionSymbol}><Headphones size={43}/></div><strong>{trans(lang,'دعم السائقين','Assistance livreur')}</strong><div className={styles.issue}><Phone size={17}/>{trans(lang,'أعط رقم الطلب واشرح المشكلة','Donne le numéro de commande')}</div><div className={styles.issue}><Clock3 size={17}/>{trans(lang,'الزبون لا يرد؟ 15 دقيقة ثم الدعم','Sans réponse ? 15 min puis support')}</div></>:
    view==='ready'?<><div className={styles.sectionSymbol}><Signal size={40}/></div><strong>{trans(lang,'أنت جاهز للتوصيل','Tu es disponible')}</strong><div className={styles.issue}><Check size={17}/>{trans(lang,'بطارية وإنترنت ووقود','Batterie, réseau, carburant')}</div><div className={styles.issue}><Check size={17}/>{trans(lang,'حقيبة نظيفة ومركبة جاهزة','Sac propre, véhicule prêt')}</div></>:
    <><div className={styles.phoneTopLabel}>{trans(lang,'طلب جديد · رقم 2486','Nouvelle commande · N° 2486')}</div><div className={styles.orderCard}><div className={styles.restaurantIcon}><Store size={25}/></div><div><b>{trans(lang,'مطعم الأمل','Restaurant Amal')}</b><small>{trans(lang,'طلب رقم 2486','Commande 2486')}</small></div><Check size={16}/></div><div className={styles.orderLine}><PackageCheck size={17}/>{trans(lang,'وجبة + مشروب','Plat + boisson')}<strong>× 2</strong></div><div className={styles.orderLine}><MapPin size={17}/>{trans(lang,'عنوان الزبون','Adresse client')}<strong>2.4 km</strong></div><div className={styles.phoneAction}><Check size={16}/>{value}<div className={styles.tapPulse}/></div></>}
   </div>}
   <div className={styles.homeBar}/>
  </div>:null}
  {!intro&&!finish&&!rates&&!bankily&&!wallet&&!rules&&!safety?<div className={styles.callout}><span className={styles.calloutIcon}><Navigation size={21}/></span><strong>{map?trans(lang,'الاسم يفتح الخريطة','Le nom ouvre la carte'):value}</strong><span>{trans(lang,'محاكاة تعليمية','Simulation pédagogique')}</span></div>:null}
  <span className={styles.sampleMark}>{trans(lang,'رسوم توضيحية · ليست شاشة التطبيق الفعلية','Illustration pédagogique, non l’application réelle')}</span>
 </div>;
}

export default function PrestoDriverGuide(){
 const [lang,setLang]=useState<GuideLang>('ar');
 const [index,setIndex]=useState(0);
 const [playing,setPlaying]=useState(false);
 const [speakingEnabled,setSpeakingEnabled]=useState(true);
 const [seconds,setSeconds]=useState(0);
 const [voiceId,setVoiceId]=useState('');
 const [voiceError,setVoiceError]=useState('');
 const [spokenCaption,setSpokenCaption]=useState('');
 const [captionVisible,setCaptionVisible]=useState(true);
 const [theaterMode,setTheaterMode]=useState(false);
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
 const [speed,setSpeed]=useState(.96);
 const [showScript,setShowScript]=useState(true);
 const [quizOpen,setQuizOpen]=useState(false);
 const [quizAnswers,setQuizAnswers]=useState<Record<number,number>>({});

 // The narrator owns the timeline: a scene advances only after its final spoken
 // phrase, never because an approximate duration expired.
 const token=useRef(0),active=useRef(false);
 const playHandler=useRef<(n:number,l:GuideLang)=>void>(()=>{});
 const speechMode=useRef<'voice'|'timed'>('timed');
 const utteranceRef=useRef<SpeechSynthesisUtterance|null>(null);
 const phraseRef=useRef(0),phraseCountRef=useRef(1);
 const elapsedRef=useRef(0);
 const synth=()=>typeof window!=='undefined'&&'speechSynthesis' in window?window.speechSynthesis:null;
 useEffect(()=>{
  const s=synth();if(!s)return;
  const update=()=>setVoices(s.getVoices());
  update();s.addEventListener?.('voiceschanged',update);
  return()=>{s.removeEventListener?.('voiceschanged',update);s.cancel()};
 },[]);
 const filteredVoices=voices.filter(v=>v.lang.toLowerCase().startsWith(lang==='ar'?'ar':'fr')).sort((a,b)=>voiceRank(b)-voiceRank(a));
 const chosenVoice=selectNarrator(filteredVoices,voiceId);

 playHandler.current=(next,language)=>{
  const n=Math.max(0,Math.min(next,guideLessons.length-1));
  const thisToken=++token.current;
  const speech=synth();speech?.cancel();
  active.current=true;
  elapsedRef.current=0;setIndex(n);setSeconds(0);setPlaying(true);setQuizOpen(false);setVoiceError('');
  const phrases=speechPhrases(trans(language,guideLessons[n].narrationAr,guideLessons[n].narrationFr));
  phraseRef.current=0;phraseCountRef.current=phrases.length;
  setSpokenCaption(phrases[0]||'');
  if(!speech||!speakingEnabled){speechMode.current='timed';return;}
  const available=speech.getVoices().filter(v=>v.lang.toLowerCase().startsWith(language==='ar'?'ar':'fr'));
  const choice=selectNarrator(available,voiceId);
  speechMode.current='voice';
  let phraseIndex=0;
  const speakNext=()=>{
   if(thisToken!==token.current||!active.current)return;
   if(phraseIndex>=phrases.length){
    if(n+1<guideLessons.length)playHandler.current(n+1,language);
    else{active.current=false;setPlaying(false);setSeconds(estimatedSeconds[n]);}
    return;
   }
   phraseRef.current=phraseIndex;
   setSpokenCaption(phrases[phraseIndex]);
   const utter=new SpeechSynthesisUtterance(phrases[phraseIndex]);
   utteranceRef.current=utter; // keep alive on iOS Safari
   if(choice)utter.voice=choice;
   utter.lang=choice?.lang||(language==='ar'?'ar-SA':'fr-FR');
   utter.rate=speed;utter.pitch=1;utter.volume=1;
   utter.onboundary=e=>{
    if(token.current!==thisToken||!active.current)return;
    const pct=(phraseIndex+Math.min(1,e.charIndex/Math.max(1,phrases[phraseIndex].length)))/phrases.length;
    elapsedRef.current=Math.max(elapsedRef.current,estimatedSeconds[n]*pct);setSeconds(elapsedRef.current);
   };
   utter.onend=()=>{
    if(token.current!==thisToken||!active.current)return;
    elapsedRef.current=Math.max(elapsedRef.current,estimatedSeconds[n]*(phraseIndex+1)/phrases.length);setSeconds(elapsedRef.current);
    phraseIndex++;
    speakNext();
   };
   utter.onerror=e=>{
    if(token.current!==thisToken||!active.current||e.error==='interrupted'||e.error==='canceled')return;
    // A browser voice can fail mid-playback. Continue the visual tour
    // automatically rather than leaving the driver stuck on this scene.
    speechMode.current='timed';
    setVoiceError(trans(language,'تعذّر صوت الجهاز؛ سيواصل الشرح المرئي تلقائيًا.','Voix indisponible : la présentation continue automatiquement.'));
   };
   speech.speak(utter);
  };
  speakNext();
 };
 const jump=(n:number,autoplay=playing,language=lang)=>{
  ++token.current;
  active.current=false;utteranceRef.current=null;synth()?.cancel();
  const target=Math.max(0,Math.min(guideLessons.length-1,n));
  elapsedRef.current=0;setIndex(target);setSeconds(0);setSpokenCaption('');
  if(autoplay)playHandler.current(target,language);
  else setPlaying(false);
 };
 const togglePlayback=()=>{
  const speech=synth();
  if(playing){
   active.current=false;setPlaying(false);
   if(speechMode.current==='voice')speech?.pause();
   return;
  }
  if(speechMode.current==='voice'&&speech?.paused&&speech.speaking){
   active.current=true;speech.resume();setPlaying(true);return;
  }
  playHandler.current(index,lang);
 };
 // A visual-only fallback uses time. During spoken playback this interval
 // updates the progress bar but CANNOT skip or interrupt the narration.
 useEffect(()=>{
  if(!playing)return;
  let last=Date.now();
  const timer=setInterval(()=>{
   const now=Date.now(),delta=(now-last)/1000;last=now;
   if(speechMode.current==='timed'){
    const next=elapsedRef.current+delta;
    if(next>=estimatedSeconds[index]){
     if(index+1<guideLessons.length)playHandler.current(index+1,lang);
     else{elapsedRef.current=estimatedSeconds[index];setSeconds(estimatedSeconds[index]);active.current=false;setPlaying(false);}
    }else{elapsedRef.current=next;setSeconds(next);}
   }else{
    const phraseCap=estimatedSeconds[index]*(phraseRef.current+.95)/Math.max(1,phraseCountRef.current);
    elapsedRef.current=Math.max(elapsedRef.current,Math.min(phraseCap,elapsedRef.current+delta*.25));
    setSeconds(elapsedRef.current);
   }
  },300);
  return()=>clearInterval(timer);
 },[playing,index,lang,speakingEnabled]);
 useEffect(()=>()=>{active.current=false;token.current++;utteranceRef.current=null;synth()?.cancel()},[]);
 const switchLang=()=>{const other:GuideLang=lang==='ar'?'fr':'ar';setLang(other);setVoiceId('');jump(index,playing,other)};
 const testNarrator=()=>{
  const speech=synth();
  if(!speech){setVoiceError(trans(lang,'المتصفح لا يدعم تشغيل الأصوات.','La synthèse vocale est indisponible.'));return;}
  token.current++;active.current=false;setPlaying(false);utteranceRef.current=null;speech.cancel();setSeconds(0);
  const sample=trans(lang,'أهلاً بك في بريستو. اليوم سأشرح لك كيف تستلم طلبك، وتفتح الخريطة، وتحسب أرباحك. خطوة بخطوة، وبكل وضوح.','Bienvenue chez Presto. Je vais t’expliquer comment recevoir une commande, ouvrir la carte et comprendre tes gains, étape par étape.');
  const utter=new SpeechSynthesisUtterance(sample);
  const available=speech.getVoices().filter(v=>v.lang.toLowerCase().startsWith(lang==='ar'?'ar':'fr'));
  const choice=selectNarrator(available,voiceId);
  if(choice)utter.voice=choice;
  utter.lang=choice?.lang||(lang==='ar'?'ar-SA':'fr-FR');utter.rate=speed;utter.pitch=1;utter.volume=1;
  utteranceRef.current=utter;speech.speak(utter);
 };
 const lesson=guideLessons[index];
 const category=chapters.find(c=>c.key===lesson.chapter)!;
 const passed=estimatedSeconds.slice(0,index).reduce((a,b)=>a+b,0)+seconds;
 const score=guideQuiz.reduce((a,q,i)=>a+(quizAnswers[i]===q.correct?1:0),0);
 const allAnswered=Object.keys(quizAnswers).length===guideQuiz.length;
 return <main className={styles.shell} dir={lang==='ar'?'rtl':'ltr'}>
  <header className={styles.header}><a className={styles.logo} href="/"><span className={styles.brandDot}>P</span><span><strong>PRESTO</strong><small>ACADEMY</small></span></a><div className={styles.headerActions}><button type="button" onClick={switchLang}><Globe2 size={17}/>{lang==='ar'?'Français':'العربية'}</button><a href="/">{trans(lang,'العودة للموقع','Retour au site')}{lang==='ar'?<ArrowLeft size={17}/>:<ArrowRight size={17}/>}</a></div></header>
  <div style={{maxWidth:1370,margin:'0 auto 12px',padding:'0 22px'}}><a href="/guide-livreur/video" style={{textDecoration:'none',background:'linear-gradient(110deg,#142d43,#1e4762)',color:'white',borderRadius:14,padding:'17px 21px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:14,fontWeight:900,fontSize:14,boxShadow:'0 12px 28px #102e4922'}}><span style={{display:'flex',alignItems:'center',gap:10}}><Play size={23}/>{trans(lang,'شاهد فيديو تدريب السائقين بدقة Full HD — 25 مشهدًا','Regarder la formation vidéo Full HD — 25 scènes')}</span><span style={{display:'flex',alignItems:'center',gap:7,fontSize:11,whiteSpace:'nowrap'}}>6:05 <ArrowLeft size={16}/></span></a></div>
  <section className={styles.hero}><span className={styles.eyebrow}>PRESTO MASTERCLASS · GUIDE DU LIVREUR</span><h1>{trans(lang,'من أول طلب إلى أول أرباحك','De la première commande à tes gains')}</h1><p>{trans(lang,'شرح متكامل بالصوت والرسوم المتحركة: التطبيق، الخرائط، الطلبات، الدفع، المشكلات والسلامة','Formation détaillée avec narration, animations, cartes, paiements et sécurité')}</p><div className={styles.highlights}><span><Check size={15}/>{guideLessons.length} {trans(lang,'مشهدًا تفصيليًا','chapitres détaillés')}</span><span><Wallet size={15}/>{trans(lang,'أرباح وعمولة 0%','Gains et 0 % commission')}</span><span><Navigation size={15}/>{trans(lang,'خريطة المطعم والزبون','GPS restaurant et client')}</span></div></section>
  <nav className={styles.chapterNav} aria-label={trans(lang,'أقسام التدريب','Sections du guide')}>{chapters.map(ch=><button type="button" key={ch.key} className={ch.key===lesson.chapter?styles.activeChapter:''} onClick={()=>jump(guideLessons.findIndex(x=>x.chapter===ch.key),false)}><small>{ch.icon}</small><span>{trans(lang,ch.ar,ch.fr)}</span></button>)}</nav>
  <div className={[styles.playerGrid,theaterMode?styles.theaterMode:""].join(" ")}><section className={styles.player}>
   <div className={styles.filmHeader}><span className={styles.playingLight}/><span>PRESTO · DRIVER TRAINING</span><span className={styles.filmPosition}>{String(index+1).padStart(2,'0')} / {guideLessons.length}</span><button type="button" className={styles.filmAction} onClick={()=>setCaptionVisible(x=>!x)} title={trans(lang,'إظهار وإخفاء الترجمة المصاحبة','Afficher les sous-titres')} aria-label={trans(lang,'إظهار وإخفاء نص الكلام','Afficher les sous-titres')}><Subtitles size={18}/></button><button type="button" className={styles.filmAction} onClick={()=>setTheaterMode(x=>!x)} title={trans(lang,'توسيع العرض','Mode cinéma')} aria-label={trans(lang,'توسيع العرض','Mode cinéma')}>{theaterMode?<Minimize2 size={18}/>:<Maximize2 size={18}/>}</button></div>
   <div className={styles.cinemaStage}>
    <FilmScene sceneId={lesson.id} view={lesson.view} lang={lang}/>
    <div className={styles.stageLabel}><span className={styles.stageNumber}>{String(index+1).padStart(2,'0')}</span><span><small>{trans(lang,'الخطوة الحالية','Étape actuelle')}</small><strong>{trans(lang,lesson.titleAr,lesson.titleFr)}</strong></span></div>
   </div>
   {captionVisible?<div className={styles.liveCaptions} aria-live="off"><span className={styles.captionMic}><Mic2 size={18}/></span><p>{playing&&spokenCaption?spokenCaption:trans(lang,lesson.captionAr,lesson.captionFr)}</p><span className={styles.audioWaves} aria-hidden="true"><i/><i/><i/></span></div>:null}
   <div className={styles.caption}><span>{trans(lang,category.ar,category.fr)} · {trans(lang,'المشهد','Scène')} {index+1}</span><h2>{trans(lang,lesson.titleAr,lesson.titleFr)}</h2><p>{trans(lang,lesson.captionAr,lesson.captionFr)}</p></div>
   <div className={styles.controls}><div className={styles.progressBar} role="progressbar" aria-label={trans(lang,'تقدم العرض','Progression')} aria-valuemin={0} aria-valuemax={totalTime} aria-valuenow={Math.round(passed)}><span style={{width:Math.min(100,passed/totalTime*100)+'%'}}/></div>
    <div className={styles.controlRow}>
     <button className={styles.minor} type="button" disabled={index===0} title={trans(lang,'السابق','Précédent')} onClick={()=>jump(index-1)}>{lang==='ar'?<ChevronRight size={21}/>:<ChevronLeft size={21}/>}</button>
     <button className={styles.primary} type="button" onClick={togglePlayback}>{playing?<><Pause size={19}/>{trans(lang,'إيقاف مؤقت','Pause')}</>:<><Play size={19}/>{trans(lang,'تشغيل الشرح','Lire la narration')}</>}</button>
     <button className={styles.minor} type="button" disabled={index===guideLessons.length-1} title={trans(lang,'التالي','Suivant')} onClick={()=>jump(index+1)}>{lang==='ar'?<ChevronLeft size={21}/>:<ChevronRight size={21}/>}</button>
     <span className={styles.runtime} dir="ltr">{formatTime(passed)} / {formatTime(totalTime)}</span>
     <button className={styles.minor} type="button" title={trans(lang,'إعادة من البداية','Recommencer')} onClick={()=>jump(0,true)}><RotateCcw size={17}/></button>
    </div>
   </div>
   <div className={styles.voiceStudio}><div className={styles.studioHeading}><Mic2 size={19}/><strong>{trans(lang,'صوت المُعلّق الطبيعي','Voix du narrateur')}</strong><span className={styles.voiceNoteTag}>{trans(lang,'إلقاء محسّن','Narration fluide')}</span></div><div className={styles.studioControls}>
    <label className={styles.studioSwitch}><input type="checkbox" checked={speakingEnabled} onChange={e=>{setSpeakingEnabled(e.target.checked);if(playing)jump(index,false)}}/>{trans(lang,'تشغيل التعليق الصوتي','Narration audio')}</label>
    <label>{trans(lang,'اختر صوتًا متاحًا على جهازك','Voix disponible')}<select value={voiceId} onChange={e=>{setVoiceId(e.target.value);if(playing)jump(index,false)}}><option value="">{chosenVoice?trans(lang,'الصوت الأنسب تلقائياً: ','Voix recommandée : ')+chosenVoice.name:trans(lang,'الصوت الافتراضي','Voix par défaut')}</option>{filteredVoices.map(v=><option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}</select></label>
    <label>{trans(lang,'سرعة الكلام','Vitesse')}<select value={speed} onChange={e=>{setSpeed(Number(e.target.value));if(playing)jump(index,false)}}><option value={0.87}>{trans(lang,'هادئ وواضح','Calme')}</option><option value={0.96}>{trans(lang,'طبيعي ومريح','Naturel')}</option><option value={1.05}>{trans(lang,'أسرع قليلاً','Plus rapide')}</option></select></label>
   </div><div className={styles.voiceTestRow}><button type="button" className={styles.testVoiceButton} onClick={testNarrator}><Play size={16}/>{trans(lang,'جرّب صوت المُعلّق','Écouter un exemple')}</button><p>{voiceError||trans(lang,'يُقرأ الشرح بجمل قصيرة ووقفات طبيعية. هذا صوت الجهاز وليس تسجيلاً بشرياً، وتعتمد جودته على الأصوات المتاحة فيه.','Lecture par phrases courtes et pauses naturelles. Il s’agit toujours de la voix du navigateur, et non d’un enregistrement humain.')}</p></div></div>
   <div className={styles.scriptPanel}><button type="button" className={styles.scriptToggle} onClick={()=>setShowScript(!showScript)}><BookOpen size={19}/><strong>{trans(lang,'النص الكامل الذي يشرحه الصوت','Texte intégral de la narration')}</strong><ChevronDown size={19}/></button>{showScript?<div className={styles.scriptBody}><p>{trans(lang,lesson.narrationAr,lesson.narrationFr)}</p><div className={styles.keyTakeaways}>{(lang==='ar'?lesson.takeawaysAr:lesson.takeawaysFr).map(text=><span key={text}><CheckCircle2 size={16}/>{text}</span>)}</div></div>:null}</div>
  </section>
  <aside className={styles.sidePanel}><div className={styles.sideTitle}><div><span>CHAPTERS · PRESTO ACADEMY</span><h3>{trans(lang,'جميع مراحل التدريب','Toutes les leçons')}</h3></div><span className={styles.duration}><Clock3 size={15}/>{formatTime(totalTime)}</span></div><div className={styles.playlist}>{guideLessons.map((s,i)=><button type="button" key={s.id} className={[styles.chapter,i===index?styles.selected:'',i<index?styles.completed:''].join(' ')} onClick={()=>jump(i,playing)}><span className={styles.chapterNumber}>{i<index?<Check size={14}/>:String(i+1).padStart(2,'0')}</span><span><strong>{trans(lang,s.titleAr,s.titleFr)}</strong><small>{trans(lang,s.captionAr,s.captionFr)}</small></span></button>)}</div><div className={styles.voiceNote}><Headphones size={20}/><p>{trans(lang,'شغّل العرض من البداية، أو انتقل إلى أي خطوة. تعلّم متى تضغط كل زر ولماذا.','Lis le guide ou va directement à une étape précise.')}</p></div>
   <button type="button" className={styles.quizLaunch} onClick={()=>{jump(index,false);setQuizOpen(!quizOpen)}}><GraduationCap size={21}/>{trans(lang,'اختبار السائق: 10 أسئلة','Test livreur : 10 questions')}</button>
  </aside></div>
  {quizOpen?<section className={styles.quizPanel}><div className={styles.quizHead}><div><span>PRESTO · KNOWLEDGE CHECK</span><h2>{trans(lang,'اختبر معرفتك بعد الشرح','Vérifie tes connaissances')}</h2><p>{trans(lang,'اختر إجابة واحدة لكل سؤال، ثم شاهد نتيجتك','Choisis une réponse à chaque question')}</p></div><strong>{Object.keys(quizAnswers).length} / {guideQuiz.length}</strong></div><div className={styles.quizGrid}>{guideQuiz.map((q,i)=><div className={styles.quizItem} key={i}><b>{i+1}. {trans(lang,q.ar,q.fr)}</b>{(lang==='ar'?q.optionsAr:q.optionsFr).map((opt,j)=><label className={quizAnswers[i]===j?styles.quizSelected:''} key={j}><input type="radio" name={'q'+i} checked={quizAnswers[i]===j} onChange={()=>setQuizAnswers(old=>({...old,[i]:j}))}/>{opt}</label>)}</div>)}</div>{allAnswered?<div className={styles.quizScore}><CheckCircle2 size={27}/><strong>{trans(lang,'نتيجتك','Ton score')} {score}/{guideQuiz.length}</strong><span>{score===guideQuiz.length?trans(lang,'ممتاز، أجبت عن كل الأسئلة!','Excellent, tout est correct !'):trans(lang,'راجع الدروس المرتبطة بالأخطاء وأعد الاختبار','Revois les étapes et réessaie')}</span><button type="button" onClick={()=>setQuizAnswers({})}>{trans(lang,'إعادة الاختبار','Réessayer')}</button></div>:null}</section>:null}
  <footer className={styles.footer}>© PRESTO Academy · {trans(lang,'المشاهد محاكاة تعليمية. اتبع التطبيق الفعلي وسياسات الإدارة عند الاختلاف.','Les écrans sont des simulations. Les consignes de l’application font foi.')}</footer>
 </main>;
}

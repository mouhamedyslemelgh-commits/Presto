'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Clapperboard,Film,Play,Pause,RotateCcw,Volume2,VolumeX,Smartphone,Bike,House,CheckCircle2} from 'lucide-react';
import './annonces.css';

type Scene={title:string;detail:string;narration:string;duration:number};
const SCENES:Scene[]=[
 {title:'كل شيء يبدأ بطلب',detail:'من قلب نواكشوط… زبون يرتدي الدراعة الموريتانية يفتح هاتفه.',narration:'في نواكشوط، يومك أسرع مع بريستو.',duration:5},
 {title:'تطلب في ثوانٍ',detail:'يفتح تطبيق PRESTO، يختار وجبته، ويؤكد الطلب بسهولة.',narration:'تفتح تطبيق بريستو، تختار وجبتك، وتأكد طلبك في ثوانٍ.',duration:5},
 {title:'المندوب تصله الرحلة',detail:'إشعار الطلب يصل إلى مندوب بريستو، فيقبل الرحلة فوراً.',narration:'وفي نفس اللحظة، تصل الرحلة إلى مندوب بريستو، ويقبلها على الفور.',duration:5},
 {title:'على الطريق… بسرعة',detail:'المندوب يلتقط الطلب من المطعم ويعبر شوارع نواكشوط نحو الزبون.',narration:'ينطلق المندوب إلى المطعم، يأخذ طلبك، ثم يتجه إليك مباشرة.',duration:5},
 {title:'وصل طلبك إلى الباب',detail:'ابتسامة، تسليم آمن، وتجربة توصيل سهلة من البداية للنهاية.',narration:'ها هو أمام باب بيتك، يسلّمك طلبك بابتسامة.',duration:5},
 {title:'PRESTO | بريستو',detail:'بريستو هي الأفضل… وطلبك يأتيك قبل ما ترمش عينك!',narration:'بريستو هي الأفضل… وطلبك يأتيك قبل ما ترمش عينك!',duration:6}
];
const TOTAL=SCENES.reduce((n,s)=>n+s.duration,0);
const cutoffs=SCENES.map((_,i)=>SCENES.slice(0,i).reduce((n,s)=>n+s.duration,0));
function Customer({x=110,y=125,scale=1,phone=true}:{x?:number;y?:number;scale?:number;phone?:boolean}){
 return <g transform={`translate(${x} ${y}) scale(${scale})`} className="adsCustomer">
  <ellipse cx="71" cy="273" rx="82" ry="12" fill="#111e30" opacity=".16"/>
  <path d="M44 88 Q7 107 6 188 L-2 262 Q72 284 141 260 L132 182 Q129 109 96 91Z" fill="#d8f0f8" stroke="#a0c8d5" strokeWidth="3"/>
  <path d="M44 105 Q62 130 80 104 L77 262 L33 256Z" fill="#f9ffff" opacity=".88"/>
  <path d="M92 104 L133 185 L148 151 L161 153 L141 207 L112 188 L89 129Z" fill="#d8f0f8"/>
  <path d="M20 111 L-9 167 L0 194 L38 162" fill="#d0edf6"/>
  <circle cx="69" cy="59" r="33" fill="#b77a50"/>
  <path d="M37 56 Q29 26 47 18 Q83 -5 101 26 L102 56 L91 43 Q70 49 44 41Z" fill="#f4f5ec"/>
  <path d="M41 29 Q72 6 100 33" fill="none" stroke="#d2ded9" strokeWidth="7" strokeLinecap="round"/>
  <path d="M44 75 Q68 92 93 74" stroke="#754a37" strokeWidth="2" fill="none"/>
  <circle cx="59" cy="59" r="2.5" fill="#2e2927"/><circle cx="82" cy="59" r="2.5" fill="#2e2927"/>
  {phone&&<g><rect x="147" y="128" width="31" height="57" rx="6" fill="#10243c" stroke="#ffba6a" strokeWidth="3"/><rect x="152" y="136" width="21" height="40" rx="2" fill="#fff"/><circle cx="163" cy="156" r="7" fill="#f36c36"/></g>}
 </g>
}
function Courier({x=220,y=208,scale=1}:{x?:number;y?:number;scale?:number}){
return <g transform={`translate(${x} ${y}) scale(${scale})`} className="adsCourier">
  <ellipse cx="128" cy="156" rx="152" ry="15" fill="#1a2940" opacity=".17"/>
  <circle cx="46" cy="121" r="37" fill="#203448"/><circle cx="46" cy="121" r="23" fill="#f3f6fa"/><circle cx="46" cy="121" r="10" fill="#203448"/>
  <circle cx="223" cy="121" r="37" fill="#203448"/><circle cx="223" cy="121" r="23" fill="#f3f6fa"/><circle cx="223" cy="121" r="10" fill="#203448"/>
  <path d="M47 120 L105 62 L164 114 L217 121" fill="none" stroke="#1d3246" strokeWidth="11" strokeLinejoin="round"/>
  <path d="M76 105 L104 67 Q157 55 180 84 L179 110 L134 122Z" fill="#f56830" stroke="#d4481e" strokeWidth="3"/>
  <path d="M174 76 L202 77 L225 115" fill="none" stroke="#1b2b3c" strokeWidth="8" strokeLinecap="round"/>
  <rect x="83" y="16" width="87" height="65" rx="11" fill="#f36d31" stroke="#ffa56f" strokeWidth="3"/><text x="127" y="53" fill="white" textAnchor="middle" fontSize="18" fontWeight="900">PRESTO</text>
  <path d="M128 5 L160 -32 L196 -22 L184 16 L153 46 L134 48Z" fill="#f9fafb"/>
  <path d="M160 -29 L196 -23 L186 8 L147 0" fill="#182e43"/>
  <path d="M161 0 L183 30 L206 39" fill="none" stroke="#bd8055" strokeWidth="13" strokeLinecap="round"/>
  <circle cx="190" cy="-49" r="23" fill="#bd8055"/>
  <path d="M163 -51 Q169 -88 194 -81 Q213 -74 215 -50Z" fill="#ff813e"/><path d="M166 -49 L218 -46" stroke="#fff" strokeWidth="4"/>
  <path d="M159 32 L113 66 L91 117" fill="none" stroke="#202a3b" strokeWidth="14" strokeLinecap="round"/>
 </g>
}
function Building({kind='restaurant',x=530}:{kind?:'restaurant'|'home';x?:number}){
return <g transform={`translate(${x} 102)`}>
  <rect x="0" y="80" width="223" height="236" rx="10" fill={kind==='home'?'#fcf0d7':'#f8e5cb'} stroke="#e8c5a5" strokeWidth="4"/>
  <path d="M-9 91 L112 19 L232 91" fill={kind==='home'?'#e9a06f':'#e4b88b'} stroke="#bc855c" strokeWidth="5" strokeLinejoin="round"/>
  <rect x="84" y="193" width="72" height="123" rx="30" fill="#26415b"/>
  <rect x="23" y="123" width="56" height="69" rx="25" fill="#86c5ca" stroke="#fff" strokeWidth="5"/>
  <rect x="162" y="123" width="43" height="69" rx="20" fill="#86c5ca" stroke="#fff" strokeWidth="5"/>
  {kind==='restaurant'?<><rect x="15" y="91" width="195" height="42" rx="7" fill="#eb6938"/><text x="113" y="119" textAnchor="middle" fill="white" fontSize="19" fontWeight="800">RESTAURANT</text></>:<><rect x="94" y="210" width="49" height="97" rx="20" fill="#b06d47"/><circle cx="134" cy="259" r="4" fill="#ffd57e"/></>}
</g>
}
function Sky(){return <><defs><linearGradient id="adSky" x1="0" x2=".9" y1="0" y2="1"><stop offset="0%" stopColor="#092641"/><stop offset="62%" stopColor="#235978"/><stop offset="100%" stopColor="#f4a16b"/></linearGradient><linearGradient id="adGround" x1="0" x2="1"><stop offset="0%" stopColor="#e9c39e"/><stop offset="100%" stopColor="#cda17d"/></linearGradient></defs><rect width="800" height="450" fill="url(#adSky)"/><circle cx="657" cy="87" r="48" fill="#ffe2ac" opacity=".86"/><path d="M0 300 Q162 257 337 301 Q560 240 800 302 L800 450 L0 450Z" fill="#cf9b75"/><rect y="332" width="800" height="118" fill="url(#adGround)"/><path d="M0 394 L800 394" stroke="#fbdfbd" strokeDasharray="51 42" strokeWidth="5" opacity=".6"/><g fill="#16334a" opacity=".44"><rect x="8" y="221" width="89" height="115" rx="4"/><rect x="106" y="238" width="80" height="100"/><rect x="635" y="233" width="160" height="105"/></g><g stroke="#38615f" strokeWidth="8" fill="none"><path d="M38 336 L38 250 M38 272 Q13 246 3 259 M38 271 Q64 235 84 247 M730 335 L730 256 M730 270 Q703 248 690 252 M730 272 Q765 239 783 253"/></g></>}
function SceneVisual({scene}:{scene:number}){
return <svg className="adsArt" viewBox="0 0 800 450" role="img" aria-label={SCENES[scene].detail} preserveAspectRatio="xMidYMid slice">
 <Sky/>
 {scene===0&&<><Building kind="home" x={505}/><Customer x={145} y={78} scale={1.17}/><g className="adsFloat"><rect x="325" y="89" width="178" height="65" rx="20" fill="#fff" opacity=".96"/><text x="415" y="127" textAnchor="middle" fontSize="18" fill="#15304b" fontWeight="800">PRESTO ☀</text></g></>}
 {scene===1&&<><Customer x={43} y={114} scale={.94}/><g className="adsPhone" transform="translate(342 24)"><rect x="0" y="0" width="235" height="384" rx="32" fill="#12273e" stroke="#ffbb83" strokeWidth="7"/><rect x="12" y="17" width="211" height="351" rx="21" fill="#fff9f5"/><rect x="83" y="8" width="74" height="12" rx="6" fill="#12273e"/><rect x="28" y="42" width="178" height="45" rx="12" fill="#f36b31"/><text x="117" y="71" fontSize="25" fontWeight="900" fill="#fff" textAnchor="middle">PRESTO</text><text x="117" y="119" fontSize="18" fill="#183147" textAnchor="middle">اطلب وجبتك</text><rect x="26" y="140" width="180" height="106" rx="16" fill="#fce6d6"/><circle cx="76" cy="193" r="31" fill="#efb95c"/><circle cx="70" cy="185" r="12" fill="#dc6330"/><circle cx="90" cy="202" r="11" fill="#a75030"/><text x="149" y="190" fontSize="17" fontWeight="800" fill="#263950" textAnchor="middle">وجبتك</text><rect x="35" y="271" width="165" height="54" rx="15" fill="#f36b31"/><text x="117" y="305" fill="#fff" fontWeight="800" fontSize="24" textAnchor="middle">تأكيد الطلب ✓</text></g></>}
 {scene===2&&<><Building x={40}/><g className="adsFloat"><rect x="375" y="55" width="343" height="111" rx="22" fill="#fff"/><circle cx="423" cy="106" r="26" fill="#ffe5d3"/><path d="M411 106 L420 114 L437 94" fill="none" stroke="#ef6730" strokeWidth="7" strokeLinecap="round"/><text x="566" y="105" textAnchor="middle" fontSize="20" fontWeight="900" fill="#21394c">رحلة جديدة!</text><text x="566" y="137" textAnchor="middle" fontSize="16" fill="#627387">قبول الطلب  ✓</text></g><Courier x={343} y={233} scale={.98}/></>}
 {scene===3&&<><Building x={547}/><g className="adsCloud" opacity=".9"><path d="M55 116 H222" stroke="white" strokeWidth="11" strokeLinecap="round" strokeDasharray="40 28"/><path d="M29 151 H165" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeDasharray="55 34"/></g><g className="adsRide"><Courier x={115} y={231} scale={1.2}/></g></>}
 {scene===4&&<><Building kind="home" x={516}/><Courier x={47} y={256} scale={.83}/><Customer x={505} y={156} scale={.74} phone={false}/><g className="adsBag"><rect x="378" y="284" width="55" height="60" rx="9" fill="#f57435"/><path d="M390 284 Q403 252 421 284" fill="none" stroke="#fff" strokeWidth="6"/><text x="405" y="320" fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">PRESTO</text></g><g className="adsFloat"><circle cx="410" cy="142" r="42" fill="#fff"/><path d="M390 143 L405 157 L434 127" stroke="#34a77c" strokeWidth="11" fill="none" strokeLinecap="round"/></g></>}
 {scene===5&&<><g className="adsFinal"><circle cx="400" cy="218" r="151" fill="#f06b31" opacity=".17"/><circle cx="400" cy="218" r="116" fill="#f06b31" opacity=".26"/><rect x="225" y="142" width="350" height="154" rx="32" fill="#12283e" stroke="#f69052" strokeWidth="3"/><text x="400" y="204" fontSize="69" fontWeight="900" fill="#fff" textAnchor="middle">PRESTO</text><text x="400" y="256" fontSize="36" fontWeight="800" fill="#ffb876" textAnchor="middle">بريستو</text></g><g className="adsSpark"><text x="172" y="98" fontSize="42" fill="#ffc78d">✦</text><text x="639" y="179" fontSize="48" fill="#ffc78d">✦</text><text x="166" y="344" fontSize="37" fill="#fff">✦</text></g></>}
 </svg>
}
function formatTime(n:number){const value=Math.floor(n);return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;}
export default function PrestoAdsPage(){
 const [time,setTime]=useState(0);
 const [playing,setPlaying]=useState(false);
 const [voice,setVoice]=useState(false);
 const scene=useMemo(()=>Math.max(0,cutoffs.findLastIndex(start=>time>=start)),[time]);
 useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>setTime(v=>Math.min(TOTAL,v+.1)),100);return()=>window.clearInterval(id);},[playing]);
 useEffect(()=>{if(time>=TOTAL&&playing)setPlaying(false);},[time,playing]);
 useEffect(()=>{if(!voice||!playing||!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(SCENES[scene].narration);speech.lang='ar';speech.rate=.88;speech.pitch=1;window.speechSynthesis.speak(speech);return()=>window.speechSynthesis.cancel();},[scene,voice,playing]);
 const togglePlay=()=>{if(time>=TOTAL)setTime(0);setPlaying(p=>!p||time>=TOTAL);};
 const restart=()=>{setTime(0);setPlaying(true);};
 const toggleVoice=()=>{setVoice(s=>!s);};
 return <div className="prestoAdsPage" dir="rtl">
  <header className="adsHeader"><div className="adsIdentity"><img src="/logos/presto.webp" alt="PRESTO" width={68} height={43}/><span>PRESTO <small>الإعلانات</small></span></div><Link href="/" className="adsBack"><ArrowRight size={18}/> العودة إلى لوحة التحكم</Link></header>
  <main className="adsLayout">
    <div className="adsEyebrow"><Clapperboard size={18}/> استوديو PRESTO الإعلاني · إعلان 01</div>
    <h1>إعلانات بريستو</h1>
    <p className="adsLead">قصة الطلب من هاتفك إلى باب بيتك، في إعلان متحرك مستوحى من أجواء نواكشوط وزيّها الموريتاني.</p>
    <div className="adsGrid">
    <section className="adsPlayerWrap" aria-label="مشغل الإعلان">
      <div className="adsStage">
        <div key={scene} className="adsScene"><SceneVisual scene={scene}/></div>
        <div className="adsGlow"/>
        <div className="adsWatermark"><span className="adsPulse"/> إعلان PRESTO</div>
        <div className="adsCaption" key={'caption'+scene}><span className="adsSceneNum">المشهد {scene+1} / {SCENES.length}</span><strong>{SCENES[scene].title}</strong><p>{SCENES[scene].detail}</p></div>
        {!playing&&<button type="button" className="adsBigPlay" onClick={togglePlay} aria-label={time>=TOTAL?'إعادة مشاهدة الإعلان':'تشغيل الإعلان'}><Play fill="currentColor" size={34}/></button>}
      </div>
      <div className="adsControls">
        <div className="adsButtons"><button type="button" onClick={togglePlay} aria-label={playing?'إيقاف مؤقت':'تشغيل'}>{playing?<Pause size={21} fill="currentColor"/>:<Play size={21} fill="currentColor"/>}</button><button type="button" onClick={restart} aria-label="إعادة التشغيل"><RotateCcw size={20}/></button><button type="button" onClick={toggleVoice} aria-label={voice?'كتم التعليق الصوتي':'تشغيل التعليق الصوتي التجريبي'} title="تعليق صوتي تجريبي باستخدام صوت الجهاز">{voice?<Volume2 size={20}/>:<VolumeX size={20}/>}</button></div>
        <input aria-label="التقدم في الإعلان" type="range" min="0" max={TOTAL} step=".1" value={time} style={{background:`linear-gradient(to left,#f36b31 ${time/TOTAL*100}%,#304357 ${time/TOTAL*100}%)`}} onChange={e=>setTime(Number(e.currentTarget.value))}/>
        <span className="adsTime">{formatTime(time)} / {formatTime(TOTAL)}</span>
      </div>
    </section>
    <aside className="adsDetails"><div className="adsDetailsTop"><Film size={21}/><span>حكاية الإعلان</span></div><h2>من أول ضغطة… إلى آخر ابتسامة.</h2><p>ستة مشاهد قصيرة تقدّم خدمة PRESTO للعميل وللمندوب بصورة بصرية مرحة، مع انتقالات حركية وتعليق عربي اختياري.</p>
      <div className="adsTimeline">{SCENES.map((s,i)=><button type="button" key={s.title} onClick={()=>{setTime(cutoffs[i]);setPlaying(true)}} className={i===scene?'active':''}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{s.title}</strong><small>{s.detail}</small></div></button>)}</div>
      <p className="adsVoiceNote">التعليق الصوتي هنا تجريبي ويعتمد على الأصوات المتوفرة في جهازك، وليس تسجيلاً بشرياً نهائياً.</p>
    </aside></div>
    <section className="adsTagline"><div><span>PRESTO · توصيل أسهل في نواكشوط</span><h2>بريستو هي الأفضل، وطلبك يأتيك قبل ما ترمش عينك!</h2><p>اطلب بسهولة • مندوب يستجيب • توصيل إلى باب المنزل</p></div><div className="adsSteps"><span><Smartphone size={20}/> اطلب</span><span><Bike size={20}/> ننطلق</span><span><House size={20}/> نستلمك الطلب</span><span><CheckCircle2 size={20}/> بكل راحة</span></div></section>
  </main>
 </div>;
}

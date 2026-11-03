'use client';

import {createContext,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {Check,ChevronDown,Minus,Moon,Monitor,Palette,Plus,RotateCcw,SlidersHorizontal,Sun} from 'lucide-react';
import {useLanguage} from './presto-language';

type AppearanceMode='light'|'dark'|'system';
type Appearance={mode:AppearanceMode;accent:string;brightness:number};
type AppearanceContextValue={appearance:Appearance;setAppearance:(patch:Partial<Appearance>)=>void;reset:()=>void;dark:boolean};
const STORAGE_KEY='presto-appearance-v1';
const DEFAULT:Appearance={mode:'light',accent:'#f26c3c',brightness:100};
const COLORS=[
 {value:'#f26c3c',ar:'برتقالي بريستو',fr:'Orange PRESTO'},
 {value:'#0d9488',ar:'فيروزي',fr:'Turquoise'},
 {value:'#2563eb',ar:'أزرق',fr:'Bleu'},
 {value:'#7c3aed',ar:'بنفسجي',fr:'Violet'},
 {value:'#16a34a',ar:'أخضر',fr:'Vert'},
 {value:'#db2777',ar:'وردي',fr:'Rose'},
 {value:'#ca8a04',ar:'ذهبي',fr:'Or'},
 {value:'#334155',ar:'رمادي داكن',fr:'Ardoise'},
];
const AppearanceContext=createContext<AppearanceContextValue|null>(null);
const validColor=(value:unknown):value is string=>typeof value==='string'&&/^#[0-9a-fA-F]{6}$/.test(value);
const clamp=(value:number)=>Math.max(60,Math.min(120,Math.round(value)));

export function PrestoAppearanceProvider({children}:{children:ReactNode}){
 const [appearance,update]=useState<Appearance>(DEFAULT);
 const [ready,setReady]=useState(false);
 const [systemDark,setSystemDark]=useState(false);
 useEffect(()=>{
  try{
   const raw=localStorage.getItem(STORAGE_KEY);
   if(raw){
    const saved:unknown=JSON.parse(raw);
    if(saved&&typeof saved==='object'){
     const p=saved as Record<string,unknown>;
     update({
      mode:p.mode==='dark'||p.mode==='system'?p.mode:'light',
      accent:validColor(p.accent)?p.accent:DEFAULT.accent,
      brightness:typeof p.brightness==='number'&&Number.isFinite(p.brightness)?clamp(p.brightness):100,
     });
    }
   }
  }catch{}
  setReady(true);
 },[]);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const change=()=>setSystemDark(media.matches);
  change();
  media.addEventListener('change',change);
  return ()=>media.removeEventListener('change',change);
 },[]);
 const dark=appearance.mode==='dark'||(appearance.mode==='system'&&systemDark);
 useEffect(()=>{
  if(!ready)return;
  const root=document.documentElement;
  root.dataset.prestoTheme=dark?'dark':'light';
  root.dataset.prestoMode=appearance.mode;
  root.style.setProperty('--presto-accent',appearance.accent);
  root.style.setProperty('--presto-screen-dim',String(Math.max(0,(100-appearance.brightness)*.008)));
  root.style.setProperty('--presto-screen-light',String(Math.max(0,(appearance.brightness-100)*.006)));
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(appearance))}catch{}
 },[appearance,dark,ready]);
 const setAppearance=(patch:Partial<Appearance>)=>update(prev=>({
  mode:patch.mode==='light'||patch.mode==='dark'||patch.mode==='system'?patch.mode:prev.mode,
  accent:validColor(patch.accent)?patch.accent:prev.accent,
  brightness:typeof patch.brightness==='number'&&Number.isFinite(patch.brightness)?clamp(patch.brightness):prev.brightness,
 }));
 const value=useMemo(()=>({appearance,setAppearance,reset:()=>update(DEFAULT),dark}),[appearance,dark]);
 return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

function useAppearance(){
 const value=useContext(AppearanceContext);
 if(!value)throw new Error('PrestoAppearanceProvider is missing');
 return value;
}

function AppearanceFields(){
 const {appearance,setAppearance,reset}=useAppearance();
 const {language}=useLanguage();
 const ar=language==='ar';
 const modes:{value:AppearanceMode;label:string;Icon:typeof Sun}[]=[
  {value:'light',label:ar?'نهاري':'Clair',Icon:Sun},
  {value:'dark',label:ar?'ليلي':'Sombre',Icon:Moon},
  {value:'system',label:ar?'تلقائي':'Auto',Icon:Monitor},
 ];
 return <div className="prestoAppearanceFields" dir={ar?'rtl':'ltr'}>
  <div className="prestoAppearanceGroup">
   <div className="prestoAppearanceLabel"><Sun size={16}/><strong>{ar?'وضع العرض':'Mode d’affichage'}</strong></div>
   <div className="prestoAppearanceModes" role="group" aria-label={ar?'وضع العرض':'Mode d’affichage'}>
    {modes.map(({value,label,Icon})=><button type="button" key={value} aria-pressed={appearance.mode===value} className={appearance.mode===value?'active':''} onClick={()=>setAppearance({mode:value})}><Icon size={17}/>{label}</button>)}
   </div>
  </div>
  <div className="prestoAppearanceGroup">
   <div className="prestoAppearanceLabel"><Palette size={16}/><strong>{ar?'لون الواجهة':'Couleur principale'}</strong></div>
   <div className="prestoAppearancePalette" role="group" aria-label={ar?'اختر لون الواجهة':'Choisir la couleur'}>
    {COLORS.map(color=><button key={color.value} type="button" className="prestoAppearanceSwatch" style={{backgroundColor:color.value}} aria-label={ar?color.ar:color.fr} title={ar?color.ar:color.fr} aria-pressed={appearance.accent.toLowerCase()===color.value} onClick={()=>setAppearance({accent:color.value})}>{appearance.accent.toLowerCase()===color.value&&<Check size={17}/>}</button>)}
   </div>
   <label className="prestoAppearanceCustom"><span>{ar?'أو اختر أي لون تريده':'Ou choisissez une couleur personnalisée'}</span><span className="prestoAppearanceColorInput"><input type="color" value={appearance.accent} onChange={event=>setAppearance({accent:event.target.value})} aria-label={ar?'لون مخصص':'Couleur personnalisée'}/><span dir="ltr">{appearance.accent.toUpperCase()}</span></span></label>
  </div>
  <div className="prestoAppearanceGroup">
   <div className="prestoAppearanceLabel"><SlidersHorizontal size={16}/><strong>{ar?'سطوع عرض الموقع':'Luminosité du site'}</strong><output className="prestoAppearanceOutput" dir="ltr">{appearance.brightness}%</output></div>
   <div className="prestoAppearanceBrightness"><button type="button" aria-label={ar?'تقليل السطوع':'Réduire la luminosité'} onClick={()=>setAppearance({brightness:appearance.brightness-10})} disabled={appearance.brightness<=60}><Minus size={17}/></button><input type="range" min="60" max="120" step="5" value={appearance.brightness} onChange={event=>setAppearance({brightness:Number(event.target.value)})} aria-label={ar?'مستوى سطوع عرض الموقع':'Luminosité du site'}/><button type="button" aria-label={ar?'زيادة السطوع':'Augmenter la luminosité'} onClick={()=>setAppearance({brightness:appearance.brightness+10})} disabled={appearance.brightness>=120}><Plus size={17}/></button></div>
   <p className="prestoAppearanceHint">{ar?'يتغير سطوع الموقع فقط، وليس سطوع شاشة الجهاز.':'La luminosité change uniquement l’affichage du site, pas celle de votre écran.'}</p>
  </div>
  <div className="prestoAppearanceFooter"><span>{ar?'تُحفظ خياراتك تلقائيًا على هذا الجهاز.':'Vos préférences sont enregistrées sur cet appareil.'}</span><button type="button" onClick={reset}><RotateCcw size={14}/>{ar?'إعادة الضبط':'Réinitialiser'}</button></div>
 </div>;
}

export function PrestoAppearanceControl(){
 const {appearance,dark}=useAppearance();
 const {language}=useLanguage();
 const [open,setOpen]=useState(false);
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(container.current&&!container.current.contains(event.target as Node))setOpen(false)};
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};
  document.addEventListener('pointerdown',outside);
  document.addEventListener('keydown',key);
  return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key)};
 },[open]);
 const ar=language==='ar';
 return <div className="prestoAppearanceControl" ref={container} dir={ar?'rtl':'ltr'}>
  <button type="button" className={'prestoAppearanceTrigger '+(open?'isOpen':'')} onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-haspopup="dialog" aria-label={ar?'إعدادات المظهر والسطوع':'Apparence et luminosité'} title={ar?'المظهر والسطوع':'Apparence et luminosité'}>{dark?<Moon size={18}/>:<Sun size={18}/>}<span>{ar?'المظهر':'Apparence'}</span><ChevronDown size={14}/></button>
  {open&&<section className="prestoAppearancePopover" role="dialog" aria-label={ar?'إعدادات مظهر الموقع':'Paramètres d’apparence'}>
   <div className="prestoAppearancePopoverHead"><div><span className="prestoAppearanceEyebrow">PRESTO</span><h3>{ar?'المظهر والسطوع':'Apparence & luminosité'}</h3><p>{ar?'خصص ألوان الموقع بالطريقة التي تريحك.':'Personnalisez votre espace de travail.'}</p></div><span className="prestoAppearanceHeadIcon"><Palette size={21}/></span></div>
   <AppearanceFields/>
  </section>}
 </div>;
}

export function PrestoAppearanceSettings(){
 const {language}=useLanguage();
 const ar=language==='ar';
 return <section className="settingsCard prestoAppearanceSettings" aria-label={ar?'المظهر والسطوع':'Apparence et luminosité'}>
  <div className="settingsCardHead"><span className="settingsIcon"><Palette size={20}/></span><div><h3>{ar?'تخصيص المظهر والسطوع':'Apparence et luminosité'}</h3><p>{ar?'اختر الوضع النهاري أو الليلي، اللون المفضل، ومستوى السطوع.':'Choisissez le thème clair ou sombre, la couleur et la luminosité.'}</p></div></div>
  <AppearanceFields/>
 </section>;
}

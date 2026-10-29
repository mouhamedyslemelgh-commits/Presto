'use client';

import {useMemo,useState,type ReactNode} from 'react';
import {BadgeCheck,CalendarDays,Check,CheckCircle2,ClipboardCheck,ExternalLink,FileCheck2,PackageCheck,Search,Shirt,Smartphone,UserRound,Wallet,X} from 'lucide-react';

export type OpsPay='bankily'|'masrvi'|'sedad'|'click';
export type OpsFlag='bag'|'shirt'|'verified';
export type OpsDriver={
 id:number;name:string;phone:string;delivery_date:string;observations:string;
 bag:boolean;shirt:boolean;verified:boolean;
 bankily:boolean;masrvi:boolean;sedad:boolean;click:boolean;
 bankily_account:string;masrvi_account:string;sedad_account:string;click_account:string;
};
type Common={drivers:OpsDriver[];language:'fr'|'ar';onOpen:(id:number)=>void;readonly?:boolean;onToggle:(id:number,key:OpsFlag|OpsPay,value:boolean)=>void};
const channels:[OpsPay,string,string][]=[
 ['bankily','Bankily','بنكيلي'],['masrvi','Masrvi','مصرفي'],['sedad','Sedad','سداد'],['click','CLICK','كليك']
];
const countPay=(d:OpsDriver)=>channels.filter(([k])=>d[k]).length;
const complete=(d:OpsDriver)=>d.bag&&d.shirt&&d.verified&&countPay(d)>0;
const letter=(name:string)=>Array.from(name.trim())[0]||'•';
function Header({ar,title,subtitle,total,icon}:{ar:boolean;title:string;subtitle:string;total:number;icon:ReactNode}){
 return <div className="opsPanelHeader"><div className="opsPanelHeaderIntro"><span className="opsHeaderIcon">{icon}</span><div><span className="opsEyebrow">PRESTO · {ar?'عمليات السائقين':'OPÉRATIONS LIVREURS'}</span><h2>{title}</h2><p>{subtitle}</p></div></div><span className="opsTotal"><strong>{total}</strong><small>{ar?'سائق':'livreurs'}</small></span></div>;
}
function Empty({ar}:{ar:boolean}){return <div className="opsEmpty"><Search size={25}/><strong>{ar?'لا توجد نتائج مطابقة':'Aucun résultat'}</strong><p>{ar?'جرّب اسمًا أو رقم هاتف مختلفًا.':'Essayez un autre nom ou numéro.'}</p></div>}
function Identity({driver,rank,onOpen,ar}:{driver:OpsDriver;rank:number;onOpen:(id:number)=>void;ar:boolean}){
 return <button className="opsIdentity" type="button" onClick={()=>onOpen(driver.id)} aria-label={(ar?'فتح ملف ':'Ouvrir la fiche de ')+driver.name}>
 <span className="opsDriverAvatar">{letter(driver.name)}</span><span className="opsIdentityText"><strong>{driver.name}</strong><small>{ar?'السائق رقم ':'Livreur n° '}{rank} · {ar?'عرض الملف':'Voir la fiche'}</small></span><ExternalLink size={16} className="opsProfileArrow"/></button>;
}
function SearchBar({value,onChange,ar,shown,total}:{value:string;onChange:(v:string)=>void;ar:boolean;shown:number;total:number}){
 return <div className="opsSearchToolbar"><label className="opsSearch"><Search size={18}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={ar?'ابحث عن سائق بالاسم أو الهاتف':'Rechercher par nom ou téléphone'}/>{value&&<button type="button" aria-label={ar?'مسح البحث':'Effacer la recherche'} onClick={()=>onChange('')}><X size={16}/></button>}</label><span className="opsSearchResult">{ar?'عرض':'Affichage'} <b>{shown}</b> / {total}</span></div>;
}
export function EquipmentPanel({drivers,language,onOpen,onToggle,readonly=false}:Common){
 const ar=language==='ar', [query,setQuery]=useState(''),[filter,setFilter]=useState<'all'|'complete'|'pending'>('all');
 const ranked=useMemo(()=>new Map([...drivers].sort((a,b)=>a.id-b.id).map((d,i)=>[d.id,i+1])),[drivers]);
 const filtered=drivers.filter(d=>(filter==='all'||(filter==='complete'?d.bag&&d.shirt&&d.verified:!d.bag||!d.shirt||!d.verified))&&[d.name,d.phone,ranked.get(d.id)].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 const delivered=drivers.filter(d=>d.bag&&d.shirt&&d.verified).length;
 const metrics=[
  {key:'bag' as const,icon:PackageCheck,name:ar?'الحقائب المسلّمة':'Sacs remis',val:drivers.filter(d=>d.bag).length},
  {key:'shirt' as const,icon:Shirt,name:ar?'القمصان المسلّمة':'Chemises remises',val:drivers.filter(d=>d.shirt).length},
  {key:'verified' as const,icon:ClipboardCheck,name:ar?'الملفات الموثّقة':'Dossiers vérifiés',val:drivers.filter(d=>d.verified).length}
 ];
 return <section className="opsPanel">
  <Header ar={ar} title={ar?'متابعة المعدات':'Suivi des équipements'} subtitle={ar?'عرض واضح لحالة الحقيبة والقميص وتوثيق ملف كل سائق':'Suivi des sacs, chemises et dossiers vérifiés'} total={drivers.length} icon={<PackageCheck size={24}/>}/>
  <div className="opsMetrics">{metrics.map(m=><div className="opsMetric" key={m.key}><span className="opsMetricIcon"><m.icon size={20}/></span><div><small>{m.name}</small><strong>{m.val}<span> / {drivers.length}</span></strong></div><div className="opsMiniTrack"><i style={{width:(drivers.length?100*m.val/drivers.length:0)+'%'}}/></div></div>)}</div>
  <div className="opsSectionTop"><div><h3>{ar?'قائمة التسليم':'Liste des remises'}</h3><p>{ar?'حدّد حالة كل عنصر مباشرةً وتُحفظ في السجل المشترك':'Cochez les éléments remis ; modifications partagées'}</p></div><span className="opsSubCount"><BadgeCheck size={16}/>{delivered} / {drivers.length} {ar?'مكتمل':'complets'}</span></div>
  <SearchBar value={query} onChange={setQuery} ar={ar} shown={filtered.length} total={drivers.length}/>
  <div className="opsFilterChips" role="group" aria-label={ar?'تصفية المعدات':'Filtrer les équipements'}>{([
    ['all',ar?'الجميع':'Tous'],['complete',ar?'مكتمل':'Complets'],['pending',ar?'قيد المتابعة':'À compléter']
   ] as const).map(([key,label])=><button key={key} type="button" className={filter===key?'active':''} onClick={()=>setFilter(key)}>{label}</button>)}</div>
  <div className="opsDriverCards">{filtered.length?filtered.map(d=><article className="opsDriverCard" key={d.id}>
   <Identity driver={d} rank={ranked.get(d.id)||d.id} onOpen={onOpen} ar={ar}/>
   <div className="opsCardFlags">{metrics.map(m=><label className={'opsFlag '+(d[m.key]?'isOn':'')} key={m.key}>
    <span><m.icon size={16}/>{m.name.replace(ar?' المسلّمة':' remis','').replace(ar?' المسلّم':' remises','')}</span>
    <input type="checkbox" aria-label={m.name+' - '+d.name} disabled={readonly} checked={d[m.key]} onChange={e=>onToggle(d.id,m.key,e.target.checked)}/>
   </label>)}</div>
   <div className="opsCardFooter"><span className={'opsCardState '+(d.bag&&d.shirt&&d.verified?'isGood':'isWaiting')}><CheckCircle2 size={15}/>{d.bag&&d.shirt&&d.verified?(ar?'التسليم مكتمل':'Remise complète'):(ar?'يتطلب متابعة':'Suivi nécessaire')}</span><button type="button" onClick={()=>onOpen(d.id)}>{ar?'الملف الشخصي':'Voir le profil'} <ExternalLink size={13}/></button></div>
  </article>):<Empty ar={ar}/>}</div>
 </section>;
}
export function MobileMoneyPanel({drivers,language,onOpen,onToggle,readonly=false}:Common){
 const ar=language==='ar',[query,setQuery]=useState(''),[provider,setProvider]=useState<'all'|OpsPay>('all');
 const ranked=useMemo(()=>new Map([...drivers].sort((a,b)=>a.id-b.id).map((d,i)=>[d.id,i+1])),[drivers]);
 const chosen=drivers.filter(d=>(provider==='all'||d[provider])&&[d.name,d.phone,ranked.get(d.id),...channels.map(([k])=>d[(k+'_account') as keyof OpsDriver])].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 const linked=drivers.filter(d=>countPay(d)>0).length;
 return <section className="opsPanel">
  <Header ar={ar} title={ar?'حسابات الدفع الإلكتروني':'Comptes Mobile Money'} subtitle={ar?'أربع وسائل دفع مستقلة مع أرقام الحسابات المسجّلة':'Quatre services avec des numéros indépendants'} total={drivers.length} icon={<Wallet size={24}/>}/>
  <div className="opsPaymentSummary">{channels.map(([key,fr,arabic])=><button type="button" key={key} className={'opsProviderSummary '+(provider===key?'selected':'')} onClick={()=>setProvider(provider===key?'all':key)}>
   <span className="opsProviderLogo"><img src={'/logos/'+key+'.webp'} alt={fr} width={40} height={40}/></span><div><small>{ar?arabic:fr}</small><strong>{drivers.filter(d=>d[key]).length} <span>/ {drivers.length}</span></strong></div><span className="opsProviderPercent">{drivers.length?Math.round(drivers.filter(d=>d[key]).length/drivers.length*100):0}%</span>
  </button>)}</div>
  <div className="opsSectionTop"><div><h3>{ar?'حسابات السائقين':'Comptes des livreurs'}</h3><p>{ar?'أرقام مستقلة لبنكيلي ومصرفي وسداد وكليك':'Bankily, Masrvi, Sedad et CLICK'}</p></div><span className="opsSubCount"><Smartphone size={16}/>{linked} / {drivers.length} {ar?'لديهم حساب':'avec compte'}</span></div>
  <SearchBar value={query} onChange={setQuery} ar={ar} shown={chosen.length} total={drivers.length}/>
  <div className="opsFilterChips" role="group" aria-label={ar?'اختيار خدمة الدفع':'Choix du service'}><button type="button" className={provider==='all'?'active':''} onClick={()=>setProvider('all')}>{ar?'كل الحسابات':'Tous'}</button>{channels.map(([key,fr,arabic])=><button type="button" className={provider===key?'active':''} key={key} onClick={()=>setProvider(key)}>{ar?arabic:fr}</button>)}</div>
  <div className="opsDriverCards">{chosen.length?chosen.map(d=><article className="opsDriverCard opsPaymentDriver" key={d.id}>
   <Identity driver={d} rank={ranked.get(d.id)||d.id} ar={ar} onOpen={onOpen}/>
   <div className="opsPaymentMethods">{channels.map(([key,fr,arabic])=>{
    const number=String(d[(key+'_account') as keyof OpsDriver]||'').trim();
    return <div className={'opsMethod '+(d[key]?'isActive':'')} key={key}>
     <span className="opsMethodLogo"><img src={'/logos/'+key+'.webp'} width={29} height={29} alt=""/></span>
     <div className="opsMethodInfo"><strong>{ar?arabic:fr}</strong><span dir={number?'ltr':undefined}>{number|| (ar?'رقم غير مسجّل':'Numéro non renseigné')}</span></div>
     <label className="opsSwitch"><input type="checkbox" disabled={readonly} checked={d[key]} onChange={e=>onToggle(d.id,key,e.target.checked)} aria-label={(ar?'تفعيل ':'Activer ')+fr+' '+d.name}/><span aria-hidden="true"/></label>
    </div>;
   })}</div>
   <div className="opsCardFooter"><span className={'opsCardState '+(countPay(d)>0?'isGood':'isWaiting')}><Wallet size={15}/>{countPay(d)} / 4 {ar?'خدمات نشطة':'services actifs'}</span><button type="button" onClick={()=>onOpen(d.id)}>{ar?'تعديل الأرقام والملف':'Voir les numéros et la fiche'} <ExternalLink size={13}/></button></div>
  </article>):<Empty ar={ar}/>}</div>
 </section>;
}
export function OperationsReports({drivers,language,exportAction}:{drivers:OpsDriver[];language:'fr'|'ar';exportAction:ReactNode}){
 const ar=language==='ar';const total=drivers.length;
 const all=[
  {label:ar?'الحقائب المسلّمة':'Sacs remis',value:drivers.filter(x=>x.bag).length,icon:PackageCheck,accent:'orange'},
  {label:ar?'القمصان المسلّمة':'Chemises remises',value:drivers.filter(x=>x.shirt).length,icon:Shirt,accent:'blue'},
  {label:ar?'الملفات المكتملة':'Dossiers complets',value:drivers.filter(complete).length,icon:FileCheck2,accent:'green'},
  {label:ar?'سائقون لديهم حساب دفع':'Livreurs avec compte',value:drivers.filter(d=>countPay(d)>0).length,icon:Wallet,accent:'purple'}
 ];
 return <section className="opsPanel opsReportsPanel">
  <Header ar={ar} title={ar?'تقارير الشركة':'Rapports de l’entreprise'} subtitle={ar?'مؤشرات حية محسوبة من بيانات السائقين المسجّلة':'Indicateurs calculés à partir du registre partagé'} total={total} icon={<BadgeCheck size={24}/>}/>
  <div className="opsReportSummary"><div><span>{ar?'إجمالي السائقين':'Total des livreurs'}</span><strong>{total}</strong><p>{ar?'سجلات محفوظة في النظام':'Fiches dans le registre'}</p></div><span className="opsReportSummaryIcon"><UserRound size={40}/></span></div>
  <div className="opsReportMetrics">{all.map(m=>{const pct=total?Math.round(m.value/total*1000)/10:0;return <article className={'opsReportMetric accent-'+m.accent} key={m.label}>
   <div className="opsReportMetricTop"><span><m.icon size={21}/></span><small>{pct.toLocaleString(ar?'ar-MR':'fr-FR')}%</small></div>
   <h3>{m.label}</h3><p><strong>{m.value}</strong> <span>/ {total}</span></p>
   <div className="opsMetricProgress" role="progressbar" aria-label={m.label} aria-valuenow={m.value} aria-valuemin={0} aria-valuemax={total||1}><span style={{width:pct+'%'}}/></div>
  </article>})}</div>
  <div className="opsReportBreakdown"><div className="opsSectionTop"><div><h3>{ar?'توزيع وسائل الدفع':'Répartition des services'}</h3><p>{ar?'عدد السائقين الذين فُعّلت لديهم كل وسيلة':'Livreurs ayant activé chaque service'}</p></div></div>
   <div className="opsBreakdownGrid">{channels.map(([key,fr,arabic])=>{const c=drivers.filter(d=>d[key]).length;const percent=total?100*c/total:0;return <div className="opsBreakdownItem" key={key}><img src={'/logos/'+key+'.webp'} alt="" width={39} height={39}/><div><strong>{ar?arabic:fr}</strong><div className="opsBreakdownTrack"><span style={{width:percent+'%'}}/></div></div><span>{c} / {total}</span></div>})}</div>
  </div>
  <div className="opsReportExport"><span><CalendarDays size={18}/>{ar?'تصدير التقرير إلى Excel':'Exporter le rapport Excel'}</span>{exportAction}</div>
 </section>;
}

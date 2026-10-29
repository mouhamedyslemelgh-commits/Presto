'use client';
import {useEffect,useState} from 'react';
import {X,UserRound,Phone,CalendarDays,PackageCheck,Shirt,ClipboardCheck,Edit3,Save,Check,ShieldCheck,Wallet,Hash,StickyNote,ArrowUpRight} from 'lucide-react';
import {useLanguage} from './presto-language';
export type ProfilePayment='bankily'|'masrvi'|'sedad'|'click';
export type ProfileDriver={
 id:number;name:string;phone:string;bag:boolean;shirt:boolean;verified:boolean;
 payments:Record<ProfilePayment,boolean>;
 paymentNumbers?:Partial<Record<ProfilePayment,string>>;
 deliveryDate?:string;observations?:string;
};
const providers:{key:ProfilePayment;name:string;accent:string;logo:string}[]=[
 {key:'bankily',name:'Bankily',accent:'#168f99',logo:'/logos/bankily.webp'},
 {key:'masrvi',name:'Masrvi',accent:'#7950b6',logo:'/logos/masrvi.webp'},
 {key:'sedad',name:'Sedad',accent:'#26976a',logo:'/logos/sedad.webp'},
 {key:'click',name:'CLICK',accent:'#1681ad',logo:'/logos/click.webp'}
];
type Props={driver:ProfileDriver;onSave:(next:ProfileDriver)=>void|Promise<void>;onClose:()=>void;readOnly?:boolean;maskPhone?:boolean};
export default function DriverProfile({driver,onSave,onClose,readOnly=false,maskPhone=false}:Props){
 const {language,t}=useLanguage(),ar=language==='ar';
 const [draft,setDraft]=useState<ProfileDriver>({...driver,payments:{...driver.payments},paymentNumbers:{...driver.paymentNumbers}});
 const [editing,setEditing]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!saving)onClose()};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose,saving]);
 const active=providers.filter(p=>draft.payments[p.key]).length;
 const complete=draft.bag&&draft.shirt&&draft.verified&&active>0;
 const change=(k:keyof ProfileDriver,value:string|boolean)=>setDraft(v=>({...v,[k]:value}));
 const paymentEnabled=(key:ProfilePayment,on:boolean)=>setDraft(v=>({...v,payments:{...v.payments,[key]:on}}));
 const paymentNumber=(key:ProfilePayment,num:string)=>setDraft(v=>({...v,paymentNumbers:{...v.paymentNumbers,[key]:num},payments:{...v.payments,[key]:num.trim()?true:v.payments[key]}}));
 const save=async()=>{
  if(!draft.name.trim()){setError(ar?'يرجى إدخال اسم السائق':'Veuillez saisir le nom du livreur.');return}
  setSaving(true);setError('');
  try{await onSave({...draft,name:draft.name.trim(),phone:draft.phone.slice(0,30),paymentNumbers:Object.fromEntries(providers.map(p=>[p.key,(draft.paymentNumbers?.[p.key]||'').slice(0,80)])) as Partial<Record<ProfilePayment,string>>});setEditing(false)}
  catch(e){setError(e instanceof Error?e.message:ar?'تعذر حفظ البيانات':'Impossible d’enregistrer les données.')}
  finally{setSaving(false)}
 };
 const info=(labelAr:string,labelFr:string,value:string)=> <div className="driverProfileInfo"><span>{ar?labelAr:labelFr}</span><strong>{value||'—'}</strong></div>;
 const features=[
  {key:'bag' as const,icon:PackageCheck,ar:'الحقيبة',fr:'Sac remis'},
  {key:'shirt' as const,icon:Shirt,ar:'القميص',fr:'Chemise remise'},
  {key:'verified' as const,icon:ClipboardCheck,ar:'الملف موثّق',fr:'Dossier vérifié'}
 ];
 return <div className="driverProfileOverlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!saving)onClose()}}>
 <section className="driverProfileDialog" role="dialog" aria-modal="true" aria-labelledby="driver-profile-heading" dir={ar?'rtl':'ltr'}>
  <div className="driverProfileHero">
   <div className="driverProfileHeroGlow"/>
   <div className="driverProfileHeroTop"><span className="driverProfileEyebrow"><UserRound size={14}/>{ar?'ملف السائق الشخصي':'FICHE PERSONNELLE DU LIVREUR'}</span><button className="driverProfileClose" onClick={onClose} aria-label={ar?'إغلاق الملف':'Fermer la fiche'}><X size={20}/></button></div>
   <div className="driverProfileHeroMain"><div className="driverProfileAvatar"><img src="/images/presto-driver.jpeg" alt={ar?'سائق توصيل بريستو':'Livreur Presto'} width={1402} height={1122}/></div><div className="driverProfileHeroText"><div className="driverProfileCode"><Hash size={12}/> PRESTO · {String(draft.id).padStart(4,'0')}</div><h2 id="driver-profile-heading">{draft.name}</h2><span className={'driverProfileState '+(complete?'complete':'pending')}><span className="driverProfileDot"/>{complete?(ar?'الملف مكتمل':'Dossier complet'):(ar?'يحتاج إلى متابعة':'Dossier à compléter')}</span></div></div>
   <div className="driverProfileHeroStats"><span><Wallet size={15}/>{ar?'حسابات نشطة':'Comptes actifs'} <strong>{active} / 4</strong></span><span><ShieldCheck size={15}/>{ar?'المعدات المسلّمة':'Équipements remis'} <strong>{Number(draft.bag)+Number(draft.shirt)} / 2</strong></span></div>
  </div>
  <div className="driverProfileBody">
   <div className="driverProfileToolbar"><div><span className="driverProfileSectionOverline">PRESTO / {ar?'السائقون':'LIVREURS'}</span><h3>{ar?'تفاصيل السائق':'Informations du livreur'}</h3></div>{!readOnly&&<button className={editing?'driverProfileCancel':'driverProfileEdit'} onClick={()=>{setEditing(!editing);setDraft({...driver,payments:{...driver.payments},paymentNumbers:{...driver.paymentNumbers}});setError('')}}><Edit3 size={15}/>{editing?(ar?'إلغاء التعديل':'Annuler'):(ar?'تعديل الملف':'Modifier la fiche')}</button>}</div>
   {editing?<div className="driverProfileFields">
    <label>{ar?'اسم السائق':'Nom du livreur'}<input maxLength={100} value={draft.name} onChange={e=>change('name',e.target.value)}/></label>
    <label>{ar?'رقم الهاتف الأساسي':'Téléphone principal'}<input dir="ltr" maxLength={30} value={draft.phone} onChange={e=>change('phone',e.target.value)}/></label>
    <label>{ar?'تاريخ التسليم':'Date de remise'}<input value={draft.deliveryDate||''} onChange={e=>change('deliveryDate',e.target.value)} placeholder={ar?'يوم/شهر/سنة':'JJ/MM/AAAA'}/></label>
   </div>:<div className="driverProfileInfoGrid">
    {info('رقم الهاتف الأساسي','Téléphone principal',maskPhone&&draft.phone?'•••• ••••':draft.phone)}
    {info('تاريخ التسليم','Date de remise',draft.deliveryDate||'')}
    {info('الرقم التعريفي','Identifiant du livreur','#'+String(draft.id).padStart(4,'0'))}
   </div>}
   <div className="driverProfileSectionTitle"><div className="driverProfileMiniIcon"><PackageCheck size={18}/></div><div><h3>{ar?'المعدات والملف':'Équipements et dossier'}</h3><p>{ar?'حالة تسليم المستلزمات والتحقق من الملف':'Remise du matériel et vérification du dossier'}</p></div></div>
   <div className="driverProfileEquipment">{features.map(item=><div className={'driverProfileEquipmentCard '+(draft[item.key]?'isYes':'isNo')} key={item.key}><item.icon size={22}/><span>{ar?item.ar:item.fr}</span>{editing?<input type="checkbox" aria-label={ar?item.ar:item.fr} checked={draft[item.key]} onChange={e=>change(item.key,e.target.checked)}/>:<strong>{draft[item.key]?(ar?'تم':'Oui'):(ar?'لم يتم':'Non')}</strong>}</div>)}</div>
   <div className="driverProfileSectionTitle"><div className="driverProfileMiniIcon"><Wallet size={18}/></div><div><h3>{ar?'حسابات الدفع الإلكتروني':'Comptes Mobile Money'}</h3><p>{ar?'يمكن أن يكون لكل خدمة رقم حساب مختلف':'Chaque service peut avoir un numéro différent'}</p></div><span className="driverProfileCount">{active} / 4</span></div>
   <div className="driverProfilePayments">{providers.map(p=><article key={p.key} className={'driverProfilePaymentCard '+(draft.payments[p.key]?'enabled':'disabled')} style={{'--pay-color':p.accent} as React.CSSProperties}>
    <div className="driverProfilePayHead"><span className="driverProfilePayLogo"><img alt={p.name} src={p.logo} width={46} height={46}/></span><div><strong>{p.name}</strong><small>{ar?'رقم مستقل لهذه الخدمة':'Numéro indépendant'}</small></div><span className={'driverProfilePayTag '+(draft.payments[p.key]?'on':'off')}>{draft.payments[p.key]?(ar?'نشط':'Actif'):(ar?'غير نشط':'Inactif')}</span></div>
    {editing?<div className="driverProfilePayEdit"><label>{ar?'رقم الحساب / الهاتف':'Numéro de compte / téléphone'}<input dir="ltr" inputMode="tel" maxLength={80} value={draft.paymentNumbers?.[p.key]||''} placeholder={ar?'أدخل رقم الحساب':'Saisir le numéro'} onChange={e=>paymentNumber(p.key,e.target.value)}/></label><label className="driverProfilePayCheck"><input type="checkbox" checked={draft.payments[p.key]} onChange={e=>paymentEnabled(p.key,e.target.checked)}/>{ar?'تفعيل هذا الحساب':'Activer ce compte'}</label></div>:<div className="driverProfilePayValue"><span>{ar?'رقم الحساب':'NUMÉRO DU COMPTE'}</span><strong dir="ltr">{draft.paymentNumbers?.[p.key]|| (draft.payments[p.key]?(ar?'لم يُسجّل الرقم بعد':'Numéro non renseigné'):'—')}</strong></div>}
   </article>)}</div>
   <div className="driverProfileSectionTitle"><div className="driverProfileMiniIcon"><StickyNote size={18}/></div><div><h3>{ar?'الملاحظات':'Observations'}</h3><p>{ar?'معلومات إضافية خاصة بهذا السائق':'Informations complémentaires sur ce livreur'}</p></div></div>
   {editing?<textarea className="driverProfileNotesInput" maxLength={1000} rows={3} value={draft.observations||''} onChange={e=>change('observations',e.target.value)} placeholder={ar?'أضف ملاحظات حول السائق...':'Ajouter des remarques sur le livreur...'}/>:<div className="driverProfileNotes">{draft.observations|| (ar?'لا توجد ملاحظات مسجلة حتى الآن.':'Aucune observation enregistrée pour le moment.')}</div>}
   {error&&<p className="driverProfileError" role="alert">{error}</p>}
  </div>
  <footer className="driverProfileFooter"><span>{ar?'ملف السائق • PRESTO':'Fiche livreur · PRESTO'} <ArrowUpRight size={14}/></span><div><button className="driverProfileDone" onClick={onClose}>{ar?'إغلاق':'Fermer'}</button>{editing&&!readOnly&&<button className="driverProfileSave" onClick={()=>void save()} disabled={saving||!draft.name.trim()}><Save size={16}/>{saving?(ar?'جار الحفظ...':'Enregistrement...'):(ar?'حفظ التغييرات':'Enregistrer les modifications')}</button>}</div></footer>
 </section></div>;
}

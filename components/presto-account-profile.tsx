'use client';

import {useEffect,useState,type FormEvent} from 'react';
import {Mail,Phone,UserRound,X,Save} from 'lucide-react';
import {prestoCloud} from '../lib/presto-cloud';
import {useLanguage} from './presto-language';

type Props={onClose:()=>void};

export default function PrestoAccountProfile({onClose}:Props){
 const {language}=useLanguage();
 const ar=language==='ar';
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [email,setEmail]=useState('');
 const [originalEmail,setOriginalEmail]=useState('');
 const [name,setName]=useState('');
 const [phone,setPhone]=useState('');
 const [notice,setNotice]=useState('');
 const [done,setDone]=useState(false);

 useEffect(()=>{
  let mounted=true;
  void prestoCloud?.auth.getUser().then(({data,error})=>{
   if(!mounted)return;
   if(error||!data.user){setNotice(ar?'لا توجد جلسة صالحة. يرجى تسجيل الدخول مجددًا.':'Session expirée. Veuillez vous reconnecter.');}
   else{
    const user=data.user;
    setEmail(user.email||'');setOriginalEmail(user.email||'');
    setName(typeof user.user_metadata?.full_name==='string'?user.user_metadata.full_name:'');
    setPhone(typeof user.user_metadata?.phone==='string'?user.user_metadata.phone:'');
   }
   setLoading(false);
  }).catch(()=>{if(mounted){setNotice(ar?'تعذر تحميل معلومات الحساب.':'Impossible de charger les informations du compte.');setLoading(false)}});
  return ()=>{mounted=false};
 },[ar]);

 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(!prestoCloud||busy)return;
  setNotice('');setDone(false);
  const cleanEmail=email.trim().toLowerCase();
  const cleanPhone=phone.trim().replace(/\s+/g,'');
  if(!name.trim()){setNotice(ar?'أدخل الاسم.':'Saisissez votre nom.');return;}
  if(!/^\S+@\S+\.\S+$/.test(cleanEmail)){setNotice(ar?'أدخل بريدًا صحيحًا.':'Saisissez une adresse e-mail valide.');return;}
  if(!/^\+?[0-9]{7,15}$/.test(cleanPhone)){setNotice(ar?'أدخل رقم هاتف صحيحًا (7 إلى 15 رقمًا).':'Saisissez un numéro valide (7 à 15 chiffres).');return;}
  setBusy(true);
  try{
   // Profile metadata is user-editable and never used for authorization.
   const update={data:{full_name:name.trim().slice(0,100),phone:cleanPhone}};
   const {error:profileError}=await prestoCloud.auth.updateUser(update);
   if(profileError)throw profileError;
   if(cleanEmail!==originalEmail.toLowerCase()){
    const {error:emailError}=await prestoCloud.auth.updateUser({email:cleanEmail});
    if(emailError)throw emailError;
    setNotice(ar?'حُفظ الاسم والرقم. طلب تغيير البريد قيد المعالجة؛ قد تتطلب الخدمة تأكيد البريد الجديد.':'Nom et téléphone enregistrés. La modification de l’e-mail peut nécessiter une confirmation.');
   }else setNotice(ar?'تم حفظ معلومات الحساب بنجاح.':'Informations du compte enregistrées.');
   setDone(true);
  }catch(error){setNotice(error instanceof Error?error.message:(ar?'تعذر حفظ التغييرات.':'Impossible d’enregistrer.'));}
  finally{setBusy(false);}
 };

 return <div className="presto-auth-password-overlay" dir={ar?'rtl':'ltr'} onMouseDown={e=>{if(e.currentTarget===e.target&&!busy)onClose()}}>
  <form className="presto-auth-password-dialog presto-auth-profile" role="dialog" aria-modal="true" aria-label={ar?'تعديل حسابي':'Modifier mon compte'} onSubmit={submit}>
   <div className="presto-auth-profile-head"><h2>{ar?'تعديل حسابي':'Modifier mon compte'}</h2><button type="button" onClick={onClose} disabled={busy} aria-label={ar?'إغلاق':'Fermer'}><X size={18}/></button></div>
   <p>{ar?'يمكنك تعديل الاسم ورقم الهاتف والبريد المرتبط بحسابك.':'Modifiez le nom, le téléphone et l’adresse e-mail de votre compte.'}</p>
   {loading?<p role="status">{ar?'جار تحميل البيانات...':'Chargement...'}</p>:<>
    <label><span><UserRound size={15}/>{ar?'الاسم الكامل':'Nom complet'}</span><input required maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></label>
    <label><span><Phone size={15}/>{ar?'رقم الهاتف':'Téléphone'}</span><input required dir="ltr" type="tel" inputMode="tel" maxLength={22} autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)}/></label>
    <label><span><Mail size={15}/>{ar?'البريد الإلكتروني':'Adresse e-mail'}</span><input required dir="ltr" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
    {notice&&<p className={done?'presto-auth-profile-success':'presto-auth-password-feedback'} role="status">{notice}</p>}
    <div><button type="button" onClick={onClose} disabled={busy}>{ar?'إغلاق':'Fermer'}</button><button type="submit" disabled={busy}><Save size={15}/>{busy?(ar?'جار الحفظ...':'Enregistrement...'):ar?'حفظ التغييرات':'Enregistrer'}</button></div>
   </>}
  </form>
 </div>;
}

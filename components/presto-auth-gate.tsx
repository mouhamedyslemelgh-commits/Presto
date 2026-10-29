'use client';

import {useEffect,useState,type FormEvent,type ReactNode} from 'react';
import {Eye,EyeOff,Mail,LockKeyhole,UserRound,ArrowRight,ArrowLeft,LogOut,ShieldCheck,Phone} from 'lucide-react';
import {prestoCloud} from '../lib/presto-cloud';
import {useLanguage,LanguageSwitcher} from './presto-language';

type Mode='login'|'signup';
type Stage='checking'|'guest'|'ready';

export default function PrestoAuthGate({children}:{children:ReactNode}){
 const {language}=useLanguage();
 const ar=language==='ar';
 const [stage,setStage]=useState<Stage>('checking');
 const [mode,setMode]=useState<Mode>('login');
 const [email,setEmail]=useState('');
 const [name,setName]=useState('');
 const [phone,setPhone]=useState('');
 const [password,setPassword]=useState('');
 const [visible,setVisible]=useState(false);
 const [pending,setPending]=useState(false);
 const [notice,setNotice]=useState('');
 const [recovering,setRecovering]=useState(false);

 useEffect(()=>{
  const client=prestoCloud;
  if(!client){setStage('guest');return;}
  let mounted=true;
  const {data:{subscription}}=client.auth.onAuthStateChange((event,session)=>{
   if(!mounted)return;
   if(event==='PASSWORD_RECOVERY'){setRecovering(true);setStage('guest');return;}
   if(event==='SIGNED_OUT'){setStage('guest');return;}
   if(session?.user&&event!=='INITIAL_SESSION')setStage('ready');
  });
  void client.auth.getUser().then(({data,error})=>{
   if(mounted)setStage(data.user&&!error?'ready':'guest');
  }).catch(()=>{if(mounted)setStage('guest');});
  return ()=>{mounted=false;subscription.unsubscribe();};
 },[]);

 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(!prestoCloud||pending)return;
  setNotice('');
  if(!/^\S+@\S+\.\S+$/.test(email.trim())){setNotice(ar?'أدخل بريدًا إلكترونيًا صحيحًا.':'Saisissez une adresse e-mail valide.');return;}
  if(password.length<8){setNotice(ar?'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.':'Le mot de passe doit contenir au moins 8 caractères.');return;}
  if(mode==='signup'&&!name.trim()){setNotice(ar?'اكتب اسمك الكامل.':'Saisissez votre nom complet.');return;}
  const cleanPhone=phone.trim().replace(/\s+/g,'');
  if(mode==='signup'&&!/^\+?[0-9]{7,15}$/.test(cleanPhone)){setNotice(ar?'أدخل رقم هاتف صحيحًا بين 7 و15 رقمًا.':'Indiquez un numéro valide (7 à 15 chiffres).');return;}
  setPending(true);
  try{
   if(mode==='login'){
    const {error}=await prestoCloud.auth.signInWithPassword({email:email.trim(),password});
    if(error)throw error;
    setPassword('');
    setStage('ready');
   }else{
    const {data,error}=await prestoCloud.auth.signUp({
     email:email.trim(),password,
     options:{data:{full_name:name.trim().slice(0,100),phone:cleanPhone},emailRedirectTo:window.location.origin}
    });
    if(error)throw error;
    setPassword('');
    if(data.session){setStage('ready');}
    else setNotice(ar?'تم إنشاء الحساب، لكن إعداد Supabase الحالي يتطلب تأكيد البريد قبل الدخول. يجب إيقاف Confirm email من إعدادات المصادقة لتفعيل الدخول المباشر.':'Compte créé, mais Supabase exige encore une confirmation e-mail. Désactivez Confirm email dans les paramètres Auth pour une connexion immédiate.');
   }
  }catch(error){
   setNotice(error instanceof Error?error.message:(ar?'تعذرت العملية. حاول مجددًا.':'Une erreur est survenue.'));
  }finally{setPending(false);}
 };
 const forgot=async()=>{
  if(!prestoCloud||pending)return;
  if(!/^\S+@\S+\.\S+$/.test(email.trim())){setNotice(ar?'أدخل البريد الإلكتروني أولًا.':'Saisissez votre e-mail avant de continuer.');return;}
  setPending(true);setNotice('');
  try{
   const {error}=await prestoCloud.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin});
   if(error)throw error;
   setNotice(ar?'إذا كان البريد مسجّلًا، ستصلك رسالة لإعادة تعيين كلمة المرور.':'Si ce compte existe, un e-mail de réinitialisation vous sera envoyé.');
  }catch(error){setNotice(error instanceof Error?error.message:'Erreur de connexion.');}
  finally{setPending(false);}
 };
 const resetPassword=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(!prestoCloud||pending)return;
  if(password.length<8){setNotice(ar?'استخدم كلمة مرور من 8 أحرف على الأقل.':'Choisissez au moins 8 caractères.');return;}
  setPending(true);setNotice('');
  try{
   const {error}=await prestoCloud.auth.updateUser({password});
   if(error)throw error;
   setPassword('');setRecovering(false);setStage('ready');
  }catch(error){setNotice(error instanceof Error?error.message:'Erreur de réinitialisation.');}
  finally{setPending(false);}
 };
 const signOut=async()=>{
  if(!prestoCloud||pending)return;
  setPending(true);
  const {error}=await prestoCloud.auth.signOut();
  setPending(false);
  if(error){setNotice(error.message);return;}
  setStage('guest');setMode('login');setPassword('');setNotice('');
 };

 if(stage==='ready'&&!recovering)return <>
  {children}
  <button className="presto-auth-signout" type="button" onClick={()=>void signOut()} disabled={pending} title={ar?'تسجيل الخروج':'Se déconnecter'}>
   <LogOut size={16}/><span>{ar?'خروج':'Déconnexion'}</span>
  </button>
 </>;

 return <main className="presto-auth-page" dir={ar?'rtl':'ltr'}>
  <div className="presto-auth-language"><LanguageSwitcher/></div>
  <div className="presto-auth-brand">
   <img src="/logos/presto.webp" width={122} height={66} alt="PRESTO"/>
   <div><strong>PRESTO</strong><small>{ar?'نظام إدارة السائقين':'Gestion des livreurs'}</small></div>
  </div>
  {stage==='checking'?<div className="presto-auth-loading" role="status">{ar?'جار التحقق من الحساب...':'Vérification de votre session...'}</div>:
  <div className="presto-auth-scene">
   <div className={'presto-auth-flip'+(mode==='signup'&&!recovering?' flipped':'')}>
    <section className="presto-auth-face presto-auth-front" inert={mode!=='login'&&!recovering}>
     <div className="presto-auth-inner">
      <div className="presto-auth-heading"><ShieldCheck size={22}/><h1>{recovering?(ar?'كلمة مرور جديدة':'Nouveau mot de passe'):(ar?'تسجيل الدخول':'Connexion')}</h1>
       <p>{recovering?(ar?'اختر كلمة مرور جديدة لحسابك.':'Choisissez votre nouveau mot de passe.'):(ar?'ادخل إلى مساحة عمل PRESTO':'Accédez à votre espace PRESTO')}</p></div>
      <form onSubmit={recovering?resetPassword:submit}>
       {!recovering&&<label className="presto-auth-field"><Mail size={17}/><input type="email" dir="ltr" required autoComplete="email" placeholder={ar?'البريد الإلكتروني':'Adresse e-mail'} value={email} onChange={e=>setEmail(e.target.value)}/></label>}
       <label className="presto-auth-field"><LockKeyhole size={17}/><input dir="ltr" required minLength={8} autoComplete={recovering?'new-password':'current-password'} type={visible?'text':'password'} placeholder={recovering?(ar?'كلمة المرور الجديدة':'Nouveau mot de passe'):(ar?'كود الدخول':'Code d’accès')} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" className="presto-auth-eye" onClick={()=>setVisible(v=>!v)} aria-label={visible?(ar?'إخفاء كلمة المرور':'Masquer le mot de passe'):(ar?'إظهار كلمة المرور':'Afficher le mot de passe')}>{visible?<EyeOff size={17}/>:<Eye size={17}/>}</button></label>
       {!recovering&&<button className="presto-auth-forgot" type="button" onClick={()=>void forgot()} disabled={pending}>{ar?'نسيت كلمة المرور؟':'Mot de passe oublié ?'}</button>}
       <button className="presto-auth-submit" disabled={pending||!prestoCloud} type="submit">{pending?(ar?'جار المعالجة...':'Veuillez patienter...'):recovering?(ar?'حفظ كلمة المرور':'Enregistrer'):ar?'دخول':'Se connecter'}{ar?<ArrowLeft size={16}/>:<ArrowRight size={16}/>}</button>
      </form>
      {!recovering&&<p className="presto-auth-toggle">{ar?'ليس لديك حساب؟':'Vous n’avez pas de compte ?'} <button type="button" onClick={()=>{setMode('signup');setNotice('');setPassword('')}}>{ar?'إنشاء حساب':'Créer un compte'}</button></p>}
     </div>
    </section>
    <section className="presto-auth-face presto-auth-back" inert={mode!=='signup'||recovering}>
     <div className="presto-auth-inner">
      <div className="presto-auth-heading"><UserRound size={22}/><h1>{ar?'إنشاء حساب':'Inscription'}</h1><p>{ar?'اسمك ورقمك وبريدك ورمز دخولك':'Nom, téléphone, e-mail et code d’accès'}</p></div>
      <form onSubmit={submit}>
       <label className="presto-auth-field"><UserRound size={17}/><input required autoComplete="name" maxLength={100} placeholder={ar?'الاسم الكامل':'Nom complet'} value={name} onChange={e=>setName(e.target.value)}/></label>
       <label className="presto-auth-field"><Phone size={17}/><input dir="ltr" required type="tel" inputMode="tel" autoComplete="tel" maxLength={22} placeholder={ar?'رقم الهاتف':'Numéro de téléphone'} value={phone} onChange={e=>setPhone(e.target.value)}/></label>
       <label className="presto-auth-field"><Mail size={17}/><input dir="ltr" required type="email" autoComplete="email" placeholder={ar?'البريد الإلكتروني':'Adresse e-mail'} value={email} onChange={e=>setEmail(e.target.value)}/></label>
       <label className="presto-auth-field"><LockKeyhole size={17}/><input dir="ltr" required minLength={8} autoComplete="new-password" type={visible?'text':'password'} placeholder={ar?'كود الدخول (8 أحرف على الأقل)':'Code d’accès (8 caractères min.)'} value={password} onChange={e=>setPassword(e.target.value)}/><button className="presto-auth-eye" type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?'Hide password':'Show password'}>{visible?<EyeOff size={17}/>:<Eye size={17}/>}</button></label>
       <button className="presto-auth-submit" disabled={pending||!prestoCloud} type="submit">{pending?(ar?'جار الإنشاء...':'Création...'):ar?'إنشاء حساب':'Créer mon compte'}</button>
      </form>
      <p className="presto-auth-toggle">{ar?'لديك حساب بالفعل؟':'Déjà inscrit ?'} <button type="button" onClick={()=>{setMode('login');setNotice('');setPassword('')}}>{ar?'تسجيل الدخول':'Connexion'}</button></p>
     </div>
    </section>
   </div>
  </div>}
  {stage!=='checking'&&<div className="presto-auth-messages" role="status" aria-live="polite">
   {!prestoCloud?(ar?'خدمة إنشاء الحسابات غير مهيّأة بعد. يجب ربط Supabase بالموقع.':'Service de connexion non configuré : renseignez Supabase dans Vercel.'):notice}
  </div>}
  <footer className="presto-auth-footer">© PRESTO · {ar?'وصول فريق العمل':'Accès équipe'}</footer>
 </main>;
}

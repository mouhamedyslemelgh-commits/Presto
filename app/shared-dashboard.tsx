// @ts-nocheck
'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {prestoCloud} from '../lib/presto-cloud';
import {savePrestoExcelSnapshot,downloadSavedPrestoExcel} from '../lib/presto-excel-cloud';
import {EquipmentCardDialog} from '../components/equipment-card';
import DriverProfile from '../components/driver-profile';
import {usePrestoDashboardMotion} from '../components/motion/use-presto-dashboard-motion';
import AnimatedMetric from '../components/motion/animated-metric';
import PrestoSpotlightCard from '../components/ui/presto-spotlight-card';
import DriverRegistrationDialog from '../components/driver-registration-dialog';
import DriverRegisterTable from '../components/driver-register-table';
import InactiveDrivers from '../components/presto-inactive-drivers';
import PrestoTrainingRecords from '../components/presto-training-records';
import PrestoPdfRoster from '../components/presto-pdf-roster';
import {EquipmentPanel,MobileMoneyPanel,OperationsReports} from '../components/presto-operations-panels';
import {useLanguage,LanguageSwitcher} from '../components/presto-language';
import {PrestoAppearanceControl,PrestoAppearanceSettings} from '../components/presto-appearance';
import ExcelImporter from '../components/excel-importer';
import PrestoPdfImporter from '../components/presto-pdf-importer';
import {type PdfRecord} from '../lib/presto-pdf';
import ExcelExportDialog,{type ExcelExportScope} from '../components/excel-export-dialog';
import {downloadPrestoXlsx} from '../lib/presto-excel-export';
import {downloadRegisteredDriversExcel} from '../lib/presto-registered-excel';
import {normalizeHeader,type ImportedDriver,type ImportMode} from '../lib/presto-excel';
import {LayoutDashboard,Users,Package,Wallet,ChartNoAxesColumn,Settings,Bike,GraduationCap,ArrowUpRight,Download,Plus,Search,Edit3,Trash2,Menu,X,Check,ShieldAlert,LogIn,LogOut,RefreshCw} from 'lucide-react';
type Pay='bankily'|'masrvi'|'sedad'|'click';
type Row={id:number;name:string;phone:string;bag:boolean;shirt:boolean;verified:boolean;bankily:boolean;masrvi:boolean;sedad:boolean;click:boolean;bankily_account:string;masrvi_account:string;sedad_account:string;click_account:string;delivery_date:string;observations:string;city:string;vehicle_type:string;app_code:string;driver_photo_path:string;vehicle_photo_path:string;license_plate?:string;presto_reference?:string;pdf_position?:number|null;training_completed?:boolean|null;pdf_source_phone?:string;pdf_source_date?:string|null};
const profileData=(d:Row)=>({id:d.id,name:d.name,phone:d.phone,bag:d.bag,shirt:d.shirt,verified:d.verified,payments:{bankily:d.bankily,masrvi:d.masrvi,sedad:d.sedad,click:d.click},paymentNumbers:{bankily:d.bankily_account,masrvi:d.masrvi_account,sedad:d.sedad_account,click:d.click_account},deliveryDate:d.delivery_date,observations:d.observations,city:d.city,vehicleType:d.vehicle_type,appCode:d.app_code,driverPhotoPath:d.driver_photo_path,vehiclePhotoPath:d.vehicle_photo_path,trainingCompleted:d.training_completed,trainingDate:(d as Row&{latest_training_date?:string}).latest_training_date,trainer:(d as Row&{latest_trainer?:string}).latest_trainer});
type View='dashboard'|'drivers'|'registration'|'training'|'equipment'|'mobile'|'reports'|'settings'|'inactive'|'untrained';
type TrainingEntry={id:number;name:string;phone:string;training_status:'completed'|'in_progress'|'needs_review'|'not_trained';training_date:string|null;trainer:string};
type TrainingPrefill={id:number;name:string;phone:string;city:string};
const phoneDigits=(value:string)=>String(value||'').replace(/\D/g,'');
const pays:[Pay,string,string,string][]=[['bankily','Bankily','BPM','#228e99'],['masrvi','Masrvi','BMCI','#6949a7'],['sedad','Sedad','BMI','#22966a'],['click','CLICK','BNM','#2480a9']];
const menus:[View,string,typeof Users][]=[['dashboard',"Vue d’ensemble",LayoutDashboard],['drivers','Registre des remises',Users],['registration','Livreurs et véhicules',Bike],['untrained','لم يقوموا بالتكوين',GraduationCap],['inactive','سائقون لديهم حقيبة ولا يعملون',Users],['training','Formations à l’application',GraduationCap],['equipment','Équipements',Package],['mobile','Mobile Money',Wallet],['reports','Rapports',ChartNoAxesColumn],['settings','Paramètres',Settings]];
const emptyRow=():Row=>({id:0,name:'',phone:'',bag:false,shirt:false,verified:false,bankily:false,masrvi:false,sedad:false,click:false,bankily_account:'',masrvi_account:'',sedad_account:'',click_account:'',delivery_date:'',observations:'',city:'',vehicle_type:'',app_code:'',driver_photo_path:'',vehicle_photo_path:''});
const hasPay=(d:Row)=>d.bankily||d.masrvi||d.sedad||d.click;
const complete=(d:Row)=>d.bag&&d.shirt&&d.verified&&hasPay(d);
const mask=(e:unknown)=>String(e??'').replaceAll('"','""');
function downloadCSV(data:Row[]){
 const cols=['N°','Date de remise','Livreur','Téléphone','Sac','Chemise','Dossier','Bankily','Masrvi','Sedad','Click','Statut','Observations'];
 const body=data.map(d=>[d.id,d.delivery_date,d.name,d.phone,d.bag?'Oui':'Non',d.shirt?'Oui':'Non',d.verified?'Oui':'Non',...pays.map(([p])=>d[(p+'_account') as 'bankily_account'|'masrvi_account'|'sedad_account'|'click_account']||(d[p]?'Oui':'Non')),complete(d)?'Complet':'À relancer',d.observations]);
 const text='\uFEFF'+[cols,...body].map(row=>row.map(value=>'"'+mask(value)+'"').join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='PRESTO-livreurs.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function SharedDashboard(){
 const {t,language}=useLanguage();
 const [photoUrls,setPhotoUrls]=useState<Record<string,string>>({});
 const [rows,setRows]=useState<Row[]>([]),[view,setView]=useState<View>('dashboard'),[openMenu,setOpenMenu]=useState(false);
 const [cardId,setCardId]=useState<number|null>(null);
 const cardRow=rows.find(d=>d.id===cardId);
 const [selectedId,setSelectedId]=useState<number|null>(null);
 const [loading,setLoading]=useState(true),[msg,setMsg]=useState(''),[syncError,setSyncError]=useState(''),[search,setSearch]=useState(''),[editing,setEditing]=useState<Row|null>(null);
 const [dialogMode,setDialogMode]=useState<'registration'|'legacy'>('registration');
 const motionRoot=usePrestoDashboardMotion(view,loading);
 const [userId,setUserId]=useState<string|null>(null),[admin,setAdmin]=useState(true);
 const [excelStatus,setExcelStatus]=useState<'idle'|'ready'|'saving'|'saved'|'error'>('idle');
 const [excelSavedAt,setExcelSavedAt]=useState<string|null>(null);
 const [exporting,setExporting]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[company,setCompany]=useState('PRESTO'),[city,setCity]=useState('Nouakchott · MR');
 const [claimCode,setClaimCode]=useState(''),[claiming,setClaiming]=useState(false);
 const [legacyCount,setLegacyCount]=useState(0),[legacyUploading,setLegacyUploading]=useState(false);
 const [showManualTraining,setShowManualTraining]=useState(true);
 const [trainingOpenRequest,setTrainingOpenRequest]=useState(0);
 const [trainingPrefill,setTrainingPrefill]=useState<TrainingPrefill|null>(null);
 const [trainingRecords,setTrainingRecords]=useState<TrainingEntry[]>([]);
 const trainingSequence=useRef(0);
 useEffect(()=>{
  const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpenMenu(false)};
  window.addEventListener('keydown',onKeyDown);
  return ()=>window.removeEventListener('keydown',onKeyDown);
 },[]);
 const refreshTraining=useCallback(async()=>{
  if(!prestoCloud||!userId){setTrainingRecords([]);return;}
  const request=++trainingSequence.current;
  const {data,error}=await prestoCloud.from('presto_training_records')
   .select('id,name,phone,training_date,training_status,trainer')
   .order('training_date',{ascending:false}).order('id',{ascending:false}).limit(2000);
  if(!error&&request===trainingSequence.current)setTrainingRecords((data??[]) as TrainingEntry[]);
 },[userId]);
 useEffect(()=>{
  void refreshTraining();
  const poll=setInterval(()=>{if(document.visibilityState==='visible')void refreshTraining();},20000);
  return ()=>{clearInterval(poll);trainingSequence.current++;};
 },[refreshTraining]);
 const latestTraining=useMemo(()=>{
  const byPhone=new Map<string,TrainingEntry>();
  for(const record of trainingRecords){
   const number=phoneDigits(record.phone);
   if(number.length>=7&&!byPhone.has(number))byPhone.set(number,record);
  }
  return byPhone;
 },[trainingRecords]);
 const rosterRows=useMemo(()=>rows.map(driver=>{
  const numbers=[driver.phone,driver.pdf_source_phone||''].map(phoneDigits).filter(number=>number.length>=7);
  const training=numbers.map(number=>latestTraining.get(number)).find(Boolean);
  if(!training)return driver;
  return {...driver,training_completed:training.training_status==='completed',
   latest_training_date:training.training_date,latest_trainer:training.trainer};
 }),[rows,latestTraining]);
 const openTraining=(person?:{id:number;name:string;phone:string;city?:string})=>{
  setTrainingPrefill(person?{id:person.id,name:person.name,phone:person.phone,city:person.city||''}:null);
  setShowManualTraining(true);
  setTrainingOpenRequest(number=>number+1);
 };
 const loadSequence=useRef(0);
 const load=useCallback(async()=>{
  if(!prestoCloud){setLoading(false);return;}
  const requestId=++loadSequence.current;
  try{
   const all:Row[]=[];
   for(let i=0;i<10000;i+=1000){
    const {data,error}=await prestoCloud.from('presto_drivers')
     .select('id,name,phone,bag,shirt,verified,bankily,masrvi,sedad,click,bankily_account,masrvi_account,sedad_account,click_account,delivery_date,observations,city,vehicle_type,app_code,driver_photo_path,vehicle_photo_path,license_plate,presto_reference,pdf_position,training_completed,pdf_source_phone,pdf_source_date')
     .order('id',{ascending:true}).range(i,i+999);
    if(error)throw Error(error.message);
    const chunk=(data??[]) as Row[];
    all.push(...chunk);
    if(chunk.length<1000)break;
   }
   // A slower, older response must never overwrite more recent shared records.
   if(requestId!==loadSequence.current)return;
   setRows(previous=>previous.length===all.length&&previous.every((row,i)=>JSON.stringify(row)===JSON.stringify(all[i]))?previous:all);
   setSyncError('');
   setLoading(false);
  }catch(error){
   if(requestId!==loadSequence.current)return;
   setLoading(false);
   setSyncError((language==='ar'?'تعذر تحديث السجلات. ستتم إعادة المحاولة تلقائيًا: ':'Synchronisation indisponible. Nouvelle tentative automatique : ')+(error instanceof Error?error.message:'Erreur réseau'));
  }
 },[language]);
 useEffect(()=>{
  if(!prestoCloud)return;
  let active=true;
  const refresh=()=>{
   if(!navigator.onLine){
    setLoading(false);
    setSyncError(language==='ar'?'لا يوجد اتصال بالإنترنت. ستُحدَّث البيانات عند عودة الاتصال.':'Vous êtes hors ligne. Les données seront actualisées à la reconnexion.');
    return;
   }
   if(document.visibilityState==='visible')void load();
  };
  refresh();
  window.addEventListener('online',refresh);
  document.addEventListener('visibilitychange',refresh);
  try{
   const raw=localStorage.getItem('presto-ops-live-v1');
   const data=raw?JSON.parse(raw):[];
   if(Array.isArray(data))setLegacyCount(data.filter(x=>x&&typeof x.name==='string'&&x.name.trim()).length);
  }catch{}
  void prestoCloud.from('presto_profile').select('company,city').eq('id',1).maybeSingle().then(({data})=>{if(active&&data){setCompany(data.company);setCity(data.city)}});
  void prestoCloud.auth.getSession().then(({data})=>{if(active)setUserId(data.session?.user.id??null)});
  const {data:listener}=prestoCloud.auth.onAuthStateChange((_event,session)=>{if(active)setUserId(session?.user.id??null)});
  const interval=setInterval(refresh,5000);
  return ()=>{active=false;loadSequence.current++;clearInterval(interval);window.removeEventListener('online',refresh);document.removeEventListener('visibilitychange',refresh);listener.subscription.unsubscribe()};
 },[load,language]);
 useEffect(()=>{
  if(!prestoCloud)return;
  let active=true;
  const paths=[...new Set(rows.flatMap(d=>[d.driver_photo_path,d.vehicle_photo_path]).filter(Boolean))].filter(path=>!photoUrls[path]);
  if(paths.length)void Promise.all(paths.map(async path=>{
   const {data,error}=await prestoCloud.storage.from('presto-driver-photos').createSignedUrl(path,86400);
   return {path,url:error?'':(data?.signedUrl||'')};
  })).then(result=>{
   if(active)setPhotoUrls(previous=>({...previous,...Object.fromEntries(result.filter(r=>r.url).map(r=>[r.path,r.url]))}));
  });
  return ()=>{active=false};
 },[rows,photoUrls]);
 const uploadDriverPhoto=async(file:File,kind:'drivers'|'vehicles')=>{
  if(!prestoCloud)throw Error('Connexion à la base indisponible.');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Photo non valide (5 Mo maximum).');
  const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
  const path=kind+'/'+crypto.randomUUID()+'.'+ext;
  const {error}=await prestoCloud.storage.from('presto-driver-photos').upload(path,file,{contentType:file.type,upsert:false});
  if(error)throw Error('Erreur lors de l’envoi de la photo : '+error.message);
  return path;
 };
 const mirrorExcel=async()=>{
  setExcelStatus('saving');
  try{
   const currentSession=await prestoCloud.auth.getSession();
   const bearer=currentSession.data.session?.access_token;
   if(!bearer)throw Error('A valid login is required to sync Google Sheets.');
   const response=await fetch('/api/google-sheets/sync',{method:'POST',headers:{Authorization:'Bearer '+bearer}});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||'Google Sheets synchronization unavailable');
   if(result.connected&&result.ok){setExcelSavedAt(new Date().toISOString());setExcelStatus('saved');return 'saved' as const;}
   else {setExcelStatus('idle');return 'not_connected' as const;}
  }catch(error){
   setExcelStatus('error');
   setMsg((language==='ar'?'تم حفظ البيانات في PRESTO، لكن Google Sheets لم يتحدث: ':'PRESTO enregistré, mais Google Sheets non actualisé : ')+(error instanceof Error?error.message:'Erreur'));
  }
  return 'error' as const;
 };
 const downloadCloudExcel=async()=>{
  try{await downloadSavedPrestoExcel();}
  catch(error){setMsg(error instanceof Error?error.message:'Impossible de télécharger Excel.')}
 };
 useEffect(()=>{void fetch('/api/google-sheets/sync').then(x=>x.json()).then(x=>setExcelStatus(x.connected?'ready':'idle')).catch(()=>setExcelStatus('idle'));},[]);
 const mutate=async(job:()=>PromiseLike<{error:{message:string}|null}>)=>{
  if(!admin){setMsg('Connexion administrateur obligatoire pour modifier les données.');return;}
  try{const {error}=await job();if(error){setMsg(t('Échec de sauvegarde : ')+error.message);return;}await load();await mirrorExcel();}catch(e){setMsg(t('Impossible de contacter la base partagée.'))}
 };
 const save=async(photos:{person?:File;vehicle?:File}={})=>{
  if(!editing||!admin||!prestoCloud)throw Error('Connexion requise.');
  if(!editing.name.trim()||(dialogMode!=='legacy'&&(!editing.phone.trim()||!editing.city.trim()||!editing.vehicle_type.trim()||!editing.app_code.trim())))throw Error(language==='ar'?'أكمل البيانات المطلوبة في هذا القسم.':'Complétez les informations obligatoires pour cette section.');
  const {id,...rest}=editing;
  const data={...rest,name:rest.name.trim(),phone:rest.phone.trim(),city:rest.city.trim(),app_code:rest.app_code.trim()};
  if(photos.person)data.driver_photo_path=await uploadDriverPhoto(photos.person,'drivers');
  if(photos.vehicle)data.vehicle_photo_path=await uploadDriverPhoto(photos.vehicle,'vehicles');
  const response=id?await prestoCloud.from('presto_drivers').update(data).eq('id',id):await prestoCloud.from('presto_drivers').insert(data);
  if(response.error)throw Error(response.error.message);
  setEditing(null);
  await load();
  void mirrorExcel();
 };
 const importDrivers=async(items:ImportedDriver[],mode:ImportMode)=>{
  if(!prestoCloud||!admin)throw Error('Connexion administrateur obligatoire.');
  let added=0,updated=0,skipped=0;
  const known=[...rows];const additions:Record<string,unknown>[]=[];
  const phoneKey=(x:string)=>x.replace(/\D/g,'');
  const mapped=(x:ImportedDriver)=>({
   name:x.name,phone:x.phone,bag:x.bag,shirt:x.shirt,verified:x.verified,
   bankily:x.payments.bankily,masrvi:x.payments.masrvi,sedad:x.payments.sedad,click:x.payments.click,
   bankily_account:x.accounts.bankily||'',masrvi_account:x.accounts.masrvi||'',
   sedad_account:x.accounts.sedad||'',click_account:x.accounts.click||'',
   delivery_date:x.deliveryDate,observations:x.observations
  });
  try{
   for(const item of items){
    const exists=known.find(r=>((item.phone&&phoneKey(item.phone)&&phoneKey(item.phone)===phoneKey(r.phone))||(!item.phone&&normalizeHeader(item.name)===normalizeHeader(r.name))));
    if(exists){
     if(mode==='add'){skipped++;continue;}
     const {error}=await prestoCloud.from('presto_drivers').update(mapped(item)).eq('id',exists.id);
     if(error)throw Error(error.message);
     updated++;
    }else{
     additions.push(mapped(item));
     known.push({...emptyRow(),...mapped(item),id:-(additions.length)} as Row);
    }
   }
   for(let i=0;i<additions.length;i+=100){
    const batch=additions.slice(i,i+100);
    const {error}=await prestoCloud.from('presto_drivers').insert(batch);
    if(error)throw Error(error.message);
    added+=batch.length;
   }
   await load();
   const googleSheets=await mirrorExcel();
   return {added,updated,skipped,googleSheets};
  }catch(e){
   await load();
   throw Error('Importation partielle possible. Vérifiez le registre avant de réessayer. '+(e instanceof Error?e.message:''));
  }
 };
 const importPdf=async(records:PdfRecord[],mode:'add'|'merge')=>{
  if(!prestoCloud||!admin)throw Error(language==='ar'?'صلاحية الإدارة مطلوبة لحفظ البيانات.':'Droits administrateur requis.');
  const {data:auth}=await prestoCloud.auth.getUser();
  if(!auth.user)throw Error(language==='ar'?'سجّل الدخول أولاً لحفظ البيانات.':'Connectez-vous avant d’enregistrer.');
  let added=0,updated=0,skipped=0;
  const normalizePhone=(phone:string)=>phone.replace(/\D/g,'');
  const knownDrivers=[...rows];
  const trainingResponse=await prestoCloud.from('presto_training_records').select('id,name,phone,training_date,app_type').limit(2000);
  const hasTraining=records.some(r=>r.destination==='training');
  if(hasTraining&&trainingResponse.error)throw Error(trainingResponse.error.message);
  const knownTraining=[...(trainingResponse.data||[])];
  try{
   for(const record of records){
    const name=record.name.trim().slice(0,100);
    const phone=record.phone.trim().slice(0,30);
    if(!name){skipped++;continue;}
    if(record.destination==='training'){
     if(!phone||!record.training_date||!(/^\d{4}-\d{2}-\d{2}$/.test(record.training_date))){
      skipped++;continue;
     }
     const payload:Record<string,unknown>={name,phone,training_date:record.training_date};
     for(const key of ['city','trainer','training_location','training_status','app_type'] as const)
      if(record[key]!==undefined&&record[key]!=='')payload[key]=record[key];
     if(record.observations)payload.notes=record.observations.slice(0,1200);
     const existing=knownTraining.find(x=>x.training_date===record.training_date&&
      normalizePhone(x.phone)===normalizePhone(phone)&&x.app_type===(record.app_type||'driver'));
     if(existing){
      if(mode==='add'){skipped++;continue;}
      const {error}=await prestoCloud.from('presto_training_records').update(payload).eq('id',existing.id);
      if(error)throw Error(error.message);
      updated++;
     }else{
      const {data,error}=await prestoCloud.from('presto_training_records').insert(payload).select('id').single();
      if(error)throw Error(error.message);
      knownTraining.push({id:data.id,name,phone,training_date:record.training_date,app_type:record.app_type||'driver'});
      added++;
     }
     const matchingDrivers=knownDrivers.filter(d=>[d.phone,d.pdf_source_phone||''].some(value=>
      normalizePhone(value).length>=7&&normalizePhone(value)===normalizePhone(phone)));
     if(matchingDrivers.length===1){
      const {error}=await prestoCloud.from('presto_drivers').update({
       training_completed:(record.training_status||'completed')==='completed'
      }).eq('id',matchingDrivers[0].id);
      if(error)throw Error(error.message);
     }
     continue;
    }
    const payload:Record<string,unknown>={name};
    if(phone)payload.phone=phone;
    for(const key of ['city','vehicle_type','app_code','delivery_date','observations',
     'bag','shirt','verified','bankily','masrvi','sedad','click',
     'bankily_account','masrvi_account','sedad_account','click_account'] as const){
     const val=record[key];
     if(val!==undefined&&val!=='')payload[key]=val;
    }
    const existing=knownDrivers.find(x=>{
     const matchPhone=Boolean(phone&&normalizePhone(phone)&&normalizePhone(x.phone)===normalizePhone(phone));
     return matchPhone||(!phone&&normalizeHeader(x.name)===normalizeHeader(name));
    });
    if(existing){
     if(mode==='add'){skipped++;continue;}
     const {error}=await prestoCloud.from('presto_drivers').update(payload).eq('id',existing.id);
     if(error)throw Error(error.message);
     updated++;
    }else{
     const {data,error}=await prestoCloud.from('presto_drivers').insert({phone:'',...payload}).select('id').single();
     if(error)throw Error(error.message);
     knownDrivers.push({...emptyRow(),...payload,phone,id:data.id} as Row);
     added++;
    }
   }
   await load();
   await refreshTraining();
   const sheets=await mirrorExcel();
   return {added,updated,skipped,googleSheets:sheets};
  }catch(error){
   await load();
   throw Error((language==='ar'?'قد يكون الحفظ جزئيًا. راجع السجلات قبل إعادة المحاولة. ':'Enregistrement partiel possible. Vérifiez les fiches avant de réessayer. ')+(error instanceof Error?error.message:''));
  }
 };
 const del=async(id:number)=>{
  if(!prestoCloud||!admin||!window.confirm(t('Supprimer définitivement ce livreur pour tous les visiteurs ?')))return;
  await mutate(()=>prestoCloud.from('presto_drivers').delete().eq('id',id));
 };
 const setFlag=async(id:number,key:'bag'|'shirt'|'verified'|Pay,value:boolean)=>{
  if(!prestoCloud)return;
  await mutate(()=>prestoCloud.from('presto_drivers').update({[key]:value}).eq('id',id));
 };
 const login=async()=>{
  if(!prestoCloud)return;
  const {error}=await prestoCloud.auth.signInWithPassword({email:email.trim(),password});
  setPassword('');
  setMsg(error?'Connexion refusée : '+error.message:'Compte connecté. Les droits sont en cours de vérification.');
 };
 const signup=async()=>{
  if(!prestoCloud)return;
  if(!email.trim()||password.length<10){setMsg(language==='ar'?'أدخل بريدًا صحيحًا وكلمة مرور من 10 أحرف على الأقل.':'Veuillez saisir un e-mail et un mot de passe de 10 caractères minimum.');return;}
  const {error,data}=await prestoCloud.auth.signUp({email:email.trim(),password});
  setPassword('');
  setMsg(error?'Création de compte impossible : '+error.message:
   (language==='ar'?'تم طلب إنشاء الحساب. تحقق من بريدك الإلكتروني للتأكيد، ثم يلزم منح حسابك صلاحية إدارة PRESTO.':
    'Compte demandé. Confirmez votre e-mail si nécessaire puis faites autoriser votre compte par le responsable PRESTO.'));
 };
 const logout=async()=>{if(!prestoCloud)return;await prestoCloud.auth.signOut();setAdmin(false);setUserId(null);setMsg('Déconnecté.')};
 const claimOwner=async()=>{
  if(!prestoCloud||!userId)return;
  if(!claimCode.trim()){setMsg(language==='ar'?'أدخل رمز التفعيل الخاص بالمسؤول.':'Saisissez le code de configuration de PRESTO.');return;}
  setClaiming(true);
  try{
   const {data,error}=await prestoCloud.rpc('presto_claim_owner',{setup_code:claimCode.trim()});
   if(error)throw Error(error.message);
   if(data===true){setAdmin(true);setMsg(language==='ar'?'تم تفعيل حسابك بصفة مسؤول PRESTO. يمكنك الآن حفظ البيانات المشتركة.':'Compte administrateur PRESTO activé. Vous pouvez maintenant gérer les données partagées.');}
   setClaimCode('');
  }catch(e){setMsg((language==='ar'?'تعذر تفعيل حساب المسؤول: ':'Impossible d’activer le compte administrateur : ')+(e instanceof Error?e.message:'Erreur'))}
  finally{setClaiming(false);}
 };
 const importLegacy=async()=>{
  if(!prestoCloud||!admin)return;
  let data:any[]=[];
  try{
   const raw=localStorage.getItem('presto-ops-live-v1');
   const list=raw?JSON.parse(raw):[];
   data=Array.isArray(list)?list.filter(x=>x&&typeof x.name==='string'&&x.name.trim().length>0).slice(0,10000):[];
  }catch{setMsg('Impossible de lire les anciens fichiers de ce navigateur.');return;}
  if(!data.length){setMsg(language==='ar'?'لا توجد سجلات قديمة في هذا الجهاز.':'Aucun ancien livreur stocké dans ce navigateur.');return;}
  const confirmed=window.confirm(language==='ar'?'هل تريد نقل سجلات هذا المتصفح إلى قاعدة PRESTO المشتركة؟ سيتمكن كل من لديه رابط الموقع من الاطلاع على هذه البيانات، بما فيها أرقام الهواتف والحسابات.':'Importer les anciens livreurs de cet appareil dans la base PRESTO partagée ? Leurs noms, numéros de téléphone et comptes seront visibles par les visiteurs du site.');
  if(!confirmed)return;
  setLegacyUploading(true);
  const normalized=(v:unknown)=>String(v??'').replace(/\D/g,'');
  try{
   let known=[...rows];
   let added=0,skipped=0;
   for(let start=0;start<data.length;start+=100){
    const batch=[] as Record<string,unknown>[];
    for(const d of data.slice(start,start+100)){
     const phone=String(d.phone??'').slice(0,30),name=String(d.name??'').trim().slice(0,100);
     const key=normalized(phone);
     if(!name)continue;
     const duplicate=known.some(x=>(key&&normalized(x.phone)===key)||(!key&&x.name.trim().toLowerCase()===name.toLowerCase()));
     if(duplicate){skipped++;continue;}
     const payments=d.payments&&typeof d.payments==='object'?d.payments:{};
     const nums=d.paymentNumbers&&typeof d.paymentNumbers==='object'?d.paymentNumbers:{};
     const row={
      name,phone,bag:Boolean(d.bag),shirt:Boolean(d.shirt),verified:Boolean(d.verified),
      bankily:Boolean(payments.bankily),masrvi:Boolean(payments.masrvi),sedad:Boolean(payments.sedad),click:Boolean(payments.click),
      bankily_account:String(nums.bankily??'').slice(0,80),masrvi_account:String(nums.masrvi??'').slice(0,80),
      sedad_account:String(nums.sedad??'').slice(0,80),click_account:String(nums.click??'').slice(0,80),
      delivery_date:String(d.deliveryDate??'').slice(0,30),observations:String(d.observations??'').slice(0,1000)
     };
     batch.push(row);
     known.push({...emptyRow(),...row,id:-(added+batch.length)} as Row);
    }
    if(batch.length){
     const {error}=await prestoCloud.from('presto_drivers').insert(batch);
     if(error)throw Error(error.message);
     added+=batch.length;
    }
   }
   await load();await mirrorExcel();
   setMsg((language==='ar'?'اكتمل نقل البيانات القديمة. أُضيف: ':'Anciennes données importées. Ajoutés : ')+added+(language==='ar'?'، تم تجاوز المكرر: ':' · doublons ignorés : ')+skipped);
   setLegacyCount(0);
  }catch(e){await load();setMsg((language==='ar'?'قد يكون النقل جزئيًا. راجع السجلات قبل المحاولة مجددًا: ':'Importation possiblement partielle. Vérifiez la liste avant de réessayer : ')+(e instanceof Error?e.message:''));}
  finally{setLegacyUploading(false);}
 };
 
 const exportXlsx=async(ids:number[]|null,scope:ExcelExportScope,suffix:string)=>{
  if(exporting)return;
  setExporting(true);
  try{
   const m=new Map(rows.map(d=>[d.id,d]));
   const chosen=ids===null?[...rows].sort((a,b)=>a.id-b.id):ids.map(id=>m.get(id)).filter((x):x is Row=>Boolean(x));
   if(ids!==null&&!chosen.length)throw Error(language==='ar'?'لم يُعثر على سائق مطابق':'Aucun livreur sélectionné.');
   await downloadPrestoXlsx(chosen.map(d=>({
    id:d.id,name:d.name,phone:d.phone,bag:d.bag,shirt:d.shirt,verified:d.verified,
    payments:{bankily:d.bankily,masrvi:d.masrvi,sedad:d.sedad,click:d.click},
    paymentNumbers:{bankily:d.bankily_account,masrvi:d.masrvi_account,sedad:d.sedad_account,click:d.click_account},
    deliveryDate:d.delivery_date,observations:d.observations
   })),company,{scope,suffix});
  }finally{setExporting(false);}
 };
 const exportRegistered=async(ids:number[]|null,scope:ExcelExportScope,suffix:string)=>{
  if(exporting)return;
  setExporting(true);
  try{
   const available=registrationRows;
   const byId=new Map(available.map(d=>[d.id,d]));
   const selected=ids===null?available:ids.map(id=>byId.get(id)).filter((d):d is Row=>Boolean(d));
   if(!selected.length)throw Error(language==='ar'?'لا توجد سجلات مطابقة للتنزيل.':'Aucun enregistrement à exporter.');
   await downloadRegisteredDriversExcel(selected,company,suffix);
  }finally{setExporting(false);}
 };
 const saveProfile=async()=>{
  if(!prestoCloud||!admin||!company.trim()||!city.trim())return;
  await mutate(()=>prestoCloud.from('presto_profile').update({company:company.trim(),city:city.trim()}).eq('id',1));
 };
 const totals={all:rows.length,bags:rows.filter(x=>x.bag).length,shirts:rows.filter(x=>x.shirt).length,complete:rows.filter(complete).length,missing:rows.filter(x=>!hasPay(x)).length};
 const count=(key:Pay)=>rows.filter(x=>x[key]).length;
 const pct=(v:number)=>totals.all?Math.round(v/totals.all*1000)/10:0;
 // Shared positions follow the original PDF order, then new registrations.
 // Never expose sparse Supabase identity IDs as user-facing row numbers.
 const orderedRows=[...rows].sort((a,b)=>{
  if(a.pdf_position!=null&&b.pdf_position!=null)return a.pdf_position-b.pdf_position;
  if(a.pdf_position!=null)return -1;
  if(b.pdf_position!=null)return 1;
  return a.id-b.id;
 });
 const positions=new Map<number,number>(orderedRows.map((d,i)=>[d.id,i+1]));
 const filtered=orderedRows.filter(d=>[d.name,d.phone,d.city,d.vehicle_type,d.app_code,positions.get(d.id)].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
 const registrationRows=orderedRows.filter(d=>Boolean(d.city?.trim()||d.vehicle_type?.trim()||d.app_code?.trim()||d.driver_photo_path||d.vehicle_photo_path));
 const registrationPositions=new Map<number,number>(registrationRows.map((d,i)=>[d.id,i+1]));
 const registeredFiltered=registrationRows.filter(d=>[d.name,d.phone,d.city,d.vehicle_type,d.app_code,registrationPositions.get(d.id)].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
 const go=(v:View)=>{setView(v);setOpenMenu(false);setSearch('');window.scrollTo(0,0)};
 const openEditor=(d:Row|null,mode:'registration'|'legacy')=>{setDialogMode(mode);setEditing(d?{...d}:emptyRow())};
 const table=(items:Row[],preview=false,mode:'equipment'|'registration'='equipment')=> <DriverRegisterTable photoUrls={photoUrls} items={items} ranks={mode==='registration'?registrationPositions:positions} language={language} preview={preview} mode={mode} editable={admin} onOpen={setSelectedId} onCard={setCardId} onEdit={d=>openEditor(d,mode==='registration'?'registration':'legacy')} onDelete={id=>void del(id)}/>;
 const titles:Record<View,string>={untrained:'لم يقوموا بالتكوين',inactive:'سائقون لديهم حقيبة ولا يعملون',dashboard:'Pilotage des livreurs',drivers:'Registre des remises',registration:'Livreurs et véhicules',training:'Formations à l’application',equipment:'Suivi des équipements',mobile:'Comptes Mobile Money',reports:'Rapports & analyses',settings:'Paramètres'};
 return <div ref={motionRoot} className="shell" dir={language==='ar'?'rtl':'ltr'}>
  <aside className={'sidebar '+(openMenu?'open':'')}><div className="brand"><div className="brandImageFrame"><img src="/logos/presto.webp" alt="PRESTO بريستو" width={310} height={170}/></div><span className="brandSub">{t("OPERATIONS · LIVREURS")}</span></div><div className="sideCaption">{t("ESPACE DE TRAVAIL")}</div><nav id="presto-primary-navigation" aria-label={language==='ar'?'القائمة الرئيسية':'Navigation principale'}>{menus.map(([v,title,Icon])=><button type="button" key={v} aria-current={view===v?'page':undefined} className={view===v?'selected':''} onClick={()=>go(v)}><Icon size={17}/>{t(title)}</button>)}</nav><div className="sideFoot"><small>{t("BASE PARTAGÉE")}</small><strong>{city}</strong><small>{company} · {t('Cloud Sync')}</small></div></aside>
  {openMenu&&<div className="shade" onClick={()=>setOpenMenu(false)}/>}
  <div className="workspace"><header className="topbar"><button type="button" className="menuButton" aria-controls="presto-primary-navigation" aria-expanded={openMenu} onClick={()=>setOpenMenu(x=>!x)} aria-label={t("Ouvrir la navigation")}>{openMenu?<X size={20}/>:<Menu size={20}/>}</button><img className="mobileBrandLogo" src="/logos/presto.webp" alt="PRESTO" width={80} height={48}/><div>{t("Opérations /")} <b>{t(titles[view])}</b></div><div className="topRight"><LanguageSwitcher/><PrestoAppearanceControl/><span className="date">{t("Données partagées")}</span><span className="avatar">{t("OP")}</span></div></header>
  <main><div className="pageHead"><div><h1>{t(titles[view])}</h1><p>{t('Informations synchronisées entre tous les visiteurs')} · {t(loading?'Chargement...':'Actualisées automatiquement')}</p></div><div className="headActions">{view!=='registration'&&view!=='training'&&<>
    <button type="button" className="excelQuickDownload" disabled={exporting||loading||rows.length===0} onClick={()=>{void exportXlsx(null,'all','').catch(error=>setMsg((language==='ar'?'تعذر تنزيل ملف Excel: ':'Téléchargement Excel impossible : ')+(error instanceof Error?error.message:'Erreur')));}} aria-label={language==='ar'?'تنزيل جميع سجلات السائقين بصيغة Excel':'Télécharger tous les livreurs en Excel'}><Download size={18}/>{exporting?(language==='ar'?'جار التنزيل...':'Téléchargement...'):(language==='ar'?'تنزيل Excel كامل':'Télécharger Excel')}</button>
    <ExcelImporter onImport={importDrivers} publicSite/>
    <PrestoPdfImporter onImport={importPdf} disabled={!admin||loading}/>
   </>}{(view==='registration'||view==='training')&&<PrestoPdfImporter onImport={importPdf} disabled={!admin||loading}/>}{view==='training'&&admin&&<button className="primary" type="button" onClick={()=>openTraining()}><Plus size={17}/>{language==='ar'?'إضافة متدرب':'Ajouter un participant'}</button>}{view==='drivers'&&<button className="primary" onClick={()=>openEditor(null,'legacy')}><Plus size={16}/>{language==='ar'?'إضافة سجل تسليم':'Ajouter une remise'}</button>}{view==='registration'&&<button className="primary" onClick={()=>openEditor(null,'registration')}><Plus size={16}/>{language==='ar'?'تسجيل سائق ومركبة':'Enregistrer livreur et véhicule'}</button>}{view!=='registration'&&view!=='training'&&<ExcelExportDialog drivers={rows} busy={exporting} onExport={exportXlsx}/>}</div></div>
  {view==='dashboard'&&<section className="dashboardWelcome" aria-label={language==='ar'?'ملخص العمليات':'Résumé opérationnel'}>
   <div><span className="dashboardWelcomeTag">PRESTO · {language==='ar'?'مركز العمليات':'CENTRE OPÉRATIONNEL'}</span>
    <h2>{language==='ar'?'إدارة السائقين بشكل أوضح وأسهل':'Une vision claire de vos opérations'}</h2>
    <p>{language==='ar'?'تابع '+totals.all+' سائقًا، والتجهيزات، وحسابات الدفع من لوحة واحدة. هناك '+totals.missing+' سجلًا دون وسيلة دفع نشطة.':'Suivez '+totals.all+' livreur(s), les équipements et les comptes de paiement au même endroit. '+totals.missing+' dossier(s) sans compte de paiement actif.'}</p>
   </div>
   <div className="dashboardWelcomeActions">
    <button type="button" onClick={()=>go('drivers')}><Users size={17}/>{language==='ar'?'سجل التسليم':'Registre des remises'}</button>
    <button type="button" onClick={()=>go('registration')}><Bike size={17}/>{language==='ar'?'تسجيل السائقين':'Enregistrer un livreur'}</button>
   </div>
  </section>}
  {syncError&&<div className="syncNotice" role="alert">{syncError}</div>}
  {msg&&<div className="syncNotice" role="status">{msg}<button onClick={()=>setMsg('')} aria-label={t("Fermer")}><X size={15}/></button></div>}
  {view==='dashboard'&&<><div className="statGrid">{[['LIVREURS',totals.all,'+ Total enregistré','orange'],['SACS REMIS',totals.bags,pct(totals.bags)+' % '+t('de remise'),'blue'],['CHEMISES',totals.shirts,pct(totals.shirts)+' % '+t('distribuées'),'cyan'],['DOSSIERS COMPLETS',totals.complete,pct(totals.complete)+' % '+t('des livreurs'),'green']].map(s=><PrestoSpotlightCard className={'stat '+s[3]} key={s[0]}><small>{t(String(s[0]))}</small><div><strong><AnimatedMetric value={Number(s[1])} locale={language==='ar'?'ar-MR':'fr-FR'}/></strong><span><ArrowUpRight size={22}/></span></div><p>{t(String(s[2]))}</p></PrestoSpotlightCard>)}</div><div className="dashboardQuickLinks" aria-label={language==='ar'?'اختصارات العمليات':'Accès rapides'}>
   {([
    ['registration',language==='ar'?'السائقون والمركبات':'Livreurs et véhicules',Bike],
    ['training',language==='ar'?'المتدربون على التطبيق':'Personnes formées',GraduationCap],
    ['equipment',language==='ar'?'متابعة التجهيزات':'Équipements',Package],
    ['mobile',language==='ar'?'حسابات الدفع':'Mobile Money',Wallet],
    ['reports',language==='ar'?'التقارير والإحصاءات':'Rapports',ChartNoAxesColumn]
   ] as const).map(([target,label,Icon])=><button type="button" key={target} onClick={()=>go(target)}><Icon size={18}/><span>{label}</span><ArrowUpRight className="quickArrow" size={15}/></button>)}
  </div><div className="sectionHeading"><h2>{t("MOYENS DE PAIEMENT")}</h2><small>{t("Comptes enregistrés")}</small></div><div className="paymentGrid">{pays.map(([k,name,bank,color])=><button className="payment" key={k} onClick={()=>go('mobile')} style={{'--c':color} as React.CSSProperties}><div className="paymentHeader"><span className="paymentLogo"><img src={'/logos/'+k+'.webp'} alt={name} width={54} height={54}/></span><div><b>{name}</b><small>{bank}</small></div><strong>{count(k)}</strong></div><div className="track"><div style={{width:pct(count(k))+'%'}}/></div></button>)}</div><div className="bottomGrid"><section className="panel register"><div className="panelTitle"><div><h2>{t("Registre des remises")}</h2><p>{t("Les cinq derniers livreurs")}</p></div><button className="secondary" onClick={()=>go('drivers')}>{t("Voir le registre")}</button></div>{table(orderedRows.slice(-5).reverse(),true)}</section><aside className="attention"><small>{t("POINT D’ATTENTION")}</small><strong>{totals.missing}</strong><span>{t("sans mobile money")}</span><hr/><h3>{t("Priorité opérationnelle")}</h3><p>{t("Relancer les livreurs sans compte actif.")}</p><button onClick={()=>go('drivers')}>{t("Voir les dossiers à relancer")}<ArrowUpRight size={15}/></button></aside></div></>}
  {view==='drivers'&&<section className="panel fullTable driverRegisterPanel"><div className="panelTitle driverRegisterPanelTitle"><div><span className="driverRegisterOverline">PRESTO · {language==='ar'?'سجل تسليم المعدات':'REGISTRE DES REMISES'}</span><h2>{t("Registre des remises")}</h2><p>{language==='ar'?'ترقيم متسلسل من أول سائق إلى آخر سائق مسجل':'Numérotation continue du premier au dernier livreur'}</p></div><div className="driverRegisterRecordCount"><strong>{totals.all}</strong><small>{language==='ar'?'إجمالي السائقين':'Livreurs au total'}</small></div></div><div className="controls driverRegisterSearch"><label><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={language==='ar'?'ابحث بالاسم أو رقم الهاتف أو الترتيب':'Rechercher par nom, téléphone ou numéro'}/></label><span>{language==='ar'?('عرض '+filtered.length+' من '+totals.all):('Affichage de '+filtered.length+' sur '+totals.all)}</span></div>{table(filtered)}</section>}
  {view==='registration'&&<section className="panel fullTable driverRegisterPanel driverVehicleRegisterPanel"><div className="panelTitle driverRegisterPanelTitle"><div><span className="driverRegisterOverline">PRESTO · {language==='ar'?'تسجيل السائقين والمركبات':'LIVREURS ET VÉHICULES'}</span><h2>{language==='ar'?'سجل السائقين والمركبات':'Registre des livreurs et véhicules'}</h2><p>{language==='ar'?'الاسم، المدينة، نوع المركبة، الصور، الهاتف وكود التطبيق — دون القميص والحقيبة':'Nom, ville, véhicule, photos, téléphone et code application — sans les équipements'}</p></div><div className="driverRegisterRecordCount"><strong>{registrationRows.length}</strong><small>{language==='ar'?'سائقون ومركبات':'Livreurs enregistrés'}</small></div></div><div className="registeredExcelToolbar"><span>{language==='ar'?'تنزيل سجل السائقين والمركبات بصيغة Excel':'Exporter le registre des livreurs et véhicules'}</span><ExcelExportDialog drivers={registrationRows} busy={exporting} onExport={exportRegistered}/></div><div className="prestoCandidateEntry"><div><strong>{language==='ar'?'المرشحون للعمل ولم يكملوا التسجيل':'Candidats non encore inscrits'}</strong><p>{language==='ar'?'أضف الصور والموتو وتابع الاتصال، ثم نزّل Excel.':'Photos, suivi des contacts et export Excel.'}</p></div><a href="/candidates" className="prestoCandidateEntryLink">{language==='ar'?'فتح سجل المرشحين':'Ouvrir les candidats'} <ArrowUpRight size={17}/></a></div><div className="controls driverRegisterSearch"><label><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={language==='ar'?'ابحث بالاسم أو الهاتف أو المدينة أو المركبة':'Rechercher nom, téléphone, ville ou véhicule'}/></label><span>{language==='ar'?'عرض '+registeredFiltered.length+' من '+registrationRows.length:'Affichage de '+registeredFiltered.length+' sur '+registrationRows.length}</span></div>{table(registeredFiltered,false,'registration')}</section>}
  {view==='untrained'&&<PrestoTrainingRecords language={language} editable={admin} initialFilter="not_trained" drivers={rows.map(d=>({id:d.id,name:d.name,phone:d.pdf_source_phone||d.phone,city:d.city}))} onSaved={async()=>{await load();await refreshTraining();}}/>}
  {view==='inactive'&&<InactiveDrivers language={language} editable={admin}/>}
  {view==='training'&&<><PrestoPdfRoster rows={rosterRows} photos={photoUrls} language={language} editable={admin}
 onShowTraining={()=>{setShowManualTraining(true);setTrainingPrefill(null);setTimeout(()=>document.getElementById('presto-training-records')?.scrollIntoView({behavior:'smooth',block:'start'}),80);}}
 onOpenTraining={person=>openTraining(person?{id:person.id,name:person.name,phone:person.phone,city:person.city}:undefined)}
 onFixNumbering={async changes=>{
  if(!prestoCloud||!admin)throw Error(language==='ar'?'يلزم تسجيل الدخول كمسؤول.':'Connexion administrateur nécessaire.');
  const positions=new Set<number>();
  const ids=new Set(changes.map(change=>change.id));
  const occupied=new Set(rows.filter(row=>!ids.has(row.id)&&row.pdf_position!=null).map(row=>row.pdf_position));
  for(const change of changes){
   if(!Number.isSafeInteger(change.position)||change.position<1||positions.has(change.position)||occupied.has(change.position))
    throw Error(language==='ar'?'يوجد تعارض في ترتيب السائقين. حدّث الصفحة وراجع القائمة أولاً.':'Conflit de numérotation. Actualisez et vérifiez le registre.');
   positions.add(change.position);
  }
  try{
   for(const change of [...changes].sort((a,b)=>a.position-b.position)){
    const query=prestoCloud.from('presto_drivers').update({pdf_position:change.position}).eq('id',change.id);
    const {data,error}=await (change.previous===null?query.is('pdf_position',null):query.eq('pdf_position',change.previous)).select('id');
    if(error)throw Error(error.message);
    if(data?.length!==1)throw Error(language==='ar'?'تغير السجل أثناء التحديث، تم حفظ التغييرات الناجحة فقط.':'Le registre a changé, certaines modifications ont été appliquées.');
   }
   void mirrorExcel();
  }finally{await load();}
 }}
 onUpdate={async(id,patch)=>{
  if(!prestoCloud||!admin)throw Error(language==='ar'?'تسجيل الدخول مطلوب لتعديل السجل.':'Connexion requise.');
  const nextPatch=patch.delivery_date?{...patch,pdf_source_date:patch.delivery_date}:patch;
  const {error}=await prestoCloud.from('presto_drivers').update(nextPatch).eq('id',id);
  if(error)throw Error(error.message);
  await load();
  void mirrorExcel();
 }}/>
 {showManualTraining&&<div id="presto-training-records" style={{marginTop:24}}>
  <div className="prestoTrainingSectionHead">
   <div><span>PRESTO · FORMATION</span><h2>{language==='ar'?'سجل المتدربين وتفاصيل التدريب':'Registre des participants et formations'}</h2>
    <p>{language==='ar'?'يُحفظ التدريب في سجل مستقل وتُحدّث حالة السائق المطابق في ملفه.':'Chaque session est conservée et le statut du livreur correspondant est actualisé.'}</p></div>
   <button className="secondary" onClick={()=>setShowManualTraining(false)} type="button"><X size={17}/>{language==='ar'?'إخفاء السجل':'Masquer'}</button>
  </div>
  <PrestoTrainingRecords language={language} editable={admin} drivers={rows.map(d=>({id:d.id,name:d.name,phone:d.pdf_source_phone||d.phone,city:d.city}))}
   openRequest={trainingOpenRequest} prefillDriver={trainingPrefill} onSaved={async()=>{await load();await refreshTraining();void mirrorExcel();}}/>
 </div>}</>}
  {view==='equipment'&&<EquipmentPanel drivers={orderedRows} language={language} onOpen={setSelectedId} onCard={setCardId} readonly={!admin} onToggle={(id,key,val)=>{void setFlag(id,key,val)}}/>}
  {view==='mobile'&&<MobileMoneyPanel drivers={orderedRows} language={language} onOpen={setSelectedId} onCard={setCardId} readonly={!admin} onToggle={(id,key,val)=>{void setFlag(id,key,val)}}/>}
  {view==='reports'&&<OperationsReports drivers={orderedRows} language={language} exportAction={<ExcelExportDialog drivers={rows} busy={exporting} variant="wide" onExport={exportXlsx}/>}/>}
  {view==='settings'&&<div className="settingsPage opsSettingsPage">
  <div className="opsSettingsIntro"><span className="opsSettingsIntroIcon"><Settings size={23}/></span><div><span className="opsEyebrow">PRESTO · {language==='ar'?'التخصيص والإدارة':'PERSONNALISATION'}</span><h2>{language==='ar'?'إعدادات مساحة العمل':'Paramètres de l’espace de travail'}</h2><p>{language==='ar'?'تحكم في اللغة والسجلات المحفوظة وGoogle Sheets وبيانات الشركة.':'Langue, synchronisation et informations de votre entreprise.'}</p></div></div>
  <PrestoAppearanceSettings/>
  <section className="settingsLanguageCard opsLanguageCard"><span className="opsSettingsSectionIcon"><Settings size={22}/></span><div><h3>{t("Langue de l’interface")}</h3><p>{t("Choisissez la langue d'affichage du tableau de bord.")}</p></div><LanguageSwitcher/></section>
{legacyCount>0&&<section className="settingsCard opsMigrationCard"><div className="settingsCardHead"><span className="settingsIcon"><Users size={20}/></span><div><h3>{language==='ar'?'نقل البيانات القديمة إلى الموقع المشترك':'Migrer les livreurs de ce navigateur'}</h3><p>{legacyCount} {language==='ar'?'سجلًا محفوظًا هنا':'livreur(s) locaux à importer'}</p></div></div><button className="primary" disabled={legacyUploading} onClick={()=>void importLegacy()}>{legacyUploading?(language==='ar'?'جار النقل...':'Importation...'):(language==='ar'?'نقل السجلات القديمة':'Importer les anciens livreurs')}</button></section>}
<section className="settingsCard opsSheetsCard"><div className="settingsCardHead"><span className="settingsIcon"><Download size={20}/></span><div><h3>Google Sheets</h3><p>{language==='ar'?'الجدول موجود في حساب Google. تتطلب المزامنة المستمرة موافقة Google مرة واحدة.':'La feuille est créée dans votre Drive. Une autorisation Google unique est nécessaire pour la synchronisation automatique.'}</p></div></div>
<div className="excelCloudStatus"><span>{excelStatus==='saving'?(language==='ar'?'جار التحديث...':'Synchronisation...'):excelStatus==='saved'?(language==='ar'?'اكتملت المزامنة بنجاح':'Dernière synchronisation réussie'):excelStatus==='ready'?(language==='ar'?'الاتصال مُعدّ، يمكن اختبار المزامنة':'Configuration détectée, prêt à vérifier'):excelStatus==='error'?(language==='ar'?'تعذرت المزامنة':'Erreur de synchronisation'):(language==='ar'?'Google Sheets غير مرتبط بعد':'Google Sheets non connecté')}</span>{excelSavedAt&&<small>{new Date(excelSavedAt).toLocaleString(language==='ar'?'ar-MR':'fr-FR')}</small>}</div>
<div className="prestoSheetsActions">
<a className="secondary" href="https://docs.google.com/spreadsheets/d/1JYtPBLUxxDWFFoZOWvA7qcrhI3eRZAAiFamvGqkLTXk/edit" target="_blank" rel="noopener noreferrer">{language==='ar'?'فتح جدول Google Sheets':'Ouvrir Google Sheets'}</a>
<button className="secondary" disabled={excelStatus==='saving'} onClick={()=>void mirrorExcel()}>{language==='ar'?'تحقق من المزامنة الآن':'Vérifier la synchronisation'}</button>
<a className="prestoSheetsGuide" href="https://github.com/mouhamedyslemelgh-commits/Presto/blob/main/GOOGLE_SHEETS_SETUP_AR.md" target="_blank" rel="noopener noreferrer">{language==='ar'?'خطوات تفعيل الربط التلقائي':'Activer la synchronisation automatique'}</a>
</div>
<p className="cloudFootnote">{language==='ar'?'سجلات الموقع محفوظة في قاعدة PRESTO المشتركة حتى قبل ربط Google Sheets.':'Les données sont conservées dans la base partagée PRESTO même avant le branchement de Google Sheets.'}</p></section>
<section className="settingsCard opsCompanyCard"><div className="settingsCardHead"><span className="settingsIcon"><Settings size={20}/></span><div><h3>{t("Informations de l'entreprise")}</h3><p>{t("Ces données sont partagées entre les visiteurs.")}</p></div></div><label className="settingsField">{t("Entreprise")}<input value={company} disabled={!admin} maxLength={70} onChange={e=>setCompany(e.target.value)}/></label><label className="settingsField">{t("Ville")}<input value={city} disabled={!admin} maxLength={90} onChange={e=>setCity(e.target.value)}/></label>{admin&&<button className="primary" onClick={()=>void saveProfile()}>{t("Enregistrer le profil")}</button>}</section>

  <section className="settingsCard opsDangerCard"><div className="settingsCardHead"><span className="settingsIcon"><RefreshCw size={20}/></span><div><h3>{t("Effacer le registre partagé")}</h3><p>{t("Cette action supprime les fiches pour tous les visiteurs.")}</p></div></div><button className="settingsDangerButton" disabled={!admin} onClick={()=>{if(!prestoCloud||!window.confirm(t('Effacer TOUS les livreurs pour TOUS les visiteurs ?')))return;void mutate(()=>prestoCloud.from('presto_drivers').delete().gte('id',1))}}><Trash2 size={16}/>{t("Supprimer tous les livreurs")}</button></section></div>}
  </main></div>
  {cardRow&&<EquipmentCardDialog driver={profileData(cardRow)} displayNumber={positions.get(cardRow.id)||cardRow.id} photo="/images/presto-uniform-rider.webp" ar={language==='ar'} maskPhone={false} onClose={()=>setCardId(null)}/>}
  {selectedId!==null&&rows.some(d=>d.id===selectedId)&&(()=>{const d=rows.find(x=>x.id===selectedId)!;return <DriverProfile key={d.id} displayNumber={positions.get(d.id)||d.id} driver={profileData(rosterRows.find(r=>r.id===d.id)||d)} photoUrls={photoUrls} onGoTraining={()=>{setSelectedId(null);go('training');if(admin)openTraining({id:d.id,name:d.name,phone:d.phone,city:d.city});else setShowManualTraining(true);}} onClose={()=>setSelectedId(null)} readOnly={!admin} onSave={async next=>{if(!prestoCloud||!admin)throw Error("Accès administrateur requis.");const {error}=await prestoCloud.from("presto_drivers").update({name:next.name,phone:next.phone,bag:next.bag,shirt:next.shirt,verified:next.verified,bankily:next.payments.bankily,masrvi:next.payments.masrvi,sedad:next.payments.sedad,click:next.payments.click,bankily_account:next.paymentNumbers?.bankily||"",masrvi_account:next.paymentNumbers?.masrvi||"",sedad_account:next.paymentNumbers?.sedad||"",click_account:next.paymentNumbers?.click||"",delivery_date:next.deliveryDate||"",observations:next.observations||"",city:next.city||"",vehicle_type:next.vehicleType||"",app_code:next.appCode||""}).eq("id",next.id);if(error)throw Error(error.message);await load();await mirrorExcel();}}/>})()}
 {editing&&admin&&<DriverRegistrationDialog mode={dialogMode} language={language} isEdit={editing.id>0} values={{
  name:editing.name,phone:editing.phone,city:editing.city,vehicleType:editing.vehicle_type,appCode:editing.app_code,driverPhotoPath:editing.driver_photo_path,vehiclePhotoPath:editing.vehicle_photo_path,deliveryDate:editing.delivery_date||'',observations:editing.observations||'',
  bag:editing.bag,shirt:editing.shirt,verified:editing.verified,
  payments:{bankily:editing.bankily,masrvi:editing.masrvi,sedad:editing.sedad,click:editing.click},
  paymentNumbers:{bankily:editing.bankily_account||'',masrvi:editing.masrvi_account||'',sedad:editing.sedad_account||'',click:editing.click_account||''}
 }} photoUrls={{person:photoUrls[editing.driver_photo_path],vehicle:photoUrls[editing.vehicle_photo_path]}} onChange={next=>setEditing({...editing,
  city:next.city||'',vehicle_type:next.vehicleType||'',app_code:next.appCode||'',
  name:next.name,phone:next.phone,delivery_date:next.deliveryDate,observations:next.observations,
  bag:next.bag,shirt:next.shirt,verified:next.verified,
  bankily:next.payments.bankily,masrvi:next.payments.masrvi,sedad:next.payments.sedad,click:next.payments.click,
  bankily_account:next.paymentNumbers.bankily,masrvi_account:next.paymentNumbers.masrvi,
  sedad_account:next.paymentNumbers.sedad,click_account:next.paymentNumbers.click
 })} onClose={()=>setEditing(null)} onSave={save}/>}
 
 </div>;
}

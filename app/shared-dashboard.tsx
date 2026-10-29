// @ts-nocheck
'use client';
import {useCallback,useEffect,useState} from 'react';
import {prestoCloud} from '../lib/presto-cloud';
import {savePrestoExcelSnapshot,downloadSavedPrestoExcel} from '../lib/presto-excel-cloud';
import DriverProfile from '../components/driver-profile';
import {useLanguage,LanguageSwitcher} from '../components/presto-language';
import ExcelImporter from '../components/excel-importer';
import ExcelExportDialog,{type ExcelExportScope} from '../components/excel-export-dialog';
import {downloadPrestoXlsx} from '../lib/presto-excel-export';
import {normalizeHeader,type ImportedDriver,type ImportMode} from '../lib/presto-excel';
import {LayoutDashboard,Users,Package,Wallet,ChartNoAxesColumn,Settings,ArrowUpRight,Download,Plus,Search,Edit3,Trash2,Menu,X,Check,ShieldAlert,LogIn,LogOut,RefreshCw} from 'lucide-react';
type Pay='bankily'|'masrvi'|'sedad'|'click';
type Row={id:number;name:string;phone:string;bag:boolean;shirt:boolean;verified:boolean;bankily:boolean;masrvi:boolean;sedad:boolean;click:boolean;bankily_account:string;masrvi_account:string;sedad_account:string;click_account:string;delivery_date:string;observations:string};
type View='dashboard'|'drivers'|'equipment'|'mobile'|'reports'|'settings';
const pays:[Pay,string,string,string][]=[['bankily','Bankily','BPM','#228e99'],['masrvi','Masrvi','BMCI','#6949a7'],['sedad','Sedad','BMI','#22966a'],['click','CLICK','BNM','#2480a9']];
const menus:[View,string,typeof Users][]=[['dashboard',"Vue d’ensemble",LayoutDashboard],['drivers','Livreurs',Users],['equipment','Équipements',Package],['mobile','Mobile Money',Wallet],['reports','Rapports',ChartNoAxesColumn],['settings','Paramètres',Settings]];
const emptyRow=():Row=>({id:0,name:'',phone:'',bag:false,shirt:false,verified:false,bankily:false,masrvi:false,sedad:false,click:false,bankily_account:'',masrvi_account:'',sedad_account:'',click_account:'',delivery_date:'',observations:''});
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
 const [rows,setRows]=useState<Row[]>([]),[view,setView]=useState<View>('dashboard'),[openMenu,setOpenMenu]=useState(false);
 const [selectedId,setSelectedId]=useState<number|null>(null);
 const [loading,setLoading]=useState(true),[msg,setMsg]=useState(''),[search,setSearch]=useState(''),[editing,setEditing]=useState<Row|null>(null);
 const [userId,setUserId]=useState<string|null>(null),[admin,setAdmin]=useState(false);
 const [excelStatus,setExcelStatus]=useState<'idle'|'saving'|'saved'|'error'>('idle');
 const [excelSavedAt,setExcelSavedAt]=useState<string|null>(null);
 const [exporting,setExporting]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[company,setCompany]=useState('PRESTO'),[city,setCity]=useState('Nouakchott · MR');
 const [claimCode,setClaimCode]=useState(''),[claiming,setClaiming]=useState(false);
 const [legacyCount,setLegacyCount]=useState(0),[legacyUploading,setLegacyUploading]=useState(false);
 const load=useCallback(async()=>{
  if(!prestoCloud)return;
  const all:Row[]=[];
  for(let i=0;i<10000;i+=1000){
   const {data,error}=await prestoCloud.from('presto_drivers').select('id,name,phone,bag,shirt,verified,bankily,masrvi,sedad,click,bankily_account,masrvi_account,sedad_account,click_account,delivery_date,observations').order('id',{ascending:true}).range(i,i+999);
   if(error){setMsg('Erreur de synchronisation : '+error.message);setLoading(false);return;}
   const chunk=(data??[]) as Row[];all.push(...chunk);
   if(chunk.length<1000)break;
  }
  setRows(all);setLoading(false);
 },[]);
 useEffect(()=>{
  if(!prestoCloud)return;
  let active=true;
  void load();
  try{
   const raw=localStorage.getItem('presto-ops-live-v1');
   const data=raw?JSON.parse(raw):[];
   if(Array.isArray(data))setLegacyCount(data.filter(x=>x&&typeof x.name==='string'&&x.name.trim()).length);
  }catch{}
  void prestoCloud.from('presto_profile').select('company,city').eq('id',1).maybeSingle().then(({data})=>{if(active&&data){setCompany(data.company);setCity(data.city)}});
  void prestoCloud.auth.getSession().then(({data})=>{if(active)setUserId(data.session?.user.id??null)});
  const {data:listener}=prestoCloud.auth.onAuthStateChange((_event,session)=>{if(active)setUserId(session?.user.id??null)});
  const interval=setInterval(()=>{void load()},5000);
  return ()=>{active=false;clearInterval(interval);listener.subscription.unsubscribe()};
 },[load]);
 useEffect(()=>{
  if(!prestoCloud||!userId){setAdmin(false);return;}
  let on=true;
  void prestoCloud.from('presto_admins').select('user_id').eq('user_id',userId).maybeSingle().then(({data,error})=>{if(on)setAdmin(Boolean(data)&&!error)});
  return ()=>{on=false};
 },[userId]);
 const mirrorExcel=async()=>{
  setExcelStatus('saving');
  try{
   const result=await savePrestoExcelSnapshot(company);
   setExcelSavedAt(result.timestamp);
   setExcelStatus('saved');
  }catch(error){
   const message=error instanceof Error?error.message:'Erreur inconnue';
   setExcelStatus('error');
   setMsg('Les données sont enregistrées dans PRESTO, mais la copie Excel n’est pas à jour : '+message);
  }
 };
 const downloadCloudExcel=async()=>{
  try{await downloadSavedPrestoExcel();}
  catch(error){setMsg(error instanceof Error?error.message:'Impossible de télécharger Excel.')}
 };
 useEffect(()=>{if(admin){void mirrorExcel();}},[admin]);
 const mutate=async(job:()=>PromiseLike<{error:{message:string}|null}>)=>{
  if(!admin){setMsg('Connexion administrateur obligatoire pour modifier les données.');return;}
  try{const {error}=await job();if(error){setMsg('Échec de sauvegarde : '+error.message);return;}await load();await mirrorExcel();}catch(e){setMsg('Impossible de contacter la base partagée.')}
 };
 const save=async()=>{
  if(!editing?.name.trim()||!admin||!prestoCloud)return;
  const {id,...rest}=editing;
  const data={...rest,name:rest.name.trim()};
  let ok=false;
  await mutate(async()=>{
   const result=id?await prestoCloud.from('presto_drivers').update(data).eq('id',id):await prestoCloud.from('presto_drivers').insert(data);
   ok=!result.error;return result;
  });
  if(ok)setEditing(null);
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
   await mirrorExcel();
   return {added,updated,skipped};
  }catch(e){
   await load();
   throw Error('Importation partielle possible. Vérifiez le registre avant de réessayer. '+(e instanceof Error?e.message:''));
  }
 };
 const del=async(id:number)=>{
  if(!prestoCloud||!admin||!window.confirm('Supprimer définitivement ce livreur pour tous les visiteurs ?'))return;
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
 const saveProfile=async()=>{
  if(!prestoCloud||!admin||!company.trim()||!city.trim())return;
  await mutate(()=>prestoCloud.from('presto_profile').update({company:company.trim(),city:city.trim()}).eq('id',1));
 };
 const totals={all:rows.length,bags:rows.filter(x=>x.bag).length,shirts:rows.filter(x=>x.shirt).length,complete:rows.filter(complete).length,missing:rows.filter(x=>!hasPay(x)).length};
 const count=(key:Pay)=>rows.filter(x=>x[key]).length;
 const pct=(v:number)=>totals.all?Math.round(v/totals.all*1000)/10:0;
 const filtered=rows.filter(d=>[d.name,d.phone,d.id].join(' ').toLowerCase().includes(search.toLowerCase()));
 const go=(v:View)=>{setView(v);setOpenMenu(false);setSearch('')};
 const table=(items:Row[],preview=false)=> <div className="tableOverflow"><table><thead><tr><th>N°</th><th>LIVREUR</th><th>DATE</th><th>TÉLÉPHONE</th><th>SAC / CHEMISE</th><th>COMPTES</th><th>STATUT</th><th>OBSERVATIONS</th>{!preview&&admin&&<th>ACTIONS</th>}</tr></thead><tbody>{items.length===0?<tr><td className="empty" colSpan={7}>Aucun livreur enregistré</td></tr>:items.map(d=><tr key={d.id}><td className="num">{d.id}</td><td className="name"><button className="driverNameButton" onClick={()=>setSelectedId(d.id)} type="button" title={language==='ar'?'فتح الملف الشخصي':'Ouvrir la fiche du livreur'}>{d.name}<ArrowUpRight size={13}/></button></td><td className="muted">{d.delivery_date||'—'}</td><td className="muted">{d.phone||'—'}</td><td>{d.bag?'Oui':'Non'} / {d.shirt?'Oui':'Non'}</td><td className="num">{Number(d.bankily)+Number(d.masrvi)+Number(d.sedad)+Number(d.click)}</td><td><span className={'status '+(complete(d)?'good':'bad')}>{complete(d)?'✓ '+t('Complet'):'! '+t('À relancer')}</span></td><td className="muted">{d.observations||'—'}</td>{!preview&&admin&&<td><button className="smallBtn" onClick={()=>setEditing({...d})} title="Modifier"><Edit3 size={16}/></button><button className="smallBtn" onClick={()=>void del(d.id)} title="Supprimer"><Trash2 size={16}/></button></td>}</tr>)}</tbody></table></div>;
 const titles:Record<View,string>={dashboard:'Pilotage des livreurs',drivers:'Registre des livreurs',equipment:'Suivi des équipements',mobile:'Comptes Mobile Money',reports:'Rapports & analyses',settings:'Paramètres'};
 return <div className="shell" dir={language==='ar'?'rtl':'ltr'}>
  <aside className={'sidebar '+(openMenu?'open':'')}><div className="brand"><div className="brandImageFrame"><img src="/logos/presto.webp" alt="PRESTO بريستو" width={310} height={170}/></div><span className="brandSub">OPERATIONS · LIVREURS</span></div><div className="sideCaption">ESPACE DE TRAVAIL</div><nav>{menus.map(([v,title,Icon])=><button key={v} className={view===v?'selected':''} onClick={()=>go(v)}><Icon size={17}/>{t(title)}</button>)}</nav><div className="sideFoot"><small>BASE PARTAGÉE</small><strong>{city}</strong><small>{company} · Cloud Sync</small></div></aside>
  {openMenu&&<div className="shade" onClick={()=>setOpenMenu(false)}/>}
  <div className="workspace"><header className="topbar"><button className="menuButton" onClick={()=>setOpenMenu(x=>!x)} aria-label="Ouvrir la navigation"><Menu size={20}/></button><img className="mobileBrandLogo" src="/logos/presto.webp" alt="PRESTO" width={80} height={48}/><div>Opérations / <b>Tableau de bord</b></div><div className="topRight"><LanguageSwitcher/><span className="date">Données partagées</span><span className="avatar">OP</span></div></header>
  <main><div className="pageHead"><div><h1>{t(titles[view])}</h1><p>Informations synchronisées entre tous les visiteurs · {loading?'Chargement...':'Actualisées automatiquement'}</p></div><div className="headActions">{view==='drivers'&&admin&&<ExcelImporter onImport={importDrivers} publicSite/>}{view==='drivers'&&admin&&<button className="primary" onClick={()=>setEditing(emptyRow())}><Plus size={16}/> Nouveau livreur</button>}<ExcelExportDialog drivers={rows} busy={exporting} onExport={exportXlsx}/></div></div>
  {msg&&<div className="syncNotice" role="status">{msg}<button onClick={()=>setMsg('')} aria-label="Fermer"><X size={15}/></button></div>}
  {view==='dashboard'&&<><div className="statGrid">{[['LIVREURS',totals.all,'+ Total enregistré','orange'],['SACS REMIS',totals.bags,pct(totals.bags)+' % de remise','blue'],['CHEMISES',totals.shirts,pct(totals.shirts)+' % distribuées','cyan'],['DOSSIERS COMPLETS',totals.complete,pct(totals.complete)+' % des livreurs','green']].map(s=><div className={'stat '+s[3]} key={s[0]}><small>{s[0]}</small><div><strong>{s[1]}</strong><span><ArrowUpRight size={22}/></span></div><p>{s[2]}</p></div>)}</div><div className="sectionHeading"><h2>MOYENS DE PAIEMENT</h2><small>Comptes enregistrés</small></div><div className="paymentGrid">{pays.map(([k,name,bank,color])=><button className="payment" key={k} onClick={()=>go('mobile')} style={{'--c':color} as React.CSSProperties}><div className="paymentHeader"><span className="paymentLogo"><img src={'/logos/'+k+'.webp'} alt={name} width={54} height={54}/></span><div><b>{name}</b><small>{bank}</small></div><strong>{count(k)}</strong></div><div className="track"><div style={{width:pct(count(k))+'%'}}/></div></button>)}</div><div className="bottomGrid"><section className="panel register"><div className="panelTitle"><div><h2>Registre des remises</h2><p>Les cinq derniers livreurs</p></div><button className="secondary" onClick={()=>go('drivers')}>Voir le registre</button></div>{table(rows.slice(-5).reverse(),true)}</section><aside className="attention"><small>POINT D’ATTENTION</small><strong>{totals.missing}</strong><span>sans mobile money</span><hr/><h3>Priorité opérationnelle</h3><p>Relancer les livreurs sans compte actif.</p><button onClick={()=>go('drivers')}>Voir les dossiers à relancer <ArrowUpRight size={15}/></button></aside></div></>}
  {view==='drivers'&&<section className="panel fullTable"><div className="panelTitle"><div><h2>Registre des livreurs</h2><p>{totals.all} livreurs · Lecture publique, modification réservée aux administrateurs</p></div></div><div className="controls"><label><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un livreur"/></label></div>{table(filtered)}{!admin&&<p className="cloudFootnote">Pour ajouter ou modifier des livreurs, connectez-vous comme administrateur dans Paramètres.</p>}</section>}
  {view==='equipment'&&<section className="panel fullTable"><div className="panelTitle"><div><h2>Distribution des équipements</h2><p>Modification réservée à l'administration</p></div></div><div className="tableOverflow"><table><thead><tr><th>LIVREUR</th><th>SAC</th><th>CHEMISE</th><th>DOSSIER VÉRIFIÉ</th></tr></thead><tbody>{rows.length===0?<tr><td className="empty" colSpan={4}>Aucun livreur enregistré</td></tr>:rows.map(d=><tr key={d.id}><td className="name"><button className="driverNameButton" onClick={()=>setSelectedId(d.id)} type="button" title={language==='ar'?'فتح الملف الشخصي':'Ouvrir la fiche du livreur'}>{d.name}<ArrowUpRight size={13}/></button></td>{(['bag','shirt','verified'] as const).map(k=><td key={k}><input type="checkbox" disabled={!admin} checked={d[k]} onChange={e=>void setFlag(d.id,k,e.target.checked)} aria-label={k+' '+d.name}/></td>)}</tr>)}</tbody></table></div></section>}
  {view==='mobile'&&<section className="panel fullTable"><div className="panelTitle"><div><h2>Comptes Mobile Money</h2><p>Bankily, Masrvi, Sedad et CLICK</p></div></div><div className="tableOverflow"><table><thead><tr><th>LIVREUR</th>{pays.map(([key,label])=><th key={key}>{label.toUpperCase()}</th>)}</tr></thead><tbody>{rows.length===0?<tr><td className="empty" colSpan={5}>Aucun compte enregistré</td></tr>:rows.map(d=><tr key={d.id}><td className="name"><button className="driverNameButton" onClick={()=>setSelectedId(d.id)} type="button" title={language==='ar'?'فتح الملف الشخصي':'Ouvrir la fiche du livreur'}>{d.name}<ArrowUpRight size={13}/></button></td>{pays.map(([key])=><td key={key}><input type="checkbox" disabled={!admin} checked={d[key]} onChange={e=>void setFlag(d.id,key,e.target.checked)} aria-label={key+' '+d.name}/>{d[(key+'_account') as 'bankily_account'|'masrvi_account'|'sedad_account'|'click_account']&&<small className="paymentAccountNumber">{d[(key+'_account') as 'bankily_account'|'masrvi_account'|'sedad_account'|'click_account']}</small>}</td>)}</tr>)}</tbody></table></div></section>}
  {view==='reports'&&<section className="panel report"><h2>Rapports partagés</h2>{[['Sacs remis',totals.bags],['Chemises',totals.shirts],['Dossiers complets',totals.complete],['Mobile Money actif',totals.all-totals.missing]].map(([label,n])=><div className="reportLine" key={label}><div><b>{t(String(label))}</b><span>{pct(Number(n))}%</span></div><div className="track"><div style={{width:pct(Number(n))+'%'}}/></div></div>)}<ExcelExportDialog drivers={rows} busy={exporting} variant="wide" onExport={exportXlsx}/></section>}
  {view==='settings'&&<div className="settingsPage"><section className="settingsLanguageCard"><div><h3>{t("Langue de l’interface")}</h3><p>{t("Choisissez la langue d'affichage du tableau de bord.")}</p></div><LanguageSwitcher/></section><section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><Settings size={20}/></span><div><h3>Connexion administrateur</h3><p>Seules les personnes autorisées peuvent modifier ou supprimer les informations.</p></div></div>{admin?<div className="adminStatus"><Check size={18}/> Session administrateur active <button className="secondary" onClick={()=>void logout()}><LogOut size={16}/> Déconnexion</button></div>:<div className="adminLogin"><label>Adresse e-mail<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mot de passe<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><div className="prestoAuthActions">
  <button className="primary" onClick={()=>void login()}><LogIn size={17}/>{language==='ar'?'تسجيل الدخول':'Se connecter'}</button>
  <button className="secondary" onClick={()=>void signup()}>{language==='ar'?'إنشاء حساب':'Créer un compte'}</button>
 </div><p>{language==='ar'?'بعد إنشاء الحساب والتحقق من بريدك، سجّل الدخول لتفعيل صلاحيات PRESTO.':'Après inscription et vérification de votre adresse e-mail, connectez-vous pour activer les droits PRESTO.'}</p></div>}
  {userId&&!admin&&<div className="prestoClaimBox">
   <label>{language==='ar'?'رمز تفعيل المسؤول (يُستخدم مرة واحدة)':'Code d’activation de l’administrateur (usage unique)'}
    <input type="password" autoComplete="off" value={claimCode} onChange={e=>setClaimCode(e.target.value)} placeholder={language==='ar'?'أدخل رمز التفعيل':'Entrez le code d’activation'}/></label>
   <button className="primary" disabled={claiming||!claimCode.trim()} onClick={()=>void claimOwner()}>{claiming?(language==='ar'?'جار التفعيل...':'Activation...'):(language==='ar'?'تفعيل إدارة PRESTO':'Activer mon accès administrateur')}</button>
   <p className="cloudFootnote">{language==='ar'?'هذا الرمز خاص بمالك PRESTO فقط، ولا يجب مشاركته مع الزوار.':'Ce code est réservé au propriétaire PRESTO et ne doit pas être partagé avec les visiteurs.'}</p>
  </div>}</section>
  {admin&&legacyCount>0&&<section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><Users size={20}/></span><div><h3>{language==='ar'?'نقل السائقين المحفوظين سابقًا':'Migrer les livreurs de cet appareil'}</h3><p>{language==='ar'?'عُثر على '+legacyCount+' سجلًا في المتصفح. انقلها إلى قاعدة PRESTO المشتركة بعد المراجعة.':legacyCount+' livreur(s) trouvés dans ce navigateur. Importez-les avec votre consentement vers la base partagée.'}</p></div></div><button className="primary" disabled={legacyUploading} onClick={()=>void importLegacy()}>{legacyUploading?(language==='ar'?'جار النقل...':'Importation...'):(language==='ar'?'نقل السجلات القديمة إلى الموقع المشترك':'Importer mes anciens livreurs')}</button></section>}
  <section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><Download size={20}/></span><div><h3>{language==='ar'?'ملف Excel المحفوظ تلقائيًا':'Excel sauvegardé automatiquement'}</h3><p>{language==='ar'?'يُحدّث من قاعدة PRESTO عند كل إضافة أو تعديل أو حذف.':'Actualisé après chaque ajout, modification ou suppression dans PRESTO.'}</p></div></div>
   <div className="excelCloudStatus"><span>{excelStatus==='saving'?(language==='ar'?'جارٍ الحفظ في Excel...':'Enregistrement Excel en cours...'):excelStatus==='saved'?(language==='ar'?'تم تحديث Excel':'Excel mis à jour'):excelStatus==='error'?(language==='ar'?'تحتاج نسخة Excel إلى إعادة المزامنة':'Synchronisation Excel à relancer'):(language==='ar'?'ملف Excel سحابي خاص':'Fichier Excel privé dans le cloud')}</span>{excelSavedAt&&<small>{new Date(excelSavedAt).toLocaleString(language==='ar'?'ar-MR':'fr-FR')}</small>}</div>
   <div className="settingsActions"><button className="primary" disabled={!admin||excelStatus==='saving'} onClick={()=>void mirrorExcel()}>{language==='ar'?'تحديث ملف Excel الآن':'Actualiser Excel maintenant'}</button><button className="secondary" disabled={!admin} onClick={()=>void downloadCloudExcel()}><Download size={16}/>{language==='ar'?'تنزيل النسخة المحفوظة':'Télécharger Excel sauvegardé'}</button></div>
   <p className="cloudFootnote">{language==='ar'?'البيانات الأصلية محفوظة في قاعدة مشتركة، وملف Excel نسخة تلقائية خاصة بالإدارة.':'La base partagée reste la source de vérité. Le classeur Excel est une copie privée réservée aux administrateurs.'}</p>
  </section>
  <section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><Settings size={20}/></span><div><h3>Informations de l'entreprise</h3><p>Ces données sont partagées entre les visiteurs.</p></div></div><label className="settingsField">Entreprise<input value={company} disabled={!admin} maxLength={70} onChange={e=>setCompany(e.target.value)}/></label><label className="settingsField">Ville<input value={city} disabled={!admin} maxLength={90} onChange={e=>setCity(e.target.value)}/></label>{admin&&<button className="primary" onClick={()=>void saveProfile()}>Enregistrer le profil</button>}</section>
  <section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><ShieldAlert size={20}/></span><div><h3>Confidentialité et accès</h3><p>Le site est public en lecture. Les visiteurs peuvent voir toutes les informations, y compris les numéros de téléphone.</p></div></div><p className="cloudFootnote">Ne saisissez pas de données personnelles sans autorisation des personnes concernées. Les modifications sont conservées dans la base jusqu'à leur suppression par un administrateur.</p></section>
  <section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><RefreshCw size={20}/></span><div><h3>Effacer le registre partagé</h3><p>Cette action supprime les fiches pour tous les visiteurs.</p></div></div><button className="settingsDangerButton" disabled={!admin} onClick={()=>{if(!prestoCloud||!window.confirm('Effacer TOUS les livreurs pour TOUS les visiteurs ?'))return;void mutate(()=>prestoCloud.from('presto_drivers').delete().gte('id',1))}}><Trash2 size={16}/> Supprimer tous les livreurs</button></section></div>}
  </main></div>
  {selectedId!==null&&rows.some(d=>d.id===selectedId)&&(()=>{const d=rows.find(x=>x.id===selectedId)!;return <DriverProfile key={d.id} driver={{id:d.id,name:d.name,phone:d.phone,bag:d.bag,shirt:d.shirt,verified:d.verified,payments:{bankily:d.bankily,masrvi:d.masrvi,sedad:d.sedad,click:d.click},paymentNumbers:{bankily:d.bankily_account,masrvi:d.masrvi_account,sedad:d.sedad_account,click:d.click_account},deliveryDate:d.delivery_date,observations:d.observations}} onClose={()=>setSelectedId(null)} readOnly={!admin} onSave={async next=>{if(!prestoCloud||!admin)throw Error("Accès administrateur requis.");const {error}=await prestoCloud.from("presto_drivers").update({name:next.name,phone:next.phone,bag:next.bag,shirt:next.shirt,verified:next.verified,bankily:next.payments.bankily,masrvi:next.payments.masrvi,sedad:next.payments.sedad,click:next.payments.click,bankily_account:next.paymentNumbers?.bankily||"",masrvi_account:next.paymentNumbers?.masrvi||"",sedad_account:next.paymentNumbers?.sedad||"",click_account:next.paymentNumbers?.click||"",delivery_date:next.deliveryDate||"",observations:next.observations||""}).eq("id",next.id);if(error)throw Error(error.message);await load();await mirrorExcel();}}/>})()}
 {editing&&admin&&<div className="modalWrap" onClick={e=>{if(e.target===e.currentTarget)setEditing(null)}}><section className="modal"><div className="modalHead"><h2>{editing.id?'Modifier':'Ajouter'} un livreur</h2><button onClick={()=>setEditing(null)}><X size={19}/></button></div><div className="modalBody"><label>Nom du livreur<input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} maxLength={100}/></label><label>Téléphone<input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} maxLength={30}/></label><label>Date de remise<input value={editing.delivery_date||''} onChange={e=>setEditing({...editing,delivery_date:e.target.value})} maxLength={30}/></label><label>Observations<input value={editing.observations||''} onChange={e=>setEditing({...editing,observations:e.target.value})} maxLength={1000}/></label><div className="checks">{(['bag','shirt','verified'] as const).map(k=><label key={k}><input type="checkbox" checked={editing[k]} onChange={e=>setEditing({...editing,[k]:e.target.checked})}/>{k==='bag'?'Sac remis':k==='shirt'?'Chemise remise':'Dossier vérifié'}</label>)}</div><h3>Mobile Money</h3><div className="checks">{pays.map(([k,label])=><label key={k}><input type="checkbox" checked={editing[k]} onChange={e=>setEditing({...editing,[k]:e.target.checked})}/>{label}</label>)}</div></div><div className="modalActions"><button className="secondary" onClick={()=>setEditing(null)}>Annuler</button><button className="primary" disabled={!editing.name.trim()} onClick={()=>void save()}><Check size={17}/> Enregistrer</button></div></section></div>}
 </div>;
}

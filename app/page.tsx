'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import ExcelImporter from '../components/excel-importer';
import {downloadPrestoXlsx} from '../lib/presto-excel-export';
import DriverProfile from '../components/driver-profile';
import {useLanguage,LanguageSwitcher} from '../components/presto-language';
import {normalizeHeader,type ImportedDriver,type ImportMode} from '../lib/presto-excel';
import {LayoutDashboard,Users,Package,Wallet,ChartNoAxesColumn,Settings,ArrowUpRight,Download,Plus,Search,Filter,Edit3,Trash2,Menu,X,Check,AlertTriangle,ChevronDown,RefreshCw,ShieldAlert,CalendarDays,Save,Upload,EyeOff,Building2,MapPin,Database,LockKeyhole} from 'lucide-react';
type Pay='bankily'|'masrvi'|'sedad'|'click';
type Driver={id:number;name:string;phone:string;bag:boolean;shirt:boolean;verified:boolean;payments:Record<Pay,boolean>;paymentNumbers?:Partial<Record<Pay,string>>;deliveryDate?:string;observations?:string};
type View='dashboard'|'drivers'|'equipment'|'mobile'|'reports'|'settings';
type Preferences={company:string;city:string;maskPhones:boolean};
const defaultPreferences:Preferences={company:'PRESTO',city:'Nouakchott · MR',maskPhones:false};
const preferencesKey='presto-ops-preferences-v1';
const driversKey='presto-ops-live-v1';
function isValidDrivers(input:unknown):input is Driver[]{
 if(!Array.isArray(input)||input.length>10000)return false;
 const ids=new Set<number>();
 return input.every((item:unknown)=>{
  if(!item||typeof item!=='object')return false;
  const d=item as Record<string,unknown>;
  const id=d.id;
  if(typeof id!=='number'||!Number.isSafeInteger(id)||id<1||ids.has(id))return false;
  ids.add(id);
  if(typeof d.name!=='string'||!d.name.trim()||d.name.length>100||typeof d.phone!=='string'||d.phone.length>30)return false;
  if(typeof d.bag!=='boolean'||typeof d.shirt!=='boolean'||typeof d.verified!=='boolean')return false;
  if(!d.payments||typeof d.payments!=='object')return false;
  const p=d.payments as Record<string,unknown>;
  return (['bankily','masrvi','sedad','click'] as const).every(k=>typeof p[k]==='boolean');
 });
}
function parsePreferences(input:unknown):Preferences{
 if(!input||typeof input!=='object')throw new Error('Préférences invalides.');
 const p=input as Record<string,unknown>;
 if(typeof p.company!=='string'||p.company.length>70||!p.company.trim()||typeof p.city!=='string'||p.city.length>90||!p.city.trim()||typeof p.maskPhones!=='boolean')throw new Error('Préférences invalides.');
 return {company:p.company.trim(),city:p.city.trim(),maskPhones:p.maskPhones};
}
const logoByMethod:Record<Pay,string>={bankily:'/logos/bankily.webp',masrvi:'/logos/masrvi.webp',sedad:'/logos/sedad.webp',click:'/logos/click.webp'};
const methods:[Pay,string,string,string][]=[['bankily','Bankily','BPM','#228e99'],['masrvi','Masrvi','BMCI','#6949a7'],['sedad','Sedad','BMI','#22966a'],['click','CLICK','BNM','#2480a9']];
const views:[View,string,typeof Users][]=[['dashboard',"Vue d’ensemble",LayoutDashboard],['drivers','Livreurs',Users],['equipment','Équipements',Package],['mobile','Mobile Money',Wallet],['reports','Rapports',ChartNoAxesColumn],['settings','Paramètres',Settings]];
const blank:Driver={id:0,name:'',phone:'',bag:false,shirt:false,verified:false,payments:{bankily:false,masrvi:false,sedad:false,click:false}};
const hasPay=(x:Driver)=>Object.values(x.payments).some(Boolean);
const complete=(x:Driver)=>x.bag&&x.shirt&&x.verified&&hasPay(x);
export default function Home(){
const {t,language}=useLanguage();
const [rows,setRows]=useState<Driver[]>([]),[ready,setReady]=useState(false),[view,setView]=useState<View>('dashboard'),[filter,setFilter]=useState('all'),[query,setQuery]=useState(''),[menu,setMenu]=useState(false),[editing,setEditing]=useState<Driver|null>(null),[dialog,setDialog]=useState(false);
const [prefs,setPrefs]=useState<Preferences>(defaultPreferences),[settingsMessage,setSettingsMessage]=useState('');
const backupFileRef=useRef<HTMLInputElement>(null);
const [selectedDriverId,setSelectedDriverId]=useState<number|null>(null);
const [exporting,setExporting]=useState(false);
useEffect(()=>{
 try{
  localStorage.removeItem('presto-ops-demo-v2');
  const data=localStorage.getItem(driversKey);
  if(data){const parsed:unknown=JSON.parse(data);if(isValidDrivers(parsed))setRows(parsed);}
  const saved=localStorage.getItem(preferencesKey);
  if(saved){try{setPrefs(parsePreferences(JSON.parse(saved)))}catch{localStorage.removeItem(preferencesKey)}}
 }catch{}
 setReady(true);
},[]);
useEffect(()=>{if(ready){try{localStorage.setItem(driversKey,JSON.stringify(rows))}catch{setSettingsMessage('Impossible de sauvegarder les données sur cet appareil.')}}},[rows,ready]);
useEffect(()=>{if(ready){try{localStorage.setItem(preferencesKey,JSON.stringify(prefs))}catch{setSettingsMessage('Impossible de sauvegarder les préférences.')}}},[prefs,ready]);
const exportBackup=()=>{
 const payload={format:'presto-operations-backup',version:1,exportedAt:new Date().toISOString(),drivers:rows,preferences:prefs};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;a.download='PRESTO-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
 setSettingsMessage('Sauvegarde JSON créée. Conservez-la dans un endroit privé.');
};
const importBackup=async(e:React.ChangeEvent<HTMLInputElement>)=>{
 const file=e.currentTarget.files?.[0];e.currentTarget.value='';
 if(!file)return;
 if(file.size>4*1024*1024){setSettingsMessage('Fichier trop volumineux (maximum 4 Mo).');return;}
 try{
  const parsed:unknown=JSON.parse(await file.text());
  if(!parsed||typeof parsed!=='object')throw new Error('Format non reconnu.');
  const backup=parsed as Record<string,unknown>;
  if(backup.format!=='presto-operations-backup'||backup.version!==1||!isValidDrivers(backup.drivers))throw new Error('Fichier de sauvegarde invalide.');
  const restoredPreferences=parsePreferences(backup.preferences);
  if(!window.confirm('Restaurer cette sauvegarde ? Les données actuellement enregistrées sur cet appareil seront remplacées.'))return;
  setRows(backup.drivers);setPrefs(restoredPreferences);
  setSettingsMessage('Sauvegarde restaurée : '+backup.drivers.length+' livreur(s).');
 }catch{setSettingsMessage('Fichier invalide. Importez uniquement une sauvegarde JSON PRESTO.')}
};
const resetDrivers=()=>{
 if(!window.confirm('Supprimer définitivement tous les livreurs enregistrés dans ce navigateur ? Cette action est irréversible sans sauvegarde.'))return;
 setRows([]);setSettingsMessage('Le registre a été vidé. Tous les compteurs affichent 0.');
};
const n=useMemo(()=>({all:rows.length,bags:rows.filter(x=>x.bag).length,shirts:rows.filter(x=>x.shirt).length,complete:rows.filter(complete).length,missing:rows.filter(x=>!hasPay(x)).length,methods:Object.fromEntries(methods.map(m=>[m[0],rows.filter(x=>x.payments[m[0]]).length])) as Record<Pay,number>}),[rows]);
const pct=(v:number)=>n.all?Math.round(v/n.all*1000)/10:0;
const list=useMemo(()=>rows.filter(x=>(filter==='all'||(filter==='complete'?complete(x):!complete(x)))&&[x.id,x.name,x.phone].join(' ').toLowerCase().includes(query.toLowerCase())),[rows,filter,query]);
const go=(v:View,pending=false)=>{setView(v);setFilter(pending?'pending':'all');setQuery('');setMenu(false)};
const edit=(d?:Driver)=>{setEditing(d?{...d,payments:{...d.payments}}:{...blank,id:Math.max(0,...rows.map(x=>x.id))+1,payments:{...blank.payments}});setDialog(true)};
const setFlag=(id:number,k:'bag'|'shirt'|'verified',value:boolean)=>setRows(rs=>rs.map(x=>x.id===id?{...x,[k]:value}:x));
const setPay=(id:number,k:Pay,v:boolean)=>setRows(rs=>rs.map(x=>x.id===id?{...x,payments:{...x.payments,[k]:v}}:x));
const save=()=>{if(!editing||!editing.name.trim())return;setRows(old=>old.some(x=>x.id===editing.id)?old.map(x=>x.id===editing.id?editing:x):[...old,editing]);setDialog(false)};
const importDrivers=async(items:ImportedDriver[],mode:ImportMode)=>{
 let added=0,updated=0,skipped=0;
 const next=[...rows], phoneKey=(s:string)=>s.replace(/\D/g,'');
 let maxId=Math.max(0,...next.map(x=>x.id));
 for(const d of items){
  const index=next.findIndex(old=>d.phone&&phoneKey(d.phone)&&phoneKey(old.phone)===phoneKey(d.phone)||(!d.phone&&normalizeHeader(old.name)===normalizeHeader(d.name)));
  if(index>=0&&mode==='add'){skipped++;continue;}
  const mapped={name:d.name,phone:d.phone,bag:d.bag,shirt:d.shirt,verified:d.verified,payments:d.payments,paymentNumbers:d.accounts,deliveryDate:d.deliveryDate,observations:d.observations};
  if(index>=0){next[index]={...next[index],...mapped};updated++;}
  else {next.push({id:++maxId,...mapped});added++;}
 }
 setRows(next);
 return {added,updated,skipped};
};
const selectedDriver=rows.find(d=>d.id===selectedDriverId)||null;
const exportWorkbook=async()=>{
 if(exporting)return;
 setExporting(true);
 try{await downloadPrestoXlsx(rows,prefs.company);}
 catch(error){
  console.error('PRESTO Excel export failed:',error);
  window.alert(language==='ar'?'تعذّر إنشاء ملف Excel. حاول مرة أخرى.':'Impossible de générer le fichier Excel. Réessayez.');
 }
 finally{setExporting(false);}
};
const title:{[K in View]:string}={dashboard:'Pilotage des livreurs',drivers:'Registre des livreurs',equipment:'Suivi des équipements',mobile:'Comptes Mobile Money',reports:'Rapports & analyses',settings:'Paramètres'};
function table(data:Driver[],kind:'summary'|'drivers'|'equipment'|'mobile'){return <div className="tableOverflow"><table><thead><tr><th>{t("N°")}</th><th>{t("LIVREUR")}</th>{kind==='drivers'?<th>{t("DATE DE REMISE")}</th>:null}{kind==='summary'||kind==='drivers'?<th>{t("TÉLÉPHONE")}</th>:null}{kind==='mobile'?methods.map(m=><th key={m[0]}>{m[1].toUpperCase()}</th>):<th>{t(kind==='equipment'?'SAC':'SAC / CHEMISE')}</th>}{kind==='equipment'?<th>{t("CHEMISE")}</th>:null}{kind==='summary'||kind==='drivers'?<th>{t("COMPTES")}</th>:null}<th>{t("STATUT")}</th>{kind==='drivers'?<th>{t("OBSERVATIONS")}</th>:null}{kind!=='summary'?<th>{t("ACTIONS")}</th>:null}</tr></thead><tbody>{data.length?data.map(d=><tr key={d.id}><td className="num">{String(d.id).padStart(2,'0')}</td><td className="name"><button type="button" className="driverNameButton" onClick={()=>setSelectedDriverId(d.id)} title={language==='ar'?'فتح ملف السائق':'Voir la fiche du livreur'}>{d.name}<ArrowUpRight size={14}/></button></td>{kind==='drivers'?<td className="muted">{d.deliveryDate||'—'}</td>:null}{kind==='summary'||kind==='drivers'?<td className="muted">{prefs.maskPhones&&d.phone?'•• •• •• ••':d.phone||'—'}</td>:null}{kind==='mobile'?methods.map(m=><td key={m[0]}><input type="checkbox" aria-label={m[1]+' '+d.name} checked={d.payments[m[0]]} onChange={e=>setPay(d.id,m[0],e.target.checked)}/>{d.paymentNumbers?.[m[0]]&&<small className="paymentAccountNumber">{d.paymentNumbers[m[0]]}</small>}</td>):kind==='equipment'?<><td><input type="checkbox" checked={d.bag} aria-label={'Sac '+d.name} onChange={e=>setFlag(d.id,'bag',e.target.checked)}/></td><td><input type="checkbox" checked={d.shirt} aria-label={'Chemise '+d.name} onChange={e=>setFlag(d.id,'shirt',e.target.checked)}/></td></>:<td>{d.bag?t('Oui'):t('Non')} / {d.shirt?t('Oui'):t('Non')}</td>}{kind==='summary'||kind==='drivers'?<td className="num">{String(Object.values(d.payments).filter(Boolean).length).padStart(2,'0')}</td>:null}<td><span className={'status '+(complete(d)?'good':'bad')}>{complete(d)?'✓ '+t('Complet'):'! '+t('À relancer')}</span></td>{kind==='drivers'?<td className="muted">{d.observations||'—'}</td>:null}{kind!=='summary'?<td><button className="smallBtn" aria-label={'Modifier '+d.name} onClick={()=>edit(d)}><Edit3 size={15}/></button>{kind==='drivers'?<button className="smallBtn" aria-label={'Supprimer '+d.name} onClick={()=>{if(confirm(t('Supprimer ce livreur ?')))setRows(v=>v.filter(x=>x.id!==d.id))}}><Trash2 size={15}/></button>:null}</td>:null}</tr>):<tr><td className="empty" colSpan={11}>{t("Aucun livreur enregistré pour le moment")}</td></tr>}</tbody></table></div>}
const controls=<div className="controls"><label><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("Rechercher un livreur...")}/></label><label><Filter size={16}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">{t("Tous les statuts")}</option><option value="complete">{t("Complets")}</option><option value="pending">{t("À relancer")}</option></select></label></div>;
return <div className="shell" dir={language==='ar'?'rtl':'ltr'}><div className={'sidebar '+(menu?'open':'')}><div className="brand"><div className="brandImageFrame"><img src="/logos/presto.webp" alt="PRESTO بريستو" width={310} height={170}/></div><span className="brandSub">{t("OPERATIONS · LIVREURS")}</span></div><div className="sideCaption">{t("ESPACE DE TRAVAIL")}</div><nav>{views.map(([key,label,Icon])=><button key={key} onClick={()=>go(key)} className={view===key?'selected':''}><Icon size={17}/>{t(label)}</button>)}</nav><div className="sideFoot"><small>{t("SUIVI TERRAIN")}</small><strong>{prefs.city}</strong><span>{t("Version interne 2026")}</span><small>{prefs.company} × Livreur Ops</small></div></div>{menu&&<div className="shade" onClick={()=>setMenu(false)}/>}<div className="workspace"><header className="topbar"><button className="menuButton" onClick={()=>setMenu(!menu)} aria-label="Ouvrir la navigation"><Menu size={20}/></button><img className="mobileBrandLogo" src="/logos/presto.webp" alt="PRESTO" width={86} height={48}/><div><span>{t("Opérations /")} </span><b> {t("Tableau de bord")}</b></div><div className="topRight"><LanguageSwitcher/><span className="date">{t("28 octobre 2026")} <ChevronDown size={12}/></span><span className="avatar">{t("OP")}</span></div></header><main><div className="pageHead"><div><h1>{t(title[view])}</h1><p>{t(view==='dashboard'?'Équipements distribués, comptes mobile money et dossiers à relancer':'Gestion des livreurs et suivi opérationnel · Démonstration')}</p></div><div className="headActions">{view==='drivers'?<><ExcelImporter onImport={importDrivers}/><button onClick={()=>edit()} className="primary"><Plus size={16}/> {t("Nouveau livreur")}</button></>:null}<button onClick={()=>void exportWorkbook()} disabled={exporting} className="primary"><Download size={15}/> {exporting?(language==='ar'?'جارٍ تجهيز Excel...':'Préparation Excel...'):(language==='ar'?'تنزيل Excel':'Exporter Excel')}</button></div></div>{view==='dashboard'?<><div className="statGrid">{[['LIVREURS',n.all,'+ Total enregistré','orange'],['SACS REMIS',n.bags,pct(n.bags).toLocaleString(language==='ar'?'ar-MR':'fr-FR')+(language==='ar'?'٪ تم التسليم':' % de remise'),'blue'],['CHEMISES',n.shirts,pct(n.shirts).toLocaleString(language==='ar'?'ar-MR':'fr-FR')+(language==='ar'?'٪ تم التوزيع':' % distribuées'),'cyan'],['DOSSIERS COMPLETS',n.complete,pct(n.complete).toLocaleString(language==='ar'?'ar-MR':'fr-FR')+(language==='ar'?'٪ من السائقين':' % des livreurs'),'green']].map(s=><div key={t(String(s[0]))} className={'stat '+s[3]}><small>{t(String(s[0]))}</small><div><strong>{s[1]}</strong><span><ArrowUpRight size={22}/></span></div><p>{t(String(s[2]))}</p></div>)}</div><div className="sectionHeading"><h2>{t("MOYENS DE PAIEMENT")}</h2><small>{t("Répartition des comptes enregistrés")}</small></div><div className="paymentGrid">{methods.map(([key,label,bank,color])=><button className="payment" onClick={()=>go('mobile')} key={key} style={{'--c':color} as React.CSSProperties}><div className="paymentHeader"><span className="paymentLogo"><img src={logoByMethod[key]} alt={"Logo "+label} width={54} height={54}/></span><div><b>{t(String(label))}</b><small>{bank}</small></div><strong>{n.methods[key]}</strong></div><div className="track"><div style={{width:pct(n.methods[key])+'%'}}/></div></button>)}</div><div className="bottomGrid"><section className="panel register"><div className="panelTitle"><div><h2>{t("Registre des remises")}</h2><p>{t("Aperçu des derniers livreurs enregistrés")}</p></div><button onClick={()=>go('drivers')} className="secondary">{t("Voir le registre")}</button></div>{table([...rows].reverse().slice(0,5),'summary')}</section><aside className="attention"><small>{t("POINT D’ATTENTION")}</small><strong>{n.missing}</strong><span>{t("sans mobile money")}</span><hr/><h3>{t("Priorité opérationnelle")}</h3><p>{t("Relancer les livreurs sans compte actif pour finaliser leurs dossiers.")}</p><button onClick={()=>go('drivers',true)}>{t("Voir les dossiers à relancer")} <ArrowUpRight size={15}/></button></aside></div></>:view==='drivers'||view==='equipment'||view==='mobile'?<>{view==='mobile'?<div className="paymentGrid">{methods.map(([key,label,bank,color])=><div className="payment" key={key} style={{'--c':color} as React.CSSProperties}><div className="paymentHeader"><span className="paymentLogo"><img src={logoByMethod[key]} alt={"Logo "+label} width={54} height={54}/></span><div><b>{label}</b><small>{bank}</small></div><strong>{n.methods[key]}</strong></div><div className="track"><div style={{width:pct(n.methods[key])+'%'}}/></div></div>)}</div>:null}<div className="panel fullTable"><div className="panelTitle"><div><h2>{t(view==='equipment'?'Remise des équipements':view==='mobile'?'Comptes enregistrés':'Registre des livreurs')}</h2><p>{list.length} {t('Livreurs')} · {t('Actualisées automatiquement')}</p></div></div>{controls}{table(list,view)}<div className="note">{t("Les données que vous saisissez restent enregistrées uniquement dans ce navigateur.")}</div></div></>:view==='reports'?<div className="panel report"><h2>{t("Avancement opérationnel")}</h2>{[['Sacs remis',n.bags],['Chemises',n.shirts],['Dossiers complets',n.complete],['Mobile Money actif',n.all-n.missing]].map(([label,v])=><div className="reportLine" key={label}><div><b>{t(String(label))}</b><span>{pct(Number(v))}%</span></div><div className="track"><div style={{width:pct(Number(v))+'%'}}/></div></div>)}<button className="primary" onClick={()=>void exportWorkbook()} disabled={exporting}><Download size={17}/> {exporting?(language==='ar'?'جارٍ تجهيز Excel...':'Préparation Excel...'):(language==='ar'?'تنزيل ملف Excel بنفس القالب':'Télécharger le modèle Excel')}</button></div>:<div className="settingsPage">
 <div className="settingsIntro"><div><h2>{t("Centre de configuration")}</h2><p>{t("Personnalisez l'affichage et protégez vos sauvegardes. Les modifications sont enregistrées automatiquement sur cet appareil.")}</p></div><span className="settingsBadge"><Database size={14}/> {t("Mode local")}</span></div>
 <section className="settingsLanguageCard"><div><h3>{t("Langue de l’interface")}</h3><p>{t("Choisissez la langue d'affichage du tableau de bord.")}</p></div><LanguageSwitcher/></section><div className="settingsGrid">
  <section className="settingsCard">
   <div className="settingsCardHead"><span className="settingsIcon"><Building2 size={21}/></span><div><h3>{t("Informations de l'entreprise")}</h3><p>{t("Personnalisation de la zone de suivi")}</p></div></div>
   <label className="settingsField">{t("Nom de l'entreprise")}<input maxLength={70} value={prefs.company} onChange={e=>setPrefs(v=>({...v,company:e.target.value}))} placeholder={t("PRESTO")} aria-label="Nom de l'entreprise"/></label>
   <label className="settingsField">{t("Ville / localisation")}<input maxLength={90} value={prefs.city} onChange={e=>setPrefs(v=>({...v,city:e.target.value}))} placeholder={t("Nouakchott · MR")} aria-label="Ville de l'entreprise"/></label>
   <div className="settingsHint"><Check size={15}/> {t("Modifications enregistrées automatiquement dans ce navigateur.")}</div>
  </section>
  <section className="settingsCard">
   <div className="settingsCardHead"><span className="settingsIcon"><EyeOff size={21}/></span><div><h3>{t("Confidentialité d'affichage")}</h3><p>{t("Pour les écrans visibles par d'autres personnes")}</p></div></div>
   <label className="settingsSwitchRow"><span><strong>{t("Masquer les numéros")}</strong><small>{t("Masquer les téléphones dans le registre et le tableau de bord.")}</small></span><input type="checkbox" role="switch" checked={prefs.maskPhones} onChange={e=>setPrefs(v=>({...v,maskPhones:e.target.checked}))}/></label>
   <div className="settingsPrivacy"><LockKeyhole size={17}/><p>{t("Cette option masque uniquement les numéros à l'écran. Elle ne chiffre pas les données et ne modifie pas l'export CSV.")}</p></div>
  </section>
 </div>
 <section className="settingsCard settingsBackup">
  <div className="settingsCardHead"><span className="settingsIcon"><Database size={21}/></span><div><h3>{t("Sauvegarde et restauration")}</h3><p>{t("Transférez vos données entre deux navigateurs ou appareils")}</p></div></div>
  <div className="settingsBackupSummary"><div><small>{t("LIVREURS ENREGISTRÉS")}</small><strong>{rows.length}</strong></div><div><small>{t("EMPLACEMENT")}</small><strong>{t("Ce navigateur")}</strong></div><div><small>{t("FORMAT")}</small><strong>{t("JSON")}</strong></div></div>
  <div className="settingsActions"><ExcelImporter onImport={importDrivers}/><button className="primary" onClick={exportBackup}><Save size={17}/> {t("Télécharger une sauvegarde")}</button><button className="secondary settingsImportButton" onClick={()=>backupFileRef.current?.click()}><Upload size={17}/> {t("Restaurer une sauvegarde")}</button><input ref={backupFileRef} type="file" accept=".json,application/json" className="settingsFileInput" onChange={importBackup} aria-label="Importer une sauvegarde PRESTO"/></div>
  <p className="settingsFinePrint">{t("Attention : le fichier JSON contient les noms et numéros saisis en clair. Conservez-le dans un endroit sécurisé et ne le partagez pas publiquement.")}</p>
 </section>
 <section className="settingsCard settingsReset">
  <div className="settingsCardHead"><span className="settingsIcon dangerIcon"><AlertTriangle size={21}/></span><div><h3>{t("Zone de réinitialisation")}</h3><p>{t("Cette action retire tous les livreurs de cet appareil.")}</p></div></div>
  <button className="settingsDangerButton" onClick={resetDrivers}><RefreshCw size={17}/> {t("Remettre tous les compteurs à zéro")}</button>
 </section>
 {settingsMessage&&<div className="settingsFeedback" role="status">{settingsMessage}<button onClick={()=>setSettingsMessage('')} aria-label="Fermer le message"><X size={16}/></button></div>}

 </div>}</main></div>{selectedDriver&&<DriverProfile key={selectedDriver.id} driver={selectedDriver} onClose={()=>setSelectedDriverId(null)} onSave={updated=>setRows(v=>v.map(x=>x.id===updated.id?updated:x))} maskPhone={prefs.maskPhones}/>}{dialog&&editing&&<div className="modalWrap" onClick={e=>{if(e.target===e.currentTarget)setDialog(false)}}><section className="modal"><div className="modalHead"><h2>{rows.some(x=>x.id===editing.id)?t('Modifier un livreur'):t('Ajouter un livreur')}</h2><button onClick={()=>setDialog(false)}><X size={20}/></button></div><div className="modalBody"><label>{t("Nom du livreur")}<input autoFocus value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})}/></label><label>{t("Téléphone (stockage local uniquement)")}<input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})}/></label><label>{t("Date de remise")}<input value={editing.deliveryDate||''} onChange={e=>setEditing({...editing,deliveryDate:e.target.value})} placeholder={t("JJ/MM/AAAA")}/></label><label>{t("Observations")}<input value={editing.observations||''} onChange={e=>setEditing({...editing,observations:e.target.value})} maxLength={1000}/></label><div className="checks">{[['bag','Sac remis'],['shirt','Chemise remise'],['verified','Dossier vérifié']].map(([k,label])=><label key={k}><input type="checkbox" checked={Boolean(editing[k as 'bag'|'shirt'|'verified'])} onChange={e=>setEditing({...editing,[k]:e.target.checked})}/>{label}</label>)}</div><h3>{t("Mobile Money")}</h3><div className="checks">{methods.map(([k,label])=><label key={k}><input type="checkbox" checked={editing.payments[k]} onChange={e=>setEditing({...editing,payments:{...editing.payments,[k]:e.target.checked}})}/>{label}</label>)}</div><div className="quickAccountGrid">{methods.map(([k,label])=><label key={k}><span>{label} — {language==='ar'?'رقم الحساب':'Numéro du compte'}</span><input dir="ltr" inputMode="tel" maxLength={80} value={editing.paymentNumbers?.[k]||''} placeholder={language==='ar'?'رقم مستقل لهذه الخدمة':'Numéro propre à ce service'} onChange={e=>setEditing({...editing,paymentNumbers:{...editing.paymentNumbers,[k]:e.target.value},payments:{...editing.payments,[k]:e.target.value.trim()?true:editing.payments[k]}})}/></label>)}</div></div><div className="modalActions"><button className="secondary" onClick={()=>setDialog(false)}>{t("Annuler")}</button><button className="primary" disabled={!editing.name.trim()} onClick={save}><Check size={17}/> {t("Enregistrer")}</button></div></section></div>}</div>;
}
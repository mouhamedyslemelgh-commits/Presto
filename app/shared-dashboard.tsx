// @ts-nocheck
'use client';
import {useCallback,useEffect,useState} from 'react';
import {prestoCloud} from '../lib/presto-cloud';
import {LayoutDashboard,Users,Package,Wallet,ChartNoAxesColumn,Settings,ArrowUpRight,Download,Plus,Search,Edit3,Trash2,Menu,X,Check,ShieldAlert,LogIn,LogOut,RefreshCw} from 'lucide-react';
type Pay='bankily'|'masrvi'|'sedad'|'click';
type Row={id:number;name:string;phone:string;bag:boolean;shirt:boolean;verified:boolean;bankily:boolean;masrvi:boolean;sedad:boolean;click:boolean};
type View='dashboard'|'drivers'|'equipment'|'mobile'|'reports'|'settings';
const pays:[Pay,string,string,string][]=[['bankily','Bankily','BPM','#228e99'],['masrvi','Masrvi','BMCI','#6949a7'],['sedad','Sedad','BMI','#22966a'],['click','CLICK','BNM','#2480a9']];
const menus:[View,string,typeof Users][]=[['dashboard',"Vue d’ensemble",LayoutDashboard],['drivers','Livreurs',Users],['equipment','Équipements',Package],['mobile','Mobile Money',Wallet],['reports','Rapports',ChartNoAxesColumn],['settings','Paramètres',Settings]];
const emptyRow=():Row=>({id:0,name:'',phone:'',bag:false,shirt:false,verified:false,bankily:false,masrvi:false,sedad:false,click:false});
const hasPay=(d:Row)=>d.bankily||d.masrvi||d.sedad||d.click;
const complete=(d:Row)=>d.bag&&d.shirt&&d.verified&&hasPay(d);
const mask=(e:unknown)=>String(e??'').replaceAll('"','""');
function downloadCSV(data:Row[]){
 const cols=['N°','Livreur','Téléphone','Sac','Chemise','Dossier','Bankily','Masrvi','Sedad','Click','Statut'];
 const body=data.map(d=>[d.id,d.name,d.phone,d.bag?'Oui':'Non',d.shirt?'Oui':'Non',d.verified?'Oui':'Non',...pays.map(([p])=>d[p]?'Oui':'Non'),complete(d)?'Complet':'À relancer']);
 const text='\uFEFF'+[cols,...body].map(row=>row.map(value=>'"'+mask(value)+'"').join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='PRESTO-livreurs.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function SharedDashboard(){
 const [rows,setRows]=useState<Row[]>([]),[view,setView]=useState<View>('dashboard'),[openMenu,setOpenMenu]=useState(false);
 const [loading,setLoading]=useState(true),[msg,setMsg]=useState(''),[search,setSearch]=useState(''),[editing,setEditing]=useState<Row|null>(null);
 const [userId,setUserId]=useState<string|null>(null),[admin,setAdmin]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[company,setCompany]=useState('PRESTO'),[city,setCity]=useState('Nouakchott · MR');
 const load=useCallback(async()=>{
  if(!prestoCloud)return;
  const all:Row[]=[];
  for(let i=0;i<10000;i+=1000){
   const {data,error}=await prestoCloud.from('presto_drivers').select('id,name,phone,bag,shirt,verified,bankily,masrvi,sedad,click').order('id',{ascending:true}).range(i,i+999);
   if(error){setMsg('Erreur de synchronisation : '+error.message);setLoading(false);return;}
   const chunk=(data??[]) as Row[];all.push(...chunk);
   if(chunk.length<1000)break;
  }
  setRows(all);setLoading(false);setMsg('');
 },[]);
 useEffect(()=>{
  if(!prestoCloud)return;
  let active=true;
  void load();
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
 const mutate=async(job:()=>PromiseLike<{error:{message:string}|null}>)=>{
  if(!admin){setMsg('Connexion administrateur obligatoire pour modifier les données.');return;}
  try{const {error}=await job();if(error){setMsg('Échec de sauvegarde : '+error.message);return;}await load();}catch(e){setMsg('Impossible de contacter la base partagée.')}
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
 const logout=async()=>{if(!prestoCloud)return;await prestoCloud.auth.signOut();setAdmin(false);setUserId(null);setMsg('Déconnecté.')};
 const saveProfile=async()=>{
  if(!prestoCloud||!admin||!company.trim()||!city.trim())return;
  await mutate(()=>prestoCloud.from('presto_profile').update({company:company.trim(),city:city.trim()}).eq('id',1));
 };
 const totals={all:rows.length,bags:rows.filter(x=>x.bag).length,shirts:rows.filter(x=>x.shirt).length,complete:rows.filter(complete).length,missing:rows.filter(x=>!hasPay(x)).length};
 const count=(key:Pay)=>rows.filter(x=>x[key]).length;
 const pct=(v:number)=>totals.all?Math.round(v/totals.all*1000)/10:0;
 const filtered=rows.filter(d=>[d.name,d.phone,d.id].join(' ').toLowerCase().includes(search.toLowerCase()));
 const go=(v:View)=>{setView(v);setOpenMenu(false);setSearch('')};
 const table=(items:Row[],preview=false)=> <div className="tableOverflow"><table><thead><tr><th>N°</th><th>LIVREUR</th><th>TÉLÉPHONE</th><th>SAC / CHEMISE</th><th>COMPTES</th><th>STATUT</th>{!preview&&admin&&<th>ACTIONS</th>}</tr></thead><tbody>{items.length===0?<tr><td className="empty" colSpan={7}>Aucun livreur enregistré</td></tr>:items.map(d=><tr key={d.id}><td className="num">{d.id}</td><td className="name">{d.name}</td><td className="muted">{d.phone||'—'}</td><td>{d.bag?'Oui':'Non'} / {d.shirt?'Oui':'Non'}</td><td className="num">{Number(d.bankily)+Number(d.masrvi)+Number(d.sedad)+Number(d.click)}</td><td><span className={'status '+(complete(d)?'good':'bad')}>{complete(d)?'✓ Complet':'! À relancer'}</span></td>{!preview&&admin&&<td><button className="smallBtn" onClick={()=>setEditing({...d})} title="Modifier"><Edit3 size={16}/></button><button className="smallBtn" onClick={()=>void del(d.id)} title="Supprimer"><Trash2 size={16}/></button></td>}</tr>)}</tbody></table></div>;
 const titles:Record<View,string>={dashboard:'Pilotage des livreurs',drivers:'Registre des livreurs',equipment:'Suivi des équipements',mobile:'Comptes Mobile Money',reports:'Rapports & analyses',settings:'Paramètres'};
 return <div className="shell">
  <aside className={'sidebar '+(openMenu?'open':'')}><div className="brand"><div className="brandImageFrame"><img src="/logos/presto.webp" alt="PRESTO بريستو" width={310} height={170}/></div><span className="brandSub">OPERATIONS · LIVREURS</span></div><div className="sideCaption">ESPACE DE TRAVAIL</div><nav>{menus.map(([v,title,Icon])=><button key={v} className={view===v?'selected':''} onClick={()=>go(v)}><Icon size={17}/>{title}</button>)}</nav><div className="sideFoot"><small>BASE PARTAGÉE</small><strong>{city}</strong><small>{company} · Cloud Sync</small></div></aside>
  {openMenu&&<div className="shade" onClick={()=>setOpenMenu(false)}/>}
  <div className="workspace"><header className="topbar"><button className="menuButton" onClick={()=>setOpenMenu(x=>!x)} aria-label="Ouvrir la navigation"><Menu size={20}/></button><img className="mobileBrandLogo" src="/logos/presto.webp" alt="PRESTO" width={80} height={48}/><div>Opérations / <b>Tableau de bord</b></div><div className="topRight"><span className="date">Données partagées</span><span className="avatar">OP</span></div></header>
  <main><div className="pageHead"><div><h1>{titles[view]}</h1><p>Informations synchronisées entre tous les visiteurs · {loading?'Chargement...':'Actualisées automatiquement'}</p></div><div className="headActions">{view==='drivers'&&admin&&<button className="primary" onClick={()=>setEditing(emptyRow())}><Plus size={16}/> Nouveau livreur</button>}<button className="primary" onClick={()=>downloadCSV(rows)}><Download size={16}/> Exporter</button></div></div>
  {msg&&<div className="syncNotice" role="status">{msg}<button onClick={()=>setMsg('')} aria-label="Fermer"><X size={15}/></button></div>}
  {view==='dashboard'&&<><div className="statGrid">{[['LIVREURS',totals.all,'+ Total enregistré','orange'],['SACS REMIS',totals.bags,pct(totals.bags)+' % de remise','blue'],['CHEMISES',totals.shirts,pct(totals.shirts)+' % distribuées','cyan'],['DOSSIERS COMPLETS',totals.complete,pct(totals.complete)+' % des livreurs','green']].map(s=><div className={'stat '+s[3]} key={s[0]}><small>{s[0]}</small><div><strong>{s[1]}</strong><span><ArrowUpRight size={22}/></span></div><p>{s[2]}</p></div>)}</div><div className="sectionHeading"><h2>MOYENS DE PAIEMENT</h2><small>Comptes enregistrés</small></div><div className="paymentGrid">{pays.map(([k,name,bank,color])=><button className="payment" key={k} onClick={()=>go('mobile')} style={{'--c':color} as React.CSSProperties}><div className="paymentHeader"><span className="paymentLogo"><img src={'/logos/'+k+'.webp'} alt={name} width={54} height={54}/></span><div><b>{name}</b><small>{bank}</small></div><strong>{count(k)}</strong></div><div className="track"><div style={{width:pct(count(k))+'%'}}/></div></button>)}</div><div className="bottomGrid"><section className="panel register"><div className="panelTitle"><div><h2>Registre des remises</h2><p>Les cinq derniers livreurs</p></div><button className="secondary" onClick={()=>go('drivers')}>Voir le registre</button></div>{table(rows.slice(-5).reverse(),true)}</section><aside className="attention"><small>POINT D’ATTENTION</small><strong>{totals.missing}</strong><span>sans mobile money</span><hr/><h3>Priorité opérationnelle</h3><p>Relancer les livreurs sans compte actif.</p><button onClick={()=>go('drivers')}>Voir les dossiers à relancer <ArrowUpRight size={15}/></button></aside></div></>}
  {view==='drivers'&&<section className="panel fullTable"><div className="panelTitle"><div><h2>Registre des livreurs</h2><p>{totals.all} livreurs · Lecture publique, modification réservée aux administrateurs</p></div></div><div className="controls"><label><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un livreur"/></label></div>{table(filtered)}{!admin&&<p className="cloudFootnote">Pour ajouter ou modifier des livreurs, connectez-vous comme administrateur dans Paramètres.</p>}</section>}
  {view==='equipment'&&<section className="panel fullTable"><div className="panelTitle"><div><h2>Distribution des équipements</h2><p>Modification réservée à l'administration</p></div></div><div className="tableOverflow"><table><thead><tr><th>LIVREUR</th><th>SAC</th><th>CHEMISE</th><th>DOSSIER VÉRIFIÉ</th></tr></thead><tbody>{rows.length===0?<tr><td className="empty" colSpan={4}>Aucun livreur enregistré</td></tr>:rows.map(d=><tr key={d.id}><td className="name">{d.name}</td>{(['bag','shirt','verified'] as const).map(k=><td key={k}><input type="checkbox" disabled={!admin} checked={d[k]} onChange={e=>void setFlag(d.id,k,e.target.checked)} aria-label={k+' '+d.name}/></td>)}</tr>)}</tbody></table></div></section>}
  {view==='mobile'&&<section className="panel fullTable"><div className="panelTitle"><div><h2>Comptes Mobile Money</h2><p>Bankily, Masrvi, Sedad et CLICK</p></div></div><div className="tableOverflow"><table><thead><tr><th>LIVREUR</th>{pays.map(([key,label])=><th key={key}>{label.toUpperCase()}</th>)}</tr></thead><tbody>{rows.length===0?<tr><td className="empty" colSpan={5}>Aucun compte enregistré</td></tr>:rows.map(d=><tr key={d.id}><td className="name">{d.name}</td>{pays.map(([key])=><td key={key}><input type="checkbox" disabled={!admin} checked={d[key]} onChange={e=>void setFlag(d.id,key,e.target.checked)} aria-label={key+' '+d.name}/></td>)}</tr>)}</tbody></table></div></section>}
  {view==='reports'&&<section className="panel report"><h2>Rapports partagés</h2>{[['Sacs remis',totals.bags],['Chemises',totals.shirts],['Dossiers complets',totals.complete],['Mobile Money actif',totals.all-totals.missing]].map(([label,n])=><div className="reportLine" key={label}><div><b>{label}</b><span>{pct(Number(n))}%</span></div><div className="track"><div style={{width:pct(Number(n))+'%'}}/></div></div>)}<button className="primary" onClick={()=>downloadCSV(rows)}><Download size={17}/> Exporter le registre</button></section>}
  {view==='settings'&&<div className="settingsPage"><section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><Settings size={20}/></span><div><h3>Connexion administrateur</h3><p>Seules les personnes autorisées peuvent modifier ou supprimer les informations.</p></div></div>{admin?<div className="adminStatus"><Check size={18}/> Session administrateur active <button className="secondary" onClick={()=>void logout()}><LogOut size={16}/> Déconnexion</button></div>:<div className="adminLogin"><label>Adresse e-mail<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mot de passe<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" onClick={()=>void login()}><LogIn size={17}/> Se connecter</button><p>Le compte doit être autorisé dans la base Supabase PRESTO.</p></div>}{userId&&!admin&&<p className="cloudFootnote">Compte connecté, mais autorisation administrateur absente.</p>}</section>
  <section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><Settings size={20}/></span><div><h3>Informations de l'entreprise</h3><p>Ces données sont partagées entre les visiteurs.</p></div></div><label className="settingsField">Entreprise<input value={company} disabled={!admin} maxLength={70} onChange={e=>setCompany(e.target.value)}/></label><label className="settingsField">Ville<input value={city} disabled={!admin} maxLength={90} onChange={e=>setCity(e.target.value)}/></label>{admin&&<button className="primary" onClick={()=>void saveProfile()}>Enregistrer le profil</button>}</section>
  <section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><ShieldAlert size={20}/></span><div><h3>Confidentialité et accès</h3><p>Le site est public en lecture. Les visiteurs peuvent voir toutes les informations, y compris les numéros de téléphone.</p></div></div><p className="cloudFootnote">Ne saisissez pas de données personnelles sans autorisation des personnes concernées. Les modifications sont conservées dans la base jusqu'à leur suppression par un administrateur.</p></section>
  <section className="settingsCard"><div className="settingsCardHead"><span className="settingsIcon"><RefreshCw size={20}/></span><div><h3>Effacer le registre partagé</h3><p>Cette action supprime les fiches pour tous les visiteurs.</p></div></div><button className="settingsDangerButton" disabled={!admin} onClick={()=>{if(!prestoCloud||!window.confirm('Effacer TOUS les livreurs pour TOUS les visiteurs ?'))return;void mutate(()=>prestoCloud.from('presto_drivers').delete().gte('id',1))}}><Trash2 size={16}/> Supprimer tous les livreurs</button></section></div>}
  <footer>PRESTO · DONNÉES SYNCHRONISÉES · {loading?'CHARGEMENT':'SUPABASE CLOUD'}</footer></main></div>
  {editing&&admin&&<div className="modalWrap" onClick={e=>{if(e.target===e.currentTarget)setEditing(null)}}><section className="modal"><div className="modalHead"><h2>{editing.id?'Modifier':'Ajouter'} un livreur</h2><button onClick={()=>setEditing(null)}><X size={19}/></button></div><div className="modalBody"><label>Nom du livreur<input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} maxLength={100}/></label><label>Téléphone<input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} maxLength={30}/></label><div className="checks">{(['bag','shirt','verified'] as const).map(k=><label key={k}><input type="checkbox" checked={editing[k]} onChange={e=>setEditing({...editing,[k]:e.target.checked})}/>{k==='bag'?'Sac remis':k==='shirt'?'Chemise remise':'Dossier vérifié'}</label>)}</div><h3>Mobile Money</h3><div className="checks">{pays.map(([k,label])=><label key={k}><input type="checkbox" checked={editing[k]} onChange={e=>setEditing({...editing,[k]:e.target.checked})}/>{label}</label>)}</div></div><div className="modalActions"><button className="secondary" onClick={()=>setEditing(null)}>Annuler</button><button className="primary" disabled={!editing.name.trim()} onClick={()=>void save()}><Check size={17}/> Enregistrer</button></div></section></div>}
 </div>;
}

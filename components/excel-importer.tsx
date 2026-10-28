'use client';
import {useRef,useState} from 'react';
import readExcelFile from 'read-excel-file/browser';
import {useLanguage} from './presto-language';
import {FileSpreadsheet,Upload,X,CheckCircle2,AlertTriangle} from 'lucide-react';
import {parsePrestoSheet,type ImportedDriver,type ImportMode,type SheetData,type ParsedImport} from '../lib/presto-excel';
type Result={added:number;updated:number;skipped:number};
type Props={onImport:(drivers:ImportedDriver[],mode:ImportMode)=>Promise<Result>;disabled?:boolean;publicSite?:boolean};
export default function ExcelImporter({onImport,disabled=false,publicSite=false}:Props){
 const {t}=useLanguage();
 const fileRef=useRef<HTMLInputElement>(null);
 const [sheets,setSheets]=useState<SheetData[]>([]);
 const [index,setIndex]=useState(0);
 const [preview,setPreview]=useState<ParsedImport|null>(null);
 const [fileName,setFileName]=useState('');
 const [mode,setMode]=useState<ImportMode>('add');
 const [open,setOpen]=useState(false);
 const [working,setWorking]=useState(false);
 const [error,setError]=useState('');
 const [result,setResult]=useState<Result|null>(null);
 const selectSheet=(data:SheetData[],next:number)=>{
  setIndex(next);setError('');setResult(null);
  try{setPreview(parsePrestoSheet(data[next].data));}catch(e){setPreview(null);setError(e instanceof Error?e.message:'Impossible de détecter les colonnes.');}
 };
 const load=async(event:React.ChangeEvent<HTMLInputElement>)=>{
  const file=event.target.files?.[0];event.target.value='';
  if(!file)return;
  setWorking(true);setOpen(true);setError('');setResult(null);setFileName(file.name);
  try{
   if(!file.name.toLowerCase().endsWith('.xlsx'))throw Error('Seuls les classeurs .xlsx sont pris en charge. Enregistrez les anciens fichiers .xls en .xlsx.');
   if(file.size>12*1024*1024)throw Error('Fichier trop volumineux (maximum 12 Mo).');
   const parsed=await readExcelFile(file);
   if(!Array.isArray(parsed)||!parsed.length)throw Error('Ce classeur ne contient aucune feuille.');
   const ss=parsed as SheetData[];
   setSheets(ss);
   let chosen=0;for(let i=0;i<ss.length;i++){try{const p=parsePrestoSheet(ss[i].data);if(p.items.length){chosen=i;break;}}catch{}}
   selectSheet(ss,chosen);
  }catch(e){setSheets([]);setPreview(null);setError(e instanceof Error?e.message:'Lecture impossible.');}
  finally{setWorking(false);}
 };
 const commit=async()=>{
  if(!preview?.items.length||working)return;
  setWorking(true);setError('');
  try{const r=await onImport(preview.items,mode);setResult(r);}
  catch(e){setError(e instanceof Error?e.message:'Échec de l’importation.');}
  finally{setWorking(false);}
 };
 return <>
 <input ref={fileRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e=>void load(e)} style={{display:'none'}} aria-label="Choisir un fichier Excel"/>
 <button className="secondary excelImportButton" type="button" disabled={disabled} onClick={()=>fileRef.current?.click()}><FileSpreadsheet size={17}/> {t("Importer Excel")}</button>
 {open&&<div className="excelModalWrap" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!working)setOpen(false)}}>
 <section className="excelModal" role="dialog" aria-modal="true" aria-label="Importer un fichier Excel">
 <div className="excelModalHeader"><div><h2><FileSpreadsheet size={23}/> {t("Importer des livreurs depuis Excel")}</h2><p>{fileName||t('Fichier Excel')}</p></div><button onClick={()=>setOpen(false)} disabled={working} aria-label="Fermer"><X size={20}/></button></div>
 <div className="excelModalBody">
 {working&&!result&&<p className="excelBusy">{t("Lecture ou enregistrement du classeur en cours...")}</p>}
 {sheets.length>1&&<label className="excelSheetSelector">{t("Feuille à importer")} <select value={index} disabled={working} onChange={e=>selectSheet(sheets,Number(e.target.value))}>{sheets.map((s,i)=><option value={i} key={i}>{s.sheet}</option>)}</select></label>}
 {preview&&<>
  <div className="excelStats"><div><strong>{preview.items.length}</strong><span>{t("Livreurs détectés")}</span></div><div><strong>{preview.skipped}</strong><span>{t("Lignes ignorées")}</span></div><div><strong>{preview.headerRow}</strong><span>{t("Ligne d’en-tête")}</span></div></div>
  <p className="excelDetected">{t('Colonnes reconnues')} : {preview.columns.join(' · ')}</p>
  <div className="tableOverflow"><table><thead><tr><th>{t("LIVREUR")}</th><th>{t("TÉLÉPHONE")}</th><th>{t("SAC")}</th><th>{t("CHEMISE")}</th><th>{t("BANKILY")}</th><th>{t("MASRVI")}</th><th>{t("SEDAD")}</th><th>{t("CLICK")}</th></tr></thead><tbody>{preview.items.slice(0,8).map((d,i)=><tr key={i}><td className="name">{d.name}</td><td>{d.phone||'—'}</td><td>{d.bag?t('Oui'):t('Non')}</td><td>{d.shirt?t('Oui'):t('Non')}</td>{(['bankily','masrvi','sedad','click'] as const).map(k=><td key={k}>{d.accounts[k]|| (d.payments[k]?'Oui':'—')}</td>)}</tr>)}</tbody></table></div>
  <p className="excelDetected">Aperçu des 8 premières lignes ; la date de remise et les observations sont également importées.</p>
  <div className="excelMode"><label><input type="radio" name="excel-mode" checked={mode==='add'} onChange={()=>setMode('add')}/> {t("Ajouter seulement les nouveaux livreurs")}</label><label><input type="radio" name="excel-mode" checked={mode==='merge'} onChange={()=>setMode('merge')}/> {t("Mettre à jour aussi les livreurs existants (téléphone ou nom)")}</label></div>
  {preview.warnings.length>0&&<div className="excelWarnings"><AlertTriangle size={17}/><div>{preview.warnings.slice(0,6).map((w,i)=><p key={i}>{w}</p>)}</div></div>}
  {publicSite&&<div className="excelWarnings"><AlertTriangle size={17}/><div><p>{t("Attention : les noms, téléphones et numéros de comptes importés pourront être consultés par les personnes ayant accès au site partagé.")}</p></div></div>}
 </>}
 {error&&<div className="excelError" role="alert">{error}</div>}
 {result&&<div className="excelSuccess" role="status"><CheckCircle2 size={19}/> {t('Importation terminée')} : {result.added} {t('ajoutés')}, {result.updated} {t('mis à jour')}, {result.skipped} {t('ignorés')}.</div>}
 </div>
 <div className="excelModalFooter"><button className="secondary" onClick={()=>setOpen(false)} disabled={working}>{t("Fermer")}</button><button className="primary" disabled={working||!preview?.items.length||Boolean(result)} onClick={()=>void commit()}><Upload size={16}/> {t('Importer')} {preview?.items.length??0} {t('Livreurs')}</button></div>
 </section></div>}
 </>;
}

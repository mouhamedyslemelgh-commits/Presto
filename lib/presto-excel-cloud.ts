'use client';
import {prestoCloud} from './presto-cloud';
import {createPrestoExcelBytes,type ExportDriver} from './presto-excel-export';

/**
 * The database is the durable source of truth.
 * Every successful admin mutation triggers an XLSX snapshot to a private storage bucket.
 * Browser/localStorage data is not used as the source of the workbook.
 */
export const PRESTO_EXCEL_BUCKET='presto-excel';
export const PRESTO_EXCEL_FILE='LIVREUR_Presto_v2.xlsx';
const MIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
type DbDriver={
 id:number;name:string;phone:string;bag:boolean;shirt:boolean;verified:boolean;
 bankily:boolean;masrvi:boolean;sedad:boolean;click:boolean;
 bankily_account:string;masrvi_account:string;sedad_account:string;click_account:string;
 delivery_date:string;observations:string;
};
let pending:Promise<{drivers:number;path:string;timestamp:string}>|null=null;
export async function savePrestoExcelSnapshot(company='PRESTO'){
 if(!prestoCloud)throw Error('La base PRESTO n’est pas configurée.');
 // Serialize same-device saves to avoid uploading an older file after a newer edit.
 if(pending)await pending.catch(()=>undefined);
 const run=(async()=>{
  const records:DbDriver[]=[];
  for(let start=0;start<10000;start+=1000){
   const {data,error}=await prestoCloud.from('presto_drivers')
    .select('id,name,phone,bag,shirt,verified,bankily,masrvi,sedad,click,bankily_account,masrvi_account,sedad_account,click_account,delivery_date,observations')
    .order('id',{ascending:true}).range(start,start+999);
   if(error)throw Error('Lecture des données impossible : '+error.message);
   const batch=(data||[]) as DbDriver[];
   records.push(...batch);
   if(batch.length<1000)break;
  }
  const mapped:ExportDriver[]=records.map(d=>({
   id:Number(d.id),name:d.name,phone:d.phone||'',bag:d.bag,shirt:d.shirt,verified:d.verified,
   payments:{bankily:d.bankily,masrvi:d.masrvi,sedad:d.sedad,click:d.click},
   paymentNumbers:{bankily:d.bankily_account,masrvi:d.masrvi_account,sedad:d.sedad_account,click:d.click_account},
   deliveryDate:d.delivery_date,observations:d.observations
  }));
  const bytes=await createPrestoExcelBytes(mapped,company);
  if(bytes.byteLength>10*1024*1024)throw Error('La sauvegarde Excel dépasse la limite de stockage (10 Mo).');
  const buffer=new Uint8Array(bytes).buffer as ArrayBuffer;
  const {error}=await prestoCloud.storage.from(PRESTO_EXCEL_BUCKET)
   .upload(PRESTO_EXCEL_FILE,new Blob([buffer],{type:MIME}),{contentType:MIME,cacheControl:'0',upsert:true});
  if(error)throw Error('La sauvegarde Excel n’a pas été mise à jour : '+error.message);
  return {drivers:mapped.length,path:PRESTO_EXCEL_FILE,timestamp:new Date().toISOString()};
 })();
 pending=run;
 try{return await run;}finally{if(pending===run)pending=null;}
}
export async function downloadSavedPrestoExcel(){
 if(!prestoCloud)throw Error('La base PRESTO n’est pas configurée.');
 const {data,error}=await prestoCloud.storage.from(PRESTO_EXCEL_BUCKET).download(PRESTO_EXCEL_FILE);
 if(error||!data)throw Error('Impossible de télécharger le fichier Excel enregistré : '+(error?.message||'introuvable'));
 const url=URL.createObjectURL(data);
 const link=document.createElement('a');link.href=url;link.download=PRESTO_EXCEL_FILE;
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),15000);
}

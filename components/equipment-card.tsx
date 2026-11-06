'use client';
import {useEffect,useRef,useState} from 'react';
import type {ProfileDriver} from './driver-profile';

type Props={driver:ProfileDriver;photo?:string;ar:boolean;maskPhone:boolean};
const wallets=[
 ['bankily','بنكيلي','Bankily'],['sedad','سداد','Sedad'],
 ['masrvi','مصرفي','Masrvi'],['click','كليك','Click']
] as const;

function loadPhoto(url:string):Promise<HTMLImageElement|null>{
 return new Promise(resolve=>{
  const img=new Image();
  img.crossOrigin='anonymous';
  img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=url;
 });
}

export default function EquipmentCard({driver,photo,ar,maskPhone}:Props){
 const ref=useRef<HTMLCanvasElement>(null);
 const [ready,setReady]=useState(false),[error,setError]=useState(false);
 useEffect(()=>{
  let current=true;
  setReady(false);setError(false);
  async function draw(){
   const portrait=await loadPhoto('/images/presto-uniform-rider.webp');
   if(!current)return;
   const canvas=ref.current,ctx=canvas?.getContext('2d');
   if(!canvas||!ctx)return;
   // Draw at print resolution; all positions below are in design pixels.
   ctx.setTransform(3,0,0,3,0,0);
   const rect=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
   const label=(s:string,x:number,y:number,size:number,color:string,width:number,bold=false,align:'left'|'right'='left')=>{
    ctx.font=(bold?'bold ':'')+size+'px Arial, sans-serif';ctx.fillStyle=color;ctx.textAlign=align;
    ctx.direction=/[\u0600-\u06ff]/.test(s)?'rtl':'ltr';ctx.fillText(s,x,y,width);
   };
   const title='#38271f',muted='#835e49';
   rect(0,0,600,402,'#fffaf5');
   const grad=ctx.createLinearGradient(0,0,600,0);grad.addColorStop(0,'#e43809');grad.addColorStop(1,'#ff8a0a');
   ctx.fillStyle=grad;ctx.fillRect(0,0,600,66);
   label('PRESTO',20,32,24,'white',170,true);label('M A U R I T A N I E',21,50,10,'white',175,true);
   label('بطاقة التجهيزات والمحافظ',580,30,18,'white',270,true,'right');
   label('ÉQUIPEMENTS ET COMPTES',580,50,11,'white',260,true,'right');
   rect(20,84,100,115,'#f2e2d4');
   if(portrait){
    const scale=Math.max(100/portrait.width,115/portrait.height);
    ctx.save();ctx.beginPath();ctx.rect(20,84,100,115);ctx.clip();
    ctx.drawImage(portrait,70-portrait.width*scale/2,141.5-portrait.height*scale/2,portrait.width*scale,portrait.height*scale);ctx.restore();
   }else label(driver.name.trim().slice(0,1),64,151,34,muted,48,true);
   label('NOM  /  اسم السائق',140,98,12,muted,430);
   label(driver.name,140,125,23,title,435,true);
   label(maskPhone&&driver.phone?'•••• ••••':driver.phone||'—',140,150,16,title,240);
   const state=(on:boolean)=>ar?(on?'مستلم':'غير مستلم'):(on?'Remis':'Non remis');
   label((ar?'الحقيبة':'Sac')+' · '+state(driver.bag),140,180,15,title,205,true);
   label((ar?'القميص':'Chemise')+' · '+state(driver.shirt),360,180,15,title,220,true);
   wallets.forEach(([key,arabic,french],i)=>{
    const x=20+(i%2)*285,y=211+Math.floor(i/2)*66;
    rect(x,y,275,59,'#f6ece3');
    label(french+' / '+arabic,x+10,y+19,14,muted,254,true);
    const number=driver.paymentNumbers?.[key]?.trim();
    const value=number||(driver.payments[key]?(ar?'نشط · الرقم غير مسجل':'Actif · numéro non renseigné'):(ar?'غير نشط':'Inactif'));
    // Long account lists can span multiple lines without losing digits.
    const chunks=value.match(/.{1,40}/gu)||['—'];
    chunks.forEach((line,j)=>label(line,x+10,y+(chunks.length>1?36:43)+j*16,15,title,253,true));
   });
   rect(0,350,600,52,'#f1e3d7');
   label(driver.city||'PRESTO Mauritanie',20,381,14,muted,200,true);
   label(driver.deliveryDate||'',230,381,14,muted,125);
   label('PRESTO #'+driver.id,580,381,14,title,215,true,'right');
   setReady(true);
  }
  void draw().catch(()=>{if(current)setError(true)});
  return()=>{current=false};
 },[driver,photo,ar,maskPhone]);
 async function download(){
  if(!ref.current||!ready)return;
  try{
   const {jsPDF}=await import('jspdf');
   const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:[150,100.5]});
   pdf.addImage(ref.current.toDataURL('image/png'),'PNG',0,0,150,100.5);
   pdf.save('PRESTO-'+driver.id+'.pdf');setError(false);
  }catch{setError(true)}
 }
 return <section style={{marginBlock:16}}>
  <canvas ref={ref} width={1800} height={1206} style={{width:'100%',height:'auto',borderRadius:14}} aria-label={ar?'بطاقة تجهيزات السائق ومحافظه':'Carte équipements et comptes du livreur'} role="img"/>
  <button type="button" className="driverProfileDone" disabled={!ready} onClick={()=>void download()}>{ar?'تنزيل البطاقة PDF':'Télécharger la carte PDF'}</button>
  {error&&<p role="alert">{ar?'تعذر إنشاء البطاقة. حاول مجددًا.':'Impossible de créer la carte. Réessayez.'}</p>}
 </section>;
}

export function EquipmentCardDialog({onClose,...props}:Props & {onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const element=dialog.current;
  element?.showModal();
  return ()=>element?.close();
 },[]);
 return <dialog ref={dialog} className="standaloneEquipmentCard" dir={props.ar?'rtl':'ltr'} aria-labelledby="equipment-card-title" onCancel={onClose}>
  <header><h2 id="equipment-card-title">{props.ar?'بطاقة تعريف السائق':'Carte du livreur'}</h2>
  <button type="button" autoFocus onClick={onClose}>{props.ar?'إغلاق':'Fermer'}</button></header>
  <EquipmentCard {...props}/>
 </dialog>;
}

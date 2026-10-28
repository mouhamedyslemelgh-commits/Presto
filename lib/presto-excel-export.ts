// @ts-nocheck
'use client';
/**
 * PRESTO Excel export — recreates the two-sheet "LIVREUR_Presto_v2" layout.
 * Uses a freshly generated workbook, not the uploaded example:
 * no historical names or private phone numbers are copied into the site.
 */
export type ExportDriver={
 name:string;phone:string;bag:boolean;shirt:boolean;verified?:boolean;
 payments:{bankily:boolean;masrvi:boolean;sedad:boolean;click:boolean};
 paymentNumbers?:Partial<Record<'bankily'|'masrvi'|'sedad'|'click',string>>;
 deliveryDate?:string;observations?:string
};
type PaymentKey='bankily'|'masrvi'|'sedad'|'click';
const KEYS:PaymentKey[]=['bankily','masrvi','sedad','click'];
const DARK='222222',ORANGE='FF350A',AMBER='FF9300',PAPER='FFF0E9',GREEN='299D65',SOFTGRAY='F8F9FA',BORDER='E5E7EB';
const rgba=(hex:string)=>({argb:'FF'+hex});
function parseDate(text:string|undefined):Date|null{
 const s=(text||'').trim();if(!s)return null;
 let day=0,month=0,year=0;
 let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
 if(m){year=Number(m[1]);month=Number(m[2]);day=Number(m[3]);}
 else {m=s.match(/^(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{4})$/);if(!m)return null;day=Number(m[1]);month=Number(m[2]);year=Number(m[3]);}
 const d=new Date(year,month-1,day);
 return d.getFullYear()===year&&d.getMonth()===month-1&&d.getDate()===day?d:null;
}
const excelDate=(value:Date)=>new Date(value.getFullYear(),value.getMonth(),value.getDate());
function getAccount(d:ExportDriver,key:PaymentKey){
 const number=(d.paymentNumbers?.[key]||'').trim();
 return number || (d.payments[key]?'Oui':null);
}
function activeAccounts(d:ExportDriver){return KEYS.filter(k=>Boolean(getAccount(d,k))).length;}
function exportStatus(d:ExportDriver){
 if(!d.bag||!d.shirt)return '✖ Équipement manquant';
 if(!activeAccounts(d))return '⚠ Mobile money manquant';
 return '✔ Complet';
}
function cellLook(cell:any,opts:{fill?:string;color?:string,bold?:boolean,size?:number,align?:'left'|'center'|'right',wrap?:boolean,border?:boolean,italic?:boolean}={}){
 cell.font={name:'Arial',size:opts.size??11,bold:opts.bold??false,italic:opts.italic??false,color:rgba(opts.color||DARK)};
 cell.alignment={vertical:'middle',horizontal:opts.align||'center',wrapText:opts.wrap??false};
 if(opts.fill)cell.fill={type:'pattern',pattern:'solid',fgColor:rgba(opts.fill)};
 if(opts.border)cell.border={bottom:{style:'hair',color:rgba(BORDER)},right:{style:'hair',color:rgba('F2F3F4')}};
}
function paint(ws:any,row:number,start:number,end:number,opts:Parameters<typeof cellLook>[1]){
 for(let i=start;i<=end;i++)cellLook(ws.getRow(row).getCell(i),opts);
}
function summaryValue(ws:any,cell:string,formula:string,value:number|string,color=ORANGE){
 const x=ws.getCell(cell);x.value={formula,result:value};
 cellLook(x,{fill:PAPER,color,bold:true,size:21,align:'center'});
}
function centerTitle(ws:any,cell:string,text:string,size:number,color='FFFFFF'){
 const x=ws.getCell(cell);x.value=text;
 cellLook(x,{fill:DARK,color,bold:true,size,align:'left'});
}
async function addLogo(wb:any,ws:any){
 try{
  const response=await fetch('/logos/presto.webp',{cache:'force-cache'});
  if(!response.ok)return;
  const bitmap=await createImageBitmap(await response.blob());
  const canvas=document.createElement('canvas');canvas.width=260;canvas.height=115;
  const c=canvas.getContext('2d');if(!c)return;
  c.fillStyle='#ffffff';c.fillRect(0,0,260,115);
  const scale=Math.min(238/bitmap.width,102/bitmap.height);
  const width=bitmap.width*scale,height=bitmap.height*scale;
  c.drawImage(bitmap,(260-width)/2,(115-height)/2,width,height);
  const id=wb.addImage({base64:canvas.toDataURL('image/png'),extension:'png'});
  ws.addImage(id,{tl:{col:.10,row:1.05},ext:{width:125,height:55}});
  bitmap.close();
 }catch{/* Logo must not prevent the workbook from downloading. */}
}
export async function downloadPrestoXlsx(drivers:ExportDriver[],company='PRESTO'){
 const ExcelJS=await import('exceljs');
 const wb=new ExcelJS.Workbook();
 wb.creator='PRESTO | Opérations Livreurs';wb.lastModifiedBy='PRESTO';
 wb.created=new Date();wb.modified=new Date();
 wb.calcProperties.fullCalcOnLoad=true;
 const ws=wb.addWorksheet('Remise équipement',{views:[{state:'frozen',ySplit:11}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0}});
 const d=drivers.slice(0,10000);
 const end=Math.max(311,11+d.length),dataFirst=12;
 const columns=[7,18,30,16,11,13,14,14,14,14,17,30,30];
 columns.forEach((w,i)=>{ws.getColumn(i+1).width=w});
 ws.properties.defaultRowHeight=22;
 ws.getRow(1).height=10;ws.getRow(2).height=27;ws.getRow(3).height=27;ws.getRow(4).height=10;ws.getRow(5).height=8;
 for(let row=1;row<=4;row++)paint(ws,row,1,13,{fill:DARK,color:'FFFFFF'});
 ws.mergeCells('C2:K2');ws.mergeCells('C3:K3');ws.mergeCells('L2:M2');ws.mergeCells('L3:M3');
 centerTitle(ws,'C2','REMISE D’ÉQUIPEMENT — LIVREURS',17);
 ws.getCell('C3').value=(company||'Presto Mauritanie')+' · Nouakchott · Sac, chemise et comptes mobile money';
 cellLook(ws.getCell('C3'),{fill:DARK,color:'B9B9B9',size:9,align:'left'});
 ws.getCell('L2').value='Dernière remise';cellLook(ws.getCell('L2'),{fill:DARK,color:'D1D1D1',size:10,align:'right'});
 const dated=d.map(x=>parseDate(x.deliveryDate)).filter((v):v is Date=>v!==null);
 const last=dated.length?new Date(Math.max(...dated.map(x=>x.getTime()))):null;
 ws.getCell('L3').value=last??'—';cellLook(ws.getCell('L3'),{fill:DARK,color:AMBER,bold:true,size:13,align:'right'});
 if(last)ws.getCell('L3').numFmt='dd/mm/yyyy';
 // Thin orange brand line and KPI cards exactly above the register.
 paint(ws,5,1,13,{fill:'FFFFFF'});
 for(let col=1;col<=13;col++)ws.getRow(5).getCell(col).border={top:{style:'medium',color:rgba(ORANGE)}};
 ws.mergeCells('A6:B6');ws.mergeCells('A7:B7');ws.mergeCells('E6:F6');ws.mergeCells('E7:F7');
 const kpiLabels:{cell:string,label:string}[]=[
  {cell:'A6',label:'LIVREURS'},{cell:'C6',label:'SACS REMIS'},{cell:'D6',label:'CHEMISES REMISES'},
  {cell:'E6',label:'AVEC MOBILE MONEY'},{cell:'G6',label:'BANKILY'},{cell:'H6',label:'MASRVI'},
  {cell:'I6',label:'SEDAD'},{cell:'J6',label:'CLICK'},{cell:'K6',label:'DOSSIERS COMPLETS'},
  {cell:'L6',label:'À RELANCER (SANS MOBILE MONEY)'},{cell:'M6',label:'TÉLÉPHONES EN DOUBLON'}
 ];
 ws.getRow(6).height=27;ws.getRow(7).height=36;
 paint(ws,6,1,13,{fill:PAPER,color:'717171',bold:true,size:9,wrap:true});
 paint(ws,7,1,13,{fill:PAPER,color:ORANGE,bold:true,size:20});
 for(const {cell,label} of kpiLabels){ws.getCell(cell).value=label;cellLook(ws.getCell(cell),{fill:PAPER,color:'717171',bold:true,size:9,wrap:true})}
 const count=(predicate:(x:ExportDriver)=>boolean)=>d.filter(predicate).length;
 const bags=count(x=>x.bag),shirts=count(x=>x.shirt),active=count(x=>activeAccounts(x)>0),complete=count(x=>exportStatus(x)==='✔ Complet');
 const bankCounts=KEYS.map(k=>count(x=>Boolean(getAccount(x,k))));
 const duplicates=(()=>{const counts=new Map<string,number>();for(const x of d){const p=x.phone.replace(/\D/g,'');if(p)counts.set(p,(counts.get(p)||0)+1)}return [...counts.values()].reduce((sum,n)=>sum+(n>1?n:0),0)})();
 const r=(col:string)=>"'Remise équipement'!$"+col+"$12:$"+col+"$"+end;
 summaryValue(ws,'A7','COUNTA('+r('C')+')',d.length);
 summaryValue(ws,'C7','COUNTIF('+r('E')+',"Oui")',bags);
 summaryValue(ws,'D7','COUNTIF('+r('F')+',"Oui")',shirts);
 summaryValue(ws,'E7','COUNTIF('+r('K')+',">0")',active,AMBER);
 (['G','H','I','J'] as const).forEach((c,i)=>summaryValue(ws,c+'7','COUNTA('+r(c)+')',bankCounts[i]));
 summaryValue(ws,'K7','COUNTIF('+r('L')+',"✔ Complet")',complete,GREEN);
 summaryValue(ws,'L7','COUNTIFS('+r('C')+',"<>",'+r('K')+',0)',count(x=>activeAccounts(x)===0));
 summaryValue(ws,'M7','SUMPRODUCT(('+r('D')+'<>"")*(COUNTIF('+r('D')+','+r('D')+')>1))',duplicates,'666666');
 ws.getRow(8).height=7;paint(ws,8,1,13,{fill:'FFFFFF'});
 ws.mergeCells('A9:M9');ws.getRow(9).height=25;
 ws.getCell('A9').value='Saisie : une ligne par livreur. Date = jj/mm/aaaa (Ctrl+; = aujourd’hui) · Sac / Chemise = liste Oui / Non · Mobile money = numéro du compte (8 chiffres), vide si aucun. N°, Comptes MM et Statut sont calculés (complet = sac + chemise + au moins un compte mobile money). Orange sur le téléphone = doublon.';
 cellLook(ws.getCell('A9'),{color:'818181',fill:'FAFAFA',italic:true,size:9,align:'left'});
 ws.getRow(10).height=7;paint(ws,10,1,13,{fill:'FFFFFF'});
 const headers=['N°','Date de remise','Livreur','Téléphone','Sac','Chemise','Bankily','Masrvi','Sedad','Click','Comptes MM','Statut','Observations'];
 ws.getRow(11).height=31;
 headers.forEach((h,i)=>{const col=i+1;const fill=col>=7&&col<=10?AMBER:col===12?ORANGE:DARK;const c=ws.getRow(11).getCell(col);c.value=h;cellLook(c,{fill,color:'FFFFFF',bold:true,size:10,wrap:true})});
 for(let i=0;i<end-11;i++){
  const row=i+12,driver=d[i],r=ws.getRow(row);
  r.height=22;
  const bg=i%2===0?'FFFFFF':SOFTGRAY;
  for(let col=1;col<=13;col++)cellLook(r.getCell(col),{fill:bg,color:'434343',size:10,border:true,align:col===3||col===13?'left':'center'});
  const c=(n:number)=>r.getCell(n);
  c(1).value={formula:'IF(C'+row+'="","",ROW()-11)',result:driver?i+1:''};
  c(11).value={formula:'IF(C'+row+'="","",COUNTA(G'+row+':J'+row+'))',result:driver?activeAccounts(driver):''};
  c(12).value={formula:'IF(C'+row+'="","",IF(OR(E'+row+'<>"Oui",F'+row+'<>"Oui"),"✖ Équipement manquant",IF(K'+row+'=0,"⚠ Mobile money manquant","✔ Complet")))',result:driver?exportStatus(driver):''};
  if(!driver)continue;
  const date=parseDate(driver.deliveryDate);
  c(2).value=date?excelDate(date):null;c(2).numFmt='dd/mm/yyyy';
  c(3).value=driver.name;c(3).alignment={horizontal:'left',vertical:'middle',wrapText:true};
  c(4).value=driver.phone||null;c(4).numFmt='@';
  c(5).value=driver.bag?'Oui':'Non';c(6).value=driver.shirt?'Oui':'Non';
  KEYS.forEach((k,p)=>{c(7+p).value=getAccount(driver,k);c(7+p).numFmt='@'});
  c(13).value=driver.observations||null;
  c(12).font={name:'Arial',size:10,bold:true,color:rgba(exportStatus(driver)==='✔ Complet'?GREEN:exportStatus(driver).startsWith('⚠')?'9C6B19':ORANGE)};
 }
 ws.dataValidations.add('E12:F'+end,{type:'list',allowBlank:true,formulae:['"Oui,Non"'],showErrorMessage:true,error:'Choisir Oui ou Non'});
 ws.autoFilter={from:{row:11,column:1},to:{row:end,column:13}};
 ws.pageSetup.printTitlesRow='11:11';
 ws.pageSetup.printArea='A1:M'+end;
 // Daily summary sheet, same tab title, six columns and black-orange header.
 const daily=wb.addWorksheet('Synthèse par jour',{views:[{state:'frozen',ySplit:3}]});
 [18,18,18,21,23,24].forEach((width,i)=>{daily.getColumn(i+1).width=width});
 daily.mergeCells('A1:F1');daily.getRow(1).height=42;
 daily.getCell('A1').value='SYNTHÈSE PAR JOUR DE REMISE';
 cellLook(daily.getCell('A1'),{fill:DARK,color:'FFFFFF',bold:true,size:19,align:'left'});
 for(let i=1;i<=6;i++)daily.getRow(1).getCell(i).fill={type:'pattern',pattern:'solid',fgColor:rgba(DARK)};
 daily.getRow(2).height=17;
 for(let i=1;i<=6;i++)daily.getRow(2).getCell(i).border={top:{style:'medium',color:rgba(ORANGE)}};
 const dailyHeaders=['Date','Livreurs','Sacs remis','Chemises remises','Avec mobile money','Dossiers complets'];
 daily.getRow(3).height=35;
 dailyHeaders.forEach((h,i)=>{const c=daily.getRow(3).getCell(i+1);c.value=h;cellLook(c,{fill:i===0?ORANGE:DARK,color:'FFFFFF',bold:true,size:11})});
 const sortedDates=[...new Set(dated.map(x=>x.toISOString().slice(0,10)))].sort();
 const limit=Math.max(44,sortedDates.length+3);
 for(let row=4;row<=limit;row++){
  const x=daily.getRow(row);x.height=21;
  for(let i=1;i<=6;i++)cellLook(x.getCell(i),{fill:row%2===0?'FFFFFF':SOFTGRAY,color:'444444',size:10,border:true});
  const dayKey=sortedDates[row-4];if(!dayKey)continue;
  const jsDate=parseDate(dayKey)!;x.getCell(1).value=jsDate;x.getCell(1).numFmt='dd/mm/yyyy';
  const relevant=d.filter(v=>parseDate(v.deliveryDate)?.toISOString().slice(0,10)===dayKey);
  const result=[relevant.length,relevant.filter(z=>z.bag).length,relevant.filter(z=>z.shirt).length,relevant.filter(z=>activeAccounts(z)>0).length,relevant.filter(z=>exportStatus(z)==='✔ Complet').length];
  for(let k=0;k<5;k++){
   const col=k+2;
   const area="'Remise équipement'!$B$12:$B$"+end;
   let formula='COUNTIF('+area+',A'+row+')';
   if(k===1)formula='COUNTIFS('+area+',A'+row+','+r('E')+',"Oui")';
   if(k===2)formula='COUNTIFS('+area+',A'+row+','+r('F')+',"Oui")';
   if(k===3)formula='COUNTIFS('+area+',A'+row+','+r('K')+',">0")';
   if(k===4)formula='COUNTIFS('+area+',A'+row+','+r('L')+',"✔ Complet")';
   x.getCell(col).value={formula,result:result[k]};
  }
 }
 daily.pageSetup={paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0};
 await addLogo(wb,ws);
 const out=await wb.xlsx.writeBuffer();
 const url=URL.createObjectURL(new Blob([new Uint8Array(out)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
 const a=document.createElement('a');a.href=url;a.download='LIVREUR_Presto_v2.xlsx';document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),15000);
}

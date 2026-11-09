'use client';
import ExcelJS from 'exceljs';
export type RegisteredDriver={id:number;name:string;phone:string;city:string;vehicle_type:string;app_code:string;license_plate?:string;driver_photo_path:string;vehicle_photo_path:string;observations:string};
export async function downloadRegisteredDriversExcel(rows:RegisteredDriver[],company='PRESTO',suffix=''){
 const wb=new ExcelJS.Workbook();wb.creator='PRESTO';const ws=wb.addWorksheet('Livreurs et véhicules',{views:[{state:'frozen',ySplit:7}],pageSetup:{orientation:'landscape',fitToPage:true,fitToWidth:1}});
 ws.columns=[{width:10},{width:29},{width:20},{width:23},{width:24},{width:22},{width:22},{width:28},{width:28},{width:38}];
 ws.mergeCells('A1:J2');const title=ws.getCell('A1');title.value='PRESTO  |  LIVREURS ET VÉHICULES';title.font={name:'Arial',bold:true,size:19,color:{argb:'FFFFFFFF'}};title.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF172335'}};title.alignment={vertical:'middle',horizontal:'center'};ws.getRow(1).height=30;ws.getRow(2).height=25;
 ws.mergeCells('A3:J3');const subtitle=ws.getCell('A3');subtitle.value=company+' · Registre officiel · '+new Date().toLocaleDateString('fr-FR');subtitle.font={name:'Arial',size:11,color:{argb:'FF334155'}};subtitle.alignment={horizontal:'center'};ws.getRow(3).height=27;
 ws.mergeCells('A4:E5');ws.getCell('A4').value='LIVREURS ENREGISTRÉS : '+rows.length;ws.getCell('A4').font={bold:true,size:15,color:{argb:'FFEF653A'}};ws.getCell('A4').alignment={vertical:'middle'};
 ws.mergeCells('F4:J5');ws.getCell('F4').value='VÉHICULES RENSEIGNÉS : '+rows.filter(r=>r.vehicle_type?.trim()).length;ws.getCell('F4').font={bold:true,size:15,color:{argb:'FF087E76'}};ws.getCell('F4').alignment={vertical:'middle'};
 const headings=['N°','Nom complet','Téléphone','Ville / Région','Type véhicule','Code application','Plaque','Photo personnelle (référence)','Photo véhicule (référence)','Observations'];
 const header=ws.getRow(7);headings.forEach((x,i)=>{const c=header.getCell(i+1);c.value=x;c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFEF653A'}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true}});header.height=36;
 rows.forEach((r,i)=>{const line=ws.getRow(i+8);[i+1,r.name,r.phone,r.city,r.vehicle_type,r.app_code,r.license_plate||'',r.driver_photo_path||'',r.vehicle_photo_path||'',r.observations||''].forEach((v,j)=>{const c=line.getCell(j+1);c.value=v;c.alignment={vertical:'middle',wrapText:true,horizontal:j===1?'left':'center'};c.font={name:'Arial',size:10,color:{argb:'FF243247'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:i%2?'FFF1F5F9':'FFFFFFFF'}};c.border={bottom:{style:'hair',color:{argb:'FFE2E8F0'}}}});line.height=28});
 ws.autoFilter={from:{row:7,column:1},to:{row:Math.max(7,rows.length+7),column:10}};
 const bytes=await wb.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download='PRESTO-livreurs-vehicules'+(suffix?'-'+suffix:'')+'.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/**
 * Private, browser-side PDF text extraction for PRESTO. Files are not uploaded.
 * Text PDFs are supported; image-only scans need OCR before import.
 * Only explicitly detected fields are returned, so missing PDF columns cannot
 * erase existing driver data during merge.
 */
export type PdfDestination='drivers'|'training';
export type PdfRecord={
 destination:PdfDestination;
 name:string;
 phone:string;
 city?:string;
 vehicle_type?:string;
 app_code?:string;
 bag?:boolean;
 shirt?:boolean;
 verified?:boolean;
 bankily?:boolean;
 masrvi?:boolean;
 sedad?:boolean;
 click?:boolean;
 bankily_account?:string;
 masrvi_account?:string;
 sedad_account?:string;
 click_account?:string;
 delivery_date?:string;
 observations?:string;
 training_date?:string;
 trainer?:string;
 training_location?:string;
 training_status?:'completed'|'in_progress'|'needs_review';
 app_type?:'driver'|'customer'|'both';
};
export type PdfPreview={records:PdfRecord[];pages:number;warnings:string[];textLength:number};
type Field=Exclude<keyof PdfRecord,'destination'>;
type Cell={x:number;text:string};
type Line={cells:Cell[];text:string};
type Item={str:string;transform:number[];width?:number};

const compact=(v:string)=>v.normalize('NFKD')
 .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g,'')
 .toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g,'');
const aliases:Partial<Record<Field,string[]>>={
 name:['nom','nometprenom','nomcomplet','nometprenomdulivreur','nomlivreur','livreur','driver','drivername','fullname','name','اسمالسائق','السائق','الاسم','الاسمواللقب','الاسمالكامل','اسمالمتدرب','المتدرب','nomparticipant','participant'],
 phone:['telephone','numerodetelephone','numero','telephoneportable','tel','phone','contact','mobile','الهاتف','رقمالهاتف','رقمالاتصال','رقمالسائق','التلفون'],
 city:['ville','city','localite','المدينة','المدينه','الولاية','المكان'],
 vehicle_type:['vehicule','typedevehicule','typevehicule','moto','vehicle','vehicle type','المركبة','نوعالمركبة','نوعالمركبه','الوسيلة'],
 app_code:['codeapplication','codeappli','codeapp','identifiantapplication','appcode','كودالتطبيق','رمزالتطبيق','رقمالتطبيق'],
 bag:['sac','sacremis','bag','الحقيبة','الحقيبه','تسليمالحقيبة'],
 shirt:['chemise','shirt','tshirt','القميص','تسليمالقميص'],
 verified:['dossier','dossierverifie','verifie','verified','ملفمكتمل','الملف','تمالتحقق'],
 bankily:['bankily','بنكيلي','بنكيلى','بنكلي'],
 masrvi:['masrvi','masrivy','masrivi','مصرفي','مصريفي','مصرڤي'],
 sedad:['sedad','seddad','سداد'],
 click:['click','klik','كليك','كليڭ'],
 delivery_date:['datederemise','dateremise','deliverydate','تاريخالتسليم','تاريختسليمالحقيبة'],
 observations:['observations','observation','remarques','notes','comments','ملاحظات','الملاحظات'],
 training_date:['datedeformation','dateformation','trainingdate','تاريخالتدريب','تاريختدريب'],
 trainer:['formateur','instructeur','trainer','المدرب','المدربة','اسمالمدرب'],
 training_location:['lieudeformation','lieuformation','traininglocation','مكانالتدريب','مقرالتدريب'],
 training_status:['statutformation','statutdeformation','trainingstatus','حالةالتدريب','وضعيةالتدريب'],
 app_type:['application','typeapplication','app','التطبيق','نوعالتطبيق']
};
const fieldFor=(value:string):Field|null=>{
 const normalized=compact(value);
 if(!normalized)return null;
 for(const [field,list] of Object.entries(aliases) as [Field,string[]][])
  if(list.some(a=>compact(a)===normalized))return field;
 if(normalized.includes('bankily'))return 'bankily';
 if(normalized.includes('masrvi'))return 'masrvi';
 if(normalized.includes('sedad'))return 'sedad';
 if(normalized==='تاريخ'||normalized==='date')return 'delivery_date';
 return null;
};
const trim=(value:string,max=100)=>value.replace(/\s+/g,' ').trim().slice(0,max);
const booleanOf=(raw:string):boolean|undefined=>{
 const v=compact(raw);
 if(!v)return undefined;
 if(['oui','yes','true','1','ok','actif','active','تم','نعم','موجود','مستلم','مكتمل','valide','verified','complete','✓','✔'].includes(v))return true;
 if(['non','no','false','0','absent','aucun','لا','غيرموجود','غيرمستلم','غيرمكتمل','manquant','none','x'].includes(v))return false;
 return undefined;
};
const isoDate=(value:string):string=>{
 const s=trim(value,40);
 let m=s.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
 if(m)return validDate(Number(m[1]),Number(m[2]),Number(m[3]));
 m=s.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
 if(m)return validDate(Number(m[3]),Number(m[2]),Number(m[1]));
 return '';
};
const validDate=(y:number,m:number,d:number):string=>{
 const dt=new Date(Date.UTC(y,m-1,d));
 if(y<2000||y>2100||dt.getUTCFullYear()!==y||dt.getUTCMonth()+1!==m||dt.getUTCDate()!==d)return '';
 return [String(y),String(m).padStart(2,'0'),String(d).padStart(2,'0')].join('-');
};
function assign(record:PdfRecord,field:Field,raw:string){
 const value=trim(raw,1200);
 if(!value)return;
 switch(field){
 case 'name':record.name=trim(value,100);break;
 case 'phone':record.phone=trim(value,30);break;
 case 'city':record.city=trim(value,90);break;
 case 'vehicle_type':record.vehicle_type=trim(value,80);break;
 case 'app_code':record.app_code=trim(value,80);break;
 case 'bag':case 'shirt':case 'verified':{
  const b=booleanOf(value);if(b!==undefined)record[field]=b;
  break;
 }
 case 'bankily':case 'masrvi':case 'sedad':case 'click':{
  const b=booleanOf(value);
  if(b!==undefined){record[field]=b;break;}
  if(value.length<=80){record[field]=true;record[(field+'_account') as 'bankily_account']=value;}
  break;
 }
 case 'observations':record.observations=value.slice(0,1000);break;
 case 'delivery_date':record.delivery_date=isoDate(value)||trim(value,30);break;
 case 'training_date':record.training_date=isoDate(value);break;
 case 'trainer':record.trainer=trim(value,100);break;
 case 'training_location':record.training_location=trim(value,120);break;
 case 'training_status':{
  const v=compact(value);
  record.training_status=v.includes('cours')||v.includes('قيد')?'in_progress':v.includes('review')||v.includes('revoir')||v.includes('مراجعة')?'needs_review':'completed';
  break;
 }
 case 'app_type':{
  const v=compact(value);
  record.app_type=v.includes('both')||v.includes('deux')||v.includes('كلا')?'both':v.includes('customer')||v.includes('client')||v.includes('زبون')?'customer':'driver';
  break;
 }
 }
}
function linesFrom(items:Item[]):Line[]{
 const groups:{y:number;items:Item[]}[]=[];
 const sorted=items.filter(i=>i.str&&i.str.trim()&&i.transform?.length>=6)
  .sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4]);
 for(const item of sorted){
  const y=item.transform[5];
  const previous=groups.findLast(g=>Math.abs(g.y-y)<=3);
  if(previous)previous.items.push(item);
  else groups.push({y,items:[item]});
 }
 return groups.sort((a,b)=>b.y-a.y).map(g=>{
  const segments=g.items.sort((a,b)=>a.transform[4]-b.transform[4]);
  const cells:Cell[]=[];
  let right=-Infinity;
  for(const item of segments){
   const x=item.transform[4],str=item.str.trim();
   if(!str)continue;
   if(cells.length&&x-right<10&&x>=cells[cells.length-1].x){
    cells[cells.length-1].text+=' '+str;
   }else cells.push({x,text:str});
   right=Math.max(right,x+(item.width??str.length*5));
  }
  return {cells,text:cells.map(c=>c.text).join(' | ')};
 }).filter(l=>l.cells.length);
}
function isTrainingContext(text:string):boolean{
 const n=compact(text);
 return n.includes('formation')||n.includes('training')||n.includes('تدريب')||n.includes('المتدربين');
}
function destinationFor(record:PdfRecord,context:string):PdfDestination{
 return record.training_date||record.trainer||record.training_location||record.training_status||isTrainingContext(context)?'training':'drivers';
}
const newRecord=():PdfRecord=>({destination:'drivers',name:'',phone:''});
function parseTable(lines:Line[],context:string):PdfRecord[]{
 const result:PdfRecord[]=[];
 let header:{field:Field;x:number}[]=[];
 for(const line of lines){
  const possible=line.cells.map(c=>({field:fieldFor(c.text),x:c.x})).filter((x):x is {field:Field;x:number}=>x.field!==null);
  const unique=new Set(possible.map(p=>p.field));
  if(unique.has('name')&&unique.size>=2){
   header=possible;continue;
  }
  if(!header.length||line.cells.length<2)continue;
  const record=newRecord();
  let closestName=false;
  for(const cell of line.cells){
   const col=header.reduce((best,h)=>Math.abs(h.x-cell.x)<Math.abs(best.x-cell.x)?h:best,header[0]);
   if(col.field==='name')closestName=true;
   assign(record,col.field,cell.text);
  }
  if(record.name&&closestName&&fieldFor(record.name)!=='name'){
   record.destination=destinationFor(record,context);
   result.push(record);
  }
 }
 return result;
}
function parseForms(lines:Line[],context:string):PdfRecord[]{
 const result:PdfRecord[]=[];
 let record=newRecord();
 const store=()=>{if(record.name){record.destination=destinationFor(record,context);result.push(record);}record=newRecord();};
 for(const line of lines){
  for(let i=0;i<line.cells.length;i++){
   const value=line.cells[i].text;
   let field:Field|null=null,raw='';
   const colon=/^([^:：]{2,40})\s*[:：]\s*(.+)$/.exec(value);
   if(colon){field=fieldFor(colon[1]);raw=colon[2];}
   if(!field&&i+1<line.cells.length){
    const found=fieldFor(value);
    if(found){field=found;raw=line.cells[i+1].text;i++;}
   }
   if(!field){
    const match=/^(Nom(?: complet| du livreur)?|Téléphone|Phone|Ville|Bankily|Masrvi|Sedad|Click|اسم السائق|الاسم|رقم الهاتف|الهاتف|المدينة|بنكيلي|مصرفي|سداد|كليك)\s+(.+)$/i.exec(value);
    if(match){field=fieldFor(match[1]);raw=match[2];}
   }
   if(field){
    if(field==='name'&&record.name)store();
    assign(record,field,raw);
   }
  }
 }
 store();
 return result;
}
function dedupeRecords(records:PdfRecord[]):PdfRecord[]{
 const used=new Set<string>();
 return records.filter(record=>{
  const key=record.destination+':'+compact(record.name)+':'+record.phone.replace(/\D/g,'');
  if(used.has(key))return false;
  used.add(key);return true;
 });
}
/** Throws when the selected document is unusable rather than saving guessed values. */
export async function extractPrestoPdf(file:File):Promise<PdfPreview>{
 if(file.size>15*1024*1024)throw new Error('PDF maximum: 15 MB.');
 if(file.size<8||!(/\.pdf$/i.test(file.name)||file.type==='application/pdf'))throw new Error('Choisissez un fichier PDF.');
 // This import must stay in a client-side event handler, never during SSR.
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs',import.meta.url).toString();
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),useSystemFonts:true});
 const pdf=await task.promise;
 const warnings:string[]=[];
 let all:PdfRecord[]=[],textLength=0;
 try{
  if(pdf.numPages>30)throw new Error('Le fichier dépasse la limite de 30 pages.');
  for(let number=1;number<=pdf.numPages;number++){
   const page=await pdf.getPage(number);
   const content=await page.getTextContent();
   const lines=linesFrom(content.items.filter((i):i is typeof i & Item=>'str' in i) as Item[]);
   const context=lines.map(l=>l.text).join('\n');
   textLength+=context.length;
   const table=parseTable(lines,context);
   const forms=table.length?[]:parseForms(lines,context);
   all.push(...table,...forms);
  }
 }finally{await pdf.destroy();}
 all=dedupeRecords(all).slice(0,500);
 if(textLength<15)warnings.push('Ce PDF semble être une image numérisée. Effectuez un OCR avant de l’importer.');
 if(!all.length)warnings.push('Aucune fiche reconnue. Utilisez un PDF texte avec noms et champs lisibles.');
 if(all.some(x=>x.destination==='training'&&(!x.phone||!x.training_date)))
  warnings.push('Formation : le téléphone et une date valide sont nécessaires avant l’enregistrement.');
 return {records:all,pages:pdf.numPages,warnings,textLength};
}

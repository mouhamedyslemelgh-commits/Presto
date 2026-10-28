export type PaymentKey='bankily'|'masrvi'|'sedad'|'click';
export type ImportedDriver={name:string;phone:string;bag:boolean;shirt:boolean;verified:boolean;payments:Record<PaymentKey,boolean>;accounts:Partial<Record<PaymentKey,string>>;deliveryDate:string;observations:string};
export type ImportMode='add'|'merge';
export type ParsedImport={items:ImportedDriver[];warnings:string[];headerRow:number;columns:string[];skipped:number};
type Cell=string|number|boolean|Date|null|undefined;
export type SheetData={sheet:string;data:Cell[][]};
export function normalizeHeader(value:unknown):string{
 return String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[\u064B-\u065F]/g,'').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g,'');
}
const fields={
 name:['livreur','nomlivreur','nometprenom','nomcomplet','noms','nom','driver','drivername','السائق','اسمالسائق','الاسم','الاسمواللقب','الاسمكامل'],
 phone:['telephone','numerotelephone','numerodetelephone','tel','portable','mobile','phone','contact','رقمالهاتف','الهاتف','رقمالسائق','رقمالاتصال'],
 id:['n','no','num','numero','id','رقم','الرقم'],
 bag:['sac','sacs','sacremis','sacsremis','sacsremises','bag','bags','الحقيبة','حقائب','الحقيبه','تسليمالحقيبة'],
 shirt:['chemise','chemises','chemisemise','chemisesremises','shirt','shirts','القميص','قمصان','تسليمالقميص'],
 bankily:['bankily','بنكيلي','بنكلي','بنكيلى','bankilybpm'],
 masrvi:['masrvi','masrivy','masrivi','مصرفي','مصريفي','مصرڤي'],
 sedad:['sedad','seddad','سداد'],
 click:['click','klik','كليك','كليڭ'],
 date:['datederemise','dateremise','date','dateenregistrement','remisedate','تاريخالتسليم','التاريخ'],
 verified:['dossier','dossierverifie','verifie','dossiervalid','validation','ملفمكتمل','التحقق','الملف'],
 status:['statut','status','etat','etatdudossier','الحالة','الوضعية'],
 notes:['observations','observation','remarques','remarque','notes','comments','ملاحظات','الملاحظات'],
} as const;
type Field=keyof typeof fields;
function identify(value:unknown):Field|null{
 const h=normalizeHeader(value);
 if(!h)return null;
 for(const [k,values] of Object.entries(fields) as [Field,readonly string[]][])if(values.includes(h))return k;
 if(h.includes('livreur')||h.includes('اسمالسائق'))return 'name';
 if(h.includes('telephone')||h.includes('الهاتف'))return 'phone';
 if(h.includes('bankily'))return 'bankily';
 if(h.includes('masrvi'))return 'masrvi';
 if(h.includes('sedad'))return 'sedad';
 if(h.includes('click'))return 'click';
 if(h.includes('datederemise'))return 'date';
 if(h.includes('observation'))return 'notes';
 return null;
}
function cellText(value:Cell):string{
 if(value===null||value===undefined)return '';
 if(value instanceof Date)return [value.getFullYear(),String(value.getMonth()+1).padStart(2,'0'),String(value.getDate()).padStart(2,'0')].join('-');
 return String(value).trim();
}
function positive(value:Cell):boolean{
 const text=normalizeHeader(cellText(value));
 if(!text||['0','non','no','false','absent','manquant','لا','غيرمتوفر','لايوجد','aucun','na','n'].includes(text))return false;
 if(typeof value==='number')return value!==0;
 return true;
}
function account(value:Cell):{active:boolean;number:string}{
 const text=cellText(value);
 if(!positive(value))return {active:false,number:''};
 if(['oui','yes','true','1','نعم','ok','actif','active'].includes(normalizeHeader(text)))return {active:true,number:''};
 return {active:true,number:text.slice(0,80)};
}
function statusVerified(value:Cell):boolean{
 const h=normalizeHeader(cellText(value));
 return ['complet','complete','valide','valid','ok','verified','مكتمل','كامل'].includes(h)||h.startsWith('complet');
}
export function parsePrestoSheet(input:Cell[][]):ParsedImport{
 const warnings:string[]=[];let headerRow=-1;let mapped:Partial<Record<Field,number>>={};let highest=-1;
 for(let i=0;i<Math.min(input.length,120);i++){
  const row=input[i]||[];const seen:Partial<Record<Field,number>>={};
  row.forEach((v,j)=>{const f=identify(v);if(f!==null&&seen[f]===undefined)seen[f]=j;});
  const count=Object.keys(seen).length;
  const score=(seen.name!==undefined?20:0)+(seen.phone!==undefined?6:0)+Math.min(count,12);
  if(seen.name!==undefined&&count>=2&&score>highest){highest=score;headerRow=i;mapped=seen;}
 }
 if(headerRow<0)throw Error('Colonne « Livreur / Nom » introuvable. Sélectionnez la feuille contenant le registre.');
 const columns=Object.keys(mapped).map(k=>k+' → colonne '+String((mapped[k as Field]??0)+1));
 const items:ImportedDriver[]=[];let skipped=0;const used=new Set<string>();
 for(let i=headerRow+1;i<input.length&&i<headerRow+1+10000;i++){
  const row=input[i]||[];
  const get=(field:Field):Cell=>mapped[field]===undefined?null:row[mapped[field]!];
  const name=cellText(get('name')).slice(0,100);
  const phone=cellText(get('phone')).slice(0,30);
  if(!name||['total','totaux','somme','مجموع','اجمالي'].includes(normalizeHeader(name))){skipped++;continue;}
  if(identify(name)==='name'){skipped++;continue;}
  const digits=phone.replace(/\D/g,'');
  const key=(digits?'p:'+digits:'n:'+normalizeHeader(name));
  if(used.has(key)){warnings.push('Ligne '+String(i+1)+' : doublon dans le fichier ('+name+'), ignoré.');skipped++;continue;}
  used.add(key);
  const payments={} as Record<PaymentKey,boolean>,accounts={} as Partial<Record<PaymentKey,string>>;
  for(const method of ['bankily','masrvi','sedad','click'] as const){
   const x=account(get(method));payments[method]=x.active;if(x.number)accounts[method]=x.number;
  }
  const bag=positive(get('bag')),shirt=positive(get('shirt'));
  const verified=mapped.verified!==undefined?positive(get('verified')):statusVerified(get('status'));
  items.push({name,phone,bag,shirt,verified,payments,accounts,deliveryDate:cellText(get('date')).slice(0,30),observations:cellText(get('notes')).slice(0,1000)});
 }
 if(items.length===0)warnings.push('Aucun livreur valide trouvé dans cette feuille.');
 if(mapped.phone===undefined)warnings.push('Colonne Téléphone absente : détection des doublons par nom uniquement.');
 for(const col of ['bankily','masrvi','sedad','click'] as const)if(mapped[col]===undefined)warnings.push('Colonne '+col+' absente : comptes considérés comme non enregistrés.');
 if(mapped.bag===undefined||mapped.shirt===undefined)warnings.push('Colonnes Sac et/ou Chemise absentes : valeurs « Non ».');
 return {items,warnings:warnings.slice(0,20),headerRow:headerRow+1,columns,skipped};
}

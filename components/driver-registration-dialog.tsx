'use client';
import {useRef,useState,type FormEvent} from 'react';
import {CalendarDays,Check,CheckCircle2,ClipboardList,FileText,Phone,UserRound,Wallet,X} from 'lucide-react';

export type PaymentKey='bankily'|'masrvi'|'sedad'|'click';
export type DriverRegistrationValues={
 name:string;
 phone:string;
 deliveryDate:string;
 observations:string;
 bag:boolean;
 shirt:boolean;
 verified:boolean;
 payments:Record<PaymentKey,boolean>;
 paymentNumbers:Record<PaymentKey,string>;
};
type Props={
 values:DriverRegistrationValues;
 language:'ar'|'fr';
 isEdit:boolean;
 onChange:(next:DriverRegistrationValues)=>void;
 onClose:()=>void;
 onSave:()=>void|Promise<void>;
};
const paymentList:{key:PaymentKey;ar:string;fr:string}[]=[
 {key:'bankily',ar:'بنكيلي',fr:'Bankily'},
 {key:'sedad',ar:'سداد',fr:'Sedad'},
 {key:'masrvi',ar:'مصرفي',fr:'Masrvi'},
 {key:'click',ar:'كليك',fr:'CLICK'},
];
function currentLocalDate(){
 const d=new Date();
 const n=(x:number)=>String(x).padStart(2,'0');
 return d.getFullYear()+'-'+n(d.getMonth()+1)+'-'+n(d.getDate());
}
function validISO(year:number,month:number,day:number){
 const d=new Date(year,month-1,day);
 if(d.getFullYear()!==year||d.getMonth()+1!==month||d.getDate()!==day)return '';
 return String(year).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
}
function normalizeDate(raw:string){
 const s=raw.trim();
 const iso=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
 if(iso)return validISO(Number(iso[1]),Number(iso[2]),Number(iso[3]));
 const local=/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/.exec(s);
 if(local)return validISO(Number(local[3]),Number(local[2]),Number(local[1]));
 return '';
}
export default function DriverRegistrationDialog({values,language,isEdit,onChange,onClose,onSave}:Props){
 const ar=language==='ar';
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const calendarRef=useRef<HTMLInputElement>(null);
 const isoDate=normalizeDate(values.deliveryDate||'');
 const chosen=paymentList.filter(({key})=>values.payments[key]).length;
 const L=(arText:string,frText:string)=>ar?arText:frText;
 const update=<K extends keyof DriverRegistrationValues>(key:K,value:DriverRegistrationValues[K])=>onChange({...values,[key]:value});
 const markToday=()=>update('deliveryDate',currentLocalDate());
 const openPicker=()=>{
  if(!isoDate)markToday();
  try{calendarRef.current?.showPicker?.()}catch{calendarRef.current?.focus()}
 };
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(busy||!values.name.trim())return;
  setError('');setBusy(true);
  try{await onSave();}
  catch(e){setError(e instanceof Error?e.message:L('تعذر حفظ البيانات، حاول مجددًا.','Impossible de sauvegarder. Réessayez.'));}
  finally{setBusy(false);}
 };
 return <div className="modalWrap driverEditorOverlay" dir={ar?'rtl':'ltr'} onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)onClose()}}>
  <section className="modal driverEditorDialog" role="dialog" aria-modal="true" aria-labelledby="driver-editor-title">
   <header className="modalHead driverEditorHead">
    <div className="driverEditorHeading">
     <span className="driverEditorHeroIcon"><UserRound size={23}/></span>
     <div><span className="driverEditorEyebrow">PRESTO · {L('إدارة السائقين','Gestion des livreurs')}</span>
      <h2 id="driver-editor-title">{isEdit?L('تعديل بيانات السائق','Modifier le livreur'):L('إضافة سائق جديد','Ajouter un livreur')}</h2>
      <p>{L('أكمل بيانات السائق وحساباته، ثم اضغط على حفظ.','Renseignez le livreur et ses comptes avant d’enregistrer.')}</p>
     </div>
    </div>
    <button type="button" className="driverEditorClose" onClick={onClose} aria-label={L('إغلاق','Fermer')} disabled={busy}><X size={19}/></button>
   </header>
   <form className="driverEditorForm" onSubmit={submit}>
    <div className="modalBody driverEditorBody">
     <div className="driverEditorSection">
      <div className="driverEditorSectionHead"><span className="driverEditorSectionIcon"><UserRound size={18}/></span><div><h3>{L('معلومات السائق','Informations du livreur')}</h3><p>{L('البيانات الأساسية وتاريخ التسليم','Coordonnées et date de remise')}</p></div></div>
      <div className="driverEditorFieldGrid">
       <label className="driverEditorField"><span>{L('اسم السائق','Nom du livreur')} <b>*</b></span><div className="driverEditorInputWrap"><UserRound size={17}/><input required autoFocus maxLength={100} placeholder={L('الاسم الكامل للسائق','Nom complet du livreur')} value={values.name} onChange={e=>update('name',e.target.value)}/></div></label>
       <label className="driverEditorField"><span>{L('رقم الهاتف','Numéro de téléphone')}</span><div className="driverEditorInputWrap"><Phone size={17}/><input type="tel" dir="ltr" maxLength={30} placeholder="22 00 00 00" value={values.phone} onChange={e=>update('phone',e.target.value)}/></div></label>
       <div className="driverEditorField driverEditorDateField">
        <span>{L('تاريخ التسليم','Date de remise')}</span>
        <div className="driverEditorDateRow"><div className="driverEditorInputWrap driverEditorDateInput"><CalendarDays size={18}/><input ref={calendarRef} type="date" lang={ar?'ar':'fr'} dir="ltr" aria-label={L('تاريخ التسليم','Date de remise')} value={isoDate} onFocus={()=>{if(!isoDate)markToday()}} onClick={openPicker} onChange={e=>update('deliveryDate',e.target.value)}/></div><button className="driverEditorTodayBtn" type="button" onClick={markToday}><CalendarDays size={15}/>{L('اليوم','Aujourd’hui')}</button></div>
        <small>{L('اضغط على التاريخ لعرض تاريخ اليوم أو اختيار تاريخ آخر.','Cliquez pour afficher aujourd’hui ou choisir une autre date.')}</small>
        {values.deliveryDate&&!isoDate&&<small className="driverEditorDateLegacy">{L('التاريخ السابق: ','Ancienne date : ')}{values.deliveryDate}</small>}
       </div>
       <label className="driverEditorField driverEditorNotes"><span>{L('الملاحظات','Observations')}</span><div className="driverEditorInputWrap driverEditorTextArea"><FileText size={17}/><textarea maxLength={1000} rows={2} placeholder={L('ملاحظات إضافية (اختياري)','Remarques complémentaires (facultatif)')} value={values.observations} onChange={e=>update('observations',e.target.value)}/></div></label>
      </div>
     </div>
     <div className="driverEditorSection">
      <div className="driverEditorSectionHead"><span className="driverEditorSectionIcon"><ClipboardList size={18}/></span><div><h3>{L('المعدات والملف','Équipements et dossier')}</h3><p>{L('حدّد العناصر التي تم تسليمها أو توثيقها','Cochez les éléments remis ou vérifiés')}</p></div></div>
      <div className="driverEditorChecks">
       {([
        ['bag',L('تم تسليم الحقيبة','Sac remis')],
        ['shirt',L('تم تسليم القميص','Chemise remise')],
        ['verified',L('ملف موثّق','Dossier vérifié')]
       ] as const).map(([k,label])=><label key={k} className={'driverEditorCheck '+(values[k]?'isChecked':'')}><span className="driverEditorCheckIcon"><CheckCircle2 size={17}/></span><span>{label}</span><input type="checkbox" checked={values[k]} onChange={e=>update(k,e.target.checked)} /></label>)}
      </div>
     </div>
     <div className="driverEditorSection">
      <div className="driverEditorSectionHead"><span className="driverEditorSectionIcon"><Wallet size={18}/></span><div><h3>{L('الدفع الإلكتروني','Paiement électronique')}</h3><p>{L('كل وسيلة دفع لها رقم مستقل','Un numéro distinct pour chaque service')}</p></div><span className="driverEditorCount">{chosen}/4</span></div>
      <div className="driverEditorPayments">
       {paymentList.map(p=><div key={p.key} className={'driverEditorPayCard '+(values.payments[p.key]?'isActive':'')}>
        <label className="driverEditorPayHeading"><img src={'/logos/'+p.key+'.webp'} alt="" width={43} height={43}/><strong>{ar?p.ar:p.fr}</strong><input type="checkbox" checked={values.payments[p.key]} aria-label={L('تفعيل ','Activer ')+(ar?p.ar:p.fr)} onChange={e=>update('payments',{...values.payments,[p.key]:e.target.checked})}/></label>
        <label className="driverEditorField driverEditorPayNumber"><span>{L('رقم الحساب','Numéro du compte')}</span><input type="text" inputMode="tel" dir="ltr" autoComplete="off" maxLength={80} placeholder={L('أدخل رقم هذه الخدمة','Numéro propre à ce service')} value={values.paymentNumbers[p.key]||''} onChange={e=>{
          const newNumber=e.target.value;
          onChange({...values,paymentNumbers:{...values.paymentNumbers,[p.key]:newNumber},payments:newNumber.trim()?{...values.payments,[p.key]:true}:values.payments});
        }}/></label>
       </div>)}
      </div>
     </div>
    </div>
    <footer className="modalActions driverEditorActions">
     <div className="driverEditorFooterHint"><CheckCircle2 size={16}/><span>{L('تُحفظ البيانات عند الضغط على حفظ','Enregistrement après validation')}</span></div>
     {error&&<span className="driverEditorError" role="alert">{error}</span>}
     <div className="driverEditorFooterButtons"><button type="button" className="driverEditorCancel" disabled={busy} onClick={onClose}>{L('إلغاء','Annuler')}</button><button type="submit" className="driverEditorSave" disabled={busy||!values.name.trim()}><Check size={18}/>{busy?L('جار الحفظ...','Enregistrement...'):isEdit?L('حفظ التعديلات','Enregistrer les modifications'):L('حفظ السائق','Enregistrer le livreur')}</button></div>
    </footer>
   </form>
  </section>
 </div>;
}

'use client';

import {CalendarDays,Check,CheckCircle2,Edit3,Eye,Phone,StickyNote,Trash2,UserRound,Wallet,X} from 'lucide-react';

export type DriverRegisterRecord={
 id:number;name:string;phone:string;delivery_date:string;observations:string;
 bag:boolean;shirt:boolean;verified:boolean;
 bankily:boolean;masrvi:boolean;sedad:boolean;click:boolean;
 bankily_account:string;masrvi_account:string;sedad_account:string;click_account:string;
};
type Props={
 items:DriverRegisterRecord[];
 ranks:ReadonlyMap<number,number>;
 language:'ar'|'fr';
 preview?:boolean;
 editable?:boolean;
 onOpen:(id:number)=>void;
 onEdit?:(driver:DriverRegisterRecord)=>void;
 onDelete?:(id:number)=>void;
};
const activeCount=(d:DriverRegisterRecord)=>Number(d.bankily)+Number(d.masrvi)+Number(d.sedad)+Number(d.click);
const isComplete=(d:DriverRegisterRecord)=>d.bag&&d.shirt&&d.verified&&activeCount(d)>0;
const firstLetter=(name:string)=>Array.from(name.trim())[0]||'•';

export default function DriverRegisterTable({items,ranks,language,preview=false,editable=false,onOpen,onEdit,onDelete}:Props){
 const ar=language==='ar';
 const L=(a:string,f:string)=>ar?a:f;
 return <div className={'driverRegisterWrap '+(preview?'isPreview':'')} dir={ar?'rtl':'ltr'}>
  <table className="driverRegisterTable">
   <thead><tr>
    <th>{L('الرقم','N°')}</th>
    <th>{L('السائق','Livreur')}</th>
    <th>{L('تاريخ التسليم','Date de remise')}</th>
    <th>{L('الهاتف','Téléphone')}</th>
    <th>{L('التجهيزات','Équipement')}</th>
    <th>{L('حسابات الدفع','Paiement')}</th>
    <th>{L('الملاحظات','Observations')}</th>
    <th>{L('حالة الملف','Statut')}</th>
    {!preview&&<th>{L('إجراءات','Actions')}</th>}
   </tr></thead>
   <tbody>
    {items.length===0?<tr className="driverRegisterEmptyRow"><td colSpan={preview?8:9}><UserRound size={24}/><strong>{L('لا يوجد سائقون مطابقون للبحث','Aucun livreur correspondant')}</strong><span>{L('جرّب بحثًا آخر أو أضف سائقًا جديدًا.','Essayez une autre recherche ou ajoutez un livreur.')}</span></td></tr>:
     items.map(d=>{
      const position=ranks.get(d.id)??d.id;
      const count=activeCount(d);
      const done=isComplete(d);
      const note=d.observations?.trim();
      return <tr key={d.id} className="driverRegisterRow">
       <td data-label={L('الرقم','N°')}><span className="driverRegisterNumber" dir="ltr">{position}</span></td>
       <td data-label={L('السائق','Livreur')} className="driverRegisterIdentityCell"><button type="button" onClick={()=>onOpen(d.id)} className="driverRegisterIdentity">
        <span className="driverRegisterAvatar" aria-hidden="true">{firstLetter(d.name)}</span>
        <span className="driverRegisterNameStack"><strong>{d.name}</strong><small>{L('عرض ملف السائق','Voir la fiche du livreur')}</small></span>
       </button></td>
       <td data-label={L('التاريخ','Date')}><span className="driverRegisterDate"><CalendarDays size={14}/><span dir="ltr">{d.delivery_date||'—'}</span></span></td>
       <td data-label={L('الهاتف','Téléphone')}><span className="driverRegisterPhone" dir="ltr"><Phone size={14}/><span>{d.phone||'—'}</span></span></td>
       <td data-label={L('التجهيزات','Équipement')}><div className="driverRegisterEquipment">
        <span className={d.bag?'received':'missing'} title={L('الحقيبة','Sac')}>{d.bag?<Check size={13}/>:<X size={12}/>} {L('حقيبة','Sac')}</span>
        <span className={d.shirt?'received':'missing'} title={L('القميص','Chemise')}>{d.shirt?<Check size={13}/>:<X size={12}/>} {L('قميص','Chemise')}</span>
       </div></td>
       <td data-label={L('الدفع','Paiement')}><span className={'driverRegisterPayment '+(count>0?'hasAccounts':'')}><Wallet size={14}/>{count} / 4</span></td>
       <td data-label={L('الملاحظات','Observations')}><span className={'driverRegisterNotes '+(note?'hasNote':'noNote')}><StickyNote size={13}/>{note||L('لا توجد ملاحظات','Aucune observation')}</span></td>
       <td data-label={L('الحالة','Statut')}><span className={'driverRegisterStatus '+(done?'isDone':'needsReview')}><CheckCircle2 size={15}/>{done?L('مكتمل','Complet'):L('قيد الاستكمال','À compléter')}</span></td>
       {!preview&&<td data-label={L('إجراءات','Actions')}><div className="driverRegisterActions">
        <button type="button" title={L('عرض الملف','Voir la fiche')} aria-label={L('عرض ملف ','Voir la fiche de ')+d.name} onClick={()=>onOpen(d.id)}><Eye size={16}/></button>
        {editable&&<><button type="button" title={L('تعديل','Modifier')} aria-label={L('تعديل ','Modifier ')+d.name} onClick={()=>onEdit?.(d)}><Edit3 size={15}/></button><button type="button" className="driverRegisterDelete" title={L('حذف','Supprimer')} aria-label={L('حذف ','Supprimer ')+d.name} onClick={()=>onDelete?.(d.id)}><Trash2 size={15}/></button></>}
       </div></td>}
      </tr>;
     })
    }
   </tbody>
  </table>
 </div>;
}

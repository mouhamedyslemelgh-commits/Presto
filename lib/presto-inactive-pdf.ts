export type InactiveRow={id:number;name:string;phone:string;app_code:string;group_no:number;trained:boolean;bag_date:string;last_seen:string;answered:string;reason:string;decision:string};
export const inactiveGroups=['يتصلون قليلاً','لا يتصلون ولم ينجزوا أي طلبية','عملوا من قبل ثم توقفوا'];
export const inactiveDecisions=['موعد للتكوين','مهلة 7 أيام','اتصالان + رسالة','يُبلّغ المسؤول','عاد للعمل'];
/** Native canvas text shaping keeps Arabic connected and RTL in the exported PDF. */
export async function exportInactivePdf(rows:InactiveRow[]){
 const {jsPDF}=await import('jspdf');
 const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
 const W=1440,H=2037,M=64;
 let canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D,y=0,page=0;
 function text(value:string,x:number,top:number,size=22,bold=false,color='#243f39',align:CanvasTextAlign='right'){
  ctx.fillStyle=color;ctx.font=`${bold?'bold ':''}${size}px Arial, sans-serif`;ctx.textAlign=align;ctx.direction='rtl';ctx.fillText(value,x,top);
 }
 function lines(value:string,width:number,size=21){ctx.font=`${size}px Arial, sans-serif`;const result:string[]=[];let line='';for(const word of value.split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){result.push(line);line=word}else line=next;}if(line)result.push(line);return result.length?result:['—'];}
 function boxText(value:string,left:number,top:number,width:number,size=21){const ls=lines(value,width-24,size);ls.forEach((l,i)=>text(l,left+width-12,top+30+i*30,size));return ls.length*30+26;}
 function flush(){if(!canvas)return;text(`PRESTO · مكتب شؤون السائقين · ${page}`,W/2,H-32,18,false,'#648379','center');if(page>1)pdf.addPage();pdf.addImage(canvas.toDataURL('image/jpeg',0.93),'JPEG',0,0,210,297);}
 function start(){canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d')!;if(!ctx)throw Error('تعذر إنشاء PDF');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);page++;text('سائقون لديهم حقيبة Presto ولا يعملون',W-M,96,38,true,'#087b65');text(`مكتب شؤون السائقين · ${new Date().toLocaleDateString('ar-MR')} · ${rows.length} سائق`,W-M,140,21);y=180;}
 function paragraph(value:string,bold=false){for(const l of lines(value,W-2*M,23)){text(l,W-M,y,23,bold);y+=36;}y+=12;}
 const widths=[230,140,120,80,120,100,240,282];
 function header(group:number){ctx.fillStyle='#dff2e9';ctx.fillRect(M,y,W-2*M,58);text(`المجموعة ${group} · ${inactiveGroups[group-1]}`,W-M-18,y+38,25,true);y+=72;let x=W-M;['السائق','الهاتف','استلم الحقيبة','تكوّن؟','آخر اتصال','ردّ؟','السبب','القرار'].forEach((label,i)=>{x-=widths[i];ctx.fillStyle='#f0f7f3';ctx.fillRect(x,y,widths[i],70);boxText(label,x,y,widths[i],19)});y+=70;}
 start();
 paragraph('املأ الأعمدة الثلاثة الأخيرة بعد كل اتصال.',true);
 paragraph('أولاً: انظر عمود «تكوّن؟». لم يتكوّن: يجب عليه الحضور إلى المكتب للتكوين في أقرب وقت أو إعادة الحقيبة. حدّد معه يوماً وساعة. تكوّن: اسأله لماذا لا يتصل أو لا يعمل ثم طبّق قاعدة مجموعته.');
 paragraph('المجموعة 1: شجّعه على الاتصال وقت الغداء أو العشاء. فريق الدعم يعطيه أول طلبية عندما يتصل.');
 paragraph('المجموعة 2: إذا قال «سأبدأ»، مهلة 7 أيام لإنجاز أول طلبية. إذا قال «لا أستطيع»، يُبلّغ المسؤول. إذا لم يردّ: اتصالان ثم الرسالة، وإذا بقي دون ردّ يُبلّغ المسؤول.');
 paragraph('المجموعة 3: اسأله عن السبب وشجّعه على العودة. لا يتم استرجاع أي حقيبة بالقوة؛ القرار للمسؤول.',true);
 paragraph('الرسالة: السلام عليكم، معك فريق Presto. حاولنا الاتصال بك. لديك حقيبة Presto ولم تبدأ العمل بعد. نرجو أن تتصل بنا لنساعدك على أول طلبية. شكراً.');
 for(const group of [1,2,3]){
  const items=rows.filter(r=>r.group_no===group);if(!items.length)continue;
  if(y>H-420){flush();start();}header(group);
  for(const row of items){
   const values=[row.name+(row.app_code?' #'+row.app_code:''),row.phone,row.bag_date||'—',row.trained?'نعم':'لا',row.last_seen||'—',row.answered||'☐ نعم  ☐ لا',row.reason||'—',row.decision||inactiveDecisions.map(d=>'☐ '+d).join(' · ')];
   const cells=values.map((v,i)=>lines(v,widths[i]-24,20));
   let offset=0;const total=Math.max(...cells.map(c=>c.length));
   while(offset<total){
    if(y+150>H-80){flush();start();header(group);}
    const capacity=Math.max(1,Math.floor((H-80-y-28)/30));
    const count=Math.min(total-offset,capacity),height=Math.max(150,count*30+28);
    let x=W-M;cells.forEach((cell,i)=>{x-=widths[i];ctx.strokeStyle='#c3d9ce';ctx.lineWidth=1;ctx.strokeRect(x,y,widths[i],height);cell.slice(offset,offset+count).forEach((line,j)=>text(line,x+widths[i]-12,y+30+j*30,20));});
    y+=height;offset+=count;
    if(offset<total){flush();start();header(group);}
   }
  }y+=32;
 }
 flush();pdf.save('PRESTO-inactive-drivers-'+new Date().toISOString().slice(0,10)+'.pdf');
}

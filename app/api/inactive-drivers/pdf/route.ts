import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const runtime='nodejs';
export async function GET(){
 const parts=await Promise.all([
  readFile(path.join(process.cwd(),'assets/inactive-drivers-1.bin')),
  readFile(path.join(process.cwd(),'assets/inactive-drivers-2.bin'))
 ]);
 return new Response(Buffer.concat(parts),{headers:{'Content-Type':'application/pdf','Content-Disposition':'inline; filename="PRESTO-inactive-drivers.pdf"','Cache-Control':'private, max-age=0'}});
}

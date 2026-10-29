/**
 * PRESTO → Google Sheets
 * Owner's one-time Google authorization is necessary. Site visitors need NO login.
 * Setup: create a Google Apps Script project, paste this code, run setupPresto(),
 * then deploy doPost as a web app "execute as me" / "anyone".
 * Never add the shared secret to browser-side Next.js code.
 */
const PROPS=PropertiesService.getScriptProperties();
const EXISTING_PRESTO_SHEET_ID='1JYtPBLUxxDWFFoZOWvA7qcrhI3eRZAAiFamvGqkLTXk';
const HEADERS=['N°','Date de remise','Livreur','Téléphone','Sac','Chemise','Bankily','Masrvi','Sedad','CLICK','Dossier vérifié','Comptes MM','Statut','Observations'];
function setupPresto(){
 const id=PROPS.getProperty('PRESTO_SHEET_ID')||EXISTING_PRESTO_SHEET_ID;
 const spreadsheet=SpreadsheetApp.openById(id);
 PROPS.setProperty('PRESTO_SHEET_ID',id);
 if(!PROPS.getProperty('PRESTO_SHARED_SECRET')){
  PROPS.setProperty('PRESTO_SHARED_SECRET',Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''));
 }
 initialize_(spreadsheet);
 Logger.log('PRESTO Google Sheets: '+spreadsheet.getUrl());
 Logger.log('Secret for Vercel GOOGLE_SHEETS_SHARED_SECRET (keep private): '+PROPS.getProperty('PRESTO_SHARED_SECRET'));
 return spreadsheet.getUrl();
}
function initialize_(ss){
 let sheet=ss.getSheetByName('Remise équipement');
 if(!sheet){
  const first=ss.getSheets()[0];sheet=first.getName()==='Sheet1'?first:sheet;
  if(sheet===first&&first.getName()==='Sheet1')sheet.setName('Remise équipement');
  else sheet=ss.insertSheet('Remise équipement');
 }
 let daily=ss.getSheetByName('Synthèse par jour');
 if(!daily)daily=ss.insertSheet('Synthèse par jour');
 style_(sheet,daily);
}
function style_(sheet,daily){
 sheet.setFrozenRows(1);
 sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#222222').setFontColor('#ffffff');
 sheet.getRange(1,7,1,4).setBackground('#ff9300');
 sheet.getRange(1,12,1,1).setBackground('#ff350a');
 sheet.setColumnWidth(1,60);sheet.setColumnWidth(2,140);sheet.setColumnWidth(3,230);sheet.setColumnWidth(4,150);
 sheet.setColumnWidths(5,7,120);sheet.setColumnWidth(12,230);sheet.setColumnWidth(14,250);
 daily.setFrozenRows(1);
 daily.getRange(1,1,1,6).setValues([['Date','Livreurs','Sacs remis','Chemises remises','Avec Mobile Money','Dossiers complets']])
 .setBackground('#222222').setFontColor('#ffffff').setFontWeight('bold');
 daily.getRange(1,1).setBackground('#ff350a');
 daily.setColumnWidths(1,6,170);
}
function safe_(value){
 if(value===null||value===undefined)return '';
 const s=String(value);
 return /^[=+@\t\r]/.test(s)?('\''+s):s;
}
function doGet(){
 return ContentService.createTextOutput(JSON.stringify({app:'PRESTO Google Sheets',connected:true})).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e){
 try{
  const payload=JSON.parse(e.postData&&e.postData.contents||'{}');
  const allowed=PROPS.getProperty('PRESTO_SHARED_SECRET');
  if(!allowed||payload.secret!==allowed)throw Error('Unauthorized');
  if(!Array.isArray(payload.drivers)||payload.drivers.length>10000)throw Error('Invalid records');
  const id=PROPS.getProperty('PRESTO_SHEET_ID');
  if(!id)throw Error('Run setupPresto() first');
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw Error('Sync is busy');
  try{
   const ss=SpreadsheetApp.openById(id);
   initialize_(ss);
   const sheet=ss.getSheetByName('Remise équipement');
   const daily=ss.getSheetByName('Synthèse par jour');
   const countRows=Math.max(sheet.getLastRow()-1,0);
   if(countRows)sheet.getRange(2,1,countRows,HEADERS.length).clearContent();
   const grouped={};
   const rows=payload.drivers.map(function(d){
    const modes=['bankily','masrvi','sedad','click'];
    const active=modes.filter(function(k){return Boolean(d[k])}).length;
    const status=d.bag&&d.shirt&&d.verified&&active?'✔ Complet':'À relancer';
    const date=safe_(d.delivery_date||'');
    if(date){
     if(!grouped[date])grouped[date]=[date,0,0,0,0,0];
     grouped[date][1]++;if(d.bag)grouped[date][2]++;if(d.shirt)grouped[date][3]++;
     if(active)grouped[date][4]++;if(status==='✔ Complet')grouped[date][5]++;
    }
    return [
     Number(d.id)||0,date,safe_(d.name),safe_(d.phone),d.bag?'Oui':'Non',d.shirt?'Oui':'Non',
     safe_(d.bankily_account||(d.bankily?'Oui':'')),safe_(d.masrvi_account||(d.masrvi?'Oui':'')),
     safe_(d.sedad_account||(d.sedad?'Oui':'')),safe_(d.click_account||(d.click?'Oui':'')),
     d.verified?'Oui':'Non',active,status,safe_(d.observations)
    ];
   });
   if(rows.length){
    const missing=rows.length+1-sheet.getMaxRows();if(missing>0)sheet.insertRowsAfter(sheet.getMaxRows(),missing);
    sheet.getRange(2,1,rows.length,HEADERS.length).setValues(rows);
    sheet.getRange(2,4,rows.length,1).setNumberFormat('@');
    sheet.getRange(2,7,rows.length,4).setNumberFormat('@');
   }
   const dailyCount=Math.max(daily.getLastRow()-1,0);if(dailyCount)daily.getRange(2,1,dailyCount,6).clearContent();
   const summary=Object.keys(grouped).sort().map(function(k){return grouped[k]});
   if(summary.length){
    const missing=summary.length+1-daily.getMaxRows();if(missing>0)daily.insertRowsAfter(daily.getMaxRows(),missing);
    daily.getRange(2,1,summary.length,6).setValues(summary);
   }
   SpreadsheetApp.flush();
   return ContentService.createTextOutput(JSON.stringify({ok:true,rows:rows.length})).setMimeType(ContentService.MimeType.JSON);
  }finally{lock.releaseLock();}
 }catch(err){
  return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err&&err.message||err)})).setMimeType(ContentService.MimeType.JSON);
 }
}

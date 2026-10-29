# PRESTO — ربط Google Sheets بالموقع دون حسابات للزوار

## ما أُنجز بالفعل
- رابط PRESTO الرئيسي: https://presto-yslem.vercel.app
- يعمل الموقع دون تسجيل دخول. بيانات السائقين تُحفظ بشكل دائم في قاعدة Supabase مشتركة وتُعرض لأي شخص لديه رابط الموقع (تُحدَّث كل خمس ثوان تقريبًا).
- Google Sheet الأصلي موجود بالفعل **داخل حساب Google المتصل**:
  https://docs.google.com/spreadsheets/d/1JYtPBLUxxDWFFoZOWvA7qcrhI3eRZAAiFamvGqkLTXk/edit
- الجدول محفوظ داخل مجلد ChatGPT في Google Drive، وهو خاص بصاحبه لا يُشارك مع عموم الزوار.
- الورقتان: `Remise équipement` و`Synthèse par jour`، مع أعمدة Bankily وMasrvi وSedad وCLICK المستقلة.
- كود Google Apps Script الجاهز: `google-sheets/Code.gs` (مربوط مُسبقًا بمعرّف هذا الجدول بالضبط).
- خادم Next.js للتحويل: `app/api/google-sheets/sync/route.ts`.

## الخطوة المتبقية لمزامنة الموقع تلقائيًا مع Google Sheets
تحتاج إلى تفويض Google لمرة واحدة من حساب صاحب الجدول. اتصال Google Drive داخل ChatGPT وحده **لا يمنح موقع Vercel صلاحية الكتابة إلى Google Sheets مباشرة**.

1. افتح الجدول الموجود أعلاه، واختر **Extensions → Apps Script**.
2. احذف المحتوى الافتراضي في محرّر Apps Script والصق جميع محتويات ملف `google-sheets/Code.gs` من GitHub، ثم احفظ.
3. من اختيار الدوال، شغّل الدالة **setupPresto**. وافق على صلاحيات Google عندما يطلبها. ستتصل الدالة **بنفس الجدول الموجود**؛ لن تنشئ جدولًا آخر.
4. افتح سجل التنفيذ (Execution log). سيظهر **PRESTO_SHARED_SECRET** (رمز خاص). لا ترسله في الدردشة ولا تنشره في GitHub.
5. اختر **Deploy → New deployment → Web app**، ثم **Execute as: Me** و**Who has access: Anyone**، واضغط Deploy. احصل على رابط Web App المنتهي بـ `/exec`. هذا لا يجعل Google Sheet عامًا: الدالة تتحقق من الرمز الخاص قبل كتابة بيانات.
6. افتح Vercel → مشروع `presto` → **Settings → Environment Variables**، وأضف متغيرَي خادم (لا تستخدم بادئة `NEXT_PUBLIC_`):
   - `GOOGLE_SHEETS_WEBHOOK_URL` = رابط Web App.
   - `GOOGLE_SHEETS_SHARED_SECRET` = الرمز الخاص من خطوة 4.
   اختر Production وPreview حسب الحاجة، ثم أعد نشر التطبيق من Vercel (Redeploy).
7. افتح PRESTO، ثم الإعدادات → Google Sheets، واضغط **Vérifier la synchronisation** أو أضف سائقًا؛ ثم افتح Google Sheets للتأكد من ظهور السجل.

## طريقة العمل بعد الربط
- إضافة/استيراد Excel/تحديث/حذف السائقين داخل PRESTO ➝ حفظ التغييرات في Supabase ➝ إرسال نسخة جميع البيانات إلى Google Sheets تلقائيًا.
- بيانات الموقع تأتي من Supabase في جميع الأجهزة، لا من متصفّح شخص واحد.
- التعديلات اليدوية داخل Google Sheets **لا تنتقل عكسيًا إلى الموقع** (مزامنة أحادية الاتجاه).
- زر تنزيل Excel داخل الموقع يحتفظ بالقالب السابق وخيارات كامل السجل/نطاق أرقام/سائق واحد.
- Google Sheets لا يتلقى معلومات جديدة حتى يتوفر التفويض وWebhook، ويجب أن تظهر حالة عدم الاتصال بوضوح.

## تنبيه أمني
عدم وجود تسجيل دخول في الموقع يعني أن **كل من لديه الرابط يستطيع العرض والإضافة والتعديل والحذف**؛ لا تستخدم بيانات السائقين الحساسة دون موافقتهم، ولا تنشر الجدول Google Sheet للعامة. احتفظ برمز Apps Script خاصًا.

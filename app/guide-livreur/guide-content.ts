export type GuideLang='ar'|'fr';
export type GuideView='intro'|'client'|'ready'|'order'|'restaurantMap'|'restaurant'|'pickup'|'customerMap'|'arrival'|'delivery'|'earnings'|'bankily'|'wallet'|'support'|'rules'|'finish'|'safety';
export type GuideChapter='basics'|'delivery'|'finance'|'issues';
export type GuideLesson={id:string;chapter:GuideChapter;view:GuideView;titleAr:string;titleFr:string;captionAr:string;captionFr:string;narrationAr:string;narrationFr:string;takeawaysAr:string[];takeawaysFr:string[]};
export const guideLessons:GuideLesson[]=[
{
 id:'welcome',chapter:'basics',view:'intro',titleAr:'أهلاً بك في عالم PRESTO',titleFr:'Bienvenue chez PRESTO',
 captionAr:'افهم أولاً كيف يعمل تطبيق الزبون وتطبيق السائق',captionFr:'Comprendre les deux applications de Presto',
 narrationAr:'أهلاً بك في فريق بريستو! دعني أشرح لك الأمور كما لو أننا نجلس معاً. في بريستو يوجد تطبيق للزبون وتطبيق خاص بك أنت السائق. الزبون يطلب الطعام أو المنتجات من هاتفه. يصل الطلب إلى المطعم أو المتجر ليحضره. ثم يصلك دورك أنت: تذهب إلى المطعم، تستلم الطلب، وتوصله إلى الزبون. كل هذا تتابعه في تطبيق السائق، وسأريك الآن كيف تتصرف في كل مرحلة ومتى تضغط على كل زر.',
 narrationFr:'Bienvenue dans l’équipe Presto ! Presto dispose de deux applications. Le client utilise la sienne pour commander un repas ou des produits. Le restaurant prépare la commande. Toi, le livreur, tu reçois la course dans ton application, tu vas chercher la commande puis tu la livres. Voyons précisément chaque bouton et chaque étape.',
 takeawaysAr:['تطبيق للزبون وتطبيق للسائق','أنت حلقة الوصل بين المطعم والزبون'],takeawaysFr:['Une application client et une application livreur','Tu relis le restaurant au client']
},{
 id:'process',chapter:'basics',view:'client',titleAr:'رحلة الطلب من البداية للنهاية',titleFr:'Le parcours complet de la commande',
 captionAr:'الزبون يطلب ← المطعم يجهز ← أنت تستلم وتوصل',captionFr:'Commande → préparation → récupération → livraison',
 narrationAr:'تخيّل أن زبوناً في نواكشوط يريد وجبة من مطعم. يدخل تطبيق بريستو، يختار المطعم، يضيف الوجبة والمشروب، ثم يؤكد طلبه. بريستو تنقل المعلومات إلى المطعم ليجهّز الطلب. في تطبيقك أنت تظهر مهمة التوصيل، وبها اسم المطعم ورقم الطلب ومعلومات الرحلة. أنت لا تحضّر الطعام ولا تغيّر محتويات الطلب، بل تستلمه كما هو وتوصلّه بأمان. بالنسبة للزبون، أنت الوجه الذي يمثّل بريستو أمامه.',
 narrationFr:'Imaginons un client à Nouakchott. Il ouvre Presto, choisit son restaurant, ses plats et ses boissons, puis valide. Presto transmet la commande au restaurant. Tu reçois une course dans ton application avec les informations utiles. Tu ne prépares pas la commande et tu ne modifies pas son contenu : tu la récupères et tu la livres avec soin.',
 takeawaysAr:['لا تغيّر الأصناف أو الطلب','خدمتك هي صورة بريستو أمام الزبون'],takeawaysFr:['Ne modifie jamais la commande','Tu représentes Presto auprès du client']
},{
 id:'login',chapter:'basics',view:'ready',titleAr:'الدخول إلى تطبيق السائق',titleFr:'Se connecter à l’application livreur',
 captionAr:'استخدم حسابك الشخصي وتعرّف على ملفك',captionFr:'Utilise uniquement ton propre compte',
 narrationAr:'قبل العمل، افتح تطبيق بريستو الخاص بالسائق وليس تطبيق الزبون. ادخل بحسابك الشخصي بالطريقة التي وفرتها لك الشركة، ثم راجع ملفك وتأكد أن المعلومات صحيحة. لا تعطِ حسابك أو رمز دخوله لشخص آخر. لا أضع لك هنا خطوات تسجيل دخول محددة لم تذكرها الوثيقة، لأن شاشة التطبيق قد تختلف من إصدار إلى آخر. المهم أن تستخدم حسابك وحدك، وأن تطلب مساعدة الدعم إذا تعذر الدخول.',
 narrationFr:'Avant de commencer, ouvre l’application du livreur, pas celle du client. Connecte-toi avec les accès fournis par Presto et vérifie ton profil. Ne partage jamais ton compte ni ton code. Si la connexion échoue, contacte l’assistance ; l’écran exact peut varier selon la version de l’application.',
 takeawaysAr:['حسابك لك وحدك','راجع ملفك قبل العمل'],takeawaysFr:['Ton compte reste personnel','Vérifie ton profil']
},{
 id:'availability',chapter:'basics',view:'ready',titleAr:'متى تصبح متاحاً لاستقبال الطلبات؟',titleFr:'Quand te mettre disponible ?',
 captionAr:'«متصل» تعني أنك جاهز فعلاً للتوصيل',captionFr:'«En ligne» signifie prêt à livrer',
 narrationAr:'قبل أن تجعل حالتك متصلاً، تأكد من شحن الهاتف، وعمل الإنترنت، وتوفر الوقود، وأن مركبتك جاهزة وأن حقيبة بريستو نظيفة. ساعات عملك مرنة وفق الدليل، لكن حين تكون متصلاً عليك أن تكون مستعداً للتحرك سريعاً. اختر طريقاً آمناً لا يعرّضك ولا يعرّض الناس للخطر. وعند انتهاء وقت العمل، أكمل الطلبات التي لديك أولاً ثم غيّر حالتك إلى غير متصل بالطريقة المتاحة في التطبيق.',
 narrationFr:'Avant de te mettre en ligne, vérifie la batterie du téléphone, Internet, le carburant, ta moto ou ton véhicule et la propreté du sac. Tu peux organiser tes horaires, mais «en ligne» signifie vraiment disponible. Prends un itinéraire sûr. Pour arrêter, termine d’abord les courses en cours puis déconnecte-toi.',
 takeawaysAr:['هاتف مشحون وإنترنت ووقود','متصل = جاهز للانطلاق'],takeawaysFr:['Batterie, Internet et carburant','En ligne = vraiment disponible']
},{
 id:'start',chapter:'delivery',view:'order',titleAr:'الطلب الجديد و«بدء الرحلة»',titleFr:'Nouvelle course : «Démarrer»',
 captionAr:'اقرأ التفاصيل واضغط بدء الرحلة عندما تبدأ فعلاً',captionFr:'Lis les détails avant de démarrer',
 narrationAr:'عندما تصلك مهمة توصيل جديدة، افتح تفاصيلها. ستجد اسم المطعم ورقم الطلب وربما الأصناف أو المعلومات اللازمة للرحلة. اقرأها بهدوء حتى لا تتجه إلى مطعم خاطئ أو تحمل طلباً غير صحيح. عندما تكون مستعداً وتبدأ فعلاً التوجه للمطعم اضغط «بدء الرحلة». هذه بداية عملك على الطلب، وليست إعلاناً بأنك وصلت أو استلمت. كل زر في تطبيق بريستو له معنى محدد، فلا تتجاوز أي خطوة.',
 narrationFr:'À la réception d’une course, ouvre les détails : nom du restaurant, numéro de commande et informations de livraison. Lis-les attentivement. Quand tu pars réellement vers le restaurant, appuie sur «Démarrer la course». Ce bouton ne signifie ni que tu es arrivé ni que tu as récupéré la commande.',
 takeawaysAr:['اقرأ رقم الطلب واسم المطعم','اضغط «بدء الرحلة» عند الانطلاق'],takeawaysFr:['Vérifie la commande et le restaurant','Démarre au moment du départ']
},{
 id:'restaurant-map',chapter:'delivery',view:'restaurantMap',titleAr:'اضغط اسم المطعم لتفتح الخريطة',titleFr:'Le nom du restaurant ouvre la carte',
 captionAr:'الخانات الزرقاء تفتح خرائط Google وترشدك للموقع',captionFr:'La localisation bleue ouvre Google Maps',
 narrationAr:'هنا نقطة مهمة جداً، وركز معي. عندما ترى اسم المطعم أمامك في تفاصيل الطلب، اضغط على اسمه أو خانة الموقع الزرقاء. تفتح لك خرائط غوغل لتدلك مباشرة على موقع المطعم. لست بحاجة إلى كتابة عنوان المطعم يدوياً. تابع الطريق الذي تقترحه الخريطة، لكن اختر دائماً المسار الآمن واتبع قواعد المرور. وإذا واجهتك مشكلة في العثور على المطعم، تواصل مع الدعم بدلاً من تأكيد وصول لم يحدث.',
 narrationFr:'Voici une étape essentielle : appuie sur le nom du restaurant ou sa localisation bleue dans la commande. Google Maps s’ouvre et te guide vers le restaurant. Tu n’as pas besoin de saisir l’adresse toi-même. Suis un itinéraire sûr et ne confirme pas une arrivée fictive.',
 takeawaysAr:['اسم المطعم ← خرائط Google','لا تضغط «وصلت» أثناء الطريق'],takeawaysFr:['Nom du restaurant → Google Maps','Ne valide pas avant d’être arrivé']
},{
 id:'restaurant-arrival',chapter:'delivery',view:'restaurant',titleAr:'عند المطعم: «وصلت للمطعم»',titleFr:'Arrivée au restaurant',
 captionAr:'أكد الوصول أمام الباب وتحدث مع العاملين بأدب',captionFr:'Confirme sur place et présente-toi poliment',
 narrationAr:'حين تصل فعلياً إلى المطعم، ارجع إلى تطبيق السائق واضغط «وصلت للمطعم». الآن تقدم إلى العاملين بكل احترام وقل: السلام عليكم، أنا سائق بريستو، وجئت لاستلام الطلب رقم كذا. أعطهم رقم الطلب الصحيح. إذا كان المطعم ما زال يحضّر الوجبة، انتظر بهدوء ولا تستعجل العاملين. لو طال الانتظار أو ظهرت مشكلة، لا تدخل في شجار؛ تواصل مع دعم السائقين من التطبيق.',
 narrationFr:'Quand tu es réellement devant le restaurant, appuie sur «Arrivé au restaurant». Présente-toi poliment : «Bonjour, je suis le livreur Presto», puis donne le numéro de commande. Si la commande n’est pas prête, attends calmement. En cas de problème ou de désaccord, contacte le support.',
 takeawaysAr:['أكد الوصول في المكان الصحيح فقط','أعط رقم الطلب وانتظر بأدب'],takeawaysFr:['Confirme seulement sur place','Donne le bon numéro et reste poli']
},{
 id:'check-order',chapter:'delivery',view:'pickup',titleAr:'تأكد من كل صنف قبل المغادرة',titleFr:'Contrôle de la commande',
 captionAr:'الرقم، العدد، المشروبات، الصلصات، التغليف',captionFr:'Numéro, quantité, boissons, sauces et emballage',
 narrationAr:'قبل أن تتحرك من المطعم، تحقق من خمس نقاط. أولاً: هل رقم الطلب هو نفسه الذي يظهر في التطبيق؟ ثانياً: هل عدد المنتجات صحيح؟ ثالثاً: هل المشروبات موجودة؟ رابعاً: هل الصلصات والإضافات المطلوبة موجودة؟ خامساً: هل العبوات مغلقة ونظيفة؟ إذا كان التطبيق يعرض قائمة الأصناف في شاشة «تأكيد الاستلام»، حدد الأصناف التي استلمتها فعلاً. وإذا لاحظت نقصاً، أخبر المطعم فوراً قبل المغادرة، ولا تفتح تغليف الطلب دون إذن.',
 narrationFr:'Avant de quitter le restaurant, vérifie le numéro de commande, le nombre d’articles, les boissons, les sauces et la propreté des emballages. Coche les articles reçus si la liste s’affiche dans l’application. Signale tout manque avant de partir. N’ouvre jamais le colis sans autorisation.',
 takeawaysAr:['تحقق من 5 عناصر أساسية','أبلغ المطعم عن أي نقص فوراً'],takeawaysFr:['Vérifie cinq éléments essentiels','Signale tout article manquant']
},{
 id:'confirm-pickup',chapter:'delivery',view:'pickup',titleAr:'متى تضغط «تأكيد الاستلام»؟',titleFr:'Quand confirmer la récupération ?',
 captionAr:'بعد أن يكون الطلب كاملاً وفي حقيبتك بالفعل',captionFr:'Après réception complète dans ton sac',
 narrationAr:'بعد أن تتأكد أن الطلب كاملاً، ضعه بطريقة جيدة داخل حقيبة بريستو حتى يبقى نظيفاً وفي وضع آمن. الآن، وبعد أن أصبح الطلب معك فعلاً، اضغط على زر «تأكيد الاستلام». انتبه: لا تضغط هذا الزر بينما لا يزال المطعم يحضّر الوجبة، ولا تضغطه لأنك مستعجل. التأكيد يعني أنك مسؤول الآن عن الطلب الذي استلمته. حافظ على الحقيبة ولا تفتح الطلب أو تعدل محتوياته.',
 narrationFr:'Une fois la commande complète, range-la correctement dans le sac Presto. Seulement lorsque tu l’as réellement récupérée, appuie sur «Confirmer la réception». Ne valide pas pendant que le restaurant prépare encore le repas. Tu es désormais responsable du colis.',
 takeawaysAr:['الطلب في الحقيبة أولاً','بعدها فقط «تأكيد الاستلام»'],takeawaysFr:['Le colis dans le sac d’abord','Puis confirme la récupération']
},{
 id:'customer-map',chapter:'delivery',view:'customerMap',titleAr:'اضغط «الزبون» وافتح خريطته',titleFr:'Le client ouvre la deuxième carte',
 captionAr:'خريطة المطعم أولاً، وخريطة الزبون بعد الاستلام',captionFr:'Restaurant d’abord, client ensuite',
 narrationAr:'بعد استلام الطلب، عد إلى تفاصيله وابحث عن خانة «الزبون» أو موقعه الأزرق. اضغط على الزبون، فستفتح خرائط غوغل مجدداً، ولكن هذه المرة لتدلّك على عنوان الزبون وليس عنوان المطعم. هذه نقطة يجب أن تتذكرها جيداً: اسم المطعم يفتح خريطة المطعم، وخانة الزبون تفتح خريطة الزبون. يمكنك التواصل مع الزبون من خلال خيارات الاتصال أو الرسائل داخل التطبيق إذا احتجت إلى توضيح موقعه.',
 narrationFr:'Après avoir récupéré la commande, appuie sur «Client» ou sa localisation bleue. Google Maps s’ouvre cette fois vers l’adresse du client. Rappelle-toi : le restaurant ouvre la première carte, le client ouvre la seconde. Si nécessaire, appelle ou écris au client depuis l’application.',
 takeawaysAr:['اضغط الزبون لتوجيه الخريطة','اتصل من التطبيق عند الحاجة'],takeawaysFr:['Appuie sur le client pour l’itinéraire','Contacte-le dans l’application']
},{
 id:'customer-arrival',chapter:'delivery',view:'arrival',titleAr:'أبلغ الزبون: «وصلت للزبون»',titleFr:'Prévenir le client de ton arrivée',
 captionAr:'يضغط هذا الزر عند عنوان الزبون فقط',captionFr:'Le client reçoit une notification sur place',
 narrationAr:'عندما تصل فعلاً إلى عنوان الزبون، توقف في مكان آمن، ثم اضغط «وصلت للزبون». بمجرد الضغط في الوقت الصحيح، تصله رسالة أو إشعار بوصولك. يمكنك أن تقول له بأدب: السلام عليكم، أنا سائق بريستو، وصلت بطلبك. لا تحفظ رقم الزبون عندك، ولا تتصل به خارج نطاق هذا الطلب. انتظر حتى يأتي لاستلام الوجبة، وتعامل معه بهدوء واحترام.',
 narrationFr:'Une fois à l’adresse du client, arrête-toi en sécurité et appuie sur «Arrivé chez le client». Le client reçoit une alerte. Présente-toi poliment. Son numéro ne sert que pour cette commande : ne le conserve pas et ne le contacte pas en dehors de la livraison.',
 takeawaysAr:['وصول حقيقي قبل إشعار الوصول','احفظ خصوصية الزبون'],takeawaysFr:['Une vraie arrivée avant la notification','Respecte la confidentialité du client']
},{
 id:'customer-money',chapter:'delivery',view:'delivery',titleAr:'سلّم الطلب واستلم المبلغ الصحيح',titleFr:'Remise du colis et paiement',
 captionAr:'تأكد من المبلغ وردّ الباقي كاملاً',captionFr:'Encaisse le montant exact et rends la monnaie',
 narrationAr:'الآن وصلت إلى مرحلة التسليم. سلّم الطلب للزبون كاملاً وبابتسامة، وتحقق من المبلغ المستحق بالطريقة الظاهرة في التطبيق. إذا دفع نقداً، تأكد من قيمة النقود وردّ له الباقي كاملاً. لا تتصرف في أموال الزبون وكأنها أرباحك. إذا لم يتوفر لديك صرف كافٍ، يشير دليل بريستو إلى خيار «شحن محفظة الزبون» لوضع الباقي في محفظته وفق آلية التطبيق. لا تضغط «تم التوصيل» حتى تنهي التسليم والدفع بالفعل.',
 narrationFr:'Remets toute la commande avec le sourire. Vérifie le montant à encaisser. En espèces, rends intégralement la monnaie. Si tu n’as pas de monnaie, le guide prévoit «Recharger le portefeuille client». Ne valide pas la livraison tant que la commande n’a pas été remise et payée.',
 takeawaysAr:['ردّ الباقي كاملاً','محفظة الزبون عند عدم توفر الصرف'],takeawaysFr:['Rends toute la monnaie','Utilise le portefeuille si nécessaire']
},{
 id:'delivered',chapter:'delivery',view:'delivery',titleAr:'آخر زر: «تم التوصيل للزبون»',titleFr:'Dernière étape : livraison effectuée',
 captionAr:'بعد التسليم الكامل والدفع، وليس قبل ذلك',captionFr:'Uniquement après remise et paiement',
 narrationAr:'بعد أن يستلم الزبون طلبه كاملاً، وبعد أن تتم عملية الدفع وردّ الباقي، عندها فقط اضغط «تم التوصيل للزبون». هذا الزر يعني أن المهمة انتهت فعلياً. لا تضغط «وصلت للمطعم» و«تأكيد الاستلام» و«وصلت للزبون» و«تم التوصيل» دفعة واحدة وأنت في مكان واحد. تذكّر القاعدة الذهبية في بريستو: نقرة واحدة تعني خطوة واحدة حقيقية، وفي وقت حدوثها.',
 narrationFr:'Lorsque le client a reçu toute la commande et que le paiement est terminé, appuie enfin sur «Livraison effectuée». N’appuie jamais sur tous les boutons en restant au restaurant. La règle d’or chez Presto : un clic correspond à une étape réelle, au bon moment.',
 takeawaysAr:['التسليم والدفع أولاً','نقرة واحدة = خطوة واحدة'],takeawaysFr:['Remise et paiement d’abord','Un clic = une étape réelle']
},{
 id:'earnings',chapter:'finance',view:'earnings',titleAr:'كيف تُحسب أجرتك؟',titleFr:'Comment calculer tes gains ?',
 captionAr:'عمولة 0%، والأجرة لكل رحلة حسب المسافة',captionFr:'Zéro commission, rémunération selon la distance',
 narrationAr:'لنشرح الآن شيئاً يهمك كثيراً: أرباحك. حسب دليل بريستو، الشركة لا تخصم عمولة من أجرة رحلاتك، أي صفر بالمئة. تُحسب أجرتك حسب المسافة. من صفر إلى أربعة كيلومترات تحصل على مئة أوقية. ومن أربعة إلى خمسة كيلومترات مئة وعشرين أوقية. ومن خمسة إلى ستة كيلومترات مئة وأربعين. ومن ستة إلى سبعة كيلومترات مئة وستين. ومن سبعة إلى ثمانية كيلومترات مئة وثمانين. ومن ثمانية إلى أحد عشر كيلومتراً مئتي أوقية. هذه هي الشرائح المذكورة في الدليل، وأي حالة خارجها راجع تفاصيلها في التطبيق أو مع الإدارة.',
 narrationFr:'Parlons de tes gains. Selon le guide Presto, zéro pour cent de commission est prélevé sur tes courses. De zéro à quatre kilomètres : cent ouguiyas. De quatre à cinq : cent vingt. De cinq à six : cent quarante. De six à sept : cent soixante. De sept à huit : cent quatre-vingts. Et de huit à onze kilomètres : deux cents ouguiyas. Pour les trajets hors de ces tranches, vérifie les informations dans l’application ou auprès de Presto.',
 takeawaysAr:['0% عمولة حسب الدليل','100–200 MRU ضمن المسافات المذكورة'],takeawaysFr:['0 % de commission selon le guide','De 100 à 200 MRU selon la distance']
},{
 id:'example',chapter:'finance',view:'earnings',titleAr:'مثال عملي على حساب أجرتك',titleFr:'Exemple concret de rémunération',
 captionAr:'مسافة 5.5 كم = 140 أوقية حسب الجدول',captionFr:'5,5 km = 140 MRU selon le barème',
 narrationAr:'دعني أعطيك مثالاً بسيطاً. وصلتَ طلباً وكانت المسافة خمسة كيلومترات ونصف. هذه تقع ضمن شريحة خمسة إلى ستة كيلومترات، فيكون المقابل حسب الجدول مئة وأربعين أوقية. ولو كانت المسافة ثلاثة كيلومترات، فالأجرة مئة أوقية. ولو كانت تسعة كيلومترات، فالأجرة مئتا أوقية. هكذا تعرف بصورة مبدئية كيف تقرأ جدول الأجرة. اعتمد دائماً القيمة المعروضة رسمياً لرحلتك في التطبيق.',
 narrationFr:'Exemple : si une course mesure cinq kilomètres et demi, elle correspond à la tranche de cinq à six kilomètres, soit cent quarante ouguiyas selon le tableau. Pour trois kilomètres : cent ouguiyas. Pour neuf kilomètres : deux cents. Vérifie toujours le montant affiché officiellement pour ta course.',
 takeawaysAr:['5.5 كم ← 140 MRU','القيمة النهائية المعتمدة في التطبيق'],takeawaysFr:['5,5 km → 140 MRU','Montant final à vérifier dans l’application']
},{
 id:'bankily',chapter:'finance',view:'bankily',titleAr:'أرباحك ومال العملاء: ما الفرق؟',titleFr:'Tes gains et les fonds des clients',
 captionAr:'ما تربحه لك، وما عدا ذلك أمانة تُسوّى يومياً',captionFr:'Tes gains sont à toi, le reste doit être reversé',
 narrationAr:'انتبه للفرق بين أجرتك والمال الذي تستلمه من الزبائن. إذا استلمت خلال عملك ثلاثة آلاف أوقية، وكانت أرباح التوصيل ستمئة أوقية، فهذا لا يعني أن الثلاثة آلاف كلها ملكك. حسب المثال الموجود في دليل بريستو، تحتفظ بستمئة أوقية، وتسلّم ألفين وأربعمئة أوقية. أي ثلاثة آلاف ناقص ستمئة يساوي ألفين وأربعمئة. هذا المبلغ المتبقي أمانة، وليس ربحاً إضافياً. راجع خانة أرباحي ومعلومات التسوية في التطبيق.',
 narrationFr:'Attention à la différence entre ton salaire de livraison et l’argent encaissé pour Presto. Exemple donné dans le guide : tu as reçu trois mille ouguiyas et tu as gagné six cents pour tes courses. Tu gardes six cents et tu dois reverser deux mille quatre cents ouguiyas. L’argent du client est un dépôt, pas un gain supplémentaire.',
 takeawaysAr:['3,000 − 600 = 2,400 MRU','مال الزبون أمانة'],takeawaysFr:['3 000 − 600 = 2 400 MRU','Les fonds du client sont un dépôt']
},{
 id:'bankily-transfer',chapter:'finance',view:'bankily',titleAr:'كيف تُسلّم المال عبر Bankily؟',titleFr:'Versement quotidien par Bankily',
 captionAr:'رمز التاجر في الدليل 027901 واحتفظ بإثبات التحويل',captionFr:'Code commerçant du guide : 027901',
 narrationAr:'يوضح دليل بريستو أن السائق يسلّم المبالغ المستحقة يومياً عبر بنكيلي. رمز التاجر المدوّن في الدليل هو: صفر، اثنان، سبعة، تسعة، صفر، واحد، أي 027901. تحقق من تعليمات الإدارة وصحة جهة الدفع قبل أي تحويل، ثم حوّل المبلغ المطلوب، واحتفظ بصورة العملية أو رسالة تأكيد التحويل. لا تحذف الإثبات. وبهذا تكون قد حافظت على أجرتك وسوّيت المال الذي يخص الشركة. لا تحوّل أبداً إلى جهة غير مؤكدة.',
 narrationFr:'Le guide Presto demande de verser chaque jour les sommes dues par Bankily. Le code commerçant indiqué est 027901. Vérifie d’abord les consignes et le destinataire officiel avant tout transfert. Verse le montant dû, puis garde une capture ou un justificatif. N’efface pas la preuve du paiement.',
 takeawaysAr:['التسوية اليومية عبر Bankily','احتفظ بإثبات الدفع'],takeawaysFr:['Versement quotidien Bankily','Conserve le justificatif']
},{
 id:'wallet',chapter:'finance',view:'wallet',titleAr:'ليس عندك الباقي؟ محفظة الزبون',titleFr:'Pas de monnaie ? Portefeuille client',
 captionAr:'استخدم «شحن محفظة الزبون» وفق التطبيق',captionFr:'Utilise «Recharger le portefeuille client»',
 narrationAr:'لنفترض أن حساب الزبون أربعمئة وثلاثون أوقية، وأعطاك خمسمئة أوقية. الباقي سبعون أوقية وهو حق للزبون. الأفضل أن ترد له السبعين كاملة. إذا لم يكن عندك صرف، يذكر دليل بريستو خيار «شحن محفظة الزبون»، بحيث يُعاد الباقي إلى محفظته داخل التطبيق. اتبع التعليمات التي تظهر لك، ولا تحتفظ بالباقي لنفسك. إذا لم تفهم العملية، اسأل الدعم قبل التأكيد.',
 narrationFr:'Imaginons une commande à quatre cent trente ouguiyas payée avec cinq cents. La monnaie due au client est soixante-dix ouguiyas. Si tu ne peux pas la rendre en espèces, le guide décrit l’option «Recharger le portefeuille client» pour créditer ce montant dans l’application. Ne garde pas la différence pour toi.',
 takeawaysAr:['500 − 430 = 70 MRU للزبون','لا تحتفظ بفارق الصرف'],takeawaysFr:['500 − 430 = 70 MRU au client','Ne garde pas la différence']
},{
 id:'support',chapter:'issues',view:'support',titleAr:'ماذا تفعل إذا لم يردّ الزبون؟',titleFr:'Le client ne répond pas',
 captionAr:'اتصال ورسائل 15 دقيقة ثم دعم السائقين',captionFr:'Appels et messages 15 minutes, puis support',
 narrationAr:'إذا وصلت إلى العنوان ولم يجبك الزبون، لا تترك الطلب أمام الباب ولا تعتبره قد سُلّم. حاول الاتصال به وإرسال رسائل عبر تطبيق بريستو لمدة خمس عشرة دقيقة. إذا مرّت المدة وما زال لا يرد، تواصل مع دعم السائقين من داخل التطبيق. أعطهم رقم الطلب واشرح المشكلة بوضوح، ثم اتبع قرار الدعم بشأن التوصيل أو الإلغاء. لا تقرر إلغاء الطلب أو الاحتفاظ به من تلقاء نفسك.',
 narrationFr:'Si le client ne répond pas, ne laisse pas la commande devant sa porte et ne valide pas la livraison. Essaie appels et messages dans l’application pendant quinze minutes. Ensuite, contacte le support, donne le numéro de commande et suis sa décision : livraison ou annulation.',
 takeawaysAr:['15 دقيقة اتصالات ورسائل','الدعم يقرر الخطوة التالية'],takeawaysFr:['15 minutes d’appels et messages','Le support décide de la suite']
},{
 id:'wrong-address',chapter:'issues',view:'support',titleAr:'العنوان خاطئ أو بعيد',titleFr:'Adresse erronée ou trop éloignée',
 captionAr:'العنوان البعيد للدعم، ولا تطلب زيادة من الزبون',captionFr:'Adresse éloignée : support, sans supplément',
 narrationAr:'لو اكتشفت أن الزبون أعطى عنواناً خاطئاً، انظر إلى طبيعة الاختلاف. يذكر الدليل أنه إذا كان التصحيح قريباً يمكنك إكمال التوصيل مباشرة. أما إذا كان العنوان الحقيقي بعيداً، فتواصل مع دعم السائقين قبل التوجه. لا تطلب من الزبون أجرة إضافية من عندك. أخبر الدعم برقم الطلب والمشكلة، ثم اتبع توجيههم.',
 narrationFr:'Si l’adresse est erronée mais que la bonne adresse est toute proche, le guide permet de livrer directement. Si elle est éloignée, contacte le support. Ne demande jamais un supplément au client. Donne le numéro de commande et suis les instructions.',
 takeawaysAr:['القريب يمكن توصيله','البعيد للدعم دون رسوم إضافية'],takeawaysFr:['Adresse proche : livraison possible','Adresse loin : contacte le support']
},{
 id:'restaurant-delay',chapter:'issues',view:'restaurant',titleAr:'المطعم متأخر أو الطلب غير صحيح',titleFr:'Retard ou erreur au restaurant',
 captionAr:'انتظر بهدوء، وأبلغ المطعم ثم الدعم عند الحاجة',captionFr:'Signale le problème sans dispute',
 narrationAr:'أحياناً تجد المطعم متأخراً، أو تكتشف أن الطلب ناقص أو غير مطابق. لا تغادر بطلب غير صحيح. أخبر العاملين بما ينقص حتى يُصلحوه، وإذا استمر الإشكال تواصل مع الدعم. إذا تأخر إعداد الطعام، انتظر بهدوء، ومع التأخر الطويل أخبر الدعم أيضاً. تذكّر أن احترام العاملين جزء من عملك، ولا يسمح بالجدال أو الإهانة مهما كان التأخير.',
 narrationFr:'Le restaurant est en retard ? Attends calmement et préviens le support si l’attente se prolonge. Une commande incorrecte ou incomplète ? Ne pars pas. Préviens le personnel puis le support au besoin. Reste poli, sans dispute.',
 takeawaysAr:['لا تغادر بطلب غير صحيح','التأخر الطويل يُبلّغ للدعم'],takeawaysFr:['Ne pars pas avec une commande incorrecte','Long retard : support']
},{
 id:'phone-problem',chapter:'issues',view:'support',titleAr:'التطبيق متوقف أو الإنترنت منقطع',titleFr:'Application bloquée ou sans réseau',
 captionAr:'لا تؤكد خطوة لم تحدث؛ أبلغ بريستو عندما تستطيع',captionFr:'Ne valide rien à l’avance',
 narrationAr:'إذا توقف تطبيق السائق فجأة أو انقطع الإنترنت، لا تضغط خطوات لاحقة وكأنها حصلت، ولا تسجّل وصولاً أو تسليماً غير حقيقي. ركّز أولاً على سلامة الطلب والطريق، وحاول استعادة الاتصال بالطريقة المعتادة. عندما يصبح التواصل ممكناً، أبلغ بريستو في أقرب فرصة. الدليل لا يحدد وسيلة بديلة ثابتة للتواصل في هذه الحالة، لذلك اتبع التعليمات الرسمية التي تعطيك إياها الإدارة.',
 narrationFr:'En cas de panne de l’application ou de réseau, ne valide aucune étape en avance. Protège la commande, puis informe Presto dès que possible. Le guide ne précise pas de canal de secours unique : suis les consignes officielles de l’équipe.',
 takeawaysAr:['لا تؤكد مقدماً','وسيلة التواصل البديلة يحددها الدعم'],takeawaysFr:['Ne valide pas à l’avance','Suis les consignes du support']
},{
 id:'refusal',chapter:'issues',view:'support',titleAr:'رفض الزبون الطلب أو أُلغي بعد الاستلام',titleFr:'Refus du client après récupération',
 captionAr:'أبلغ الدعم؛ هو من يتولى الإلغاء',captionFr:'Le support gère l’annulation',
 narrationAr:'إذا رفض الزبون استلام الطلب، لا تتصرف وحدك ولا تغيّر حالة المهمة بلا توجيه. تواصل مع دعم السائقين وأعطهم رقم الطلب، ثم اتبع قرارهم. الدليل المطوّل يقول إن الطلب الذي استلمته من المطعم تبقى أجرته مستحقة حتى لو أُلغي لاحقاً؛ لكن تأكد من تطبيق السياسة على حالتك عبر الدعم. لا تعد الزبون أو نفسك بأي تعويض من دون تأكيد.',
 narrationFr:'Si le client refuse la commande après récupération, contacte l’assistance avec le numéro de commande. Le support gère l’annulation. Le guide détaillé indique qu’une commande déjà récupérée reste rémunérée, mais fais confirmer la règle applicable à ta situation par Presto.',
 takeawaysAr:['الإلغاء عن طريق الدعم','الطلب المستلم تبقى أجرته وفق الدليل'],takeawaysFr:['Annulation par le support','Course récupérée rémunérée selon le guide']
},{
 id:'safety',chapter:'issues',view:'safety',titleAr:'السلامة والاحتراف قبل كل شيء',titleFr:'Sécurité et professionnalisme',
 captionAr:'مظهر لائق، حقيبة نظيفة، طريق آمن، بلا مرافق',captionFr:'Tenue correcte, sac propre, trajet sûr',
 narrationAr:'عند كل رحلة، مظهرك وحديثك وهدوؤك يمثّلون بريستو. حافظ على نظافة الحقيبة، وقد بحذر، ولا تخاطر بحياتك لتوفير دقيقة. لا تصطحب مرافقاً أثناء التوصيل، ولا تعمل تحت تأثير مسكر أو مخدر، ولا تُهن أحداً. عند وقوع حادث، السلامة أولاً، اطلب الإسعاف إذا كان هناك مصاب، ثم أبلغ بريستو. لا تدخل في جدال أو تقدم إقراراً متسرعاً بمسؤولية قانونية قبل معرفة الوقائع.',
 narrationFr:'Ta tenue, ton langage et ton calme représentent Presto. Garde le sac propre, suis un itinéraire sûr, et ne prends pas d’accompagnant pendant la course. Ne travaille jamais sous l’influence de substances. En cas d’accident, protège d’abord les personnes, appelle les secours si nécessaire, puis préviens Presto.',
 takeawaysAr:['قد بأمان وكن محترفاً','عند حادث: السلامة ثم الدعم'],takeawaysFr:['Conduis prudemment et reste professionnel','Accident : secours puis support']
},{
 id:'rules',chapter:'issues',view:'rules',titleAr:'أشياء ممنوعة تماماً',titleFr:'Ce qui est strictement interdit',
 captionAr:'لا تشارك الحساب أو رقم الزبون أو تغيّر الطلب',captionFr:'Ne partage ni le compte ni les données du client',
 narrationAr:'هذه القواعد تحميك وتحمي الزبون. ممنوع أن تعطي حسابك لشخص آخر، أو أن تفتح الطلب أو تغيّر محتوياته دون إذن، أو أن تلغي طلباً وتتخلى عنه بنفسك. ممنوع الاحتفاظ بمال العملاء أو أرقام هواتفهم أو نشرها، وممنوع الاتصال بالزبون خارج الطلب، أو طلب رسوم إضافية منه، أو السب والاعتداء. أي مخالفة من هذه المخالفات قد تؤدي إلى إيقاف حساب السائق. احفظ خصوصية العملاء والتزم بالتعليمات.',
 narrationFr:'Ces règles te protègent et protègent le client. Ne prête pas ton compte, n’ouvre et ne modifie pas une commande, n’abandonne pas une course seul. Ne garde ni l’argent ni le numéro du client, ne demande pas de supplément, et ne contacte pas le client hors commande. Toute infraction peut entraîner une suspension.',
 takeawaysAr:['احمِ حسابك وبيانات الزبون','المخالفة قد تؤدي إلى إيقاف الحساب'],takeawaysFr:['Protège ton compte et les données clients','Une infraction peut suspendre le compte']
},{
 id:'finish',chapter:'issues',view:'finish',titleAr:'أصبحت جاهزاً لأول توصيلة!',titleFr:'Prêt pour ta première livraison !',
 captionAr:'كل زر في وقته · مال الزبون أمانة · الدعم أولاً',captionFr:'Chaque bouton au bon moment · Support d’abord',
 narrationAr:'أحسنت! لنراجع أهم ما تعلمناه. الزبون يطلب عبر تطبيقه، وأنت تعمل بتطبيق السائق. تبدأ الرحلة، وتضغط اسم المطعم لتفتح خريطته. عند المطعم تضغط وصلت للمطعم، وتراجع الأصناف ثم تؤكد الاستلام. بعدها تضغط الزبون فتفتح خريطته، وعند عنوانه تضغط وصلت للزبون، وبعد تسليم الطلب واستلام المبلغ تضغط تم التوصيل. احتفظ بأرباحك، وسوِّ بقية المال حسب تعليمات بريستو، واستعن بالدعم عند المشكلة. نتمنى لك توصيلات آمنة وناجحة!',
 narrationFr:'Bravo ! Récapitulons : le client commande dans son application. Tu démarres, puis tu appuies sur le restaurant pour ouvrir sa carte. Sur place, tu signales ton arrivée, tu vérifies et récupères le colis. Ensuite, le client ouvre la deuxième carte. Tu annonces ton arrivée, puis tu confirmes la livraison après remise et paiement. Garde tes gains, reverse les fonds dus et contacte le support en cas de problème.',
 takeawaysAr:['اسم المطعم ← خريطته؛ الزبون ← خريطته','نقرة واحدة = خطوة حقيقية'],takeawaysFr:['Restaurant → sa carte ; client → sa carte','Un clic = une étape réelle']
}
];
export const guideRates=[{from:'0 – 4',amount:100},{from:'4 – 5',amount:120},{from:'5 – 6',amount:140},{from:'6 – 7',amount:160},{from:'7 – 8',amount:180},{from:'8 – 11',amount:200}] as const;
export const guideQuiz=[
 {ar:'أنت أمام المطعم الآن، على ماذا تضغط؟',fr:'Tu es devant le restaurant. Quel bouton utiliser ?',optionsAr:['وصلت للمطعم','تم التوصيل','تأكيد الاستلام'],optionsFr:['Arrivé au restaurant','Livraison effectuée','Récupération confirmée'],correct:0},
 {ar:'متى تضغط تأكيد الاستلام؟',fr:'Quand confirmer la récupération ?',optionsAr:['قبل تجهيز الطلب','بعد المراجعة ووضعه في الحقيبة','بعد وصولك للزبون'],optionsFr:['Avant préparation','Après vérification dans le sac','Chez le client'],correct:1},
 {ar:'كيف تصل إلى المطعم؟',fr:'Comment ouvrir la route vers le restaurant ?',optionsAr:['تضغط اسمه أو موقعه الأزرق','تضغط تم التوصيل','تطلب من الزبون العنوان'],optionsFr:['Appuyer sur son nom ou sa localisation','Valider la livraison','Demander au client'],correct:0},
 {ar:'وماذا تضغط لتفتح خريطة الزبون؟',fr:'Comment ouvrir la carte du client ?',optionsAr:['اسم الزبون أو خانة الزبون','وصلت للمطعم','أرباحي'],optionsFr:['Le client ou sa localisation','Arrivé au restaurant','Mes gains'],correct:0},
 {ar:'أجرة مسافة 5.5 كم حسب الدليل؟',fr:'Rémunération pour 5,5 km selon le guide ?',optionsAr:['100 MRU','140 MRU','200 MRU'],optionsFr:['100 MRU','140 MRU','200 MRU'],correct:1},
 {ar:'نسبة عمولة بريستو على أجرة رحلاتك وفق الدليل؟',fr:'Commission sur la course selon le guide ?',optionsAr:['0%','10%','25%'],optionsFr:['0 %','10 %','25 %'],correct:0},
 {ar:'استلمت 3,000 MRU وأرباحك 600. كم تُسلّم؟',fr:'Encaissé 3 000 MRU, gains 600. Quel montant reverser ?',optionsAr:['600','2,400','3,000'],optionsFr:['600','2 400','3 000'],correct:1},
 {ar:'الزبون لا يرد، ماذا تفعل؟',fr:'Client injoignable : que faire ?',optionsAr:['ترك الطلب','اتصالات ورسائل 15 دقيقة ثم الدعم','تأكيد التوصيل فوراً'],optionsFr:['Laisser la commande','Appels/messages 15 min puis support','Valider immédiatement'],correct:1},
 {ar:'متى تضغط «تم التوصيل للزبون»؟',fr:'Quand confirmer la livraison ?',optionsAr:['بمجرد وصولك للمطعم','بعد استلام الطلب فقط','بعد التسليم والدفع الكامل'],optionsFr:['Au restaurant','Après récupération','Après remise et paiement'],correct:2},
 {ar:'إذا تأخر المطعم أو كان الطلب ناقصاً؟',fr:'Retard du restaurant ou commande incomplète ?',optionsAr:['تشاجر مع العامل','أبلغ المطعم ثم الدعم بهدوء','افتح الطلب وغير محتواه'],optionsFr:['Se disputer','Prévenir le restaurant puis le support','Modifier le colis'],correct:1}
] as const;

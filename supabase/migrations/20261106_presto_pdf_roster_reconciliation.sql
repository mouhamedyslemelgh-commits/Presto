-- Source: 5-page PRESTO equipment/training roster dated 2026-11-06.
-- Preserve existing people. Reconcile by digits-only phone and one confirmed same-person phone correction.
begin;
alter table public.presto_drivers add column if not exists license_plate text not null default '';
alter table public.presto_drivers add column if not exists presto_reference text not null default '';
alter table public.presto_drivers add column if not exists pdf_position integer;
alter table public.presto_drivers add column if not exists training_completed boolean;
alter table public.presto_drivers add column if not exists pdf_source_phone text not null default '';
alter table public.presto_drivers add column if not exists pdf_source_date date;
create unique index if not exists presto_drivers_pdf_position_unique
 on public.presto_drivers(pdf_position) where pdf_position is not null;

create temporary table _presto_roster_import(
 pdf_position int primary key, phone text unique, license_plate text, presto_reference text unique,
 pdf_source_date date, training_completed boolean, imported_name text
) on commit drop;
insert into _presto_roster_import values
(1,'48888655','5467 AA 00','7701',to_date('01/11/2026','DD/MM/YYYY'),true,'محمد سيد'),
(2,'20852540','2311 AE 06','7664',to_date('01/11/2026','DD/MM/YYYY'),true,'طاه سليم مصطفى'),
(3,'34378733','4942 BC 00','7661',to_date('01/11/2026','DD/MM/YYYY'),true,'محمدو جوب'),
(4,'31002051','8169 BA 00','7648',to_date('31/10/2026','DD/MM/YYYY'),true,'اخيارهم محمد العيد'),
(5,'48008853','9159 AB 03','7629',to_date('31/10/2026','DD/MM/YYYY'),true,''),
(6,'34224544','7316 BC 00','7628',to_date('31/10/2026','DD/MM/YYYY'),true,'محمد فال حداد'),
(7,'41331442','3582 BE 00','7627',to_date('31/10/2026','DD/MM/YYYY'),true,'سيدنا معطل'),
(8,'34115930','3606 BE 00','7599',to_date('30/10/2026','DD/MM/YYYY'),true,'عبدول مصطفى'),
(9,'20503920','5683 AA 04','7596',to_date('31/10/2026','DD/MM/YYYY'),true,'محمد انجاي'),
(10,'31200811','0332 BC 00','7561',to_date('31/10/2026','DD/MM/YYYY'),true,'محمد سدينا'),
(11,'49556581','7008 BB 00','7551',to_date('31/10/2026','DD/MM/YYYY'),true,'عالي صال'),
(12,'38309493','7403 BA 00','7550',to_date('31/10/2026','DD/MM/YYYY'),true,'احمد بوبو'),
(13,'46471292','9551 BC 00','7543',to_date('31/10/2026','DD/MM/YYYY'),true,'احمد الناهي'),
(14,'30457447','8482 AA 05','7515',to_date('05/11/2026','DD/MM/YYYY'),true,'الشيخ سيد الطاهر محمدو'),
(15,'31490072','5274 AA 00','7507',to_date('31/10/2026','DD/MM/YYYY'),true,'حامد اليمباري'),
(16,'31117714','1546 BE 00','7505',to_date('31/10/2026','DD/MM/YYYY'),true,'محمد غلام لظف'),
(17,'48353624','0575 BC 00','7503',to_date('31/10/2026','DD/MM/YYYY'),true,'سيدي ميل'),
(18,'38050036','4226 AE 06','7502',to_date('30/10/2026','DD/MM/YYYY'),true,'محمد احمد'),
(19,'48593123','8837 BC 00','7501',to_date('31/10/2026','DD/MM/YYYY'),true,'أحمد صار'),
(20,'49985395','2155 AC 07','7496',to_date('01/11/2026','DD/MM/YYYY'),true,'بادي امجيد'),
(21,'42351608','8466 BA 00','7473',to_date('31/10/2026','DD/MM/YYYY'),true,'تيزو مونتقى'),
(22,'38666350','8549 AA 05','7472',to_date('27/10/2026','DD/MM/YYYY'),true,''),
(23,'46220946','0224 BC 00','7471',to_date('27/10/2026','DD/MM/YYYY'),true,''),
(24,'43178284','2324 BC 00','7466',to_date('27/10/2026','DD/MM/YYYY'),false,''),
(25,'41474754','8126 BC 00','7465',to_date('27/10/2026','DD/MM/YYYY'),false,''),
(26,'48214137','8684 BB 00','7461',to_date('27/10/2026','DD/MM/YYYY'),true,''),
(27,'38372067','5117 BE 00','7460',to_date('27/10/2026','DD/MM/YYYY'),true,''),
(28,'33620793','1676 BE 00','7459',to_date('27/10/2026','DD/MM/YYYY'),false,''),
(29,'28011444','2360 BC 00','7455',to_date('27/10/2026','DD/MM/YYYY'),false,''),
(30,'37279003','2053 BE 00','7419',to_date('26/10/2026','DD/MM/YYYY'),true,''),
(31,'46587089','3542 BE 00','7418',to_date('31/10/2026','DD/MM/YYYY'),true,'محمدو كيتا كيتا'),
(32,'20061596','2622 BC 00','7363',to_date('25/10/2026','DD/MM/YYYY'),true,''),
(33,'24270595','8381 BA 00','7362',to_date('25/10/2026','DD/MM/YYYY'),true,''),
(34,'22448010','8102 BA 00','7359',to_date('25/10/2026','DD/MM/YYYY'),true,''),
(35,'20405636','1922 AA 10','7319',to_date('28/10/2026','DD/MM/YYYY'),false,''),
(36,'33643690','2355 BC 00','7273',to_date('23/10/2026','DD/MM/YYYY'),false,''),
(37,'32162030','8248 BA 00','7272',to_date('23/10/2026','DD/MM/YYYY'),false,''),
(38,'43235012','3700 BB 00','7192',to_date('27/10/2026','DD/MM/YYYY'),false,''),
(39,'41969909','','7191',to_date('29/10/2026','DD/MM/YYYY'),true,''),
(40,'32217292','0683 BE 00','7157',to_date('25/10/2026','DD/MM/YYYY'),true,''),
(41,'43701275','9472 AA 01','7155',to_date('22/10/2026','DD/MM/YYYY'),true,''),
(42,'38614178','9397 BB 00','7151',to_date('25/07/2026','DD/MM/YYYY'),false,''),
(43,'20353480','7850 BC 00','7137',to_date('01/11/2026','DD/MM/YYYY'),true,'حمه امصيكره'),
(44,'47692015','4769 BE 00','7133',to_date('30/10/2026','DD/MM/YYYY'),true,''),
(45,'47939349','0991 BE 00','7132',to_date('29/10/2026','DD/MM/YYYY'),true,''),
(46,'28644031','9751 AA 12','7058',to_date('19/10/2026','DD/MM/YYYY'),true,''),
(47,'44123681','2233 BE 00','6996',to_date('19/10/2026','DD/MM/YYYY'),true,''),
(48,'41494575','','6995',to_date('19/10/2026','DD/MM/YYYY'),true,''),
(49,'49639831','1260 BC 00','6994',to_date('19/10/2026','DD/MM/YYYY'),true,''),
(50,'43613025','','6990',to_date('28/10/2026','DD/MM/YYYY'),true,''),
(51,'27341228','','6867',to_date('24/10/2026','DD/MM/YYYY'),false,''),
(52,'38083229','2877 AB 02','6697',to_date('25/10/2026','DD/MM/YYYY'),true,''),
(53,'34890553','2427 BE 00','6696',to_date('26/10/2026','DD/MM/YYYY'),true,'سيدي الامين يوسف'),
(54,'37770475','2427 BE 00','6695',to_date('27/10/2026','DD/MM/YYYY'),true,''),
(55,'34823038','1145 BC 00','6648',to_date('26/10/2026','DD/MM/YYYY'),false,''),
(56,'28604573','1116 AE 06','6642',to_date('19/10/2026','DD/MM/YYYY'),false,''),
(57,'24169716','2632 BC 00','6641',to_date('19/10/2026','DD/MM/YYYY'),true,''),
(58,'31736168','0792 BC 00','6640',to_date('26/10/2026','DD/MM/YYYY'),true,''),
(59,'34173559','8167 AB 03','6588',to_date('19/10/2026','DD/MM/YYYY'),false,''),
(60,'42607608','0176 BE 00','6586',to_date('29/10/2026','DD/MM/YYYY'),false,''),
(61,'20054109','4023 BE 00','6544',to_date('04/11/2026','DD/MM/YYYY'),false,'النجاح عبد الرحمان السالك'),
(62,'41074323','1307 AE 06','6543',to_date('24/10/2026','DD/MM/YYYY'),true,''),
(63,'31304400','7265 BC 00','6498',to_date('21/10/2026','DD/MM/YYYY'),false,''),
(64,'49894170','1033 BC 00','6436',to_date('19/10/2026','DD/MM/YYYY'),false,''),
(65,'20110799','1749 BE 00','6346',to_date('20/10/2026','DD/MM/YYYY'),true,''),
(66,'34355235','3297 BE 00','6345',to_date('20/10/2026','DD/MM/YYYY'),false,''),
(67,'46550228','4348 BC 00','6278',to_date('20/10/2026','DD/MM/YYYY'),true,''),
(68,'20882678','8976 BC 00','6233',to_date('20/10/2026','DD/MM/YYYY'),false,''),
(69,'36668688','8785 AA 05','6232',to_date('23/10/2026','DD/MM/YYYY'),true,''),
(70,'37330811','2849 BE 00','6231',to_date('20/10/2026','DD/MM/YYYY'),false,''),
(71,'41969809','','6230',to_date('22/10/2026','DD/MM/YYYY'),false,''),
(72,'22023843','2358 BC 00','6229',to_date('22/10/2026','DD/MM/YYYY'),true,''),
(73,'32887710','4605 BC 00','6225',to_date('30/10/2026','DD/MM/YYYY'),true,'محمد عبد الكريم المامي'),
(74,'33827614','','6222',to_date('31/10/2026','DD/MM/YYYY'),false,'سري بيرو'),
(75,'43435697','3776 BC 00','6218',to_date('29/10/2026','DD/MM/YYYY'),true,''),
(76,'38148763','2096 BE 00','6171',to_date('30/10/2026','DD/MM/YYYY'),true,'فاه عالي الدين'),
(77,'46588696','8457 BA 00','6169',to_date('04/11/2026','DD/MM/YYYY'),true,'السالك امبارك اعويسي'),
(78,'48715492','6903 BC 00','6132',to_date('28/10/2026','DD/MM/YYYY'),true,''),
(79,'30697000','9361 BC 00','6130',to_date('22/10/2026','DD/MM/YYYY'),false,''),
(80,'46647082','9364 BC 00','6129',to_date('21/10/2026','DD/MM/YYYY'),true,''),
(81,'27686102','6035 BC 00','6128',to_date('20/10/2026','DD/MM/YYYY'),false,''),
(82,'37000456','4888 AB 03','5993',to_date('20/10/2026','DD/MM/YYYY'),true,''),
(83,'44333960','9069 AB 03','5940',to_date('01/11/2026','DD/MM/YYYY'),true,'حمزة ابراهيم مسعود'),
(84,'48866849','4072 BE 00','5937',to_date('28/10/2026','DD/MM/YYYY'),true,'المصطفى احمد محمد العبد'),
(85,'43170153','8941 BC 00','5935',to_date('18/10/2026','DD/MM/YYYY'),true,''),
(86,'34946412','2038 BE 00','5934',to_date('01/11/2026','DD/MM/YYYY'),false,'الحسن الحسين البلوث'),
(87,'48683896','','5931',to_date('20/10/2026','DD/MM/YYYY'),false,''),
(88,'48877015','7548 AA 05','5890',to_date('18/10/2026','DD/MM/YYYY'),true,''),
(89,'49829007','3457 AE 06','5889',to_date('22/10/2026','DD/MM/YYYY'),false,''),
(90,'33122215','1770 AE 06','5886',to_date('22/10/2026','DD/MM/YYYY'),true,''),
(91,'20808026','9094 AC 08','5811',to_date('20/10/2026','DD/MM/YYYY'),true,''),
(92,'37699764','7923 BB 00','5810',to_date('18/10/2026','DD/MM/YYYY'),true,''),
(93,'44255523','','5809',to_date('23/10/2026','DD/MM/YYYY'),true,''),
(94,'22261016','4969 AC 07','5804',to_date('26/10/2026','DD/MM/YYYY'),true,'الديه الشيخ سيدي احمد احماه الله'),
(95,'41930068','','5765',to_date('21/09/2026','DD/MM/YYYY'),true,''),
(96,'43422854','1231 BC 00','5764',to_date('26/10/2026','DD/MM/YYYY'),true,''),
(97,'43132193','','5763',to_date('21/09/2026','DD/MM/YYYY'),false,''),
(98,'48448026','6233 AB 00','5761',to_date('18/10/2026','DD/MM/YYYY'),true,''),
(99,'31315461','9943 BA 00','5622',to_date('18/10/2026','DD/MM/YYYY'),true,'');

-- First enrich matching existing records without overwriting stored photos, payment fields or identity.
update public.presto_drivers d set
 license_plate=s.license_plate,presto_reference=s.presto_reference,
 pdf_position=s.pdf_position,training_completed=s.training_completed,
 pdf_source_phone=s.phone,pdf_source_date=s.pdf_source_date
from _presto_roster_import s
where regexp_replace(d.phone,'[^0-9]','','g')=s.phone
 or (s.pdf_position=33 and regexp_replace(d.phone,'[^0-9]','','g')='41270595' and lower(d.name) like '%جيبي عبد الله صار%');

-- Add only genuinely absent bag-and-shirt recipients from the supplied report.
-- verified=false because the PDF verifies equipment hand-off, not identity review.
insert into public.presto_drivers
 (name,phone,bag,shirt,verified,delivery_date,license_plate,presto_reference,pdf_position,training_completed,pdf_source_phone,pdf_source_date)
select s.imported_name,s.phone,true,true,false,to_char(s.pdf_source_date,'YYYY-MM-DD'),
 s.license_plate,s.presto_reference,s.pdf_position,s.training_completed,s.phone,s.pdf_source_date
from _presto_roster_import s
where s.imported_name<>''
  and not exists(select 1 from public.presto_drivers d where d.pdf_position=s.pdf_position)
  and not exists(select 1 from public.presto_drivers d where regexp_replace(d.phone,'[^0-9]','','g')=s.phone);

-- Fail rather than silently import an incomplete or mismatched report.
do $$
begin
 if (select count(*) from public.presto_drivers where pdf_position between 1 and 99)<>99 then
  raise exception 'PDF reconciliation incomplete: expected 99 matched rows';
 end if;
end $$;
commit;
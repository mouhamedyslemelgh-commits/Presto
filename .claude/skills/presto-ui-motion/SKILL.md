---
name: presto-ui-motion
description: Improve the PRESTO drivers operations UI with short, accessible GSAP animation and selective React Bits-style surfaces without compromising its data or auth flows.
---

# PRESTO UI Motion

Target: https://github.com/mouhamedyslemelgh-commits/Presto
Production: https://presto-yslem.vercel.app/

## Always protect
- Supabase Auth and RLS; never expose service-role keys, user passwords, phone numbers or account numbers.
- Driver CRUD, stable database IDs, editable profile, equipment, all four Mobile Money providers and individual numbers.
- Excel import/export, CSV, Google Sheets sync and distinctly reported save vs sync errors.
- Arabic/French RTL/LTR; prefer logical CSS properties, retain LTR digits and account codes.
- Existing CSS 3D authentication flip and touch-device fallback; never animate its transforms with GSAP.
- Native form, modal and table scrolling. DO NOT add Lenis globally or GSAP ScrollSmoother.
- Reduced-motion accessibility, visible keyboard focus and full keyboard/reader access.

## Implementation
- Use components/motion/use-presto-dashboard-motion.ts for *view* entrance only; never include drivers/rows in animation dependencies: polling reloads every ~5 seconds.
- Use components/motion/animated-metric.tsx for the four dashboard statistic counters only.
- Use components/ui/presto-spotlight-card.tsx for subtle, dependency-free spotlight on metric cards. Inspired by React Bits SpotlightCard; not an unmodified upstream component.
- Keep transitions between 160 and 400 milliseconds with CSS and GSAP scoped cleanup.
- Never animate whole tables or obscure changes to saving/validation/error status.

## Verify
- npm run lint and npm run build.
- Check desktop and mobile Arabic/French, login/signup, date selection, driver profile/modal, payments, XLSX, Supabase data and Sheets sync.
- Check reduced motion; no flicker under 5-second polling. No destructive test on production records.
- Inspect actual deployment status before saying the site is live.

# Blossom School ERP

Next.js + TypeScript starter for Blossom Kindergarten Senior Sec. School, Kagdi Pick Up, Banswara, Rajasthan.

## Current features
- Supabase email/password sign-in
- Protected portal route and sign-out
- Role-aware student directory (staff) and linked-student list (parents)
- 2026–27 class fee plan display
- Supabase schema and class fee seed SQL

## Fee schedule (annual)
| Class | Annual fee | Four installments |
|---|---:|---:|
| Nursery | ₹13,200 | ₹3,300 |
| L.K.G | ₹15,800 | ₹3,950 |
| U.K.G | ₹17,400 | ₹4,350 |
| I | ₹19,400 | ₹4,850 |
| II–V | ₹20,400 | ₹5,100 |
| VI–VIII | ₹23,200 | ₹5,800 |
| IX–X | ₹24,800 | ₹6,200 |
| XI–XII | ₹26,800 | ₹6,700 |

Installment due dates seeded: 1 July, 15 September, 15 November, 15 December 2026. School should confirm whether each date is inclusive or means payment before that date.

## Run locally
1. Use Node.js 20+.
2. Copy .env.example to .env.local.
3. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY using Supabase project settings.
4. Run npm install, then npm run dev.
5. Run npm run build before deployment.

## Important production limitations
This is an initial application scaffold, not a complete production fee-management system. The portal does not currently post payments or calculate student balances from the allocation ledger. Payment posting, unique receipt issuance, printable/PDF receipts, concessions workflow, refunds, installment generation UI, bank reconciliation, secure admin onboarding, backups/recovery and end-to-end/security tests remain to be implemented and verified. Do not collect or reconcile real fees with this version.

Never commit service-role keys or passwords. Keep Supabase Row Level Security enabled and test parent/student isolation before use.

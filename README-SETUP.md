# Blossom School ERP — source and setup notes

School: Blossom Kindergarten Senior Sec. School, Kagdi Pick Up, Banswara, Rajasthan, India.
Academic year: 2026–27. Currency: INR. Supabase project is configured separately.

## Local development
1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase project API settings. Never use the service-role key in browser variables.
4. Install dependencies with `npm install`, then run `npm run dev`.
5. Run `npm run build` before production deployment.

## Deployment
The repository is linked to Vercel. Configure the two public Supabase connection environment variables for the required Vercel environments, then deploy the `main` branch. Verify the build and test sign-in after deployment. If the Vercel project is protected by deployment protection, adjust project access settings before sharing the URL publicly.

## Fee structure (annual)
Nursery ₹13,200; L.K.G ₹15,800; U.K.G ₹17,400; I ₹19,400; II–V ₹20,400; VI–VIII ₹23,200; IX–X ₹24,800; XI–XII ₹26,800. Four equal installments are planned. Due dates seeded as 1 July, 15 September, 15 November and 15 December 2026; school must confirm whether dates are inclusive or mean payment before that date.

## Current implementation boundary
This repository contains a Next.js authentication shell, a basic student directory / fee-plan portal, Supabase client/server helpers and schema/seed files. It is not yet a complete production fee ledger. Do not use it to collect or reconcile real payments until transaction posting, payment allocations, receipt generation, refunds, authorization review, backup/recovery and end-to-end tests have been implemented and verified. The portal deliberately labels fee plans as reference data; it does not claim accurate student balances.

## Security
Keep Row Level Security enabled. Do not commit credentials or service-role keys. Create accounts through a controlled admin onboarding process, verify every role policy, and periodically test parent-to-student isolation.

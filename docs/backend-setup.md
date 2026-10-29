# Backend setup (Supabase)

The app runs in prototype mode until `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set. These steps switch on the real
backend: accounts, server-side credits and history, and the AI call on the server.

## What's in `supabase/`

| Path | What it does |
|---|---|
| `migrations/20261013000000_init.sql` | Tables (`profiles`, `credit_ledger`, `generations`, `founding_emails`), row level security, the free-credit bonus on sign up (2, or 10 for waitlist emails), atomic credit functions, and the private `redesigns` image bucket |
| `functions/generate` | Checks the user, takes credits, calls OpenAI, refunds on failure, stores before/after images |
| `functions/delete-account` | Deletes the user's images and account (required by Apple and Google) |
| `functions/_shared/catalog.ts` | Style prompts, credit cost per quality, prompt builder. The app imports the same file |

## One-time setup

1. **Create a project** at [supabase.com](https://supabase.com) (free plan is fine). Pick a region close to most users.
2. **Push the database and functions** from this folder:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   npx supabase functions deploy generate
   npx supabase functions deploy delete-account
   npx supabase secrets set OPENAI_API_KEY=sk-...
   ```
   Use a separate OpenAI project key for production, with a monthly budget cap.
3. **Point the app at it.** Copy `.env.example` to `.env.local` and fill in the
   project URL and publishable key (Project Settings → API). Restart `npx expo start`.

## Sign-in providers (Supabase → Authentication)

- **Email code.** Enabled by default. In *Email Templates → Magic Link*, include
  `{{ .Token }}` so the email shows the 6-digit code the app asks for. Set up a
  custom SMTP sender (e.g. Resend) before launch; Supabase's built-in sender is rate-limited.
- **Apple.** Enable the Apple provider and add `com.altamash.roomorph` as a client ID.
  Needs the Apple Developer account. Works in a development or store build, not in Expo Go.
- **Google.** Create an OAuth client in Google Cloud (type *Web application*), paste its
  client ID and secret into the Google provider.
- **Redirect URLs** (*URL Configuration*): add `roomorph://**` and, for testing in Expo Go, `exp://**`.

## Founding offer

Add waitlist emails (lowercase) to `founding_emails` before they sign up and they
get 10 free credits instead of 2:

```sql
insert into founding_emails (email) values ('someone@example.com') on conflict do nothing;
```

## Giving test credits

Until real purchases arrive (Phase 2), add credits for a tester in the SQL editor:

```sql
select grant_credits('<user id>', 10, 'admin', 'test:' || gen_random_uuid());
```

## Before launch: security checklist

Run through this before every store upload.

- **OpenAI key lives only in Supabase secrets.** `.env.local` and EAS environment
  variables must not contain `EXPO_PUBLIC_OPENAI_API_KEY` (the build now refuses if they do).
  Use a separate OpenAI *project* key for production with a monthly budget, and keep
  auto-recharge off so the prepaid balance is a hard cap.
- **Never put the service role key in the app.** Only the publishable (anon) key goes in
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Search the repo for `service_role` and `sk-` before a release.
- **Daily caps.** The `generate` function allows 20 redesigns per user and 200 in total per
  24 hours by default. Change them as you grow:
  ```bash
  npx supabase secrets set DAILY_LIMIT_PER_USER=20 DAILY_LIMIT_TOTAL=200
  ```
- **Supabase Security Advisor** (Dashboard → Advisors → Security) should show no errors,
  in particular no table without row level security.
- **Sign-up abuse.** Every new account gets 2 free credits. Watch *Authentication → Users*
  for bursts of sign-ups from throwaway email domains. If it happens, turn on CAPTCHA
  (*Authentication → Attack Protection*, Cloudflare Turnstile is free) and lower the
  email OTP rate limit (*Authentication → Rate Limits*).
- **Purchases (Phase 2)** must grant credits only from the RevenueCat webhook on the
  server, with the webhook's authorization header checked and the store transaction id
  as `external_ref`, never from the app.
- **Store forms.** Google Play *Data safety* and Apple *App Privacy* must say the app
  collects email and room photos, sends photos to OpenAI for processing, and lets users
  delete their account in Settings.

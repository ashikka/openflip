# OpenFlip Landing

OpenFlip is a Cloudflare Pages + D1 waitlist landing page built with Vite, React, TypeScript, and Tailwind.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Cloudflare Pages Functions
- Cloudflare D1

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your D1 databases:

   ```bash
   npx wrangler d1 create openflip-waitlist-dev
   npx wrangler d1 create openflip-waitlist-prod
   ```

3. Copy the returned database IDs into `wrangler.toml`.

4. Set `IP_SALT` in both the top-level `[vars]` block and `[env.production.vars]`.

5. Add your PostHog client environment variables to `.env.local` and your Cloudflare Pages project settings:

   ```bash
   VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_your_project_token
   VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

6. Apply the schema:

   ```bash
   npx wrangler d1 execute openflip-waitlist-dev --file=schema.sql
   npx wrangler d1 execute openflip-waitlist-prod --file=schema.sql
   ```

## Run locally

Use Vite for UI work:

```bash
npm run dev
```

Use Cloudflare Pages locally when you want the waitlist API and D1 binding active:

```bash
npm run cf:dev
```

## Build

```bash
npm run build
```

## Deploy

Build and deploy with Wrangler:

```bash
npm run deploy
```

Or explicitly:

```bash
npm run build
npx wrangler pages deploy
```

For production, keep `env.production` in `wrangler.toml` pointed at the real D1 database before you deploy.

## PostHog note

`npx -y @posthog/wizard@latest` was checked first, but its non-interactive mode requires a PostHog personal API key. This project uses the equivalent React integration directly so you can drop in your public project token and deploy without waiting on the wizard flow.

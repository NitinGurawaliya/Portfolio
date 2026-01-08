## DevFolio

<p align="center">
  <img src="./public/devfolio-high-resolution-logo.png" alt="DevFolio Logo" width="180" />
</p>

<p align="center">
  <strong>DevFolio — मिनटों में एक सुंदर developer portfolio बनाएं.</strong><br/>
  GitHub से projects import करें, portfolio customize करें, analytics देखें, और custom domain पर publish करें.
</p>

<p align="center">
  <img src="./public/og-image.png" alt="DevFolio Preview" />
</p>

---

## Features

- **GitHub import**: GitHub repos से projects जल्दी import करें
- **Portfolio pages**: public portfolio route: `/{username}` और project pages: `/{username}/{projectSlug}`
- **Themes + customization**: themes/preview + layout customization
- **Analytics**: portfolio + project insights (views, clicks, referrers, etc.)
- **Shiplog**: shipping updates / community feed
- **Custom domains**: domain add + DNS verification + Vercel integration support
- **SEO**: dynamic metadata, OG images, sitemap generation
- **Optional screenshot previews**: screenshot service configure करके project preview images auto-capture

## Screenshots

<p>
  <img src="./public/landing/ss_portfolio.png" alt="Portfolio Screenshot" width="49%"/>
  <img src="./public/landing/customize_layout.png" alt="Customize Layout" width="49%"/>
</p>

<p>
  <img src="./public/landing/liveanaltyicsdashabrod.png" alt="Live Analytics Dashboard" width="49%"/>
  <img src="./public/landing/communtiyy_ss.png" alt="Community Feed" width="49%"/>
</p>

## Theme previews

| Light | Modern | Acernity |
| --- | --- | --- |
| <img src="./public/themes/light-preview.png" alt="Light theme" /> | <img src="./public/themes/modern-preview.png" alt="Modern theme" /> | <img src="./public/themes/accernity-preview.png" alt="Acernity theme" /> |

## Tech stack

- **Framework**: Next.js (App Router)
- **UI**: React, Tailwind CSS, Radix UI, Framer Motion
- **DB/ORM**: PostgreSQL + Prisma
- **Auth**: GitHub OAuth (custom route)
- **Email**: SMTP via Brevo (optional)
- **Deployment**: Vercel-ready (includes `vercel-build`)

## Getting started

### Prerequisites

- **Node.js**: 20+ recommended
- **Database**: PostgreSQL

### Install

> आप `pnpm` या `npm` use कर सकते हैं (project में दोनों lockfiles मौजूद हैं)।

```bash
# pnpm
pnpm install

# or npm
npm install
```

### Environment variables

एक `.env.local` बनाएं:

```bash
cp .env.example .env.local 2>/dev/null || true
```

अगर `.env.example` मौजूद नहीं है, तो नीचे वाला template copy/paste कर दें:

```env
# ---------- Required ----------
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"

# Public base URL (metadata, sitemap, OG images)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Main app domain (used for custom-domain routing + emails)
NEXT_PUBLIC_APP_DOMAIN="devfolio.cc"

# GitHub OAuth (required for login)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ---------- Optional (Email via Brevo/SMTP) ----------
BREVO_HOST=""
BREVO_PORT="587"
BREVO_USER=""
BREVO_PASS=""
FROM_EMAIL="no-reply@yourdomain.com"

# ---------- Optional (Screenshot previews) ----------
SCREENSHOT_API_KEY=""
SCREENSHOT_API_URL=""

# ---------- Optional (Vercel Custom Domain Automation) ----------
VERCEL_API_TOKEN=""
VERCEL_PROJECT_ID=""
VERCEL_TEAM_ID=""

# ---------- Optional (Custom Domain DNS verification helpers) ----------
APP_IP_ADDRESS="192.64.119.187"

# ---------- Optional (Project page canonical URL building) ----------
NEXT_PUBLIC_SITE_PROTOCOL="http"

# ---------- Optional (Cron protection) ----------
CRON_SECRET="change-me"
```

### Database setup

```bash
# Generate Prisma client (also runs on install via postinstall)
npm run postinstall

# Apply existing migrations
npm run migrate:deploy
```

### Run locally

```bash
npm run dev
```

अब app `http://localhost:3000` पर चलनी चाहिए।

## Optional setup guides

- **Screenshot API**: details के लिए `SCREENSHOT_API_SETUP.md` देखें।
- **Custom domains**:
  - `NEXT_PUBLIC_APP_DOMAIN` set रखें (production में आपका main domain)
  - Vercel automation के लिए `VERCEL_API_TOKEN` + `VERCEL_PROJECT_ID` (और optional `VERCEL_TEAM_ID`)
  - DNS verification fallback के लिए `APP_IP_ADDRESS` (optional)

## Scripts

- **dev**: `npm run dev`
- **build**: `npm run build` (includes `prisma generate`)
- **start**: `npm run start`
- **lint**: `npm run lint`
- **migrations**: `npm run migrate:deploy` / `npm run migrate:status` / `npm run migrate:reset`

## Notes

- **Sitemap**: published portfolios के आधार पर sitemap generate होता है (`src/app/sitemap.ts`), इसलिए DB connectivity required है।
- **Custom domain middleware**: production में custom domains rewrite/lookup middleware से होते हैं (`src/middleware.ts`)।

## License

License अभी specify नहीं है — अगर आप चाहें तो मैं MIT/Apache-2.0 जोड़कर `LICENSE` फाइल भी बना सकता हूँ।


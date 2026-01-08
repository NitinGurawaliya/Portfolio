
## DevFolio 



**DevFolio** helps developers create a polished portfolio in minutes: import GitHub projects, customize your profile, publish, track analytics, and optionally connect a custom domain.


---

## Features

![Portfolio](./public/landing/ss_portfolio.png)
![Customize layout](./public/landing/customize_layout.png)
![Analytics](./public/landing/liveanaltyicsdashabrod.png)
![Community](./public/landing/communtiyy_ss.png)

## Theme previews

| Light | Modern | Acernity |
| --- | --- | --- |
| ![Light theme](./public/themes/light-preview.png) | ![Modern theme](./public/themes/modern-preview.png) | ![Acernity theme](./public/themes/accernity-preview.png) |

## Features

- **GitHub sign-in (OAuth)**: users authenticate via GitHub OAuth.
- **GitHub repo import**: pull repositories and showcase projects on your portfolio.
- **Portfolio builder**:
  - Public portfolio route: `/{username}`
  - Public project route: `/{username}/{projectSlug}`
  - Profile sections: bio, skills, socials, experience, projects
- **Customization & themes**: theme selection and layout customization.
- **Analytics & insights**:
  - Portfolio views and project views
  - Click tracking (projects/socials)
  - Referrers, device/browser metadata (where available)
- **Shiplog + community feed**: post updates and browse the feed.
- **Custom domains** (optional):
  - Domain add + DNS record generation
  - Verification via TXT + A record checks
  - Optional Vercel API automation for adding domains
- **SEO**:
  - Dynamic metadata (portfolio + project pages)
  - OG images
  - Dynamic sitemap for published portfolios
- **Email notifications** (optional): SMTP via Brevo credentials (welcome + domain emails).
- **Project previews** (optional): screenshot service integration for capturing preview images.
- **Cron-ready domain verification** (optional): protected cron endpoint for auto-verifying pending domains.

## Tech stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Radix UI, Framer Motion
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Email**: Nodemailer (SMTP / Brevo)
- **Deployment**: Vercel-ready (`vercel-build`)

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Install

Use **one** package manager consistently (this repo contains multiple lockfiles).

```bash
npm install
```

### Environment variables

Create `.env.local` (do not commit it):

```bash
cp .env.example .env.local 2>/dev/null || true
```

If `.env.example` does not exist, use this template:

```env
# -----------------------
# Required
# -----------------------
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"

# Used for metadata, OG image generation, and sitemap URLs
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Used for custom-domain routing and email links (production domain)
NEXT_PUBLIC_APP_DOMAIN="devfolio.cc"

# GitHub OAuth (login)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# -----------------------
# Optional: Email (Brevo SMTP via Nodemailer)
# -----------------------
BREVO_HOST=""
BREVO_PORT="587"
BREVO_USER=""
BREVO_PASS=""
FROM_EMAIL="no-reply@yourdomain.com"

# -----------------------
# Optional: Screenshot previews
# -----------------------
SCREENSHOT_API_KEY=""
SCREENSHOT_API_URL=""

# -----------------------
# Optional: Vercel domain automation
# -----------------------
VERCEL_API_TOKEN=""
VERCEL_PROJECT_ID=""
VERCEL_TEAM_ID=""

# -----------------------
# Optional: DNS verification helpers
# -----------------------
APP_IP_ADDRESS="192.64.119.187"

# -----------------------
# Optional: canonical URL building (project pages)
# -----------------------
NEXT_PUBLIC_SITE_PROTOCOL="http"

# -----------------------
# Optional: Cron protection
# -----------------------
CRON_SECRET="change-me"
```

### Database setup

```bash
# Generate Prisma client
npm run postinstall

# Apply migrations
npm run migrate:deploy
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Optional setup

### Screenshot API

Screenshot previews are optional. See `SCREENSHOT_API_SETUP.md` for supported providers and setup.

### Custom domains

To enable smooth custom-domain support in production:

- Set **`NEXT_PUBLIC_APP_DOMAIN`** to your primary app domain.
- For automated Vercel domain management, provide:
  - `VERCEL_API_TOKEN`
  - `VERCEL_PROJECT_ID`
  - `VERCEL_TEAM_ID` (only if you use a Vercel team)

### Domain verification cron (optional)

There is a protected endpoint for periodic verification:

- Endpoint: `/api/cron/verify-domains`
- Auth header: `Authorization: Bearer ${CRON_SECRET}`

## Scripts

- **dev**: `npm run dev`
- **build**: `npm run build`
- **start**: `npm run start`
- **lint**: `npm run lint`
- **migrations**: `npm run migrate:deploy` / `npm run migrate:status` / `npm run migrate:reset`

## License

No license is specified yet. If you want, I can add a `LICENSE` file (MIT / Apache-2.0) and update this section.


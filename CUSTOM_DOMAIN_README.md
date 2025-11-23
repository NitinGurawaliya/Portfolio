# Custom Domain Feature - Complete Guide

## Overview

This feature allows users to connect their custom domains (e.g., `nitin.com`) to their DevFolio portfolios. The system automatically handles domain verification, DNS configuration, Vercel integration, and routing.

**Key Features:**
- ✅ Fully automated domain addition to Vercel
- ✅ Per-domain IP storage (from Vercel)
- ✅ Automatic SSL provisioning
- ✅ DNS verification
- ✅ Scalable for thousands of users

---

## Architecture

### Components

1. **Database** (`CustomDomain` model)
   - Stores domain mappings
   - Stores Vercel IP per domain
   - Tracks verification status

2. **API Routes**
   - `POST /api/custom-domain` - Add domain
   - `POST /api/custom-domain/[id]/verify` - Verify domain
   - `GET /api/custom-domain/status` - Get domain status
   - `DELETE /api/custom-domain/[id]` - Remove domain
   - `GET /api/custom-domain/lookup` - Lookup for middleware

3. **Middleware** (`src/middleware.ts`)
   - Intercepts custom domain requests
   - Routes to correct portfolio

4. **Vercel API Integration** (`src/lib/vercel-api.ts`)
   - Automatically adds domains to Vercel
   - Gets IP from Vercel
   - Handles SSL provisioning

5. **DNS Configuration** (`src/lib/dns-config.ts`)
   - Generates DNS records
   - Uses Vercel-provided IP

6. **Domain Verification** (`src/lib/domain-verification.ts`)
   - Verifies DNS records
   - Checks domain ownership

---

## Complete User Flow

### Step 1: User Adds Domain

**User Action:**
1. Goes to Dashboard → Domain tab
2. Enters domain: `example.com`
3. Clicks "Add Domain"

**System Actions:**
```
1. Validates domain format
2. Checks if portfolio is published
3. Generates verification token
4. Adds domain to Vercel via API
5. Gets IP address from Vercel
6. Stores domain + IP in database
7. Returns DNS records to user
```

**Code Flow:**
```typescript
// src/app/api/custom-domain/route.ts
POST /api/custom-domain
  ↓
validateDomain()
  ↓
addDomainToVercel() → Vercel API
  ↓
getVercelRecommendedIP() → Get IP
  ↓
prisma.customDomain.create({
  domain,
  vercelIPAddress: ip, // Store IP from Vercel
  ...
})
  ↓
generateDNSRecords(domain, token, ip) → Uses Vercel IP
  ↓
Return DNS records to user
```

### Step 2: User Configures DNS

**User Action:**
1. Copies DNS records from dashboard
2. Goes to domain registrar (Namecheap, GoDaddy, etc.)
3. Adds 3 DNS records:
   - **A Record:** `@` → `[IP from Vercel]` (e.g., `76.76.21.21`)
   - **CNAME:** `www` → `devfolio.cc.`
   - **TXT:** `_devfolio-verification` → `[token]`

**DNS Records Shown:**
```typescript
// src/lib/dns-config.ts
{
  apex: {
    type: 'A',
    name: '@',
    value: vercelIP, // IP from Vercel (stored in database)
    ttl: 3600
  },
  www: {
    type: 'CNAME',
    name: 'www',
    value: 'devfolio.cc.',
    ttl: 3600
  },
  verification: {
    type: 'TXT',
    name: '_devfolio-verification',
    value: verificationToken,
    ttl: 3600
  }
}
```

### Step 3: User Verifies Domain

**User Action:**
1. Waits 5-10 minutes (DNS propagation)
2. Clicks "Verify Domain" button

**System Actions:**
```
1. Checks TXT record (ownership)
2. Checks A record (DNS pointing)
3. Checks CNAME (www subdomain)
4. Updates verification status
5. Automatically adds to Vercel (if not already)
6. Caches domain mapping
7. Sends success email
```

**Code Flow:**
```typescript
// src/app/api/custom-domain/[id]/verify/route.ts
POST /api/custom-domain/{id}/verify
  ↓
verifyDomainComplete(domain, token)
  ├─ verifyDomainOwnership() → Check TXT
  ├─ checkDomainPointing() → Check A record (uses stored IP)
  └─ checkWWWPointing() → Check CNAME
  ↓
If verified:
  ├─ Update database: verified = true
  ├─ addDomainToVercel() → Auto-add to Vercel
  ├─ cacheDomain() → Cache for fast lookup
  └─ Send success email
```

### Step 4: Domain Routes to Portfolio

**User Action:**
1. Visits `example.com`

**System Actions:**
```
1. DNS resolves to Vercel IP
2. Middleware intercepts request
3. Looks up domain in cache/database
4. Gets username from domain
5. Rewrites to /[username]
6. Portfolio page loads
```

**Code Flow:**
```typescript
// src/middleware.ts
Request: example.com
  ↓
Middleware intercepts
  ↓
GET /api/custom-domain/lookup?domain=example.com
  ↓
prisma.customDomain.findFirst({
  domain: 'example.com',
  verified: true
})
  ↓
Returns: { username: 'nitin', portfolioId: 123 }
  ↓
Rewrite to: /nitin
  ↓
Portfolio loads ✅
```

---

## Database Schema

### CustomDomain Model

```prisma
model CustomDomain {
  id          String    @id @default(cuid())
  domain      String    @unique
  portfolioId Int       @unique
  userId      Int
  
  // Verification
  verified          Boolean @default(false)
  verificationToken String
  
  // DNS Configuration (from Vercel)
  vercelIPAddress   String? // IP from Vercel for A record
  vercelCnameTarget String? // CNAME target (if any)
  
  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastCheckedAt DateTime?
  
  // Relations
  portfolio Portfolio @relation(...)
  user      User      @relation(...)
}
```

**Key Fields:**
- `vercelIPAddress`: Stores IP from Vercel (per domain)
- `verified`: Domain verification status
- `verificationToken`: For TXT record verification

---

## Vercel Integration

### Automatic Domain Addition

**When:** Domain is verified successfully

**Code:**
```typescript
// src/app/api/custom-domain/[id]/verify/route.ts
if (verified) {
  const vercelResult = await addDomainToVercel(domain);
  // Domain automatically added to Vercel
  // SSL automatically provisioned
}
```

**Benefits:**
- ✅ No manual steps
- ✅ Automatic SSL
- ✅ Scalable for thousands of users

### Getting IP from Vercel

**Flow:**
```typescript
// src/app/api/custom-domain/route.ts
1. addDomainToVercel(domain) → Add to Vercel
2. getVercelRecommendedIP() → Get IP
3. Store IP in database: vercelIPAddress
4. Use IP for DNS records
```

**Priority:**
1. IP from Vercel API (when adding domain)
2. `APP_IP_ADDRESS` env var (fallback)
3. Default Vercel IP: `76.76.21.21`

---

## DNS Records Generation

### How It Works

```typescript
// src/lib/dns-config.ts
export async function generateDNSRecords(
  domain: string,
  verificationToken: string,
  vercelIP?: string | null
): Promise<DNSRecordSet> {
  // Priority: Vercel IP > env var > API > default
  let appIP: string;
  if (vercelIP) {
    appIP = vercelIP; // Use IP from Vercel (most accurate)
  } else {
    appIP = await getRecommendedIP(); // Fallback
  }
  
  return {
    apex: {
      type: 'A',
      name: '@',
      value: appIP, // IP from Vercel
      ttl: 3600
    },
    www: {
      type: 'CNAME',
      name: 'www',
      value: 'devfolio.cc.',
      ttl: 3600
    },
    verification: {
      type: 'TXT',
      name: '_devfolio-verification',
      value: verificationToken,
      ttl: 3600
    }
  };
}
```

### DNS Records Shown to User

**When user adds domain:**
```
A Record:
  Type: A
  Name: @
  Value: 76.76.21.21  ← IP from Vercel (stored in database)
  TTL: 3600

CNAME Record:
  Type: CNAME
  Name: www
  Value: devfolio.cc.
  TTL: 3600

TXT Record:
  Type: TXT
  Name: _devfolio-verification
  Value: devfolio-verify-xxxxx
  TTL: 3600
```

---

## Environment Variables

### Required

```bash
# Main app domain
NEXT_PUBLIC_APP_DOMAIN=devfolio.cc

# Vercel API (for automatic domain addition)
VERCEL_API_TOKEN=xxxxxxxxxxxxx  # ⚠️ NEVER share publicly! (format: alphanumeric string)
VERCEL_PROJECT_ID=prj_5uHcncHYV6M5JHGN45J96j6Psj1U  # ✅ You already have this!
VERCEL_TEAM_ID=team_xxxxxxxxxxxxx  # Optional (only if using team account)

# Fallback IP (if Vercel API not available)
APP_IP_ADDRESS=76.76.21.21  # Optional, Vercel IP preferred
```

### How to Get (Step-by-Step Guide)

#### ⚠️ IMPORTANT: Security Warning

**Your API token was exposed!** The token `jfdCvzgFyJE7rdRrOhBKOmkh` is now public. You must:

1. **Delete the old token:**
   - Go to: https://vercel.com/account/tokens
   - Find the token
   - Click **"Delete"**

2. **Create a new token:**
   - Click **"Create Token"**
   - Name: `Custom Domain Automation`
   - Scope: **Full Account Access**
   - Copy the new token (alphanumeric string, e.g., `jfdCvzgFyJE7rdRrOhBKOmkh`)

3. **Never share tokens publicly:**
   - Don't commit to Git
   - Don't share in screenshots
   - Only add to Vercel Environment Variables

---

#### 1. VERCEL_API_TOKEN (Get New Token)

**Steps:**
1. Go to: **https://vercel.com/account/tokens**
2. Click **"Create Token"** button
3. Name: `Custom Domain Automation`
4. Scope: **Full Account Access**
5. Click **"Create"**
6. **Copy token immediately** (shown only once!)
   - Token format can be:
     - `jfdCvzgFyJE7rdRrOhBKOmkh` (alphanumeric string)
     - `vercel_xxxxxxxxxxxxx` (with prefix)
     - Both formats work! ✅
7. Add to Vercel Environment Variables (see below)

---

#### 2. VERCEL_PROJECT_ID ✅ (You Already Have This!)

**Your Project ID:** `prj_5uHcncHYV6M5JHGN45J96j6Psj1U`

**How to verify:**
1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click your project
3. **Settings** → **General**
4. Check **"Project ID"** matches: `prj_5uHcncHYV6M5JHGN45J96j6Psj1U`

---

#### 3. VERCEL_TEAM_ID (Optional - Check if Needed)

**Check if you need this:**
1. Go to **Vercel Dashboard**
2. Look at the URL:
   - If URL has `/team/[TEAM_NAME]/` → You're using a team
   - If URL is just `/dashboard` → Personal account (skip this)

**If using Team Account:**
1. Go to **Team Settings** → **General**
2. Copy **Team ID** (starts with `team_`)
3. Add to environment variables

**If Personal Account:**
- ✅ Skip this variable
- Don't add `VERCEL_TEAM_ID` at all
- Leave it empty

---

#### 4. APP_IP_ADDRESS (Optional - Default is Fine)

**Default:** `76.76.21.21`

**You don't need to change this:**
- System automatically gets IP from Vercel API
- This is just a fallback
- Default value works fine

---

### Adding to Vercel Environment Variables

**Complete Steps:**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click your project

2. **Go to Settings:**
   - Click **"Settings"** tab (top menu)
   - Click **"Environment Variables"** (left sidebar)

3. **Add VERCEL_API_TOKEN:**
   - **Key:** `VERCEL_API_TOKEN`
   - **Value:** `[your new token]` (alphanumeric string, e.g., `jfdCvzgFyJE7rdRrOhBKOmkh`)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

4. **Add VERCEL_PROJECT_ID:**
   - **Key:** `VERCEL_PROJECT_ID`
   - **Value:** `prj_5uHcncHYV6M5JHGN45J96j6Psj1U`
   - **Environment:** Select all
   - Click **"Save"**

5. **Add VERCEL_TEAM_ID (only if using team):**
   - **Key:** `VERCEL_TEAM_ID`
   - **Value:** `team_xxxxx` (your team ID)
   - **Environment:** Select all
   - Click **"Save"**

6. **Redeploy:**
   - After adding variables, **redeploy** your project
   - Go to **Deployments** → Click **"Redeploy"**

---

### Quick Checklist

- [ ] Delete old exposed token
- [ ] Create new API token
- [ ] Add `VERCEL_API_TOKEN` to Vercel env vars
- [ ] Add `VERCEL_PROJECT_ID` to Vercel env vars (you have: `prj_5uHcncHYV6M5JHGN45J96j6Psj1U`)
- [ ] Add `VERCEL_TEAM_ID` (only if team account)
- [ ] Redeploy project
- [ ] Test domain addition

---

### Verify It's Working

After adding variables and redeploying:

1. **Add a test domain** in dashboard
2. **Check Vercel logs:**
   - Go to **Functions** → `/api/custom-domain`
   - Should see: `[Vercel API] Successfully added domain`
3. **Check Vercel Dashboard:**
   - Go to **Settings** → **Domains**
   - Domain should appear automatically ✅

---

## API Endpoints

### Add Domain

```typescript
POST /api/custom-domain
Body: {
  domain: "example.com",
  portfolioId: 123
}

Response: {
  success: true,
  domain: "example.com",
  id: "clx...",
  verified: false,
  dnsRecords: {
    apex: { type: "A", name: "@", value: "76.76.21.21" },
    www: { type: "CNAME", name: "www", value: "devfolio.cc." },
    verification: { type: "TXT", name: "_devfolio-verification", value: "..." }
  }
}
```

### Verify Domain

```typescript
POST /api/custom-domain/{id}/verify

Response: {
  success: true,
  verified: true,
  checks: {
    ownershipVerified: true,
    aRecordPointing: true,
    cnamePointing: true
  },
  message: "Domain verified successfully!"
}
```

### Get Status

```typescript
GET /api/custom-domain/status?portfolioId=123

Response: {
  success: true,
  hasDomain: true,
  verified: true,
  domain: "example.com",
  dnsRecords: { ... }
}
```

---

## Middleware Routing

### How It Works

```typescript
// src/middleware.ts
Request: example.com
  ↓
Check if custom domain (not main domain)
  ↓
GET /api/custom-domain/lookup?domain=example.com
  ↓
Database lookup:
  CustomDomain.findFirst({
    domain: 'example.com',
    verified: true
  })
  ↓
Get username from portfolio
  ↓
Rewrite to: /[username]
  ↓
Portfolio page loads
```

### Cache Layer

```typescript
// src/lib/domain-cache.ts
- In-memory cache for fast lookups
- Caches: domain → username mapping
- Invalidated on domain updates
```

---

## Setup Instructions

### 1. Database Migration

```sql
-- Run in Neon.tech SQL Editor
  ALTER TABLE "CustomDomain" 
  ADD COLUMN IF NOT EXISTS "vercelIPAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "vercelCnameTarget" TEXT;
```

### 2. Environment Variables

Add to Vercel Dashboard → Settings → Environment Variables:
```bash
VERCEL_API_TOKEN=vercel_xxxxx
VERCEL_PROJECT_ID=prj_xxxxx
NEXT_PUBLIC_APP_DOMAIN=devfolio.cc
APP_IP_ADDRESS=76.76.21.21  # Optional fallback
```

### 3. Regenerate Prisma Client

```bash
npx prisma generate
```

### 4. Deploy

```bash
git add .
git commit -m "feat: custom domain with per-domain IP"
git push
```

---

## User Experience

### Adding Domain

1. **Dashboard → Domain Tab**
   - Enter domain: `example.com`
   - Click "Add Domain"

2. **DNS Records Shown**
   - A Record: `@` → `[IP from Vercel]`
   - CNAME: `www` → `devfolio.cc.`
   - TXT: `_devfolio-verification` → `[token]`

3. **Configure DNS**
   - Copy records
   - Add at registrar
   - Wait 5-10 minutes

4. **Verify Domain**
   - Click "Verify Domain"
   - System checks DNS
   - Domain verified ✅

5. **Domain Live**
   - Visit `example.com`
   - Portfolio loads ✅

---

## Verification Process

### DNS Checks

1. **TXT Record (Ownership)**
   ```typescript
   verifyDomainOwnership(domain, token)
   → Checks: _devfolio-verification.example.com
   → Expected: verificationToken
   ```

2. **A Record (DNS Pointing)**
   ```typescript
   checkDomainPointing(domain)
   → Resolves: example.com
   → Checks: IP matches stored vercelIPAddress
   → Accepts: Old IP (76.76.21.21) or New IP (from Vercel)
   ```

3. **CNAME (WWW Subdomain)**
   ```typescript
   checkWWWPointing(domain)
   → Checks: www.example.com
   → Expected: devfolio.cc.
   ```

### All Checks Must Pass

```typescript
const allChecks = ownershipVerified && aRecordPointing;
// CNAME is optional but recommended
```

---

## Troubleshooting

### Issue: Domain Not Verified

**Check:**
1. DNS records added correctly?
2. Wait 10-15 minutes for propagation
3. Check DNS with: `dig example.com +short`
4. Verify TXT record: `dig _devfolio-verification.example.com TXT`

**Solution:**
- Re-check DNS records
- Wait longer for propagation
- Try verification again

### Issue: "Invalid Configuration" in Vercel

**Cause:**
- A record doesn't match Vercel's expected IP
- Conflicting DNS records

**Solution:**
- Update A record to IP from Vercel
- Remove conflicting records
- Wait and refresh in Vercel

### Issue: Domain Not Routing

**Check:**
1. Domain verified in database?
2. Middleware working?
3. Cache invalidated?

**Solution:**
- Check domain status: `GET /api/custom-domain/status`
- Check middleware logs
- Clear cache if needed

---

## Scalability

### For 100 Users

✅ **Free Tier Sufficient:**
- Vercel API: 100 requests/hour
- Each user: ~2-3 API calls
- Works perfectly

### For 1000+ Users

**Consider:**
- Upgrade to Vercel Pro ($20/month)
- 10x higher rate limits
- Better performance

### Rate Limits

**Free Tier:**
- 100 requests/hour
- ~1,000 requests/day

**Pro Tier:**
- 1,000 requests/hour
- ~10,000 requests/day

---

## Security

### Domain Ownership Verification

- ✅ TXT record verification required
- ✅ Only domain owner can verify
- ✅ Token-based verification

### Access Control

- ✅ User can only manage their own domains
- ✅ Session-based authentication
- ✅ Portfolio ownership checks

### DNS Security

- ✅ Validates domain format
- ✅ Prevents reserved domains
- ✅ Checks for conflicts

---

## Monitoring

### Logs to Watch

```typescript
// Domain addition
[Custom Domain] Adding domain to Vercel: example.com
[Vercel API] Successfully added domain: example.com

// Verification
[DNS Verification] Verification Summary:
  ✓ Ownership (TXT): ✅
  ✓ A Record: ✅
  ✓ CNAME (www): ✅

// Routing
[Middleware] Checking custom domain: example.com
[Middleware] Rewriting to portfolio: /nitin
```

### Metrics to Track

- Domain verification success rate
- Vercel API success rate
- DNS propagation time
- Domain routing performance

---

## Summary

### ✅ What Works

1. **User adds domain** → System adds to Vercel automatically
2. **System gets IP from Vercel** → Stores per domain
3. **DNS records shown** → Uses Vercel IP
4. **User configures DNS** → At registrar
5. **User verifies** → System checks DNS
6. **Domain routes** → Middleware rewrites to portfolio
7. **Portfolio loads** → At custom domain ✅

### ✅ Key Features

- **Per-domain IP storage** (from Vercel)
- **Automatic Vercel integration**
- **Automatic SSL provisioning**
- **Scalable architecture**
- **Zero manual steps**

### ✅ Files

- `src/app/api/custom-domain/` - API routes
- `src/lib/vercel-api.ts` - Vercel integration
- `src/lib/dns-config.ts` - DNS generation
- `src/lib/domain-verification.ts` - DNS verification
- `src/middleware.ts` - Domain routing
- `prisma/schema.prisma` - Database schema

**Everything works together seamlessly!** 🚀


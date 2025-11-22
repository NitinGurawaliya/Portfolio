# Production Environment Variables for Custom Domain Feature

## Required Environment Variables

Add these to your **Vercel Project Settings** → **Environment Variables**:

### 1. `NEXT_PUBLIC_APP_DOMAIN` ⚠️ REQUIRED
```
NEXT_PUBLIC_APP_DOMAIN=devfolio.cc
```
**What it does:**
- Your main app domain (where your app is hosted)
- Used for CNAME records (www subdomain points to this)
- Used in email notifications and dashboard links

**Where to add:**
- Vercel Dashboard → Your Project → Settings → Environment Variables
- **Environments**: Production, Preview, Development (select all)

---

### 2. `APP_IP_ADDRESS` ⚠️ REQUIRED
```
APP_IP_ADDRESS=76.76.21.21
```
**What it does:**
- Vercel's static IP address for A records
- Used to verify that domains point to your server
- Used in DNS configuration instructions

**Vercel IP Options** (any of these work):
- `76.76.21.21` ✅ (default, recommended)
- `76.76.21.22`
- `76.76.21.23`
- `76.76.21.24`

**Where to add:**
- Vercel Dashboard → Your Project → Settings → Environment Variables
- **Environments**: Production, Preview, Development (select all)

---

### 3. `CRON_SECRET` ⚠️ REQUIRED (for cron job security)
```
CRON_SECRET=your-random-secret-key-here
```
**What it does:**
- Secures the cron job endpoint from unauthorized access
- Used to authenticate cron job requests from Vercel

**How to generate:**
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Where to add:**
- Vercel Dashboard → Your Project → Settings → Environment Variables
- **Environments**: Production, Preview, Development (select all)

---

## Quick Setup Steps

### Step 1: Go to Vercel Dashboard
1. Open your project on Vercel
2. Click **Settings** → **Environment Variables**

### Step 2: Add Each Variable

**Variable 1:**
- **Key**: `NEXT_PUBLIC_APP_DOMAIN`
- **Value**: `devfolio.cc` (or your actual domain)
- **Environments**: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

**Variable 2:**
- **Key**: `APP_IP_ADDRESS`
- **Value**: `76.76.21.21`
- **Environments**: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

**Variable 3:**
- **Key**: `CRON_SECRET`
- **Value**: `[generate-random-secret]` (use the command above)
- **Environments**: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

### Step 3: Redeploy
After adding variables, Vercel will automatically redeploy, or you can manually trigger:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment

---

## Verification Checklist

After adding variables and redeploying:

- [ ] Check Vercel logs for any errors
- [ ] Test adding a custom domain in dashboard
- [ ] Verify DNS records are generated correctly
- [ ] Test domain verification (after adding DNS records)
- [ ] Check cron job runs daily (check Vercel Cron Jobs tab)

---

## Optional Environment Variables

These are already set with defaults, but you can override if needed:

### `DATABASE_URL` (Already set)
- Your PostgreSQL database connection string
- Should already be configured in Vercel

### Email Configuration (If using email notifications)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

---

## Troubleshooting

### Issue: "Invalid domain format" error
- ✅ Check `APP_IP_ADDRESS` is set correctly
- ✅ Check `NEXT_PUBLIC_APP_DOMAIN` is set correctly

### Issue: DNS verification fails
- ✅ Check `APP_IP_ADDRESS` matches the IP in DNS A record
- ✅ Wait 5-10 minutes for DNS propagation
- ✅ Check logs in Vercel Functions tab

### Issue: Cron job not running
- ✅ Check `CRON_SECRET` is set
- ✅ Check `vercel.json` has correct cron schedule
- ✅ Verify cron job in Vercel Dashboard → Cron Jobs

### Issue: "Unauthorized" error in cron
- ✅ Check `CRON_SECRET` matches in environment variables
- ✅ Verify cron job is using correct authorization header

---

## Summary

**Minimum Required (3 variables):**
1. `NEXT_PUBLIC_APP_DOMAIN=devfolio.cc`
2. `APP_IP_ADDRESS=76.76.21.21`
3. `CRON_SECRET=[random-secret]`

**All set?** ✅ Deploy and test!


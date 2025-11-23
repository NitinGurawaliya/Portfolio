# Custom Domain Environment Variables - Quick Reference

## Required Environment Variables (3)

Add these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

### 1. `NEXT_PUBLIC_APP_DOMAIN`
```
NEXT_PUBLIC_APP_DOMAIN=devfolio.cc
```
**What it does:** Your main app domain (where your app is hosted)

---

### 2. `APP_IP_ADDRESS`
```
APP_IP_ADDRESS=76.76.21.21
```
**What it does:** Vercel's static IP for A records (DNS verification)

**Options (any of these work):**
- `76.76.21.21` ✅ (recommended)
- `76.76.21.22`
- `76.76.21.23`
- `76.76.21.24`

---

### 3. `CRON_SECRET`
```
CRON_SECRET=your-random-secret-key-here
```
**What it does:** Secures the cron job endpoint

**Generate secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Quick Setup Steps

1. **Go to Vercel Dashboard**
   - Your Project → Settings → Environment Variables

2. **Add Variable 1:**
   - Key: `NEXT_PUBLIC_APP_DOMAIN`
   - Value: `devfolio.cc`
   - Environments: ☑️ Production ☑️ Preview ☑️ Development

3. **Add Variable 2:**
   - Key: `APP_IP_ADDRESS`
   - Value: `76.76.21.21`
   - Environments: ☑️ Production ☑️ Preview ☑️ Development

4. **Add Variable 3:**
   - Key: `CRON_SECRET`
   - Value: `[paste-generated-secret]`
   - Environments: ☑️ Production ☑️ Preview ☑️ Development

5. **Redeploy** (Vercel will auto-redeploy after adding vars)

---

## Summary

**Minimum Required:**
```
NEXT_PUBLIC_APP_DOMAIN=devfolio.cc
APP_IP_ADDRESS=76.76.21.21
CRON_SECRET=[random-32-char-hex-string]
```

**That's it!** 🎉


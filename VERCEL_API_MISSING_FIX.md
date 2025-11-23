# Vercel API Token Missing - Fix Guide

## Problem

If you forgot to add `VERCEL_API_TOKEN` and `VERCEL_PROJECT_ID` in Vercel deployment, you'll get:

**Error:**
```
A record does not point to a valid Vercel IP
```

**Why this happens:**
1. ❌ System can't add domain to Vercel (API not configured)
2. ❌ System can't get recommended IP from Vercel
3. ❌ System uses fallback IP (might be wrong)
4. ❌ User configures DNS with wrong IP
5. ❌ Verification fails

---

## Solution

### Step 1: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click your project

2. **Go to Settings:**
   - Click **Settings** tab (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Add VERCEL_API_TOKEN:**
   - **Key:** `VERCEL_API_TOKEN`
   - **Value:** `[your token]` (from https://vercel.com/account/tokens)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

4. **Add VERCEL_PROJECT_ID:**
   - **Key:** `VERCEL_PROJECT_ID`
   - **Value:** `prj_5uHcncHYV6M5JHGN45J96j6Psj1U` (your project ID)
   - **Environment:** Select all
   - Click **Save**

5. **Add APP_IP_ADDRESS (Optional but recommended):**
   - **Key:** `APP_IP_ADDRESS`
   - **Value:** `76.76.21.21` (or `192.64.119.187`)
   - **Environment:** Select all
   - Click **Save**

---

### Step 2: Redeploy Project

**After adding environment variables:**

1. **Go to Deployments:**
   - Click **Deployments** tab
   - Click **"Redeploy"** on latest deployment
   - OR push a new commit to trigger deployment

2. **Wait for deployment:**
   - Usually takes 2-5 minutes
   - Check deployment logs

---

### Step 3: Fix Existing Domain

**If you already added a domain:**

1. **Check what IP was shown:**
   - Go to Dashboard → Domain tab
   - Check DNS records shown
   - Note the A record IP

2. **Check what IP your domain points to:**
   ```bash
   dig your-domain.com +short
   # OR
   nslookup your-domain.com
   ```

3. **Update A record if needed:**
   - Go to your domain registrar (Namecheap, etc.)
   - Update A record to: `76.76.21.21` या `192.64.119.187`
   - Wait 5-10 minutes

4. **Remove and re-add domain (Recommended):**
   - Delete domain from dashboard
   - Add domain again (now with correct API config)
   - System will get correct IP from Vercel
   - Configure DNS with new IP
   - Verify domain

---

## What Happens When API is Missing

### Without Vercel API Token:

```typescript
// src/lib/vercel-api.ts
if (!vercelToken) {
  return {
    success: false,
    error: 'Vercel API token not configured',
  };
}
```

**Result:**
- ❌ Domain not added to Vercel
- ❌ Can't get recommended IP
- ❌ Uses fallback IP (might be wrong)
- ❌ Verification might fail

### With Vercel API Token:

```typescript
// System adds domain to Vercel
const vercelResult = await addDomainToVercel(domain);

// Gets recommended IP from Vercel
const ipResult = await getVercelRecommendedIP();
const vercelIP = ipResult.ip; // Correct IP from Vercel

// Stores IP in database
vercelIPAddress: vercelIP
```

**Result:**
- ✅ Domain added to Vercel automatically
- ✅ Gets correct IP from Vercel
- ✅ Stores IP in database
- ✅ Shows correct IP to user
- ✅ Verification passes

---

## Quick Fix Steps

1. **Add env vars to Vercel:**
   - `VERCEL_API_TOKEN`
   - `VERCEL_PROJECT_ID`
   - `APP_IP_ADDRESS` (optional)

2. **Redeploy project**

3. **Fix existing domain:**
   - Option A: Update A record to `76.76.21.21`
   - Option B: Remove and re-add domain

4. **Verify domain**

---

## Verification

**After adding env vars and redeploying:**

1. **Check logs:**
   - Go to Vercel Dashboard → Functions
   - Check `/api/custom-domain` logs
   - Should see: `[Vercel API] Successfully added domain`

2. **Check database:**
   - `vercelIPAddress` should have correct IP
   - Not null

3. **Test new domain:**
   - Add a test domain
   - Should get correct IP from Vercel
   - DNS records should show correct IP

---

## Summary

**Root Cause:**
- Missing `VERCEL_API_TOKEN` and `VERCEL_PROJECT_ID` in Vercel

**Impact:**
- System can't get correct IP from Vercel
- Shows wrong IP to user
- Verification fails

**Fix:**
1. Add env vars to Vercel
2. Redeploy
3. Fix existing domain DNS
4. Verify

**Prevention:**
- Always add env vars before deploying
- Check env vars in Vercel dashboard
- Test domain addition after deployment


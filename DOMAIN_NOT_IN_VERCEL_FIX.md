# Domain Not Showing in Vercel - Fix Guide

## Problem

**When you add domain in dashboard:**
- ✅ Domain added to database
- ✅ DNS records shown
- ❌ Domain NOT showing in Vercel Dashboard

**Expected:**
- Domain should automatically appear in Vercel after adding

---

## Why This Happens

### Current Code Flow:

```typescript
// src/app/api/custom-domain/route.ts
1. User adds domain
2. System calls: addDomainToVercel(domain)
3. If API call fails → Error logged but domain still created
4. Domain in database but NOT in Vercel ❌
```

**Common Reasons for Failure:**

1. **VERCEL_API_TOKEN missing:**
   - API call fails silently
   - Domain created in database
   - But not added to Vercel

2. **VERCEL_PROJECT_ID missing:**
   - API call fails
   - Domain not added to Vercel

3. **API Error:**
   - Rate limit exceeded
   - Invalid token
   - Network error
   - Domain already exists (but in different project)

4. **Error Not Shown to User:**
   - Error is logged but user doesn't see it
   - User thinks domain was added successfully

---

## How to Check

### Step 1: Check Vercel Logs

1. **Go to Vercel Dashboard:**
   - Project → Functions tab
   - Look for `/api/custom-domain` logs

2. **Look for:**
   ```
   [Vercel API] Adding domain: example.com
   [Vercel API] Successfully added domain: example.com
   ```

3. **If you see errors:**
   ```
   [Vercel API] VERCEL_API_TOKEN not configured
   [Vercel API] Error adding domain: ...
   ```
   → This is the problem!

---

### Step 2: Check Environment Variables

1. **Vercel Dashboard → Settings → Environment Variables:**
   - Check if `VERCEL_API_TOKEN` exists
   - Check if `VERCEL_PROJECT_ID` exists
   - Check if values are correct

2. **If missing:**
   - Add them
   - Redeploy project

---

### Step 3: Check Domain Status

1. **Vercel Dashboard → Settings → Domains:**
   - Check if domain is listed
   - If missing → Not added to Vercel

---

## Fix Solutions

### Solution 1: Add Domain Manually to Vercel

**Quick Fix:**

1. **Go to Vercel Dashboard:**
   - Project → Settings → Domains

2. **Click "Add Domain":**
   - Enter domain name
   - Click "Add"

3. **Vercel will show DNS records:**
   - Use these records (they might be different)
   - Or use the ones from your dashboard

4. **Domain will appear in Vercel:**
   - Status: "Valid Configuration" or "Invalid Configuration"
   - SSL will provision automatically

---

### Solution 2: Fix Environment Variables

**If API token is missing:**

1. **Add to Vercel:**
   - Settings → Environment Variables
   - Add `VERCEL_API_TOKEN`
   - Add `VERCEL_PROJECT_ID`
   - Redeploy

2. **Remove and re-add domain:**
   - Delete domain from dashboard
   - Add again (will use API now)
   - Should appear in Vercel automatically

---

### Solution 3: Check API Response

**The code should show errors but doesn't:**

Currently, if `addDomainToVercel()` fails:
- Error is logged
- But domain is still created
- User doesn't see the error

**This is a bug in the current implementation.**

---

## Expected Behavior

### When Domain is Added:

1. **System calls Vercel API:**
   ```typescript
   const vercelResult = await addDomainToVercel(domain);
   ```

2. **If successful:**
   - Domain appears in Vercel ✅
   - DNS records shown ✅
   - Everything works ✅

3. **If failed:**
   - Error should be shown to user ❌ (currently not shown)
   - Domain still created in database
   - But NOT in Vercel

---

## Current Code Issue

**Problem:**
```typescript
// src/app/api/custom-domain/route.ts
const vercelResult = await addDomainToVercel(domain);
// Error is logged but not returned to user
// Domain is still created even if Vercel API fails
```

**What should happen:**
- If Vercel API fails, show error to user
- Or at least warn user that domain needs manual addition

---

## Quick Fix for Now

### Option 1: Add Domain Manually (Easiest)

1. **Vercel Dashboard → Domains:**
   - Click "Add Domain"
   - Enter domain
   - Add

2. **Use DNS records from Vercel:**
   - Vercel will show recommended IP
   - Update A record if different

---

### Option 2: Fix Environment Variables and Re-add

1. **Add env vars to Vercel:**
   - `VERCEL_API_TOKEN`
   - `VERCEL_PROJECT_ID`
   - Redeploy

2. **Delete domain from dashboard:**
   - Remove domain

3. **Add domain again:**
   - Should automatically add to Vercel now
   - Check Vercel logs to confirm

---

## How to Verify

### Check if Domain is in Vercel:

1. **Vercel Dashboard → Settings → Domains:**
   - Domain should be listed
   - Status should show

2. **Check Vercel Logs:**
   - Functions → `/api/custom-domain`
   - Look for success/error messages

3. **Check Browser Console:**
   - When adding domain
   - Look for API errors

---

## Summary

**Problem:**
- Domain added to database ✅
- But NOT added to Vercel ❌
- User doesn't see error

**Causes:**
- Missing `VERCEL_API_TOKEN`
- Missing `VERCEL_PROJECT_ID`
- API call failed silently
- Error not shown to user

**Fixes:**
1. Add domain manually to Vercel (quickest)
2. Fix env vars and re-add domain
3. Check Vercel logs for errors

**Expected:**
- Domain should appear in Vercel automatically
- If not, check logs and env vars

---

## Next Steps

1. **Check Vercel logs** for errors
2. **Check env vars** are set correctly
3. **Add domain manually** if needed
4. **Or fix env vars** and re-add domain

**The domain should show in Vercel after adding!** If not, there's an API error that needs to be fixed.


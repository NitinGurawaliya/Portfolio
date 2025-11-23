# DNS Not Resolving - Fix Guide

## Problem

**Domain shows "Verified & Live" in dashboard, but:**
- ❌ Browser shows: "This site can't be reached"
- ❌ Error: `DNS_PROBE_POSSIBLE`
- ❌ DNS address could not be found

**This means:**
- Domain is verified in database ✅
- But DNS records are not working ❌
- Or DNS hasn't propagated yet
- Or A record is pointing to wrong IP

---

## Quick Diagnosis

### Step 1: Check What IP Your Domain Points To

**In Terminal:**
```bash
# Check A record
dig zayka.online +short
# OR
nslookup zayka.online
```

**Expected Result:**
- Should return: `76.76.21.21` (or your configured IP)
- If returns nothing or different IP → DNS not configured correctly

**Online Tools:**
1. **MXToolbox:** https://mxtoolbox.com/DNSLookup.aspx
   - Enter: `zayka.online`
   - Check A record value

2. **DNS Checker:** https://dnschecker.org/
   - Enter: `zayka.online`
   - Select: `A` record
   - Should show `76.76.21.21` globally

---

## Common Issues & Fixes

### Issue 1: A Record Not Configured

**Check:**
- Go to Namecheap → Domain List → zayka.online → Advanced DNS
- Look for A record with Host `@`
- If missing → Add it!

**Fix:**
1. Go to Namecheap DNS settings
2. Add A Record:
   - **Type:** A
   - **Host:** `@`
   - **Value:** `76.76.21.21`
   - **TTL:** `Automatic` or `3600`
3. Click **Save**
4. Wait 5-10 minutes

---

### Issue 2: A Record Points to Wrong IP

**Check:**
```bash
dig zayka.online +short
# If returns different IP (not 76.76.21.21)
```

**Fix:**
1. Go to Namecheap → Advanced DNS
2. Find A record with Host `@`
3. Update **Value** to: `76.76.21.21`
4. Click **Save**
5. Wait 5-10 minutes

---

### Issue 3: DNS Not Propagated Yet

**Check:**
- Use https://dnschecker.org/
- Enter: `zayka.online`
- Select: `A` record
- Check if all locations show `76.76.21.21`

**If some locations show different IP or nothing:**
- DNS is still propagating
- Wait 10-30 minutes
- Can take up to 24 hours (usually 5-10 minutes)

---

### Issue 4: Domain Not Added to Vercel

**Check:**
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Check if `zayka.online` is listed
3. If missing → Add it manually

**Fix:**
1. Vercel Dashboard → Project → Settings → Domains
2. Click **"Add Domain"**
3. Enter: `zayka.online`
4. Vercel will show DNS records
5. Make sure A record matches: `76.76.21.21`

---

### Issue 5: Multiple A Records

**Check:**
- Namecheap → Advanced DNS
- Look for multiple A records with Host `@`
- Should have only ONE A record

**Fix:**
1. Delete all A records with Host `@`
2. Add ONE A record:
   - **Type:** A
   - **Host:** `@`
   - **Value:** `76.76.21.21`
3. Save

---

## Step-by-Step Fix

### Step 1: Verify DNS Records in Namecheap

1. **Go to Namecheap:**
   - https://www.namecheap.com/
   - Login → Domain List → zayka.online

2. **Go to Advanced DNS:**
   - Click **"Advanced DNS"** tab

3. **Check Records:**
   - Should have:
     - **A Record:** `@` → `76.76.21.21`
     - **CNAME:** `www` → `devfolio.cc.`
     - **TXT:** `_devfolio-verification` → `[token]`

4. **If A Record Missing or Wrong:**
   - Delete old A record (if exists)
   - Add new A record:
     - **Type:** A Record
     - **Host:** `@`
     - **Value:** `76.76.21.21`
     - **TTL:** `Automatic`
   - Click **Save** (green checkmark)

---

### Step 2: Wait for DNS Propagation

**After updating DNS:**
- Wait 5-10 minutes (minimum)
- Can take up to 24 hours (rare)
- Usually works within 10-15 minutes

**Check Propagation:**
```bash
# Check every few minutes
dig zayka.online +short
# Should return: 76.76.21.21
```

**Online Check:**
- https://dnschecker.org/
- Enter: `zayka.online`
- Select: `A` record
- Check if all locations show `76.76.21.21`

---

### Step 3: Verify Domain in Vercel

1. **Go to Vercel Dashboard:**
   - Project → Settings → Domains

2. **Check if domain is listed:**
   - If `zayka.online` is there → Good ✅
   - If missing → Add it manually

3. **Check Domain Status:**
   - Should show "Valid Configuration"
   - If shows "Invalid Configuration" → A record might be wrong

---

### Step 4: Clear Browser Cache

**Sometimes browser caches old DNS:**
1. Clear browser cache
2. Or use incognito/private mode
3. Or try different browser

---

### Step 5: Test Again

**After waiting 10 minutes:**
1. Check DNS: `dig zayka.online +short`
2. Should return: `76.76.21.21`
3. Visit: `https://zayka.online`
4. Should load portfolio ✅

---

## Troubleshooting Checklist

- [ ] A record exists in Namecheap
- [ ] A record Host is `@` (not blank, not domain name)
- [ ] A record Value is `76.76.21.21` (exactly)
- [ ] Only ONE A record with Host `@`
- [ ] DNS propagated (check with dnschecker.org)
- [ ] Domain added to Vercel
- [ ] Waited 10+ minutes after DNS update
- [ ] Cleared browser cache
- [ ] Tried different browser/incognito

---

## Quick Fix Summary

1. **Go to Namecheap → Advanced DNS**
2. **Check A record:**
   - Host: `@`
   - Value: `76.76.21.21`
3. **If wrong or missing:**
   - Delete old A record
   - Add new: `@` → `76.76.21.21`
   - Save
4. **Wait 10 minutes**
5. **Check:** `dig zayka.online +short`
6. **Visit:** `https://zayka.online`
7. **Should work! ✅**

---

## Still Not Working?

**Check these:**

1. **DNS Propagation:**
   - Use https://dnschecker.org/
   - Check if A record shows globally
   - If not → Wait longer

2. **Vercel Domain Status:**
   - Vercel Dashboard → Domains
   - Check if domain shows "Valid Configuration"
   - If "Invalid" → A record IP might be wrong

3. **Multiple DNS Providers:**
   - Make sure you're updating DNS at correct registrar
   - Check if domain uses different DNS provider

4. **Firewall/Network:**
   - Try from different network
   - Try from mobile data
   - Check if firewall is blocking

---

## Expected Timeline

- **DNS Update:** Immediate (in Namecheap)
- **DNS Propagation:** 5-10 minutes (usually)
- **Full Global Propagation:** Up to 24 hours (rare)
- **Vercel SSL:** 1-5 minutes after DNS resolves

**Be patient! DNS takes time to propagate globally.**


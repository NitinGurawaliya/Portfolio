# How to Verify Custom Domain is Working

## Step 1: Check DNS Records are Live

### Using Command Line (Terminal):

```bash
# Check A record (should return 76.76.21.21)
nslookup zayka.online
# OR
dig zayka.online +short

# Check CNAME record (should return devfolio.cc)
nslookup www.zayka.online
# OR
dig www.zayka.online CNAME +short

# Check TXT record (should return your verification token)
nslookup -type=TXT _devfolio-verification.zayka.online
# OR
dig _devfolio-verification.zayka.online TXT +short
```

### Using Online Tools:

1. **MXToolbox DNS Lookup:**
   - Go to: https://mxtoolbox.com/DNSLookup.aspx
   - Enter your domain: `zayka.online`
   - Check A record shows: `76.76.21.21`

2. **DNS Checker:**
   - Go to: https://dnschecker.org/
   - Enter: `zayka.online`
   - Select record type: `A`
   - Should show `76.76.21.21` globally

---

## Step 2: Verify in Dashboard

### In DevFolio Dashboard:

1. **Go to Dashboard → Domain tab**
2. **Check Domain Status:**
   - Should show your domain: `zayka.online`
   - Status badge:
     - ⏳ **Pending Verification** = DNS not verified yet
     - ✅ **Verified & Live** = Everything working!

3. **Click "Verify Domain" button:**
   - System will check all DNS records
   - Wait 10-30 seconds for verification
   - Check result:
     - ✅ **Success**: "Domain verified successfully!"
     - ❌ **Failed**: Error message with details

---

## Step 3: Check Verification Details

### What to Look For:

After clicking "Verify Domain", you should see:

**✅ Success Response:**
```json
{
  "success": true,
  "verified": true,
  "checks": {
    "ownershipVerified": true,  // TXT record found
    "aRecordPointing": true,    // A record correct
    "cnamePointing": true       // CNAME correct
  },
  "message": "Domain verified successfully!"
}
```

**❌ Failure Response:**
```json
{
  "success": true,
  "verified": false,
  "checks": {
    "ownershipVerified": false,  // TXT record missing
    "aRecordPointing": false,    // A record wrong
    "cnamePointing": false       // CNAME wrong
  },
  "message": "DNS records not found..."
}
```

---

## Step 4: Check Vercel Logs

### View Function Logs:

1. **Go to Vercel Dashboard**
2. **Your Project → Functions tab**
3. **Look for:**
   - `/api/custom-domain/[id]/verify` function
   - Check logs for verification details

### What to Look For in Logs:

**✅ Success Logs:**
```
🔍 [DNS Verification] Checking TXT record: _devfolio-verification.zayka.online
✅ [DNS Verification] TXT records found: [['devfolio-verify-xxxxx']]
🔍 [DNS Verification] Checking A record for: zayka.online
✅ [DNS Verification] A record addresses found: ['76.76.21.21']
📊 [DNS Verification] Verification Summary:
  ✓ Ownership (TXT): ✅
  ✓ A Record: ✅
  ✓ CNAME (www): ✅
  ✓ All Checks Passed: ✅
```

**❌ Failure Logs:**
```
❌ [DNS Verification] TXT verification failed: ENOTFOUND
❌ [DNS Verification] A record verification failed: Wrong IP
```

---

## Step 5: Test Domain Access

### Once Verified:

1. **Open browser**
2. **Go to:** `http://zayka.online` or `https://zayka.online`
3. **Should redirect to:** Your portfolio page
4. **Check:**
   - Portfolio loads correctly
   - All images/assets work
   - Navigation works

### Test Both Versions:

- `zayka.online` (apex domain)
- `www.zayka.online` (www subdomain)

Both should work!

---

## Step 6: Common Issues & Solutions

### Issue 1: "TXT record not found"
**Symptoms:**
- `ownershipVerified: false`
- Error: `ENOTFOUND _devfolio-verification.zayka.online`

**Solutions:**
1. Wait 10-15 more minutes (DNS propagation)
2. Verify TXT record in Namecheap:
   - Host: `_devfolio-verification` (with underscore)
   - Value: Exact token from dashboard
3. Check with: `dig _devfolio-verification.zayka.online TXT`

### Issue 2: "A record doesn't match"
**Symptoms:**
- `aRecordPointing: false`
- Wrong IP address returned

**Solutions:**
1. Verify A record in Namecheap:
   - Host: `@` or blank
   - Value: `76.76.21.21` (exact match)
2. Check with: `dig zayka.online +short`
3. Should return: `76.76.21.21`

### Issue 3: "CNAME not pointing correctly"
**Symptoms:**
- `cnamePointing: false`

**Solutions:**
1. Verify CNAME in Namecheap:
   - Host: `www`
   - Value: `devfolio.cc` (exact match, no trailing dot)
2. Check with: `dig www.zayka.online CNAME`

### Issue 4: "Domain verified but not accessible"
**Symptoms:**
- Verification passes
- But domain doesn't load portfolio

**Solutions:**
1. Check Vercel domain settings:
   - Project → Settings → Domains
   - Make sure domain is added
2. Check middleware is working
3. Check portfolio is published
4. Wait 5-10 minutes for changes to propagate

---

## Quick Verification Checklist

- [ ] DNS records added in Namecheap (A, CNAME, TXT)
- [ ] Waited 10-15 minutes for DNS propagation
- [ ] Checked DNS records with `nslookup` or `dig`
- [ ] Clicked "Verify Domain" in dashboard
- [ ] Verification shows ✅ (all checks passed)
- [ ] Domain status shows "Verified & Live"
- [ ] Can access portfolio at `zayka.online`
- [ ] Can access portfolio at `www.zayka.online`
- [ ] All portfolio features work correctly

---

## Success Indicators

✅ **Everything Working:**
- Dashboard shows: "✅ Verified & Live"
- All verification checks: `true`
- Domain loads your portfolio
- No errors in Vercel logs
- Email notification received (if configured)

🎉 **You're Done!** Your custom domain is live!

---

## Need Help?

If verification fails:
1. Check Vercel function logs for detailed error
2. Verify DNS records with online tools
3. Wait longer (DNS can take up to 24 hours)
4. Double-check all record values match exactly


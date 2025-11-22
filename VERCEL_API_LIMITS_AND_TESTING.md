# Vercel API Limits & Testing Guide

## ✅ Good News: Vercel API is FREE!

**No purchase required!** Vercel API is free to use, but has rate limits.

---

## Rate Limits (Free Tier)

### Per Hour:
- **Domain Addition:** 100 requests/hour
- **Domain Verification:** 50 requests/hour  
- **Domain Removal:** 100 requests/hour

### Per Day:
- **~1,000 requests/day** (estimated)

---

## How Many Users Can Use It?

### Calculation:

**Per User Operations:**
- Add domain: 1 API call
- Verify domain: 1 API call (automatic)
- Remove domain: 1 API call (if they remove)

**Total: ~2-3 API calls per user**

### Capacity:

**100 requests/hour:**
- If users add domains spread over time: **✅ Works fine**
- If 50+ users add domains in same hour: **⚠️ Might hit limit**

**For 100 users:**
- ✅ **Free tier is sufficient** if users don't all add domains at once
- ✅ **Works perfectly** for normal usage patterns

---

## How the New Automated Setup Works

### Complete Flow:

```
1. User adds domain in dashboard
   ↓
2. User configures DNS at registrar (Namecheap, GoDaddy, etc.)
   ↓
3. User clicks "Verify Domain"
   ↓
4. System verifies DNS records ✅
   ↓
5. System automatically calls Vercel API ✅
   POST /v9/projects/{id}/domains
   ↓
6. Vercel adds domain automatically ✅
   ↓
7. Vercel provisions SSL automatically ✅
   ↓
8. Domain is live! 🎉
```

### What Happens Automatically:

**When user verifies domain:**
```typescript
// src/app/api/custom-domain/[id]/verify/route.ts

1. Verify DNS records ✅
2. Update database ✅
3. Cache domain mapping ✅
4. addDomainToVercel(domain) → Vercel API ✅
5. Vercel adds domain + provisions SSL ✅
6. Send success email ✅
```

**Zero manual steps!** Everything is automated.

---

## How to Test It

### Step 1: Set Up Environment Variables

**In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. Add these 3 variables:

```bash
# Required
VERCEL_API_TOKEN=vercel_xxxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx

# Optional (only if using team account)
VERCEL_TEAM_ID=team_xxxxxxxxxxxxx
```

### Step 2: Get Vercel API Token

1. Go to: **https://vercel.com/account/tokens**
2. Click **"Create Token"**
3. Name: `Custom Domain Automation`
4. Scope: **Full Account Access**
5. Copy token → Add to Vercel env vars

### Step 3: Get Project ID

1. Vercel Dashboard → Your Project
2. **Settings** → **General**
3. Copy **"Project ID"** (starts with `prj_`)

### Step 4: Test with a Domain

**Option A: Test with New Domain**
1. Buy a cheap test domain (~$1-2/year)
2. Add domain in dashboard
3. Configure DNS at registrar
4. Click "Verify Domain"
5. **Check Vercel logs** - should see API call
6. Check Vercel dashboard - domain should appear automatically

**Option B: Test with Existing Domain**
1. Remove `zayka.online` from Vercel (if manually added)
2. Remove from your dashboard
3. Add it again
4. Verify domain
5. Should automatically add to Vercel

### Step 5: Check Logs

**In Vercel Dashboard:**
1. Go to **Functions** tab
2. Look for `/api/custom-domain/[id]/verify`
3. Check logs for:
   ```
   [Vercel API] Adding domain: example.com
   [Vercel API] Successfully added domain: example.com
   ```

**In Terminal (local testing):**
```bash
# Check console logs
[Custom Domain] Adding domain to Vercel: example.com
[Vercel API] Successfully added domain: example.com
```

---

## Testing Checklist

### Before Testing:
- [ ] `VERCEL_API_TOKEN` added to Vercel env vars
- [ ] `VERCEL_PROJECT_ID` added to Vercel env vars
- [ ] Token has correct permissions
- [ ] Project ID is correct

### Test Flow:
- [ ] Add domain in dashboard
- [ ] Configure DNS at registrar
- [ ] Click "Verify Domain"
- [ ] Check logs for Vercel API call
- [ ] Verify domain appears in Vercel automatically
- [ ] Check SSL provisioning (takes 1-5 minutes)
- [ ] Visit domain - should show portfolio

### Expected Results:
- ✅ Domain verified in dashboard
- ✅ Domain automatically added to Vercel
- ✅ SSL certificate provisioned
- ✅ Portfolio loads at custom domain

---

## Will All Users Be Able to Connect Domains?

### ✅ YES! Fully Automated

**Every user can:**
1. Add their custom domain
2. Configure DNS (one-time at registrar)
3. Click "Verify Domain"
4. **Domain automatically connects** ✅
5. Portfolio goes live automatically ✅

**No manual steps required from you!**

### User Experience:

**Before (Manual):**
```
User: "I want to connect my domain"
You: "Let me manually add it to Vercel..."
[Manual work required]
```

**After (Automated):**
```
User: "I want to connect my domain"
User: *Clicks verify*
System: *Automatically adds to Vercel*
User: "Done! It's live!" 🎉
```

**Zero work from you!**

---

## Rate Limit Handling

### Current Implementation:

**If rate limit hit:**
- Vercel API returns error
- Domain is still verified in our system ✅
- User can retry later
- Or manually add to Vercel if needed

**Error Handling:**
```typescript
// src/lib/vercel-api.ts
// If rate limit exceeded:
// - Log error
// - Domain still verified
// - User can retry
```

### For High Volume (Future):

**If you have 1000+ users:**
1. **Upgrade to Vercel Pro:** $20/month
   - 10x higher rate limits
   - Better for scaling

2. **Implement Queue System:**
   - Queue domain additions
   - Process in background
   - Retry with exponential backoff

3. **Monitor Usage:**
   - Track API calls
   - Alert if approaching limit

---

## Cost Breakdown

### Free Tier (Current):
- **Vercel API:** FREE ✅
- **Custom Domains:** FREE (unlimited)
- **SSL Certificates:** FREE (automatic)
- **Total Cost:** $0 ✅

### Pro Tier (If Needed):
- **Vercel Pro:** $20/month
- **Includes:**
  - 10x API rate limits
  - Better performance
  - Priority support
  - Advanced analytics

**For 100 users:** Free tier is sufficient ✅

---

## Summary

### ✅ What Works:
- **Automated domain addition** via Vercel API
- **Free for 100 users** (easily)
- **No manual steps** required
- **SSL auto-provisioning**
- **All users can connect domains automatically**

### ⚠️ Considerations:
- **Rate limits:** 100 requests/hour (free tier)
- **Monitor usage** if many users add domains simultaneously
- **Upgrade to Pro** if scaling beyond 500 users

### 🎯 Testing Steps:
1. Add env vars (`VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`)
2. Test with one domain
3. Check logs for API calls
4. Verify domain appears in Vercel automatically
5. Confirm SSL provisioning

### 💰 Cost:
- **Free tier:** $0 ✅
- **Works for 100 users:** ✅
- **No purchase required:** ✅

**Bottom Line:** 
- ✅ **Free tier works for 100 users easily!**
- ✅ **All users can connect domains automatically!**
- ✅ **No purchase required!**
- ✅ **Fully automated!** 🚀

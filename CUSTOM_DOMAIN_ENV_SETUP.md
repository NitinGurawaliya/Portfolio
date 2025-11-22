# Custom Domain Environment Variables Setup

## For Production (Vercel)

### Required Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables):

```env
# Your app's main domain (where your app is hosted)
NEXT_PUBLIC_APP_DOMAIN=devfolio.cc

# Vercel's static IP addresses for A records
# Use one of these IPs (they're all valid):
APP_IP_ADDRESS=76.76.21.21
# OR
APP_IP_ADDRESS=76.76.21.22
# OR
APP_IP_ADDRESS=76.76.21.23
# OR
APP_IP_ADDRESS=76.76.21.24
```

### How to Add in Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `NEXT_PUBLIC_APP_DOMAIN`
   - **Value**: `devfolio.cc` (or your actual domain)
   - **Environment**: Production, Preview, Development (select all)
4. Add second variable:
   - **Key**: `APP_IP_ADDRESS`
   - **Value**: `76.76.21.21` (or any of the 4 IPs above)
   - **Environment**: Production, Preview, Development (select all)

## For Local Testing

### Option 1: Use Production Values (Recommended)

Even for local testing, use production values since DNS verification happens against production:

```env
# .env.local
NEXT_PUBLIC_APP_DOMAIN=devfolio.cc
APP_IP_ADDRESS=76.76.21.21
```

**Why?** DNS verification checks DNS records, which point to production. Your local server can't verify DNS records.

### Option 2: Test After Deployment

The best approach is to:
1. Deploy to production first
2. Set environment variables in Vercel
3. Test custom domain feature on production
4. Check logs in Vercel dashboard

## How to Find Your Production IP (If Not Using Vercel)

If you're hosting on your own server:

### Method 1: Check Your Server
```bash
# SSH into your server
ssh user@your-server.com

# Get public IP
curl ifconfig.me
# OR
hostname -I
```

### Method 2: Check DNS Records
```bash
# Check what IP your domain points to
nslookup devfolio.cc
# OR
dig devfolio.cc +short
```

### Method 3: Check Vercel Dashboard
1. Go to Vercel project → Settings → Domains
2. Add a test domain
3. Vercel will show you the IP addresses to use

## Verification

After setting environment variables:

1. **Restart your dev server** (if testing locally)
2. **Redeploy on Vercel** (if on production)
3. **Check logs** to verify:
   ```bash
   # In terminal, you should see:
   🔍 [DNS Verification] Expected IP: 76.76.21.21
   ```

## Important Notes

⚠️ **For Vercel Deployments:**
- Vercel uses these 4 static IPs: `76.76.21.21`, `76.76.21.22`, `76.76.21.23`, `76.76.21.24`
- You can use any of them - they all work
- These IPs are Vercel's edge network IPs

⚠️ **For Local Testing:**
- DNS verification **won't work locally** because:
  - DNS records point to production IP
  - Your local server can't verify production DNS
- **Solution**: Test on production after deployment

⚠️ **DNS Propagation:**
- After adding DNS records, wait 5-10 minutes (can take up to 24 hours)
- Use `dig` or `nslookup` to check if records are live:
  ```bash
  dig zayka.online +short
  dig _devfolio-verification.zayka.online TXT
  ```

## Cron Job Schedule

⚠️ **Vercel Hobby Plan Limitation:**
- Hobby plans only support **daily cron jobs** (once per day)
- The cron job is configured to run **daily at 2 AM** (`0 2 * * *`)
- Users can still **manually verify** domains by clicking "Verify Domain" button
- Daily verification is sufficient since DNS propagation can take 5-10 minutes to 24 hours

**To upgrade for hourly verification:**
- Upgrade to Vercel Pro plan
- Change schedule in `vercel.json` to `"0 * * * *"` (every hour)

## Quick Setup Checklist

- [ ] Add `NEXT_PUBLIC_APP_DOMAIN` to Vercel environment variables
- [ ] Add `APP_IP_ADDRESS` to Vercel environment variables (use `76.76.21.21`)
- [ ] Verify cron schedule in `vercel.json` is `"0 2 * * *"` (daily, Hobby plan compatible)
- [ ] Redeploy on Vercel
- [ ] Test custom domain feature
- [ ] Check Vercel function logs for DNS verification details


# How to Add DNS Records in Namecheap

## Step-by-Step Guide

### Step 1: Login to Namecheap
1. Go to [namecheap.com](https://www.namecheap.com)
2. Click **Sign In** (top right)
3. Enter your credentials

---

### Step 2: Access Domain List
1. After login, click **Domain List** in the left sidebar
2. Find your domain (e.g., `zayka.online`)
3. Click **Manage** button next to your domain

---

### Step 3: Go to Advanced DNS
1. Scroll down to **NAMESERVERS** section
2. Make sure it's set to **Namecheap BasicDNS** (not Custom DNS)
3. Scroll down to **ADVANCED DNS** tab
4. Click on **ADVANCED DNS** tab

---

### Step 4: Add DNS Records

You'll see a section with **Host Records**. Add these 3 records:

#### Record 1: A Record (for apex domain - zayka.online)
1. Click **Add New Record** button
2. Select **A Record** from dropdown
3. Fill in:
   - **Host**: `@` (or leave blank, or enter your domain without www)
   - **Value**: `76.76.21.21` (or your APP_IP_ADDRESS)
   - **TTL**: `Automatic` (or `3600`)
4. Click **Save** (green checkmark icon)

#### Record 2: CNAME Record (for www subdomain - www.zayka.online)
1. Click **Add New Record** button
2. Select **CNAME Record** from dropdown
3. Fill in:
   - **Host**: `www`
   - **Value**: `devfolio.cc` (or your NEXT_PUBLIC_APP_DOMAIN)
   - **TTL**: `Automatic` (or `3600`)
4. Click **Save** (green checkmark icon)

#### Record 3: TXT Record (for verification - _devfolio-verification.zayka.online)
1. Click **Add New Record** button
2. Select **TXT Record** from dropdown
3. Fill in:
   - **Host**: `_devfolio-verification`
   - **Value**: `[your-verification-token]` (from dashboard after adding domain)
   - **TTL**: `Automatic` (or `3600`)
4. Click **Save** (green checkmark icon)

---

## Visual Guide

After adding, your DNS records should look like this:

```
Type    Host                    Value                    TTL
----    ----                    -----                    ---
A       @                       76.76.21.21              Automatic
CNAME   www                     devfolio.cc              Automatic
TXT     _devfolio-verification  devfolio-verify-xxxxx    Automatic
```

---

## Important Notes

### ⚠️ Common Issues:

1. **Host field for A Record:**
   - Use `@` symbol (represents root domain)
   - OR leave it blank
   - OR enter just your domain name (without www)

2. **Host field for CNAME:**
   - Enter `www` (without quotes, without domain)

3. **Host field for TXT:**
   - Enter `_devfolio-verification` (exactly as shown, with underscore)

4. **TTL:**
   - Use `Automatic` or `3600` (1 hour)
   - Lower TTL = faster propagation but more DNS queries

---

## After Adding Records

1. **Wait 5-10 minutes** for DNS propagation
   - Can take up to 24 hours in some cases
   - Usually works within 10-15 minutes

2. **Verify DNS is live:**
   ```bash
   # Check A record
   nslookup zayka.online
   
   # Check TXT record
   nslookup -type=TXT _devfolio-verification.zayka.online
   ```

3. **Go back to DevFolio Dashboard**
   - Click **Verify Domain** button
   - System will check DNS records
   - If verified, domain will be live! 🎉

---

## Troubleshooting

### Issue: "DNS records not found"
- **Solution**: Wait 10-15 more minutes, DNS propagation takes time
- **Check**: Use `nslookup` or `dig` command to verify records are live

### Issue: "A record doesn't match"
- **Solution**: Make sure A record value is exactly `76.76.21.21` (or your APP_IP_ADDRESS)
- **Check**: Verify in Namecheap that the IP is correct

### Issue: "TXT record not found"
- **Solution**: Make sure Host is exactly `_devfolio-verification` (with underscore)
- **Check**: Verify the verification token matches what's in dashboard

### Issue: Records not showing up
- **Solution**: 
  1. Make sure you're in **Advanced DNS** tab (not Basic DNS)
  2. Refresh the page
  3. Check if records were saved (green checkmark should appear)

---

## Quick Checklist

- [ ] Logged into Namecheap
- [ ] Went to Domain List → Manage
- [ ] Clicked Advanced DNS tab
- [ ] Added A record: `@` → `76.76.21.21`
- [ ] Added CNAME record: `www` → `devfolio.cc`
- [ ] Added TXT record: `_devfolio-verification` → `[token]`
- [ ] Waited 10-15 minutes
- [ ] Clicked "Verify Domain" in DevFolio dashboard

---

## Need Help?

If you're stuck:
1. Take a screenshot of your Namecheap DNS records
2. Check the verification token in DevFolio dashboard
3. Verify all three records are added correctly
4. Wait for DNS propagation (can take up to 24 hours)


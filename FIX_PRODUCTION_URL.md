# 🚀 Fix Production URL Issue - Step by Step

## 🔍 Problem
Twitter meta tags में `localhost:3000` दिख रहा है instead of `devfolio.cc`

```html
<!-- ❌ Wrong (Current) -->
<meta name="twitter:image" content="http://localhost:3000/api/og-landing" />

<!-- ✅ Correct (What we want) -->
<meta name="twitter:image" content="https://www.devfolio.cc/api/og-landing" />
```

---

## ✅ Solution: Set Production Environment Variable

### Method 1: Vercel Dashboard (Recommended)

#### Step 1: Open Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Login to your account
3. Find and click your **Portfolio** project

#### Step 2: Add Environment Variable
1. Click **Settings** tab
2. Click **Environment Variables** in sidebar
3. Click **Add** button

#### Step 3: Configure Variable
```
Name: NEXT_PUBLIC_BASE_URL
Value: https://www.devfolio.cc
Environment: ✅ Production
```

#### Step 4: Save and Redeploy
1. Click **Save**
2. Go to **Deployments** tab
3. Click **⋯** (three dots) on latest deployment
4. Click **Redeploy**

⏰ **Wait 2-3 minutes** for deployment

---

### Method 2: Vercel CLI (Alternative)

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Add environment variable
vercel env add NEXT_PUBLIC_BASE_URL

# When prompted:
# Value: https://www.devfolio.cc
# Environment: Production

# Redeploy
vercel --prod
```

---

### Method 3: Through Git (If using Netlify/Railway/Others)

#### For Netlify:
1. Go to: https://app.netlify.com
2. Select your site
3. **Site settings** → **Environment variables**
4. Add:
   ```
   NEXT_PUBLIC_BASE_URL = https://www.devfolio.cc
   ```
5. Click **Save**
6. **Trigger deploy** from Deploys tab

#### For Railway:
1. Go to: https://railway.app/dashboard
2. Select your project
3. Click **Variables** tab
4. Add:
   ```
   NEXT_PUBLIC_BASE_URL = https://www.devfolio.cc
   ```
5. Save (auto-redeploys)

---

## 🧪 Verify Fix

### Step 1: Wait for Deployment
⏰ Wait 2-3 minutes after redeploying

### Step 2: Check Page Source
1. Open: https://www.devfolio.cc/
2. Right-click → **View Page Source** (or `Ctrl+U`)
3. Search for: `twitter:image`

**Should show:**
```html
<meta name="twitter:image" content="https://www.devfolio.cc/api/og-landing" />
```

✅ If you see `https://www.devfolio.cc` - **SUCCESS!**
❌ If still showing `localhost:3000` - deployment not complete, wait longer

### Step 3: Test Twitter Card
1. Go to: https://cards-dev.twitter.com/validator
2. Enter: `https://www.devfolio.cc/`
3. Click: **Preview card**

**Expected Result:**
- ✅ Beautiful DevFolio image appears
- ✅ No errors
- ✅ Large image preview

### Step 4: Test in Twitter
1. Create new tweet
2. Paste: `https://www.devfolio.cc/`
3. Wait 3-5 seconds

**Expected Result:**
- ✅ Beautiful branded image appears
- ✅ Professional looking card
- ✅ DevFolio branding visible

---

## 📋 Quick Checklist

- [ ] Environment variable added in hosting platform
- [ ] Value set to: `https://www.devfolio.cc`
- [ ] Applied to **Production** environment
- [ ] Saved successfully
- [ ] Redeployed site
- [ ] Waited 2-3 minutes
- [ ] Checked page source
- [ ] Verified correct URL in meta tags
- [ ] Tested Twitter Card Validator
- [ ] Tested actual Twitter post

---

## 🐛 Common Issues

### Issue 1: "Still showing localhost"
**Solution:**
- Clear your browser cache
- Wait 5 more minutes for deployment
- Force refresh: `Ctrl+Shift+R`
- Check if environment variable was saved

### Issue 2: "Variable not taking effect"
**Solution:**
- Verify it's set for **Production** environment (not Preview/Development)
- Redeploy after adding variable
- Some platforms need manual redeploy

### Issue 3: "Deployment failed"
**Solution:**
- Check deployment logs in hosting dashboard
- Verify no build errors
- Try redeploying again

---

## 🎯 Expected Timeline

| Step | Time |
|------|------|
| Add environment variable | 1 minute |
| Save and trigger redeploy | 1 minute |
| Wait for deployment | 2-3 minutes |
| Verify in page source | 1 minute |
| Test Twitter Card Validator | 1 minute |
| **Total** | **~7 minutes** |

---

## ✅ Success Indicators

You'll know it's working when:

1. **Page Source shows:**
   ```html
   content="https://www.devfolio.cc/api/og-landing"
   ```

2. **Twitter Card Validator shows:**
   - Beautiful DevFolio image
   - No errors
   - Large image preview

3. **Twitter Post shows:**
   - Professional branded card
   - DevFolio logo and branding
   - Correct image and text

---

## 🎉 After Success

Once fixed, your Twitter cards will:
- ✅ Show beautiful branded images
- ✅ Work for all new tweets
- ✅ Display professional portfolio previews
- ✅ Include proper DevFolio branding

**🚀 अब जाओ, environment variable set करो, और redeploy करो!**

---

## 📞 Need Help?

If still not working after following all steps:
1. Check deployment logs
2. Verify environment variable is saved
3. Try redeploying 2-3 times
4. Clear all caches (browser + hosting)
5. Contact hosting platform support

# 🚀 Deploy and Test Guide - Twitter Cards Fix

## Step 1: Deploy Changes to Production

### If using Vercel:
```bash
# Commit your changes
git add .
git commit -m "Add Twitter card OG images with branding"
git push origin production

# Vercel will auto-deploy
```

### If using other hosting:
```bash
# Build
npm run build

# Deploy to your hosting platform
```

---

## Step 2: Wait for Deployment (2-3 minutes)

- Check your hosting dashboard
- Wait for deployment to complete
- Verify site is live

---

## Step 3: Test OG Image Endpoints

### Test Landing Page OG:
Open in browser:
```
https://devfolio.cc/api/og-landing
```
**Should show:** Beautiful DevFolio hero image

### Test Portfolio OG:
Open in browser:
```
https://devfolio.cc/api/og?username=test&displayName=Test%20User&jobTitle=Developer&bio=Test%20bio&profilePic=https://github.com/github.png
```
**Should show:** Profile image with DevFolio branding

---

## Step 4: Force Twitter to Re-Crawl

### Method 1: Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your URL: `https://devfolio.cc/`
3. Click "Preview card"
4. This forces Twitter to refresh cache

### Method 2: Add Query Parameter
Instead of sharing:
```
devfolio.cc
```

Share:
```
devfolio.cc?v=2
```
This tricks Twitter into thinking it's a new URL

### Method 3: Wait 5-10 Minutes
- Twitter cache expires after some time
- Just wait and try again

---

## Step 5: Test in Twitter/X

1. Create a new draft post
2. Paste your URL: `https://devfolio.cc/`
3. Wait 3-5 seconds for preview to load
4. Should show beautiful branded image!

---

## 🐛 If Still Not Working:

### Check 1: Are OG endpoints accessible?
```bash
curl -I https://devfolio.cc/api/og-landing
```
Should return: `200 OK`

### Check 2: Are meta tags present?
```bash
curl -s https://devfolio.cc/ | grep "og:image"
```
Should show: `/api/og-landing`

### Check 3: Is deployment successful?
- Check hosting dashboard
- Verify no build errors
- Test site is loading

---

## 📝 Quick Checklist:

- [ ] Changes committed and pushed
- [ ] Deployment successful
- [ ] OG image endpoints working
- [ ] Twitter Card Validator tested
- [ ] Meta tags verified
- [ ] New tweet drafted
- [ ] Image appears in preview

---

## ⚡ Alternative: Static OG Images

If dynamic OG images aren't working immediately, use static images:

1. Create 1200x630px images
2. Save in `/public/og-main.png` and `/public/og-portfolio.png`
3. Update meta tags to use static images
4. This works instantly, no API needed

---

**🎯 After deployment, test immediately and you'll see beautiful images!**

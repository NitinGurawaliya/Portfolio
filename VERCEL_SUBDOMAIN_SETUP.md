# Vercel में Subdomain Configuration - Step by Step Guide

## 🎯 Overview

आपको Vercel Dashboard में subdomains add करने होंगे ताकि वे आपके project पर route हो सकें।

## ✅ Option 1: Wildcard Domain (सबसे आसान - Recommended)

यह तरीका सबसे आसान है क्योंकि एक बार add करने के बाद सभी future subdomains automatically काम करेंगे।

### Step 1: Vercel Dashboard खोलें

1. https://vercel.com पर login करें
2. अपना **Project** select करें (जहाँ DevFolio deployed है)

### Step 2: Domains Section में जाएँ

1. Project page पर **Settings** tab click करें
2. Left sidebar में **Domains** option click करें

### Step 3: Wildcard Domain Add करें

1. **"Add Domain"** button click करें
2. Domain field में type करें: `*.devfolio.cc`
   - `*` wildcard है जो सभी subdomains को cover करता है
3. **"Add"** button click करें

### Step 4: Wait for Configuration

Vercel automatically:
- ✅ Domain को validate करेगा
- ✅ SSL certificate provision करेगा (1-5 minutes)
- ✅ Status show करेगा: **"Validating Configuration"** → **"Valid"** → **"Ready"**

### Step 5: Verify

Domains page पर आपको दिखेगा:
- ✅ `*.devfolio.cc` - **Valid** (green checkmark)
- ✅ SSL certificate active
- ✅ Status: **Ready**

**यह setup करने के बाद सभी subdomains automatically काम करेंगे:**
- ✅ `app.devfolio.cc`
- ✅ `project.devfolio.cc`
- ✅ `shiplog.devfolio.cc`
- ✅ Future में कोई भी new subdomain (e.g., `blog.devfolio.cc`)

---

## ✅ Option 2: Individual Subdomains (Alternative)

अगर आप wildcard use नहीं करना चाहते, तो हर subdomain individually add कर सकते हैं।

### Step 1-2: Same as Above

Vercel Dashboard → Project → Settings → Domains

### Step 3: Individual Subdomains Add करें

हर subdomain के लिए अलग से add करें:

#### Subdomain 1: Dashboard
1. **"Add Domain"** click करें
2. Type: `app.devfolio.cc`
3. **"Add"** click करें

#### Subdomain 2: Project Feed
1. **"Add Domain"** click करें
2. Type: `project.devfolio.cc`
3. **"Add"** click करें

#### Subdomain 3: Shiplog Feed
1. **"Add Domain"** click करें
2. Type: `shiplog.devfolio.cc`
3. **"Add"** click करें

### Step 4: Wait for Each Domain

हर domain के लिए Vercel:
- Domain validate करेगा
- SSL certificate provision करेगा
- Status **"Ready"** show करेगा

---

## 📋 Complete Checklist

### Vercel Dashboard में:

- [ ] Project select किया
- [ ] Settings → Domains पर गए
- [ ] `*.devfolio.cc` add किया (या individual subdomains)
- [ ] Domain status **"Valid"** / **"Ready"** है
- [ ] SSL certificate active है

### Code में (Already Done ✅):

- [x] `src/lib/subdomain-routing.ts` में mappings defined हैं
- [x] `src/middleware.ts` में routing logic है
- [x] Code deployed है

---

## 🔍 Verification Steps

### 1. Vercel Dashboard में Check करें

**Settings → Domains** page पर:
```
✅ *.devfolio.cc        Valid    Ready
   (or)
✅ app.devfolio.cc      Valid    Ready
✅ project.devfolio.cc  Valid    Ready
✅ shiplog.devfolio.cc  Valid    Ready
```

### 2. Browser में Test करें

Deploy के बाद visit करें:
- `https://app.devfolio.cc` → Dashboard दिखना चाहिए
- `https://project.devfolio.cc` → Project Feed दिखना चाहिए
- `https://shiplog.devfolio.cc` → Shiplog Feed दिखना चाहिए

### 3. SSL Certificate Check

Browser में URL के बगल में:
- 🔒 **Lock icon** दिखना चाहिए
- **"Connection is secure"** message दिखना चाहिए

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Invalid Configuration" Error

**Solution:**
1. Domain name double-check करें (typo तो नहीं?)
2. 5-10 minutes wait करें (DNS propagation time)
3. Domain remove करके फिर से add करें

### Issue 2: SSL Certificate Not Provisioning

**Solution:**
1. Wait करें (कभी-कभी 10-15 minutes लगते हैं)
2. Vercel logs check करें
3. Domain remove और re-add करें

### Issue 3: Subdomain Not Loading

**Solution:**
1. Vercel में domain added है या नहीं check करें
2. Browser cache clear करें
3. Incognito/Private window में test करें
4. DNS propagation check करें:
   ```bash
   nslookup app.devfolio.cc
   ```

---

## 🎯 Recommended Setup

**सबसे बेहतर approach:**

✅ **Use Wildcard Domain**: `*.devfolio.cc`
- एक बार add करें
- सभी future subdomains automatically काम करेंगे
- Less maintenance
- More scalable

---

## 📝 Summary

### Minimum Steps:

1. **Vercel Dashboard** → Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `*.devfolio.cc` (wildcard - recommended)
4. Click **"Add"**
5. Wait for SSL (1-5 minutes)
6. ✅ Done!

### यह करने के बाद:

- ✅ `app.devfolio.cc` → Dashboard
- ✅ `project.devfolio.cc` → Project Feed
- ✅ `shiplog.devfolio.cc` → Shiplog Feed
- ✅ Future subdomains automatically काम करेंगे

**Code already ready है - बस Vercel में domain add करना है!** 🚀


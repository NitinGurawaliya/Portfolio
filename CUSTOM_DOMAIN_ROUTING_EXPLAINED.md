# Custom Domain Routing Flow Explained

## Question: Will `zayka.online` show portfolio from `devfolio.cc/Nitin`?

**Answer: YES! ✅**

---

## Complete Flow:

### Step 1: User Visits `zayka.online`
```
Browser → zayka.online
```

### Step 2: DNS Resolution
```
zayka.online → DNS → 76.76.21.21 (Vercel IP)
```

### Step 3: Vercel Receives Request
```
Vercel receives request for hostname: zayka.online
```

### Step 4: Middleware Intercepts
```typescript
// src/middleware.ts
hostname = "zayka.online"
// Not localhost, not devfolio.cc → Custom domain!
```

### Step 5: Middleware Calls Lookup API
```typescript
GET /api/custom-domain/lookup?domain=zayka.online
```

### Step 6: Lookup API Queries Database
```typescript
// src/app/api/custom-domain/lookup/route.ts
CustomDomain.findFirst({
  domain: "zayka.online",
  verified: true
})
// Finds your domain record
// Gets portfolio → user
// Returns: username = "Nitin" (or your customUsername)
```

### Step 7: Middleware Rewrites URL
```typescript
// Middleware receives: { success: true, username: "Nitin" }
url.pathname = "/Nitin"
return NextResponse.rewrite(url)
```

### Step 8: Portfolio Route Handles Request
```typescript
// src/app/[username]/page.tsx
// Receives request for /Nitin
// Calls: /api/portfolio/public?username=Nitin
// Portfolio API finds portfolio by username
// Returns portfolio data
// Portfolio page renders ✅
```

---

## Result:

**`zayka.online` → Shows same portfolio as `devfolio.cc/Nitin`** ✅

---

## Important Points:

1. **Same Portfolio Data:**
   - Both URLs show the **exact same portfolio**
   - Same data, same design, same everything
   - Just different domain name

2. **Username Mapping:**
   - Lookup API finds your portfolio
   - Returns your username ("Nitin")
   - Middleware rewrites to `/[username]`
   - Portfolio route loads by username

3. **No Duplication:**
   - Portfolio data is not duplicated
   - Same database record
   - Same portfolio ID
   - Just different URL

---

## Verification:

After adding domain to Vercel:

1. Visit: `https://zayka.online`
2. Should see: Your portfolio (same as devfolio.cc/Nitin)
3. Check browser URL: Still shows `zayka.online` (not redirected)
4. All links/assets: Should work correctly

---

## What You'll See:

**Before (Current):**
- `devfolio.cc/Nitin` → Your portfolio ✅

**After (With Custom Domain):**
- `zayka.online` → Your portfolio ✅
- `www.zayka.online` → Your portfolio ✅
- `devfolio.cc/Nitin` → Still works ✅

**All three URLs show the same portfolio!**

---

## Technical Details:

### Database Mapping:
```
CustomDomain {
  domain: "zayka.online"
  portfolioId: 206
  verified: true
}

Portfolio {
  id: 206
  customUsername: "Nitin" (or null)
  user: {
    githubUsername: "Nitin"
  }
}
```

### Routing Logic:
```
zayka.online
  → Middleware finds domain
  → Gets portfolioId: 206
  → Gets username: "Nitin"
  → Rewrites to: /Nitin
  → Portfolio loads ✅
```

---

## Summary:

**YES, after adding domain to Vercel:**
- ✅ `zayka.online` will show your portfolio
- ✅ Same portfolio as `devfolio.cc/Nitin`
- ✅ All features work (projects, skills, etc.)
- ✅ Both URLs remain active

**It's just a different URL pointing to the same portfolio!** 🎉


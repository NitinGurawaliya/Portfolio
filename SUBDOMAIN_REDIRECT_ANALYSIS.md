# Subdomain Redirect Analysis - Current vs Desired Behavior

## 🔍 Current System Analysis

### ❌ Current Behavior: NOT Subdomain-Aware

**Problem:** Current system redirects users to same domain they're currently on, not to dedicated subdomains.

#### 1. GitHub OAuth Redirect (`src/app/api/auth/github/route.ts`)

**Current Code:**
```typescript
const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
redirectUrl = `${baseUrl}/dashboard`
```

**What happens:**
- User on `devfolio.cc` → Redirects to `devfolio.cc/dashboard` ❌
- User on `app.devfolio.cc` → Redirects to `app.devfolio.cc/dashboard` ✅ (but only if they're already there)
- User on `project.devfolio.cc` → Redirects to `project.devfolio.cc/dashboard` ❌ (wrong subdomain!)

#### 2. Auth Page Redirect (`src/app/auth/page.tsx`)

**Current Code:**
```typescript
router.push("/dashboard");
```

**What happens:**
- Relative path - stays on same domain
- User on `devfolio.cc` → Stays on `devfolio.cc/dashboard` ❌
- User on `project.devfolio.cc` → Goes to `project.devfolio.cc/dashboard` ❌ (wrong!)

#### 3. SessionRedirect (`src/components/SessionRedirect.tsx`)

**Current Code:**
```typescript
router.push("/dashboard")
```

**What happens:**
- Same issue - relative path, stays on current domain

#### 4. Feed Redirects

**Current Code:**
```typescript
router.push("/feed/projects")
router.push("/feed/shiplog")
```

**What happens:**
- User on `devfolio.cc` → Goes to `devfolio.cc/feed/projects` ✅ (works but not optimal)
- User on `app.devfolio.cc` → Goes to `app.devfolio.cc/feed/projects` ❌ (wrong subdomain)

---

## ✅ Desired Behavior: Subdomain-Aware Redirects

### What Should Happen:

1. **After Auth → Always redirect to `app.devfolio.cc` (Dashboard)**
   - Regardless of where user logged in from
   - Always go to dedicated dashboard subdomain

2. **Dashboard → Feed Links → Dedicated Subdomains**
   - Dashboard से project feed → `project.devfolio.cc`
   - Dashboard से shiplog feed → `shiplog.devfolio.cc`

3. **Feed Pages → Dashboard Links → `app.devfolio.cc`**
   - Project feed से dashboard → `app.devfolio.cc`
   - Shiplog feed से dashboard → `app.devfolio.cc`

4. **Auth Links → Preserve Subdomain Context**
   - If user tries to upvote from `project.devfolio.cc`
   - After auth, redirect back to `project.devfolio.cc` (not dashboard)
   - Or redirect based on context

---

## 📋 Places That Need Changes

### 1. GitHub OAuth Redirect (`src/app/api/auth/github/route.ts`)
- **Line 331:** Change `${baseUrl}/dashboard` to use subdomain-aware URL

### 2. Auth Page Redirect (`src/app/auth/page.tsx`)
- **Line 25:** Change `router.push("/dashboard")` to subdomain-aware

### 3. SessionRedirect (`src/components/SessionRedirect.tsx`)
- **Line 19:** Change `router.push("/dashboard")` to subdomain-aware

### 4. Dashboard Feed Links (`src/app/dashboard/page.tsx`)
- **Line 715:** Change `router.push("/feed/projects")` to `project.devfolio.cc`

### 5. Feed Navigation Links
- Update all `/feed/projects` and `/feed/shiplog` links to use subdomains

### 6. Auth Redirect Query Parameter
- When user clicks "Log in" from feed, preserve context
- After auth, redirect back to correct subdomain

---

## 🎯 Solution: Create Helper Functions

### Utility Functions Needed:

1. **`getSubdomainUrl(route: string)`** - Convert route to subdomain URL
   - `/dashboard` → `https://app.devfolio.cc`
   - `/feed/projects` → `https://project.devfolio.cc`
   - `/feed/shiplog` → `https://shiplog.devfolio.cc`

2. **`redirectToSubdomain(route: string)`** - Server-side redirect helper

3. **`getAuthRedirectUrl(context?: string)`** - Smart auth redirect
   - If context is "feed", redirect back to feed
   - Otherwise, redirect to dashboard subdomain

---

## 📝 Implementation Plan

### Phase 1: Utility Functions
- [ ] Create `src/lib/subdomain-utils.ts` with helper functions
- [ ] Add functions for subdomain URL generation
- [ ] Add environment detection (development vs production)

### Phase 2: Update OAuth Redirect
- [ ] Update `src/app/api/auth/github/route.ts` to use subdomain-aware URLs
- [ ] Handle redirect context (preserve where user came from)

### Phase 3: Update Client-Side Redirects
- [ ] Update `src/app/auth/page.tsx`
- [ ] Update `src/components/SessionRedirect.tsx`
- [ ] Update dashboard navigation links

### Phase 4: Update Feed Links
- [ ] Update all feed navigation links to use subdomains
- [ ] Update auth redirect links to preserve context

---

## ⚠️ Important Considerations

### 1. Development vs Production
- Development में localhost पर subdomains work differently
- Utility functions should handle both cases

### 2. Relative vs Absolute URLs
- Client-side: Use `window.location.href` for cross-subdomain navigation
- Server-side: Use full URLs with subdomains

### 3. Auth Redirect Context
- Preserve where user came from
- If from `project.devfolio.cc`, redirect back there after auth
- If from landing page, redirect to `app.devfolio.cc`

### 4. Fallback Behavior
- If subdomain not configured, fallback to main domain
- Graceful degradation

---

## 🎯 Summary

**Current:** ❌ Not subdomain-aware - users stay on current domain  
**Desired:** ✅ Subdomain-aware - always redirect to dedicated subdomains

**Key Changes Needed:**
1. OAuth redirect to use `app.devfolio.cc`
2. Client redirects to use subdomain URLs
3. Feed links to use dedicated subdomains
4. Auth context preservation


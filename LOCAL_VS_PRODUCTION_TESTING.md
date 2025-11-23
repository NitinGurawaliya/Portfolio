# Local vs Production Testing - Custom Domain Feature

## Quick Answer

**❌ Full flow will NOT work on local**  
**✅ Must test on production for complete flow**

---

## What Works Locally ✅

### 1. API Endpoints (Can Test Locally)

**These work on localhost:**

```bash
# Add domain
POST http://localhost:3000/api/custom-domain
Body: { domain: "example.com", portfolioId: 123 }

# Verify domain
POST http://localhost:3000/api/custom-domain/{id}/verify

# Get status
GET http://localhost:3000/api/custom-domain/status?portfolioId=123

# Lookup (can test manually)
GET http://localhost:3000/api/custom-domain/lookup?domain=example.com
```

**What you can test:**
- ✅ Domain validation
- ✅ Database operations (add, update, delete)
- ✅ Vercel API integration (if env vars set)
- ✅ DNS verification logic (with mock data)
- ✅ Token generation

---

### 2. Database Operations ✅

**All database operations work locally:**
- Add domain to database
- Update verification status
- Query domain mappings
- Delete domains

---

### 3. Vercel API Integration ✅

**If you set environment variables locally:**
```bash
# .env.local
VERCEL_API_TOKEN=your_token
VERCEL_PROJECT_ID=prj_xxxxx
VERCEL_TEAM_ID=team_xxxxx  # optional
```

**You can test:**
- ✅ Adding domain to Vercel via API
- ✅ Getting IP from Vercel
- ✅ Removing domain from Vercel

---

## What DOESN'T Work Locally ❌

### 1. Custom Domain Routing ❌

**Why it doesn't work:**

Looking at `src/middleware.ts` lines 15-22:

```typescript
// Skip custom domain logic for localhost and dev environment
if (
  hostname.includes('localhost') ||
  hostname.includes('127.0.0.1') ||
  process.env.NODE_ENV === 'development'
) {
  return NextResponse.next()  // ← Skips custom domain logic!
}
```

**What this means:**
- Middleware **skips** custom domain routing in development
- You can't test `example.com` → portfolio routing locally
- Middleware won't intercept custom domain requests

---

### 2. Real DNS Resolution ❌

**Why it doesn't work:**
- Localhost doesn't have real domain DNS
- Can't configure DNS records for `localhost`
- Browser won't resolve custom domains to localhost

---

### 3. Full End-to-End Flow ❌

**What you can't test locally:**
- User visits `example.com`
- DNS resolves to Vercel IP
- Middleware intercepts request
- Domain routes to portfolio
- Portfolio loads at custom domain

---

## What You MUST Test on Production ✅

### 1. Complete Domain Routing Flow

**Test this on production:**
```
1. Add domain in dashboard
2. Configure DNS at registrar
3. Wait for DNS propagation
4. Verify domain
5. Visit custom domain (e.g., example.com)
6. Should load portfolio ✅
```

---

### 2. Middleware Interception

**Test on production:**
- Middleware should intercept custom domain requests
- Should lookup domain in database
- Should rewrite to `/[username]`
- Should load portfolio correctly

---

### 3. DNS Verification

**Test on production:**
- Real DNS records (A, CNAME, TXT)
- DNS propagation (5-10 minutes)
- Verification checks
- Vercel domain addition

---

### 4. SSL Provisioning

**Test on production:**
- Vercel automatically provisions SSL
- HTTPS should work
- Certificate should be valid

---

## Testing Strategy

### Phase 1: Local Testing (Before Production)

**Test these locally:**

1. **API Endpoints:**
   ```bash
   # Test add domain
   curl -X POST http://localhost:3000/api/custom-domain \
     -H "Content-Type: application/json" \
     -d '{"domain":"test.com","portfolioId":123}'
   
   # Test lookup
   curl http://localhost:3000/api/custom-domain/lookup?domain=test.com
   ```

2. **Database Operations:**
   - Add domain
   - Update verification status
   - Query domain mappings

3. **Vercel API Integration:**
   - Test adding domain to Vercel
   - Test getting IP from Vercel
   - Check API responses

4. **Code Logic:**
   - Domain validation
   - Token generation
   - DNS record generation

---

### Phase 2: Production Testing (Full Flow)

**Test on production:**

1. **Add Domain:**
   - Go to dashboard
   - Add domain: `test.example.com`
   - Check DNS records shown
   - Verify A record IP is correct

2. **Configure DNS:**
   - Add DNS records at registrar
   - Wait 5-10 minutes
   - Check DNS propagation

3. **Verify Domain:**
   - Click "Verify Domain"
   - Check verification status
   - Verify domain appears in Vercel

4. **Test Routing:**
   - Visit `test.example.com`
   - Should load portfolio ✅
   - Check HTTPS works ✅
   - Test www subdomain ✅

---

## How to Test Locally (Partial Testing)

### Option 1: Test API Endpoints

```bash
# Start dev server
npm run dev

# Test add domain
curl -X POST http://localhost:3000/api/custom-domain \
  -H "Content-Type: application/json" \
  -H "Cookie: [your session cookie]" \
  -d '{"domain":"test.com","portfolioId":123}'

# Test lookup
curl http://localhost:3000/api/custom-domain/lookup?domain=test.com
```

### Option 2: Test with Postman/Thunder Client

1. Set up session cookie
2. Test all API endpoints
3. Check responses
4. Verify database updates

### Option 3: Mock DNS Verification

```typescript
// In your test file
const mockDNS = {
  verifyDomainOwnership: () => true,
  checkDomainPointing: () => true,
  checkWWWPointing: () => true,
};
```

---

## Production Testing Checklist

Before going to production:

- [ ] All API endpoints tested locally
- [ ] Database operations working
- [ ] Vercel API integration tested
- [ ] Environment variables set in Vercel
- [ ] Code deployed to production

On production:

- [ ] Add domain in dashboard
- [ ] DNS records shown correctly
- [ ] Configure DNS at registrar
- [ ] Wait for DNS propagation
- [ ] Verify domain
- [ ] Check domain in Vercel dashboard
- [ ] Visit custom domain
- [ ] Portfolio loads correctly
- [ ] HTTPS works
- [ ] www subdomain works

---

## Summary

### ✅ Can Test Locally:
- API endpoints
- Database operations
- Vercel API integration
- Code logic

### ❌ Must Test on Production:
- Custom domain routing
- Middleware interception
- Real DNS resolution
- Full end-to-end flow
- SSL provisioning

---

## Recommendation

**Best Approach:**

1. **Local:** Test all API endpoints and database operations
2. **Production:** Test complete flow with a test domain
3. **Production:** Test with real domain after verification

**Don't skip production testing!** The routing flow only works in production.


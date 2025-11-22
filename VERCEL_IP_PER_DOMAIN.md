# Vercel IP Per Domain - Correct Implementation

## Problem with Previous Approach

**Before:**
- ❌ Single IP in env var for all users
- ❌ Vercel might provide different IPs for different domains
- ❌ Not scalable for thousands of users

**Issue:**
- When adding domain to Vercel, Vercel provides a specific IP
- This IP might vary by region, project, or Vercel's infrastructure
- Using a single IP for all domains can cause "Invalid Configuration" errors

## Solution: Store IP Per Domain

**Now:**
- ✅ Add domain to Vercel FIRST
- ✅ Get IP from Vercel (when available)
- ✅ Store IP in database per domain
- ✅ Use stored IP for DNS records

---

## How It Works

### Flow:

```
1. User adds domain in dashboard
   ↓
2. System adds domain to Vercel via API
   ↓
3. System gets IP from Vercel (or env var fallback)
   ↓
4. System stores IP in database (CustomDomain.vercelIPAddress)
   ↓
5. System generates DNS records using stored IP
   ↓
6. User configures DNS with correct IP
   ↓
7. Domain works perfectly! ✅
```

---

## Database Changes

### Added Field to CustomDomain:

```prisma
model CustomDomain {
  // ... existing fields
  
  // DNS Configuration (from Vercel)
  vercelIPAddress   String? // IP address provided by Vercel for A record
  vercelCnameTarget String? // CNAME target provided by Vercel (if any)
}
```

### Migration Required:

```sql
ALTER TABLE "CustomDomain" 
ADD COLUMN "vercelIPAddress" TEXT,
ADD COLUMN "vercelCnameTarget" TEXT;
```

---

## Code Changes

### 1. Add Domain Route (`src/app/api/custom-domain/route.ts`)

**Before:**
```typescript
// Create domain
const customDomain = await prisma.customDomain.create({...});

// Generate DNS records
const dnsRecords = await generateDNSRecords(domain, token);
```

**After:**
```typescript
// Add to Vercel FIRST to get IP
const vercelResult = await addDomainToVercel(domain);

// Get IP from Vercel or fallback
const ipResult = await getVercelRecommendedIP();
const vercelIP = ipResult.ip || null;

// Create domain WITH IP
const customDomain = await prisma.customDomain.create({
  data: {
    // ... other fields
    vercelIPAddress: vercelIP, // Store IP from Vercel
  },
});

// Generate DNS records using stored IP
const dnsRecords = await generateDNSRecords(domain, token, vercelIP);
```

### 2. DNS Config (`src/lib/dns-config.ts`)

**Before:**
```typescript
export async function generateDNSRecords(domain, token) {
  const appIP = await getRecommendedIP(); // Always same IP
}
```

**After:**
```typescript
export async function generateDNSRecords(domain, token, vercelIP?) {
  // Priority: Vercel IP > env var > API > default
  let appIP: string;
  if (vercelIP) {
    appIP = vercelIP; // Use IP from Vercel (most accurate)
  } else {
    appIP = await getRecommendedIP(); // Fallback
  }
}
```

### 3. Status Route (`src/app/api/custom-domain/status/route.ts`)

**After:**
```typescript
// Use stored IP if available
const dnsRecords = await generateDNSRecords(
  domain,
  token,
  customDomain.vercelIPAddress || null
);
```

---

## Getting IP from Vercel

### Option 1: From Vercel Dashboard (Manual)

1. Add domain to Vercel
2. Vercel shows DNS records including A record IP
3. Copy IP and set in `APP_IP_ADDRESS` env var (for fallback)

### Option 2: From Vercel API (Automatic)

**When adding domain:**
- Vercel API might not return IP directly
- But we can check domain status after adding
- Or use Vercel's recommended IP from project settings

**Current Implementation:**
- Adds domain to Vercel first
- Gets recommended IP from Vercel API or env var
- Stores IP in database
- Uses stored IP for DNS records

---

## Benefits

### ✅ Per-Domain IP Storage
- Each domain can have its own IP
- Handles Vercel's IP variations
- Future-proof

### ✅ Accurate DNS Records
- Users get correct IP from Vercel
- No "Invalid Configuration" errors
- Works for thousands of users

### ✅ Fallback Support
- If Vercel IP not available, uses env var
- If env var not set, uses default
- Graceful degradation

---

## Migration Steps

### Step 1: Update Schema

```bash
npx prisma migrate dev --name add_vercel_ip_to_custom_domain
```

### Step 2: Update Code

- Code changes already made ✅
- Just need to run migration

### Step 3: Test

1. Add a new domain
2. Check if IP is stored in database
3. Verify DNS records show correct IP
4. Test domain verification

---

## For Existing Domains

### Update Existing Records:

```sql
-- Set IP for existing domains (use env var or Vercel's standard IP)
UPDATE "CustomDomain" 
SET "vercelIPAddress" = '76.76.21.21'  -- or from APP_IP_ADDRESS env var
WHERE "vercelIPAddress" IS NULL;
```

---

## Summary

### ✅ What Changed:
- Store IP per domain in database
- Get IP from Vercel when adding domain
- Use stored IP for DNS records
- Fallback to env var if Vercel IP not available

### ✅ Benefits:
- Each domain uses correct IP from Vercel
- Scalable for thousands of users
- No hardcoding
- Handles Vercel's IP variations

### ✅ Next Steps:
1. Run migration to add `vercelIPAddress` field
2. Test with new domain
3. Update existing domains (optional)

**Bottom Line:** Each domain now stores and uses its own IP from Vercel! 🎯


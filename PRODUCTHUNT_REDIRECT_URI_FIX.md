# ProductHunt Redirect URI Error Fix

## Error Message
"The redirect uri included is not valid."

## Problem
ProductHunt OAuth में redirect URI exactly match होना चाहिए जो आपने application dashboard में configure किया है।

## Solution

### Step 1: ProductHunt Application Dashboard में जाएं

1. Visit: https://api.producthunt.com/v2/oauth/applications
2. अपनी application select करें (या नई बनाएं)

### Step 2: Redirect URI Add करें

**Important:** Exact URL add करें जो code में use हो रहा है:

```
https://www.devfolio.cc/api/auth/producthunt/callback
```

**OR** अगर आप non-www use करते हैं:

```
https://devfolio.cc/api/auth/producthunt/callback
```

### Step 3: Multiple Redirect URIs (अगर जरूरत हो)

ProductHunt multiple redirect URIs support करता है। दोनों add करें:

1. `https://www.devfolio.cc/api/auth/producthunt/callback`
2. `https://devfolio.cc/api/auth/producthunt/callback`

### Step 4: Environment Variable Check करें

`.env.production` में check करें:

```env
NEXT_PUBLIC_APP_URL=https://www.devfolio.cc
```

या

```env
NEXT_PUBLIC_APP_URL=https://devfolio.cc
```

**Important:** 
- Trailing slash नहीं होना चाहिए (`/` at the end)
- `http://` नहीं, `https://` use करें
- Exact match होना चाहिए (case-sensitive नहीं, लेकिन path exact होना चाहिए)

### Step 5: Verify Redirect URI in Code

Current code में redirect URI:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
const redirectUri = `${baseUrl}/api/auth/producthunt/callback`
```

यह generate करेगा: `https://www.devfolio.cc/api/auth/producthunt/callback`

### Step 6: Test Again

1. ProductHunt dashboard में redirect URI save करें
2. Application को update करें
3. फिर से OAuth flow test करें

## Common Issues

1. **Trailing Slash**: `https://www.devfolio.cc/` ❌ vs `https://www.devfolio.cc` ✅
2. **www vs non-www**: दोनों add करें अगर दोनों use होते हैं
3. **HTTP vs HTTPS**: Production में हमेशा `https://` use करें
4. **Path Mismatch**: `/api/auth/producthunt/callback` exact होना चाहिए

## Quick Fix

अगर आपको जल्दी fix चाहिए:

1. ProductHunt dashboard में जाएं
2. Redirect URI field में add करें: `https://www.devfolio.cc/api/auth/producthunt/callback`
3. Save करें
4. फिर से try करें


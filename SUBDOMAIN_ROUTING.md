# Subdomain Routing Implementation

## Overview

DevFolio अब subdomain routing support करता है! अब आप different products के लिए dedicated subdomains use कर सकते हैं:

- **app.devfolio.cc** → Dashboard (`/dashboard`)
- **project.devfolio.cc** → Project Feed (`/feed/projects`)
- **shiplog.devfolio.cc** → Shiplog Feed (`/feed/shiplog`)

## Benefits

✅ **Clean URLs**: `project.devfolio.cc` बेहतर लगता है `devfolio.cc/feed/projects` से  
✅ **Better Branding**: हर product का अपना subdomain  
✅ **Product Isolation**: Future में products को easily separate कर सकते हैं  
✅ **SEO Friendly**: Better structure for search engines  
✅ **Scalable**: नए products के लिए easily add कर सकते हैं  

## Current Subdomain Mappings

| Subdomain | Route | Description |
|-----------|-------|-------------|
| `app.devfolio.cc` | `/dashboard` | Dashboard for portfolio management |
| `project.devfolio.cc` | `/feed/projects` | Project discovery feed |
| `projects.devfolio.cc` | `/feed/projects` | Alias for project feed |
| `shiplog.devfolio.cc` | `/feed/shiplog` | Shiplog feed |
| `shiplogs.devfolio.cc` | `/feed/shiplog` | Alias for shiplog feed |

## How It Works

### Middleware Flow

```
1. User visits: project.devfolio.cc
   ↓
2. Middleware checks hostname
   ↓
3. Extracts subdomain: "project"
   ↓
4. Looks up route: "/feed/projects"
   ↓
5. Rewrites URL internally
   ↓
6. Serves /feed/projects page
```

### Code Structure

- **`src/lib/subdomain-routing.ts`**: Subdomain mapping configuration
- **`src/middleware.ts`**: Routing logic that handles subdomain detection

## Adding New Subdomains

### Step 1: Update Subdomain Routes

Edit `src/lib/subdomain-routing.ts`:

```typescript
export const SUBDOMAIN_ROUTES: Record<string, string> = {
  'app': '/dashboard',
  'project': '/feed/projects',
  'shiplog': '/feed/shiplog',
  // Add your new subdomain here
  'blog': '/blog',  // Example
  'docs': '/docs',  // Example
}
```

### Step 2: Deploy

कोई extra configuration की जरूरत नहीं! सिर्फ deploy करें।

## DNS Configuration (Vercel)

Vercel automatically handles subdomains if they're configured:

### Option 1: Wildcard DNS (Recommended)

Add wildcard CNAME record in your DNS provider:
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

This will automatically handle all subdomains including:
- `project.devfolio.cc`
- `shiplog.devfolio.cc`
- Future subdomains

### Option 2: Individual Subdomains

Add individual CNAME records:
```
Type: CNAME
Name: project
Value: cname.vercel-dns.com

Type: CNAME
Name: shiplog
Value: cname.vercel-dns.com
```

### Vercel Dashboard

**Detailed steps के लिए देखें:** `VERCEL_SUBDOMAIN_SETUP.md`

**Quick Steps:**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click **"Add Domain"**
3. Enter: `*.devfolio.cc` (wildcard - recommended)
   - OR add individual subdomains: `app.devfolio.cc`, `project.devfolio.cc`, `shiplog.devfolio.cc`
4. Click **"Add"**
5. Wait for SSL provisioning (1-5 minutes)
6. ✅ Done!

## Testing

### Production Testing

1. **DNS Setup**: Make sure subdomain points to Vercel (CNAME or wildcard)
2. **Visit**: `https://project.devfolio.cc`
3. **Expected**: Should show project feed

### Local Development Testing

Localhost में subdomain testing के लिए:

#### Option 1: Edit `/etc/hosts` (macOS/Linux)

```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 project.localhost
127.0.0.1 shiplog.localhost
```

Then visit:
- `http://project.localhost:3000`
- `http://shiplog.localhost:3000`

#### Option 2: Edit `C:\Windows\System32\drivers\etc\hosts` (Windows)

```powershell
# Run as Administrator
notepad C:\Windows\System32\drivers\etc\hosts
```

Add these lines:
```
127.0.0.1 project.localhost
127.0.0.1 shiplog.localhost
```

Then visit:
- `http://project.localhost:3000`
- `http://shiplog.localhost:3000`

#### Option 3: Use Normal Routes (No Setup Needed)

Development में आप directly routes use कर सकते हैं:
- `http://localhost:3000/feed/projects`
- `http://localhost:3000/feed/shiplog`

## Future Products

Future में नए products add करने के लिए:

```typescript
// src/lib/subdomain-routing.ts
export const SUBDOMAIN_ROUTES: Record<string, string> = {
  'app': '/dashboard',
  'project': '/feed/projects',
  'shiplog': '/feed/shiplog',
  'blog': '/blog',        // New product
  'docs': '/docs',        // New product
  'api': '/api-docs',     // New product
}
```

## Notes

- ✅ Subdomain routing सभी environments में काम करता है (development, production)
- ✅ Query parameters automatically preserved होते हैं
- ✅ Custom domain routing के साथ compatible है
- ✅ SEO friendly URLs
- ✅ No database changes required

## Troubleshooting

### Subdomain Not Working?

1. **Check DNS**: Verify subdomain points to Vercel
   ```bash
   nslookup project.devfolio.cc
   ```

2. **Check Vercel**: Make sure subdomain added in Vercel dashboard

3. **Check Middleware Logs**: Look for subdomain routing logs in Vercel logs

4. **Check Route Mapping**: Verify route exists in `src/lib/subdomain-routing.ts`

### Localhost Not Working?

- Make sure you edited `/etc/hosts` or `hosts` file correctly
- Restart your dev server after editing hosts file
- Use `project.localhost:3000` (not `project.localhost`)

## Example URLs

**Production:**
- `https://app.devfolio.cc` → Dashboard
- `https://project.devfolio.cc` → Project Feed
- `https://shiplog.devfolio.cc` → Shiplog Feed
- `https://project.devfolio.cc?sort=most_upvoted` → Project Feed (with query params)

**Development (with hosts file):**
- `http://app.localhost:3000` → Dashboard
- `http://project.localhost:3000` → Project Feed
- `http://shiplog.localhost:3000` → Shiplog Feed

**Always Works:**
- `https://devfolio.cc/dashboard` → Dashboard (normal route)
- `https://devfolio.cc/feed/projects` → Project Feed (normal route)
- `https://devfolio.cc/feed/shiplog` → Shiplog Feed (normal route)


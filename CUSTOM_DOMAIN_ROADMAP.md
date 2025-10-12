# 🗺️ Custom Domain - Quick Implementation Roadmap

## 🎯 TL;DR

**YES, यह 100% possible है!**

Users अपने custom domain (nitin.com) पर DevFolio portfolio दिखा सकते हैं।

---

## 🚀 3 Implementation Options

### Option 1: iFrame Embed ⚡ (Easiest - 1 day)
```
User पास अपनी website है → DevFolio embed code paste करे → Done!
```
**Best for:** Quick start, no DNS knowledge needed

### Option 2: Custom Domain 🌐 (Advanced - 1 week)
```
User domain खरीदे → DNS configure करे → DevFolio पर verify करे → Live!
```
**Best for:** Professional branding, SEO

### Option 3: Export & Deploy 📦 (DIY - 2 days)
```
DevFolio से export करे → Static files download → Hosting पर upload
```
**Best for:** Full control, no dependency

---

## ⚡ Quick Start: iFrame (MVP)

### What to Build:

#### 1. Embed Mode for Portfolio
```typescript
// app/[username]/page.tsx
export default function PortfolioPage({ searchParams }) {
  const isEmbed = searchParams.embed === 'true'
  
  return (
    <div className={isEmbed ? 'no-navbar' : ''}>
      {!isEmbed && <Navbar />}
      <Portfolio />
      {!isEmbed && <Footer />}
    </div>
  )
}
```

#### 2. Embed Code Generator
```typescript
// app/dashboard/components/EmbedCode.tsx
export function EmbedCodeGenerator({ username }: { username: string }) {
  const embedCode = `<iframe 
  src="https://devfolio.cc/${username}?embed=true" 
  width="100%" 
  height="100vh"
  frameborder="0"
  style="border: none;"
></iframe>`

  return (
    <div>
      <h3>Embed Your Portfolio</h3>
      <pre>{embedCode}</pre>
      <button onClick={() => navigator.clipboard.writeText(embedCode)}>
        Copy Code
      </button>
    </div>
  )
}
```

#### 3. Add to Dashboard
```tsx
// app/dashboard/page.tsx
<Tabs>
  <Tab label="Home" />
  <Tab label="Projects" />
  <Tab label="Share">
    <EmbedCodeGenerator username={user.username} />
  </Tab>
</Tabs>
```

**That's it! Working embed in 1 day! ✅**

---

## 🌐 Advanced: Custom Domain

### Architecture:

```
User Domain (nitin.com)
    ↓
DNS CNAME → custom.devfolio.cc
    ↓
Vercel/Cloudflare routes to DevFolio
    ↓
Middleware checks domain → serves portfolio
```

### Step-by-Step:

#### Step 1: Database Schema
```prisma
model CustomDomain {
  id          Int      @id @default(autoincrement())
  userId      Int      @unique
  domain      String   @unique
  verified    Boolean  @default(false)
  verifyCode  String
  createdAt   DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name add_custom_domain
```

#### Step 2: API Routes

```typescript
// app/api/custom-domain/add/route.ts
export async function POST(req: Request) {
  const { domain } = await req.json()
  const verifyCode = generateCode()
  
  await prisma.customDomain.create({
    data: {
      userId: session.user.id,
      domain,
      verifyCode,
    }
  })
  
  return json({ 
    success: true,
    verifyCode,
    instructions: {
      cname: { host: 'www', value: 'custom.devfolio.cc' },
      txt: { host: '_devfolio', value: verifyCode }
    }
  })
}

// app/api/custom-domain/verify/route.ts
export async function POST(req: Request) {
  const { domain } = await req.json()
  
  // Check TXT record
  const records = await dns.resolveTxt(domain)
  const isValid = records.some(r => r.includes(verifyCode))
  
  if (isValid) {
    await prisma.customDomain.update({
      where: { domain },
      data: { verified: true }
    })
  }
  
  return json({ verified: isValid })
}
```

#### Step 3: Middleware

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  
  // Skip if DevFolio domain
  if (host?.includes('devfolio.cc')) {
    return NextResponse.next()
  }
  
  // Check if custom domain
  const customDomain = await prisma.customDomain.findUnique({
    where: { domain: host, verified: true },
    include: { user: true }
  })
  
  if (customDomain) {
    // Rewrite to user's portfolio
    return NextResponse.rewrite(
      new URL(`/${customDomain.user.username}`, request.url)
    )
  }
  
  return NextResponse.next()
}
```

#### Step 4: Vercel Configuration

```json
// vercel.json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "(?<customdomain>.*)"
        }
      ],
      "destination": "/api/custom-domain/route?domain=:customdomain&path=:path*",
      "permanent": false
    }
  ]
}
```

#### Step 5: UI Component

```tsx
// app/dashboard/components/CustomDomain.tsx
export function CustomDomainSetup() {
  const [domain, setDomain] = useState('')
  const [step, setStep] = useState<'input' | 'dns' | 'verify'>('input')
  const [verifyCode, setVerifyCode] = useState('')

  const addDomain = async () => {
    const res = await fetch('/api/custom-domain/add', {
      method: 'POST',
      body: JSON.stringify({ domain })
    })
    const data = await res.json()
    setVerifyCode(data.verifyCode)
    setStep('dns')
  }

  const verifyDomain = async () => {
    const res = await fetch('/api/custom-domain/verify', {
      method: 'POST',
      body: JSON.stringify({ domain })
    })
    const data = await res.json()
    if (data.verified) {
      setStep('verify')
      toast.success('Domain verified! 🎉')
    } else {
      toast.error('Verification failed. Please wait and try again.')
    }
  }

  return (
    <Card>
      {step === 'input' && (
        <div>
          <h3>Add Custom Domain</h3>
          <input 
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="nitin.com"
          />
          <button onClick={addDomain}>Continue</button>
        </div>
      )}

      {step === 'dns' && (
        <div>
          <h3>Configure DNS</h3>
          <p>Add these records to your domain:</p>
          
          <code>
            Type: CNAME
            Host: www
            Value: custom.devfolio.cc
          </code>
          
          <code>
            Type: TXT
            Host: _devfolio
            Value: {verifyCode}
          </code>
          
          <button onClick={verifyDomain}>Verify Domain</button>
        </div>
      )}

      {step === 'verify' && (
        <div>
          <h3>✅ Domain Connected!</h3>
          <p>Your portfolio is live at: {domain}</p>
          <a href={`https://${domain}`}>View Portfolio</a>
        </div>
      )}
    </Card>
  )
}
```

---

## 📦 Option 3: Export Portfolio

### Implementation:

```typescript
// app/api/export/route.ts
import JSZip from 'jszip'

export async function GET(req: Request) {
  const portfolio = await getPortfolio(userId)
  
  // Render to static HTML
  const html = renderToStaticMarkup(<Portfolio data={portfolio} />)
  
  // Create ZIP
  const zip = new JSZip()
  zip.file('index.html', html)
  zip.file('styles.css', generateCSS(portfolio))
  
  // Generate blob
  const blob = await zip.generateAsync({ type: 'blob' })
  
  return new Response(blob, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="portfolio.zip"'
    }
  })
}
```

---

## 🎨 UI/UX Mockups

### Dashboard - Share Tab

```
┌────────────────────────────────────────────┐
│ Share Your Portfolio                       │
├────────────────────────────────────────────┤
│                                            │
│ 📋 Embed on Your Website                  │
│ ┌────────────────────────────────────┐    │
│ │ <iframe src="devfolio.cc/nitin"   │    │
│ │   width="100%" height="100vh">    │    │
│ │ </iframe>                          │    │
│ └────────────────────────────────────┘    │
│ [Copy Code]  [Preview]                     │
│                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│ 🌐 Custom Domain (Pro)                     │
│ ┌────────────────────────────────────┐    │
│ │ nitin.com                          │    │
│ └────────────────────────────────────┘    │
│ [Connect Domain]                           │
│                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│ 📦 Export Portfolio                        │
│ Download your portfolio as static files    │
│ [Download ZIP]                             │
│                                            │
└────────────────────────────────────────────┘
```

---

## 💰 Pricing Strategy

### Free:
- ✅ DevFolio subdomain (devfolio.cc/username)
- ✅ iFrame embedding
- ✅ Export with watermark

### Pro ($5/month):
- ✅ 1 custom domain
- ✅ SSL certificate
- ✅ No branding/watermark
- ✅ Priority support

### Enterprise ($20/month):
- ✅ 5 custom domains
- ✅ White-label
- ✅ API access
- ✅ Custom integrations

---

## ⏱️ Timeline Estimate

### MVP (iFrame): 1-2 days
- Day 1: Embed mode + code generator
- Day 2: UI polish + testing

### Custom Domain: 1-2 weeks
- Week 1: Backend (API, DB, verification)
- Week 2: Frontend UI + testing

### Export: 2-3 days
- Day 1: Static generation
- Day 2: ZIP creation
- Day 3: Testing

---

## 🚦 Getting Started

### Phase 1: iFrame (Start Here!)

```bash
# 1. Add embed parameter support
# File: app/[username]/page.tsx

# 2. Create embed code component
# File: app/dashboard/components/EmbedCode.tsx

# 3. Add to dashboard
# File: app/dashboard/page.tsx

# Done! 🎉
```

### Phase 2: Custom Domain

```bash
# 1. Database migration
npx prisma migrate dev --name add_custom_domain

# 2. Create API routes
mkdir -p app/api/custom-domain
touch app/api/custom-domain/{add,verify,remove}/route.ts

# 3. Add middleware
# File: middleware.ts

# 4. Create UI
# File: app/dashboard/components/CustomDomain.tsx

# 5. Configure Vercel
# Add custom domains in Vercel dashboard
```

---

## ✅ Summary

**Is it possible?** YES! 100% ✅

**Best approach?** 
1. Start with **iFrame** (easy, immediate value)
2. Add **Custom Domain** as Pro feature (revenue)
3. Consider **Export** for advanced users

**Recommendation:** 
```
Week 1-2: iFrame MVP
Week 3-4: Custom Domain (Pro)
Week 5: Polish & Launch 🚀
```

**This will make DevFolio stand out!** 💎

Developers बहुत appreciate करेंगे यह feature! 🎉


# 🌐 Custom Domain Feature - Implementation Plan

## 📋 Feature Overview

**Goal:** Allow users to display their DevFolio-generated portfolio on their own custom domain (e.g., `www.nitin.com`) instead of `devfolio.cc/nitin`

**Use Case:** Many developers already own domains and want their professional portfolio on their own domain while using DevFolio's platform for easy management.

---

## 🎯 Why This Feature?

### Problems It Solves:
1. ✅ Developers already have purchased domains
2. ✅ Want professional branding (own domain)
3. ✅ SEO benefits (own domain authority)
4. ✅ Easy management (don't want to code portfolio manually)
5. ✅ Keep existing domain reputation

### Value Proposition:
```
"Build and manage your portfolio on DevFolio,
display it on YOUR domain"
```

---

## 🏗️ Implementation Approaches

### **Approach 1: Custom Domain Mapping** ⭐ (Recommended)

**How it works:**
```
User's Domain (nitin.com)
         ↓
    DNS CNAME Record
         ↓
DevFolio Servers (devfolio.cc)
         ↓
Serve Portfolio with Custom Domain
```

**User Flow:**
1. User creates portfolio on DevFolio
2. User goes to Settings → Custom Domain
3. User enters their domain: `nitin.com`
4. DevFolio shows DNS instructions:
   ```
   Add CNAME record:
   Host: www
   Value: custom.devfolio.cc
   ```
5. User updates DNS settings
6. DevFolio verifies domain
7. Portfolio accessible on `www.nitin.com` ✅

**Technical Implementation:**

#### Database Schema:
```prisma
model CustomDomain {
  id            Int      @id @default(autoincrement())
  userId        Int      @unique
  user          User     @relation(fields: [userId], references: [id])
  domain        String   @unique
  verified      Boolean  @default(false)
  verifiedAt    DateTime?
  sslEnabled    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### Middleware:
```typescript
// Check incoming domain
if (request.headers.host !== 'devfolio.cc') {
  // Custom domain detected
  const customDomain = await findByDomain(request.headers.host)
  if (customDomain) {
    // Serve user's portfolio
    return servePortfolio(customDomain.userId)
  }
}
```

#### DNS Verification:
```typescript
// Verify user owns domain
async function verifyDomain(domain: string, userId: string) {
  // Check TXT record with verification code
  const txtRecords = await dns.resolveTxt(domain)
  const verificationCode = `devfolio-verify=${userId}-${randomCode}`
  return txtRecords.includes(verificationCode)
}
```

**Pros:**
- ✅ Professional (real custom domain)
- ✅ SEO benefits
- ✅ Full control over domain
- ✅ SSL/HTTPS support
- ✅ Native experience

**Cons:**
- ❌ Requires DNS configuration
- ❌ SSL certificate management
- ❌ Complex infrastructure (Vercel custom domains, etc.)
- ❌ Needs domain verification

**Cost Implications:**
- Requires Vercel Pro plan ($20/month) for custom domains
- Or use Cloudflare Workers for custom routing

---

### **Approach 2: iFrame Embedding** 💡

**How it works:**
```html
<!-- User's website -->
<iframe 
  src="https://devfolio.cc/nitin" 
  width="100%" 
  height="100%"
  frameborder="0"
></iframe>
```

**User Flow:**
1. User creates portfolio on DevFolio
2. DevFolio provides embed code
3. User adds code to their website
4. Portfolio appears in iframe

**Implementation:**
```typescript
// Generate embed code
function generateEmbedCode(username: string) {
  return `
<iframe 
  src="https://devfolio.cc/${username}?embed=true" 
  width="100%" 
  height="100vh"
  frameborder="0"
  style="border: none; overflow: hidden;"
></iframe>
  `.trim()
}
```

**Pros:**
- ✅ Easy to implement
- ✅ No DNS required
- ✅ Works immediately
- ✅ User keeps full control of domain

**Cons:**
- ❌ iFrame limitations (SEO, performance)
- ❌ Not fully native experience
- ❌ May have scrolling issues
- ❌ Limited customization

---

### **Approach 3: Portfolio Export** 📦

**How it works:**
```
DevFolio Platform
      ↓
Generate Static HTML/CSS/JS
      ↓
User Downloads Portfolio
      ↓
User Deploys to Their Domain
```

**User Flow:**
1. User creates portfolio on DevFolio
2. Click "Export Portfolio"
3. Download static HTML files
4. Upload to their hosting (Netlify, Vercel, etc.)

**Implementation:**
```typescript
// Export portfolio as static files
async function exportPortfolio(userId: string) {
  const portfolio = await getPortfolio(userId)
  
  // Generate HTML
  const html = renderToStaticHTML(portfolio)
  
  // Create ZIP with assets
  const zip = new JSZip()
  zip.file('index.html', html)
  zip.file('styles.css', generateCSS(portfolio))
  zip.folder('assets').file(...)
  
  return zip.generateAsync({ type: 'blob' })
}
```

**Pros:**
- ✅ Full ownership
- ✅ Fast loading (static)
- ✅ No dependency on DevFolio
- ✅ Can customize further

**Cons:**
- ❌ Not live-synced with DevFolio
- ❌ User needs to re-export on changes
- ❌ Requires technical knowledge (deployment)
- ❌ Loses dynamic features

---

### **Approach 4: Subdomain Mapping** 🔗

**How it works:**
```
User's Subdomain (portfolio.nitin.com)
         ↓
    DNS CNAME Record
         ↓
DevFolio Portfolio (devfolio.cc/nitin)
```

**User Flow:**
1. User creates subdomain: `portfolio.nitin.com`
2. Point CNAME to DevFolio
3. DevFolio serves portfolio on subdomain

**Pros:**
- ✅ Easier than full domain
- ✅ Professional look
- ✅ SEO benefits

**Cons:**
- ❌ Still requires DNS setup
- ❌ Not main domain

---

## 🎨 Recommended Implementation Strategy

### **Phase 1: iFrame Embedding** (MVP - Easy Win)

**Timeline:** 1-2 days

**Features:**
```
✅ Generate embed code
✅ Responsive iframe sizing
✅ Remove navbar in embed mode
✅ Full-screen mode
✅ Copy embed code button
```

**UI Mockup:**
```
┌─────────────────────────────────────┐
│  Share Your Portfolio               │
├─────────────────────────────────────┤
│                                     │
│  📋 Embed Code                      │
│  ┌─────────────────────────────┐   │
│  │ <iframe src="devfolio.cc... │   │
│  │   width="100%"              │   │
│  │   height="100vh">           │   │
│  │ </iframe>                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Copy Code]  [Preview]             │
│                                     │
│  💡 Paste this code on your website│
│     to embed your portfolio        │
└─────────────────────────────────────┘
```

### **Phase 2: Custom Domain (Pro Feature)**

**Timeline:** 1-2 weeks

**Features:**
```
✅ Custom domain input
✅ DNS verification
✅ SSL certificate (via Vercel)
✅ Domain verification UI
✅ Step-by-step DNS guide
✅ Automatic SSL renewal
```

**User Flow UI:**
```
Step 1: Enter Your Domain
┌─────────────────────────────────────┐
│  Custom Domain                      │
│  ┌─────────────────────────────┐   │
│  │ nitin.com                   │   │
│  └─────────────────────────────┘   │
│  [Continue]                         │
└─────────────────────────────────────┘

Step 2: Configure DNS
┌─────────────────────────────────────┐
│  Add these DNS records:             │
│                                     │
│  Record 1: CNAME                    │
│  Host: www                          │
│  Value: custom.devfolio.cc          │
│                                     │
│  Record 2: TXT (Verification)       │
│  Host: _devfolio                    │
│  Value: verify-abc123xyz            │
│                                     │
│  [I've Added Records]               │
└─────────────────────────────────────┘

Step 3: Verify Domain
┌─────────────────────────────────────┐
│  🔄 Verifying your domain...        │
│                                     │
│  This may take a few minutes        │
│                                     │
│  Status: Checking DNS records...   │
└─────────────────────────────────────┘

Step 4: Success! ✅
┌─────────────────────────────────────┐
│  🎉 Domain Connected!               │
│                                     │
│  Your portfolio is now live at:     │
│  https://www.nitin.com              │
│                                     │
│  SSL: ✅ Enabled                    │
│  Status: ✅ Active                  │
│                                     │
│  [View Portfolio]                   │
└─────────────────────────────────────┘
```

---

## 💾 Database Schema

```prisma
model Portfolio {
  id               Int            @id @default(autoincrement())
  userId           Int            @unique
  user             User           @relation(fields: [userId], references: [id])
  // ... existing fields ...
  customDomain     CustomDomain?
  embedEnabled     Boolean        @default(true)
}

model CustomDomain {
  id               Int            @id @default(autoincrement())
  portfolioId      Int            @unique
  portfolio        Portfolio      @relation(fields: [portfolioId], references: [id])
  domain           String         @unique
  verified         Boolean        @default(false)
  verificationCode String
  verifiedAt       DateTime?
  sslEnabled       Boolean        @default(false)
  sslIssuedAt      DateTime?
  status           DomainStatus   @default(PENDING)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  
  @@index([domain])
  @@index([verified])
}

enum DomainStatus {
  PENDING
  VERIFYING
  VERIFIED
  FAILED
  DISABLED
}
```

---

## 🛠️ Technical Stack

### Required Services:
```
1. DNS Verification:
   - Node DNS module
   - Or Cloudflare API
   
2. SSL Certificates:
   - Let's Encrypt (free)
   - Or Vercel automatic SSL
   
3. Custom Domain Routing:
   - Next.js middleware
   - Or Cloudflare Workers
   
4. Domain Verification:
   - TXT record check
   - CNAME validation
```

### APIs Needed:
```typescript
// Custom Domain APIs
POST   /api/custom-domain/add
GET    /api/custom-domain/status
POST   /api/custom-domain/verify
DELETE /api/custom-domain/remove

// Embed APIs
GET    /api/embed/code
GET    /[username]?embed=true  // Embed mode
```

---

## 📊 Feature Comparison

| Feature | iFrame | Custom Domain | Export | Subdomain |
|---------|--------|---------------|--------|-----------|
| Easy Setup | ✅ Easy | ❌ Complex | ⚠️ Medium | ⚠️ Medium |
| SEO | ❌ Poor | ✅ Great | ✅ Great | ✅ Good |
| Cost | 💰 Free | 💰💰 Paid | 💰 Free | 💰 Free |
| Live Sync | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| SSL | ✅ Auto | ✅ Auto | ⚠️ Manual | ✅ Auto |
| User Control | ❌ Limited | ✅ Full | ✅ Full | ✅ Full |

---

## 💡 Monetization Strategy

### Free Tier:
- ✅ iFrame embedding
- ✅ DevFolio subdomain
- ✅ Export portfolio (with watermark)

### Pro Tier ($5-10/month):
- ✅ Custom domain mapping
- ✅ SSL certificate
- ✅ Remove DevFolio branding
- ✅ Priority support
- ✅ Advanced analytics

---

## 🚀 Rollout Plan

### Week 1-2: iFrame Embedding (MVP)
```
- Add embed mode to portfolio
- Generate embed code
- Test on different platforms
- Documentation
```

### Week 3-4: Custom Domain (Beta)
```
- Database schema
- DNS verification system
- Domain addition UI
- SSL setup (Vercel)
```

### Week 5-6: Testing & Polish
```
- Test with real domains
- Fix edge cases
- User documentation
- Video tutorials
```

---

## 📝 User Documentation

### For iFrame Embed:
```markdown
# Embed Your Portfolio

1. Go to Settings → Share
2. Copy the embed code
3. Paste in your website's HTML
4. Done! Your portfolio is embedded

## Example:
Add this to your website:
<iframe src="https://devfolio.cc/yourname?embed=true" 
        width="100%" height="100vh">
</iframe>
```

### For Custom Domain:
```markdown
# Connect Your Domain

1. Go to Settings → Custom Domain
2. Enter your domain (e.g., nitin.com)
3. Add these DNS records at your registrar:
   - CNAME: www → custom.devfolio.cc
   - TXT: _devfolio → [verification code]
4. Click "Verify Domain"
5. Wait 5-10 minutes for propagation
6. Done! Visit your domain ✅

## Popular Registrars:
- GoDaddy: [Link to guide]
- Namecheap: [Link to guide]
- Cloudflare: [Link to guide]
```

---

## 🎯 Success Metrics

### KPIs to Track:
- Number of custom domains connected
- iFrame embeds usage
- Pro plan conversions
- Domain verification success rate
- SSL certificate issues
- User satisfaction (NPS)

---

## 🔒 Security Considerations

1. **Domain Verification:**
   - Verify ownership via TXT record
   - Prevent domain hijacking
   
2. **SSL Certificates:**
   - Automatic renewal
   - Valid certificates only
   
3. **Rate Limiting:**
   - Limit domain verification attempts
   - Prevent abuse

4. **Content Security:**
   - CSP headers for iframes
   - X-Frame-Options configuration

---

## 🤔 Technical Challenges & Solutions

### Challenge 1: SSL Certificate Management
**Solution:** Use Vercel automatic SSL or Cloudflare proxied DNS

### Challenge 2: DNS Propagation Time
**Solution:** Show clear status + estimated time to users

### Challenge 3: Multiple Domains per User
**Solution:** Start with 1 domain per user, expand to 3 in Pro tier

### Challenge 4: Domain Transfer (user sells domain)
**Solution:** Regular reverification (every 30 days)

---

## ✅ Conclusion

**Best Approach for DevFolio:**

1. **Start with iFrame Embedding** (Phase 1)
   - Easy to implement
   - Immediate value
   - No infrastructure changes

2. **Add Custom Domain as Pro Feature** (Phase 2)
   - Revenue opportunity
   - Professional feature
   - Differentiation from competitors

3. **Consider Export for Advanced Users** (Phase 3)
   - One-time download
   - Full ownership
   - Offline backup

---

## 📚 Resources

### Documentation to Create:
- [ ] User guide for iFrame embedding
- [ ] DNS setup guide (per registrar)
- [ ] Troubleshooting guide
- [ ] Video tutorials
- [ ] FAQ section

### Technical Docs:
- [ ] API documentation
- [ ] Middleware implementation
- [ ] DNS verification flow
- [ ] SSL certificate setup

---

**Ready to implement? Start with iFrame embedding (easy win), then build towards custom domains! 🚀**

**This feature will make DevFolio stand out and provide real value to developers! 💎**


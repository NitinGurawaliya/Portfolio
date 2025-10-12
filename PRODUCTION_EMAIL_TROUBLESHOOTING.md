# 🚨 Production Email Troubleshooting Guide

## Common Issues in Production

### 1. Environment Variables Missing ⚠️

**Check करो:**
```bash
# Production platform (Vercel/Railway/Netlify) में check करो
BREVO_HOST="smtp-relay.brevo.com"
BREVO_PORT="587"
BREVO_USER="your-email@example.com"
BREVO_PASS="your-smtp-key"
FROM_EMAIL="noreply@yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

**Fix:**
- Vercel: Settings → Environment Variables
- Railway: Variables tab
- Netlify: Site settings → Environment variables

---

### 2. Database में Email Placeholder है 🔍

**Problem:** Production database में users की email placeholder हो सकती है

**Check करो:**
```sql
SELECT id, name, email, "githubUsername" 
FROM "User" 
WHERE email LIKE '%@placeholder.com';
```

**Fix Options:**

#### Option A: Manual Update (Quick)
```sql
-- Specific user के लिए
UPDATE "User" 
SET email = 'real-email@gmail.com' 
WHERE "githubUsername" = 'YourUsername';
```

#### Option B: Re-login (Automatic)
1. User को logout कराओ
2. Fresh login with GitHub
3. Email API से fetch होगी और save होगी

---

### 3. GitHub Email Private है 🔒

**Problem:** GitHub account में email private है

**Fix:**
1. https://github.com/settings/emails
2. Uncheck "Keep my email addresses private"
3. Save करो
4. Logout और fresh login करो

---

### 4. Brevo SMTP Credentials Wrong ❌

**Check करो:**
- SMTP host correct है? `smtp-relay.brevo.com`
- Port correct है? `587`
- SMTP key valid है?
- FROM_EMAIL verified है?

**Test करो:**
```bash
# Test SMTP connection
telnet smtp-relay.brevo.com 587
```

---

### 5. Production Logs Check करो 📊

**Vercel:**
```
Dashboard → Project → Deployments → Latest → Logs
```

**Railway:**
```
Dashboard → Project → Deployments → View Logs
```

**देखो क्या errors आ रहे:**
- "Email API key not configured"
- "Email service URL not configured"
- SMTP connection errors
- Authentication failed

---

## 🛠️ Quick Fix Script

### Step 1: Check Database Emails

```sql
-- सारे users की emails देखो
SELECT 
    id,
    name,
    email,
    "githubUsername",
    CASE 
        WHEN email LIKE '%@placeholder.com' THEN '❌ Placeholder'
        ELSE '✅ Real Email'
    END as status
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 20;
```

### Step 2: Update Placeholder Emails

```sql
-- अपनी real email से update करो
UPDATE "User" 
SET email = 'your-real-email@gmail.com' 
WHERE id = YOUR_USER_ID;
```

### Step 3: Test Portfolio Publish

1. Production पर जाओ
2. Portfolio publish करो
3. Logs check करो
4. Email inbox check करो

---

## 🔐 Security Check

### DO NOT commit to git:
```
.env
.env.local
.env.production
```

### DO commit:
```
.env.example  (without actual values)
```

---

## 📝 Production Checklist

### Environment Variables:
- [ ] BREVO_HOST set
- [ ] BREVO_PORT set
- [ ] BREVO_USER set
- [ ] BREVO_PASS set (SMTP key)
- [ ] FROM_EMAIL set
- [ ] NEXT_PUBLIC_APP_URL set

### Database:
- [ ] Users have real emails (not placeholder)
- [ ] Database connection working
- [ ] Migrations applied

### Brevo Account:
- [ ] Account active
- [ ] SMTP enabled
- [ ] Sender email verified
- [ ] Daily limit not exceeded (300 emails/day free)

### Code:
- [ ] Latest code deployed
- [ ] Build successful
- [ ] No TypeScript errors

---

## 🧪 Test Email Manually

Production API से test करो:

```bash
# Production URL
curl -X POST https://yourdomain.com/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "name": "Test User",
    "id": "123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "WELCOME email sent successfully",
  "requestId": "abc123..."
}
```

---

## 🚨 Common Production Errors

### Error 1: "Email API key not configured"
**Fix:** Add `BREVO_PASS` environment variable

### Error 2: "Connection timeout"
**Fix:** 
- Check firewall
- Verify SMTP port 587 is open
- Try port 465 (SSL)

### Error 3: "Authentication failed"
**Fix:**
- Regenerate SMTP key in Brevo
- Update `BREVO_PASS` in production
- Redeploy

### Error 4: Email में placeholder
**Fix:**
```sql
UPDATE "User" SET email = 'real@email.com' WHERE id = X;
```

---

## 📊 Debug API Route

Create this file to check config:

**src/app/api/debug/email-config/route.ts:**
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development OR with secret key
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  return NextResponse.json({
    env: process.env.NODE_ENV,
    config: {
      hasBrevoHost: !!process.env.BREVO_HOST,
      hasBrevoUser: !!process.env.BREVO_USER,
      hasBrevoPass: !!process.env.BREVO_PASS,
      hasFromEmail: !!process.env.FROM_EMAIL,
      brevoHost: process.env.BREVO_HOST,
      brevoUser: process.env.BREVO_USER,
      fromEmail: process.env.FROM_EMAIL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    }
  });
}
```

**Test:**
```bash
curl https://yourdomain.com/api/debug/email-config
```

---

## 💡 Production Tips

1. **Use Separate Brevo Account** for production
2. **Monitor Email Quota** (300/day free tier)
3. **Set up Alerts** in Brevo dashboard
4. **Log all email attempts** for debugging
5. **Test with real emails** not temporary ones

---

## 🔄 Migration Steps (Dev → Prod)

### 1. Export Dev DB Emails
```sql
-- Get all real emails from dev
SELECT email FROM "User" 
WHERE email NOT LIKE '%@placeholder.com';
```

### 2. Import to Prod DB
```sql
-- Update prod DB with real emails
UPDATE "User" 
SET email = 'real-email@gmail.com' 
WHERE "githubUsername" = 'username';
```

### 3. Deploy with Env Vars
```bash
# Set all BREVO_* variables
# Deploy
# Test
```

---

## 📞 Need Help?

**If still not working, check:**
1. Production logs (full error message)
2. Database email values
3. Brevo dashboard (any blocks/limits?)
4. Environment variables (all set?)
5. Code deployed (latest version?)

**Share with me:**
```
1. Error message from logs
2. Database email value (SELECT email WHERE...)
3. Environment variable status (has/not has)
```

---

**Production troubleshooting complete! Follow checklist above.** 🚀


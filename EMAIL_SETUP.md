# 📧 Email Service Setup Guide

Portfolio project में welcome email integration की complete setup guide।

## 📋 Overview

जब कोई नया user पहली बार GitHub से signup करता है, तो automatically एक welcome email भेजी जाती है।

## 🛠️ Setup Steps

### 1. Environment Variables Configure करें

अपनी `.env` या `.env.local` file में ये variables add करें:

```bash
# Email Service Configuration (Breevo)
EMAIL_SERVICE_URL="https://api.breevo.com/v1"
EMAIL_API_KEY="your-breevo-api-key-here"
FROM_EMAIL="noreply@yourdomain.com"
```

### 2. Email Service Provider (Breevo) Setup

1. [Breevo](https://breevo.com) पर account बनाएं
2. API key generate करें
3. Domain verification complete करें (optional but recommended)
4. Sender email verify करें

**Alternative Email Services:**
- SendGrid
- AWS SES
- Mailgun
- Resend
- Postmark

> Note: अगर आप दूसरी service use करना चाहते हैं तो `src/lib/services/client.ts` में API endpoint और headers update करें।

### 3. Dependencies Check करें

Required packages:
```bash
npm install axios uuid
npm install --save-dev @types/uuid
```

## 🧪 Testing

### Method 1: Test API Route से

Email service test करने के लिए:

```bash
# Configuration check करें
curl http://localhost:3000/api/email/test

# Test email भेजें
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "Test User",
    "id": "123"
  }'
```

या Postman/Thunder Client से:

**GET** `http://localhost:3000/api/email/test`
- Configuration और metrics देखने के लिए

**POST** `http://localhost:3000/api/email/test`
```json
{
  "email": "test@example.com",
  "name": "Test User",
  "id": "123"
}
```

### Method 2: Actual Signup से Test करें

1. Development server start करें: `npm run dev`
2. Browser में open करें: `http://localhost:3000`
3. "Sign in with GitHub" click करें
4. GitHub authorization complete करें
5. अगर यह पहली बार signup है, तो welcome email automatically भेजी जाएगी

### Method 3: Code से Direct Test

```typescript
import { sendWelcomeEmail } from '@/lib/services/email';

const result = await sendWelcomeEmail({
  email: 'test@example.com',
  name: 'Test User',
  id: '123',
});

console.log(result);
```

## 📁 File Structure

```
src/
├── lib/
│   ├── constants/
│   │   └── emailLogger.ts        # Email logging system
│   ├── interfaces/
│   │   └── email.ts               # TypeScript interfaces
│   └── services/
│       ├── client.ts              # Email API client (Breevo)
│       ├── email.ts               # High-level email functions
│       ├── templates.ts           # HTML email templates
│       ├── triggers.ts            # Email trigger service
│       └── index.ts               # Exports
└── app/
    └── api/
        ├── auth/
        │   └── github/
        │       └── route.ts       # GitHub auth + welcome email
        └── email/
            └── test/
                └── route.ts       # Email testing endpoint
```

## 🎯 How It Works

### User Signup Flow:

```
1. User clicks "Sign in with GitHub"
   ↓
2. GitHub OAuth authentication
   ↓
3. User data saved to database
   ↓
4. Check if new user (first time signup)
   ↓
5. If new user → Send welcome email (non-blocking)
   ↓
6. Redirect to dashboard
```

### Email Sending Process:

```
sendWelcomeEmail()
   ↓
emailTriggerService.sendExternalEmail()
   ↓
emailClient.sendEmail()
   ↓
Breevo API
   ↓
User's inbox ✉️
```

## 🔍 Debugging

### Check Logs

Email service detailed logs print करती है:

```
📧 [EMAIL-REQUEST] - Email request initiated
🎨 [EMAIL-TEMPLATE] - Template generation
🌐 [EMAIL-API] - API call to Breevo
✅ [EMAIL-SUCCESS] - Email sent successfully
❌ [EMAIL-ERROR] - Error occurred
```

### Common Issues & Solutions

#### 1. Emails नहीं भेज रहे

**Check:**
- Environment variables properly set हैं?
```bash
echo $EMAIL_SERVICE_URL
echo $EMAIL_API_KEY
echo $FROM_EMAIL
```

- API key valid है?
- Email service URL correct है?
- Network connectivity है?

#### 2. Configuration Error

```json
{
  "error": "Email API key not configured"
}
```

**Solution:** `.env` file में `EMAIL_API_KEY` add करें और server restart करें।

#### 3. Emails spam में जा रहे

**Solution:**
- Domain का SPF, DKIM, DMARC setup करें
- Email warmup करें
- Verified sender email use करें

#### 4. Development में testing

Development में testing के लिए:
- Mailtrap.io use करें (email testing sandbox)
- अपना actual email use करें testing के लिए

## 📊 Monitoring

### Metrics देखें

```bash
curl http://localhost:3000/api/email/test
```

Response:
```json
{
  "success": true,
  "metrics": {
    "totalRequests": 10,
    "successCount": 8,
    "failureCount": 2,
    "averageDuration": "245.50ms",
    "errorsByType": {
      "NetworkError": 1,
      "TimeoutError": 1
    }
  }
}
```

## 🎨 Email Template

Welcome email template में शामिल है:
- User का naam के साथ personalized greeting
- Platform के features की जानकारी
- Call-to-action button
- Social media links
- Professional signature

Template customize करने के लिए: `src/lib/services/templates.ts`

## 🔒 Security

✅ **Best Practices:**
- API keys environment variables में store करें
- httpOnly cookies use करें session के लिए
- Email sending non-blocking है (user experience affected नहीं होता)
- Error logs में sensitive data leak नहीं होता
- Rate limiting future में add कर सकते हैं

## 🚀 Production Deployment

Production में deploy करने से पहले:

1. ✅ Environment variables production में set करें
2. ✅ Email service का production API key use करें
3. ✅ Domain verification complete करें
4. ✅ SPF, DKIM records setup करें
5. ✅ Sender email verify करें
6. ✅ Rate limiting implement करें (optional)
7. ✅ Monitoring setup करें (Sentry, LogRocket, etc.)

## 📝 Next Steps

Future enhancements:
- [ ] Email queue system (Bull/BullMQ) for better reliability
- [ ] Email templates for other events (portfolio published, etc.)
- [ ] Email preferences (opt-in/opt-out)
- [ ] Email analytics (open rate, click rate)
- [ ] Bulk email support
- [ ] Email scheduling

## 📖 References

- [TBE Email Implementation Guide](./EMAIL-SYSTEM-IMPLEMENTATION.md)
- [Breevo API Docs](https://breevo.com/docs)
- [Email Best Practices](https://www.emailonacid.com/blog/)

---

**Created for:** DevFolio Portfolio  
**Last Updated:** 2025  
**Maintained by:** Your Team


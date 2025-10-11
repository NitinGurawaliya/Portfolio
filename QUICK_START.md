# ⚡ Quick Start - Welcome Email Setup

## 🎯 5-Minute Setup

### Step 1: Brevo Account Setup (2 min)

1. Go to https://www.brevo.com and signup
2. Go to **Settings** → **SMTP & API** → **SMTP**
3. Generate new SMTP key
4. Copy credentials

### Step 2: Environment Variables (1 min)

Create/update `.env.local`:

```bash
# Brevo SMTP
BREVO_HOST="smtp-relay.brevo.com"
BREVO_PORT="587"
BREVO_USER="your-brevo-login-email"
BREVO_PASS="your-smtp-key-here"
FROM_EMAIL="your-email@example.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Test (2 min)

```bash
# Start server
npm run dev

# Open browser
# http://localhost:3000

# Sign in with NEW GitHub account
# Check email! 📧
```

---

## ✅ What's Implemented

### Files Created/Modified:

1. ✅ `src/lib/templates/welcomeEmail.ts` - Beautiful email template
2. ✅ `src/app/api/auth/github/route.ts` - Welcome email integration
3. ✅ `src/lib/sendEmail.ts` - Already exists (Brevo SMTP client)

### Features:

✅ **First-time user detection** - Only new users get email
✅ **Dynamic template** - Uses user's name, username
✅ **Non-blocking** - Email sending doesn't slow down login
✅ **Production-ready** - Proper error handling
✅ **Skip placeholder emails** - No spam to fake emails
✅ **Detailed logging** - Full visibility in console

---

## 🎨 Email Preview

Subject: **🚀 Welcome to DevFolio - Let's Build Your Portfolio!**

Content highlights:
- Personalized greeting with user's name
- Feature showcase (Import Projects, Customize Theme, Share)
- Quick start tips
- Professional design with gradient header
- Call-to-action button to dashboard
- Responsive design (works on mobile/desktop)

---

## 🔍 How to Verify It's Working

### Console Logs (New User):
```
✅ User saved to database successfully: username
🎉 New user detected! Sending welcome email to: user@example.com
✅ Email sent successfully: <id@brevo.com>
✅ Welcome email sent successfully to: user@example.com
```

### Console Logs (Returning User):
```
✅ User saved to database successfully: username
👋 Returning user: username
```

---

## 🐛 Common Issues

### "Email not received"
- Check spam folder
- Verify BREVO credentials in `.env.local`
- Check Brevo dashboard logs
- Make sure FROM_EMAIL is set

### "Authentication failed"
- Regenerate SMTP key in Brevo
- Update BREVO_PASS in `.env.local`
- Restart server

---

## 📚 Full Documentation

- **Detailed Setup**: `WELCOME_EMAIL_SETUP.md`
- **Troubleshooting**: `WELCOME_EMAIL_SETUP.md` (section 🐛)
- **Production Deploy**: `WELCOME_EMAIL_SETUP.md` (section 🚀)

---

## 🎉 You're Done!

Welcome email system is **production-ready** and working! 

Just add Brevo credentials and test. 🚀

**Happy coding! 💻**


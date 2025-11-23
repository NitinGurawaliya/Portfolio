# Fix: Portfolio Not Found Error

## Issue
You're getting "Portfolio not found or access denied" when trying to add a custom domain.

## Root Cause
The `portfolioId` is `0` because it wasn't loaded properly after publishing your portfolio.

## Solution: Follow These Steps

### Step 1: CRITICAL - Run Database Migration First

**You MUST do this first** or nothing will work!

Open **Command Prompt** (not PowerShell):

```cmd
cd C:\Users\BHUPENDER\OneDrive\Desktop\Portfolio
npx prisma db push
npx prisma generate
```

This creates the `CustomDomain` table in your database.

### Step 2: Restart Dev Server

After the migration:
```cmd
npm run dev
```

### Step 3: Refresh Your Browser

1. Go to your browser
2. Press `Ctrl + Shift + R` (hard refresh)
3. Or just press `F5`

### Step 4: Check the Console

Open browser DevTools (F12) and look for this log:
```
📋 Loading portfolio: { id: [some number], isPublished: true }
```

If you see `id: 0` or don't see this log, the portfolio isn't loading properly.

### Step 5: Try Adding Domain Again

1. Go to Dashboard → Domain tab (globe icon)
2. If you see "Portfolio information not loaded yet" → Click the **Refresh Page** button
3. Enter your domain (e.g., `zayka.online`)
4. Click "Add Domain"

## What I Fixed

### 1. Added Better Error Messages
- Shows helpful message when portfolio ID is missing
- Added "Refresh Page" button
- Better error text from API

### 2. Added Debug Logging
When you try to add a domain, check your terminal for:
```
[Custom Domain] Add domain request: { 
  domain: 'zayka.online', 
  portfolioId: 0,  ← This should NOT be 0
  userId: [your user id]
}
```

If `portfolioId` is `0`, that's the problem!

### 3. Fixed Portfolio ID Loading
- Portfolio ID now loads after publishing
- Portfolio ID loads on page refresh
- Portfolio ID loads when navigating to Domain tab

## Troubleshooting

### If Portfolio ID is still 0:

**Check Terminal for Portfolio Loading:**
Look for this in your dev server terminal:
```
📋 Loading portfolio: { id: 123, isPublished: true }
```

If you see `id: 0` or don't see this log, the problem is:

**Option A: Portfolio Doesn't Exist**
- Go to Home tab
- Click "Publish Portfolio" button
- Wait for success message
- Refresh the page

**Option B: Database Not Synced**
- Make sure you ran `npx prisma db push`
- Make sure you ran `npx prisma generate`
- Restart dev server

### If You See Prisma Errors:

Errors like:
```
Property 'customDomain' does not exist on type 'PrismaClient'
```

**Solution:** Run the migration commands:
```cmd
npx prisma db push
npx prisma generate
```

## How to Verify It's Working

### 1. Check Browser Console
Press F12 → Console tab

Should see:
```
📋 Loading portfolio: { id: 5, isPublished: true }  ← id should NOT be 0
```

### 2. Check Terminal
When you click "Add Domain", should see:
```
[Custom Domain] Add domain request: {
  domain: 'zayka.online',
  portfolioId: 5,  ← Should be your actual portfolio ID, not 0
  userId: 188774942
}

[Custom Domain] Portfolio lookup result: {
  found: true,  ← Should be true
  portfolioId: 5,
  portfolioUserId: 188774942,
  requestedUserId: 188774942
}
```

### 3. DNS Records Should Appear
After successful domain addition, you should see:
- 3 DNS records (A, CNAME, TXT)
- Copy buttons
- "Verify Domain" button

## Still Not Working?

### Share These Logs

1. **Browser Console** (F12 → Console):
   - Copy any logs that start with `📋 Loading portfolio`
   - Copy any errors

2. **Terminal Logs**:
   - Copy logs that start with `[Custom Domain]`
   - Copy any Prisma errors

3. **What You See**:
   - Screenshot of the error message
   - Tell me what tab you're on

## Quick Checklist

- [ ] Ran `npx prisma db push`
- [ ] Ran `npx prisma generate`
- [ ] Restarted dev server
- [ ] Refreshed browser (Ctrl + Shift + R)
- [ ] Portfolio shows as published (Home tab)
- [ ] Clicked "Refresh Page" button in Domain tab
- [ ] Checked browser console for portfolio ID log
- [ ] Checked terminal for debug logs

## Expected Flow

1. Publish portfolio ✅ (you did this)
2. Refresh browser 
3. Go to Domain tab
4. See portfolio ID loaded (check console)
5. Enter domain name
6. Click "Add Domain"
7. See DNS records ✅

---

**Most Likely Issue:** You need to refresh the page or the database migration hasn't been run yet.

**Quick Fix:** 
1. Run `npx prisma db push` and `npx prisma generate`
2. Restart dev server
3. Refresh browser
4. Try again!


# Production Debugging Guide

## 🚀 **Option 1: Use Production Database URL Locally**

### Steps:

1. **Get Production Database URL from Vercel:**
   ```bash
   # In your project root
   vercel env pull .env.local
   ```

2. **Check if DATABASE_URL is set:**
   ```bash
   cat .env.local | grep DATABASE_URL
   ```

3. **Set environment variable for PowerShell:**
   ```powershell
   # Get DATABASE_URL from .env.local
   $env:DATABASE_URL = (Get-Content .env.local | Select-String -Pattern "DATABASE_URL=").ToString().Split('=')[1].Trim()
   
   # Test connection
   node scripts/test-production-db.js
   ```

4. **Run debug scripts:**
   ```powershell
   # Debug specific project
   node scripts/debug-project-data.js 1
   
   # Create test data
   node scripts/create-simple-api.js
   ```

## 🚀 **Option 2: Check Vercel Logs**

### Steps:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project
   - Click on "Logs" tab

2. **View logs in real-time:**
   - Open your deployed app
   - Click on a project card
   - Watch the logs for detailed error messages

3. **Look for these logs:**
   - `🚀 API GET: Starting request`
   - `📊 API GET: Request params`
   - `❌ API GET: Error fetching project views`

## 🚀 **Option 3: Deploy and Test**

### Steps:

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Add detailed logs for production debugging"
   git push origin production
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Test in production:**
   - Open your deployed app
   - Navigate to dashboard
   - Open browser console (F12)
   - Click on a project card
   - Check console logs

## 📊 **Expected Logs**

### Frontend (Browser Console):
```
🚀 IndividualProjectChart: Starting data fetch for: {...}
📊 IndividualProjectChart fetching data for: {...}
📊 IndividualProjectChart: Making fetch request to: /api/analytics/track-project-click?...
📊 IndividualProjectChart: Response received: {...}
📊 IndividualProjectChart API Response: {...}
```

### Backend (Vercel Logs):
```
🚀 API GET: Starting request to track-project-click
📊 API GET: Request params: {...}
📊 API GET: Where clause: {...}
📊 API GET: Found daily views: X
✅ API GET: Returning successful response: {...}
```

## 🐛 **Common Issues**

### Issue 1: BigInt Conversion Error
- **Symptom**: `Cannot convert string to BigInt`
- **Fix**: Check if projectId is numeric string

### Issue 2: No Data Returned
- **Symptom**: Empty chart data
- **Fix**: Check if DailyProjectViews table has data

### Issue 3: 500 Error
- **Symptom**: Server error
- **Fix**: Check Vercel logs for detailed error message

## 🔧 **Debugging Commands**

```powershell
# Test database connection
node scripts/test-production-db.js

# Debug project data
node scripts/debug-project-data.js 1

# Check all repositories
node scripts/check-portfolios.js

# View detailed analytics
node scripts/test-analytics-data.js
```

## 📝 **Next Steps**

1. Deploy these changes
2. Check Vercel logs
3. Share the logs with me
4. I'll help fix the issue

# Cache Verification Guide

## 🔍 How to Verify Caching is Working

### **Method 1: Console Logs (Easiest)**

#### **Step 1: Open Browser Console**
1. Open your portfolio page
2. Press `F12` or right-click → "Inspect"
3. Go to "Console" tab

#### **Step 2: Look for Cache Logs**

**First Visit (Cache Miss):**
```
🚀 GitHub User API: Fetching fresh data from GitHub
🚀 GitHub User API: Data cached for 1200 minutes
🚀 GitHub Repos API: Fetching fresh data from GitHub
🚀 GitHub Repos API: Data cached for 1200 minutes
🚀 Portfolio API: Fetching fresh data from database for username
🚀 Portfolio API: Data cached for 5 minutes
```

**Second Visit (Cache Hit):**
```
🚀 GitHub User API: Returning cached data
🚀 GitHub Repos API: Returning cached data
🚀 Portfolio API: Returning cached data for username
```

---

### **Method 2: Cache Debug Dashboard (Best)**

#### **Step 1: Visit Debug Page**
```
http://localhost:3000/debug/cache
```

#### **Step 2: Check Cache Statistics**
- **Total Items**: Number of cached items
- **Active Items**: Non-expired items
- **Expired Items**: Expired items (auto-cleaned)
- **GitHub Caches**: Number of GitHub API caches

#### **Step 3: Monitor Cache Details**
- **Cache Keys**: See what's cached
- **Age**: How long data has been cached
- **Remaining**: Time until expiration
- **TTL**: Total time to live
- **Status**: Active/Expired/Expiring Soon

---

### **Method 3: API Endpoint (Technical)**

#### **Step 1: Call Cache Stats API**
```bash
curl http://localhost:3000/api/debug/cache-stats
```

#### **Step 2: Check Response**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "stats": {
    "total": 5,
    "active": 4,
    "expired": 1
  },
  "summary": {
    "totalItems": 5,
    "activeItems": 4,
    "expiredItems": 1,
    "githubCaches": 3,
    "portfolioCaches": 1,
    "apiCaches": 1
  }
}
```

---

## 🧪 Testing Scenarios

### **Test 1: First Visit (Cache Miss)**
1. Clear browser cache
2. Visit portfolio page
3. Check console for "Fetching fresh data" logs
4. Verify data loads correctly

### **Test 2: Second Visit (Cache Hit)**
1. Refresh the same page
2. Check console for "Returning cached data" logs
3. Verify page loads faster
4. Check debug dashboard for cached items

### **Test 3: GitHub API Caching (20 hours)**
1. Visit portfolio page
2. Check console for GitHub API logs
3. Refresh page multiple times
4. Verify GitHub APIs show "Returning cached data"

### **Test 4: Portfolio Caching (5 minutes)**
1. Visit portfolio page
2. Wait 6 minutes
3. Refresh page
4. Check console for "Fetching fresh data" logs

### **Test 5: Cache Invalidation**
1. Publish portfolio changes
2. Check console for "Cache invalidated" logs
3. Refresh page
4. Verify fresh data is fetched

---

## 📊 Expected Results

### **GitHub APIs (20 hours)**
- **First call**: "Fetching fresh data from GitHub"
- **Subsequent calls**: "Returning cached data"
- **Cache duration**: 1200 minutes (20 hours)
- **Hit rate**: 95%+ after first call

### **Portfolio APIs (5 minutes)**
- **First call**: "Fetching fresh data from database"
- **Within 5 minutes**: "Returning cached data"
- **After 5 minutes**: "Fetching fresh data from database"
- **On publish**: "Cache invalidated"

### **Cache Statistics**
- **Total items**: 3-5 (GitHub + Portfolio)
- **Active items**: 3-5 (most items active)
- **Expired items**: 0-1 (auto-cleaned)
- **GitHub caches**: 3 (user, repos, activity)

---

## 🚨 Troubleshooting

### **Issue: No Cache Logs**
**Solution:**
1. Check if caching is enabled
2. Verify API routes have cache imports
3. Check console for errors

### **Issue: Always "Fetching fresh data"**
**Solution:**
1. Check cache TTL settings
2. Verify cache keys are consistent
3. Check for cache invalidation

### **Issue: Cache not working**
**Solution:**
1. Check cache implementation
2. Verify cache keys
3. Check for memory issues

### **Issue: Debug page not loading**
**Solution:**
1. Check if debug routes are enabled
2. Verify component imports
3. Check for TypeScript errors

---

## 🎯 Success Indicators

### **Console Logs**
- ✅ "Fetching fresh data" on first visit
- ✅ "Returning cached data" on subsequent visits
- ✅ "Cache invalidated" on publish
- ✅ No error messages

### **Debug Dashboard**
- ✅ Shows cached items
- ✅ Shows correct TTL times
- ✅ Shows active/expired status
- ✅ Auto-refreshes every 30 seconds

### **Performance**
- ✅ First visit: 2-4 seconds
- ✅ Cached visit: 200-500ms
- ✅ GitHub APIs: 95%+ cache hit rate
- ✅ Portfolio APIs: 80%+ cache hit rate

---

## 🔧 Cache Configuration Verification

### **Check Current Settings**
```typescript
// src/lib/cache.ts
export const CacheTTL = {
  GITHUB_USER: 1200,      // 20 hours
  GITHUB_REPOS: 1200,     // 20 hours
  GITHUB_ACTIVITY: 1200,  // 20 hours
  PORTFOLIO: 5,           // 5 minutes
  PORTFOLIO_DATA: 2,      // 2 minutes
  API_RESPONSE: 10        // 10 minutes
}
```

### **Verify Cache Keys**
- **GitHub User**: `github_user_${username}`
- **GitHub Repos**: `github_repos_${username}`
- **GitHub Activity**: `github_activity_${username}`
- **Portfolio**: `portfolio_${username}`

---

## 📈 Performance Monitoring

### **Key Metrics to Track**
1. **Cache Hit Rate**: Should be 90%+
2. **Response Time**: Cached vs Uncached
3. **API Calls**: Should be minimal
4. **Memory Usage**: Should be stable

### **Monitoring Tools**
1. **Console Logs**: Real-time monitoring
2. **Debug Dashboard**: Visual monitoring
3. **API Stats**: Technical monitoring
4. **Browser DevTools**: Performance monitoring

---

## ✅ Verification Checklist

- [ ] Console shows cache logs
- [ ] Debug dashboard loads
- [ ] Cache statistics display
- [ ] First visit fetches fresh data
- [ ] Second visit uses cached data
- [ ] GitHub APIs cached for 20 hours
- [ ] Portfolio APIs cached for 5 minutes
- [ ] Cache invalidation works on publish
- [ ] Performance improved with caching
- [ ] No errors in console

---

**Cache Verification**: ✅ **READY TO TEST**

Visit `http://localhost:3000/debug/cache` to start monitoring your cache performance! 🚀

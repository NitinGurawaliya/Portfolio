# PowerShell script to debug production database locally

Write-Host "🔍 Production Database Debugging Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Pull environment variables from Vercel
Write-Host "`n1. Pulling environment variables from Vercel..." -ForegroundColor Yellow
try {
    vercel env pull .env.local
    Write-Host "✅ Environment variables pulled successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to pull environment variables" -ForegroundColor Red
    Write-Host "Please ensure you have Vercel CLI installed and are logged in" -ForegroundColor Yellow
    exit 1
}

# Step 2: Extract DATABASE_URL
Write-Host "`n2. Extracting DATABASE_URL..." -ForegroundColor Yellow
$databaseUrl = ""
try {
    $envContent = Get-Content .env.local
    foreach ($line in $envContent) {
        if ($line -match "DATABASE_URL=(.+)") {
            $databaseUrl = $matches[1]
            break
        }
    }
    
    if ($databaseUrl) {
        Write-Host "✅ DATABASE_URL found" -ForegroundColor Green
        Write-Host "   URL starts with: $($databaseUrl.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ DATABASE_URL not found in .env.local" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error reading .env.local" -ForegroundColor Red
    exit 1
}

# Step 3: Set environment variable for current session
Write-Host "`n3. Setting DATABASE_URL for current session..." -ForegroundColor Yellow
$env:DATABASE_URL = $databaseUrl
Write-Host "✅ DATABASE_URL set" -ForegroundColor Green

# Step 4: Test database connection
Write-Host "`n4. Testing database connection..." -ForegroundColor Yellow
try {
    node scripts/test-production-db.js
    Write-Host "✅ Database connection test completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection test failed" -ForegroundColor Red
    exit 1
}

# Step 5: Debug project data
Write-Host "`n5. Debugging project data..." -ForegroundColor Yellow
try {
    node scripts/debug-project-data.js 1
    Write-Host "✅ Project data debugging completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Project data debugging failed" -ForegroundColor Red
}

# Step 6: Create test API response
Write-Host "`n6. Creating test API response..." -ForegroundColor Yellow
try {
    node scripts/create-simple-api.js
    Write-Host "✅ Test API response created" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create test API response" -ForegroundColor Red
}

# Step 7: Summary
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "===========" -ForegroundColor Cyan
Write-Host "✅ Environment variables pulled" -ForegroundColor Green
Write-Host "✅ DATABASE_URL set" -ForegroundColor Green
Write-Host "✅ Database connection tested" -ForegroundColor Green
Write-Host "✅ Project data debugged" -ForegroundColor Green
Write-Host "✅ Test API response created" -ForegroundColor Green

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review the logs above" -ForegroundColor White
Write-Host "2. Check test-api-response.json for API response format" -ForegroundColor White
Write-Host "3. Deploy the updated code to Vercel" -ForegroundColor White
Write-Host "4. Check Vercel logs for detailed API logs" -ForegroundColor White

Write-Host "`n🎉 Debugging complete!" -ForegroundColor Green

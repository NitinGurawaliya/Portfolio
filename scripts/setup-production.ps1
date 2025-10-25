# PowerShell script for production setup
Write-Host "🚀 Setting up production database..." -ForegroundColor Green

# Check if .env.local exists (from vercel env pull)
if (Test-Path ".env.local") {
    Write-Host "✅ Found .env.local file" -ForegroundColor Green
    $envContent = Get-Content ".env.local"
    $dbUrl = $envContent | Where-Object { $_ -like "DATABASE_URL=*" }
    if ($dbUrl) {
        Write-Host "✅ Found DATABASE_URL in .env.local" -ForegroundColor Green
        $env:DATABASE_URL = $dbUrl.Split("=")[1]
    }
} else {
    Write-Host "❌ .env.local not found. Please run: vercel env pull" -ForegroundColor Red
    exit 1
}

# Test database connection
Write-Host "🔍 Testing database connection..." -ForegroundColor Yellow
node scripts/test-production-db.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
    
    # Run migration
    Write-Host "🔄 Running database migration..." -ForegroundColor Yellow
    npx prisma migrate deploy
    
    # Populate data
    Write-Host "📊 Populating data..." -ForegroundColor Yellow
    node scripts/production-migration.js
    
    Write-Host "🎉 Production setup completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
}

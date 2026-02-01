# Quick Backend Check Script

Write-Host "🔍 Checking Backend Status..." -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://ai-extension-api.duckdns.org"

# Test 1: Generate Endpoint
Write-Host "1️⃣ Testing /api/generate Endpoint..." -ForegroundColor Yellow
$testBody = @{
    text = "Hello world"
    prompt = "Translate to Vietnamese"
} | ConvertTo-Json

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri "$backendUrl/api/generate" `
        -Method POST `
        -Headers $headers `
        -Body $testBody `
        -TimeoutSec 10
    
    Write-Host "   ✅ Backend is working!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   Response: $($result.result)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Backend error!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Possible issues:" -ForegroundColor Yellow
    Write-Host "   1. Backend not deployed correctly" -ForegroundColor White
    Write-Host "   2. CORS not configured" -ForegroundColor White
    Write-Host "   3. Endpoint path incorrect" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✅ Backend Check Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Backend URL: $backendUrl" -ForegroundColor Cyan
Write-Host "📋 Endpoint: $backendUrl/api/generate" -ForegroundColor White
Write-Host ""

# Test Gemini API Integration
$body = @{
    prompt = "How to learn programming effectively"
    goal = "learning"
    audience = "beginners"
    format = "step-by-step"
} | ConvertTo-Json

Write-Host "Testing Gemini API integration..." -ForegroundColor Green
Write-Host "Request body: $body" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/generate" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

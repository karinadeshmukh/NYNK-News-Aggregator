Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting NYNK - News You Need to Know Full-Stack App" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Start-Process cmd -ArgumentList "/k cd /d `"$PSScriptRoot\ai_service`" && python main.py" -WindowStyle Normal
Start-Sleep -Seconds 3

Start-Process cmd -ArgumentList "/k cd /d `"$PSScriptRoot\backend`" && npm start" -WindowStyle Normal
Start-Sleep -Seconds 2

Start-Process cmd -ArgumentList "/k cd /d `"$PSScriptRoot\frontend`" && npm start" -WindowStyle Normal

Write-Host "All services launched successfully!" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor Gray
Write-Host "Frontend UI:     http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend API:     http://localhost:5000" -ForegroundColor Yellow
Write-Host "AI Microservice: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

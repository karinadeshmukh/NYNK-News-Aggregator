@echo off
echo ========================================================
echo   Starting NYNK - News You Need to Know Full-Stack App
echo ========================================================
echo.

start "NYNK AI Microservice (Port 8000)" cmd /k "cd ai_service && python main.py"
timeout /t 3 /nobreak >nul

start "NYNK Backend API (Port 5000)" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak >nul

start "NYNK Frontend (Port 3000)" cmd /k "cd frontend && npm start"

echo.
echo All services are running!
echo --------------------------------------------------------
echo Frontend UI:     http://localhost:3000
echo Backend API:     http://localhost:5000
echo AI Microservice: http://localhost:8000/docs
echo --------------------------------------------------------
echo.
pause

@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   Logic Gym 開發伺服器
echo ========================================
echo.
echo 請用 Chrome 或 Edge 開：
echo   http://127.0.0.1:3000
echo.
echo 看到 Ready 後才能開網頁。關閉此視窗 = 停止網站。
echo 若 Internal Server Error → 雙擊 reset-dev.bat
echo ========================================
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)

npm run dev
pause

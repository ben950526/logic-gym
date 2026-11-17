@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   清除快取並重啟 Logic Gym
echo   （遇到 Internal Server Error 時用）
echo ========================================
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo 關閉佔用 3000 的行程 PID %%a
  taskkill /F /PID %%a >nul 2>&1
)

if exist .next (
  echo 刪除 .next 快取...
  rmdir /s /q .next
)

echo 啟動開發伺服器...
echo 網址: http://127.0.0.1:3000
echo.
call npm run dev
pause

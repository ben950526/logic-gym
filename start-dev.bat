@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo.

echo ========================================

echo   Logic Gym 開發伺服器

echo ========================================

echo.

echo 請用「Chrome 或 Edge」開下面其中一個網址：

echo   http://127.0.0.1:3000

echo   http://localhost:3000

echo.

echo 不要用 Cursor 內建瀏覽器（可能連不上 localhost）

echo.

echo 看到 Ready 後才能開網頁。關閉此視窗 = 停止網站。

echo ========================================

echo.

npm run dev

pause


@echo off
chcp 65001 >nul
title Diamond Bot Mobile App

echo.
echo ═══════════════════════════════════════
echo     💎 Diamond Bot Mobile App
echo ═══════════════════════════════════════
echo.
echo 📱 মোবাইল অ্যাপ চালু হচ্ছে...
echo.

cd /d "%~dp0"
node server.js

pause

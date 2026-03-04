@echo off
chcp 65001 >nul
echo ========================================
echo   gyork-wbot Release Script
echo ========================================
echo.

:: Version
set VERSION=v1.0.10

:: Repository
set GITHUB_REPO=ghn9264/gyork-wbot-deps
set GITEE_REPO=ghn9264/gyork-wbot-deps

:: Change to script directory
cd /d "%~dp0"

:: Step 1: Pack dependencies
echo.
echo [Step 1] Packing dependencies...
echo.
node scripts/pack-deps.js
if %errorlevel% neq 0 (
    echo Pack failed!
    pause
    exit /b 1
)

:: Step 2: Upload to GitHub Releases
echo.
echo [Step 2] Uploading to GitHub Releases...
echo.
node scripts/upload-release.js
if %errorlevel% neq 0 (
    echo GitHub upload failed. Please check if gh CLI is installed and logged in.
    echo You can manually upload to Gitee.
)

:: Step 3: Commit and push changes
echo.
echo [Step 3] Committing and pushing changes...
echo.
git add scripts/download-deps.js scripts/upload-release.js
git commit -m "chore: update dependencies to %VERSION%"
git push gitee main

echo.
echo ========================================
echo   All operations completed!
echo ========================================
echo.
echo GitHub Release: https://github.com/%GITHUB_REPO%/releases/tag/%VERSION%
echo Gitee Release:  https://gitee.com/%GITEE_REPO%/releases/tag/%VERSION%
echo.
pause

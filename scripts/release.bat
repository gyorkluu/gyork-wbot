@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════════╗
echo ║     gyork-wbot 依赖打包发布工具           ║
echo ╚════════════════════════════════════════════╝
echo.

:: 设置版本号
set VERSION=v1.0.0
set /p VERSION="请输入版本号 (默认: v1.0.0): "

:: 设置仓库路径
set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%..

cd /d %ROOT_DIR%

echo.
echo === 步骤 1: 检查依赖文件 ===
echo.

:: 检查 DLL 和 EXE 文件是否存在
set MISSING=0
for %%f in (
    "avcodec-61.dll"
    "avfilter-10.dll"
    "avformat-61.dll"
    "avutil-59.dll"
    "swscale-8.dll"
    "swresample-5.dll"
    "postproc-58.dll"
    "opencv_world470.dll"
    "Microsoft.CognitiveServices.Speech.core.dll"
    "SDL2.dll"
    "libusb-1.0.dll"
    "zip.dll"
    "libcurl.dll"
    "libxl64.dll"
    "WindowsAccessBridge-64.dll"
    "WindowsDriver.exe"
    "WindowsTool.exe"
) do (
    if not exist %%f (
        echo   ❌ %%f 缺失
        set MISSING=1
    ) else (
        echo   ✅ %%f 存在
    )
)

if %MISSING%==1 (
    echo.
    echo ❌ 部分依赖文件缺失，请先确保所有 DLL 和 EXE 文件存在
    pause
    exit /b 1
)

echo.
echo === 步骤 2: 打包依赖文件 ===
echo.

node scripts\pack-deps.js
if errorlevel 1 (
    echo ❌ 打包失败
    pause
    exit /b 1
)

echo.
echo === 步骤 3: 上传到 Gitee Releases ===
echo.

:: 检查是否已存在 release
echo 检查 Gitee Release %VERSION%...
gh release view %VERSION% --repo ghn9264/gyork-wbot-deps 2>nul
if errorlevel 1 (
    echo 创建 Gitee Release %VERSION%...
    gh release create %VERSION% --repo ghn9264/gyork-wbot-deps --title "%VERSION% Dependencies" --notes "gyork-wbot runtime dependencies"
)

:: 上传文件
for %%f in (
    "ffmpeg-deps.zip"
    "opencv-deps.zip"
    "speech-deps.zip"
    "usb-deps.zip"
    "compression-deps.zip"
    "utils-deps.zip"
    "tools-exe.zip"
) do (
    if exist %%f (
        echo 上传 %%f...
        gh release upload %VERSION% %%f --repo ghn9264/gyork-wbot-deps --clobber
    )
)

echo.
echo === 步骤 4: 上传到 GitHub Releases ===
echo.

:: 检查是否已存在 release
echo 检查 GitHub Release %VERSION%...
gh release view %VERSION% --repo ghn9264/gyork-wbot-deps 2>nul
if errorlevel 1 (
    echo 创建 GitHub Release %VERSION%...
    gh release create %VERSION% --repo ghn9264/gyork-wbot-deps --title "%VERSION% Dependencies" --notes "gyork-wbot runtime dependencies"
)

:: 上传文件
for %%f in (
    "ffmpeg-deps.zip"
    "opencv-deps.zip"
    "speech-deps.zip"
    "usb-deps.zip"
    "compression-deps.zip"
    "utils-deps.zip"
    "tools-exe.zip"
) do (
    if exist %%f (
        echo 上传 %%f...
        gh release upload %VERSION% %%f --repo ghn9264/gyork-wbot-deps --clobber
    )
)

echo.
echo === 步骤 5: 更新下载地址 ===
echo.

:: 更新 download-deps.js 中的版本号
powershell -Command "(Get-Content scripts\download-deps.js) -replace 'v[\d.]+', '%VERSION%' | Set-Content scripts\download-deps.js"
powershell -Command "(Get-Content scripts\upload-release.js) -replace 'v[\d.]+', '%VERSION%' | Set-Content scripts\upload-release.js"

echo ✅ 已更新版本号为 %VERSION%

echo.
echo === 步骤 6: 提交并推送代码 ===
echo.

git status
echo.
set /p COMMIT="是否提交并推送? (y/n): "
if /i "%COMMIT%"=="y" (
    git add .
    git commit -m "chore: 更新依赖版本至 %VERSION%"
    git push gitee main
    echo ✅ 代码已推送
)

echo.
echo ╔════════════════════════════════════════════╗
echo ║              发布完成!                    ║
echo ╚════════════════════════════════════════════╝
echo.
echo 📦 下载地址:
echo    GitHub: https://github.com/ghn9264/gyork-wbot-deps/releases/download/%VERSION%/
echo    Gitee:  https://gitee.com/ghn9264/gyork-wbot-deps/releases/download/%VERSION%/
echo.

pause

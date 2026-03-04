@echo off
chcp 65001
echo ========================================
echo   gyork-wbot 依赖打包上传脚本
echo ========================================
echo.

:: 设置版本号
set VERSION=v1.0.0

:: 设置仓库信息
set GITHUB_REPO=ghn9264/gyork-wbot-deps
set GITEE_REPO=ghn9264/gyork-wbot-deps

:: 切换到脚本目录
cd /d "%~dp0"

:: 步骤1: 打包依赖文件
echo.
echo [步骤1] 打包依赖文件...
echo.
node scripts/pack-deps.js
if %errorlevel% neq 0 (
    echo 打包失败！
    pause
    exit /b 1
)

:: 步骤2: 上传到 GitHub Releases
echo.
echo [步骤2] 上传到 GitHub Releases...
echo.
node scripts/upload-release.js
if %errorlevel% neq 0 (
    echo GitHub上传失败，请检查 gh CLI 是否已安装并登录
    echo 可以手动上传到 Gitee
)

:: 步骤3: 提交代码更改
echo.
echo [步骤3] 提交代码更改...
echo.
git add scripts/download-deps.js scripts/upload-release.js
git commit -m "chore: 更新依赖版本至 %VERSION%"
git push gitee main

echo.
echo ========================================
echo   所有操作完成！
echo ========================================
echo.
echo GitHub Release: https://github.com/%GITHUB_REPO%/releases/tag/%VERSION%
echo Gitee Release:  https://gitee.com/%GITEE_REPO%/releases/tag/%VERSION%
echo.
pause

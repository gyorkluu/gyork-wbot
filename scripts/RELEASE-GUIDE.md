# gyork-wbot 完整发布指南

本文档记录从版本更新到 npm 发布的完整流程。

---

## 发布前准备

### 仓库说明

本项目涉及 **两个独立仓库**：

| 仓库 | 用途 | 地址 |
|------|------|------|
| **主包仓库** | 存放源代码 | `https://github.com/gyorkluu/gyork-wbot.git` |
| **依赖仓库** | 存放大型依赖文件(zip) | `https://github.com/ghn9264/gyork-wbot-deps.git` |

---

## 完整发布流程（示例：1.0.9 → 1.0.10）

### 步骤 1: 更新版本号

修改以下 5 个文件中的版本号：

```bash
# 1. package.json - npm 包版本
"version": "1.0.10"

# 2. scripts/download-deps.js - 下载链接中的版本
const GITHUB_RELEASE_URL = 'https://github.com/ghn9264/gyork-wbot-deps/releases/download/v1.0.10';
const GITEE_RELEASE_URL = 'https://gitee.com/ghn9264/gyork-wbot-deps/releases/download/v1.0.10';

# 3. release.bat - Windows 脚本版本
set VERSION=v1.0.10

# 4. scripts/upload-release.js - GitHub 上传脚本
const VERSION = 'v1.0.10';

# 5. scripts/upload-gitee-release.js - Gitee 上传脚本
const VERSION = 'v1.0.10';
```

**快速替换命令**：
```bash
# 在项目根目录执行
find . -type f \( -name "*.json" -o -name "*.js" -o -name "*.bat" \) -exec sed -i 's/1\.0\.9/1.0.10/g' {} \;
```

---

### 步骤 2: 打包依赖文件

运行打包脚本，将所有 DLL 和 EXE 文件打包成 zip：

```bash
cd /i/workspace/Nodejs-workspace/bot/gyork-wbot
node scripts/pack-deps.js
```

**生成的文件**：
- `ffmpeg-deps.zip` (~60MB) - FFmpeg 运行时库
- `opencv-deps.zip` (~22MB) - OpenCV 运行时库
- `speech-deps.zip` (~1.5MB) - 语音服务库
- `usb-deps.zip` (~54KB) - USB 设备支持库
- `compression-deps.zip` (~80KB) - 压缩解压库
- `utils-deps.zip` (~3.7MB) - 工具库
- `tools-exe.zip` (~12MB) - Windows 工具程序

**总计约 100MB**

---

### 步骤 3: 发布到 GitHub Releases

#### 方式一：使用脚本（推荐）

```bash
node scripts/upload-release.js
```

**要求**：
- 已安装 GitHub CLI (`gh`)
- 已登录: `gh auth login`

#### 方式二：使用 GitHub CLI 手动发布

```bash
gh release create v1.0.10 \
  ./ffmpeg-deps.zip \
  ./opencv-deps.zip \
  ./speech-deps.zip \
  ./usb-deps.zip \
  ./compression-deps.zip \
  ./utils-deps.zip \
  ./tools-exe.zip \
  --repo ghn9264/gyork-wbot-deps \
  --title "v1.0.10 Dependencies" \
  --notes "gyork-wbot runtime dependencies"
```

#### 方式三：使用 MCP 服务器

通过 Claude Code 指令：
```
使用 github mcp 服务器创建 release v1.0.10，
上传 gyork-wbot 目录下的 7 个 zip 文件到 ghn9264/gyork-wbot-deps 仓库
```

**验证地址**：https://github.com/ghn9264/gyork-wbot-deps/releases/tag/v1.0.10

---

### 步骤 4: 发布到 Gitee Releases

运行 Gitee 上传脚本：

```bash
node scripts/upload-gitee-release.js
```

**说明**：
- 脚本内置了 Gitee API Token
- 会自动创建 Release 并上传所有 zip 文件
- 国内用户访问 Gitee 速度更快

**验证地址**：https://gitee.com/ghn9264/gyork-wbot-deps/releases/tag/v1.0.10

---

### 步骤 5: 提交代码到 GitHub 主包仓库

```bash
# 添加更改的文件
git add package.json \
  scripts/download-deps.js \
  release.bat \
  scripts/upload-release.js \
  scripts/upload-gitee-release.js \
  scripts/RELEASE-GUIDE.md

# 提交
git commit -m "chore: bump version to 1.0.10 and update download URLs"

# 推送到 GitHub 主包仓库
git push origin main
```

**仓库地址**：`https://github.com/gyorkluu/gyork-wbot.git`

**注意**：确保有推送权限（需添加为仓库协作者）

---

### 步骤 6: 发布到 npm

```bash
# 登录 npm（如未登录）
npm login

# 发布（需要 2FA 双因素认证码）
npm publish --otp=XXXXXX
```

**要求**：
- npm 账号已开启双因素认证（2FA）
- 有该包的发布权限
- 版本号在 npm 上不存在

**验证地址**：https://www.npmjs.com/package/gyork-wbot

---

## 一键发布脚本

创建 `publish.sh`（Linux/macOS）或 `publish.bat`（Windows）：

```bash
#!/bin/bash
# publish.sh - 一键发布脚本

VERSION=$1
OTP=$2

if [ -z "$VERSION" ]; then
  echo "Usage: ./publish.sh <version> <otp>"
  echo "Example: ./publish.sh 1.0.10 123456"
  exit 1
fi

echo "=== Step 1: Pack dependencies ==="
node scripts/pack-deps.js

echo "=== Step 2: Upload to GitHub ==="
node scripts/upload-release.js

echo "=== Step 3: Upload to Gitee ==="
node scripts/upload-gitee-release.js

echo "=== Step 4: Git commit and push ==="
git add package.json scripts/download-deps.js release.bat \
  scripts/upload-release.js scripts/upload-gitee-release.js
git commit -m "chore: bump version to $VERSION"
git push origin main

echo "=== Step 5: npm publish ==="
if [ -n "$OTP" ]; then
  npm publish --otp=$OTP
else
  npm publish
fi

echo "=== Done! ==="
```

---

## 版本更新检查清单

- [ ] 更新 `package.json` 版本号
- [ ] 更新 `scripts/download-deps.js` 中的 URL 版本
- [ ] 更新 `release.bat` 中的 VERSION
- [ ] 更新 `scripts/upload-release.js` 中的 VERSION
- [ ] 更新 `scripts/upload-gitee-release.js` 中的 VERSION
- [ ] 运行 `node scripts/pack-deps.js` 打包依赖
- [ ] 发布到 GitHub Releases（`ghn9264/gyork-wbot-deps`）
- [ ] 发布到 Gitee Releases（`ghn9264/gyork-wbot-deps`）
- [ ] 提交代码到主包仓库（`gyorkluu/gyork-wbot`）
- [ ] 运行 `npm publish --otp=XXXXXX`

---

## 故障排除

### GitHub 上传失败

**问题**: `gh: command not found`
```bash
# 安装 GitHub CLI
# Windows: winget install GitHub.cli
# macOS: brew install gh
# Linux: sudo apt install gh
```

**问题**: `401 Bad credentials`
```bash
gh auth login
```

### Gitee 上传失败

**问题**: `401 Unauthorized`
- 原因：Gitee API Token 过期
- 解决：更新 `scripts/upload-gitee-release.js` 中的 `ACCESS_TOKEN`

**问题**: 大文件上传超时
- Gitee 单文件限制 100MB
- 确保 zip 文件不超过限制

### npm publish 失败

**问题**: `EOTP` 需要一次性密码
- 确保开启 2FA 并正确输入 6 位 OTP

**问题**: `E429 Too Many Requests`（限流）
- 原因：尝试次数太多
- 解决：等待 5-10 分钟后重试

**问题**: `E403 Forbidden`
- 原因：没有发布权限或版本已存在
- 解决：检查 npm 包权限或更新版本号

### Git 推送失败

**问题**: `Permission denied`
- 确保已添加为仓库协作者
- 或检查 SSH key / Personal Access Token 配置

---

## 文件大小参考

| 文件 | 大小 | 说明 |
|------|------|------|
| ffmpeg-deps.zip | ~60 MB | FFmpeg DLLs |
| opencv-deps.zip | ~22 MB | OpenCV DLL |
| tools-exe.zip | ~12 MB | 可执行工具 |
| utils-deps.zip | ~3.7 MB | 工具库 DLLs |
| speech-deps.zip | ~1.5 MB | 语音服务 DLLs |
| compression-deps.zip | ~80 KB | 压缩库 |
| usb-deps.zip | ~54 KB | USB 库 |
| **总计** | ~100 MB | |

---

## 相关链接

| 用途 | 地址 |
|------|------|
| **npm 包** | https://www.npmjs.com/package/gyork-wbot |
| **GitHub 主包源码** | https://github.com/gyorkluu/gyork-wbot |
| **GitHub 依赖 Release** | https://github.com/ghn9264/gyork-wbot-deps/releases |
| **Gitee 依赖 Release** | https://gitee.com/ghn9264/gyork-wbot-deps/releases |
| **GitHub API** | https://docs.github.com/en/rest |
| **Gitee API** | https://gitee.com/api/v5/swagger |
| **npm 发布文档** | https://docs.npmjs.com/creating-and-publishing-scoped-public-packages |

---

## 注意事项

1. **版本号统一**：确保 5 个文件中的版本号保持一致
2. **先发布后提交**：依赖文件必须先上传到 Release，用户才能下载
3. **双源备份**：GitHub 和 Gitee 都上传，确保国内用户访问速度
4. **npm 2FA**：务必开启双因素认证，每次发布需要 OTP
5. **权限管理**：主包仓库和依赖仓库需要分别设置协作者权限

---

## 历史版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.10 | 2026-03-04 | 完善发布流程文档 |
| v1.0.9 | - | 上一版本 |

---

*本文档最后更新：2026-03-04*

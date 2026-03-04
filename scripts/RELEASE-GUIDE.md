# 依赖发布指南

本指南说明如何将大型依赖文件上传到 GitHub/Gitee Releases，并发布 npm 包。

---

## 完整发布流程

### 步骤 1: 更新版本号

修改以下文件中的版本号（示例：从 1.0.9 更新到 1.0.10）：

| 文件 | 修改位置 |
|------|---------|
| `package.json` | `"version": "1.0.10"` |
| `scripts/download-deps.js` | `v1.0.10` in URL |
| `release.bat` | `set VERSION=v1.0.10` |
| `scripts/upload-release.js` | `const VERSION = 'v1.0.10'` |
| `scripts/upload-gitee-release.js` | `const VERSION = 'v1.0.10'` |

### 步骤 2: 更新下载链接

编辑 `scripts/download-deps.js`，更新以下配置：

```javascript
// GitHub Release 地址
const GITHUB_RELEASE_URL = process.env.GYORK_WBOT_GITHUB_MIRROR ||
  'https://github.com/ghn9264/gyork-wbot-deps/releases/download/v1.0.10';

// Gitee Release 地址（备用源）
const GITEE_RELEASE_URL = process.env.GYORK_WBOT_GITEE_MIRROR ||
  'https://gitee.com/ghn9264/gyork-wbot-deps/releases/download/v1.0.10';
```

### 步骤 3: 打包依赖文件

在项目根目录运行：

```bash
node scripts/pack-deps.js
```

这会创建以下文件：
- `ffmpeg-deps.zip` (~60MB)
- `opencv-deps.zip` (~22MB)
- `speech-deps.zip` (~1.5MB)
- `usb-deps.zip` (~54KB)
- `compression-deps.zip` (~80KB)
- `utils-deps.zip` (~3.7MB)
- `tools-exe.zip` (~12MB)

### 步骤 4: 发布到 GitHub Releases

#### 方式一：使用脚本（推荐）

```bash
node scripts/upload-release.js
```

#### 方式二：使用 GitHub CLI

```bash
# 创建 release 并上传文件
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
使用 github mcp 服务器创建 release v1.0.10，上传以下文件：
- ffmpeg-deps.zip
- opencv-deps.zip
- speech-deps.zip
- usb-deps.zip
- compression-deps.zip
- utils-deps.zip
- tools-exe.zip
```

### 步骤 5: 发布到 Gitee Releases

运行脚本自动上传：

```bash
node scripts/upload-gitee-release.js
```

此脚本会：
1. 调用 Gitee API 创建 Release
2. 逐个上传 7 个依赖包
3. 输出下载地址

**注意**：Gitee API Token 已内置在脚本中，如需更换请修改脚本中的 `ACCESS_TOKEN` 变量。

### 步骤 6: 提交代码到 GitHub

```bash
# 添加所有更改
git add package.json scripts/download-deps.js release.bat scripts/upload-release.js scripts/upload-gitee-release.js

# 提交更改
git commit -m "chore: bump version to 1.0.10 and update download URLs"

# 推送到远程仓库
git push origin main
```

远程仓库地址：`git+https://github.com/gyorkluu/gyork-wbot.git`

### 步骤 7: 发布到 npm

```bash
# 登录 npm（如未登录）
npm login

# 发布（需要双因素认证码）
npm publish --otp=XXXXXX
```

**注意**：发布前确保：
- 已登录 npm 账号
- 有双因素认证（2FA）
- 版本号已更新

---

## 快速命令参考

```bash
# 完整发布流程
cd /i/workspace/Nodejs-workspace/bot/gyork-wbot

# 1. 打包依赖
node scripts/pack-deps.js

# 2. 发布到 GitHub
node scripts/upload-release.js

# 3. 发布到 Gitee
node scripts/upload-gitee-release.js

# 4. 提交代码
git add package.json scripts/download-deps.js release.bat scripts/upload-release.js scripts/upload-gitee-release.js
git commit -m "chore: bump version to 1.0.10"
git push origin main

# 5. npm publish
npm publish --otp=XXXXXX
```

---

## 版本更新检查清单

- [ ] 更新 `package.json` 版本号
- [ ] 更新 `scripts/download-deps.js` 中的 URL
- [ ] 更新 `release.bat` 中的 VERSION
- [ ] 更新 `scripts/upload-release.js` 中的 VERSION
- [ ] 更新 `scripts/upload-gitee-release.js` 中的 VERSION
- [ ] 运行 `pack-deps.js` 打包依赖
- [ ] 发布到 GitHub Releases
- [ ] 发布到 Gitee Releases
- [ ] 提交代码到 GitHub
- [ ] 运行 `npm publish`

---

## 验证发布

### GitHub
- 访问: https://github.com/ghn9264/gyork-wbot-deps/releases
- 确认所有 7 个文件已上传

### Gitee
- 访问: https://gitee.com/ghn9264/gyork-wbot-deps/releases
- 确认所有 7 个文件已上传

### npm
- 访问: https://www.npmjs.com/package/gyork-wbot
- 确认版本号已更新

---

## 故障排除

### GitHub 上传失败

**问题**: `gh: command not found`
- **解决**: 安装 GitHub CLI: https://cli.github.com/

**问题**: `401 Bad credentials`
- **解决**: 运行 `gh auth login` 重新登录

### Gitee 上传失败

**问题**: `401 Unauthorized`
- **解决**: Token 可能已过期，需要更新 `upload-gitee-release.js` 中的 `ACCESS_TOKEN`

**问题**: 上传超时（大文件）
- **解决**: Gitee 对附件大小有限制（通常 100MB），检查文件大小

### npm publish 失败

**问题**: `EOTP` 需要一次性密码
- **解决**: 提供 `--otp=XXXXXX` 参数

**问题**: `E429 Too Many Requests`
- **解决**: 等待 5-10 分钟后重试

**问题**: `E403 Forbidden`
- **解决**: 检查是否有发布权限，或版本号是否已存在

---

## 文件大小参考

| 文件 | 大小 |
|------|------|
| ffmpeg-deps.zip | ~60 MB |
| opencv-deps.zip | ~22 MB |
| tools-exe.zip | ~12 MB |
| utils-deps.zip | ~3.7 MB |
| speech-deps.zip | ~1.5 MB |
| compression-deps.zip | ~80 KB |
| usb-deps.zip | ~54 KB |
| **总计** | ~99.3 MB |

---

## 相关链接

- **GitHub Release**: https://github.com/ghn9264/gyork-wbot-deps/releases
- **Gitee Release**: https://gitee.com/ghn9264/gyork-wbot-deps/releases
- **npm 包**: https://www.npmjs.com/package/gyork-wbot
- **源码仓库**: git+https://github.com/gyorkluu/gyork-wbot.git
- **Gitee API 文档**: https://gitee.com/api/v5/swagger

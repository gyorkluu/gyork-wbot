# gyork-wbot Release 发布指南

本文档说明如何将依赖包发布到 GitHub 和 Gitee Releases。

---

## 准备工作

1. 确保所有依赖包已打包：
   ```bash
   node scripts/pack-deps.js
   ```

2. 确认以下文件存在（共7个）：
   - `ffmpeg-deps.zip`
   - `opencv-deps.zip`
   - `speech-deps.zip`
   - `usb-deps.zip`
   - `compression-deps.zip`
   - `utils-deps.zip`
   - `tools-exe.zip`

---

## 方式一：全自动发布（推荐）

运行 release 脚本：

```bash
# Windows
release.bat

# 或手动执行 Node 脚本
node scripts/pack-deps.js
node scripts/upload-release.js
node scripts/upload-gitee-release.js
```

---

## 方式二：分步发布

### 1. 打包依赖

```bash
node scripts/pack-deps.js
```

### 2. 发布到 GitHub（使用 MCP 服务器）

#### 前提条件
- 已安装 GitHub CLI (`gh`)
- 已登录 GitHub: `gh auth login`
- 已配置 MCP 服务器（通常已内置）

#### 使用 MCP 服务器发布

通过 Claude Code 的自然语言指令：

```
使用 github mcp 服务器创建 release v1.0.9，上传以下文件：
- ffmpeg-deps.zip
- opencv-deps.zip
- speech-deps.zip
- usb-deps.zip
- compression-deps.zip
- utils-deps.zip
- tools-exe.zip
```

或使用脚本方式（无需 MCP）：

```bash
node scripts/upload-release.js
```

此脚本会：
1. 检查 gh CLI 是否可用
2. 自动创建 GitHub Release
3. 上传所有依赖包

### 3. 发布到 Gitee（使用 Node.js 脚本）

```bash
node scripts/upload-gitee-release.js
```

此脚本会：
1. 调用 Gitee API 创建 Release
2. 逐个上传 7 个依赖包
3. 输出下载地址

**注意**：Gitee API Token 已内置在脚本中（`ACCESS_TOKEN`），如需更换请修改脚本中的 `ACCESS_TOKEN` 变量。

---

## 版本号管理

发布前需要统一修改版本号，涉及以下文件：

| 文件 | 修改位置 |
|------|---------|
| `release.bat` | 第9行: `set VERSION=v1.0.9` |
| `scripts/upload-release.js` | 第12行: `const VERSION = 'v1.0.9'` |
| `scripts/upload-gitee-release.js` | 第13行: `const VERSION = 'v1.0.9'` |

**建议**：统一搜索替换 `v1.0.9` 为新版本号。

---

## 验证发布

### GitHub
- 访问: https://github.com/ghn9264/gyork-wbot-deps/releases
- 确认所有 7 个文件已上传

### Gitee
- 访问: https://gitee.com/ghn9264/gyork-wbot-deps/releases
- 确认所有 7 个文件已上传

---

## 故障排除

### GitHub 上传失败

**问题**: `gh: command not found`
- **解决**: 安装 GitHub CLI: https://cli.github.com/

**问题**: `401 Bad credentials`
- **解决**: 运行 `gh auth login` 重新登录

**问题**: `403 Resource not accessible`
- **解决**: 检查是否有仓库写入权限

### Gitee 上传失败

**问题**: `401 Unauthorized`
- **解决**: Token 可能已过期，需要更新 `scripts/upload-gitee-release.js` 中的 `ACCESS_TOKEN`

**问题**: `422 Validation Failed`
- **解决**: Release 版本号可能已存在，检查是否需要更新版本号

**问题**: 上传超时（大文件）
- **解决**: Gitee 对附件大小有限制（通常 100MB），检查文件大小

---

## 快速命令参考

```bash
# 完整发布流程
cd /i/workspace/Nodejs-workspace/bot/gyork-wbot
node scripts/pack-deps.js
node scripts/upload-release.js
node scripts/upload-gitee-release.js

# 仅发布 GitHub
node scripts/upload-release.js

# 仅发布 Gitee
node scripts/upload-gitee-release.js

# Windows 一键发布
release.bat
```

---

## 相关链接

- GitHub Release: https://github.com/ghn9264/gyork-wbot-deps/releases
- Gitee Release: https://gitee.com/ghn9264/gyork-wbot-deps/releases
- Gitee API 文档: https://gitee.com/api/v5/swagger

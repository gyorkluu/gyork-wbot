# 依赖发布指南

本指南说明如何将大型依赖文件上传到 GitHub/Gitee Releases，以便用户安装时自动下载。

## 步骤 1: 创建发布仓库

### GitHub
1. 访问 https://github.com/new
2. 创建新仓库，命名为 `gyork-wbot-deps`
3. 不要添加 README、.gitignore 或 license（保持空仓库）

### Gitee（国内备用源）
1. 访问 https://gitee.com/projects/new
2. 创建新仓库，命名为 `gyork-wbot-deps`
3. 同样保持空仓库

## 步骤 2: 准备依赖文件

在项目根目录运行以下命令打包依赖：

```bash
# Windows PowerShell
# 创建 FFmpeg 依赖包
Compress-Archive -Path avcodec-61.dll,avfilter-10.dll,avformat-61.dll,avutil-59.dll,swscale-8.dll,swresample-5.dll,postproc-58.dll -DestinationPath ffmpeg-deps.zip

# 创建 OpenCV 依赖包
Compress-Archive -Path opencv_world470.dll -DestinationPath opencv-deps.zip

# 或者使用 7-Zip（如果已安装）
7z a ffmpeg-deps.zip avcodec-61.dll avfilter-10.dll avformat-61.dll avutil-59.dll swscale-8.dll swresample-5.dll postproc-58.dll
7z a opencv-deps.zip opencv_world470.dll
```

## 步骤 3: 上传到 GitHub Releases

### 使用 GitHub Web 界面
1. 进入 `gyork-wbot-deps` 仓库
2. 点击 "Releases" → "Create a new release"
3. 填写 Tag version: `v1.0.0`
4. 填写 Release title: `v1.0.0`
5. 拖拽上传 `ffmpeg-deps.zip` 和 `opencv-deps.zip`
6. 点击 "Publish release"

### 使用 GitHub CLI（推荐）
```bash
# 安装 GitHub CLI
# Windows: winget install GitHub.cli
# macOS: brew install gh
# Linux: sudo apt install gh

# 登录
gh auth login

# 创建 release 并上传文件
gh release create v1.0.0 \
  ./ffmpeg-deps.zip \
  ./opencv-deps.zip \
  --repo gyorkluu/gyork-wbot-deps \
  --title "v1.0.0" \
  --notes "gyork-wbot dependencies"
```

## 步骤 4: 上传到 Gitee Releases

1. 进入 Gitee 的 `gyork-wbot-deps` 仓库
2. 点击 "发行版" → "创建发行版"
3. 填写标签: `v1.0.0`
4. 上传 `ffmpeg-deps.zip` 和 `opencv-deps.zip`
5. 点击 "创建发行版"

## 步骤 5: 更新下载脚本中的 URL

编辑 `scripts/download-deps.js`，更新以下配置：

```javascript
// GitHub Release 地址
const GITHUB_RELEASE_URL = 'https://github.com/gyorkluu/gyork-wbot-deps/releases/download/v1.0.0';

// Gitee Release 地址
const GITEE_RELEASE_URL = 'https://gitee.com/gyorkluu/gyork-wbot-deps/releases/download/v1.0.0';
```

## 步骤 6: 验证下载链接

确保以下 URL 可访问：

### GitHub
- https://github.com/gyorkluu/gyork-wbot-deps/releases/download/v1.0.0/ffmpeg-deps.zip
- https://github.com/gyorkluu/gyork-wbot-deps/releases/download/v1.0.0/opencv-deps.zip

### Gitee
- https://gitee.com/gyorkluu/gyork-wbot-deps/releases/download/v1.0.0/ffmpeg-deps.zip
- https://gitee.com/gyorkluu/gyork-wbot-deps/releases/download/v1.0.0/opencv-deps.zip

## 版本更新流程

当需要更新依赖文件时：

1. 打包新版本的依赖文件
2. 创建新的 Release（如 `v1.0.1`）
3. 更新 `scripts/download-deps.js` 中的 URL
4. 更新 `package.json` 中的版本号
5. 重新发布 npm 包

## 文件大小参考

| 文件 | 大小 |
|------|------|
| ffmpeg-deps.zip | ~150 MB |
| opencv-deps.zip | ~61 MB |
| **总计** | ~211 MB |

## 注意事项

1. **GitHub Release 限制**: 单文件最大 2GB，总大小无限制
2. **Gitee Release 限制**: 单文件最大 100MB，超过需要使用 Gitee 的其他存储方案
3. 如果文件超过 100MB，考虑：
   - 使用 GitHub + Gitee 双源
   - 使用阿里云 OSS、腾讯云 COS 等对象存储
   - 使用 jsDelivr 等 CDN 加速

## 使用 CDN 加速（可选）

如果 GitHub 下载速度慢，可以使用 jsDelivr 加速：

```javascript
// jsDelivr CDN 加速
const JSDELIVR_URL = 'https://cdn.jsdelivr.net/gh/gyorkluu/gyork-wbot-deps@v1.0.0';
```

将文件推送到仓库的普通目录（非 Release），jsDelivr 会自动缓存。
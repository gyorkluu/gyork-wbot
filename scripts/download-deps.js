#!/usr/bin/env node

/**
 * gyork-wbot 依赖下载脚本
 * 自动下载大型依赖文件（FFmpeg、OpenCV 等）
 * 支持 GitHub/Gitee 双源，超时自动切换
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ============================================================
// 配置区域 - 请根据实际情况修改
// ============================================================

// GitHub Release 地址
const GITHUB_RELEASE_URL = process.env.GYORK_WBOT_GITHUB_MIRROR ||
  'https://github.com/ghn9264/gyork-wbot/releases/download/v1.0.0';

// Gitee Release 地址（备用源）
const GITEE_RELEASE_URL = process.env.GYORK_WBOT_GITEE_MIRROR ||
  'https://gitee.com/ghn9264/gyork-wbot/releases/download/v1.0.0';

// 自定义镜像源（优先级最高）
const CUSTOM_MIRROR_URL = process.env.GYORK_WBOT_MIRROR;

// 下载超时时间（毫秒）
const DOWNLOAD_TIMEOUT = 30000; // 30秒超时

// 下载重试次数
const MAX_RETRIES = 3;

// ============================================================
// 依赖配置
// ============================================================

const DEPS_DIR = path.join(__dirname, '..'); // 包根目录

// 需要下载的文件列表
const DEPS_FILES = [
  // FFmpeg DLLs (~150MB)
  'avcodec-61.dll',
  'avfilter-10.dll',
  'avformat-61.dll',
  'avutil-59.dll',
  'swscale-8.dll',
  'swresample-5.dll',
  'postproc-58.dll',
  // OpenCV (~61MB)
  'opencv_world470.dll',
  // Speech (~3.5MB)
  'Microsoft.CognitiveServices.Speech.core.dll',
  'SDL2.dll',
  // USB (~114KB)
  'libusb-1.0.dll',
  // Compression (~150KB)
  'zip.dll',
  // Utils (~10MB)
  'libcurl.dll',
  'libxl64.dll',
  'WindowsAccessBridge-64.dll',
  // Tools (~14MB)
  'WindowsDriver.exe',
  'WindowsTool.exe',
];

// 打包下载配置（推荐：将大文件打包成 zip）
const ASSETS_CONFIG = {
  // 方案一：打包下载（推荐，减少请求数）
  packages: [
    {
      name: 'ffmpeg-deps.zip',
      files: [
        'avcodec-61.dll',
        'avfilter-10.dll',
        'avformat-61.dll',
        'avutil-59.dll',
        'swscale-8.dll',
        'swresample-5.dll',
        'postproc-58.dll',
      ],
      description: 'FFmpeg 运行时库',
    },
    {
      name: 'opencv-deps.zip',
      files: ['opencv_world470.dll'],
      description: 'OpenCV 运行时库',
    },
    {
      name: 'speech-deps.zip',
      files: [
        'Microsoft.CognitiveServices.Speech.core.dll',
        'SDL2.dll',
      ],
      description: '语音服务运行时库',
    },
    {
      name: 'usb-deps.zip',
      files: ['libusb-1.0.dll'],
      description: 'USB 设备支持库',
    },
    {
      name: 'compression-deps.zip',
      files: ['zip.dll'],
      description: '压缩解压库',
    },
    {
      name: 'utils-deps.zip',
      files: [
        'libcurl.dll',
        'libxl64.dll',
        'WindowsAccessBridge-64.dll',
      ],
      description: '工具库',
    },
    {
      name: 'tools-exe.zip',
      files: [
        'WindowsDriver.exe',
        'WindowsTool.exe',
      ],
      description: 'Windows 工具程序',
    },
  ],
};

// ============================================================
// 工具函数
// ============================================================

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 检查文件是否存在
 */
function checkFileExists(filename) {
  const filePath = path.join(DEPS_DIR, filename);
  return fs.existsSync(filePath);
}

/**
 * 获取文件大小
 */
function getFileSize(filename) {
  const filePath = path.join(DEPS_DIR, filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return stats.size;
  }
  return 0;
}

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============================================================
// 下载器
// ============================================================

/**
 * 下载文件（支持超时和重定向）
 */
function downloadFile(url, dest, options = {}) {
  return new Promise((resolve, reject) => {
    const { timeout = DOWNLOAD_TIMEOUT, onProgress } = options;

    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const request = client.get(url, {
      timeout,
      headers: {
        'User-Agent': 'gyork-wbot-installer/1.0.0',
        'Accept': '*/*',
      },
    }, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, dest, options).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10) || 0;
      let downloaded = 0;
      let lastPercent = 0;

      const file = fs.createWriteStream(dest);

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (totalSize > 0 && onProgress) {
          const percent = Math.floor((downloaded / totalSize) * 100);
          if (percent !== lastPercent) {
            lastPercent = percent;
            onProgress(percent, downloaded, totalSize);
          }
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve({ size: downloaded, path: dest });
      });

      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`下载超时 (${timeout / 1000}s)`));
    });
  });
}

/**
 * 带重试的下载
 */
async function downloadWithRetry(url, dest, options = {}) {
  const { retries = MAX_RETRIES, onProgress, source } = options;

  for (let i = 0; i < retries; i++) {
    try {
      if (i > 0) {
        console.log(`  第 ${i + 1} 次重试...`);
      }
      return await downloadFile(url, dest, { onProgress });
    } catch (err) {
      if (i === retries - 1) {
        throw err;
      }
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/**
 * 从多个源尝试下载
 */
async function downloadFromSources(filename, dest, options = {}) {
  const sources = [];

  // 构建源列表
  if (CUSTOM_MIRROR_URL) {
    sources.push({ name: 'Custom Mirror', url: `${CUSTOM_MIRROR_URL}/${filename}` });
  }
  sources.push({ name: 'GitHub', url: `${GITHUB_RELEASE_URL}/${filename}` });
  sources.push({ name: 'Gitee', url: `${GITEE_RELEASE_URL}/${filename}` });

  let lastError = null;

  for (const source of sources) {
    console.log(`\n  尝试从 ${source.name} 下载...`);
    console.log(`  URL: ${source.url}`);

    try {
      const result = await downloadWithRetry(source.url, dest, {
        ...options,
        source: source.name,
        onProgress: (percent, downloaded, total) => {
          process.stdout.write(`\r  下载进度: ${percent}% (${formatSize(downloaded)}/${formatSize(total)})`);
        },
      });
      console.log('\n');
      return result;
    } catch (err) {
      console.log(`\n  ❌ ${source.name} 下载失败: ${err.message}`);
      lastError = err;

      // 删除可能的部分下载文件
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
    }
  }

  throw lastError || new Error('所有下载源均失败');
}

// ============================================================
// 解压工具（纯 JS 实现，无需外部依赖）
// ============================================================

/**
 * 解压 ZIP 文件（使用内置模块，避免额外依赖）
 * 注意：这是一个简化版本，对于复杂 ZIP 可能需要 adm-zip 等库
 */
async function extractZip(zipPath, destDir) {
  // 检查是否有 adm-zip 可用（作为可选依赖）
  try {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(destDir, true);
    return true;
  } catch (err) {
    // adm-zip 不可用，尝试其他方式
  }

  // 尝试使用系统 unzip 命令（Linux/macOS）
  try {
    const { execSync } = require('child_process');
    if (process.platform !== 'win32') {
      execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: 'pipe' });
      return true;
    }
  } catch (err) {
    // unzip 命令不可用
  }

  // Windows: 尝试使用 PowerShell
  if (process.platform === 'win32') {
    try {
      const { execSync } = require('child_process');
      const psCmd = `Expand-Archive -Path "${zipPath}" -DestinationPath "${destDir}" -Force`;
      execSync(`powershell -Command "${psCmd}"`, { stdio: 'pipe' });
      return true;
    } catch (err) {
      // PowerShell 不可用
    }
  }

  throw new Error('无法解压 ZIP 文件，请安装 adm-zip 或使用系统解压工具');
}

// ============================================================
// 主逻辑
// ============================================================

/**
 * 检查并下载依赖
 */
async function checkAndDownload() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     gyork-wbot 依赖安装程序 v1.0.0        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // 检查哪些文件缺失
  const missingFiles = DEPS_FILES.filter(f => !checkFileExists(f));
  const existingFiles = DEPS_FILES.filter(f => checkFileExists(f));

  if (existingFiles.length > 0) {
    console.log('✅ 已存在的依赖文件:');
    existingFiles.forEach(f => {
      console.log(`   ${f} (${formatSize(getFileSize(f))})`);
    });
    console.log('');
  }

  if (missingFiles.length === 0) {
    console.log('✅ 所有依赖已就绪，无需下载!\n');
    return;
  }

  console.log('⚠️  缺失以下依赖文件:');
  missingFiles.forEach(f => console.log(`   ${f}`));
  console.log('\n📦 开始下载依赖...\n');

  // 计算需要下载哪些包
  const neededPackages = ASSETS_CONFIG.packages.filter(pkg =>
    pkg.files.some(f => missingFiles.includes(f))
  );

  // 下载并解压
  for (const pkg of neededPackages) {
    console.log(`\n📥 下载 ${pkg.name} (${pkg.description})...`);

    const zipPath = path.join(DEPS_DIR, pkg.name);

    try {
      await downloadFromSources(pkg.name, zipPath);

      console.log(`📂 解压 ${pkg.name}...`);
      await extractZip(zipPath, DEPS_DIR);

      // 删除 zip 文件
      fs.unlinkSync(zipPath);

      console.log(`✅ ${pkg.name} 安装完成`);
    } catch (err) {
      console.error(`❌ 安装 ${pkg.name} 失败: ${err.message}`);
      console.error('\n请尝试手动下载:');
      console.error(`  GitHub: ${GITHUB_RELEASE_URL}/${pkg.name}`);
      console.error(`  Gitee:  ${GITEE_RELEASE_URL}/${pkg.name}`);
      console.error(`  解压到: ${DEPS_DIR}`);

      // 继续安装其他包
    }
  }

  // 最终检查
  console.log('\n' + '─'.repeat(50));
  console.log('📋 依赖安装结果:\n');

  const stillMissing = DEPS_FILES.filter(f => !checkFileExists(f));
  const nowHave = DEPS_FILES.filter(f => checkFileExists(f));

  if (nowHave.length > 0) {
    console.log('✅ 已安装:');
    nowHave.forEach(f => console.log(`   ${f}`));
  }

  if (stillMissing.length > 0) {
    console.log('\n❌ 仍缺失:');
    stillMissing.forEach(f => console.log(`   ${f}`));
    console.log('\n请手动下载或检查网络连接后重试。');
    process.exit(1);
  }

  console.log('\n🎉 所有依赖安装完成!\n');
}

/**
 * 仅检查模式（不自动下载）
 */
function checkOnly() {
  console.log('=== gyork-wbot 依赖检查 ===\n');

  const missingFiles = DEPS_FILES.filter(f => !checkFileExists(f));

  if (missingFiles.length === 0) {
    console.log('✅ 所有依赖已安装\n');
    return;
  }

  console.log('⚠️  缺失以下依赖文件:');
  missingFiles.forEach(f => console.log(`   ${f}`));

  console.log('\n📦 请运行以下命令安装依赖:');
  console.log('   npx gyork-wbot-install\n');

  console.log('或设置镜像源后安装:');
  console.log('   set GYORK_WBOT_MIRROR=https://your-mirror.com');
  console.log('   npx gyork-wbot-install\n');

  console.log('手动下载地址:');
  console.log(`  GitHub: ${GITHUB_RELEASE_URL}`);
  console.log(`  Gitee:  ${GITEE_RELEASE_URL}`);
}

// ============================================================
// 入口
// ============================================================

const args = process.argv.slice(2);
const checkMode = args.includes('--check') || args.includes('-c');

if (checkMode) {
  checkOnly();
} else {
  checkAndDownload().catch(err => {
    console.error('\n❌ 安装过程出错:', err.message);
    process.exit(1);
  });
}
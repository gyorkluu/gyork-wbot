#!/usr/bin/env node

/**
 * 上传依赖包到 GitHub 和 Gitee Releases
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const VERSION = 'v1.0.0';

const FILES = [
  'ffmpeg-deps.zip',
  'opencv-deps.zip',
  'speech-deps.zip',
  'usb-deps.zip',
  'compression-deps.zip',
  'utils-deps.zip',
  'tools-exe.zip',
];

// GitHub 配置
const GITHUB_REPO = 'ghn9264/gyork-wbot-deps';
const GITHUB_URL = `https://github.com/${GITHUB_REPO}/releases/download/${VERSION}`;

// Gitee 配置
const GITEE_REPO = 'ghn9264/gyork-wbot-deps';
const GITEE_URL = `https://gitee.com/${GITEE_REPO}/releases/download/${VERSION}`;

function exec(cmd, options = {}) {
  console.log(`> ${cmd}`);
  try {
    return execSync(cmd, { stdio: 'inherit', ...options });
  } catch (err) {
    console.error(`❌ 命令失败: ${err.message}`);
    throw err;
  }
}

function uploadToGitHub() {
  console.log('\n=== 上传到 GitHub Releases ===\n');
  
  // 检查是否已存在 release
  try {
    execSync(`gh release view ${VERSION} --repo ${GITHUB_REPO}`, { stdio: 'pipe' });
    console.log(`⚠️ GitHub Release ${VERSION} 已存在，将上传资源到现有 release`);
  } catch {
    // release 不存在，创建新的
    console.log(`📝 创建 GitHub Release ${VERSION}...`);
    exec(`gh release create ${VERSION} --repo ${GITHUB_REPO} --title "${VERSION} Dependencies" --notes "gyork-wbot runtime dependencies"`, {
      cwd: ROOT_DIR,
    });
  }

  // 上传文件
  for (const file of FILES) {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      console.log(`\n📤 上传 ${file}...`);
      try {
        exec(`gh release upload ${VERSION} "${file}" --repo ${GITHUB_REPO} --clobber`, {
          cwd: ROOT_DIR,
        });
        console.log(`✅ ${file} 上传成功`);
        console.log(`   URL: ${GITHUB_URL}/${file}`);
      } catch (err) {
        console.error(`❌ ${file} 上传失败: ${err.message}`);
      }
    } else {
      console.error(`❌ ${file} 不存在`);
    }
  }
}

function printDownloadUrls() {
  console.log('\n=== 下载地址 ===\n');
  
  console.log('GitHub URLs:');
  for (const file of FILES) {
    console.log(`  ${GITHUB_URL}/${file}`);
  }
  
  console.log('\nGitee URLs:');
  for (const file of FILES) {
    console.log(`  ${GITEE_URL}/${file}`);
  }
  
  console.log('\n=== 更新 download-deps.js ===\n');
  console.log('请将以下配置复制到 scripts/download-deps.js 中:\n');
  
  const config = {
    version: VERSION,
    baseUrl: GITHUB_URL,
    files: FILES,
  };
  
  console.log('const DEPENDENCIES_CONFIG = ' + JSON.stringify(config, null, 2) + ';');
}

function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     gyork-wbot 依赖上传工具               ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // 检查文件是否存在
  console.log('=== 检查文件 ===\n');
  let allExist = true;
  for (const file of FILES) {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  ✅ ${file} (${sizeMB} MB)`);
    } else {
      console.log(`  ❌ ${file} (缺失)`);
      allExist = false;
    }
  }

  if (!allExist) {
    console.error('\n❌ 部分文件缺失，请先运行 pack-deps.js 打包');
    process.exit(1);
  }

  // 上传到 GitHub
  try {
    uploadToGitHub();
  } catch (err) {
    console.error('\n❌ GitHub 上传失败:', err.message);
  }

  // 打印下载地址
  printDownloadUrls();

  console.log('\n=== 完成 ===\n');
  console.log('⚠️ 注意: Gitee 需要手动上传，请访问:');
  console.log(`  https://gitee.com/${GITEE_REPO}/releases`);
}

main();

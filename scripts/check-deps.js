#!/usr/bin/env node
// @ts-check

/**
 * gyork-wbot 依赖状态检查工具
 * 快速检查所有依赖是否正确安装
 */

const fs = require('fs');
const path = require('path');

const DEPS_DIR = path.join(__dirname, '..');

// 必需的依赖文件
const REQUIRED_FILES = {
  // 核心 DLL（必须随包发布）
  core: [
    { name: 'WindowsDriver.exe', size: '~11 MB', required: true },
    { name: 'WindowsTool.exe', size: '~4 MB', required: true },
    { name: 'WindowsAccessBridge-64.dll', size: '~192 KB', required: true },
  ],
  // 可选但推荐
  optional: [
    { name: 'libxl64.dll', size: '~7.6 MB', required: false },
    { name: 'libcurl.dll', size: '~2.7 MB', required: false },
    { name: 'Microsoft.CognitiveServices.Speech.core.dll', size: '~2.1 MB', required: false },
    { name: 'SDL2.dll', size: '~1.6 MB', required: false },
    { name: 'zip.dll', size: '~152 KB', required: false },
    { name: 'libusb-1.0.dll', size: '~116 KB', required: false },
  ],
  // 大型依赖（通过下载获取）
  downloadable: [
    { name: 'avcodec-61.dll', size: '~86 MB', required: false },
    { name: 'avfilter-10.dll', size: '~40 MB', required: false },
    { name: 'avformat-61.dll', size: '~18 MB', required: false },
    { name: 'avutil-59.dll', size: '~2.7 MB', required: false },
    { name: 'swscale-8.dll', size: '~692 KB', required: false },
    { name: 'swresample-5.dll', size: '~432 KB', required: false },
    { name: 'postproc-58.dll', size: '~88 KB', required: false },
    { name: 'opencv_world470.dll', size: '~61 MB', required: false },
  ],
};

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getFileSize(filename) {
  const filePath = path.join(DEPS_DIR, filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return stats.size;
  }
  return 0;
}

function checkFiles(category, files) {
  const results = [];
  for (const file of files) {
    const size = getFileSize(file.name);
    results.push({
      ...file,
      exists: size > 0,
      actualSize: size,
    });
  }
  return results;
}

function printResults(category, results) {
  console.log(`\n${category}:`);
  console.log('─'.repeat(50));

  for (const file of results) {
    const status = file.exists ? '✅' : (file.required ? '❌' : '⚠️ ');
    const sizeInfo = file.exists
      ? formatSize(file.actualSize)
      : `缺失 (${file.size})`;
    console.log(`${status} ${file.name.padEnd(35)} ${sizeInfo}`);
  }
}

function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     gyork-wbot 依赖状态检查器             ║');
  console.log('╚════════════════════════════════════════════╝');

  let hasErrors = false;
  let hasWarnings = false;

  // 检查核心文件
  const coreResults = checkFiles('核心文件', REQUIRED_FILES.core);
  printResults('核心文件 (必需)', coreResults);

  if (coreResults.some(r => r.required && !r.exists)) {
    hasErrors = true;
  }

  // 检查可选文件
  const optionalResults = checkFiles('可选文件', REQUIRED_FILES.optional);
  printResults('可选文件', optionalResults);

  // 检查可下载文件
  const downloadableResults = checkFiles('下载依赖', REQUIRED_FILES.downloadable);
  printResults('下载依赖 (FFmpeg/OpenCV)', downloadableResults);

  const missingDownloadable = downloadableResults.filter(r => !r.exists);
  if (missingDownloadable.length > 0) {
    hasWarnings = true;
  }

  // 总结
  console.log('\n' + '═'.repeat(50));
  console.log('📋 检查结果:\n');

  if (!hasErrors && !hasWarnings) {
    console.log('✅ 所有依赖已正确安装!');
    console.log('   gyork-wbot 可以正常使用。\n');
  } else if (hasErrors) {
    console.log('❌ 核心依赖缺失，包可能已损坏。');
    console.log('   请重新安装 gyork-wbot。\n');
    process.exit(1);
  } else {
    console.log('⚠️  部分可选依赖缺失。');
    console.log('   运行以下命令安装:');
    console.log('   npx gyork-wbot-install\n');

    console.log('或使用环境变量配置镜像源:');
    console.log('   # 使用 GitHub 镜像');
    console.log('   set GYORK_WBOT_GITHUB_MIRROR=https://your-mirror.com');
    console.log('   ');
    console.log('   # 使用 Gitee 镜像（国内推荐）');
    console.log('   set GYORK_WBOT_GITEE_MIRROR=https://gitee-mirror.com');
    console.log('   ');
    console.log('   # 使用自定义镜像');
    console.log('   set GYORK_WBOT_MIRROR=https://your-custom-mirror.com\n');
  }

  // 显示已安装文件的总大小
  const allResults = [...coreResults, ...optionalResults, ...downloadableResults];
  const totalSize = allResults.reduce((sum, r) => sum + r.actualSize, 0);
  console.log(`📊 已安装文件总大小: ${formatSize(totalSize)}\n`);
}

main();
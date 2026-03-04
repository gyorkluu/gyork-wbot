#!/usr/bin/env node

/**
 * 打包依赖文件脚本
 * 将大型 DLL/EXE 文件打包成 zip，用于上传到 GitHub/Gitee Releases
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

// 需要打包的依赖配置
const PACKAGES = [
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
];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getFileSize(filename) {
  const filePath = path.join(ROOT_DIR, filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return stats.size;
  }
  return 0;
}

function checkDependencies() {
  console.log('=== 检查依赖文件 ===\n');

  let allExist = true;
  let totalSize = 0;

  for (const pkg of PACKAGES) {
    console.log(`📦 ${pkg.name} (${pkg.description}):`);
    for (const file of pkg.files) {
      const size = getFileSize(file);
      if (size > 0) {
        console.log(`   ✅ ${file} (${formatSize(size)})`);
        totalSize += size;
      } else {
        console.log(`   ❌ ${file} (缺失)`);
        allExist = false;
      }
    }
    console.log('');
  }

  console.log(`📊 总大小: ${formatSize(totalSize)}\n`);

  return allExist;
}

function createZipWithPowerShell(zipName, files) {
  const filesList = files.map(f => `"${f}"`).join(',');
  const cmd = `Compress-Archive -Path ${filesList} -DestinationPath "${zipName}" -Force`;
  execSync(`powershell -Command "${cmd}"`, { cwd: ROOT_DIR, stdio: 'inherit' });
}

function createZipWith7Zip(zipName, files) {
  const filesList = files.join(' ');
  const cmd = `7z a -tzip "${zipName}" ${filesList}`;
  execSync(cmd, { cwd: ROOT_DIR, stdio: 'inherit' });
}

function createZip(zipName, files) {
  const zipPath = path.join(ROOT_DIR, zipName);

  // 删除已存在的 zip
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  console.log(`\n📦 创建 ${zipName}...`);

  // 尝试使用 7-Zip
  try {
    execSync('7z --help', { stdio: 'pipe' });
    createZipWith7Zip(zipName, files);
    return true;
  } catch (err) {
    // 7-Zip 不可用
  }

  // 使用 PowerShell
  try {
    createZipWithPowerShell(zipName, files);
    return true;
  } catch (err) {
    console.error(`❌ 创建 ${zipName} 失败: ${err.message}`);
    return false;
  }
}

function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     gyork-wbot 依赖打包工具               ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // 检查依赖文件
  const allExist = checkDependencies();

  if (!allExist) {
    console.log('❌ 部分依赖文件缺失，无法打包。');
    process.exit(1);
  }

  // 创建 zip 包
  console.log('=== 开始打包 ===');

  const created = [];

  for (const pkg of PACKAGES) {
    const success = createZip(pkg.name, pkg.files);
    if (success) {
      const size = getFileSize(pkg.name);
      console.log(`✅ ${pkg.name} 创建成功 (${formatSize(size)})`);
      created.push(pkg.name);
    }
  }

  // 输出结果
  console.log('\n' + '═'.repeat(50));
  console.log('📋 打包结果:\n');

  if (created.length > 0) {
    console.log('✅ 已创建以下文件:\n');
    for (const name of created) {
      const size = getFileSize(name);
      console.log(`   ${name} (${formatSize(size)})`);
    }

    console.log('\n📤 上传到 GitHub Releases:');
    console.log('   gh release create v1.0.0 \\');
    for (const name of created) {
      console.log(`     ./${name} \\`);
    }
    console.log('     --repo YOUR_USERNAME/gyork-wbot-deps \\');
    console.log('     --title "v1.0.0" \\');
    console.log('     --notes "gyork-wbot dependencies"');

    console.log('\n💡 提示: 记得更新 scripts/download-deps.js 中的下载 URL');
  } else {
    console.log('❌ 没有创建任何文件。');
    process.exit(1);
  }
}

main();

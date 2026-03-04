#!/usr/bin/env node

/**
 * 上传依赖包到 Gitee Releases
 * 使用 Gitee API: https://gitee.com/api/v5/swagger#/postV5ReposOwnerRepoReleases
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const VERSION = 'v1.0.10';
const ACCESS_TOKEN = '7af51a632876ee9b2d60329a8eab8a33';
const OWNER = 'ghn9264';
const REPO = 'gyork-wbot-deps';

const FILES = [
  'ffmpeg-deps.zip',
  'opencv-deps.zip',
  'speech-deps.zip',
  'usb-deps.zip',
  'compression-deps.zip',
  'utils-deps.zip',
  'tools-exe.zip',
];

// 使用 Promise 包装 http 请求
function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// 创建 Release
async function createRelease() {
  console.log(`\n📝 创建 Gitee Release ${VERSION}...\n`);

  const postData = JSON.stringify({
    access_token: ACCESS_TOKEN,
    tag_name: VERSION,
    name: `${VERSION} Dependencies`,
    body: 'gyork-wbot runtime dependencies',
    prerelease: false,
    target_commitish: 'main'
  });

  const options = {
    hostname: 'gitee.com',
    port: 443,
    path: `/api/v5/repos/${OWNER}/${REPO}/releases`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  try {
    const result = await request(options, postData);
    console.log(`✅ Release 创建成功!`);
    console.log(`   URL: ${result.html_url}`);
    return result.id;
  } catch (err) {
    // 如果 release 已存在，获取已有 release 的 id
    if (err.message.includes('422') || err.message.includes('已存在')) {
      console.log(`⚠️ Release ${VERSION} 已存在，获取现有 release...`);
      const releases = await getReleases();
      const existingRelease = releases.find(r => r.tag_name === VERSION);
      if (existingRelease) {
        return existingRelease.id;
      }
    }
    throw err;
  }
}

// 获取 Releases 列表
async function getReleases() {
  const options = {
    hostname: 'gitee.com',
    port: 443,
    path: `/api/v5/repos/${OWNER}/${REPO}/releases?access_token=${ACCESS_TOKEN}`,
    method: 'GET'
  };

  return await request(options);
}

// 上传文件到 Release (使用附件上传 API)
async function uploadAsset(releaseId, filePath, fileName) {
  console.log(`\n📤 上传 ${fileName}...`);

  const fileStream = fs.createReadStream(filePath);
  const stats = fs.statSync(filePath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   文件大小: ${sizeMB} MB`);

  // Gitee Release 附件上传 API
  const boundary = '----FormBoundary' + Date.now();

  const preData = Buffer.from([
    `--${boundary}`,
    `Content-Disposition: form-data; name="access_token"`,
    '',
    ACCESS_TOKEN,
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
    `Content-Type: application/zip`,
    ''
  ].join('\r\n') + '\r\n');

  const postData = Buffer.from(`\r\n--${boundary}--\r\n`);
  const fileData = fs.readFileSync(filePath);

  const body = Buffer.concat([preData, fileData, postData]);

  const options = {
    hostname: 'gitee.com',
    port: 443,
    path: `/api/v5/repos/${OWNER}/${REPO}/releases/${releaseId}/attach_files`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ ${fileName} 上传成功`);
            console.log(`   URL: ${json.browser_download_url || json.url}`);
            resolve(json);
          } else {
            console.error(`❌ ${fileName} 上传失败:`, json);
            reject(new Error(JSON.stringify(json)));
          }
        } catch (e) {
          console.log(`Response: ${data}`);
          resolve(data);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ ${fileName} 上传错误:`, err.message);
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

// 主函数
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     Gitee Release 上传工具                 ║');
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

  try {
    // 创建或获取 Release
    const releaseId = await createRelease();
    console.log(`   Release ID: ${releaseId}`);

    // 上传文件
    console.log('\n=== 上传文件到 Gitee ===\n');
    for (const file of FILES) {
      const filePath = path.join(ROOT_DIR, file);
      try {
        await uploadAsset(releaseId, filePath, file);
      } catch (err) {
        console.error(`❌ ${file} 上传失败:`, err.message);
      }
    }

    console.log('\n=== 完成 ===\n');
    console.log(`🎉 Gitee Release ${VERSION} 发布成功!`);
    console.log(`   访问地址: https://gitee.com/${OWNER}/${REPO}/releases/tag/${VERSION}`);

  } catch (err) {
    console.error('\n❌ 发布失败:', err.message);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node

/**
 * gyork-wbot 安装命令行工具
 * 提供友好的命令行接口来安装和检查依赖
 */

const path = require('path');

// 复用下载脚本
require(path.join(__dirname, 'download-deps.js'));
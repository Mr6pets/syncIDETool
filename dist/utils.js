"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.calculateFileHash = calculateFileHash;
exports.formatFileSize = formatFileSize;
exports.ensureDir = ensureDir;
exports.safeJsonParse = safeJsonParse;
exports.fileExists = fileExists;
exports.getFileModTime = getFileModTime;
exports.createBackup = createBackup;
exports.validateConfig = validateConfig;
exports.detectEnvironment = detectEnvironment;
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const crypto_1 = require("crypto");
// 文件哈希计算
function calculateFileHash(filePath) {
    const content = fs_extra_1.default.readFileSync(filePath);
    return (0, crypto_1.createHash)('md5').update(content).digest('hex');
}
// 格式化文件大小
function formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0)
        return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
// 彩色日志输出
exports.logger = {
    info: (message) => console.log(chalk_1.default.blue('ℹ'), message),
    success: (message) => console.log(chalk_1.default.green('✓'), message),
    warning: (message) => console.log(chalk_1.default.yellow('⚠'), message),
    error: (message) => console.log(chalk_1.default.red('✗'), message),
    debug: (message) => {
        if (process.env.DEBUG === 'true') {
            console.log(chalk_1.default.gray('🐛'), message);
        }
    }
};
// 确保目录存在
async function ensureDir(dirPath) {
    await fs_extra_1.default.ensureDir(dirPath);
}
// 安全的JSON解析
function safeJsonParse(jsonString, defaultValue = {}) {
    try {
        return JSON.parse(jsonString);
    }
    catch {
        return defaultValue;
    }
}
// 检查文件是否存在
async function fileExists(filePath) {
    try {
        await fs_extra_1.default.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
// 获取文件修改时间
async function getFileModTime(filePath) {
    const stats = await fs_extra_1.default.stat(filePath);
    return stats.mtime;
}
// 创建备份文件
async function createBackup(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    await fs_extra_1.default.copy(filePath, backupPath);
    return backupPath;
}
// 验证配置文件格式
function validateConfig(config) {
    const errors = [];
    if (!config.storageType) {
        errors.push('缺少存储类型配置');
    }
    if (config.storageType === 'GitHub' && !config.githubToken) {
        errors.push('GitHub存储需要访问令牌');
    }
    if (config.storageType === 'Gitee' && !config.giteeToken) {
        errors.push('Gitee存储需要访问令牌');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
// 环境检测
function detectEnvironment() {
    return {
        os: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        homeDir: require('os').homedir(),
        workingDir: process.cwd()
    };
}

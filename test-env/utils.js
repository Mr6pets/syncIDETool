"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.detectIDEPaths = detectIDEPaths;
exports.openTokenPage = openTokenPage;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const crypto_1 = require("crypto");
// 文件哈希计算
function calculateFileHash(filePath) {
    const content = fs.readFileSync(filePath);
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
    await fs.ensureDir(dirPath);
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
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
// 获取文件修改时间
async function getFileModTime(filePath) {
    const stats = await fs.stat(filePath);
    return stats.mtime;
}
// 创建备份文件
async function createBackup(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    await fs.copy(filePath, backupPath);
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
async function detectIDEPaths() {
    const commonPaths = {
        win32: [
            path.join(os.homedir(), 'AppData/Roaming/trae'),
            path.join(os.homedir(), 'AppData/Local/trae'),
            path.join(os.homedir(), 'AppData/Roaming/trae/extensions')
        ],
        darwin: [
            path.join(os.homedir(), 'Library/Application Support/trae'),
            path.join(os.homedir(), '.trae')
        ],
        linux: [
            path.join(os.homedir(), '.config/trae'),
            path.join(os.homedir(), '.trae')
        ]
    };
    const platform = os.platform();
    const paths = commonPaths[platform] || commonPaths.linux; // 默认使用 linux 路径
    const existingPaths = [];
    for (const p of paths) {
        if (await fs.pathExists(p)) {
            existingPaths.push(p);
        }
    }
    return existingPaths;
}
async function openTokenPage() {
    const { default: open } = await Promise.resolve().then(() => __importStar(require('open')));
    const tokenUrl = 'https://github.com/settings/tokens/new?scopes=gist&description=Trea%20Sync%20Tool';
    console.log('正在为您打开GitHub Token创建页面...');
    await open(tokenUrl);
    console.log('\n请按照以下步骤操作：');
    console.log('1. 确保勾选了 "gist" 权限');
    console.log('2. 点击 "Generate token"');
    console.log('3. 复制生成的token并粘贴到下方\n');
}

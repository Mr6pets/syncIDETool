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
exports.getTreaConfigPath = getTreaConfigPath;
exports.readLocalConfig = readLocalConfig;
exports.encryptConfig = encryptConfig;
exports.decryptConfig = decryptConfig;
exports.saveConfig = saveConfig;
exports.loadConfig = loadConfig;
exports.hasConfig = hasConfig;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const crypto_js_1 = __importDefault(require("crypto-js"));
// 获取 Trea IDE 配置路径（根据实际路径调整）
function getTreaConfigPath() {
    const homeDir = os.homedir();
    // Windows: %USERPROFILE%\AppData\Roaming\Trea\config
    // macOS: ~/Library/Application Support/Trea/config
    // Linux: ~/.config/trea
    if (process.platform === 'win32') {
        return path.join(homeDir, 'AppData', 'Roaming', 'Trea', 'config');
    }
    else if (process.platform === 'darwin') {
        return path.join(homeDir, 'Library', 'Application Support', 'Trea', 'config');
    }
    else {
        return path.join(homeDir, '.config', 'trea');
    }
}
// 读取本地配置
async function readLocalConfig() {
    const configPath = getTreaConfigPath();
    if (!await fs.pathExists(configPath)) {
        throw new Error('Trea 配置目录不存在');
    }
    // 收集所有配置文件
    const configFiles = await fs.readdir(configPath);
    const configData = {};
    for (const file of configFiles) {
        if (file.endsWith('.json') || file.endsWith('.conf')) {
            const content = await fs.readFile(path.join(configPath, file), 'utf-8');
            configData[file] = content;
        }
    }
    return configData;
}
// 加密配置数据
function encryptConfig(data, key) {
    return crypto_js_1.default.AES.encrypt(data, key).toString();
}
// 解密配置数据
function decryptConfig(data, key) {
    const bytes = crypto_js_1.default.AES.decrypt(data, key);
    return bytes.toString(crypto_js_1.default.enc.Utf8);
}
const configPath = path.join(os.homedir(), '.trea-sync-config.json');
async function saveConfig(config) {
    await fs.writeJSON(configPath, config, { spaces: 2 });
}
async function loadConfig() {
    if (await fs.pathExists(configPath)) {
        return await fs.readJSON(configPath);
    }
    throw new Error('请先运行 "trea-sync init" 进行初始化');
}
async function hasConfig() {
    return await fs.pathExists(configPath);
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTreaConfigPath = getTreaConfigPath;
exports.readLocalConfig = readLocalConfig;
exports.encryptConfig = encryptConfig;
exports.decryptConfig = decryptConfig;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const crypto_js_1 = __importDefault(require("crypto-js"));
// 获取 Trea IDE 配置路径（根据实际路径调整）
function getTreaConfigPath() {
    const homeDir = os_1.default.homedir();
    // Windows: %USERPROFILE%\AppData\Roaming\Trea\config
    // macOS: ~/Library/Application Support/Trea/config
    // Linux: ~/.config/trea
    if (process.platform === 'win32') {
        return path_1.default.join(homeDir, 'AppData', 'Roaming', 'Trea', 'config');
    }
    else if (process.platform === 'darwin') {
        return path_1.default.join(homeDir, 'Library', 'Application Support', 'Trea', 'config');
    }
    else {
        return path_1.default.join(homeDir, '.config', 'trea');
    }
}
// 读取本地配置
async function readLocalConfig() {
    const configPath = getTreaConfigPath();
    if (!fs_extra_1.default.existsSync(configPath)) {
        throw new Error('Trea 配置目录不存在');
    }
    // 收集所有配置文件
    const configFiles = await fs_extra_1.default.readdir(configPath);
    const configData = {};
    for (const file of configFiles) {
        if (file.endsWith('.json') || file.endsWith('.conf')) {
            const content = await fs_extra_1.default.readFile(path_1.default.join(configPath, file), 'utf-8');
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

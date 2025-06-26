"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToLocal = saveToLocal;
exports.loadFromLocal = loadFromLocal;
exports.listLocalSyncs = listLocalSyncs;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './sync-storage';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key';
async function saveToLocal(data) {
    await fs_extra_1.default.ensureDir(LOCAL_STORAGE_PATH);
    const timestamp = new Date().toISOString();
    const syncId = `sync-${Date.now()}`;
    const syncPath = path_1.default.join(LOCAL_STORAGE_PATH, syncId);
    await fs_extra_1.default.ensureDir(syncPath);
    // 保存元数据
    const metadata = {
        timestamp,
        syncId,
        fileCount: Object.keys(data).length
    };
    await fs_extra_1.default.writeJson(path_1.default.join(syncPath, 'metadata.json'), metadata);
    // 保存配置文件
    for (const [filename, content] of Object.entries(data)) {
        const encrypted = (0, config_1.encryptConfig)(content, ENCRYPTION_KEY);
        await fs_extra_1.default.writeFile(path_1.default.join(syncPath, filename), encrypted);
    }
    // 更新最新同步记录
    await fs_extra_1.default.writeFile(path_1.default.join(LOCAL_STORAGE_PATH, 'latest.txt'), syncId);
    return syncId;
}
async function loadFromLocal(syncId) {
    if (!syncId) {
        // 加载最新同步
        const latestPath = path_1.default.join(LOCAL_STORAGE_PATH, 'latest.txt');
        if (await fs_extra_1.default.pathExists(latestPath)) {
            syncId = await fs_extra_1.default.readFile(latestPath, 'utf-8');
        }
        else {
            throw new Error('没有找到本地同步记录');
        }
    }
    const syncPath = path_1.default.join(LOCAL_STORAGE_PATH, syncId);
    if (!await fs_extra_1.default.pathExists(syncPath)) {
        throw new Error(`同步记录不存在: ${syncId}`);
    }
    const metadataPath = path_1.default.join(syncPath, 'metadata.json');
    const metadata = await fs_extra_1.default.readJson(metadataPath);
    const result = {};
    const files = await fs_extra_1.default.readdir(syncPath);
    for (const file of files) {
        if (file !== 'metadata.json') {
            const encrypted = await fs_extra_1.default.readFile(path_1.default.join(syncPath, file), 'utf-8');
            result[file] = (0, config_1.decryptConfig)(encrypted, ENCRYPTION_KEY);
        }
    }
    return result;
}
async function listLocalSyncs() {
    if (!await fs_extra_1.default.pathExists(LOCAL_STORAGE_PATH)) {
        return [];
    }
    const dirs = await fs_extra_1.default.readdir(LOCAL_STORAGE_PATH);
    const syncs = [];
    for (const dir of dirs) {
        if (dir.startsWith('sync-')) {
            const metadataPath = path_1.default.join(LOCAL_STORAGE_PATH, dir, 'metadata.json');
            if (await fs_extra_1.default.pathExists(metadataPath)) {
                const metadata = await fs_extra_1.default.readJson(metadataPath);
                syncs.push(metadata);
            }
        }
    }
    return syncs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

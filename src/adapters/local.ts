import fs from 'fs-extra';
import path from 'path';
import { encryptConfig, decryptConfig } from '../config';

const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './sync-storage';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key';

export async function saveToLocal(data: any): Promise<string> {
  await fs.ensureDir(LOCAL_STORAGE_PATH);
  
  const timestamp = new Date().toISOString();
  const syncId = `sync-${Date.now()}`;
  const syncPath = path.join(LOCAL_STORAGE_PATH, syncId);
  
  await fs.ensureDir(syncPath);
  
  // 保存元数据
  const metadata = {
    timestamp,
    syncId,
    fileCount: Object.keys(data).length
  };
  
  await fs.writeJson(path.join(syncPath, 'metadata.json'), metadata);
  
  // 保存配置文件
  for (const [filename, content] of Object.entries(data)) {
    const encrypted = encryptConfig(content as string, ENCRYPTION_KEY);
    await fs.writeFile(path.join(syncPath, filename), encrypted);
  }
  
  // 更新最新同步记录
  await fs.writeFile(
    path.join(LOCAL_STORAGE_PATH, 'latest.txt'),
    syncId
  );
  
  return syncId;
}

export async function loadFromLocal(syncId?: string): Promise<any> {
  let actualSyncId = syncId;
  
  if (!actualSyncId) {
    // 加载最新同步
    const latestPath = path.join(LOCAL_STORAGE_PATH, 'latest.txt');
    if (await fs.pathExists(latestPath)) {
      actualSyncId = await fs.readFile(latestPath, 'utf-8');
    } else {
      throw new Error('没有找到本地同步记录');
    }
  }
  
  const syncPath = path.join(LOCAL_STORAGE_PATH, actualSyncId);
  
  if (!await fs.pathExists(syncPath)) {
    throw new Error(`同步记录不存在: ${actualSyncId}`);
  }
  
  const metadataPath = path.join(syncPath, 'metadata.json');
  const metadata = await fs.readJson(metadataPath);
  
  const result: Record<string, string> = {};
  const files = await fs.readdir(syncPath);
  
  for (const file of files) {
    if (file !== 'metadata.json') {
      const encrypted = await fs.readFile(path.join(syncPath, file), 'utf-8');
      result[file] = decryptConfig(encrypted, ENCRYPTION_KEY);
    }
  }
  
  return result;
}

export async function listLocalSyncs(): Promise<any[]> {
  if (!await fs.pathExists(LOCAL_STORAGE_PATH)) {
    return [];
  }
  
  const dirs = await fs.readdir(LOCAL_STORAGE_PATH);
  const syncs = [];
  
  for (const dir of dirs) {
    if (dir.startsWith('sync-')) {
      const metadataPath = path.join(LOCAL_STORAGE_PATH, dir, 'metadata.json');
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJson(metadataPath);
        syncs.push(metadata);
      }
    }
  }
  
  return syncs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
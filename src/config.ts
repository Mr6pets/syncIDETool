import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import crypto from 'crypto-js';

// 获取 Trea IDE 配置路径（根据实际路径调整）
export function getTreaConfigPath(): string {
  const homeDir = os.homedir();
  
  // Windows: %USERPROFILE%\AppData\Roaming\Trea\config
  // macOS: ~/Library/Application Support/Trea/config
  // Linux: ~/.config/trea
  
  if (process.platform === 'win32') {
    return path.join(homeDir, 'AppData', 'Roaming', 'Trea', 'config');
  } else if (process.platform === 'darwin') {
    return path.join(homeDir, 'Library', 'Application Support', 'Trea', 'config');
  } else {
    return path.join(homeDir, '.config', 'trea');
  }
}

// 读取本地配置
export async function readLocalConfig(): Promise<any> {
  const configPath = getTreaConfigPath();
  if (!await fs.pathExists(configPath)) {
    throw new Error('Trea 配置目录不存在');
  }
  
  // 收集所有配置文件
  const configFiles = await fs.readdir(configPath);
  const configData: Record<string, string> = {};
  
  for (const file of configFiles) {
    if (file.endsWith('.json') || file.endsWith('.conf')) {
      const content = await fs.readFile(path.join(configPath, file), 'utf-8');
      configData[file] = content;
    }
  }
  
  return configData;
}

// 加密配置数据
export function encryptConfig(data: string, key: string): string {
  return crypto.AES.encrypt(data, key).toString();
}

// 解密配置数据
export function decryptConfig(data: string, key: string): string {
  const bytes = crypto.AES.decrypt(data, key);
  return bytes.toString(crypto.enc.Utf8);
}
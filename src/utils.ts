import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { createHash } from 'crypto';

// 文件哈希计算
export function calculateFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return createHash('md5').update(content).digest('hex');
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// 彩色日志输出
export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.log(chalk.red('✗'), message),
  debug: (message: string) => {
    if (process.env.DEBUG === 'true') {
      console.log(chalk.gray('🐛'), message);
    }
  }
};

// 确保目录存在
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

// 安全的JSON解析
export function safeJsonParse(jsonString: string, defaultValue: any = {}): any {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}

// 检查文件是否存在
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// 获取文件修改时间
export async function getFileModTime(filePath: string): Promise<Date> {
  const stats = await fs.stat(filePath);
  return stats.mtime;
}

// 创建备份文件
export async function createBackup(filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;
  await fs.copy(filePath, backupPath);
  return backupPath;
}

// 验证配置文件格式
export function validateConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
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
export function detectEnvironment() {
  return {
    os: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    homeDir: require('os').homedir(),
    workingDir: process.cwd()
  };
}

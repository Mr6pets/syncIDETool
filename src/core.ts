import fs from 'fs-extra';
import path from 'path';
import { getTreaConfigPath, readLocalConfig } from './config';
import { saveToGitHub, loadFromGitHub } from './adapters/github';
import { prompt } from 'enquirer';
import dotenv from 'dotenv';
import ora from 'ora';
import diff from 'diff';
import chalk from 'chalk';

dotenv.config();

const CONFIG_FILE = path.join(process.cwd(), '.treasync');

// 初始化设置
export async function setup() {
  const spinner = ora('正在初始化配置...').start();
  
  try {
    // 1. 选择存储后端
    const { storageType } = await prompt<{ storageType: string }>({
      type: 'select',
      name: 'storageType',
      message: '选择存储后端:',
      choices: ['GitHub', 'Gitee', 'GitLab', 'Local']
    });
    
    // 2. 根据选择配置认证信息
    let configData: any = { storageType };
    
    if (storageType === 'GitHub') {
      const { token } = await prompt<{ token: string }>({
        type: 'input',
        name: 'token',
        message: '输入 GitHub 个人访问令牌:'
      });
      
      configData.githubToken = token;
    }
    // 其他存储类型配置...
    
    // 3. 保存配置
    await fs.writeJson(CONFIG_FILE, configData);
    
    spinner.succeed('配置初始化成功！');
    console.log('配置文件已保存至: ', CONFIG_FILE);
  } catch (error: any) {
    spinner.fail(`初始化失败: ${error.message}`);
  }
}

// 同步配置
export async function syncConfig(force = false) {
  const spinner = ora('正在同步配置...').start();
  
  try {
    // 1. 加载本地配置
    const localConfig = await readLocalConfig();
    
    // 2. 加载远程配置
    const remoteConfig = await loadFromGitHub(process.env.GIST_ID!);
    
    // 3. 比较差异
    const changes = diff.diffJson(localConfig, remoteConfig);
    const hasChanges = changes.length > 1;
    
    if (hasChanges) {
      spinner.warn('检测到配置差异');
      
      if (!force) {
        // 显示差异
        changes.forEach(part => {
          const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
          const coloredValue = (chalk as any)[color](part.value);
          process.stderr.write(coloredValue);
        });
        
        const { action } = await prompt<{ action: string }>({
          type: 'select',
          name: 'action',
          message: '请选择操作:',
          choices: [
            { name: 'local', message: '使用本地配置覆盖远程' },
            { name: 'remote', message: '使用远程配置覆盖本地' },
            { name: 'merge', message: '智能合并（推荐）' },
            { name: 'abort', message: '取消同步' }
          ]
        });
        
        if (action === 'abort') {
          spinner.info('同步已取消');
          return;
        }
        
        // 根据选择执行操作
        if (action === 'local') {
          await saveToGitHub(localConfig);
          spinner.succeed('本地配置已上传至云端');
        } else if (action === 'remote') {
          await applyRemoteConfig(remoteConfig);
          spinner.succeed('远程配置已应用到本地');
        } else if (action === 'merge') {
          const mergedConfig = mergeConfigs(localConfig, remoteConfig);
          await saveToGitHub(mergedConfig);
          await applyRemoteConfig(mergedConfig);
          spinner.succeed('配置已合并并同步');
        }
      } else {
        // 强制覆盖
        await saveToGitHub(localConfig);
        spinner.succeed('本地配置已强制上传至云端');
      }
    } else {
      spinner.succeed('配置已是最新，无需同步');
    }
  } catch (error: any) {
    spinner.fail(`同步失败: ${error.message}`);
  }
}

// 应用远程配置到本地
async function applyRemoteConfig(config: Record<string, string>) {
  const configPath = getTreaConfigPath();
  
  for (const [filename, content] of Object.entries(config)) {
    await fs.writeFile(path.join(configPath, filename), content);
  }
}

// 智能合并配置
function mergeConfigs(local: any, remote: any): any {
  // 实现更复杂的合并逻辑
  return { ...remote, ...local };
}

// 显示同步状态
export async function showStatus() {
  // 实现状态显示逻辑
  console.log('状态显示功能待实现');
}
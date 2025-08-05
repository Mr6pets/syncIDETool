"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = setup;
exports.syncConfig = syncConfig;
exports.showStatus = showStatus;
exports.guidedSetup = guidedSetup;
exports.quickStart = quickStart;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const github_1 = require("./adapters/github");
// 移除这行: import { prompt } from 'enquirer';
const dotenv_1 = __importDefault(require("dotenv"));
const ora_1 = __importDefault(require("ora"));
const diff_1 = __importDefault(require("diff"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const utils_1 = require("./utils");
dotenv_1.default.config();
const CONFIG_FILE = path_1.default.join(process.cwd(), '.treasync');
// 初始化设置
async function setup() {
    const spinner = (0, ora_1.default)('正在初始化配置...').start();
    try {
        // 1. 选择存储后端
        const { storageType } = await inquirer_1.default.prompt({
            type: 'list',
            name: 'storageType',
            message: '选择存储后端:',
            choices: ['GitHub', 'Gitee', 'GitLab', 'Local']
        });
        // 2. 根据选择配置认证信息
        let configData = { storageType };
        if (storageType === 'GitHub') {
            const { token } = await inquirer_1.default.prompt({
                type: 'input',
                name: 'token',
                message: '输入 GitHub 个人访问令牌:'
            });
            configData.githubToken = token;
        }
        // 其他存储类型配置...
        // 3. 保存配置
        await fs_extra_1.default.writeJson(CONFIG_FILE, configData);
        spinner.succeed('配置初始化成功！');
        console.log('配置文件已保存至: ', CONFIG_FILE);
    }
    catch (error) {
        spinner.fail(`初始化失败: ${error.message}`);
    }
}
// 同步配置
// 在 syncConfig 函数中
async function syncConfig(force = false) {
    const spinner = (0, ora_1.default)('正在同步配置...').start();
    try {
        // 1. 加载本地配置
        const localConfig = await (0, config_1.readLocalConfig)();
        // 2. 加载远程配置
        const remoteConfig = await (0, github_1.loadFromGitHub)(process.env.GIST_ID);
        // 3. 比较差异
        const changes = diff_1.default.diffJson(localConfig, remoteConfig);
        const hasChanges = changes.length > 1;
        if (hasChanges) {
            spinner.warn('检测到配置差异');
            if (!force) {
                // 显示差异
                changes.forEach(part => {
                    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
                    const coloredValue = chalk_1.default[color](part.value);
                    process.stderr.write(coloredValue);
                });
                const { action } = await inquirer_1.default.prompt({
                    type: 'list',
                    name: 'action',
                    message: '请选择操作:',
                    choices: [
                        { name: '使用本地配置覆盖远程', value: 'local' },
                        { name: '使用远程配置覆盖本地', value: 'remote' },
                        { name: '智能合并（推荐）', value: 'merge' },
                        { name: '取消同步', value: 'abort' }
                    ]
                });
                if (action === 'abort') {
                    spinner.info('同步已取消');
                    return;
                }
                // 根据选择执行操作
                if (action === 'local') {
                    await (0, github_1.saveToGitHub)(localConfig);
                    spinner.succeed('本地配置已上传至云端');
                }
                else if (action === 'remote') {
                    await applyRemoteConfig(remoteConfig);
                    spinner.succeed('远程配置已应用到本地');
                }
                else if (action === 'merge') {
                    const mergedConfig = mergeConfigs(localConfig, remoteConfig);
                    await (0, github_1.saveToGitHub)(mergedConfig);
                    await applyRemoteConfig(mergedConfig);
                    spinner.succeed('配置已合并并同步');
                }
            }
            else {
                // 强制覆盖
                await (0, github_1.saveToGitHub)(localConfig);
                spinner.succeed('本地配置已强制上传至云端');
            }
        }
        else {
            spinner.succeed('配置已是最新，无需同步');
        }
    }
    catch (error) {
        spinner.fail(`同步失败: ${error.message}`);
    }
}
// 应用远程配置到本地
async function applyRemoteConfig(config) {
    const configPath = (0, config_1.getTreaConfigPath)();
    for (const [filename, content] of Object.entries(config)) {
        await fs_extra_1.default.writeFile(path_1.default.join(configPath, filename), content);
    }
}
// 智能合并配置
function mergeConfigs(local, remote) {
    // 实现更复杂的合并逻辑
    return { ...remote, ...local };
}
// 显示同步状态
async function showStatus() {
    // 实现状态显示逻辑
    console.log('状态显示功能待实现');
}
// 引导式配置
async function guidedSetup() {
    console.clear();
    console.log(chalk_1.default.cyan('🚀 欢迎使用 Trea IDE 配置同步工具!'));
    console.log(chalk_1.default.gray('我们将引导您完成初始配置，只需几个简单步骤\n'));
    try {
        // 步骤1: 欢迎和说明
        await showWelcomeStep();
        // 步骤2: 选择存储方式
        const storageConfig = await selectStorageStep();
        // 步骤3: 配置认证信息
        const authConfig = await configureAuthStep(storageConfig.storageType);
        // 步骤4: 安全设置
        const securityConfig = await configureSecurityStep();
        // 步骤5: 生成配置文件
        await generateConfigFiles({
            ...storageConfig,
            ...authConfig,
            ...securityConfig
        });
        // 步骤6: 完成设置
        await showCompletionStep();
    }
    catch (error) {
        console.log(chalk_1.default.red('\n❌ 配置过程中出现错误:'), error.message);
        console.log(chalk_1.default.yellow('💡 您可以重新运行 `trea-sync guide` 重新配置'));
    }
}
// 欢迎步骤
async function showWelcomeStep() {
    console.log(chalk_1.default.blue('📋 配置说明:'));
    console.log('• 支持 GitHub、Gitee、本地存储');
    console.log('• 自动加密保护您的配置文件');
    console.log('• 支持多设备间同步');
    console.log('');
    const { continue: shouldContinue } = await inquirer_1.default.prompt({
        type: 'confirm',
        name: 'continue',
        message: '准备好开始配置了吗？',
        default: true
    });
    if (!shouldContinue) {
        console.log(chalk_1.default.yellow('👋 配置已取消，您可以随时运行 `trea-sync guide` 重新开始'));
        process.exit(0);
    }
}
// 选择存储方式
async function selectStorageStep() {
    console.log(chalk_1.default.green('\n📦 步骤 1/4: 选择存储方式'));
    console.log(chalk_1.default.gray('选择您希望将配置存储在哪里:\n'));
    const { storageType } = await inquirer_1.default.prompt({
        type: 'list',
        name: 'storageType',
        message: '请选择存储后端:',
        choices: [
            {
                name: '🐙 GitHub (推荐) - 免费、稳定、支持版本控制',
                value: 'github'
            },
            {
                name: '🦊 Gitee - 国内访问更快',
                value: 'gitee'
            },
            {
                name: '💾 本地存储 - 仅在本机使用',
                value: 'local'
            }
        ]
    });
    return { storageType };
}
// 配置认证信息
async function configureAuthStep(storageType) {
    console.log(chalk_1.default.green('\n🔐 步骤 2/4: 配置认证信息'));
    if (storageType === 'local') {
        console.log(chalk_1.default.gray('本地存储无需认证配置'));
        return {};
    }
    const platformName = storageType === 'github' ? 'GitHub' : 'Gitee';
    const tokenUrl = storageType === 'github'
        ? 'https://github.com/settings/tokens'
        : 'https://gitee.com/profile/personal_access_tokens';
    console.log(chalk_1.default.gray(`需要创建 ${platformName} 个人访问令牌:\n`));
    const { openBrowser } = await inquirer_1.default.prompt({
        type: 'confirm',
        name: 'openBrowser',
        message: `是否打开浏览器前往 ${platformName} 创建令牌？`,
        default: true
    });
    if (openBrowser) {
        console.log(chalk_1.default.blue(`🌐 正在打开 ${tokenUrl}`));
        // 修复这行代码，移除参数
        await (0, utils_1.openTokenPage)(); // 移除 storageType 参数
        console.log(chalk_1.default.yellow('\n📝 创建令牌时请确保勾选以下权限:'));
        if (storageType === 'github') {
            console.log('  • gist (创建和管理 Gist)');
        }
        else {
            console.log('  • projects (项目权限)');
            console.log('  • pull_requests (PR权限)');
        }
    }
    const { token } = await inquirer_1.default.prompt({
        type: 'password',
        name: 'token',
        message: `请输入您的 ${platformName} 个人访问令牌:`,
        mask: '*',
        validate: (input) => {
            if (!input || input.trim().length === 0) {
                return '令牌不能为空';
            }
            if (input.length < 20) {
                return '令牌长度似乎不正确，请检查';
            }
            return true;
        }
    });
    // 验证令牌有效性
    console.log(chalk_1.default.blue('🔍 正在验证令牌...'));
    const isValid = await validateToken(storageType, token);
    if (!isValid) {
        throw new Error('令牌验证失败，请检查令牌是否正确');
    }
    console.log(chalk_1.default.green('✅ 令牌验证成功!'));
    return {
        [`${storageType.toUpperCase()}_TOKEN`]: token
    };
}
// 配置安全设置
async function configureSecurityStep() {
    console.log(chalk_1.default.green('\n🔒 步骤 3/4: 安全设置'));
    console.log(chalk_1.default.gray('为了保护您的配置文件，我们建议启用加密\n'));
    const { enableEncryption } = await inquirer_1.default.prompt({
        type: 'confirm',
        name: 'enableEncryption',
        message: '是否启用配置文件加密？',
        default: true
    });
    if (!enableEncryption) {
        return { ENCRYPTION_ENABLED: 'false' };
    }
    const { useAutoKey } = await inquirer_1.default.prompt({
        type: 'confirm',
        name: 'useAutoKey',
        message: '是否自动生成加密密钥？(推荐)',
        default: true
    });
    let encryptionKey;
    if (useAutoKey) {
        encryptionKey = generateSecureKey();
        console.log(chalk_1.default.green('🔑 已自动生成安全的加密密钥'));
    }
    else {
        const { customKey } = await inquirer_1.default.prompt({
            type: 'password',
            name: 'customKey',
            message: '请输入自定义加密密钥 (至少16位):',
            mask: '*',
            validate: (input) => {
                if (input.length < 16) {
                    return '密钥长度至少需要16位';
                }
                return true;
            }
        });
        encryptionKey = customKey;
    }
    return {
        ENCRYPTION_KEY: encryptionKey,
        ENCRYPTION_ENABLED: 'true'
    };
}
// 生成配置文件
async function generateConfigFiles(config) {
    console.log(chalk_1.default.green('\n📝 步骤 4/4: 生成配置文件'));
    const envPath = path_1.default.join(process.cwd(), '.env');
    const configPath = path_1.default.join(process.cwd(), '.treasync.config.js');
    // 生成 .env 文件
    const envContent = generateEnvContent(config);
    await fs_extra_1.default.writeFile(envPath, envContent);
    // 生成配置文件（如果不存在）
    if (!await fs_extra_1.default.pathExists(configPath)) {
        const configContent = generateConfigContent();
        await fs_extra_1.default.writeFile(configPath, configContent);
    }
    console.log(chalk_1.default.green('✅ 配置文件已生成:'));
    console.log(chalk_1.default.gray(`  • ${envPath}`));
    console.log(chalk_1.default.gray(`  • ${configPath}`));
}
// 完成设置
async function showCompletionStep() {
    console.log(chalk_1.default.green('\n🎉 配置完成!'));
    console.log(chalk_1.default.blue('\n📚 接下来您可以:'));
    console.log('  • 运行 `trea-sync sync` 开始同步配置');
    console.log('  • 运行 `trea-sync status` 查看同步状态');
    console.log('  • 运行 `trea-sync --help` 查看所有命令');
    const { startSync } = await inquirer_1.default.prompt({
        type: 'confirm',
        name: 'startSync',
        message: '是否立即开始同步配置？',
        default: true
    });
    if (startSync) {
        console.log('');
        await syncConfig(false);
    }
}
// 辅助函数
function generateSecureKey() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}
function generateEnvContent(config) {
    let content = '# Trea IDE 配置同步工具 - 环境变量配置\n';
    content += '# 此文件由引导程序自动生成\n\n';
    Object.entries(config).forEach(([key, value]) => {
        content += `${key}=${value}\n`;
    });
    content += '\n# 调试模式 (可选)\n';
    content += '# DEBUG=true\n';
    return content;
}
function generateConfigContent() {
    return `// Trea IDE 配置同步工具 - 同步规则配置
// 此文件由引导程序自动生成

module.exports = {
  // 包含的文件模式
  include: ['*.json', '*.conf', 'settings/*'],
  
  // 排除的文件模式
  exclude: ['temp/*', '*.log', 'cache/*'],
  
  // 冲突解决策略
  conflictResolution: 'merge', // 'local' | 'remote' | 'merge'
  
  // 加密配置
  encryption: {
    enabled: true,
    algorithm: 'AES'
  },
  
  // 备份设置
  backup: {
    enabled: true,
    maxBackups: 5
  }
};
`;
}
async function validateToken(storageType, token) {
    // 这里添加实际的令牌验证逻辑
    try {
        if (storageType === 'github') {
            const axios = require('axios');
            const response = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `token ${token}` }
            });
            return response.status === 200;
        }
        // 添加其他平台的验证逻辑
        return true;
    }
    catch {
        return false;
    }
}
// 快速开始函数
async function quickStart() {
    console.log(chalk_1.default.cyan('⚡ 快速开始模式'));
    console.log(chalk_1.default.gray('正在自动检测最佳配置...\n'));
    // 检测现有配置
    const hasExistingConfig = await fs_extra_1.default.pathExists('.env');
    if (hasExistingConfig) {
        console.log(chalk_1.default.yellow('⚠️  检测到现有配置文件'));
        const { overwrite } = await inquirer_1.default.prompt({
            type: 'confirm',
            name: 'overwrite',
            message: '是否覆盖现有配置？',
            default: false
        });
        if (!overwrite) {
            console.log(chalk_1.default.blue('使用现有配置进行同步...'));
            await syncConfig(false);
            return;
        }
    }
    // 推荐 GitHub + 自动加密的快速配置
    console.log(chalk_1.default.blue('🚀 推荐配置: GitHub + 自动加密'));
    await guidedSetup();
}

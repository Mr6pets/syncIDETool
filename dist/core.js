"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = setup;
exports.syncConfig = syncConfig;
exports.showStatus = showStatus;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const github_1 = require("./adapters/github");
const enquirer_1 = require("enquirer");
const dotenv_1 = __importDefault(require("dotenv"));
const ora_1 = __importDefault(require("ora"));
const diff_1 = __importDefault(require("diff"));
dotenv_1.default.config();
const CONFIG_FILE = path_1.default.join(process.cwd(), '.treasync');
// 初始化设置
async function setup() {
    const spinner = (0, ora_1.default)('正在初始化配置...').start();
    try {
        // 1. 选择存储后端
        const { storageType } = await (0, enquirer_1.prompt)({
            type: 'select',
            name: 'storageType',
            message: '选择存储后端:',
            choices: ['GitHub', 'Gitee', 'GitLab', 'Local']
        });
        // 2. 根据选择配置认证信息
        let configData = { storageType };
        if (storageType === 'GitHub') {
            const { token } = await (0, enquirer_1.prompt)({
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
                    process.stderr.write(part.value[color]);
                });
                const { action } = await (0, enquirer_1.prompt)({
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
}

#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const core_1 = require("./core"); // 移除不存在的 interactiveSetup
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
program
    .name('trea-sync')
    .description('Trea IDE 配置同步工具')
    .version('0.1.0');
// 新增引导式配置命令
program
    .command('guide')
    .description('🚀 新手引导 - 一步步完成配置')
    .action(core_1.guidedSetup);
// 添加缺少的 quickStart 函数
async function quickStart() {
    console.log(chalk_1.default.cyan('⚡ 快速开始配置...'));
    try {
        await (0, core_1.guidedSetup)();
    }
    catch (error) {
        console.error(chalk_1.default.red('快速配置失败:'), error.message);
    }
}
// 快速开始命令
program
    .command('quickstart')
    .description('⚡ 快速开始 - 自动检测并配置')
    .action(quickStart);
program
    .command('setup')
    .description('初始化同步配置')
    .action(core_1.setup);
program
    .command('sync')
    .description('同步配置')
    .option('-f, --force', '强制覆盖本地配置')
    .action((options) => (0, core_1.syncConfig)(options.force));
program
    .command('status')
    .description('显示同步状态')
    .action(core_1.showStatus);
program
    .command('push')
    .description('上传本地配置到云端')
    .action(() => (0, core_1.syncConfig)(false)); // 修改参数类型
program
    .command('pull')
    .description('从云端下载配置到本地')
    .action(() => (0, core_1.syncConfig)(false)); // 修改参数类型
// 添加自定义帮助信息
program.on('--help', () => {
    console.log('');
    console.log(chalk_1.default.cyan('🚀 新手推荐:'));
    console.log('  $ trea-sync guide     # 引导式配置 (推荐新用户)');
    console.log('  $ trea-sync quickstart # 快速开始');
    console.log('');
    console.log(chalk_1.default.blue('📖 使用示例:'));
    console.log('  $ trea-sync guide      # 第一次使用，完整引导');
    console.log('  $ trea-sync sync       # 同步配置');
    console.log('  $ trea-sync status     # 查看状态');
    console.log('');
    console.log(chalk_1.default.gray('💡 更多帮助: https://github.com/Mr6pets/syncIDETool'));
});
program.parse(process.argv);

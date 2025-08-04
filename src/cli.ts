#!/usr/bin/env node
import { Command } from 'commander';
import { syncConfig, setup, showStatus, interactiveSetup, guidedSetup } from './core';
import chalk from 'chalk';

const program = new Command();

program
  .name('trea-sync')
  .description('Trea IDE 配置同步工具')
  .version('0.1.0');

// 新增引导式配置命令
program
  .command('guide')
  .description('🚀 新手引导 - 一步步完成配置')
  .action(guidedSetup);

// 快速开始命令
program
  .command('quickstart')
  .description('⚡ 快速开始 - 自动检测并配置')
  .action(quickStart);

program
  .command('setup')
  .description('初始化同步配置')
  .action(setup);

program
  .command('sync')
  .description('同步配置')
  .option('-f, --force', '强制覆盖本地配置')
  .action((options) => syncConfig(options.force));

program
  .command('status')
  .description('显示同步状态')
  .action(showStatus);

program
  .command('push')
  .description('上传本地配置到云端')
  .action(() => syncConfig(false)); // 修改参数类型

program
  .command('pull')
  .description('从云端下载配置到本地')
  .action(() => syncConfig(false)); // 修改参数类型

// 添加自定义帮助信息
program.on('--help', () => {
  console.log('');
  console.log(chalk.cyan('🚀 新手推荐:'));
  console.log('  $ trea-sync guide     # 引导式配置 (推荐新用户)');
  console.log('  $ trea-sync quickstart # 快速开始');
  console.log('');
  console.log(chalk.blue('📖 使用示例:'));
  console.log('  $ trea-sync guide      # 第一次使用，完整引导');
  console.log('  $ trea-sync sync       # 同步配置');
  console.log('  $ trea-sync status     # 查看状态');
  console.log('');
  console.log(chalk.gray('💡 更多帮助: https://github.com/Mr6pets/syncIDETool'));
});

program.parse(process.argv);
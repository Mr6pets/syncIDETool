#!/usr/bin/env node
import { Command } from 'commander';
import { syncConfig, setup, showStatus, interactiveSetup } from './core';

const program = new Command();

program
  .name('trea-sync')
  .description('Trea IDE 配置同步工具')
  .version('0.1.0');

// 新增交互式初始化命令
program
  .command('init')
  .description('交互式初始化配置向导')
  .action(interactiveSetup);

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

program.parse(process.argv);
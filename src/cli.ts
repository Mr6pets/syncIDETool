import { Command } from 'commander';
import { syncConfig, setup, showStatus } from './core';

const program = new Command();

program
  .name('trea-sync')
  .description('Trea IDE 配置同步工具')
  .version('0.1.0');

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

program.parse(process.argv);
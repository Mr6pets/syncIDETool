"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const core_1 = require("./core");
const program = new commander_1.Command();
program
    .name('trea-sync')
    .description('Trea IDE 配置同步工具')
    .version('0.1.0');
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
program.parse(process.argv);

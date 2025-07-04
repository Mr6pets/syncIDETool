# SyncIDETool - IDE配置同步工具

一个强大的npm包，用于在不同设备和环境之间同步IDE配置文件，支持多种存储后端。
[![npm version](https://badge.fury.io/js/syncidetool.svg)](https://badge.fury.io/js/syncidetool)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Downloads](https://img.shields.io/npm/dm/syncidetool.svg)](https://www.npmjs.com/package/syncidetool)

## 📚 目录
- [特性](#-特性)
- [安装](#-安装)
- [使用指南](#️-使用指南)
- [配置](#️-配置)
- [高级功能](#-高级功能)

## 🚀 特性

- 🔄 **多平台同步**: 支持Windows、macOS、Linux
- 🌐 **多存储后端**: GitHub Gist、Gitee、本地存储
- 🔒 **安全加密**: 配置文件加密存储
- 🎯 **智能合并**: 自动检测并解决配置冲突
- 📊 **差异显示**: 清晰展示本地与远程配置差异
- ⚡ **增量同步**: 只同步变更的配置

## 📦 安装

#### :clubs: 全局安装
```bash
npm install -g syncidetool
```

#### :pushpin: 本地安装

```bash
npm install syncidetool
```
# 🛠️ 使用指南
1. 初始化配置
首次使用需要初始化配置：

```bash
npx trea-sync setup
```
系统会引导你选择：

存储后端（GitHub、Gitee、本地）
认证信息配置
同步策略设置

2. 同步配置
常规同步（显示差异）
```bash
npx trea-sync sync
```
强制同步（覆盖远程）
```bash
npx trea-sync sync --force
```
3. 查看状态
```bash
npx trea-sync status
```
# ⚙️ 配置
环境变量配置
创建 .env 文件：
```
# GitHub配置
GITHUB_TOKEN=your_github_personal_access_token
# 可选：GIST_ID=your_gist_id

# Gitee配置
GITEE_TOKEN=your_gitee_access_token
# 可选：GITEE_GIST_ID=your_gitee_gist_id

# 加密密钥
ENCRYPTION_KEY=your_encryption_key

# 支持的IDE配置路径
Trea IDE:

Windows: %USERPROFILE%\AppData\Roaming\Trea\config
macOS: ~/Library/Application Support/Trea/config
Linux: ~/.config/trea
VS Code:

Windows: %APPDATA%\Code\User
macOS: ~/Library/Application Support/Code/User
Linux: ~/.config/Code/User
```

# 🔧 高级功能
自定义同步规则
在项目根目录创建 .treasync.config.js：

javascript
```
module.exports = {  
  // 包含的文件模式  
  include: ['*.json', '*.conf', 'settings/*'],    
  // 排除的文件模式  
  exclude: ['temp/*', '*.log'],   
  // 冲突解决策略  
  conflictResolution: 'merge', 
  // 'local' |   'remote' | 'merge'    
  // 加密配置  
  encryption: {    enabled: true,    algorithm: 'AES'  },    
  // 备份设置  
  backup: {    enabled: true,    maxBackups: 5  }
};
```
多环境配置
```bash
# 开发环境
npx trea-sync sync --env dev

# 生产环境
npx trea-sync sync --env prod
```
📋 使用场景
场景1: 家庭到公司同步
```bash
# 在家工作后
trea-sync sync

# 到公司后
trea-sync sync
```
场景2: 多设备同步
```bash
# 在笔记本电脑上
trea-sync sync

# 在台式机上
trea-sync sync
```
场景3: 新环境初始化
```bash
# 在新电脑上
npm install -g syncidetool
trea-sync setup
trea-sync sync
```
场景4: 团队配置共享（开发中）
```bash
# 团队负责人发布配置
trea-sync sync --team --public

# 团队成员同步配置
trea-sync sync --team --from team-config-id
```
🔍 故障排除
常见问题
认证失败

```bash
# 重新配置认证信息
trea-sync setup --reconfigure
```
配置冲突

```bash
# 查看详细差异
trea-sync diff

# 手动解决冲突
trea-sync resolve
```
网络问题

```bash
# 使用本地备份
trea-sync sync --offline
```
日志查看
```bash
# 查看同步日志
trea-sync logs

# 详细调试信息
trea-sync sync --verbose
```
🛣️ 开发路线图
支持更多IDE（VS Code、IntelliJ IDEA、Sublime Text）
GUI界面
插件系统
云端配置管理面板
配置版本控制
团队协作功能（开发中）
配置模板市场
🤝 贡献
欢迎提交Issue和Pull Request！

Fork 项目
创建特性分支 (git checkout -b feature/AmazingFeature)
提交更改 (git commit -m 'Add some AmazingFeature')
推送到分支 (git push origin feature/AmazingFeature)
打开Pull Request
📄 许可证
ISC License

🙏 致谢
感谢所有贡献者和使用者的支持！

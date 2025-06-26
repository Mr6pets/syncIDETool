module.exports = {
  // 包含的文件模式
  include: ['*.json', '*.conf', 'settings/*'],
  
  // 排除的文件模式
  exclude: ['temp/*', '*.log'],
  
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
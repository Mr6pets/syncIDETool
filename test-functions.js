const fs = require('fs-extra');
const path = require('path');

// 测试配置读取
async function testConfigReading() {
  try {
    const { readLocalConfig, getTreaConfigPath } = require('./dist/config');
    const configPath = getTreaConfigPath();
    console.log('✓ 配置路径检测成功:', configPath);
    
    // 检查配置目录是否存在
    if (await fs.pathExists(configPath)) {
      const config = await readLocalConfig();
      console.log('✓ 配置读取成功:', Object.keys(config));
    } else {
      console.log('⚠ 配置目录不存在，这是正常的（如果没有安装 Trea IDE）');
    }
  } catch (error) {
    console.log('✗ 配置读取测试失败:', error.message);
  }
}

// 测试工具函数
function testUtilFunctions() {
  try {
    const { logger, formatFileSize, safeJsonParse } = require('./dist/utils');
    
    // 测试日志功能
    logger.info('测试信息日志');
    logger.success('测试成功日志');
    logger.warning('测试警告日志');
    
    // 测试文件大小格式化
    console.log('✓ 文件大小格式化:', formatFileSize(1024));
    
    // 测试 JSON 解析
    const parsed = safeJsonParse('{"test": true}');
    console.log('✓ JSON 解析测试:', parsed);
    
    console.log('✓ 工具函数测试通过');
  } catch (error) {
    console.log('✗ 工具函数测试失败:', error.message);
  }
}

// 测试加密功能
function testEncryption() {
  try {
    const { encryptConfig, decryptConfig } = require('./dist/config');
    const testData = 'test configuration data';
    const key = 'test-encryption-key-123';
    
    const encrypted = encryptConfig(testData, key);
    const decrypted = decryptConfig(encrypted, key);
    
    if (decrypted === testData) {
      console.log('✓ 加密/解密测试通过');
    } else {
      console.log('✗ 加密/解密测试失败');
    }
  } catch (error) {
    console.log('✗ 加密功能测试失败:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🧪 开始功能测试...\n');
  
  await testConfigReading();
  testUtilFunctions();
  testEncryption();
  
  console.log('\n✅ 功能测试完成');
}

runAllTests().catch(console.error);
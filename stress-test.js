const fs = require('fs-extra');
const path = require('path');

async function stressTest() {
  console.log('🔥 开始压力测试...');
  
  const { calculateFileHash, formatFileSize } = require('./dist/utils');
  
  // 创建大量测试文件
  const testDir = 'stress-test-files';
  await fs.ensureDir(testDir);
  
  const startTime = Date.now();
  
  for (let i = 0; i < 100; i++) {
    const testFile = path.join(testDir, `test-${i}.json`);
    const testData = { id: i, data: 'x'.repeat(1000), timestamp: Date.now() };
    
    await fs.writeJson(testFile, testData);
    
    // 测试哈希计算
    const hash = calculateFileHash(testFile);
    
    if (i % 20 === 0) {
      console.log(`处理进度: ${i + 1}/100`);
    }
  }
  
  const endTime = Date.now();
  console.log(`✓ 压力测试完成，耗时: ${endTime - startTime}ms`);
  
  // 清理测试文件
  await fs.remove(testDir);
  console.log('✓ 测试文件已清理');
}

stressTest().catch(console.error);
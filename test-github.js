require('dotenv').config({ path: '.env.test' });

async function testGitHubConnection() {
  try {
    const { saveToGitHub, loadFromGitHub } = require('./dist/adapters/github');
    
    // 测试数据
    const testData = {
      'test-config.json': JSON.stringify({ test: true, timestamp: Date.now() })
    };
    
    console.log('🔄 测试 GitHub 上传...');
    const gistId = await saveToGitHub(testData);
    console.log('✓ GitHub 上传成功, Gist ID:', gistId);
    
    console.log('🔄 测试 GitHub 下载...');
    const downloadedData = await loadFromGitHub(gistId);
    console.log('✓ GitHub 下载成功:', Object.keys(downloadedData));
    
  } catch (error) {
    console.log('✗ GitHub 测试失败:', error.message);
    if (error.message.includes('token')) {
      console.log('💡 请确保在 .env.test 中设置了有效的 GITHUB_TOKEN');
    }
  }
}

testGitHubConnection();
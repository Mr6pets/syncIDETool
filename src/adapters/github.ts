import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_ID = process.env.GIST_ID;

if (!GITHUB_TOKEN) {
  throw new Error('GitHub token 未配置');
}

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }
});

export async function saveToGitHub(data: any): Promise<string> {
  const files: Record<string, { content: string }> = {};
  
  for (const [filename, content] of Object.entries(data)) {
    files[filename] = { content: content as string };
  }
  
  const payload = {
    description: 'Trea IDE Configuration Sync',
    public: false,
    files
  };
  
  try {
    if (GIST_ID) {
      // 更新现有 Gist
      const response = await api.patch(`/gists/${GIST_ID}`, payload);
      return response.data.id;
    } else {
      // 创建新 Gist
      const response = await api.post('/gists', payload);
      return response.data.id;
    }
  } catch (error: any) {
    throw new Error(`GitHub 同步失败: ${error.response?.data?.message || error.message}`);
  }
}

export async function loadFromGitHub(gistId: string): Promise<any> {
  try {
    const response = await api.get(`/gists/${gistId}`);
    const files = response.data.files;
    const result: Record<string, string> = {};
    
    for (const filename of Object.keys(files)) {
      if (files[filename].truncated) {
        const contentResponse = await axios.get(files[filename].raw_url);
        result[filename] = contentResponse.data;
      } else {
        result[filename] = files[filename].content;
      }
    }
    
    return result;
  } catch (error: any) {
    throw new Error(`GitHub 加载失败: ${error.response?.data?.message || error.message}`);
  }
}
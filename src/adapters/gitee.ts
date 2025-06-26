import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GITEE_TOKEN = process.env.GITEE_TOKEN;
const GITEE_GIST_ID = process.env.GITEE_GIST_ID;

if (!GITEE_TOKEN) {
  throw new Error('Gitee token 未配置');
}

const api = axios.create({
  baseURL: 'https://gitee.com/api/v5',
  headers: {
    Authorization: `token ${GITEE_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

export async function saveToGitee(data: any): Promise<string> {
  const files: Record<string, { content: string }> = {};
  
  for (const [filename, content] of Object.entries(data)) {
    files[filename] = { content: content as string };
  }
  
  const payload = {
    description: 'IDE Configuration Sync via SyncIDETool',
    public: false,
    files
  };
  
  try {
    if (GITEE_GIST_ID) {
      // 更新现有代码片段
      const response = await api.patch(`/gists/${GITEE_GIST_ID}`, payload);
      return response.data.id;
    } else {
      // 创建新代码片段
      const response = await api.post('/gists', payload);
      return response.data.id;
    }
  } catch (error: any) {
    throw new Error(`Gitee 同步失败: ${error.response?.data?.message || error.message}`);
  }
}

export async function loadFromGitee(gistId: string): Promise<any> {
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
    throw new Error(`Gitee 加载失败: ${error.response?.data?.message || error.message}`);
  }
}
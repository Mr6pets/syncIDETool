"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToGitee = saveToGitee;
exports.loadFromGitee = loadFromGitee;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GITEE_TOKEN = process.env.GITEE_TOKEN;
const GITEE_GIST_ID = process.env.GITEE_GIST_ID;
if (!GITEE_TOKEN) {
    throw new Error('Gitee token 未配置');
}
const api = axios_1.default.create({
    baseURL: 'https://gitee.com/api/v5',
    headers: {
        Authorization: `token ${GITEE_TOKEN}`,
        'Content-Type': 'application/json'
    }
});
async function saveToGitee(data) {
    const files = {};
    for (const [filename, content] of Object.entries(data)) {
        files[filename] = { content: content };
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
        }
        else {
            // 创建新代码片段
            const response = await api.post('/gists', payload);
            return response.data.id;
        }
    }
    catch (error) {
        throw new Error(`Gitee 同步失败: ${error.response?.data?.message || error.message}`);
    }
}
async function loadFromGitee(gistId) {
    try {
        const response = await api.get(`/gists/${gistId}`);
        const files = response.data.files;
        const result = {};
        for (const filename of Object.keys(files)) {
            if (files[filename].truncated) {
                const contentResponse = await axios_1.default.get(files[filename].raw_url);
                result[filename] = contentResponse.data;
            }
            else {
                result[filename] = files[filename].content;
            }
        }
        return result;
    }
    catch (error) {
        throw new Error(`Gitee 加载失败: ${error.response?.data?.message || error.message}`);
    }
}

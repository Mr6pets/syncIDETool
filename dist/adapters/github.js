"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToGitHub = saveToGitHub;
exports.loadFromGitHub = loadFromGitHub;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_ID = process.env.GIST_ID;
if (!GITHUB_TOKEN) {
    throw new Error('GitHub token 未配置');
}
const api = axios_1.default.create({
    baseURL: 'https://api.github.com',
    headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
    }
});
async function saveToGitHub(data) {
    const files = {};
    for (const [filename, content] of Object.entries(data)) {
        files[filename] = { content: content };
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
        }
        else {
            // 创建新 Gist
            const response = await api.post('/gists', payload);
            return response.data.id;
        }
    }
    catch (error) {
        throw new Error(`GitHub 同步失败: ${error.response?.data?.message || error.message}`);
    }
}
async function loadFromGitHub(gistId) {
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
        throw new Error(`GitHub 加载失败: ${error.response?.data?.message || error.message}`);
    }
}

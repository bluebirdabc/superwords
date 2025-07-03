// 环境配置
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

// API 基础路径配置
export const API_BASE_URL = isDev ? '/api' : 'https://readapi.bluebirdabc.com'

// 完整的 API 配置
export const API_CONFIG = {
  // 用户相关接口
  USER_LOGIN: `${API_BASE_URL}/user/login`,
  USER_REGISTER: `${API_BASE_URL}/user/register`,
  USER_INFO: `${API_BASE_URL}/user/info`,
  
  // 其他接口可以在这里添加
}

// 环境信息
export const ENV_INFO = {
  isDev,
  isProd,
  mode: import.meta.env.MODE
}

console.log('当前环境:', ENV_INFO.mode, '| API基础路径:', API_BASE_URL)
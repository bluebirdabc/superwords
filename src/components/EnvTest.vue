<template>
  <div class="env-test">
    <h3>环境配置测试</h3>
    <div class="info-item">
      <strong>当前环境:</strong> {{ envInfo.mode }}
    </div>
    <div class="info-item">
      <strong>是否开发环境:</strong> {{ envInfo.isDev ? '是' : '否' }}
    </div>
    <div class="info-item">
      <strong>是否生产环境:</strong> {{ envInfo.isProd ? '是' : '否' }}
    </div>
    <div class="info-item">
      <strong>API基础路径:</strong> {{ apiBaseUrl }}
    </div>
    <div class="api-urls">
      <h4>API地址配置:</h4>
      <div v-for="(url, key) in apiConfig" :key="key" class="api-item">
        <strong>{{ key }}:</strong> {{ url }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { API_BASE_URL, API_CONFIG, ENV_INFO } from '@/config/env'

const envInfo = ENV_INFO
const apiBaseUrl = API_BASE_URL
const apiConfig = API_CONFIG
</script>

<style scoped>
.env-test {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 20px;
  background: #f9f9f9;
}

.info-item, .api-item {
  margin: 8px 0;
  padding: 4px 0;
}

.api-urls {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ccc;
}

h3, h4 {
  color: #333;
  margin-bottom: 12px;
}

strong {
  color: #666;
}
</style>
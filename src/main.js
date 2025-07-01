// ─────────────────────────────────────────────
// src/main.js
// ─────────────────────────────────────────────

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/global.css'

// ====== ① 新增全局组件注册（AuthDialog） ======
import AuthDialog from '@/components/common/AuthDialog.vue'

// ====== ② 新增多语言（vue-i18n）支持 ======
import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    'Standardized English Proficiency Exam': '标准化英语能力测试',
    '请点击下方动画，进入测试': '请点击下方动画，进入测试',
    '万词背单词——请开始今天的背诵任务': '万词背单词——请开始今天的背诵任务',
    '登录': '登录',
    '注册': '注册',
    '切换语言': '切换语言',
    // 你可以继续补充
  },
  en: {
    'Standardized English Proficiency Exam': 'Standardized English Proficiency Exam',
    '请点击下方动画，进入测试': 'Click the animation below to start the test',
    '万词背单词——请开始今天的背诵任务': 'Word Recitation - Please Start Today\'s Task',
    '登录': 'Login',
    '注册': 'Register',
    '切换语言': 'Switch Language',
    // 你可以继续补充
  }
}

const i18n = createI18n({
  legacy: false,            // 启用 Composition API 风格
  locale: 'zh',             // 默认语言
  fallbackLocale: 'en',     // 兜底语言
  messages
})

/* =======================================================
 * 一、始终懒加载 vConsole（开发、生产、PC、移动都注入）
 *    - 动态 import，不影响首屏体积
 *    - 避免重复实例化
 * ===================================================== */
;(async () => {
  try {
    const { default: VConsole } = await import('vconsole')
    if (!window.__VCONSOLE__) {
      // eslint-disable-next-line no-new
      window.__VCONSOLE__ = new VConsole({ theme: 'dark' })
      console.log(
        '[vConsole] ✅ 调试面板已注入 (env:',
        import.meta.env.MODE,
        '| ua:',
        navigator.userAgent,
        ')'
      )
    }
  } catch (err) {
    console.warn('[vConsole]⚠️ 动态加载失败，请确认已执行: pnpm add vconsole', err)
  }
})()

/* =======================================================
 * 二、正常挂载 Vue 应用，并注册 AuthDialog 为全局组件
 * ===================================================== */
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.component('AuthDialog', AuthDialog)

app.mount('#app')

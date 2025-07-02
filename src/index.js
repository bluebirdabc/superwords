// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import StartView   from '../views/StartView.vue'
import TestingView from '../views/TestingView.vue'
import ResultView  from '../views/ResultView.vue'

// 【关键】引入 useAuthStore
import { useAuthStore } from '@/services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'start',
      component: StartView
    },
    {
      path: '/testing',
      name: 'testing',
      component: TestingView
    },
    {
      path: '/result',
      name: 'result',
      component: ResultView
    }
  ]
})

// ========== 登录守卫：只拦截 /testing ==========
router.beforeEach((to, from, next) => {
  // 只守卫 /testing 页面
  if (to.path === '/testing') {
    const authStore = useAuthStore()
    // 已登录，直接进
    if (authStore.isLoggedIn) {
      next()
    } else {
      // 未登录，跳转首页
      next({ path: '/' })
    }
  } else {
    // 其它页面不拦截
    next()
  }
})

export default router

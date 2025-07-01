// src/services/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'  // ← 必须引入 computed!!

// 本地缓存key
const LOCAL_KEY = 'superwords-user'

function loadUserFromLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(loadUserFromLocal())
  console.log('console.log(user.value)',user.value)
  // 是否已登录
  const isLoggedIn = computed(() => !!user.value && !!user.value.token)

  // 登录
  async function login({ username, password }) {
    const url = 'https://readapi.bluebirdabc.com/api/v1/user/login'
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (!res.ok || !data || !data.data || !data.data.token) {
      throw new Error(data?.msg || '登录失败')
    }
    user.value = {
      ...data.data,
      username: data.data.username || username
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(user.value))
  }

  // 注册
  async function register({ username, password, nickname }) {
    const url = 'https://readapi.bluebirdabc.com/api/v1/user/register'
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, nickname })
    })
    const data = await res.json()
    if (!res.ok || !data || !data.data || !data.data.token) {
      throw new Error(data?.msg || '注册失败')
    }
    user.value = {
      ...data.data,
      username: data.data.username || username
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(user.value))
  }

  // 登出
  function logout() {
    user.value = null
    localStorage.removeItem(LOCAL_KEY)
  }

  return {
    user,
    isLoggedIn,
    login,
    register,
    logout
  }
})

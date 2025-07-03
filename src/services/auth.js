// src/stores/auth.js 
import { defineStore } from 'pinia'
import { sha1 } from 'js-sha1'
import axios from 'axios'
import { API_CONFIG } from '@/config/env'

function generateStringA(userId) {
  const base = userId.toString()
  const pad = '12345678'.slice(0, Math.max(0, 8 - base.length))
  return base + pad
}

function generateRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userId: null,
    token: null,
    nickname: '',
    grade: '',
    schoolId: null,
    schoolType: '',
    gradeId: '',
    classId: '',
    avatar: '',
    level: null,
    pid: '',
  }),

  getters: {
    isLoggedIn: (state) => !!(state.userId && state.token),
    user: (state) => {
      if (!state.userId || !state.token) return null
      return {
        userId: state.userId,
        token: state.token,
        nickname: state.nickname,
        grade: state.grade,
        schoolId: state.schoolId,
        schoolType: state.schoolType,
        gradeId: state.gradeId,
        classId: state.classId,
        avatar: state.avatar,
        level: state.level,
        pid: state.pid
      }
    }
  },

  actions: {
    setPid(pid) {
      this.pid = pid
    },

    /**
     * ✅ 提供给 App.vue 使用的无验证快速设置登录状态方法
     */
    setBasicInfo({ userId, token }) {
      this.userId = userId
      this.token = token
    },

    /**
     * ✅ 原 loginWithToken 登录方法，调用后台验证签名后拉取用户信息
     * 临时方案：不管userInfo接口成功失败都继续执行，不中断流程
     */
    async loginWithToken(userId, token, pid = '0gsv4napq9wvrmpy') {
      this.userId = userId
      this.token = token
      this.pid = pid

      const stringA = generateStringA(userId)
      const randomString = generateRandomString()
      const timestamp = Math.floor(Date.now() / 1000)
      const key = 'read.bluebirdabc.com-web-api'

      const signRaw = stringA + token + stringA + key + randomString + timestamp
      const sign = sha1(signRaw)

      const postData = {
        userId,
        token,
        sign,
        pid,
        randomString,
        timestamp,
      }

      try {
        const res = await axios.post(API_CONFIG.USER_INFO, postData)

        if (res.data.code === 0) {
          const info = res.data.data
          this.nickname = info.nickname
          this.grade = info.grade
          this.schoolId = info.school_id
          this.schoolType = info.school_type
          this.gradeId = info.grade_id
          this.classId = info.class_id
          this.avatar = info.avatar
          this.level = info.level
          console.log('用户信息获取成功')
        } else {
          console.warn('用户信息获取失败，但继续执行:', res.data.msg)
          // 临时方案：设置默认值，不抛出错误
          this.nickname = this.nickname || '用户'
        }
      } catch (err) {
        console.warn('用户信息请求异常，但继续执行:', err)
        // 临时方案：设置默认值，不抛出错误
        this.nickname = this.nickname || '用户'
      }
    },

    // 登录
    async login({ username, password }) {
      const url = API_CONFIG.USER_LOGIN
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok || !data || !data.data || !data.data.token) {
        throw new Error(data?.msg || '登录失败')
      }
      const userId = data.data.userId || data.data.user_id
      const token = data.data.token
      
      // 登录成功后调用 loginWithToken 获取完整用户信息
      await this.loginWithToken(userId, token)
    },

    // 注册
    async register({ username, password, nickname }) {
      const url = API_CONFIG.USER_REGISTER
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, nickname })
      })
      const data = await res.json()
      if (!res.ok || !data || !data.data || !data.data.token) {
        throw new Error(data?.msg || '注册失败')
      }
      const userId = data.data.userId || data.data.user_id
      const token = data.data.token
      
      // 注册成功后调用 loginWithToken 获取完整用户信息
      await this.loginWithToken(userId, token)
    },

    logout() {
      this.userId = null
      this.token = null
      this.pid = ''
      this.nickname = ''
      this.grade = ''
      this.schoolId = null
      this.schoolType = ''
      this.gradeId = ''
      this.classId = ''
      this.avatar = ''
      this.level = null
    }
  }
})

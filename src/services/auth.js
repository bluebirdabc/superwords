// src/stores/auth.js 
import { defineStore } from 'pinia'
import { sha1 } from 'js-sha1'
import axios from 'axios'

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
        const res = await axios.post('https://readapi.bluebirdabc.com/user/info', postData)

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
        } else {
          console.error('登录失败，错误信息:', res.data.msg)
          throw new Error(res.data.msg)
        }
      } catch (err) {
        console.error('登录请求异常:', err)
        throw err
      }
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

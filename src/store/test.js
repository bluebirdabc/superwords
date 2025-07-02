// src/store/test.js
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/services/auth.js'
import sha1 from 'js-sha1'

export const useTestStore = defineStore('test', {
  state: () => ({
    packet: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    micStream: null,
  }),

  getters: {
    currentQuestion(state) {
      return state.packet?.questions?.[state.currentQuestionIndex] || null
    },
    isLastQuestion(state) {
      return state.currentQuestionIndex === (state.packet?.questions?.length || 0) - 1
    }
  },

  actions: {
    requireLogin() {
      const user = useAuthStore().user
      if (!user || !user.token) {
        throw new Error('请先登录1')
      }
      return user
    },

    async ensureMicAccess() {
      this.requireLogin()
      if (this.micStream) {
        const tracks = this.micStream.getAudioTracks()
        if (tracks.length > 0 && tracks[0].readyState === 'live') return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.micStream = stream
      } catch (err) {
        throw new Error(`麦克风权限申请失败: ${err.message}`)
      }
    },

    async fetchPacket(packetId) {
      this.requireLogin()
      try {
        const { token } = useAuthStore().user || {}
        const res = await fetch(`/api/packets/${packetId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        this.packet = data
      } catch (err) {
        console.error('加载试题包失败:', err)
        throw new Error('试题包加载失败，请重试')
      }
    },

    /** ✅ 默认拉取一个题包（用于登录成功或继续学习时） */
    async fetchQuestionPacket() {
      const auth = useAuthStore()
      const user = auth.user
      if (!user || !user.token || !user.userId) {
        throw new Error('请先登录2')
      }

      const userId = user.userId
      const token = user.token
      const pid = import.meta.env.VITE_PID || 'aif8j9q38t4q78y4'  // 默认 PID 可按需修改

      // 拼接签名字段
      const stringA = userId.toString().length >= 8
        ? userId.toString()
        : userId.toString() + '12345678'.slice(userId.toString().length)
      const KEY = 'read.bluebirdabc.com-web-api'
      const randomString = Math.random().toString(36).slice(2, 18)
      const timestamp = Math.floor(Date.now() / 1000)
      const signInput = stringA + token + stringA + KEY + randomString + timestamp
      const sign = sha1(signInput)

      try {
        const res = await fetch('https://readapi.bluebirdabc.com/api/question-packet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            token,
            pid,
            sign,
            randomString,
            timestamp
          })
        })

        const raw = await res.json()

        if (raw.code !== 0) {
          throw new Error(raw.msg || '题包获取失败')
        }

        const { parsePacket } = await import('@/api/parser.js')
        const parsed = parsePacket(raw.data)

        this.packet = parsed
        this.currentQuestionIndex = 0
        this.userAnswers = {}
      } catch (err) {
        console.error('题包获取失败：', err)
        throw new Error(err.message || '题包获取失败，请稍后重试')
      }
    },

    submitAnswerAndGoNext(questionId, answer) {
      this.userAnswers[questionId] = answer
      if (!this.isLastQuestion) {
        this.currentQuestionIndex++
      } else {
        const router = useRouter()
        router.push('/test/result')
      }
    }
  }
})

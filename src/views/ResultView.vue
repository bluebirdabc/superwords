<!-- src/views/ResultView.vue -->
<template>
  <div class="question-content">
    <h2 style="color: var(--accent-color);">测试已结束</h2>
    <p style="margin: 20px 0; font-size: 1.2rem;">感谢您的参与！</p>
    <p>以下是你刚才单词测试的结果。</p>

    <!-- 按钮组 -->
    <div style="margin-top: 30px; display: flex; gap: 1rem;">
      <button @click="goHome">返回首页</button>
      <button @click="continueLearning" :disabled="isLoading">
        {{ isLoading ? '加载中…' : '继续学习' }}
      </button>
    </div>

    <!-- 状态提示 -->
    <p v-if="errorMsg" style="color: red; margin-top: 1rem;">⚠️ {{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTestStore } from '@/store/test'
import { useAuthStore } from '@/services/auth'

const router = useRouter()
const testStore = useTestStore()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMsg = ref('')

const goHome = () => {
  router.push('/')
}

const continueLearning = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    // 先校验登录
    const user = authStore.user
    if (!user || !user.userId || user.level === undefined) {
      throw new Error('用户信息不完整，请重新登录')
    }

    const isFirstLogin = user.level === 0
    await testStore.fetchQuestionPacket({
      userId: user.userId,
      level: user.level,
      isFirstLogin
    })

    router.push('/testing')
  } catch (err) {
    errorMsg.value = err.message || '继续学习失败'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 8px;
  background-color: var(--accent-color, #007BFF);
  color: white;
  border: none;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

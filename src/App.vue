<template>
  <div class="background-grid"></div>
  <div class="main-card-background"></div>
  <div class="main-card-wrapper">
    <!-- 顶栏：模拟浏览器窗口 -->
    <header class="card-header">
      <div class="window-buttons">
        <span class="btn red"></span>
        <span class="btn yellow"></span>
        <span class="btn green"></span>
      </div>
      <div class="header-title">
        Standardized English Proficiency Exam
      </div>
      <div class="header-right">
        <GlobalHeader />
      </div>
    </header>

    <!-- 内容区 -->
    <div class="card-content">
      <router-view @update-submit-status="updateSubmitStatus" />
      <div v-if="isTestingPage" class="footer-submit-area">
        <div
          class="image-submit-button"
          :class="{ disabled: isSubmitDisabled }"
          @click="triggerSubmit"
        >
          <img :src="submitButtonImage" alt="提交" />
        </div>
      </div>
    </div>
  </div>

  <!-- 登录注册弹窗 -->
  <AuthDialog
    v-model="ui.authDialogVisible"
    :mode="ui.authDialogMode"
    @login-success="onLoginSuccess"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import AuthDialog from '@/components/common/AuthDialog.vue'
import { useUiStore } from '@/store/ui'
import { useAuthStore } from '@/services/auth'

const ui = useUiStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

function onLoginSuccess(payload) {
  ui.closeAuthDialog()
  ui.setLoginInfo(payload)
  localStorage.setItem('token', payload.token)
  localStorage.setItem('userId', payload.userId)
}

const isTestingPage = computed(() => route.path === '/testing')
const isSubmitDisabled = ref(true)
const submitAction = ref(null)

function updateSubmitStatus({ disabled, action }) {
  isSubmitDisabled.value = disabled
  submitAction.value = action
}

let sfxCoolDown = false
const sfxSrc =
  'https://static.bluebirdabc.com/lesson/material/aif8j9q38t4q78y4/855/bdd3410079912e0947fe25843d62f0e63ac131c2.mp3'

function triggerSubmit() {
  if (isSubmitDisabled.value) return
  if (!sfxCoolDown) {
    sfxCoolDown = true
    new Audio(sfxSrc).play().catch(() => {})
    setTimeout(() => (sfxCoolDown = false), 300)
  }
  if (typeof submitAction.value === 'function') submitAction.value()
}

const submitButtonImages = {
  active: 'https://static.bluebirdabc.com/ai-agent/img/tasks/4066faff57c614344d95b1c46f0d74cb2022fd13.png',
  disabled: 'https://static.bluebirdabc.com/ai-agent/img/tasks/4126b680c6671d6cd039fa25aedc022d49cd3815.png'
}
const submitButtonImage = computed(() =>
  isSubmitDisabled.value ? submitButtonImages.disabled : submitButtonImages.active
)

// ✅ 检查URL参数并自动登录的函数
async function checkUrlParamsAndAutoLogin() {
  console.log('🔍 检查URL参数函数执行了')
  console.log('🔍 当前URL:', window.location.href)
  console.log('🔍 window.location.search:', window.location.search)
  console.log('🔍 window.location.hash:', window.location.hash)
  
  // 尝试从search获取参数
  const searchQuery = new URLSearchParams(window.location.search)
  let token = searchQuery.get('token')
  let userId = searchQuery.get('user_id')
  
  // 如果search中没有，尝试从hash中获取
  if (!token || !userId) {
    const hash = window.location.hash
    const queryString = hash.includes('?') ? hash.split('?')[1] : ''
    const hashQuery = new URLSearchParams(queryString)
    token = hashQuery.get('token')
    userId = hashQuery.get('user_id')
    console.log('🔍 从hash中解析:', { queryString, token, userId })
  }
  
  console.log('🔍 最终参数:', { token, userId })

  if (token && userId) {
    try {
      await auth.loginWithToken(userId, token)
      onLoginSuccess({ token, userId })
      console.log('✅ URL参数自动登录成功')
    } catch (err) {
      console.error('❌ Token 自动登录失败:', err.message)
    }
  } else {
    console.log('⚠️ 未找到有效的URL参数')
  }
}

// App组件挂载时检查
onMounted(async () => {
  console.log('🔍 App.vue onMounted 执行了')
  await checkUrlParamsAndAutoLogin()
})

// 监听路由变化，每次路由变化时也检查URL参数
watch(() => route.fullPath, async () => {
  console.log('🔍 路由变化了:', route.fullPath)
  await checkUrlParamsAndAutoLogin()
}, { immediate: true })
</script>

<style>
body {
  font-family: 'SimHei', 'Microsoft YaHei', sans-serif;
  background: #edf5fb;
  margin: 0;
}
.background-grid {
  position: fixed;
  inset: 0;
  background: #edf5fb;
  z-index: 0;
}
.main-card-background {
  position: absolute;
  top: 40px;
  left: 40px;
  width: 90vw;
  max-width: 1050px;
  height: 82vh;
  max-height: 690px;
  background: #84d600;
  border-radius: 30px;
  transform: rotate(-4deg);
  z-index: 1;
  box-shadow: 0 8px 24px #0001;
}
.main-card-wrapper {
  position: relative;
  width: 90vw;
  max-width: 1050px;
  min-height: 600px;
  margin: 60px auto 0 auto;
  background: #fff;
  border-radius: 26px;
  z-index: 2;
  box-shadow: 0 8px 36px #0002;
  display: flex;
  flex-direction: column;
}
.card-header {
  position: relative;
  display: flex;
  align-items: center;
  height: 60px;
  background: #6fe3c1;
  border-top-left-radius: 26px;
  border-top-right-radius: 26px;
  box-sizing: border-box;
  padding-left: 24px;
  padding-right: 24px;
}
.window-buttons {
  display: flex;
  gap: 7px;
  margin-right: 18px;
}
.btn {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  margin-top: 2px;
}
.btn.red {
  background: #ff6565;
}
.btn.yellow {
  background: #ffc940;
}
.btn.green {
  background: #54e060;
}
.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.7rem;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 2px 10px #0002;
  font-family: 'Comic Sans MS', 'Baloo 2', 'Microsoft YaHei', sans-serif;
  text-align: center;
}
.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  height: 100%;
}
.card-content {
  flex: 1;
  padding: 36px 5vw 18px 5vw;
  display: flex;
  flex-direction: column;
}
.footer-submit-area {
  padding: 20px;
  margin-top: auto;
  display: flex;
  justify-content: center;
  border-top: 1px solid #eee;
  background-color: #fff;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}
.image-submit-button {
  cursor: pointer;
}
.image-submit-button img {
  height: 100px;
  width: auto;
  transition: transform 0.2s ease;
}
.image-submit-button:not(.disabled) img:hover {
  transform: scale(1.15);
}
.image-submit-button.disabled {
  cursor: not-allowed;
}
@media (max-width: 600px) {
  .main-card-background,
  .main-card-wrapper {
    width: 98vw;
    min-width: 0;
    max-width: 100vw;
    height: auto;
    min-height: 80vh;
    margin: 2vw auto 0 auto;
    border-radius: 18px;
  }
  .main-card-background {
    top: 15px;
    left: 10px;
    border-radius: 18px;
  }
  .main-card-wrapper {
    border-radius: 18px;
  }
  .card-header {
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    padding: 0 12px;
  }
  .card-content {
    padding: 18px 2vw 8px 2vw;
  }
}
</style>

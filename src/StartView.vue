<!-- ────────────────────────────────────────────────
     src/views/StartView.vue
     背景音乐只在离开本页 / 进入测试时停止
────────────────────────────────────────────────── -->
<template>
  <div class="question-content start-view-content">
    <h2 class="main-title">万词背单词——请开始今天的背诵任务</h2>
    <p class="prompt-text">请点击下方动画，进入测试</p>

    <!-- ① 欢迎遮罩：静态图 → GIF -->
    <div v-if="showWelcomeOverlay" class="welcome-overlay">
      <!-- 静态图（等待点击） -->
      <img
        v-if="!isPlayingWelcomeGif"
        class="welcome-static"
        :src="staticImg"
        alt="欢迎"
        @click="playWelcomeGif"
      />
      <!-- 动图（播放 2 s 后淡出） -->
      <img
        v-else
        class="welcome-gif"
        :src="welcomeGif"
        alt="欢迎动画"
      />
    </div>

    <!-- ② 主页面：开始测试按钮 -->
    <div
      v-if="!showWelcomeOverlay"
      class="image-button-container"
      @click="startTest"
      :class="{ disabled: isLoading }"
    >
      <img :src="startGif" alt="开始测试" />
      <!-- 加载 / 错误提示 -->
      <div v-if="isLoading || statusMessage" class="status-overlay">
        <p :style="{ color: statusColor }">
          {{ statusMessage || '准备中…' }}
        </p>
      </div>
    </div>

    <!-- ③ 登录弹窗（v-model 控制，兼容全局入口） -->
    <AuthDialog
      v-model="authDialogVisible"
      @login-success="onLoginSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, nextTick } from 'vue'
import { useRouter }    from 'vue-router'
import { useTestStore } from '@/store/test'
import { useAuthStore } from '@/services/auth'
import AuthDialog       from '@/components/common/AuthDialog.vue'

/* -------------- 1. 资源常量 ---------------- */
const staticImg  = 'https://static.bluebirdabc.com/ai-agent/img/tasks/37cec56a342d0c475dcebd44655c21489ace9560.png'
const welcomeGif = 'https://static.bluebirdabc.com/ai-agent/img/tasks/f985225306f2427cb225803dfb947fea8cd7f7b1.gif'
const startGif   = 'https://static.bluebirdabc.com/ai-agent/img/tasks/a524ad22824f549802316f1cd93aa0837e630b8b.gif'
const AUDIO_URL  = 'https://static.bluebirdabc.com/lesson/material/aif8j9q38t4q78y4/855/4ef85684bea6ddfcde6ad6efdcb22662dfb1ace4.mp3'

/* -------------- 2. 基础状态 ---------------- */
const router     = useRouter()
const testStore  = useTestStore()
const authStore  = useAuthStore()

const showWelcomeOverlay  = ref(true)
const isPlayingWelcomeGif = ref(false)

const isLoading      = ref(false)
const statusMessage  = ref('')
const statusColor    = ref('black')

const authDialogVisible = ref(false)
let   pendingStart      = false   // 登录成功后继续 startTest

/* -------------- 3. 背景音乐 ---------------- */
let bgAudioEl = null
function playBgAudio () {
  if (!bgAudioEl) {
    bgAudioEl          = document.createElement('audio')
    bgAudioEl.src      = AUDIO_URL
    bgAudioEl.loop     = true
    bgAudioEl.preload  = 'auto'
    bgAudioEl.volume   = 0.2
    document.body.appendChild(bgAudioEl)
  }
  // iOS 必须在用户手势里触发
  bgAudioEl.play().catch(() => {})
}
function stopAndRemoveBgAudio () {
  if (bgAudioEl) {
    bgAudioEl.pause()
    bgAudioEl.src = ''
    bgAudioEl.remove()
    bgAudioEl = null
  }
}

/* -------------- 4. 欢迎动图 ---------------- */
function playWelcomeGif () {
  // (A) 播音乐 —— 与同一次手势绑定
  playBgAudio()

  // (B) 切 GIF + 2 s 后淡出遮罩
  isPlayingWelcomeGif.value = true
  nextTick(() => {
    setTimeout(() => {
      showWelcomeOverlay.value  = false
      isPlayingWelcomeGif.value = false
    }, 2000)
  })
}

/* -------------- 5. 进入测试主流程 ---------- */
async function startTest () {
  if (isLoading.value) return

  // 若未登录 → 弹窗
  if (!authStore.isLoggedIn) {                   // ← pinia getter
    authDialogVisible.value = true
    pendingStart = true
    return
  }

  // 已登录 → 继续
  await doStartTest()
}

async function onLoginSuccess () {
  if (pendingStart) {
    pendingStart = false
    await doStartTest()
  }
}

async function doStartTest () {
  isLoading.value     = true
  statusMessage.value = '正在请求麦克风权限，请允许…'
  statusColor.value   = 'black'

  try {
    await testStore.ensureMicAccess()
    sessionStorage.setItem('micGranted', '1')

    // 成功后才停音乐，再跳转
    stopAndRemoveBgAudio()

    statusMessage.value = '授权成功，即将进入测试…'
    setTimeout(() => router.push('/testing'), 800)
  } catch (err) {
    statusMessage.value =
      `⚠️ ${err.message || '麦克风授权失败，无法进行语音题。'}`
    statusColor.value = 'red'
    setTimeout(() => {
      isLoading.value    = false
      statusMessage.value = ''
    }, 2000)
  }
}

/* -------------- 6. 页面卸载清理 ---------- */
onBeforeUnmount(stopAndRemoveBgAudio)
</script>

<style scoped>
/* —— 页面排版 —— */
.start-view-content { justify-content:space-around; padding:5vh 0; gap:2rem; }
.main-title         { font-size:2rem; color:#333; text-align:center; }
.prompt-text        { font-size:1.2rem; color:#666; }

/* —— 主按钮 —— */
.image-button-container{
  position:relative; cursor:pointer; border-radius:20px;
  transition:transform .2s, box-shadow .2s;
}
.image-button-container:hover:not(.disabled){
  transform:translateY(-5px); box-shadow:0 10px 20px rgba(0,0,0,.1);
}
.image-button-container img{
  display:block; max-width:300px; width:100%; height:auto; border-radius:20px;
}
.image-button-container.disabled{ cursor:not-allowed; }

/* —— 状态蒙层 —— */
.status-overlay{
  position:absolute; inset:0; background:rgba(255,255,255,.8);
  display:flex; justify-content:center; align-items:center;
  border-radius:20px; font-size:1.2rem; font-weight:700;
  text-align:center; padding:20px;
}

/* —— 欢迎遮罩 —— */
.welcome-overlay{
  position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:9999;
  display:flex; justify-content:center; align-items:center;
}
.welcome-static, .welcome-gif{
  width:340px; height:340px; border-radius:16px;
  box-shadow:0 2px 24px #0006; background:#fff; object-fit:cover;
}
.welcome-static{ cursor:pointer; }
.welcome-gif   { cursor:default; }
</style>

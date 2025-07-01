<!-- src/components/questions/QuestionYY03.vue -->
<template>
  <div class="question-yy03">
    <h3>{{ question.data.title || '听力选择' }}</h3>
    <p class="question-text">{{ question.data.text }}</p>

    <!-- 音频播放按钮 -->
    <div class="audio-player">
      <button @click="handlePlay" :disabled="isPlaying || playCount <= 0">
        <span v-if="!isPlaying">▶️ 播放音频（{{ playCountText }}）</span>
        <span v-else>🎵 播放中…</span>
      </button>
    </div>

    <!-- 选项 -->
    <div class="options-list">
      <div
        v-for="([key, txt]) in optionEntries"
        :key="key"
        class="option-item"
        :class="{ selected: selectedAnswer === key }"
        @click="selectAnswer(key)"
      >
        <span class="option-key">{{ key }}</span>
        <span class="option-text">{{ txt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { playWithNewElement } from '@utils/audio.js'   // fallback 播放 util

/* ---------- props / emit ---------- */
const props = defineProps({ question: { type: Object, required: true } })
const emit  = defineEmits(['submit-answer', 'update-submit-status'])

/* ---------- 播放状态 ---------- */
const isPlaying   = ref(false)
const playCount   = ref(props.question.data.maxPlays ?? 3)
const playCountText = computed(() => `剩余 ${playCount.value} 次`)

/* Web Audio 相关对象（失败时走 fallback） */
let ctx        = null  // AudioContext
let gainNode   = null
let srcNode    = null
let fallbackEl = null  // <audio> 元素 fallback

/* ---------- 播放入口 ---------- */
async function handlePlay () {
  if (isPlaying.value || playCount.value <= 0) return
  isPlaying.value = true
  playCount.value--

  try {
    await playViaWebAudio(props.question.data.audioUrl)
  } catch (err) {
    /* Web Audio 失败 → fallback */
    console.warn('[YY03] WebAudio failed, fallback <audio>', err)
    fallbackEl = await playWithNewElement(props.question.data.audioUrl)
    fallbackEl.onended = onEnded
  }
}

/* ---------- 使用 Web Audio 播放，避免二次减音量 ---------- */
async function playViaWebAudio (url) {
  /* 1. 创建 / 复用 AudioContext */
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()

  /* 2. 获取并解码音频数据（每次都新解码 → 重播也正常） */
  const arrayBuf = await fetch(url).then(r => r.arrayBuffer())
  const audioBuf = await ctx.decodeAudioData(arrayBuf)  // 部分旧 iOS 可能抛错

  /* 3. 创建 GainNode（一次即可复用） */
  if (!gainNode) {
    gainNode = ctx.createGain()
    gainNode.gain.value = 1
    gainNode.connect(ctx.destination)
  }

  /* 4. 创建 BufferSource，连到 GainNode，开始播放 */
  srcNode = ctx.createBufferSource()
  srcNode.buffer = audioBuf
  srcNode.connect(gainNode)
  srcNode.start()

  /* 5. 播放结束回调 */
  srcNode.onended = onEnded
}

/* ---------- 停止播放 & 清理 ---------- */
function onEnded () { stopPlayback() }

function stopPlayback () {
  /* Web Audio */
  if (srcNode)  { try { srcNode.stop(); srcNode.disconnect() } catch {} srcNode = null }
  /* fallback <audio> */
  if (fallbackEl){ fallbackEl.pause(); fallbackEl = null }

  isPlaying.value = false
}

/* ---------- 选项 & 提交 ---------- */
const optionEntries   = computed(() => Object.entries(props.question.data.options || {}))
const selectedAnswer  = ref(null)
const selectAnswer    = key => { selectedAnswer.value = key }

const isSubmitDisabled = computed(() => selectedAnswer.value === null)
const submit = () => emit('submit-answer', { type: 'YY03', answer: selectedAnswer.value })
watch(isSubmitDisabled, disabled => {
  emit('update-submit-status', { disabled, action: submit })
},{ immediate: true })

/* ---------- 卸载清理 ---------- */
onUnmounted(() => {
  stopPlayback()
  if (ctx) ctx.close().catch(()=>{})
})
</script>

<style scoped>
.question-yy03{width:100%;display:flex;flex-direction:column;align-items:center;gap:20px}
.audio-player button{padding:12px 24px;font-size:1.1rem}
.question-text{font-size:1.2rem;margin-bottom:10px}
.options-list{width:100%;display:flex;flex-direction:column;gap:10px}
.option-item{border:1px solid #ccc;border-radius:8px;padding:15px;cursor:pointer;transition:.2s;display:flex;align-items:center}
.option-item:hover{border-color:var(--primary-color);background:#f0f8ff}
.option-item.selected{background:var(--primary-color);color:#fff;border-color:var(--primary-color)}
.option-key{font-weight:700;margin-right:15px;border:1px solid;border-radius:50%;width:30px;height:30px;display:inline-flex;justify-content:center;align-items:center;flex-shrink:0}
</style>

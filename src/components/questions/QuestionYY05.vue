<!-- src/components/questions/QuestionYY05.vue -->
<template>
  <div class="question-yy05">
    <h3>{{ question.data.title || '听力理解' }}</h3>

    <!-- ▶️ 音频播放按钮 -->
    <div class="audio-player">
      <button @click="handlePlay" :disabled="isPlaying || playCount <= 0">
        <span v-if="!isPlaying">▶️ 播放音频（{{ playCountText }}）</span>
        <span v-else>🎵 播放中…</span>
      </button>
    </div>

    <p class="question-text">{{ question.data.text }}</p>

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
import { playWithNewElement } from '@/utils/audio.js'           // fallback ⬇
/* 若你已将 WebAudio 封装 util，可独立引用；此处直接写在组件里 */

const props = defineProps({ question: { type: Object, required: true } })
const emit  = defineEmits(['submit-answer', 'update-submit-status'])

/* ------------------------------------------------------------
 * ① 音频播放：Web Audio → fallback <audio>
 * ---------------------------------------------------------- */
const isPlaying  = ref(false)
const playCount  = ref(props.question.data.maxPlays ?? 3)
const playCountText = computed(() => `剩余 ${playCount.value} 次`)

let ctx        = null      // AudioContext
let gainNode   = null
let srcNode    = null
let fallbackEl = null

async function handlePlay () {
  if (isPlaying.value || playCount.value <= 0) return
  isPlaying.value = true
  playCount.value--

  try {
    await playViaWebAudio(props.question.data.audioUrl)
  } catch (err) {
    console.warn('[YY05] WebAudio failed, fallback <audio>', err)
    fallbackEl = playWithNewElement(props.question.data.audioUrl)
    fallbackEl.onended = onEnded
  }
}

async function playViaWebAudio (url) {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()

  // 每次播放都重新 decode，避免二次播放音量骤减
  const arrayBuf = await fetch(url).then(r => r.arrayBuffer())
  const audioBuf = await ctx.decodeAudioData(arrayBuf)

  if (!gainNode) {
    gainNode = ctx.createGain()
    gainNode.gain.value = 1
    gainNode.connect(ctx.destination)
  }

  srcNode = ctx.createBufferSource()
  srcNode.buffer = audioBuf
  srcNode.connect(gainNode)
  srcNode.start()
  srcNode.onended = onEnded
}

function stopPlay () {
  if (srcNode)   { try { srcNode.stop(); srcNode.disconnect() } catch {} srcNode = null }
  if (fallbackEl){ fallbackEl.pause(); fallbackEl = null }
  isPlaying.value = false
}
function onEnded () { stopPlay() }

/* ------------------------------------------------------------
 * ② 选项逻辑
 * ---------------------------------------------------------- */
const optionEntries  = computed(() => Object.entries(props.question.data.options || {}))
const selectedAnswer = ref(null)
const selectAnswer   = key => { selectedAnswer.value = key }

/* ------------------------------------------------------------
 * ③ 提交逻辑
 * ---------------------------------------------------------- */
const isSubmitDisabled = computed(() => selectedAnswer.value === null)
const submit = () => {
  emit('submit-answer', { type: 'YY05', answer: selectedAnswer.value })
}
watch(isSubmitDisabled, disabled => {
  emit('update-submit-status', { disabled, action: submit })
}, { immediate: true })

/* ------------------------------------------------------------
 * ④ 清理
 * ---------------------------------------------------------- */
onUnmounted(() => {
  stopPlay()
  if (ctx) ctx.close().catch(() => {})
})
</script>

<style scoped>
.question-yy05{width:100%;display:flex;flex-direction:column;align-items:center;gap:20px}
.audio-player button{padding:12px 24px;font-size:1.1rem}
.question-text{font-size:1.3rem;font-weight:700;margin-bottom:10px;text-align:center}
.options-list{width:100%;max-width:600px;display:flex;flex-direction:column;gap:10px}
.option-item{border:1px solid #ccc;border-radius:8px;padding:15px;cursor:pointer;transition:.2s;display:flex;align-items:flex-start;text-align:left}
.option-item:hover{border-color:var(--primary-color);background:#f0f8ff}
.option-item.selected{background:var(--primary-color);color:#fff;border-color:var(--primary-color)}
.option-key{font-weight:700;margin-right:15px;border:1px solid currentColor;border-radius:50%;width:30px;height:30px;display:inline-flex;justify-content:center;align-items:center;flex-shrink:0}
.option-text{line-height:1.5}
</style>

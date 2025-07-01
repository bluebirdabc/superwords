<!-- src/components/questions/QuestionYY04.vue -->
<template>
  <div class="question-yy04">
    <!-- 标题居中 -->
    <h3 class="centered-title">{{ question.data.title || '听力填空' }}</h3>

    <!-- ▶️ 音频播放按钮 -->
    <div class="audio-player">
      <button @click="handlePlay" :disabled="isPlaying || playCount <= 0">
        <span v-if="!isPlaying">▶️ 播放音频（{{ playCountText }}）</span>
        <span v-else>🎵 播放中…</span>
      </button>
    </div>

    <!-- 句子 + 输入框 -->
    <div class="sentence-container">
      <span class="sentence-part before">{{ sentenceParts.before }}</span>

      <div class="inputs-wrapper" ref="inputsWrapperRef">
        <input
          v-for="idx in answerLen"
          :key="idx"
          class="char-input"
          type="text"
          maxlength="1"
          v-model="userAnswer[idx - 1]"
          @compositionstart="onCompStart"
          @compositionend   ="e => handleInput(idx - 1, answerLen, e)"
          @input            ="e => !isComposing && handleInput(idx - 1, answerLen, e)"
          @keydown.backspace="handleBackspace(idx - 1, $event)"
          autocapitalize="off" autocomplete="off" autocorrect="off"
          spellcheck="false"  inputmode="latin"
        />
      </div>

      <span class="sentence-part after">{{ sentenceParts.after }}</span>
    </div>
  </div>
</template>

<script setup>
/* ------------------------------------------------------------
 * Imports & util
 * ---------------------------------------------------------- */
import { ref, computed, watch, onUnmounted } from 'vue'
import { useEnhancedInputs }    from '@/composables/useEnhancedInputs.js'
import { playWithNewElement }   from '@/utils/audio.js'          // fallback
/* 若你已把 WebAudio 逻辑抽成 util，可改为 import { playViaWebAudio } … */

/* ---------- props / emit ---------- */
const props = defineProps({ question: { type: Object, required: true } })
const emit  = defineEmits(['submit-answer', 'update-submit-status'])

/* ------------------------------------------------------------
 * ① 音频播放（与 YY03 同策略）
 * ---------------------------------------------------------- */
const isPlaying = ref(false)
const playCount = ref(props.question.data.maxPlays ?? 3)
const playCountText = computed(() => `剩余 ${playCount.value} 次`)

let ctx         = null   // AudioContext
let gainNode    = null
let srcNode     = null
let fallbackEl  = null

async function handlePlay () {
  if (isPlaying.value || playCount.value <= 0) return
  isPlaying.value = true
  playCount.value--

  try {
    await playViaWebAudio(props.question.data.audioUrl)
  } catch (err) {
    console.warn('[YY04] WebAudio failed, fallback to <audio>', err)
    fallbackEl = playWithNewElement(props.question.data.audioUrl)
    fallbackEl.onended = onEnded
  }
}

async function playViaWebAudio (url) {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()

  // 每次都重新解码并创建 BufferSource，避免二次音量骤减
  const audioBuf = await fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => ctx.decodeAudioData(buf))

  if (!gainNode) {
    gainNode = ctx.createGain()
    gainNode.gain.value = 1
    gainNode.connect(ctx.destination)
  }

  srcNode = ctx.createBufferSource()
  srcNode.buffer = audioBuf
  srcNode.connect(gainNode)
  srcNode.start(0)
  srcNode.onended = onEnded
}

function stopPlay () {
  if (srcNode)   { try { srcNode.stop(); srcNode.disconnect() } catch {} srcNode = null }
  if (fallbackEl){ fallbackEl.pause(); fallbackEl = null }
  isPlaying.value = false
}
function onEnded () { stopPlay() }

/* ------------------------------------------------------------
 * ② 输入框逻辑（保持原来的 useEnhancedInputs）
 * ---------------------------------------------------------- */
const isComposing = ref(false)
const onCompStart = () => { isComposing.value = true }

const answerLen   = computed(() => props.question.data.answer.length)
const userAnswer  = ref(Array(answerLen.value).fill(''))

const {
  inputsWrapperRef,
  handleInput,
  handleBackspace
} = useEnhancedInputs(userAnswer, isComposing)

const sentenceParts = computed(() => {
  const [before = '', after = ''] = props.question.data.text.split('___')
  return { before, after }
})

/* ------------------------------------------------------------
 * ③ 提交逻辑
 * ---------------------------------------------------------- */
const isSubmitDisabled = computed(
  () => userAnswer.value.join('').length !== answerLen.value
)

const submit = () => {
  emit('submit-answer', {
    type  : 'YY04',
    answer: userAnswer.value.join('')
  })
}

watch(isSubmitDisabled, disabled => {
  emit('update-submit-status', { disabled, action: submit })
}, { immediate: true })

/* ------------------------------------------------------------
 * ④ 组件卸载：停止播放 & 关闭 AudioContext
 * ---------------------------------------------------------- */
onUnmounted(() => {
  stopPlay()
  if (ctx) ctx.close().catch(() => {})
})
</script>

<style scoped>
.question-yy04{width:100%;display:flex;flex-direction:column;gap:25px}
.centered-title{text-align:center}
.audio-player{display:flex;justify-content:center}
.audio-player button{padding:12px 24px;font-size:1.1rem}
.sentence-container{font-size:1.5rem;display:flex;align-items:center;flex-wrap:wrap;gap:10px;line-height:1.6}
.sentence-part{white-space:pre-wrap;font-family:'Courier New',Courier,monospace}
.inputs-wrapper{display:flex;gap:5px;white-space:nowrap}
.char-input{width:40px;height:50px;border:1px solid #ccc;border-radius:6px;text-align:center;font-size:1.5rem;font-family:inherit;color:var(--primary-color);font-weight:bold}
.char-input:focus{outline:none;border-color:var(--primary-color);box-shadow:0 0 5px rgba(74,144,226,.5)}
</style>

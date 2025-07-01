<!-- src/components/common/UnifiedRecorder.vue -->
<template>
  <div class="oral-interaction-area">
    <!-- ① Idle -->
    <div v-if="uiState === 'idle'" class="state-idle">
      <img :src="icons.mic" class="mic-lg" @click="toggleRecording" alt="mic" />
      <p>点击左侧按钮<br />开始录音</p>
    </div>

    <!-- ② Recording -->
    <div v-else-if="uiState === 'recording'" class="state-recording">
      <img :src="icons.stop" class="stop-icon" @click="toggleRecording" alt="stop" />
      <div class="countdown">
        <!-- key 用秒值即可，避免重复 key 警告 -->
        <span v-for="d in timerDigits" :key="d" class="digit">{{ d }}</span>
      </div>
    </div>

    <!-- ③ Stopped -->
    <div v-else class="state-finished">
      <img :src="icons.mic" class="mic-sm" @click="toggleRecording" alt="rec-again" />
      <p>录音结束<br />重录或重听</p>
      <img
        :src="isPlaying ? icons.stopPlay : icons.play"
        class="play-icon"
        @click="togglePlay"
        :alt="isPlaying ? '停止播放' : '播放录音'"
      />
    </div>

    <!-- 极老安卓备用 <audio> -->
    <audio ref="playerEl" @ended="onPlayEnded" />

    <p v-if="errMsg" class="err">{{ errMsg }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { RecorderService }     from '@/services/recorder.js'
import { playWithNewElement }  from '@/utils/audio.js'      // ✅ utils 拼写正确

/* -------------------------------------------------- */
/* 静态资源                                           */
/* -------------------------------------------------- */
const icons = {
  mic      : 'https://static.bluebirdabc.com/ai-agent/img/tasks/65b64131c75131470060b163a842ea1ed86fb56d.png',
  play     : 'https://static.bluebirdabc.com/ai-agent/img/tasks/8e0a8ab174123e596ec1beb7a3b8d0ccc8d59ddb.png',
  stopPlay : 'https://static.bluebirdabc.com/ai-agent/img/tasks/c9246cf7d23413a2e21183e7fad6f79a54867cba.png',
  stop     : 'https://static.bluebirdabc.com/ai-agent/img/tasks/eca4f1a182cae877044706bb77972d58a1fe90c3.png'
}

/* -------------------------------------------------- */
/* 状态                                               */
/* -------------------------------------------------- */
const MAX_SEC   = 30
const uiState   = ref('idle')         // idle | recording | stopped
const timeLeft  = ref(MAX_SEC)
const isPlaying = ref(false)
const errMsg    = ref('')
const blobRef   = ref(null)

let timerId    = null
let ctx        = null                 // AudioContext（Web Audio）
let srcNode    = null                 // BufferSource
let gainNode   = null
let fallbackEl = null                 // <audio>
const emit     = defineEmits(['record-complete'])

/* -------------------------------------------------- */
/* 录音                                               */
/* -------------------------------------------------- */
async function toggleRecording () {
  uiState.value === 'recording' ? await stopRec() : await startRec()
}

async function startRec () {
  try {
    await RecorderService.start()
    blobRef.value = null
    uiState.value = 'recording'
    startTimer()
  } catch (e) {
    errMsg.value = e.message || '无法开始录音'
  }
}

async function stopRec () {
  clearInterval(timerId)
  try {
    const res = await RecorderService.stop()
    uiState.value = res ? 'stopped' : 'idle'
    if (res) {
      blobRef.value = res.blob
      emit('record-complete', res.blob)
    }
  } catch (e) {
    errMsg.value = e.message || '停止录音失败'
    uiState.value = 'idle'
  }
}

/* -------------------------------------------------- */
/* 倒计时                                             */
/* -------------------------------------------------- */
function startTimer () {
  timeLeft.value = MAX_SEC
  timerId = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value === 0) stopRec()
  }, 1_000)
}
const timerDigits = computed(() =>
  `00:${String(timeLeft.value).padStart(2, '0')}`.split('')
)

/* -------------------------------------------------- */
/* 播放                                               */
/* -------------------------------------------------- */
function togglePlay () {
  if (!blobRef.value) return
  isPlaying.value ? stopPlay() : playBlob(blobRef.value)
}

async function playBlob (blob) {
  stopPlay()

  try {
    if (window.AudioContext || window.webkitAudioContext) {
      ctx ??= new (window.AudioContext || window.webkitAudioContext)()
      if (!gainNode) {
        gainNode = ctx.createGain()
        gainNode.gain.value = 1
        gainNode.connect(ctx.destination)
      }

      const buf = await blob.arrayBuffer()
      const audioBuf = await ctx.decodeAudioData(buf)          // iOS 15 某些机会 PARSE_ERROR
      srcNode = ctx.createBufferSource()
      srcNode.buffer = audioBuf
      srcNode.connect(gainNode)
      srcNode.start()
      srcNode.onended = stopPlay
    } else {
      throw new Error('NoAudioContext')
    }
    isPlaying.value = true
  } catch (err) {
    console.warn('[Audio] WebAudio failed, fallback <audio>', err)
    fallbackEl = playWithNewElement(blob)                      // utils 里的一次性 <audio>
    isPlaying.value = true
    fallbackEl.onended = stopPlay
  }
}

function stopPlay () {
  if (srcNode)  { try { srcNode.stop(); srcNode.disconnect() } catch {} srcNode = null }
  if (fallbackEl){ fallbackEl.pause(); fallbackEl = null }
  isPlaying.value = false
}

function onPlayEnded () { stopPlay() }

/* -------------------------------------------------- */
/* 清理                                               */
/* -------------------------------------------------- */
onUnmounted(() => {
  clearInterval(timerId)
  stopPlay()
  if (ctx) ctx.close().catch(() => {})
  if (RecorderService.isRecording) RecorderService.stop()
})
</script>

<style scoped>
.oral-interaction-area{width:100%;max-width:90vw;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:3vw}
.state-idle,.state-finished{display:flex;align-items:center;gap:3vw;color:#555;text-align:center;line-height:1.4;flex-wrap:wrap}
.state-recording{display:flex;align-items:center;gap:3vw;flex-wrap:wrap}
.mic-lg,.mic-sm,.play-icon,.stop-icon{height:20vw;max-height:100px;width:auto}
.mic-sm{height:12vw;max-height:60px}
.countdown{display:flex;gap:1vw;font-family:'Courier New',monospace;font-size:6vw;font-weight:bold;color:#333}
.digit{background:#e0e0e0;padding:1vw 2vw;border-radius:5px;min-width:8vw;text-align:center}
.digit:nth-child(3){background:none}
.err{color:#e74c3c;font-size:.9rem;text-align:center;margin-top:6px}
</style>

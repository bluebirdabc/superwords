<template>
  <div class="recorder-wrapper">
    <div v-if="status === 'idle'" class="recorder-state idle">
      <img :src="micIcon" alt="开始录音" class="icon" @click="startRecording" />
      <p>点击左侧按钮<br />开始录音</p>
    </div>

    <div v-else-if="status === 'recording'" class="recorder-state recording">
      <img :src="stopIcon" alt="结束录音" class="icon" @click="stopRecording" />
      <div class="countdown">
        <span v-for="(digit, index) in timerDigits" :key="index" class="digit">{{ digit }}</span>
      </div>
    </div>

    <div v-else-if="status === 'finished'" class="recorder-state finished">
      <img :src="micIcon" alt="重新录音" class="icon" @click="startRecording" />
      <p>录音结束<br />重录或重听</p>
      <img :src="playIcon" alt="播放录音" class="icon" @click="playRecording" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';
import { useMicStore } from '@/store/microphone';

const emit = defineEmits(['record-complete']);
const micStore = useMicStore();

const micIcon = 'https://static.bluebirdabc.com/ai-agent/img/tasks/65b64131c75131470060b163a842ea1ed86fb56d.png';
const playIcon = 'https://static.bluebirdabc.com/ai-agent/img/tasks/8e0a8ab174123e596ec1beb7a3b8d0ccc8d59ddb.png';
const stopIcon = 'https://static.bluebirdabc.com/ai-agent/img/tasks/eca4f1a182cae877044706bb77972d58a1fe90c3.png';

const MAX_SECONDS = 30;
const status = ref('idle');
const timeLeft = ref(MAX_SECONDS);
const recordedBlob = ref(null);
let mediaRecorder = null;
let recordedChunks = [];
let countdownInterval = null;

const timerDigits = computed(() => {
  const seconds = String(timeLeft.value).padStart(2, '0');
  return `00:${seconds}`.split('');
});

const startRecording = async () => {
  if (!micStore.stream) return alert('麦克风未授权');
  recordedBlob.value = null;
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(micStore.stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
    recordedBlob.value = blob;
    status.value = 'finished';
    emit('record-complete', blob);
  };

  mediaRecorder.start();
  timeLeft.value = MAX_SECONDS;
  status.value = 'recording';

  countdownInterval = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) stopRecording();
  }, 1000);
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
  clearInterval(countdownInterval);
};

const playRecording = () => {
  if (!recordedBlob.value) return;
  const audio = new Audio(URL.createObjectURL(recordedBlob.value));
  status.value = 'playing';
  audio.play();
  audio.onended = () => {
    status.value = 'finished';
  };
};

onUnmounted(() => {
  clearInterval(countdownInterval);
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
});
</script>

<style scoped>
.recorder-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3vw;
  flex-wrap: wrap;
  width: 100%;
  max-width: 90vw;
  box-sizing: border-box;
}

.recorder-state {
  display: flex;
  align-items: center;
  gap: 3vw;
  color: #555;
  text-align: center;
  line-height: 1.4;
  flex-wrap: wrap;
}

.icon {
  height: 20vw;
  max-height: 100px;
  width: auto;
  cursor: pointer;
}

.countdown {
  display: flex;
  gap: 1vw;
  font-family: 'Courier New', Courier, monospace;
  font-size: 6vw;
  font-weight: bold;
  color: #333;
}

.digit {
  background-color: #e0e0e0;
  padding: 1vw 2vw;
  border-radius: 5px;
  min-width: 8vw;
  max-width: 10vw;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
}

.digit:nth-child(3) {
  background: none;
}
</style>

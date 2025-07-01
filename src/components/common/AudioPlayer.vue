<!-- src/components/common/AudioPlayer.vue -->
<template>
  <div class="audio-player">
    <!-- 播放/暂停 按钮 -->
    <button @click="togglePlay" class="play-pause-btn">
      <svg v-if="!isPlaying" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
      <svg v-else viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
    </button>

    <!-- 进度条 -->
    <div class="progress-bar-wrapper" @click="seek">
      <div class="progress-bar-bg"></div>
      <div class="progress-bar-played" :style="{ width: progress + '%' }"></div>
      <div class="progress-thumb" :style="{ left: progress + '%' }"></div>
    </div>

    <!-- 时间显示 -->
    <div class="time-display">
      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
    </div>

    <!-- 真正的 audio 元素，但它是隐藏的 -->
    <audio ref="audioElement" :src="src" @timeupdate="updateProgress" @loadedmetadata="getDuration" @ended="onEnded"></audio>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';

const props = defineProps({
  src: { type: String, required: true }
});

const audioElement = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);

// 格式化时间，从秒转换为 mm:ss
const formatTime = (time) => {
  if (isNaN(time) || time === 0) return '00:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// 切换播放/暂停
const togglePlay = () => {
  if (!audioElement.value) return;
  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

// 更新进度
const updateProgress = () => {
  if (!audioElement.value) return;
  currentTime.value = audioElement.value.currentTime;
  if (duration.value > 0) {
    progress.value = (currentTime.value / duration.value) * 100;
  }
};

// 获取总时长
const getDuration = () => {
  if (!audioElement.value) return;
  duration.value = audioElement.value.duration;
};

// 播放结束
const onEnded = () => {
  isPlaying.value = false;
  // 不重置currentTime，让用户看到最终时长
  progress.value = 100; // 进度条拉满
};

// 点击进度条跳转
const seek = (event) => {
  if (!audioElement.value || duration.value === 0) return;
  const wrapper = event.currentTarget;
  const rect = wrapper.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, clickX / wrapper.offsetWidth));
  audioElement.value.currentTime = duration.value * percentage;
};

// 组件销毁时，清理资源
onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.src = '';
  }
});
</script>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #f2f5f7;
  border-radius: 50px;
  padding: 8px 15px;
  width: 100%;
  max-width: 500px;
  -webkit-tap-highlight-color: transparent; /* 消除移动端点击高亮 */
}
.play-pause-btn {
  background-color: var(--primary-color);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.play-pause-btn:hover {
  transform: scale(1.1);
}
.play-pause-btn svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}
.progress-bar-wrapper {
  flex-grow: 1;
  height: 16px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
}
.progress-bar-bg {
  position: absolute;
  width: 100%;
  height: 6px;
  background-color: #dbe2e8;
  border-radius: 3px;
}
.progress-bar-played {
  position: absolute;
  height: 6px;
  background-color: var(--primary-color);
  border-radius: 3px;
  pointer-events: none; /* 确保点击事件作用在wrapper上 */
}
.progress-thumb {
  position: absolute;
  width: 14px;
  height: 14px;
  background-color: white;
  border-radius: 50%;
  border: 3px solid var(--primary-color);
  transform: translateX(-50%);
  pointer-events: none;
}
.time-display {
  font-family: monospace;
  color: #555;
  font-size: 0.9rem;
}
audio {
  display: none;
}
</style>
// src/store/microphone.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMicStore = defineStore('microphone', () => {
  const stream = ref(null);
  const isGranted = ref(false);
  const error = ref(null);

  async function ensureMicAccess() {
    // 如果已经授权过，直接返回，避免重复请求
    if (isGranted.value && stream.value) {
      return;
    }

    try {
      // 尝试检查浏览器是否已永久拒绝权限
      // 注意：这个API在某些浏览器（如旧版Safari）上可能不存在
      if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        const perm = await navigator.permissions.query({ name: 'microphone' });
        if (perm.state === 'denied') {
          throw new Error('麦克风访问被浏览器禁止，请在设置中手动开启。');
        }
      }

      // 真正向用户申请麦克风权限
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 授权成功，保存状态
      stream.value = micStream;
      isGranted.value = true;
      error.value = null;
      
    } catch (err) {
      // 捕获所有可能的错误（用户拒绝、设备问题等）
      error.value = err;
      isGranted.value = false;
      
      // 向上抛出一个更友好的错误信息，让调用方（StartView.vue）可以捕获并显示给用户
      throw new Error(err.message.includes('denied') ? '您已拒绝麦克风授权，无法进行语音题。' : '获取麦克风失败，请检查设备或权限。');
    }
  }

  return { stream, isGranted, error, ensureMicAccess };
});
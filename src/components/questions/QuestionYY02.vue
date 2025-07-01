<template>
  <div class="question-yy02">
    <h3>{{ question.data.title || '单词选择' }}</h3>
    <p class="question-text">{{ question.data.text }}</p>

    <div class="options-list">
      <div
        v-for="(optionText, key) in question.data.options"
        :key="key"
        class="option-item"
        :class="{ selected: selectedAnswer === key }"
        @click="selectAnswer(key)"
      >
        <span class="option-key">{{ key }}</span>
        <span class="option-text">{{ optionText }}</span>
      </div>
    </div>
    
    <!-- 【核心修改】此处的提交按钮已被彻底移除 -->
    <!-- 它现在由 App.vue 全局管理 -->

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  question: { type: Object, required: true },
});
// 【核心修改】声明组件会发出的事件
const emit = defineEmits(['submit-answer', 'update-submit-status']);

const selectedAnswer = ref(null);

const selectAnswer = (key) => {
  selectedAnswer.value = key;
};

// --- 与 App.vue 的通信逻辑 ---

// 1. 定义组件自己的“是否禁用”逻辑
const isSubmitDisabled = computed(() => {
  return selectedAnswer.value === null;
});

// 2. 定义自己的提交方法
const submit = () => {
  // 注意：这里不再需要播放音效，App.vue会处理
  emit('submit-answer', {
    type: 'YY02',
    answer: selectedAnswer.value,
  });
};

// 3. 【关键】使用 watch 侦听禁用状态的变化，并通知 App.vue
watch(isSubmitDisabled, (newDisabledValue) => {
  emit('update-submit-status', {
    disabled: newDisabledValue,
    action: submit // 把自己的submit函数暴露给App.vue
  });
}, { immediate: true }); // immediate: true 确保组件一加载就立即通知一次

</script>

<style scoped>
/* 样式无需改动，因为按钮样式已是全局的 */
.question-yy02 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.question-text {
  font-size: 1.2rem;
  margin-bottom: 10px;
}
.options-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.option-item {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}
.option-item:hover {
  border-color: var(--primary-color);
  background-color: #f0f8ff;
}
.option-item.selected {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
.option-key {
  font-weight: bold;
  margin-right: 15px;
  border: 1px solid;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
</style>
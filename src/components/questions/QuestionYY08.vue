<template>
  <div class="question-yy08">
    <h3>{{ question.data.title || '填空并复述' }}</h3>

    <!-- 题干内容区域，左对齐显示句子和填空 -->
    <div class="prompt-container">
      <p class="sentence">
        <span>{{ promptParts.before }}</span>
        <span class="blank-group">
          <span class="first-letter">{{ promptParts.firstLetter }}</span>
          <span class="inputs-wrapper">
            <input
              v-for="index in inputCount"
              :key="index"
              type="text"
              maxlength="1"
              class="char-input-display-only"
              disabled
            />
          </span>
        </span>
        <span>{{ promptParts.after }}</span>
      </p>
    </div>

    <!-- 使用统一录音组件 -->
    <UnifiedRecorder @record-complete="onRecordComplete" :play-visible="true" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

import UnifiedRecorder from '@/components/common/UnifiedRecorder.vue';

const props = defineProps({
  question: { type: Object, required: true },
});
const emit = defineEmits(['submit-answer', 'update-submit-status']);


const recordedBlob = ref(null);

const promptParts = computed(() => {
  const text = props.question.data.text || '';
  const match = text.match(/([a-zA-Z]__*)/);
  if (!match) return { before: text, firstLetter: '', after: '' };
  const placeholder = match[0];
  const firstLetter = placeholder[0];
  const parts = text.split(placeholder);
  return { before: parts[0] || '', firstLetter, after: parts[1] || '' };
});

const inputCount = computed(() => (props.question.data.answer?.length || 1) - 1);

const onRecordComplete = (blob) => {
  recordedBlob.value = blob;
};

const isSubmitDisabled = computed(() => recordedBlob.value === null);
const submit = () => {
  emit('submit-answer', { type: 'YY08', answer: { recording: recordedBlob.value } });
};

watch(isSubmitDisabled, (newVal) => {
  emit('update-submit-status', { disabled: newVal, action: submit });
}, { immediate: true });
</script>

<style scoped>
.question-yy08 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.prompt-container {
  width: 100%;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  box-sizing: border-box;
}

.sentence {
  font-size: 1.8rem;
  text-align: left;
  line-height: 1.8;
  word-break: break-word;
  word-wrap: break-word;
}

.blank-group {
  display: inline-flex;
  align-items: center;
  margin: 0 4px;
  vertical-align: middle;
}

.first-letter {
  font-size: 1.8rem;
  font-weight: bold;
}

.inputs-wrapper {
  display: inline-flex;
  gap: 2px;
}

.char-input-display-only {
  width: 40px;
  height: 50px;
  border: none;
  border-bottom: 2px solid #aaa;
  text-align: center;
  font-size: 1.8rem;
  background: transparent;
  cursor: default;
}
</style>

<template>
  <div class="question-yy10">
    <h3>{{ question.data.title || '词形变化' }}</h3>

    <div class="prompt-word-container">
      <span class="label">请使用以下单词的正确形式填空：</span>
      <span class="word">{{ question.data.promptWord }}</span>
    </div>

    <div class="sentence-container">
      <span>{{ sentenceParts.before }}</span>
      <div class="inputs-wrapper" ref="inputsWrapperRef">
        <input
          v-for="index in answerLength"
          :key="`input-${index}`"
          type="text"
          maxlength="1"
          class="char-input"
          v-model="userAnswer[index - 1]"
          @compositionstart="onCompositionStart"
          @compositionend="(e) => handleInput(index - 1, answerLength, e)"
          @input="(e) => !isComposing && handleInput(index - 1, answerLength, e)"
          @keydown.backspace="handleBackspace(index - 1, $event)"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          inputmode="latin"
        />
      </div>
      <span>{{ sentenceParts.after }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useEnhancedInputs } from '@/composables/useEnhancedInputs.js';

const props = defineProps({
  question: { type: Object, required: true },
});
const emit = defineEmits(['submit-answer', 'update-submit-status']);

// --- 拼音输入拦截 ---
const isComposing = ref(false);
const onCompositionStart = () => { isComposing.value = true; };

// --- 初始化输入框 ---
const answerLength = computed(() => props.question.data.answer.length || 0);
const userAnswer = ref(new Array(answerLength.value).fill(''));

watch(answerLength, (newLen) => {
  userAnswer.value = new Array(newLen).fill('');
}, { immediate: true });

const { inputsWrapperRef, handleInput, handleBackspace } = useEnhancedInputs(userAnswer, isComposing);

// --- 句子拆分逻辑 ---
const sentenceParts = computed(() => {
  const parts = props.question.data.text.split('___');
  return { before: parts[0] || '', after: parts[1] || '' };
});

// --- 提交逻辑 ---
const isSubmitDisabled = computed(() => {
  return userAnswer.value.join('').length !== answerLength.value;
});

const submit = () => {
  emit('submit-answer', {
    type: 'YY10',
    answer: userAnswer.value.join(''),
  });
};

watch(isSubmitDisabled, (disabled) => {
  emit('update-submit-status', {
    disabled,
    action: submit
  });
}, { immediate: true });
</script>

<style scoped>
.question-yy10 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.prompt-word-container {
  font-size: 1.2rem;
  display: flex;
  gap: 0.5em;
  align-items: center;
  justify-content: flex-start; 
  flex-wrap: wrap;
}

.sentence-container {
  font-size: 1.5rem;
  display: flex;
  align-items: flex-start; 
  flex-wrap: wrap;
  justify-content: flex-start; 
  gap: 10px;
}
.inputs-wrapper {
  display: flex;
  gap: 5px;
}
.char-input {
  width: 40px;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: center;
  font-size: 1.5rem;
  font-family: inherit;
  color: var(--primary-color);
  font-weight: bold;
}
.char-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 5px rgba(74, 144, 226, 0.5);
}
</style>

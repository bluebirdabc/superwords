<template>
  <div class="question-yy12">
    <h3>{{ question.data.title || '关键词填空' }}</h3>

    <div class="prompt-container">
      <p class="sentence">
        <span>{{ promptParts.before }}</span>

        <!-- 把首字母和输入框包成一组，整组不换行 -->
        <span class="answer-group">
          <span class="first-letter">{{ promptParts.firstLetter }}</span>
          <span class="inputs-wrapper" ref="inputsWrapperRef">
            <input
              v-for="index in inputCount"
              :key="index"
              type="text"
              maxlength="1"
              class="char-input"
              v-model="userAnswer[index - 1]"
              @compositionstart="onCompositionStart"
              @compositionend="(e) => handleInput(index - 1, inputCount, e)"
              @input="(e) => !isComposing && handleInput(index - 1, inputCount, e)"
              @keydown.backspace="handleBackspace(index - 1, $event)"
              autocapitalize="off"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
              inputmode="latin"
            />
          </span>
        </span>

        <span>{{ promptParts.after }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useEnhancedInputs } from '@/composables/useEnhancedInputs.js';

const props = defineProps({ question: { type: Object, required: true } });
const emit  = defineEmits(['submit-answer', 'update-submit-status']);

// =============== 输入逻辑 ===============
const isComposing  = ref(false);
const onCompositionStart = () => (isComposing.value = true);

const inputCount  = computed(() => {
  const len = props.question.data.answer?.length || 0;
  return len > 0 ? len - 1 : 0;
});
const userAnswer  = ref(Array(inputCount.value).fill(''));

watch(() => props.question.data.answer, () => {
  userAnswer.value = Array(inputCount.value).fill('');
});

const { inputsWrapperRef, handleInput, handleBackspace } =
  useEnhancedInputs(userAnswer, isComposing);

// =============== 句子拆分 ===============
const promptParts = computed(() => {
  const text = props.question.data.text || '';
  // 尝试匹配 “空格 + 首字母_____ + 空格”
  const m = text.match(/\s([a-zA-Z]__*)\s/);
  const placeholder = m ? m[1] : (text.match(/([a-zA-Z]__*)/) || [])[0];
  if (!placeholder) return { before: text, firstLetter: '', after: '' };

  const firstLetter = placeholder[0];
  const [ before, after ] = text.split(placeholder);
  return { before, firstLetter, after };
});

// =============== 提交逻辑 ===============
const isSubmitDisabled = computed(
  () => userAnswer.value.join('').length !== inputCount.value
);

const submit = () => {
  emit('submit-answer', {
    type: 'YY12',
    answer: promptParts.value.firstLetter + userAnswer.value.join('')
  });
};

watch(isSubmitDisabled, disabled =>
  emit('update-submit-status', { disabled, action: submit }),
  { immediate: true }
);
</script>

<style scoped>
.question-yy12 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.prompt-container {
  width: 90%;
  max-width: 600px;
  padding: 25px;
  box-sizing: border-box;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.sentence {
  display: block;          /* 段落流式排版 */
  font-size: 1.5rem;
  line-height: 1.8;
  text-align: left;
  word-break: normal;      /* 不拆单词 */
  overflow-wrap: break-word; /* 真的太长时整体换行 */
}

.answer-group {
  display: inline-flex;
  align-items: flex-end;
  white-space: nowrap;     /* 整组不换行 */
}

.first-letter {
  font-weight: bold;
  font-size: 1.5rem;
  color: #333;
}

.inputs-wrapper {
  display: flex;
  gap: 2px;
  margin-left: 4px;
}

.char-input {
  width: 35px;
  height: 45px;
  border: none;
  border-bottom: 2px solid #aaa;
  text-align: center;
  font-size: 1.5rem;
  font-family: inherit;
  color: var(--primary-color);
  font-weight: bold;
  background: transparent;
}
.char-input:focus {
  outline: none;
  border-bottom-color: var(--primary-color);
}
</style>

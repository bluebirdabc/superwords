<template>
  <div class="question-yy01">
    <h3>{{ question.data.title || '单词填空' }}</h3>

    <div class="prompt-container">
      <!-- 整句用 <p class="sentence"> 排版 -->
      <p class="sentence">
        <span>{{ sentenceParts.before }}</span>

        <!-- ★ 锁住首字母+下划线 -->
        <span class="answer-group" v-if="sentenceParts.firstLetter">
          <span class="first-letter">{{ sentenceParts.firstLetter }}</span>
          <span class="inputs-wrapper" ref="inputsWrapperRef">
            <input
              v-for="index in inputCount"
              :key="`input-${index}`"
              v-model="userAnswer[index - 1]"
              type="text"
              maxlength="1"
              class="char-input"
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

        <!-- 无首字母占位时，同样输出输入框 -->
        <span v-else class="inputs-wrapper" ref="inputsWrapperRef">
          <input
            v-for="index in inputCount"
            :key="`input-${index}`"
            v-model="userAnswer[index - 1]"
            type="text"
            maxlength="1"
            class="char-input"
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

        <span>{{ sentenceParts.after }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useEnhancedInputs } from '@/composables/useEnhancedInputs.js';

const props = defineProps({ question: { type: Object, required: true }});
const emit  = defineEmits(['submit-answer', 'update-submit-status']);

// ---------- 输入逻辑 ----------
const isComposing = ref(false);
const onCompositionStart = () => { isComposing.value = true; };
const userAnswer = ref([]);

const sentenceParts = computed(() => {
  const text = props.question.data.text || '';
  const match = text.match(/([a-zA-Z]__*)/);
  if (match) {
    const placeholder = match[0];
    const firstLetter = placeholder[0];
    const parts = text.split(placeholder);
    return { before: parts[0] || '', firstLetter, after: parts[1] || '' };
  }
  const oldParts = text.split('___');
  return { before: oldParts[0] || '', firstLetter: '', after: oldParts[1] || '' };
});

const inputCount = computed(() => {
  const len = props.question.data.answer?.length || 0;
  return sentenceParts.value.firstLetter ? len - 1 : len;
});

watch(inputCount, (n) => { userAnswer.value = new Array(n).fill(''); }, { immediate: true });

const { inputsWrapperRef, handleInput, handleBackspace } =
  useEnhancedInputs(userAnswer, isComposing);

// ---------- 自动聚焦（原逻辑保留） ----------
onMounted(() => {
  if (sessionStorage.getItem('shouldFocusInput') === '1') {
    const trigger = () => {
      const firstInput = document.querySelector('.char-input');
      if (firstInput) {
        firstInput.focus(); firstInput.click();
        sessionStorage.removeItem('shouldFocusInput');
      }
      document.removeEventListener('touchstart', trigger);
      document.removeEventListener('click', trigger);
    };
    document.addEventListener('touchstart', trigger, { once:true });
    document.addEventListener('click',      trigger, { once:true });
  }
});

// ---------- 提交 ----------
const isSubmitDisabled = computed(() =>
  inputCount.value === 0 || userAnswer.value.join('').length !== inputCount.value
);

const submit = () => {
  const final = sentenceParts.value.firstLetter + userAnswer.value.join('');
  emit('submit-answer', { type:'YY01', answer: final });
};

watch(isSubmitDisabled, (d) => {
  emit('update-submit-status', { disabled:d, action:submit });
}, { immediate:true });
</script>

<style scoped>
/* 容器 */
.question-yy01{
  width:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:25px;
}
.prompt-container{ width:100%; }

/* 句子排版：正常换行，单词不拆 */
.sentence{
  display:block;            /* 用 block 自然排版 */
  font-size:1.5rem;
  line-height:1.8;
  text-align:left;
  word-break:normal;        /* 不在单词中间断开 */
  overflow-wrap:break-word; /* 仅超长连续字符串才断 */
  white-space:normal;
}

/* 锁住首字母+输入框整体 */
.answer-group{
  display:inline-flex;
  align-items:flex-end;
  white-space:nowrap;
}

/* 其余保持原本样式 */
.first-letter{ font-size:1.5rem; font-weight:bold; }
.inputs-wrapper{ display:flex; gap:5px; margin-left:4px; }
.char-input{
  width:40px; height:50px;
  border:1px solid #ccc; border-radius:6px;
  text-align:center; font-size:1.5rem; font-weight:bold;
  background:transparent; font-family:inherit;
}
.char-input:focus{
  outline:none; border-color:var(--primary-color);
  box-shadow:0 0 5px rgba(74,144,226,.5);
}
</style>

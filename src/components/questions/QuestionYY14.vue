<template>
  <div class="question-yy14">
    <h3>{{ question.data.title || '补全翻译' }}</h3>
    <p class="chinese-sentence">{{ promptParts.chinese }}</p>
    <div class="english-sentence">
      <template v-for="(part, partIndex) in promptParts.englishParts" :key="partIndex">
        <span v-if="part.type === 'text'" v-html="part.content"></span>
        <div v-if="part.type === 'blank'" class="inputs-wrapper">
          <span class="first-letter">{{ part.firstLetter }}</span>
          <input
            v-for="i in part.inputCount"
            :key="i"
            type="text"
            maxlength="1"
            class="char-input"
            :ref="el => setInputRef(part.answerIndex, i - 1, el)"
            v-model="userAnswers[part.answerIndex][i - 1]"
            @input="localHandleInput(part.answerIndex, i - 1, $event)"
            @keydown.backspace="localHandleBackspace(part.answerIndex, i - 1, $event)"
            autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" inputmode="latin"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({ question: { type: Object, required: true } });
const emit = defineEmits(['submit-answer', 'update-submit-status']);

// --- 1. 题干解析 (保持不变) ---
const promptParts = computed(() => {
  const [chinese, english] = (props.question.data.text || '\n').split('\n');
  const answers = props.question.data.answers || [];
  let answerIndexCounter = 0;
  const regex = /([a-zA-Z]__*)/g;
  const englishParts = [];
  let lastIndex = 0;
  (english || '').replace(regex, (match, p1, offset) => {
    if (offset > lastIndex) englishParts.push({ type: 'text', content: english.substring(lastIndex, offset).replace(/ /g, ' ') });
    const currentAnswer = answers[answerIndexCounter];
    if (currentAnswer) {
      englishParts.push({
        type: 'blank',
        firstLetter: match[0],
        inputCount: currentAnswer.length - 1,
        answerIndex: answerIndexCounter,
      });
      answerIndexCounter++;
    }
    lastIndex = offset + match.length;
  });
  if (lastIndex < (english || '').length) englishParts.push({ type: 'text', content: english.substring(lastIndex).replace(/ /g, ' ') });
  return { chinese, englishParts };
});

// --- 2. 交互逻辑 (核心修复：完全独立，不再依赖外部模块) ---
const userAnswers = ref([]);
const inputRefs = ref([]);
const keypressAudio = new Audio('https://static.bluebirdabc.com/lesson/material/aif8j9q38t4q78y4/855/2d0492b05a34262d51165791cff5692301906b9c.mp3');
keypressAudio.preload = 'auto';

const setInputRef = (wordIndex, charIndex, el) => {
  if (!inputRefs.value[wordIndex]) inputRefs.value[wordIndex] = [];
  if (el) inputRefs.value[wordIndex][charIndex] = el;
};

const localHandleInput = (wordIndex, charIndex, event) => {
  keypressAudio.currentTime = 0;
  keypressAudio.play().catch(e => console.error("音效播放失败:", e));
  
  const currentWordInputs = inputRefs.value[wordIndex];
  if (event.target.value && charIndex < currentWordInputs.length - 1) {
    currentWordInputs[charIndex + 1].focus();
  } else if (event.target.value && wordIndex < inputRefs.value.length - 1) {
    inputRefs.value[wordIndex + 1]?.[0]?.focus();
  }
};

const localHandleBackspace = (wordIndex, charIndex, event) => {
  if (event.target.value === '' && charIndex > 0) {
    inputRefs.value[wordIndex][charIndex - 1].focus();
  } else if (event.target.value === '' && charIndex === 0 && wordIndex > 0) {
    const prevWordInputs = inputRefs.value[wordIndex - 1];
    prevWordInputs[prevWordInputs.length - 1]?.focus();
  }
};

// --- 3. 与App.vue的通信 (保持不变) ---
const isSubmitDisabled = computed(() => {
  return userAnswers.value.some((answerGroup, index) => 
    answerGroup.join('').length !== (props.question.data.answers[index]?.length - 1 || 0)
  );
});

const submit = () => {
  const finalAnswers = props.question.data.answers.map((_, index) => {
    const part = promptParts.value.englishParts.find(p => p.answerIndex === index);
    return part.firstLetter + userAnswers.value[index].join('');
  });
  emit('submit-answer', { type: 'YY14', answers: finalAnswers });
};

watch(() => props.question.data.answers, (newAnswers) => {
    userAnswers.value = (newAnswers || []).map(ans => new Array((ans?.length || 1) - 1).fill(''));
    inputRefs.value = [];
    nextTick(() => {
        inputRefs.value[0]?.[0]?.focus();
    });
}, { immediate: true, deep: true });

watch(isSubmitDisabled, (newDisabledValue) => {
  emit('update-submit-status', { disabled: newDisabledValue, action: submit });
}, { immediate: true });
</script>

<style scoped>
/* 样式与YY12等题型统一 */
.question-yy14 { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px; }
.chinese-sentence { font-size: 1.3rem; font-weight: bold; color: #555; background: #f0f8ff; padding: 15px; border-radius: 8px; width: 100%; text-align: center; }
.english-sentence { font-size: 1.5rem; line-height: 2.5; text-align: left; width: 100%; display: flex; flex-wrap: wrap; align-items: center; }
.inputs-wrapper { display: inline-flex; align-items: center; gap: 2px; margin: 0 4px; }
.first-letter { font-size: 1.5rem; font-weight: bold; margin-right: 2px; }
.char-input { width: 35px; height: 45px; border: none; border-bottom: 2px solid #aaa; text-align: center; font-size: 1.5rem; font-family: inherit; color: var(--primary-color); font-weight: bold; background: transparent; }
.char-input:focus { outline: none; border-bottom-color: var(--primary-color); }
</style>